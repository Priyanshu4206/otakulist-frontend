import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import AchievementsList from '../components/common/AchievementsList';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';
import { userAPI, playlistAPI } from '../services/api';

// Import modular components
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileTabs, { TABS } from '../components/profile/ProfileTabs';
import PlaylistsSection from '../components/profile/PlaylistsSection';

// Import styles
import {
  PageContainer,
  ErrorState,
  ProfileGridContainer,
  ProfileSidePanel,
  ProfileMainPanel,
  ProfileSection,
  SectionTitle,
  PreferencesGrid,
  PreferenceItem,
  PreferenceLabel,
  PreferenceValue,
  GenreTag,
  GenresContainer,
  SocialLinks,
  SocialLink,
  LocationInfo,
} from '../components/profile/ProfileStyles';
import GameScreenLoader from '../components/settings/GameScreenLoader';
import styled from 'styled-components';
import { Lock, UserX, Award, ListFilter, Share2, MapPin, Gamepad2, Star } from 'lucide-react';


const CenteredContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`;

const CenteredContent = ({ children }) => (
  <CenteredContentContainer>{children}</CenteredContentContainer>
);

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
          setProfileData(profileResponse?.data || {});
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
          setPlaylists(response?.data?.items || []);
          
          // Initialize liked state
          const likesState = {};
          response?.data?.items?.forEach(playlist => {
            likesState[playlist._id] = {
              isLiked: playlist.isLiked || false,
              count: playlist.likesCount || 0
            };
          });
          setPlaylistLikes(likesState);
          
          setPlaylistsPagination(response?.data?.pagination || {
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
        // const userAchRes = await userAPI.getUserAchievements(profileData._id);
        // setUserAchievements(userAchRes?.data || []);
        setUserAchievements(profileData?.recentAchievements || []);
        
        // 2. Fetch all achievements for reference (with ETag support)
        const allAchRes = await userAPI.getAllAchievements({ useCache: true });
        setAllAchievements(allAchRes?.data || []);
      } catch (err) {
        setAchievementsError('Failed to load achievements.');
      } finally {
        setAchievementsLoading(false);
      }
    };
    fetchAchievements();
  }, [profileData, activeTab]);
  
  
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
      const response = await playlistAPI.toggleLikePlaylist(playlistId);
      
      if (response && (response.success || response.liked !== undefined)) {
        // Handle different API response formats
        const liked = response?.data?.items?.liked !== undefined ? response?.data?.items?.liked : response?.liked;
        const likesCount = response?.data?.items?.likesCount !== undefined ? response?.data?.items?.likesCount : response?.likesCount;
        
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

  // Helper function to format social links
  const formatSocialLink = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

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
            />
            <ProfileGridContainer>
              {/* Side Panel - Less Important Details */}
              <ProfileSidePanel>
                {/* Gaming Preferences Section */}
                {profileData.preferences && (
                  <ProfileSection>
                    {/* Content Ratings */}
                    {profileData.preferences.contentRatings && profileData.preferences.contentRatings.length > 0 && (
                      <div style={{ marginBottom: '1.5rem' }}>
                        <h4 style={{ fontSize: '1rem', marginBottom: '0.8rem', color: 'var(--textPrimary)' }}>
                          Content Ratings
                        </h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {profileData.preferences.contentRatings.map((rating, index) => (
                            <GenreTag key={index} weight={1}>
                              {rating}
                            </GenreTag>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Format Preferences */}
                    {profileData.preferences.formatPreferences && Object.keys(profileData.preferences.formatPreferences).length > 0 && (
                      <div style={{ marginBottom: '1.5rem' }}>
                        <h4 style={{ fontSize: '1rem', marginBottom: '0.8rem', color: 'var(--textPrimary)' }}>
                          Format Preferences
                        </h4>
                        <PreferencesGrid>
                          {Object.entries(profileData.preferences.formatPreferences).map(([format, weight]) => (
                            <PreferenceItem key={format}>
                              <PreferenceLabel>Format</PreferenceLabel>
                              <PreferenceValue>{format.charAt(0).toUpperCase() + format.slice(1)}</PreferenceValue>
                              <div style={{ 
                                height: '4px', 
                                background: 'var(--backgroundLighter)', 
                                borderRadius: '2px', 
                                marginTop: '0.3rem',
                                overflow: 'hidden'
                              }}>
                                <div style={{ 
                                  height: '100%', 
                                  width: `${Math.min(weight * 100, 100)}%`, 
                                  background: 'var(--primary)',
                                  borderRadius: '2px'
                                }} />
                              </div>
                            </PreferenceItem>
                          ))}
                        </PreferencesGrid>
                      </div>
                    )}
                    
                    {/* Viewing Preferences */}
                    {profileData.preferences.explicitSettings && (
                      <div>
                        <h4 style={{ fontSize: '1rem', marginBottom: '0.8rem', color: 'var(--textPrimary)' }}>
                          Viewing Preferences
                        </h4>
                        <PreferencesGrid>
                          {profileData.preferences.explicitSettings.preferSubbed && (
                            <PreferenceItem>
                              <PreferenceLabel>Language</PreferenceLabel>
                              <PreferenceValue>Prefers Subbed</PreferenceValue>
                            </PreferenceItem>
                          )}
                          {profileData.preferences.explicitSettings.preferDubbed && (
                            <PreferenceItem>
                              <PreferenceLabel>Language</PreferenceLabel>
                              <PreferenceValue>Prefers Dubbed</PreferenceValue>
                            </PreferenceItem>
                          )}
                          {profileData.preferences.explicitSettings.seasonalPreferences && 
                           profileData.preferences.explicitSettings.seasonalPreferences.length > 0 && (
                            <PreferenceItem>
                              <PreferenceLabel>Seasonal Preferences</PreferenceLabel>
                              <PreferenceValue>
                                {profileData.preferences.explicitSettings.seasonalPreferences
                                  .map(season => season.charAt(0).toUpperCase() + season.slice(1))
                                  .join(', ')}
                              </PreferenceValue>
                            </PreferenceItem>
                          )}
                        </PreferencesGrid>
                      </div>
                    )}
                  </ProfileSection>
                )}
              </ProfileSidePanel>
              
              {/* Main Panel - Important Details */}
              <ProfileMainPanel>
                {/* Favorite Genres Section */}
                {profileData.preferences && profileData.preferences.animeGenres && profileData.preferences.animeGenres.length > 0 && (
                  <ProfileSection>
                    <SectionTitle>
                      <Star size={20} />
                      Favorite Genres
                    </SectionTitle>
                    <GenresContainer>
                      {profileData.preferences.animeGenres.map((genre) => (
                        <GenreTag key={genre._id} weight={genre.weight}>
                          {genre.name}
                        </GenreTag>
                      ))}
                    </GenresContainer>
                  </ProfileSection>
                )}

                                {/* Social Links Section */}
                                {profileData.socialLinks && Object.values(profileData.socialLinks).some(link => link) && (
                  <ProfileSection>
                    <SectionTitle>
                      <Share2 size={20} />
                      Connect
                    </SectionTitle>
                    <SocialLinks>
                      {profileData.socialLinks.youtube && (
                        <SocialLink href={formatSocialLink(profileData.socialLinks.youtube)} target="_blank" rel="noopener noreferrer">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                            <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                          </svg>
                          YouTube
                        </SocialLink>
                      )}
                      {profileData.socialLinks.discord && (
                        <SocialLink href={formatSocialLink(profileData.socialLinks.discord)} target="_blank" rel="noopener noreferrer">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 9a5 5 0 0 0-5-5H9a5 5 0 0 0-5 5v7.5a3.5 3.5 0 0 0 3.5 3.5H14a4 4 0 0 0 4-4V9z"></path>
                            <path d="M7.5 11.5h1"></path>
                            <path d="M15.5 11.5h1"></path>
                            <path d="M9 15a7.5 7.5 0 0 0 6 0"></path>
                          </svg>
                          Discord
                        </SocialLink>
                      )}
                      {profileData.socialLinks.instagram && (
                        <SocialLink href={formatSocialLink(profileData.socialLinks.instagram)} target="_blank" rel="noopener noreferrer">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                          </svg>
                          Instagram
                        </SocialLink>
                      )}
                      {profileData.socialLinks.twitch && (
                        <SocialLink href={formatSocialLink(profileData.socialLinks.twitch)} target="_blank" rel="noopener noreferrer">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 2H3v16h5v4l4-4h5l4-4V2zm-10 9V7m5 4V7"></path>
                          </svg>
                          Twitch
                        </SocialLink>
                      )}
                      {profileData.socialLinks.twitter && (
                        <SocialLink href={formatSocialLink(profileData.socialLinks.twitter)} target="_blank" rel="noopener noreferrer">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                          </svg>
                          Twitter
                        </SocialLink>
                      )}
                    </SocialLinks>
                    
                    {/* Location */}
                    {profileData.location && (
                      <LocationInfo>
                        <MapPin size={16} />
                        {profileData.location}
                      </LocationInfo>
                    )}
                  </ProfileSection>
                )}
                
                {/* Tabs Section */}
                <ProfileSection>
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
                </ProfileSection>
                
              </ProfileMainPanel>
            </ProfileGridContainer>
          </CenteredContent>
        )}
      </PageContainer>
    </Layout>
  );
};

export default ProfilePage; 