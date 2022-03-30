import http from 'http';
import { Future, parallel, map } from 'fluture';
import { Logger } from './log';

const { log } = Logger('dockerlib');

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

export function dockerReq<T>(
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
	
	return Future<DockerError, T>((reject, resolve) => {
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

				if (statusCode !== undefined && statusCode >= 400) {
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
			reject(new DockerError(500, e.message));
		});

		req.end(bodyStr);
		
		return () => { };
	});
}

// TODO: why is this not a variadic function?
export function start(containerId: string){
	log('start', containerId);
	return dockerReq("POST", `/containers/${containerId}/start`);
}

function stopContainer(name: string){
	log("stop", name);
	return dockerReq("POST", `/containers/${name}/stop`)
	.pipe(map(_void => name));
}

export function stop(...containers: string[]){
	return parallel(Infinity)(containers.map(stopContainer))
}

function rmContainer(name: string){
	log("rm", name);
	return dockerReq("DELETE", `/containers/${name}`);
}

type DockerCreateResult = {
	Id: string
	Warning: unknown[]
}
export function create(name: string, config: any){
	log("create", name);
	return dockerReq<DockerCreateResult>(
		"POST",
		"/containers/create",
		{ name },
		config
	)
}

export function rm(...containers: string[]) {
	return parallel(Infinity)(containers.map(rmContainer));
}

type PsFilters = {
	ancestor?: string
}
type PsProps = {
	all?: boolean,
	filters?: PsFilters
}
export type Container = {
	Id: string
}
export function ps({ all, filters }: PsProps = {}){
	const filtersStr = JSON.stringify(filters);

	return dockerReq<Container[]>(
		"GET",
		'/containers/json',
		{ all, filters: filtersStr }
	);
}

