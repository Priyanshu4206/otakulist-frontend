import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { BookOpen, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import Card from '../common/Card';
import { playlistAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import useToast from '../../hooks/useToast';
import PlaylistCard from '../common/PlaylistCard';
import PlaylistEditModal from '../common/PlaylistEditModal';
import { useNavigate } from 'react-router-dom';

const PlaylistGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const CreateCard = styled.div`
  background-color: var(--cardBackground);
  border-radius: 12px;
  border: 2px dashed var(--borderColor);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    border-color: var(--primary);
    background-color: rgba(var(--primary-rgb), 0.05);
  }
  
  svg {
    color: var(--textSecondary);
    margin-bottom: 1rem;
  }
  
  span {
    font-size: 1rem;
    font-weight: 500;
    color: var(--textSecondary);
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  color: var(--textSecondary);
  border: 1px dashed var(--borderColor);
  border-radius: 8px;
`;

const CreateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--primary);
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  margin-top: 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: var(--primaryLight);
  }
`;

// Pagination Controls
const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 2rem;
  gap: 1rem;
`;

const PaginationButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid var(--borderColor);
  background-color: var(--cardBackground);
  color: ${props => props.disabled ? 'var(--borderColor)' : 'var(--textPrimary)'};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background-color: var(--borderColor);
  }
`;

const PageInfo = styled.div`
  font-size: 0.9rem;
  color: var(--textSecondary);
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
`;

const PlaylistsSection = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit, setLimit] = useState(12); // Number of playlists per page
  
  // Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchPlaylists();
  }, [currentPage, limit]);
  
  const fetchPlaylists = async (pageNum = 1) => {
    setLoading(true);
    
    try {
      const response = await playlistAPI.getMyPlaylists(pageNum, limit);
      
      // Check if the response is valid
      if (response && response.success) {
        // Case 1: Success with standard format
        if (response.data) {
          // Case 1a: Array directly in data field
          if (Array.isArray(response.data)) {
            setPlaylists(response.data);
            setTotalItems(response.data.length);
            setTotalPages(Math.ceil(response.data.length / limit) || 1);
          } 
          // Case 1b: Pagination object with array in data field
          else if (Array.isArray(response.data.data)) {
            setPlaylists(response.data.data);
            setTotalItems(response.data.pagination?.total || response.data.data.length);
            setTotalPages(response.data.pagination?.pages || Math.ceil(response.data.data.length / limit) || 1);
          } 
          // Case 1c: Direct items object with pagination
          else {
            setPlaylists(response.data.items || []);
            setTotalItems(response.data.pagination?.total || 0);
            setTotalPages(response.data.pagination?.pages || 1);
          }
          setError(null);
        } 
        // Case 2: Empty but successful response
        else {
          setPlaylists([]);
          setTotalItems(0);
          setTotalPages(1);
          setError(null);
        }
      } 
      // Case 3: Error in response
      else if (response && response.error) {
        setError(response.error.message || 'Failed to load playlists');
        setPlaylists([]);
      } 
      // Case 4: Unexpected response format
      else {
        setError('Unexpected response format from API');
        setPlaylists([]);
      }
    } catch (error) {
      setError('Error loading playlists: ' + (error.message || 'Unknown error'));
      setPlaylists([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreatePlaylist = () => {
    setEditingPlaylist(null);
    setShowEditModal(true);
  };
  
  const handleEditPlaylist = (playlist) => {
    setEditingPlaylist(playlist);
    setShowEditModal(true);
  };
  
  const handleDeletePlaylist = (playlistId) => {
    // PlaylistCard component handles the delete logic internally
    // Just refetch playlists after successful deletion
    showToast({
      type: 'success',
      message: 'Playlist deleted successfully'
    });
    fetchPlaylists();
  };
  
  const handleSavePlaylist = (savedPlaylist) => {
    if (!savedPlaylist) {
      console.warn("No playlist data received from edit/create operation");
      return;
    }
        
    // Close the modal
    setShowEditModal(false);
    
    // Now update the UI with the new/updated playlist
    if (editingPlaylist) {
      // Update existing playlist in the list
      setPlaylists(prevPlaylists => 
        prevPlaylists.map(p => 
          (p.id === savedPlaylist.id || p._id === savedPlaylist._id) ? savedPlaylist : p
        )
      );
    } else {
      // Add new playlist to the list
      setPlaylists(prevPlaylists => [savedPlaylist, ...prevPlaylists]);
    }
    
    // Reset editing state
    setEditingPlaylist(null);
    
    // Optionally refetch the playlist list to ensure we have the latest data
    // Adding a small delay to allow the API to update
    setTimeout(() => {
      fetchPlaylists();
    }, 300);
  };
  
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // Scroll to top when changing pages
      window.scrollTo(0, 0);
    }
  };
  
  const handlePlaylistCreated = (savedPlaylist) => {
    // Refresh the playlists list
    fetchPlaylists();
    
    // Show success message
    showToast({
      type: 'success',
      message: 'Playlist created successfully'
    });
    
    // Navigate to the playlist detail page using ID-based routing
    const playlistId = savedPlaylist._id || savedPlaylist.id;
    if (playlistId) {
      navigate(`/playlist/id/${playlistId}`);
    }
  };
  
  return (
    <>
      <Card title="Playlists" icon={<BookOpen size={18} />}>
        {loading ? (
          <LoadingContainer>
            <LoadingSpinner size={36} />
          </LoadingContainer>
        ) : error ? (
          <EmptyState>
            <p>{error}</p>
            <CreateButton onClick={handleCreatePlaylist}>
              <Plus size={16} />
              Create New Playlist
            </CreateButton>
          </EmptyState>
        ) : playlists && playlists.length > 0 ? (
          <>
            <PlaylistGrid>
              <CreateCard onClick={handleCreatePlaylist}>
                <Plus size={40} />
                <span>Create New Playlist</span>
              </CreateCard>
              
              {playlists.map(playlist => (
                <PlaylistCard
                  key={playlist.id || playlist._id}
                  playlist={playlist}
                  onEdit={handleEditPlaylist}
                  onDelete={handleDeletePlaylist}
                  refetchPlaylists={fetchPlaylists}
                />
              ))}
            </PlaylistGrid>
            
            {/* Pagination controls */}
            {totalPages > 1 && (
              <PaginationContainer>
                <PaginationButton 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={18} />
                </PaginationButton>
                
                <PageInfo>
                  Page {currentPage} of {totalPages} ({totalItems} playlists)
                </PageInfo>
                
                <PaginationButton 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight size={18} />
                </PaginationButton>
              </PaginationContainer>
            )}
          </>
        ) : (
          <EmptyState>
            <BookOpen size={48} color="var(--textSecondary)" />
            <p>You haven't created any playlists yet.</p>
            <CreateButton onClick={handleCreatePlaylist}>
              <Plus size={16} />
              Create Playlist
            </CreateButton>
          </EmptyState>
        )}
      </Card>
      
      {/* Edit/Create Playlist Modal */}
      {showEditModal && (
        <PlaylistEditModal
          playlist={editingPlaylist}
          onClose={() => setShowEditModal(false)}
          onSave={handleSavePlaylist}
        />
      )}
    </>
  );
};

export default PlaylistsSection;