import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import AchievementsList from '../components/common/AchievementsList';
import { userAPI, playlistAPI } from '../services/api';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';
import useApiCache from '../hooks/useApiCache';

// Import modular components
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileTabs, { TABS } from '../components/profile/ProfileTabs';
import PlaylistsSection from '../components/profile/PlaylistsSection';

// Import styles
import {
  PageContainer,
  ErrorState
} from '../components/profile/ProfileStyles';
import GameScreenLoader from '../components/settings/GameScreenLoader';
import styled from 'styled-components';
import { Lock, UserX, Award, ListFilter } from 'lucide-react';


const CenteredContentContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
`;

const CenteredContent = ({ children }) => (
  <CenteredContentContainer>{children}</CenteredContentContainer>
);

const ALL_ACHIEVEMENTS_CACHE_KEY = 'all_achievements_v2';
const ALL_ACHIEVEMENTS_TTL = 1000 * 60 * 60 * 24 * 30; // 30 days

const IllustrationContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem 2rem 1rem;
  text-align: center;
  color: var(--textSecondary);
`;

const AnimatedIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  svg {
    width: 72px;
    height: 72px;
    color: var(--primary);
    animation: bounce 1.6s infinite cubic-bezier(.68,-0.55,.27,1.55);
  }
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-12px); }
  }
`;

const ProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [profileData, setProfileData] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState(TABS.ACHIEVEMENTS);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  
  // Playlists state
  const [playlists, setPlaylists] = useState([]);
  const [playlistsLoading, setPlaylistsLoading] = useState(false);
  const [playlistsError, setPlaylistsError] = useState(null);
  const [playlistsPage, setPlaylistsPage] = useState(1);
  const [playlistsPagination, setPlaylistsPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });
  
  // Playlist likes state
  const [playlistLikes, setPlaylistLikes] = useState({});
  const [processingLike, setProcessingLike] = useState({});
  
  // Use useApiCache for allAchievements
  const { fetchWithCache: fetchAllAchievementsWithCache } = useApiCache('localStorage', ALL_ACHIEVEMENTS_TTL);

  // Fetch achievements when Achievements tab is active
  const [userAchievements, setUserAchievements] = useState([]);
  const [allAchievements, setAllAchievements] = useState([]);
  const [achievementsLoading, setAchievementsLoading] = useState(false);
  const [achievementsError, setAchievementsError] = useState(null);
  
  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch user profile data (new API)
        const profileResponse = await userAPI.getProfile(username);
        if (profileResponse && profileResponse.success) {
          setProfileData(profileResponse.data);
          if (user && user.username === profileResponse.data.username) {
            setIsOwner(true);
          } else {
            setIsOwner(false);
          }
          // Check if user is following this profile
          if (user && profileResponse.data.isFollowing !== undefined) {
            setIsFollowing(profileResponse.data.isFollowing);
          }
        } else {
          throw new Error(profileResponse?.error || 'Failed to load profile');
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
  
  // Fetch playlists
  useEffect(() => {
    const fetchPlaylists = async () => {
      if (activeTab !== TABS.PLAYLISTS) return;
      
      try {
        setPlaylistsLoading(true);
        setPlaylistsError(null);
        
        const response = await playlistAPI.getUserPlaylists(username, playlistsPage, 8);
        if (response && response.success) {
          setPlaylists(response.data || []);
          
          // Initialize liked state
          const likesState = {};
          response.data.forEach(playlist => {
            likesState[playlist._id] = {
              isLiked: playlist.isLiked || false,
              count: playlist.likesCount || 0
            };
          });
          setPlaylistLikes(likesState);
          
          setPlaylistsPagination(response.pagination || {
            page: 1,
            limit: 8,
            total: 0,
            pages: 1
          });
        } else {
          throw new Error(response?.error?.message || 'Failed to fetch playlists');
        }
      } catch (err) {
        console.error('Error fetching playlists:', err);
        setPlaylistsError('Failed to load playlists. Please try again later.');
      } finally {
        setPlaylistsLoading(false);
      }
    };
    
    if (username) {
      fetchPlaylists();
    }
  }, [username, activeTab, playlistsPage]);
  
  // Fetch achievements when Achievements tab is active
  useEffect(() => {
    const fetchAchievements = async () => {
      if (!profileData || activeTab !== TABS.ACHIEVEMENTS) return;
      setAchievementsLoading(true);
      setAchievementsError(null);
      try {
        // 1. Fetch user achievements (public profile)
        const userAchRes = await userAPI.getUserAchievements(profileData._id);
        setUserAchievements(userAchRes?.data || []);
        // 2. Fetch all achievements (cache for 30 days)
        const allAch = await fetchAllAchievementsWithCache(
          ALL_ACHIEVEMENTS_CACHE_KEY,
          () => userAPI.getAllAchievements()
        );
        setAllAchievements(allAch || []);
      } catch (err) {
        setAchievementsError('Failed to load achievements.');
      } finally {
        setAchievementsLoading(false);
      }
    };
    fetchAchievements();
  }, [profileData, activeTab, fetchAllAchievementsWithCache]);
  
  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setFollowLoading(true);
    try {
      if (isFollowing) {
        const response = await userAPI.unfollowUser(profileData._id);
        if (response.success) {
          showToast({
            type: 'success',
            message: `Unfollowed ${profileData.displayName || profileData.username}`
          });
          setIsFollowing(false);
          setProfileData(prev => ({
            ...prev,
            stats: {
              ...prev.stats,
              followersCount: prev.stats.followersCount - 1
            }
          }));
        } else {
          throw new Error(response.message || 'Failed to unfollow user');
        }
      } else {
        const response = await userAPI.followUser(profileData._id);
        if (response.success) {
          showToast({
            type: 'success',
            message: `Now following ${profileData.displayName || profileData.username}`
          });
          setIsFollowing(true);
          setProfileData(prev => ({
            ...prev,
            stats: {
              ...prev.stats,
              followersCount: prev.stats.followersCount + 1
            }
          }));
        } else {
          throw new Error(response.message || 'Failed to follow user');
        }
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
      showToast({
        type: 'error',
        message: error.message || 'Error updating follow status'
      });
    } finally {
      setFollowLoading(false);
    }
  };

  // Generate an array of page numbers for pagination
  const getPageNumbers = () => {
    const { page, pages } = playlistsPagination;
    let pageNumbers = [];
    
    if (pages <= 5) {
      // If 5 or fewer pages, show all
      for (let i = 1; i <= pages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always include first page
      pageNumbers.push(1);
      
      // Calculate range around current page
      let startPage = Math.max(2, page - 1);
      let endPage = Math.min(pages - 1, page + 1);
      
      // Adjust if at the beginning or end
      if (page <= 2) {
        endPage = 4;
      } else if (page >= pages - 1) {
        startPage = pages - 3;
      }
      
      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pageNumbers.push('...');
      }
      
      // Add pages in range
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (endPage < pages - 1) {
        pageNumbers.push('...');
      }
      
      // Always include last page
      pageNumbers.push(pages);
    }
    
    return pageNumbers;
  };
  
  // Handle playlist like
  const handleLikePlaylist = async (playlistId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // If user is not logged in
    if (!user) {
      showToast({
        type: 'info',
        message: 'Please log in to like playlists'
      });
      return;
    }
    
    if (isOwner) {
      showToast({
        type: 'info',
        message: 'You cannot like your own playlist'
      });
      return;
    }
    
    setProcessingLike(prev => ({ ...prev, [playlistId]: true }));
    
    try {
      const response = await playlistAPI.likePlaylist(playlistId);
      
      if (response && (response.success || response.liked !== undefined)) {
        // Handle different API response formats
        const liked = response.data?.liked !== undefined ? response.data.liked : response.liked;
        const likesCount = response.data?.likesCount !== undefined ? response.data.likesCount : response.likesCount;
        
        setPlaylistLikes(prev => ({
          ...prev,
          [playlistId]: {
            isLiked: liked,
            count: likesCount
          }
        }));
        
        showToast({
          type: 'success',
          message: liked 
            ? 'Added to liked playlists' 
            : 'Removed from liked playlists'
        });
      } else {
        throw new Error('Failed to like playlist');
      }
    } catch (error) {
      console.error('Error liking playlist:', error);
      showToast({
        type: 'error',
        message: 'Failed to like playlist: ' + (error.message || 'Unknown error')
      });
    } finally {
      setProcessingLike(prev => ({ ...prev, [playlistId]: false }));
    }
  };
  
  if (error) {
    return (
      <Layout>
        <PageContainer>
          <ErrorState>{error}</ErrorState>
        </PageContainer>
      </Layout>
    );
  }
  
  // Profile privacy logic
  const profileVisibility = profileData?.settings?.privacy?.profileVisibility;
  const isProfilePrivate = profileVisibility === 'private';
  const isFollowersOnly = profileVisibility === 'followers';
  const isViewerFollower = profileData?.isFollower; // backend should provide this

  if (!loading && profileData && !isOwner) {
    if (isProfilePrivate) {
      return (
        <Layout>
          <PageContainer>
            <IllustrationContainer>
              <AnimatedIcon>
                <Lock />
              </AnimatedIcon>
              <h2 style={{ color: 'var(--textPrimary)', marginBottom: '0.5rem' }}>This Account is Private</h2>
              <p style={{ maxWidth: 400, margin: '0 auto', color: 'var(--textSecondary)' }}>
                The user has set their profile to private. You do not have permission to view this profile.
              </p>
            </IllustrationContainer>
          </PageContainer>
        </Layout>
      );
    }
    if (isFollowersOnly && !isViewerFollower) {
      return (
        <Layout>
          <PageContainer>
            <IllustrationContainer>
              <AnimatedIcon>
                <UserX />
              </AnimatedIcon>
              <h2 style={{ color: 'var(--textPrimary)', marginBottom: '0.5rem' }}>Followers Only</h2>
              <p style={{ maxWidth: 400, margin: '0 auto', color: 'var(--textSecondary)' }}>
                This account is only visible to followers. Follow this user to request access to their profile.
              </p>
            </IllustrationContainer>
          </PageContainer>
        </Layout>
      );
    }
  }

  return (
    <Layout>
      <PageContainer>
        {loading && <GameScreenLoader text="Loading profile..." />}
        {profileData && (
          <CenteredContent>
            <ProfileHeader
              profileData={profileData}
              user={user}
              isOwner={isOwner}
              isFollowing={isFollowing}
              followLoading={followLoading}
              handleFollowToggle={handleFollowToggle}
              hideFollowers={!profileData.settings?.privacy?.showFollowers}
              hideFollowing={!profileData.settings?.privacy?.showFollowing}
              hideAchievements={!profileData.settings?.privacy?.showAchievements}
              hidePlaylists={!profileData.settings?.privacy?.showPlaylists}
            />
            <Card>
              <ProfileTabs 
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
              {activeTab === TABS.ACHIEVEMENTS && (
                <div>
                  {profileData.settings?.privacy?.showAchievements !== false ? (
                    achievementsLoading ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--textSecondary)' }}>Loading achievements...</div>
                    ) : achievementsError ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}>{achievementsError}</div>
                    ) : (
                      <AchievementsList
                        allAchievements={allAchievements}
                        userAchievements={userAchievements}
                        showProgress={true}
                        showCategory={true}
                        isPublicProfile={true}
                      />
                    )
                  ) : (
                    <IllustrationContainer>
                      <AnimatedIcon>
                        <Award />
                      </AnimatedIcon>
                      <h2 style={{ color: 'var(--textPrimary)', marginBottom: '0.5rem' }}>Achievements Are Private</h2>
                      <p style={{ maxWidth: 400, margin: '0 auto', color: 'var(--textSecondary)' }}>
                        This user has chosen to keep their achievements private.
                      </p>
                    </IllustrationContainer>
                  )}
                </div>
              )}
              {activeTab === TABS.PLAYLISTS && (
                profileData.settings?.privacy?.showPlaylists !== false ? (
                  <PlaylistsSection
                    playlists={playlists}
                    playlistsLoading={playlistsLoading}
                    playlistsError={playlistsError}
                    playlistLikes={playlistLikes}
                    processingLike={processingLike}
                    user={user}
                    isOwner={isOwner}
                    username={username}
                    profileData={profileData}
                    playlistsPage={playlistsPage}
                    playlistsPagination={playlistsPagination}
                    setPlaylistsPage={setPlaylistsPage}
                    handleLikePlaylist={handleLikePlaylist}
                    getPageNumbers={getPageNumbers}
                  />
                ) : (
                  <IllustrationContainer>
                    <AnimatedIcon>
                      <ListFilter />
                    </AnimatedIcon>
                    <h2 style={{ color: 'var(--textPrimary)', marginBottom: '0.5rem' }}>Playlists Are Private</h2>
                    <p style={{ maxWidth: 400, margin: '0 auto', color: 'var(--textSecondary)' }}>
                      This user has chosen to keep their playlists private.
                    </p>
                  </IllustrationContainer>
                )
              )}
            </Card>
          </CenteredContent>
        )}
      </PageContainer>
    </Layout>
  );
};

export default ProfilePage; 