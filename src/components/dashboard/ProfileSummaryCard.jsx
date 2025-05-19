import React from 'react';
import { MapPin, ExternalLink } from 'lucide-react';
import UserAvatar from '../common/UserAvatar';
import { 
  ProfileSummary, 
  ViewProfileButton 
} from '../../styles/ProfileStyles';

const ProfileSummaryCard = ({ userData }) => {
  return (
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
      {userData.location && <div style={{ color: 'var(--textSecondary)', marginTop: '0.5rem' }}>
        <MapPin size={14} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
        {userData.location}
      </div>}
      <ViewProfileButton to={`/user/${userData.username}`} style={{ marginTop: 16 }}>
        <ExternalLink size={16} />
        View Public Profile
      </ViewProfileButton>
    </ProfileSummary>
  );
};

export default ProfileSummaryCard; 