import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { X, Plus, Save, Loader, BookOpen } from 'lucide-react';
import { playlistAPI } from '../../services/modules';
import useToast from '../../hooks/useToast';
import useAuth from '../../hooks/useAuth';
import CustomSelect from './CustomSelect';
import { createPortal } from 'react-dom';

// All styled components remain the same...
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: var(--cardBackground);
  border-radius: 12px;
  max-width: 450px;
  width: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  animation: slideIn 0.3s ease-out;
  
  @keyframes slideIn {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--borderColor);
  background: linear-gradient(to right, rgba(var(--primary-rgb), 0.1), transparent);
`;

const ModalTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--textPrimary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
    background: rgba(var(--textSecondary-rgb), 0.1);
    color: var(--textPrimary);
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
`;

const ModalFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--borderColor);
  background-color: rgba(var(--backgroundLight-rgb), 0.3);
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CancelButton = styled(Button)`
  background: var(--backgroundLight);
  color: var(--textSecondary);
  
  &:hover:not(:disabled) {
    background: var(--borderColor);
  }
`;

const SaveButton = styled(Button)`
  background: var(--primary);
  color: white;
  
  &:hover:not(:disabled) {
    background: var(--primaryLight);
  }
`;

const SectionTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: var(--textPrimary);
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(to right, var(--borderColor), transparent);
    margin-left: 0.5rem;
  }
`;

const PlaylistSelectWrapper = styled.div`
  margin-bottom: 1.5rem;
`;

const NewPlaylistSection = styled.div`
  margin-top: 1rem;
  background-color: rgba(var(--backgroundLight-rgb), 0.3);
  padding: 1.25rem;
  border-radius: 8px;
  border: 1px solid var(--borderColor);
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--textSecondary);
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  font-size: 0.9rem;
  border: 1px solid var(--borderColor);
  border-radius: 6px;
  background: var(--inputBackground);
  color: var(--textPrimary);
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.2);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  font-size: 0.9rem;
  border: 1px solid var(--borderColor);
  border-radius: 6px;
  background: var(--inputBackground);
  color: var(--textPrimary);
  transition: all 0.2s ease;
  min-height: 80px;
  max-height: 80px;
  resize: none;
  
  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.2);
  }
`;

const SwitchContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SwitchLabel = styled.span`
  font-size: 0.9rem;
  color: var(--textSecondary);
`;

const Switch = styled.label`
  position: relative;
  display: inline-block;
  width: 46px;
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
  transition: .3s;
  border-radius: 24px;
  
  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: .3s;
    border-radius: 50%;
  }
  
  input:checked + & {
    background-color: var(--primary);
  }
  
  input:checked + &:before {
    transform: translateX(22px);
  }
`;

const SwitchButton = styled.button`
  background: none;
  border: none;
  color: var(--primary);
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

const MessageContainer = styled.div`
  padding: 1.5rem;
  text-align: center;
  color: var(--textSecondary);
`;

const LoadingSpinner = styled(Loader)`
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const PlaylistAddModal = ({
  show,
  onClose,
  anime,
  isScheduleAnime = false
}) => {
  const { user, refreshUserData } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const [showNewPlaylistForm, setShowNewPlaylistForm] = useState(false);
  const [playlists, setPlaylists] = useState([]);

  const [newPlaylistData, setNewPlaylistData] = useState({
    name: '',
    description: '',
    isPublic: true
  });

  // Get anime details based on the source (anime page vs schedule page)
  const animeId = isScheduleAnime ? anime?.malId : anime?.malId || anime?.mal_id || anime?.id || anime?._id;
  
  // This effect runs whenever the show prop changes
  useEffect(() => {
    if (show) {
      // Reset all states when modal opens
      setSelectedPlaylistId(null);
      setShowNewPlaylistForm(false);
      setLoading(true); // Set loading while fetching playlists
      setNewPlaylistData({
        name: '',
        description: '',
        isPublic: true
      });

      // Fetch playlists from API instead of user object
      (async () => {
        const response = await playlistAPI.getMyPlaylists(1, 100); // Fetch up to 100 playlists
        if (response.success) {
          setPlaylists(response?.data?.items || []);
        } else {
          setPlaylists([]);
          showToast({
            type: 'error',
            message: response.error?.message || 'Failed to fetch playlists'
          });
        }
        setLoading(false);
      })();
    }
  }, [show, showToast]);

  const handleSelectPlaylist = (id) => {
    setSelectedPlaylistId(id);
  };

  const toggleNewPlaylistForm = () => {
    setShowNewPlaylistForm(!showNewPlaylistForm);
    setSelectedPlaylistId(null);
  };

  const handleNewPlaylistChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewPlaylistData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addAnimeToExistingPlaylist = async () => {
    setLoading(true);

    try {
      const response = await playlistAPI.addAnimeToPlaylist(selectedPlaylistId, animeId);

      // Always refresh user data first to get the latest playlists
      const updatedUserData = await refreshUserData();
      
      // Update local playlists state if user data was refreshed successfully
      if (updatedUserData && updatedUserData.playlists) {
        setPlaylists(updatedUserData.playlists);
      }

      if (response.success) {
        // Store toast message data
        const toastMessage = {
          type: 'success',
          message: response.data?.message || 'Anime added to playlist successfully'
        };

        // Close modal first
        onClose();

        // Show toast after modal closes
        setTimeout(() => {
          showToast(toastMessage);
        }, 100);
      } else {
        // Set loading to false before showing error
        setLoading(false);

        // Close modal first
        onClose();
        
        showToast({
          type: 'error',
          message: response.error?.message || 'Failed to add anime to playlist'
        });
      }
    } catch (error) {
      console.error('Error adding anime to playlist:', error);
      setLoading(false);
      
      // Close modal first
      onClose();

      showToast({
        type: 'error',
        message: 'An error occurred while adding anime to playlist'
      });
    }
  };

  const createNewPlaylistWithAnime = async () => {
    if (!newPlaylistData.name.trim()) {
      showToast({
        type: 'error',
        message: 'Please enter a playlist name'
      });
      return;
    }

    setLoading(true);

    try {
      // Use the quick create+add endpoint
      const response = await playlistAPI.createOrAddToPlaylist({
        playlistName: newPlaylistData.name,
        animeId: animeId,
        description: newPlaylistData.description,
        isPublic: newPlaylistData.isPublic
      });

      // Always refresh user data first to get the latest playlists
      const updatedUserData = await refreshUserData();
      
      // Update local playlists state if user data was refreshed successfully
      if (updatedUserData && updatedUserData.playlists) {
        setPlaylists(updatedUserData.playlists);
      }

      if (response.success) {
        const status = response.data?.message;
        let message = 'Anime added to playlist successfully';

        if (status === 'created_new') {
          message = 'Created new playlist with anime';
        } else if (status === 'added_to_existing') {
          message = 'Added anime to existing playlist';
        } else if (status === 'already_exists') {
          message = 'Anime is already in this playlist';
        }

        // Store toast message
        const toastMessage = {
          type: 'success',
          message
        };

        // Close modal first
        onClose();

        // Show toast after modal closes
        setTimeout(() => {
          showToast(toastMessage);
        }, 100);
      } else {
        // Set loading to false before showing error
        setLoading(false);

        // Close modal first
        onClose();

        showToast({
          type: 'error',
          message: response.error?.message || 'Failed to create playlist'
        });
      }
    } catch (error) {
      console.error('Error creating playlist:', error);
      setLoading(false);
      
      // Close modal first
      onClose();

      showToast({
        type: 'error',
        message: 'An error occurred while creating the playlist'
      });
    }
  };

  const handleSubmit = () => {
    if (showNewPlaylistForm) {
      createNewPlaylistWithAnime();
    } else if (selectedPlaylistId) {
      addAnimeToExistingPlaylist();
    }
  };

  // Helper to determine if the "Add" button should be disabled
  const isAddButtonDisabled = () => {
    if (loading) return true;
    if (showNewPlaylistForm) return !newPlaylistData.name.trim();
    return !selectedPlaylistId;
  };

  // Format playlists for CustomSelect component
  const playlistOptions = playlists.map(playlist => ({
    value: playlist._id,
    label: playlist.name
  }));

  // If not open, don't render anything
  if (!show) return null;

  const handleClose = () => {
    setLoading(false); // Force loading to false when closing
    onClose();
  };

  const handleOverlayClick = () => {
    setLoading(false); // Force loading to false when closing via overlay
    onClose();
  };

  // Use createPortal to render the modal at the root DOM level
  return createPortal(
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            <BookOpen size={20} />
            Add to Playlist
          </ModalTitle>
          <CloseButton onClick={handleClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          {!showNewPlaylistForm ? (
            <>
              <SectionTitle>
                <BookOpen size={16} />
                Select Playlist
              </SectionTitle>

              {playlists.length > 0 ? (
                <>
                  <PlaylistSelectWrapper>
                    <CustomSelect
                      options={playlistOptions}
                      value={selectedPlaylistId}
                      onChange={handleSelectPlaylist}
                      placeholder="Choose a playlist"
                      variant="filled"
                    />
                  </PlaylistSelectWrapper>

                  <SwitchButton onClick={toggleNewPlaylistForm}>
                    <Plus size={16} />
                    Create New Playlist Instead
                  </SwitchButton>
                </>
              ) : (
                <MessageContainer>
                  <p>You don't have any playlists yet.</p>
                  <SwitchButton onClick={toggleNewPlaylistForm}>
                    <Plus size={16} />
                    Create New Playlist
                  </SwitchButton>
                </MessageContainer>
              )}
            </>
          ) : (
            <NewPlaylistSection>
              <SectionTitle>
                <Plus size={16} />
                Create New Playlist
              </SectionTitle>

              <FormGroup>
                <Label htmlFor="name">Name</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={newPlaylistData.name}
                  onChange={handleNewPlaylistChange}
                  placeholder="Enter playlist name"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="description">Description</Label>
                <TextArea
                  id="description"
                  name="description"
                  value={newPlaylistData.description}
                  onChange={handleNewPlaylistChange}
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
                      checked={newPlaylistData.isPublic}
                      onChange={handleNewPlaylistChange}
                    />
                    <Slider />
                  </Switch>
                </SwitchContainer>
              </FormGroup>

              {playlists.length > 0 && (
                <SwitchButton onClick={toggleNewPlaylistForm}>
                  Back to Existing Playlists
                </SwitchButton>
              )}
            </NewPlaylistSection>
          )}
        </ModalBody>

        <ModalFooter>
          <CancelButton onClick={handleClose}>
            Cancel
          </CancelButton>

          <SaveButton
            onClick={handleSubmit}
            disabled={isAddButtonDisabled()}
          >
            {loading ? (
              <>
                <LoadingSpinner size={16} />
                Processing...
              </>
            ) : (
              <>
                <Save size={16} />
                {showNewPlaylistForm ? 'Create & Add' : 'Add to Playlist'}
              </>
            )}
          </SaveButton>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>,
    document.body
  );
};

export default PlaylistAddModal;