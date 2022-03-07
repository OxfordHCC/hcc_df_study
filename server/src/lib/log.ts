
// ansi escape codes for foreground colors
enum LogColor {
	Red = "31",
	Default = "39"
}

function ansiColor(color: LogColor, txt:string): string{
	const startSeq = `\u001b[${color}m`;
	const endSeq = '\u001b[39m';
	return `${startSeq}${txt}${endSeq}`;
}

function logJoin(args: any[]): string{
	return args.join(':');
}

type LogArg = string | number;


function stringifyArgs(args: LogArg[]){
	return args.map(arg => arg.toString());
}

export function Logger(namespace: string) {
	function formatMessage(
		levelLabel: string,
		color: LogColor,
		args: string[]
	): string {
		const timestamp = Date.now();
		return ansiColor(
			color,
			logJoin([levelLabel, timestamp, namespace, ...args]));
	}

	function log(...args: LogArg[]) {
		const strArgs = stringifyArgs(args);
		console.log(formatMessage("I", LogColor.Default, strArgs));
	}

	function error(...args: LogArg[]){
		const strArgs = stringifyArgs(args);
		console.error(formatMessage("E", LogColor.Red, strArgs));
	}

	return { error, log };
}
