import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { User, Upload, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import UserAvatar from '../common/UserAvatar';
import { userAPI } from '../../services/api';
import useAuth from '../../hooks/useAuth';
import { motion } from 'framer-motion';
import useToast from '../../hooks/useToast';

const DashboardHeader = styled(motion.div)`
  background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.15), rgba(var(--secondary-rgb), 0.15));
  padding: 2.5rem;
  border-radius: 20px;
  margin-bottom: 2.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(var(--primary-rgb), 0.1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 150px;
    height: 150px;
    background: radial-gradient(circle, rgba(var(--primary-rgb), 0.1) 0%, transparent 70%);
    border-radius: 50%;
    transform: translate(30%, -30%);
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100px;
    height: 100px;
    background: radial-gradient(circle, rgba(var(--secondary-rgb), 0.1) 0%, transparent 70%);
    border-radius: 50%;
    transform: translate(-30%, 30%);
  }
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    margin-top: 1rem;
    margin-bottom: 1.5rem;
  }
  
  @media (max-width: 480px) {
    padding: 1.25rem;
    border-radius: 16px;
    margin-top: 0.5rem;
    margin-bottom: 1rem;
  }
`;

const WelcomeMessage = styled.div`
  margin-bottom: 1.5rem;
  
  @media (max-width: 480px) {
    margin-bottom: 1rem;
  }
`;

const Greeting = styled.h1`
  font-size: 2.75rem;
  font-weight: 800;
  margin-bottom: 0.75rem;
  color: var(--textPrimary);
  background: var(--gradientPrimary);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  
  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.75rem;
  }
`;

const SubGreeting = styled.p`
  font-size: 1.1rem;
  color: var(--textSecondary);
  max-width: 700px;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    line-height: 1.5;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 1.25rem;
  margin-top: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    margin-top: 1rem;
    width: 100%;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const AvatarSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  
  @media (max-width: 768px) {
    margin-bottom: 1rem;
  }
`;

const AvatarWrapper = styled.div`
  position: relative;
  margin-bottom: 1rem;
  cursor: pointer;
`;

const AvatarOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: 1;
  }
`;

const AvatarInput = styled.input`
  display: none;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  
  @media (max-width: 480px) {
    margin-bottom: 1rem;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--textPrimary);
  
  @media (max-width: 480px) {
    margin-bottom: 0.35rem;
    font-size: 0.9rem;
  }
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
    border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(70, 54, 113, 0.2);
  }
  
  @media (max-width: 480px) {
    padding: 0.65rem 0.85rem;
    font-size: 0.9rem;
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
    border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(70, 54, 113, 0.2);
  }
  
  @media (max-width: 480px) {
    padding: 0.65rem 0.85rem;
    font-size: 0.9rem;
    min-height: 80px;
  }
`;

const Button = styled.button`
  background-color: var(--primary);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background-color: var(--primaryLight);
  }
  
  &:disabled {
    background-color: var(--textSecondary);
    cursor: not-allowed;
  }
  
  @media (max-width: 480px) {
    width: 100%;
    justify-content: center;
    padding: 0.7rem 1rem;
  }
`;

const ViewProfileButton = styled(Link)`
  background-color: var(--cardBackground);
  color: var(--textPrimary);
  border: 1px solid var(--borderColor);
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  
  &:hover {
    background-color: var(--backgroundLight);
    border-color: var(--primary);
  }
  
  @media (max-width: 480px) {
    width: 100%;
    justify-content: center;
    padding: 0.7rem 1rem;
  }
`;

const ProfileSummary = styled(Card)`
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  text-align: center;
  border: 1px solid var(--borderColor);
  box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.1);
  
  h2 {
    margin: 0.5rem 0 0.25rem;
    font-weight: 700;
    font-size: 2rem;
    
    @media (max-width: 480px) {
      font-size: 1.5rem;
    }
  }
  
  .username {
    color: var(--textSecondary);
    font-size: 1.1rem;
    margin-bottom: 8px;
    
    @media (max-width: 480px) {
      font-size: 0.9rem;
    }
  }
  
  .bio {
    color: var(--textPrimary);
    margin-bottom: 12px;
    padding: 0 1rem;
    
    @media (max-width: 480px) {
      font-size: 0.9rem;
    }
  }
`;

const EditProfileCard = styled(Card)`
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  margin-top: 0;
`;

const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  // Support both user and user.user (from /auth/me)
  const userData = user || {};

  const [formData, setFormData] = useState({
    displayName: '',
    bio: ''
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (userData) {
      setFormData({
        displayName: userData.displayName || '',
        bio: userData.bio || ''
      });
      if (userData.avatarUrl) {
        setAvatarPreview(userData.avatarUrl);
      }
    }
  }, [userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append('displayName', formData.displayName);
      data.append('bio', formData.bio);
      if (avatar) {
        data.append('avatar', avatar);
      }
      const response = await userAPI.updateProfile(data);
      if (response.success) {
        // await refreshUser();
        showToast({ type: 'success', message: 'Profile updated successfully!' });
      } else {
        showToast({ type: 'error', message: response.message || 'Failed to update profile' });
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      showToast({ type: 'error', message: err.message || 'An error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DashboardHeader
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <WelcomeMessage>
          <Greeting>Profile Settings</Greeting>
          <SubGreeting>
            Update your display name, bio, or avatar below. For stats, playlists, and watchlist, use the tabs above.
          </SubGreeting>
        </WelcomeMessage>
      </DashboardHeader>
      <Row>
        {/* Profile Summary Card */}
        <ProfileSummary>
          <UserAvatar
            src={userData.avatarUrl}
            alt={userData.displayName || userData.username}
            size={110}
            showBorder
            style={{ margin: '0 auto', marginBottom: 16 }}
          />
          <h2>{userData.displayName || userData.username}</h2>
          <div className="username">@{userData.username}</div>
          {userData.bio && <div className="bio">{userData.bio}</div>}
          <ViewProfileButton to={`/user/${userData.username}`} style={{ marginTop: 8 }}>
            <ExternalLink size={16} />
            View Public Profile
          </ViewProfileButton>
        </ProfileSummary>

        {/* Edit Profile Card */}
        <EditProfileCard
          title="Edit Profile"
          icon={<User size={18} />}
        >
          <form onSubmit={handleSubmit}>
            <FormGrid>
              <AvatarSection>
                <AvatarWrapper>
                  <UserAvatar
                    src={avatarPreview}
                    alt={formData.displayName}
                    size={120}
                  />
                  <AvatarOverlay onClick={() => document.getElementById('avatar').click()}>
                    <Upload color="white" size={24} />
                  </AvatarOverlay>
                  <AvatarInput
                    type="file"
                    id="avatar"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </AvatarWrapper>
                <Label htmlFor="avatar" style={{ cursor: 'pointer', textAlign: 'center' }}>
                  Change Avatar
                </Label>
                <small style={{ color: 'var(--textSecondary)', marginTop: '0.5rem', textAlign: 'center' }}>
                  JPG, PNG or WebP, max 2MB
                </small>
              </AvatarSection>
              <div>
                <FormGroup>
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    type="text"
                    id="displayName"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleChange}
                    placeholder="Your display name"
                  />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="bio">Bio</Label>
                  <TextArea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us about yourself..."
                    maxLength={500}
                  />
                  <small style={{ color: 'var(--textSecondary)', display: 'block', marginTop: '0.5rem', textAlign: 'right' }}>
                    {formData.bio.length}/500
                  </small>
                </FormGroup>
                <FormGroup>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </FormGroup>
              </div>
            </FormGrid>
          </form>
        </EditProfileCard>
      </Row>
    </>
  );
};

export default ProfilePage; 