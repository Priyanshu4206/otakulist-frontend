import styled from 'styled-components';

export const PageContainer = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
  
  @media (max-width: 768px) {
    padding: 1rem 0.5rem;
  }
`;

export const PageHeader = styled.header`
  margin-bottom: 2rem;
`;

export const PageTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--textPrimary);
  letter-spacing: -0.5px;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

export const PageSubtitle = styled.p`
  font-size: 1rem;
  color: var(--textSecondary);
  margin-bottom: 1.5rem;
`;

export const ProfileContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 3fr;
  gap: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr 2fr;
    gap: 1.5rem;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

export const ProfileSidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

export const ProfileContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1rem;
  padding: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: row;
    text-align: left;
    padding: 1rem;
    flex-wrap: wrap;
  }
`;

export const ProfileHeader = styled.div`
  display: flex;
  width: 100%;
  
  @media (max-width: 768px) {
    align-items: center;
    margin-bottom: 1rem;
  }
`;

export const ProfileAvatar = styled.div`
  @media (max-width: 768px) {
    margin-right: 1rem;
    flex-shrink: 0;
  }
`;

export const ProfileMeta = styled.div`
  @media (max-width: 768px) {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
`;

export const Username = styled.h2`
  margin: 1rem 0 0.25rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--textPrimary);
  
  @media (max-width: 768px) {
    margin: 0 0 0.25rem 0;
    font-size: 1.2rem;
  }
`;

export const DisplayName = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--textSecondary);
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    margin: 0 0 0.25rem 0;
  }
`;

export const JoinDate = styled.div`
  font-size: 0.85rem;
  color: var(--textSecondary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 0.75rem;
    margin-bottom: 0.5rem;
  }
`;

export const Bio = styled.p`
  font-size: 0.9rem;
  color: var(--textSecondary);
  width: 100%;
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
    margin: 0.5rem 0;
    order: 3;
  }
`;

export const ButtonsRow = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  
  @media (max-width: 768px) {
    justify-content: flex-start;
    margin: 0.5rem 0;
    order: 4;
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-start;
  }
  
  @media (max-width: 480px) {
    gap: 0.5rem;
  }
`;

export const FollowButton = styled.button`
  background-color: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1.2rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover {
    background-color: var(--primaryDark);
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    background-color: var(--borderColor);
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }
`;

export const UnfollowButton = styled(FollowButton)`
  background-color: var(--cardBackground);
  color: var(--textPrimary);
  border: 1px solid var(--borderColor);
  
  &:hover {
    background-color: var(--dangerLight);
    color: var(--danger);
    border-color: var(--danger);
  }
`;

export const ShareButton = styled(FollowButton)`
  background-color: var(--backgroundLight);
  color: var(--textPrimary);
  border: 1px solid var(--borderColor);
  
  &:hover {
    background-color: var(--backgroundLight);
    color: var(--primary);
    border-color: var(--primary);
  }
`;

export const SocialStats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  width: 100%;
  margin-top: 1rem;
  
  @media (max-width: 768px) {
    order: 2;
    margin-top: 0.5rem;
  }
`;

export const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem;
  border-radius: 8px;
  background-color: var(--backgroundLight);
  
  @media (max-width: 768px) {
    padding: 0.5rem;
    flex-direction: row;
    gap: 0.5rem;
    background-color: transparent;
  }
`;

export const StatValue = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--textPrimary);
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

export const StatLabel = styled.div`
  font-size: 0.8rem;
  color: var(--textSecondary);
  
  @media (max-width: 768px) {
    font-size: 0.75rem;
  }
`;

export const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid var(--borderColor);
  margin-bottom: 1.5rem;
  overflow-x: auto;
  scrollbar-width: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
  
  @media (max-width: 768px) {
    justify-content: space-around;
    margin-bottom: 1rem;
  }
`;

export const Tab = styled.button`
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  font-weight: ${props => props.active ? '600' : '400'};
  color: ${props => props.active ? 'var(--primary)' : 'var(--textSecondary)'};
  background: none;
  border: none;
  border-bottom: 2px solid ${props => props.active ? 'var(--primary)' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    color: var(--primary);
  }
  
  @media (max-width: 768px) {
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
    flex: 1;
    text-align: center;
  }
`;

export const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  color: var(--textSecondary);
`;

export const ErrorState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  color: var(--danger);
`;

// Playlist related styles
export const PlaylistsContainer = styled.div`
  width: 100%;
`;

export const PlaylistsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 0.75rem;
  }
`;

export const PlaylistCard = styled.div`
  background-color: var(--cardBackground);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  height: 100%;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
    
    .cover-overlay {
      opacity: 1;
    }
  }
  
  @media (max-width: 768px) {
    &:hover {
      transform: translateY(-3px);
    }
  }
  
  @media (max-width: 480px) {
    border-radius: 8px;
  }
`;

export const PlaylistCover = styled.div`
  position: relative;
  padding-top: 100%;
  background-color: var(--backgroundLight);
  overflow: hidden;
`;

export const ImageGrid = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: ${props => props.$count >= 3 ? '1fr 1fr' : '1fr'};
  grid-template-rows: ${props => props.$count >= 2 ? '1fr 1fr' : '1fr'};
  gap: 2px;
`;

export const AnimeImage = styled.div`
  background-image: url(${props => props.$src});
  background-size: cover;
  background-position: center;
  width: 100%;
  height: 100%;
`;

export const DefaultCoverIcon = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--textSecondary);
  opacity: 0.5;
`;

export const ImageOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

export const PlayButton = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: var(--primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
    background-color: var(--primaryDark);
  }
`;

export const PlaylistCardContent = styled.div`
  padding: 1rem;
  
  @media (max-width: 768px) {
    padding: 0.8rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.7rem;
  }
`;

export const PlaylistName = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: var(--textPrimary);
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    margin-bottom: 0.4rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.85rem;
    margin-bottom: 0.3rem;
  }
`;

export const PlaylistMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  
  @media (max-width: 480px) {
    gap: 0.5rem;
  }
`;

export const MetaBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.8rem;
  color: var(--textSecondary);
  
  @media (max-width: 480px) {
    font-size: 0.75rem;
  }
`;

export const ActionButtons = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  gap: 0.5rem;
  z-index: 2;
`;

export const ActionButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${props => props.$liked ? 'var(--danger)' : 'rgba(0, 0, 0, 0.6)'};
  color: ${props => props.$liked ? 'white' : 'var(--textSecondary)'};
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(2px);
  
  &:hover {
    background-color: ${props => props.$danger ? 'var(--danger)' : 'var(--primary)'};
    color: white;
    transform: scale(1.1);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

export const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;
  
  @media (max-width: 768px) {
    margin-top: 1.5rem;
    gap: 0.3rem;
  }
  
  @media (max-width: 480px) {
    margin-top: 1rem;
    flex-wrap: wrap;
  }
`;

export const PageButton = styled.button`
  padding: 0.5rem 0.8rem;
  background-color: ${props => props.active ? 'var(--primary)' : 'var(--backgroundLight)'};
  color: ${props => props.active ? 'white' : 'var(--textPrimary)'};
  border: 1px solid ${props => props.active ? 'var(--primary)' : 'var(--borderColor)'};
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background-color: ${props => props.active ? 'var(--primaryDark)' : 'var(--backgroundLighter)'};
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    padding: 0.4rem 0.7rem;
    font-size: 0.85rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.3rem 0.6rem;
    font-size: 0.8rem;
  }
`;

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  
  svg {
    color: var(--textSecondary);
    opacity: 0.5;
    margin-bottom: 1rem;
  }
  
  h3 {
    font-size: 1.1rem;
    color: var(--textPrimary);
    margin-bottom: 0.5rem;
  }
  
  p {
    color: var(--textSecondary);
    font-size: 0.9rem;
    max-width: 400px;
  }
`;

// Enhanced Profile Layout Styles
export const ProfileGridContainer = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 1.5rem;
  width: 100%;
  
  @media (max-width: 1200px) {
    grid-template-columns: 250px 1fr;
    gap: 1.2rem;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

export const ProfileSidePanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    gap: 1rem;
    overflow-x: auto;
    padding-bottom: 0.5rem;
    
    /* For horizontal scrolling on mobile */
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    
    & > * {
      flex: 0 0 auto;
      width: 85%;
      max-width: 300px;
    }
    
    /* Hide scrollbar but keep functionality */
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

export const ProfileMainPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

export const ProfileSection = styled.div`
  background-color: rgba(var(--cardBackground-rgb), 0.25);
  border-radius: 12px;
  width: 100%;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  
  @media (max-width: 768px) {
    padding: 1.2rem;
    border-radius: 10px;
  }
`;

export const SectionTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--textPrimary);
  margin-bottom: 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    color: var(--primary);
  }
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }
`;

export const PreferencesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 0.8rem;
  }
`;

export const PreferenceItem = styled.div`
  background-color: var(--backgroundLight);
  border-radius: 8px;
  padding: 0.8rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const PreferenceLabel = styled.span`
  font-size: 0.8rem;
  color: var(--textSecondary);
`;

export const PreferenceValue = styled.span`
  font-size: 1rem;
  font-weight: 500;
  color: var(--textPrimary);
`;

export const GenreTag = styled.div`
  display: inline-flex;
  align-items: center;
  background-color: ${props => props.weight > 1 ? 'rgba(var(--primary-rgb), 0.1)' : 'var(--backgroundLight)'};
  color: ${props => props.weight > 1 ? 'var(--primary)' : 'var(--textPrimary)'};
  border: 1px solid ${props => props.weight > 1 ? 'var(--primary)' : 'var(--borderColor)'};
  border-radius: 20px;
  padding: 0.4rem 0.8rem;
  margin: 0.3rem;
  font-size: 0.9rem;
  font-weight: ${props => props.weight > 1 ? '500' : '400'};
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

export const GenresContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

export const SocialLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 0.5rem;
`;

export const SocialLink = styled.a`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--textSecondary);
  text-decoration: none;
  padding: 0.5rem 0.8rem;
  border-radius: 8px;
  background-color: var(--backgroundLight);
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--backgroundLighter);
    color: var(--primary);
    transform: translateY(-2px);
  }
  
  svg {
    color: var(--primary);
  }
`;

export const LocationInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--textSecondary);
  font-size: 0.9rem;
  margin-top: 0.5rem;
  
  svg {
    color: var(--primary);
  }
`;

// Stats display components
export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.8rem;
  }
`;

export const StatCard = styled.div`
  border-radius: 10px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.2s ease;
  
  &:hover {
  }
  
  @media (max-width: 768px) {
    padding: 0.8rem;
    border-radius: 8px;
  }
`;

export const StatIconContainer = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${props => props.bgColor || 'rgba(var(--primary-rgb), 0.1)'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.8rem;
  
  svg {
    color: ${props => props.iconColor || 'var(--primary)'};
  }
  
  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    margin-bottom: 0.6rem;
    
    svg {
      width: 18px;
      height: 18px;
    }
  }
`;

export const StatNumber = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--textPrimary);
  margin-bottom: 0.3rem;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

export const StatName = styled.div`
  font-size: 0.85rem;
  color: var(--textSecondary);
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

export const RankBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: ${props => props.bgColor || 'rgba(var(--primary-rgb), 0.1)'};
  color: ${props => props.textColor || 'var(--primary)'};
  border-radius: 20px;
  padding: 0.5rem 1rem;
  font-weight: 500;
  font-size: 0.9rem;
  
  svg {
    color: ${props => props.iconColor || 'var(--primary)'};
  }
  
  @media (max-width: 768px) {
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
  }
`;

// Helpers
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

export const formatJoinDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}; 