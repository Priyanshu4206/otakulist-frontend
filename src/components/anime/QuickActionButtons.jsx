import styled from 'styled-components';
import { Star, Bookmark, BookOpen } from 'lucide-react';

const ActionButtonsContainer = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-left: auto;
  }
  
  @media (max-width: 480px) {
    gap: 0.5rem;
  }
`;

const ActionButton = styled.button`
  background: rgba(var(--cardBackground-rgb), 0.7);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--textPrimary);
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  &:hover, &:focus {
    background: var(--primary);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.3);
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
  
  @media (max-width: 480px) {
    width: 32px;
    height: 32px;
    
    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

const RatingButton = styled(ActionButton)`
  &:hover, &:focus {
    background: var(--warning);
    box-shadow: 0 4px 12px rgba(var(--warning-rgb), 0.3);
  }
`;

const WatchlistButton = styled(ActionButton)`
  &:hover, &:focus {
    background: var(--secondary);
    box-shadow: 0 4px 12px rgba(var(--secondary-rgb), 0.3);
  }
`;

const PlaylistButton = styled(ActionButton)`
  &:hover, &:focus {
    background: var(--info);
    box-shadow: 0 4px 12px rgba(var(--info-rgb), 0.3);
  }
`;

const QuickActionButtons = ({ onOpenRatingModal, onOpenWatchlistModal, onOpenPlaylistModal }) => {
  return (
    <ActionButtonsContainer>
      <RatingButton onClick={onOpenRatingModal} aria-label="Rate anime">
        <Star />
      </RatingButton>
      <WatchlistButton onClick={onOpenWatchlistModal} aria-label="Add to watchlist">
        <Bookmark />
      </WatchlistButton>
      <PlaylistButton onClick={onOpenPlaylistModal} aria-label="Add to playlist">
        <BookOpen />
      </PlaylistButton>
    </ActionButtonsContainer>
  );
};

export default QuickActionButtons; 