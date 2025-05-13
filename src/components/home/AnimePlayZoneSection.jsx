import React from 'react';
import styled from 'styled-components';

const Section = styled.section`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

const Title = styled.h2`
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--textPrimary);
  margin-bottom: 1rem;
`;

const PlayZoneButton = styled.button`
  width: 100%;
  background: var(--gradientAccent);
  color: var(--textPrimary);
  border: none;
  border-radius: 10px;
  padding: 1rem 1.2rem;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 0.2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  transition: background 0.2s, transform 0.2s;
  animation: fadeInCard 0.7s cubic-bezier(0.23, 1, 0.32, 1);
  &:hover {
    background: var(--gradientPrimary);
    transform: translateY(-2px) scale(1.03);
  }
`;

const AnimePlayZoneSection = () => {
  const handleRandomCharacter = () => alert('Random Character Generator!');
  const handleAlignmentQuiz = () => alert('Anime Alignment Quiz!');
  const handleOtakuBingo = () => alert('Otaku Bingo!');

  return (
    <Section>
      <Title>Anime PlayZone</Title>
      <PlayZoneButton onClick={handleRandomCharacter}>Random Character Generator</PlayZoneButton>
      <PlayZoneButton onClick={handleAlignmentQuiz}>Anime Alignment Quiz</PlayZoneButton>
      <PlayZoneButton onClick={handleOtakuBingo}>Otaku Bingo</PlayZoneButton>
    </Section>
  );
};

export default AnimePlayZoneSection; 