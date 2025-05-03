import { useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { ChevronRight, ChevronLeft, User, MessageCircle, Award, Heart } from 'lucide-react';
import ShimmerCard from '../common/ShimmerCard';

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

const glowEffect = keyframes`
  0% {
    box-shadow: 0 0 10px rgba(var(--secondary-rgb), 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(var(--secondary-rgb), 0.5);
  }
  100% {
    box-shadow: 0 0 10px rgba(var(--secondary-rgb), 0.3);
  }
`;

const Section = styled.section`
  margin: 2rem 0;
`;

const SectionTitle = styled.h3`
  font-size: 1.8rem;
  color: var(--textPrimary);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  padding-bottom: 0.6rem;
  
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

const ScrollControls = styled.div`
  display: flex;
  gap: 0.8rem;
`;

const ScrollButton = styled.button`
  background-color: var(--cardBackground);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--textPrimary);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--gradientPrimary);
    color: white;
    transform: translateY(-3px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    color: var(--textSecondary);
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const ScrollContainer = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 1.5rem;
  padding: 1rem 0.25rem;
  scroll-behavior: smooth;
  position: relative;
  
  /* Custom scrollbar */
  scrollbar-width: thin;
  scrollbar-color: var(--secondary) var(--backgroundLight);
  
  &::-webkit-scrollbar {
    height: 5px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--backgroundLight);
    border-radius: 5px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--secondary);
    border-radius: 5px;
  }
`;

const CharacterCard = styled.div`
  min-width: 225px;
  background-color: var(--cardBackground);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
  transition: all 0.4s ease;
  position: relative;
  animation: ${fadeIn} 0.5s ease-out forwards;
  animation-delay: ${props => props.index * 0.1}s;
  opacity: 0;
  transform: translateY(10px);
  
  &:hover {
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
  }
`;

const CharacterImage = styled.div`
  width: 100%;
  height: 240px;
  overflow: hidden;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 50%;
    background: linear-gradient(to top, var(--cardBackground), transparent);
    opacity: 0.5;
    transition: opacity 0.3s ease;
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
    
    ${CharacterCard}:hover & {
      transform: scale(1.1);
    }
  }
`;

const CharacterInfo = styled.div`
  padding: 1.2rem;
  position: relative;
  z-index: 2;
  background: rgba(var(--cardBackground-rgb), 0.95);
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
  
  ${CharacterCard}:hover & {
    background: linear-gradient(135deg, 
      rgba(var(--cardBackground-rgb), 0.95), 
      rgba(var(--cardBackground-rgb), 0.9)
    );
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
`;

const CharacterName = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--textPrimary);
  transition: all 0.3s ease;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  height: 2.7rem;
  
  ${CharacterCard}:hover & {
    background: var(--gradientText);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    color: transparent;
  }
`;

const RoleWrapper = styled.div`
  margin-bottom: 0.75rem;
`;

const CharacterRole = styled.div`
  position: relative;
  font-size: 0.9rem;
  color: var(--textSecondary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  
  svg {
    color: var(--secondary);
  }

  
  ${CharacterCard}:hover &::before {
    width: 100%;
  }
`;

const RoleBadge = styled.span`
  background: ${props => props.isMain 
    ? 'var(--gradientPrimary)' 
    : 'var(--backgroundLight)'};
  color: ${props => props.isMain ? 'white' : 'var(--textSecondary)'};
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: ${props => props.isMain ? '600' : '400'};
  display: inline-block;
  margin-top: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  ${CharacterCard}:hover & {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const CharacterStats = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px dashed rgba(var(--borderColor-rgb), 0.5);
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  color: var(--textSecondary);
  
  svg {
    width: 14px;
    height: 14px;
    margin-right: 0.3rem;
    color: ${props => props.color || 'var(--secondary)'};
  }
  
  ${CharacterCard}:hover & {
    transform: translateY(-2px);
  }
`;

const CharacterJapanese = styled.div`
  font-size: 0.8rem;
  color: var(--textSecondary);
  margin-top: 0.5rem;
  font-style: italic;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const FavoriteBadge = styled.div`
  position: absolute;
  top: 0.8rem;
  right: 0.8rem;
  background: linear-gradient(135deg, var(--accent) 0%, #ff6b6b 100%);
  color: white;
  padding: 0.3rem;
  border-radius: 50%;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
  width: 32px;
  height: 32px;
  
  svg {
    stroke-width: 2.5px;
  }
  
  ${CharacterCard}:hover & {
    transform: scale(1.1);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: var(--textSecondary);
  font-size: 1rem;
  background-color: var(--cardBackground);
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
`;

const CharacterVoiceTag = styled.div`
  background: linear-gradient(135deg, var(--accent) 0%, var(--accentLight) 100%);
  color: white;
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  position: absolute;
  top: 5px;
  right: 5px;
`;

const CharactersList = ({ characters, loading }) => {
  const containerRef = useRef(null);
  
  // Handle scroll left
  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -700, behavior: 'smooth' });
    }
  };
  
  // Handle scroll right
  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 700, behavior: 'smooth' });
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <Section>
        <SectionTitle>Characters</SectionTitle>
        <ScrollContainer>
          {[...Array(5)].map((_, index) => (
            <ShimmerCard key={index} width="225px" height="380px" />
          ))}
        </ScrollContainer>
      </Section>
    );
  }
  
  // Render empty state
  if (!characters || characters.length === 0) {
    return (
      <Section>
        <SectionTitle>Characters</SectionTitle>
        <EmptyState>No character information available.</EmptyState>
      </Section>
    );
  }
  
  // Check if we need to extract data from the API response
  const characterItems = characters.data || characters;
  
  // Sort characters by role (main characters first)
  const sortedCharacters = [...characterItems].sort((a, b) => {
    // Get role information
    const roleA = a.role?.toLowerCase() || 
                 (a.animeRefs?.[0]?.role || '').toLowerCase();
    const roleB = b.role?.toLowerCase() || 
                 (b.animeRefs?.[0]?.role || '').toLowerCase();
    
    // Sort by main character first, then by favorites count
    if (roleA.includes('main') && !roleB.includes('main')) return -1;
    if (!roleA.includes('main') && roleB.includes('main')) return 1;
    
    // If both are main or both are not main, sort by favorites (if available)
    const favA = a.favorites || 0;
    const favB = b.favorites || 0;
    return favB - favA;
  });
  
  return (
    <Section>
      <SectionTitle>
        Characters
        <ScrollControls>
          <ScrollButton onClick={scrollLeft}>
            <ChevronLeft size={20} />
          </ScrollButton>
          <ScrollButton onClick={scrollRight}>
            <ChevronRight size={20} />
          </ScrollButton>
        </ScrollControls>
      </SectionTitle>
      
      <ScrollContainer ref={containerRef}>
        {sortedCharacters.map((character, index) => {
          // Extract character ID
          const characterId = character._id || character.malId || character.id;
          
          // Extract character image
          const imageUrl = character.images?.jpg?.imageUrl || 
                          character.images?.webp?.imageUrl || 
                          character.image || 
                          character.character?.image ||
                          'https://via.placeholder.com/225x350?text=No+Image';
                           
          // Extract character role
          const role = character.animeRefs?.[0]?.role || character.role || 'Character';
          const isMain = role.toLowerCase().includes('main');
          
          // Extract other details if available
          const favorites = character.favorites || 0;
          const japaneseName = character.nameJapanese || character.name_kanji || '';
          const nicknames = character.nicknames || [];
          const voiceActors = character.voiceActors || character.va || [];
          
          // Extract first voice actor if available
          const mainVoiceActor = voiceActors && voiceActors.length > 0 
            ? voiceActors[0]?.person?.name || voiceActors[0]?.name || ''
            : '';
          
          return (
            <CharacterCard key={characterId} index={index}>
              <CharacterImage>
                <img 
                  src={imageUrl} 
                  alt={character.name || character.character?.name} 
                  loading="lazy"
                />
                {favorites > 0 && (
                  <FavoriteBadge title={`${favorites} favorites`}>
                    <Heart size={16} fill="white" />
                  </FavoriteBadge>
                )}
              </CharacterImage>
              <CharacterInfo>
                <CharacterName>{character.name || character.character?.name}</CharacterName>
                
                {japaneseName && (
                  <CharacterJapanese>{japaneseName}</CharacterJapanese>
                )}
                
                <RoleWrapper>
                  <CharacterRole>
                    <User size={16} />
                    {role}
                  </CharacterRole>
                  <RoleBadge isMain={isMain}>
                    {isMain ? 'Main Character' : 'Supporting'}
                  </RoleBadge>
                </RoleWrapper>
                
                <CharacterStats>
                  {mainVoiceActor && (
                    <StatItem color="var(--accent)">
                      <MessageCircle size={14} />
                      <span>{mainVoiceActor}</span>
                    </StatItem>
                  )}
                  
                  {favorites > 0 && (
                    <StatItem color="#ff6b6b">
                      <Heart size={14} />
                      <span>{favorites.toLocaleString()}</span>
                    </StatItem>
                  )}
                </CharacterStats>
              </CharacterInfo>
            </CharacterCard>
          );
        })}
      </ScrollContainer>
    </Section>
  );
};

export default CharactersList; 