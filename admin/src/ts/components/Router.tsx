import React from "react";
import {useState, useEffect } from 'react';
import { HomeScreen } from './HomeScreen';
import { CreateSessionScreen } from './CreateSession';

function parseParamString(paramString?: string): any {
	if (paramString === undefined) {
		return {}
	}

	const decoded = decodeURI(paramString);	
	return JSON.parse(decoded);
}

type RouteName = "#create_pair" | "#home";

export function Router(): JSX.Element {
	const [route, setRoute] = useState<RouteName>("#home");
	const [params, setParams] = useState<any>({});

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
		case "#create_pair":
			return (<CreateSessionScreen />);
		default:
			return (<HomeScreen />);
	}
}
