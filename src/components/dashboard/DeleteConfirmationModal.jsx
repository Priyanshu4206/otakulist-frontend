import React from 'react';
import styled from 'styled-components';
import { X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ModalBackdrop = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled(motion.div)`
  background-color: var(--cardBackground);
  border-radius: 12px;
  max-width: 450px;
  width: 100%;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  overflow: hidden;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--borderColor);
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--textPrimary);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  svg {
    color: var(--danger);
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--textSecondary);
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--backgroundLight);
    color: var(--textPrimary);
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
`;

const Message = styled.p`
  margin: 0 0 1.5rem;
  color: var(--textSecondary);
  font-size: 0.95rem;
  line-height: 1.5;
`;

const AnimeTitle = styled.span`
  color: var(--textPrimary);
  font-weight: 500;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 1.5rem 1.5rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
`;

const CancelButton = styled(Button)`
  background-color: var(--cardBackground);
  color: var(--textPrimary);
  border: 1px solid var(--borderColor);
  
  &:hover {
    background-color: var(--backgroundLight);
  }
`;

const DeleteButton = styled(Button)`
  background-color: var(--danger);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background-color: var(--dangerDarker);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const DeleteConfirmationModal = ({ 
  isOpen, 
  onClose, 
  anime, 
  onDelete, 
  isDeleting 
}) => {
  const getAnimeTitle = () => {
    if (!anime) return "this anime";
    
    const animeData = anime.anime || anime;
    
    if (animeData.titles?.english) return animeData.titles.english;
    if (animeData.titles?.default) return animeData.titles.default;
    if (animeData.title) return animeData.title;
    
    return "this anime";
  };
  
  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: "easeIn",
      },
    },
  };
  
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <ModalBackdrop
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
        >
          <ModalContent
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <ModalHeader>
              <ModalTitle>
                <AlertTriangle size={20} />
                Confirm Removal
              </ModalTitle>
              <CloseButton onClick={onClose}>
                <X size={16} />
              </CloseButton>
            </ModalHeader>
            
            <ModalBody>
              <Message>
                Are you sure you want to remove <AnimeTitle>{getAnimeTitle()}</AnimeTitle> from your watchlist? This action cannot be undone.
              </Message>
            </ModalBody>
            
            <ModalFooter>
              <CancelButton onClick={onClose}>
                Cancel
              </CancelButton>
              
              <DeleteButton 
                onClick={onDelete} 
                disabled={isDeleting}
              >
                {isDeleting ? "Removing..." : "Remove"}
              </DeleteButton>
            </ModalFooter>
          </ModalContent>
        </ModalBackdrop>
      )}
    </AnimatePresence>
  );
};

export default DeleteConfirmationModal; 