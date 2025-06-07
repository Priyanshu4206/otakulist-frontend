import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';

const PromptContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: var(--cardBackground);
  border-radius: 12px;
  text-align: center;
  border: 1px solid rgba(var(--borderColor-rgb), 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const PromptIcon = styled.div`
  font-size: 2.5rem;
  color: var(--primary);
  margin-bottom: 1.5rem;
  opacity: 0.9;
`;

const PromptTitle = styled.h3`
  color: var(--textPrimary);
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
`;

const PromptText = styled.p`
  color: var(--textSecondary);
  font-size: 0.95rem;
  margin: 0 0 1.5rem 0;
  max-width: 450px;
`;

const LoginButton = styled.button`
  padding: 0.75rem 2rem;
  background-color: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--primaryDark);
    transform: translateY(-2px);
  }
`;

const LoginPrompt = ({ title, message }) => {
  const navigate = useNavigate();
  
  const handleLogin = () => {
    navigate('/login');
  };
  
  return (
    <PromptContainer>
      <PromptIcon>
        <LogIn size={48} />
      </PromptIcon>
      <PromptTitle>{title || 'Login Required'}</PromptTitle>
      <PromptText>
        {message || 'Please log in to see personalized recommendations and connect with other users.'}
      </PromptText>
      <LoginButton onClick={handleLogin}>
        <LogIn size={18} />
        Log in now
      </LoginButton>
    </PromptContainer>
  );
};

export default LoginPrompt; 