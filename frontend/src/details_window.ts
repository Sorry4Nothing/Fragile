import Adw from '@gi/adw1';
import { registerClass } from '@/utils/gjs';
import GObject from '@gi/gobject2';
import Gio from '@gi/gio2';
import GLib from '@gi/glib2';
import Gtk from '@gi/gtk4';
import { FragImportWindow } from './import_window';
import { FragileProject } from './models/fragileproject';
import { ProjectOverviewWindow } from './project_overview_window';

Gio._promisify(Gio.File.prototype, 'replace_contents_async', 'replace_contents_finish');

@registerClass({
	GTypeName: 'FragDetailsWindow',
	Template: 'resource:///com/github/sorry4nothing/Fragile/details_window.ui',
	Properties: {},
	Children: ['columns'],
})
export class FragDetailsWindow extends Adw.ApplicationWindow {
	public columns: Gtk.Box;

	constructor(params = {}, projects: FragileProject) {
		super(params);

		if (projects) {

			projects.columns.forEach((column) => {
				// add column to details_page_box
				const gtkColumn: Gtk.ListBox = new Gtk.ListBox();
				gtkColumn.name = column.name;

				this.columns.append(gtkColumn);

				column.missions.forEach((task) => {
					const gtkText = new Gtk.Label();
					gtkText.label = `${task.missionName} - ${task.missionDescription} - ${task.missionType}`;
					gtkColumn.append(gtkText);
				});

				gtkColumn.show();
			});
		}
	}

	on_import_clicked() {
		const win = new FragImportWindow({ application: this.application });
		this.close();
		win.show();
	}

	on_back_clicked() {
		const win = new ProjectOverviewWindow({ application: this.application });
		this.close();
		win.show();
	}
}
