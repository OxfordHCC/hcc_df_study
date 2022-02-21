import test from 'tape';
import path from 'path';
import { readFileSync } from 'fs';
import { createSession } from '../src/lib/session';
import * as docker from '../src/lib/dockerlib';
import { getGame, getGames } from '../src/lib/game';
import { withDb } from '../src/lib/db';

const initSQLFile = path.resolve(__dirname, '../db/init.sql');
const initSQL = readFileSync(initSQLFile, "utf8");

async function resetDb() {
	await withDb<void>(
		db => new Promise((resolve, reject) => 
			db.exec(initSQL, err =>
				err && reject(err) || resolve(null)
			)
		)
	);
}

async function resetContainers() {
	const murmurContainers = await docker.ps({
		all: true,
		filters: {
			ancestor: "mumble_server"
		}
	});

	if(murmurContainers instanceof Error){
		throw murmurContainers;
	}

	const cids = murmurContainers.map(c => c.Id)
	await docker.stop(...cids);
	await docker.rm(...cids);
}

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
	t.end();
});

test("session should fail when already existing player is passed as param", async (t) => {
	t.teardown(resetDb);
	t.teardown(resetContainers);
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
		blueParticipant: "player_blue",
		redParticipant: "player_red"
	});

	t.assert(grpcConflict instanceof Error, "createSession with grpcPort conflict should result in an error");

	const murmurConflict = await createSession({
		grpcPort: 3005,
		murmurPort: 3002,
		blueParticipant: "player_blue",
		redParticipant: "player_red"
	});

	t.assert(murmurConflict instanceof Error, "createSession with murmurPort conflict should result in an error");
});

test("conflicts should not result in partial failures", async (t) => {
	t.teardown(resetDb);
	t.teardown(resetContainers);

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

	t.end();
});
