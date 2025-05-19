import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  BookOpen, 
  CheckSquare, 
  Trophy, 
  Brain, 
  Gamepad2, 
  Share, 
  Puzzle,
  Star,
  Flame,
  Compass,
  Users,
  Zap,
  Award,
  Sparkles,
  ChevronRight,
  ClipboardList,
  FastForward,
  LayoutGrid,
  XCircle,
  Scale,
  UserPlus,
  FolderPlus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

// Import avatar images
import avatar1 from '../../assets/images/avatar-1.jpg';
import avatar2 from '../../assets/images/avatar-2.jpg';
import avatar3 from '../../assets/images/avatar-3.jpg';
import avatar4 from '../../assets/images/avatar-4.jpg';
import avatar5 from '../../assets/images/avatar-5.jpg';

// Map for icon names to Lucide components
const iconMap = {
  'clipboard-list': ClipboardList,
  'fast-forward': FastForward,
  'trophy': Trophy,
  'layout-grid': LayoutGrid,
  'x-circle': XCircle,
  'scale': Scale,
  'user-plus': UserPlus,
  'folder-plus': FolderPlus,
  // Add fallbacks for any other icons that might be used
  'flame': Flame,
  'star': Star,
  'compass': Compass,
  'users': Users,
  'zap': Zap,
  'award': Award
};

// Map for category to routing and actions
const categoryMap = {
  rating: {
    to: '/explore',
    action: 'Explore Animes',
    color: '#e91e63' // Pink
  },
  watching: {
    to: '/explore',
    action: 'Customize Watchlist',
    color: '#2196f3' // Blue
  },
  collection: {
    to: '/explore',
    action: 'Customize Playlists',
    color: '#4caf50' // Green
  },
  social: {
    to: '/explore',
    action: 'Find More People',
    color: '#9c27b0' // Purple
  }
};

// Avatar images to randomly assign to achievements
const avatarImages = [avatar1, avatar2, avatar3, avatar4, avatar5];

// Styled Components
const ActivityContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
  overflow: hidden; /* Prevent overflow from children except where explicitly allowed */
`;

const Header = styled.div`
  margin-bottom: 1rem;
`;

const Title = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--textPrimary);
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    color: var(--accent);
  }
`;

const Description = styled.p`
  font-size: 0.9rem;
  color: var(--textSecondary);
  margin: 0;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: ${props => props.mb || '0'};
  color: var(--textPrimary);
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;

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

  svg {
    color: var(--primary);
  }
`;

const ViewMoreLink = styled(Link)`
  color: var(--primaryLight);
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: none;
  display: flex;
  align-items: center;
  transition: color 0.2s;
  
  &:hover {
    color: var(--primary);
    text-decoration: underline;
  }
  
  &::after {
    content: '→';
    margin-left: 6px;
    transition: transform 0.2s;
  }
  
  &:hover::after {
    transform: translateX(3px);
  }
`;

const SectionDivider = styled.div`
  height: 1px;
  background-color: rgba(var(--borderColor-rgb), 0.3);
  margin: 1rem 0;
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  
  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

const ScrollableCardsContainer = styled.div`
  display: flex;
  overflow-x: auto;
  padding: 0.5rem 0;
  padding-bottom: 1rem; /* Extra space for scrollbar */
  gap: 1rem;
  // scrollbar-width: thin;
  // scrollbar-color: var(--primaryDark) transparent;
  width: 100%;
  position: relative;
  
  // /* Show scrollbar for better UX on desktop */
  // &::-webkit-scrollbar {
  //   height: 6px;
  // }
  
  // &::-webkit-scrollbar-track {
  //   background: transparent;
  // }
  
  // &::-webkit-scrollbar-thumb {
  //   background-color: var(--primaryDark);
  //   border-radius: 6px;
  // }
  
  /* Add padding to the right for better UX */
  &::after {
    content: '';
    min-width: 20px;
  }
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
  
  ${props => props.comingSoon && `
    &::after {
      content: 'SOON';
      position: absolute;
      top: 10px;
      right: -30px;
      width: 120px;
      background-color: var(--warning);
      color: white;
      font-size: 0.7rem;
      font-weight: bold;
      text-align: center;
      padding: 0.2rem 0;
      transform: rotate(45deg);
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
      color: ${props => props.color || (props.completed ? 'var(--success)' : 'var(--primary)')};
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

const ScrollableCard = styled(ActivityCard)`
  min-width: 280px;
  width: 280px;
  flex-shrink: 0;
  margin-bottom: 0.5rem;
`;

const ActivityCardLink = styled(Link)`
  text-decoration: none;
  color: inherit;
`;

// Helper function to get icon component from icon name
const getIconComponent = (iconName, size = 20) => {
  const IconComponent = iconMap[iconName] || Trophy; // Default to Trophy if icon not found
  return <IconComponent size={size} />;
};

// Helper function to get random avatar image
const getRandomAvatar = () => {
  const randomIndex = Math.floor(Math.random() * avatarImages.length);
  return avatarImages[randomIndex];
};

const ActivityButtons = ({ showActiveQuests = true, showOnlyActiveQuests = false, userStats }) => {
  const { isAuthenticated } = useAuth();
  
  // Activity button configurations for fun activities
  const activities = [
    {
      id: 'anime-quiz',
      title: 'Anime Quiz',
      description: 'Test your anime knowledge',
      icon: <Brain size={20} />,
      iconColor: '#8c54ff',
      reward: '15 Adventure Points',
      image: avatar1,
      to: '/activities/anime-quiz',
      comingSoon: false,
      action: 'Start Quiz'
    },
    {
      id: 'manga-updates',
      title: 'Manga Challenge',
      description: 'Read 3 new manga chapters',
      icon: <BookOpen size={20} />,
      iconColor: '#ff5c77',
      reward: '20 Adventure Points',
      image: avatar2,
      to: '/',
      comingSoon: true,
      action: 'Start Reading'
    },
    {
      id: 'trivia-challenge',
      title: 'Trivia Challenge',
      description: 'Daily anime trivia',
      icon: <CheckSquare size={20} />,
      iconColor: '#0ac2ff',
      reward: '10 Adventure Points',
      image: avatar3,
      to: '/',
      comingSoon: true,
      action: 'Take Challenge'
    },
    {
      id: 'events',
      title: 'Seasonal Event',
      description: 'Special seasonal challenges',
      icon: <Trophy size={20} />,
      iconColor: '#ffc107',
      reward: '30 Adventure Points',
      image: avatar4,
      to: '/',
      comingSoon: true,
      action: 'Join Event'
    }
  ];
  
  // Process user achievements if available
  const userAchievements = React.useMemo(() => {
    if (!isAuthenticated || !userStats?.achievements?.upcoming) {
      return [];
    }
    
    return userStats.achievements.upcoming.map(achievement => {
      const category = categoryMap[achievement.category] || {
        to: '/explore',
        action: 'Explore More',
        color: '#ff9800' // Default orange
      };
      
      return {
        id: achievement.id,
        title: achievement.title,
        description: achievement.description,
        icon: getIconComponent(achievement.iconUrl),
        iconColor: category.color,
        reward: `${achievement.points} Adventure Points`,
        image: getRandomAvatar(),
        to: category.to,
        progress: achievement.progress.percentage,
        progressText: `${achievement.progress.current}/${achievement.progress.target} ${achievement.category === 'rating' ? 'rated' : 'completed'}`,
        action: category.action,
        completed: achievement.progress.percentage === 100
      };
    });
  }, [isAuthenticated, userStats]);

  // If we're only showing active quests, render a specialized component
  if (showOnlyActiveQuests && isAuthenticated) {
    return (
      <ActivityContainer scrollableOnly>
        <SectionHeader>          
          <SectionTitle>
            <Award size={18} />
            Your Active Quests
          </SectionTitle>
          <ViewMoreLink to="/dashboard/stats">
            View all
          </ViewMoreLink>
        </SectionHeader>
        
        <ScrollableCardsContainer>
          {userAchievements.length > 0 ? userAchievements.map(achievement => (
            <ActivityCardLink to={achievement.to} key={achievement.id}>
              <ScrollableCard 
                progress={`${achievement.progress}%`}
                completed={achievement.completed}
                color={achievement.iconColor}
              >
                <div className="card-content">
                  <div className="card-title">
                    {achievement.icon}
                    {achievement.title}
                  </div>
                  <div className="card-description">
                    {achievement.description}
                  </div>
                  <div className="card-reward">
                    <Trophy size={14} />
                    {achievement.reward}
                  </div>
                  <div className="card-progress"></div>
                  <div className="card-progress-text">{achievement.progressText}</div>
                </div>
                <div className="card-image">
                  <img src={achievement.image} alt={achievement.title} />
                </div>
                <div className="card-action">
                  <button>
                    {achievement.completed ? <Award size={14} /> : <Sparkles size={14} />}
                    {achievement.action}
                  </button>
                </div>
              </ScrollableCard>
            </ActivityCardLink>
          )) : (
            <div style={{ padding: '1rem', color: 'var(--textSecondary)' }}>
              No active quests available. Start exploring anime to unlock achievements!
            </div>
          )}
        </ScrollableCardsContainer>
      </ActivityContainer>
    );
  }

  // Regular component showing fun activities and optionally active quests
  return (
    <ActivityContainer>
      <Header>
        <Title>
          <Trophy size={22} />
          Adventure Guild Quests
        </Title>
        <Description>Complete quests to earn Adventure Points and climb the ranks</Description>
      </Header>
      
      <SectionTitle mb="1rem">
        <Gamepad2 size={18} />
        Fun Activities
      </SectionTitle>
      
      <CardsGrid>
        {activities.map(activity => (
          <ActivityCardLink to={activity.to} key={activity.id}>
            <ActivityCard 
              comingSoon={activity.comingSoon}
              color={activity.iconColor}
            >
              <div className="card-content">
                <div className="card-title">
                  {activity.icon}
                  {activity.title}
                </div>
                <div className="card-description">
                  {activity.description}
                </div>
                <div className="card-reward">
                  <Trophy size={14} />
                  {activity.reward}
                </div>
              </div>
              <div className="card-image">
                <img src={activity.image} alt={activity.title} />
              </div>
              <div className="card-action">
                <button>
                  <Sparkles size={14} />
                  {activity.action}
                </button>
              </div>
            </ActivityCard>
          </ActivityCardLink>
        ))}
      </CardsGrid>
      
      {showActiveQuests && isAuthenticated && userAchievements.length > 0 && (
        <>
          <SectionDivider />
          
          <SectionHeader>
            <SectionTitle>
              <Award size={18} />
              Your Active Quests
            </SectionTitle>
            <ViewMoreLink to="/dashboard/stats">
              View all <ChevronRight size={16} />
            </ViewMoreLink>
          </SectionHeader>
          
          <ScrollableCardsContainer>
            {userAchievements.map(achievement => (
              <ActivityCardLink to={achievement.to} key={achievement.id}>
                <ScrollableCard 
                  progress={`${achievement.progress}%`}
                  completed={achievement.completed}
                  color={achievement.iconColor}
                >
                  <div className="card-content">
                    <div className="card-title">
                      {achievement.icon}
                      {achievement.title}
                    </div>
                    <div className="card-description">
                      {achievement.description}
                    </div>
                    <div className="card-reward">
                      <Trophy size={14} />
                      {achievement.reward}
                    </div>
                    <div className="card-progress"></div>
                    <div className="card-progress-text">{achievement.progressText}</div>
                  </div>
                  <div className="card-image">
                    <img src={achievement.image} alt={achievement.title} />
                  </div>
                  <div className="card-action">
                    <button>
                      {achievement.completed ? <Award size={14} /> : <Sparkles size={14} />}
                      {achievement.action}
                    </button>
                  </div>
                </ScrollableCard>
              </ActivityCardLink>
            ))}
          </ScrollableCardsContainer>
        </>
      )}
    </ActivityContainer>
  );
};

export default ActivityButtons; 