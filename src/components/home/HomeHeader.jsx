import React from 'react';
import styled from 'styled-components';
import { UserPlus, Shuffle } from 'lucide-react';
import HomeButton from './HomeButton';
import UserStatsDisplay from './UserStatsDisplay';
import useAuth from '../../hooks/useAuth';

const HeaderContainer = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1.7rem;
  width: 100%;
  margin-top: 1.5rem;
  align-items: flex-start;
  @media (max-width: 600px) {
    gap: 1.1rem;
    margin-top: 1rem;
  }
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  flex-wrap: wrap;
  gap: 1.5rem;
`;

const Title = styled.h1`
  font-size: 2.3rem;
  font-weight: 900;
  background: var(--gradientPrimary);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
  letter-spacing: -1px;
`;

const Tagline = styled.div`
  font-size: 1.18rem;
  color: var(--textSecondary);
  font-weight: 500;
  margin-bottom: 0.2rem;
  margin-top: 0.2rem;
  @media (max-width: 600px) {
    font-size: 1.05rem;
  }
`;

const ActionsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1.1rem;
  margin-top: 0.2rem;
  width: 100%;
  justify-content: space-between;
  
  @media (max-width: 1000px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }
  
  @media (max-width: 600px) {
    flex-direction: column;
    gap: 0.7rem;
    width: 100%;
  }
`;

const ButtonsGroup = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 600px) {
    flex-direction: column;
    width: 100%;
  }
`;

const HomeHeader = () => {
  const { user } = useAuth();
  
  // Dummy handlers
  const handleRandomAnime = () => alert('Random Anime!');
  const handleRandomAvatars = () => alert('Get 3 Random Anime Avatars!');

  return (
    <HeaderContainer>
      <TopRow>
        <Title>ANIMEVERSE</Title>
      </TopRow>
      <Tagline>
        Welcome to Animeverse — Your gateway to the world of anime. Discover, play, and connect with the community!
      </Tagline>
      <ActionsRow>
        <ButtonsGroup>
          <HomeButton
            icon={Shuffle}
            label="Get a Random Anime Suggestion"
            variant="primary"
            size="large"
            onClick={handleRandomAnime}
          />
          <HomeButton
            icon={UserPlus}
            label="Get 3 Random Anime Avatars"
            variant="secondary"
            size="large"
            onClick={handleRandomAvatars}
          />
        </ButtonsGroup>
        
        {user && <UserStatsDisplay />}
      </ActionsRow>
    </HeaderContainer>
  );
};

export default HomeHeader; 