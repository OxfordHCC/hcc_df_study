import { mkdirSync, rmdirSync } from 'fs';
import { readdir } from 'fs/promises';
import path from 'path';
import { Either } from 'monet';
import { attemptP, map, chain, FutureInstance } from 'fluture';
import { Session, RecFile } from 'dfs-common';
import { Buffer } from 'buffer';

import { e2f, readdirP, openfileP, readfileP } from './util';
import { Logger } from './log';
import * as docker from './dockerlib';

const { log } = Logger('murmurlib');

const recDirRoot = path.resolve(__dirname, '../var/rec');
mkdirSync(recDirRoot, { recursive: true });


type Murmur = {
	id: string,
	name: string,
	grpcPort: number;
	murmurPort: number;
	recDir: string;
}

type ParamsWithRecDir = CreateMurmurParams & Pick<Murmur, "recDir" | "name">;
export function resolveParams(params: CreateMurmurParams): ParamsWithRecDir {
	const { grpcPort, murmurPort } = params;
	const name = `g${grpcPort}_m${murmurPort}`;

	const recDir = path.resolve(recDirRoot, name);

	return {
		...params,
		name,
		recDir
	};
}

function isNodeError(x: any): x is NodeJS.ErrnoException{
	const isError = x instanceof Error;
	const hasCode = x['code'] !== undefined;
	
	return isError && hasCode;
}

function createRecDir(
	params: ParamsWithRecDir, ignoreExists: boolean = false
): Either<NodeJS.ErrnoException, ParamsWithRecDir> {
	log("create rec dir", params.recDir, `ignoreEEXIST: ${ignoreExists}`);
	
	const { recDir } = params;
	return Either.fromTry(() => {
		try{
			mkdirSync(recDir);
			return params;
		}catch(err){
			if(ignoreExists === true && isNodeError(err) && err.code === "EEXIST"){
				return params;
			}
			throw err;
		}
	});
}

function removeRecDir(
	params: ParamsWithRecDir
): Either<Error, void>{
	const { recDir } = params;
	return Either.fromTry(() => {
		rmdirSync(recDir);
	});
}

function isMams(filePath: string): boolean{
	return path.parse(filePath).ext === ".mams";
}
export function getRecMams(recDir: string): FutureInstance<Error, RecFile[]>{
	return readdirP(recDir)
	.pipe(map(files => files.filter(isMams)))
	.pipe(map(files => files.map(name => ({
		name,
		path: path.resolve(recDir, name)
	}))));
}

export function readMam(recFile: RecFile, fromByte: number, len: number){
	const filePath = recFile.path;
	
	return openfileP(filePath, "r")
	.pipe(chain(readfileP(fromByte, len)));
}

function createContainer(
	{ name, grpcPort, murmurPort, recDir }: ParamsWithRecDir
): FutureInstance<Error, Murmur>{
	log("create container", name);
	
	const container = docker.create(name, {
		Image: "mumble_server",
		ExposedPorts: {
			"64738/tcp": {},
			"64738/udp": {},
			"50051": {}
		},
		HostConfig: {
			Mounts: [
				{
					Target: "/var/hcc/rec/",
					Source: recDir,
					Type: "bind",
					ReadOnly: false
				}
			],
			PortBindings: {
				"64738/udp": [{
					HostPort: murmurPort.toString()
				}],
				"64738/tcp": [{
					HostPort: murmurPort.toString()
				}],
				"50051": [{
					HostPort: grpcPort.toString()
				}]
			}
		}
	});

	
	return container.pipe(map(x => ({
		id: x.Id,
		name,
		grpcPort,
		murmurPort,
		recDir
	})));
}

type CreateMurmurParams = {
	grpcPort: number;
	murmurPort: number;
}
export function createMurmur(
	params: CreateMurmurParams
): FutureInstance<Error, Murmur> {
	const recAndNameParams = resolveParams(params);
	log("create murmur", recAndNameParams.name);
	
	return e2f(createRecDir(recAndNameParams))
	.pipe(chain(createContainer));
}

export function removeMurmur(
	murmur: Murmur
): FutureInstance<Error, Murmur>{
	return docker.stop(murmur.id)
	.pipe(chain(([murmurId]) => docker.rm(murmurId)))
	.pipe(chain(_x => e2f(removeRecDir(murmur))))
	.pipe(map(_void => murmur));
}

// session -> murmur
export function murmurFromSession(session: Session): Murmur{
	const recAndName = resolveParams(session);
	return {
		id: session.murmurId,
		...recAndName,
		...session
	};
}

export function initMurmur(
	murmur: Murmur
): FutureInstance<Error, string> {
	log("init murmur", murmur.name);
	return e2f(createRecDir(murmur, true))
	.pipe(chain(_ => docker.start(murmur.id)))
	.pipe(map(_ => murmur.id));
}
