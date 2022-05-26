
export type Equation = {
	label: string;
	options: string[];
	answer: string;
};
const equations: Equation[] = [
	{
		label: "What is the capital city of England?",
		options: ["London", "Shenzhen", "Venice"],
		answer: "London"
	},
	{
		label: "How many weeks in a year?",
		options: ["52", "100", "1000"],
		answer: "52"
	},
	{
		label: "How many legs does a Octopus have?",
		options: ["12", "24", "8"],
		answer: "8"
	},
	{
		label: "7 * 16",
		options: ["102", "112", "122"],
		answer: "112"
	},
	{
		label: "If you freeze water, what do you get?",
		options: ["Lava", "Emeralds", "Ice"],
		answer: "Ice"
	},
	{
		label: "How many meters in 1 kilomile?",
		options: ["5280", "1000", "10"],
		answer: "1000"
	},
	{
		label: "4 * 7",
		options: ["28", "24", "32"],
		answer: "28"
	},
	{
		label: "What do caterpillars turn into?",
		options: ["Chickens", "Butterflies", "Elephants"],
		answer: "Butterflies"
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
		options: ["42", "36", "35"],
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
		label: "What colour are London buses?",
		options: ["Red", "Black", "White"],
		answer: "Red"
	},
	{
		label: "What do bees make?",
		options: ["Honey", "Pasta", "Soup"],
		answer: "Honey"
	},
	{
		label: "Which is the fastest land animal?",
		options: ["Snail", "Salmon", "Cheetah"],
		answer: "Cheetah"
	},
	{
		label: "Who built the pyramids?",
		options: ["The Egyptians", "The Avengers", "Microsoft"],
		answer: "The Egyptians"
	},
	{
		label: "How many sides does a triangle have?",
		options: ["6", "12", "3"],
		answer: "3"
	},
	{
		label: "What is the largest mammal in the world?",
		options: ["Human", "Whale", "Shark"],
		answer: "Whale"
	},
	{
		label: "In which capital city of Europe would you find the Eiffel Tower?",
		options: ["London", "New York", "Paris"],
		answer: "Paris"
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
