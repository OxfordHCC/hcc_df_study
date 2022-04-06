import React from 'react';
import { RecFile } from 'dfs-common';


type RecordingListProps = {
	recordings: RecFile[]
}

export function RecordingList({ recordings }: RecordingListProps) {
	return (
		<ul>
			{recordings.map(rec => <li>{rec}</li>)}
		</ul>
	)
}
