import { useState } from 'react';
import styled from 'styled-components';
import { User } from 'lucide-react';

const AvatarContainer = styled.div`
  position: relative;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border-radius: 50%;
  overflow: hidden;
  background-color: var(--cardBackground);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 3px solid ${({ showBorder }) => (showBorder ? 'var(--tertiary)' : 'transparent')};
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: ${({ interactive }) => (interactive ? 'scale(1.05)' : 'none')};
  }
`;

const AvatarFallback = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: var(--primaryLight);
  color: var(--primary);
`;

const UserAvatar = ({ 
  src, 
  alt, 
  size = 40,
  showBorder = false,
  interactive = false,
  ...props 
}) => {
  const [error, setError] = useState(false);
  
  const handleError = () => {
    setError(true);
  };
  
  return (
    <AvatarContainer size={size} showBorder={showBorder} {...props}>
      {src && !error ? (
        <AvatarImage 
          src={src} 
          alt={alt || 'User avatar'} 
          onError={handleError}
          interactive={interactive}
        />
      ) : (
        <AvatarFallback>
          <User size={size * 0.6} />
        </AvatarFallback>
      )}
    </AvatarContainer>
  );
};

export default UserAvatar; 