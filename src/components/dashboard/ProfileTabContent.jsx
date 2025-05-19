import React, { useState } from 'react';
import AvatarUpload from './AvatarUpload';
import BasicInfoForm from './BasicInfoForm';
import SocialMediaForm from './SocialMediaForm';
import GenrePreferencesForm from './GenrePreferencesForm';
import ThemePreferencesForm from './ThemePreferencesForm';
import FormatPreferencesForm from './FormatPreferencesForm';
import ContentRatingsPreferencesForm from './ContentRatingsPreferencesForm';
import { FormGrid, TabButton } from '../../styles/ProfileStyles';
import styled from 'styled-components';

// Styled components for preferences section
const PreferencesContainer = styled.div`
  width: 100%;
`;

const PreferencesTabs = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const PREFERENCE_TABS = {
  GENRES: 'genres',
  THEMES: 'themes',
  RATINGS: 'ratings',
  FORMATS: 'formats'
};

const ProfileTabContent = ({ 
  activeTab, 
  formData, 
  handleChange, 
  avatarPreview, 
  handleAvatarChange, 
  genres,
  handleGenreToggle,
  handleFormatPreferenceChange,
  handleContentRatingChange,
  handleThemeChange,
  handleGenreWeightChange
}) => {
  // State for preference sub-tabs
  const [activePreferenceTab, setActivePreferenceTab] = useState(PREFERENCE_TABS.GENRES);

  // Render preference content based on active preference tab
  const renderPreferenceContent = () => {
    switch (activePreferenceTab) {
      case PREFERENCE_TABS.GENRES:
        return (
          <GenrePreferencesForm 
            genres={genres} 
            formData={formData} 
            handleGenreToggle={handleGenreToggle}
            handleGenreWeightChange={handleGenreWeightChange}
          />
        );
      case PREFERENCE_TABS.THEMES:
        return (
          <ThemePreferencesForm 
            formData={formData}
            handleThemeChange={handleThemeChange}
          />
        );
      case PREFERENCE_TABS.RATINGS:
        return (
          <ContentRatingsPreferencesForm
            formData={formData}
            handleContentRatingChange={handleContentRatingChange}
          />
        );
      case PREFERENCE_TABS.FORMATS:
        return (
          <FormatPreferencesForm
            formData={formData}
            handleFormatPreferenceChange={handleFormatPreferenceChange}
          />
        );
      default:
        return null;
    }
  };

  // Main content rendering based on active main tab
  switch (activeTab) {
    case 'basic':
      return (
        <FormGrid>
          <AvatarUpload 
            avatarPreview={avatarPreview} 
            handleAvatarChange={handleAvatarChange} 
          />
          <BasicInfoForm 
            formData={formData} 
            handleChange={handleChange} 
          />
        </FormGrid>
      );
    case 'social':
      return (
        <SocialMediaForm 
          formData={formData} 
          handleChange={handleChange} 
        />
      );
    case 'preferences':
      return (
        <PreferencesContainer>
          <PreferencesTabs>
            <TabButton 
              active={activePreferenceTab === PREFERENCE_TABS.GENRES} 
              onClick={() => setActivePreferenceTab(PREFERENCE_TABS.GENRES)}
            >
              Genres
            </TabButton>
            <TabButton 
              active={activePreferenceTab === PREFERENCE_TABS.THEMES} 
              onClick={() => setActivePreferenceTab(PREFERENCE_TABS.THEMES)}
            >
              Themes
            </TabButton>
            <TabButton 
              active={activePreferenceTab === PREFERENCE_TABS.RATINGS} 
              onClick={() => setActivePreferenceTab(PREFERENCE_TABS.RATINGS)}
            >
              Content Ratings
            </TabButton>
            <TabButton 
              active={activePreferenceTab === PREFERENCE_TABS.FORMATS} 
              onClick={() => setActivePreferenceTab(PREFERENCE_TABS.FORMATS)}
            >
              Formats
            </TabButton>
          </PreferencesTabs>
          
          {renderPreferenceContent()}
        </PreferencesContainer>
      );
    default:
      return null;
  }
};

export default ProfileTabContent; 