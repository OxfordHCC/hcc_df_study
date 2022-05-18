import { mkdirSync, rmdirSync, chmodSync } from 'fs';
import path from 'path';
import { Left, Right, Either } from 'monet';
import { parallel, coalesce, mapRej, map, chain, FutureInstance, reject, resolve } from 'fluture';
import { Session, RecFile } from 'dfs-common';

import { withDb } from './db';
import { e2f, readdirP } from './util';
import { Logger } from './log';
import { config } from '../config';
import * as docker from './dockerlib';


const { log, error } = Logger('murmurlib');

const { DFS_REC_DIR } = config;

if(DFS_REC_DIR === undefined){
	throw new Error("Invalid/missing DFS_REC_DIR env variable.");
}

const recDirRoot = path.resolve(__dirname, DFS_REC_DIR);
mkdirSync(recDirRoot, { recursive: true });

type Murmur = {
	murmurId: string;
	sessionId: number;
	grpcPort: number;
	murmurPort: number;
	recDir: string;
}

function resolveMurmur(params: CreateMurmurParams): Murmur {
	const { grpcPort, murmurPort } = params;
	const murmurId = `g${grpcPort}_m${murmurPort}`;
	const recDir = path.resolve(recDirRoot, murmurId);

	return {
		...params,
		murmurId,
		recDir
	};
}

function isNodeError(x: any): x is NodeJS.ErrnoException{
	const isError = x instanceof Error;
	const hasCode = x['code'] !== undefined;
	
	return isError && hasCode;
}

function createRecDir(
	params: Murmur, ignoreExists: boolean = false
): Either<NodeJS.ErrnoException, Murmur> {
	log("create rec dir", params.recDir, `ignoreEEXIST: ${ignoreExists}`);
	
	const { recDir } = params;
	return Either.fromTry(() => {
		try{
			mkdirSync(recDir);
			chmodSync(recDir, "777");
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
	{ recDir } : Pick<Murmur, "recDir">
): Either<Error, void>{
	return Either.fromTry(() => rmdirSync(recDir));
}

function namesToRecFiles(recDir: string, ){
	return function(names: string[]): RecFile[]{
		return names.map(name => ({
			name,
			path: path.join(recDir, name)
		}));
	}
}

type GetRecordingsParams = Pick<Murmur, "recDir">;
export function getRecordings({ recDir }: GetRecordingsParams): FutureInstance<Error, RecFile[]>{
	return readdirP(recDir)
	.pipe(map(namesToRecFiles(recDir)));
}


type CreateContainerParams = Omit<Murmur, "containerId">;
function createContainer(
	params: CreateContainerParams
): FutureInstance<Error, Murmur>{
	const { murmurId, grpcPort, murmurPort, recDir, sessionId } = params;
	log("create container", murmurId);
	
	return docker.create(murmurId, {
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
		containerId: x.Id,
		murmurId,
		grpcPort,
		murmurPort,
		recDir,
		sessionId
	})));
}

export class CreateMurmurError extends Error{
	params: CreateMurmurParams;
	constructor(params: CreateMurmurParams, msg: string){
		super(msg);
		this.params = params;
		this.name = "CreateMurmurError";
	}
}

type CreateMurmurParams = {
	grpcPort: number;
	murmurPort: number;
	sessionId: Session['sessionId'];
}
export function createMurmur(
	params: CreateMurmurParams
): FutureInstance<CreateMurmurError, Murmur> {
	const murmur = resolveMurmur(params);
	log("create murmur", JSON.stringify(murmur));

	return insertMurmur(murmur)
	.pipe(chain(murmur => e2f(createRecDir(murmur))))
	.pipe(chain(createContainer))
	.pipe(mapRej(err => new CreateMurmurError(params, err.message)));
}

function removeContainer(murmur: Murmur){
	return docker.stop(murmur.murmurId) //stop container
	.pipe(chain(([murmurId]) => docker.rm(murmurId))) // rm container
}

export function removeMurmur(
	murmur: Murmur
): FutureInstance<Error, Murmur> {
	return parallel(1)(
		[removeContainer(murmur), e2f(removeRecDir(murmur))]
		.map(x => coalesce(Left)(Right)(x) ))
	.pipe(chain(_ => deleteMurmur(murmur)))
}

function normalizeDbMurmur(db_murmur: any): Murmur{
	return {
		murmurId: db_murmur.murmur_id,
		sessionId: db_murmur.session_id,
		recDir: db_murmur.rec_dir,
		grpcPort: db_murmur.grpc_port,
		murmurPort: db_murmur.murmur_port
	};
}
const selectSessionMurmurQuery = `
SELECT * FROM murmur
WHERE session_id = $session_id
`;
export function getMurmurBySessionId(sessionId: Session['sessionId']): FutureInstance<Error, Murmur> {
	return withDb(({ all }) => all(selectSessionMurmurQuery, {
		$session_id: sessionId
	}))
	.pipe(map(rows => rows.map(normalizeDbMurmur)))
	.pipe(chain(murmurs => {
		if(murmurs.length === 0){
			return reject(new Error("Murmur not found by sessionId."));
		}
		return resolve(murmurs[0]);
	}));
}

export function removeSessionMurmur(session: Session): FutureInstance<Error, Session>{
	log("remove_session_murmur", session.sessionId);
	// get murmur
	// remove Murmur
	const { sessionId } = session;
	return getMurmurBySessionId(sessionId)
	.pipe(chain(removeMurmur))
	.pipe(map(_ => session))
	.pipe(mapRej(err => {
		error("remove_session_murmur", err.message);
		return err;
	}))
}

export function initMurmur(
	murmur: Murmur
): FutureInstance<Error, Murmur> {
	log("init murmur", murmur.murmurId);
	return e2f(createRecDir(murmur, true))
	.pipe(chain(_ => docker.start(murmur.murmurId)))
	.pipe(map(_ => murmur));
}

const deleteMurmurQuery = `
DELETE FROM murmur
WHERE murmur_id = $murmur_id`;
function deleteMurmur(murmur: Murmur): FutureInstance<Error, Murmur>{
	log("delete_murmur", murmur.murmurId);
	return withDb(({run}) => run(deleteMurmurQuery, {
		$murmur_id: murmur.murmurId
	}))
	.pipe(map(_ => murmur));
}

const insertMurmurQuery = `
INSERT INTO murmur
(murmur_id, session_id, rec_dir, grpc_port, murmur_port)
VALUES ($murmur_id, $session_id, $rec_dir, $grpc_port, $murmur_port)`;
function insertMurmur(murmur: Murmur): FutureInstance<Error, Murmur>{
	return withDb(({run}) => 
		run(insertMurmurQuery, {
			$murmur_id: murmur.murmurId,
			$session_id: murmur.sessionId,
			$rec_dir: murmur.recDir,
			$grpc_port: murmur.grpcPort,
			$murmur_port: murmur.murmurPort
	}))
	.pipe(map(_ => murmur));
}

