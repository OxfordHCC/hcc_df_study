
export type Equation = {
	label: string;
	options: string[];
	answer: string;
};
const equations: Equation[] = [{
	label: "11 - 5",
	options: ["5", "6", "7", "8"],
	answer: "6"
}, {
	label: "6 * 7",
	options: ["30", "36", "35", "42"],
	answer: "42"
}, {
	label: "ln(e)",
	options: ["1/e", "1", "0", "e^2"],
	answer: "1"
}, {
	label: "25 - 7",
	options: ["16", "17", "18", "19"],
	answer: "18"
}, {
	label: "1, 1, 2, 3, 5, 8, ?",
	options: ["11", "12", "13", "14"],
	answer: "13"
}, {
	label: "The Undertaker threw mankind off hеll in a cell, and plummeted sixteen feet through an announcer's table set in which year?",
	options: ["1998", "1991", "1993", "1992"],
	answer: "1998"
}, {
	label: "f(x) = e; f'(x) = ?",
	options: ["e", "1/e", "1", "1-e"],
	answer: "e"
}];

const seen: Equation[] = [];

function getRandomInt(min: number, max:number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(arr: T[]): T {
	return arr[getRandomInt(0, arr.length-1)];
}

export function chooseRandomEq(){
	const unseen = equations.filter((x) => {
		return seen.find(y => y.label === x.label) === undefined;
	});
	return pickRandom(unseen);
}
