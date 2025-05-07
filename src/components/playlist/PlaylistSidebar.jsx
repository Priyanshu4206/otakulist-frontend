import React from 'react';
import styled from 'styled-components';
import { Heart, Edit2, Trash2, BookOpen, Clock, Globe, Users } from 'lucide-react';
import Card from '../common/Card';
import ShareButton from '../common/ShareButton';

const SidebarCard = styled(Card)`
  position: sticky;
  top: 2rem;
  overflow: hidden;
  height: 100%;
  padding: 0;
  border-radius: 0;
  
  @media (max-width: 1024px) {
    position: relative;
    top: 0;
  }
`;

const CoverImage = styled.div`
  height: 120px;
  background: ${props => props.image ? `url(${props.image}) center/cover` : 'linear-gradient(135deg, var(--primary), var(--secondary))'};
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 1rem;
`;

const OwnerContainer = styled.div`
  position: absolute;
  top: 1rem;
  left: 1rem;
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  padding: 0.5rem;
  border-radius: 50px;
`;

const OwnerAvatar = styled.img`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--primary);
`;

const OwnerName = styled.span`
  margin-left: 0.5rem;
  font-size: 0.85rem;
  color: white;
  font-weight: 500;
`;

const PlaylistTitle = styled.h1`
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--textPrimary);
  margin: 0;
  padding: 1.5rem 1.5rem 0.5rem;
`;

const PlaylistDescription = styled.p`
  font-size: 0.95rem;
  color: var(--textSecondary);
  padding: 0 1.5rem 1rem;
  margin: 0;
  border-bottom: 1px solid var(--borderColor);
`;

const PlaylistStats = styled.div`
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--textSecondary);
  font-size: 0.9rem;
  
  svg {
    color: var(--primary);
    opacity: 0.8;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem 1.5rem 1.5rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: ${props => props.$primary ? 'var(--primary)' : 'var(--cardBackground)'};
  color: ${props => props.$primary ? 'white' : 'var(--textPrimary)'};
  border: 1px solid ${props => props.$primary ? 'var(--primary)' : 'var(--borderColor)'};
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  
  &:hover {
    background: ${props => props.$primary ? 'var(--primaryLight)' : 'var(--backgroundLight)'};
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  ${props => props.$liked && `
    background: rgba(var(--error-rgb), 0.1);
    color: var(--error);
    border-color: var(--error);

    svg {
      fill: var(--error);
    }
    
    &:hover {
      background: rgba(var(--error-rgb), 0.2);
    }
  `}
`;

const PlaylistSidebar = ({ 
  playlist, 
  isOwner, 
  isLiked, 
  likesCount, 
  formatDate, 
  isProcessing, 
  user,
  onLike, 
  onEdit, 
  onDelete 
}) => {
  return (
    <SidebarCard>
      <CoverImage image={playlist.coverImage}>
        <OwnerContainer>
          <OwnerAvatar 
            src={playlist.owner.avatarUrl || 'https://via.placeholder.com/50?text=User'} 
            alt={playlist.owner.username} 
          />
          <OwnerName>{playlist.owner.username}</OwnerName>
        </OwnerContainer>
      </CoverImage>
      
      <PlaylistTitle>{playlist.name}</PlaylistTitle>
      <PlaylistDescription>
        {playlist.description || 'No description provided'}
      </PlaylistDescription>
      
      <PlaylistStats>
        <StatItem>
          <BookOpen size={18} />
          {playlist.animeCount} {playlist.animeCount === 1 ? 'anime' : 'animes'}
        </StatItem>
        
        <StatItem>
          <Heart size={18} />
          {likesCount} {likesCount === 1 ? 'like' : 'likes'}
        </StatItem>
        
        <StatItem>
          <Clock size={18} />
          Created on {formatDate(playlist.createdAt)}
        </StatItem>
        
        <StatItem>
          <Globe size={18} />
          {playlist.isPublic ? 'Public playlist' : 'Private playlist'}
        </StatItem>
        
        <StatItem>
          <Users size={18} />
          Created by {playlist.owner.username}
        </StatItem>
      </PlaylistStats>
      
      <ActionButtons>
        <ShareButton
          title={playlist.name}
          text={playlist.description || `Check out this anime playlist: ${playlist.name}`}
          label="Share Playlist"
          successMessage="Playlist link copied to clipboard"
          errorMessage="Failed to copy playlist link"
          url={`${window.location.origin}/playlist/id/${playlist.id || playlist._id}`}
          style={{ padding: '0.75rem', width: '100%', fontSize: '0.9rem' }}
        />
        
        {/* Only show like button if user is not the owner and is logged in */}
        {user && !isOwner && (
          <ActionButton 
            $primary={!isLiked}
            $liked={isLiked}
            onClick={onLike}
            disabled={isProcessing.like}
          >
            <Heart size={18} />
            {isLiked ? 'Unlike Playlist' : 'Like Playlist'}
          </ActionButton>
        )}
        
        {isOwner && (
          <>
            <ActionButton onClick={onEdit}>
              <Edit2 size={18} />
              Edit Playlist
            </ActionButton>
            
            <ActionButton 
              onClick={onDelete} 
              disabled={isProcessing.delete}
            >
              <Trash2 size={18} />
              Delete Playlist
            </ActionButton>
          </>
        )}
      </ActionButtons>
    </SidebarCard>
  );
};

export default PlaylistSidebar; 