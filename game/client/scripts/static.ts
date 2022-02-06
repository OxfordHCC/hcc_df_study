import path from 'path';
import { copyFile, mkdir } from 'fs/promises';
import { BUILD_DIR, SRC_DIR } from './util';

type CopyStaticFileResult = {
	error?: Error,
}

function isError(res: CopyStaticFileResult): boolean {
	return res.hasOwnProperty("error");
}

function getError(res: CopyStaticFileResult): Error | undefined{
	return res.error;
}

async function copyStaticFile(srcFile: string): Promise<CopyStaticFileResult> {
	try{
		const srcPath = path.resolve(path.join(SRC_DIR, srcFile));
		const dstPath = path.resolve(path.join(BUILD_DIR, srcFile));
		const dstDir = path.parse(dstPath).dir;

		await copyFile(srcPath, dstPath);
		await mkdir(dstDir, { recursive: true });

		return Promise.resolve({});
	} catch(err){
		return Promise.reject({error: new Error(`Error copying file ${srcFile}: ${err}`)});
	}
}

export function copyStatic(){
	const staticFiles = [
		`./index.html`,
		'./main.css',
		"./STARTAN1.png",
		"./GRAY1.png",
		"./ASHWALL.png",
		"./BIGDOOR6.png",
		"./CRATE1.png",
		"./WOOD1.png",
		"./MARBLE3.png"
	];
		
	return Promise.all(staticFiles.map(copyStaticFile))
	.then((copiedFiles) => copiedFiles.filter(isError)
		.forEach(res => {
			console.error(getError(res));
		})
	).catch(err => console.error(err));

}
