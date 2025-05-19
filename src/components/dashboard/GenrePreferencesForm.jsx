import React, { useState, useEffect } from 'react';
import {
  FormSection,
  FormGroup,
  Label,
  Slider,
  SliderContainer,
} from '../../styles/ProfileStyles';
import styled from 'styled-components';
import { Info, Save, Filter, CheckCircle, Search } from 'lucide-react';

// Debug component to show data structure
const DebugPanel = styled.pre`
  background-color: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  padding: 10px;
  font-size: 11px;
  max-height: 200px;
  overflow: auto;
  margin-top: 20px;
  color: #666;
  display: ${props => process.env.NODE_ENV === 'development' ? 'block' : 'none'};
`;

const GenreGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
  padding-right: 0.5rem;
  
  /* Scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(var(--primary-rgb), 0.05);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--primary);
    border-radius: 4px;
  }
`;

const GenreCard = styled.div`
  background: var(--bgSecondary);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid ${props => props.selected ? 'var(--primary)' : 'var(--borderColor)'};
  opacity: ${props => props.selected ? 1 : 0.7};
  transition: all 0.2s ease;
  
  &:hover {
    border-color: var(--primary);
    opacity: 1;
    transform: translateY(-2px);
  }
`;

const GenreHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const GenreName = styled.span`
  font-weight: 500;
  color: var(--textPrimary);
`;

const WeightDisplay = styled.span`
  font-size: 0.8rem;
  color: var(--textSecondary);
  background: var(--secondary);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
`;

const EmptyState = styled.div`
  padding: 1.5rem;
  background: var(--bgSecondary);
  border-radius: 8px;
  text-align: center;
  color: var(--textSecondary);
  margin-top: 1rem;
`;

const InfoBox = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 0.75rem 1rem;
  background: var(--bgSecondary);
  border-left: 3px solid var(--primary);
  border-radius: 4px;
  margin-bottom: 1rem;
  gap: 0.75rem;
`;

const InfoText = styled.div`
  color: var(--textSecondary);
  font-size: 0.9rem;
  line-height: 1.5;
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  background: rgba(var(--primary-rgb), 0.08);
  border-radius: 8px;
  padding: 0.5rem 1rem;
  margin-bottom: 1rem;
  border: 1px solid var(--borderColor);
  
  svg {
    color: var(--textSecondary);
    margin-right: 0.75rem;
  }
  
  input {
    background: transparent;
    border: none;
    color: var(--textPrimary);
    font-size: 0.95rem;
    width: 100%;
    outline: none;
    
    &::placeholder {
      color: var(--textSecondary);
    }
  }
`;

const FiltersRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const FiltersGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const FilterBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${props => props.active ? 'var(--primary)' : 'var(--secondary)'};
  color: ${props => props.active ? 'white' : 'var(--textSecondary)'};
  padding: 0.4rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.active ? 'var(--primaryDark)' : 'rgba(var(--primary-rgb), 0.1)'};
    color: ${props => props.active ? 'white' : 'var(--primary)'};
  }
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
  margin-top: 1.5rem;
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

const FILTERS = {
  ALL: 'all',
  SELECTED: 'selected',
};

const GenrePreferencesForm = ({ genres, formData, handleGenreToggle, handleGenreWeightChange, updateProfile }) => {
  // Flag to prevent re-initialization on first render
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState(FILTERS.ALL);
  const [hasChanges, setHasChanges] = useState(false);
  const [localGenres, setLocalGenres] = useState([]);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  
  // Get selected genre IDs
  const selectedGenres = formData.preferences.animeGenres || [];
  
  // Initialize data from genres and selected genres
  useEffect(() => {
    if (genres && genres.length > 0) {
      const selectedGenreIds = selectedGenres.map(g => g.genreId);
      
      // Map genres to local state format with selected status
      const mappedGenres = genres.map(genre => {
        const isSelected = selectedGenreIds.includes(genre.id);
        const selectedGenre = isSelected 
          ? selectedGenres.find(g => g.genreId === genre.id) 
          : null;
          
        return {
          id: genre.id,
          name: genre.name,
          selected: isSelected,
          weight: selectedGenre ? selectedGenre.weight : 0
        };
      });
      
      setLocalGenres(mappedGenres);
    }
  }, [genres, selectedGenres]);
  
  // Handle local genre toggle
  const handleLocalGenreToggle = (genreId) => {
    setLocalGenres(prev => prev.map(genre => {
      if (genre.id === genreId) {
        // If toggling on, set default weight of 1.0
        const newWeight = !genre.selected ? 1.0 : 0;
        return {
          ...genre,
          selected: !genre.selected,
          weight: newWeight
        };
      }
      return genre;
    }));
    setHasChanges(true);
  };
  
  // Handle weight change locally
  const handleLocalWeightChange = (genreId, newWeight) => {
    setLocalGenres(prev => prev.map(genre => {
      if (genre.id === genreId) {
        const selected = newWeight > 0;
        return {
          ...genre,
          weight: parseFloat(newWeight),
          selected
        };
      }
      return genre;
    }));
    setHasChanges(true);
  };
  
  // Handle save preferences
  const handleSavePreferences = () => {
    
    // Get only selected genres with weight > 0
    const selectedGenresToSave = localGenres
      .filter(genre => genre.selected && genre.weight > 0)
      .map(genre => ({
        id: genre.id,
        name: genre.name,
        weight: parseFloat(genre.weight)
      }));
    
    // Create a more efficient update approach
    const updatedGenres = selectedGenresToSave.map(genre => ({
      genreId: genre.id,
      name: genre.name,
      weight: parseFloat(genre.weight) || 1.0,
      source: "explicit"
    }));
    
    // Update all genres at once with a single API call
    updateProfile && updateProfile({ 
      preferences: { 
        field: 'animeGenres', 
        data: updatedGenres,
        skipDebounce: true
      } 
    });
    
    setHasChanges(false);
  };
  
  // Filter genres based on search term and filter selection
  const filteredGenres = localGenres.filter(genre => {
    const matchesSearch = genre.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    switch (selectedFilter) {
      case FILTERS.SELECTED:
        return matchesSearch && genre.selected;
      default:
        return matchesSearch;
    }
  });
  
  // Get weight label based on value
  const getWeightLabel = (weight) => {
    if (weight <= 0.5) return "Low";
    if (weight <= 1.0) return "Normal";
    if (weight <= 1.5) return "High";
    return "Very High";
  };

  return (
    <FormSection style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <InfoBox>
        <Info size={18} color="var(--primary)" />
        <InfoText>
          Select genres you enjoy to improve your anime recommendations. 
          Adjust the influence sliders to fine-tune how much each genre affects your recommendations.
        </InfoText>
      </InfoBox>
      
      <FormGroup style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Label>Customize your Genre Preferences</Label>
        {genres.length === 0 ? (
          <div style={{ padding: '12px', backgroundColor: 'var(--backgroundLight)', borderRadius: '4px' }}>
            Loading genres...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <SearchBox>
              <Search size={18} />
              <input
                type="text"
                placeholder="Search genres..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchBox>
            
            <FiltersRow>
              <FiltersGroup>
                <FilterBadge 
                  active={selectedFilter === FILTERS.ALL}
                  onClick={() => setSelectedFilter(FILTERS.ALL)}
                >
                  <Filter size={14} />
                  All Genres
                </FilterBadge>
                <FilterBadge 
                  active={selectedFilter === FILTERS.SELECTED}
                  onClick={() => setSelectedFilter(FILTERS.SELECTED)}
                >
                  <Filter size={14} />
                  Selected ({localGenres.filter(g => g.selected).length})
                </FilterBadge>
              </FiltersGroup>
              
              <SaveButton 
                onClick={handleSavePreferences} 
                disabled={!hasChanges}
                style={{ margin: 0 }}
              >
                <Save size={18} />
                Save Genres
              </SaveButton>
            </FiltersRow>
            
            <div style={{ flex: 1, overflow: 'hidden' }}>
              {filteredGenres.length > 0 ? (
                <GenreGrid>
                  {filteredGenres.map(genre => (
                    <GenreCard 
                      key={genre.id} 
                      selected={genre.selected}
                      onClick={() => handleLocalGenreToggle(genre.id)}
                    >
                      <GenreHeader>
                        <GenreName>{genre.name}</GenreName>
                        {genre.selected && (
                          <WeightDisplay>{getWeightLabel(genre.weight)}</WeightDisplay>
                        )}
                      </GenreHeader>
                      <SliderContainer>
                        <Slider
                          type="range"
                          min="0"
                          max="2"
                          step="0.1"
                          value={genre.weight}
                          onChange={(e) => {
                            e.stopPropagation(); // Prevent card click
                            handleLocalWeightChange(genre.id, e.target.value);
                          }}
                          onClick={(e) => e.stopPropagation()} // Prevent card click
                        />
                        <small style={{ color: 'var(--textSecondary)', fontSize: '0.8rem' }}>
                          Influence: {genre.weight.toFixed(1)}
                        </small>
                      </SliderContainer>
                    </GenreCard>
                  ))}
                </GenreGrid>
              ) : (
                <EmptyState>
                  No genres found matching your search
                </EmptyState>
              )}
            </div>
          </div>
        )}
      </FormGroup>
    </FormSection>
  );
};

export default GenrePreferencesForm; 