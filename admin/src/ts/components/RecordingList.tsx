import React from 'react';
import { RecFile } from 'dfs-common';

import { RecordingLI } from './RecordingLI';

type RecordingListProps = {
	recordings: RecFile[]
}

export function RecordingList({ recordings }: RecordingListProps) {
	return (
		<ul>
			{ recordings.map(rec => <RecordingLI key={rec.name} recFile={rec}/>) }
		</ul>
	)
}
