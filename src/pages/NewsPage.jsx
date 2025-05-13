import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import { newsAPI } from '../services/api';
import useApiCache from '../hooks/useApiCache';

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
  text-align: center;
  padding: 4rem 2rem;
  color: var(--textSecondary);
  
  h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: var(--textPrimary);
  }
  
  p {
    font-size: 1rem;
    max-width: 500px;
    margin: 0 auto;
    line-height: 1.6;
  }
`;

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

// Get all available categories
const allCategories = Object.keys(categoryEmojis);

// Format date for display
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  // Use API cache with 3-hour expiry
  const { fetchWithCache } = useApiCache('localStorage', 3 * 60 * 60 * 1000);
  
  // Debounce search input
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    
    return () => clearTimeout(timerId);
  }, [searchQuery]);
  
  // Fetch news data
  const fetchNews = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Create a cache key based on filters
      const filters = [
        `page=${currentPage}`,
        selectedCategory && `category=${selectedCategory}`,
        debouncedQuery && `search=${debouncedQuery}`
      ].filter(Boolean).join('_');
      
      const cacheKey = `news_${filters || 'all'}`;
      
      // Use the fetchWithCache to get data
      const fetchData = async () => {
        if (selectedCategory) {
          return await newsAPI.getNewsByCategory(selectedCategory, currentPage);
        } else {
          return await newsAPI.getNews(currentPage);
        }
      };
      
      // Get response from cache or API
      const response = await fetchWithCache(cacheKey, fetchData);
      
      if (response && response.success && response.data) {
        setNews(response.data);
        
        // Set pagination data
        if (response.pagination) {
          setTotalPages(response.pagination.pages || 1);
        }
      } else if (response && Array.isArray(response)) {
        setNews(response);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, selectedCategory, debouncedQuery, fetchWithCache]);
  
  // Load news when filters change
  useEffect(() => {
    fetchNews();
  }, [fetchNews]);
  
  // Handle category filter click
  const handleCategoryClick = (category) => {
    // Toggle category if clicked again
    setSelectedCategory(prevCategory => 
      prevCategory === category ? '' : category
    );
    setCurrentPage(1); // Reset to first page
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
  
  // Filter news by search query (client-side for better UX)
  const filteredNews = debouncedQuery 
    ? news.filter(item => 
        item.title?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        item.content?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        item.summary?.toLowerCase().includes(debouncedQuery.toLowerCase())
      )
    : news;
  
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
  const renderEmptyState = () => (
    <EmptyState>
      <h3>No news found</h3>
      <p>
        {selectedCategory 
          ? `No news articles found in the "${selectedCategory}" category.` 
          : debouncedQuery 
          ? `No results matching "${debouncedQuery}".`
          : "No news articles available at this time."}
      </p>
    </EmptyState>
  );
  
  return (
    <Layout>
      <PageContainer
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <PageTitle>News Feed</PageTitle>
        
        <FilterBar>
          <CategoryFilters>
            {allCategories.map(category => (
              <CategoryButton
                key={category}
                active={selectedCategory === category}
                onClick={() => handleCategoryClick(category)}
              >
                {categoryEmojis[category]} {category}
              </CategoryButton>
            ))}
          </CategoryFilters>
          
          <SearchInput
            type="text"
            placeholder="Search news..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </FilterBar>
        
        {isLoading ? (
          <LoadingContainer>
            <Spinner />
          </LoadingContainer>
        ) : filteredNews.length > 0 ? (
          <>
            <NewsGrid>
              {filteredNews.map(item => (
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

export default NewsPage; 