import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import { newsAPI } from '../services/api';
import { fetchWithETagAndCache } from '../services/conditionalFetch';
import { X, Search, Globe } from 'lucide-react';

// Styled components
const PageContainer = styled(motion.div)`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: var(--textPrimary);
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    font-size: 1.7rem;
  }
`;

const FilterBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const FilterSection = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const CategoryFilters = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const CategoryButton = styled.button`
  background-color: ${({ active }) => active ? 'var(--primary)' : 'rgba(var(--primary-rgb), 0.1)'};
  color: ${({ active }) => active ? 'white' : 'var(--primary)'};
  border: none;
  border-radius: 20px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${({ active }) => active ? 'var(--primary)' : 'rgba(var(--primary-rgb), 0.2)'};
  }
`;

const SearchInput = styled.input`
  padding: 0.7rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--borderColor);
  background-color: var(--backgroundLight);
  color: var(--textPrimary);
  width: 300px;
  font-size: 0.95rem;
  
  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.2);
  }
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const NewsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const NewsCard = styled(motion.div)`
  background-color: var(--cardBackground);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  transition: transform 0.3s, box-shadow 0.3s;
  height: 100%;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.12);
  }
`;

const NewsImage = styled.div`
  height: 180px;
  background-color: var(--backgroundLight);
  position: relative;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .category-label {
    position: absolute;
    bottom: 0;
    right: 0;
    background-color: rgba(var(--primary-rgb), 0.9);
    color: white;
    padding: 4px 10px;
    font-size: 0.8rem;
    border-top-left-radius: 8px;
  }
  
  .placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-size: 3rem;
  }
`;

const NewsContent = styled.div`
  padding: 1.2rem;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const NewsTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--textPrimary);
  margin-bottom: 0.8rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const NewsSummary = styled.p`
  color: var(--textSecondary);
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
`;

const NewsFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: var(--textSecondary);
  margin-top: auto;
  padding-top: 0.8rem;
  border-top: 1px solid rgba(var(--borderColor-rgb), 0.2);
`;

const NewsSource = styled.span``;

const NewsDate = styled.span`
  font-style: italic;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 3rem;
  flex-wrap: wrap;
`;

const PaginationButton = styled.button`
  padding: 0.6rem 1rem;
  border-radius: 6px;
  background-color: ${({ active }) => active ? 'var(--primary)' : 'var(--backgroundLight)'};
  color: ${({ active }) => active ? 'white' : 'var(--textPrimary)'};
  border: 1px solid ${({ active }) => active ? 'var(--primary)' : 'var(--borderColor)'};
  cursor: pointer;
  transition: all 0.2s;
  min-width: 40px;
  
  &:hover:not(:disabled) {
    background-color: ${({ active }) => active ? 'var(--primaryDark)' : 'rgba(var(--primary-rgb), 0.1)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem 0;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid rgba(var(--primary-rgb), 0.2);
  border-top: 4px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  min-height: 300px;
`;

const EmptyStateImage = styled.div`
  width: 150px;
  height: 150px;
  margin-bottom: 1.5rem;
  font-size: 5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--textSecondary);
`;

const EmptyStateTitle = styled.h3`
  font-size: 1.25rem;
  color: var(--textPrimary);
  margin-bottom: 0.8rem;
`;

const EmptyStateText = styled.p`
  font-size: 1rem;
  color: var(--textSecondary);
  margin-bottom: 1.5rem;
  max-width: 500px;
`;

const RefreshButton = styled.button`
  background-color: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  
  &:hover {
    background-color: var(--primaryDark);
  }
  
  svg {
    margin-right: 8px;
  }
`;

const RefreshBarContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
`;

const SmallRefreshButton = styled.button`
  background-color: rgba(var(--primary-rgb), 0.1);
  color: var(--primary);
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.2s;
  
  &:hover {
    background-color: rgba(var(--primary-rgb), 0.2);
  }
  
  svg {
    margin-right: 6px;
  }
`;

const SourceSelector = styled.select`
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid var(--borderColor);
  background-color: var(--backgroundLight);
  color: var(--textPrimary);
  font-size: 0.9rem;
  cursor: pointer;
  min-width: 120px;
  
  &:focus {
    outline: none;
    border-color: var(--primary);
  }
`;

const CacheStatus = styled.div`
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--textSecondary);
  margin-left: auto;
  
  .indicator {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: ${props => props.isCached ? 'var(--success)' : 'var(--primary)'};
  }
`;

// RefreshIcon component
const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 2L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
};

// Define constants
const NEWS_PER_PAGE = 20;
const DEFAULT_CACHE_KEY = 'news_all_all_1_none';

// Category emojis for visual representation
const categoryEmojis = {
  'Anime': '📺',
  'Manga': '📚',
  'Games': '🎮',
  'People': '👤',
  'Music': '🎵',
  'Events': '🎫',
  'Novels': '📖',
  'Korean': '🇰🇷',
  'Live-Action': '🎬'
};

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSource, setSelectedSource] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState(Object.keys(categoryEmojis)); // Default to hardcoded categories
  const [sources, setSources] = useState([]);
  const [isFromCache, setIsFromCache] = useState(false);
  
  // Debounce search query to reduce API calls
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await newsAPI.getNewsCategories();
        if (response && response.success && response.data) {
          setCategories(response.data);
        } else if (response && Array.isArray(response)) {
          setCategories(response);
        }
      } catch (error) {
        console.error('Error fetching news categories:', error);
        // Fallback to hardcoded categories
      }
    };
    
    fetchCategories();
  }, []);
  
  // Fetch sources from API
  useEffect(() => {
    const fetchSources = async () => {
      try {
        const response = await newsAPI.getNewsSources();
        if (response && response.success && response.data) {
          setSources(response.data);
        } else if (response && Array.isArray(response)) {
          setSources(response);
        }
      } catch (error) {
        console.error('Error fetching news sources:', error);
        // Fallback to empty sources array
      }
    };
    
    fetchSources();
  }, []);
  
  // Generate cache key based on current filters
  const generateCacheKey = useCallback(() => {
    return `news_${selectedCategory || 'all'}_${selectedSource || 'all'}_${currentPage}_${debouncedQuery || 'none'}`;
  }, [selectedCategory, selectedSource, currentPage, debouncedQuery]);
  
  // Generate ETag key based on current filters
  const generateEtagKey = useCallback(() => {
    return `news_etag_${selectedCategory || 'all'}_${selectedSource || 'all'}_${debouncedQuery || 'none'}`;
  }, [selectedCategory, selectedSource, debouncedQuery]);
  
  // Fetch news data
  const fetchNews = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    setIsFromCache(false);
    
    try {
      // Create a cache key based on filters
      const cacheKey = generateCacheKey();
      const etagKey = generateEtagKey();
      
      // Build query options object
      const options = {
        page: currentPage,
        limit: NEWS_PER_PAGE
      };
      
      // Add optional filters if present
      if (selectedCategory) options.category = selectedCategory;
      if (selectedSource) options.source = selectedSource;
      if (debouncedQuery) options.search = debouncedQuery;
      
      // If force refreshing, use API directly with cache-control header
      if (forceRefresh) {
        const response = await newsAPI.getNews({
          ...options,
          headers: { 'Cache-Control': 'no-cache' }
        });
        
        processNewsResponse(response);
        return;
      }
      
      // Create wrapper functions for cache
      const getCachedData = () => {
        const cachedItem = sessionStorage.getItem(cacheKey);
        if (!cachedItem) return null;
        
        try {
          const { data } = JSON.parse(cachedItem);
          if (data) {
            setIsFromCache(true);
            return data;
          }
          return null;
        } catch (e) {
          return null;
        }
      };
      
      const setCachedData = (data) => {
        if (!data) return;
        
        const cacheObject = {
          data,
          timestamp: Date.now()
        };
        
        sessionStorage.setItem(cacheKey, JSON.stringify(cacheObject));
      };
      
      // Use the fetchWithETagAndCache utility
      const response = await fetchWithETagAndCache(
        '/news',
        etagKey,
        getCachedData,
        setCachedData,
        { params: options }
      );
      
      processNewsResponse(response);
    } catch (error) {
      console.error('Error fetching news:', error);
      setNews([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, selectedCategory, selectedSource, debouncedQuery, generateCacheKey, generateEtagKey]);
  
  // Helper function to process news response
  const processNewsResponse = (response) => {
    if (response && response.data && Array.isArray(response.data.items)) {
      // Standard API response format with data property
      setNews(response.data.items);
      
      // Set pagination data
      if (response.data.pagination) {
        setTotalPages(response.data.pagination.pages || Math.ceil(response.data.pagination.total / response.data.pagination.limit) || 1);
      }
    } else if (response && Array.isArray(response)) {
      // Direct array response
      setNews(response);
      // For array responses, assume we have only one page if no pagination info
      setTotalPages(1);
    } else if (response && response.success && response.data) {
      // Success wrapper format
      setNews(Array.isArray(response.data) ? response.data : []);
      
      // Handle pagination if available
      if (response.pagination) {
        setTotalPages(response.pagination.pages || Math.ceil(response.pagination.total / response.pagination.limit) || 1);
      }
    } else {
      // Fallback for unexpected formats
      setNews([]);
      setTotalPages(1);
    }
  };
  
  // Load news when filters change
  useEffect(() => {
    fetchNews();
  }, [fetchNews]);
  
  // Clear cache when user changes category or search
  useEffect(() => {
    // When category or search changes, reset to page 1
    setCurrentPage(1);
  }, [selectedCategory, debouncedQuery]);
  
  // Handle category filter click
  const handleCategoryClick = (category) => {
    // Toggle category if clicked again
    setSelectedCategory(prevCategory => 
      prevCategory === category ? '' : category
    );
  };
  
  // Handle source selector change
  const handleSourceChange = (e) => {
    setSelectedSource(e.target.value);
    setCurrentPage(1);
  };
  
  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Handle news click to open URL
  const handleNewsClick = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };
  
  // Handle refresh button click
  const handleRefresh = () => {
    fetchNews(true);
  };
  
  // Generate pagination buttons
  const renderPagination = () => {
    const buttons = [];
    
    // Previous button
    buttons.push(
      <PaginationButton 
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        &lt;
      </PaginationButton>
    );
    
    // Page buttons
    const maxButtonsToShow = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxButtonsToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxButtonsToShow - 1);
    
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <PaginationButton
          key={i}
          active={i === currentPage}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </PaginationButton>
      );
    }
    
    // Next button
    buttons.push(
      <PaginationButton
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        &gt;
      </PaginationButton>
    );
    
    return buttons;
  };
  
  // Show empty state when no results
  const renderEmptyState = () => {
    let message = "No news articles available at this time.";
    let icon = "📰";
    
    if (selectedCategory) {
      message = `No news articles found in the "${selectedCategory}" category.`;
      icon = categoryEmojis[selectedCategory] || "📰";
    } else if (debouncedQuery) {
      message = `No results matching "${debouncedQuery}".`;
      icon = "🔍";
    }
    
    return (
      <EmptyState>
        <EmptyStateImage>{icon}</EmptyStateImage>
        <EmptyStateTitle>No News Found</EmptyStateTitle>
        <EmptyStateText>{message}</EmptyStateText>
        <RefreshButton onClick={handleRefresh}>
          <RefreshIcon /> Refresh Feed
        </RefreshButton>
      </EmptyState>
    );
  };
  
  return (
    <Layout>
      <PageContainer
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <PageTitle>News Feed</PageTitle>
        
        <FilterBar>
          <FilterSection>
            <CategoryFilters>
              {categories.map(category => (
                <CategoryButton
                  key={category}
                  active={selectedCategory === category}
                  onClick={() => handleCategoryClick(category)}
                >
                  {categoryEmojis[category] || '📰'} {category}
                </CategoryButton>
              ))}
            </CategoryFilters>
          </FilterSection>
          
          <FilterSection>
            <SourceSelector value={selectedSource} onChange={handleSourceChange}>
              <option value="">All Sources</option>
              {sources.map(source => (
                <option key={source.name || source} value={source.name || source}>
                  {source.name || source}
                </option>
              ))}
            </SourceSelector>
            
            <SearchInput
              type="text"
              placeholder="Search news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </FilterSection>
        </FilterBar>
        
        {isLoading ? (
          <LoadingContainer>
            <Spinner />
          </LoadingContainer>
        ) : news.length > 0 ? (
          <>
            <RefreshBarContainer>
              <CacheStatus isCached={isFromCache}>
                <span className="indicator"></span>
                {isFromCache ? 'Showing cached results' : 'Showing fresh results'}
              </CacheStatus>
              <SmallRefreshButton onClick={handleRefresh}>
                <RefreshIcon /> Refresh News
              </SmallRefreshButton>
            </RefreshBarContainer>
            
            <NewsGrid>
              {news.map(item => (
                <NewsCard
                  key={item._id}
                  variants={cardVariants}
                  onClick={() => handleNewsClick(item.url)}
                >
                  <NewsImage>
                    {item.imageUrl ? (
                      <>
                        <img src={item.imageUrl} alt={item.title} />
                        {item.categories && item.categories.length > 0 && (
                          <div className="category-label">{item.categories[0]}</div>
                        )}
                      </>
                    ) : (
                      <div className="placeholder">
                        {getCategoryEmoji(item.categories)}
                      </div>
                    )}
                  </NewsImage>
                  <NewsContent>
                    <NewsTitle>{item.title}</NewsTitle>
                    <NewsSummary>{item.summary || item.content}</NewsSummary>
                    <NewsFooter>
                      <NewsSource>{item.source}</NewsSource>
                      <NewsDate>{formatDate(item.publishedAt)}</NewsDate>
                    </NewsFooter>
                  </NewsContent>
                </NewsCard>
              ))}
            </NewsGrid>
            
            <PaginationContainer>
              {renderPagination()}
            </PaginationContainer>
          </>
        ) : (
          renderEmptyState()
        )}
      </PageContainer>
    </Layout>
  );
};

// Helper function to get category emoji
const getCategoryEmoji = (categories) => {
  if (!categories || categories.length === 0) return '📰';
  return categoryEmojis[categories[0]] || '📰';
};

// Format date for display
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

export default NewsPage; 