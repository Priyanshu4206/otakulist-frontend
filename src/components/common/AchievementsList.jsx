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

  // Log incoming data for debugging
  console.log('Rendering AchievementsList with:', {
    allAchievementsCount: allAchievements.length,
    userAchievementsCount: userAchievements.length,
    isPublicProfile
  });

  if (isPublicProfile) {
    // Enhanced grouping logic for public profile view
    const grouped = userAchievements.reduce((acc, uach) => {
      // Safely extract achievement data
      let achievement;

      if (typeof uach.achievementId === 'object' && uach.achievementId !== null) {
        achievement = uach.achievementId;
      } else {
        // If it's not an object, we can't display it properly
        console.warn('Skipping achievement with non-object achievementId:', uach);
        return acc;
      }

      const category = achievement.category || 'other';

      if (!acc[category]) acc[category] = [];

      acc[category].push({
        ...achievement,
        progress: uach.progress || {
          current: 0,
          target: achievement.criteria?.target || 1,
          percentage: 0
        },
        unlocked: !!uach.unlockedAt,
        unlockedAt: uach.unlockedAt || null,
        iconUrl: achievement.iconUrl,
      });

      return acc;
    }, {});

    if (userAchievements.length === 0) {
      return (
        <Container>
          <NoAchievementsText>No achievements to display.</NoAchievementsText>
        </Container>
      );
    }

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
  }

  // Default view: Improved merging of allAchievements with userAchievements
  const createUserAchievementMap = (userAchievements) => {
    return userAchievements.reduce((acc, userAch) => {
      // Handle cases where achievementId could be an object or string
      let achievementId;

      if (typeof userAch.achievementId === 'object' && userAch.achievementId !== null) {
        // Handle populated reference
        achievementId = userAch.achievementId._id;
      } else if (typeof userAch.achievementId === 'string') {
        // Handle string ID
        achievementId = userAch.achievementId;
      } else {
        console.warn('Unknown achievementId format:', userAch);
        return acc;
      }

      if (!achievementId) {
        console.warn('Could not extract achievementId from:', userAch);
        return acc;
      }

      // Store the full user achievement object
      acc[achievementId.toString()] = userAch;
      return acc;
    }, {});
  };

  // Create robust user achievement map
  const userAchMap = createUserAchievementMap(userAchievements);

  // Log for debugging
  console.log(`User achievements map has ${Object.keys(userAchMap).length} entries`);

  // Merge with more explicit checking
  const mergedAchievements = allAchievements.map(ach => {
    const achievementId = ach._id.toString();
    const userAch = userAchMap[achievementId];

    // Set defaults with explicit checking
    let progress = {
      current: 0,
      target: ach.criteria?.target || 1,
      percentage: 0
    };

    let unlocked = false;
    let unlockedAt = null;
    let bestReached = 0;

    // If user has this achievement, use their data
    if (userAch) {
      if (userAch.progress) {
        progress = userAch.progress;
      }

      unlocked = !!userAch.unlockedAt;
      unlockedAt = userAch.unlockedAt;
      bestReached = userAch.bestReached || 0;
    }

    // Return merged achievement with all necessary properties
    return {
      ...ach,
      progress,
      unlocked,
      unlockedAt,
      bestReached,
      iconUrl: ach.iconUrl,
    };
  });

  // Group by category
  const grouped = mergedAchievements.reduce((acc, ach) => {
    const category = ach.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(ach);
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