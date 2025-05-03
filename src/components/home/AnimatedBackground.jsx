import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import anime from 'animejs';
import { animeBackgrounds, svgElements } from '../../assets/anime-landscape';
import useTheme from '../../hooks/useTheme';

const BackgroundContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: -1;
`;

const BackgroundImage = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url(${props => props.src});
  background-size: cover;
  background-position: center;
  filter: brightness(${props => props.brightness || 0.7}) saturate(1.3);
  transition: all 0.5s ease;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.2) 0%,
      rgba(0, 0, 0, 0.4) 50%,
      rgba(0, 0, 0, 0.6) 100%
    );
  }
`;

const OverlayPattern = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: ${props => `linear-gradient(
    45deg,
    ${props.color1 || 'rgba(var(--primary-rgb), 0.3)'} 0%,
    ${props.color2 || 'rgba(var(--secondary-rgb), 0.3)'} 50%,
    ${props.color3 || 'rgba(var(--accent-rgb), 0.3)'} 100%
  )`};
  opacity: 0.5;
  mix-blend-mode: overlay;
`;

const FloatingElement = styled.div`
  position: absolute;
  pointer-events: none;
  opacity: 0.8;
  
  svg {
    width: 100%;
    height: 100%;
  }
`;

const StarField = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

const Star = styled.div`
  position: absolute;
  width: ${props => props.size || 2}px;
  height: ${props => props.size || 2}px;
  background-color: white;
  border-radius: 50%;
  opacity: ${props => props.opacity || 0.7};
`;

const AnimatedBackground = ({ backgroundType = 'night' }) => {
  const containerRef = useRef(null);
  const starsRef = useRef(null);
  const floatingElementsRef = useRef(null);
  const [backgroundImage, setBackgroundImage] = useState(animeBackgrounds.night);
  const { theme } = useTheme();
  
  useEffect(() => {
    // Set background based on type or use a random one
    if (backgroundType === 'random') {
      const keys = Object.keys(animeBackgrounds);
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      setBackgroundImage(animeBackgrounds[randomKey]);
    } else if (animeBackgrounds[backgroundType]) {
      setBackgroundImage(animeBackgrounds[backgroundType]);
    }
    
    // Create stars
    if (starsRef.current) {
      const stars = starsRef.current;
      stars.innerHTML = '';
      
      const starCount = window.innerWidth < 768 ? 50 : 100;
      
      for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.width = `${Math.random() * 3 + 1}px`;
        star.style.height = star.style.width;
        star.style.opacity = Math.random() * 0.5 + 0.3;
        star.style.backgroundColor = 'white';
        star.style.borderRadius = '50%';
        star.style.position = 'absolute';
        stars.appendChild(star);
      }
      
      // Animate stars twinkling
      anime({
        targets: stars.querySelectorAll('.star'),
        opacity: [
          { value: 0.1, duration: 700, easing: 'easeInOutQuad' },
          { value: 0.8, duration: 700, easing: 'easeInOutQuad' }
        ],
        scale: [
          { value: 0.8, duration: 700, easing: 'easeInOutQuad' },
          { value: 1.2, duration: 700, easing: 'easeInOutQuad' }
        ],
        delay: anime.stagger(200, { grid: [starCount, 1], from: 'center' }),
        loop: true,
        direction: 'alternate'
      });
    }
    
    // Create floating elements
    if (floatingElementsRef.current) {
      const elementsContainer = floatingElementsRef.current;
      elementsContainer.innerHTML = '';
      
      const isMobile = window.innerWidth < 768;
      const elementCount = isMobile ? 5 : 12;
      
      for (let i = 0; i < elementCount; i++) {
        const element = document.createElement('div');
        element.classList.add('floating-element');
        element.style.position = 'absolute';
        element.style.left = `${Math.random() * 100}%`;
        element.style.top = `${Math.random() * 100}%`;
        
        // Choose a random SVG element
        const svgKeys = Object.keys(svgElements);
        const randomKey = svgKeys[Math.floor(Math.random() * svgKeys.length)];
        element.innerHTML = svgElements[randomKey];
        
        // Set random size based on SVG type
        let size;
        if (randomKey === 'star') {
          size = Math.random() * 20 + 10; // 10-30px
        } else if (randomKey === 'cloud') {
          size = Math.random() * 80 + 40; // 40-120px
        } else {
          size = Math.random() * 30 + 15; // 15-45px
        }
        
        element.style.width = `${size}px`;
        element.style.height = `${size}px`;
        element.style.opacity = Math.random() * 0.3 + 0.3;
        elementsContainer.appendChild(element);
      }
      
      // Animate floating elements
      anime({
        targets: elementsContainer.querySelectorAll('.floating-element'),
        translateX: function() {
          return anime.random(-20, 20) + 'px';
        },
        translateY: function() {
          return anime.random(-20, 20) + 'px';
        },
        rotate: function() {
          return anime.random(-15, 15);
        },
        scale: function() {
          return 0.9 + anime.random(0, 0.3);
        },
        opacity: function() {
          return 0.3 + anime.random(0, 0.5);
        },
        duration: function() {
          return anime.random(3000, 6000);
        },
        delay: anime.stagger(200),
        loop: true,
        direction: 'alternate',
        easing: 'easeInOutSine'
      });
    }
    
    return () => {
      // Cleanup animations when component unmounts
      anime.remove(starsRef.current?.querySelectorAll('.star'));
      anime.remove(floatingElementsRef.current?.querySelectorAll('.floating-element'));
    };
  }, [backgroundType]);
  
  return (
    <BackgroundContainer ref={containerRef}>
      <BackgroundImage src={backgroundImage} />
      <OverlayPattern 
        color1={`rgba(${theme.primary.replace('#', '')}, 0.3)`} 
        color2={`rgba(${theme.secondary.replace('#', '')}, 0.3)`}
        color3={`rgba(${theme.accent.replace('#', '')}, 0.3)`}
      />
      <StarField ref={starsRef} />
      <div ref={floatingElementsRef} />
    </BackgroundContainer>
  );
};

export default AnimatedBackground; 