import { useState } from 'react';
import styled from 'styled-components';
import useToast from '../../hooks/useToast';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background-color: var(--cardBackground);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  color: var(--textPrimary);
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.success {
    background-color: var(--success);
    color: white;
    &:hover { filter: brightness(1.1); }
  }
  
  &.error {
    background-color: var(--danger);
    color: white;
    &:hover { filter: brightness(1.1); }
  }
  
  &.warning {
    background-color: var(--warning);
    color: white;
    &:hover { filter: brightness(1.1); }
  }
  
  &.info {
    background-color: var(--info);
    color: white;
    &:hover { filter: brightness(1.1); }
  }
`;

const ToastDemo = () => {
  const { showToast } = useToast();
  
  const handleShowToast = (type) => {
    const messages = {
      success: 'Operation completed successfully!',
      error: 'Something went wrong. Please try again.',
      warning: 'This action may have consequences.',
      info: 'Here is some information for you.'
    };
    
    showToast({
      type,
      message: messages[type]
    });
  };
  
  return (
    <Container>
      <Title>Toast Notification Demo</Title>
      <ButtonGroup>
        <Button 
          className="success" 
          onClick={() => handleShowToast('success')}
        >
          Success Toast
        </Button>
        <Button 
          className="error" 
          onClick={() => handleShowToast('error')}
        >
          Error Toast
        </Button>
        <Button 
          className="warning" 
          onClick={() => handleShowToast('warning')}
        >
          Warning Toast
        </Button>
        <Button 
          className="info" 
          onClick={() => handleShowToast('info')}
        >
          Info Toast
        </Button>
      </ButtonGroup>
    </Container>
  );
};

export default ToastDemo; 