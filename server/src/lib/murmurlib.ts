import { mkdirSync, rmdirSync } from 'fs';
import path from 'path';
import { Either } from 'monet';
import { map, chain, FutureInstance } from 'fluture';
import { e2f } from './util';

import * as docker from './dockerlib';

const recDirRoot = path.resolve(__dirname, '../var/rec');
mkdirSync(recDirRoot, { recursive: true });

type CreateMurmurParams = {
	grpcPort: number;
	murmurPort: number;
}

type Murmur = {
	id: string,
	name: string,
	grpcPort: number;
	murmurPort: number;
	recDir: string;
}

type ParamsWithMurmurName = CreateMurmurParams & Pick<Murmur, "name">;
// get rec dir name from murmur params
function resolveMurmurName(params: CreateMurmurParams): ParamsWithMurmurName{
	const { grpcPort, murmurPort } = params;
	const name = `g${grpcPort}_m${murmurPort}`;
	
	return {
		...params,
		name
	}
}

type ParamsWithRecDir = ParamsWithMurmurName & Pick<Murmur, "recDir">;
function createRecDir(
	params: ParamsWithMurmurName
): Either<NodeJS.ErrnoException, ParamsWithRecDir> {
	const { name } = params;
	const recDir = path.resolve(recDirRoot, name);
	return Either.fromTry(() => {
		mkdirSync(recDir);
		return {
			...params,
			recDir
		};
	});
}

function removeRecDir(
	params: ParamsWithMurmurName
): Either<Error, void>{
	const { name } = params;
	const recDir = path.resolve(recDirRoot, name);
	return Either.fromTry(() => {
		rmdirSync(recDir);
	});
}

function createContainer(
	{ name, grpcPort, murmurPort, recDir }: ParamsWithRecDir
): FutureInstance<Error, Murmur>{
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

export function createMurmur(
	params: CreateMurmurParams
): FutureInstance<Error, Murmur>{
	const name = resolveMurmurName(params);
	const dirEither = createRecDir(name);

	return e2f(dirEither)
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

export function initMurmur(
	murmurId: string
): FutureInstance<Error, string> {
	return docker.start(murmurId)
	.pipe(map(_ => murmurId))
}
