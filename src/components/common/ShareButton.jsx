import React from 'react';
import styled from 'styled-components';
import { Share2 } from 'lucide-react';
import useToast from '../../hooks/useToast';
import copyToClipboard from '../../utils/copyToClipboard';

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: ${props => props.size === 'small' ? '0.4rem 0.8rem' : '0.6rem 1.2rem'};
  font-size: ${props => props.size === 'small' ? '0.85rem' : '0.95rem'};
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${props => props.variant === 'primary' ? 'var(--primary)' : 'var(--backgroundLight)'};
  color: ${props => props.variant === 'primary' ? 'white' : 'var(--textPrimary)'};
  border: 1px solid ${props => props.variant === 'primary' ? 'transparent' : 'var(--borderColor)'};
  
  &:hover {
    background-color: ${props => props.variant === 'primary' ? 'var(--primaryDark)' : 'var(--backgroundLight)'};
    color: ${props => props.variant === 'primary' ? 'white' : 'var(--primary)'};
    border-color: ${props => props.variant === 'primary' ? 'transparent' : 'var(--primary)'};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

/**
 * Reusable ShareButton component
 * @param {Object} props - Component props
 * @param {string} props.url - URL to share or copy (defaults to current URL if not provided)
 * @param {string} props.title - Title for the share dialog (not used in copy-only mode)
 * @param {string} props.text - Description text for the share dialog (not used in copy-only mode)
 * @param {string} props.label - Button label text
 * @param {string} props.successMessage - Toast message on successful copy
 * @param {string} props.errorMessage - Toast message on failed copy
 * @param {string} props.size - Button size ('small' or 'default')
 * @param {string} props.variant - Button style ('primary' or 'default')
 * @param {boolean} props.iconOnly - Whether to show only the icon without text
 * @param {Function} props.onClick - Additional onClick handler
 */
const ShareButton = ({
  url,
  title = 'Share',
  text = 'Check this out!',
  label = 'Share',
  successMessage = 'Link copied to clipboard',
  errorMessage = 'Failed to copy link',
  size = 'default',
  variant = 'default',
  iconOnly = false,
  onClick,
  ...props
}) => {
  const { showToast } = useToast();
  
  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Use provided URL or current page URL
    const shareUrl = url || window.location.href;
    
    // Always use clipboard copying, never use navigator.share
    copyToClipboard(shareUrl)
      .then(() => {
        showToast({
          type: 'success',
          message: successMessage
        });
        
        // Call additional onClick handler if provided
        if (onClick) onClick(e);
      })
      .catch((error) => {
        console.error('Failed to copy link:', error);
        showToast({
          type: 'error',
          message: errorMessage
        });
      });
  };
  
  return (
    <Button 
      onClick={handleShare} 
      size={size}
      variant={variant}
      {...props}
    >
      <Share2 size={iconOnly ? 18 : 16} />
      {!iconOnly && label}
    </Button>
  );
};

export default ShareButton;