import http from 'http';
import { Either } from 'dfs-common';
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

export function dockerReq(
	method: string, endpoint: string, queryParams: object = [],
	body: object = {}
): Promise<Either<Error, any>>{
	const queryStr = Object.entries(queryParams).map(
		keyVal => keyVal.join('='));
	const path = `${endpoint}?${queryStr}`;

	const bodyStr = JSON.stringify(body);
	const contentLength = Buffer.byteLength(bodyStr);

	const headers = {
		"Content-Type": "application/json",
		"Content-Length": contentLength
	}

	return new Promise((resolve, _reject) => {
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
					resolve(err);
				}
				resolve(resData);
			});
		});

		req.on("error", (e) => {
			resolve(e);
		});
		
		req.end(bodyStr);
	});
}

export function start(
	containerId: string
): Promise<Either<Error, void>>{
	return dockerReq("POST", `/containers/${containerId}/start`);
}

export function ps(){
	return dockerReq("GET",'/containers/json');
}
