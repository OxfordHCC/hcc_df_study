import path from 'path';
import { copyFile, mkdir, readdir, stat } from 'fs/promises';
import { BUILD_DIR, SRC_DIR } from './util';

// async function copyStaticFile(srcFile: string, srcDir: string, buildDir: string): Promise<CopyStaticFileResult> {
// 	try{
// 		const srcPath = path.resolve(path.join(srcDir, srcFile));
// 		
// 		const dstPath = path.resolve(path.join(buildDir, srcFile));
// 		const dstDir = path.parse(dstPath).dir;
// 
// 		
// 		await copyFile(srcPath, dstPath);
// 		await mkdir(dstDir, { recursive: true });
// 
// 		return Promise.resolve({});
// 	} catch(err){
// 		return Promise.reject({error: new Error(`Error copying file ${srcFile}: ${err}`)});
// 	}
// }
//

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
	
	Promise.all(copyPromises)
	.then(() => {
		console.log("Copied static files.");
	})
	.catch(err => {
		console.error(err);
	})
	
	
	// return Promise.all(staticFiles.map(file => copyStaticFile(file, srcDir, buildDir)))
// 	.then((copiedFiles) => copiedFiles.filter(isError)
// 		.forEach(res => {
// 			console.error(getError(res));
// 		})
// 	).catch(err => console.error(err));
// 
}
