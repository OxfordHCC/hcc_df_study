import test from 'tape';
import {
	Game,
	startGame,
	answerGame,
	getRoundsLen,
	setPlayerReady
} from '../src/lib/game';
import { deepClone } from 'dfs-common';


function createFoobarGame(){
	return new Game({
		gameId: "foobar",
		players: ["kate", "pete"],
		msRoundLength: 100,
	});
}

test('startTime is set in game state once started', (t) => {
	const game = createFoobarGame();
	
	startGame(game);
	t.equal(("startTime" in game.state), true);

	t.end();
});

test("answering correctly should return true", (t) => {
	const game = createFoobarGame();
	startGame(game);
	// answer games with correct answers
	const a1 = answerGame(game, 0, game.state.rounds[0].task.correctOption);
	// should return true (i.e. answer is correct)
	t.equal(a1, true);

	t.end();
});

test("answering incorrectly should return false", (t) => {
	const game = createFoobarGame();
	startGame(game);
	// answer games with incorrect answer
	const a1 = answerGame(game, 0, game.state.rounds[0].task.correctOption-1);
	// should return false (i.e. answer is incorrect)
	t.equal(a1, false);

	t.end();
});

test("rounds should be added to game state and updated when answers are given", (t) => {
	const game = createFoobarGame();

	startGame(game);
	// answer games
	answerGame(game, 0, 0);
	answerGame(game, 1, 0);

	// at this point we should have 3 rounds in memory
	t.equal(game.state.rounds.length, 3);

	// 2 of these 3 should have a an answer
	t.equal((game.state.rounds.filter(r => r.answer !== undefined)).length, 2);

	t.end();
});

test("answering rounds in succession should work?", (t) => {
	const game = createFoobarGame();
	const roundsLen = getRoundsLen(game);
	startGame(game);
	t.timeoutAfter(1000); // should not take more than a second

	for (let i = 0; i < roundsLen; i++) {
		answerGame(game, i, 1);
	}
	t.equal(game.state.rounds.length, roundsLen);

	t.end();
});

test("answering rounds after last round should not change state", (t) => {
	const game = createFoobarGame();
	startGame(game);

	for (let i = 0; i < 10; i++) {
		answerGame(game, i, 1);
	}
	const before = deepClone(game.state);
	answerGame(game, 11, 1);
	const after = deepClone(game.state);
	
	t.deepEqual(before, after);
	t.end();
});

test("answering round in the past should not change state", (t) => {
	const game = createFoobarGame();
	startGame(game);
	
	answerGame(game, 0, 1);
	const before = deepClone(game.state);
	answerGame(game, 0, 2);
	const after = deepClone(game.state);
	t.deepEquals(before, after);

	t.end();
});

test("amswering round before game started should throw error", (t) => {
	const game = createFoobarGame();

	const err = answerGame(game, 0, 1);
	t.equals(err instanceof Error, true);

	t.end();
});

test("game triggers events", (t) => {
	const game = createFoobarGame();
	const roundsLen = getRoundsLen(game);
	
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
	
	startGame(game);
	t.equal(startCalled, 1);
	answerGame(game, 0, 1);
	// bad answer calls should not trigger events
	answerGame(game, 0, 1); // violates immutability of round[0]'s answer
	answerGame(game, 1, 1); 
	t.equal(answerCalled, 2);
	t.equal(stopCalled, 0);
	t.equal(roundCalled, 3);
	t.equal(stateCalled, 6);


	setTimeout(() => {
		t.equal(stopCalled, 1);
		t.end();
	}, game.state.msRoundLength * roundsLen + 10);
});

test("game only starts when both players are ready", (t) => {
	const game = createFoobarGame();
	t.equals(game.state.startTime, undefined);

	setPlayerReady(game, "pete", true);
	t.equals(game.state.startTime, undefined);

	setPlayerReady(game, "pete", false);
	t.equals(game.state.startTime, undefined);

	setPlayerReady(game, "kate", true);
	t.equals(game.state.startTime, undefined);

	setPlayerReady(game, "pete", true);
	t.notEquals(game.state.startTime, undefined);

	t.end();
});

