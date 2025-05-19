import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Loader, Plus, X } from 'lucide-react';
import useToast from '../../hooks/useToast';
import { genreAPI } from '../../services/modules';

// Styled components
const GenrePreferencesContainer = styled.div`
  margin-top: 1rem;
`;

const GenreGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const GenreCardContainer = styled.div`
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

const GenreTitle = styled.div`
  font-weight: 500;
  color: var(--textPrimary);
  margin-bottom: 0.5rem;
`;

const GenreDescription = styled.div`
  font-size: 0.8125rem;
  color: var(--textSecondary);
  margin-bottom: 1rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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

const GenreSearch = styled.div`
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

const GenreResults = styled.div`
  margin-top: 1rem;
  border: 1px solid var(--borderColor);
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
  display: ${props => props.visible ? 'block' : 'none'};
`;

const GenreOption = styled.div`
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid var(--borderColor);
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--textSecondary);
  }
`;

const AddButton = styled.button`
  background: var(--primary);
  color: var(--textOnPrimary);
  border: none;
  border-radius: 4px;
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.2s ease;

  &:hover {
    background: var(--primaryDark);
  }

  &:disabled {
    background: var(--disabledBg);
    color: var(--disabledText);
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--textSecondary);
`;

const GenrePreferences = ({ 
  preferences, 
  onPreferenceChange,
  maxSelections = 10
}) => {
  const [availableGenres, setAvailableGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const { showToast } = useToast();

  // Fetch available genres
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await genreAPI.getAllGenres();
        if (response && response.success) {
          setAvailableGenres(response.data || []);
        } else {
          throw new Error(response?.error || 'Failed to load genres');
        }
      } catch (err) {
        console.error('Error fetching genres:', err);
        setError('Failed to load genre list. Please try again later.');
        showToast({
          type: 'error',
          message: 'Failed to load genres'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGenres();
  }, [showToast]);

  // Filter genres based on search term
  const filteredGenres = availableGenres.filter(genre => {
    const selectedGenreIds = preferences?.genres?.map(g => g.id) || [];
    return (
      !selectedGenreIds.includes(genre._id) &&
      genre.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Handle adding a genre
  const handleAddGenre = (genre) => {
    const currentPreferences = preferences || {};
    const currentGenres = currentPreferences.genres || [];
    
    // Check if we've reached the maximum number of selections
    if (currentGenres.length >= maxSelections) {
      showToast({
        type: 'warning',
        message: `You can only select up to ${maxSelections} genres`
      });
      return;
    }

    // Add the new genre with default weight
    const newGenres = [
      ...currentGenres,
      {
        id: genre._id,
        name: genre.name,
        weight: 5 // Default weight on a 1-10 scale
      }
    ];

    // Update preferences
    onPreferenceChange({
      ...currentPreferences,
      genres: newGenres
    });

    // Clear search
    setSearchTerm('');
    setShowResults(false);
  };

  // Handle removing a genre
  const handleRemoveGenre = (genreId) => {
    const currentPreferences = preferences || {};
    const newGenres = (currentPreferences.genres || []).filter(g => g.id !== genreId);

    // Update preferences
    onPreferenceChange({
      ...currentPreferences,
      genres: newGenres
    });
  };

  // Handle weight change for a genre
  const handleWeightChange = (genreId, newWeight) => {
    const currentPreferences = preferences || {};
    const newGenres = (currentPreferences.genres || []).map(genre => 
      genre.id === genreId ? { ...genre, weight: parseInt(newWeight, 10) } : genre
    );

    // Update preferences
    onPreferenceChange({
      ...currentPreferences,
      genres: newGenres
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
    <GenrePreferencesContainer>
      <GenreSearch>
        <SearchInput
          type="text"
          placeholder="Search for a genre to add..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setShowResults(true)}
        />
        
        <GenreResults visible={showResults && searchTerm.length > 0}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <Loader size={20} />
            </div>
          ) : filteredGenres.length > 0 ? (
            filteredGenres.slice(0, 5).map(genre => (
              <GenreOption key={genre._id}>
                <span>{genre.name}</span>
                <AddButton onClick={() => handleAddGenre(genre)}>
                  <Plus size={14} /> Add
                </AddButton>
              </GenreOption>
            ))
          ) : (
            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--textSecondary)' }}>
              No matching genres found
            </div>
          )}
        </GenreResults>
      </GenreSearch>

      {(preferences?.genres?.length || 0) === 0 ? (
        <EmptyState>
          <p>You haven't added any genre preferences yet.</p>
          <p>Search and add genres you enjoy to get better recommendations.</p>
        </EmptyState>
      ) : (
        <GenreGrid>
          {preferences?.genres?.map(genre => (
            <GenreCardContainer key={genre.id}>
              <RemoveButton onClick={() => handleRemoveGenre(genre.id)}>
                <X size={16} />
              </RemoveButton>
              <GenreTitle>{genre.name}</GenreTitle>
              <GenreDescription>
                {availableGenres.find(g => g._id === genre.id)?.description || 
                  "A popular anime genre."}
              </GenreDescription>
              
              <WeightSlider
                min="1"
                max="10"
                value={genre.weight}
                onChange={(e) => handleWeightChange(genre.id, e.target.value)}
              />
              
              <WeightDetails>
                <span>Less important</span>
                <span>{getWeightDescription(genre.weight)}</span>
                <span>Very important</span>
              </WeightDetails>
            </GenreCardContainer>
          ))}
        </GenreGrid>
      )}
    </GenrePreferencesContainer>
  );
};

export default GenrePreferences; 