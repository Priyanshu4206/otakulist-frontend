import React from 'react';
import { Calendar, Users, Share2, Edit, Settings, CheckCircle2, Circle, EyeOff, BarChart3, Crown, Trophy, Award, Film, ThumbsUp, ListFilter, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import UserAvatar from '../common/UserAvatar';
import { formatJoinDate, ProfileSection, RankBadge, SectionTitle, StatCard, StatIconContainer, StatName, StatNumber, StatsGrid } from './ProfileStyles';
import styled from 'styled-components';
import ShareButton from '../common/ShareButton';

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
  align-items: center;
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

  // Helper functions for rank tier formatting and styling
  const formatRankName = (rankTierId) => {
    if (!rankTierId) return 'Novice';
    
    const rankMap = {
      'novice': 'Novice',
      'fan': 'Anime Fan',
      'enthusiast': 'Enthusiast',
      'expert': 'Anime Expert',
      'otaku': 'True Otaku',
      'sensei': 'Anime Sensei',
      'legend': 'Anime Legend'
    };
    
    return rankMap[rankTierId.toLowerCase()] || 'Anime Fan';
  };
  
  const getRankBgColor = (rankTierId) => {
    if (!rankTierId) return 'rgba(var(--primary-rgb), 0.1)';
    
    const rankColorMap = {
      'novice': 'rgba(149, 165, 166, 0.2)', // Gray
      'fan': 'rgba(52, 152, 219, 0.2)',     // Blue
      'enthusiast': 'rgba(46, 204, 113, 0.2)', // Green
      'expert': 'rgba(155, 89, 182, 0.2)',   // Purple
      'otaku': 'rgba(241, 196, 15, 0.2)',    // Yellow
      'sensei': 'rgba(230, 126, 34, 0.2)',   // Orange
      'legend': 'rgba(231, 76, 60, 0.2)'     // Red
    };
    
    return rankColorMap[rankTierId.toLowerCase()] || 'rgba(52, 152, 219, 0.2)';
  };
  
  const getRankTextColor = (rankTierId) => {
    if (!rankTierId) return 'var(--primary)';
    
    const rankColorMap = {
      'novice': '#7f8c8d',      // Gray
      'fan': '#2980b9',         // Blue
      'enthusiast': '#27ae60',  // Green
      'expert': '#8e44ad',      // Purple
      'otaku': '#f39c12',       // Yellow
      'sensei': '#d35400',      // Orange
      'legend': '#c0392b'       // Red
    };
    
    return rankColorMap[rankTierId.toLowerCase()] || '#2980b9';
  };
  
  const getRankIconColor = (rankTierId) => {
    return getRankTextColor(rankTierId);
  };

const ProfileHeader = ({ 
  profileData, 
  user, 
  isOwner, 
  isFollowing, 
  followLoading, 
  handleFollowToggle,
}) => {
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
            <RankBadge 
              bgColor={getRankBgColor(profileData.stats?.rankTierId)} 
              textColor={getRankTextColor(profileData.stats?.rankTierId)}
              iconColor={getRankIconColor(profileData.stats?.rankTierId)}
            >
              <Crown size={18} />
              {formatRankName(profileData.stats?.rankTierId)}
            </RankBadge>
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
                <ActionButton as={Link} to="/dashboard">
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
            {/* Share and Copy Link Buttons */}
            <ShareButton
              mode="native"
              url={`${window.location.origin}/user/${profileData.username}`}
              title={`Check out ${profileData.displayName || profileData.username}'s profile`}
              text={`Check out this profile on OtakuList: ${profileData.displayName || profileData.username}`}
              label="Share Profile"
              size="small"
              variant="primary"
            />
            <ShareButton
              mode="copy"
              url={`${window.location.origin}/user/${profileData.username}`}
              title={`Copy profile link`}
              text={`Copy profile link`}
              iconOnly={true}
              size="small"
              variant="default"
              successMessage="Profile link copied!"
              errorMessage="Failed to copy profile link."
            />
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
      {/* User Stats Section */}
      <ProfileSection>        
        
        {/* Stats Grid */}
        <StatsGrid>
          <StatCard>
            <StatIconContainer bgColor="rgba(255, 215, 0, 0.1)" iconColor="#FFD700">
              <Trophy size={20} />
            </StatIconContainer>
            <StatNumber>{profileData.stats?.achievementPoints || 0}</StatNumber>
            <StatName>Achievement Points</StatName>
          </StatCard>
          
          <StatCard>
            <StatIconContainer bgColor="rgba(52, 152, 219, 0.1)" iconColor="#3498db">
              <Award size={20} />
            </StatIconContainer>
            <StatNumber>{profileData.stats?.achievementsUnlocked || 0}</StatNumber>
            <StatName>Achievements</StatName>
          </StatCard>
          
          <StatCard>
            <StatIconContainer bgColor="rgba(231, 76, 60, 0.1)" iconColor="#e74c3c">
              <Film size={20} />
            </StatIconContainer>
            <StatNumber>{profileData.stats?.animeWatched || 0}</StatNumber>
            <StatName>Anime Watched</StatName>
          </StatCard>
          
          <StatCard>
            <StatIconContainer bgColor="rgba(155, 89, 182, 0.1)" iconColor="#9b59b6">
              <ThumbsUp size={20} />
            </StatIconContainer>
            <StatNumber>{profileData.stats?.totalRatings || 0}</StatNumber>
            <StatName>Ratings</StatName>
          </StatCard>
          
          <StatCard>
            <StatIconContainer bgColor="rgba(46, 204, 113, 0.1)" iconColor="#2ecc71">
              <ListFilter size={20} />
            </StatIconContainer>
            <StatNumber>{profileData.stats?.playlistsCount || 0}</StatNumber>
            <StatName>Playlists</StatName>
          </StatCard>
          
          <StatCard>
            <StatIconContainer bgColor="rgba(241, 196, 15, 0.1)" iconColor="#f1c40f">
              <Zap size={20} />
            </StatIconContainer>
            <StatNumber>{Math.round(profileData.stats?.profileCompletenessPercentage || 0)}%</StatNumber>
            <StatName>Profile Completeness</StatName>
          </StatCard>
        </StatsGrid>
      </ProfileSection>
    </ProfileHeaderContainer>
  );
};

export default ProfileHeader; 