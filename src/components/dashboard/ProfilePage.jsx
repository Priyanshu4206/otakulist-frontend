import { useState, useEffect, useRef } from 'react';
import { ExternalLink } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useToast from '../../hooks/useToast';
import BasicInfoForm from './BasicInfoForm';
import SocialMediaForm from './SocialMediaForm';
import GenrePreferencesForm from './GenrePreferencesForm';
import FormatPreferencesForm from './FormatPreferencesForm';
import ContentRatingsPreferencesForm from './ContentRatingsPreferencesForm';
import ExplicitPreferencesForm from './ExplicitPreferencesForm';
import AvatarUpload from './AvatarUpload';
import {
  DashboardHeader,
  WelcomeMessage,
  Greeting,
  SubGreeting,
  ViewProfileButton
} from '../../styles/ProfileStyles';
import styled from 'styled-components';
import UserAvatar from '../common/UserAvatar';
import GameScreenLoader from '../settings/GameScreenLoader';
import { genreAPI, userAPI } from '../../services/modules';

// Styled components for improved layout
const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0 1rem;
`;

const ProfileWrapper = styled.div`
  max-width: 1600px;
  width: 100%;
  margin: 0 auto;
`;

const UserInfoBar = styled.div`
  display: flex;
  align-items: center;
  background: var(--bgSecondary);
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
`;

const UserDetails = styled.div`
  margin-left: 1rem;
  flex: 1;
`;

const UserName = styled.h2`
  margin: 0;
  font-size: 1.4rem;
  color: var(--textPrimary);
`;

const UserUsername = styled.p`
  margin: 0.25rem 0 0;
  color: var(--textSecondary);
    font-size: 0.9rem;
`;

const ViewProfileLink = styled.div`
  margin-left: auto;
`;

const ProfileGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const PreferencesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-areas: 
    "genres ratings ratings"
    "genres explicit explicit"
    "formats formats formats";
  gap: 3rem;
  margin-top: 3rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    grid-template-areas: 
      "genres"
      "ratings"
      "explicit"
      "formats";
  }
`;

const PreferenceCard = styled.div`
`;

const BasicInfoGrid = styled.div`
  margin-bottom: 1.5rem;
`;

const PreferenceTitle = styled.h3`
  margin-top: 0;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--borderColor);
  margin-bottom: 1rem;
`;

const GenrePreferenceCard = styled(PreferenceCard)`
  grid-area: genres;
  height: 100%;
`;

const ContentRatingsCard = styled(PreferenceCard)`
  grid-area: ratings;
  display: flex;
  flex-direction: column;
  
  & > h3 {
    margin-bottom: 1rem;
  }
  
  & > div {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
`;

const ExplicitPreferenceCard = styled(PreferenceCard)`
  grid-area: explicit;
  display: flex;
  flex-direction: column;
  
  & > h3 {
    margin-bottom: 1rem;
  }
  
  & > div {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
`;

const FormatPreferenceCard = styled(PreferenceCard)`
  grid-area: formats;
  display: flex;
  flex-direction: column;
  
  & > h3 {
    margin-bottom: 1rem;
  }
  
  & > div {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
`;

const ProfilePage = () => {
  const { user, refreshUser, settings } = useAuth();
  // Support both user and user.user (from /auth/me)
  const userData = user || {};

  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    location: '',
    birthday: '',
    socialLinks: {
      youtube: '',
      instagram: '',
      twitter: '',
      discord: '',
      twitch: ''
    },
    preferences: {
      animeGenres: [],
      mangaGenres: [],
      preferredStudios: [],
      contentRatings: ["PG", "PG-13"],
      explicitSettings: {
        showAdultContent: false,
        preferSubbed: true,
        preferDubbed: false,
        seasonalPreferences: ["winter", "spring"]
      },
      formatPreferences: {
        tv: 1.5,
        movie: 1.0,
        ova: 0.5,
        ona: 0.5,
        special: 0.2,
        manga: 1.0,
        manhwa: 0.5,
        novel: 0.2
      },
      recommendationSettings: {
        showSimilarUsers: true,
        showSocialRecommendations: true,
        showTrending: true,
        diversityFactor: 0.3
      }
    }
  });
  
  // Keep track of original data to detect changes
  const [originalData, setOriginalData] = useState(null);
  
  // Track changed fields for partial updates
  const [changedFields, setChangedFields] = useState({});
  
  // Track if there are unsaved changes
  const [hasChanges, setHasChanges] = useState(false);

  // Track if an update is in progress
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [genres, setGenres] = useState([]);
  const { showToast } = useToast();

  // Debounce timer reference
  const updateTimerRef = useRef(null);

  // Function to handle profile updates
  const updateProfile = async (changes) => {
    try {
      // Clear any existing timer
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
      }
      
      // If this is a preference update that should be debounced
      if (changes.preferences && typeof changes.preferences === 'object' && !changes.preferences.skipDebounce) {
        // Set a timer to actually perform the update after a delay
        updateTimerRef.current = setTimeout(async () => {
          await performProfileUpdate(changes);
        }, 500); // 500ms debounce
        return;
      }
      
      // For non-debounced updates, proceed immediately
      await performProfileUpdate(changes);
    } catch (err) {
      console.error('Error in updateProfile:', err);
      showToast({ type: 'error', message: err.message || 'An error occurred. Please try again.' });
    }
  };
  
  // The actual profile update function
  const performProfileUpdate = async (changes) => {
    try {
      setIsUpdating(true);
      let updateData = {};
      
      // Handle basic fields
      if (changes.basic) {
        // Extract only the fields that should be updated
        const basicFields = changes.basicData || {};
        
        // Add each field to updateData
        Object.entries(basicFields).forEach(([key, value]) => {
          if (value !== undefined) {
            updateData[key] = value;
          }
        });
      }
      
      // Handle social links
      if (changes.social) {
        // Extract the social links that should be updated
        const socialLinks = changes.socialData || {};
        
        // Add each social link to updateData
        Object.entries(socialLinks).forEach(([key, value]) => {
          if (value !== undefined) {
            updateData[key] = value;
          }
        });
      }
      
      // Handle preferences
      if (changes.preferences) {
        // Handle partial preference updates if specified
        if (typeof changes.preferences === 'object') {
          // Only update specific parts of the preferences
          const { field, data, type } = changes.preferences;
          
          if (field && data) {
            // Create a partial preferences object with only the changed field
            const partialPreferences = {};
            
            // Handle specific preference field updates
            switch (field) {
              case 'animeGenres':
                partialPreferences.animeGenres = Array.isArray(data) ? data : 
                  formData.preferences.animeGenres || [];
                break;
                
              case 'mangaGenres':
                partialPreferences.mangaGenres = Array.isArray(data) ? data : 
                  formData.preferences.mangaGenres || [];
                break;
                
              case 'contentRatings':
                partialPreferences.contentRatings = Array.isArray(data) ? data : 
                  formData.preferences.contentRatings || [];
                break;
                
              case 'explicitSettings':
                partialPreferences.explicitSettings = typeof data === 'object' ? data : 
                  formData.preferences.explicitSettings || {};
                break;
                
              case 'formatPreferences':
                partialPreferences.formatPreferences = typeof data === 'object' ? data : 
                  formData.preferences.formatPreferences || {};
                break;
                
              default:
                // For unknown fields, include in the partial preferences
                partialPreferences[field] = data;
            }
            
            // Only send the specific changed preference field
            updateData.preferences = JSON.stringify(partialPreferences);
          } else {
            // If field is not specified, send full preferences (backward compatibility)
            const currentPreferences = { ...formData.preferences };
            
            // Ensure all preference objects are properly formatted
            
            // FormatPreferences - ensure all values are numbers
            if (currentPreferences.formatPreferences) {
              Object.entries(currentPreferences.formatPreferences).forEach(([key, value]) => {
                if (typeof value !== 'number') {
                  currentPreferences.formatPreferences[key] = parseFloat(value) || 0.5;
                }
              });
            }
            
            // ContentRatings - ensure it's an array
            if (!Array.isArray(currentPreferences.contentRatings)) {
              currentPreferences.contentRatings = [];
            }
            
            // ExplicitSettings - ensure proper boolean values
            if (currentPreferences.explicitSettings) {
              currentPreferences.explicitSettings = {
                showAdultContent: currentPreferences.explicitSettings.showAdultContent === true,
                preferSubbed: currentPreferences.explicitSettings.preferSubbed === true,
                preferDubbed: currentPreferences.explicitSettings.preferDubbed === true,
                seasonalPreferences: Array.isArray(currentPreferences.explicitSettings.seasonalPreferences) 
                  ? currentPreferences.explicitSettings.seasonalPreferences 
                  : []
              };
            }
            
            // AnimeGenres and MangaGenres - ensure proper arrays
            if (!Array.isArray(currentPreferences.animeGenres)) {
              currentPreferences.animeGenres = [];
            }
            
            if (!Array.isArray(currentPreferences.mangaGenres)) {
              currentPreferences.mangaGenres = [];
            }
            updateData.preferences = JSON.stringify(currentPreferences);
          }
        } else {
          // Old style full update
          const currentPreferences = { ...formData.preferences };
          
          // Ensure all preference objects are properly formatted
          // (existing validation code)
          
          updateData.preferences = JSON.stringify(currentPreferences);
        }
      }
      
      // Create FormData if we have updates or avatar
      if (Object.keys(updateData).length > 0 || avatar) {
        const data = new FormData();
        
        // Add fields to FormData
        Object.entries(updateData).forEach(([key, value]) => {
          data.append(key, value);
        });
        
        // Add avatar if selected
        if (avatar) {
          data.append('avatar', avatar);
        }
        
        // Make the API call
        const response = await userAPI.updateProfile(data);
        
        if (response.success) {
          // Refresh user data with preserveUI option to prevent UI flickering
          await refreshUser(true);
          
          // Update originalData to match current formData
          setOriginalData(JSON.stringify(formData));
          setChangedFields({});
          setHasChanges(false);
          
          if (avatar) {
            setAvatar(null);
            showToast({ type: 'success', message: 'Profile picture updated successfully!' });
          } else {
            showToast({ type: 'success', message: 'Profile updated successfully!' });
          }
        } else {
          showToast({ type: 'error', message: response.message || 'Failed to update profile' });
        }
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      showToast({ type: 'error', message: err.message || 'An error occurred. Please try again.' });
    } finally {
      setIsUpdating(false);
    }
  };

  // Fetch anime genres on mount
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        // Try to get raw data from localStorage directly first - exact format from your JSON
        const cachedData = localStorage.getItem('genres_list');
        if (cachedData) {
          try {
            const parsedData = JSON.parse(cachedData);
            
            // Check format from your example JSON
            if (parsedData.data && parsedData.data.success && Array.isArray(parsedData.data.data)) {
              setGenres(parsedData.data.data);
              return;
            }
          } catch (e) {
          }
        }
        
        // If direct localStorage access didn't work, use the API which will handle the cache
        const response = await genreAPI.getAllGenres({ useCache: true });
        
        if (response.success) {
          if (Array.isArray(response.data)) {
            setGenres(response.data);
          } else {
            console.warn('API response successful but unexpected format:', response);
            setGenres([]);
          }
        } else {
          console.warn('Unsuccessful genres API response');
          setGenres([]);
        }
      } catch (error) {
        console.error('Error fetching genres:', error);
        setGenres([]);
      }
    };
    
    fetchGenres();
  }, []);

  useEffect(() => {
    if (userData) {
      // Initialize preferences from either the new settings object or from user.settings
      const userPreferences = settings?.preferences || userData.preferences || {};
      
      // Ensure genre arrays are properly initialized
      const ensureGenreArray = (genreData) => {
        if (!genreData) return [];
        if (!Array.isArray(genreData)) return [];
        return genreData;
      };

      // Initialize form with user data
      const initialData = {
        displayName: userData.displayName || '',
        bio: userData.bio || '',
        location: userData.location || '',
        birthday: userData.birthday ? new Date(userData.birthday).toISOString().split('T')[0] : '',
        socialLinks: {
          youtube: userData.socialLinks?.youtube || '',
          instagram: userData.socialLinks?.instagram || '',
          twitter: userData.socialLinks?.twitter || '',
          discord: userData.socialLinks?.discord || '',
          twitch: userData.socialLinks?.twitch || ''
        },
        preferences: {
          animeGenres: ensureGenreArray(userPreferences.animeGenres),
          mangaGenres: ensureGenreArray(userPreferences.mangaGenres),
          preferredStudios: userPreferences.preferredStudios || [],
          contentRatings: Array.isArray(userPreferences.contentRatings) ? [...userPreferences.contentRatings] : ["PG", "PG-13"],
          explicitSettings: {
            showAdultContent: userPreferences.explicitSettings?.showAdultContent === true,
            preferSubbed: userPreferences.explicitSettings?.preferSubbed !== false, // default true
            preferDubbed: userPreferences.explicitSettings?.preferDubbed === true,
            seasonalPreferences: Array.isArray(userPreferences.explicitSettings?.seasonalPreferences) 
              ? [...userPreferences.explicitSettings.seasonalPreferences] 
              : []
          },
          formatPreferences: {
            ...(userPreferences.formatPreferences || {}),
            // Only set defaults for missing values
            tv: userPreferences.formatPreferences?.tv !== undefined ? userPreferences.formatPreferences.tv : 1.0,
            movie: userPreferences.formatPreferences?.movie !== undefined ? userPreferences.formatPreferences.movie : 1.0,
            ova: userPreferences.formatPreferences?.ova !== undefined ? userPreferences.formatPreferences.ova : 0.5,
            ona: userPreferences.formatPreferences?.ona !== undefined ? userPreferences.formatPreferences.ona : 0.5,
            special: userPreferences.formatPreferences?.special !== undefined ? userPreferences.formatPreferences.special : 0.5
          },
          recommendationSettings: {
            showSimilarUsers: userPreferences.recommendationSettings?.showSimilarUsers !== false, // default true
            showSocialRecommendations: userPreferences.recommendationSettings?.showSocialRecommendations !== false, // default true
            showTrending: userPreferences.recommendationSettings?.showTrending !== false, // default true
            diversityFactor: userPreferences.recommendationSettings?.diversityFactor !== undefined 
              ? userPreferences.recommendationSettings.diversityFactor 
              : 0.3
          }
        }
      };
      
      setFormData(initialData);
      setOriginalData(JSON.stringify(initialData));
      
      if (userData.avatarUrl) {
        setAvatarPreview(userData.avatarUrl);
      }
    }
  }, [userData, settings]);

  // Check for changes whenever formData is updated
  useEffect(() => {
    if (originalData) {
      const formDataJson = JSON.stringify(formData);
      const hasChanges = formDataJson !== originalData || avatar !== null;
      setHasChanges(hasChanges);
    }
  }, [formData, avatar, originalData]);

  // Handle format preference changes - locally only, no API call
  const handleFormatPreferenceChange = (format, value) => {
    // Extract skipDebounce flag if present
    let valueToUse = value;
    
    if (format === 'formats' && typeof value === 'object' && value._skipDebounce) {
      // Create a clean copy without the _skipDebounce flag
      const { _skipDebounce, ...cleanValue } = value;
      valueToUse = cleanValue;
    }
    
    // Update local state only
    if (format === 'formats' && typeof valueToUse === 'object') {
      // Handle bulk update (multiple formats at once)
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          formatPreferences: {
            ...prev.preferences.formatPreferences,
            ...valueToUse // Merge all updated formats
          }
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          formatPreferences: {
            ...prev.preferences.formatPreferences,
            [format]: parseFloat(valueToUse)
          }
        }
      }));
    }
    
    setChangedFields(prev => ({ 
      ...prev, 
      preferences: {
        ...(prev.preferences || {}),
        formatPreferences: true
      }
    }));
    
    // Mark that we have unsaved changes
    setHasChanges(true);
  };
  
  // Handle content ratings preferences - locally only, no API call
  const handleContentRatingChange = (updatedPreferences) => {
    // Extract skipDebounce flag if present
    let contentRatings = [];
    
    if (updatedPreferences._skipDebounce) {
      // Remove the flag from the object
      const { _skipDebounce, ...cleanPreferences } = updatedPreferences;
      contentRatings = cleanPreferences.contentRatings;
    } else {
      contentRatings = updatedPreferences.contentRatings;
    }
    
    if (!Array.isArray(contentRatings)) {
      console.warn('Content ratings is not an array:', contentRatings);
      return;
    }
    
    // Update local state only
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        contentRatings: [...contentRatings]
      }
    }));
    
    setChangedFields(prev => ({ 
      ...prev, 
      preferences: true
    }));
    
    // Mark that we have unsaved changes
    setHasChanges(true);
  };
  
  // Handle explicit preferences changes - locally only, no API call
  const handleExplicitPreferenceChange = (explicitSettings) => {
    // Extract skipDebounce flag if present
    let skipDebounce = false;
    let settingsToUse = { ...explicitSettings };
    
    if (explicitSettings._skipDebounce) {
      skipDebounce = true;
      // Remove the flag from the object
      const { _skipDebounce, ...cleanSettings } = explicitSettings;
      settingsToUse = cleanSettings;
    }
    
    // Ensure proper boolean values and array for seasonal preferences
    const cleanSettings = {
      showAdultContent: settingsToUse.showAdultContent === true,
      preferSubbed: settingsToUse.preferSubbed === true,
      preferDubbed: settingsToUse.preferDubbed === true,
      seasonalPreferences: Array.isArray(settingsToUse.seasonalPreferences) 
        ? [...settingsToUse.seasonalPreferences]
        : []
    };
    
    // Update local state only
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        explicitSettings: cleanSettings
      }
    }));
    
    setChangedFields(prev => ({ 
      ...prev, 
      preferences: true
    }));
    
    // If this is a direct save action with skipDebounce, update the profile
    if (skipDebounce) {
      // Send only the updated explicit settings
      updateProfile({ 
        preferences: { 
          field: 'explicitSettings', 
          data: cleanSettings,
          skipDebounce: true
        } 
      });
    } else {
      // Otherwise, just mark that we have unsaved changes
      setHasChanges(true);
    }
  };

  const handleGenreToggle = (genre, type = 'anime', isInitialize = false) => {
    // Update local state first
    setFormData(prev => {
      const fieldName = type === 'anime' ? 'animeGenres' : 'mangaGenres';
      
      // Check if initialization or empty array case - we'll return early
      if (isInitialize || !prev.preferences[fieldName]) {
        return {
          ...prev,
          preferences: {
            ...prev.preferences,
            [fieldName]: [] // Initialize as empty array
          }
        };
      }
      
      const currentGenres = prev.preferences[fieldName] || [];
      
      const index = currentGenres.findIndex(g => g.genreId === genre.id);
      if (index === -1) {
        // Add genre with proper format that matches backend requirements
        const newGenre = {
          genreId: genre.id,
          name: genre.name,
          weight: 1.0, // Default weight
          source: "explicit"
        };
        return {
          ...prev,
          preferences: {
            ...prev.preferences,
            [fieldName]: [
              ...currentGenres,
              newGenre
            ]
          }
        };
      } else {
        return {
          ...prev,
          preferences: {
            ...prev.preferences,
            [fieldName]: currentGenres.filter(g => g.genreId !== genre.id)
          }
        };
      }
    });
    
    setChangedFields(prev => {
      const newChangedFields = { 
        ...prev, 
        preferences: true
      };
      return newChangedFields;
    });
    
    // Only update automatically if it's an initialization or explicit save
    if (isInitialize) {
      updateProfile({ preferences: true });
    }
  };
  
  // Function to update genre weight - locally only, no API call
  const handleGenreWeightChange = (genreId, weight, type = 'anime') => {
    // Parse weight to ensure it's a number
    const numericWeight = parseFloat(weight);
    if (isNaN(numericWeight)) {
      console.error('Invalid weight value:', weight);
      return;
    }
    
    // Update local state only
    setFormData(prev => {
      const fieldName = type === 'anime' ? 'animeGenres' : 'mangaGenres';
      
      // Make sure the field exists and has array type
      if (!prev.preferences[fieldName] || !Array.isArray(prev.preferences[fieldName])) {
        return {
          ...prev,
          preferences: {
            ...prev.preferences,
            [fieldName]: [] // Initialize as empty array
          }
        };
      }
      
      const currentGenres = [...prev.preferences[fieldName]];
      const index = currentGenres.findIndex(g => g.genreId === genreId);
      
      if (index !== -1) {
        // Update weight for the selected genre
        const updatedGenre = {
          ...currentGenres[index],
          weight: numericWeight
        };
        
        currentGenres[index] = updatedGenre;
        
        return {
          ...prev,
          preferences: {
            ...prev.preferences,
            [fieldName]: currentGenres
          }
        };
      }
      
      return prev;
    });
    
    // Set preferences to true to indicate changes
    setChangedFields(prev => {
      const newChangedFields = { 
        ...prev, 
        preferences: true
      };
      return newChangedFields;
    });
    
    // Mark that we have unsaved changes
    setHasChanges(true);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validImageTypes.includes(file.type)) {
        showToast({ 
          type: 'error', 
          message: 'Please select a valid image file (JPEG, PNG, GIF, or WEBP)' 
        });
        return;
      }
      
      // Check file size (limit to 2MB)
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        showToast({ 
          type: 'error', 
          message: 'Image size should be less than 2MB' 
        });
        return;
      }
      
      // Set the avatar file and preview
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
      setChangedFields(prev => ({ ...prev, avatar: true }));
      setHasChanges(true);
      
      // Immediately upload the avatar
      const data = new FormData();
      data.append('avatar', file);
      
      // Show loading state
      setIsUpdating(true);
      
      // Upload the avatar
      userAPI.updateProfile(data)
        .then(response => {
          if (response.success) {
            // Refresh user data with preserveUI option to prevent UI flickering
            refreshUser(true);
            
            // Clear the avatar state
            setAvatar(null);
            
            // Show success message
            showToast({ 
              type: 'success', 
              message: 'Profile picture updated successfully!' 
            });
          } else {
            showToast({ 
              type: 'error', 
              message: response.message || 'Failed to update profile picture' 
            });
          }
        })
        .catch(err => {
          console.error('Error updating avatar:', err);
          showToast({ 
            type: 'error', 
            message: err.message || 'An error occurred while updating profile picture' 
          });
        })
        .finally(() => {
          setIsUpdating(false);
        });
    }
  };

  return (
    <>
      <DashboardHeader
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <WelcomeMessage>
          <Greeting>Profile Settings</Greeting>
          <SubGreeting>
            Update your profile information, social media links, and preferences.
          </SubGreeting>
        </WelcomeMessage>
      </DashboardHeader>
      {isUpdating && <GameScreenLoader />}
      <ProfileWrapper>
        <ProfileContainer>
          {/* User Info Bar - Compact view of user info with link to public profile */}
          <UserInfoBar>
          <UserAvatar
            src={userData.avatarUrl}
            alt={userData.displayName || userData.username}
              size={50}
            showBorder
            />
            <UserDetails>
              <UserName>{userData.displayName || userData.username}</UserName>
              <UserUsername>@{userData.username}</UserUsername>
            </UserDetails>
            <ViewProfileLink>
              <ViewProfileButton to={`/user/${userData.username}`} size="small">
            <ExternalLink size={16} />
                View Profile
          </ViewProfileButton>
            </ViewProfileLink>
          </UserInfoBar>
          
          {/* Main grid layout with preferences on left and recommendations on right */}
          <ProfileGrid>
            {/* Basic Info Section */}
            <BasicInfoGrid>
              <AvatarUpload 
                avatarPreview={avatarPreview} 
                handleAvatarChange={handleAvatarChange} 
              />
              <BasicInfoForm 
                formData={formData} 
                updateProfile={updateProfile}
              />
            </BasicInfoGrid>
            
            {/* Social Media Section */}
            <PreferenceCard style={{ marginBottom: '1.5rem' }}>
              <PreferenceTitle>Social Media Links</PreferenceTitle>
              <SocialMediaForm 
                formData={formData} 
                updateProfile={updateProfile}
              />
            </PreferenceCard>
          </ProfileGrid>

          {/* Preferences Grid */}
          <PreferencesGrid>
            {/* Genres - spans 2 rows on the left */}
            <GenrePreferenceCard>
              <PreferenceTitle>Genre Preferences</PreferenceTitle>
              <GenrePreferencesForm 
                genres={genres} 
                formData={formData} 
                handleGenreToggle={handleGenreToggle}
                handleGenreWeightChange={handleGenreWeightChange}
                updateProfile={updateProfile}
              />
            </GenrePreferenceCard>
            
            {/* Content Ratings - spans 2 columns in the top right */}
            <ContentRatingsCard>
              <ContentRatingsPreferencesForm
                formData={formData}
                handleContentRatingChange={handleContentRatingChange}
                updateProfile={updateProfile}
              />
            </ContentRatingsCard>
            
            {/* Explicit Preferences - spans 2 columns in the middle right */}
            <ExplicitPreferenceCard>
              <ExplicitPreferencesForm
                formData={formData}
                handleExplicitPreferenceChange={handleExplicitPreferenceChange}
                updateProfile={updateProfile}
              />
            </ExplicitPreferenceCard>
            
            {/* Formats - spans 3 columns in the bottom row */}
            <FormatPreferenceCard>
              <PreferenceTitle>Format Preferences</PreferenceTitle>
              <FormatPreferencesForm
                formData={formData}
                handleFormatPreferenceChange={handleFormatPreferenceChange}
                updateProfile={updateProfile}
              />
            </FormatPreferenceCard>
          </PreferencesGrid>
        </ProfileContainer>
      </ProfileWrapper>
    </>
  );
};

export default ProfilePage; 