import React, { useState } from 'react';
import styled from 'styled-components';
import { Loader, Plus, X } from 'lucide-react';
import useToast from '../../hooks/useToast';

// Styled components
const ThemePreferencesContainer = styled.div`
  margin-top: 1rem;
`;

const ThemeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const ThemeCardContainer = styled.div`
  position: relative;
  border-radius: 8px;
  border: 1px solid var(--borderColor);
  padding: 1rem;
  background: var(--bgSecondary);
  transition: all 0.2s ease;
  
  &:hover {
    border-color: var(--primary);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const ThemeTitle = styled.div`
  font-weight: 500;
  color: var(--textPrimary);
  margin-bottom: 0.5rem;
`;

const WeightSlider = styled.input.attrs({ type: 'range' })`
  width: 100%;
  background: var(--textSecondary);
  height: 6px;
  border-radius: 3px;
  appearance: none;
  outline: none;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--primary);
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--primary);
    cursor: pointer;
    border: none;
  }
`;

const WeightDetails = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8125rem;
  color: var(--textSecondary);
  margin-top: 0.5rem;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: transparent;
  border: none;
  color: var(--textSecondary);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    color: var(--danger);
    background: var(--textSecondary);
  }
`;

const ThemeSearch = styled.div`
  margin-bottom: 1.5rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  border: 1px solid var(--borderColor);
  background: var(--textSecondary);
  color: var(--textPrimary);
  font-size: 0.875rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px var(--primarySoft);
  }
`;

const InputActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
`;

const ActionButton = styled.button`
  background: ${props => props.primary ? 'var(--primary)' : 'var(--bgSecondary)'};
  color: ${props => props.primary ? 'var(--textOnPrimary)' : 'var(--textPrimary)'};
  border: 1px solid ${props => props.primary ? 'var(--primary)' : 'var(--borderColor)'};
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.primary ? 'var(--primaryDark)' : 'var(--textSecondary)'};
    border-color: ${props => props.primary ? 'var(--primaryDark)' : 'var(--primary)'};
  }

  &:disabled {
    background: var(--disabledBg);
    color: var(--disabledText);
    border-color: var(--borderColor);
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--textSecondary);
`;

// Common anime themes
const COMMON_THEMES = [
  'School Life', 'Romance', 'Action', 'Adventure', 'Fantasy', 
  'Comedy', 'Slice of Life', 'Drama', 'Magic', 'Supernatural',
  'Sci-Fi', 'Mystery', 'Horror', 'Psychological', 'Sports',
  'Historical', 'Military', 'Music', 'Mecha', 'Time Travel',
  'Isekai', 'Super Power', 'Tragedy', 'Space', 'Vampire',
  'Martial Arts', 'Harem', 'Demons', 'Game', 'Police',
  'Samurai', 'Cyberpunk', 'Post-Apocalyptic', 'Seinen', 'Shoujo'
];

const ThemePreferences = ({ 
  preferences, 
  onPreferenceChange,
  maxSelections = 15
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const { showToast } = useToast();

  // Update suggestions based on search term
  const updateSuggestions = (term) => {
    if (!term.trim()) {
      setSuggestions([]);
      return;
    }

    const selectedThemeNames = preferences?.themes?.map(t => t.name.toLowerCase()) || [];
    const filteredSuggestions = COMMON_THEMES.filter(theme => 
      theme.toLowerCase().includes(term.toLowerCase()) && 
      !selectedThemeNames.includes(theme.toLowerCase())
    ).slice(0, 5);

    setSuggestions(filteredSuggestions);
  };

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    updateSuggestions(value);
  };

  // Handle adding a theme
  const handleAddTheme = () => {
    if (!searchTerm.trim()) return;
    
    const currentPreferences = preferences || {};
    const currentThemes = currentPreferences.themes || [];
    
    // Check if we've reached the maximum number of selections
    if (currentThemes.length >= maxSelections) {
      showToast({
        type: 'warning',
        message: `You can only select up to ${maxSelections} themes`
      });
      return;
    }
    
    // Check if theme already exists (case insensitive)
    const themeExists = currentThemes.some(
      theme => theme.name.toLowerCase() === searchTerm.trim().toLowerCase()
    );
    
    if (themeExists) {
      showToast({
        type: 'info',
        message: `"${searchTerm.trim()}" is already in your preferences`
      });
      return;
    }

    // Add the new theme with default weight
    const newThemes = [
      ...currentThemes,
      {
        name: searchTerm.trim(),
        weight: 5 // Default weight on a 1-10 scale
      }
    ];

    // Update preferences
    onPreferenceChange({
      ...currentPreferences,
      themes: newThemes
    });

    // Clear search and suggestions
    setSearchTerm('');
    setSuggestions([]);
  };

  // Handle selecting a suggestion
  const handleSelectSuggestion = (theme) => {
    const currentPreferences = preferences || {};
    const currentThemes = currentPreferences.themes || [];
    
    // Check if we've reached the maximum number of selections
    if (currentThemes.length >= maxSelections) {
      showToast({
        type: 'warning',
        message: `You can only select up to ${maxSelections} themes`
      });
      return;
    }

    // Add the selected theme with default weight
    const newThemes = [
      ...currentThemes,
      {
        name: theme,
        weight: 5 // Default weight on a 1-10 scale
      }
    ];

    // Update preferences
    onPreferenceChange({
      ...currentPreferences,
      themes: newThemes
    });

    // Clear search and suggestions
    setSearchTerm('');
    setSuggestions([]);
  };

  // Handle removing a theme
  const handleRemoveTheme = (themeName) => {
    const currentPreferences = preferences || {};
    const newThemes = (currentPreferences.themes || []).filter(t => t.name !== themeName);

    // Update preferences
    onPreferenceChange({
      ...currentPreferences,
      themes: newThemes
    });
  };

  // Handle weight change for a theme
  const handleWeightChange = (themeName, newWeight) => {
    const currentPreferences = preferences || {};
    const newThemes = (currentPreferences.themes || []).map(theme => 
      theme.name === themeName ? { ...theme, weight: parseInt(newWeight, 10) } : theme
    );

    // Update preferences
    onPreferenceChange({
      ...currentPreferences,
      themes: newThemes
    });
  };

  // Helper to get weight description
  const getWeightDescription = (weight) => {
    if (weight <= 2) return "Slightly like";
    if (weight <= 4) return "Like";
    if (weight <= 6) return "Really like";
    if (weight <= 8) return "Love";
    return "Strongly love";
  };

  return (
    <ThemePreferencesContainer>
      <ThemeSearch>
        <SearchInput
          type="text"
          placeholder="Enter an anime theme (e.g., School Life, Time Travel, etc.)"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyPress={(e) => e.key === 'Enter' && handleAddTheme()}
        />
        
        <InputActions>
          <ActionButton 
            primary 
            onClick={handleAddTheme}
            disabled={!searchTerm.trim()}
          >
            <Plus size={16} />
            Add Theme
          </ActionButton>
          
          {searchTerm.trim() && suggestions.length > 0 && (
            <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {suggestions.map(suggestion => (
                <ActionButton
                  key={suggestion}
                  onClick={() => handleSelectSuggestion(suggestion)}
                >
                  {suggestion}
                </ActionButton>
              ))}
            </div>
          )}
        </InputActions>
      </ThemeSearch>

      {(preferences?.themes?.length || 0) === 0 ? (
        <EmptyState>
          <p>You haven't added any theme preferences yet.</p>
          <p>Enter themes you enjoy to get better anime recommendations.</p>
        </EmptyState>
      ) : (
        <ThemeGrid>
          {preferences?.themes?.map(theme => (
            <ThemeCardContainer key={theme.name}>
              <RemoveButton onClick={() => handleRemoveTheme(theme.name)}>
                <X size={16} />
              </RemoveButton>
              <ThemeTitle>{theme.name}</ThemeTitle>
              
              <WeightSlider
                min="1"
                max="10"
                value={theme.weight}
                onChange={(e) => handleWeightChange(theme.name, e.target.value)}
              />
              
              <WeightDetails>
                <span>Less important</span>
                <span>{getWeightDescription(theme.weight)}</span>
                <span>Very important</span>
              </WeightDetails>
            </ThemeCardContainer>
          ))}
        </ThemeGrid>
      )}
    </ThemePreferencesContainer>
  );
};

export default ThemePreferences; 