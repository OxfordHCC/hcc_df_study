import { build } from 'esbuild';
import dotenv from 'dotenv';

import { copyStatic } from './static';
import { BUILD_DIR, SRC_DIR } from "./util";

dotenv.config();
export const buildConfig = {
	bundle: true,
	entryPoints: [`${SRC_DIR}/js/main.tsx`],
	outdir: BUILD_DIR,
	sourcemap: true,
	inject: ["./scripts/process-shim.js"],
	define:{
		["process.env"]: JSON.stringify(process.env)
	},
}

build(buildConfig).then(() => {
	copyStatic();
}).catch(err => {
	throw err;
});

