import React, { useEffect } from 'react';
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
const SearchTabs = styled.div`
  display: flex;
  border-bottom: 1px solid rgba(var(--borderColor-rgb), 0.2);
`;
const SearchTab = styled.button`
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  border-bottom: 2px solid ${props => props.active ? 'var(--primary)' : 'transparent'};
  color: ${props => props.active ? 'var(--primary)' : 'var(--textSecondary)'};
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  &:hover { color: var(--primary); }
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

const TABS = [
  { key: 'anime', label: 'Anime' },
  { key: 'users', label: 'Users' },
  { key: 'playlists', label: 'Playlists' },
];

const ExplorePageHeader = ({
  searchRef,
  searchValue,
  setSearchValue,
  searchType,
  setSearchType,
  searchResults,
  searchVisible,
  setSearchVisible,
  searchLoading,
}) => {
  const navigate = useNavigate();

  const handleSearchInput = (e) => {
    setSearchValue(e.target.value);
  };

  const handleSearchFocus = () => {
    if (searchValue.length >= 2) {
      setSearchVisible(true);
    }
  };

  const handleTabChange = (tabKey) => {
    setSearchType(tabKey);
  };

  const handleNavigateToAnime = (anime) => {
    navigate(`/anime/${anime.mal_id || anime.malId}`);
    setSearchVisible(false);
  };

  const handleNavigateToUser = (user) => {
    navigate(`/user/${user.username}`);
    setSearchVisible(false);
  };

  const handleNavigateToPlaylist = (playlist) => {
    navigate(`/playlist/${playlist._id}`);
    setSearchVisible(false);
  };

  return (
    <PageHeader>
      <PageTitle>Explore</PageTitle>
      <SearchBarContainer ref={searchRef}>
        <SearchInput
          placeholder="Search anime, people, playlists..."
          value={searchValue}
          onChange={handleSearchInput}
          onFocus={handleSearchFocus}
        />
        <SearchIcon>
          {searchLoading ? <MiniLoadingSpinner size={16} /> : <Search size={20} />}
        </SearchIcon>
        <SearchDropdown isVisible={searchVisible}>
          <SearchTabs>
            {TABS.map(tab => (
              <SearchTab
                key={tab.key}
                active={searchType === tab.key}
                onClick={() => handleTabChange(tab.key)}
              >
                {tab.label}
              </SearchTab>
            ))}
          </SearchTabs>
          <SearchResults>
            {searchLoading ? (
              <MiniLoadingSpinner />
            ) : (
              <>
                {searchType === 'anime' && (
                  searchResults.anime && searchResults.anime.length > 0
                    ? searchResults.anime.map(anime => (
                      <SearchResultItem key={anime.id} onClick={() => handleNavigateToAnime(anime)}>
                        <SearchResultImage src={anime.images.webp.image_url || anime.images.jpg.image_url || anime.images.jpg.large_image_url || anime.images.jpg.largeImageUrl || anime.images.jpg.imageUrl || anime.images.jpg.image_url || '/images/placeholder.jpg'}
                          alt={anime.titles.english || anime.titles.romaji || anime.titles.japanese || anime.titles.default || anime.title}
                          type="anime" />
                        <SearchResultContent>
                          <SearchResultTitle>{anime.titles.english || anime.titles.romaji || anime.titles.japanese || anime.titles.default || anime.title}</SearchResultTitle>
                          <SearchResultSubtitle>{anime.type} {anime.year && `, ${anime.year}`}</SearchResultSubtitle>
                        </SearchResultContent>
                      </SearchResultItem>
                    ))
                    : <div>No anime found</div>
                )}
                {searchType === 'users' && (
                  searchResults.users && searchResults.users.length > 0
                    ? searchResults.users.map(user => (
                      <SearchResultItem key={user.id} onClick={() => handleNavigateToUser(user)}>
                        <SearchResultImage src={user.avatarUrl || '/images/default-avatar.png'} alt={user.username} type="user" />
                        <SearchResultContent>
                          <SearchResultTitle>{user.username}</SearchResultTitle>
                          <SearchResultSubtitle>{user.followersCount || 0} followers</SearchResultSubtitle>
                        </SearchResultContent>
                      </SearchResultItem>
                    ))
                    : <div>No users found</div>
                )}
                {searchType === 'playlists' && (
                  searchResults.playlists && searchResults.playlists.length > 0
                    ? searchResults.playlists.map(playlist => (
                      <SearchResultItem key={playlist.id} onClick={() => handleNavigateToPlaylist(playlist)}>
                        <SearchResultImage src={playlist.coverImage || playlist.coverImages?.[0] || '/images/placeholder.jpg'} alt={playlist.name} type="playlist" />
                        <SearchResultContent>
                          <SearchResultTitle>{playlist.name}</SearchResultTitle>
                          <SearchResultSubtitle>By {playlist.owner?.username || 'Anonymous'}</SearchResultSubtitle>
                          <SearchResultSubtitle>{playlist.animeCount || 0} anime</SearchResultSubtitle>
                        </SearchResultContent>
                      </SearchResultItem>
                    ))
                    : <div>No playlists found</div>
                )}
              </>
            )}
          </SearchResults>
        </SearchDropdown>
      </SearchBarContainer>
    </PageHeader>
  );
};

export default React.memo(ExplorePageHeader); 