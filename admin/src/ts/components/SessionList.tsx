import React from 'react';
import styled from 'styled-components';
import { Session } from 'dfs-common';
import { SessionListRow } from './SessionListRow';
import { Loading } from './Loading';
import { goto } from '../lib/router';

type SessionListProps = {
	sessions: Session[]
	loading: boolean
}
export function SessionList({ sessions, loading }: SessionListProps) {
	if(loading === true){
		return <Loading/>;
	}

	if(sessions.length === 0){
		return <div>No sessions</div>
	}
	
	return (
		<Gtable>
			<Gthead>
				<tr>
					<th>Session Id</th>
					<th>Blue Participant</th>
					<th>Red Participant</th>
					<th>Murmur Port</th>
					<th>GRPC Port</th>
				</tr>
			</Gthead>
			<tbody>
				{
					sessions.map(sesh =>
						<SessionListRow onClick={() => goto("#session", { sessionId: sesh.sessionId })} key={sesh.sessionId} session={sesh} />)
				}
			</tbody>
		</Gtable>
	);
}

const Gtable = styled.table`
	border: 1px solid pink;
	width: 100%;
	text-align: center;
	border-collapse: collapse;
	
	tbody tr:nth-child(odd) {
	  background-color: #ff33cc;
	}

	tbody tr:nth-child(even) {
	  background-color: #e495e4;
	}
	
	th, td{
	  padding: 10px;
	}
`;

const Gthead = styled.thead`

`;

