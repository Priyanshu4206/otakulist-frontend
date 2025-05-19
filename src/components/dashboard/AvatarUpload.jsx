import React from 'react';
import { Upload } from 'lucide-react';
import UserAvatar from '../common/UserAvatar';
import { 
  AvatarSection, 
  AvatarWrapper, 
  AvatarOverlay, 
  AvatarInput,
  Label
} from '../../styles/ProfileStyles';

const AvatarUpload = ({ avatarPreview, handleAvatarChange }) => {
  return (
    <AvatarSection>
      <AvatarWrapper>
        <UserAvatar
          src={avatarPreview}
          alt="Profile avatar"
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
  );
};

export default AvatarUpload; 