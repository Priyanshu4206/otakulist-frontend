import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { RefreshCw, Rocket, Filter } from 'lucide-react';
import { userAPI } from '../../services/api';
import useToast from '../../hooks/useToast';
import AnimeCard from '../common/AnimeCard';

const PreviewContainer = styled.div`
  background: var(--bgSecondary);
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 1.5rem;
  height: fit-content;
  max-height: calc(100vh - 3rem);
  overflow-y: auto;
  
  @media (max-width: 1024px) {
    position: static;
    margin-top: 2rem;
  }
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(var(--primary-rgb), 0.3);
    border-radius: 2px;
  }
`;

const PreviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const Title = styled.h3`
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--textPrimary);
  
  svg {
    color: var(--primary);
  }
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  color: var(--primary);
  border: 1px solid var(--primary);
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(var(--primary-rgb), 0.1);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  svg {
    animation: ${props => props.loading ? 'spin 1s linear infinite' : 'none'};
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const AnimeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
`;

const EmptyState = styled.div`
  padding: 3rem 1rem;
  text-align: center;
  color: var(--textSecondary);
  background: var(--textSecondary);
  border-radius: 8px;
`;

const ActiveFilters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--borderColor);
`;

const FilterTag = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(var(--primary-rgb), 0.1);
  padding: 0.4rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  color: var(--primary);
  
  svg {
    color: var(--primary);
  }
`;

const PreviewNote = styled.div`
  margin-top: 1rem;
  padding: 0.75rem;
  background: rgba(var(--info-rgb), 0.1);
  border-left: 3px solid var(--info);
  border-radius: 4px;
  font-size: 0.875rem;
  color: var(--textSecondary);
`;

const LiveIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  font-size: 0.85rem;
  color: var(--textSecondary);
  
  &::before {
    content: '';
    display: block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--success);
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.6;
      transform: scale(1.1);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

const RecommendationPreview = ({ hasChanges, originalData, formData }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  
  // Fetch recommendations on initial load
  useEffect(() => {
    fetchRecommendations();
  }, []);
  
  // Get active filters to display
  const getActiveFilters = () => {
    const filters = [];
    
    // Add genres
    const genres = formData.preferences.animeGenres || [];
    if (genres.length > 0) {
      filters.push({
        id: 'genres',
        label: `${genres.length} Genres`,
        type: 'genres'
      });
    }
    
    // Add content ratings
    const ratings = formData.preferences.contentRatings || [];
    if (ratings.length > 0) {
      filters.push({
        id: 'ratings',
        label: `${ratings.length} Content Ratings`,
        type: 'ratings'
      });
    }
    
    // Add explicit preferences
    const explicitSettings = formData.preferences.explicitSettings;
    if (explicitSettings) {
      if (explicitSettings.preferSubbed) {
        filters.push({
          id: 'subbed',
          label: 'Subbed',
          type: 'language'
        });
      }
      
      if (explicitSettings.preferDubbed) {
        filters.push({
          id: 'dubbed',
          label: 'Dubbed',
          type: 'language'
        });
      }
      
      if (explicitSettings.seasonalPreferences && explicitSettings.seasonalPreferences.length > 0) {
        filters.push({
          id: 'seasons',
          label: `${explicitSettings.seasonalPreferences.length} Seasons`,
          type: 'seasons'
        });
      }
    }
    
    return filters;
  };
  
  // Fetch personalized recommendations based on current preferences
  const fetchRecommendations = async () => {
    setLoading(true);
    
    try {
      // Get current preferences for preview
      const response = await userAPI.getPersonalizedRecommendations({
        limit: 6,
        previewPreferences: formData.preferences
      });
      
      if (response.success) {
        setRecommendations(response.data || []);
      } else {
        console.error('Failed to fetch recommendations:', response.message);
        setRecommendations([]);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle refresh button click
  const handleRefresh = () => {
    fetchRecommendations();
  };
  
  // Get active filters
  const activeFilters = getActiveFilters();
  
  return (
    <PreviewContainer>
      <PreviewHeader>
        <Title>
          <Rocket size={20} />
          Recommendations
        </Title>
        <RefreshButton 
          onClick={handleRefresh} 
          disabled={loading}
          loading={loading}
        >
          <RefreshCw size={16} />
          {loading ? 'Updating...' : 'Refresh'}
        </RefreshButton>
      </PreviewHeader>
      
      {activeFilters.length > 0 && (
        <ActiveFilters>
          {activeFilters.map(filter => (
            <FilterTag key={filter.id}>
              <Filter size={14} />
              {filter.label}
            </FilterTag>
          ))}
        </ActiveFilters>
      )}
      
      {loading && recommendations.length === 0 ? (
        <EmptyState>Loading recommendations...</EmptyState>
      ) : recommendations.length > 0 ? (
        <AnimeGrid>
          {recommendations.map(anime => (
            <AnimeCard 
              key={anime.id}
              anime={anime}
              compact
            />
          ))}
        </AnimeGrid>
      ) : (
        <EmptyState>
          No recommendations found. Try adjusting your preferences or refreshing.
        </EmptyState>
      )}
      
      <LiveIndicator>Recommendations preview</LiveIndicator>
      
      <PreviewNote>
        After saving your preference changes, click the refresh button to see updated recommendations.
      </PreviewNote>
    </PreviewContainer>
  );
};

export default RecommendationPreview; 