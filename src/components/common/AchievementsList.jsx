import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Trophy, Award, Star, TrendingUp, Users, BookOpen, Heart, Filter } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

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
`;

const AchievementInfo = styled.div`
  flex: 1;
`;

const AchievementTitle = styled.h4`
  font-size: 1.05rem;
  font-weight: 600;
  margin: 0 0 0.35rem 0;
  color: ${props => props.unlocked ? 'var(--primary)' : 'var(--textPrimary)'};
`;

const AchievementDescription = styled.p`
  font-size: 0.85rem;
  color: var(--textSecondary);
  margin: 0 0 0.75rem 0;
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
 * @param {Object} props.userData - User data containing achievements
 * @param {boolean} props.showProgress - Whether to show progress bars
 * @param {boolean} props.showCategory - Whether to show category headers
 * @param {string} props.categoryFilter - Only show achievements from this category
 * @param {boolean} props.isPublicProfile - Whether this is being shown on a public profile
 */
const AchievementsList = ({
  userData = null,
  showProgress = true,
  showCategory = true,
  categoryFilter = null,
  isPublicProfile = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  
  // Format date to a readable string
  const formatUnlockDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Render a single achievement card
  const renderAchievementCard = (achievement) => {
    const {
      title,
      description,
      unlocked,
      unlockedAt,
      progress,
      icon
    } = achievement;
    
    // Skip achievements with 0 progress on public profile
    if (isPublicProfile && !unlocked && (!progress || progress.percentage === 0)) {
      return null;
    }
    
    // Determine if we should show progress
    const shouldShowProgress = showProgress && progress && progress.target > 0;
    const percentage = progress?.percentage || 0;
    
    // Get appropriate icon, fallback to default if none found
    const achievementIcon = achievementIcons[title] || achievementIcons['default'];
    
    return (
      <AchievementCard key={title} unlocked={unlocked}>
        <AchievementIcon unlocked={unlocked}>
          {achievementIcon}
        </AchievementIcon>
        <AchievementInfo>
          <AchievementTitle unlocked={unlocked}>
            {title}
          </AchievementTitle>
          <AchievementDescription>
            {description}
          </AchievementDescription>
          
          {shouldShowProgress && (
            <>
              <ProgressBar unlocked={unlocked}>
                <ProgressFill 
                  percentage={percentage} 
                  unlocked={unlocked}
                />
              </ProgressBar>
              <ProgressText unlocked={unlocked}>
                {progress.current} / {progress.target}
                {percentage > 0 && ` (${percentage}%)`}
              </ProgressText>
            </>
          )}
          
          {unlocked && unlockedAt && (
            <UnlockDate>
              Unlocked: {formatUnlockDate(unlockedAt)}
            </UnlockDate>
          )}
        </AchievementInfo>
      </AchievementCard>
    );
  };
  
  // Check if we have user data
  if (!userData?.achievements) {
    return (
      <Container>
        <ErrorText>No achievement data available.</ErrorText>
      </Container>
    );
  }
  
  // Get achievements categories from user data
  const achievementCategories = userData.achievements.categories || [];
  
  // Filter categories if a categoryFilter is provided
  const filteredCategories = categoryFilter
    ? achievementCategories.filter(category => category.id === categoryFilter)
    : achievementCategories;

  // For public profiles, filter categories that have at least one achievement with progress
  const displayCategories = isPublicProfile
    ? filteredCategories.map(category => {
        // Filter achievements that have progress or are unlocked
        const achievementsWithProgress = category.achievements.filter(a => 
          a.unlocked || (a.progress && a.progress.percentage > 0)
        );
        
        // Return category with filtered achievements
        return {
          ...category,
          achievements: achievementsWithProgress,
          hasProgress: achievementsWithProgress.length > 0
        };
      }).filter(category => category.hasProgress)
    : filteredCategories;
  
  if (loading) {
    return <LoadingText>Loading achievements...</LoadingText>;
  }
  
  if (error) {
    return <ErrorText>{error}</ErrorText>;
  }
  
  // If no categories to display on public profile
  if (isPublicProfile && displayCategories.length === 0) {
    return (
      <Container>
        <NoAchievementsText>No achievements to display.</NoAchievementsText>
      </Container>
    );
  }
  
  return (
    <Container>
      {displayCategories.map(category => (
        <CategoryContainer key={category.id}>
          {showCategory && (
            <CategoryTitle>
              {/* Choose icon based on category id */}
              {category.id === 'anime' && <Trophy size={20} />}
              {category.id === 'social' && <Users size={20} />}
              {category.id === 'collection' && <BookOpen size={20} />}
              {category.id === 'genre' && <Filter size={20} />}
              {category.id === 'special' && <Star size={20} />}
              
              {category.name}
              <CategoryProgress>
                {category.unlockedCount} / {category.totalCount}
              </CategoryProgress>
            </CategoryTitle>
          )}
          
          <AchievementsGrid>
            {category.achievements.map(achievement => renderAchievementCard(achievement))}
          </AchievementsGrid>
        </CategoryContainer>
      ))}
    </Container>
  );
};

export default AchievementsList; 