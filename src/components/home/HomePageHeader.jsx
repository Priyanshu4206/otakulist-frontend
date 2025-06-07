import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Play, User, Tv, Download, Clock, ChevronRight, Bell, Trophy, Star, RotateCcw, ArrowRightCircle, KeyRound, ListMusic } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import UserStatsDisplay from './UserStatsDisplay';
import { userAPI } from '../../services/api';
import * as LucideIcons from 'lucide-react';

// Page Header with gradient text
const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const PageHeader = styled.h1`
  position: relative; 
  font-size: 3rem;
  font-weight: 900;
  background: var(--gradientPrimary);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
  letter-spacing: -1px;
  margin-bottom: 1rem;

  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 60px;
    height: 3px;
    background: var(--gradientPrimary);
    border-radius: 2px;
  }
      
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

// Container for the entire layout
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  color: var(--textPrimary);

  @media (min-width: 1024px) {
    display: grid;
    gap: 1.5rem;
    grid-template-columns: 1fr 1fr minmax(350px, 1fr);
    grid-template-rows: repeat(3, auto);
  }

  @media (max-width: 480px) {
    gap: 0.5rem;
  }
`;

// Card component with common styling
const Card = styled.div`
  background-color: var(--cardBackground);
  border-radius: 1rem;
  color: var(--textPrimaryDark);
  padding: 1.25rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.05);
  
  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 480px) {
    border-radius: 4px;
  }
`;

// VideoCard component for video display
const VideoCard = styled(Card)`
  grid-column: span 2;
  grid-row: span 2;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 2px solid var(--borderColor);

  @media (max-width: 1024px) {
    aspect-ratio: 16 / 8;
  }
`;

// Video player component
const VideoPlayer = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

// Video placeholder
const VideoPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--modalBackground);
  color: var(--textPrimary);
  
  svg {
    width: 3.5rem;
    height: 3.5rem;
    margin-bottom: 1rem;
    color: var(--accent);
  }
  
  p {
    font-size: 1.25rem;
    font-weight: 600;
    opacity: 0.9;
  }
`;


// Title component for cards
const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--textPrimary);
  position: relative;
  margin-bottom: 1rem;

  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 60px;
    height: 3px;
    background: var(--gradientPrimary);
    border-radius: 2px;
  }
`;

// Grid for the info cards
const CardGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  
  @media (min-width: 650px) {
    grid-template-columns: 1fr 1fr;
  }
  
  @media (max-width: 1023px) and (min-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SideColumn = styled.div`
  grid-row: 3;
  grid-column: span 2;
  display: flex;  
  gap: 1rem;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    gap: 2rem;
  }
`;

const XPCard = styled(Card)`
  display: flex;
  min-width: 240px;
  flex: 1;
  flex-direction: column;
  background: ${props => props.background || 'var(--primaryDark)'};
  
  @media (max-width: 480px) {
    display: none;
  }
  
  @keyframes slideUp {
    0% { 
      transform: translateY(10px); 
      opacity: 0; 
    }
    100% { 
      transform: translateY(0); 
      opacity: 1; 
    }
  }
`;

const JourneyCard = styled(Card)`
  display: flex;
  flex-direction: column;
  background: var(--secondaryDark);
  flex: 1;
  height: 100%;
  justify-content: space-between;

  @media (max-width: 480px) {
    display: none;
  }
`;


// Progress bar container
const ProgressContainer = styled.div`
  width: 100%;
  height: 0.6rem;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  overflow: hidden;
  margin-top: 1rem;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
`;

// Progress bar fill
const ProgressFill = styled.div`
  height: 100%;
  background-color: ${props => props.backgroundColor || 'var(--accent)'};
  border-radius: 0.5rem;
  width: ${props => props.progress}%;
  transition: width 0.8s ease-in-out;
  box-shadow: ${props => props.boxShadow || 'none'};
`;

// Level text
const LevelText = styled.p`
  margin: 0;
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: ${props => props.color || 'var(--textPrimary)'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    color: ${props => props.color || 'var(--accent)'};
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  border: none;
  width: fit-content;
  border-radius: 0.75rem;
  background-color: ${props => props.primary ? 'var(--primaryLight)' : 'var(--accentLight)'};
  color: var(--textPrimary);
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  align-self: flex-end;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    background-color: ${props => props.primary ? 'var(--primary)' : 'var(--primaryDark)'};
  }

  @media (max-width: 640px) {
    font-size: 0.875rem;
    padding: 0.5rem 1rem;
  }
`;

const AnnouncementCard = styled(Card)`
  grid-column: 3;
  grid-row: 1;
  position: relative;
  overflow: hidden;
  background: transparent;
  box-shadow: none;
  border: none;
  padding: 0;
  margin-bottom: 1rem;

  &:hover {
    transform: none;
    box-shadow: none;
  }

  &:after{
    content: '';
    display: block;
    margin-left: auto;
    margin-right: auto;
    width: 60%;
    height: 3px;
    border-radius: 10px;
    background-color: var(--borderColor);
    margin-top: 1rem;
  }

  @media (max-width: 1024px) {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    margin-top: 0;
  }
`;

// Announcement scroller
const AnnouncementScroller = styled.div`
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding: 0.5rem 0;
  scroll-behavior: smooth;
  width: 100%;

  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: var(--accent);
    border-radius: 4px;
  }
  
  &:hover {
    animation-play-state: paused;
  }

  
  @media (max-width: 1024px) {
    height: 250px;
  }

  @media (max-width: 480px) {
    height: fit-content;
  }
`;

// Individual announcement
const Announcement = styled.div`
  flex: 0 0 auto;
  width: fit-content;
  padding: 1rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
  background-color: var(--cardBackground);
  &:hover {
    transform: scale(1.03);
  }
  
  h3 {
    margin: 0;
    margin-bottom: 0.5rem;
    font-size: 1.125rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    svg {
      color: var(--accentLight);
    }
  }
  
  p {
    margin: 0;
    font-size: 0.875rem;
    opacity: 0.9;
    line-height: 1.5;
  }
  
  .timestamp {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    margin-top: 1rem;
    font-size: 0.75rem;
    opacity: 0.8;
  }
`;

const AppBanner = styled(Card)`
  grid-column: 3;
  grid-row: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  padding: 1rem 1.5rem;
  background: var(--accent);
  gap: 1rem;

  .content {
    flex: 1;
    min-width: 180px;
  }

  .content p {
    font-size: 0.95rem;
  }

  .button-container {
    display: flex;
    justify-content: flex-end;
  }

  @media (max-width: 1024px) {
    width: min-content;
    padding: 1rem;
  }
  
  @media (max-width: 640px) {
    flex-direction: column;
    align-items: center;
    text-align: center;

    .button-container {
      width: auto;
      justify-content: center;
    }

    .content p {
      font-size: 0.875rem;
    }
  }

  @media (max-width: 480px) {
    width: 100%;
  }
`;

const PlaylistCard = styled(Card)`
  grid-column: 3;
  grid-row: 3;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  padding: 1rem 1.5rem;
  background: var(--primaryDark);
  gap: 1rem;

  div {
    flex: 1;
    min-width: 180px;
  }

  div p {
    font-size: 0.95rem;
  }

  @media (max-width: 1024px) {
    width: min-content;
    padding: 1rem;
  }

  @media (max-width: 640px) {
    flex-direction: column;
    text-align: center;
    align-items: center;

    div p {
      font-size: 0.875rem;
    }

    button {
      width: auto;
      max-width: 240px;
    }
  }

  @media (max-width: 480px) {
    width: 100%;
  }
`;

// Countdown component
const CountdownContainer = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 0.75rem;
  color: var(--textPrimary);
  font-weight: 600;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 4px 12px var(--modalOverlayColor);
  backdrop-filter: blur(4px);
`;

const SideColumnMobile = styled.div`
  display: flex;
  gap: 1rem;  

  @media (max-width: 480px) {
    flex-direction: column;
    margin-top: 2rem;
    gap: 2rem;
  }
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
    return <LucideIcons.Star size={size} {...props} />;
  }
  
  return <Icon size={size} {...props} />;
};

// Main HomePageHeader component
const HomePageHeader = ({userStats}) => {
  // Refs for auto-scrolling
  const scrollerRef = useRef(null);
  const scrollInterval = useRef(null);
  
  // State for video loading
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0);
  
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();  
  
  // Mock announcements - additional items for auto-scrolling demonstration
  const announcements = [
    { 
      id: 1, 
      title: 'Update 2.0 Coming Soon', 
      content: 'Major improvements to the viewing experience with new features', 
      timestamp: '2 days ago',
      icon: <Bell />
    },
    { 
      id: 2, 
      title: 'New Achievements!', 
      content: '3 new achievements have been added to unlock advanced features', 
      timestamp: '4 days ago',
      icon: <Trophy />
    },
    { 
      id: 3, 
      title: 'Mobile App Redesign', 
      content: 'The mobile app has been completely redesigned for better performance', 
      timestamp: '1 week ago',
      icon: <Tv />
    },
    { 
      id: 4, 
      title: 'New Anime Added', 
      content: 'Check out the latest additions to our growing anime collection', 
      timestamp: '3 days ago',
      icon: <Star />
    }
  ];
  
  // Mock video URL
  const videoUrl = null; // Set to null to show placeholder
  
  // Start countdown when component mounts
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prevCount => {
        if (prevCount <= 1) {
          clearInterval(interval);
          setShowVideo(true);
          return 0;
        }
        return prevCount - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Setup auto-scrolling for announcements
  useEffect(() => {
    const startAutoScroll = () => {
      if (scrollerRef.current && announcements.length > 1) {
        scrollInterval.current = setInterval(() => {
          if (scrollerRef.current) {
            const cardWidth = 15 * 16 + 16; // 15rem + 1rem gap
            const nextIndex = (currentAnnouncementIndex + 1) % announcements.length;
            setCurrentAnnouncementIndex(nextIndex);
            scrollerRef.current.scrollTo({
              left: nextIndex * cardWidth,
              behavior: 'smooth'
            });
          }
        }, 5000); // Scroll every 5 seconds
      }
    };
    
    startAutoScroll();
    
    return () => {
      if (scrollInterval.current) {
        clearInterval(scrollInterval.current);
      }
    };
  }, [currentAnnouncementIndex, announcements.length]);
  
  // Pause auto-scrolling when hovering over announcements
  const handleMouseEnter = () => {
    if (scrollInterval.current) {
      clearInterval(scrollInterval.current);
    }
  };
  
  // Resume auto-scrolling when mouse leaves
  const handleMouseLeave = () => {
    if (scrollInterval.current) {
      clearInterval(scrollInterval.current);
    }
    
    scrollInterval.current = setInterval(() => {
      if (scrollerRef.current) {
        const cardWidth = 15 * 16 + 16; // 15rem + 1rem gap
        const nextIndex = (currentAnnouncementIndex + 1) % announcements.length;
        setCurrentAnnouncementIndex(nextIndex);
        scrollerRef.current.scrollTo({
          left: nextIndex * cardWidth,
          behavior: 'smooth'
        });
      }
    }, 5000);
  };
  
  return (
    <ContentContainer>
      <PageHeader>Welcome to OtakuList</PageHeader>
      <Container>
        {/* Left Panel */}
        {/* <LeftPanel> */}
          {/* Video Player */}
          <VideoCard>
            {!showVideo && (
              <CountdownContainer>
                Starting in {countdown}s
              </CountdownContainer>
            )}
            
            {showVideo && videoUrl ? (
              <VideoPlayer 
                autoPlay 
                muted 
                onLoadedData={() => setVideoLoaded(true)}
              >
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </VideoPlayer>
            ) : showVideo && (
              <VideoPlaceholder>
                <Play />
                <p>Featured Content</p>
              </VideoPlaceholder>
            )}
          </VideoCard>
          
          {/* User Info Cards */}
            {isAuthenticated ? (
              <SideColumn>
                <XPCard style={{ 
                  background: userStats?.achievements?.isMaxTier 
                    ? 'linear-gradient(135deg, #ffd700, #8b7500)' // Gold gradient for max tier users
                    : 'var(--primaryDark)',
                  animation: userStats?.achievements ? 'slideUp 0.5s ease-out forwards' : 'none'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Trophy 
                      size={22} 
                      color={userStats?.achievements?.isMaxTier 
                        ? '#fff' 
                        : (userStats?.achievements?.tier?.color || undefined)}
                    />
                    <Title style={{ color: userStats?.achievements?.isMaxTier ? '#fff' : 'var(--textPrimary)' }}>
                      Achievement Level
                    </Title>
                  </div>
                  {userStats && userStats.achievements ? (
                    <div style={{ marginTop: '1rem' }}>
                      <p style={{ 
                        color: userStats?.achievements?.isMaxTier ? '#fff' : 'var(--textPrimary)',
                        fontWeight: '600',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span>{userStats.achievements.points} Total Points</span>
                        <span style={{ fontSize: '0.85rem' }}>
                          <Trophy size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                          {userStats.achievements.unlocked} Unlocked
                        </span>
                      </p>
                      <ProgressContainer>
                        <ProgressFill 
                          progress={
                            userStats.achievements.nextTier 
                              ? Math.min(100, Math.round(((userStats.achievements.points - userStats.achievements.tier.minPoints) / 
                                (userStats.achievements.nextTier.minPoints - userStats.achievements.tier.minPoints)) * 100))
                                : 100
                          } 
                          style={{
                            backgroundColor: userStats?.achievements?.isMaxTier ? '#ffd700' : (userStats.achievements.tier.color || 'var(--accent)'),
                            boxShadow: userStats?.achievements?.isMaxTier ? '0 0 8px #ffd700' : `0 0 8px ${userStats.achievements.tier.color || 'var(--accentLight)'}`
                          }}
                        />
                      </ProgressContainer>
                      <LevelText style={{ color: userStats?.achievements?.isMaxTier ? '#fff' : 'var(--textPrimary)' }}>
                        {userStats.achievements.tier.icon ? (
                          <DynamicIcon 
                            iconName={userStats.achievements.tier.icon} 
                            size={16} 
                            color={userStats?.achievements?.isMaxTier ? '#fff' : 'var(--accent)'} 
                          />
                        ) : (
                          <Star size={16} color={userStats?.achievements?.isMaxTier ? '#fff' : 'var(--accent)'} />
                        )}
                        <div style={{
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: '0.25rem'
                        }}>
                          <span>{userStats.achievements.tier.title}</span>
                          {!userStats.achievements.isMaxTier && userStats.achievements.nextTier && (
                            <small style={{ 
                              fontSize: '0.75rem', 
                              opacity: '0.8' 
                            }}>
                              Next: {userStats.achievements.nextTier.title} ({userStats.achievements.nextTier.pointsNeeded} points needed)
                            </small>
                          )}
                          {userStats.achievements.isMaxTier && (
                            <small style={{ 
                              fontSize: '0.75rem', 
                              opacity: '0.8',
                              fontWeight: 'bold' 
                            }}>
                              Maximum Rank Achieved! 🏆
                            </small>
                          )}
                          {userStats.achievements.rankHistory && userStats.achievements.rankHistory.length > 0 && (
                            <small style={{ 
                              fontSize: '0.7rem', 
                              opacity: '0.7',
                              fontStyle: 'italic',
                              marginTop: '0.25rem' 
                            }}>
                              {(() => {
                                // Find the current tier in rank history
                                const currentTierHistory = userStats.achievements.rankHistory.find(
                                  rank => rank.tierId === userStats.achievements.tier.id
                                );
                                if (currentTierHistory) {
                                  const date = new Date(currentTierHistory.achievedAt);
                                  return `Achieved on ${date.toLocaleDateString()}`;
                                }
                                return null;
                              })()}
                            </small>
                          )}
                        </div>
                      </LevelText>
                    </div>
                  ) : (
                    <div style={{ marginTop: '1rem' }}>
                      <UserStatsDisplay />
                    </div>
                  )}
                </XPCard>
                
                <JourneyCard>
                  <div>
                    <Title>Continue Your Journey</Title>
                    <p>Pick up where you left off with your favorite anime.</p>
                  </div>
                    <Button onClick={() => navigate('/feeds')} style={{marginTop: '1rem'}}>
                      Continue <KeyRound  size={18} />
                    </Button>
                </JourneyCard>
              </SideColumn>
            ) : (
              <SideColumn>
                <XPCard>
                  <Title>XP Level</Title>
                  <p>Track your anime journey and earn XP to unlock achievements</p>
                  <div style={{ marginTop: 'auto', marginLeft: 'auto' }}>
                    <Button onClick={() => navigate('/login')}>
                      Join Now <ChevronRight size={18} />
                    </Button>
                  </div>
                </XPCard>
                
                <JourneyCard>
                  <Title>Start Your Journey</Title>
                  <p>Create an account to save your progress and preferences</p>
                  <div style={{ marginTop: 'auto', marginLeft: 'auto' }}>
                    <Button primary onClick={() => navigate('/login')}>
                      Login <ChevronRight size={18} />
                    </Button>
                  </div>
                </JourneyCard>
              </SideColumn>
          )}
          
          {
            window.innerWidth > 1024 ? (
              <>
                {/* App Banner */}
                <AppBanner>
                  <div className="content">
                    <Title>Install Our App</Title>
                    <p>Watch anime on the go with our mobile app and enjoy offline viewing</p>
                  </div>
                    <Button>
                      <Download size={18} />
                      Download App
                    </Button>
                </AppBanner>
                
                {/* Start Playlist */}
                <PlaylistCard>
                  <div>
                    <Title>Start Playlist</Title>
                    <p>Create your own custom anime playlist for marathon watching</p>
                  </div>
                  <Button primary onClick={() => navigate('/explore')}>
                    Start <ListMusic size={18} />
                  </Button>
                </PlaylistCard>

                {/* Platform Announcements */}
                <AnnouncementCard>
                  <Title>Platform Announcements</Title>
                  <AnnouncementScroller 
                    ref={scrollerRef}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    {announcements.map(announcement => (
                      <Announcement key={announcement.id}>
                        <h3>
                          {announcement.icon}
                          {announcement.title}
                        </h3>
                        <p>{announcement.content}</p>
                        <div className="timestamp">
                          <Clock size={14} />
                          {announcement.timestamp}
                        </div>
                      </Announcement>
                    ))}
                  </AnnouncementScroller>
                </AnnouncementCard>
              </>
            ): (
              <SideColumnMobile>
                {/* Platform Announcements */}
                <AnnouncementCard>
                  <Title>Platform Announcements</Title>
                  <AnnouncementScroller 
                    ref={scrollerRef}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    {announcements.map(announcement => (
                      <Announcement key={announcement.id}>
                        <h3>
                          {announcement.icon}
                          {announcement.title}
                        </h3>
                        <p>{announcement.content}</p>
                        <div className="timestamp">
                          <Clock size={14} />
                          {announcement.timestamp}
                        </div>
                      </Announcement>
                    ))}
                  </AnnouncementScroller>
                </AnnouncementCard>
                <SideColumn>
                  {/* App Banner */}
                  <AppBanner>
                    <div className="content">
                      <Title>Install Our App</Title>
                      <p>Watch anime on the go with our mobile app and enjoy offline viewing</p>
                    </div>
                    <div className="button-container">
                      <Button>
                        <Download size={18} />
                        Download App
                      </Button>
                    </div>
                  </AppBanner>
                  
                  {/* Start Playlist */}
                  <PlaylistCard>
                    <div>
                      <Title>Start Playlist</Title>
                      <p>Create your own custom anime playlist for marathon watching</p>
                    </div>
                    <Button primary onClick={() => navigate('/explore')}>
                      Start <ListMusic size={18} />
                    </Button>
                  </PlaylistCard>
                </SideColumn>
              </SideColumnMobile>
            )
          }
      </Container>
    </ContentContainer>
  );
};

export default HomePageHeader;