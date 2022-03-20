import test from 'tape';
import { isError, joinErrors } from 'dfs-common';
import { createSession, getCurrentGame } from '../src/lib/session';
import * as docker from '../src/lib/dockerlib';
import { getGame, isGame, getGames, Game, getSessionGames } from '../src/lib/game';
import { resetDb, resetContainers, resetGames } from './teardowns';

test("creating session should create a murmur container", async (t) => {
	await resetDb();
	await resetGames();
	await resetContainers();
	t.plan(1);

	const session = await createSession({
		grpcPort: 3002,
		murmurPort: 3001,
		blueParticipant: "player_blue",
		redParticipant: "player_red"
	});

	if (session instanceof Error) {
		t.fail(`Creating session returned error: ${session.message}`);
		return;
	}

	const containers = await docker.ps();
	if (containers instanceof Error) {
		t.fail(`Retrieving docker containers failed: ${containers.message}`);
		return;
	}

	t.assert(containers.find(c => c.Id === session.murmurId) !== undefined, "container found");
});

test("creating a session should result in 2 games being inserted in the database", async (t) => {
	await resetDb();
	await resetGames();
	await resetContainers();
	t.plan(1);


	const session = await createSession({
		blueParticipant: "blue",
		redParticipant: "red",
		murmurPort: 3001,
		grpcPort: 5001
	});

	if (session instanceof Error) {
		t.fail(session.message);
		return;
	}

	const gameRows = await getSessionGames(session.sessionId);
	if (gameRows instanceof Error) {
		t.fail(gameRows.message);
		return;
	}

	t.equals(gameRows.length, 2, "length of sessionGames array");
});

test("creating a session should result in 2 game objects being created", async (t) => {
	try {
		await resetDb();
		await resetGames();
		await resetContainers();
		t.plan(1);

		const session = await createSession({
			blueParticipant: "blue",
			redParticipant: "red",
			murmurPort: 3001,
			grpcPort: 5001
		});

		if (session instanceof Error) {
			t.fail(session.message);
			return;
		}

		const gameRows = await getSessionGames(session.sessionId);

		if (gameRows instanceof Error) {
			t.fail(gameRows.message);
			return;
		}

		const gameResults = gameRows.map(row => getGame(row.gameId));
		const errors = gameResults.filter(isError);
		if (errors.length > 0) {
			t.fail(joinErrors(errors).message);
			return;
		}

		const games = gameResults.filter(isGame);
		t.assert(games.length === 2);
	} catch (err) {
		console.log(err);
	}
});

test("creating two sessions with different params, should succeed", async (t) => {
	await resetDb();
	await resetGames();
	await resetContainers();
	t.plan(1);

	const session = await createSession({
		grpcPort: 3002,
		murmurPort: 3001,
		blueParticipant: "player_blue",
		redParticipant: "player_red"
	});
	const session2 = await createSession({
		grpcPort: 3003,
		murmurPort: 3004,
		blueParticipant: "player_orange",
		redParticipant: "player_purple"
	});

	t.isEqual(
		session2 instanceof Error,
		false,
		"second session creation should not result in error"
	);
});

test("session should fail when already existing player is passed as param", async (t) => {
	await resetDb();
	await resetGames();
	await resetContainers();
	t.plan(1);

	await createSession({
		grpcPort: 3002,
		murmurPort: 3001,
		blueParticipant: "player_blue",
		redParticipant: "player_red"
	});

	const res = await createSession({
		grpcPort: 3003,
		murmurPort: 3004,
		blueParticipant: "player_blue",
		redParticipant: "player_red"
	})

	t.assert(res instanceof Error, "createSession result should be an error");
});

test("session should fail when port is in use", async (t) => {
	await resetDb();
	await resetGames();
	await resetContainers();
	t.plan(2);

	await createSession({
		grpcPort: 3001,
		murmurPort: 3002,
		blueParticipant: "player_blue",
		redParticipant: "player_red"
	});

	const grpcConflict = await createSession({
		grpcPort: 3001,
		murmurPort: 3003,
		blueParticipant: "player_purple",
		redParticipant: "player_orange"
	});

	t.assert(grpcConflict instanceof Error, "createSession with grpcPort conflict should result in an error");

	const murmurConflict = await createSession({
		grpcPort: 3005,
		murmurPort: 3002,
		blueParticipant: "player_black",
		redParticipant: "player_white"
	});

	t.assert(murmurConflict instanceof Error, "createSession with murmurPort conflict should result in an error");
});


test("conflicts should not result in partial failures", async (t) => {
	await resetDb();
	await resetGames();
	await resetContainers();
	t.plan(2);


	await createSession({
		grpcPort: 3001,
		murmurPort: 3002,
		blueParticipant: "player_blue",
		redParticipant: "player_red"
	});

	const gamesBefore = (getGames()).length;

	const containersBefore = await docker.ps({
		all: true,
		filters: {
			ancestor: "mumble_server"
		}
	});

	if (containersBefore instanceof Error) {
		t.fail("docker ps should not return error");
		return;
	}

	const containersBeforeLen = containersBefore.length;

	await createSession({
		grpcPort: 3001,
		murmurPort: 3002,
		blueParticipant: "player_blue",
		redParticipant: "player_red"
	});

	const gamesAfter = (getGames()).length;

	const containersAfter = await docker.ps({
		all: true,
		filters: {
			ancestor: "mumble_server"
		}
	});

	if (containersAfter instanceof Error) {
		t.fail("docker ps should not return error");
		return;
	}

	const containersAfterLen = containersAfter.length;

	t.equal(gamesAfter, gamesBefore, "no game objects should be added");
	t.equal(containersAfterLen, containersBeforeLen, "no containers should be added");
});

test("game should save progress ", async (t) => {
	t.fail("not implemented");
});

test("current session game should update when game ends", async (t) => {
	await resetDb();
	await resetGames();
	await resetContainers();

	const session = await createSession({
		grpcPort: 3001,
		murmurPort: 5001,
		blueParticipant: "blue",
		redParticipant: "red"
	});

	if (session instanceof Error) {
		return t.fail(session.message);
	}

	const sessionGames = await getSessionGames(session.sessionId);
	if(sessionGames instanceof Error){
		return t.fail(sessionGames.message);
	}

	const game1Row = sessionGames.find(game => game.isCurrent === true);
	const game2Row = sessionGames.find(game => game.isCurrent === false);
	if(game1Row === undefined || game2Row === undefined){
		return t.fail("One of the games is undefined.");
	}

	const gameEithers = await Promise.all([game1Row, game2Row].map(row => getGame(row.gameId)));
	const gamesErrors = gameEithers.filter(isError);
	if(gamesErrors instanceof Error){
		return gamesErrors;
	}

	const games = gameEithers.filter(isGame);
	const [game1, game2] = games;

	const currentGame = await getCurrentGame(session.sessionId);
	if (currentGame instanceof Error) {
		t.fail(currentGame.message);
		return;
	}
	
	t.equals(currentGame.gameId, game1.gameId, "current game should be game1");
	
	game1.on('stop', async () => {
		const currentGameAfter = await getCurrentGame(session.sessionId);
		if (currentGameAfter instanceof Error) {
			return t.fail(currentGameAfter.message);
		}

		t.equal(currentGameAfter.gameId, game2.gameId, "after game1 stops, current game should be game2");
		t.end();
	});

	// answer all rounds (correctly in this case, but it doesn't matter)
	currentGame.start();
	currentGame.rounds.forEach((round, i) => {
		currentGame.answer({ round: i, value: round.solution });
	});
});

