var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import Adw from '@gi/adw1';
import { registerClass } from '@/utils/gjs';
import Gio from '@gi/gio2';
import Gtk from '@gi/gtk4';
import { FragImportWindow } from './import_window';
Gio._promisify(Gio.File.prototype, 'replace_contents_async', 'replace_contents_finish');
let FragDetailsWindow = class FragDetailsWindow extends Adw.ApplicationWindow {
    constructor(params = {}, projects) {
        super(params);
        if (projects) {
            /*this.projects.forEach(project => {
            const gtkButton = new Gtk.Button();

            gtkButton.label = project;
            gtkButton.connect('clicked', () => this.on_project_clicked());

            this.sidebar.append(gtkButton);
            this.sidebar.show();
        })*/
            projects.columns.forEach((column) => {
                // add column to details_page_box
                const gtkColumn = new Gtk.ListBox();
                gtkColumn.name = column.name;
                this.columns.append(gtkColumn);
                column.missions.forEach((task) => {
                    const gtkText = new Gtk.Label();
                    gtkText.label = task.missionName;
                });
            });
        }
    }
    // TODO: open for real project, when we have the data
    /*	on_project_clicked(){
        const win = new FragDetailsWindow({ application: this.application });
        this.close();
        win.show();
    }*/
    on_import_clicked() {
        const win = new FragImportWindow({ application: this.application });
        this.close();
        win.show();
    }
};
FragDetailsWindow = __decorate([
    registerClass({
        GTypeName: 'FragDetailsWindow',
        Template: 'resource:///com/github/sorry4nothing/Fragile/details_window.ui',
        Properties: {},
        Children: ['sidebar', 'columns'],
    })
], FragDetailsWindow);
export { FragDetailsWindow };
