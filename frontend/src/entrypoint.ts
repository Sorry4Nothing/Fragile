import Gio from '@gi/gio2';
import GLib from '@gi/glib2';
import { exit } from 'system';

import { setConsoleLogDomain } from 'console';
setConsoleLogDomain('Fragile');

const file = Gio.File.new_for_uri(import.meta.url);
const resfile = file.get_parent()?.resolve_relative_path('fragile.gresource');
const resource = Gio.Resource.load(resfile?.get_path() ?? '');
Gio.resources_register(resource);

// Workaround for https://gitlab.gnome.org/GNOME/gjs/-/issues/468

const loop = new GLib.MainLoop(null, false);

import('@/main')
	.then((m) => m.main)
	.then((main) => {
		GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
			loop.quit();
			const exit_code = main(ARGV);
			exit(exit_code);
			return GLib.SOURCE_REMOVE;
		});
	});

loop.run();
