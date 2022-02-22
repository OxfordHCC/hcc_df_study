import { build } from 'esbuild';

function buildServer(){
	return build({
		bundle: true,
		entryPoints: ["./src/main.ts"],
		outdir: "./build",
		platform: "node",
		external: ["aws-sdk", "nock", "mock-aws-s3"],
		sourcemap: true
	});
}

buildServer();
