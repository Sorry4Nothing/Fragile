import Adw from '@gi/adw1';
import { registerClass } from '@/utils/gjs';
import GObject from '@gi/gobject2';
import Gio from '@gi/gio2';
import GLib from '@gi/glib2';
import Gtk from '@gi/gtk4';
import { fetch } from './utils/fetch';
import { FragileProject } from './models/fragileproject';

Gio._promisify(Gio.File.prototype, 'replace_contents_async', 'replace_contents_finish');

@registerClass({
	GTypeName: 'FragLoggedinWindow',
	Template: 'resource:///com/github/sorry4nothing/Fragile/loggedin_window.ui',
	Properties: {
        // details page
        'tasks_mock': GObject.param_spec_variant('testlist', 'Testlist', 'Testlist',
        new GLib.VariantType('as'), null,
        GObject.ParamFlags.READWRITE),
        // import page,
        fragileName: GObject.ParamSpec.string('fragile-name', 'fragile-name', 'fragile-name', GObject.ParamFlags.READWRITE, ''),
		link: GObject.ParamSpec.string('link', 'link', 'link', GObject.ParamFlags.READWRITE, ''),
		platform: GObject.ParamSpec.int('platform', 'platform', 'platform', GObject.ParamFlags.READWRITE, 0, 2, 0),
		importError: GObject.ParamSpec.string('importError', 'importError', 'importError', GObject.ParamFlags.READWRITE, ''),
		importErrorVisible: GObject.ParamSpec.boolean('importErrorVisible', 'importErrorVisible', 'importErrorVisible', GObject.ParamFlags.READWRITE, false),
	},
    Children: [
        'stack_sidebar',
        'stack',
        // details page
        'list_backlog',
        'list_open',
        'list_reviewready',
        'list_done',
    ],
    // overview page
    InternalChildren: ['overviewList'],
})
export class FragLoggedinWindow extends Adw.ApplicationWindow {
    // #region details page
    public list_backlog: Gtk.ListBox;
    public list_open: Gtk.ListBox;
    public list_reviewready: Gtk.ListBox;
    public list_done: Gtk.ListBox;
    public stack_sidebar: Gtk.StackSidebar;
    public stack: Gtk.Stack;

    //later to be replaced with real data
    public tasks_mock = ["Task1", "Task2", "Task3", "Task4"];

    constructor(params = {}) {
        super(params);

        this.stack_sidebar.set_stack(this.stack);

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
    //#endregion


    //#region import page
    public fragileName: string;
	public link: string;
	public platform: number;
	public importError: string;
	public importErrorVisible: boolean;



	on_import_clicked() {
		this._sendImportRequest();
		
	}

	private _sendImportRequest() {
		if (!this.link.startsWith('http')) {
			this.importError = 'Invalid link';
			this.importErrorVisible = true;
			return;
		} 
		console.log('sending fragile import request');
		fetch(this.link)
			.then((res) => {
				console.log(res.status, res.statusText);
				const data = res.text();
				console.log(data);
			})
			.catch((err) => {
				console.error(err);
			});

	}
    //#endregion

    //#region overview page
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
		// eslint-disable-next-line no-self-assign
		this.projects = this.projects;

		// remove all children of overvielist ListBox
		// eslint-disable-next-line no-constant-condition
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

    //#endregion
}
