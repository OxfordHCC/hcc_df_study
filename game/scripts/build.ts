import { build } from 'esbuild';
import dotenv from 'dotenv';
import { resolve } from 'path';

import { copyStatic, replaceInStaticFile } from './static';
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

const { DFS_WS_HOSTNAME, BASE_HREF } = process.env;
if(DFS_WS_HOSTNAME === undefined || BASE_HREF === undefined){
	throw "Missing build env variables.";
}

build(buildConfig).then(() => copyStatic())
.then(() => replaceInStaticFile(resolve(BUILD_DIR, 'index.html'), {
	$BASE_HREF: BASE_HREF,
	$DFS_WS_HOSTNAME: DFS_WS_HOSTNAME
}))
.catch(err => {
	throw err;
});

