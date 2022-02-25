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
type Route = {
	name: RouteName,
	params?: any
}

export function Router(): JSX.Element {
	const [route, setRoute] = useState<Route>({
		name: "#home"
	});

	useEffect(() => {
		const onHashChange = function() {
			const hash = window.location.hash;
			const [path, paramString] = hash.split("?");
			
			const hashParams = parseParamString(paramString);

			// change route
			setRoute({
				name: path as RouteName,
				params: hashParams
			});
		};

		onHashChange();
		window.addEventListener('hashchange', onHashChange);
		return () => {
			window.removeEventListener('hashchange', onHashChange);
		}
	}, []);

	switch(route.name){
		case "#create_pair":
			return (<CreateSessionScreen />);
		default:
			return (<HomeScreen />);
	}
}
