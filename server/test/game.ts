import test from 'tape';
import { deepClone } from 'dfs-common';
import { resetGames } from './teardowns';
import {
	Game,
} from '../src/lib/game';
import { createPlayer } from '../src/lib/player';
import { ButtonRound, KeypadRound } from '../src/lib/round';


function createButtonGame(id: string, blue: string, red: string){
	const rounds = [
		new ButtonRound(0, 10),
		new ButtonRound(1, 10),
		new ButtonRound(2, 10),
		new ButtonRound(3, 10),
	];
	
	return new Game({
		gameId: id,
		players: [
			createPlayer(blue),
			createPlayer(red)
		],
		rounds
	});
}

function createFoobarGame(){
	return createButtonGame("foobar", "pete", "kate");
}

function createGameSequence() {
	const msLength = 10;
	const rounds = [
		new KeypadRound([4,3,2,1]),
		new KeypadRound([4,3,2,1])
	];
}

test('startTime is set in game state once started', (t) => {
	t.teardown(resetGames);
	const game = createFoobarGame();
	game.start();
	t.equal(("startTime" in game), true);

	t.end();
});

test("answering correctly should return +1", (t) => {
	t.teardown(resetGames);
	const game = createFoobarGame();
	game.start();
	
	// answer games with correct answers
	const a1 = game.answer({ value: 0, round: 0 });
	
	// should return 1 (i.e. answer is correct)
	t.equal(a1, 1);

	t.end();
});

test("answering incorrectly should return -1", (t) => {
	t.teardown(resetGames);
	const game = createFoobarGame();
	game.start();

	// answer games with incorrect answer
	const a1 = game.answer({ value: -1, round: 0 });
	
	// should return -1 (i.e. answer is incorrect)
	t.equal(a1, -1);

	t.end();
});

test("answering rounds after last round should not change state", (t) => {
	t.teardown(resetGames);
	const game = createFoobarGame();
	game.start();

	for (let i = 0; i < 10; i++) {
		game.answer({ round: i, value: 1 });
	}
	
	const before = deepClone(game);
	game.answer({round: 11, value: 1});
	const after = deepClone(game);
	
	t.deepEqual(before, after);
	t.end();
});

test("answering round in the past should not change state", (t) => {
	t.teardown(resetGames);
	const game = createFoobarGame();
	game.start();
	
	game.answer({ round: 0, value: 1 });
	const before = deepClone(game);
	
	game.answer({ round: 0, value: 2 });
	const after = deepClone(game);
	
	t.deepEquals(before, after);
	t.end();
});

test("answering round before game started should throw error", (t) => {
	t.teardown(resetGames);
	const game = createFoobarGame();

	const err = game.answer({ round: 0, value: 1 });
	t.equals(err instanceof Error, true);

	t.end();
});

test("answering in a valid manner should return numbers", (t) => {
	t.teardown(resetGames);
	const game = createFoobarGame();
	game.start();
	
	const r0 = game.answer({round: 0, value: 0});
	t.assert(typeof r0 === "number", "typeof value returned from answer 0 should be number." + r0);

	const r1 = game.answer({round: 1, value: 1});
	t.assert(typeof r1 === "number", "typeof value returned from answer 1 should be number." + r1);

	const r2 = game.answer({ round: 2, value: 2 });
	t.assert(typeof r2 === "number", "typeof value returned from answer 2 should be number." + r2);

	const r3 = game.answer({ round: 3, value: 3 });
	t.assert(typeof r3 === "number", "typeof value returned from answer 3 should be number." + r3);

	t.end();

});

test("game triggers events", (t) => {
	t.teardown(resetGames);
	const game = createFoobarGame();
	const totalGameLen = game.rounds.reduce(
		(acc, curr) => acc + curr.msLength
		, 0);
	
	let startCalled = 0;
	let answerCalled = 0;
	let stopCalled = 0;
	let roundCalled = 0;
	let stateCalled = 0;
	
	game.on("start", () => {
		startCalled +=1;
	});
	
	game.on("answer",() => {
		answerCalled += 1;
	});
	
	game.on("stop", () => {
		stopCalled += 1;
	});

	game.on("round", () => {
		roundCalled += 1;
	});

	game.on("state", () => {
		stateCalled += 1;
	});
	
	game.start()
	t.equal(startCalled, 1);
	
	game.answer({ round: 0, value: 1 });
	// bad answer calls should not trigger events
	
	game.answer({ round: 0, value: 1 }); // violates immutability of round[0]'s answer
		
	game.answer({ round: 1, value: 1 }); 

	t.equal(answerCalled, 2, "answer event");
	t.equal(stopCalled, 0, "stop event");
	t.equal(roundCalled, 3, "round event");
	t.equal(stateCalled, 6, "state event");
	
	setTimeout(() => {
		t.equal(stopCalled, 1, "stop not triggered");
		t.end();
	}, totalGameLen + 10);
});

test("game only starts when both players are ready", (t) => {
	t.teardown(resetGames);
	t.plan(5);

	const game = createFoobarGame();
	t.equals(game.startTime, undefined);

	game.playerReady("pete", true);
	t.equals(game.startTime, undefined);

	game.playerReady("pete", false);
	t.equals(game.startTime, undefined);

	game.playerReady("kate", true);
	t.equals(game.startTime, undefined);

	game.playerReady("pete", true);
	setTimeout(() => {
		t.notEquals(game.startTime, undefined);
	}, 1000);

});
