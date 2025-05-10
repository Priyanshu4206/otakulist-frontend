import React from 'react';
import { Calendar, Users } from 'lucide-react';
import UserAvatar from '../common/UserAvatar';
import Card from '../common/Card';
import ShareButton from '../common/ShareButton';
import ThemeBadge from '../common/ThemeBadge';
import {
  ProfileInfo as ProfileInfoContainer,
  Username,
  DisplayName,
  JoinDate,
  Bio,
  FollowButton,
  UnfollowButton,
  SocialStats,
  StatItem,
  StatValue,
  StatLabel,
  ButtonsRow,
  ButtonGroup,
  formatJoinDate
} from './ProfileStyles';

const ProfileInfo = ({ 
  profileData, 
  user, 
  isOwner, 
  isFollowing, 
  followLoading, 
  handleFollowToggle,
  temporaryTheme
}) => {
  return (
    <Card>
      <ProfileInfoContainer>
        <UserAvatar 
          src={profileData.avatarUrl} 
          alt={profileData.displayName || profileData.username}
          size={120}
        />
        <Username>{profileData.username}</Username>
        {profileData.displayName && (
          <DisplayName>{profileData.displayName}</DisplayName>
        )}
        <JoinDate>
          <Calendar size={14} />
          Joined {formatJoinDate(profileData.createdAt)}
        </JoinDate>
        
        {/* Display theme badge if a temporary theme is active */}
        {temporaryTheme?.isTemporaryThemeActive && (
          <ThemeBadge 
            themeName={temporaryTheme.temporaryThemeName} 
            userName={temporaryTheme.userDisplayName || profileData.username}
          />
        )}
        
        {profileData.bio && (
          <Bio>{profileData.bio}</Bio>
        )}
        
        <ButtonsRow>
          <ButtonGroup>
            {/* Only show follow/unfollow button if the current user is not viewing their own profile */}
            {user && !isOwner && (
              isFollowing ? (
                <UnfollowButton 
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                >
                  <Users size={16} />
                  {followLoading ? 'Processing...' : 'Unfollow'}
                </UnfollowButton>
              ) : (
                <FollowButton 
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                >
                  <Users size={16} />
                  {followLoading ? 'Processing...' : 'Follow'}
                </FollowButton>
              )
            )}
            
            {/* Share profile button */}
            <ShareButton 
              title={`${profileData.displayName || profileData.username}'s Profile`}
              text={`Check out ${profileData.displayName || profileData.username}'s anime profile`}
              label="Share Profile"
              successMessage="Profile link copied to clipboard"
              errorMessage="Failed to copy profile link"
            />
          </ButtonGroup>
        </ButtonsRow>
        
        <SocialStats>
          <StatItem>
            <StatValue>{profileData.stats?.followersCount ?? 0}</StatValue>
            <StatLabel>Followers</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{profileData.stats?.followingCount ?? 0}</StatValue>
            <StatLabel>Following</StatLabel>
          </StatItem>
        </SocialStats>
      </ProfileInfoContainer>
    </Card>
  );
};

export default ProfileInfo; 