import { mkdirSync } from 'fs';
import path from 'path';
import * as docker from './dockerlib';
import { Either, Session } from 'dfs-common';
import { Logger } from './log';

const { log, error } = Logger("murmurlib");

const recDir = path.resolve(__dirname, '../var/rec');
mkdirSync(recDir, { recursive: true });


function eitherMkdir(dirPath: string): Either<NodeJS.ErrnoException, void>{
	try{
		mkdirSync(dirPath);
	}catch(err){
		return err as NodeJS.ErrnoException;
	}
}

type CreateMurmurContainerParams = {
	grpcPort: number;
	murmurPort: number;
	name?: string
}
type MurmurContainer = {
	id: string,
}
export async function createMurmurContainer(
	{ grpcPort, murmurPort, name }: CreateMurmurContainerParams
): Promise<Either<Error, MurmurContainer>> {
	// create rec directory in host
	const key = `g${grpcPort}_m${murmurPort}`;
	const sourceRecPath = path.resolve(recDir, key);
	const recDirErr = eitherMkdir(sourceRecPath);
	if(recDirErr instanceof Error){
		return recDirErr;
	}

	log("create murmur", "rec dir", sourceRecPath);
	const createRes = await docker.create(name, {
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
					Source: sourceRecPath,
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

	if (createRes instanceof Error) {
		error(createRes.message);
		return createRes;
	}
	
	const murmurId = createRes.Id;
	
	log("create murmur","created", murmurId);
	const startRes = await docker.start(murmurId);
	if (startRes instanceof Error) {
		await removeMurmurContainer(murmurId);
		return startRes;
	}
	
	log("create murmur","started", murmurId);

	return {
		id: murmurId
	};
}

export async function removeMurmurContainer(murmurId: string){
	// remove rec dir
	// stop container
	// remove container
	log("remove murmur", murmurId);
	await docker.stop(murmurId);
	await docker.rm(murmurId);
}

export async function initMurmurContainer(
	session: Session
): Promise<Either<Error, MurmurContainer>> {
	// start murmur container
	const res = await docker.start(session.murmurId);
	if(res instanceof docker.DockerError){
		if(res.statusCode === 404){
			// create if does not exist
			const murmur = await createMurmurContainer({
				name: session.murmurId,
				murmurPort: session.murmurPort,
				grpcPort: session.grpcPort
			});
			
			if(murmur instanceof Error){
				return murmur;
			}
		}
		if(res.statusCode === 409){
			error("container already exists");
		}
	}
	
	return { id: session.murmurId }
}

type SendAudioParams = {
	grpcPort: number
	sourceUser: string
	targetUser: string
	audioFile: string
}
export function sendAudio(params: SendAudioParams){
	// run docker cli
}
