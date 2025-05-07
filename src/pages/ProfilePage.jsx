import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import AchievementsList from '../components/common/AchievementsList';
import { userAPI, playlistAPI } from '../services/api';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';
import copyToClipboard from '../utils/copyToClipboard';

// Import modular components
import ProfileInfo from '../components/profile/ProfileInfo';
import ProfileTabs, { TABS } from '../components/profile/ProfileTabs';
import PlaylistsSection from '../components/profile/PlaylistsSection';

// Import styles
import {
  PageContainer,
  PageHeader,
  PageTitle,
  PageSubtitle,
  ProfileContainer,
  ProfileSidebar,
  ProfileContent,
  LoadingState,
  ErrorState
} from '../components/profile/ProfileStyles';

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
  
  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        
        // Fetch user profile data
        const profileResponse = await userAPI.getProfile(username);
        
        if (profileResponse && profileResponse.success) {
          setProfileData(profileResponse.data);
          
          if(user && user.username === profileResponse.data.username) {
            setIsOwner(true);
          }
          
          // Check if current user is following this profile
          if (user && profileResponse.data.followers) {
            setIsFollowing(profileResponse.data.followers.some(
              follower => follower.id === user.id
            ));
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
  
  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    setFollowLoading(true);
    try {
      if (isFollowing) {
        const response = await userAPI.unfollowUser(profileData.id);
        if (response.success) {
          showToast({
            type: 'success',
            message: `Unfollowed ${profileData.displayName || profileData.username}`
          });
        } else {
          throw new Error(response.message || 'Failed to unfollow user');
        }
      } else {
        const response = await userAPI.followUser(profileData.id);
        if (response.success) {
          showToast({
            type: 'success',
            message: `Now following ${profileData.displayName || profileData.username}`
          });
        } else {
          throw new Error(response.message || 'Failed to follow user');
        }
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
                <ProfileInfo 
                  profileData={profileData}
                  user={user}
                  isOwner={isOwner}
                  isFollowing={isFollowing}
                  followLoading={followLoading}
                  handleFollowToggle={handleFollowToggle}
                />
              </ProfileSidebar>
              
              <ProfileContent>
                <Card>
                  <ProfileTabs 
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                  />
                  
                  {activeTab === TABS.ACHIEVEMENTS && (
                    <div>
                      {profileData.settings?.showWatchlist !== false ? (
                        profileData.achievements ? (
                          <AchievementsList 
                            userData={profileData} 
                            showProgress={true} 
                            showCategory={true} 
                            isPublicProfile={true} 
                          />
                        ) : (
                          <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--textSecondary)' }}>
                            No achievements data available.
                          </div>
                        )
                      ) : (
                        <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--textSecondary)' }}>
                          This user has chosen to keep their achievements private.
                        </div>
                      )}
                    </div>
                  )}
                  
                  {activeTab === TABS.PLAYLISTS && (
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