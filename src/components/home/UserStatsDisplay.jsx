import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Trophy, TrendingUp, Star, Users } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { userAPI } from '../../services/api';
import useAuth from '../../hooks/useAuth';

const StatsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--cardBackground);
  border-radius: 12px;
  padding: 0.75rem 1.25rem;
  border: 1px solid var(--borderColor);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    border-color: var(--primary);
    transform: translateY(-2px);
  }
  
  @media (max-width: 600px) {
    width: 100%;
    justify-content: center;
  }
`;

const RankDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const RankInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const RankTitle = styled.div`
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--textPrimary);
`;

const PointsInfo = styled.div`
  font-size: 0.8rem;
  color: var(--textSecondary);
`;

const RankIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: ${props => props.color || 'rgba(var(--primary-rgb), 0.1)'};
  color: white;
`;

const Divider = styled.div`
  height: 24px;
  width: 1px;
  background-color: var(--borderColor);
`;

const StatsItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StatsValue = styled.div`
  font-weight: 700;
  font-size: 1rem;
  color: var(--textPrimary);
`;

const StatsLabel = styled.div`
  font-size: 0.7rem;
  color: var(--textSecondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ProgressBar = styled.div`
  width: 100px;
  height: 6px;
  background-color: rgba(var(--primary-rgb), 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin-top: 0.25rem;
`;

const ProgressFill = styled.div`
  height: 100%;
  background-color: var(--primary);
  width: ${props => props.percentage}%;
`;

/**
 * Dynamically load a Lucide icon by name
 * @param {string} iconName - The name of the icon to load
 * @param {number} size - Size of the icon
 * @returns React component
 */
const DynamicIcon = ({ iconName, size = 18, ...props }) => {
  const Icon = LucideIcons[iconName.charAt(0).toUpperCase() + iconName.slice(1)];
  
  if (!Icon) {
    // Fallback to a default icon if the requested one doesn't exist
    return <Trophy size={size} {...props} />;
  }
  
  return <Icon size={size} {...props} />;
};

/**
 * Component to display user stats with rank information
 */
const UserStatsDisplay = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cacheInfo, setCacheInfo] = useState({
    fromCache: false,
    notModified: false
  });

  // Fetch user stats when component mounts
  useEffect(() => {
    const fetchStats = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Fetch stats with ETag support
        const response = await userAPI.getUserStats({ useCache: true });
        
        if (response?.success) {
          setStats(response.data);
          setCacheInfo({
            fromCache: !!response.fromCache,
            notModified: !!response.notModified
          });
        }
      } catch (error) {
        console.error('Error fetching user stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
    
    // Setup refresh interval (every 5 minutes)
    const intervalId = setInterval(() => {
      if (user) {
        fetchStats();
      }
    }, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [user]);
  
  if (!user || loading || !stats) {
    return null;
  }
  
  // Get the tier and points
  const tier = stats.achievements?.tier || {};
  const points = stats.achievements?.points || 0;
  const nextTier = tier.nextTier || { minPoints: tier.minPoints + 100 };
  
  // Calculate progress percentage
  const progressStart = tier.minPoints || 0;
  const progressEnd = nextTier.minPoints;
  const progressCurrent = points - progressStart;
  const progressTotal = progressEnd - progressStart;
  const progressPercentage = Math.min(100, Math.round((progressCurrent / progressTotal) * 100)) || 0;
  
  // Format points remaining
  const pointsRemaining = Math.max(0, progressEnd - points);
  
  return (
    <StatsContainer>
      <RankDisplay>
        <RankIcon color={tier.color || 'var(--primary)'}>
          {tier.icon ? (
            <DynamicIcon iconName={tier.icon} />
          ) : (
            <Trophy size={18} />
          )}
        </RankIcon>
        <RankInfo>
          <RankTitle>{tier.title || 'Newbie'}</RankTitle>
          <PointsInfo>{points} XP</PointsInfo>
          <ProgressBar>
            <ProgressFill percentage={progressPercentage} />
          </ProgressBar>
        </RankInfo>
      </RankDisplay>
      
      <Divider />
      
      <StatsItem>
        <StatsValue>{stats.animeWatched || 0}</StatsValue>
        <StatsLabel>Watched</StatsLabel>
      </StatsItem>
      
      <Divider />
      
      <StatsItem>
        <StatsValue>{stats.achievementsUnlocked || stats.achievements?.unlocked || 0}</StatsValue>
        <StatsLabel>Achievements</StatsLabel>
      </StatsItem>
      
      <Divider />
      
      <StatsItem>
        <StatsValue>{stats.followersCount || 0}</StatsValue>
        <StatsLabel>Followers</StatsLabel>
      </StatsItem>
    </StatsContainer>
  );
};

export default UserStatsDisplay; 