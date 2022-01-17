
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

	function log(...args: string[]) {
		console.log(formatMessage("I", LogColor.Default, args));
	}

	function error(...args: string[]){
		console.error(formatMessage("E", LogColor.Red, args));
	}

	return { error, log };
}
