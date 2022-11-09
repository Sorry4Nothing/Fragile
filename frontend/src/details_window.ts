import Adw from '@gi/adw1';
import { registerClass } from '@/utils/gjs';
import GObject from '@gi/gobject2';
import Gio from '@gi/gio2';
import GLib from '@gi/glib2';
import Gtk from '@gi/gtk4';
import { FragImportWindow } from './import_window';
import { FragileProject } from './models/fragileproject';

Gio._promisify(Gio.File.prototype, 'replace_contents_async', 'replace_contents_finish');

@registerClass({
	GTypeName: 'FragDetailsWindow',
	Template: 'resource:///com/github/sorry4nothing/Fragile/details_window.ui',
	Properties: {
		projects_mock: GObject.param_spec_variant(
			'testlist',
			'Testlist',
			'Testlist',
			new GLib.VariantType('as'),
			null,
			GObject.ParamFlags.READWRITE
		),
	},
	Children: ['sidebar', 'list_backlog', 'list_open', 'list_reviewready', 'list_done'],
})
export class FragDetailsWindow extends Adw.ApplicationWindow {
	public project: FragileProject;
	public list_backlog: Gtk.ListBox;
	public list_open: Gtk.ListBox;
	public list_reviewready: Gtk.ListBox;
	public list_done: Gtk.ListBox;
	public sidebar: Gtk.ListBox;

	// TODO: replace with real data
	public projects_mock = ["Project1", "Project2", "Project3"];

	constructor(application: Gtk.Application, project: FragileProject) {
		super({application: application})
		this.project = project;

		this.projects_mock.forEach(project => {
			const gtkButton = new Gtk.Button();

			gtkButton.label = project;
			gtkButton.connect('clicked', () => this.on_project_clicked());

			this.sidebar.append(gtkButton);
			this.sidebar.show();
		})

		const backlog = this.project.columns.find(c => c.name == "backlog");
		backlog?.missions.forEach(m => {
			const gtkText = new Gtk.Label({label: `${m.missionType} | ${m.missionName}: ${m.missionDescription}`});
			this.list_backlog.append(gtkText);
		});

		const open = this.project.columns.find(c => c.name == "open");
		open?.missions.forEach(m => {
			const gtkText = new Gtk.Label({label: `${m.missionType} | ${m.missionName}: ${m.missionDescription}`});
			this.list_open.append(gtkText);
		});

		const review = this.project.columns.find(c => c.name == "review");
		review?.missions.forEach(m => {
			const gtkText = new Gtk.Label({label: `${m.missionType} | ${m.missionName}: ${m.missionDescription}`});
			this.list_reviewready.append(gtkText);
		});

		const done = this.project.columns.find(c => c.name == "done");
		done?.missions.forEach(m => {
			const gtkText = new Gtk.Label({label: `${m.missionType} | ${m.missionName}: ${m.missionDescription}`});
			this.list_done.append(gtkText);
		});

		this.list_backlog.visible = true;
		this.list_open.visible = true;
		this.list_reviewready.visible = true;
		this.list_done.visible = true;
	}

	// TODO: open for real project, when we have the data
	on_project_clicked(){
		const win = new FragDetailsWindow(this.application, this.project);
		this.close();
		win.show();
	}

	on_import_clicked(){
		const win = new FragImportWindow({ application: this.application });
		this.close();
		win.show();
	}
}
