import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Trophy, Award, Star, TrendingUp, Users, BookOpen, Heart, Filter } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
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

const LoadingText = styled.div`
  padding: 1.5rem;
  text-align: center;
  color: var(--textSecondary);
`;

const ErrorText = styled.div`
  padding: 1.5rem;
  text-align: center;
  color: var(--danger);
  background-color: rgba(var(--danger-rgb), 0.05);
  border-radius: 8px;
`;

const NoAchievementsText = styled.div`
  padding: 1.5rem;
  text-align: center;
  color: var(--textSecondary);
`;

// Achievement icons mapping
const achievementIcons = {
  // Anime watching achievements
  'Newbie': <Award size={22} />,
  'Binge Watcher': <TrendingUp size={22} />,
  'Anime Enthusiast': <Award size={22} />,
  'Otaku Master': <Trophy size={22} />,
  'Anime Sage': <Star size={22} />,
  'Legendary Weeb': <Trophy size={22} />,

  // Collection achievements
  'Collector': <BookOpen size={22} />,
  'Curator': <BookOpen size={22} />,
  'Librarian': <BookOpen size={22} />,

  // Social achievements
  'Socialite': <Users size={22} />,
  'Influencer': <Users size={22} />,
  'Celebrity': <Trophy size={22} />,

  // Genre achievements
  'Action Fan': <Filter size={22} />,
  'Romance Expert': <Heart size={22} />,
  'Fantasy Enthusiast': <Filter size={22} />,
  'Sci-Fi Geek': <Star size={22} />,

  // Special achievements
  'Early Adopter': <Star size={22} />,
  'Loyal Fan': <Users size={22} />,
  'Dedicated Reviewer': <Star size={22} />,

  // Default
  'default': <Award size={22} />
};

/**
 * AchievementsList Component - Updated for new schema
 * 
 * @param {Object} props - Component props
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

  if (isPublicProfile) {
    // Only show userAchievements, grouped by achievementId.category
    const grouped = userAchievements.reduce((acc, uach) => {
      const ach = typeof uach.achievementId === 'object' ? uach.achievementId : {};
      const category = ach.category || 'other';
      if (!acc[category]) acc[category] = [];
      acc[category].push({
        ...ach,
        ...uach,
        progress: uach.progress || { current: 0, target: ach.criteria?.target || 1, percentage: 0 },
        unlocked: !!uach.unlockedAt,
        unlockedAt: uach.unlockedAt || null,
        iconUrl: ach.iconUrl,
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

  // Default: merged allAchievements/userAchievements
  const userAchMap = userAchievements.reduce((acc, uach) => {
    const id = typeof uach.achievementId === 'object' ? uach.achievementId._id : uach.achievementId;
    acc[id] = uach;
    return acc;
  }, {});
  const mergedAchievements = allAchievements.map(ach => {
    const userAch = userAchMap[ach._id];
    return {
      ...ach,
      progress: userAch?.progress || { current: 0, target: ach.criteria?.target || 1, percentage: 0 },
      unlocked: !!userAch?.unlockedAt,
      unlockedAt: userAch?.unlockedAt || null,
      bestReached: userAch?.bestReached || 0,
      iconUrl: ach.iconUrl,
    };
  });
  const grouped = mergedAchievements.reduce((acc, ach) => {
    if (!acc[ach.category]) acc[ach.category] = [];
    acc[ach.category].push(ach);
    return acc;
  }, {});
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