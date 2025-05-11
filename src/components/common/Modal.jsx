import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(3px);
  padding: 1rem;
`;

const ModalContainer = styled(motion.div)`
  background-color: var(--cardBackground);
  border-radius: 12px;
  width: ${props => props.width || '500px'};
  max-width: 95%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  position: relative;
  
  @media (max-width: 768px) {
    width: ${props => props.mobileWidth || '90%'};
    max-width: 95%;
  }
  
  @media (max-width: 480px) {
    width: 95%;
    border-radius: 10px;
    max-height: 85vh;
  }
`;

const ModalHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid var(--borderColor);
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  @media (max-width: 768px) {
    padding: 1.25rem;
  }
  
  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 1.4rem;
  color: var(--textPrimary);
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--textSecondary);
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: var(--textPrimary);
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
  
  @media (max-width: 768px) {
    padding: 1.25rem;
  }
  
  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

const ModalFooter = styled.div`
  padding: 1.5rem;
  border-top: 1px solid var(--borderColor);
  display: flex;
  justify-content: ${props => props.align || 'flex-end'};
  gap: 1rem;
  
  @media (max-width: 768px) {
    padding: 1.25rem;
    gap: 0.75rem;
  }
  
  @media (max-width: 480px) {
    padding: 1rem;
    gap: 0.5rem;
    flex-wrap: wrap;
    
    & > button {
      flex: 1;
      min-width: 40%;
    }
  }
`;

// Animation variants
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.2 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

const modalVariants = {
  hidden: { 
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  visible: { 
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { 
      type: "spring",
      damping: 25,
      stiffness: 500,
      duration: 0.3
    }
  },
  exit: { 
    opacity: 0,
    y: 20,
    scale: 0.98,
    transition: { duration: 0.2 }
  }
};

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  footerAlign,
  width,
  mobileWidth,
  preventBackdropClose = false
}) => {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (preventBackdropClose) return;
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && !preventBackdropClose) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, preventBackdropClose]);
  
  if (!isOpen) return null;
  
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <ModalOverlay
          onClick={handleBackdropClick}
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <ModalContainer
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            width={width}
            mobileWidth={mobileWidth}
            onClick={(e) => e.stopPropagation()}
          >
            {title && (
              <ModalHeader>
                <ModalTitle>{title}</ModalTitle>
                <CloseButton onClick={onClose}>
                  <X size={24} />
                </CloseButton>
              </ModalHeader>
            )}
            
            <ModalBody>
              {children}
            </ModalBody>
            
            {footer && (
              <ModalFooter align={footerAlign}>
                {footer}
              </ModalFooter>
            )}
          </ModalContainer>
        </ModalOverlay>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default Modal; 