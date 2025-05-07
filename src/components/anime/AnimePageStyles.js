import styled, { keyframes } from 'styled-components';

// Animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const scaleIn = keyframes`
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

// Main layout components
const PageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  animation: ${fadeIn} 0.6s ease-out;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const AnimePageGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  
  @media (min-width: 992px) {
    grid-template-columns: 300px 1fr;
  }
`;

const LeftSidebar = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const MainContent = styled.main`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

// Poster and sidebar components
const PosterContainer = styled.div`
  position: relative;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 15px 25px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  animation: ${scaleIn} 0.7s ease-out;
  height: fit-content;

  &:hover {
    box-shadow: 0 20px 30px rgba(0, 0, 0, 0.3);
  }
  
  &::before {
    content: '';
    display: block;
    padding-top: 140%;
  }
  
  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }
`;

const ShimmerOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 3s infinite linear;
  pointer-events: none;
`;

const QuickInfoCard = styled.div`
  background-color: var(--cardBackground);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  animation: ${fadeIn} 0.7s ease-out;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 5px;
    height: 100%;
    background: var(--gradientPrimary);
    transform: scaleY(1);
    transform-origin: bottom;
    transition: transform 0.4s ease;
  }
`;

const QuickInfoTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: var(--textPrimary);
  border-bottom: 2px solid var(--borderColor);
  padding-bottom: 0.5rem;
`;

const QuickInfoGrid = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.5rem 1rem;
`;

const InfoLabel = styled.span`
  font-size: 0.9rem;
  color: var(--textSecondary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    color: var(--secondary);
    width: 16px;
    height: 16px;
  }
`;

const InfoValue = styled.span`
  font-size: 0.95rem;
  color: var(--textPrimary);
  font-weight: 500;
`;

const ScoreDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  
  svg {
    color: var(--accent);
  }
`;

const ScoreValue = styled.span`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--textPrimary);
`;

const ScoreLabel = styled.span`
  font-size: 0.8rem;
  color: var(--textSecondary);
`;

// Header and title components
const AnimeHeaderSection = styled.div`
  margin-bottom: 2rem;
`;

const AnimeTitle = styled.h1`
  font-size: 2.5rem;
  color: var(--textPrimary);
  margin-bottom: 0.6rem;
  font-weight: 800;
  background: var(--gradientPrimary);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const AlternativeTitles = styled.div`
  margin-bottom: 1.5rem;
  color: var(--textSecondary);
  font-size: 1rem;
  padding: 1rem;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border-left: 4px solid var(--secondary);
  backdrop-filter: blur(5px);
  
  div {
    margin: 0.5rem 0;
  }
`;

// Content section components
const ContentSection = styled.section`
  position: relative;
  animation: ${fadeIn} ${props => props.delay || '0.8s'} ease-out;
  border-radius: 16px;
  overflow: hidden;
  padding: 1.5rem;
  box-shadow: ${props => props.shadow ? '0 5px 15px rgba(0, 0, 0, 0.1)' : 'none'};
  grid-column: 1 / 3;
`;

const SectionHeading = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 1.2rem;
  position: relative;
  color: var(--textPrimary);
  padding-bottom: 0.6rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  svg {
    color: var(--secondary);
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 60px;
    height: 4px;
    background: var(--gradientSecondary);
    border-radius: 2px;
  }
`;

const Synopsis = styled.div`
  color: var(--textPrimary);
  line-height: 1.8;
  
  p {
    margin-bottom: 1.2rem;
    font-size: 1.05rem;
  }
`;

const VideoContainer = styled.div`
  position: relative;
  padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
  height: 0;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 15px 25px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  margin-top: 1rem;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 30px rgba(0, 0, 0, 0.3);
  }
  
  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 0;
  }
`;

const GradientBackground = styled.div`
  position: absolute;
  top: -100px;
  left: 0;
  right: 0;
  height: 500px;
  background: linear-gradient(180deg, var(--backgroundDark) 0%, transparent 100%);
  z-index: -1;
  opacity: 0.6;
`;

// Message components
const ErrorMessage = styled.div`
  text-align: center;
  padding: 3rem;
  color: var(--error);
  background-color: var(--cardBackground);
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  margin: 0 auto;
  
  h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
`;

const NoContentMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--textSecondary);
  background-color: rgba(var(--backgroundLight-rgb), 0.1);
  border-radius: 12px;
  margin: 1rem 0;
  font-style: italic;
`;

// Theme songs section
const ThemeSongsSection = styled.div`
  margin-top: 1rem;
`;

const ThemeCategory = styled.div`
  margin-bottom: 1.5rem;
`;

const ThemeCategoryTitle = styled.h4`
  font-size: 1.1rem;
  color: var(--textPrimary);
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    color: var(--secondary);
  }
`;

const ThemeItem = styled.div`
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.2), rgba(var(--primaryLight-rgb), 0.5));
  border-radius: 8px;
  margin-bottom: 0.5rem;
  transition: all 0.2s ease;
  width: fit-content;
`;

// External links section
const ExternalLinksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const ExternalLinkButton = styled.a`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background-color: rgba(var(--backgroundLight-rgb), 0.2);
  border-radius: 8px;
  color: var(--textPrimary);
  text-decoration: none;
  transition: all 0.2s ease;
  
  svg {
    color: var(--secondary);
  }
  
  &:hover {
    background-color: rgba(var(--primary-rgb), 0.1);
    transform: translateY(-3px);
  }
`;

// Genre badges
const GenreBadge = styled.span`
  display: inline-block;
  margin-right: 0.6rem;
  margin-bottom: 0.6rem;
  padding: 0.4rem 0.8rem;
  background: ${props => props.index % 3 === 0
    ? 'linear-gradient(135deg, var(--primary), var(--primaryLight))'
    : props.index % 3 === 1
      ? 'linear-gradient(135deg, var(--secondary), var(--secondaryLight))'
      : 'linear-gradient(135deg, var(--accent), var(--accentLight))'};
  color: white;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 500;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
    transform: translateY(-2px);
  }
`;

const GenresContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: 1rem;
`;


export {
  PageContainer,
  AnimePageGrid,
  LeftSidebar,
  MainContent,
  PosterContainer,
  ShimmerOverlay,
  QuickInfoCard,
  QuickInfoTitle,
  QuickInfoGrid,
  InfoLabel,
  InfoValue,
  ScoreDisplay,
  ScoreValue,
  ScoreLabel,
  AnimeHeaderSection,
  AnimeTitle,
  AlternativeTitles,
  ContentSection,
  SectionHeading,
  Synopsis,
  VideoContainer,
  GradientBackground,
  ErrorMessage,
  NoContentMessage,
  ThemeSongsSection,
  ThemeCategory,
  ThemeCategoryTitle,
  ThemeItem,
  ExternalLinksGrid,
  ExternalLinkButton,
  GenreBadge,
  GenresContainer
};