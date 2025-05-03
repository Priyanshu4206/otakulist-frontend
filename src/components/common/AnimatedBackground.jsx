import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { backgroundImages, svgElements, themeGradients } from '../../assets/anime-landscape';
import useTheme from '../../hooks/useTheme';
// Background container
const BackgroundContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  z-index: -1;
`;

// Background image with gradient overlay
const BackgroundImage = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url(${props => props.image});
  background-size: cover;
  background-position: center;
  opacity: 0;

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

// Container for animated elements
const AnimatedElements = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
`;

// Star element with framer motion
const Star = styled(motion.div)`
  position: absolute;
  width: ${props => props.size || '2px'};
  height: ${props => props.size || '2px'};
  background-color: white;
  border-radius: 50%;
`;

// Floating element 
const FloatingElement = styled(motion.div)`
  position: absolute;
  width: ${props => props.size || '30px'};
  height: ${props => props.size || '30px'};
  color: ${props => props.color || 'rgba(255, 255, 255, 0.7)'};
  pointer-events: none;
`;

const AnimatedBackground = () => {
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
  
  // Update background image periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex(prevIndex => 
        prevIndex === backgroundImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 10000); // Change background every 10 seconds

    return () => clearInterval(interval);
  }, []);
  
  // Generate stars based on theme
  const renderStars = () => {
    // More stars for dark themes, fewer for light themes
    const starCount = isDarkMode ? 50 : 30;
    
    return Array.from({ length: starCount }).map((_, i) => {
      const size = Math.random() * 3 + 1;
      return (
        <Star
          key={`star-${i}`}
          size={`${size}px`}
          initial={{ opacity: 0.2, scale: 0.8 }}
          animate={{ 
            opacity: [0.2, 1, 0.2], 
            scale: [0.8, 1.2, 0.8] 
          }}
          transition={{ 
            duration: Math.random() * 3 + 2, 
            repeat: Infinity,
            delay: Math.random() * 3 
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      );
    });
  };
  
  // Generate floating elements (clouds, sakura)
  const renderFloatingElements = () => {
    // More elements for dark themes
    const elementCount = isDarkMode ? 15 : 10;
    const elements = [];
    
    for (let i = 0; i < elementCount; i++) {
      // Randomly choose element type
      const isCloud = Math.random() > 0.5;
      const elementType = isCloud ? 'cloud' : 'sakura';
      const size = isCloud ? 60 : 40;
      
      // Adjust color based on theme
      const color = isCloud 
        ? (isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.7)')
        : (isDarkMode ? 'rgba(255, 192, 203, 0.4)' : 'rgba(255, 192, 203, 0.7)');
        
      elements.push(
        <FloatingElement
          key={`element-${i}`}
          size={`${size}px`}
          color={color}
          dangerouslySetInnerHTML={{ __html: svgElements[elementType] }}
          initial={{ opacity: 0.3 }}
          animate={{ 
            x: [0, Math.random() * 40 - 20], 
            y: [0, Math.random() * 40 - 20],
            rotate: [0, Math.random() * 20 - 10],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            duration: Math.random() * 5 + 5, 
            ease: "easeInOut",
            repeat: Infinity, 
            repeatType: "reverse",
            delay: Math.random() * 2
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      );
    }
    
    return elements;
  };
  
  return (
    <BackgroundContainer>
      {/* Background images with theme-based gradient overlay */}
      <AnimatePresence>
        <BackgroundImage 
          key={`bg-${currentBgIndex}`}
          image={backgroundImages[currentBgIndex]}
          gradient={getGradientOverlay()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
        />
      </AnimatePresence>
      
      {/* Container for animated elements */}
      <AnimatedElements>
        {/* Twinkling stars */}
        {renderStars()}
        
        {/* Floating elements (clouds, sakura) */}
        {renderFloatingElements()}
      </AnimatedElements>
    </BackgroundContainer>
  );
};

export default AnimatedBackground; 