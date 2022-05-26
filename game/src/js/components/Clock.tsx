import React from 'react';
import { useState, useEffect, useMemo } from 'react';

type ClockParams = {
	start?: number,
	length: number,
	onUpdate?: (a: string) => void
}

function formatClockString(width: number, msLeft: number){
	const timeLeft = Math
		.ceil(msLeft / 1000)
		.toString()
		.padStart(width, "0");

	return `${timeLeft}s`;
}

export function Clock({ onUpdate, start = 0, length }: ClockParams) {
	const width = useMemo(() =>	Math.log10(Math.floor(length / 1000)), []);
	const [display, setDisplay] = useState<string>(
		formatClockString(width, length));
	const end = useMemo(() => start + length, [start, length]);

	useEffect(() => {
		const interval = setInterval(() => {
			const msLeft = Math.max(end - Date.now(), 0);
			if(msLeft === 0){
				clearInterval(interval);
			}

			const clockValue = formatClockString(width, msLeft);
			setDisplay(clockValue);
			if(onUpdate !== undefined){
				onUpdate(clockValue);
			}
		}, 500);
		
		return () => clearInterval(interval);
	}, [end, width]);

	return (
		<span>

		</span>
	);
}
