import { Player } from 'dfs-common';


export function createPlayer(data: Player | string): Player{
	if(typeof data === "string"){
		return createPlayer({ playerId: data, ready: false});
	}
	
	return data;
}
