import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: ${props => props.marginLeft || '0.5rem'};
`;

const Spinner = styled.div`
  width: ${props => props.size || '12px'};
  height: ${props => props.size || '12px'};
  border-radius: 50%;
  border: 2px solid rgba(var(--primary-rgb), 0.2);
  border-top: 2px solid var(--primary);
  animation: ${spin} 0.8s linear infinite;
`;

/**
 * A mini loading spinner component for showing loading states with minimal impact
 * 
 * @param {Object} props - Component props
 * @param {string} props.size - Size of the spinner (default: '12px')
 * @param {string} props.marginLeft - Left margin (default: '0.5rem')
 */
const MiniLoadingSpinner = ({ size, marginLeft }) => {
  return (
    <SpinnerWrapper marginLeft={marginLeft}>
      <Spinner size={size} />
    </SpinnerWrapper>
  );
};

export default MiniLoadingSpinner; 