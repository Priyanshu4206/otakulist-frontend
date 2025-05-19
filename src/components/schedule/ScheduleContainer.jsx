import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import styled from 'styled-components';
import { getUserTimezone, getIANATimezone } from '../../utils/simpleTimezoneUtils';
import { useNavigate } from 'react-router-dom';
import { scheduleAPI } from '../../services/modules';

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const Notification = styled.div`
  background-color: var(--backgroundLight);
  border: 2px solid var(--primary);
  border-radius: 8px;
  padding: 20px;
  color: var(--textPrimary);
  position: relative;
  overflow: hidden;
  height: 90dvh;
  display: flex;
  flex-direction: column;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--primary), transparent);
    animation: scanline 2s linear infinite;
  }

  @keyframes scanline {
    0% {
      transform: translateY(-100%);
    }
    100% {
      transform: translateY(580px);
    }
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid var(--primary);
  padding-bottom: 10px;
  margin-bottom: 15px;
`;

const Title = styled.div`
  font-size: 20px;
  font-weight: bold;
  color: var(--primary);
  text-transform: uppercase;
`;

const CloseBtn = styled.div`
  color: #4287f5;
  cursor: pointer;
  font-size: 20px;
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-bottom: 15px;
  scrollbar-width: thin;
  scrollbar-color: var(--primary) var(--backgroundLight);

  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-track {
    background: var(--backgroundLight);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--primary);
    border-radius: 3px;
  }
`;

const AnimeItem = styled.div`
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid rgba(var(--primary-rgb), 0.3);
  position: relative;
  cursor: pointer;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 10%;
    width: 80%;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--primary), transparent);
    box-shadow: 0 0 8px var(--primary);
  }
`;

const AnimeImage = styled.div`
  width: 75px;
  height: 110px;
  background-color: var(--backgroundDark);
  border: 1px solid var(--primary);
  margin-right: 15px;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const AnimeDetails = styled.div`
  flex: 1;
`;

const AnimeTitle = styled.div`
  font-size: 17px;
  font-weight: bold;
  margin-bottom: 5px;
  color: var(--textPrimary);
`;

const AnimeGenre = styled.div`
  font-size: 11px;
  color: var(--textSecondary);
  margin-bottom: 8px;
`;

const AnimeTime = styled.div`
  font-size: 14px;
  color: var(--accent);
  font-weight: bold;
  display: flex;
  align-items: center;
`;

const TimeIcon = styled.span`
  margin-right: 5px;
`;

const NotificationEffects = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
`;

const GlowEffect = styled.div`
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  border-radius: 12px;
  z-index: -1;
  animation: pulse 3s infinite;

  @keyframes pulse {
    0% { 
      box-shadow: 0 0 5px var(--primary), 0 0 10px rgba(var(--primary-rgb), 0.5);
    }
    50% { 
      box-shadow: 0 0 15px var(--primary), 0 0 25px rgba(var(--accent-rgb), 0.7), 0 0 35px rgba(var(--primary-rgb), 0.4);
    }
    100% { 
      box-shadow: 0 0 5px var(--primary), 0 0 10px rgba(var(--primary-rgb), 0.5);
    }
  }
`;

const Particle = styled.div`
  position: absolute;
  background-color: rgba(var(--primary-rgb), 0.6);
  width: 2px;
  height: 2px;
  border-radius: 50%;
  animation: float 3s infinite;

  @keyframes float {
    0% { transform: translateY(0) translateX(0); opacity: 0; }
    50% { opacity: 1; }
    100% { transform: translateY(-100px) translateX(20px); opacity: 0; }
  }
`;

const StatusSection = styled.div`
  margin-top: 10px;
  border-top: 1px solid rgba(var(--primary-rgb), 0.5);
  padding-top: 12px;
`;

const StatusRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
`;

const StatusLabel = styled.div`
  color: var(--textSecondary);
`;

const StatusValue = styled.div`
  color: var(--textPrimary);
  font-weight: bold;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 5px;
`;

const RefreshBtn = styled.button`
  background-color: rgba(var(--primary-rgb), 0.2);
  color: var(--primary);
  border: 1px solid var(--primary);
  padding: 8px 25px;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s;
  text-transform: uppercase;

  &:hover {
    background-color: rgba(var(--primary-rgb), 0.4);
    box-shadow: 0 0 10px var(--primary);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
`;

const LoadingText = styled.div`
  color: var(--primary);
  font-size: 16px;
  margin-top: 15px;
  text-align: center;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(var(--primary-rgb), 0.2);
  border-top: 3px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Rate limiting mechanism to prevent excessive API calls
const API_CALL_THROTTLE = 5000; // 5 seconds between API calls
const lastApiCallTime = {};

// Move these outside the component so they don't recreate on each render
const getTodayDayName = () => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[new Date().getDay()];
};

// Get timezone data once
const userTimezoneCode = getUserTimezone();
const userTimezone = getIANATimezone(userTimezoneCode);

const ScheduleContainer = () => {
  const [shows, setShows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Keep track of whether we've already loaded the data
  const hasLoadedRef = useRef(false);

  // Check if API call is allowed based on throttling
  const canMakeApiCall = useCallback((day) => {
    const now = Date.now();
    
    if (!lastApiCallTime[day] || (now - lastApiCallTime[day]) > API_CALL_THROTTLE) {
      lastApiCallTime[day] = now;
      return true;
    }
    
    return false;
  }, []);

  // Format genres for display - now stable across renders
  const formatGenres = useCallback((anime) => {
    if (!anime.genres || !anime.genres.length) return 'Anime';
    
    return anime.genres
      .slice(0, 3)
      .map(g => typeof g === 'string' ? g : g.name)
      .filter(Boolean)
      .join(' • ');
  }, []);

  // Format time for display - now stable across renders
  const formatTimeDisplay = useCallback((time) => {
    if (!time) return 'TBA';
    
    // Ensure time is in HH:MM format
    let [hours, minutes] = time.split(':').map(Number);
    
    // Format in 12-hour with AM/PM
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    
    // Format minutes with leading zero if needed
    minutes = minutes < 10 ? `0${minutes}` : minutes;
    
    return `${hours}:${minutes} ${period}`;
  }, []);

  // Format the broadcast range - depends only on formatTimeDisplay which is stable
  const formatBroadcastTime = useCallback((anime) => {
    if (!anime.broadcast?.time) return 'TBA';
    
    // Calculate end time (assuming 30 min episodes for simplicity)
    const startTime = anime.broadcast.time;
    let [hours, minutes] = startTime.split(':').map(Number);
    
    // Add 30 minutes for end time
    minutes += 30;
    if (minutes >= 60) {
      hours += 1;
      minutes -= 60;
    }
    hours = hours % 24; // Handle overflow to next day
    
    const endTime = `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}`;
    
    return `${formatTimeDisplay(startTime)} - ${formatTimeDisplay(endTime)}`;
  }, [formatTimeDisplay]);

  // Get next airing show - derive from shows state
  const nextAiring = useMemo(() => {
    if (!shows.length) return null;
    
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    
    // Find the next airing show
    for (const anime of shows) {
      if (!anime?.broadcast?.time) continue;
      
      const [hours, minutes] = anime?.broadcast?.time?.split(':').map(Number);
      
      if (hours > currentHours || (hours === currentHours && minutes > currentMinutes)) {
        return {
          title: anime?.titles?.default || anime?.titles?.english || anime?.title_english || anime?.title || 'Untitled',
          time: formatTimeDisplay(anime?.broadcast?.time)
        };
      }
    }
    
    // If no show is airing later today, return the first one (tomorrow)
    return shows[0] ? {
      title: shows[0]?.titles?.default || shows[0]?.titles?.english || shows[0]?.title_english || shows[0]?.title || 'Untitled',
      time: formatTimeDisplay(shows[0].broadcast?.time || '')
    } : null;
  }, [shows, formatTimeDisplay]);

  // Fetch schedule data using scheduleAPI directly
  const fetchSchedule = useCallback(async () => {
    // Check if we can make an API call for today (throttling)
    const today = getTodayDayName();
    if (!canMakeApiCall(today) && !isLoading) {
      console.warn(`API call for ${today} was throttled. Try again later.`);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the scheduleAPI.getDaySchedule method with caching built-in
      const response = await scheduleAPI.getDaySchedule(
        today,
        userTimezone,
        {
          useCache: true,
          forceRefresh: false
        }
      );
      
      let processedShows = [];
      
      // Handle API response formats
      if (response) {
        if (response.success && response.data?.items) {
          // New API structure: {success: true, data: {items: [...], pagination: {...}}}
          processedShows = response.data.items || [];
        } else if (response.data?.items && Array.isArray(response.data.items)) {
          // Data with items array
          processedShows = response.data.items;
        } else if (Array.isArray(response.data)) {
          // Direct array response (legacy)
          processedShows = response.data;
        } else if (response.data) {
          // For any other structure, try to use the data directly
          processedShows = response.data;
        }
      }
      
      // Sort by broadcast time
      processedShows.sort((a, b) => {
        if (!a.broadcast?.time) return 1;
        if (!b.broadcast?.time) return -1;
        
        const [aHours, aMinutes] = a.broadcast.time.split(':').map(Number);
        const [bHours, bMinutes] = b.broadcast.time.split(':').map(Number);
        
        // Compare hours first, then minutes
        return aHours !== bHours ? aHours - bHours : aMinutes - bMinutes;
      });
      
      // Limit to 12 shows for homepage display
      processedShows = processedShows.slice(0, 12);
      
      setShows(processedShows);
      // Mark as loaded
      hasLoadedRef.current = true;
    } catch (err) {
      console.error('Error fetching schedule:', err);
      setError('Failed to load anime schedule');
    } finally {
      setIsLoading(false);
    }
  }, [canMakeApiCall, isLoading, userTimezone]);

  // Fetch data on component mount
  useEffect(() => {
    // Only fetch if we haven't loaded yet or if we don't have data
    if (hasLoadedRef.current && shows.length > 0) return;
    
    fetchSchedule();
  }, [fetchSchedule, shows.length]);

  // Reset hasLoaded if timezone changes or if shows are empty
  useEffect(() => {
    if (userTimezoneCode !== getUserTimezone()) {
      hasLoadedRef.current = false;
    }
  }, [userTimezoneCode]);
  
  // Reset hasLoaded when component unmounts or if shows are empty
  useEffect(() => {
    if (shows.length === 0 && hasLoadedRef.current) {
      hasLoadedRef.current = false;
    }
    
    return () => {
      // Reset when component unmounts
      hasLoadedRef.current = false;
    };
  }, [shows.length]);

  // Handle refresh button click
  const handleRefresh = () => {
    // Clear day cache and refetch
    scheduleAPI.clearScheduleCache('day');
    hasLoadedRef.current = false;
    fetchSchedule();
  };

  // Render loading state
  if (isLoading && !shows.length) {
    return (
      <Container>
        <Notification>
          <NotificationEffects>
            <GlowEffect />
            <Particle style={{ top: '20%', left: '10%' }} />
            <Particle style={{ top: '50%', left: '80%' }} />
            <Particle style={{ top: '70%', left: '30%' }} />
            <Particle style={{ top: '30%', left: '60%' }} />
            <Particle style={{ top: '80%', left: '40%' }} />
          </NotificationEffects>
          
          <Header>
            <Title>Today's Anime Schedule</Title>
          </Header>
          
          <LoadingContainer>
            <LoadingSpinner />
            <LoadingText>Loading today's anime schedule...</LoadingText>
          </LoadingContainer>
        </Notification>
      </Container>
    );
  }

  // Render error state
  if (error && !shows.length) {
    return (
      <Container>
        <Notification>
          <NotificationEffects>
            <GlowEffect />
            <Particle style={{ top: '20%', left: '10%' }} />
            <Particle style={{ top: '50%', left: '80%' }} />
            <Particle style={{ top: '70%', left: '30%' }} />
            <Particle style={{ top: '30%', left: '60%' }} />
            <Particle style={{ top: '80%', left: '40%' }} />
          </NotificationEffects>
          
          <Header>
            <Title>Today's Anime Schedule</Title>
          </Header>
          
          <LoadingContainer>
            <LoadingText>Failed to load schedule. Please try again.</LoadingText>
            <ButtonContainer>
              <RefreshBtn onClick={handleRefresh}>Try Again</RefreshBtn>
            </ButtonContainer>
          </LoadingContainer>
        </Notification>
      </Container>
    );
  }

  return (
    <Container>
      <Notification>
        <NotificationEffects>
          <GlowEffect />
          <Particle style={{ top: '20%', left: '10%' }} />
          <Particle style={{ top: '50%', left: '80%' }} />
          <Particle style={{ top: '70%', left: '30%' }} />
          <Particle style={{ top: '30%', left: '60%' }} />
          <Particle style={{ top: '80%', left: '40%' }} />
        </NotificationEffects>
        
        <Header>
          <Title>Today's Anime Schedule</Title>
        </Header>
        
        <Content>
          {shows.length > 0 ? (
            shows.map(anime => (
              <AnimeItem key={anime.malId} onClick={()=> navigate(`/anime/${anime.malId}`)}>
                <AnimeImage>
                  <img 
                    src={anime?.images?.jpg?.imageUrl || anime?.images?.jpg?.image_url || anime?.image_url || '/api/placeholder/80/120'} 
                    alt={anime?.titles?.default || anime?.titles?.english || anime?.title_english || anime?.title || 'Untitled'} 
                  />
                </AnimeImage>
                <AnimeDetails>
                  <AnimeTitle>{anime?.titles?.default || anime?.titles?.english || anime?.title_english || anime?.title || anime?.name || 'Untitled'}</AnimeTitle>
                  <AnimeGenre>{formatGenres(anime)}</AnimeGenre>
                  <AnimeTime>
                    <TimeIcon>⏱</TimeIcon> 
                    {formatBroadcastTime(anime)}
                  </AnimeTime>
                </AnimeDetails>
              </AnimeItem>
            ))
          ) : (
            <LoadingContainer>
              <LoadingText>No shows scheduled for today.</LoadingText>
            </LoadingContainer>
          )}
        </Content>
        
        <StatusSection>
          <StatusRow>
            <StatusLabel>Total Shows Today:</StatusLabel>
            <StatusValue>{shows.length}</StatusValue>
          </StatusRow>
          {nextAiring && (
            <StatusRow>
              <StatusLabel>Next Airing:</StatusLabel>
              <StatusValue>{nextAiring.title} ({nextAiring.time})</StatusValue>
            </StatusRow>
          )}
          
          <ButtonContainer>
            <RefreshBtn onClick={handleRefresh}>Refresh</RefreshBtn>
          </ButtonContainer>
        </StatusSection>
      </Notification>
    </Container>
  );
};

export default ScheduleContainer; 