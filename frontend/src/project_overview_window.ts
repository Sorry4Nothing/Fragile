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
	InternalChildren: ['overviewList'],
})
export class ProjectOverviewWindow extends Adw.ApplicationWindow {
	public error: string;
	public errorVisible: boolean;

	private _overviewList: Gtk.ListBox;
	private resultProjects: FragileProject[] = [];

	constructor(props: Partial<Adw.ApplicationWindow.ConstructorProperties> = {}) {
		super(props);
		this.setProjectsFromJson();
		setTimeout(() => {
			this.refresh();
		}, 1000);
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
		console.log(this.resultProjects);
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
			}
		} else {
			this._overviewList.append(new Gtk.Label({ label: 'No projects found' }));
		}

		console.log(this.resultProjects);
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
}
