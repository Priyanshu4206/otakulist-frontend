import { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, SlidersHorizontal, Star, Calendar, Tag } from 'lucide-react';
import CustomSelect from '../common/CustomSelect';
import MultiSelect from '../common/MultiSelect';
import ChevronIcon from '../common/ChevronIcon';

const FilterContainer = styled.div`
  width: 100%;
  position: relative;
  z-index: 20;
`;

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.85rem 3.5rem 0.85rem 3rem;
  border: 1px solid rgba(var(--borderColor-rgb), 0.2);
  border-radius: 8px;
  font-size: 1rem;
  background-color: rgba(var(--cardBackground-rgb), 0.8);
  color: var(--textPrimary);
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  
  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 4px 15px rgba(var(--primary-rgb), 0.2);
  }

  &::placeholder {
    color: var(--textSecondary);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ClearButton = styled.button`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(var(--danger-rgb), 0.1);
  border: none;
  color: var(--danger);
  cursor: pointer;
  padding: 0.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  
  &:hover {
    background: rgba(var(--danger-rgb), 0.2);
    transform: scale(1.1);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: ${props => props.active ? 'var(--primary)' : 'rgba(var(--cardBackground-rgb), 0.8)'};
  color: ${props => props.active ? 'white' : 'var(--textPrimary)'};
  border: 1px solid ${props => props.active ? 'var(--primary)' : 'rgba(var(--borderColor-rgb), 0.2)'};
  border-radius: 8px;
  padding: 0.85rem 1.2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: ${props => props.active ? '0 5px 15px rgba(var(--primary-rgb), 0.2)' : '0 3px 10px rgba(0, 0, 0, 0.05)'};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.active ? 'var(--primary)' : 'rgba(var(--primary-rgb), 0.1)'};
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ButtonIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
  transform: ${props => props.isRotated ? 'rotate(180deg)' : 'rotate(0)'};
`;

const ExpandedFilters = styled(motion.div)`
  background: rgba(var(--cardBackground-rgb), 0.9);
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1rem;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(var(--borderColor-rgb), 0.1);
  overflow: visible;
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 30;
  touch-action: auto;
  
  @media (max-width: 768px) {
    margin-bottom: 20px;
  }
`;

const FiltersRow = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.8rem;
  }
`;

const FilterGroup = styled.div`
  flex: 1;
  min-width: 200px;
  
  &:hover {
    label {
      color: var(--primary);
    }
  }
`;

const FilterLabel = styled.label`
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--textSecondary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.2s ease;
  
  svg {
    color: var(--primary);
  }
`;

// Animation variants
const expandVariants = {
  hidden: { opacity: 0, height: 0, overflow: 'hidden' },
  visible: { opacity: 1, height: 'auto', overflow: 'visible', transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, height: 0, overflow: 'hidden', transition: { duration: 0.2, ease: 'easeIn' } }
};

const sortOptions = [
  { value: 'broadcast', label: 'Broadcast Time' },
  { value: 'title', label: 'Title' },
  { value: 'popularity', label: 'Popularity' },
  { value: 'score', label: 'Score' },
  { value: 'year', label: 'Year' }
];

const CustomSelectWrapper = styled.div`
  position: relative;
  z-index: 5;
  
  &:hover, &:focus-within {
    z-index: 10;
  }
`;

const MultiSelectWrapper = styled.div`
  position: relative;
  z-index: 5;
  
  &:hover, &:focus-within {
    z-index: 10;
  }
`;

const ScheduleFilter = ({ filters, onChange, availableGenres = [] }) => {
  const [searchTerm, setSearchTerm] = useState(filters?.searchTerm || '');
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    sort: 'broadcast',
    genres: [],
    rating: '',
    ...filters
  });
  
  // Transform available genres from API into format needed by MultiSelect
  const genreOptions = useMemo(() => {
    if (!availableGenres || !availableGenres.length) return [];
    
    // Create a Set to store unique genres
    const uniqueGenres = new Set();
    
    // Extract all genres from the available data
    availableGenres.forEach(item => {
      if (typeof item === 'string') {
        uniqueGenres.add(item);
      } else if (item && item.name) {
        uniqueGenres.add(item.name);
      }
    });
    
    // Convert to array of options for MultiSelect
    return Array.from(uniqueGenres)
      .map(name => ({
        value: name.toLowerCase(),
        label: name
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [availableGenres]);
  
  // Dynamically generate rating options from anime data
  const ratingOptions = useMemo(() => {
    // Ratings commonly used in anime
    const standardRatings = [
      { value: '', label: 'All Ratings' },
      { value: 'G - All Ages', label: 'G - All Ages' },
      { value: 'PG - Children', label: 'PG - Children' },
      { value: 'PG-13 - Teens 13+', label: 'PG-13 - Teens 13+' },
      { value: 'R - 17+', label: 'R - 17+ (Violence)' },
      { value: 'R+ - Mild Nudity', label: 'R+ - Mild Nudity' },
      { value: 'Rx - Hentai', label: 'Rx - Hentai' }
    ];
    
    return standardRatings;
  }, []);
  
  // Handle search input change (no debounce since we're filtering client-side)
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    applyFilters({ ...localFilters, searchTerm: value });
  };
  
  // Clear search input
  const handleClearSearch = () => {
    setSearchTerm('');
    applyFilters({ ...localFilters, searchTerm: '' });
  };
  
  // Toggle filter visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  // Handle individual filter change
  const handleFilterChange = (name, value) => {
    const updatedFilters = {
      ...localFilters,
      [name]: value
    };
    
    setLocalFilters(updatedFilters);
    applyFilters(updatedFilters);
  };
  
  // Apply all filters at once
  const applyFilters = useCallback((filters) => {
    onChange({
      ...filters,
      searchTerm: filters.searchTerm || ''
    });
  }, [onChange]);
  
  // Update component when filters prop changes
  useEffect(() => {
    setLocalFilters(prevFilters => ({
      ...prevFilters,
      ...filters
    }));
    setSearchTerm(filters?.searchTerm || '');
  }, [filters]);
  
  return (
    <FilterContainer>
      <TopRow>
        <SearchContainer>
          <SearchIcon>
            <Search size={20} />
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder="Search anime titles..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <ClearButton 
              onClick={handleClearSearch}
              aria-label="Clear search"
            >
              <X size={18} />
            </ClearButton>
          )}
        </SearchContainer>
        
        <FilterButton 
          active={showFilters}
          onClick={toggleFilters}
          aria-expanded={showFilters}
          aria-controls="expanded-filters"
        >
          <SlidersHorizontal size={20} />
          Filters
          <ButtonIcon isRotated={showFilters}>
            <ChevronIcon isRotated={showFilters} size={16} />
          </ButtonIcon>
        </FilterButton>
      </TopRow>
      
      <AnimatePresence>
        {showFilters && (
          <ExpandedFilters
            id="expanded-filters"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={expandVariants}
          >
            <FiltersRow>
              <FilterGroup>
                <FilterLabel htmlFor="genre-filter">
                  <Tag size={16} />
                  Genres
                </FilterLabel>
                <MultiSelectWrapper>
                  <MultiSelect
                    id="genre-filter"
                    options={genreOptions}
                    value={localFilters.genres || []}
                    onChange={(value) => handleFilterChange('genres', value)}
                    placeholder="All Genres"
                  />
                </MultiSelectWrapper>
              </FilterGroup>
              
              <FilterGroup>
                <FilterLabel htmlFor="sort-filter">
                  <Star size={16} />
                  Sort By
                </FilterLabel>
                <CustomSelectWrapper>
                  <CustomSelect
                    id="sort-filter"
                    options={sortOptions}
                    value={localFilters.sort}
                    onChange={(value) => handleFilterChange('sort', value)}
                  />
                </CustomSelectWrapper>
              </FilterGroup>
              
              <FilterGroup>
                <FilterLabel htmlFor="rating-filter">
                  <Calendar size={16} />
                  Rating
                </FilterLabel>
                <CustomSelectWrapper>
                  <CustomSelect
                    id="rating-filter"
                    options={ratingOptions}
                    value={localFilters.rating}
                    onChange={(value) => handleFilterChange('rating', value)}
                    placeholder="All Ratings"
                  />
                </CustomSelectWrapper>
              </FilterGroup>
            </FiltersRow>
          </ExpandedFilters>
        )}
      </AnimatePresence>
    </FilterContainer>
  );
};

export default ScheduleFilter; 