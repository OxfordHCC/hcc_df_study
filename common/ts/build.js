import { build } from 'esbuild';

build({
	entryPoints: ['./src/index.ts'],
	bundle: true,
	outfile: 'index.js'
});
