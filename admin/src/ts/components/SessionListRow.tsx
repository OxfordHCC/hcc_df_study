import React from 'react';
import { Session } from 'dfs-common';

type SessionListRowProps = {
	session: Session
}
export function SessionListRow({ session }: SessionListRowProps){
	console.log(session);
	
	return (
		<tr>
			<td>{session.sessionId}</td>
			<td>{session.blueParticipant}</td>
			<td>{session.redParticipant}</td>
			<td>{session.murmurPort}</td>
			<td>{session.grpcPort}</td>
		</tr>
	);
}


