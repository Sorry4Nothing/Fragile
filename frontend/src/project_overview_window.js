var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import Adw from '@gi/adw1';
import Gtk from '@gi/gtk4';
import { registerClass } from '@/utils/gjs';
import Gio from '@gi/gio2';
import GLib from '@gi/glib2';
import { FragDetailsWindow } from './details_window';
import { FragImportWindow } from './import_window';
Gio._promisify(Gio.File.prototype, 'replace_contents_async', 'replace_contents_finish');
let ProjectOverviewWindow = class ProjectOverviewWindow extends Adw.ApplicationWindow {
    constructor(props = {}) {
        super(props);
        this.refresh();
    }
    on_new_clicked() {
        console.log(`navigate to import window`);
        const win = new FragImportWindow({ application: this.application });
        this.close();
        win.show();
    }
    on_refresh_clicked() {
        console.log('refreshing');
        this.refresh();
    }
    on_choose_project(project) {
        console.log(`navigate to ${project.projectName} project details`);
        const win = new FragDetailsWindow({ application: this.application }, project);
        this.close();
        win.show();
    }
    refresh() {
        //should make a fetch call on real implementation
        const projects = this.getImportedProjects();
        // remove all children of overvielist ListBox
        while (true) {
            const child = this._overviewList.get_row_at_index(0);
            if (!child) {
                break;
            }
            this._overviewList.remove(child);
        }
        if (projects.length > 0) {
            for (const project of projects) {
                this._overviewList.append(new Gtk.Label({ label: project.projectName }));
            }
        }
        else {
            this._overviewList.append(new Gtk.Label({ label: 'No projects found' }));
        }
    }
    getImportedProjects() {
        let resultProjects = [];
        //read projects.json
        const userDir = GLib.get_user_data_dir();
        const projectFile = Gio.File.new_for_path(userDir + '/fragile/projects.json');
        // check if file exists
        if (projectFile.query_exists(null)) {
            // read file
            projectFile.load_contents_async(null, (file, res) => {
                const [success, contents] = file.load_contents_finish(res);
                if (success) {
                    // parse json
                    const projects = JSON.parse(contents.toString());
                    resultProjects = projects;
                }
                else {
                    console.error('could not read projects.json');
                }
            });
        }
        else {
            console.error('projects.json does not exist');
            return [];
        }
        return resultProjects;
    }
};
ProjectOverviewWindow = __decorate([
    registerClass({
        GTypeName: 'ProjectOverviewWindow',
        Template: 'resource:///com/github/sorry4nothing/Fragile/project_overview_window.ui',
        InternalChildren: ['overviewList'],
    })
], ProjectOverviewWindow);
export { ProjectOverviewWindow };
