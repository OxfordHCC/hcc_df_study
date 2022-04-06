import React from 'react';
import { Session } from 'dfs-common';

type SessionListRowProps = {
	session: Session,
	onClick: () => void
}
export function SessionListRow({ session, onClick }: SessionListRowProps){
	console.log(session);
	
	return (
		<tr onClick={onClick}>
			<td>{session.sessionId}</td>
			<td>{session.blueParticipant}</td>
			<td>{session.redParticipant}</td>
			<td>{session.murmurPort}</td>
			<td>{session.grpcPort}</td>
		</tr>
	);
}


