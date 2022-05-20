import path from 'path';
import { copyFile, mkdir, readdir, stat } from 'fs/promises';
import { readFileSync, writeFileSync } from 'fs';
import { BUILD_DIR, SRC_DIR } from './util';

async function copyStaticDir(dir: string, dst: string): Promise<any>{
	await mkdir(dst, { recursive: true });
	const entries = await readdir(dir);

	return entries.map(entry =>
		copyStaticEntry(
			path.resolve(dir, entry),
			path.resolve(dst, entry)
		)
	);
}

async function copyStaticEntry(src: string, dst: string): Promise<any>{
	const statRes = await stat(src);

	if(statRes.isDirectory()){
		return copyStaticDir(src, dst);
	}

	return copyFile(src, dst);
}

export function replaceInStaticFile(filePath: string, replaceMap:{[indx:string]: string}){
	let fileContents = readFileSync(filePath, {
		encoding: "utf8"
	});

	Object.entries(replaceMap).forEach(([key, val]) => {
		fileContents = fileContents.replaceAll(key, val);
	});

	writeFileSync(filePath, fileContents);
}

export async function copyStatic(src: string = SRC_DIR, dst: string = BUILD_DIR) {
	const statics = [
		'./index.html',
		'./main.css',
		"./textures"
	];

	const copyPromises = statics.map(file =>
		copyStaticEntry(
			path.resolve(src,file),
			path.resolve(dst,file)
		)
	);
	
	return Promise.all(copyPromises)
	.then(() => {
		console.log("Copied static files.");
	})
	.catch(err => {
		console.error(err);
	})
}

