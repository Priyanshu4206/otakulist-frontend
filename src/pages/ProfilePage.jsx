import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Film, ListFilter, Clock, Trophy, Users, BarChart2, Heart } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import UserAvatar from '../components/common/UserAvatar';
import AchievementsList from '../components/common/AchievementsList';
import { userAPI, watchlistAPI } from '../services/api';
import useAuth from '../hooks/useAuth';

const PageContainer = styled.div`
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const PageHeader = styled.header`
  margin-bottom: 2rem;
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--textPrimary);
  letter-spacing: -0.5px;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const PageSubtitle = styled.p`
  font-size: 1rem;
  color: var(--textSecondary);
  margin-bottom: 1.5rem;
`;

const ProfileContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 3fr;
  gap: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ProfileSidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ProfileContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1.5rem;
`;

const Username = styled.h2`
  margin: 1rem 0 0.25rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--textPrimary);
`;

const DisplayName = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--textSecondary);
`;

const JoinDate = styled.div`
  font-size: 0.85rem;
  color: var(--textSecondary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const FollowButton = styled.button`
  background-color: var(--tertiary);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  
  &:hover {
    background-color: var(--tertiaryDark);
  }
  
  &:disabled {
    background-color: var(--borderColor);
    cursor: not-allowed;
  }
`;

const UnfollowButton = styled(FollowButton)`
  background-color: var(--cardBackground);
  color: var(--textPrimary);
  border: 1px solid var(--borderColor);
  
  &:hover {
    background-color: var(--dangerLight);
    color: var(--danger);
    border-color: var(--danger);
  }
`;

const SocialStats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  width: 100%;
  margin-top: 1rem;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem;
  border-radius: 8px;
  background-color: var(--backgroundLight);
`;

const StatValue = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--textPrimary);
`;

const StatLabel = styled.div`
  font-size: 0.8rem;
  color: var(--textSecondary);
`;

const WatchlistStatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
`;

const WatchlistStatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 1rem;
  border-radius: 8px;
  background-color: var(--cardBackground);
  border: 1px solid var(--borderColor);
`;

const WatchlistStatIcon = styled.div`
  color: var(--tertiary);
  margin-bottom: 0.5rem;
`;

const WatchlistStatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--textPrimary);
  margin-bottom: 0.25rem;
`;

const WatchlistStatLabel = styled.div`
  font-size: 0.85rem;
  color: var(--textSecondary);
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid var(--borderColor);
  margin-bottom: 1.5rem;
  overflow-x: auto;
  scrollbar-width: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const Tab = styled.button`
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  font-weight: ${props => props.active ? '600' : '400'};
  color: ${props => props.active ? 'var(--tertiary)' : 'var(--textSecondary)'};
  background: none;
  border: none;
  border-bottom: 2px solid ${props => props.active ? 'var(--tertiary)' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    color: var(--tertiary);
  }
`;

const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  color: var(--textSecondary);
`;

const ErrorState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  color: var(--danger);
`;

const TABS = {
  ACHIEVEMENTS: 'achievements',
  WATCHLIST: 'watchlist',
  ACTIVITY: 'activity',
  PLAYLISTS: 'playlists'
};

const ProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [profileData, setProfileData] = useState(null);
  const [watchlistStats, setWatchlistStats] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState(TABS.ACHIEVEMENTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        
        // Fetch user profile data
        const profileResponse = await userAPI.getProfile(username);
        
        if (profileResponse && profileResponse.success) {
          setProfileData(profileResponse.data);
          
          // Check if current user is following this profile
          if (user && profileResponse.data.followers) {
            setIsFollowing(profileResponse.data.followers.some(
              follower => follower.id === user.id
            ));
          }
          
          // Fetch watchlist stats if privacy settings allow
          if (profileResponse.data.settings?.showWatchlist !== false) {
            try {
              const watchlistResponse = await watchlistAPI.getWatchlist({
                username: username,
                countsOnly: true
              });
              
              if (watchlistResponse && watchlistResponse.success) {
                setWatchlistStats(watchlistResponse.data.counts);
              }
            } catch (watchlistError) {
              console.error('Error fetching watchlist stats:', watchlistError);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile. The user may not exist or the server is unavailable.');
      } finally {
        setLoading(false);
      }
    };
    
    if (username) {
      fetchProfileData();
    }
  }, [username, user]);
  
  const handleFollowToggle = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      if (isFollowing) {
        await userAPI.unfollowUser(profileData.id);
      } else {
        await userAPI.followUser(profileData.id);
      }
      
      // Toggle following state
      setIsFollowing(!isFollowing);
      
      // Update follower count
      setProfileData(prev => ({
        ...prev,
        followersCount: isFollowing 
          ? prev.followersCount - 1 
          : prev.followersCount + 1
      }));
    } catch (error) {
      console.error('Error toggling follow status:', error);
    }
  };
  
  const formatJoinDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  
  if (loading) {
    return (
      <Layout>
        <PageContainer>
          <LoadingState>Loading profile...</LoadingState>
        </PageContainer>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout>
        <PageContainer>
          <ErrorState>{error}</ErrorState>
        </PageContainer>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <PageContainer>
        {profileData && (
          <>
            <PageHeader>
              <PageTitle>{profileData.displayName || profileData.username}'s Profile</PageTitle>
              <PageSubtitle>User profile and statistics</PageSubtitle>
            </PageHeader>
            
            <ProfileContainer>
              <ProfileSidebar>
                <Card>
                  <ProfileInfo>
                    <UserAvatar 
                      src={profileData.avatarUrl} 
                      alt={profileData.displayName || profileData.username}
                      size={120}
                    />
                    <Username>{profileData.username}</Username>
                    {profileData.displayName && (
                      <DisplayName>{profileData.displayName}</DisplayName>
                    )}
                    <JoinDate>
                      <Calendar size={14} />
                      Joined {formatJoinDate(profileData.createdAt)}
                    </JoinDate>
                    
                    {profileData.bio && (
                      <p style={{ fontSize: '0.9rem', color: 'var(--textSecondary)' }}>
                        {profileData.bio}
                      </p>
                    )}
                    
                    {user && user.id !== profileData.id && (
                      isFollowing ? (
                        <UnfollowButton onClick={handleFollowToggle}>
                          <Users size={16} />
                          Unfollow
                        </UnfollowButton>
                      ) : (
                        <FollowButton onClick={handleFollowToggle}>
                          <Users size={16} />
                          Follow
                        </FollowButton>
                      )
                    )}
                    
                    <SocialStats>
                      <StatItem>
                        <StatValue>{profileData.followersCount || 0}</StatValue>
                        <StatLabel>Followers</StatLabel>
                      </StatItem>
                      <StatItem>
                        <StatValue>{profileData.followingCount || 0}</StatValue>
                        <StatLabel>Following</StatLabel>
                      </StatItem>
                    </SocialStats>
                  </ProfileInfo>
                </Card>
                
                {watchlistStats && (
                  <Card title="Watching Stats" icon={<BarChart2 size={18} />}>
                    <WatchlistStatsGrid>
                      <WatchlistStatItem>
                        <WatchlistStatIcon>
                          <Film size={20} />
                        </WatchlistStatIcon>
                        <WatchlistStatValue>{watchlistStats.watching || 0}</WatchlistStatValue>
                        <WatchlistStatLabel>Watching</WatchlistStatLabel>
                      </WatchlistStatItem>
                      
                      <WatchlistStatItem>
                        <WatchlistStatIcon>
                          <ListFilter size={20} />
                        </WatchlistStatIcon>
                        <WatchlistStatValue>{watchlistStats.completed || 0}</WatchlistStatValue>
                        <WatchlistStatLabel>Completed</WatchlistStatLabel>
                      </WatchlistStatItem>
                      
                      <WatchlistStatItem>
                        <WatchlistStatIcon>
                          <Clock size={20} />
                        </WatchlistStatIcon>
                        <WatchlistStatValue>{watchlistStats.plan_to_watch || 0}</WatchlistStatValue>
                        <WatchlistStatLabel>Plan to Watch</WatchlistStatLabel>
                      </WatchlistStatItem>
                      
                      <WatchlistStatItem>
                        <WatchlistStatIcon>
                          <Heart size={20} />
                        </WatchlistStatIcon>
                        <WatchlistStatValue>{watchlistStats.on_hold || 0}</WatchlistStatValue>
                        <WatchlistStatLabel>On Hold</WatchlistStatLabel>
                      </WatchlistStatItem>
                    </WatchlistStatsGrid>
                  </Card>
                )}
              </ProfileSidebar>
              
              <ProfileContent>
                <Card>
                  <TabsContainer>
                    <Tab 
                      active={activeTab === TABS.ACHIEVEMENTS}
                      onClick={() => setActiveTab(TABS.ACHIEVEMENTS)}
                    >
                      <Trophy size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                      Achievements
                    </Tab>
                    <Tab 
                      active={activeTab === TABS.WATCHLIST}
                      onClick={() => setActiveTab(TABS.WATCHLIST)}
                    >
                      <Film size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                      Watchlist
                    </Tab>
                    <Tab 
                      active={activeTab === TABS.ACTIVITY}
                      onClick={() => setActiveTab(TABS.ACTIVITY)}
                    >
                      <BarChart2 size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                      Activity
                    </Tab>
                    <Tab 
                      active={activeTab === TABS.PLAYLISTS}
                      onClick={() => setActiveTab(TABS.PLAYLISTS)}
                    >
                      <ListFilter size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                      Playlists
                    </Tab>
                  </TabsContainer>
                  
                  {activeTab === TABS.ACHIEVEMENTS && (
                    <div>
                      {profileData.settings?.showWatchlist !== false ? (
                        <AchievementsList username={username} showProgress={true} showCategory={true} />
                      ) : (
                        <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--textSecondary)' }}>
                          This user has chosen to keep their achievements private.
                        </div>
                      )}
                    </div>
                  )}
                  
                  {activeTab === TABS.WATCHLIST && (
                    <div>
                      {profileData.settings?.showWatchlist !== false ? (
                        <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--textSecondary)' }}>
                          Watchlist feature coming soon!
                        </div>
                      ) : (
                        <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--textSecondary)' }}>
                          This user has chosen to keep their watchlist private.
                        </div>
                      )}
                    </div>
                  )}
                  
                  {activeTab === TABS.ACTIVITY && (
                    <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--textSecondary)' }}>
                      Activity feed coming soon!
                    </div>
                  )}
                  
                  {activeTab === TABS.PLAYLISTS && (
                    <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--textSecondary)' }}>
                      Playlists feature coming soon!
                    </div>
                  )}
                </Card>
              </ProfileContent>
            </ProfileContainer>
          </>
        )}
      </PageContainer>
    </Layout>
  );
};

export default ProfilePage; 