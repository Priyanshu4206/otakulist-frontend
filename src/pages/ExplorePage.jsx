import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { searchAPI } from '../services/modules';
import Layout from '../components/layout/Layout';
import { useDebounce } from '../hooks';
import GenreSectionList from '../components/explore/GenreSectionList';
import TrendingPlaylistsSection from '../components/explore/TrendingPlaylistsSection';
import PeopleToFollowSection from '../components/explore/PeopleToFollowSection';
import EventBanner from '../components/explore/EventBanner';
import ExploreTopNav from '../components/explore/ExploreTopNav';
import ExplorePageHeader from '../components/explore/ExplorePageHeader';
import ForYouSection from '../components/explore/ForYouSection';
import TrendingPlaylistsMainSection from '../components/explore/TrendingPlaylistsMainSection';
import SeasonPreviewSection from '../components/explore/SeasonPreviewSection';
import TopRatedSection from '../components/explore/TopRatedSection';

// Main Layout
const MainLayout = styled.div`
  display: flex;
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  gap: 2rem;
  box-sizing: border-box;
  align-items: flex-start;
  
  @media (max-width: 1024px) {
    flex-direction: column;
    gap: 1.5rem;
  }
`;

const LeftSection = styled.div`
  flex: 1 1 0;
  min-width: 0;
  box-sizing: border-box;
`;

const RightSection = styled.div`
  width: 340px;
  flex-shrink: 0;
  min-width: 0;
  box-sizing: border-box;
  @media (max-width: 1024px) {
    width: 100%;
    margin-top: 1.5rem;
  }
`;

const ExplorePage = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState('genres');
  // Search state
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState({ anime: [], users: [], playlists: [] });
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchType, setSearchType] = useState('anime');
  const [searchLoading, setSearchLoading] = useState(false);
  const debouncedSearchValue = useDebounce(searchValue, 300);

  // Ref for clicking outside search dropdown
  const searchRef = useRef(null);

  // Handle click outside search dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Search functionality
  useEffect(() => {
    setSearchLoading(true);
    const fetchSearchResults = async () => {
      if (debouncedSearchValue.length < 2) {
        setSearchResults({
          anime: [],
          users: [],
          playlists: []
        });
        return;
      }

      try {
        const response = await searchAPI.searchAll({
          query: debouncedSearchValue,
          limit: 15,
          useCache: true
        });

        if (response.success && response.data) {
          setSearchResults({
            anime: response.data.anime || [],
            users: response.data.users || [],
            playlists: response.data.playlists || []
          });
          setSearchVisible(true);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setSearchLoading(false);
      }
    };

    fetchSearchResults();
  }, [debouncedSearchValue]);

  // Render left section content based on active tab
  const renderLeftSectionContent = () => {
    switch (activeTab) {
      case 'for-you':
        return <ForYouSection />;
      case 'trending-playlists':
        return <TrendingPlaylistsMainSection />;
      case 'season-preview':
        return <SeasonPreviewSection />;
      case 'top-rated':
        return <TopRatedSection />;
      case 'genres':
        return <GenreSectionList />;
      default:
        return <GenreSectionList />;
    }
  };

  return (
    <Layout>
      <div style={{ padding: '2rem' }}>
        <ExplorePageHeader
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          searchType={searchType}
          setSearchType={setSearchType}
          searchResults={searchResults}
          searchVisible={searchVisible}
          setSearchVisible={setSearchVisible}
          searchLoading={searchLoading}
        />
        <ExploreTopNav activeTab={activeTab} onTabChange={setActiveTab} />
        <MainLayout>
          <LeftSection>
            {renderLeftSectionContent()}
          </LeftSection>
          <RightSection>
            <TrendingPlaylistsSection />
            <PeopleToFollowSection />
          </RightSection>
        </MainLayout>
        <EventBanner />
      </div>
    </Layout>
  );
};

export default ExplorePage; 