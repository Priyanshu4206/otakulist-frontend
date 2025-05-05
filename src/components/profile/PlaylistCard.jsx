import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Share2, Play, Image } from 'lucide-react';
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
  formatDate
} from './ProfileStyles';

const PlaylistCard = ({
  playlist,
  isOwner,
  user,
  liked,
  likeCount,
  isProcessingLike,
  handleLikePlaylist,
  handleSharePlaylist
}) => {
  const animeImages = playlist?.coverImages || [];

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
            
            <ActionButton 
              onClick={(e) => handleSharePlaylist(playlist, e)}
              $primary={true}
              aria-label="Share playlist"
            >
              <Share2 size={16} />
            </ActionButton>
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