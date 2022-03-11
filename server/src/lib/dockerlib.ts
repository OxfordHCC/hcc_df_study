import http from 'http';
import { Either } from 'dfs-common';
import { Logger } from './log';

const { log, error } = Logger("dockerlib");

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
): Promise<Either<Error, T>>{
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

function stopContainer(name: string){
	return dockerReq("POST", `/containers/${name}/stop`);
}

export async function stop(...containers: string[]){
	const promises = containers.map(stopContainer);
	return Promise.all(promises).catch(err => {
		return new Error(err);
	});
}

function rmContainer(name: string){
	return dockerReq("DELETE", `/containers/${name}`);
}

type DockerCreateResult = {
	Id: string
	Warning: unknown[]
}
export function create(name: string | undefined, config: any){
	return dockerReq<DockerCreateResult>(
		"POST",
		"/containers/create",
		{ name },
		config
	)
}

export async function rm(...containers: string[]) {
	const promises = containers.map(rmContainer);
	return Promise.all(promises).catch(err => {
		return new Error(err);
	});
}

type PsFilters = {
	ancestor?: string
}
type PsProps = {
	all?: boolean,
	filters?: PsFilters
}
type Container = {
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

