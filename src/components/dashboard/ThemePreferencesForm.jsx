import React, { useState } from 'react';
import { 
  FormSection,
  FormGroup,
  Label,
  Badge
} from '../../styles/ProfileStyles';
import ThemePreferences from '../profile/ThemePreferences';
import styled from 'styled-components';
import { Info } from 'lucide-react';

const InfoBox = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 0.75rem 1rem;
  background: var(--bgSecondary);
  border-left: 3px solid var(--primary);
  border-radius: 4px;
  margin-bottom: 1.5rem;
  gap: 0.75rem;
`;

const InfoIcon = styled(Info)`
  color: var(--primary);
  min-width: 18px;
`;

const InfoText = styled.div`
  color: var(--textSecondary);
  font-size: 0.9rem;
  line-height: 1.5;
`;

const ThemeStats = styled.div`
  display: flex;
  align-items: center;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const ThemePreferencesForm = ({ formData, handleThemeChange }) => {
  // Format the preferences data structure to match what ThemePreferences component expects
  const themePreferencesData = {
    themes: formData.preferences.themes || []
  };
  
  // Handle theme preference changes
  const handlePreferenceChange = (updatedPreferences) => {
    // Create a new preferences object to pass to the parent handler
    const newPreferences = {
      ...formData.preferences,
      themes: updatedPreferences.themes || []
    };
    
    // Pass the updated preferences to the parent handler
    handleThemeChange(newPreferences);
  };

  // Get theme counts by weight category
  const getThemeStats = () => {
    const themes = formData.preferences.themes || [];
    const stats = {
      high: 0,
      medium: 0,
      low: 0
    };
    
    themes.forEach(theme => {
      if (theme.weight >= 7) stats.high++;
      else if (theme.weight >= 4) stats.medium++;
      else stats.low++;
    });
    
    return stats;
  };
  
  const themeStats = getThemeStats();
  const totalThemes = (formData.preferences.themes || []).length;

  return (
    <FormSection>
      <h3>Theme Preferences</h3>
      
      <InfoBox>
        <InfoIcon size={18} />
        <InfoText>
          Themes help fine-tune your recommendations beyond genres. Add specific story elements, 
          settings, or characteristics that you enjoy in anime.
        </InfoText>
      </InfoBox>
      
      {totalThemes > 0 && (
        <ThemeStats>
          <Label style={{ margin: 0 }}>Current themes:</Label>
          <Badge background="rgba(var(--success-rgb), 0.15)" color="var(--success)">
            {themeStats.high} High priority
          </Badge>
          <Badge background="rgba(var(--warning-rgb), 0.15)" color="var(--warning)">
            {themeStats.medium} Medium priority
          </Badge>
          <Badge background="rgba(var(--danger-rgb), 0.1)" color="var(--danger)">
            {themeStats.low} Low priority
          </Badge>
        </ThemeStats>
      )}
      
      <FormGroup>
        <ThemePreferences 
          preferences={themePreferencesData}
          onPreferenceChange={handlePreferenceChange}
          maxSelections={15}
        />
      </FormGroup>
    </FormSection>
  );
};

export default ThemePreferencesForm; 