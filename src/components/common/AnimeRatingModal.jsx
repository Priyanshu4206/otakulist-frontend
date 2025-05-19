import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Star, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { animeAPI } from '../../services/api';
import LoadingSpinner from './LoadingSpinner';
import useToast from '../../hooks/useToast';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const scaleIn = keyframes`
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
`;

const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

// Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
  padding: 1rem;
  animation: ${fadeIn} 0.3s ease-out;
`;

const ModalContainer = styled.div`
  background: var(--cardBackground);
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  position: relative;
  animation: ${scaleIn} 0.4s ease-out;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  animation: slideIn 0.3s ease-out;
  
  @keyframes slideIn {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const ModalHeader = styled.div`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--borderColor);
  background: linear-gradient(to right, rgba(var(--primary-rgb), 0.1), transparent);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ModalTitle = styled.h3`
  font-size: 1.2rem;
  color: var(--textPrimary);
  font-weight: 600;
  margin: 0;
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
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(255, 105, 180, 0.3);
    color: var(--textPrimary);
  }
`;

const ModalBody = styled.div`
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, rgba(32, 34, 53, 0.9), rgba(25, 27, 43, 0.9));
`;

const AnimeTitleWrapper = styled.div`
  position: relative;
  margin-bottom: 1rem;
  text-align: center;
`;

const AnimeDecorator = styled.div`
  position: absolute;
  width: 100%;
  height: 2px;
  background: linear-gradient(to right, transparent, rgba(255, 105, 180, 0.7), transparent);
  bottom: -10px;
  left: 0;
`;

const AnimeTitle = styled.h4`
  margin-bottom: 1rem;
  font-size: 1.1rem;
  color: #fff;
  text-align: center;
  font-weight: 600;
  position: relative;
  padding-bottom: 0.5rem;
  display: inline-block;
  text-shadow: 0 0 8px rgba(255, 105, 180, 0.7);
  
  &::after {
    content: '★';
    position: absolute;
    bottom: -30px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 1.2rem;
    color: rgba(255, 215, 0, 0.8);
    animation: ${floatAnimation} 3s ease-in-out infinite;
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

const RatingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 90%;
  margin: 0 auto;
`;

const StarContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 50px;
  justify-content: center;
`;

const StarButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  position: relative;
  svg {
    width: 24px;
    height: 24px;
    color: ${props => props.filled ? '#FFD700' : 'rgba(255, 255, 255, 0.3)'};
    filter: ${props => props.filled ? 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.8))' : 'none'};
    transition: color 0.2s ease, filter 0.2s ease;
  }
`;

const RatingValue = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 0.5rem;
`;

const TextAreaContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 350px; 
`;

const StyledTextArea = styled.textarea`
  width: 100%;
  border-radius: 12px;
  border: 2px solid rgba(138, 43, 226, 0.3);
  padding: 12px;
  font-size: 15px;
  color: #fff;
  background: rgba(30, 31, 48, 0.7);
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.2);
  resize: none;
  transition: all 0.3s ease;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  
  &:focus {
    outline: none;
    border-color: rgba(255, 105, 180, 0.7);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const CharCount = styled.div`
  position: absolute;
  bottom: 8px;
  right: 12px;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
  
  @media (max-width: 480px) {
    gap: 0.75rem;
    margin-top: 1.5rem;
    flex-wrap: wrap;
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.8rem;
  border-radius: 50px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  z-index: 1;
  background: var(--gradientPrimary, linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%));
  color: #fff;

  &:disabled {
    background: linear-gradient(45deg, #666, #999);
    cursor: not-allowed;
    opacity: 0.7;
    box-shadow: none;
  }
`;

const CancelButton = styled(Button)`
  background: var(--modalHeaderBackground, var(--gradientPrimary));
  color: #fff;
`;

const SubmitButton = styled(Button)`
  background: var(--gradientPrimary, linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%));
  color: white;
`;

const RemoveButton = styled(Button)`
  background: linear-gradient(45deg, #e74c3c, #c0392b);
  color: white;
`;

const ErrorMessage = styled.div`
  color: #ff6b6b;
  margin-top: 1rem;
  text-align: center;
  font-size: 0.9rem;
  background: rgba(231, 76, 60, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border-left: 3px solid #e74c3c;
  
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
  const { showToast } = useToast();

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
      const response = await animeAPI.rateAnime(animeId, {score: rating, comment});
      if (response && response.success) {
        onSuccess && onSuccess();
        onClose();
        showToast({ type: 'success', message: 'Rating submitted successfully!' });
      } else {
        onClose();
        showToast({ type: 'error', message: response?.message || 'Failed to submit rating' });
      }
    } catch (err) {
      onClose();
      showToast({ type: 'error', message: 'Failed to submit rating' });
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
        showToast({ type: 'success', message: 'Rating removed successfully!' });
      } else {
        onClose();
        showToast({ type: 'error', message: response?.message || 'Failed to remove rating' });
      }
    } catch (err) {
      onClose();
      showToast({ type: 'error', message: 'Failed to remove rating' });
    } finally {
      setLoading(false);
    }
  };
  
  const renderStars = () => {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(value => (
      <StarButton
        key={value}
        filled={value <= (hoveredRating || rating)}
        onClick={() => setRating(value)}
        onMouseEnter={() => setHoveredRating(value)}
        onMouseLeave={() => setHoveredRating(0)}
        aria-label={`Rate ${value} stars`}
      >
        <Star />
      </StarButton>
    ));
  };
  
  if (!show) return null;
  
  return createPortal(
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Rate Anime</ModalTitle>
          <CloseButton onClick={onClose} aria-label="Close">
            <X size={24} />
          </CloseButton>
        </ModalHeader>
        <ModalBody>
          <AnimeTitleWrapper>
            <AnimeTitle>{animeTitle}</AnimeTitle>
            <AnimeDecorator />
          </AnimeTitleWrapper>
          
          {loading ? (
            <LoadingSpinner centered size="medium" />
          ) : (
            <RatingContainer>
              <StarContainer>
                {renderStars()}
              </StarContainer>
              
              <RatingValue>
                {rating || hoveredRating || 0} / 10
              </RatingValue>
              
              <TextAreaContainer>
                <StyledTextArea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Share your thoughts about this anime... (optional)"
                  maxLength={500}
                />
                <CharCount>{comment.length}/500</CharCount>
              </TextAreaContainer>
              
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