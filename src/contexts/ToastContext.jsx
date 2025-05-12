import { createContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, AlertCircle, Info, AlertTriangle, Bell, Award, UserPlus, Heart, MessageCircle } from 'lucide-react';

// Create context
export const ToastContext = createContext();

// Toast container styled component
const ToastContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 350px;
`;

// Individual toast styled component
const ToastItem = styled(motion.div)`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  color: #fff;
  font-weight: 500;
  background-color: ${({ type }) => {
    switch (type) {
      case 'success':
        return 'var(--success)';
      case 'error':
        return 'var(--danger)';
      case 'warning':
        return 'var(--warning)';
      case 'info':
        return 'var(--info)';
      case 'notification':
        return 'var(--cardBackground, #23243a)';
      default:
        return 'var(--info)';
    }
  }};
  border: ${({ type }) => type === 'notification' ? '2px solid var(--primary, #FFA500)' : 'none'};
  min-width: 320px;
  max-width: 90vw;
`;

const IconContainer = styled.div`
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ToastMessage = styled.div`
  flex: 1;
  word-break: break-word;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  margin-left: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  opacity: 0.8;
  
  &:hover {
    opacity: 1;
  }
`;

const NotificationIcon = ({ notificationType }) => {
  switch (notificationType) {
    case 'achievement': return <Award size={22} />;
    case 'follow': return <UserPlus size={22} />;
    case 'playlist_like': return <Heart size={22} />;
    case 'playlist_comment':
    case 'comment_reply': return <MessageCircle size={22} />;
    case 'system': return <Bell size={22} />;
    default: return <Bell size={22} />;
  }
};

// Toast component with different icons based on type
const Toast = ({ id, type, message, onClose, notificationType }) => {
  const getIcon = () => {
    if (type === 'notification') {
      return <NotificationIcon notificationType={notificationType} />;
    }
    switch (type) {
      case 'success':
        return <Check size={18} />;
      case 'error':
        return <AlertCircle size={18} />;
      case 'warning':
        return <AlertTriangle size={18} />;
      case 'info':
      default:
        return <Info size={18} />;
    }
  };

  return (
    <ToastItem
      type={type}
      layout
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.2 }}
    >
      <IconContainer>{getIcon()}</IconContainer>
      <ToastMessage>{message}</ToastMessage>
      <CloseButton onClick={() => onClose(id)}>
        <X size={16} />
      </CloseButton>
    </ToastItem>
  );
};

// Toast provider component
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Function to add a new toast
  const showToast = useCallback(({ type = 'info', message, duration = 1000 }) => {
    const id = Date.now();
    
    setToasts(prevToasts => [...prevToasts, { id, type, message }]);
    
    // Auto-dismiss toast after duration
    if (duration) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    
    return id;
  }, []);

  // Function to remove a toast
  const removeToast = useCallback((id) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  // Create toast portal, render only if document is available
  const toastPortal = typeof document !== 'undefined' ? createPortal(
    <ToastContainer>
      <AnimatePresence>
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            id={toast.id}
            type={toast.type}
            message={toast.message}
            onClose={removeToast}
          />
        ))}
      </AnimatePresence>
    </ToastContainer>,
    document.body
  ) : null;

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {toastPortal}
    </ToastContext.Provider>
  );
};

export default ToastContext; 