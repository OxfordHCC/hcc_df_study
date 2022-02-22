import React from 'react';
import { useState } from 'react';
import { createSession } from '../lib/session';
import { goto } from '../lib/router';

export function CreateSessionScreen(){
	const [blue,setBlue] = useState<string>(null);
	const [red, setRed] = useState<string>(null);
	const [error, setError] = useState<string>(null);
	const [grpcPort, setGrpcPort] = useState<number>(null);
	const [murmurPort, setMurmurPort] = useState<number>(null);
	
	const goHome = function(){
		goto("#home");
	}

	const changePlayerBlue = function(evt: React.ChangeEvent<HTMLInputElement>) {
		setBlue(evt.target.value);
	}

	const changePlayerRed = function(evt: React.ChangeEvent<HTMLInputElement>){
		setRed(evt.target.value);
	}

	const changeMurmurPort = function(evt: React.ChangeEvent<HTMLInputElement>){
		setMurmurPort(parseInt(evt.target.value));
	}

	const changeGrpcPort = function(evt: React.ChangeEvent<HTMLInputElement>){
		setGrpcPort(parseInt(evt.target.value));
	}

	const onCreateSession = async function() {
		const createRes = await createSession({
			blueParticipant: blue,
			redParticipant: red,
			grpcPort,
			murmurPort
		});

		if(createRes instanceof Error){
			setError(createRes.message);
			return;
		}
		
		goto("#home");
	}

	return <div>
		<h1>Create Session</h1>
		<div>
			<button onClick={ goHome }>Cancel</button>
		</div>
		<div>
			{error || ""}
		</div>
		<div>
			<div>
				<label htmlFor="grpc">Blue Participant</label>
				<input value={grpcPort} name="grpc" type="text" onChange={changeGrpcPort} />
			</div>
			<div>
				<label htmlFor="murmur">Blue Participant</label>
				<input value={murmurPort} name="murmur" type="text" onChange={changeMurmurPort} />
			</div>
			<div>
				<label htmlFor="blue">Blue Participant</label>
				<input value={blue} name="blue" type="text" onChange={changePlayerBlue} />
			</div>
			<div>
				<label htmlFor="red">Red participant</label>
				<input value={red} name="red" type="text" onChange={changePlayerRed} />
			</div>
			<button onClick={onCreateSession}>Create</button>
		</div>
	</div>
}
