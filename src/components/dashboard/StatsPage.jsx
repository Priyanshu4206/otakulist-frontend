import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { TrendingUp, Trophy, Users, Award, Check, Film, Heart, List, Clock, RefreshCw } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import AchievementsList from '../common/AchievementsList';
import useToast from '../../hooks/useToast';
import { userAPI } from '../../services/modules';

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

const TopAchievements = styled.div`
  margin-bottom: 2rem;
`;

const LoadingText = styled.div`
  padding: 2rem;
  text-align: center;
  color: var(--textSecondary);
`;

const CacheStatus = styled.div`
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: ${props => props.fromCache ? 'rgba(var(--success-rgb), 0.1)' : 'rgba(var(--primary-rgb), 0.1)'};
  color: ${props => props.fromCache ? 'var(--success)' : 'var(--primary)'};
  max-width: fit-content;
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background-color: var(--backgroundLight);
  color: var(--textPrimary);
  border: 1px solid var(--borderColor);
  border-radius: 8px;
  padding: 0.6rem 1.2rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: auto;
  
  &:hover {
    background-color: rgba(var(--primary-rgb), 0.05);
    border-color: var(--primary);
    color: var(--primary);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const AchievementCategories = styled.div`
  margin-top: 2rem;
`;

const StatsPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [allAchievements, setAllAchievements] = useState([]);
  const [error, setError] = useState('');
  const [cacheInfo, setCacheInfo] = useState({
    fromCache: false,
    notModified: false
  });

  // Function to fetch dashboard data (stats and achievements)
  const fetchDashboardData = async (forceRefresh = false) => {
    setLoading(true);
    setError('');
    
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      // 1. Fetch user's stats and achievements in one call
      const response = await userAPI.getDashboardSections({
        sections: ['stats', 'achievements'],
        useCache: true,
        forceRefresh
      });
      
      if (response?.success) {
        setDashboardData(response.data);
        setCacheInfo({
          fromCache: !!response.fromCache,
          notModified: !!response.notModified
        });
      } else {
        throw new Error(response?.error || 'Failed to load dashboard data');
      }
      
      // 2. Fetch all achievements for reference (with caching)
      const allAchRes = await userAPI.getAllAchievements({ useCache: true });
      setAllAchievements(allAchRes?.data || []);
    } catch (err) {
      setError('Failed to load dashboard data.');
      showToast({ type: 'error', message: 'Error loading dashboard data' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    fetchDashboardData();
  }, [user, showToast]);
  
  if (loading && !dashboardData) {
    return <LoadingText>Loading stats...</LoadingText>;
  }
  
  if (!user) {
    return <LoadingText>Please log in to view your stats</LoadingText>;
  }
  
  // Extract stats and achievements data
  const stats = dashboardData?.stats || {};
  const achievements = dashboardData?.achievements || {};
  
  // Get values from dashboard data
  const watching = stats.animeWatching || 0;
  const completed = stats.animeWatched || 0;
  const totalInWatchlist = stats.totalWatchlist || 0;
  const followersCount = stats.followersCount || 0;
  const totalRatings = stats.totalRatings || 0;
  
  // Achievement stats
  const currentRank = stats.achievements?.tier?.title || 'Novice';
  const tierColor = stats.achievements?.tier?.color || '#8bc34a';
  const points = stats.achievements?.points || 0;
  const unlockedCount = achievements?.unlocked?.length || 0;
  const totalAchievements = allAchievements?.length || 0;
  const completionPercentage = stats.achievements?.completionPercentage || 
    Math.round((unlockedCount / (totalAchievements || 1)) * 100) || 0;
  
  // Format achievement data for AchievementsList component
  const formattedUnlocked = achievements?.unlocked?.map(achievement => ({
    achievementId: {
      _id: achievement.id,
      title: achievement.title,
      description: achievement.description,
      category: achievement.category,
      iconUrl: achievement.iconUrl,
      points: achievement.points
    },
    unlockedAt: achievement.unlockedAt,
    progress: {
      current: 100,
      target: 100,
      percentage: 100
    }
  })) || [];
  
  const formattedInProgress = achievements?.inProgress?.map(achievement => ({
    achievementId: {
      _id: achievement.id,
      title: achievement.title,
      description: achievement.description,
      category: achievement.category,
      iconUrl: achievement.iconUrl,
      points: achievement.points
    },
    progress: achievement.progress,
    unlockedAt: null
  })) || [];
  
  const formattedNext = achievements?.next?.map(achievement => ({
    achievementId: {
      _id: achievement.id,
      title: achievement.title,
      description: achievement.description,
      category: achievement.category,
      iconUrl: achievement.iconUrl,
      points: achievement.points
    },
    progress: achievement.progress,
    unlockedAt: null
  })) || [];
  
  // Combine all achievement entries for the AchievementsList
  const userAchievements = [...formattedUnlocked, ...formattedInProgress, ...formattedNext];
  
  return (
    <>
      <HeaderRow>
        <h2>Your Anime Stats</h2>
        <RefreshButton onClick={() => fetchDashboardData(true)} disabled={loading}>
          <RefreshCw size={16} />
          {loading ? 'Refreshing...' : 'Refresh Stats'}
        </RefreshButton>
      </HeaderRow>
      
      {(cacheInfo.fromCache || cacheInfo.notModified) && (
        <CacheStatus fromCache={cacheInfo.fromCache}>
          {cacheInfo.notModified 
            ? '✓ Data is up-to-date (304 Not Modified)' 
            : '✓ Using cached data'}
        </CacheStatus>
      )}
      
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

        {totalRatings > 0 && (
          <StatItem>
            <StatIcon>
              <Heart size={24} />
            </StatIcon>
            <StatValue>{totalRatings}</StatValue>
            <StatLabel>Ratings</StatLabel>
          </StatItem>
        )}
      </StatsGrid>
      
      {/* Current Rank and Achievements */}
      <SectionTitle>
        <Trophy size={22} />
        Current Achievements
      </SectionTitle>
      
      <TopAchievements>
        <StatItem style={{ maxWidth: '350px', margin: '0 auto 2rem auto' }}>
          <StatIcon style={{ backgroundColor: tierColor, color: 'white' }}>
            <Trophy size={24} />
          </StatIcon>
          <StatValue>{currentRank}</StatValue>
          <StatLabel>{points} Points ({unlockedCount}/{totalAchievements} - {completionPercentage}% Complete)</StatLabel>
        </StatItem>
      </TopAchievements>
      
      <AchievementCategories>
        <AchievementsList 
          allAchievements={allAchievements} 
          userAchievements={userAchievements} 
          showProgress={true} 
          showCategory={true} 
          isPublicProfile={false}
        />
      </AchievementCategories>
    </>
  );
};

export default StatsPage; 