import React from 'react';
import { onGame, offGame } from '../lib/game';
import { useState, useEffect } from 'react';

export function StatusBar() {
	const [warning, setWarning] = useState<string>("");

	useEffect(() => {
		let warnTimeout: NodeJS.Timeout;

		const onError = function(err) {
			setWarning(err.message);
			clearTimeout(warnTimeout);
			warnTimeout = setTimeout(() => {
				setWarning("");
			}, 5000);
		}

		onGame("error", onError);

		return () => {
			offGame("error", onError);
			clearTimeout(warnTimeout);
		}
	}, [])

	return <div>
		<div>
			{warning}
		</div>
	</div>
}
