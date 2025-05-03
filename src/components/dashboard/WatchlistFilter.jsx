import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, SlidersHorizontal, Star, Calendar, Tag, Clock } from 'lucide-react';
import CustomSelect from '../common/CustomSelect';
import MultiSelect from '../common/MultiSelect';
import ChevronIcon from '../common/ChevronIcon';

const FilterContainer = styled.div`
  width: 100%;
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
    border-color: var(--tertiary);
    box-shadow: 0 4px 15px rgba(var(--tertiary-rgb), 0.2);
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
  color: var(--tertiary);
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
  }
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: ${props => props.active ? 'var(--tertiary)' : 'rgba(var(--cardBackground-rgb), 0.8)'};
  color: ${props => props.active ? 'white' : 'var(--textPrimary)'};
  border: 1px solid ${props => props.active ? 'var(--tertiary)' : 'rgba(var(--borderColor-rgb), 0.2)'};
  border-radius: 8px;
  padding: 0.85rem 1.2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: ${props => props.active ? '0 5px 15px rgba(var(--tertiary-rgb), 0.2)' : '0 3px 10px rgba(0, 0, 0, 0.05)'};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.active ? 'var(--tertiary)' : 'rgba(var(--tertiary-rgb), 0.1)'};
    transform: translateY(-2px);
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
  background: rgba(var(--cardBackground-rgb), 0.8);
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(var(--borderColor-rgb), 0.1);
  overflow: visible;
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
`;

const FilterLabel = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--textSecondary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    color: var(--tertiary);
  }
`;

// Animation variants
const expandVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: { opacity: 1, height: 'auto' }
};

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'watching', label: 'Watching' },
  { value: 'completed', label: 'Completed' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'dropped', label: 'Dropped' },
  { value: 'plan_to_watch', label: 'Plan to Watch' },
];

const genreOptions = [
  { value: 'action', label: 'Action' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'comedy', label: 'Comedy' },
  { value: 'drama', label: 'Drama' },
  { value: 'fantasy', label: 'Fantasy' },
  { value: 'horror', label: 'Horror' },
  { value: 'mystery', label: 'Mystery' },
  { value: 'romance', label: 'Romance' },
  { value: 'sci_fi', label: 'Sci-Fi' },
  { value: 'slice_of_life', label: 'Slice of Life' },
  { value: 'sports', label: 'Sports' },
  { value: 'supernatural', label: 'Supernatural' },
  { value: 'thriller', label: 'Thriller' },
];

const sortOptions = [
  { value: 'title', label: 'Title' },
  { value: 'score', label: 'Your Score' },
  { value: 'progress', label: 'Progress' },
  { value: 'last_updated', label: 'Last Updated' },
  { value: 'release_date', label: 'Release Date' },
];

const seasonOptions = [
  { value: '', label: 'All Seasons' },
  { value: 'winter', label: 'Winter' },
  { value: 'spring', label: 'Spring' },
  { value: 'summer', label: 'Summer' },
  { value: 'fall', label: 'Fall' },
];

const WatchlistFilter = ({ filters, onChange }) => {
  const [searchTerm, setSearchTerm] = useState(filters?.searchTerm || '');
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    status: '',
    genres: [],
    sort: 'last_updated',
    season: '',
    ...filters
  });
  
  // Handle search input change with debounce
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Apply filter after a short delay
    const handler = setTimeout(() => {
      applyFilters({ ...localFilters, searchTerm: value });
    }, 300);
    
    return () => clearTimeout(handler);
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
            <ClearButton onClick={handleClearSearch}>
              <X size={18} />
            </ClearButton>
          )}
        </SearchContainer>
        
        <FilterButton 
          active={showFilters}
          onClick={toggleFilters}
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
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={expandVariants}
            transition={{ duration: 0.3 }}
          >
            <FiltersRow>
              <FilterGroup>
                <FilterLabel>
                  <Clock size={16} />
                  Watch Status
                </FilterLabel>
                <CustomSelect
                  options={statusOptions}
                  value={localFilters.status}
                  onChange={(value) => handleFilterChange('status', value)}
                  placeholder="All Status"
                />
              </FilterGroup>
              
              <FilterGroup>
                <FilterLabel>
                  <Tag size={16} />
                  Genres
                </FilterLabel>
                <MultiSelect
                  options={genreOptions}
                  value={localFilters.genres}
                  onChange={(value) => handleFilterChange('genres', value)}
                  placeholder="All Genres"
                />
              </FilterGroup>
              
              <FilterGroup>
                <FilterLabel>
                  <Star size={16} />
                  Sort By
                </FilterLabel>
                <CustomSelect
                  options={sortOptions}
                  value={localFilters.sort}
                  onChange={(value) => handleFilterChange('sort', value)}
                />
              </FilterGroup>
              
              <FilterGroup>
                <FilterLabel>
                  <Calendar size={16} />
                  Season
                </FilterLabel>
                <CustomSelect
                  options={seasonOptions}
                  value={localFilters.season}
                  onChange={(value) => handleFilterChange('season', value)}
                  placeholder="All Seasons"
                />
              </FilterGroup>
            </FiltersRow>
          </ExpandedFilters>
        )}
      </AnimatePresence>
    </FilterContainer>
  );
};

export default WatchlistFilter; 