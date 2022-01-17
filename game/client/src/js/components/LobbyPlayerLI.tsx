import React from 'react';
import { Player } from 'dfs-common';

type LobbyPlayerLIParams = {
	player: Player
}
export function LobbyPlayerLI({ player }: LobbyPlayerLIParams): JSX.Element{
	return (
		<div>
			<span>{player.playerId}</span>:<span>{(player.ready)? "R":"N"}</span>
		</div>
	);
}
