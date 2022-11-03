import Adw from '@gi/adw1';
import { registerClass } from '@/utils/gjs';
import { fetch } from '@/utils/fetch';
import GObject from '@gi/gobject2';
import Gio from '@gi/gio2';
import GLib from '@gi/glib2';
import { FragImportWindow } from './import_window';

Gio._promisify(Gio.File.prototype, 'replace_contents_async', 'replace_contents_finish');

@registerClass({
	GTypeName: 'FragLoginWindow',
	Template: 'resource:///com/github/sorry4nothing/Fragile/login_window.ui',
	Properties: {
		username: GObject.ParamSpec.string('username', 'username', 'username', GObject.ParamFlags.READWRITE, ''),
		password: GObject.ParamSpec.string('password', 'password', 'password', GObject.ParamFlags.READWRITE, ''),
		error: GObject.ParamSpec.string('error', 'error', 'error', GObject.ParamFlags.READWRITE, ''),
		errorVisible: GObject.ParamSpec.boolean(
			'error-visible',
			'error-visible',
			'error-visible',
			GObject.ParamFlags.READWRITE,
			false
		),
	},
})
export class FragLoginWindow extends Adw.ApplicationWindow {
	public username: string;
	public password: string;
	public error: string;
	public errorVisible: boolean;

	on_button_clicked() {
		fetch('http://localhost:3000/login', {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
			},
			body: JSON.stringify({
				username: 'bestUser',
				password: 'securePassword',
			}),
		})
			.then((res) => {
				console.log(res.status, res.statusText);
				const data = res.text();
				console.log(data);
			})
			.catch((err) => {
				console.error(err);
			});
	}

	on_login_clicked() {
		this._sendLoginRequest('login');
	}

	on_register_clicked() {
		this._sendLoginRequest('register');
	}

	private _sendLoginRequest(endpoint: 'login' | 'register') {
		fetch(`http://localhost:3000/${endpoint}`, {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
			},
			body: JSON.stringify({
				username: this.username,
				password: this.password,
			}),
		})
			.then((res) => {
				if (res.status == 401) {
					this.error = res.text();
					this.errorVisible = true;
					return;
				}

				const jwt = res.text();
				this._saveJwt(jwt);

				const win = new FragImportWindow({ application: this.application });
				this.close();
				win.show();
			})
			.catch((err) => {
				console.error(err);
			});
	}

	private async _saveJwt(jwt: string) {
		try {
			const file = Gio.File.new_for_path('jwt.txt');
			await file.replace_contents_async(
				new GLib.Bytes(jwt),
				null,
				false,
				Gio.FileCreateFlags.REPLACE_DESTINATION,
				null
			);
			console.log('saved');
		} catch (err) {
			console.error(err);
		}
	}
}
