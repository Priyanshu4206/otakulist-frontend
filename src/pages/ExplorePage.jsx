import React, { useState, useEffect, useRef } from 'react';
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

const ExplorePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('trending');
  const debouncedSearchTerm = useDebounce(searchTerm, 800);
  const { user } = useAuth();
  const isAuthenticated = !!user;

  // Ref for clicking outside search dropdown
  const searchRef = useRef(null);

  // Handle click outside search dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearching(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Search functionality
  useEffect(() => {
    setIsSearching(true);
    const fetchSearchResults = async () => {
      if (debouncedSearchTerm.length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        const response = await searchAPI.searchAll({
          query: debouncedSearchTerm,
          limit: 15,
          useCache: true
        });

        if (response.success && response.data) {
          setSearchResults(response.data.anime || []);
          setIsSearching(false);
        }
      } catch (error) {
        console.error('Search error:', error);
      }
    };

    fetchSearchResults();
  }, [debouncedSearchTerm]);

  // Render left section content based on active tab
  const renderLeftSectionContent = (activeTab, user) => {
    
    // Content wrapper for consistent styling across all sections
    const SectionWrapper = ({ children }) => (
        <div style={{ width: '100%', marginBottom: '1rem' }}>
            {children}
        </div>
    );
    
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
            return <SectionWrapper><ForYouSection /></SectionWrapper>;
        case 'top-rated':
            return <SectionWrapper><TopRatedSection /></SectionWrapper>;
        case 'season':
            return <SectionWrapper><SeasonPreviewSection /></SectionWrapper>;
        case 'trending':
        default:
            return <SectionWrapper><TrendingPlaylistsMainSection /></SectionWrapper>;
    }
  };

  // Render right section content based on authentication state
  const renderRightSectionContent = () => {
    return (
      <>
        <TrendingPlaylistsSection />
        {isAuthenticated ? (
          <PeopleToFollowSection />
        ) : (
          <LoginPrompt 
            title="Find Users to Follow" 
            message="Log in to discover and connect with other anime enthusiasts on the platform." 
          />
        )}
      </>
    );
  };

  return (
    <Layout>
      <MainWrapper>
        <ExplorePageHeader
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchResults={searchResults}
          isSearching={isSearching}
        />
        <ExploreTopNav activeTab={activeTab} onTabChange={setActiveTab} />
        <MainLayout>
          <LeftSection>
            {renderLeftSectionContent(activeTab, user)}
          </LeftSection>
          <RightSection>
            {renderRightSectionContent()}
          </RightSection>
        </MainLayout>
        <EventBanner />
      </MainWrapper>
    </Layout>
  );
};

export default ExplorePage; 