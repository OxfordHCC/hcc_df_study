import http from 'http';
import { Logger } from './log';

const { log } = Logger("dockerlib");

export class DockerError extends Error{
	statusCode: number;
	
	constructor(statusCode: number, message: string){
		super(message);
		this.statusCode = statusCode;
		this.name = "DockerError";
	}
}

function parseResponseBody(bodyStr: any){
	try{
		return JSON.parse(bodyStr);
	}catch(err){
		return {};
	}
}

function dockerReq(
	method: string, endpoint: string, queryParams: object = [],
	body: object = {}
){
	const queryStr = Object.entries(queryParams).map(
		keyVal => keyVal.join('='));
	const path = `${endpoint}?${queryStr}`;

	const bodyStr = JSON.stringify(body);
	const contentLength = Buffer.byteLength(bodyStr);

	const headers = {
		"Content-Type": "application/json",
		"Content-Length": contentLength
	}

	return new Promise((resolve, reject) => {
		const req = http.request({
			socketPath: "/var/run/docker.sock",
			headers,
			method,
			path,
		});

		req.on('response', (res) => {
			res.setEncoding("utf8");
			let resDataStr = "";

			res.on('data', (chunk) => {
				resDataStr += chunk;
			});

			res.on('end', () => {
				const { statusCode } = res;
				const resData = parseResponseBody(resDataStr);
				
				if (statusCode !== undefined && statusCode > 400) {
					const err = new DockerError(
						statusCode,
						resData.message || "Unknown error"
					);	
					reject(err);
				}
				resolve(resData);
			});
		});

		req.on("error", (e) => {
			reject(e);
		});
		
		req.end(bodyStr);
	});
}

type CreateMurmurContainerParams = {
	grpcPort: number;
	murmurPort: number;
	name: string;
}
export function createMurmurContainer(
	{ grpcPort, murmurPort, name }: CreateMurmurContainerParams
) {
	return dockerReq(
		"POST",
		"/containers/create",
		{ name },
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

export function start(containerName: string){
	return dockerReq("POST", `/containers/${containerName}/start`);
}

export function ps(){
	return dockerReq("GET",'/containers/json');
}
