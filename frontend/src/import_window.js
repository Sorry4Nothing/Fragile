var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import Adw from '@gi/adw1';
import { registerClass } from '@/utils/gjs';
import { fetch } from '@/utils/fetch';
import GObject from '@gi/gobject2';
import Gio from '@gi/gio2';
import GLib from '@gi/glib2';
import { FragDetailsWindow } from './details_window';
Gio._promisify(Gio.File.prototype, 'replace_contents_async', 'replace_contents_finish');
let FragImportWindow = class FragImportWindow extends Adw.ApplicationWindow {
    constructor(params = {}) {
        super(params);
        this.apiPort = 3000;
        this.apiImportLink = `localhost:${this.apiPort}/import`;
    }
    on_import_clicked() {
        this._sendImportRequest();
    }
    _sendImportRequest() {
        if (!this.link.startsWith('http')) {
            this.error = 'Invalid link';
            this.errorVisible = true;
            return;
        }
        console.log('sending fragile import request');
        const completeLink = `${this.apiImportLink}?link=${this.link}&platform=${"githöb"}`;
        console.log(completeLink);
        fetch(completeLink)
            .then((res) => {
            if (res.status === 200) {
                console.log('import request successful');
                this._saveProject(res.json());
            }
            else {
                console.log('import request failed');
                this.error = 'Import failed';
                this.errorVisible = true;
            }
        })
            .catch((err) => {
            console.error(err);
            this.error = 'Currently offline';
            this.errorVisible = true;
        });
    }
    _saveProject(imporResponseProjects) {
        // create or append to projects.json inside user dir
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
                    // append new project
                    projects.push(imporResponseProjects);
                    // write file
                    projectFile.replace_contents_async(JSON.stringify(projects), null, false, Gio.FileCreateFlags.REPLACE_DESTINATION, null, (file, res) => {
                        file.replace_contents_finish(res);
                    });
                }
                else {
                    console.error('could not read projects.json');
                }
            });
        }
        else {
            // create file
            projectFile.create_async(Gio.FileCreateFlags.NONE, Gio.FileCreateFlags.NONE, null, (file, res) => {
                file.create_finish(res);
                // write file
                projectFile.replace_contents_async(JSON.stringify(imporResponseProjects), null, false, Gio.FileCreateFlags.REPLACE_DESTINATION, null, (file, res) => {
                    file.replace_contents_finish(res);
                });
            });
        }
    }
    // TODO: open for real project, when we have the data
    on_project_clicked(project) {
        // pass project FragDetailsWindow
        const win = new FragDetailsWindow({ application: this.application }, project);
        this.close();
        win.show();
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
FragImportWindow = __decorate([
    registerClass({
        GTypeName: 'FragImportWindow',
        Template: 'resource:///com/github/sorry4nothing/Fragile/import_window.ui',
        Properties: {
            fragileName: GObject.ParamSpec.string('fragile-name', 'fragile-name', 'fragile-name', GObject.ParamFlags.READWRITE, ''),
            link: GObject.ParamSpec.string('link', 'link', 'link', GObject.ParamFlags.READWRITE, ''),
            platform: GObject.ParamSpec.int('platform', 'platform', 'platform', GObject.ParamFlags.READWRITE, 0, 2, 0),
            error: GObject.ParamSpec.string('error', 'error', 'error', GObject.ParamFlags.READWRITE, ''),
            errorVisible: GObject.ParamSpec.boolean('error-visible', 'error-visible', 'error-visible', GObject.ParamFlags.READWRITE, false),
            projects_mock: GObject.param_spec_variant('testlist', 'Testlist', 'Testlist', new GLib.VariantType('as'), null, GObject.ParamFlags.READWRITE),
        },
        Children: ['sidebar']
    })
], FragImportWindow);
export { FragImportWindow };
