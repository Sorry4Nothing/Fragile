import { fetch } from '@/utils/fetch';
import { registerClass } from '@/utils/gjs';
import Adw from '@gi/adw1';
import Gio from '@gi/gio2';
import GLib from '@gi/glib2';
import Gtk from '@gi/gtk4';
import { FragDetailsWindow } from './details_window';
import { FragImportWindow } from './import_window';
import { FragileProject } from './models/fragileproject';

Gio._promisify(Gio.File.prototype, 'replace_contents_async', 'replace_contents_finish');

@registerClass({
	GTypeName: 'ProjectOverviewWindow',
	Template: 'resource:///com/github/sorry4nothing/Fragile/project_overview_window.ui',
	InternalChildren: ['overviewList', 'searchEntry'],
})
export class ProjectOverviewWindow extends Adw.ApplicationWindow {
	public error: string;
	public errorVisible: boolean;

	private _overviewList: Gtk.ListBox;
	private _searchEntry: Gtk.SearchEntry;
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

	async refresh() {
		while (true) {
			const child = this._overviewList.get_row_at_index(0);
			if (!child) {
				break;
			}
			this._overviewList.remove(child);
		}

		if (this.resultProjects.length > 0) {
			const newProjects = [];
			for (const oldProject of this.resultProjects) {
				let project: FragileProject;

				try {
					const res = await fetch(
						`http://localhost:3000/import?link=${oldProject.url}&platform=${oldProject.platform}`
					);
					if (res.status !== 200) {
						throw new Error('Server responded with error');
					}
					project = res.json();
				} catch (e) {
					// Probably offline
					console.error(e);
					project = oldProject;
				}

				newProjects.push(project);

				this._overviewList.append(new Gtk.Label({ label: project.projectName }));
				const removeButton = new Gtk.Button({ label: 'remove' });
				removeButton.connect('clicked', () => {
					this._removeProject(project);
				});
				this._overviewList.append(removeButton);
			}

			if (this.resultProjects !== newProjects) {
				this.resultProjects = newProjects;
				this.saveProjects();
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

	saveProjects(): void {
		const userDir = GLib.get_user_data_dir();
		const projectFile = Gio.File.new_for_path(userDir + '/fragile/projects.json');
		console.log(projectFile.get_path());

		if (projectFile.query_exists(null)) {
			projectFile.replace_contents_async(
				new GLib.Bytes(JSON.stringify(this.resultProjects)),
				null,
				false,
				Gio.FileCreateFlags.REPLACE_DESTINATION,
				null,
				(file, res) => {
					file!.replace_contents_finish(res);
				}
			);
		}
		// No else, because there won't be any projects to save if the file doesn't exist anyway
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
			const includesText = row.child.label.toLowerCase().includes(this._searchEntry.text.toLowerCase());
			//@ts-ignore
			const isButton = row.child.label === 'remove';

			// if previous row was succesful on includesText, then this row should be a button
			if (previousRowMatched) {
				previousRowMatched = false;
				//@ts-ignore
				return row.child.label === 'remove';
			}

			const result = includesText && !isButton;

			previousRowMatched = result;

			return result;
		});
	}
}
