import Adw from '@gi/adw1';
import { registerClass } from '@/utils/gjs';
import { fetch } from '@/utils/fetch';
import GObject from '@gi/gobject2';
import Gio from '@gi/gio2';
import Gtk from '@gi/gtk4';
import GLib from '@gi/glib2';
import { FragDetailsWindow } from './details_window';
import { FragileProject } from './models/fragileproject';
import { ProjectOverviewWindow } from './project_overview_window';

Gio._promisify(Gio.File.prototype, 'replace_contents_async', 'replace_contents_finish');

@registerClass({
	GTypeName: 'FragImportWindow',
	Template: 'resource:///com/github/sorry4nothing/Fragile/import_window.ui',
	Properties: {
		fragileName: GObject.ParamSpec.string(
			'fragile-name',
			'fragile-name',
			'fragile-name',
			GObject.ParamFlags.READWRITE,
			''
		),
		link: GObject.ParamSpec.string('link', 'link', 'link', GObject.ParamFlags.READWRITE, ''),
		platform: GObject.ParamSpec.int('platform', 'platform', 'platform', GObject.ParamFlags.READWRITE, 0, 2, 0),
		error: GObject.ParamSpec.string('error', 'error', 'error', GObject.ParamFlags.READWRITE, ''),
		errorVisible: GObject.ParamSpec.boolean(
			'error-visible',
			'error-visible',
			'error-visible',
			GObject.ParamFlags.READWRITE,
			false
		),
		projects_mock: GObject.param_spec_variant(
			'testlist',
			'Testlist',
			'Testlist',
			new GLib.VariantType('as'),
			null,
			GObject.ParamFlags.READWRITE
		),
	},
	Children: [],
})
export class FragImportWindow extends Adw.ApplicationWindow {
	public fragileName: string;
	public link: string;
	public platform: number;
	public error: string;
	public errorVisible: boolean;
	private apiImportLink: string = `http://localhost:3000/import`;

	constructor(params = {}) {
		super(params);
	}

	on_import_clicked() {
		this._sendImportRequest();
	}

	private _sendImportRequest() {
		if (!this.link.startsWith('http')) {
			this.error = 'Invalid link';
			this.errorVisible = true;
			return;
		}
		const platformName = this._platformNumberToString(this.platform);
		const fullLink = this.apiImportLink + `?link=${this.link}&platform=${platformName}`;

		console.log('sending fragile import request: ', fullLink);
		fetch(fullLink)
			.then((res) => {
				if (res.status === 200) {
					console.log('import request successful');
					this._saveProject(res.json());
					this._open_overview_window();
				} else {
					console.log('import request failed', res);
					this.error = 'Import failed';
					this.errorVisible = true;
				}
			})
			.catch((err) => {
				console.error(err);
				this.error = 'Currently offline';
				this.errorVisible = true;
			});
	}

	private _platformNumberToString(platform: number) {
		switch (platform) {
			case 0:
				return 'githöb';
			case 1:
				return 'jira';
			case 2:
				return 'fragile';
			default:
				return 'githöb';
		}
	}

	private _saveProject(importResponseProject: any) {
		console.log(importResponseProject);
		importResponseProject.projectName = this.fragileName;
		// create or append to projects.json inside user dir
		const userDir = GLib.get_user_data_dir();
		const projectDir = Gio.File.new_for_path(userDir + '/fragile');
		const projectFile = Gio.File.new_for_path(userDir + '/fragile/projects.json');
		// check if file exists
		console.log(projectFile.query_exists(null));
		if (projectFile.query_exists(null)) {
			// read file
			projectFile.load_contents_async(null, (file, res) => {
				const [success, contents] = file!.load_contents_finish(res);
				if (success) {
					// parse json with textdecoder on contents
					const decoder = new TextDecoder();
					const projects = JSON.parse(decoder.decode(contents));
					// append importResponseProjects which already is json
					projects.push(importResponseProject);
					// write file
					projectFile.replace_contents_async(
						new GLib.Bytes(JSON.stringify(projects)),
						null,
						false,
						Gio.FileCreateFlags.REPLACE_DESTINATION,
						null,
						(file, res) => {
							file!.replace_contents_finish(res);
						}
					);
				} else {
					console.error('could not read projects.json');
				}
			});
		} else {
			// create parent directories
			if (!projectDir.query_exists(null)) {
				projectDir.make_directory_with_parents(null);
			}
			// create file and parent directories inside user dir
			projectFile.create_async(Gio.FileCreateFlags.NONE, GLib.PRIORITY_HIGH, null, (file, res) => {
				file!.create_finish(res);

				console.log(file);
				// write file
				projectFile.replace_contents_async(
					new GLib.Bytes("[" + JSON.stringify(importResponseProject) + "]"),
					null,
					false,
					Gio.FileCreateFlags.REPLACE_DESTINATION,
					null,
					(file, res) => {
						file!.replace_contents_finish(res);
					}
				);
			});
		}
	}

	private _open_overview_window() {
		const win = new ProjectOverviewWindow({ application: this.application });
		this.close();
		win.show();
	}
}
