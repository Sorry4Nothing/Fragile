import Gio from '@gi/gio2';
//import { main } from '@/main';

import { setConsoleLogDomain } from 'console';
setConsoleLogDomain('Fragile');

const file = Gio.File.new_for_uri(import.meta.url);
const resfile = file.get_parent()?.resolve_relative_path('fragile.gresource');
const resource = Gio.Resource.load(resfile?.get_path() ?? '');
Gio.resources_register(resource);

const main = await import('@/main').then((m) => m.main);
main(ARGV);
