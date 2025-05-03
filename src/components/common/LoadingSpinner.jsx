import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  background: rgba(var(--background-rgb), 0.2);
  height: ${props => props.fullScreen ? '100vh' : '100%'};
`;

const Spinner = styled.div`
  width: ${props => props.size || '2rem'};
  height: ${props => props.size || '2rem'};
  border-radius: 50%;
  border: 4px solid var(--borderColor);
  border-top: 4px solid var(--primary);
  animation: ${spin} 1s linear infinite;
`;

const LoadingSpinner = ({ size, fullScreen = false }) => {
  return (
    <SpinnerContainer fullScreen={fullScreen}>
      <Spinner size={size} />
    </SpinnerContainer>
  );
};

export default LoadingSpinner; 