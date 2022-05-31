import React from 'react';
import { useState } from 'react';
import styled from 'styled-components';
import { Answer, GameData } from 'dfs-common';
import { Screen } from './Screen';
import { Round } from './Round';


export type RoundScreenParams = {
	gameData: GameData
	playerId: string
	onAnswer: (a: Answer) => void
}
export function RoundScreen({ gameData, playerId, onAnswer }: RoundScreenParams){
	const [clock, setClock] = useState<string>();
	
	const { rounds, players, currentRound } = gameData;
	
	const isBlue = playerId === players[0].playerId;
	const currRoundData = rounds[currentRound];

	const score = rounds.map(round => {
		return round.answer !== undefined
			&& round.answer === round.solution
			? 1 : 0
	}).reduce((acc: number, curr) => acc + curr, 0);

	const total = rounds
		.map(r => (r.answer !== undefined)? 1 : 0)
		.reduce((acc: number, curr) => acc + curr, 0);

	function updateClock(clockStr: string){
		setClock(clockStr);
	}

	return (
		<Screen>
			<Background>
				<Room>
					<BackWall/>
					<LeftWall/>
					<RightWall/>
					<BottomWall/>
				</Room>
				<Table>
					<TopTableFace />
				</Table>
			</Background>
			<GameDataContainer>
				<StatusBar>
					<BarSquare>
						<div>Round</div>
						<div>{currentRound}</div>
					</BarSquare>
					<BarSquare>
						<div>Score</div>
						<div>{score}/{total}</div>
					</BarSquare>
				
				</StatusBar>
				<StatusBar>
					<BarSquare>
						Time
					</BarSquare>
					<BarSquare>
						{clock}
					</BarSquare>
				</StatusBar>
			</GameDataContainer>
			<Round round={currentRound}
				roundData={currRoundData}
				onAnswer={onAnswer}
				isBlue={isBlue}
				onClockUpdate={updateClock}
			/>
		</Screen>
	);
}

const BarSquare = styled.div`
	background: url("./textures/GRAY1.png");
	background-size: cover;
	background-repeat: no-repeat;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: Center;
	height: 120px;
	width: 120px;
	font-size: 2em;
	font-weight: bold;
	color: darkred;
`;

const StatusBar = styled.div`
	display: flex;
	flex-direction: row;
`;

const GameDataContainer = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: space-between;
`;

const Background = styled.div`
	z-index: -1;
	position: absolute;
	height: 100vh;
	width: 100vw;
	overflow: hidden;
`;
const Table = styled.div`
	width: 80vw;
	height: 40vh;
	transform-style: preserve-3d;
	position: absolute;
	left: 10vw;
	top:50%;
	perspective: 500px;
`;
const TableFace = styled.div`
	width: 100%;
	height: 100%;
`;

const TopTableFace = styled(TableFace)`
  background: url("./textures/CRATE1.png");
  background-size: cover;
  transform: rotateX(30deg) translateY(180px);
`;

const Room = styled.div`
	perspective: 500px;
	height: 100%;
	width: 100%;
	display:flex;
	justify-content:center;
	align-items: center;
	transform-style: preserve-3d;
`;

const Wall = styled.div`
	height: 100vh;
	width: 100vh;
	position: absolute;
`;
const BackWall = styled(Wall)`
background: url("./textures/BIGDOOR6.png");
background-repeat: no-repeat;
background-size: cover;
`;
const LeftWall = styled(Wall)`
background: url("./textures/STARTAN1.png");

transform: rotateY(-120deg) translateX(130px) translateZ(400px) scaleY(120%) skewY(26.5deg);
`;
const RightWall = styled(Wall)`
transform: rotateY(-90deg) translateZ(-400px) skewY(22deg);
background: url("./textures/STARTAN1.png");
`;

const BottomWall = styled(Wall)`
background: url("./textures/floor.png");
transform: rotateX(68deg);
`


