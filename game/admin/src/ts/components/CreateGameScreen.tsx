import React from 'react';
import { useState } from 'react';
import { createGame } from '../lib/game';
import { goto } from '../lib/router';

export function CreateGameScreen(){
	const [blue,setBlue] = useState<string>(undefined);
	const [red, setRed] = useState<string>(undefined);
	const [id, setId] = useState<string>(undefined);
	const [error, setError] = useState<string>(undefined);

	const goHome = function(){
		goto("#home");
	}

	const changePlayerBlue = function(evt: React.ChangeEvent<HTMLInputElement>) {
		setBlue(evt.target.value);
	}

	const changePlayerRed = function(evt: React.ChangeEvent<HTMLInputElement>){
		setRed(evt.target.value);
	}

	const changeId = function(evt: React.ChangeEvent<HTMLInputElement>) {
		setId(evt.target.value);
	}

	const onCreate = async function(){
		if(!blue || !red || !id){
			setError("Missing game details");
		}

		const [err, _res] = await createGame({ id, blue, red});
		if(err){
			setError(err.message);
			return;
		}
		console.log(_res);
		
		goto("#home");
	}
	
	return <div>
		<h1>Create game</h1>
		<div>
			<button onClick={goHome}>Cancel</button>
		</div>
		<div>
			{error || ""}
		</div>
		<div>
			<div>
				<label>Name</label>
				<input type="text" onChange={changeId}/>
			</div>
			<div>
				<label>Player Blue</label>
				<input type="text" onChange={changePlayerBlue}/>
			</div>
			<div>
				<label>Player Red</label>
				<input type="text" onChange={changePlayerRed}/>
			</div>
			<button onClick={onCreate}>Create</button>
		</div>
	</div>
}
