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

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: ${props => props.show ? 'flex' : 'none'};
  justify-content: center;
  align-items: center;
  z-index: 100;
`;

const ModalContent = styled.div`
  background-color: var(--cardBackground);
  border-radius: 8px;
  padding: 1.5rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  color: var(--danger);
  font-weight: 600;
  font-size: 1.2rem;
`;

const ModalButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const CancelButton = styled.button`
  background-color: var(--cardBackground);
  color: var(--textPrimary);
  border: 1px solid var(--borderColor);
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--borderColor);
  }
`;

const ConfirmButton = styled.button`
  background-color: var(--danger);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: var(--dangerDark);
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
  const { logout, user, refreshUser, updateUserPreferences } = useAuth();
  const { currentTheme, changeTheme, availableThemes } = useTheme();
  const { showToast } = useToast();
  
  const [settings, setSettings] = useState({
    receiveNotifications: true,
    showWatchlist: true,
    showFollowing: true,
    interfaceTheme: getUserTheme() // Initialize with localStorage value
  });
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatingTheme, setUpdatingTheme] = useState(null);
  const [syncedWithBackend, setSyncedWithBackend] = useState(false);
  
  // Track which specific settings are being updated
  const [updatingSettings, setUpdatingSettings] = useState({
    receiveNotifications: false,
    showWatchlist: false,
    showFollowing: false,
    timezone: false
  });
  
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    general: ''
  });
  
  // Initialize theme from localStorage if not already set
  useEffect(() => {
    const storedTheme = getUserTheme();
    
    // Apply theme if different from current
    if (storedTheme !== currentTheme) {
      changeTheme(storedTheme);
    }
    
    // Update settings state with stored theme
    setSettings(prev => ({
      ...prev,
      interfaceTheme: storedTheme
    }));
  }, []);
  
  // Sync with user settings when user object changes
  useEffect(() => {
    if (user && user.settings) {
      // Check for theme from user settings
      if (user.settings.interfaceTheme) {
        const userTheme = user.settings.interfaceTheme;
        
        // Save user's theme to localStorage
        saveUserTheme(userTheme);
        
        // Update theme if different from current
        if (userTheme !== currentTheme) {
          changeTheme(userTheme);
        }
        
        // Update settings state
        setSettings(prev => ({
          ...prev,
          interfaceTheme: userTheme,
          receiveNotifications: user.settings.receiveNotifications !== undefined ? user.settings.receiveNotifications : true,
          showWatchlist: user.settings.showWatchlist !== undefined ? user.settings.showWatchlist : true,
          showFollowing: user.settings.showFollowing !== undefined ? user.settings.showFollowing : true
        }));
      }
    }
  }, [user, currentTheme, changeTheme]);
  
  // Reset synced state when user changes (logout/login)
  useEffect(() => {
    if (!user) {
      setSyncedWithBackend(false);
    }
  }, [user]);
  
  const handleThemeChange = async (newTheme) => {
    // If already updating, don't allow another update
    if (updatingTheme) return;
    
    // Mark the theme that's changing
    setUpdatingTheme(newTheme);

    try {
      // Get the theme name for the toast message
      const themeName = availableThemes[newTheme]?.name || newTheme;
      
      // 1. Update local state immediately for better UX
      setSettings(prev => ({ ...prev, interfaceTheme: newTheme }));
      
      // 2. Save to localStorage immediately (this creates immediate visual change)
      saveUserTheme(newTheme);
      
      // 3. Apply theme change immediately for better UX
      changeTheme(newTheme);
      
      // 4. Save theme setting to backend if user is logged in
      if (user) {
        try {
          // Make the API call to update theme and wait for completion
          const response = await userAPI.updateProfile({
            settings: { interfaceTheme: newTheme }
          });
          
          if (response.success) {        
            await refreshUser(true); // true = preserveUIState
            showToast({
              type: 'success',
              message: `Theme updated to "${themeName}"`
            });
          } else {
            throw new Error('Failed to update theme on server');
          }
        } catch (error) {
          console.error('Error saving theme to server:', error);
          // Show warning toast
          showToast({
            type: 'warning',
            message: 'Theme applied locally, but could not be saved to your account'
          });
        }
      } else {
        // If user is not logged in, just show toast immediately
        showToast({
          type: 'success',
          message: `Theme "${themeName}" applied`
        });
      }
    } catch (error) {
      console.error('Error updating theme:', error);
      // Reset theme if something went wrong
      if (currentTheme && currentTheme !== newTheme) {
        changeTheme(currentTheme);
        setSettings(prev => ({ ...prev, interfaceTheme: currentTheme }));
      }
      
      showToast({
        type: 'error',
        message: 'Failed to update theme'
      });
    } finally {
      // Wait a moment before removing loading state for better UX
      setTimeout(() => {
        setUpdatingTheme(null);
      }, 500);
    }
  };
  
  const updateUserSettings = async (updatedSettings) => {
    if (!user) return; // Don't attempt API call if user not logged in
    
    // Don't set isUpdating if we're updating theme (handled separately by updatingTheme state)
    const isThemeUpdate = updatedSettings.hasOwnProperty('interfaceTheme');
    if (!isThemeUpdate) {
      setIsUpdating(true);
    }
    
    try {
      // Make the API call to update settings
      const response = await userAPI.updateProfile({
        settings: updatedSettings
      });
      
      if (response.success) {
        // Refresh user data but PRESERVE UI STATE to avoid dashboard reset
        const userData = await refreshUser(true); // true = preserveUIState 
        return userData; // Return updated user data for promise chaining
      } else {
        console.error('Error updating settings: API returned error');
        if (!isThemeUpdate) {
          showToast({
            type: 'error',
            message: 'Failed to update settings'
          });
        }
        return null;
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      if (!isThemeUpdate) {
        showToast({
          type: 'error',
          message: 'Failed to update settings'
        });
      }
      throw error; // Propagate error for promise chaining
    } finally {
      if (!isThemeUpdate) {
        setIsUpdating(false);
      }
    }
  };
  
  const handleToggle = (setting) => {
    const newValue = !settings[setting];
    
    // Update local state immediately for better UX
    setSettings(prev => ({ 
      ...prev, 
      [setting]: newValue
    }));
    
    // Show loading state for this specific setting
    setUpdatingSettings(prev => ({
      ...prev,
      [setting]: true
    }));
    
    // Save settings to backend
    const settingKey = setting === 'receiveNotifications' ? 'receiveNotifications' : 
                        setting === 'showWatchlist' ? 'showWatchlist' : 'showFollowing';
    
    // Use updateUserSettings which now preserves UI state
    updateUserSettings({ [settingKey]: newValue })
      .then(() => {
        // Success - we already updated local state
      })
      .catch(error => {
        console.error(`Error toggling ${setting}:`, error);
        
        // Revert local state on error
        setSettings(prev => ({
          ...prev,
          [setting]: !newValue
        }));
        
        // Show error toast
        showToast({
          type: 'error',
          message: `Failed to update ${setting.replace(/([A-Z])/g, ' $1').toLowerCase()}`
        });
      })
      .finally(() => {
        // Hide loading state after a short delay for better UX
        setTimeout(() => {
          setUpdatingSettings(prev => ({
            ...prev,
            [setting]: false
          }));
        }, 300);
      });
  };
  
  // Determine if a theme is dark for icon selection
  const isDarkTheme = (themeKey) => {
    return themeKey !== 'light' && themeKey !== 'one-piece';
  };
  
  const handleLogout = () => {
    logout();
  };
  
  const handleDeleteAccount = () => {
    // Show confirmation modal
    setShowDeleteModal(true);
  };
  
  const confirmDeleteAccount = async () => {
    try {
      // Show loading indicator
      setIsUpdating(true);
      
      // Call API to delete account
      const response = await userAPI.deleteAccount();
      
      if (response && response.success) {
        // Show success toast
        showToast({
          type: 'success',
          message: 'Account successfully deleted'
        });
        
        // Logout after successful deletion
        logout();
      } else {
        // Show error toast for unsuccessful response
        showToast({
          type: 'error',
          message: response?.message || 'Failed to delete account'
        });
        setShowDeleteModal(false);
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      
      // Show error toast
      showToast({
        type: 'error',
        message: error.message || 'An error occurred while deleting your account'
      });
      
      setShowDeleteModal(false);
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Handle timezone save
  const handleSaveTimezone = async (timezone) => {
    if (!timezone) return;
    
    // Set timezone loading state
    setUpdatingSettings(prev => ({
      ...prev,
      timezone: true
    }));
    
    try {
      // Save to localStorage first for immediate effect
      saveUserTimezone(timezone.code);
      
      // If user is logged in, save to user settings via API
      if (user) {
        // Use the same updateUserSettings function for consistency
        await updateUserSettings({ timezone: timezone.code });
        
        showToast({
          type: 'success',
          message: 'Timezone updated successfully'
        });
      } else {
        showToast({
          type: 'success',
          message: 'Timezone saved to local settings'
        });
      }
    } catch (error) {
      console.error('Error saving timezone:', error);
      showToast({
        type: 'error',
        message: 'Failed to update timezone settings'
      });
    } finally {
      // Hide loading state after a short delay
      setTimeout(() => {
        setUpdatingSettings(prev => ({
          ...prev,
          timezone: false
        }));
      }, 300);
    }
  };
  
  // Handle password form change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific error when user types
    setPasswordErrors(prev => ({
      ...prev,
      [name]: '',
      general: ''
    }));
  };
  
  // Handle password update
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    // Reset errors
    setPasswordErrors({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      general: ''
    });
    
    // Validate input
    let hasErrors = false;
    const errors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      general: ''
    };
    
    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required';
      hasErrors = true;
    }
    
    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required';
      hasErrors = true;
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
      hasErrors = true;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      hasErrors = true;
    }
    
    if (hasErrors) {
      setPasswordErrors(errors);
      return;
    }
    
    // Update password
    setUpdatingPassword(true);
    
    try {
      const response = await userAPI.updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      if (response && response.success) {
        // Show success toast
        showToast({
          type: 'success',
          message: 'Password updated successfully'
        });
        
        // Clear form
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        // Show error toast
        const errorMessage = response?.message || 'Failed to update password';
        showToast({
          type: 'error',
          message: errorMessage
        });
        
        setPasswordErrors({
          ...errors,
          general: errorMessage
        });
      }
    } catch (error) {
      console.error('Error updating password:', error);
      
      // Show error toast
      showToast({
        type: 'error',
        message: error.message || 'An error occurred while updating password'
      });
      
      setPasswordErrors({
        ...errors,
        general: error.message || 'An error occurred while updating password'
      });
    } finally {
      setUpdatingPassword(false);
    }
  };
  
  return (
    <>
      <Card 
        title="Account Settings" 
        icon={<Settings size={18} />}
        marginBottom="0rem"
      >
        <SettingsGrid>
          <Card padding="0rem">
            <SettingsHeader>
              <Settings size={20} />
              <h3>Theme Settings</h3>
            </SettingsHeader>
            
            <ThemeOptions>
              {Object.entries(availableThemes).map(([themeKey, theme]) => (
                <ThemeOption 
                  key={themeKey}
                  active={settings.interfaceTheme === themeKey} 
                  onClick={() => updatingTheme ? null : handleThemeChange(themeKey)}
                  isLoading={updatingTheme === themeKey}
                >
                  {isDarkTheme(themeKey) ? <Moon size={18} /> : <Sun size={18} />}
                  <span>{theme.name}</span>
                  {updatingTheme === themeKey && (
                    <InlineLoading>
                      <LoadingDot />
                      <LoadingDot />
                      <LoadingDot />
                    </InlineLoading>
                  )}
                </ThemeOption>
              ))}
            </ThemeOptions>
          </Card>
          
          {/* Timezone settings card */}
          <Card padding="0rem">
            <TimezoneSelect onSave={handleSaveTimezone} />
          </Card>
          
          {/* Security Settings Card */}
          <Card padding="0rem">
            <SettingsHeader>
              <Lock size={20} />
              <h3>Security Settings</h3>
            </SettingsHeader>
            
            <div style={{ padding: '1rem' }}>
              <form onSubmit={handlePasswordUpdate}>
                <FormGroup>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input 
                    type="password" 
                    id="currentPassword" 
                    name="currentPassword" 
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                  />
                  {passwordErrors.currentPassword && (
                    <ErrorText>{passwordErrors.currentPassword}</ErrorText>
                  )}
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input 
                    type="password" 
                    id="newPassword" 
                    name="newPassword" 
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                  />
                  {passwordErrors.newPassword && (
                    <ErrorText>{passwordErrors.newPassword}</ErrorText>
                  )}
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input 
                    type="password" 
                    id="confirmPassword" 
                    name="confirmPassword" 
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm new password"
                  />
                  {passwordErrors.confirmPassword && (
                    <ErrorText>{passwordErrors.confirmPassword}</ErrorText>
                  )}
                </FormGroup>
                
                {passwordErrors.general && (
                  <ErrorMessage>
                    <X size={16} />
                    {passwordErrors.general}
                  </ErrorMessage>
                )}
                
                <div style={{ textAlign: 'right', marginTop: '1rem' }}>
                  <Button 
                    type="submit"
                    disabled={updatingPassword}
                  >
                    {updatingPassword ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
          
          <SettingItem>
            <SettingInfo>
              <SettingTitle>
                <Bell size={16} />
                Notifications
              </SettingTitle>
              <SettingDescription>
                Receive activity notifications from users you follow
              </SettingDescription>
            </SettingInfo>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {updatingSettings.receiveNotifications && (
                <MiniLoadingSpinner size="10px" marginLeft="0" />
              )}
              <ToggleSwitch>
                <input 
                  type="checkbox" 
                  checked={settings.receiveNotifications}
                  onChange={() => handleToggle('receiveNotifications')}
                  disabled={updatingSettings.receiveNotifications}
                />
                <Slider />
              </ToggleSwitch>
            </div>
          </SettingItem>
          
          <SettingItem>
            <SettingInfo>
              <SettingTitle>
                <EyeOff size={16} />
                Show Watchlist
              </SettingTitle>
              <SettingDescription>
                Allow other users to see your watchlist
              </SettingDescription>
            </SettingInfo>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {updatingSettings.showWatchlist && (
                <MiniLoadingSpinner size="10px" marginLeft="0" />
              )}
              <ToggleSwitch>
                <input 
                  type="checkbox" 
                  checked={settings.showWatchlist}
                  onChange={() => handleToggle('showWatchlist')}
                  disabled={updatingSettings.showWatchlist}
                />
                <Slider />
              </ToggleSwitch>
            </div>
          </SettingItem>
          
          <SettingItem>
            <SettingInfo>
              <SettingTitle>
                <EyeOff size={16} />
                Show Following
              </SettingTitle>
              <SettingDescription>
                Allow other users to see who you follow
              </SettingDescription>
            </SettingInfo>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {updatingSettings.showFollowing && (
                <MiniLoadingSpinner size="10px" marginLeft="0" />
              )}
              <ToggleSwitch>
                <input 
                  type="checkbox" 
                  checked={settings.showFollowing}
                  onChange={() => handleToggle('showFollowing')}
                  disabled={updatingSettings.showFollowing}
                />
                <Slider />
              </ToggleSwitch>
            </div>
          </SettingItem>
          
          <SettingItem>
            <SettingInfo>
              <SettingTitle>
                <LogOut size={16} />
                Logout
              </SettingTitle>
              <SettingDescription>
                Sign out of your account
              </SettingDescription>
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
      
      {/* Delete Account Confirmation Modal */}
      <Modal show={showDeleteModal}>
        <ModalContent>
          <ModalHeader>
            <AlertTriangle size={20} />
            Delete Account?
          </ModalHeader>
          <p>
            Are you sure you want to permanently delete your account? This action cannot be undone and will:
          </p>
          <ul>
            <li>Delete all your profile data</li>
            <li>Remove all your watchlists and playlists</li>
            <li>Remove your comments and activity history</li>
          </ul>
          <ModalButtons>
            <CancelButton 
              onClick={() => setShowDeleteModal(false)}
              disabled={isUpdating}
            >
              Cancel
            </CancelButton>
            <ConfirmButton 
              onClick={confirmDeleteAccount}
              disabled={isUpdating}
            >
              {isUpdating ? 'Deleting...' : 'Delete Account'}
            </ConfirmButton>
          </ModalButtons>
        </ModalContent>
      </Modal>
    </>
  );
};

export default SettingsSection; 