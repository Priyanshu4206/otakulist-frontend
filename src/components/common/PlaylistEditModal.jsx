import { useState } from 'react';
import styled from 'styled-components';
import { X, Save, Loader } from 'lucide-react';
import { playlistAPI } from '../../services/api';
import useToast from '../../hooks/useToast';
import { createPortal } from 'react-dom';

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
  max-width: 500px;
  width: 100%;
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
  background: linear-gradient(135deg, rgba(32, 34, 53, 0.9), rgba(25, 27, 43, 0.9));
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--textSecondary);
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  font-size: 0.95rem;
  border: 1px solid var(--borderColor);
  border-radius: 8px;
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
  font-size: 0.95rem;
  border: 1px solid var(--borderColor);
  border-radius: 8px;
  background: var(--inputBackground);
  color: var(--textPrimary);
  min-height: 120px;
  resize: vertical;
  transition: all 0.2s ease;
  
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

const SwitchLabel = styled.div`
  font-size: 0.95rem;
  color: var(--textPrimary);
  display: flex;
  flex-direction: column;
  
  span {
    font-size: 0.8rem;
    color: var(--textSecondary);
    margin-top: 0.25rem;
  }
`;

const Switch = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
  
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
  border-radius: 26px;
  
  &:before {
    position: absolute;
    content: "";
    height: 20px;
    width: 20px;
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
    transform: translateX(24px);
  }
`;

const ModalFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--borderColor);
  background: rgba(var(--backgroundLight-rgb), 0.3);
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CancelButton = styled(Button)`
  background: none;
  border: 1px solid var(--borderColor);
  color: var(--textSecondary);
  
  &:hover:not(:disabled) {
    background: var(--inputBackground);
    color: var(--textPrimary);
  }
`;

const SaveButton = styled(Button)`
  background: var(--primary);
  color: white;
  border: none;
  
  &:hover:not(:disabled) {
    background: var(--primaryLight);
  }
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

const ErrorMessage = styled.p`
  color: var(--error);
  font-size: 0.85rem;
  margin-top: 0.5rem;
  margin-bottom: 0;
`;

const PlaylistEditModal = ({ playlist, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: playlist?.name || '',
    description: playlist?.description || '',
    isPublic: playlist?.isPublic !== undefined ? playlist.isPublic : true
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name must be less than 100 characters';
    }
    
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      let response;
      
      if (playlist) {
        // Update existing playlist
        const playlistId = playlist.id || playlist._id;
        response = await playlistAPI.updatePlaylist(playlistId, {
          name: formData.name,
          description: formData.description,
          isPublic: formData.isPublic
        });
      } else {
        // Create new playlist
        response = await playlistAPI.createPlaylist({
          name: formData.name,
          description: formData.description,
          isPublic: formData.isPublic
        });
      }
      
      // Check if response exists and has success property
      if (response && response.success) {
        // Always close modal first before showing success message
        onClose();
        
        // Get the updated playlist data
        const updatedPlaylist = response.data;
        
        // Then call onSave callback with the data
        if (onSave) {
          setTimeout(() => {
            onSave(updatedPlaylist);
          }, 100);
        } else {
          // Show success toast after modal is closed
          setTimeout(() => {
            showToast({
              type: 'success',
              message: playlist ? 'Playlist updated successfully' : 'Playlist created successfully'
            });
          }, 100);
        }
      } else {
        // Handle error
        setLoading(false);
        
        if (response?.error?.message?.includes('already have a playlist')) {
          setErrors(prev => ({ ...prev, name: 'You already have a playlist with this name' }));
        } else {
          // Close modal first before showing error
          onClose();
          
          setTimeout(() => {
            showToast({
              type: 'error',
              message: 'Failed to ' + (playlist ? 'update' : 'create') + ' playlist: ' + 
                (response?.error?.message || 'Unknown error')
            });
          }, 100);
        }
      }
    } catch (error) {
      setLoading(false);
      
      // Handle specific errors
      if (error.message && error.message.includes('already have a playlist')) {
        setErrors(prev => ({ ...prev, name: 'You already have a playlist with this name' }));
      } else {
        // Always close modal before showing error
        onClose();
        
        // Show error toast with slight delay to ensure modal is closed
        setTimeout(() => {
          showToast({
            type: 'error',
            message: 'Failed to save playlist: ' + (error.message || 'Unknown error')
          });
        }, 100);
      }
    }
  };
  
  // Render using createPortal to ensure modal is rendered at the top level of the DOM
  // This prevents z-index issues with other elements
  if (typeof document === 'undefined') {
    return null; // Return null during SSR
  }

  return createPortal(
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            <ModalTitle>{playlist ? 'Edit Playlist' : 'Create Playlist'}</ModalTitle>
            <CloseButton onClick={onClose} type="button">
              <X size={20} />
            </CloseButton>
          </ModalHeader>
          
          <ModalBody>
            <FormGroup>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter playlist name"
                maxLength={100}
              />
              {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="description">Description</Label>
              <TextArea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your playlist..."
                maxLength={500}
              />
              {errors.description && <ErrorMessage>{errors.description}</ErrorMessage>}
            </FormGroup>
            
            <FormGroup>
              <SwitchContainer>
                <SwitchLabel>
                  Make playlist public
                  <span>Anyone can view public playlists</span>
                </SwitchLabel>
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
            <CancelButton type="button" onClick={onClose} disabled={loading}>
              Cancel
            </CancelButton>
            <SaveButton type="submit" disabled={loading}>
              {loading ? (
                <>
                  <LoadingSpinner size={18} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  {playlist ? 'Save Changes' : 'Create Playlist'}
                </>
              )}
            </SaveButton>
          </ModalFooter>
        </form>
      </ModalContent>
    </ModalOverlay>,
    document.body
  );
};

export default PlaylistEditModal; 