import Adw from '@gi/adw1';
import Gtk, { Widget } from '@gi/gtk4';
import { registerClass } from '@/utils/gjs';
import { fetch } from '@/utils/fetch';
import GObject from '@gi/gobject2';
import Gio from '@gi/gio2';
import GLib from '@gi/glib2';
import { FragileProject } from './models/fragileproject';
import { Box } from '../types/graphene1';

Gio._promisify(Gio.File.prototype, 'replace_contents_async', 'replace_contents_finish');

@registerClass({
	GTypeName: 'ProjectOverviewWindow',
	Template: 'resource:///com/github/sorry4nothing/Fragile/project_overview_window.ui',
	InternalChildren: ['overviewList'],
})
export class ProjectOverviewWindow extends Adw.ApplicationWindow {
	public error: string;
	public errorVisible: boolean;
	public projects: FragileProject[] = [
		{
			id: 1,
			projectName: 'Project 1',
			missions: [
				{
					id: 1,
					missionName: 'Epic epic',
					missionDescription: 'Description 1',
					missionType: 'epic',
				},
			],
		},
		{
			id: 2,
			projectName: 'Project 2',
			missions: [
				{
					id: 2,
					missionName: 'Story story',
					missionDescription: 'Description 2',
					missionType: 'story',
				},
			],
		},
	];
	private _overviewList: Gtk.ListBox;

	constructor(props: Partial<Adw.ApplicationWindow.ConstructorProperties> = {}) {
		super(props);
		//this.refresh();
	}

	on_new_clicked() {
		console.log('navigate to new project window');
	}

	on_refresh_clicked() {
		console.log('refreshing');
		this.refresh();
	}

	on_choose_project(id: number) {
		console.log(`navigate to ${id} project details`);
	}

	refresh() {
		//should make a fetch call on real implementation
		this.projects = this.projects;

		// remove all children of overvielist ListBox
		while (true) {
			const child = this._overviewList.get_row_at_index(0);
			if (!child) {
				break;
			}
			this._overviewList.remove(child);
		}

		for (const project of this.projects!) {
			this._overviewList.append(new Gtk.Label({ label: project.projectName }));
		}
	}
}
