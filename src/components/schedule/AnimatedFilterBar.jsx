import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Search, X, SlidersHorizontal, Clock, Star, AlignLeft, TrendingUp } from 'lucide-react';
import TimezoneSelect from './TimezoneSelect';
import { getUserTimezone } from './TimezoneSelect';

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
  border: 1px solid rgba(var(--border-rgb), 0.2);
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
  background: rgba(var(--error-rgb), 0.1);
  border: none;
  color: var(--error);
  cursor: pointer;
  padding: 0.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  
  &:hover {
    background: rgba(var(--error-rgb), 0.2);
  }
`;

const ExpandedFilters = styled(motion.div)`
  background: rgba(var(--cardBackground-rgb), 0.8);
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(var(--border-rgb), 0.1);
  overflow: hidden;
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
    color: var(--primary);
  }
`;

const FilterSelect = styled.select`
  width: 100%;
  padding: 0.7rem 1rem;
  border: 1px solid rgba(var(--border-rgb), 0.2);
  border-radius: 8px;
  background-color: rgba(var(--cardBackground-rgb), 0.8);
  font-size: 0.95rem;
  color: var(--textPrimary);
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%235c5c5c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: var(--primary);
  }

  option {
    background-color: var(--cardBackground);
    color: var(--textPrimary);
  }
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: ${props => props.active ? 'var(--primary)' : 'rgba(var(--cardBackground-rgb), 0.8)'};
  color: ${props => props.active ? 'white' : 'var(--textPrimary)'};
  border: 1px solid ${props => props.active ? 'var(--primary)' : 'rgba(var(--border-rgb), 0.2)'};
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
`;

const ButtonIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
  transform: ${props => props.isRotated ? 'rotate(180deg)' : 'rotate(0)'};
`;

const TimezoneWrapper = styled.div`
  flex: 1;
  min-width: 200px;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

// Animation variants - simpler and lighter
const expandVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: { opacity: 1, height: 'auto' }
};

const AnimatedFilterBar = ({ filters, onChange, availableGenres = [] }) => {
  const [searchTerm, setSearchTerm] = useState(filters?.searchTerm || '');
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    sort: 'broadcast',
    status: '',
    rating: '',
    genres: '',
    timezone: getUserTimezone(),
    ...filters
  });
  
  // Debounce search reference
  const searchDebounceRef = useRef(null);
  
  // Handle search input change with debounce
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Clear any existing timeout
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    
    // Set a new timeout
    searchDebounceRef.current = setTimeout(() => {
      onChange({ ...localFilters, searchTerm: value });
    }, 300);
  }, [localFilters, onChange]);
  
  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, []);
  
  // Clear search input
  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
    // Apply filter immediately when clearing search
    onChange({ ...localFilters, searchTerm: '' });
    
    // Clear any existing timeout
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
  }, [localFilters, onChange]);
  
  // Handle individual filter change
  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    
    const updatedFilters = {
      ...localFilters,
      [name]: value,
    };
    
    setLocalFilters(updatedFilters);
    onChange({ ...updatedFilters, searchTerm });
  }, [localFilters, searchTerm, onChange]);
  
  // Get unique genres from available anime
  const uniqueGenres = useMemo(() => {
    const genreMap = new Map();
    availableGenres.forEach(genre => {
      if (genre && genre.mal_id) {
        genreMap.set(genre.mal_id.toString(), genre.name);
      }
    });
    return Array.from(genreMap).map(([id, name]) => ({ id, name }));
  }, [availableGenres]);
  
  // Handle timezone change
  const handleTimezoneChange = useCallback((timezoneCode) => {
    const updatedFilters = {
      ...localFilters,
      timezone: timezoneCode
    };
    
    setLocalFilters(updatedFilters);
    onChange({ ...updatedFilters, searchTerm });
  }, [localFilters, searchTerm, onChange]);
  
  // Toggle filter visibility
  const toggleFilters = useCallback(() => {
    setShowFilters(!showFilters);
  }, [showFilters]);
  
  // Get icon for sort option
  const getSortIcon = (sortValue) => {
    switch (sortValue) {
      case 'broadcast':
        return <Clock size={16} />;
      case 'popularity':
        return <TrendingUp size={16} />;
      case 'score':
        return <Star size={16} />;
      case 'title':
        return <AlignLeft size={16} />;
      default:
        return <Clock size={16} />;
    }
  };
  
  return (
    <FilterContainer>
      <TopRow>
        <SearchContainer>
          <SearchIcon>
            <Search size={20} />
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder="Search anime by title..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <ClearButton onClick={handleClearSearch}>
              <X size={16} />
            </ClearButton>
          )}
        </SearchContainer>
        
        <TimezoneWrapper>
          <TimezoneSelect 
            selectedTimezone={localFilters.timezone}
            onChange={handleTimezoneChange}
          />
        </TimezoneWrapper>
        
        <FilterButton
          active={showFilters}
          onClick={toggleFilters}
        >
          <ButtonIcon isRotated={showFilters}>
            <SlidersHorizontal size={18} />
          </ButtonIcon>
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </FilterButton>
      </TopRow>
      
      <AnimatePresence>
        {showFilters && (
          <ExpandedFilters
            key="filters"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={expandVariants}
            transition={{ duration: 0.25 }}
          >
            <FiltersRow>
              <FilterGroup>
                <FilterLabel>
                  {getSortIcon(localFilters.sort)}
                  Sort By
                </FilterLabel>
                <FilterSelect
                  name="sort"
                  value={localFilters.sort}
                  onChange={handleFilterChange}
                >
                  <option value="broadcast">Broadcast Time</option>
                  <option value="popularity">Popularity</option>
                  <option value="score">Rating</option>
                  <option value="title">Alphabetical</option>
                </FilterSelect>
              </FilterGroup>
              
              <FilterGroup>
                <FilterLabel>
                  <Star size={16} />
                  Status
                </FilterLabel>
                <FilterSelect
                  name="status"
                  value={localFilters.status}
                  onChange={handleFilterChange}
                >
                  <option value="">All Status</option>
                  <option value="airing">Currently Airing</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                </FilterSelect>
              </FilterGroup>
              
              <FilterGroup>
                <FilterLabel>
                  <Star size={16} />
                  Rating
                </FilterLabel>
                <FilterSelect
                  name="rating"
                  value={localFilters.rating}
                  onChange={handleFilterChange}
                >
                  <option value="">All Ratings</option>
                  <option value="g">G - All Ages</option>
                  <option value="pg">PG - Children</option>
                  <option value="pg13">PG-13 - Teens 13+</option>
                  <option value="r17">R - 17+ (violence & profanity)</option>
                  <option value="r">R+ - Mild Nudity</option>
                </FilterSelect>
              </FilterGroup>
              
              <FilterGroup>
                <FilterLabel>
                  <Filter size={16} />
                  Genre
                </FilterLabel>
                <FilterSelect
                  name="genres"
                  value={localFilters.genres}
                  onChange={handleFilterChange}
                >
                  <option value="">All Genres</option>
                  {uniqueGenres.map(genre => (
                    <option key={genre.id} value={genre.id}>
                      {genre.name}
                    </option>
                  ))}
                </FilterSelect>
              </FilterGroup>
            </FiltersRow>
          </ExpandedFilters>
        )}
      </AnimatePresence>
    </FilterContainer>
  );
};

export default AnimatedFilterBar; 