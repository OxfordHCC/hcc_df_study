import { build } from 'esbuild';
import { copyStatic } from './static';
import { BUILD_DIR, SRC_DIR } from "./util";
import dotenv from 'dotenv';

dotenv.config();
export const buildConfig = {
	bundle: true,
	entryPoints: [`${SRC_DIR}/ts/main.tsx`],
	outdir: BUILD_DIR,
	sourcemap: true,
	define: {
		"buildenv": JSON.stringify(process.env)
	}
}

build(buildConfig);
copyStatic();
