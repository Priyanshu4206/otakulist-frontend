import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Star, ThumbsUp, Loader } from 'lucide-react';
import { animeAPI } from '../../services/api';
import useApiCache from '../../hooks/useApiCache';

const RecommendationsContainer = styled.div`
  margin: 1.5rem 0;
`;

const RecommendationsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const Title = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--textPrimary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const RecommendationsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.25rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
  }
`;

const AnimeCard = styled(Link)`
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  overflow: hidden;
  background-color: var(--cardBackground);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--borderColor);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  text-decoration: none;
  color: var(--textPrimary);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
`;

const AnimeCover = styled.div`
  position: relative;
  width: 100%;
  padding-top: 140%; /* Aspect ratio 10:14 */
  background-color: var(--backgroundLight);
  
  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
  
  &:hover img {
    transform: scale(1.05);
  }
`;

const AnimeInfo = styled.div`
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const AnimeTitle = styled.h4`
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  height: 2.8em;
  color: var(--textPrimary);
`;

const AnimeStats = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.75rem;
  color: var(--textSecondary);
  margin-top: auto;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  
  svg {
    color: ${props => props.hasScore ? 'var(--warning)' : 'var(--tertiary)'};
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  width: 100%;
  color: var(--textSecondary);
`;

const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--textSecondary);
  font-size: 0.875rem;
`;

const AnimeRecommendations = ({ animeId }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { fetchWithCache } = useApiCache('sessionStorage', 24 * 60 * 60 * 1000); // 24 hours
  
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!animeId) return;
      
      setLoading(true);
      
      try {
        const response = await fetchWithCache(
          `anime_recommendations_${animeId}`,
          () => animeAPI.getAnimeRecommendations(animeId)
        );
        
        if (response && response.success) {
          setRecommendations(response.data || []);
        } else {
          setError('Failed to load recommendations');
        }
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError('Failed to load recommendations');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendations();
  }, [animeId, fetchWithCache]);
  
  if (loading) {
    return (
      <RecommendationsContainer>
        <RecommendationsHeader>
          <Title>
            <ThumbsUp size={18} /> You May Also Like
          </Title>
        </RecommendationsHeader>
        <LoadingContainer>
          <LoadingIndicator>
            <Loader size={16} className="animate-spin" />
            Loading recommendations...
          </LoadingIndicator>
        </LoadingContainer>
      </RecommendationsContainer>
    );
  }
  
  if (error) {
    return (
      <RecommendationsContainer>
        <RecommendationsHeader>
          <Title>
            <ThumbsUp size={18} /> You May Also Like
          </Title>
        </RecommendationsHeader>
        <div style={{ padding: '1rem', color: 'var(--error)' }}>
          Error: {error}
        </div>
      </RecommendationsContainer>
    );
  }
  
  if (recommendations.length === 0) {
    return (
      <RecommendationsContainer>
        <RecommendationsHeader>
          <Title>
            <ThumbsUp size={18} /> You May Also Like
          </Title>
        </RecommendationsHeader>
        <div style={{ padding: '1rem', color: 'var(--textSecondary)' }}>
          No recommendations available.
        </div>
      </RecommendationsContainer>
    );
  }
  
  return (
    <RecommendationsContainer>
      <RecommendationsHeader>
        <Title>
          <ThumbsUp size={18} /> You May Also Like
        </Title>
      </RecommendationsHeader>
      
      <RecommendationsGrid>
        {recommendations.slice(0, 12).map((anime) => (
          <AnimeCard key={anime.id} to={`/anime/${anime.id}`}>
            <AnimeCover>
              <img 
                src={anime.image} 
                alt={anime.title}
                loading="lazy"
              />
            </AnimeCover>
            <AnimeInfo>
              <AnimeTitle title={anime.title}>
                {anime.title}
              </AnimeTitle>
              <AnimeStats>
                {anime.score && (
                  <StatItem hasScore>
                    <Star size={14} /> {anime.score.toFixed(1)}
                  </StatItem>
                )}
              </AnimeStats>
            </AnimeInfo>
          </AnimeCard>
        ))}
      </RecommendationsGrid>
    </RecommendationsContainer>
  );
};

export default AnimeRecommendations; 