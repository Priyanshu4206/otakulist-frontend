import React from 'react';
import styled from 'styled-components';

const EventBannerWrapper = styled.div`
  width: 100%;
  height: 200px;
  border-radius: 16px;
  background: linear-gradient(to right, var(--primary), #5b21b6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  margin-top: 3rem;
  position: relative;
  overflow: hidden;
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('/images/pattern.svg');
    opacity: 0.1;
  }
`;
const EventContent = styled.div`
  text-align: center;
  z-index: 1;
`;
const EventTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
`;
const EventButton = styled.button`
  padding: 0.75rem 2rem;
  background-color: white;
  color: var(--primary);
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }
`;

const EventBanner = () => (
  <EventBannerWrapper>
    <EventContent>
      <EventTitle>Join Our Summer Watch Fest</EventTitle>
      <EventButton>JOIN NOW</EventButton>
    </EventContent>
  </EventBannerWrapper>
);

export default EventBanner; 