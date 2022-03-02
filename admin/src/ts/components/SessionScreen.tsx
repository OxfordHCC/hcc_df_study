import React, {useState} from 'react';
import { Session } from 'dfs-common';
import styled from 'styled-components';
import { Loading } from './Loading';
import { deleteSession } from '../lib/session';


type SessionScreenProps = Pick<Session, "sessionId">;
type SessionScreenState = {
	session?: Session,
	loading: boolean
}

export function SessionScreen({ sessionId }: SessionScreenProps) {
	const [ screenState, setScreenState ] = useState<SessionScreenState>({loading: true});
	const { session, loading } = screenState;

	function onDelete(){
		if(session === undefined){
			return;
		}
		
		deleteSession(session.sessionId);
	}

	if (loading) {
		return <Loading />;
	}

	if(session === undefined){
		return <>Session not found</>;
	}

	return (
		<>
			<PlayerContainer>
				Blue: {session.blueParticipant}
				Red: {session.redParticipant}
			</PlayerContainer>

			<button onClick={onDelete}>Delete session</button>
		</>
	);
}


const PlayerContainer = styled.div``;
