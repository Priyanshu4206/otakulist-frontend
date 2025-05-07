import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Star, X } from 'lucide-react';
import useToast from '../../hooks/useToast';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6);
  z-index: 1000;
  display: ${props => (props.show ? 'flex' : 'none')};
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

export default function AnimeRatingModal({
  show,
  onClose,
  animeId,
  animeTitle,
  userAPI,
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
    if (show && animeId && userAPI) {
      setFetching(true);
      setError(null);
      userAPI.getUserAnimeRating(animeId)
        .then(res => {
          if (res && res.data && res.data.rating) {
            setScore(res.data.rating.score || 0);
            setComment(res.data.rating.comment || '');
          } else {
            setScore(0);
            setComment('');
          }
        })
        .catch(() => {
          setScore(0);
          setComment('');
        })
        .finally(() => setFetching(false));
    } else if (!show) {
      setScore(0);
      setComment('');
      setError(null);
    }
  }, [show, animeId, userAPI]);

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
      const res = await userAPI.rateAnime(animeId, { score, comment });
      if (res && res.success) {
        showToast({ type: 'success', message: 'Your rating has been saved!' });
        onClose();
        if (onSuccess) onSuccess();
      } else {
        throw new Error(res?.message || 'Failed to save rating');
      }
    } catch (err) {
      setError(err.message || 'Failed to save rating');
      showToast({ type: 'error', message: err.message || 'Failed to save rating' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalOverlay show={show}>
      <ModalContent>
        <CloseButton onClick={onClose}><X size={22} /></CloseButton>
        <ModalTitle>Rate {animeTitle}</ModalTitle>
        {fetching ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>Loading...</div>
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
            {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
            <ModalActions>
              <ModalButton className="cancel" onClick={onClose} disabled={loading}>Cancel</ModalButton>
              <ModalButton className="submit" onClick={handleSubmit} disabled={loading || !score}>
                {loading ? 'Saving...' : 'Submit Rating'}
              </ModalButton>
            </ModalActions>
          </>
        )}
      </ModalContent>
    </ModalOverlay>
  );
} 