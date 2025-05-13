import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { newsAPI } from '../../services/api';
import useApiCache from '../../hooks/useApiCache';

const Section = styled.section`
  width: 100%;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--textPrimary);
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 60px;
    height: 3px;
    background: var(--gradientPrimary);
    border-radius: 2px;
  }
`;

const ViewMoreButton = styled(Link)`
  font-size: 0.85rem;
  color: var(--primary);
  display: flex;
  align-items: center;
  text-decoration: none;
  transition: opacity 0.2s;
  font-weight: 500;
  
  &:hover {
    opacity: 0.8;
  }
  
  &::after {
    content: '→';
    margin-left: 4px;
    transition: transform 0.2s;
  }
  
  &:hover::after {
    transform: translateX(2px);
  }
`;

const RefreshButton = styled.button`
  font-size: 0.85rem;
  color: var(--primary);
  display: flex;
  align-items: center;
  background: none;
  border: none;
  margin-right: 1rem;
  cursor: pointer;
  transition: opacity 0.2s;
  font-weight: 500;
  
  &:hover {
    opacity: 0.8;
  }
  
  svg {
    margin-right: 5px;
  }
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const NewsCard = styled.div`
  border-radius: 8px;
  padding: 0.8rem;
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  cursor: pointer;
  transition: transform 0.2s;
  animation: fadeInCard 0.5s cubic-bezier(0.23, 1, 0.32, 1);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0,0,0,0.07);
  }
  
  @keyframes fadeInCard {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const NewsImage = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 6px;
  background: var(--backgroundLight);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: var(--textPrimary);
  font-weight: 700;
  overflow: hidden;
  flex-shrink: 0;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const NewsContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const NewsTitle = styled.div`
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--accentLight);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.35;
`;

const NewsSubtitle = styled.div`
  font-size: 0.85rem;
  color: var(--textPrimary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const MetaInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.2rem;
  font-size: 0.75rem;
  color: var(--textSecondary);
`;

const SourceTag = styled.div`
  display: flex;
  align-items: center;
`;

const DateTag = styled.div`
  font-style: normal;
`;

const CategoryChip = styled.span`
  font-size: 0.7rem;
  padding: 1px 5px;
  border-radius: 3px;
  background-color: rgba(var(--primary-rgb), 0.1);
  color: var(--primary);
  margin-right: 0.5rem;
  white-space: nowrap;
`;

const LoadingSpinner = styled.div`
  width: 24px;
  height: 24px;
  border: 2px solid rgba(var(--primary-rgb), 0.2);
  border-top: 2px solid var(--primary);
  border-radius: 50%;
  margin: 1.5rem auto;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  text-align: center;
`;

const EmptyStateImage = styled.div`
  width: 120px;
  height: 120px;
  margin-bottom: 1rem;
  font-size: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--textSecondary);
`;

const EmptyStateText = styled.p`
  font-size: 0.95rem;
  color: var(--textSecondary);
  margin-bottom: 1rem;
`;

const EmptyStateButton = styled.button`
  background-color: var(--primary);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.6rem 1.2rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  
  &:hover {
    background-color: var(--primaryDark);
  }
  
  svg {
    margin-right: 6px;
  }
`;

// Category emojis for visual representation
const categoryEmojis = {
  'Anime': '🎭',
  'Manga': '📚',
  'Industry': '🏢',
  'Games': '🎮',
  'Music': '🎵',
  'Events': '🎪',
  'Netflix': '📺',
  'Crunchyroll': '🧡',
  'Funimation': '💜',
};

// Format the date/time for display
const formatDateTime = (dateString) => {
  if (!dateString) return 'Recently';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else {
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
};

// Get emoji for category display
const getCategoryEmoji = (categories) => {
  if (!categories || categories.length === 0) return '📰';
  const category = categories[0];
  return categoryEmojis[category] || '📰';
};

// RefreshIcon component
const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 2L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const WhatsPoppinSection = () => {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Use API cache with 3-hour expiry
  const { fetchWithCache, clearCacheItem } = useApiCache('localStorage', 3 * 60 * 60 * 1000);
  
  // Fetch news data
  const fetchNews = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    
    try {
      // Create a cache key
      const cacheKey = 'home_latest_news';
      
      // If force refreshing, clear the cache item first
      if (forceRefresh) {
        clearCacheItem(cacheKey);
      }
      
      // Use the fetchWithCache to get data
      const fetchData = async () => {
        return await newsAPI.getLatestNews(5);
      };
      
      // Get response from cache or API
      const response = await fetchWithCache(cacheKey, fetchData, forceRefresh);
      
      let newsData = [];
      if (response && response.data && Array.isArray(response.data)) {
        newsData = response.data;
      } else if (response && Array.isArray(response)) {
        newsData = response;
      }
      
      setNews(newsData);
    } catch (error) {
      console.error('Error fetching news:', error);
      setNews([]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchWithCache, clearCacheItem]);
  
  // Handle refresh button click
  const handleRefresh = () => {
    fetchNews(true);
  };
  
  // Load news on component mount
  useEffect(() => {
    fetchNews();
  }, [fetchNews]);
  
  // Handle clicking on a news item
  const handleNewsClick = useCallback((url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }, []);
  
  // Show loading state
  if (isLoading) {
    return (
      <Section>
        <SectionHeader>
          <Title>What's poppin'</Title>
        </SectionHeader>
        <LoadingSpinner />
      </Section>
    );
  }
  
  // Show empty state
  if (!news || news.length === 0) {
    return (
      <Section>
        <SectionHeader>
          <Title>What's poppin'</Title>
        </SectionHeader>
        <EmptyStateContainer>
          <EmptyStateImage>📰</EmptyStateImage>
          <EmptyStateText>No news currently available</EmptyStateText>
          <EmptyStateButton onClick={handleRefresh}>
            <RefreshIcon /> Refresh Feed
          </EmptyStateButton>
        </EmptyStateContainer>
      </Section>
    );
  }
  
  return (
    <Section>
      <SectionHeader>
        <Title>What's poppin'</Title>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <RefreshButton onClick={handleRefresh}>
            <RefreshIcon /> Refresh
          </RefreshButton>
          <ViewMoreButton to="/news">View more</ViewMoreButton>
        </div>
      </SectionHeader>
      <List>
        {news.map(item => (
          <NewsCard key={item._id} onClick={() => handleNewsClick(item.url)}>
            <NewsImage>
              {item.imageUrl ? 
                <img src={item.imageUrl} alt={item.title} /> : 
                getCategoryEmoji(item.categories)
              }
            </NewsImage>
            <NewsContent>
              <NewsTitle>{item.title}</NewsTitle>
              <NewsSubtitle>{item.summary || item.content}</NewsSubtitle>
              <MetaInfo>
                <SourceTag>
                  {item.categories && item.categories.length > 0 && (
                    <CategoryChip>{item.categories[0]}</CategoryChip>
                  )}
                  {item.source}
                </SourceTag>
                <DateTag>{formatDateTime(item.publishedAt || item.createdAt)}</DateTag>
              </MetaInfo>
            </NewsContent>
          </NewsCard>
        ))}
      </List>
    </Section>
  );
};

export default WhatsPoppinSection; 