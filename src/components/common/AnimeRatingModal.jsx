import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Star, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import useToast from '../../hooks/useToast';
import { animeAPI } from '../../services/api';
import LoadingSpinner from './LoadingSpinner';

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
  z-index: 1000;
  backdrop-filter: blur(3px);
`;

const ModalContainer = styled.div`
  background-color: var(--cardBackground);
  border-radius: 12px;
  width: 500px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  position: relative;
  
  @media (max-width: 768px) {
    width: 450px;
  }
  
  @media (max-width: 480px) {
    width: 90%;
    border-radius: 10px;
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

const AnimeTitle = styled.h4`
  margin: 0 0 1.5rem 0;
  font-size: 1.2rem;
  color: var(--textPrimary);
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-bottom: 1.25rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
    margin-bottom: 1rem;
  }
`;

const RatingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  
  @media (max-width: 480px) {
    gap: 1rem;
  }
`;

const StarContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  
  @media (max-width: 480px) {
    gap: 0.3rem;
  }
`;

const StarButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.2);
  }
  
  svg {
    width: 32px;
    height: 32px;
    color: ${props => props.filled ? 'var(--warning)' : 'var(--textSecondary)'};
    transition: color 0.2s ease;
  }
  
  @media (max-width: 768px) {
    svg {
      width: 28px;
      height: 28px;
    }
  }
  
  @media (max-width: 480px) {
    padding: 0.15rem;
    
    svg {
      width: 24px;
      height: 24px;
    }
  }
`;

const RatingValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: var(--textPrimary);
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
  
  @media (max-width: 480px) {
    gap: 0.75rem;
    margin-top: 1.25rem;
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  @media (max-width: 768px) {
    padding: 0.7rem 1.3rem;
    font-size: 0.95rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.6rem 1.1rem;
    font-size: 0.9rem;
    border-radius: 6px;
  }
`;

const CancelButton = styled(Button)`
  background-color: var(--backgroundLight);
  color: var(--textSecondary);
  
  &:hover {
    background-color: var(--backgroundDark);
  }
`;

const SubmitButton = styled(Button)`
  background-color: var(--primary);
  color: white;
  
  &:hover {
    background-color: var(--primaryDark);
  }
  
  &:disabled {
    background-color: var(--disabledBackground);
    color: var(--disabledText);
    cursor: not-allowed;
  }
`;

const RemoveButton = styled(Button)`
  background-color: var(--error);
  color: white;
  
  &:hover {
    background-color: var(--errorDark);
  }
`;

const ErrorMessage = styled.div`
  color: var(--error);
  margin-top: 1rem;
  text-align: center;
  font-size: 0.9rem;
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
    margin-top: 0.75rem;
  }
`;

export default function AnimeRatingModal({
  show,
  onClose,
  animeId,
  animeTitle,
  userRating,
  onSuccess,
}) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (show) {
      if (userRating) {
        setRating(userRating.score || 0);
        setComment(userRating.comment || '');
      } else {
        setRating(0);
        setComment('');
      }
    }
  }, [show, userRating]);
  
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await animeAPI.rateAnime(animeId, rating, comment);
      if (response && response.success) {
        onSuccess && onSuccess();
        onClose();
      } else {
        setError(response?.message || 'Failed to submit rating');
      }
    } catch (err) {
      console.error('Error submitting rating:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRemoveRating = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await animeAPI.deleteRating(animeId);
      if (response && response.success) {
        onSuccess && onSuccess();
        onClose();
      } else {
        setError(response?.message || 'Failed to remove rating');
      }
    } catch (err) {
      console.error('Error removing rating:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  if (!show) return null;
  
  return createPortal(
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Rate Anime</ModalTitle>
          <CloseButton onClick={onClose}>
            <X size={24} />
          </CloseButton>
        </ModalHeader>
        <ModalBody>
          <AnimeTitle>{animeTitle}</AnimeTitle>
          
          {loading ? (
            <LoadingSpinner centered size="medium" />
          ) : (
            <RatingContainer>
              <StarContainer>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(value => (
                  <StarButton
                    key={value}
                    filled={value <= (hoveredRating || rating)}
                    onClick={() => setRating(value)}
                    onMouseEnter={() => setHoveredRating(value)}
                    onMouseLeave={() => setHoveredRating(0)}
                  >
                    <Star />
                  </StarButton>
                ))}
              </StarContainer>
              
              <RatingValue>{rating || hoveredRating || 0} / 10</RatingValue>
              
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Add a comment (optional)"
                maxLength={500}
                style={{
                  width: '100%',
                  minHeight: 60,
                  marginTop: 12,
                  borderRadius: 6,
                  border: '1px solid var(--borderColor)',
                  padding: 8,
                  fontSize: 15,
                  color: 'var(--textPrimary)',
                  background: 'var(--inputBackground)'
                }}
              />
              
              <ButtonContainer>
                <CancelButton onClick={onClose}>Cancel</CancelButton>
                {userRating && (
                  <RemoveButton onClick={handleRemoveRating}>Remove</RemoveButton>
                )}
                <SubmitButton onClick={handleSubmit} disabled={rating === 0}>
                  {userRating ? 'Update' : 'Submit'}
                </SubmitButton>
              </ButtonContainer>
              
              {error && <ErrorMessage>{error}</ErrorMessage>}
            </RatingContainer>
          )}
        </ModalBody>
      </ModalContainer>
    </ModalOverlay>,
    document.body
  );
} 