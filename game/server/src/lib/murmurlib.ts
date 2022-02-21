import { dockerReq, ps } from './dockerlib';
import { Either } from 'dfs-common';

type CreateMurmurContainerParams = {
	grpcPort: number;
	murmurPort: number;
	name?: string
}
type CreateMurmurContainerResult = {
	Id: string,
	Warning: unknown[]
}
export function createMurmurContainer(
	{ grpcPort, murmurPort, name }: CreateMurmurContainerParams
): Promise<Either<Error,CreateMurmurContainerResult>> {
	return dockerReq(
		"POST",
		"/containers/create",
		{
			name
		},
		{
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
		}
	);
}

