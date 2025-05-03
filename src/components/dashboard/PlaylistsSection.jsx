import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { BookOpen, Edit2, Trash2, X, Plus, Film, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import Card from '../common/Card';
import { playlistAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const PlaylistGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const PlaylistCard = styled.div`
  background-color: var(--cardBackground);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--borderColor);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  position: relative;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    
    .card-actions {
      opacity: 1;
    }
  }
`;

const PlaylistCover = styled.div`
  position: relative;
  height: 150px;
  overflow: hidden;
  background-color: var(--primaryLight);
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const PlaylistInfo = styled.div`
  padding: 1rem;
`;

const PlaylistTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--textPrimary);
  margin: 0 0 0.5rem 0;
`;

const PlaylistDescription = styled.p`
  font-size: 0.85rem;
  color: var(--textSecondary);
  margin: 0 0 1rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PlaylistStats = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--textSecondary);
`;

const PlaylistActions = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s ease;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background-color: var(--cardBackground);
  color: var(--textSecondary);
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  &:hover {
    color: ${props => props.danger ? 'var(--danger)' : 'var(--tertiary)'};
    transform: scale(1.1);
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
  background-color: var(--tertiary);
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
    background-color: var(--tertiaryLight);
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

// Edit modal
const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: ${props => props.show ? 'flex' : 'none'};
  justify-content: center;
  align-items: center;
  z-index: 100;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background-color: var(--cardBackground);
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--borderColor);
`;

const ModalTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--textPrimary);
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--textSecondary);
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--inputBackground);
    color: var(--textPrimary);
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
`;

const ModalFooter = styled.div`
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--borderColor);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.25rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--textPrimary);
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--borderColor);
  border-radius: 4px;
  background-color: var(--inputBackground);
  color: var(--textPrimary);
  font-size: 1rem;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: var(--tertiary);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--borderColor);
  border-radius: 4px;
  background-color: var(--inputBackground);
  color: var(--textPrimary);
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: var(--tertiary);
  }
`;

const Switch = styled.label`
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
  
  input {
    opacity: 0;
    width: 0;
    height: 0;
  }
`;

const Slider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--borderColor);
  transition: 0.4s;
  border-radius: 24px;
  
  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: var(--white);
    transition: 0.4s;
    border-radius: 50%;
  }
  
  input:checked + & {
    background-color: var(--tertiary);
  }
  
  input:checked + &:before {
    transform: translateX(24px);
  }
`;

const SwitchContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SwitchLabel = styled.span`
  font-weight: 500;
  color: var(--textPrimary);
`;

const CancelButton = styled.button`
  background-color: var(--cardBackground);
  color: var(--textPrimary);
  border: 1px solid var(--borderColor);
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--borderColor);
  }
`;

const SaveButton = styled.button`
  background-color: var(--tertiary);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: var(--tertiaryLight);
  }
  
  &:disabled {
    background-color: var(--textSecondary);
    cursor: not-allowed;
  }
`;

const DeleteButton = styled.button`
  background-color: var(--danger);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin-right: auto;
  
  &:hover {
    background-color: var(--dangerDark);
  }
`;

const ConfirmDeleteModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: ${props => props.show ? 'flex' : 'none'};
  justify-content: center;
  align-items: center;
  z-index: 101;
  padding: 1rem;
`;

const ConfirmDeleteContent = styled.div`
  background-color: var(--cardBackground);
  border-radius: 8px;
  width: 100%;
  max-width: 400px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit, setLimit] = useState(12); // Number of playlists per page
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPlaylist, setCurrentPlaylist] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: true
  });
  
  useEffect(() => {
    fetchPlaylists();
  }, [currentPage, limit]);
  
  const fetchPlaylists = async () => {
    setLoading(true);
    try {
      // Use updated pagination API
      const response = await playlistAPI.getMyPlaylists(currentPage, limit);
      
      if (response.success) {
        setPlaylists(response.data || []);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotalItems(response.pagination?.totalItems || 0);
      }
    } catch (error) {
      console.error('Error fetching playlists:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreatePlaylist = () => {
    setCurrentPlaylist(null);
    setFormData({
      name: '',
      description: '',
      isPublic: true
    });
    setShowModal(true);
  };
  
  const handleEditPlaylist = (playlist) => {
    setCurrentPlaylist(playlist);
    setFormData({
      name: playlist.name,
      description: playlist.description || '',
      isPublic: playlist.isPublic
    });
    setShowModal(true);
  };
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSave = async () => {
    setIsSubmitting(true);
    
    try {
      if (currentPlaylist) {
        // Update existing playlist
        const response = await playlistAPI.updatePlaylist(currentPlaylist.id, formData);
        
        if (response.success) {
          fetchPlaylists();
          setShowModal(false);
        }
      } else {
        // Create new playlist
        const response = await playlistAPI.createPlaylist(formData);
        
        if (response.success) {
          fetchPlaylists();
          setShowModal(false);
        }
      }
    } catch (error) {
      console.error('Error saving playlist:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const promptDelete = () => {
    setShowDeleteConfirm(true);
  };
  
  const handleDelete = async () => {
    setIsSubmitting(true);
    
    try {
      const response = await playlistAPI.deletePlaylist(currentPlaylist.id);
      
      if (response.success) {
        setShowDeleteConfirm(false);
        setShowModal(false);
        fetchPlaylists();
      }
    } catch (error) {
      console.error('Error deleting playlist:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // Scroll to top when changing pages
      window.scrollTo(0, 0);
    }
  };
  
  return (
    <>
      <Card title="Playlists" icon={<BookOpen size={18} />}>
        {loading ? (
          <LoadingContainer>
            <LoadingSpinner size={36} />
          </LoadingContainer>
        ) : playlists.length > 0 ? (
          <>
            <PlaylistGrid>
              {playlists.map(playlist => (
                <PlaylistCard key={playlist.id}>
                  <PlaylistCover>
                    {playlist.coverImage ? (
                      <img src={playlist.coverImage} alt={playlist.name} />
                    ) : (
                      <div style={{ 
                        width: '100%', 
                        height: '100%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                      }}>
                        <BookOpen size={48} color="var(--primary)" />
                      </div>
                    )}
                  </PlaylistCover>
                  
                  <PlaylistActions className="card-actions">
                    <ActionButton onClick={() => handleEditPlaylist(playlist)}>
                      <Edit2 size={16} />
                    </ActionButton>
                  </PlaylistActions>
                  
                  <PlaylistInfo>
                    <PlaylistTitle>{playlist.name}</PlaylistTitle>
                    <PlaylistDescription>{playlist.description || 'No description'}</PlaylistDescription>
                    <PlaylistStats>
                      <Film size={14} /> {playlist.animeCount || 0} anime 
                      {!playlist.isPublic && 
                        <span style={{ marginLeft: 'auto', opacity: 0.7 }}>• Private</span>
                      }
                    </PlaylistStats>
                  </PlaylistInfo>
                </PlaylistCard>
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
        
        {playlists.length > 0 && (
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <CreateButton onClick={handleCreatePlaylist}>
              <Plus size={16} />
              Create New Playlist
            </CreateButton>
          </div>
        )}
      </Card>
      
      {/* Edit/Create Playlist Modal */}
      <Modal show={showModal}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>
              {currentPlaylist ? 'Edit Playlist' : 'Create Playlist'}
            </ModalTitle>
            <CloseButton onClick={() => setShowModal(false)}>
              <X size={20} />
            </CloseButton>
          </ModalHeader>
          
          <ModalBody>
            <FormGroup>
              <Label htmlFor="name">Name</Label>
              <Input 
                type="text" 
                id="name" 
                name="name" 
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter playlist name"
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="description">Description</Label>
              <TextArea 
                id="description" 
                name="description" 
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe what this playlist is about..."
              />
            </FormGroup>
            
            <FormGroup>
              <SwitchContainer>
                <SwitchLabel>Make playlist public</SwitchLabel>
                <Switch>
                  <input 
                    type="checkbox" 
                    name="isPublic"
                    checked={formData.isPublic}
                    onChange={handleChange}
                  />
                  <Slider />
                </Switch>
              </SwitchContainer>
            </FormGroup>
          </ModalBody>
          
          <ModalFooter>
            {currentPlaylist && (
              <DeleteButton onClick={promptDelete}>
                <Trash2 size={16} />
                Delete
              </DeleteButton>
            )}
            
            <CancelButton onClick={() => setShowModal(false)}>
              Cancel
            </CancelButton>
            
            <SaveButton onClick={handleSave} disabled={isSubmitting || !formData.name.trim()}>
              {isSubmitting ? 'Saving...' : (
                <>
                  <Save size={16} />
                  {currentPlaylist ? 'Save' : 'Create'}
                </>
              )}
            </SaveButton>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal show={showDeleteConfirm}>
        <ConfirmDeleteContent>
          <h3>Delete Playlist?</h3>
          <p>
            Are you sure you want to delete <strong>{currentPlaylist?.name}</strong>? This action cannot be undone.
          </p>
          <ModalFooter>
            <CancelButton onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </CancelButton>
            <DeleteButton onClick={handleDelete} disabled={isSubmitting}>
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </DeleteButton>
          </ModalFooter>
        </ConfirmDeleteContent>
      </ConfirmDeleteModal>
    </>
  );
};

export default PlaylistsSection;