import { serve } from 'esbuild';
import { copyStatic } from './static';
import { buildConfig } from './build';
import { BUILD_DIR } from './util';

const port = parseInt(process.env['XRAY_GAME_CLIENT_PORT'] || "8080");

serve({
	port,
	servedir: BUILD_DIR
}, buildConfig)
.then(() => {
	console.log("game client listening on port ", port);
});
copyStatic();

