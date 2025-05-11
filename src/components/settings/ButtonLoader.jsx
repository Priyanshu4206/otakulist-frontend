import React from 'react';
import styled, { keyframes } from 'styled-components';

/**
 * ButtonLoader - Animated dots for button loading state.
 * @param {object} props
 * @param {string} [props.size] - Dot size (default: 6px)
 */
const pulse = keyframes`
  0% { opacity: 0.5; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
  100% { opacity: 0.5; transform: scale(0.8); }
`;

const Dots = styled.span`
  display: absolute;
  align-items: center;
  gap: 0.25em;
  margin-left: 0.5em;
`;

const Dot = styled.span`
  width: ${props => props.size || '6px'};
  height: ${props => props.size || '6px'};
  border-radius: 50%;
  background: var(--primary);
  animation: ${pulse} 1.1s infinite;
  &:nth-child(2) { animation-delay: 0.2s; }
  &:nth-child(3) { animation-delay: 0.4s; }
`;

const ButtonLoader = ({ size = '6px' }) => (
  <Dots>
    <Dot size={size} />
    <Dot size={size} />
    <Dot size={size} />
  </Dots>
);

export default ButtonLoader; 