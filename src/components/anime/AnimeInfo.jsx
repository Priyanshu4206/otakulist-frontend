import styled, { keyframes } from 'styled-components';
import { useState } from 'react';
import { Star, Bookmark, BookOpen, Lock } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { watchlistAPI } from '../../services/api';
import WatchlistModal from '../common/WatchlistModal';
import PlaylistAddModal from '../common/PlaylistAddModal';
import useToast from '../../hooks/useToast';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  background-color: rgba(var(--cardBackground-rgb), 0.4);
  padding: 1.5rem;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  overflow: hidden;
  animation: ${fadeIn} 0.5s ease-out;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 5px;
    height: 100%;
    background: var(--gradientPrimary);
    transform: scaleY(1);
    transform-origin: bottom;
    transition: transform 0.4s ease;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  background-color: ${props => props.secondary ? 'rgba(var(--backgroundLight-rgb), 0.3)' : 'var(--primary)'};
  color: ${props => props.secondary ? 'var(--textPrimary)' : 'white'};
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${props => props.secondary ? '0 2px 6px rgba(0, 0, 0, 0.1)' : '0 2px 6px rgba(var(--primary-rgb), 0.3)'};
  white-space: nowrap;
  
  &:hover {
    background-color: ${props => props.secondary ? 'rgba(var(--backgroundLight-rgb), 0.4)' : 'var(--primaryLight)'};
    transform: ${props => props.secondary ? 'translateY(-2px)' : 'translateY(-2px)'};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ActionButtonsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const AnimeInfo = ({ anime, onOpenRatingModal }) => {
  const { isAuthenticated } = useAuth();
  const [watchlistOpen, setWatchlistOpen] = useState(false);
  const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
  const [animeWatchStatus, setAnimeWatchStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleWatchlistClick = async () => {
    if (!isAuthenticated) {
      showToast({
        type: 'warning',
        message: 'You need to be logged in to add to your watchlist'
      });
      return;
    }

    setLoading(true);

    try {
      const animeId = anime.id || anime.malId || anime._id;
      const response = await watchlistAPI.getAnimeStatus(animeId);

      if (response && response.success) {
        setAnimeWatchStatus(response.data);
        setWatchlistOpen(true);
      } else {
        // Show error toast
        showToast({
          type: 'error',
          message: response?.message || 'Failed to get anime status'
        });
      }
    } catch (error) {
      console.error('Error getting anime status:', error);
      showToast({
        type: 'error',
        message: 'An error occurred while checking anime status'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <InfoContainer>      
      <ActionButtonsRow>
        {isAuthenticated ? (
          <>
            <ActionButton
              onClick={onOpenRatingModal}
              secondary
            >
              <Star size={20} />
              Rate Anime
            </ActionButton>

            <ActionButton
              onClick={handleWatchlistClick}
              disabled={loading}
            >
              <Bookmark size={20} />
              {animeWatchStatus ? 'Update Status' : 'Add to Watchlist'}
            </ActionButton>

            <ActionButton
              onClick={() => setPlaylistModalOpen(true)}
              secondary
            >
              <BookOpen size={20} />
              Add to Playlist
            </ActionButton>
          </>
        ) : (
          <>
            <ActionButton
              disabled={true}
              secondary
            >
              <Lock size={20} />
              Rate Anime
            </ActionButton>

            <ActionButton
              disabled={true}
            >
              <Lock size={20} />
              Add to Watchlist
            </ActionButton>

            <ActionButton
              disabled={true}
              secondary
            >
              <Lock size={20} />
              Add to Playlist
            </ActionButton>
          </>
        )}
      </ActionButtonsRow>

      {/* Watchlist Modal */}
      <WatchlistModal
        show={watchlistOpen}
        onClose={() => setWatchlistOpen(false)}
        anime={anime}
        currentStatus={animeWatchStatus}
        onStatusChange={setAnimeWatchStatus}
      />

      {/* Playlist Modal */}
      <PlaylistAddModal
        show={playlistModalOpen}
        onClose={() => setPlaylistModalOpen(false)}
        anime={anime}
      />
    </InfoContainer>
  );
};

export default AnimeInfo;