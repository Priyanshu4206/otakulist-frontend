import { createContext, useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, AlertCircle, Info, AlertTriangle, Bell, Award, UserPlus, Heart, MessageCircle, Lightbulb } from 'lucide-react';

// Logger utility for consistent logging format
const logger = (area, action, data = null) => {
  const logMessage = `[ToastContext] ${area} | ${action}`;
  // if (data) {
  //   console.log(logMessage, data);
  // } else {
  //   console.log(logMessage);
  // }
};

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
  logger('NotificationIcon', 'Rendering icon for type', notificationType);
  
  switch (notificationType) {
    case 'achievements':
      return <Award size={22} />;
    case 'follows':
      return <UserPlus size={22} />;
    case 'playlist_likes':
      return <Heart size={22} />;
    case 'comments':
    case 'playlist_comments':
    case 'comment_replys':
      return <MessageCircle size={22} />;
    case 'announcements':
      return <Bell size={22} />;
    case 'recommendations':
      return <Lightbulb size={22} />;
    default:
      return <Bell size={22} />;
  }
};

// Toast component with different icons based on type
const Toast = ({ id, type, message, onClose, notificationType }) => {
  logger('Toast', 'Rendering toast', { id, type, message, notificationType });
  
  useEffect(() => {
    logger('Toast', 'Toast mounted', { id });
    
    return () => {
      logger('Toast', 'Toast unmounted', { id });
    };
  }, [id]);
  
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

  const handleClose = () => {
    logger('Toast', 'Close button clicked', { id });
    onClose(id);
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
      <CloseButton onClick={handleClose}>
        <X size={16} />
      </CloseButton>
    </ToastItem>
  );
};

// Toast provider component
export const ToastProvider = ({ children }) => {
  logger('ToastProvider', 'Initializing');
  
  const [toasts, setToasts] = useState([]);
  const toastsRef = useRef(toasts);
  const timeoutsRef = useRef({});
  
  // Update ref when state changes
  useEffect(() => {
    toastsRef.current = toasts;
    logger('ToastProvider', 'Toasts state updated', { count: toasts.length, toasts });
  }, [toasts]);
  
  // Cleanup function for timeouts on unmount
  useEffect(() => {
    logger('ToastProvider', 'Provider mounted');
    
    return () => {
      logger('ToastProvider', 'Provider unmounting, clearing all timeouts');
      
      // Clear all timeout references
      Object.values(timeoutsRef.current).forEach(timeoutId => {
        clearTimeout(timeoutId);
      });
    };
  }, []);

  // Function to add a new toast
  const showToast = useCallback(({ type = 'info', message, duration = 3000, notificationType }) => {
    logger('showToast', 'Called with params', { type, message, duration, notificationType });
    
    const id = Date.now();
    
    // Add new toast
    setToasts(prevToasts => {
      const newToasts = [...prevToasts, { id, type, message, notificationType }];
      logger('showToast', 'Adding toast to state', { id, newCount: newToasts.length });
      return newToasts;
    });
    
    // Set auto-dismiss timeout if duration is provided
    if (duration) {
      logger('showToast', 'Setting auto-dismiss timeout', { id, duration });
      
      const timeoutId = setTimeout(() => {
        logger('showToast', 'Auto-dismiss timeout triggered', { id });
        removeToast(id);
        
        // Clean up timeout reference
        delete timeoutsRef.current[id];
      }, duration);
      
      // Store timeout reference
      timeoutsRef.current[id] = timeoutId;
    }
    
    return id;
  }, []);

  // Function to remove a toast
  const removeToast = useCallback((id) => {
    logger('removeToast', 'Removing toast', { id });
    
    // Clear any existing timeout for this toast
    if (timeoutsRef.current[id]) {
      logger('removeToast', 'Clearing timeout for toast', { id });
      clearTimeout(timeoutsRef.current[id]);
      delete timeoutsRef.current[id];
    }
    
    setToasts(prevToasts => {
      const filtered = prevToasts.filter(toast => toast.id !== id);
      logger('removeToast', 'Filtered toasts', { 
        id, 
        previousCount: prevToasts.length, 
        newCount: filtered.length 
      });
      return filtered;
    });
  }, []);

  // Create toast portal, render only if document is available
  const portalElement = typeof document !== 'undefined' ? document.body : null;
  
  useEffect(() => {
    if (portalElement) {
      logger('ToastProvider', 'Portal element available', { element: 'document.body' });
    } else {
      logger('ToastProvider', 'Portal element not available - SSR mode or document not ready');
    }
  }, [portalElement]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {logger('ToastProvider', 'Rendering children')}
      {children}
      {portalElement && createPortal(
        <ToastContainer>
          {logger('ToastContainer', 'Rendering toast container', { toastCount: toasts.length })}
          <AnimatePresence>
            {toasts.map(toast => (
              <Toast
                key={toast.id}
                id={toast.id}
                type={toast.type}
                message={toast.message}
                notificationType={toast.notificationType}
                onClose={removeToast}
              />
            ))}
          </AnimatePresence>
        </ToastContainer>,
        portalElement
      )}
    </ToastContext.Provider>
  );
};

// Custom hook for using the toast
export const useToast = () => {
  const context = React.useContext(ToastContext);
  
  if (!context) {
    logger('useToast', 'ERROR: Hook used outside ToastProvider');
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  logger('useToast', 'Hook accessed');
  return context;
};

export default ToastContext;