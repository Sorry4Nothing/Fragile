import Adw from '@gi/adw1';
import { registerClass } from '@/utils/gjs';
import { FragLoggedinWindow } from '@/loggedin_window';

@registerClass({
	GTypeName: 'FragApp',
})
class FragApp extends Adw.Application {
	constructor(props: Partial<Adw.Application.ConstructorProperties> = {}) {
		super({
			...props,
			applicationId: 'com.github.sorry4nothing.Fragile',
		});
	}

	vfunc_activate() {
		const win = new FragLoggedinWindow({ application: this });
		win.show();
	}
}

export function main(argv: string[]) {
	return new FragApp().run(argv);
}
