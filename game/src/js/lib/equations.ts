import { RoundData } from 'dfs-common';


export type Equation = {
	label: string;
	options: string[];
	answer: string;
};

// !! IMPORTANT: Make sure the number of equations in this array is
// greater than or equal to the number of rounds in the game. The
// number of rounds in a game is determined on the server.
const equations: Equation[] = [
	{
		label: "What is the capital city of England?",
		options: ["London", "Shenzhen", "Venice"],
		answer: "London"
	},
	{
		label: "8 + 54 = ?",
		options: ["62", "66", "72"],
		answer: "62"
	},
	{
		label: "How many weeks in a year?",
		options: ["52", "100", "45"],
		answer: "52"
	},
	{
		label: "How many legs does a Octopus have?",
		options: ["7", "10", "8"],
		answer: "8"
	},
	{
		label: "Which of these is a famous landmark in London?",
		options: ["Berlin Wall", "Eiffel Tower", "Big Ben"],
		answer: "Big Ben"
	},
	{
		label: "How many meters in 1 kilometer?",
		options: ["100", "1000", "10"],
		answer: "1000"
	},
	{
		label: "4 * 7 = ?",
		options: ["28", "24", "32"],
		answer: "28"
	},
	{
		label: "Which of these is a Pokemon?",
		options: ["Giant African Snail", "Pikachu", "Stegosaurus"],
		answer: "Pikachu"
	},
	{
		label: "21 + 71 = ?",
		options: ["92", "104", "94"],
		answer: "92"
	},
	{
		label: "11 - 5 = ?",
		options: ["5", "6", "7"],
		answer: "6"
	},
	{
		label: "6 * 7 = ?",
		options: ["42", "36", "35"],
		answer: "42"
	},
	{
		label: "25 - 7 = ?",
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
		options: ["Honey", "Cotton", "Silk"],
		answer: "Honey"
	},
	{
		label: "Which is the fastest land animal?",
		options: ["Hare", "Whippet", "Cheetah"],
		answer: "Cheetah"
	},
	{
		label: "Who built the pyramids of Giza?",
		options: ["Egyptians", "Romans", "Huns"],
		answer: "Egyptians"
	},
	{
		label: "Which country has the largest land mass?",
		options: ["Russia", "France", "Spain"],
		answer: "Russia"
	},
	{
		label: "What is the largest mammal in the world?",
		options: ["Hippopotamus", "Blue Whale", "Polar Bear"],
		answer: "Blue Whale"
	},
	{
		label: "In which European City would you find Buckingham Palace?",
		options: ["London", "Prague", "Rome"],
		answer: "London"
	},
];

const tutorialEquations: Equation[] = [
	{
		label: "2 * 3",
		options: ["12", "6", "4"],
		answer: "6"
	},
	{
		label: "Which of these is the oldest University in the world?",
		options: ["University of Bologna", "University of Oxford", "University of Cambridge"],
		answer: "University of Bologna"
	},
	{
		label: "Which of these is a former president of the United States?",
		options: ["Donald Trump", "Elon Musk", "Kanye West"],
		answer: "Donald Trump"
	},
	{
		label: "What kind of creature is Shrek?",
		options: ["Ogre", "Cat", "Donkey"],
		answer: "Ogre"
	},
	{
		label: "In the popular Super Mario video game series, what is the name of Mario's brother?",
		options: ["Luigi", "Letizia", "Lorenzo"],
		answer: "Luigi"
	}
];

function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem(arr: Equation[]): Equation{
	return arr[ getRandomInt(0, arr.length) % arr.length ];
}

export function getEquation(round: number, roundData: RoundData){
	if(roundData.name === "tutorial-button"){
		return randomItem(tutorialEquations);
	}
	
	return equations[round];
}
