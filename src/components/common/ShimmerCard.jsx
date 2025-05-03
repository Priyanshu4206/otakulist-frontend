import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const breathe = keyframes`
  0% {
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    transform: translateY(0);
  }
  50% {
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    transform: translateY(-3px);
  }
  100% {
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    transform: translateY(0);
  }
`;

const ShimmerElement = styled.div`
  display: inline-block;
  position: relative;
  background: var(--cardBackground);
  border-radius: ${props => props.borderRadius || '4px'};
  height: ${props => props.height || '16px'};
  width: ${props => props.width || '100%'};
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    transform: translateX(-100%);
    background-image: linear-gradient(
      90deg,
      rgba(var(--cardBackground-rgb), 0) 0,
      rgba(var(--textPrimary-rgb), 0.2) 20%,
      rgba(var(--cardBackground-rgb), 0.3) 60%,
      rgba(var(--cardBackground-rgb), 0)
    );
    animation: ${shimmer} 2s infinite;
    background-size: 200% 100%;
  }
`;

const ShimmerShape = styled(ShimmerElement)`
  mask-image: ${props => props.maskImage};
  -webkit-mask: linear-gradient(var(--textPrimary) 0 0) content-box, linear-gradient(var(--textPrimary) 0 0);
  mask-composite: add;
  -webkit-mask-composite: source-out;
`;

const ShimmerCardContainer = styled.div`
  width: ${props => props.width || '280px'};
  height: ${props => props.height || '380px'};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  background-color: var(--cardBackground);
  margin: ${props => props.margin || '0'};
  padding: 0;
  position: relative;
  animation: ${breathe} 3s infinite ease-in-out;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 12px;
    padding: 2px;
    background: linear-gradient(
      -45deg,
      rgba(var(--primary-rgb), 0.1),
      rgba(var(--secondary-rgb), 0.1),
      rgba(var(--accent-rgb), 0.1)
    );
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
  }
`;

const ShimmerImage = styled(ShimmerElement)`
  width: 100%;
  height: 65%;
  border-radius: 12px 12px 0 0;
`;

const ShimmerContent = styled.div`
  padding: 1rem;
`;

const ShimmerBadge = styled(ShimmerShape)`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 50px;
  height: 24px;
  border-radius: 6px;
`;

const ShimmerStatusBadge = styled(ShimmerShape)`
  position: absolute;
  top: 10px;
  left: 10px;
  width: 70px;
  height: 24px;
  border-radius: 6px;
`;

const ShimmerGenres = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const ShimmerGenre = styled(ShimmerShape)`
  width: 60px;
  height: 24px;
  border-radius: 6px;
`;

const ShimmerCard = ({ width, height, margin }) => {
  return (
    <ShimmerCardContainer width={width} height={height} margin={margin}>
      <ShimmerImage />
      <ShimmerBadge />
      <ShimmerStatusBadge />
      <ShimmerContent>
        <ShimmerShape height="24px" margin="0 0 16px 0" />
        
        <ShimmerShape height="16px" width="75%" margin="0 0 8px 0" />
        <ShimmerShape height="16px" width="85%" margin="0 0 16px 0" />
        
        <ShimmerGenres>
          <ShimmerGenre />
          <ShimmerGenre />
        </ShimmerGenres>
        
        <ShimmerShape height="1px" width="100%" margin="16px 0" />
        
        <ShimmerShape height="14px" width="60%" margin="0 0 8px 0" />
        <ShimmerShape height="14px" width="40%" />
      </ShimmerContent>
    </ShimmerCardContainer>
  );
};

export default ShimmerCard; 