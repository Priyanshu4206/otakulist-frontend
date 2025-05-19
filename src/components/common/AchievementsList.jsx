import styled from 'styled-components';
import { Award } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

// Styled components for achievements
const Container = styled.div`
  width: 100%;
`;

const CategoryContainer = styled.div`
  margin-bottom: 2rem;
`;

const CategoryTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--textPrimary);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--borderColor);
  
  @media (max-width: 768px) {
    font-size: 1rem;
    gap: 0.5rem;
  }
`;

const CategoryProgress = styled.div`
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--textSecondary);
  margin-left: auto;
  padding: 0.25rem 0.75rem;
  background-color: var(--backgroundLight);
  border-radius: 999px;
`;

const AchievementsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
`;

const AchievementCard = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: 10px;
  background-color: ${props => props.unlocked ? 'rgba(var(--primary-rgb), 0.05)' : 'var(--cardBackground)'};
  border: 1px solid ${props => props.unlocked ? 'var(--primary)' : 'var(--borderColor)'};
  opacity: ${props => props.unlocked ? '1' : '0.75'};
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background-color: ${props => props.unlocked ? 'var(--primary)' : 'transparent'};
  }
  
  &:hover {
    transform: ${props => props.unlocked ? 'translateY(-3px)' : 'translateY(-1px)'};
    box-shadow: ${props => props.unlocked ? '0 6px 16px rgba(var(--primary-rgb), 0.15)' : '0 2px 8px rgba(0, 0, 0, 0.05)'};
    opacity: 1;
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
    gap: 0.75rem;
    
    &:hover {
      transform: ${props => props.unlocked ? 'translateY(-2px)' : 'none'};
    }
  }
`;

const AchievementIcon = styled.div`
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background-color: ${props => props.unlocked ? 'var(--primary)' : 'var(--backgroundLight)'};
  color: ${props => props.unlocked ? 'white' : 'var(--textSecondary)'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: ${props => props.unlocked ? '0 4px 8px rgba(var(--primary-rgb), 0.25)' : 'none'};
  transition: all 0.2s ease;
  
  ${AchievementCard}:hover & {
    transform: ${props => props.unlocked ? 'scale(1.1)' : 'scale(1.05)'};
  }
  
  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    
    ${AchievementCard}:hover & {
      transform: ${props => props.unlocked ? 'scale(1.05)' : 'none'};
    }
  }
`;

const AchievementInfo = styled.div`
  flex: 1;
`;

const AchievementTitle = styled.h4`
  font-size: 1.05rem;
  font-weight: 600;
  margin: 0 0 0.35rem 0;
  color: ${props => props.unlocked ? 'var(--primary)' : 'var(--textPrimary)'};
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
    margin: 0 0 0.25rem 0;
  }
`;

const AchievementDescription = styled.p`
  font-size: 0.85rem;
  color: var(--textSecondary);
  margin: 0 0 0.75rem 0;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
    margin: 0 0 0.5rem 0;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background-color: ${props => props.unlocked ? 'rgba(var(--success-rgb), 0.1)' : 'var(--backgroundLight)'};
  border-radius: 3px;
  margin-top: 0.5rem;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${props => props.percentage}%;
  background-color: ${props => props.unlocked ? 'var(--success)' : 'var(--primary)'};
  border-radius: 3px;
  transition: width 0.3s ease;
`;

const ProgressText = styled.span`
  font-size: 0.75rem;
  color: ${props => props.unlocked ? 'var(--success)' : 'var(--textSecondary)'};
  margin-top: 0.35rem;
  display: block;
  font-weight: ${props => props.unlocked ? '600' : '400'};
`;

const UnlockDate = styled.div`
  font-size: 0.7rem;
  color: var(--textSecondary);
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const NoAchievementsText = styled.div`
  padding: 1.5rem;
  text-align: center;
  color: var(--textSecondary);
`;

/**
 * AchievementsList Component - Fixed for consistent behavior
 * 
 * @param {Object} props - Component props
 * @param {Array} props.allAchievements - List of all possible achievements
 * @param {Array} props.userAchievements - List of user's achievements
 * @param {boolean} props.showProgress - Whether to show progress bars
 * @param {boolean} props.showCategory - Whether to show category headers
 * @param {boolean} props.isPublicProfile - Whether this is being shown on a public profile
 */
const AchievementsList = ({
  allAchievements = [],
  userAchievements = [],
  showProgress = true,
  showCategory = true,
  isPublicProfile = false,
}) => {
  // Helper to render Lucide icon by name
  const renderLucideIcon = (iconName) => {
    if (!iconName) return <Award size={22} />;
    const IconComponent = LucideIcons[iconName.charAt(0).toUpperCase() + iconName.slice(1)];
    return IconComponent ? <IconComponent size={22} /> : <Award size={22} />;
  };

  // Process achievements based on whether this is a public profile or private stats page
  let normalizedAchievements = [];
  
  if (isPublicProfile) {
    // For public profile (ProfilePage.jsx), userAchievements is an array of achievement objects
    // that already have all the necessary data
    normalizedAchievements = userAchievements.map(achievement => ({
      _id: achievement.id,
      title: achievement.title,
      description: achievement.description,
      category: achievement.category,
      iconUrl: achievement.iconUrl,
      points: achievement.points,
      unlocked: !!achievement.unlockedAt,
      unlockedAt: achievement.unlockedAt || null,
      progress: {
        current: 100,
        target: 100,
        percentage: 100
      }
    }));
  } else {
    // For StatsPage.jsx, we need to use allAchievements and merge with userAchievements
    // First, create a map of user achievements for easy lookup
    const userAchMap = {};
    
    userAchievements.forEach(achievement => {
      if (achievement.achievementId) {
        // Handle the nested structure
        userAchMap[achievement.achievementId._id] = {
          ...achievement.achievementId,
          unlocked: !!achievement.unlockedAt,
          unlockedAt: achievement.unlockedAt || null,
          progress: achievement.progress || {
            current: 0,
            target: 100,
            percentage: 0
          }
        };
      } else if (achievement._id || achievement.id) {
        // Handle flat structure
        const achievementId = achievement._id || achievement.id;
        userAchMap[achievementId] = {
          _id: achievementId,
          title: achievement.title,
          description: achievement.description,
          category: achievement.category,
          iconUrl: achievement.iconUrl,
          points: achievement.points,
          unlocked: !!achievement.unlockedAt,
          unlockedAt: achievement.unlockedAt || null,
          progress: achievement.progress || {
            current: 0,
            target: 100,
            percentage: 0
          }
        };
      }
    });
    
    // If allAchievements is provided, use it as the base and merge with user data
    if (allAchievements && allAchievements.length > 0) {
      normalizedAchievements = allAchievements.map(achievement => {
        const achievementId = achievement._id.toString();
        const userAchievement = userAchMap[achievementId];
        
        if (userAchievement) {
          // Merge the achievement data with user progress
          return {
            ...achievement,
            _id: achievementId,
            unlocked: userAchievement.unlocked,
            unlockedAt: userAchievement.unlockedAt,
            progress: userAchievement.progress
          };
        } else {
          // Achievement exists but user hasn't unlocked or made progress
          return {
            ...achievement,
            _id: achievementId,
            unlocked: false,
            unlockedAt: null,
            progress: {
              current: 0,
              target: achievement.criteria?.target || 100,
              percentage: 0
            }
          };
        }
      });
    } else {
      // If no allAchievements provided, just use the user achievements
      normalizedAchievements = Object.values(userAchMap);
    }
  }

  // If no achievements to display
  if (normalizedAchievements.length === 0) {
    return (
      <Container>
        <NoAchievementsText>No achievements to display.</NoAchievementsText>
      </Container>
    );
  }

  // Group achievements by category
  const grouped = normalizedAchievements.reduce((acc, achievement) => {
    const category = achievement.category || 'other';
    
    if (!acc[category]) acc[category] = [];
    acc[category].push(achievement);
    
    return acc;
  }, {});

  // Return the categorized view
  return (
    <Container>
      {Object.keys(grouped).map(category => (
        <CategoryContainer key={category}>
          {showCategory && (
            <CategoryTitle>
              {category.charAt(0).toUpperCase() + category.slice(1)}
              <CategoryProgress>
                {grouped[category].filter(a => a.unlocked).length} / {grouped[category].length}
              </CategoryProgress>
            </CategoryTitle>
          )}
          <AchievementsGrid>
            {grouped[category].map(achievement => (
              <AchievementCard key={achievement._id} unlocked={achievement.unlocked}>
                <AchievementIcon unlocked={achievement.unlocked}>{renderLucideIcon(achievement.iconUrl)}</AchievementIcon>
                <AchievementInfo>
                  <AchievementTitle unlocked={achievement.unlocked}>{achievement.title}</AchievementTitle>
                  <AchievementDescription>{achievement.description}</AchievementDescription>
                  {showProgress && achievement.progress && achievement.progress.target > 1 && (
                    <>
                      <ProgressBar unlocked={achievement.unlocked}>
                        <ProgressFill percentage={achievement.progress.percentage || 0} unlocked={achievement.unlocked} />
                      </ProgressBar>
                      <ProgressText unlocked={achievement.unlocked}>
                        {achievement.progress.current} / {achievement.progress.target}
                        {achievement.progress.percentage > 0 && ` (${achievement.progress.percentage}%)`}
                      </ProgressText>
                    </>
                  )}
                  {achievement.unlocked && achievement.unlockedAt && (
                    <UnlockDate>Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}</UnlockDate>
                  )}
                </AchievementInfo>
              </AchievementCard>
            ))}
          </AchievementsGrid>
        </CategoryContainer>
      ))}
    </Container>
  );
};

export default AchievementsList;