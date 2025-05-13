import React from 'react';
import styled from 'styled-components';
import ScheduleContainer from '../schedule/ScheduleContainer';
import WhatsPoppinSection from './WhatsPoppinSection';

const GridContainer = styled.section`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2.5rem;
  width: 100%;
  margin-bottom: 2.5rem;
  
  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const GridItem = styled.div`
  width: 100%;
`;

const HomeGridSection = () => {
  return (
    <GridContainer>
      <GridItem>
        <ScheduleContainer />
      </GridItem>
      <GridItem>
        <WhatsPoppinSection />
      </GridItem>
    </GridContainer>
  );
};

export default HomeGridSection; 