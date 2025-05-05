import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Trophy, Award, Star, TrendingUp, Users, BookOpen, Heart, Filter } from 'lucide-react';
import { userAPI } from '../../services/api';
import useApiCache from '../../hooks/useApiCache';
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
  
  // Default
  'default': <Award size={22} />
};

// Achievement thresholds and categories
const achievementData = {
  categories: [
    {
      id: 'watching',
      name: 'Watching Progress',
      achievements: [
        { title: 'Newbie', description: 'Started your anime journey', threshold: 1 },
        { title: 'Binge Watcher', description: 'Completed 10+ anime series', threshold: 10 },
        { title: 'Anime Enthusiast', description: 'Completed 25+ anime series', threshold: 25 },
        { title: 'Otaku Master', description: 'Completed 50+ anime series', threshold: 50 },
        { title: 'Anime Sage', description: 'Completed 100+ anime series', threshold: 100 },
        { title: 'Legendary Weeb', description: 'Completed 200+ anime series', threshold: 200 }
      ]
    },
    {
      id: 'social',
      name: 'Social',
      achievements: [
        { title: 'Socialite', description: 'Followed by 10+ other users', threshold: 10 },
        { title: 'Influencer', description: 'Followed by 50+ other users', threshold: 50 },
        { title: 'Celebrity', description: 'Followed by 100+ other users', threshold: 100 }
      ]
    },
    {
      id: 'collection',
      name: 'Collection',
      achievements: [
        { title: 'Collector', description: 'Added 50+ anime to your watchlist', threshold: 50 },
        { title: 'Curator', description: 'Added 100+ anime to your watchlist', threshold: 100 },
        { title: 'Librarian', description: 'Added 200+ anime to your watchlist', threshold: 200 }
      ]
    },
    {
      id: 'genre',
      name: 'Genre Specialist',
      achievements: [
        { title: 'Action Fan', description: 'Completed 10+ action anime', threshold: 10 },
        { title: 'Romance Expert', description: 'Completed 10+ romance anime', threshold: 10 },
        { title: 'Fantasy Enthusiast', description: 'Completed 10+ fantasy anime', threshold: 10 },
        { title: 'Sci-Fi Geek', description: 'Completed 10+ sci-fi anime', threshold: 10 }
      ]
    },
    {
      id: 'special',
      name: 'Special',
      achievements: [
        { title: 'Early Adopter', description: 'Joined during the beta phase', threshold: 1 },
        { title: 'Loyal Fan', description: 'Active member for over 1 year', threshold: 1 },
        { title: 'Dedicated Reviewer', description: 'Rated 50+ anime', threshold: 50 }
      ]
    }
  ]
};

/**
 * AchievementsList Component
 * 
 * @param {Object} props - Component props
 * @param {Object} props.userData - User data containing achievements
 * @param {boolean} props.showProgress - Whether to show progress bars
 * @param {boolean} props.showCategory - Whether to show category headers
 * @param {string} props.categoryFilter - Only show achievements from this category
 */
const AchievementsList = ({ 
  userData = null, 
  showProgress = true,
  showCategory = true,
  categoryFilter = null
}) => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  
  useEffect(() => {
    const processAchievements = () => {
      try {
        setLoading(true);
        
        // Use either provided userData or current user
        const currentUser = userData || user;
        
        if (!currentUser) {
          setError("User data not available");
          setLoading(false);
          return;
        }
        
        // Get list of unlocked achievements
        const unlockedTitles = currentUser.achievements?.unlockedTitles || [];
        const followersCount = currentUser.followersCount || 0;
        const animeWatchedCount = currentUser.achievements?.animeWatchedCount || 0;
        const genreCounts = currentUser.achievements?.genreCounts || {
          action: 0,
          romance: 0,
          fantasy: 0,
          scifi: 0
        };
        
        // Process achievements data
        const processedCategories = achievementData.categories.map(category => {
          // Skip if filtering by category and this isn't the target
          if (categoryFilter && category.id !== categoryFilter) {
            return null;
          }
          
          const enhancedAchievements = category.achievements.map(achievement => {
            // Check if achievement is unlocked
            const unlockedInfo = unlockedTitles.find(a => a.title === achievement.title);
            const isUnlocked = !!unlockedInfo;
            
            // Determine progress based on achievement type
            let progress = { current: 0, target: achievement.threshold, percentage: 0 };
            
            // Always show Newbie as completed
            if (achievement.title === 'Newbie') {
              progress = { current: 1, target: 1, percentage: 100 };
            }
            // For social achievements, use followers count
            else if (['Socialite', 'Influencer', 'Celebrity'].includes(achievement.title)) {
              const current = Math.min(followersCount, achievement.threshold);
              progress = {
                current,
                target: achievement.threshold,
                percentage: Math.round((current / achievement.threshold) * 100)
              };
            }
            // For watching progress achievements
            else if (['Binge Watcher', 'Anime Enthusiast', 'Otaku Master', 'Anime Sage', 'Legendary Weeb'].includes(achievement.title)) {
              const current = Math.min(animeWatchedCount, achievement.threshold);
              progress = {
                current,
                target: achievement.threshold,
                percentage: Math.round((current / achievement.threshold) * 100)
              };
            }
            // For genre-specific achievements
            else if (achievement.title === 'Action Fan') {
              const current = Math.min(genreCounts.action || 0, achievement.threshold);
              progress = {
                current,
                target: achievement.threshold,
                percentage: Math.round((current / achievement.threshold) * 100)
              };
            }
            else if (achievement.title === 'Romance Expert') {
              const current = Math.min(genreCounts.romance || 0, achievement.threshold);
              progress = {
                current,
                target: achievement.threshold,
                percentage: Math.round((current / achievement.threshold) * 100)
              };
            }
            else if (achievement.title === 'Fantasy Enthusiast') {
              const current = Math.min(genreCounts.fantasy || 0, achievement.threshold);
              progress = {
                current,
                target: achievement.threshold,
                percentage: Math.round((current / achievement.threshold) * 100)
              };
            }
            else if (achievement.title === 'Sci-Fi Geek') {
              const current = Math.min(genreCounts.scifi || 0, achievement.threshold);
              progress = {
                current,
                target: achievement.threshold,
                percentage: Math.round((current / achievement.threshold) * 100)
              };
            }
            
            // If achievement is unlocked, ensure progress shows at least 100%
            if (isUnlocked && progress.percentage < 100) {
              progress = {
                current: achievement.threshold,
                target: achievement.threshold,
                percentage: 100
              };
            }
            
            return {
              ...achievement,
              unlocked: isUnlocked,
              unlockDate: unlockedInfo?.unlockedAt,
              progress
            };
          });
          
          // Count unlocked achievements in this category
          const unlockedCount = enhancedAchievements.filter(a => a.unlocked).length;
          
          return {
            ...category,
            achievements: enhancedAchievements,
            unlockedCount,
            totalCount: enhancedAchievements.length
          };
        }).filter(Boolean); // Remove null categories from filtering
        
        setAchievements(processedCategories);
        setLoading(false);
      } catch (error) {
        console.error('Error processing achievements:', error);
        setError('Failed to process achievements data');
        setLoading(false);
      }
    };
    
    processAchievements();
  }, [user, userData, categoryFilter]);
  
  const formatUnlockDate = (dateString) => {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const renderAchievementCard = (achievement) => {
    const icon = achievementIcons[achievement.title] || achievementIcons.default;
    
    return (
      <AchievementCard key={achievement.title} unlocked={achievement.unlocked}>
        <AchievementIcon unlocked={achievement.unlocked}>
          {icon}
        </AchievementIcon>
        
        <AchievementInfo>
          <AchievementTitle unlocked={achievement.unlocked}>
            {achievement.title}
          </AchievementTitle>
          
          <AchievementDescription>
            {achievement.description}
          </AchievementDescription>
          
          {showProgress && (
            <>
              <ProgressBar unlocked={achievement.unlocked}>
                <ProgressFill 
                  percentage={achievement.progress.percentage} 
                  unlocked={achievement.unlocked} 
                />
              </ProgressBar>
              
              <ProgressText unlocked={achievement.unlocked}>
                {achievement.progress.current}/{achievement.progress.target} ({achievement.progress.percentage}%)
              </ProgressText>
              
              {achievement.unlocked && achievement.unlockDate && (
                <UnlockDate>
                  Unlocked: {formatUnlockDate(achievement.unlockDate)}
                </UnlockDate>
              )}
            </>
          )}
        </AchievementInfo>
      </AchievementCard>
    );
  };
  
  if (loading) {
    return <LoadingText>Loading achievements...</LoadingText>;
  }
  
  if (error) {
    return <ErrorText>{error}</ErrorText>;
  }
  
  return (
    <Container>
      {achievements.map((category, index) => (
        <CategoryContainer key={`${category.id}-${index}`}>
          {showCategory && (
            <CategoryTitle>
              {category.name}
              <CategoryProgress>
                {category.unlockedCount}/{category.totalCount}
              </CategoryProgress>
            </CategoryTitle>
          )}
          
          <AchievementsGrid>
            {category.achievements.map(renderAchievementCard)}
          </AchievementsGrid>
        </CategoryContainer>
      ))}
    </Container>
  );
};

export default AchievementsList; 