import { GameData, SingleRoundData } from 'dfs-common';
import React, { FunctionComponent, useState } from 'react';
import styled from 'styled-components';
import { ButtonRound, ButtonRoundParams } from './ButtonRound';
import { GameLobby, GameLobbyParams } from './LobbyScreen';
import { RoundScreen, RoundScreenParams } from './RoundScreen';


type DeclarationObject<T> = {
	fn: FunctionComponent<T>,
	props: T
}

type TestComponent = DeclarationObject<ButtonRoundParams>
				   | DeclarationObject<GameLobbyParams>
				   | DeclarationObject<RoundScreenParams>;

type Declaration = Array<TestComponent>;


type SampleGame = Omit<GameData, "rounds"> & {
	rounds: [
		SingleRoundData
	]
}

const sampleGameData: SampleGame = {
	players: [{
		playerId: "red",
		ready: true
	},{
		playerId: "blue",
		ready: true
	}],
	currentRound: 0,
	gameId: "foo",
	rounds: [
		{
			options: [1,2,3],
			name: "button",
			msLength: 5000,
			solution: 1
		}
	]
}

const components: Declaration = [
	{
		fn: ButtonRound,
		props: {
			onAnswer: () => {},
			isBlue: false,
			round: 1,
			roundData: {
				...sampleGameData.rounds[0],
				name: "button"
			}
		}
	},
	{
		fn: GameLobby,
		props: {
			playerId: "foobar",
			gameData: sampleGameData,
			onReadyChange: () => {}
		}
	},
	{
		fn: RoundScreen,
		props: {
			gameData: sampleGameData,
			playerId: "foo",
			onAnswer: () => {}
		}
	}
];

export function TestScreen() {
	const [ componentIndx, setComponentIndx] = useState<number>(0);
	const [ showSelector, setShowSelector ] = useState<boolean>(true);

	function onSelect(evt: React.ChangeEvent<HTMLSelectElement>) {
		setComponentIndx(parseInt(evt.target.value));
	}

	function toggleShowSelector(){
		setShowSelector(!showSelector);
	}

	const testComponent = components[componentIndx].fn;
	const testProps = components[componentIndx].props;
	
	return (
		<>
			<SelectorContainer>
				<ComponentSelector show={showSelector}>
					<select onChange={onSelect} value={componentIndx} name="component">
						{
							components.map(
								(c, i) => <option value={i}>{c.fn.name}</option>
							)
						}
					</select>
				</ComponentSelector>
				<ShowSelectorButton onClick={toggleShowSelector}>Components</ShowSelectorButton>
			</SelectorContainer>
			{
				// @ts-ignore -- TODO fix this
				React.createElement(testComponent, testProps, null)
			}	
		</>
	);
}

const SelectorContainer = styled.div`
	position: absolute;
	right: 0;
	bottom: 0;
`;

const ShowSelectorButton = styled.button``;

type ComponentSelectorProps = {
	show: boolean;
}
const ComponentSelector = styled.div<ComponentSelectorProps>`
    max-height: 100vh;
    background-color: grey;
    overflow-y: scroll;
	${ (props) => (props.show)? "" : "display: none;" }
`;
