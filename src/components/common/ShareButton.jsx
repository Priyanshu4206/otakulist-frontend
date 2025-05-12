import React from 'react';
import styled from 'styled-components';
import { Share2, Link as LinkIcon } from 'lucide-react';
import useToast from '../../hooks/useToast';
import copyToClipboard from '../../utils/copyToClipboard';

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 8px;
  padding: 0.5rem 1.2rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${props => props.variant === 'primary' ? 'var(--primary)' : 'var(--backgroundLight)'};
  color: ${props => props.variant === 'primary' ? 'white' : 'var(--textPrimary)'};
  border: 1px solid var(--borderColor);
  // border: 1px solid ${props => props.variant === 'primary' ? 'transparent' : 'var(--borderColor)'};
  
  &:hover {
    background-color: ${props => props.variant === 'primary' ? 'var(--primaryDark)' : 'var(--backgroundLight)'};
    color: ${props => props.variant === 'primary' ? 'white' : 'var(--primary)'};
    border-color: ${props => props.variant === 'primary' ? 'transparent' : 'var(--primary)'};
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    font-size: 0.92rem;
    padding: 0.4rem 0.8rem;
    min-width: 90px;
  }
`;

/**
 * ShareButton component
 * @param {Object} props
 * @param {'native'|'copy'} props.mode - Share mode: 'native' for system share, 'copy' for copy to clipboard
 * @param {string} props.url - URL to share/copy (defaults to current URL)
 * @param {string} props.title - Title for share dialog
 * @param {string} props.text - Text for share dialog
 * @param {string} props.label - Button label
 * @param {string} props.successMessage - Success toast message
 * @param {string} props.errorMessage - Error toast message
 * @param {string} props.size - Button size
 * @param {string} props.variant - Button style
 * @param {boolean} props.iconOnly - Show only icon
 * @param {React.ReactNode} props.icon - Custom icon
 * @param {Function} props.onClick - Additional onClick handler
 */
const ShareButton = ({
  mode = 'copy',
  url,
  title = 'Share',
  text = 'Check this out!',
  label = 'Share Profile',
  successMessage = 'Link copied to clipboard',
  errorMessage = 'Failed to copy link',
  size = 'default',
  variant = 'default',
  iconOnly = false,
  icon,
  onClick,
  ...props
}) => {
  const { showToast } = useToast();

  const shareUrl = url || window.location.href;

  const handleNativeShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          url: shareUrl,
          title,
          text,
        });
        if (onClick) onClick(e);
      } catch (err) {
        // User cancelled or error
        if (err.name !== 'AbortError') {
          showToast({ type: 'error', message: 'Failed to share profile.' });
        }
      }
    } else {
      // Fallback to copy
      handleCopy(e);
    }
  };

  const handleCopy = (e) => {
    e.preventDefault();
    e.stopPropagation();
    copyToClipboard(shareUrl)
      .then(() => {
        showToast({ type: 'success', message: successMessage });
        if (onClick) onClick(e);
      })
      .catch((error) => {
        console.error('Failed to copy link:', error);
        showToast({ type: 'error', message: errorMessage });
      });
  };

  const handleClick = mode === 'native' ? handleNativeShare : handleCopy;

  return (
    <Button 
      onClick={handleClick}
      size={size}
      variant={variant}
      aria-label={label}
      {...props}
    >
      {icon ? icon : mode === 'native' ? <Share2 size={18} /> : <LinkIcon size={18} />}
      {!iconOnly && label}
    </Button>
  );
};

export default ShareButton;