
export function goto(routeName: string, params: object = {}){
	const paramString = JSON.stringify(params);
	const hashString = [routeName, paramString].join("?");
	window.location.hash = hashString;
}
