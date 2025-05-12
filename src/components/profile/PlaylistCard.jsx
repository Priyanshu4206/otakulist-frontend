import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Play, Image } from 'lucide-react';
import ShareButton from '../common/ShareButton';
import {
  PlaylistCard as StyledPlaylistCard,
  PlaylistCover,
  ImageGrid,
  AnimeImage,
  DefaultCoverIcon,
  ImageOverlay,
  PlayButton,
  PlaylistCardContent,
  PlaylistName,
  PlaylistMeta,
  MetaBadge,
  ActionButtons,
  ActionButton,
} from './ProfileStyles';

const PlaylistCard = ({
  playlist,
  isOwner,
  user,
  liked,
  likeCount,
  isProcessingLike,
  handleLikePlaylist,
}) => {
  const animeImages = playlist?.coverImages || [];
  
  // Create share URL for the playlist
  const shareUrl = `${window.location.origin}/playlist/id/${playlist._id || playlist.id}`;

  return (
    <Link 
      to={`/playlist/${playlist.slug}`}
      style={{ textDecoration: 'none' }}
    >
      <StyledPlaylistCard>
        <PlaylistCover>
          {animeImages.length > 0 ? (
            <ImageGrid $count={animeImages.length}>
              {animeImages.map((src, index) => (
                <AnimeImage key={index} $src={src} />
              ))}
            </ImageGrid>
          ) : (
            <DefaultCoverIcon>
              <Image size={40} />
            </DefaultCoverIcon>
          )}
          
          <ImageOverlay className="cover-overlay">
            <PlayButton aria-label="View playlist">
              <Play size={20} />
            </PlayButton>
          </ImageOverlay>
          
          <ActionButtons>
            {/* Only show like button if user is not the owner */}
            {!isOwner && user && (
              <ActionButton 
                onClick={(e) => handleLikePlaylist(playlist._id, e)}
                disabled={isProcessingLike}
                $danger={true}
                $liked={liked}
                aria-label={liked ? "Unlike playlist" : "Like playlist"}
              >
                <Heart size={16} />
              </ActionButton>
            )}
            <ShareButton
              mode="native"
              url={shareUrl}
              title={playlist.name}
              text={playlist.description || `Check out this anime playlist: ${playlist.name}`}
              label="Share Playlist"
              size="small"
              variant="primary"
              style={{ 
                padding: '0.5rem', 
                borderRadius: '6px', 
                minWidth: 'auto',
                height: '32px'
              }}
            />
            <ShareButton
              mode="copy"
              url={shareUrl}
              title={`Copy playlist link`}
              text={`Copy playlist link`}
              iconOnly={true}
              size="small"
              variant="default"
              style={{ padding: '0.5rem', borderRadius: '50%', minWidth: '32px', height: '32px' }}
              successMessage="Playlist link copied!"
              errorMessage="Failed to copy playlist link."
            />
          </ActionButtons>
        </PlaylistCover>
        
        <PlaylistCardContent>
          <PlaylistName>{playlist.name}</PlaylistName>
          <PlaylistMeta>
            <MetaBadge>
              <Play size={14} />
              {playlist.animeCount || 0} anime
            </MetaBadge>
            <MetaBadge>
              <Heart size={14} />
              {likeCount}
            </MetaBadge>
          </PlaylistMeta>
        </PlaylistCardContent>
      </StyledPlaylistCard>
    </Link>
  );
};

export default PlaylistCard; 