import React from 'react';
import { Calendar, Users, Share2, Edit, Settings, CheckCircle2, Circle, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import UserAvatar from '../common/UserAvatar';
import { formatJoinDate } from './ProfileStyles';
import styled from 'styled-components';

const ProfileHeaderContainer = styled.div`
  width: 100%;
  // max-width: 800px;
  margin: 0 auto 2rem auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.08);

  @media (max-width: 768px) {
    border-radius: 12px;
    margin: 0 auto 1.2rem auto;
    box-shadow: 0 1px 6px rgba(0,0,0,0.10);
    gap: 1rem;
  }
`;

const TopRow = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 2.5rem;
  padding: 1rem;
  justify-content: flex-start;

  @media (max-width: 768px) {
    gap: 1rem;
    justify-content: flex-start;
    align-items: flex-start;
  }

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const AvatarContainer = styled.div`
  flex-shrink: 0;
  @media (max-width: 768px) {
    margin-right: 0.7rem;
  }
`;

const MainInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const UsernameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin-bottom: 0.2rem;
`;

const Username = styled.h2`
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--textPrimary);
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const StatusBadge = styled.span`
  display: flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: ${({ status }) => status === 'active' ? 'var(--success)' : 'var(--textSecondary)'};
  background: ${({ status }) => status === 'active' ? 'rgba(0,200,83,0.08)' : 'rgba(120,120,120,0.08)'};
  border-radius: 999px;
  padding: 0.15rem 0.7rem 0.15rem 0.4rem;
  margin-left: 0.2rem;
  @media (max-width: 768px) {
    font-size: 0.85rem;
    padding: 0.1rem 0.5rem 0.1rem 0.3rem;
  }
`;

const SettingsButton = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--textSecondary);
  margin-left: 0.5rem;
  padding: 0.2rem;
  border-radius: 50%;
  transition: background 0.2s;
  &:hover {
    background: var(--backgroundLight);
    color: var(--primary);
  }
  @media (max-width: 768px) {
    margin-left: 0.2rem;
    padding: 0.1rem;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.7rem;
  margin-bottom: 0.2rem;
  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-start;
    gap: 0.5rem;
    margin-bottom: 0.3rem;
  }
`;

const ActionButton = styled.button`
  background-color: ${props => props.primary ? 'var(--primary)' : 'var(--backgroundLight)'};
  color: ${props => props.primary ? 'white' : 'var(--textPrimary)'};
  border: ${props => props.primary ? 'none' : '1px solid var(--borderColor)'};
  border-radius: 8px;
  padding: 0.5rem 1.2rem;
  font-size: 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 110px;
  justify-content: center;
  &:hover {
    background-color: ${props => props.primary ? 'var(--primaryDark)' : 'var(--backgroundLighter)'};
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
    font-size: 0.92rem;
    padding: 0.4rem 0.8rem;
    min-width: 90px;
  }
`;

const DisplayName = styled.h3`
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--textSecondary);
  @media (max-width: 768px) {
    font-size: 0.98rem;
  }
`;

const Bio = styled.p`
  font-size: 1rem;
  color: var(--textSecondary);
  margin: 0.5rem 0 0 0;
  line-height: 1.5;
  text-align: left;
  max-width: 600px;
  @media (max-width: 768px) {
    font-size: 0.95rem;
    margin: 0.3rem 0 0 0;
  }
`;

const JoinDate = styled.div`
  font-size: 0.85rem;
  color: var(--textSecondary);
  display: flex;
  align-items: center;
  gap: 0.4rem;
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

const StatsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 2.5rem;
  margin-bottom: 0.5rem;
  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
    gap: 0.2rem;
    margin: 0.5rem 0 0.2rem 0;
    padding: 0.2rem 0;
    border-top: 1px solid var(--borderColor);
    border-bottom: 1px solid var(--borderColor);
  }
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 60px;
  @media (max-width: 768px) {
    min-width: 48px;
  }
`;

const StatValue = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--textPrimary);
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const StatLabel = styled.div`
  font-size: 0.85rem;
  color: var(--textSecondary);
  @media (max-width: 768px) {
    font-size: 0.78rem;
  }
`;

const ProfileHeader = ({ 
  profileData, 
  user, 
  isOwner, 
  isFollowing, 
  followLoading, 
  handleFollowToggle, 
  hideFollowers = false, 
  hideFollowing = false, 
  hideAchievements = false,
  hidePlaylists = false
}) => {
  const stats = profileData.stats || {};
  const status = profileData.status || 'inactive';
  return (
    <ProfileHeaderContainer>
      {/* Top row: avatar, username, status, settings */}
      <TopRow>
        <AvatarContainer>
          <UserAvatar 
            src={profileData.avatarUrl} 
            alt={profileData.displayName || profileData.username}
            size={80}
          />
        </AvatarContainer>
        <MainInfo>
          <UsernameRow>
            <Username>{profileData.username}</Username>
            <StatusBadge status={status}>
              {status === 'active' ? <CheckCircle2 size={14} color="#00c853" /> : <Circle size={14} color="#888" />} {status.charAt(0).toUpperCase() + status.slice(1)}
            </StatusBadge>
            {isOwner && (
              <SettingsButton to="/dashboard/settings" aria-label="Profile Settings">
                <Settings size={20} />
              </SettingsButton>
            )}
          </UsernameRow>
          {/* Action buttons row */}
          <ActionButtons>
            {isOwner ? (
              <>
                <ActionButton as={Link} to="/dashboard/profile">
                  <Edit size={18} /> Edit Profile
                </ActionButton>
              </>
            ) : (
              <>
                {user && (
                  <ActionButton 
                    primary={!isFollowing}
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                  >
                    <Users size={18} />
                    {followLoading ? 'Processing...' : isFollowing ? 'Unfollow' : 'Follow'}
                  </ActionButton>
                )}
              </>
            )}
            <ActionButton onClick={() => {
              const url = window.location.href;
              navigator.clipboard.writeText(url);
              // You might want to add toast notification here
            }}>
              <Share2 size={18} /> Share
            </ActionButton>
          </ActionButtons>
          {/* Display name and bio */}
          {profileData.displayName && <DisplayName>{profileData.displayName}</DisplayName>}
          {profileData.bio && <Bio>{profileData.bio}</Bio>}
        </MainInfo>
              {/* Join date (optional, can be hidden on mobile) */}
      <JoinDate>
        <Calendar size={14} />
        Joined {formatJoinDate(profileData.createdAt)}
      </JoinDate>
      </TopRow>
      {/* Stats row: Following, Followers, Playlists, Achievements */}
      <StatsRow>
          <StatItem>
            <StatValue>{ !hideFollowing  ? stats.followingCount ?? 0 : <EyeOff size={14} />}</StatValue>
            <StatLabel>Following</StatLabel>
          </StatItem>

          <StatItem>
            <StatValue>{ !hideFollowers ? stats.followersCount ?? 0 : <EyeOff size={14} />}</StatValue>
            <StatLabel>Followers</StatLabel>
          </StatItem>
        <StatItem>
          <StatValue>{ !hidePlaylists ? stats.playlistsCount ?? 0 : <EyeOff size={14} />}</StatValue>
          <StatLabel>Playlists</StatLabel>
        </StatItem>
          <StatItem>
          <StatValue>{ !hideAchievements ? stats.achievementsUnlocked ?? 0 : <EyeOff size={14} />}</StatValue>
          <StatLabel>Achievements</StatLabel>
        </StatItem>
      </StatsRow>
    </ProfileHeaderContainer>
  );
};

export default ProfileHeader; 