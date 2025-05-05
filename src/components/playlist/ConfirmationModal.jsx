import React from 'react';
import styled from 'styled-components';
import { AlertTriangle } from 'lucide-react';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalDialog = styled.div`
  background: var(--cardBackground);
  border-radius: 12px;
  padding: 1.5rem;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
`;

const ModalTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: var(--textPrimary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    color: var(--error);
  }
`;

const ModalMessage = styled.p`
  color: var(--textSecondary);
  margin-bottom: 1.5rem;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: ${props => props.$primary ? 'var(--primary)' : 'var(--cardBackground)'};
  color: ${props => props.$primary ? 'white' : 'var(--textPrimary)'};
  border: 1px solid ${props => props.$primary ? 'var(--primary)' : 'var(--borderColor)'};
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: ${props => props.$primary ? 'var(--primaryLight)' : 'var(--backgroundLight)'};
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ConfirmationModal = ({ 
  title, 
  message, 
  confirmLabel = 'Confirm', 
  cancelLabel = 'Cancel',
  isProcessing = false, 
  onConfirm, 
  onCancel,
  isDangerous = false
}) => {
  return (
    <ModalOverlay onClick={() => !isProcessing && onCancel()}>
      <ModalDialog onClick={(e) => e.stopPropagation()}>
        <ModalTitle>
          <AlertTriangle size={20} />
          {title}
        </ModalTitle>
        <ModalMessage>{message}</ModalMessage>
        <ModalActions>
          <ActionButton 
            onClick={onCancel}
            disabled={isProcessing}
          >
            {cancelLabel}
          </ActionButton>
          <ActionButton 
            $primary 
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? `${confirmLabel}...` : confirmLabel}
          </ActionButton>
        </ModalActions>
      </ModalDialog>
    </ModalOverlay>
  );
};

export default ConfirmationModal; 