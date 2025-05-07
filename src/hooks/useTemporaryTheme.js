import { useEffect } from 'react';
import useTheme from './useTheme';
import { themes } from '../contexts/ThemeContext';

/**
 * Custom hook to temporarily switch theme when viewing a profile or playlist
 * 
 * @param {Object} options Configuration options
 * @param {string} options.themeKey The theme key to temporarily apply
 * @param {string} options.displayName The user's display name for the theme badge
 * @param {boolean} options.isActive Whether the temporary theme should be active
 * @returns {Object} Theme information including badge display data
 */
const useTemporaryTheme = ({ themeKey, displayName, isActive = true }) => {
  const { currentTheme, changeTheme, availableThemes } = useTheme();
  
  // Store the original theme before switching
  const originalTheme = currentTheme;
  
  // Only switch themes if the provided themeKey exists and is different from current
  const validThemeKey = themeKey && themes[themeKey] ? themeKey : null;
  
  // Get theme name for display
  const themeName = validThemeKey ? availableThemes[validThemeKey]?.name : null;
  
  useEffect(() => {
    // Only switch if the feature is active and we have a valid theme
    if (isActive && validThemeKey && validThemeKey !== currentTheme) {
      changeTheme(validThemeKey);
      
      // Store the original theme in sessionStorage, so it persists during page refreshes
      // within the same session but doesn't permanently change the user's preference
      sessionStorage.setItem('originalTheme', originalTheme);
    }
    
    // Cleanup - restore original theme when component unmounts
    return () => {
      if (isActive && validThemeKey) {
        const savedOriginalTheme = sessionStorage.getItem('originalTheme');
        if (savedOriginalTheme) {
          changeTheme(savedOriginalTheme);
          sessionStorage.removeItem('originalTheme');
        }
      }
    };
  }, [isActive, validThemeKey, originalTheme]);
  
  return {
    isTemporaryThemeActive: isActive && validThemeKey !== null,
    temporaryThemeName: themeName,
    userDisplayName: displayName,
    themeKey: validThemeKey
  };
};

export default useTemporaryTheme; 