import React from 'react';
import { useMemo } from 'react';

type CaseParams<T> = {
	when: T
	children: React.ReactNode
}
interface Case<T>
extends JSX.Element{}
export function Case<T>({ children }: CaseParams<T>): JSX.Element{
	return <>{children}</>;
}

type DefaultCaseParams = {
	children: React.ReactNode
}
interface DefaultCase
extends JSX.Element{}
export function DefaultCase(
	{ children }: DefaultCaseParams
): JSX.Element{
	return <>{children}</>;
}

type SwitchParams<T> = {
	on: T
	children: Array<Case<T> | DefaultCase> 
}
export function Switch<T>(
	{ on, children }: SwitchParams<T>
): JSX.Element{
	
	const defaultCase = useMemo(() => children.find(
		c => c.type.name === "DefaultCase"
	), [children]) as DefaultCase;

	const cases = useMemo(() => children.filter(
		c => c.type.name === "Case"
	), [children]) as Case<T>[];

	return (
		cases.find(c => c.props.when === on)
		|| defaultCase
		|| <>Switch did not match anything and no default value.</>
	);
}
