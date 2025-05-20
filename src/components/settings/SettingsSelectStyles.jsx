import styled, { keyframes } from 'styled-components';

export const SelectContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid var(--borderColor);
  &:last-child { border-bottom: none; }
`;

export const SelectLabel = styled.div`
  font-size: 1rem;
  font-weight: 500;
  color: var(--textPrimary);
`;

export const SelectDescription = styled.div`
  font-size: 0.9rem;
  color: var(--textSecondary);
  margin-top: 0.2rem;
`;

const shimmer = keyframes`
  0% { opacity: 0.5; }
  50% { opacity: 1; }
  100% { opacity: 0.5; }
`;

export const SelectLoading = styled.div`
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