import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Settings, Moon, Sun, Bell, EyeOff, AlertTriangle, LogOut, Trash2, Clock, X, Check, Lock } from 'lucide-react';
import Card from '../common/Card';
import { userAPI } from '../../services/api';
import useTheme from '../../hooks/useTheme';
import useAuth from '../../hooks/useAuth';
import TimezoneSelect from './TimezoneSelect';
import { saveUserTimezone } from '../../utils/simpleTimezoneUtils';
import useToast from '../../hooks/useToast';
import MiniLoadingSpinner from '../common/MiniLoadingSpinner';
import DeleteModal from '../common/DeleteModal';

const SettingsGrid = styled.div`
  display: grid;
  gap: 1.5rem;
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid var(--borderColor);
  
  &:last-child {
    border-bottom: none;
  }
`;

const SettingInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const SettingTitle = styled.h4`
  font-size: 1rem;
  font-weight: 500;
  margin: 0 0 0.25rem 0;
  color: var(--textPrimary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SettingDescription = styled.p`
  font-size: 0.85rem;
  color: var(--textSecondary);
  margin: 0;
`;

const ThemeSelector = styled.select`
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: 1px solid var(--borderColor);
  background-color: var(--inputBackground);
  color: var(--textPrimary);
  font-size: 0.9rem;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: var(--primary);
  }
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
  
  input {
    opacity: 0;
    width: 0;
    height: 0;
  }
`;

const Slider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--borderColor);
  transition: 0.3s;
  border-radius: 34px;
  
  &:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
  }
  
  input:checked + & {
    background-color: var(--primary);
  }
  
  input:checked + &:before {
    transform: translateX(24px);
  }
`;

const DangerZone = styled.div`
  background-color: var(--dangerLight);
  border-radius: 8px;
  padding: 1.25rem;
  margin-top: 2rem;
`;

const DangerTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--danger);
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DangerButton = styled.button`
  background-color: var(--danger);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background-color: var(--dangerDark);
  }
`;

const LogoutButton = styled.button`
  background-color: var(--cardBackground);
  color: var(--textPrimary);
  border: 1px solid var(--borderColor);
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background-color: var(--dangerLight);
    color: var(--danger);
    border-color: var(--danger);
  }
`;

const SettingsHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  
  h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--textPrimary);
  }
  
  svg {
    color: var(--primary);
  }
`;

const ThemeOptions = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const LoadingDot = styled.span`
  display: inline-block;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: var(--primary);
  margin: 0 2px;
  animation: pulse 1.2s infinite;
  
  &:nth-child(2) {
    animation-delay: 0.2s;
  }
  
  &:nth-child(3) {
    animation-delay: 0.4s;
  }
  
  @keyframes pulse {
    0% {
      transform: scale(0.8);
      opacity: 0.5;
    }
    50% {
      transform: scale(1.2);
      opacity: 1;
    }
    100% {
      transform: scale(0.8);
      opacity: 0.5;
    }
  }
`;

const InlineLoading = styled.div`
  display: flex;
  align-items: center;
  margin-left: 0.5rem;
  height: 16px;
`;

const ThemeOption = styled.button`
  background-color: ${props => props.active ? 'rgba(var(--primary-rgb), 0.1)' : 'rgba(var(--cardBackground-rgb), 0.7)'};
  color: ${props => props.active ? 'var(--primary)' : 'var(--textPrimary)'};
  border: 1px solid ${props => props.active ? 'var(--primary)' : 'var(--borderColor)'};
  border-radius: 8px;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: ${props => props.isLoading ? 'default' : 'pointer'};
  transition: all 0.2s ease;
  position: relative;
  
  &:hover {
    background-color: ${props => props.isLoading ? (props.active ? 'rgba(var(--primary-rgb), 0.1)' : 'rgba(var(--cardBackground-rgb), 0.7)') : 'rgba(var(--primary-rgb), 0.05)'};
  }
  
  /* Loading state indicator */
  ${props => props.isLoading && props.active && `
    &::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      width: 100%;
      height: 2px;
      background: var(--gradientPrimary);
      animation: loadingBar 1.5s ease-in-out infinite;
    }
    
    @keyframes loadingBar {
      0% { width: 0; left: 0; }
      50% { width: 100%; left: 0; }
      100% { width: 0; left: 100%; }
    }
  `}
`;

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

// Password form styled components
const ErrorText = styled.div`
  color: var(--danger);
  font-size: 0.8rem;
  margin-top: 0.25rem;
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: rgba(var(--danger-rgb), 0.1);
  color: var(--danger);
  padding: 0.75rem;
  border-radius: 4px;
  margin-top: 1rem;
  font-size: 0.9rem;
`;

const Button = styled.button`
  background-color: var(--primary);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background-color: var(--primaryLight);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  color: var(--textPrimary);
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--borderColor);
  border-radius: 4px;
  background-color: var(--inputBackground);
  color: var(--textPrimary);
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: var(--primary);
  }
`;

const SettingsSection = () => {
  const { logout, user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const { theme, changeTheme, availableThemes } = useTheme();

  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [themeChanging, setThemeChanging] = useState(false);

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const response = await userAPI.getSettings();
        if (response && response.success) {
          setSettings(response.data);
        } else {
          throw new Error(response?.message || 'Failed to load settings');
        }
      } catch (err) {
        showToast({ type: 'error', message: err.message || 'Failed to load settings' });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [showToast]);

  // Handle setting update
  const handleSettingChange = async (category, key, value) => {
    if (!settings) return;
    setSaving(true);
    try {
      const updatedCategory = { ...settings[category], [key]: value };
      const response = await userAPI.updateSettings(category, updatedCategory);
      if (response && response.success) {
        setSettings(prev => ({ ...prev, [category]: response.data[category] }));
        showToast({ type: 'success', message: 'Settings updated!' });
        await refreshUser(true);
      } else {
        throw new Error(response?.message || 'Failed to update settings');
      }
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Failed to update settings' });
    } finally {
      setSaving(false);
    }
  };

  // Handle theme change
  const handleThemeChange = async (newTheme) => {
    setThemeChanging(true);
    try {
      // Update theme in context
      changeTheme(newTheme);
      
      // Update theme in settings if we have them loaded
      if (settings && settings.display) {
        await handleSettingChange('display', 'theme', newTheme);
      }
      
      showToast({ type: 'success', message: `Theme changed to ${newTheme}!` });
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Failed to change theme' });
    } finally {
      setThemeChanging(false);
    }
  };

  // Handle timezone change
  const handleTimezoneChange = async (timezone) => {
    try {
      // Save to localStorage
      saveUserTimezone(timezone);
      
      // Update in settings API
      if (settings && settings.display) {
        await handleSettingChange('display', 'timezone', timezone);
      }
      
      showToast({ type: 'success', message: 'Timezone updated!' });
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Failed to update timezone' });
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
  };

  // Handle account deletion
  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };
  
  const confirmDeleteAccount = async () => {
    setIsUpdating(true);
    try {
      const response = await userAPI.deleteAccount();
      if (response && response.success) {
        showToast({ type: 'success', message: 'Account successfully deleted' });
        logout();
      } else {
        throw new Error(response?.message || 'Failed to delete account');
      }
    } catch (error) {
      showToast({ type: 'error', message: error.message || 'An error occurred while deleting your account' });
      setShowDeleteModal(false);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading || !settings) {
    return <Card title="Account Settings"><MiniLoadingSpinner size="24px" /> Loading settings...</Card>;
  }

  return (
    <>
      <Card title="Account Settings" icon={<Settings size={18} />} marginBottom="0rem">
        <SettingsGrid>
          {/* Notifications */}
          <Card padding="0rem">
            <h3>Notifications</h3>
            <SettingItem>
              <SettingInfo>
                <SettingTitle>Email Notifications</SettingTitle>
                <SettingDescription>Receive email notifications</SettingDescription>
              </SettingInfo>
              <ToggleSwitch>
                <input
                  type="checkbox"
                  checked={settings.notifications?.email?.enabled}
                  onChange={e => handleSettingChange('notifications', 'email', { ...settings.notifications.email, enabled: e.target.checked })}
                  disabled={saving}
                />
                <Slider />
              </ToggleSwitch>
            </SettingItem>
            <SettingItem>
              <SettingInfo>
                <SettingTitle>Push Notifications</SettingTitle>
                <SettingDescription>Receive push notifications</SettingDescription>
              </SettingInfo>
              <ToggleSwitch>
                <input
                  type="checkbox"
                  checked={settings.notifications?.push?.enabled}
                  onChange={e => handleSettingChange('notifications', 'push', { ...settings.notifications.push, enabled: e.target.checked })}
                  disabled={saving}
                />
                <Slider />
              </ToggleSwitch>
            </SettingItem>
            <SettingItem>
              <SettingInfo>
                <SettingTitle>In-App Notifications</SettingTitle>
                <SettingDescription>Receive in-app notifications</SettingDescription>
              </SettingInfo>
              <ToggleSwitch>
                <input
                  type="checkbox"
                  checked={settings.notifications?.inApp?.enabled}
                  onChange={e => handleSettingChange('notifications', 'inApp', { ...settings.notifications.inApp, enabled: e.target.checked })}
                  disabled={saving}
                />
                <Slider />
              </ToggleSwitch>
            </SettingItem>
          </Card>

          {/* Privacy */}
          <Card padding="0rem">
            <h3>Privacy</h3>
            {Object.entries(settings.privacy || {}).map(([key, value]) => (
              <SettingItem key={key}>
                <SettingInfo>
                  <SettingTitle>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</SettingTitle>
                </SettingInfo>
                <ToggleSwitch>
                  <input
                    type="checkbox"
                    checked={!!value}
                    onChange={e => handleSettingChange('privacy', key, e.target.checked)}
                    disabled={saving}
                  />
                  <Slider />
                </ToggleSwitch>
              </SettingItem>
            ))}
          </Card>

          {/* Display */}
          <Card padding="0rem">
            <h3>Display</h3>
            
            {/* Theme Selection */}
            <SettingItem>
              <SettingInfo>
                <SettingTitle>
                  {theme?.includes('dark') || theme === 'default' ? <Moon size={16} /> : <Sun size={16} />}
                  Theme
                </SettingTitle>
                <SettingDescription>Choose your preferred theme</SettingDescription>
              </SettingInfo>
              <ThemeOptions>
                {availableThemes && Object.keys(availableThemes).map((themeName) => (
                  <ThemeOption
                    key={themeName}
                    active={theme === themeName}
                    onClick={() => handleThemeChange(themeName)}
                    isLoading={themeChanging && theme === themeName}
                  >
                    {themeName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    {themeChanging && theme === themeName && (
                      <InlineLoading>
                        <LoadingDot />
                        <LoadingDot />
                        <LoadingDot />
                      </InlineLoading>
                    )}
                  </ThemeOption>
                ))}
              </ThemeOptions>
            </SettingItem>
            
            {/* Timezone Selection */}
            <TimezoneSelect 
              onSave={handleTimezoneChange} 
              currentTimezone={settings.display?.timezone} 
            />
            
            {/* Other display settings */}
            {Object.entries(settings.display || {}).map(([key, value]) => {
              // Skip theme and timezone as they have custom UI
              if (key === 'theme' || key === 'timezone') return null;
              
              return (
                <SettingItem key={key}>
                  <SettingInfo>
                    <SettingTitle>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</SettingTitle>
                  </SettingInfo>
                    <ToggleSwitch>
                      <input
                        type="checkbox"
                        checked={!!value}
                        onChange={e => handleSettingChange('display', key, e.target.checked)}
                        disabled={saving}
                      />
                      <Slider />
                    </ToggleSwitch>
                </SettingItem>
              )
            })}
          </Card>

          {/* Content */}
          <Card padding="0rem">
            <h3>Content</h3>
            {Object.entries(settings.content || {}).map(([key, value]) => (
              <SettingItem key={key}>
                <SettingInfo>
                  <SettingTitle>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</SettingTitle>
                </SettingInfo>
                <ToggleSwitch>
                  <input
                    type="checkbox"
                    checked={!!value}
                    onChange={e => handleSettingChange('content', key, e.target.checked)}
                    disabled={saving}
                  />
                  <Slider />
                </ToggleSwitch>
              </SettingItem>
            ))}
          </Card>

          {/* Watchlist */}
          <Card padding="0rem">
            <h3>Watchlist</h3>
            {Object.entries(settings.watchlist || {}).map(([key, value]) => (
              <SettingItem key={key}>
                <SettingInfo>
                  <SettingTitle>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</SettingTitle>
                </SettingInfo>
                <ToggleSwitch>
                  <input
                    type="checkbox"
                    checked={!!value}
                    onChange={e => handleSettingChange('watchlist', key, e.target.checked)}
                    disabled={saving}
                  />
                  <Slider />
                </ToggleSwitch>
              </SettingItem>
            ))}
          </Card>

          {/* Logout and Danger Zone */}
          <SettingItem>
            <SettingInfo>
              <SettingTitle>
                <LogOut size={16} />
                Logout
              </SettingTitle>
            </SettingInfo>
            <LogoutButton onClick={handleLogout}>
              <LogOut size={16} />
              Logout
            </LogoutButton>
          </SettingItem>
        </SettingsGrid>
        <DangerZone>
          <DangerTitle>
            <AlertTriangle size={18} />
            Danger Zone
          </DangerTitle>
          <SettingItem style={{ borderBottom: 'none', paddingBottom: 0 }}>
            <SettingInfo>
              <SettingTitle style={{ color: 'var(--danger)' }}>
                Delete Account
              </SettingTitle>
              <SettingDescription>
                Permanently delete your account and all your data
              </SettingDescription>
            </SettingInfo>
            <DangerButton onClick={handleDeleteAccount}>
              <Trash2 size={16} />
              Delete
            </DangerButton>
          </SettingItem>
        </DangerZone>
      </Card>
      
      <DeleteModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteAccount}
        title="Delete Account?"
        message="Are you sure you want to permanently delete your account? This action cannot be undone and will delete all your profile data, remove all your watchlists and playlists, and remove your comments and activity history."
        isDeleting={isUpdating}
        confirmButtonText="Delete Account"
      />
    </>
  );
};

export default SettingsSection; 