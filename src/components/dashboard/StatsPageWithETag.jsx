import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { TrendingUp, Trophy, Users, Award, Check, Film, Heart, List, Clock } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { userAPI } from '../../services/api';
import AchievementsList from '../common/AchievementsList';
import { Link } from 'react-router-dom';
import useToast from '../../hooks/useToast';

// Styled components (same as StatsPage)
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
    margin-top: 0;
    margin-bottom: 1.25rem;
    font-size: 1.1rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--textPrimary);
    
    svg {
      color: var(--primary);
    }
  }
  
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
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

/**
 * StatsPageWithETag Component that uses the getDashboardSections API
 * This version demonstrates the improved pattern using conditional requests with ETag
 */
const StatsPageWithETag = () => {
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
  }, [user]);
  
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
  const currentRank = stats.achievements?.tier?.title || 'Newbie';
  const unlockedCount = achievements?.unlocked?.length || 0;
  const totalAchievements = allAchievements?.length || 0;
  const completionPercentage = Math.round((unlockedCount / totalAchievements) * 100) || 0;
  const tier = stats.achievements?.tier || {};
  
  return (
    <>
      <HeaderRow>
        <h2>Your Anime Stats</h2>
        <RefreshButton onClick={() => fetchDashboardData(true)} disabled={loading}>
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
      </StatsGrid>
      
      {/* Current Rank and Achievements */}
      <SectionTitle>
        <Trophy size={22} />
        Current Achievements
      </SectionTitle>
      
      <TopAchievements>
        {currentRank && (
          <StatItem style={{ maxWidth: '350px', margin: '0 auto 2rem auto' }}>
            <StatIcon style={{ backgroundColor: tier?.color || 'var(--primary)', color: 'white' }}>
              <Trophy size={24} />
            </StatIcon>
            <StatValue>{currentRank}</StatValue>
            <StatLabel>Current Rank ({unlockedCount}/{totalAchievements} - {completionPercentage}% Complete)</StatLabel>
          </StatItem>
        )}
      </TopAchievements>
      
      {/* Display Achievements */}
      {achievements?.unlocked?.length > 0 && (
        <div>
          <h3>Unlocked Achievements ({achievements.unlocked.length})</h3>
          <div className="achievements-grid">
            {achievements.unlocked.map(achievement => (
              <div key={achievement.id} className="achievement-card">
                <div className="achievement-icon">{achievement.iconUrl}</div>
                <div className="achievement-info">
                  <h4>{achievement.title}</h4>
                  <p>{achievement.description}</p>
                  <div className="achievement-meta">
                    <span className="achievement-points">+{achievement.points} points</span>
                    <span className="achievement-date">
                      {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* In Progress Achievements */}
      {achievements?.inProgress?.length > 0 && (
        <div>
          <h3>In Progress Achievements ({achievements.inProgress.length})</h3>
          <div className="achievements-grid">
            {achievements.inProgress.map(achievement => (
              <div key={achievement.id} className="achievement-card in-progress">
                <div className="achievement-icon">{achievement.iconUrl}</div>
                <div className="achievement-info">
                  <h4>{achievement.title}</h4>
                  <p>{achievement.description}</p>
                  <div className="achievement-progress">
                    <div 
                      className="progress-bar" 
                      style={{width: `${achievement.progress.percentage}%`}}
                    ></div>
                    <span className="progress-text">
                      {achievement.progress.current}/{achievement.progress.target} 
                      ({achievement.progress.percentage}%)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Next Achievements */}
      {achievements?.next?.length > 0 && (
        <div>
          <h3>Next Achievements ({achievements.next.length})</h3>
          <div className="achievements-grid">
            {achievements.next.map(achievement => (
              <div key={achievement.id} className="achievement-card locked">
                <div className="achievement-icon">{achievement.iconUrl}</div>
                <div className="achievement-info">
                  <h4>{achievement.title}</h4>
                  <p>{achievement.description}</p>
                  {achievement.progress && (
                    <div className="achievement-progress">
                      <div 
                        className="progress-bar" 
                        style={{width: `${achievement.progress.percentage}%`}}
                      ></div>
                      <span className="progress-text">
                        {achievement.progress.current}/{achievement.progress.target}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
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

export default StatsPageWithETag; 