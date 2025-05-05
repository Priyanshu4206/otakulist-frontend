import React from 'react';
import { Calendar, Users } from 'lucide-react';
import UserAvatar from '../common/UserAvatar';
import Card from '../common/Card';
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
  formatJoinDate
} from './ProfileStyles';

const ProfileInfo = ({ 
  profileData, 
  user, 
  isOwner, 
  isFollowing, 
  followLoading, 
  handleFollowToggle 
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
        
        {profileData.bio && (
          <Bio>{profileData.bio}</Bio>
        )}
        
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
        
        <SocialStats>
          <StatItem>
            <StatValue>{profileData.followersCount || 0}</StatValue>
            <StatLabel>Followers</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{profileData.followingCount || 0}</StatValue>
            <StatLabel>Following</StatLabel>
          </StatItem>
        </SocialStats>
      </ProfileInfoContainer>
    </Card>
  );
};

export default ProfileInfo; 