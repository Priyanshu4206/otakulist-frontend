import { useState } from 'react';
import styled from 'styled-components';
import { X } from 'lucide-react';
import { watchlistAPI } from '../../services/api';
import { createPortal } from 'react-dom';

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
    color: var(--textPrimary);
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

const StatusOption = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${props => props.selected ? 'rgba(var(--tertiary-rgb), 0.1)' : 'transparent'};
  border: 1px solid ${props => props.selected ? 'var(--tertiary)' : 'var(--borderColor)'};
  
  &:hover {
    background-color: rgba(var(--tertiary-rgb), 0.05);
  }
`;

const StatusRadio = styled.input`
  margin: 0;
`;

const StatusLabel = styled.label`
  flex: 1;
  font-size: 0.95rem;
  cursor: pointer;
`;

const StatusGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
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

const ActionButton = styled(Button)`
  background-color: var(--tertiary);
  border: none;
  color: white;
  
  &:hover:not(:disabled) {
    background-color: var(--tertiaryLight);
  }
`;

const WatchlistModal = ({ anime, isOpen, onClose, currentStatus }) => {
  const [selectedStatus, setSelectedStatus] = useState(
    currentStatus ? currentStatus.status : 'plan_to_watch'
  );
  const [loading, setLoading] = useState(false);
  
  const statusOptions = [
    { value: 'watching', label: 'Currently Watching' },
    { value: 'completed', label: 'Completed' },
    { value: 'plan_to_watch', label: 'Plan to Watch' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'dropped', label: 'Dropped' }
  ];
  
  const handleSave = async () => {
    setLoading(true);
    try {
      const animeId = anime.mal_id || anime.id || anime.malId;
      await watchlistAPI.addOrUpdateAnime({
        animeId: animeId.toString(),
        status: selectedStatus
      });
      onClose();
    } catch (error) {
      console.error('Error updating watchlist:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // If not open, don't render anything
  if (!isOpen) return null;
  
  // Use createPortal to render the modal at the root level of the DOM
  return createPortal(
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h3>{currentStatus ? 'Update Status' : 'Add to Watchlist'}</h3>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>
        
        <ModalBody>
          <StatusGrid>
            {statusOptions.map(option => (
              <StatusOption 
                key={option.value}
                selected={selectedStatus === option.value}
                onClick={() => setSelectedStatus(option.value)}
              >
                <StatusRadio 
                  type="radio"
                  id={`${option.value}-${anime.mal_id || anime.id || anime.malId}`}
                  name="watchStatus"
                  checked={selectedStatus === option.value}
                  onChange={() => setSelectedStatus(option.value)}
                />
                <StatusLabel htmlFor={`${option.value}-${anime.mal_id || anime.id || anime.malId}`}>
                  {option.label}
                </StatusLabel>
              </StatusOption>
            ))}
          </StatusGrid>
        </ModalBody>
        
        <ModalFooter>
          <CancelButton onClick={onClose}>Cancel</CancelButton>
          <ActionButton 
            onClick={handleSave} 
            disabled={loading}
          >
            {loading ? 'Saving...' : currentStatus ? 'Update' : 'Add'}
          </ActionButton>
        </ModalFooter>
      </ModalContainer>
    </ModalOverlay>,
    document.body // Render the modal directly in the body element
  );
};

export default WatchlistModal; 