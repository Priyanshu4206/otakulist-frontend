import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import exploreAPI from '../../services/modules/exploreAPI';
import RecommendationCard from '../anime/RecommendationCard';
import ShimmerCard from '../common/ShimmerCard';
import Pagination from '../common/Pagination';

const SectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const AnimeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 1rem;
  }
`;

const ErrorMessage = styled.div`
  color: var(--danger);
  padding: 1rem;
  text-align: center;
  background: rgba(var(--danger-rgb), 0.1);
  border-radius: 8px;
  margin: 1rem 0;
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(var(--cardBackground-rgb), 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(3px);
  
  &::after {
    content: '';
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: 3px solid var(--borderColor);
    border-top-color: var(--primary);
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ItemsPerPageSelector = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  
  select {
    margin-left: 0.5rem;
    padding: 0.5rem;
    border-radius: 6px;
    border: 1px solid rgba(var(--borderColor-rgb), 0.5);
    background: var(--cardBackground);
    color: var(--textPrimary);
    font-size: 0.9rem;
    cursor: pointer;
    
    &:focus {
      outline: none;
      border-color: var(--primary);
    }
  }
`;

const ITEMS_PER_PAGE_OPTIONS = [12, 24, 36, 48];
const DEFAULT_ITEMS_PER_PAGE = 24;
const DEFAULT_PAGE = 1;

const TopRatedSection = () => {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: DEFAULT_PAGE,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: DEFAULT_ITEMS_PER_PAGE
  });

  const fetchAnimeData = async (page = DEFAULT_PAGE, limit = DEFAULT_ITEMS_PER_PAGE) => {
    if (page === pagination.currentPage && limit === pagination.itemsPerPage && animeList.length > 0) {
      return; // No need to fetch again if page and limit are the same
    }
    
    // Use pageLoading for subsequent page loads to show overlay instead of skeleton loader
    if (page !== DEFAULT_PAGE) {
      setPageLoading(true);
    } else {
      setLoading(true);
    }
    
    try {
      const response = await exploreAPI.getTopRatedAnime({ 
        page: page,
        limit: limit,
        sort: 'score' 
      });
      
      console.log('Top Rated API response:', response);
      
      if (response.success && response.data) {
        let animeData = [];
        let totalItems = 0;
        let totalPages = 1;
        
        // Handle different response structures
        if (Array.isArray(response.data)) {
          animeData = response.data;
          totalItems = response.pagination?.total || animeData.length;
          totalPages = response.pagination?.pages || Math.ceil(totalItems / limit);
        } else if (response.data.anime) {
          animeData = response.data.anime;
          totalItems = response.data.pagination?.total || animeData.length;
          totalPages = response.data.pagination?.pages || Math.ceil(totalItems / limit);
        } else if (response.data.items) {
          animeData = response.data.items;
          totalItems = response.data.pagination?.total || animeData.length;
          totalPages = response.data.pagination?.pages || Math.ceil(totalItems / limit);
        } else {
          console.error('Unexpected response structure:', response.data);
          setError('Failed to process anime data');
        }
        
        setAnimeList(animeData);
        setPagination({
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalItems,
          itemsPerPage: limit
        });
      } else {
        setError('Failed to load top rated anime');
      }
    } catch (error) {
      console.error('Error fetching top rated anime:', error);
      setError('Error loading top rated anime. Please try again later.');
      setAnimeList([]);
    } finally {
      setLoading(false);
      setPageLoading(false);
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    fetchAnimeData();
  }, []);
  
  // Handle page change
  const handlePageChange = (page) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchAnimeData(page, pagination.itemsPerPage);
  };
  
  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value);
    fetchAnimeData(1, newItemsPerPage);
  };

  if (loading) {
    return (
      <SectionContainer>
        <AnimeGrid>
          {Array(pagination.itemsPerPage).fill(0).map((_, idx) => (
            <ShimmerCard key={idx} type="anime" />
          ))}
        </AnimeGrid>
      </SectionContainer>
    );
  }
  
  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }
  
  if (!animeList || animeList.length === 0) {
    return <ErrorMessage>No top rated anime found.</ErrorMessage>;
  }

  return (
    <SectionContainer>
      {pageLoading && <LoadingOverlay />}
      
      <ItemsPerPageSelector>
        <span>Items per page:</span>
        <select 
          value={pagination.itemsPerPage} 
          onChange={handleItemsPerPageChange}
          disabled={pageLoading}
        >
          {ITEMS_PER_PAGE_OPTIONS.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </ItemsPerPageSelector>
      
      <AnimeGrid>
        {animeList.map(anime => (
          <RecommendationCard 
            key={anime._id || anime.id || anime.malId} 
            anime={anime} 
          />
        ))}
      </AnimeGrid>
      
      <Pagination 
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
        siblingCount={1}
        showFirstLast={true}
        showInfo={true}
      />
    </SectionContainer>
  );
};

export default TopRatedSection; 