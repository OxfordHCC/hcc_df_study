import React from 'react';
import { RoundData, Answer, ButtonRoundData } from 'dfs-common';
import { ButtonRound } from './ButtonRound';
import { Clock } from './Clock';

type GameRoundParam = {
	round: number
	roundData: RoundData
	onAnswer: (answer: Answer) => void
}
export function GameRound({ roundData, round, onAnswer }: GameRoundParam): JSX.Element{
	const { name } = roundData;

	return (
		<div>
			{
				roundData.startTime === undefined
				? <>Round did not start.</>
				: <Clock start={roundData.startTime}
						length={roundData.msLength} />
			}
			{
				(name === "button")
				? <ButtonRound
					isBlue={true}
					round={round}
					roundData={roundData as ButtonRoundData}
					onAnswer={onAnswer} />
				: <>Unknown round name</>
			}

		</div>
	);
}
