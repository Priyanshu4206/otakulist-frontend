import { useState } from 'react';
import styled from 'styled-components';
import { Edit2, Trash2, MoreVertical, Play, Heart, MessageCircle, BookOpen, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { playlistAPI } from '../../services/api';
import useToast from '../../hooks/useToast';
import useAuth from '../../hooks/useAuth';

const CardContainer = styled.div`
  position: relative;
  background: var(--cardBackground);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 250px;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(var(--primary-rgb), 0.15);
    
    .cover-overlay {
      opacity: 1;
    }
  }
`;

const ImageContainer = styled.div`
  position: relative;
  aspect-ratio: 16 / 9;
  border-radius: 12px 12px 0 0;
  overflow: hidden;
  background: rgba(var(--backgroundLight-rgb), 0.3);
  min-height: 200px;
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: ${props => 
    props.$count === 1 ? '1fr' : 
    props.$count === 2 ? '1fr 1fr' : 
    props.$count === 3 ? '2fr 1fr' : 
    '1fr 1fr'
  };
  grid-template-rows: ${props => 
    props.$count === 1 ? '1fr' : 
    props.$count === 2 ? '1fr' : 
    props.$count === 3 ? '1fr 1fr' : 
    '1fr 1fr'
  };
  height: 100%;
  width: 100%;
  gap: 2px;
  
  ${props => props.$count === 3 && `
    & > :first-child {
      grid-row: span 2;
    }
  `}
`;

const AnimeImage = styled.div`
  background-image: url(${props => props.$src});
  background-size: cover;
  background-position: center;
  height: 100%;
  width: 100%;
`;

const FallbackImage = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(45deg, rgba(var(--primary-rgb), 0.1), rgba(var(--secondary-rgb), 0.1));
  color: var(--textSecondary);
  font-size: 2rem;
`;

const ImageOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.3) 40%, rgba(0, 0, 0, 0) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 1rem;
  z-index: 10;
  
  &.cover-overlay {
    opacity: 0;
  }
`;

const PlayButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 50%;
  width: 3rem;
  height: 3rem;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
    background: var(--primaryLight);
  }
`;

const CardContent = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const CardTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: var(--textPrimary);
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CardDescription = styled.p`
  font-size: 0.9rem;
  color: var(--textSecondary);
  margin: 0 0 0.75rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex-grow: 1;
`;

const MetaInfo = styled.div`
  display: flex;
  align-items: center;
  margin-top: auto;
  
  & > * + * {
    margin-left: 1rem;
  }
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  color: var(--textSecondary);
  
  svg {
    margin-right: 0.3rem;
    opacity: 0.7;
  }
`;

const ActionsContainer = styled.div`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 20;
`;

const MoreButton = styled.button`
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--primary);
  }
`;

const ActionMenu = styled.div`
  position: absolute;
  top: 2.5rem;
  right: 0;
  background: var(--cardBackground);
  border-radius: 8px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  width: 150px;
  z-index: 30;
  animation: slideDown 0.2s ease forwards;
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ActionItem = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  text-align: left;
  font-size: 0.9rem;
  color: var(--textPrimary);
  cursor: pointer;
  transition: background 0.2s ease;
  
  svg {
    margin-right: 0.5rem;
    color: ${props => props.$danger ? 'var(--error)' : 'var(--textSecondary)'};
  }
  
  &:hover {
    background: ${props => props.$danger ? 'rgba(var(--error-rgb), 0.1)' : 'rgba(var(--backgroundLight-rgb), 0.5)'};
    color: ${props => props.$danger ? 'var(--error)' : 'var(--primary)'};
  }
  
  &:not(:last-child) {
    border-bottom: 1px solid var(--borderColor);
  }
`;

const ConfirmationOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ConfirmationDialog = styled.div`
  background: var(--cardBackground);
  border-radius: 12px;
  padding: 1.5rem;
  width: 90%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  animation: scaleIn 0.2s ease;
  
  @keyframes scaleIn {
    from {
      transform: scale(0.9);
    }
    to {
      transform: scale(1);
    }
  }
`;

const ConfirmationTitle = styled.h3`
  font-size: 1.2rem;
  color: var(--textPrimary);
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    color: var(--error);
    margin-right: 0.5rem;
  }
`;

const ConfirmationMessage = styled.p`
  color: var(--textSecondary);
  margin-bottom: 1.5rem;
`;

const ConfirmationActions = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
`;

const ConfirmButton = styled.button`
  padding: 0.6rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.$danger ? 'var(--error)' : 'var(--primary)'};
  color: white;
  border: none;
  
  &:hover {
    opacity: 0.9;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  padding: 0.6rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--backgroundLight);
  color: var(--textSecondary);
  border: 1px solid var(--borderColor);
  
  &:hover {
    background: var(--inputBackground);
  }
`;

const LikeButton = styled.button`
  display: flex;
  align-items: center;
  background: none;
  border: none;
  color: ${props => props.$liked ? 'var(--error)' : 'var(--textSecondary)'};
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0.3rem 0.5rem;
  border-radius: 4px;
  
  &:hover {
    color: var(--error);
    background: rgba(var(--error-rgb), 0.1);
  }
  
  svg {
    margin-right: 0.3rem;
    ${props => props.$liked && `
      fill: var(--error);
    `}
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PlaylistCard = ({ playlist, onDelete, onEdit }) => {
  const [showActions, setShowActions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLiked, setIsLiked] = useState(playlist.isLiked || false);
  const [likesCount, setLikesCount] = useState(playlist.likesCount || 0);
  const [isProcessingLike, setIsProcessingLike] = useState(false);
  
  const { user, refreshUserData } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const isOwner = user && user.id || user._id === playlist.owner._id;
  
  // Get up to 4 anime images for the grid
  const animeImages = playlist?.coverImages || [];
  
  const handleActionToggle = (e) => {
    e.stopPropagation();
    setShowActions(!showActions);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setShowActions(false);
    if (onEdit) {
      onEdit(playlist);
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowActions(false);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    
    try {
      const response = await playlistAPI.deletePlaylist(playlist.id);
      
      if (response.success) {
        // Refresh user data to update playlists
        await refreshUserData();
        
        showToast({
          type: 'success',
          message: 'Playlist deleted successfully'
        });
        
        if (onDelete) {
          onDelete(playlist.id);
        }
      } else {
        throw new Error(response.error?.message || 'Failed to delete playlist');
      }
    } catch (error) {
      console.error('Error deleting playlist:', error);
      showToast({
        type: 'error',
        message: 'Failed to delete playlist: ' + (error.message || 'Unknown error')
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handlePlaylistClick = () => {
    // Use ID-based routing for stability across playlist renames
    const playlistId = playlist.id || playlist._id;
    navigate(`/playlist/id/${playlistId}`);
  };

  const handleLikeClick = async (e) => {
    e.stopPropagation();
    
    // If user is the owner, don't allow liking
    if (isOwner) {
      showToast({
        type: 'info',
        message: 'You cannot like your own playlist'
      });
      return;
    }
    
    // If not authenticated, show message
    if (!user) {
      showToast({
        type: 'info',
        message: 'Please log in to like playlists'
      });
      return;
    }
    
    setIsProcessingLike(true);
    
    try {
      const response = await playlistAPI.toggleLikePlaylist(playlist.id);
      
      if (response.success) {
        setIsLiked(response.data.liked);
        setLikesCount(response.data.likesCount);
        
        showToast({
          type: 'success',
          message: response.data.liked 
            ? 'Added to liked playlists' 
            : 'Removed from liked playlists'
        });
      } else {
        throw new Error(response.error?.message || 'Failed to like playlist');
      }
    } catch (error) {
      console.error('Error liking playlist:', error);
      showToast({
        type: 'error',
        message: 'Failed to like playlist: ' + (error.message || 'Unknown error')
      });
    } finally {
      setIsProcessingLike(false);
    }
  };

  return (
    <>
      <CardContainer onClick={handlePlaylistClick}>
        <ImageContainer>
          {animeImages.length > 0 ? (
            <ImageGrid $count={animeImages.length}>
              {animeImages.map((src, index) => (
                <AnimeImage key={index} $src={src} />
              ))}
            </ImageGrid>
          ) : (
            <FallbackImage>
              <BookOpen size={40} />
            </FallbackImage>
          )}
          
          <ImageOverlay className="cover-overlay">
            <PlayButton aria-label="View playlist">
              <Play size={20} />
            </PlayButton>
          </ImageOverlay>
        </ImageContainer>
        
        <CardContent>
          <CardTitle>{playlist.name}</CardTitle>
          <CardDescription>{playlist.description || 'No description provided'}</CardDescription>
          
          <MetaInfo>
            <MetaItem>
              <BookOpen size={16} />
              {playlist.animeCount} {playlist.animeCount === 1 ? 'anime' : 'animes'}
            </MetaItem>
            
            <LikeButton 
              onClick={handleLikeClick} 
              $liked={isLiked}
              disabled={isProcessingLike || isOwner}
            >
              <Heart size={16} />
              {likesCount}
            </LikeButton>
            
            {playlist.commentsCount > 0 && (
              <MetaItem>
                <MessageCircle size={16} />
                {playlist.commentsCount}
              </MetaItem>
            )}
          </MetaInfo>
        </CardContent>
        
        {isOwner && (
          <ActionsContainer>
            <MoreButton onClick={handleActionToggle}>
              <MoreVertical size={16} />
            </MoreButton>
            
            {showActions && (
              <ActionMenu>
                <ActionItem onClick={handleEdit}>
                  <Edit2 size={16} />
                  Edit
                </ActionItem>
                <ActionItem onClick={handleDeleteClick} $danger={true}>
                  <Trash2 size={16} />
                  Delete
                </ActionItem>
              </ActionMenu>
            )}
          </ActionsContainer>
        )}
      </CardContainer>
      
      {showDeleteConfirm && (
        <ConfirmationOverlay onClick={handleCancelDelete}>
          <ConfirmationDialog onClick={(e) => e.stopPropagation()}>
            <ConfirmationTitle>
              <AlertTriangle size={20} />
              Delete Playlist
            </ConfirmationTitle>
            <ConfirmationMessage>
              Are you sure you want to delete "{playlist.name}"? This action cannot be undone.
            </ConfirmationMessage>
            <ConfirmationActions>
              <CancelButton onClick={handleCancelDelete}>
                Cancel
              </CancelButton>
              <ConfirmButton 
                $danger={true} 
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </ConfirmButton>
            </ConfirmationActions>
          </ConfirmationDialog>
        </ConfirmationOverlay>
      )}
    </>
  );
};

export default PlaylistCard; 