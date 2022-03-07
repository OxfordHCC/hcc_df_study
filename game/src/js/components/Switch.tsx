import React from 'react';
import { useMemo } from 'react';

type CaseParams<T> = {
	when: T
	children: React.ReactNode
}
export function Case<T>(
	{ children }: CaseParams<T>
): JSX.Element{
	return <>{children}</>;
}

type DefaultCaseParams = {
	children: React.ReactNode
}

export function DefaultCase(
	{ children }: DefaultCaseParams
): JSX.Element{
	return <>{children}</>;
}

type SwitchParams<T> = {
	on: T
	children: Array<
	  | React.ReactElement<CaseParams<T>>
	  | React.ReactElement<DefaultCaseParams>
	>
}
export function Switch<T>(
	{ on, children }: SwitchParams<T>
): JSX.Element{
	const defaultCase = useMemo(() => children.find(
		c => c.type === DefaultCase
	), [children]) as React.ReactElement<DefaultCaseParams>;

	const cases = useMemo(() => children.filter(
		c => c.type === Case
	), [children]) as React.ReactElement<CaseParams<T>>[];

	return (
		cases.find(c => c.props.when === on)
		|| defaultCase
		|| "" as never
	);
}
