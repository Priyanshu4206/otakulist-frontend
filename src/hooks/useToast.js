import { useContext } from 'react';
import ToastContext from '../contexts/ToastContext';

/**
 * Custom hook to use the toast notification system
 * @returns {Object} Toast functions and state
 */
const useToast = () => {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return context;
};

export default useToast; 