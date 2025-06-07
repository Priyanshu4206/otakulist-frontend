import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  Sword, 
  Users, 
  Scroll, 
  ChevronRight, 
  Clock,
  Trophy,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { leaderboardAPI } from '../../services/api';
import useAuth from '../../hooks/useAuth';
import * as LucideIcons from 'lucide-react';

// Styled components for the Quest Board
const GuildBoardContainer = styled.div`
  background-color: var(--modalOverlayColor);
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  height: 100%;
  height: 90vh;
  display: flex;
  flex-direction: column;
  position: relative;
  animation: boardAppear 0.6s ease-out;
  
  @keyframes boardAppear {
    0% { 
      opacity: 0;
      transform: translateY(20px);
    }
    100% { 
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23d4c8a8' fill-opacity='0.2' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E");
    opacity: 0.2;
    pointer-events: none;
    z-index: 0;
  }
`;

const GuildBoardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  background: var(--gradientPrimary);
  color: var(--textPrimary);
  position: relative;
  z-index: 1;
`;

const HeaderTitle = styled.h3`
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
`;

const HeaderIcon = styled.div`
  color: var(--accentLight);
  background-color: var(--backgroundDark);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const QuestBoardBody = styled.div`
  padding: 0.75rem 0;
  overflow-y: auto;
  flex: 1;
  position: relative;
  z-index: 1;
  max-height: calc(100% - 150px); /* Account for header and footer */
  scrollbar-width: thin;
  scrollbar-color: var(--primaryDark) var(--backgroundLight);
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--backgroundLight);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: var(--primaryDark);
    border-radius: 4px;
    border: 2px solid var(--backgroundLight);
  }
`;

const AdventurerItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border-left: 4px solid transparent;
  margin: 0.5rem 0.75rem;
  background-color: rgba(var(--cardBackground-rgb), 0.4);
  border-radius: 6px;
  position: relative;
  overflow: hidden;
  
  ${props => props.isCurrentUser && `
    background-color: rgba(var(--secondary-rgb), 0.15);
    border-left-color: var(--secondary);
  `}
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    background-color: var(--backgroundLight);
    border-left-color: var(--primary);
    
    /* Subtle glow effect on hover */
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(to right, transparent, rgba(var(--primary-rgb), 0.05), transparent);
      z-index: 0;
    }
    
    /* Scale up the rank number slightly */
    & > div:first-child {
      transform: scale(1.05);
    }
  }
  
  &:after {
    content: '';
    position: absolute;
    top: 8px;
    left: 8px;
    width: 12px;
    height: 12px;
    background-color: var(--primary);
    border-radius: 50%;
    z-index: 1;
    opacity: 0.6;
  }
`;

const RankNumber = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  color: var(--textPrimary);
  border: 2px solid;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 1;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  ${props => props.rank === 1 && `
    background-color: #ffd700; /* Gold */
    border-color: var(--accent);
    color: var(--background);
    box-shadow: 0 0 10px rgba(var(--accent-rgb), 0.5);
  `}
  
  ${props => props.rank === 2 && `
    background-color: #c0c0c0; /* Silver */
    border-color: var(--borderColor);
    color: var(--background);
  `}
  
  ${props => props.rank === 3 && `
    background-color: #cd7f32; /* Bronze */
    border-color: var(--primaryDark);
    color: var(--background);
  `}
  
  ${props => props.rank > 3 && `
    background-color: var(--backgroundLight);
    border-color: var(--primaryDark);
    color: var(--primary);
  `}
`;

const AdventurerAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--backgroundLight);
  margin: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 2px solid var(--primaryDark);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16);
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const AdventurerInfo = styled.div`
  flex: 1;
`;

const AdventurerName = styled.div`
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--textPrimary);
`;

const AdventurerTitle = styled.div`
  font-size: 0.85rem;
  color: var(--textSecondary);
  margin-bottom: 0.25rem;
  font-style: italic;
`;

const AdventurerStats = styled.div`
  font-size: 0.85rem;
  color: var(--textSecondary);
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const RankBadge = styled.div`
  font-size: 0.8rem;
  padding: 0.15rem 0.6rem;
  border-radius: 4px;
  background-color: ${props => props.color || 'var(--primary)'};
  color: white;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const QuestPoints = styled.div`
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--primary);
  background: var(--gradientPrimary);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  position: relative;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(var(--accent-rgb), 0.1);
    border: 1px solid var(--borderColor);
    border-radius: 4px;
    z-index: -1;
  }
`;

const YourAdventurerCard = styled.div`
  padding: 1rem 1.5rem;
  background-color: var(--modalBackground);
  border-top: 2px solid var(--primaryDark);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 1;
`;

const YourAdventurerInfo = styled.div`
  display: flex;
  align-items: center;
`;

const ViewAllLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--textPrimary);
  text-decoration: none;
  transition: all 0.2s;
  background-color: rgba(var(--tertiary-rgb), 0.2);
  padding: 0.4rem 0.75rem;
  border-radius: 4px;
  border: 1px solid var(--borderColor);
  
  &:hover {
    background-color: rgba(var(--accent-rgb), 0.4);
    transform: translateY(-2px);
  }
`;

const LoadingIndicator = styled.div`
  padding: 2rem;
  text-align: center;
  color: var(--textSecondary);
  font-style: italic;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  
  &:before {
    content: '';
    display: block;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 3px solid var(--borderColor);
    border-top-color: var(--primary);
    animation: spin 1s infinite linear;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const NoQuestsFound = styled.div`
  padding: 1.5rem;
  text-align: center;
  color: var(--textSecondary);
  font-size: 1rem;
  font-style: italic;
`;

const CacheInfo = styled.div`
  padding: 0.25rem 0.75rem;
  font-size: 0.7rem;
  color: var(--textSecondary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.7;
  background-color: rgba(var(--primary-rgb), 0.05);
  border-bottom: 1px solid rgba(var(--borderColor-rgb), 0.3);
  
  svg {
    color: var(--accent);
  }
  
  &:before {
    content: '';
    display: block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: var(--success);
    box-shadow: 0 0 5px var(--success);
  }
`;

const QuestCount = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: var(--textSecondary);
  margin-left: 0.5rem;
`;

const BoardDecoration = styled.div`
  position: absolute;
  top: ${props => props.top || 'auto'};
  right: ${props => props.right || 'auto'};
  left: ${props => props.left || 'auto'};
  bottom: ${props => props.bottom || 'auto'};
  width: 16px;
  height: 16px;
  background-color: var(--primaryDark);
  border-radius: 50%;
  border: 2px solid var(--accent);
  z-index: 2;
`;

// Activity Cards
const ActivityCardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  padding: 1rem 1.5rem;
  margin-bottom: 1rem;
`;

const ActivityCard = styled.div`
  position: relative;
  background-color: ${props => props.completed ? 'rgba(var(--success-rgb), 0.1)' : 'var(--cardBackground)'};
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  min-height: 160px;
  border: 1px solid ${props => props.completed ? 'var(--success)' : 'rgba(var(--borderColor-rgb), 0.3)'};
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    border-color: ${props => props.completed ? 'var(--success)' : 'var(--primary)'};
    
    .card-image {
      transform: scale(1.1) rotate(5deg);
      opacity: 0.3;
    }
    
    .card-action {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  ${props => props.completed && `
    &::after {
      content: '✓';
      position: absolute;
      top: -10px;
      right: -10px;
      width: 40px;
      height: 40px;
      background-color: var(--success);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      font-weight: bold;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
      z-index: 3;
    }
  `}
  
  .card-content {
    z-index: 2;
    position: relative;
  }
  
  .card-image {
    position: absolute;
    top: 0;
    right: 0;
    width: 100px;
    height: 100px;
    opacity: 0.2;
    transition: all 0.3s ease;
    transform: rotate(0deg);
    border-radius: 50%;
    overflow: hidden;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  
  .card-title {
    font-weight: 700;
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
    color: ${props => props.completed ? 'var(--success)' : 'var(--textPrimary)'};
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    svg {
      color: ${props => props.completed ? 'var(--success)' : 'var(--primary)'};
    }
  }
  
  .card-description {
    font-size: 0.9rem;
    color: var(--textSecondary);
    margin-bottom: 1rem;
  }
  
  .card-reward {
    font-size: 0.85rem;
    font-weight: 600;
    color: ${props => props.completed ? 'var(--success)' : 'var(--accent)'};
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: auto;
    
    svg {
      color: ${props => props.completed ? 'var(--success)' : 'var(--accent)'};
    }
  }
  
  .card-progress {
    margin-top: 0.75rem;
    height: 4px;
    background-color: rgba(var(--borderColor-rgb), 0.3);
    border-radius: 2px;
    overflow: hidden;
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: ${props => props.progress || '0%'};
      background-color: ${props => props.completed ? 'var(--success)' : 'var(--accent)'};
      border-radius: 2px;
    }
  }
  
  .card-progress-text {
    font-size: 0.75rem;
    color: var(--textSecondary);
    margin-top: 0.25rem;
    text-align: right;
  }
  
  .card-action {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 0.75rem;
    background: linear-gradient(to top, var(--primaryDark), transparent);
    display: flex;
    justify-content: center;
    opacity: 0;
    transform: translateY(100%);
    transition: all 0.3s ease;
    z-index: 3;
    
    button {
      background: ${props => props.completed ? 'var(--success)' : 'var(--gradientPrimary)'};
      color: white;
      border: none;
      border-radius: 4px;
      padding: 0.5rem 1rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
      }
    }
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--textPrimary);
  margin: 0;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    color: var(--primary);
  }
`;

const SectionDivider = styled.div`
  height: 1px;
  background-color: rgba(var(--borderColor-rgb), 0.3);
  margin: 1rem 1.5rem;
`;

// Helper component for dynamic icons
const DynamicIcon = ({ iconName, size = 16, ...props }) => {
  const Icon = LucideIcons[iconName.charAt(0).toUpperCase() + iconName.slice(1)];
  
  if (!Icon) {
    return <Sword size={size} {...props} />;
  }
  
  return <Icon size={size} {...props} />;
};

const AdventureGuildBoard = () => {
  const { user } = useAuth();
  const [adventurers, setAdventurers] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cacheInfo, setCacheInfo] = useState({
    fromCache: false,
    notModified: false
  });

  // Fetch adventurer data
  useEffect(() => {
    const fetchAdventurers = async () => {
      try {
        setLoading(true);
        
        // Get top 10 adventurers
        const response = await leaderboardAPI.getLeaderboard({ 
          limit: 10,
          page: 1,
          useCache: true
        });
        
        if (response?.success) {
          setAdventurers(response.data.entries || []);
          setCacheInfo({
            fromCache: !!response.fromCache,
            notModified: !!response.notModified
          });
        }
        
        // If user is logged in, get their rank
        if (user) {
          const rankResponse = await leaderboardAPI.getMyRank(true);
          if (rankResponse?.success) {
            setUserRank(rankResponse.data);
          }
        }
      } catch (error) {
        console.error('Error fetching adventure guild data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAdventurers();
    
    // Refresh every 5 minutes
    const intervalId = setInterval(fetchAdventurers, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [user]);

  // Add some decorative board nails
  const decorations = [
    { top: '10px', left: '10px' },
    { top: '10px', right: '10px' },
    { bottom: '10px', left: '10px' },
    { bottom: '10px', right: '10px' }
  ];

  return (
    <GuildBoardContainer>
      {decorations.map((pos, idx) => (
        <BoardDecoration key={idx} {...pos} />
      ))}
      
      <GuildBoardHeader>
        <HeaderTitle>
          <HeaderIcon>
            <Scroll size={20} />
          </HeaderIcon>
          Adventure Guild Rankings
        </HeaderTitle>
      </GuildBoardHeader>
      
      {cacheInfo.fromCache && (
        <CacheInfo>
          <Clock size={12} />
          Last updated by the Guild Scribe
        </CacheInfo>
      )}
      
      <QuestBoardBody>
        <SectionTitle>
          <Trophy size={18} />
          Top Adventurers
        </SectionTitle>
        
        {loading ? (
          <LoadingIndicator>The Guild Scribe is updating the board...</LoadingIndicator>
        ) : adventurers.length > 0 ? (
          adventurers.map((entry, index) => {
            const rankClass = entry?.rankTier;
            return (
              <AdventurerItem 
                key={entry?.user?._id} 
                isCurrentUser={user && entry?.user?._id === user?._id}
              >
                <RankNumber rank={entry.rank}>{entry.rank}</RankNumber>
                <AdventurerAvatar>
                  {entry.user.avatarUrl ? (
                    <img src={entry.user.avatarUrl} alt={entry.user.username} />
                  ) : (
                    <Users size={22} />
                  )}
                </AdventurerAvatar>
                <AdventurerInfo>
                  <AdventurerName>{entry.user.username}</AdventurerName>
                  {entry.user.displayName && (
                    <AdventurerTitle>{entry.user.displayName}</AdventurerTitle>
                  )}
                  <AdventurerStats>
                    <RankBadge color={rankClass.color}>
                      <DynamicIcon iconName={rankClass.icon} size={14} />
                      {rankClass.title}
                    </RankBadge>
                    <QuestCount>
                      <Scroll size={14} />
                      {entry.achievementsCount || 0} quests completed
                    </QuestCount>
                  </AdventurerStats>
                </AdventurerInfo>
                <QuestPoints>{entry.points || 0} AP</QuestPoints>
              </AdventurerItem>
            );
          })
        ) : (
          <NoQuestsFound>No adventurers have registered yet!</NoQuestsFound>
        )}
      </QuestBoardBody>
      
      {user && userRank && (
        <YourAdventurerCard>
          <YourAdventurerInfo>
            <RankNumber rank={userRank.rank || 99}>{userRank.rank || '?'}</RankNumber>
            <AdventurerAvatar>
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.username} />
              ) : (
                <Users size={22} />
              )}
            </AdventurerAvatar>
            <AdventurerInfo>
              <AdventurerName>You</AdventurerName>
              <AdventurerStats>
                <span>{userRank.points || 0} AP</span>
                {userRank.rankTier && (
                  <RankBadge color={userRank.rankTier.color}>
                    <DynamicIcon iconName={userRank.rankTier.icon} size={14} />
                    {userRank.rankTier.title}
                  </RankBadge>
                )}
              </AdventurerStats>
            </AdventurerInfo>
          </YourAdventurerInfo>
          <ViewAllLink to="/leaderboard">
            Quest Hall <ChevronRight size={16} />
          </ViewAllLink>
        </YourAdventurerCard>
      )}
    </GuildBoardContainer>
  );
};

export default AdventureGuildBoard;