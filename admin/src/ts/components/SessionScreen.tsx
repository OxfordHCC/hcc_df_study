import React, { useEffect, useState } from 'react';
import { Session, RecFile } from 'dfs-common';
import styled from 'styled-components';
import { Loading } from './Loading';
import { deleteSession,
		 getSessionData,
		 getSessionRecordings
} from '../lib/session';
import { RecordingList } from './RecordingList';


type SessionScreenProps = Pick<Session, "sessionId">;
type SessionScreenState = {
	session?: Session,
	loading: boolean,
	recordings: RecFile[]
}

export function SessionScreen({ sessionId }: SessionScreenProps) {
	const [ screenState, setScreenState ] = useState<SessionScreenState>({ loading: true, recordings: [] });
	const { session, loading } = screenState;

	useEffect(() => {
		let unloaded = false;
		
		async function populateSessionData(){
			const session = await getSessionData(sessionId);
			
			if(unloaded){
				return;
			}

			setScreenState(previous => ({
				...previous,
				loading: false,
				session
			}));
			
			console.log("set screen state in study meta");
		}

		async function populateRecordings() {
			const recordings = await getSessionRecordings(sessionId);

			if(unloaded){
				return;
			}

			setScreenState(previous => ({
				...previous,
				loading: false,
				recordings
			}));

			console.log('set screen state in records');
		}

		populateRecordings();
		populateSessionData();

		return () => {
			unloaded = true;
		}

	}, [sessionId]);

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
				<div>Blue: {session.blueParticipant}</div>
				<div>Red: {session.redParticipant}</div>
			</PlayerContainer>

			<RecordingList recordings={screenState.recordings}/>

			<button onClick={onDelete}>Delete session</button>
		</>
	);
}


const PlayerContainer = styled.div``;
