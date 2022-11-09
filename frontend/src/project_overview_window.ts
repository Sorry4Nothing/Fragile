import Adw from '@gi/adw1';
import Gtk, { Widget } from '@gi/gtk4';
import { registerClass } from '@/utils/gjs';
import { fetch } from '@/utils/fetch';
import GObject from '@gi/gobject2';
import Gio from '@gi/gio2';
import GLib from '@gi/glib2';
import { FragileProject } from './models/fragileproject';
import { FragileColumn } from './models/fragilecolumn';
import { Box } from '../types/graphene1';
import { FragDetailsWindow } from './details_window';
import { FragImportWindow } from './import_window';

Gio._promisify(Gio.File.prototype, 'replace_contents_async', 'replace_contents_finish');

@registerClass({
	GTypeName: 'ProjectOverviewWindow',
	Template: 'resource:///com/github/sorry4nothing/Fragile/project_overview_window.ui',
	InternalChildren: ['overviewList', "searchEntry"],
})
export class ProjectOverviewWindow extends Adw.ApplicationWindow {
	public error: string;
	public errorVisible: boolean;

	private _overviewList: Gtk.ListBox;
	private _searchEntry : Gtk.SearchEntry;
	private resultProjects: FragileProject[] = [];

	constructor(props: Partial<Adw.ApplicationWindow.ConstructorProperties> = {}) {
		super(props);
		this.on_refresh_clicked();
	}

	on_new_clicked() {
		console.log(`navigate to import window`);
		const win = new FragImportWindow({ application: this.application });
		this.close();
		win.show();
	}

	on_refresh_clicked() {
		console.log('refreshing');
		this.setProjectsFromJson();
		setTimeout(() => {
			this.refresh();
		}, 1000);
	}

	on_choose_project(project: FragileProject) {
		console.log(`navigate to ${project.projectName} project details`);
		const win = new FragDetailsWindow({ application: this.application }, project);
		this.close();
		win.show();
	}

	refresh() {
		//should make a fetch call on real implementation
		while (true) {
			const child = this._overviewList.get_row_at_index(0);
			if (!child) {
				break;
			}
			this._overviewList.remove(child);
		}

		if (this.resultProjects.length > 0) {
			for (const project of this.resultProjects) {
				this._overviewList.append(new Gtk.Label({ label: project.projectName }));
				const removeButton = new Gtk.Button({ label: 'remove' });
				removeButton.connect('clicked', () => {
					this._removeProject(project);
				});
				this._overviewList.append(removeButton);
			}
		} else {
			this._overviewList.append(new Gtk.Label({ label: 'No projects found' }));
		}
	}

	setProjectsFromJson(): void {
		//read projects.json
		const userDir = GLib.get_user_data_dir();
		const projectFile = Gio.File.new_for_path(userDir + '/fragile/projects.json');

		// check if file exists
		if (projectFile.query_exists(null)) {
			// read file
			projectFile.load_contents_async(null, (file, res) => {
				const [success, contents] = file!.load_contents_finish(res);
				if (success) {
					// parse json using textdecoder
					const decoder = new TextDecoder();
					const projects: FragileProject[] = JSON.parse(decoder.decode(contents));
					this.resultProjects = projects;
				} else {
					console.error('could not read projects.json');
				}
			});
		} else {
			console.error('projects.json does not exist');
		}
	}

	//TODO: add onclick for each project label that leads to details window
	private _removeProject(project: FragileProject): void {
		console.log(`removing ${project.projectName}`);
		const userDir = GLib.get_user_data_dir();
		const projectFile = Gio.File.new_for_path(userDir + '/fragile/projects.json');

		// check if file exists
		if (projectFile.query_exists(null)) {
			// read file
			projectFile.load_contents_async(null, (file, res) => {
				const [success, contents] = file!.load_contents_finish(res);
				if (success) {
					// parse json using textdecoder
					const decoder = new TextDecoder();
					const projects: FragileProject[] = JSON.parse(decoder.decode(contents));
					const index = projects.findIndex((p) => p.projectName === project.projectName);
					projects.splice(index, 1);
					projectFile.replace_contents_async(
						new GLib.Bytes(JSON.stringify(projects)),
						null,
						false,
						Gio.FileCreateFlags.NONE,
						null,
						(file, res) => {
							const [success] = file!.replace_contents_finish(res);
							if (success) {
								console.log('successfully removed project');
								setTimeout(() => {
									this.on_refresh_clicked();
								}, 1000);
							} else {
								console.error('could not remove project');
							}
						}
					);
				} else {
					console.error('could not read projects.json');
				}
			});
		} else {
			console.error('projects.json does not exist');
		}
	}

	public on_search_changed() {
		// save previous row
		let previousRowMatched = false;

		this._overviewList.set_filter_func((row) => {

			// if search entry is empty, show all rows
			if (this._searchEntry.text === '') {
				return true;
			}

			//@ts-ignore
			let includesText = row.child.label.toLowerCase().includes(this._searchEntry.text.toLowerCase());
			//@ts-ignore
			let isButton = row.child.label === 'remove';

			// if previous row was succesful on includesText, then this row should be a button
			if (previousRowMatched) {

				previousRowMatched = false;
				//@ts-ignore
				return row.child.label === 'remove';
			}

			let result = includesText && !isButton;

			previousRowMatched = result;

			return result;
		});
	}
}
