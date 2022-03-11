import * as docker from './dockerlib';
import { Either, Session } from 'dfs-common';
import { Logger } from './log';

const { error } = Logger("murmurlib");

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
): Promise<Either<Error, MurmurContainer>>{
	const createRes = await docker.create(name, {
		Image: "mumble_server",
		ExposedPorts: {
			"64738/tcp": {},
			"64738/udp": {},
			"50051": {}
		},
		HostConfig: {
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

	if(createRes instanceof Error){
		return createRes;
	}

	const murmurId = createRes.Id;
	const startRes = await docker.start(murmurId);
	if(startRes instanceof Error){
		await docker.rm(murmurId);
		return startRes;
	}

	return {
		id: murmurId
	};
}

export async function initMurmurContainer(
	session: Session
): Promise<Either<Error, MurmurContainer>>{
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
