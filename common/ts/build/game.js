"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isGameData = exports.isPlayer = void 0;
const round_1 = require("./round");
function isPlayer(x) {
    return typeof x.playerId === "string"
        && typeof x.ready === "boolean";
}
exports.isPlayer = isPlayer;
function isGameData(x) {
    return x.players !== undefined && Array.isArray(x.players) && x.players.every(isPlayer)
        && typeof x.gameId === "string"
        && x.rounds.every(round_1.isRoundData)
        && typeof x.currentRound === "number"
        && (x.startTime === undefined || typeof x.startTime === "number")
        && (x.endTine === undefined || typeof x.endTime === "number");
}
exports.isGameData = isGameData;
