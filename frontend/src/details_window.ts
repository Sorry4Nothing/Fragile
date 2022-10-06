import Adw from '@gi/adw1';
import { registerClass } from '@/utils/gjs';
import GObject from '@gi/gobject2';
import Gio from '@gi/gio2';
import GLib from '@gi/glib2';
import Gtk from '@gi/gtk4';

Gio._promisify(Gio.File.prototype, 'replace_contents_async', 'replace_contents_finish');

@registerClass({
	GTypeName: 'FragDetailsWindow',
	Template: 'resource:///com/github/sorry4nothing/Fragile/details_window.ui',
	Properties: {
        'tasks_mock': GObject.param_spec_variant('testlist', 'Testlist', 'Testlist',
        new GLib.VariantType('as'), null,
        GObject.ParamFlags.READWRITE),
	},
    Children: [
        'list_backlog',
        'list_open',
        'list_reviewready',
        'list_done',
    ],
})
export class FragDetailsWindow extends Adw.ApplicationWindow {
    public list_backlog: Gtk.ListBox;
    public list_open: Gtk.ListBox;
    public list_reviewready: Gtk.ListBox;
    public list_done: Gtk.ListBox;

    //later to be replaced with real data
    public tasks_mock = ["Task1", "Task2", "Task3", "Task4"];

    constructor(params = {}) {
        super(params);

        this.tasks_mock.forEach(task => {
            const gtkText = new Gtk.Label();
            gtkText.label = task;
            const gtkText2 = new Gtk.Label();
            gtkText2.label = task;
            const gtkText3 = new Gtk.Label();
            gtkText3.label = task;
            const gtkText4 = new Gtk.Label();
            gtkText4.label = task;

            this.list_backlog.append(gtkText);
            this.list_backlog.show();

            this.list_open.append(gtkText2);
            this.list_open.show();

            this.list_reviewready.append(gtkText3);
            this.list_reviewready.show();

            this.list_done.append(gtkText4);
            this.list_done.show();

        });

        this.list_backlog.visible = true;
        this.list_open.visible = true;
        this.list_reviewready.visible = true;
        this.list_done.visible = true;
    }
}
