import * as main from '@/main';

import { setConsoleLogDomain } from 'console';
setConsoleLogDomain('Fragile');

imports.package.init({
	name: 'com.github.sorry4nothing.Fragile',
	version: '1.0.0',
	prefix: '/usr',
	libdir: 'lib',
});
imports.package.run(main);
