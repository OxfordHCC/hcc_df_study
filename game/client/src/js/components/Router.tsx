import React from "react";
import {useState, useEffect } from 'react';
import { GameScreen } from './GameScreen';
import { Home } from './Home';


function parseParamString(paramString?: string): any{
	if(paramString === undefined){
		return {}
	}

	const decoded = decodeURI(paramString);	
	return JSON.parse(decoded);
}

export function Router(): JSX.Element {
	const [route, setRoute] = useState<string>("");
	const [params, setParams] = useState<any>({});
	console.log("route is", route);
	console.log("params", params);

	useEffect(() => {
		const onHashChange = function() {
			const hash = window.location.hash;
			const [path, paramString] = hash.split("?");
			
			const hashParams = parseParamString(paramString);

			// change route
			setRoute(path);
			setParams(hashParams);
		};

		onHashChange();

		window.addEventListener('hashchange', onHashChange);

		return () => {
			window.removeEventListener('hashchange', onHashChange);
		}
	}, []);

	switch(route){
		case "#game":
			return (<GameScreen playerId={params.playerId} />);
		default:
			return (<Home/>);
	}
}
