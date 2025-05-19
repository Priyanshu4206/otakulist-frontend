import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { UserPlus, Check, Award } from 'lucide-react';

const CardWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-radius: 10px;
  background-color: rgba(var(--cardBackground-rgb), 0.8);
  border: 1px solid rgba(var(--borderColor-rgb), 0.1);
  margin-bottom: 0.75rem;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
    border-color: rgba(var(--borderColor-rgb), 0.2);
  }
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 0.75rem;
  flex-shrink: 0;
  border: 2px solid ${props => props.isPremium ? 'gold' : 'rgba(var(--primary-rgb), 0.2)'};
  position: relative;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const PremiumBadge = styled.div`
  position: absolute;
  bottom: -2px;
  right: -2px;
  background: gold;
  color: #222;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
`;

const UserInfo = styled.div`
  flex: 1;
  overflow: hidden;
`;

const UserName = styled(Link)`
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--textPrimary);
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  
  &:hover {
    color: var(--primary);
    text-decoration: underline;
  }
`;

const PremiumIcon = styled(Award)`
  color: gold;
  margin-left: 0.25rem;
  flex-shrink: 0;
`;

const UserMeta = styled.div`
  font-size: 0.75rem;
  color: var(--textSecondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const UserBio = styled.div`
  font-size: 0.75rem;
  color: var(--textSecondary);
  margin-top: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
`;

const FollowButton = styled.button`
  background: ${props => props.following 
    ? 'rgba(var(--success-rgb), 0.1)' 
    : 'rgba(var(--primary-rgb), 0.1)'};
  color: ${props => props.following 
    ? 'var(--success)' 
    : 'var(--primary)'};
  border: 1px solid ${props => props.following 
    ? 'var(--success)' 
    : 'var(--primary)'};
  border-radius: 20px;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.2s ease;
  flex-shrink: 0;
  
  &:hover {
    background: ${props => props.following 
      ? 'rgba(var(--success-rgb), 0.2)' 
      : 'rgba(var(--primary-rgb), 0.2)'};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

/**
 * User card component for recommended users
 * 
 * @param {Object} props - Component props
 * @param {Object} props.user - User data
 * @param {boolean} props.isFollowing - Whether the current user is following this user
 * @param {Function} props.onFollowToggle - Handler for follow/unfollow action
 * @returns {JSX.Element} User card component
 */
const UserCard = ({ user, isFollowing = false, onFollowToggle }) => {
  // Format the followers count for display
  const formatFollowers = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M followers`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K followers`;
    }
    return `${count} followers`;
  };
  
  // Get default values for missing properties
  const username = user.username || 'user';
  const displayName = user.displayName || user.username || 'User';
  const avatarUrl = user.avatar || user.profileImage || 'https://via.placeholder.com/40';
  const followers = user.followers || 0;
  const isPremium = user.isPremium || false;
  const bio = user.bio || '';
  
  // Handle follow button click
  const handleFollowClick = () => {
    if (onFollowToggle) {
      onFollowToggle(user.id, !isFollowing);
    }
  };
  
  return (
    <CardWrapper>
      <Avatar isPremium={isPremium}>
        <img src={avatarUrl} alt={displayName} loading="lazy" />
        {isPremium && (
          <PremiumBadge>
            <Award size={10} />
          </PremiumBadge>
        )}
      </Avatar>
      
      <UserInfo>
        <UserName to={`/user/${username}`}>
          {displayName}
          {isPremium && <PremiumIcon size={14} />}
        </UserName>
        <UserMeta>{formatFollowers(followers)}</UserMeta>
        {bio && <UserBio>{bio}</UserBio>}
      </UserInfo>
      
      <FollowButton 
        following={isFollowing}
        onClick={handleFollowClick}
        aria-label={isFollowing ? 'Unfollow' : 'Follow'}
      >
        {isFollowing ? (
          <>
            <Check size={14} />
            Following
          </>
        ) : (
          <>
            <UserPlus size={14} />
            Follow
          </>
        )}
      </FollowButton>
    </CardWrapper>
  );
};

export default UserCard; 