import styled, { keyframes } from 'styled-components';

export const ToggleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid var(--borderColor);
  &:last-child { border-bottom: none; }
`;

export const ToggleLabel = styled.div`
  font-size: 1rem;
  font-weight: 500;
  color: var(--textPrimary);
`;

export const ToggleDescription = styled.div`
  font-size: 0.9rem;
  color: var(--textSecondary);
  margin-top: 0.2rem;
`;

export const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
  input {
    opacity: 0;
    width: 0;
    height: 0;
  }
`;

export const Slider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--borderColor);
  transition: 0.3s;
  border-radius: 34px;
  &:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
  }
  input:checked + & {
    background-color: var(--primary);
  }
  input:checked + &:before {
    transform: translateX(24px);
  }
`;

const shimmer = keyframes`
  0% { opacity: 0.5; }
  50% { opacity: 1; }
  100% { opacity: 0.5; }
`;

export const ToggleLoading = styled.div`
  position: absolute;
  right: -28px;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--primary);
  animation: ${shimmer} 1s infinite;
`; 