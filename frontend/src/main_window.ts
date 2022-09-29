import Adw from '@gi/adw1';
import { registerClass } from '@/utils/gjs';

@registerClass({
	GTypeName: 'FragMainWindow',
	InternalChildren: ['statusPage'],
	Template: 'resource:///com/github/sorry4nothing/Fragile/main_window.ui',
})
export class FragMainWindow extends Adw.ApplicationWindow {
	private _statusPage: Adw.StatusPage;

	on_button_clicked() {
		this._statusPage.description = 'Button clicked!';
	}
}
