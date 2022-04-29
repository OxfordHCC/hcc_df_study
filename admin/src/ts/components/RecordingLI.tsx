import React, {useState, useEffect} from 'react';
import { RecFile } from 'dfs-common';

type RecordingLIProps = {
	recFile: RecFile
}

export function RecordingLI({ recFile }: RecordingLIProps){
	const [progress, setProgress] = useState(0);
	
	return (
		<div>
			<div>{recFile.name}</div>
			<div>
				<button>play/pause</button>
				<span>{progress}</span>
			</div>
		</div>
	)
}
