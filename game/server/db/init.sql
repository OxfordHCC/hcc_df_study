DROP TABLE IF EXISTS study_session;
CREATE TABLE study_session (
  session_id INTEGER PRIMARY KEY,
  game_id TEXT UNIQUE,
  murmur_id TEXT UNIQUE,
  blue_participant TEXT UNIQUE,
  red_participant TEXT UNIQUE
);

DROP TABLE IF EXISTS game_schedule;
CREATE TABLE game_schedule (
  game_schedule_id INTEGER PRIMARY KEY,
  game_schedule_data TEXT
);

DROP TABLE IF EXISTS game;
CREATE TABLE game (
  game_id INTEGER PRIMARY KEY,
  game_data TEXT
);

CREATE TABLE murmur_container (
  murmur_id INTEGER PRIMARY KEY,
  grpc_port INTEGER UNIQUE,
  murmur_port INTEGER UNIQUE
);
