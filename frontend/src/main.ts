import Adw from '@gi/adw1';
import { registerClass } from '@/utils/gjs';
import { FragLoginWindow } from '@/login_window';

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
		const win = new FragLoginWindow({ application: this });
		win.show();
	}
}

export function main(argv: string[]) {
	return new FragApp().run(argv);
}
