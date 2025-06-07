import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { searchAPI } from '../services/modules';
import Layout from '../components/layout/Layout';
import { useDebounce, useAuth } from '../hooks';
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
import LoginPrompt from '../components/common/LoginPrompt';

// Main Layout
const MainWrapper = styled.div`
  padding: 2rem;

  @media (max-width: 1024px) {
    padding: 1rem;
  }
`;

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
  width: 100%;
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

// Content wrapper for consistent styling across all sections
const SectionWrapper = ({ children }) => (
  <div style={{ width: '100%', marginBottom: '1rem' }}>
    {children}
  </div>
);

// Memoized content components
const MemoizedGenreSectionList = React.memo(GenreSectionList);
const MemoizedForYouSection = React.memo(ForYouSection);
const MemoizedTopRatedSection = React.memo(TopRatedSection);
const MemoizedSeasonPreviewSection = React.memo(SeasonPreviewSection);
const MemoizedTrendingPlaylistsMainSection = React.memo(TrendingPlaylistsMainSection);
const MemoizedTrendingPlaylistsSection = React.memo(TrendingPlaylistsSection);
const MemoizedPeopleToFollowSection = React.memo(PeopleToFollowSection);
const MemoizedEventBanner = React.memo(EventBanner);

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
  
  const { user } = useAuth();
  const isAuthenticated = !!user;

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
    if (debouncedSearchValue.length < 2) {
      setSearchResults({
        anime: [],
        users: [],
        playlists: []
      });
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    const fetchSearchResults = async () => {
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

  // Memoized left section content based on active tab
  const leftSectionContent = useMemo(() => {
    switch (activeTab) {
      case 'for-you':
        if (!user) {
          return (
            <SectionWrapper>
              <LoginPrompt 
                message="Login to see personalized anime recommendations"
                subtext="We'll recommend anime based on your preferences and watch history"
              />
            </SectionWrapper>
          );
        }
        return <SectionWrapper><MemoizedForYouSection /></SectionWrapper>;
      case 'top-rated':
        return <SectionWrapper><MemoizedTopRatedSection /></SectionWrapper>;
      case 'season-preview':
        return <SectionWrapper><MemoizedSeasonPreviewSection /></SectionWrapper>;
      case 'trending-playlists':
        return (
          <SectionWrapper>
            <MemoizedTrendingPlaylistsMainSection layout="grid" limit={12} />
          </SectionWrapper>
        );
      case 'genres':
      default:
        return <SectionWrapper><MemoizedGenreSectionList /></SectionWrapper>;
    }
  }, [activeTab, user]);

  // Memoized right section content based on authentication state
  const rightSectionContent = useMemo(() => {
    return (
      <>
        <MemoizedTrendingPlaylistsSection />
        {isAuthenticated ? (
          <MemoizedPeopleToFollowSection />
        ) : (
          <LoginPrompt 
            title="Find Users to Follow" 
            message="Log in to discover and connect with other anime enthusiasts on the platform." 
          />
        )}
      </>
    );
  }, [isAuthenticated]);

  // Memoized header props to prevent unnecessary re-renders
  const headerProps = useMemo(() => ({
    searchValue,
    setSearchValue,
    searchType,
    setSearchType,
    searchResults,
    searchVisible,
    setSearchVisible,
    searchLoading
  }), [searchValue, searchType, searchResults, searchVisible, searchLoading]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  return (
    <Layout>
      <MainWrapper>
        <ExplorePageHeader
          searchRef={searchRef}
          {...headerProps}
        />
        <ExploreTopNav activeTab={activeTab} onTabChange={handleTabChange} />
        <MainLayout>
          <LeftSection>
            {leftSectionContent}
          </LeftSection>
          <RightSection>
            {rightSectionContent}
          </RightSection>
        </MainLayout>
        <MemoizedEventBanner />
      </MainWrapper>
    </Layout>
  );
};

export default ExplorePage; 