import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { User, Save, Upload, Check, X, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import UserAvatar from '../common/UserAvatar';
import { userAPI, genreAPI } from '../../services/api';
import useAuth from '../../hooks/useAuth';
import useApiCache from '../../hooks/useApiCache';
import { motion } from 'framer-motion';

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
    margin-top: 1.5rem;
  }
`;

const WelcomeMessage = styled.div`
  margin-bottom: 1.5rem;
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
  }
`;

const SubGreeting = styled.p`
  font-size: 1.1rem;
  color: var(--textSecondary);
  max-width: 700px;
  line-height: 1.6;
`;

const UserStatsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  margin-top: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const StatBox = styled(motion.div)`
  background: rgba(var(--cardBackground-rgb), 0.9);
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  flex: 1;
  min-width: 180px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(var(--borderColor-rgb), 0.3);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: linear-gradient(90deg, var(--tertiary), var(--primary));
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s ease;
  }
  
  h4 {
    font-size: 0.95rem;
    color: var(--textSecondary);
    margin-bottom: 0.5rem;
    font-weight: 500;
    transition: color 0.3s ease;
  }
  
  p {
    font-size: 2rem;
    font-weight: 700;
    color: var(--textPrimary);
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const AvatarSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
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
    box-shadow: 0 0 0 2px rgba(70, 54, 113, 0.2);
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
    box-shadow: 0 0 0 2px rgba(70, 54, 113, 0.2);
  }
`;

const GenreTagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const GenreTag = styled.div`
  background-color: ${props => props.selected ? 'var(--tertiary)' : 'var(--cardBackground)'};
  color: ${props => props.selected ? 'white' : 'var(--textPrimary)'};
  border: 1px solid ${props => props.selected ? 'var(--tertiary)' : 'var(--borderColor)'};
  border-radius: 999px;
  padding: 0.35rem 0.85rem;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: var(--tertiary);
    transform: translateY(-2px);
  }
`;

const LoadingText = styled.div`
  color: var(--textSecondary);
  font-size: 0.9rem;
  padding: 0.5rem 0;
`;

const StatusMessage = styled.div`
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 4px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  background-color: ${props => props.type === 'success' 
    ? 'var(--successLight)' 
    : props.type === 'error' 
      ? 'var(--dangerLight)' 
      : 'transparent'};
  
  color: ${props => props.type === 'success' 
    ? 'var(--success)' 
    : props.type === 'error' 
      ? 'var(--danger)' 
      : 'var(--textPrimary)'};
`;

const Button = styled.button`
  background-color: var(--tertiary);
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
    background-color: var(--tertiaryLight);
  }
  
  &:disabled {
    background-color: var(--textSecondary);
    cursor: not-allowed;
  }
`;

const statsVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      ease: "easeOut"
    }
  })
};

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
    border-color: var(--tertiary);
  }
`;

const ButtonContainer = styled.div`
  margin-top: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 600px) {
    flex-direction: column;
    gap: 1rem;
    
    ${ViewProfileButton} {
      width: 100%;
      justify-content: center;
    }
    
    ${Button} {
      width: 100%;
      justify-content: center;
    }
  }
`;

const ProfileSection = () => {
  const { user, refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    bio: '',
    genres: []
  });
  
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  

  // Calculate user stats from user data
  const getWatchedAnimeCount = () => {
    return user?.achievements?.animeWatchedCount || 0;
  };
  
  const getFollowersCount = () => {
    return user?.followersCount || 0;
  };
  
  const getFollowingCount = () => {
    return user?.followingCount || 0;
  };
  
  const getWatchlistCount = () => {
    // This would ideally come from an API call or cached user data
    // For now we'll estimate based on what we know
    const watchedCount = getWatchedAnimeCount();
    return watchedCount > 0 ? watchedCount * 2 : 0; // Just a placeholder
  };

  // Use API cache for genres with 7-day expiry
  const { loading: loadingGenres, fetchWithCache } = useApiCache('localStorage', 7 * 24 * 60 * 60 * 1000); // 7 days
  const [availableGenres, setAvailableGenres] = useState([]);
  
  // Default genres as fallback if API fails
  const fallbackGenres = [
    'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 
    'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life',
    'Sports', 'Supernatural', 'Thriller', 'Mecha', 'Music'
  ];
  
  // Fetch genres from API or cache
  useEffect(() => {
    const getGenres = async () => {
      try {
        const genresData = await fetchWithCache(
          'genres_list',
          genreAPI.getAllGenres
        );
        
        if (genresData && genresData.success && Array.isArray(genresData.data)) {
          // Extract genre names and sort alphabetically
          const genreNames = genresData.data.map(genre => genre.name).sort();
          setAvailableGenres(genreNames);
        } else {
          // Use fallback genres if API doesn't return expected format
          setAvailableGenres(fallbackGenres);
        }
      } catch (error) {
        console.error('Error fetching genres:', error);
        // Use fallback genres if API fails
        setAvailableGenres(fallbackGenres);
      }
    };
    
    getGenres();
  }, [fetchWithCache]);
  
  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        username: user.username || '',
        bio: user.bio || '',
        genres: user.preferences?.genres || []
      });
      
      if (user.avatarUrl) {
        setAvatarPreview(user.avatarUrl);
      }
    }
  }, [user]);
  
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
  
  const handleGenreToggle = (genre) => {
    setFormData(prev => {
      const genreIndex = prev.genres.indexOf(genre);
      if (genreIndex > -1) {
        // Remove genre if already selected
        return {
          ...prev,
          genres: [...prev.genres.slice(0, genreIndex), ...prev.genres.slice(genreIndex + 1)]
        };
      } else {
        // Add genre if not already selected (max 5)
        if (prev.genres.length < 5) {
          return {
            ...prev,
            genres: [...prev.genres, genre]
          };
        }
        return prev;
      }
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Upload avatar if changed
      if (avatar) {
        const formData = new FormData();
        formData.append('avatar', avatar);
        
        console.log('Uploading avatar...');
        const uploadResponse = await userAPI.uploadAvatar(formData);
        
        if (!uploadResponse.success) {
          throw new Error(uploadResponse.message || 'Failed to upload avatar');
        }
      }
      
      // Update profile info with preferences
      const profileData = {
        displayName: formData.displayName,
        username: formData.username,
        bio: formData.bio,
        preferences: {
          genres: formData.genres
        }
      };
      
      console.log('Updating profile with data:', profileData);
      const response = await userAPI.updateProfile(profileData);
      
      if (response.success) {
        await refreshUser();
        setMessage({ 
          type: 'success', 
          text: 'Profile updated successfully!' 
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: response.message || 'Failed to update profile' 
        });
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setMessage({ 
        type: 'error', 
        text: err.message || 'An error occurred. Please try again.' 
      });
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
              <Greeting>Welcome, {user?.displayName || user?.username}</Greeting>
              <SubGreeting>
                Track your anime journey, manage your watchlist, and discover new titles to enhance your anime experience.
              </SubGreeting>
            </WelcomeMessage>
            
            <UserStatsRow>
              <StatBox 
                variants={statsVariants}
                initial="hidden"
                animate="visible"
                custom={0}
              >
                <h4>Watched Anime</h4>
                <p>{getWatchedAnimeCount()}</p>
              </StatBox>
              
              <StatBox 
                variants={statsVariants}
                initial="hidden"
                animate="visible"
                custom={1}
              >
                <h4>Watchlist</h4>
                <p>{getWatchlistCount()}</p>
              </StatBox>
              
              <StatBox 
                variants={statsVariants}
                initial="hidden"
                animate="visible"
                custom={2}
              >
                <h4>Followers</h4>
                <p>{getFollowersCount()}</p>
              </StatBox>
              
              <StatBox 
                variants={statsVariants}
                initial="hidden"
                animate="visible"
                custom={3}
              >
                <h4>Following</h4>
                <p>{getFollowingCount()}</p>
              </StatBox>
            </UserStatsRow>
    </DashboardHeader>
    <Card 
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
              <Label htmlFor="username">Username</Label>
              <Input 
                type="text" 
                id="username" 
                name="username" 
                value={formData.username} 
                onChange={handleChange} 
                placeholder="username" 
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="bio">Bio</Label>
              <TextArea 
                id="bio" 
                name="bio" 
                value={formData.bio} 
                onChange={handleChange} 
                placeholder="Tell us about yourself and your anime preferences..." 
                maxLength={500}
              />
              <small style={{ color: 'var(--textSecondary)', display: 'block', marginTop: '0.5rem', textAlign: 'right' }}>
                {formData.bio.length}/500
              </small>
            </FormGroup>
          </div>
        </FormGrid>
        
        <FormGroup>
          <Label>Favorite Genres (max 5)</Label>
          <GenreTagsContainer>
            {loadingGenres ? (
              <LoadingText>Loading genres...</LoadingText>
            ) : (
              availableGenres.map(genre => (
                <GenreTag 
                  key={genre}
                  selected={formData.genres.includes(genre)}
                  onClick={() => handleGenreToggle(genre)}
                >
                  {genre}
                </GenreTag>
              ))
            )}
          </GenreTagsContainer>
        </FormGroup>
        
        {message.text && (
          <StatusMessage type={message.type}>
            {message.type === 'success' ? <Check size={16} /> : <X size={16} />}
            {message.text}
          </StatusMessage>
        )}
        
        <ButtonContainer>
          <ViewProfileButton to={`/user/${user?.username}`}>
            <ExternalLink size={16} />
            View Public Profile
          </ViewProfileButton>
          
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
            <Save size={16} />
          </Button>
        </ButtonContainer>
      </form>
    </Card>
    </>
  );
};

export default ProfileSection; 