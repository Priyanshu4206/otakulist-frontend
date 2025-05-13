import React from 'react';
import styled from 'styled-components';

const Section = styled.section`
  width: 100%;
  margin-top: 2rem;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--textPrimary);
  margin-bottom: 1.2rem;
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

const HighlightsGrid = styled.div`
  padding: 1rem 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  @media (max-width: 900px) {
    grid-template-columns: 1fr 1fr;
  }
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const HighlightCard = styled.div`
  background: var(--cardBackground);
  border-radius: 14px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.07);
  padding: 1rem 1rem 0.8rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  animation: fadeInCard 0.7s cubic-bezier(0.23, 1, 0.32, 1);
`;

const HighlightImage = styled.div`
  width: 100%;
  aspect-ratio: 16/9;
  background: var(--backgroundLight);
  border-radius: 10px;
  margin-bottom: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: var(--primary);
  font-weight: 700;
`;

const HighlightTitle = styled.div`
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--textPrimary);
  margin-bottom: 0.3rem;
`;

const HighlightSubtitle = styled.div`
  font-size: 0.97rem;
  color: var(--textSecondary);
`;

const Footer = styled.footer`
  display: flex;
  margin-top: 2rem;
  align-items: center;
  justify-content: flex-end;
  gap: 2.5rem;
  font-size: 1rem;
  color: var(--textSecondary);

  @media (max-width: 600px) {
    margin: 1rem;
    gap: 0.7rem;
    justify-content: center;
  }
`;

const FooterLink = styled.a`
  color: var(--textSecondary);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
  &:hover {
    color: var(--primary);
    text-decoration: underline;
  }
`;

const dummyHighlights = [
  { id: 1, title: 'Fan Art of the Week', subtitle: "Check out this week's best fan creations!", img: '🎨' },
  { id: 2, title: 'Top Reviewer', subtitle: 'Congrats to @animefan123 for insightful reviews!', img: '🏆' },
  { id: 3, title: 'Cosplay Spotlight', subtitle: 'Amazing Demon Slayer cosplay by @cosplayer', img: '🧝‍♂️' },
];

const CommunityHighlightsSection = () => (
  <Section>
    <Title>Community highlights</Title>
    <HighlightsGrid>
      {dummyHighlights.map(item => (
        <HighlightCard key={item.id}>
          <HighlightImage>{item.img}</HighlightImage>
          <HighlightTitle>{item.title}</HighlightTitle>
          <HighlightSubtitle>{item.subtitle}</HighlightSubtitle>
        </HighlightCard>
      ))}
    </HighlightsGrid>
    <Footer>
          <FooterLink href="#">Help</FooterLink>
          <FooterLink href="#">About</FooterLink>
          <FooterLink href="#">Report</FooterLink>
        </Footer>
  </Section>
);

export default CommunityHighlightsSection; 