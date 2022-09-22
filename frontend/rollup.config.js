import typescript from '@rollup/plugin-typescript';
import { readFileSync } from 'fs';
import { terser } from 'rollup-plugin-terser';

const buildPath = 'dist';

const docsLock = JSON.parse(readFileSync('docs-lock.json', 'utf8'));
const paths = {};
for (const lib of docsLock) {
	// Workaround for libs where the slug in lock.json ends with 0 which is removed in the .d.ts file name
	lib.slug = lib.slug.replace(/0+$/, '');

	paths[`@gi/${lib.slug}`] = `gi://${lib.name}?version=${lib.api_version}`;
}

/** @type {import('rollup').RollupOptions} */
export default {
	input: 'src/entrypoint.ts',
	output: {
		file: `${buildPath}/fragile.js`,
		format: 'esm',
		name: 'fragile',
		paths,
		banner: `#!/usr/bin/env -S gjs -m
import Gio from 'gi://Gio?version=2.0';
const file = Gio.File.new_for_uri(import.meta.url);
const resfile = file.get_parent()?.resolve_relative_path('fragile.gresource');
const resource = Gio.Resource.load(resfile?.get_path() ?? '');
Gio.resources_register(resource);`,
	},
	external: [...Object.keys(paths), 'console'],
	plugins: [typescript({ tsconfig: './tsconfig.json' }), terser()],
};
