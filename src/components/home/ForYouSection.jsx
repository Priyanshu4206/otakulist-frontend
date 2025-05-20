import React from 'react';
import styled from 'styled-components';

const Section = styled.section`
  width: 100%;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--textPrimary);
  position: relative;
  margin-bottom: 1rem;

  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 60px;
    height: 3px;
    background: var(--gradientPrimary);
    border-radius: 2px;
  }
`;

const CardRow = styled.div`
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  padding: 1rem 0;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  
  &::-webkit-scrollbar { 
    height: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(var(--primary-rgb), 0.3);
    border-radius: 3px;
  }
  
  @media (max-width: 768px) {
    gap: 1rem;
    padding-bottom: 1.5rem;
  }
`;

const AnimeCard = styled.div`
  min-width: 280px;
  max-width: 320px;
  background: var(--cardBackground);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 1rem 0.75rem 1rem;
  scroll-snap-align: start;
  animation: fadeInCard 0.7s cubic-bezier(0.23, 1, 0.32, 1);
  
  @media (max-width: 768px) {
    min-width: 240px;
    max-width: 260px;
    border-radius: 14px;
    padding: 0.75rem 0.75rem 0.5rem 0.75rem;
  }
  
  @media (max-width: 480px) {
    min-width: 200px;
    max-width: 220px;
  }
  
  @keyframes fadeInCard {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const AnimeImage = styled.div`
  width: 100%;
  aspect-ratio: 16/10;
  background: var(--backgroundLight);
  border-radius: 12px;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: var(--primary);
  font-weight: 700;
  
  @media (max-width: 768px) {
    border-radius: 10px;
    font-size: 2rem;
  }
`;

const AnimeTitle = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--textPrimary);
  margin-bottom: 0.7rem;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 0.7rem;
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    gap: 0.5rem;
  }
  
  @media (max-width: 480px) {
    flex-direction: column;
    width: 100%;
    gap: 0.4rem;
  }
`;

const ActionButton = styled.button`
  background: var(--gradientAccent);
  color: var(--textPrimary);
  border: none;
  border-radius: 8px;
  padding: 0.4rem 1.1rem;
  font-size: 0.97rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
  
  @media (max-width: 768px) {
    padding: 0.35rem 0.9rem;
    font-size: 0.9rem;
    border-radius: 6px;
  }
  
  @media (max-width: 480px) {
    width: 100%;
    padding: 0.4rem 0.5rem;
  }
  
  &:hover {
    background: var(--gradientPrimary);
    transform: translateY(-2px) scale(1.04);
  }
`;

const dummyAnime = [
  { id: 1, title: 'Naruto: Shippuden', img: '🍥' },
  { id: 2, title: 'Attack on Titan', img: '🗡️' },
  { id: 3, title: 'One Piece', img: '🏴‍☠️' },
  { id: 4, title: 'Demon Slayer', img: '⚔️' },
];

const ForYouSection = () => (
  <Section>
    <Title>For you</Title>
    <CardRow>
      {dummyAnime.map(anime => (
        <AnimeCard key={anime.id}>
          <AnimeImage>{anime.img}</AnimeImage>
          <AnimeTitle>{anime.title}</AnimeTitle>
          <ButtonRow>
            <ActionButton>WATCHLIST</ActionButton>
            <ActionButton>PLAYLIST</ActionButton>
          </ButtonRow>
        </AnimeCard>
      ))}
    </CardRow>
  </Section>
);

export default ForYouSection; 