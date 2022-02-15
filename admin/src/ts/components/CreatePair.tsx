import React from 'react';
import { useState } from 'react';
import { createGame } from '../lib/game';
import { goto } from '../lib/router';

export function CreatePairScreen(){
	const [blue,setBlue] = useState<string>(undefined);
	const [red, setRed] = useState<string>(undefined);
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

	const onCreateGame = async function(){
		if(!blue || !red){
			setError("Missing pair details");
		}

		const [err, game] = await createGame({ blue, red });

		if(err){
			setError(err.message);
			return;
		}
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
				<label>Player Blue</label>
				<input type="text" onChange={changePlayerBlue}/>
			</div>
			<div>
				<label>Player Red</label>
				<input type="text" onChange={changePlayerRed}/>
			</div>
			<button onClick={onCreateGame}>Create</button>
		</div>
	</div>
}
