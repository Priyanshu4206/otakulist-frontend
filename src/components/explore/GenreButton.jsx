import React from 'react';
import styled from 'styled-components';
import { useGenreImage } from '../../hooks';

const ButtonWrapper = styled.button`
  position: relative;
  min-width: 120px;
  height: 40px;
  border-radius: 20px;
  background: ${props => props.active 
    ? 'var(--gradientPrimary)' 
    : 'rgba(var(--cardBackground-rgb), 0.7)'};
  border: 1.5px solid ${props => props.active 
    ? 'var(--primaryLight)' 
    : 'rgba(var(--borderColor-rgb), 0.2)'};
  color: ${props => props.active ? 'var(--textPrimary)' : 'var(--textSecondary)'};
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${props => props.active 
    ? '0 4px 10px rgba(var(--primary-rgb), 0.2)' 
    : 'none'};
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  text-transform: capitalize;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(var(--primary-rgb), 0.2);
    border-color: var(--primaryLight);
    background: ${props => props.active 
      ? 'var(--gradientPrimary)' 
      : 'rgba(var(--cardBackground-rgb), 0.9)'};
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ButtonContent = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ButtonBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: ${props => props.showImage ? 0.2 : 0};
  background-image: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'none'};
  background-size: cover;
  background-position: center;
  filter: blur(1px);
  transition: opacity 0.3s ease;
  z-index: 1;
`;

const GenreIcon = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  overflow: hidden;
  background-image: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'none'};
  background-size: cover;
  background-position: center;
  display: ${props => props.imageUrl ? 'block' : 'none'};
`;

const GenreCount = styled.span`
  font-size: 0.7rem;
  background: rgba(var(--primary-rgb), 0.2);
  color: var(--primary);
  padding: 0.1rem 0.3rem;
  border-radius: 10px;
  margin-left: 0.25rem;
`;

/**
 * Genre button component with dynamic image loading
 * 
 * @param {Object} props - Component props
 * @param {string|Object} props.genre - Genre name or genre object
 * @param {boolean} props.active - Whether the button is active
 * @param {Function} props.onClick - Click handler function
 * @param {boolean} props.showImage - Whether to show the genre image as background
 * @param {boolean} props.showCount - Whether to show anime count for this genre
 * @returns {JSX.Element} Genre button component
 */
const GenreButton = ({ 
  genre, 
  active = false, 
  onClick, 
  showImage = true,
  showCount = false
}) => {
  // Extract genre name and ID from genre object or string
  const genreName = typeof genre === 'string' ? genre : genre.name;
  const genreId = typeof genre === 'string' ? null : genre.id;
  const animeCount = typeof genre === 'string' ? null : genre.animeCount;
  
  // Get genre image using the custom hook
  const { imageUrl } = useGenreImage(genreName);
  
  return (
    <ButtonWrapper 
      active={active} 
      onClick={() => onClick && onClick(genreName, genreId)}
      aria-pressed={active}
    >
      <ButtonBackground 
        imageUrl={imageUrl} 
        showImage={showImage && active}
      />
      <ButtonContent>
        {imageUrl && <GenreIcon imageUrl={imageUrl} />}
        <span>{genreName}</span>
        {showCount && animeCount && <GenreCount>{animeCount}</GenreCount>}
      </ButtonContent>
    </ButtonWrapper>
  );
};

export default GenreButton; 