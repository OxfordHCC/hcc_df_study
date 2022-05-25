
export type Equation = {
	label: string;
	options: string[];
	answer: string;
};
const equations: Equation[] = [
	{
		label: "The Kray Twins notoriously murdered a rival gang associate in which pub in Whitechapel?",
		options: ["The Blind Beggar", "The White Hart", "Good Samaritan"],
		answer: "The Blind Beggar"
	},
	{
		label: "A rock festival was held in 1970 with over 600,000 attendands on which island?",
		options: ["Isle of Man", "Isle of Wight", "Jersey"],
		answer: "Isle of Wight"
	},
	{
		label: "Which Henry Lyte's Christian hymn is sung prior to kick-off at every FA Cup Final, a tradition since 1927?",
		options: ["Vindaloo", "God Save the Queen", "Abide with me"],
		answer: "Abide with me"
	},
	{
		label: "7 * 16",
		options: ["102", "112", "122"],
		answer: "112"
	},
	{
		label: "Who is the only person to have won BAFTAs for programmes in each of black and white, colour, HD, and 3D?",
		options: ["David Attenborough", "Benedict Cumberbatch", "Idris Elba"],
		answer: "David Attenborough"
	},
	{
		label: "How many feet in 1 mile?",
		options: ["5280", "1000", "100"],
		answer: "5280"
	},
	{
		label: "4 * 7",
		options: ["28", "24", "32"],
		answer: "28"
	},
	{
		label: "If you were driving in Denmark and saw a sign saying “Fartkontrol”, what is it telling you of?",
		options: ["Speed camera", "Border check", "Highway rest area"],
		answer: "Speed camera"
	},
	{
		label: "8 + 54",
		options: ["62", "66", "72"],
		answer: "62"
	},
	{
		label: "21 + 71",
		options: ["92", "104", "94"],
		answer: "92"
	},
	{
		label: "11 - 5",
		options: ["5", "6", "7"],
		answer: "6"
	},
	{
		label: "6 * 7",
		options: ["30", "36", "35"],
		answer: "42"
	},
	{
		label: "25 - 7",
		options: ["16", "17", "18"],
		answer: "18"
	},
	{
		label: "1, 1, 2, 3, 5, 8, ?",
		options: ["11", "12", "13"],
		answer: "13"
	},
	{
		label: "The Undertaker threw mankind off hеll in a cell, and plummeted sixteen feet through an announcer's table set in which year?",
		options: ["1998", "1991", "1993"],
		answer: "1998"
	},
];

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
	const x = pickRandom(unseen);
	seen.push(x);
	return x;
}
