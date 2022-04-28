import { build } from 'esbuild';
import dotenv from 'dotenv';

dotenv.config();
function buildServer(){
	return build({
		bundle: true,
		entryPoints: ["./src/main.ts"],
		outdir: "./build",
		platform: "node",
		sourcemap: true,
		external: ["sqlite3"],
		define: {
			["buildenv"]: JSON.stringify(process.env)
		}
	});
}

buildServer();
