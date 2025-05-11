import React, { useState, useEffect, useCallback } from 'react';
import { Settings, LogOut, Trash2} from 'lucide-react';
import Card from '../common/Card';
import useTheme from '../../hooks/useTheme';
import useAuth from '../../hooks/useAuth';
import TimezoneSelect from './TimezoneSelect';
import useToast from '../../hooks/useToast';
import DeleteModal from '../common/DeleteModal';
import SettingsGroup from '../settings/SettingsGroup';
import SettingsToggle from '../settings/SettingsToggle';
import SettingsSelect from '../settings/SettingsSelect';
import GameScreenLoader from '../settings/GameScreenLoader';
import ButtonLoader from '../settings/ButtonLoader';
import { getCachedSettings, setCachedSettings } from '../../utils/settingsCache';
import { saveUserTimezone } from '../../utils/simpleTimezoneUtils';
import styled from 'styled-components';
import ReactDOM from 'react-dom';

// Default theme to use if none is set
export const DEFAULT_THEME = 'naruto-dark';

// Get theme from localStorage with fallback to default
export const getUserTheme = () => {
  const storedTheme = localStorage.getItem('preferred_theme');
  if (storedTheme) {
    return storedTheme;
  }
  
  // Save default theme to localStorage if not set
  localStorage.setItem('preferred_theme', DEFAULT_THEME);
  return DEFAULT_THEME;
};

// Save theme to localStorage
export const saveUserTheme = (theme) => {
  if (!theme) return;
  
  try {
    localStorage.setItem('preferred_theme', theme);
  } catch (error) {
    console.error('Failed to save theme preference:', error);
  }
};

const ThemeButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    gap: 0.5rem;
  }
  
  @media (max-width: 480px) {
    gap: 0.35rem;
    justify-content: center;
  }
`;

const ThemeButton = styled.button`
  background: ${({ active }) => active ? 'rgba(var(--primary-rgb), 0.12)' : 'rgba(var(--cardBackground-rgb), 0.7)'};
  color: ${({ active }) => active ? 'var(--primary)' : 'var(--textPrimary)'};
  border: 1px solid ${({ active }) => active ? 'var(--primary)' : 'var(--borderColor)'};
  border-radius: 8px;
  padding: 0.7rem 1.2rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: ${({ loading }) => loading ? 'wait' : 'pointer'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  transition: all 0.2s;
  opacity: ${({ loading }) => loading ? 0.7 : 1};
  
  &:hover:not(:disabled) {
    background: ${({ active }) => active ? 'rgba(var(--primary-rgb), 0.18)' : 'rgba(var(--primary-rgb), 0.07)'};
    color: var(--primary);
    border-color: var(--primary);
  }
  
  @media (max-width: 768px) {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem 0.8rem;
    font-size: 0.85rem;
    flex: 1 0 calc(50% - 0.35rem);
    justify-content: center;
  }
`;

const DangerZone = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  border: 1px solid var(--error);
  border-radius: 8px;
  background-color: rgba(var(--error-rgb), 0.05);
  
  h3 {
    color: var(--error);
    margin-bottom: 1rem;
    font-size: 1.2rem;
  }
  
  p {
    margin-bottom: 1.5rem;
    color: var(--textSecondary);
  }
  
  @media (max-width: 768px) {
    padding: 1.25rem;
    margin-top: 1.5rem;
    
    h3 {
      font-size: 1.1rem;
      margin-bottom: 0.75rem;
    }
    
    p {
  font-size: 0.9rem;
      margin-bottom: 1.25rem;
    }
  }
  
  @media (max-width: 480px) {
    padding: 1rem;
    margin-top: 1.25rem;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.75rem;
  }
`;

const DangerButton = styled.button`
  background-color: var(--error);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: var(--errorDark);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  @media (max-width: 480px) {
    width: 100%;
    justify-content: center;
  }
`;

const SecondaryButton = styled.button`
  background-color: transparent;
  color: var(--textPrimary);
  border: 1px solid var(--borderColor);
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  
  &:hover {
    background-color: rgba(var(--primary-rgb), 0.05);
    border-color: var(--primary);
    color: var(--primary);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  @media (max-width: 480px) {
    width: 100%;
    justify-content: center;
  }
`;

const SettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    gap: 1.25rem;
  }
  
  @media (max-width: 480px) {
    gap: 1rem;
  }
`;

const SettingsHeader = styled.div`
  margin-bottom: 1.5rem;
  
  h2 {
    font-size: 1.75rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: var(--textPrimary);
  }
  
  p {
    color: var(--textSecondary);
    font-size: 1rem;
  }
  
  @media (max-width: 768px) {
    margin-bottom: 1rem;
    
    h2 {
      font-size: 1.5rem;
    }
    
    p {
      font-size: 0.9rem;
    }
  }
  
  @media (max-width: 480px) {
    h2 {
      font-size: 1.35rem;
    }
  }
`;

const ThemeSection = styled.div`
  margin-bottom: 2rem;
  
  h3 {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: var(--textPrimary);
  }
  
  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
    
    h3 {
      font-size: 1.1rem;
      margin-bottom: 0.75rem;
    }
  }
  
  @media (max-width: 480px) {
    margin-bottom: 1.25rem;
    
    h3 {
      font-size: 1rem;
    }
  }
`;

const SettingsPage = () => {
  const { logout } = useAuth();
  const { showToast } = useToast();
  const { changeTheme, availableThemes } = useTheme();

  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [themeChanging, setThemeChanging] = useState(false);
  const [screenLoading, setScreenLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(''); // which button is loading

  // Fetch settings with session cache
  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      let cached = getCachedSettings();
      if (cached) {
        setSettings(cached);
        setLoading(false);
        return;
      }
      try {
        const response = await import('../../services/api').then(m => m.userAPI.getSettings());
        if (response && response.success) {
          setSettings(response.data);
          setCachedSettings(response.data);
        } else {
          throw new Error(response?.message || 'Failed to load settings');
        }
      } catch (err) {
        showToast({ type: 'error', message: err.message || 'Failed to load settings' });
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, [showToast]);

  // Helper to update settings in state and cache
  const updateSetting = useCallback((category, key, value) => {
    setSettings(prev => {
      if (!prev) return prev;
      
      // Handle nested settings like notifications.email.enabled
      if (key.includes('.')) {
        const [parentKey, childKey] = key.split('.');
        return {
          ...prev,
          [category]: {
            ...prev[category],
            [parentKey]: {
              ...prev[category][parentKey],
              [childKey]: value
            }
          }
        };
      }
      
      // Handle simple settings
      const updated = { 
        ...prev, 
        [category]: { 
          ...prev[category], 
          [key]: value 
        } 
      };
      setCachedSettings(updated);
      return updated;
    });
  }, []);

  // Handle setting change with API call
  const handleSettingChange = async (category, key, value, opts = {}) => {
    const { skipUpdate = false, skipToast = false } = opts;
    
    if (!skipUpdate) {
      setIsUpdating(true);
    }
    
    try {
      updateSetting(category, key, value);
      
      // For nested settings, construct the proper payload
      let payload;
      if (key.includes('.')) {
        const [parentKey, childKey] = key.split('.');
        payload = { 
          [parentKey]: {
            ...settings[category][parentKey],
            [childKey]: value
          }
        };
      } else {
        payload = { [key]: value };
      }
      
      const response = await import('../../services/api').then(m => 
        m.userAPI.updateSettings(category, payload)
      );
      
      if (!response || !response.success) {
        throw new Error(response?.message || 'Failed to update setting');
      }
      
      if (!skipToast) {
        showToast({ type: 'success', message: 'Setting updated successfully' });
      }
      
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Failed to update setting' });
      // Revert the setting in state
      if (settings && settings[category]) {
        if (key.includes('.')) {
          const [parentKey, childKey] = key.split('.');
          if (settings[category][parentKey] && settings[category][parentKey][childKey] !== undefined) {
            updateSetting(category, key, settings[category][parentKey][childKey]);
          }
        } else if (settings[category][key] !== undefined) {
          updateSetting(category, key, settings[category][key]);
        }
      }
    } finally {
      if (!skipUpdate) {
        setIsUpdating(false);
      }
    }
  };

  // Handle theme change
  const handleThemeChange = async (newTheme) => {
    setThemeChanging(true);
    setButtonLoading(newTheme);
    
    try {
      changeTheme(newTheme);
      saveUserTheme(newTheme);
      await handleSettingChange('display', 'theme', newTheme, { skipUpdate: true, skipToast: true });
      showToast({ type: 'success', message: 'Theme updated successfully' });
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Failed to update theme' });
    } finally {
      setThemeChanging(false);
      setButtonLoading('');
    }
  };

  // Handle timezone change
  const handleTimezoneChange = async (timezone) => {
    try {
      setIsUpdating(true);
      // Save to localStorage for immediate effect
      saveUserTimezone(timezone);
      
      // Make the API call with proper category and key
      const response = await import('../../services/api').then(m => 
        m.userAPI.updateSettings('display', { timezone })
      );
      
      if (!response || !response.success) {
        throw new Error(response?.message || 'Failed to update timezone');
      }
      
      // Update local state
      updateSetting('display', 'timezone', timezone);
      
      showToast({ type: 'success', message: 'Timezone updated successfully' });
    } catch (err) {
      console.error('Timezone update error:', err);
      showToast({ type: 'error', message: err.message || 'Failed to update timezone' });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Failed to logout' });
    }
  };

  // Handle account deletion
  const handleDeleteAccount = () => setShowDeleteModal(true);
  
  const confirmDeleteAccount = async () => {
    setScreenLoading(true);
    try {
      const response = await import('../../services/api').then(m => m.userAPI.deleteAccount());
      if (response && response.success) {
        showToast({ type: 'success', message: 'Account deleted successfully' });
        await logout();
      } else {
        throw new Error(response?.message || 'Failed to delete account');
      }
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Failed to delete account' });
    } finally {
      setScreenLoading(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <p>Loading settings...</p>
      </div>
    );
  }

  // Get current theme from settings or localStorage
  const currentTheme = settings?.display?.theme || getUserTheme();
  
  // Format theme name for display
  const formatThemeName = (theme) => {
    return theme.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <SettingsContainer>
      <SettingsHeader>
        <h2>Account Settings</h2>
        <p>Manage your account preferences, appearance, and privacy settings.</p>
      </SettingsHeader>
      
      <Card title="Display" icon={<Settings size={18} />}>
        <ThemeSection>
          <h3>Theme</h3>
          <ThemeButtonRow>
            {Object.keys(availableThemes).map(themeKey => (
              <ThemeButton
                key={themeKey}
                active={currentTheme === themeKey}
                loading={buttonLoading === themeKey}
                disabled={themeChanging}
                onClick={() => handleThemeChange(themeKey)}
              >
                {availableThemes[themeKey].name || formatThemeName(themeKey)}
                {buttonLoading === themeKey && <ButtonLoader size="small" />}
              </ThemeButton>
            ))}
          </ThemeButtonRow>
        </ThemeSection>
        
        <SettingsGroup title="Display Options">
          <SettingsSelect
            label="Anime Card Style"
            description="Choose how anime cards are displayed"
            value={settings?.display?.animeCardStyle || 'standard'}
            options={[
              { value: 'standard', label: 'Standard' },
              { value: 'compact', label: 'Compact' },
              { value: 'detailed', label: 'Detailed' }
            ]}
            onChange={(value) => handleSettingChange('display', 'animeCardStyle', value)}
            disabled={isUpdating}
          />
          
          <SettingsSelect
            label="Watchlist Columns"
            description="Number of columns in watchlist grid view"
            value={settings?.display?.watchlistColumns || 4}
            options={[
              { value: 2, label: '2 Columns' },
              { value: 3, label: '3 Columns' },
              { value: 4, label: '4 Columns' },
              { value: 5, label: '5 Columns' }
            ]}
            onChange={(value) => handleSettingChange('display', 'watchlistColumns', parseInt(value))}
            disabled={isUpdating}
          />
          
          <SettingsSelect
            label="Date Format"
            description="Choose how dates are displayed"
            value={settings?.display?.dateFormat || 'MMM DD, YYYY'}
            options={[
              { value: 'MMM DD, YYYY', label: 'MMM DD, YYYY' },
              { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
              { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' }
            ]}
            onChange={(value) => handleSettingChange('display', 'dateFormat', value)}
            disabled={isUpdating}
          />
          
          <SettingsSelect
            label="Time Format"
            description="Choose how times are displayed"
            value={settings?.display?.timeFormat || '24h'}
            options={[
              { value: '24h', label: '24-hour' },
              { value: '12h', label: '12-hour' }
            ]}
            onChange={(value) => handleSettingChange('display', 'timeFormat', value)}
            disabled={isUpdating}
          />
          
          <TimezoneSelect
            value={settings?.display?.timezone || 'auto'}
            onSave={handleTimezoneChange}
          />
        </SettingsGroup>
          </Card>

      <Card title="Content" icon={<Settings size={18} />}>
        <SettingsGroup title="Content Preferences">
          <SettingsToggle
            label="Adult Content"
            description="Show adult-oriented anime content"
            checked={settings?.content?.adultContent ?? false}
            onChange={(checked) => handleSettingChange('content', 'adultContent', checked)}
            disabled={isUpdating}
          />
          
          <SettingsToggle
            label="Violent Content"
            description="Show violent anime content"
            checked={settings?.content?.violentContent ?? true}
            onChange={(checked) => handleSettingChange('content', 'violentContent', checked)}
            disabled={isUpdating}
          />
          
          <SettingsSelect
            label="Spoilers"
            description="How to handle spoiler content"
            value={settings?.content?.spoilers || 'hide'}
            options={[
              { value: 'hide', label: 'Hide Spoilers' },
              { value: 'warn', label: 'Show Warning' },
              { value: 'show', label: 'Show All' }
            ]}
            onChange={(value) => handleSettingChange('content', 'spoilers', value)}
            disabled={isUpdating}
          />
          
          <SettingsToggle
            label="Autoplay Videos"
            description="Automatically play videos in feed"
            checked={settings?.content?.autoplayVideos ?? false}
            onChange={(checked) => handleSettingChange('content', 'autoplayVideos', checked)}
            disabled={isUpdating}
          />
          
          <SettingsToggle
            label="Autoplay Trailers"
            description="Automatically play anime trailers"
            checked={settings?.content?.autoplayTrailers ?? true}
            onChange={(checked) => handleSettingChange('content', 'autoplayTrailers', checked)}
            disabled={isUpdating}
          />
        </SettingsGroup>
          </Card>

      <Card title="Notifications" icon={<Settings size={18} />}>
        <SettingsGroup title="Email Notifications">
          <SettingsToggle
            label="Email Notifications"
            description="Receive email notifications"
            checked={settings?.notifications?.email?.enabled ?? true}
            onChange={(checked) => handleSettingChange('notifications', 'email.enabled', checked)}
            disabled={isUpdating}
          />
          {settings?.notifications?.email?.enabled && (
            <>
              <SettingsSelect
                label="Email Frequency"
                description="How often to receive email notifications"
                value={settings?.notifications?.email?.frequency || 'daily'}
                options={[
                  { value: 'immediate', label: 'Immediate' },
                  { value: 'daily', label: 'Daily Digest' },
                  { value: 'weekly', label: 'Weekly Digest' }
                ]}
                onChange={(value) => handleSettingChange('notifications', 'email.frequency', value)}
                disabled={isUpdating}
              />
              <SettingsToggle
                label="New Followers"
                checked={settings?.notifications?.email?.types?.follows ?? true}
                onChange={(checked) => handleSettingChange('notifications', 'email.types.follows', checked)}
                disabled={isUpdating}
              />
              <SettingsToggle
                label="Comments"
                checked={settings?.notifications?.email?.types?.comments ?? true}
                onChange={(checked) => handleSettingChange('notifications', 'email.types.comments', checked)}
                disabled={isUpdating}
              />
              <SettingsToggle
                label="Achievements"
                checked={settings?.notifications?.email?.types?.achievements ?? true}
                onChange={(checked) => handleSettingChange('notifications', 'email.types.achievements', checked)}
                disabled={isUpdating}
              />
              <SettingsToggle
                label="Announcements"
                checked={settings?.notifications?.email?.types?.announcements ?? true}
                onChange={(checked) => handleSettingChange('notifications', 'email.types.announcements', checked)}
                disabled={isUpdating}
              />
              <SettingsToggle
                label="Recommendations"
                checked={settings?.notifications?.email?.types?.recommendations ?? true}
                onChange={(checked) => handleSettingChange('notifications', 'email.types.recommendations', checked)}
                disabled={isUpdating}
              />
            </>
          )}
        </SettingsGroup>
        
        <SettingsGroup title="Push Notifications">
          <SettingsToggle
            label="Push Notifications"
            description="Receive push notifications in browser"
            checked={settings?.notifications?.push?.enabled ?? true}
            onChange={(checked) => handleSettingChange('notifications', 'push.enabled', checked)}
            disabled={isUpdating}
          />
          {settings?.notifications?.push?.enabled && (
            <>
              <SettingsToggle
                label="New Followers"
                checked={settings?.notifications?.push?.types?.follows ?? true}
                onChange={(checked) => handleSettingChange('notifications', 'push.types.follows', checked)}
                disabled={isUpdating}
              />
              <SettingsToggle
                label="Comments"
                checked={settings?.notifications?.push?.types?.comments ?? true}
                onChange={(checked) => handleSettingChange('notifications', 'push.types.comments', checked)}
                disabled={isUpdating}
              />
              <SettingsToggle
                label="Achievements"
                checked={settings?.notifications?.push?.types?.achievements ?? true}
                onChange={(checked) => handleSettingChange('notifications', 'push.types.achievements', checked)}
                disabled={isUpdating}
              />
              <SettingsToggle
                label="Announcements"
                checked={settings?.notifications?.push?.types?.announcements ?? true}
                onChange={(checked) => handleSettingChange('notifications', 'push.types.announcements', checked)}
                disabled={isUpdating}
              />
              <SettingsToggle
                label="Recommendations"
                checked={settings?.notifications?.push?.types?.recommendations ?? true}
                onChange={(checked) => handleSettingChange('notifications', 'push.types.recommendations', checked)}
                disabled={isUpdating}
              />
            </>
          )}
        </SettingsGroup>
        <SettingsGroup title="In-App Notifications">
          <SettingsToggle
            label="In-App Notifications"
            description="Receive notifications inside the app"
            checked={settings?.notifications?.inApp?.enabled ?? true}
            onChange={(checked) => handleSettingChange('notifications', 'inApp.enabled', checked)}
            disabled={isUpdating}
          />
          {settings?.notifications?.inApp?.enabled && (
            <>
              <SettingsToggle
                label="New Followers"
                checked={settings?.notifications?.inApp?.types?.follows ?? true}
                onChange={(checked) => handleSettingChange('notifications', 'inApp.types.follows', checked)}
                disabled={isUpdating}
              />
              <SettingsToggle
                label="Comments"
                checked={settings?.notifications?.inApp?.types?.comments ?? true}
                onChange={(checked) => handleSettingChange('notifications', 'inApp.types.comments', checked)}
                disabled={isUpdating}
              />
              <SettingsToggle
                label="Achievements"
                checked={settings?.notifications?.inApp?.types?.achievements ?? true}
                onChange={(checked) => handleSettingChange('notifications', 'inApp.types.achievements', checked)}
                disabled={isUpdating}
              />
              <SettingsToggle
                label="Announcements"
                checked={settings?.notifications?.inApp?.types?.announcements ?? true}
                onChange={(checked) => handleSettingChange('notifications', 'inApp.types.announcements', checked)}
                disabled={isUpdating}
              />
              <SettingsToggle
                label="Recommendations"
                checked={settings?.notifications?.inApp?.types?.recommendations ?? true}
                onChange={(checked) => handleSettingChange('notifications', 'inApp.types.recommendations', checked)}
                disabled={isUpdating}
              />
            </>
          )}
        </SettingsGroup>
      </Card>

      <Card title="Privacy" icon={<Settings size={18} />}>
        <SettingsGroup title="Profile Visibility">
          <SettingsSelect
            label="Profile Visibility"
            description="Who can see your profile"
            value={settings?.privacy?.profileVisibility || 'public'}
            options={[
              { value: 'public', label: 'Public' },
              { value: 'followers', label: 'Followers Only' },
              { value: 'private', label: 'Private' }
            ]}
            onChange={(value) => handleSettingChange('privacy', 'profileVisibility', value)}
            disabled={isUpdating}
          />
          
          <SettingsToggle
            label="Show Activity"
            description="Show your recent activity on your profile"
            checked={settings?.privacy?.showActivity ?? true}
            onChange={(checked) => handleSettingChange('privacy', 'showActivity', checked)}
            disabled={isUpdating}
          />
          
          <SettingsToggle
            label="Show Playlists"
            description="Allow others to see your playlists"
            checked={settings?.privacy?.showPlaylists ?? true}
            onChange={(checked) => handleSettingChange('privacy', 'showPlaylists', checked)}
            disabled={isUpdating}
          />
          
          <SettingsToggle
            label="Show Ratings"
            description="Allow others to see your anime ratings"
            checked={settings?.privacy?.showRatings ?? true}
            onChange={(checked) => handleSettingChange('privacy', 'showRatings', checked)}
            disabled={isUpdating}
          />
          <SettingsToggle
            label="Show Following"
            description="Allow others to see who you follow"
            checked={settings?.privacy?.showFollowing ?? true}
            onChange={(checked) => handleSettingChange('privacy', 'showFollowing', checked)}
            disabled={isUpdating}
          />
          <SettingsToggle
            label="Show Followers"
            description="Allow others to see your followers"
            checked={settings?.privacy?.showFollowers ?? true}
            onChange={(checked) => handleSettingChange('privacy', 'showFollowers', checked)}
            disabled={isUpdating}
          />
          <SettingsToggle
            label="Show Achievements"
            description="Allow others to see your achievements"
            checked={settings?.privacy?.showAchievements ?? true}
            onChange={(checked) => handleSettingChange('privacy', 'showAchievements', checked)}
            disabled={isUpdating}
          />
        </SettingsGroup>
      </Card>

      <Card title="Watchlist" icon={<Settings size={18} />}>
        <SettingsGroup title="Watchlist Settings">
          <SettingsSelect
            label="Default Status"
            description="Default status for new anime added to watchlist"
            value={settings?.watchlist?.defaultStatus || 'plan_to_watch'}
            options={[
              { value: 'watching', label: 'Watching' },
              { value: 'completed', label: 'Completed' },
              { value: 'on_hold', label: 'On Hold' },
              { value: 'dropped', label: 'Dropped' },
              { value: 'plan_to_watch', label: 'Plan to Watch' }
            ]}
            onChange={(value) => handleSettingChange('watchlist', 'defaultStatus', value)}
            disabled={isUpdating}
          />
          
          <SettingsToggle
            label="Confirm Removal"
            description="Ask for confirmation when removing anime from watchlist"
            checked={settings?.watchlist?.confirmRemoval ?? true}
            onChange={(checked) => handleSettingChange('watchlist', 'confirmRemoval', checked)}
            disabled={isUpdating}
          />
          
          <SettingsToggle
            label="Auto Update Progress"
            description="Automatically update episode progress when watching"
            checked={settings?.watchlist?.autoUpdateProgress ?? true}
            onChange={(checked) => handleSettingChange('watchlist', 'autoUpdateProgress', checked)}
            disabled={isUpdating}
          />
          <SettingsToggle
            label="Show Completion Dates"
            description="Show completion dates for finished anime in your watchlist"
            checked={settings?.watchlist?.showCompletionDates ?? true}
            onChange={(checked) => handleSettingChange('watchlist', 'showCompletionDates', checked)}
            disabled={isUpdating}
          />
        </SettingsGroup>
      </Card>

      <Card title="Account" icon={<Settings size={18} />}>
        <SettingsGroup title="Session">
          <SecondaryButton onClick={handleLogout}>
            <LogOut size={18} />
                Logout
          </SecondaryButton>
        </SettingsGroup>
        
        <DangerZone>
          <h3>Danger Zone</h3>
          <p>
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <ButtonRow>
            <DangerButton onClick={handleDeleteAccount}>
              <Trash2 size={18} />
              Delete Account
            </DangerButton>
          </ButtonRow>
        </DangerZone>
      </Card>
      
      {showDeleteModal && (
      <DeleteModal
          title="Delete Account"
          message="Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost."
          confirmLabel="Delete Account"
        onConfirm={confirmDeleteAccount}
          onCancel={() => setShowDeleteModal(false)}
      />
      )}
      
      {screenLoading && <GameScreenLoader text="Processing..." />}
    </SettingsContainer>
  );
};

export default SettingsPage; 