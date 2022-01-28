import { serve } from 'esbuild';
import { copyStatic } from './static';
import { buildConfig } from './build';
import { BUILD_DIR } from './util';

const PORT = 8081;

Promise.all([
	copyStatic(),
	serve({
		port: PORT,
		servedir: BUILD_DIR
	}, buildConfig)])
.then(() => {
	console.log(`listening on port ${PORT}...`);
});
