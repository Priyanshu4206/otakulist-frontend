import styled from 'styled-components';
import LoadingSpinner from './LoadingSpinner';

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100dvh;
  background-color: rgba(var(--background-rgb), 0.7); /* Semi-transparent background */
  backdrop-filter: blur(5px); /* Blur effect */
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
`;

const LoadingText = styled.p`
  margin-top: 1.5rem;
  color: var(--textPrimary);
  font-size: 1.1rem;
  font-weight: 500;
`;

const InitialLoadingScreen = () => {
  return (
    <LoadingContainer>
      <LoadingSpinner size="3rem" />
      <LoadingText>Loading OtakuList...</LoadingText>
    </LoadingContainer>
  );
};

export default InitialLoadingScreen; 