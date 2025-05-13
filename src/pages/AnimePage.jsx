import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import AnimeInfo from '../components/anime/AnimeInfo';
import CharactersList from '../components/anime/CharactersList';
import RecommendationsList from '../components/anime/RecommendationsList';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { animeAPI } from '../services/api';
import useApiCache from '../hooks/useApiCache';
import { Star, Calendar, Clock, Globe, Tv, Hash, Music, ExternalLink, BookOpen, Users, ChevronDown, ChevronUp } from 'lucide-react';
import AnimeRatingModal from '../components/common/AnimeRatingModal';
// Styles
import { PageContainer,  AnimePageGrid,  LeftSidebar, MainContent, PosterContainer, ShimmerOverlay, QuickInfoCard, QuickInfoTitle, QuickInfoGrid, InfoLabel, InfoValue, ScoreDisplay, ScoreValue, ScoreLabel, AnimeHeaderSection, AnimeTitle, AlternativeTitles, ContentSection, SectionHeading, Synopsis, ViewMoreButton, VideoContainer, GradientBackground, ErrorMessage, NoContentMessage, ThemeSongsSection, ThemeCategory, ThemeCategoryTitle, ThemeItem, ExternalLinksGrid, ExternalLinkButton, GenreBadge, GenresContainer } from '../components/anime/AnimePageStyles'; 
import formatNumberShort from '../utils/formatShortNumber';
import styled from 'styled-components';

// Add background image styled component
const AnimeBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  background: ${({ image }) => image ? `url(${image}) center center / cover no-repeat` : 'none'};
  filter: blur(18px) brightness(0.5) saturate(1.2);
  pointer-events: none;
  transition: background 0.4s;
  &::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(20, 20, 30, 0.7);
    z-index: 1;
  }
`;

const AnimePage = () => {
  const { id } = useParams();
  
  // API cache hooks
  const { 
    loading: animeLoading, 
    error: animeError, 
    fetchWithCache: fetchAnime,
    clearCacheItem: clearAnimeCacheItem
  } = useApiCache('sessionStorage');
  
  const { 
    loading: charactersLoading,
    fetchWithCache: fetchCharacters 
  } = useApiCache('sessionStorage');
  
  const { 
    loading: recommendationsLoading,
    fetchWithCache: fetchRecommendations 
  } = useApiCache('sessionStorage');
  
  // State for anime data
  const [anime, setAnime] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [showRatingModal, setShowRatingModal] = useState(false);
  
  // Create cache keys
  const animeCacheKey = `anime_${id}`;
  const charactersCacheKey = `anime_${id}_characters`;
  const recommendationsCacheKey = `anime_${id}_recommendations`;
  
  // Fetch anime details
  useEffect(() => {
    const getAnimeDetails = async () => {
      try {
        // Fetch anime details
        const animeResponse = await fetchAnime(
          animeCacheKey,
          () => animeAPI.getAnimeById(id)
        );
        
        // Extract anime data from response
        const animeData = animeResponse.data || animeResponse;
        setAnime(animeData);
        
        // Fetch characters
        try {
          const charactersResponse = await fetchCharacters(
            charactersCacheKey,
            () => animeAPI.getAnimeCharacters(id)
          );
          
          // Extract characters data from response
          const charactersData = charactersResponse.data || charactersResponse || [];
          setCharacters(charactersData);
        } catch (err) {
          console.error('Error fetching anime characters:', err);
          setCharacters([]);
        }
        
        // Fetch recommendations
        try {
          const recommendationsResponse = await fetchRecommendations(
            recommendationsCacheKey,
            () => animeAPI.getAnimeRecommendations(id)
          );
          
          // Extract recommendations data from response
          const recommendationsData = recommendationsResponse.data || recommendationsResponse || [];
          setRecommendations(recommendationsData);
        } catch (err) {
          console.error('Error fetching anime recommendations:', err);
          setRecommendations([]);
        }
      } catch (err) {
        console.error('Error fetching anime details:', err);
      }
    };
    
    getAnimeDetails();
  }, [id, fetchAnime, fetchCharacters, fetchRecommendations]);
  
  // Format helpers
  const formatSeason = (season, year) => {
    if (!season) return 'Unknown';
    return `${season.charAt(0).toUpperCase() + season.slice(1)} ${year || ''}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'TBA';

    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDuration = (duration) => {
    if (!duration) return 'Unknown';
    return duration.includes('hr') || duration.includes('min') ? duration : `${duration} min per ep`;
  };
  
  // Helper to clear cache and refetch anime details
  const handleRatingSuccess = async () => {
    if (animeCacheKey) {
      clearAnimeCacheItem(animeCacheKey);
      // Refetch details
      const animeResponse = await fetchAnime(
        animeCacheKey,
        () => animeAPI.getAnimeById(id),
        true // force refresh
      );
      const animeData = animeResponse.data || animeResponse;
      setAnime(animeData);
    }
  };
  
  // Show loading spinner when anime details are loading
  if (animeLoading && !anime) {
    return (
      <Layout>
        <LoadingSpinner fullScreen />
      </Layout>
    );
  }
  
  // Show error message if anime details failed to load
  if (animeError) {
    return (
      <Layout>
        <ErrorMessage>
          <h3>Error loading anime details</h3>
          <p>{animeError}</p>
        </ErrorMessage>
      </Layout>
    );
  }
  
  if (!anime) {
    return (
      <Layout>
        <LoadingSpinner fullScreen />
      </Layout>
    );
  }
  
  // Extract anime data with fallbacks
  const {
    status: animeStatus = 'Unknown',
    episodes,
    genres = [],
    aired,
    season,
    year,
    broadcast,
    studios = [],
    source,
    duration,
    type,
    themes = [],
    theme = {},
    external = [],
    background,
    streaming = [],
    score,
    scoredBy,
    images = {},
  } = anime;
  
  // Get large image for background
  const bgImage = images.jpg?.largeImageUrl || images.jpg?.imageUrl || images.webp?.largeImageUrl || images.webp?.imageUrl || '';
  const Mdscreen = window.innerWidth < 992;

  return (
    <Layout>
      {bgImage && <AnimeBackground image={bgImage} />}
      <GradientBackground />
      <PageContainer>
        <AnimeRatingModal
          show={showRatingModal}
          onClose={() => setShowRatingModal(false)}
          animeId={anime?.malId || anime?.id || anime?._id}
          animeTitle={anime?.titles?.english || anime?.titles?.default || anime?.title}
          userRating={anime?.userRating}
          onSuccess={handleRatingSuccess}
        />
        {/* Main anime page layout */}
        <AnimeHeaderSection>
          <AnimeTitle>
            {anime.titles?.english || 
             anime.titles?.default || 
             anime.title_english || 
             anime.title || 
             'Untitled Anime'}
          </AnimeTitle>
          
          <AlternativeTitles>
            {/* Handle different title formats with fallbacks */}
            {(anime.title_japanese || anime.titles?.japanese) && (
              <div>Japanese: {anime.titles?.japanese || anime.title_japanese}</div>
            )}
            
            {anime.title_english && anime.title_english !== anime.title && (
              <div>English: {anime.title_english}</div>
            )}
            {anime.titles?.english && anime.titles.english !== anime.titles?.default && (
              <div>English: {anime.titles.english}</div>
            )}
            
            {/* Handle synonyms with fallbacks */}
            {anime.title_synonyms && anime.title_synonyms.length > 0 && (
              <div>Also known as: {anime.title_synonyms.join(', ')}</div>
            )}
            {anime.titles?.synonyms && anime.titles.synonyms.length > 0 && (
              <div>Also known as: {anime.titles.synonyms.join(', ')}</div>
            )}
          </AlternativeTitles>
        </AnimeHeaderSection>
        
        <AnimePageGrid>
          {/* Left sidebar with poster and quick info */}
          <LeftSidebar>
            {/* Anime poster */}
              <PosterContainer>
                <img 
                  src={
                    anime.images?.jpg?.largeImageUrl || 
                    anime.images?.jpg?.large_image_url || 
                    anime.images?.jpg?.imageUrl || 
                    anime.images?.jpg?.image_url || 
                    anime.images?.webp?.largeImageUrl || 
                    anime.images?.webp?.large_image_url || 
                    'https://via.placeholder.com/225x350?text=No+Image'
                  } 
                alt={anime.titles?.english || anime.titles?.default || anime.title || 'Anime Poster'} 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/225x350?text=No+Image';
                }}
                />
                <ShimmerOverlay />
              </PosterContainer>
            {/* Action buttons */}
            <ContentSection>
            {Mdscreen &&  <AnimeInfo anime={anime} onOpenRatingModal={() => setShowRatingModal(true)} />}
            </ContentSection>
            {/* Quick info card */}
            <QuickInfoCard>
              <QuickInfoTitle>
                Information
              </QuickInfoTitle>
              
              {score && (
                <ScoreDisplay>
                  <Star size={24} />
                  <ScoreValue>{score}</ScoreValue>
                  <ScoreLabel>/ 10</ScoreLabel>
                  <ScoreLabel>
                  ({formatNumberShort(scoredBy)} user{scoredBy === 1 ? '' : 's'})
                  </ScoreLabel>
                </ScoreDisplay>
              )}
              
              <QuickInfoGrid>
                {type && (
                  <>
                    <InfoLabel><Tv size={16} /> Type</InfoLabel>
                    <InfoValue>{type}</InfoValue>
                  </>
                )}
                
                <InfoLabel><Hash size={16} /> Episodes</InfoLabel>
                <InfoValue>{episodes || 'Unknown'}</InfoValue>
                
                {duration && (
                  <>
                    <InfoLabel><Clock size={16} /> Duration</InfoLabel>
                    <InfoValue>{formatDuration(duration)}</InfoValue>
                  </>
                )}
                
                <InfoLabel><Calendar size={16} /> Aired</InfoLabel>
                <InfoValue>
                  {season ? formatSeason(season, year) : aired?.string || aired?.from ? formatDate(aired.from) : 'TBA'}
                </InfoValue>
                
                {broadcast?.day && (
                  <>
                    <InfoLabel><Clock size={16} /> Broadcast</InfoLabel>
                    <InfoValue>{`${broadcast.day}${broadcast.time ? ` at ${broadcast.time}` : ''}`}</InfoValue>
                  </>
                )}
                
                {source && (
                  <>
                    <InfoLabel><Globe size={16} /> Source</InfoLabel>
                    <InfoValue>{source}</InfoValue>
                  </>
                )}
              
                {studios && studios.length > 0 && (
                  <>
                    <InfoLabel><Tv size={16} /> Studios</InfoLabel>
                    <InfoValue>
                      {studios.map((studio, index) => (
                        <span key={index}>
                          {typeof studio === 'string' ? studio : studio.name || ''}
                          {index < studios.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </InfoValue>
                  </>
                )}
                
                <InfoLabel><Globe size={16} /> Status</InfoLabel>
                <InfoValue>{animeStatus}</InfoValue>
              </QuickInfoGrid>
            </QuickInfoCard>
            
            {/* Genres card */}
            {(genres.length > 0 || themes.length > 0) && (
              <QuickInfoCard>
                <QuickInfoTitle>Genres & Themes</QuickInfoTitle>
                <GenresContainer>
                  {genres.map((genre, index) => (
                    <GenreBadge key={`genre-${index}`} index={index}>
                      {typeof genre === 'object' ? genre.name : genre}
                    </GenreBadge>
                  ))}
                  
                  {themes.map((theme, index) => (
                    <GenreBadge key={`theme-${index}`} index={genres.length + index}>
                      {typeof theme === 'object' ? theme.name : theme}
                    </GenreBadge>
                  ))}
                </GenresContainer>
              </QuickInfoCard>
            )}
            
            {/* Streaming services */}
            {streaming && streaming.length > 0 && (
              <QuickInfoCard>
                <QuickInfoTitle>Where to Watch</QuickInfoTitle>
                <ExternalLinksGrid>
                  {streaming.map((service, index) => (
                    <ExternalLinkButton
                      key={`stream-${index}`}
                      href={service.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink size={16} />
                      {service.name}
                    </ExternalLinkButton>
                  ))}
                </ExternalLinksGrid>
              </QuickInfoCard>
            )}
          </LeftSidebar>
          
          {/* Main content area */}
          <MainContent>
            {/* Action buttons */}
             {!Mdscreen &&  <AnimeInfo anime={anime} onOpenRatingModal={() => setShowRatingModal(true)} />}
            
            {/* Synopsis section */}
            <ContentSection>
              <SectionHeading><BookOpen size={24} /> Synopsis</SectionHeading>
              {anime.synopsis ? (
                <>
                  <Synopsis>
                    <p>{anime.synopsis}</p>
                  </Synopsis>
                </>
              ) : (
                <NoContentMessage>No synopsis available for this anime.</NoContentMessage>
              )}
            </ContentSection>
            
            {/* Trailer section */}
            {(anime.trailer?.youtubeId || anime.trailer?.youtube_id) && (
              <ContentSection>
                <SectionHeading><Tv size={24} /> Trailer</SectionHeading>
                <VideoContainer>
                  <iframe
                    src={`https://www.youtube.com/embed/${anime.trailer?.youtubeId || anime.trailer?.youtube_id}`}
                    title={`${anime.titles?.english || anime.titles?.default || anime.title || 'Anime'} Trailer`}
                    allowFullScreen
                  />
                </VideoContainer>
              </ContentSection>
            )}
            
            {/* Theme songs section */}
            {((theme?.openings && theme.openings.length > 0) || 
              (theme?.endings && theme.endings.length > 0)) && (
              <ContentSection>
                <SectionHeading><Music size={24} /> Theme Songs</SectionHeading>
                <ThemeSongsSection>
                  {theme.openings && theme.openings.length > 0 && (
                    <ThemeCategory>
                      <ThemeCategoryTitle><Music size={18} /> Opening Themes</ThemeCategoryTitle>
                      {theme.openings.map((opening, index) => (
                        <ThemeItem key={`opening-${index}`}>
                          {opening}
                        </ThemeItem>
                      ))}
                    </ThemeCategory>
                  )}
                  
                  {theme.endings && theme.endings.length > 0 && (
                    <ThemeCategory>
                      <ThemeCategoryTitle><Music size={18} /> Ending Themes</ThemeCategoryTitle>
                      {theme.endings.map((ending, index) => (
                        <ThemeItem key={`ending-${index}`}>
                          {ending}
                        </ThemeItem>
                      ))}
                    </ThemeCategory>
                  )}
                </ThemeSongsSection>
              </ContentSection>
            )}
            
            {/* Background info section */}
            {background && (
              <ContentSection>
                <SectionHeading><BookOpen size={24} /> Background</SectionHeading>
                <Synopsis expanded={true}>
                  <p>{background}</p>
                </Synopsis>
              </ContentSection>
            )}
            
            {/* External links section */}
            {external && external.length > 0 && (
              <ContentSection>
                <SectionHeading><ExternalLink size={24} /> External Links</SectionHeading>
                <ExternalLinksGrid>
                  {external.map((link, index) => (
                    <ExternalLinkButton
                      key={`external-${index}`}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink size={16} />
                      {link.name}
                    </ExternalLinkButton>
                  ))}
                </ExternalLinksGrid>
              </ContentSection>
            )}
          </MainContent>
          
            {/* Characters section */}
            <ContentSection>
              <SectionHeading><Users size={24} /> Characters</SectionHeading>
              {charactersLoading ? (
                <LoadingSpinner size="medium" centered />
              ) : characters && characters.length > 0 ? (
                <CharactersList characters={characters} />
              ) : (
                <NoContentMessage>No character information available for this anime.</NoContentMessage>
              )}
            </ContentSection>
            
            {/* Recommendations section */}
            <ContentSection>
              <SectionHeading><Calendar size={24} /> Recommendations</SectionHeading>
              {recommendationsLoading ? (
                <LoadingSpinner size="medium" centered />
              ) : recommendations && recommendations.length > 0 ? (
                <RecommendationsList recommendations={recommendations} />
              ) : (
                <NoContentMessage>No recommendations available for this anime.</NoContentMessage>
              )}
            </ContentSection>
        </AnimePageGrid>
      </PageContainer>
    </Layout>
  );
};

export default AnimePage; 