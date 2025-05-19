import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Plus, Loader, BookOpen } from 'lucide-react';
import PlaylistCard from '../common/PlaylistCard';
import { playlistAPI } from '../../services/api';
import useToast from '../../hooks/useToast';
import PlaylistEditModal from '../common/PlaylistEditModal';

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  width: 100%;
  
  svg {
    animation: spin 1s linear infinite;
    color: var(--primary);
    
    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  }
`;

const CreateCardButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(var(--backgroundLight-rgb), 0.5);
  border: 2px dashed var(--borderColor);
  border-radius: 12px;
  min-height: 300px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(var(--primary-rgb), 0.1);
    border-color: var(--primary);
    transform: translateY(-5px);
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

const EmptyMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  width: 100%;
  text-align: center;
  padding: 2rem;
  background: var(--cardBackground);
  border-radius: 12px;
  margin: 1rem 0;
  
  svg {
    color: var(--textSecondary);
    margin-bottom: 1rem;
    opacity: 0.7;
  }
  
  h3 {
    font-size: 1.2rem;
    color: var(--textPrimary);
    margin-bottom: 0.5rem;
  }
  
  p {
    color: var(--textSecondary);
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--textPrimary);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    color: var(--primary);
  }
`;

const PlaylistsGrid = ({ username, isPublic = false, refreshTrigger }) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const { showToast } = useToast();
  
  // Fetch playlists based on the context (my playlists, user's playlists, public playlists)
  useEffect(() => {
    const fetchPlaylists = async () => {
      setLoading(true);
      
      try {
        let response;
        
        if (isPublic) {
          response = await playlistAPI.getPublicPlaylists();
        } else if (username) {
          response = await playlistAPI.getUserPlaylists(username);
        } else {
          response = await playlistAPI.getMyPlaylists();
        }
        
        if (response.success) {
          setPlaylists(response?.data?.items || []);
          setError(null);
        } else {
          throw new Error(response.error?.message || 'Failed to fetch playlists');
        }
      } catch (error) {
        console.error('Error fetching playlists:', error);
        setError('Failed to load playlists');
        
        showToast({
          type: 'error',
          message: 'Failed to load playlists'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlaylists();
  }, [username, isPublic, refreshTrigger, showToast]);
  
  // Handle playlist deletion
  const handleDeletePlaylist = (playlistId) => {
    setPlaylists(playlists.filter(p => p.id !== playlistId));
  };
  
  // Handle create new playlist
  const handleCreateNew = () => {
    setShowCreateModal(true);
  };
  
  // Handle edit playlist
  const handleEditPlaylist = (playlist) => {
    setEditingPlaylist(playlist);
  };
  
  // Handle save new playlist
  const handleCreateSave = (newPlaylist) => {
    setPlaylists([newPlaylist, ...playlists]);
    setShowCreateModal(false);
  };
  
  // Handle edit save
  const handleEditSave = (updatedPlaylist) => {
    setPlaylists(playlists.map(p => 
      p.id === updatedPlaylist.id ? updatedPlaylist : p
    ));
    setEditingPlaylist(null);
  };
  
  if (loading) {
    return (
      <LoadingContainer>
        <Loader size={40} />
      </LoadingContainer>
    );
  }
  
  if (error) {
    return (
      <EmptyMessage>
        <BookOpen size={40} />
        <h3>Couldn't Load Playlists</h3>
        <p>{error}</p>
      </EmptyMessage>
    );
  }
  
  // Use Array.isArray to properly check if playlists exist and have items
  if (!playlists || !Array.isArray(playlists) || playlists.length === 0) {
    return (
      <>
        <SectionTitle>
          <BookOpen size={24} />
          {isPublic ? 'Public Playlists' : username ? `${username}'s Playlists` : 'My Playlists'}
        </SectionTitle>
        
        <EmptyMessage>
          <BookOpen size={40} />
          <h3>No Playlists Yet</h3>
          {!isPublic && !username && (
            <p>Create your first playlist to organize your favorite anime!</p>
          )}
          {isPublic && (
            <p>There are no public playlists available yet.</p>
          )}
          {username && (
            <p>This user hasn't created any playlists yet.</p>
          )}
        </EmptyMessage>
        
        {!isPublic && !username && (
          <CreateCardButton onClick={handleCreateNew}>
            <Plus size={40} />
            <span>Create New Playlist</span>
          </CreateCardButton>
        )}
        
        {showCreateModal && (
          <PlaylistEditModal
            onClose={() => setShowCreateModal(false)}
            onSave={handleCreateSave}
          />
        )}
      </>
    );
  }
  
  return (
    <>
      <SectionTitle>
        <BookOpen size={24} />
        {isPublic ? 'Public Playlists' : username ? `${username}'s Playlists` : 'My Playlists'}
      </SectionTitle>
      
      <GridContainer>
        {!isPublic && !username && (
          <CreateCardButton onClick={handleCreateNew}>
            <Plus size={40} />
            <span>Create New Playlist</span>
          </CreateCardButton>
        )}
        
        {playlists.map(playlist => (
          <PlaylistCard
            key={playlist.id}
            playlist={playlist}
            onDelete={handleDeletePlaylist}
            onEdit={handleEditPlaylist}
          />
        ))}
      </GridContainer>
      
      {showCreateModal && (
        <PlaylistEditModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateSave}
        />
      )}
      
      {editingPlaylist && (
        <PlaylistEditModal
          playlist={editingPlaylist}
          onClose={() => setEditingPlaylist(null)}
          onSave={handleEditSave}
        />
      )}
    </>
  );
};

export default PlaylistsGrid; 