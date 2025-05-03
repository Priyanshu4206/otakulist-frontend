import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Filter, Search, X } from 'lucide-react';
import TimezoneSelect from './TimezoneSelect';
import { getUserTimezone } from './TimezoneSelect';

const FilterContainer = styled.div`
  margin-bottom: 1.5rem;
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
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid var(--borderColor);
  border-radius: 4px;
  font-size: 1rem;
  background-color: var(--cardBackground);
  color: var(--textPrimary);
  
  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
  }

  &::placeholder {
    color: var(--textSecondary);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--textSecondary);
`;

const ClearButton = styled.button`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--textSecondary);
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: var(--textPrimary);
  }
`;

const FiltersRow = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 1rem;
`;

const FilterSelect = styled.select`
  padding: 0.5rem 1rem;
  border: 1px solid var(--borderColor);
  border-radius: 4px;
  background-color: var(--cardBackground);
  font-size: 0.9rem;
  color: var(--textPrimary);
  
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
  background-color: ${props => props.active ? 'var(--primary)' : 'var(--cardBackground)'};
  color: ${props => props.active ? 'white' : 'var(--textPrimary)'};
  border: 1px solid ${props => props.active ? 'var(--primary)' : 'var(--borderColor)'};
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  
  svg {
    margin-right: 0.5rem;
  }
  
  &:hover {
    background-color: ${props => props.active ? 'var(--primaryDark)' : 'var(--backgroundLight)'};
  }
`;

const FilterBar = ({ onFilter, initialFilters }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    sort: 'broadcast',
    status: '',
    rating: '',
    genres: '',
    timezone: initialFilters?.timezone || getUserTimezone() // Use initialFilters if provided
  });
  
  // Initialize filters with initialFilters if provided
  useEffect(() => {
    if (initialFilters) {
      setFilters(prev => ({
        ...prev,
        ...initialFilters
      }));
    }
  }, [initialFilters]);
  
  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Apply filters with new search term
    applyFilters({ ...filters, searchTerm: value });
  };
  
  // Clear search input
  const handleClearSearch = () => {
    setSearchTerm('');
    
    // Apply filters without search term
    applyFilters({ ...filters, searchTerm: '' });
  };
  
  // Handle individual filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    const updatedFilters = {
      ...filters,
      [name]: value,
    };
    
    setFilters(updatedFilters);
    
    // Apply updated filters
    applyFilters({ ...updatedFilters, searchTerm });
  };
  
  // Handle timezone change
  const handleTimezoneChange = (timezoneCode) => {
    const updatedFilters = {
      ...filters,
      timezone: timezoneCode
    };
    
    setFilters(updatedFilters);
    
    // Apply updated filters
    applyFilters({ ...updatedFilters, searchTerm });
  };
  
  // Toggle filter visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  // Apply all filters
  const applyFilters = (filterData) => {
    if (onFilter) {
      onFilter(filterData);
    }
  };
  
  return (
    <FilterContainer>
      <TopRow>
        <SearchContainer>
          <SearchIcon>
            <Search size={18} />
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder="Search anime..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <ClearButton onClick={handleClearSearch}>
              <X size={18} />
            </ClearButton>
          )}
        </SearchContainer>
        
        <TimezoneSelect 
          selectedTimezone={filters.timezone}
          onChange={handleTimezoneChange}
        />
        
        <FilterButton
          active={showFilters}
          onClick={toggleFilters}
        >
          <Filter size={16} />
          Filters
        </FilterButton>
      </TopRow>
      
      {showFilters && (
        <FiltersRow>
          <FilterSelect
            name="sort"
            value={filters.sort}
            onChange={handleFilterChange}
          >
            <option value="broadcast">Broadcast Time</option>
            <option value="popularity">Popularity</option>
            <option value="score">Rating</option>
            <option value="title">Alphabetical</option>
          </FilterSelect>
          
          <FilterSelect
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
          >
            <option value="">All Status</option>
            <option value="Currently Airing">Airing</option>
            <option value="Finished Airing">Completed</option>
            <option value="Not yet aired">Upcoming</option>
          </FilterSelect>
          
          <FilterSelect
            name="rating"
            value={filters.rating}
            onChange={handleFilterChange}
          >
            <option value="">All Ratings</option>
            <option value="G">G</option>
            <option value="PG">PG</option>
            <option value="PG-13">PG-13</option>
            <option value="R">R</option>
          </FilterSelect>
          
          <FilterSelect
            name="genres"
            value={filters.genres}
            onChange={handleFilterChange}
          >
            <option value="">All Genres</option>
            <option value="Action">Action</option>
            <option value="Adventure">Adventure</option>
            <option value="Comedy">Comedy</option>
            <option value="Drama">Drama</option>
            <option value="Fantasy">Fantasy</option>
            <option value="Horror">Horror</option>
            <option value="Romance">Romance</option>
            <option value="Sci-Fi">Sci-Fi</option>
            <option value="Slice of Life">Slice of Life</option>
            <option value="Sports">Sports</option>
          </FilterSelect>
        </FiltersRow>
      )}
    </FilterContainer>
  );
};

export default FilterBar; 