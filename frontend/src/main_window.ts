import Adw from '@gi/adw1';
import { registerClass } from '@/utils/gjs';
import { fetch } from '@/utils/fetch';

type IPifyResponse = {
	ip: string;
};

@registerClass({
	GTypeName: 'FragMainWindow',
	InternalChildren: ['statusPage'],
	Template: 'resource:///com/github/sorry4nothing/Fragile/main_window.ui',
})
export class FragMainWindow extends Adw.ApplicationWindow {
	private _statusPage: Adw.StatusPage;
	private _fetchInProgress = false;

	on_button_clicked() {
		if (!this._fetchInProgress) {
			fetch('https://api64.ipify.org?format=json')
				.then((res) => res.json())
				.then((res) => res as IPifyResponse)
				.then((res) => {
					this._statusPage.description = `IP addr: ${res.ip}`;
				})
				.catch((err) => {
					this._statusPage.description = err.toString();
					console.log(err);
				})
				.finally(() => {
					this._fetchInProgress = false;
				});
			this._statusPage.description = 'Fetching public IP...';
			this._fetchInProgress = true;
		}
	}
}
