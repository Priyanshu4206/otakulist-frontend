import React from 'react';
import { ListFilter } from 'lucide-react';
import PlaylistCard from './PlaylistCard';
import {
  PlaylistsContainer,
  PlaylistsGrid,
  LoadingState,
  ErrorState,
  EmptyState,
  Pagination,
  PageButton
} from './ProfileStyles';

const PlaylistsSection = ({ 
  playlists,
  playlistsLoading,
  playlistsError,
  playlistLikes,
  processingLike,
  user,
  isOwner,
  username,
  profileData,
  playlistsPage,
  playlistsPagination,
  setPlaylistsPage,
  handleLikePlaylist,
  handleSharePlaylist,
  getPageNumbers
}) => {
  return (
    <PlaylistsContainer>
      {playlistsLoading && (
        <LoadingState>Loading playlists...</LoadingState>
      )}
      
      {playlistsError && (
        <ErrorState>{playlistsError}</ErrorState>
      )}
      
      {!playlistsLoading && !playlistsError && playlists.length === 0 && (
        <EmptyState>
          <ListFilter size={40} />
          <h3>No Playlists</h3>
          <p>
            {username === (user?.username) 
              ? "You haven't created any playlists yet. Create a playlist to organize your favorite anime!"
              : `${profileData.displayName || profileData.username} hasn't created any public playlists yet.`
            }
          </p>
        </EmptyState>
      )}
      
      {!playlistsLoading && !playlistsError && playlists.length > 0 && (
        <>
          <PlaylistsGrid>
            {playlists.map(playlist => {
              const liked = playlistLikes[playlist._id]?.isLiked || false;
              const likeCount = playlistLikes[playlist._id]?.count || 0;
              const isProcessingLike = processingLike[playlist._id] || false;
              
              return (
                <PlaylistCard
                  key={playlist._id}
                  playlist={playlist}
                  isOwner={isOwner}
                  user={user}
                  liked={liked}
                  likeCount={likeCount}
                  isProcessingLike={isProcessingLike}
                  handleLikePlaylist={handleLikePlaylist}
                  handleSharePlaylist={handleSharePlaylist}
                />
              );
            })}
          </PlaylistsGrid>
          
          {playlistsPagination.pages > 1 && (
            <Pagination>
              <PageButton 
                onClick={() => setPlaylistsPage(prev => Math.max(prev - 1, 1))}
                disabled={playlistsPage === 1}
              >
                Prev
              </PageButton>
              
              {getPageNumbers().map((pageNum, index) => (
                <React.Fragment key={index}>
                  {pageNum === '...' ? (
                    <span style={{ alignSelf: 'center' }}>...</span>
                  ) : (
                    <PageButton 
                      active={playlistsPage === pageNum}
                      onClick={() => setPlaylistsPage(pageNum)}
                    >
                      {pageNum}
                    </PageButton>
                  )}
                </React.Fragment>
              ))}
              
              <PageButton 
                onClick={() => setPlaylistsPage(prev => Math.min(prev + 1, playlistsPagination.pages))}
                disabled={playlistsPage === playlistsPagination.pages}
              >
                Next
              </PageButton>
            </Pagination>
          )}
        </>
      )}
    </PlaylistsContainer>
  );
};

export default PlaylistsSection; 