import React from 'react';
import Layout from '../components/layout/Layout';
import ForYouSection from '../components/home/ForYouSection';
import ExploreGenresSection from '../components/home/ExploreGenresSection';
import AnimePlayZoneSection from '../components/home/AnimePlayZoneSection';
import CommunityHighlightsSection from '../components/home/CommunityHighlightsSection';
import HomePageHeader from '../components/home/HomePageHeader';
import HomeGridSection from '../components/home/HomeGridSection';
import styled from 'styled-components';
import animeBackground from '../assets/images/home-bg.jpeg';

const AnimeBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  background: ${({ image }) => image ? `url(${image}) center center / cover no-repeat` : 'none'};
  filter: blur(18px) brightness(0.5) saturate(1.2);
  pointer-events: none;
  transition: background 0.4s;
  &::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(20, 20, 30, 0.7);
    z-index: 1;
  }
`;

const HomePageContainer = styled.div`
  width: 100%;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  padding: 2rem 2rem 1rem 2rem;
  gap: 2.5rem;
  animation: fadeInUp 0.7s cubic-bezier(0.23, 1, 0.32, 1);

  @media (max-width: 768px) {
    padding: 1rem;
  }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(40px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const HomePage = () => (
  <Layout>
    <AnimeBackground image={animeBackground} />
    <HomePageContainer>
      <HomePageHeader />
      <ForYouSection />
      <HomeGridSection />
      {/* <AnimePlayZoneSection /> */}
      <ExploreGenresSection />
      <CommunityHighlightsSection />
    </HomePageContainer>
  </Layout>
);

export default HomePage; 