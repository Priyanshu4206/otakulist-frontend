import React from 'react';
import styled from 'styled-components';
import LeaderboardSection from './LeaderboardSection';
import ActivityButtons from './ActivityButtons';
import useAuth from '../../hooks/useAuth';

const GridContainer = styled.section`
  display: flex;
  flex-direction: column;
  gap: 3rem;
  width: 100%;
  // margin-bottom: 2.5rem;
  overflow: hidden; /* Prevent overflow from children */
`;

const TopRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  width: 100%;
  
  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

const BottomRow = styled.div`
  width: 100%;
  overflow: visible; /* Allow scrollable content to be visible */
  padding: 0.5rem 0;
`;

const ScrollContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
`;

const GridItem = styled.div`
  width: 100%;
  height: 100%;
`;

const LeaderboardAndActivities = ({userStats}) => {
  const { isAuthenticated } = useAuth();
  
  return (
    <GridContainer>
      <TopRow>
        <GridItem>
          <ActivityButtons showActiveQuests={false} />
        </GridItem>
        <GridItem>
          <LeaderboardSection />
        </GridItem>
      </TopRow>
      
      {isAuthenticated && (
        <BottomRow>
          <ScrollContainer>
            <ActivityButtons showOnlyActiveQuests={true} userStats={userStats} />
          </ScrollContainer>
        </BottomRow>
      )}
    </GridContainer>
  );
};

export default LeaderboardAndActivities; 