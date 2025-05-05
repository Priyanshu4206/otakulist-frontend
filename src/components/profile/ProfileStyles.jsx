import styled from 'styled-components';

export const PageContainer = styled.div`
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
  
  @media (max-width: 768px) {
    padding: 1rem;
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
    grid-template-columns: 1fr;
  }
`;

export const ProfileSidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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
  padding: 1.5rem;
`;

export const Username = styled.h2`
  margin: 1rem 0 0.25rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--textPrimary);
`;

export const DisplayName = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--textSecondary);
`;

export const JoinDate = styled.div`
  font-size: 0.85rem;
  color: var(--textSecondary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

export const Bio = styled.p`
  font-size: 0.9rem;
  color: var(--textSecondary);
`;

export const FollowButton = styled.button`
  background-color: var(--primary);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  
  &:hover {
    background-color: var(--primaryDark);
  }
  
  &:disabled {
    background-color: var(--borderColor);
    cursor: not-allowed;
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

export const SocialStats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  width: 100%;
  margin-top: 1rem;
`;

export const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem;
  border-radius: 8px;
  background-color: var(--backgroundLight);
`;

export const StatValue = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--textPrimary);
`;

export const StatLabel = styled.div`
  font-size: 0.8rem;
  color: var(--textSecondary);
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
  width: 100%;
  padding: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1rem;
  }
`;

export const PlaylistCard = styled.div`
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: var(--cardBackground);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(var(--primary-rgb), 0.15);
    
    .cover-overlay {
      opacity: 1;
    }
  }
`;

export const PlaylistCover = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  background-color: var(--backgroundLight);
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: ${props => 
    props.$count === 1 ? '1fr' : 
    props.$count === 2 ? '1fr 1fr' : 
    props.$count === 3 ? '2fr 1fr' : 
    '1fr 1fr'
  };
  grid-template-rows: ${props => 
    props.$count === 1 ? '1fr' : 
    props.$count === 2 ? '1fr' : 
    props.$count === 3 ? '1fr 1fr' : 
    '1fr 1fr'
  };
  height: 100%;
  width: 100%;
  gap: 2px;
  
  ${props => props.$count === 3 && `
    & > :first-child {
      grid-row: span 2;
    }
  `}
`;

export const AnimeImage = styled.div`
  background-image: url(${props => props.$src});
  background-size: cover;
  background-position: center;
  height: 100%;
  width: 100%;
`;

export const DefaultCoverIcon = styled.div`
  color: var(--textSecondary);
  opacity: 0.5;
  position: relative;
  z-index: 1;
`;

export const ImageOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.3) 40%, rgba(0, 0, 0, 0) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 1rem;
  z-index: 10;
  
  &.cover-overlay {
    opacity: 0;
  }
`;

export const PlayButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 50%;
  width: 3rem;
  height: 3rem;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
    background: var(--primaryLight);
  }
`;

export const PlaylistCardContent = styled.div`
  padding: 1rem;
`;

export const PlaylistName = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: var(--textPrimary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 2.8rem;
`;

export const PlaylistMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--textSecondary);
`;

export const MetaBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

export const ActionButtons = styled.div`
  display: flex;
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  gap: 0.5rem;
  z-index: 11;
`;

export const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$primary ? 'var(--primary)' : props.$danger ? 'var(--error)' : 'var(--secondary)'};
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  svg {
    ${props => props.$liked && `fill: var(--error);`}
  }
`;

export const Pagination = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
  gap: 0.5rem;
`;

export const PageButton = styled.button`
  background-color: ${props => props.active ? 'var(--primary)' : 'var(--cardBackground)'};
  color: ${props => props.active ? 'white' : 'var(--textSecondary)'};
  border: 1px solid ${props => props.active ? 'var(--primary)' : 'var(--borderColor)'};
  border-radius: 4px;
  padding: 0.25rem 0.75rem;
  font-size: 0.85rem;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  
  &:hover:not(:disabled) {
    background-color: ${props => props.active ? 'var(--primaryDark)' : 'var(--backgroundLight)'};
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