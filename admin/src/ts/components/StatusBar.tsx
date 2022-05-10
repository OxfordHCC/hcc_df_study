import React from 'react';
import { onError, offError } from '../lib/globalerr';
import { useState, useEffect } from 'react';

export function StatusBar() {
	const [warning, setWarning] = useState<string>("");

	useEffect(() => {
		let warnTimeout: NodeJS.Timeout;

		const onErrorCb = function(err: Error) {
			setWarning(err.message);
			clearTimeout(warnTimeout);
			warnTimeout = setTimeout(() => {
				setWarning("");
			}, 5000);
		}

		onError(onErrorCb);

		return () => {
			offError(onErrorCb);
			clearTimeout(warnTimeout);
		}
	}, []);

	return <div>
		<div>
			{warning}
		</div>
	</div>
}
