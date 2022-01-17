import { serve } from 'esbuild';
import { copyStatic } from './static';
import { buildConfig } from './build';
import { BUILD_DIR } from './util';

serve({
	port:8081,
	servedir: BUILD_DIR
}, buildConfig);
copyStatic();

