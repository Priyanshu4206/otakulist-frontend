import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { backgroundImages, themeGradients } from '../../assets/anime-landscape';
import useTheme from '../../hooks/useTheme';

const BackgroundContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100dvh;
  overflow: hidden;
  z-index: -1;
`;

const BackgroundImage = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url(${props => props.image});
  background-size: cover;
  background-position: center;
  opacity: ${props => props.active ? 1 : 0};
  transition: opacity 1.5s ease-in-out;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: ${props => props.gradient};
  }
`;

const SimplifiedBackground = () => {
  const { currentTheme, isDarkMode } = useTheme();
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  
  // Get theme-specific gradient overlay
  const getGradientOverlay = () => {
    // Check if we have a specific gradient for this theme
    if (themeGradients[currentTheme]) {
      return themeGradients[currentTheme];
    }
    
    // Fallback to light/dark gradients if specific one not found
    return isDarkMode ? themeGradients.fallbackDark : themeGradients.fallbackLight;
  };
  
  // Update background image periodically with a longer interval
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex(prevIndex => 
        prevIndex === backgroundImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 15000); // Change background every 15 seconds (increased from 10s)

    return () => clearInterval(interval);
  }, []);
  
  return (
    <BackgroundContainer>
      {/* Render only one background at a time with simple CSS transitions */}
      {backgroundImages.map((image, index) => (
        <BackgroundImage 
          key={`bg-${index}`}
          image={image}
          gradient={getGradientOverlay()}
          active={index === currentBgIndex}
        />
      ))}
    </BackgroundContainer>
  );
};

export default SimplifiedBackground; 