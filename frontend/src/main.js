var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import Adw from '@gi/adw1';
import { registerClass } from '@/utils/gjs';
import { FragLoginWindow } from '@/login_window';
let FragApp = class FragApp extends Adw.Application {
    constructor(props = {}) {
        super({
            ...props,
            applicationId: 'com.github.sorry4nothing.Fragile',
        });
    }
    vfunc_activate() {
        const win = new FragLoginWindow({ application: this });
        win.show();
    }
};
FragApp = __decorate([
    registerClass({
        GTypeName: 'FragApp',
    })
], FragApp);
export function main(argv) {
    return new FragApp().run(argv);
}
