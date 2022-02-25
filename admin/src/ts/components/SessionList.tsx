import React from 'react';
import styled from 'styled-components';
import { Session } from 'dfs-common';
import { SessionListRow } from './SessionListRow';
import { Loading } from './Loading';
type SessionListProps = {
	sessions: Session[]
	loading: boolean
}
export function SessionList({ sessions, loading }: SessionListProps) {
	if(loading === true){
		return <Loading/>;
	}

	if(sessions.length === 0){
		return <div>No games</div>
	}
	
	return (
		<Gtable>
			<Gthead>
				<tr>
					<th>Game Id</th>
					<th>Start Time</th>
					<th>Current Round</th>
					<th>Blue</th>
					<th>Red</th>
				</tr>
			</Gthead>
			<tbody>
				{
					sessions.map(sesh =>
						<SessionListRow key={sesh.gameId} session={sesh}/>)
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

