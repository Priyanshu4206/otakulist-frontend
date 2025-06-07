import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MiniLoadingSpinner from '../common/MiniLoadingSpinner';

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;
const PageTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--textPrimary);
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;
const SearchBarContainer = styled.div`
  position: relative;
  width: 400px;
  @media (max-width: 768px) {
    width: 100%;
  }
`;
const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  border-radius: 8px;
  border: 1.5px solid rgba(var(--borderColor-rgb), 0.2);
  background-color: rgba(var(--cardBackground-rgb), 0.8);
  color: var(--textPrimary);
  font-size: 1rem;
  transition: all 0.3s ease;
  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 4px 15px rgba(var(--primary-rgb), 0.2);
  }
  &::placeholder {
    color: var(--textSecondary);
    opacity: 0.7;
  }
`;
const SearchIcon = styled.div`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--textSecondary);
`;
const SearchDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: var(--cardBackground);
  border-radius: 8px;
  border: 1px solid rgba(var(--borderColor-rgb), 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  max-height: 400px;
  overflow-y: auto;
  z-index: 100;
  display: ${props => props.isVisible ? 'block' : 'none'};
  margin-top: 0.5rem;
`;
const SearchResults = styled.div`
  padding: 1rem;
`;
const SearchResultItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover { background-color: rgba(var(--primary-rgb), 0.1); }
`;
const SearchResultImage = styled.img`
  width: 60px;
  height: 60px;
  border-radius: ${props => props.type === 'user' ? '50%' : '4px'};
  object-fit: cover;
  margin-right: 1rem;
`;
const SearchResultContent = styled.div`
  flex: 1;
`;
const SearchResultTitle = styled.h4`
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--textPrimary);
  margin: 0;
`;
const SearchResultSubtitle = styled.p`
  font-size: 0.8rem;
  color: var(--textSecondary);
  margin: 0;
`;
const EmptyResults = styled.div`
  padding: 1rem;
  text-align: center;
  color: var(--textSecondary);
`;

const ExplorePageHeader = ({
  searchTerm,
  setSearchTerm,
  searchResults = [],
  isSearching = false,
}) => {
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  // Handle click outside search dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsDropdownVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Show dropdown when search term is entered
  useEffect(() => {
    setIsDropdownVisible(searchTerm.length >= 2);
  }, [searchTerm]);

  return (
    <PageHeader>
      <PageTitle>Explore</PageTitle>
      <SearchBarContainer ref={searchRef}>
        <SearchInput
          placeholder="Search anime..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          onFocus={() => searchTerm.length >= 2 && setIsDropdownVisible(true)}
        />
        <SearchIcon>
          {isSearching ? <MiniLoadingSpinner size={20} /> : <Search size={20} />}
        </SearchIcon>
        <SearchDropdown isVisible={isDropdownVisible && searchTerm.length >= 2}>
          <SearchResults>
            {isSearching ? (
              <MiniLoadingSpinner />
            ) : (
              <>
                {searchResults.length > 0 ? (
                  searchResults.map(anime => (
                    <SearchResultItem 
                      key={anime._id || anime.id || anime.malId} 
                      onClick={() => navigate(`/anime/${anime.malId || anime.mal_id}`)}
                    >
                      <SearchResultImage 
                        src={
                          anime.images?.webp?.image_url || 
                          anime.images?.jpg?.large_image_url || 
                          anime.images?.jpg?.image_url || 
                          anime.coverImage ||
                          '/images/placeholder.jpg'
                        }
                        alt={
                          anime.title || 
                          anime.titles?.english || 
                          anime.titles?.romaji || 
                          anime.titles?.japanese || 
                          'Anime'
                        }
                        type="anime" 
                      />
                      <SearchResultContent>
                        <SearchResultTitle>
                          {anime.title || 
                           anime.titles?.english || 
                           anime.titles?.romaji || 
                           anime.titles?.japanese || 
                           'Unknown Anime'}
                        </SearchResultTitle>
                        <SearchResultSubtitle>
                          {anime.type || 'TV'} {anime.year && `, ${anime.year}`}
                        </SearchResultSubtitle>
                      </SearchResultContent>
                    </SearchResultItem>
                  ))
                ) : (
                  <EmptyResults>No results found</EmptyResults>
                )}
              </>
            )}
          </SearchResults>
        </SearchDropdown>
      </SearchBarContainer>
    </PageHeader>
  );
};

export default ExplorePageHeader; 