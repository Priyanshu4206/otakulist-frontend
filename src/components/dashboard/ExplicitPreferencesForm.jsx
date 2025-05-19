import React, { useState, useEffect } from 'react';
import { 
  FormSection,
  FormGroup,
  Label,
  CheckboxLabel,
  Checkbox,
  Badge
} from '../../styles/ProfileStyles';
import styled from 'styled-components';
import { Settings, Sun, Cloud, Leaf, Snowflake, Save, CheckCircle } from 'lucide-react';

const PreferencesDescription = styled.div`
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

const ToggleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const ToggleItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bgTertiary);
  padding: 0.75rem 1rem;
  border-radius: 8px;
  
  &:hover {
    background: rgba(var(--primary-rgb), 0.05);
  }
`;

const ToggleLabel = styled.div`
  font-size: 0.95rem;
  color: var(--textPrimary);
  font-weight: 500;
`;

const SeasonsGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 1rem;
`;

const SeasonCard = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: ${props => props.selected ? 'rgba(var(--primary-rgb), 0.1)' : 'var(--bgTertiary)'};
  border: 1px solid ${props => props.selected ? 'var(--primary)' : 'var(--borderColor)'};
  padding: 0.85rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: var(--primary);
    transform: translateY(-2px);
  }
`;

const SeasonIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: ${props => props.background};
  color: white;
  border-radius: 50%;
`;

const SeasonInfo = styled.div`
  flex: 1;
`;

const SeasonName = styled.div`
  font-weight: 500;
  color: var(--textPrimary);
  font-size: 0.95rem;
`;

const SeasonDesc = styled.div`
  font-size: 0.8rem;
  color: var(--textSecondary);
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const SaveButton = styled.button`
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

const ExplicitPreferencesForm = ({ formData, handleExplicitPreferenceChange, updateProfile }) => {
  const [localPrefs, setLocalPrefs] = useState({
    showAdultContent: false,
    preferSubbed: true,
    preferDubbed: false,
    seasonalPreferences: []
  });
  const [hasChanges, setHasChanges] = useState(false);
  
  // Initialize local preferences from formData
  useEffect(() => {
    if (formData.preferences && formData.preferences.explicitSettings) {
      // Ensure seasonalPreferences is an array
      const explicitSettings = {
        ...formData.preferences.explicitSettings,
        seasonalPreferences: Array.isArray(formData.preferences.explicitSettings.seasonalPreferences) 
          ? [...formData.preferences.explicitSettings.seasonalPreferences]
          : []
      };
      
      setLocalPrefs(explicitSettings);
    }
  }, [formData.preferences]);
  
  // Handle toggle changes
  const handleToggleChange = (settingName) => {
    setLocalPrefs(prev => ({
      ...prev,
      [settingName]: !prev[settingName]
    }));
    setHasChanges(true);
  };
  
  // Handle season toggle
  const handleSeasonToggle = (season) => {
    setLocalPrefs(prev => {
      const currentSeasons = [...(prev.seasonalPreferences || [])];
      
      if (currentSeasons.includes(season)) {
        // Remove season if already selected
        return {
          ...prev,
          seasonalPreferences: currentSeasons.filter(s => s !== season)
        };
      } else {
        // Add season if not selected
        (`Adding season ${season}`);
        return {
          ...prev,
          seasonalPreferences: [...currentSeasons, season]
        };
      }
    });
    setHasChanges(true);
  };
  
  // Save changes to parent component
  const handleSavePreferences = () => {
    // Create a clean object with only the needed fields
    const explicitSettingsToSave = {
      showAdultContent: !!localPrefs.showAdultContent,
      preferSubbed: !!localPrefs.preferSubbed,
      preferDubbed: !!localPrefs.preferDubbed,
      seasonalPreferences: Array.isArray(localPrefs.seasonalPreferences) 
        ? [...localPrefs.seasonalPreferences]
        : []
    };
    
    // Update local state
    handleExplicitPreferenceChange(explicitSettingsToSave);
    
    // Update the profile directly
    updateProfile && updateProfile({
      preferences: {
        field: 'explicitSettings',
        data: explicitSettingsToSave,
        skipDebounce: true
      }
    });
    
    setHasChanges(false);
  };
  
  // Get season icon and color
  const getSeasonIcon = (season) => {
    switch(season) {
      case 'winter':
        return { icon: <Snowflake size={18} />, color: '#3498db', name: 'Winter', desc: 'Jan-Mar' };
      case 'spring':
        return { icon: <Leaf size={18} />, color: '#2ecc71', name: 'Spring', desc: 'Apr-Jun' };
      case 'summer':
        return { icon: <Sun size={18} />, color: '#f39c12', name: 'Summer', desc: 'Jul-Sep' };
      case 'fall':
        return { icon: <Cloud size={18} />, color: '#d35400', name: 'Fall', desc: 'Oct-Dec' };
      default:
        return { icon: <Sun size={18} />, color: 'var(--primary)', name: season, desc: '' };
    }
  };
  
  // All possible seasons based on database enum
  const seasons = ['winter', 'spring', 'summer', 'fall'];
  
  return (
    <FormSection>
      <HeaderRow>
        <h3>Viewing Preferences</h3>
        <SaveButton 
          onClick={handleSavePreferences} 
          disabled={!hasChanges}
        >
          <Save size={18} />
          Save Preferences
        </SaveButton>
      </HeaderRow>
      
      <PreferencesDescription>
        <Settings size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
        <p>
          Customize how you prefer to watch anime and what seasonal content you enjoy most.
          These settings help us tailor recommendations to your viewing habits.
        </p>
      </PreferencesDescription>
      
      <FormGroup>
        <Label>Content & Language Preferences</Label>
        <ToggleGroup>
          <ToggleItem>
            <ToggleLabel>Show Adult Content</ToggleLabel>
            <Checkbox
              id="showAdultContent"
              checked={!!localPrefs.showAdultContent}
              onChange={() => handleToggleChange('showAdultContent')}
            />
          </ToggleItem>
          
          <ToggleItem>
            <ToggleLabel>Prefer Subbed Anime</ToggleLabel>
            <Checkbox
              id="preferSubbed"
              checked={!!localPrefs.preferSubbed}
              onChange={() => handleToggleChange('preferSubbed')}
            />
          </ToggleItem>
          
          <ToggleItem>
            <ToggleLabel>Prefer Dubbed Anime</ToggleLabel>
            <Checkbox
              id="preferDubbed"
              checked={!!localPrefs.preferDubbed}
              onChange={() => handleToggleChange('preferDubbed')}
            />
          </ToggleItem>
        </ToggleGroup>
        
        <Label>Seasonal Preferences</Label>
        <p style={{ color: 'var(--textSecondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Select which anime seasons you enjoy most (affects seasonal recommendations)
        </p>
        
        <SeasonsGroup>
          {seasons.map(season => {
            const { icon, color, name, desc } = getSeasonIcon(season);
            const isSelected = Array.isArray(localPrefs.seasonalPreferences) && 
                             localPrefs.seasonalPreferences.includes(season);
            
            return (
              <SeasonCard 
                key={season}
                selected={isSelected}
                onClick={() => handleSeasonToggle(season)}
              >
                <SeasonIcon background={color}>
                  {icon}
                </SeasonIcon>
                <SeasonInfo>
                  <SeasonName>{name}</SeasonName>
                  <SeasonDesc>{desc}</SeasonDesc>
                </SeasonInfo>
              </SeasonCard>
            );
          })}
        </SeasonsGroup>
      </FormGroup>
    </FormSection>
  );
};

export default ExplicitPreferencesForm; 