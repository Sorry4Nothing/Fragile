import Adw from '@gi/adw1';
import { registerClass } from '@/utils/gjs';
import { fetch } from '@/utils/fetch';
import GObject from '@gi/gobject2';
import Gio from '@gi/gio2'

Gio._promisify(Gio.File.prototype, 'replace_contents_async', 'replace_contents_finish');

@registerClass({
	GTypeName: 'FragImportWindow',
	Template: 'resource:///com/github/sorry4nothing/Fragile/import_window.ui',
	Properties: {
		fragileName: GObject.ParamSpec.string('fragile-name', 'fragile-name', 'fragile-name', GObject.ParamFlags.READWRITE, ''),
		link: GObject.ParamSpec.string('link', 'link', 'link', GObject.ParamFlags.READWRITE, ''),
		platform: GObject.ParamSpec.int('platform', 'platform', 'platform', GObject.ParamFlags.READWRITE, 0, 2, 0),
		error: GObject.ParamSpec.string('error', 'error', 'error', GObject.ParamFlags.READWRITE, ''),
		errorVisible: GObject.ParamSpec.boolean('error-visible', 'error-visible', 'error-visible', GObject.ParamFlags.READWRITE, false),
	},
})
export class FragImportWindow extends Adw.ApplicationWindow {
	public fragileName: string;
	public link: string;
	public platform: number;
	public error: string;
	public errorVisible: boolean;



	on_import_clicked() {
		this._sendImportRequest();
		
	}

	private _sendImportRequest() {
		if (!this.link.startsWith('http')) {
			this.error = 'Invalid link';
			this.errorVisible = true;
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
}
