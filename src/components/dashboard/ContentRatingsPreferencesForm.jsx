import React, { useState, useEffect } from 'react';
import { 
  FormSection,
  FormGroup,
  Badge
} from '../../styles/ProfileStyles';
import ContentRatingsPreferences from '../profile/ContentRatingsPreferences';
import styled from 'styled-components';
import { Shield, AlertTriangle, Save, CheckCircle } from 'lucide-react';

const RatingsDescription = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--bgSecondary);
  border-left: 3px solid var(--primary);
  border-radius: 4px;
  margin-bottom: 1.5rem;

  p {
    margin: 0;
    color: var(--textSecondary);
    font-size: 0.9rem;
    line-height: 1.5;
  }
`;

const RatingsWarning = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: rgba(var(--warning-rgb), 0.1);
  border-left: 3px solid var(--warning);
  border-radius: 4px;
  margin: 1.5rem 0;

  p {
    margin: 0;
    color: var(--textSecondary);
    font-size: 0.9rem;
    line-height: 1.5;
  }
`;

const SelectedRatings = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SaveButton = styled.button`
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: var(--primary);
  color: var(--textPrimary);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  max-width: 250px;
  
  &:hover {
    background: var(--primaryDark);
    transform: translateY(-2px);
  }
  
  &:disabled {
    background: var(--secondary);
    color: var(--textSecondary);
    cursor: not-allowed;
    transform: none;
  }
`;

const ContentRatingsPreferencesForm = ({ formData, handleContentRatingChange, updateProfile }) => {
  const [localRatings, setLocalRatings] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Initialize local ratings from formData
  useEffect(() => {
    if (formData.preferences && formData.preferences.contentRatings) {
      // Ensure contentRatings is an array
      const ratings = Array.isArray(formData.preferences.contentRatings) 
        ? [...formData.preferences.contentRatings]
        : ["PG", "PG-13"];
      
      setLocalRatings(ratings);
    }
  }, [formData.preferences]);
  
  // Format the preferences data structure to match what ContentRatingsPreferences component expects
  const ratingsPreferencesData = {
    contentRatings: localRatings
  };
  
  // Handle local content ratings changes without immediately updating the parent
  const handleLocalPreferenceChange = (updatedPreferences) => {
    // Update local state
    setLocalRatings(updatedPreferences.contentRatings || []);
    setHasChanges(true);
  };
  
  // Save changes to parent component
  const handleSavePreferences = () => {    
    // Create a deep copy of the ratings to avoid reference issues
    const ratingsCopy = Array.isArray(localRatings) ? [...localRatings] : [];
    
    // Pass the updated ratings to update local state
    handleContentRatingChange({
      contentRatings: ratingsCopy
    });
    
    // Update the profile directly
    updateProfile && updateProfile({
      preferences: {
        field: 'contentRatings',
        data: ratingsCopy,
        skipDebounce: true
      }
    });
    
    setHasChanges(false);
  };

  // Get badge color based on rating
  const getRatingColor = (rating) => {
    switch(rating) {
      case 'G':
        return { bg: 'rgba(var(--success-rgb), 0.15)', color: 'var(--success)' };
      case 'PG':
        return { bg: 'rgba(var(--info-rgb), 0.15)', color: 'var(--info)' };
      case 'PG-13':
        return { bg: 'rgba(var(--primary-rgb), 0.15)', color: 'var(--primary)' };
      case 'R':
        return { bg: 'rgba(var(--warning-rgb), 0.15)', color: 'var(--warning)' };
      case 'R+':
      case 'Rx':
        return { bg: 'rgba(var(--danger-rgb), 0.15)', color: 'var(--danger)' };
      default:
        return { bg: 'var(--textSecondary)', color: 'var(--textSecondary)' };
    }
  };

  // Helper function to get rating display name
  const getRatingName = (rating) => {
    const ratingMap = {
      'G': 'G - All Ages',
      'PG': 'PG - Children',
      'PG-13': 'PG-13 - Teens 13+',
      'R': 'R - 17+ (Violence & Profanity)',
      'R+': 'R+ - Mild Nudity',
      'Rx': 'Rx - Explicit'
    };
    
    return ratingMap[rating] || rating;
  };
  
  const selectedRatings = localRatings;
  const showAdultWarning = selectedRatings.some(rating => ['R+', 'Rx'].includes(rating));

  return (
    <FormSection>
      <HeaderRow>
        <h3>Content Ratings Preferences</h3> 
      </HeaderRow>
      
      <RatingsDescription>
        <Shield size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
        <p>
          Content ratings determine the maturity level of anime shown in your recommendations.
          Select all ratings you're comfortable with viewing.
        </p>
      </RatingsDescription>
      
      {selectedRatings && selectedRatings.length > 0 && (
        <div style={{marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Currently selected ratings:</h4>
          <SelectedRatings>
            {selectedRatings.map(rating => {
              const { bg, color } = getRatingColor(rating);
              return (
                <Badge 
                  key={rating} 
                  background={bg}
                  color={color}
                >
                  {getRatingName(rating)}
                </Badge>
              );
            })}
          </SelectedRatings>
          <SaveButton 
          onClick={handleSavePreferences} 
          disabled={!hasChanges}
        >
          <Save size={18} />
          Save Ratings
        </SaveButton>
        </div>
      )}
      
      <FormGroup>
        <ContentRatingsPreferences 
          preferences={ratingsPreferencesData}
          onPreferenceChange={handleLocalPreferenceChange}
        />
      </FormGroup>
      
      {showAdultWarning && (
        <RatingsWarning>
          <AlertTriangle size={18} color="var(--warning)" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
          <p>
            You've selected mature content ratings. Please ensure your account settings are properly 
            configured if you want to see adult content in your recommendations.
          </p>
        </RatingsWarning>
      )}
    </FormSection>
  );
};

export default ContentRatingsPreferencesForm; 