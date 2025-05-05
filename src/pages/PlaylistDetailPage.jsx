import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { playlistAPI } from '../services/api';
import useToast from '../hooks/useToast';
import useAuth from '../hooks/useAuth';
import PlaylistEditModal from '../components/common/PlaylistEditModal';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Import modular components
import PlaylistSidebar from '../components/playlist/PlaylistSidebar';
import PlaylistAnimeGrid from '../components/playlist/PlaylistAnimeGrid';
import ConfirmationModal from '../components/playlist/ConfirmationModal';
import { 
  PageContainer, 
  ContentWrapper, 
  PlaylistGrid, 
  LoadingWrapper, 
  EmptyState,
  formatDateString 
} from '../components/playlist/PlaylistStyles';

const PlaylistDetailPage = () => {
  // Get the playlist identifier from the URL (can be either slug or id)
  const { slug, id } = useParams();
  const playlistId = id || slug; // Use id if available, otherwise slug
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();
  
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [animeToDelete, setAnimeToDelete] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  
  const [isProcessing, setIsProcessing] = useState({
    delete: false,
    like: false,
    removeAnime: false
  });
  
  // Check if the current user is the owner of the playlist
  const isOwner = user && playlist?.owner && 
    (user.id === playlist.owner._id || user._id === playlist.owner._id);
  
  // Check if the identifier is more likely to be an ID (MongoDB ObjectId) or a slug
  const isMongoId = id || /^[0-9a-fA-F]{24}$/.test(playlistId);
  
  // Fetch playlist data
  useEffect(() => {
    const fetchPlaylist = async () => {
      setLoading(true);
      
      try {
        // Use the appropriate API call based on the identifier type
        const response = isMongoId 
          ? await playlistAPI.getPlaylistById(playlistId)
          : await playlistAPI.getPlaylistBySlug(playlistId);
          
        // Handle response when API directly returns the playlist object
        if (response && response._id) {
          // Direct playlist object returned
          setPlaylist(response);
          setIsLiked(response.isLiked || false);
          setLikesCount(response.likesCount || response.likes?.length || 0);
          setError(null);
        } else if (response && response.success && response.data) {
          // Standard API response format with success and data
          setPlaylist(response.data);
          setIsLiked(response.data.isLiked || false);
          setLikesCount(response.data.likesCount || response.data.likes?.length || 0);
          setError(null);
        } else {
          setError(response?.error?.message || 'Failed to load playlist');
        }
      } catch (error) {
        setError('An error occurred while fetching the playlist');
      } finally {
        setLoading(false);
      }
    };
    
    if (playlistId) {
      fetchPlaylist();
    }
  }, [playlistId, isMongoId]);
  
  // Handle like/unlike
  const handleLike = async () => {
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
    
    setIsProcessing(prev => ({ ...prev, like: true }));
    
    try {
      const dbPlaylistId = playlist.id || playlist._id;
      
      const response = await playlistAPI.likePlaylist(dbPlaylistId);
      
      // Check if response is directly the data object or has success property
      if (response && response.liked !== undefined) {
        // Direct data response
        setIsLiked(response.liked);
        setLikesCount(response.likesCount || 0);
        
        showToast({
          type: 'success',
          message: response.liked 
            ? 'Added to liked playlists' 
            : 'Removed from liked playlists'
        });
      } else if (response && response.success && response.data) {
        // Standard success/data format
        setIsLiked(response.data.liked);
        setLikesCount(response.data.likesCount || 0);
        
        showToast({
          type: 'success',
          message: response.data.liked 
            ? 'Added to liked playlists' 
            : 'Removed from liked playlists'
        });
      } else {
        throw new Error('Failed to like playlist - unexpected response format');
      }
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Failed to like playlist: ' + (error.message || 'Unknown error')
      });
    } finally {
      setIsProcessing(prev => ({ ...prev, like: false }));
    }
  };
  
  // Handle delete playlist
  const handleDeletePlaylist = async () => {
    setIsProcessing(prev => ({ ...prev, delete: true }));
    
    try {
      const dbPlaylistId = playlist.id || playlist._id;
      const response = await playlistAPI.deletePlaylist(dbPlaylistId);
      
      if (response.success || (response.message && response.message.includes('deleted successfully'))) {
        showToast({
          type: 'success',
          message: 'Playlist deleted successfully'
        });
        
        // Redirect to user's playlists
        navigate('/playlists');
      } else {
        throw new Error(response.error?.message || 'Failed to delete playlist');
      }
    } catch (error) {
      // Check if the error message indicates a successful deletion
      if (error.message && error.message.toLowerCase().includes('deleted successfully')) {
        showToast({
          type: 'success',
          message: 'Playlist deleted successfully'
        });
        navigate('/playlists');
      } else {
        showToast({
          type: 'error',
          message: 'Failed to delete playlist: ' + (error.message || 'Unknown error')
        });
      }
    } finally {
      setIsProcessing(prev => ({ ...prev, delete: false }));
      setShowDeleteConfirm(false);
    }
  };
  
  // Handle remove anime from playlist
  const handleRemoveAnime = async () => {
    if (!animeToDelete) return;
    
    setIsProcessing(prev => ({ ...prev, removeAnime: true }));
    
    try {
      const dbPlaylistId = playlist.id || playlist._id;
      const response = await playlistAPI.removeAnimeFromPlaylist(dbPlaylistId, animeToDelete);
      
      // Handle all possible success response formats
      if (
        // Standard success flag with data
        (response && response.success) ||
        // Direct message indicating success
        (response && response.message && response.message.toLowerCase().includes('removed')) ||
        // Direct playlist object returned
        (response && response._id)
      ) {
        // Check different possible playlist formats in the response
        if (response.data && response.data.playlist) {
          // Standard response with nested playlist data
          setPlaylist(response.data.playlist);
        } else if (response.playlist) {
          // Direct playlist in response
          setPlaylist(response.playlist);
        } else if (response._id) {
          // Response is the playlist itself
          setPlaylist(response);
        } else {
          // Fallback to manual filtering if no updated playlist is provided
          setPlaylist(prev => ({
            ...prev,
            items: prev.items.filter(item => item.anime.malId !== animeToDelete),
            animeCount: prev.animeCount - 1
          }));
        }
        
        // Show success message
        showToast({
          type: 'success',
          message: response.data?.message || response.message || 'Anime removed from playlist'
        });
      } else {
        // If we've reached here, it's a genuine error
        throw new Error(
          response?.error?.message || response?.message || 'Failed to remove anime from playlist'
        );
      }
    } catch (error) {
      // Don't treat success messages as errors
      if (error.message && error.message.toLowerCase().includes('successfully') ||
          error.message && error.message.toLowerCase().includes('removed')) {
        // This is actually a success message mistakenly thrown as error
        showToast({
          type: 'success',
          message: 'Anime removed from playlist'
        });
        
        // Update the playlist state with manual filtering
        setPlaylist(prev => ({
          ...prev,
          items: prev.items.filter(item => item.anime.malId !== animeToDelete),
          animeCount: prev.animeCount - 1
        }));
      } else {
        showToast({
          type: 'error',
          message: 'Failed to remove anime: ' + (error.message || 'Unknown error')
        });
      }
    } finally {
      setIsProcessing(prev => ({ ...prev, removeAnime: false }));
      setAnimeToDelete(null);
    }
  };
  
  // Handle share playlist
  const handleShare = () => {
    // Use ID-based URL for sharing for more stability across renames
    const dbPlaylistId = playlist.id || playlist._id;
    const url = window.location.origin + `/playlist/id/${dbPlaylistId}`;
    
    if (navigator.share) {
      navigator.share({
        title: playlist.name,
        text: playlist.description || `Check out this anime playlist: ${playlist.name}`,
        url: url
      })
      .catch(() => {}); // Silent catch for share cancellations
    } else {
      navigator.clipboard.writeText(url)
        .then(() => {
          showToast({
            type: 'success',
            message: 'Link copied to clipboard'
          });
        })
        .catch(() => {
          showToast({
            type: 'error',
            message: 'Failed to copy link'
          });
        });
    }
  };
  
  // Handle edit playlist
  const handleEditSave = (updatedPlaylist) => {
    const oldPlaylist = playlist;
    
    // Update local state with new playlist data
    setPlaylist(prev => ({
      ...prev,
      name: updatedPlaylist.name,
      description: updatedPlaylist.description,
      isPublic: updatedPlaylist.isPublic,
      slug: updatedPlaylist.slug || prev.slug
    }));
    
    setShowEditModal(false);
    
    showToast({
      type: 'success',
      message: 'Playlist updated successfully'
    });
    
    // If the name changed, update the URL to use ID instead of slug
    if (oldPlaylist.name !== updatedPlaylist.name) {
      const dbPlaylistId = updatedPlaylist._id || updatedPlaylist.id;
      // Always use ID-based URL for stability
      navigate(`/playlist/id/${dbPlaylistId}`, { replace: true });
    }
  };
  
  // Handle opening MAL page for an anime
  const handleOpenMAL = (malId) => {
    navigate(`/anime/${malId}`, { target: '_blank' });
  };
  
  if (loading) {
    return (
      <Layout>
        <PageContainer>
          <ContentWrapper>
            <Card>
              <LoadingWrapper>
                <LoadingSpinner size={40} />
              </LoadingWrapper>
            </Card>
          </ContentWrapper>
        </PageContainer>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout>
        <PageContainer>
          <ContentWrapper>
            <Card>
              <EmptyState>
                <AlertTriangle size={40} />
                <h3>Error Loading Playlist</h3>
                <p>{error}</p>
              </EmptyState>
            </Card>
          </ContentWrapper>
        </PageContainer>
      </Layout>
    );
  }
  
  if (!playlist) {
    return (
      <Layout>
        <PageContainer>
          <ContentWrapper>
            <Card>
              <EmptyState>
                <AlertTriangle size={40} />
                <h3>Playlist Not Found</h3>
                <p>The playlist you're looking for doesn't exist or has been removed.</p>
              </EmptyState>
            </Card>
          </ContentWrapper>
        </PageContainer>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <PageContainer>
        <ContentWrapper>
          <PlaylistGrid>
            {/* Left sidebar with playlist info */}
            <PlaylistSidebar 
              playlist={playlist}
              isOwner={isOwner}
              isLiked={isLiked}
              likesCount={likesCount}
              formatDate={formatDateString}
              isProcessing={isProcessing}
              user={user}
              onShare={handleShare}
              onLike={handleLike}
              onEdit={() => setShowEditModal(true)}
              onDelete={() => setShowDeleteConfirm(true)}
            />
            
            {/* Right content area with anime grid */}
            <PlaylistAnimeGrid 
              playlist={playlist}
              isOwner={isOwner}
              onOpenMAL={handleOpenMAL}
              onDeleteAnime={setAnimeToDelete}
            />
          </PlaylistGrid>
        </ContentWrapper>
      </PageContainer>
      
      {/* Delete Playlist Confirmation Modal */}
      {showDeleteConfirm && (
        <ConfirmationModal
          title="Delete Playlist"
          message={`Are you sure you want to delete "${playlist.name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          isProcessing={isProcessing.delete}
          onConfirm={handleDeletePlaylist}
          onCancel={() => setShowDeleteConfirm(false)}
          isDangerous={true}
        />
      )}
      
      {/* Remove Anime Confirmation Modal */}
      {animeToDelete && (
        <ConfirmationModal
          title="Remove Anime"
          message="Are you sure you want to remove this anime from the playlist?"
          confirmLabel="Remove"
          isProcessing={isProcessing.removeAnime}
          onConfirm={handleRemoveAnime}
          onCancel={() => setAnimeToDelete(null)}
          isDangerous={true}
        />
      )}
      
      {/* Edit Playlist Modal */}
      {showEditModal && (
        <PlaylistEditModal
          playlist={playlist}
          onClose={() => setShowEditModal(false)}
          onSave={handleEditSave}
        />
      )}
    </Layout>
  );
};

export default PlaylistDetailPage; 