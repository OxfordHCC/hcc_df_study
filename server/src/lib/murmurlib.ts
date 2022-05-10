import { mkdirSync, rmdirSync } from 'fs';
import path from 'path';
import { Either } from 'monet';
import { map, chain, FutureInstance } from 'fluture';
import { Session, RecFile } from 'dfs-common';

import { e2f, readdirP, openfileP, readfileP } from './util';
import { Logger } from './log';
import { config } from '../config';
import * as docker from './dockerlib';


const { log } = Logger('murmurlib');

const { DFS_REC_DIR } = config;

if(DFS_REC_DIR === undefined){
	throw new Error("Invalid/missing DFS_REC_DIR env variable.");
}

const recDirRoot = path.resolve(__dirname, DFS_REC_DIR);
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

export function getRecordings(recDir: string){
	return readdirP(recDir);
}

function createContainer(
	{ name, grpcPort, murmurPort, recDir }: ParamsWithRecDir
): FutureInstance<Error, Murmur>{
	log("create container", name);
	
	return docker.create(name, {
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
	})
	.pipe(map(x => ({
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

export function removeSessionMurmur(session: Session): FutureInstance<Error, Session>{
	const murmur = murmurFromSession(session);
	return removeMurmur(murmur)
	.pipe(map(_ => session));
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
