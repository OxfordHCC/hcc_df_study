import React from 'react';
import { useState, useEffect, useMemo } from 'react';

type ClockParams = {
	start: number,
	length: number
}

export function Clock({ start, length }: ClockParams){
	const [display, setDisplay] = useState<string>("");
	const end = useMemo(() => start + length, [start, length]);
	const width = useMemo(() => (Math.floor((length / 1000) / 10)), []);
	console.log("width is ", width);

	useEffect(() => {
		const interval = setInterval(() => {
			const msLeft = Math.max(end - Date.now(), 0);
			if(msLeft === 0){
				clearInterval(interval);
			}
			const timeLeft = Math.ceil(msLeft/1000).toString().padStart(width, "0");
			setDisplay(`${timeLeft}s`);
		}, 500);
		
		return () => clearInterval(interval);
	}, []);

	return <>
		{display}
	</>;
}

