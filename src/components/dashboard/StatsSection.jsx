import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { TrendingUp, Trophy, Users, Award, Check, Calendar, Film, Heart, List, Clock } from 'lucide-react';
import Card from '../common/Card';
import UserAvatar from '../common/UserAvatar';
import useAuth from '../../hooks/useAuth';
import { watchlistAPI } from '../../services/api';
import AchievementsList from '../common/AchievementsList';
import { Link } from 'react-router-dom';
import useToast from '../../hooks/useToast';

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const StatItem = styled.div`
  background-color: var(--cardBackground);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--borderColor);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, var(--primary), var(--primary));
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s ease;
  }
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    
    &::before {
      transform: scaleX(1);
    }
  }
`;

const StatIcon = styled.div`
  color: var(--primary);
  margin-bottom: 1rem;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background-color: rgba(var(--primary-rgb), 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  ${StatItem}:hover & {
    transform: scale(1.1);
    background-color: var(--primary);
    color: white;
  }
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: var(--textPrimary);
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;
  
  ${StatItem}:hover & {
    color: var(--primary);
  }
`;

const StatLabel = styled.div`
  font-size: 0.95rem;
  color: var(--textSecondary);
  font-weight: 500;
`;

const SectionTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  margin: 2rem 0 1.25rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--borderColor);
  color: var(--textPrimary);
  
  svg {
    color: var(--primary);
  }
`;

const SectionDivider = styled.div`
  border-top: 1px solid var(--borderColor);
  margin: 2.5rem 0;
  opacity: 0.5;
`;

const NoContent = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  color: var(--textSecondary);
  font-size: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  background-color: var(--backgroundLight);
  border-radius: 12px;
  border: 1px dashed var(--borderColor);
`;

const SocialContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2.5rem;
  margin-top: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SocialSection = styled.div`
  margin-bottom: 1.5rem;
`;

const SocialGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 1.25rem;
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const SocialItem = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  text-decoration: none;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const SocialName = styled.div`
  font-size: 0.85rem;
  margin-top: 0.5rem;
  color: var(--textPrimary);
  max-width: 100%;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  transition: color 0.2s ease;
  
  ${SocialItem}:hover & {
    color: var(--primary);
  }
`;

const HowToUnlock = styled.div`
  display: flex;
  flex-direction: column;
  background-color: var(--backgroundLight);
  padding: 2rem;
  border-radius: 12px;
  max-width: 650px;
  margin: 0 auto;
  text-align: left;
  border: 1px solid var(--borderColor);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  
  h4 {
    color: var(--textPrimary);
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1.1rem;
  }
  
  ul {
    list-style-type: none;
    padding-left: 0.5rem;
    margin-bottom: 1rem;
  }
  
  li {
    padding: 0.75rem 0;
    display: flex;
    align-items: center;
    gap: 1rem;
    border-bottom: 1px solid rgba(var(--borderColor-rgb), 0.5);
    
    &:last-child {
      border-bottom: none;
    }
  }
  
  li svg {
    color: var(--primary);
    background: rgba(var(--primary-rgb), 0.1);
    padding: 0.5rem;
    border-radius: 50%;
    flex-shrink: 0;
  }
`;

const LoadingText = styled.div`
  padding: 2rem;
  text-align: center;
  color: var(--textSecondary);
`;

const TopAchievements = styled.div`
  margin-bottom: 2rem;
`;

const StatsSection = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        // No need to fetch watchlist stats separately, they're included in user data
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stats data:', error);
        showToast({
          type: 'error',
          message: 'Error loading dashboard statistics'
        });
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, showToast]);
  
  if (loading) {
    return <LoadingText>Loading stats...</LoadingText>;
  }
  
  if (!user) {
    return <LoadingText>Please log in to view your stats</LoadingText>;
  }
  
  // Get values from user data
  const watching = user.watchlistStats?.watching || 0;
  const completed = user.achievements?.animeWatchedCount || 0;
  const totalInWatchlist = user.watchlistStats?.total || 0;
  const followersCount = user.followersCount || 0;
  const currentRank = user.achievements?.current || 'Newbie';
  const unlockedCount = user.achievements?.unlockedCount || 0;
  const totalAchievements = user.achievements?.totalAchievements || 0;
  const completionPercentage = user.achievements?.completionPercentage || 0;
  
  return (
    <>
      {/* Stats Grid */}
      <StatsGrid>
        <StatItem>
          <StatIcon>
            <TrendingUp size={24} />
          </StatIcon>
          <StatValue>{watching}</StatValue>
          <StatLabel>Watching</StatLabel>
        </StatItem>
        
        <StatItem>
          <StatIcon>
            <Check size={24} />
          </StatIcon>
          <StatValue>{completed}</StatValue>
          <StatLabel>Completed</StatLabel>
        </StatItem>
        
        <StatItem>
          <StatIcon>
            <List size={24} />
          </StatIcon>
          <StatValue>{totalInWatchlist}</StatValue>
          <StatLabel>In Watchlist</StatLabel>
        </StatItem>
        
        <StatItem>
          <StatIcon>
            <Users size={24} />
          </StatIcon>
          <StatValue>{followersCount}</StatValue>
          <StatLabel>Followers</StatLabel>
        </StatItem>
      </StatsGrid>
      
      {/* Current Rank and Achievements */}
      <SectionTitle>
        <Trophy size={22} />
        Current Achievements
      </SectionTitle>
      
      <TopAchievements>
        {currentRank && (
          <StatItem style={{ maxWidth: '350px', margin: '0 auto 2rem auto' }}>
            <StatIcon style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
              <Trophy size={24} />
            </StatIcon>
            <StatValue>{currentRank}</StatValue>
            <StatLabel>Current Rank ({unlockedCount}/{totalAchievements} - {completionPercentage}% Complete)</StatLabel>
          </StatItem>
        )}
      </TopAchievements>
      
      {user.achievements && <AchievementsList userData={user} showProgress={true} showCategory={true} />}
      
      <SectionDivider />
      
      {/* How to Unlock More */}
      <SectionTitle>
        <Award size={22} />
        How to Unlock More Achievements
      </SectionTitle>
      
      <HowToUnlock>
        <h4>
          <Trophy size={20} />
          Complete these actions to earn achievements:
        </h4>
        <ul>
          <li>
            <Film size={18} />
            <div>
              <strong>Watch more anime</strong> - Complete series to earn higher ranks
            </div>
          </li>
          <li>
            <Heart size={18} />
            <div>
              <strong>Diversify your genres</strong> - Watch anime from different genres to earn specialist badges
            </div>
          </li>
          <li>
            <List size={18} />
            <div>
              <strong>Build your collection</strong> - Add anime to your watchlist to earn collector achievements
            </div>
          </li>
          <li>
            <Users size={18} />
            <div>
              <strong>Grow your following</strong> - Share content and interact to earn social achievements
            </div>
          </li>
          <li>
            <Clock size={18} />
            <div>
              <strong>Stay active</strong> - Log in regularly and keep rating anime to earn special badges
            </div>
          </li>
        </ul>
      </HowToUnlock>
    </>
  );
};

export default StatsSection; 