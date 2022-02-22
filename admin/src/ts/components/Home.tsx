import React, {
	useEffect,
	useCallback,
	useState
} from 'react';
import { Session } from 'dfs-common';
import { goto } from '../lib/router';
import { SessionList } from './SessionList';
import { getSessions } from '../lib/session';

export function Home(){
	const [sessions, setSessions] = useState<Session[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const goToCreateSession = useCallback(() => goto("#create_pair"), []);

	useEffect(() => {
		async function fetchSessions(){
			const sessions = await getSessions();

			if (sessions instanceof Error) {
				console.error(sessions);
				// TODO: write somewhere in a banner component
				setLoading(false);
				return;
			}
			
			setSessions(sessions);
			setLoading(false);
		};

		fetchSessions();
	}, []);
	
	return (
		<div>
			<button onClick={goToCreateSession}>Create Session</button>
			<SessionList sessions={sessions} loading={loading}/>
		</div>
	);
}
