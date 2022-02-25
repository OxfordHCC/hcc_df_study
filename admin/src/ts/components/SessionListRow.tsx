import React from 'react';
import { Session } from 'dfs-common';

type SessionListRowProps = {
	session: Session
}
export function SessionListRow({ session }: SessionListRowProps){
	return (
		<tr>
			<td>{session.sessionId}</td>
			<td>{session.blueParticipant}</td>
			<td>{session.redParticipant}</td>
		</tr>
	);
}


