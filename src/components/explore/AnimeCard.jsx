import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

// Styled containers
const CardWrapper = styled(Link)`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 200px;
  min-width: 180px;
  height: 300px;
  border-radius: 12px;
  overflow: hidden;
  background-color: rgba(var(--cardBackground-rgb), 0.8);
  position: relative;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    
    img {
      transform: scale(1.05);
    }
    
    .overlay {
      opacity: 1;
    }
    
    .details {
      height: 100px;
    }
  }
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #1a1a2e;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50%;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
    z-index: 1;
  }
`;

const CardImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
`;

const CardOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 2;
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  
  &.overlay {
    transition: opacity 0.3s ease;
  }
`;

const CardDetails = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9) 40%, transparent);
  padding: 1rem;
  z-index: 3;
  height: 80px;
  transition: height 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  
  &.details {
    transition: height 0.3s ease;
  }
`;

const Title = styled.h3`
  margin: 0;
  padding: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const Subtitle = styled.p`
  margin: 0.3rem 0 0;
  padding: 0;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Rating = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(0, 0, 0, 0.6);
  color: gold;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.2rem;
  z-index: 4;
`;

const Badge = styled.span`
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  background: ${props => props.type === 'success' 
    ? 'rgba(39, 174, 96, 0.9)' 
    : props.type === 'primary' 
      ? 'rgba(var(--primary-rgb), 0.9)' 
      : 'rgba(0, 0, 0, 0.6)'};
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  z-index: 4;
`;

const GenresList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin-top: 0.5rem;
`;

const Genre = styled.span`
  background: rgba(var(--primary-rgb), 0.3);
  color: white;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  font-size: 0.65rem;
  white-space: nowrap;
`;

const ImagePlaceholder = styled.div`
  background: linear-gradient(135deg, #1a1a2e 0%, #333 100%);
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
`;

/**
 * Anime card component with lazy loading
 * 
 * @param {Object} props - Component props
 * @param {Object} props.anime - Anime data
 * @param {string} props.badge - Optional badge text
 * @param {string} props.badgeType - Badge type (success, primary, or default)
 * @param {boolean} props.showGenres - Whether to show genre tags
 * @param {number} props.maxGenres - Maximum number of genres to show
 * @returns {JSX.Element} Anime card component
 */
const AnimeCard = ({ 
  anime, 
  badge = '', 
  badgeType = 'default',
  showGenres = true,
  maxGenres = 2
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef(null);
  
  // Get title from the anime object
  const title = anime.title || anime.titles?.english || anime.titles?.default || 'Unknown Anime';
  
  // Get year
  const year = anime.year || 'Unknown year';
  
  // Get score
  const score = anime.score || anime.rating || '?';
  
  // Get up to maxGenres genres
  const genres = Array.isArray(anime.genres) 
    ? anime.genres
      .slice(0, maxGenres)
      .map(g => typeof g === 'string' ? g : g.name || '')
    : [];
  
  // Get image URL  
  const imageUrl = anime.image || anime.coverImage || anime.poster || 'https://via.placeholder.com/200x300?text=No+Image';
  
  // Lazy loading effect using IntersectionObserver
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };
    
    const handleIntersect = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Element is in view, load the image
          if (imageRef.current && !imageLoaded) {
            imageRef.current.src = imageUrl;
            imageRef.current.onload = () => setImageLoaded(true);
          }
          // Unobserve after loading
          observer.unobserve(entry.target);
        }
      });
    };
    
    const observer = new IntersectionObserver(handleIntersect, options);
    
    if (imageRef.current) {
      observer.observe(imageRef.current);
    }
    
    return () => {
      if (imageRef.current) {
        observer.unobserve(imageRef.current);
      }
    };
  }, [imageUrl, imageLoaded]);
  
  return (
    <CardWrapper to={`/anime/${anime.id}`}>
      <ImageContainer>
        {!imageLoaded && (
          <ImagePlaceholder>Loading...</ImagePlaceholder>
        )}
        <CardImage
          ref={imageRef}
          alt={title}
          loading="lazy"
        />
        
        <CardOverlay className="overlay" />
        
        <CardDetails className="details">
          <Title>{title}</Title>
          <Subtitle>{year}</Subtitle>
          
          {showGenres && genres.length > 0 && (
            <GenresList>
              {genres.map((genre, index) => (
                <Genre key={index}>{genre}</Genre>
              ))}
            </GenresList>
          )}
        </CardDetails>
        
        {score && (
          <Rating>
            <Star size={14} />
            {score}
          </Rating>
        )}
        
        {badge && <Badge type={badgeType}>{badge}</Badge>}
      </ImageContainer>
    </CardWrapper>
  );
};

export default AnimeCard; 