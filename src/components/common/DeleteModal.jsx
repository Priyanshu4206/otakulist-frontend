import React from 'react';
import styled from 'styled-components';
import { X, AlertTriangle } from 'lucide-react';
import { createPortal } from 'react-dom';
import useToast from '../../hooks/useToast';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999; /* Ensure it's above everything else */
  padding: 1rem;
`;

const ModalContainer = styled.div`
  background-color: var(--cardBackground);
  border-radius: 12px;
  width: 100%;
  max-width: 450px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--borderColor);
  
  h3 {
    margin: 0;
    font-size: 1.2rem;
    color: var(--danger);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--textSecondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    color: var(--textPrimary);
    background-color: rgba(var(--backgroundLight-rgb), 0.5);
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
`;

const ModalFooter = styled.div`
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--borderColor);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const MessageText = styled.p`
  color: var(--textSecondary);
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0 0 1rem 0;
`;

const MessageHighlight = styled.span`
  color: var(--textPrimary);
  font-weight: 500;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CancelButton = styled(Button)`
  background: none;
  border: 1px solid var(--borderColor);
  color: var(--textSecondary);
  
  &:hover:not(:disabled) {
    background-color: var(--inputBackground);
    color: var(--textPrimary);
  }
`;

const DeleteButton = styled(Button)`
  background-color: var(--danger);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover:not(:disabled) {
    background-color: var(--dangerDark);
  }
`;

/**
 * A reusable delete confirmation modal component
 * 
 * @param {Object} props
 * @param {boolean} props.show - Whether to show the modal
 * @param {Function} props.onClose - Function to call when closing the modal
 * @param {Function} props.onConfirm - Function to call when deletion is confirmed
 * @param {string} props.title - Modal title
 * @param {string} props.message - Confirmation message
 * @param {string} props.itemName - Name of the item being deleted (will be highlighted)
 * @param {boolean} props.isDeleting - Whether deletion is in progress
 * @param {string} props.confirmButtonText - Text for the confirm button
 * @param {string} props.cancelButtonText - Text for the cancel button
 * @returns {React.ReactPortal|null}
 */
const DeleteModal = ({
  show,
  onClose,
  onConfirm,
  title = "Confirm Deletion",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  itemName,
  isDeleting = false,
  confirmButtonText = "Delete",
  cancelButtonText = "Cancel"
}) => {
  const { showToast } = useToast();

  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (error) {
      showToast({
        type: 'error',
        message: error.message || 'An error occurred during deletion.'
      });
    }
  };

  // If not open, don't render anything
  if (!show) return null;

  // Format message with highlighted item name if provided
  const formattedMessage = itemName 
    ? message.replace('{itemName}', `<highlight>${itemName}</highlight>`)
    : message;

  // Split the message to insert the highlighted part
  const messageParts = itemName 
    ? formattedMessage.split('<highlight>')
    : [formattedMessage];

  // Use createPortal to render the modal at the root level of the DOM
  return createPortal(
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h3>
            <AlertTriangle size={20} />
            {title}
          </h3>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <MessageText>
            {itemName ? (
              <>
                {messageParts[0]}
                <MessageHighlight>{itemName}</MessageHighlight>
                {messageParts[1]?.split('</highlight>')[1] || ''}
              </>
            ) : (
              message
            )}
          </MessageText>
        </ModalBody>

        <ModalFooter>
          <CancelButton onClick={onClose} disabled={isDeleting}>
            {cancelButtonText}
          </CancelButton>
          <DeleteButton
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : confirmButtonText}
          </DeleteButton>
        </ModalFooter>
      </ModalContainer>
    </ModalOverlay>,
    document.body // Render the modal directly in the body element
  );
};

export default DeleteModal; 