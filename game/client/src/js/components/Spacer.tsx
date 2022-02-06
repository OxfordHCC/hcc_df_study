import styled from 'styled-components';

type SpacerProps = {
	height?: string,
	width?: string
}
export const Spacer = styled.div<SpacerProps>`
	height: ${props => props.height};
	width: ${props => props.width};
`;
