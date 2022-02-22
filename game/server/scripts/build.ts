import { build } from 'esbuild';

function buildServer(){
	return build({
		bundle: true,
		entryPoints: ["./src/main.ts"],
		outdir: "./build",
		platform: "node",
		sourcemap: true,
		external: ["sqlite3"]
	});
}

buildServer();
