import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Star, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import useToast from '../../hooks/useToast';
import { animeRatingAPI } from '../../services/api';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${fadeIn} 0.2s ease;
`;

const ModalContent = styled.div`
  background: var(--cardBackground);
  border-radius: 14px;
  padding: 2.5rem 2rem 2rem 2rem;
  min-width: 340px;
  max-width: 95vw;
  box-shadow: 0 10px 32px rgba(0,0,0,0.25);
  position: relative;
  animation: ${fadeIn} 0.3s cubic-bezier(.4,1.2,.6,1);
`;

const ModalTitle = styled.h3`
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--textPrimary);
  margin-bottom: 1.5rem;
  text-align: center;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1.2rem;
  right: 1.2rem;
  background: none;
  border: none;
  color: var(--textSecondary);
  font-size: 1.2rem;
  cursor: pointer;
  z-index: 2;
  &:hover { color: var(--danger); }
`;

const StarsRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.2rem;
`;

const StarButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.active ? 'var(--accent)' : 'var(--textSecondary)'};
  font-size: 2.2rem;
  cursor: pointer;
  transition: all 0.2s;
  transform: ${props => props.active ? 'scale(1.15)' : 'scale(1)'};
  &:hover { color: var(--accent); transform: scale(1.2); }
`;

const RatingValue = styled.div`
  text-align: center;
  font-size: 1.1rem;
  color: var(--textPrimary);
  margin-bottom: 1.2rem;
`;

const CommentInput = styled.textarea`
  width: 100%;
  min-height: 60px;
  max-height: 120px;
  border-radius: 8px;
  border: 1px solid var(--borderColor);
  padding: 0.7rem 1rem;
  font-size: 1rem;
  color: var(--textPrimary);
  background: var(--backgroundLight);
  margin-bottom: 1.2rem;
  resize: vertical;
  transition: border 0.2s;
  &:focus { border-color: var(--primary); outline: none; }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
`;

const ModalButton = styled.button`
  padding: 0.7rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
  border: none;
  &.submit {
    background: var(--primary);
    color: white;
    &:hover { background: var(--primaryLight); }
    &:disabled { opacity: 0.6; cursor: not-allowed; }
  }
  &.cancel {
    background: transparent;
    color: var(--textPrimary);
    border: 1px solid var(--borderColor);
    &:hover { background: rgba(var(--backgroundLight-rgb), 0.5); }
  }
`;

const CharCount = styled.div`
  text-align: right;
  font-size: 0.85rem;
  color: var(--textSecondary);
  margin-bottom: 0.5rem;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 24px;
  height: 24px;
  border: 3px solid rgba(var(--primary-rgb), 0.3);
  border-radius: 50%;
  border-top-color: var(--primary);
  animation: spin 1s ease-in-out infinite;
  margin: 0 auto;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 2rem 0;
  color: var(--textSecondary);
`;

const ErrorMessage = styled.div`
  color: var(--danger);
  margin-bottom: 1rem;
  text-align: center;
  font-size: 0.9rem;
`;

export default function AnimeRatingModal({
  show,
  onClose,
  animeId,
  animeTitle,
  onSuccess,
}) {
  const { showToast } = useToast();
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user's previous rating on open
  useEffect(() => {
    if (show && animeId) {
      setFetching(true);
      setError(null);
      
      animeRatingAPI.getUserRatingForAnime(animeId)
        .then(res => {
          if (res && res.success && res.data) {
            setScore(res.data.score || 0);
            setComment(res.data.comment || '');
          } else {
            // Reset if no rating found
            setScore(0);
            setComment('');
          }
        })
        .catch(() => {
          // Reset on error
          setScore(0);
          setComment('');
        })
        .finally(() => setFetching(false));
    } else if (!show) {
      // Reset when modal closes
      setScore(0);
      setComment('');
      setError(null);
    }
  }, [show, animeId]);

  const handleSubmit = async () => {
    if (!score || score < 1 || score > 10) {
      setError('Please select a score between 1 and 10.');
      return;
    }
    
    if (comment.length > 500) {
      setError('Comment must be 500 characters or less.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await animeRatingAPI.rateAnime(animeId, score, comment);
      
      if (res && res.success) {
        showToast({ type: 'success', message: 'Your rating has been saved!' });
        onClose();
        if (onSuccess) onSuccess(res.data);
      } else {
        throw new Error(res?.error?.message || 'Failed to save rating');
      }
    } catch (err) {
      setError(err.message || 'Failed to save rating');
      showToast({ type: 'error', message: err.message || 'Failed to save rating' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRating = async () => {
    if (!animeId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await animeRatingAPI.deleteRating(animeId);
      
      if (res && res.success) {
        showToast({ type: 'success', message: 'Your rating has been removed!' });
        onClose();
        if (onSuccess) onSuccess(null);
      } else {
        throw new Error(res?.error?.message || 'Failed to remove rating');
      }
    } catch (err) {
      setError(err.message || 'Failed to remove rating');
      showToast({ type: 'error', message: err.message || 'Failed to remove rating' });
    } finally {
      setLoading(false);
    }
  };

  // If not shown, don't render
  if (!show) return null;

  // Use createPortal to render the modal at the root level of the DOM
  return createPortal(
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}><X size={22} /></CloseButton>
        <ModalTitle>Rate {animeTitle}</ModalTitle>
        
        {fetching ? (
          <LoadingContainer>
            <LoadingSpinner />
            <div style={{ marginTop: '1rem' }}>Loading your rating...</div>
          </LoadingContainer>
        ) : (
          <>
            <StarsRow>
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <StarButton
                  key={n}
                  active={n <= score}
                  onClick={() => setScore(n)}
                  aria-label={`Rate ${n}`}
                >
                  <Star />
                </StarButton>
              ))}
            </StarsRow>
            
            <RatingValue>
              {score > 0 ? `Your rating: ${score}/10` : 'Select a rating'}
            </RatingValue>
            
            <CharCount>{comment.length}/500</CharCount>
            <CommentInput
              maxLength={500}
              placeholder="Add a comment (optional)"
              value={comment}
              onChange={e => setComment(e.target.value)}
            />
            
            {error && <ErrorMessage>{error}</ErrorMessage>}
            
            <ModalActions>
              {score > 0 && (
                <ModalButton 
                  className="cancel" 
                  onClick={handleDeleteRating} 
                  disabled={loading || !animeId}
                >
                  Remove Rating
                </ModalButton>
              )}
              <ModalButton 
                className="cancel" 
                onClick={onClose} 
                disabled={loading}
              >
                Cancel
              </ModalButton>
              <ModalButton 
                className="submit" 
                onClick={handleSubmit} 
                disabled={loading || !score}
              >
                {loading ? 'Saving...' : 'Submit Rating'}
              </ModalButton>
            </ModalActions>
          </>
        )}
      </ModalContent>
    </ModalOverlay>,
    document.body
  );
} 