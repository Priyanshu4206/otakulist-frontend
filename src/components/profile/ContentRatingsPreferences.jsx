import React from 'react';
import styled from 'styled-components';
import { Check } from 'lucide-react';
import useToast from '../../hooks/useToast';

// Styled components
const RatingsContainer = styled.div`
  margin-top: 1rem;
`;

const RatingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const RatingCard = styled.div`
  position: relative;
  border-radius: 8px;
  border: 2px solid ${props => props.selected ? 'var(--primary)' : 'var(--borderColor)'};
  padding: 1rem;
  background: ${props => props.selected ? 'rgba(var(--primary-rgb), 0.08)' : 'var(--bgSecondary)'};
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    border-color: var(--primary);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const RatingHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
`;

const RatingTitle = styled.div`
  font-weight: 600;
  color: var(--textPrimary);
  font-size: 1rem;
`;

const RatingDescription = styled.div`
  font-size: 0.8125rem;
  color: var(--textSecondary);
  line-height: 1.4;
`;

const CheckIcon = styled(Check)`
  color: var(--primary);
`;

const InfoText = styled.div`
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 4px;
  background: rgba(var(--primary-rgb), 0.08);
  color: var(--textPrimary);
  font-size: 0.875rem;
  line-height: 1.5;
`;

// Content rating constants
const CONTENT_RATINGS = [
  {
    id: 'G',
    name: 'G - All Ages',
    description: 'Content suitable for all ages. Contains minimal fantasy violence and/or mild language.'
  },
  {
    id: 'PG',
    name: 'PG - Children',
    description: 'May contain mild language, minimal violence, and/or mild suggestive themes. Parental guidance suggested for young children.'
  },
  {
    id: 'PG-13',
    name: 'PG-13 - Teens 13+',
    description: 'May contain violence, blood, suggestive themes, crude humor, limited profanity, and/or mild sexual content.'
  },
  {
    id: 'R',
    name: 'R - 17+ (Violence & Profanity)',
    description: 'Contains violence, profanity, and/or crude language. May include brief nudity if relevant to context. Not suitable for children.'
  },
  {
    id: 'R+',
    name: 'R+ - Mild Nudity',
    description: 'Contains mild nudity and/or sexual content. Intended for mature audiences only. Not suitable for minors.'
  },
  {
    id: 'Rx',
    name: 'Rx - Explicit',
    description: 'Contains explicit content. Only for adults and may include graphic violence, sexual content, and/or strong language.'
  }
];

const ContentRatingsPreferences = ({ 
  preferences, 
  onPreferenceChange
}) => {
  const { showToast } = useToast();
  
  // Get current content ratings
  const selectedRatings = preferences?.contentRatings || ['G', 'PG', 'PG-13'];

  // Handle toggling a rating
  const handleToggleRating = (ratingId) => {
    const currentPreferences = preferences || {};
    const currentRatings = [...(currentPreferences.contentRatings || ['G', 'PG', 'PG-13'])];
    
    if (currentRatings.includes(ratingId)) {
      // Don't allow removing all ratings
      if (currentRatings.length === 1) {
        showToast({
          type: 'warning',
          message: 'You must select at least one content rating'
        });
        return;
      }
      
      // Remove the rating
      const newRatings = currentRatings.filter(id => id !== ratingId);
      onPreferenceChange({
        ...currentPreferences,
        contentRatings: newRatings
      });
    } else {
      // Add the rating
      const newRatings = [...currentRatings, ratingId];
      onPreferenceChange({
        ...currentPreferences,
        contentRatings: newRatings
      });
    }
  };

  return (
    <RatingsContainer>
      <InfoText>
        Select the content ratings you're comfortable with. We'll use these settings to filter your recommendations.
      </InfoText>
      
      <RatingsGrid>
        {CONTENT_RATINGS.map(rating => (
          <RatingCard 
            key={rating.id}
            selected={selectedRatings.includes(rating.id)}
            onClick={() => handleToggleRating(rating.id)}
          >
            <RatingHeader>
              <RatingTitle>{rating.name}</RatingTitle>
              {selectedRatings.includes(rating.id) && <CheckIcon size={18} />}
            </RatingHeader>
            <RatingDescription>
              {rating.description}
            </RatingDescription>
          </RatingCard>
        ))}
      </RatingsGrid>
    </RatingsContainer>
  );
};

export default ContentRatingsPreferences; 