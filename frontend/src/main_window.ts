import Adw from '@gi/adw1';
import GObject from '@gi/gobject2';
import { registerClass } from '@/utils/gjs';

@registerClass({
	GTypeName: 'FragMainWindow',
	Properties: {
		test: GObject.ParamSpec.string(
			'test',
			'Test',
			'This is a test property',
			GObject.ParamFlags.READWRITE,
			'Default Value'
		),
		count: GObject.ParamSpec.int(
			'count',
			'Count',
			'The number of times the button has been clicked',
			GObject.ParamFlags.READWRITE,
			0,
			1000,
			0
		),
	},
	InternalChildren: ['statusPage'],
	Template: 'resource:///com/github/sorry4nothing/Fragile/main_window.ui',
})
export class FragMainWindow extends Adw.ApplicationWindow {
	public test: string;
	public count: number;
	private _statusPage: Adw.StatusPage;

	on_button_clicked() {
		console.log('Button clicked');
		this.count++;
	}

	on_count_changed() {
		this._statusPage.description = `Button clicked ${this.count} time${this.count === 1 ? '' : 's'}`;
	}
}
