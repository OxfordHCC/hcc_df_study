import React from 'react';
import { useState } from 'react';
import { AdminClientNs } from 'dfs-common';
import { createSession } from '../lib/session';
import { goto } from '../lib/router';

export function CreateSessionScreen(){
	const [blue,setBlue] = useState<string>("");
	const [red, setRed] = useState<string>("");
	const [error, setError] = useState<string>("");
	const [grpcPort, setGrpcPort] = useState<number | undefined>(undefined);
	const [murmurPort, setMurmurPort] = useState<number | undefined>(undefined);
	
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
		const val = parseInt(evt.target.value);
		if(isNaN(val)){
			setMurmurPort(undefined);
			return;
		}
		setMurmurPort(val);
	}

	const changeGrpcPort = function(evt: React.ChangeEvent<HTMLInputElement>){
		const val = parseInt(evt.target.value);
		if(isNaN(val)){
			setGrpcPort(undefined);
			return;
		}
		setGrpcPort(val);
	}

	const onCreateSession = async function() {
		const createSessionParams = {
			blueParticipant: blue,
			redParticipant: red,
			grpcPort,
			murmurPort
		} as AdminClientNs.CreateSessionParams;

		try{ 
			 await createSession(createSessionParams);
			goto("#home");
		} catch (err) {
			if(err instanceof Error){
				setError(err.message);
				return;
			}
			setError("Unknown error returned by createSession.");
			return;
		}
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
				<label htmlFor="grpc">GRPC Port</label>
				<input value={grpcPort} name="grpc" type="number" onChange={changeGrpcPort} />
			</div>
			<div>
				<label htmlFor="murmur">MurmurPort</label>
				<input value={murmurPort} name="murmur" type="number" onChange={changeMurmurPort} />
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
