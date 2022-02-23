import test from 'tape';
import { createSession, getSessions } from '../src/lib/session';
import * as docker from '../src/lib/dockerlib';
import { getGame, getGames } from '../src/lib/game';
import { resetDb, resetContainers, resetGames } from './teardowns';


test("resetting db", async (t) => {
	await resetDb();
	t.end();
});

test("resetting murmur containers", async (t) => {
	await resetContainers();
	t.end();
});

test("creating session should create a murmur container and a game room", async (t) => {
	t.teardown(resetDb);
	t.teardown(resetContainers);
	t.teardown(resetGames);
	t.plan(1);
	
	const session = await createSession({
		grpcPort: 3002,
		murmurPort: 3001,
		blueParticipant: "player_blue",
		redParticipant: "player_red"
	});

	if(session instanceof Error){
		t.fail(`Creating session returned error: ${session.message}`);
		return;
	}
	
	const containers = await docker.ps();
	if(containers instanceof Error){
		t.fail(`Retrieving docker containers failed: ${containers.message}`);
		return;
	}
	
	const game = getGame(session.gameId);
	if(game instanceof Error){
		t.fail(`Retrieving game returned error: ${game.message}`);
		return;
	}
		
	t.assert(containers.find(c => c.Id === session.murmurId) !== undefined, "container found");
});

test("creating two sessions with different params, should succeed", async (t) => {
	t.teardown(resetDb);
	t.teardown(resetContainers);
	t.teardown(resetGames);
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

	t.isEqual(session2 instanceof Error, false,	"second session creation should not result in error");
});

test("session should fail when already existing player is passed as param", async (t) => {
	t.teardown(resetDb);
	t.teardown(resetContainers);
	t.teardown(resetGames);
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
	});

	t.assert(res instanceof Error, "createSession result should be an error");
});

test("session should fail when port is in use", async (t) => {
	t.teardown(resetDb);
	t.teardown(resetContainers);
	t.teardown(resetGames);
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
	t.teardown(resetDb);
	t.teardown(resetContainers);
	t.teardown(resetGames);
	t.plan(2);

	const gamesBefore = getGames();
	const lenBefore = gamesBefore.length;
	const containersBefore = await docker.ps({
		all: true,
		filters: {
			ancestor: "mumble_server"
		}
	});
	
	if(containersBefore instanceof Error){
		t.fail("docker ps should not return error");
		return;
	}

	const lenContainersBefore = containersBefore.length;

	await createSession({
		grpcPort: 3001,
		murmurPort: 3002,
		blueParticipant: "player_blue",
		redParticipant: "player_red"
	});

	await createSession({
		grpcPort: 3001,
		murmurPort: 3002,
		blueParticipant: "player_blue",
		redParticipant: "player_red"
	});

	const gamesAfter = getGames();
	const lenAfter = gamesAfter.length;

	const containersAfter = await docker.ps({
		all: true,
		filters: {
			ancestor: "mumble_server"
		}
	});

	if(containersAfter instanceof Error){
		t.fail("docker ps should not return error");
		return;
	}
	
	const lenContainersAfter = containersAfter.length;

	t.assert(lenBefore === lenAfter);
	t.assert(lenContainersBefore === lenContainersAfter);
});
