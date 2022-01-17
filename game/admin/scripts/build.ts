import { build } from 'esbuild';
import { copyStatic } from './static';
import { BUILD_DIR, SRC_DIR } from "./util";

export const buildConfig = {
	bundle: true,
	entryPoints: [`${SRC_DIR}/ts/main.ts`],
	outdir: BUILD_DIR,
	sourcemap: true
}

build(buildConfig);
copyStatic();
