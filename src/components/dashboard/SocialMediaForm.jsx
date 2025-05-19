import React, { useState, useEffect } from 'react';
import { Youtube, Instagram, Twitter, MessageSquare, Twitch, Save, CheckCircle } from 'lucide-react';
import styled from 'styled-components';
import {
  FormSection,
  SocialMediaGrid,
  FormGroup,
  Label,
  InputWithIcon,
  Input
} from '../../styles/ProfileStyles';

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: var(--primary);
  color: var(--textPrimary);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 1.5rem;
  transition: all 0.2s ease;
  width: 100%;
  max-width: 250px;
  
  &:hover {
    background: var(--primaryDark);
    transform: translateY(-2px);
  }
  
  &:disabled {
    background: var(--secondary);
    color: var(--textSecondary);
    cursor: not-allowed;
    transform: none;
  }
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const SocialMediaForm = ({ formData, updateProfile }) => {
  const [localLinks, setLocalLinks] = useState({
    youtube: '',
    instagram: '',
    twitter: '',
    discord: '',
    twitch: ''
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  
  // Initialize local data from props
  useEffect(() => {
    setLocalLinks({
      youtube: formData.socialLinks.youtube || '',
      instagram: formData.socialLinks.instagram || '',
      twitter: formData.socialLinks.twitter || '',
      discord: formData.socialLinks.discord || '',
      twitch: formData.socialLinks.twitch || ''
    });
  }, [formData.socialLinks]);
  
  // Handle local changes
  const handleLocalChange = (e) => {
    const { name, value } = e.target;
    const socialName = name.split('.')[1]; // Extract just the social media name
    
    setLocalLinks(prev => ({
      ...prev,
      [socialName]: value
    }));
    setHasChanges(true);
  };
  
  // Handle save
  const handleSave = () => {
    // Create filtered social data object with only non-empty fields
    const socialData = {};
    
    // Only include fields that have values
    Object.entries(localLinks).forEach(([key, value]) => {
      if (value && value.trim() !== '') {
        socialData[key] = value.trim();
      }
    });
    
    // Update profile directly
    updateProfile({
      social: true,
      socialData,
      preferences: { skipDebounce: true }
    });
    
    setHasChanges(false);
    setShowSaveSuccess(true);
    
    // Hide success message after a delay
    setTimeout(() => {
      setShowSaveSuccess(false);
    }, 5000);
  };
  
  return (
    <FormSection>
      <HeaderRow>
        <h3>Social Media Links</h3>
        <SaveButton 
          onClick={handleSave}
          disabled={!hasChanges}
        >
          <Save size={18} />
          Save Links
        </SaveButton>
      </HeaderRow>
      
      <SocialMediaGrid>
        <FormGroup>
          <Label htmlFor="youtube">YouTube</Label>
          <InputWithIcon>
            <Youtube size={16} />
            <Input
              type="text"
              id="youtube"
              name="socialLinks.youtube"
              value={localLinks.youtube}
              onChange={handleLocalChange}
              placeholder="YouTube channel"
            />
          </InputWithIcon>
        </FormGroup>
        <FormGroup>
          <Label htmlFor="instagram">Instagram</Label>
          <InputWithIcon>
            <Instagram size={16} />
            <Input
              type="text"
              id="instagram"
              name="socialLinks.instagram"
              value={localLinks.instagram}
              onChange={handleLocalChange}
              placeholder="Instagram username"
            />
          </InputWithIcon>
        </FormGroup>
        <FormGroup>
          <Label htmlFor="twitter">Twitter</Label>
          <InputWithIcon>
            <Twitter size={16} />
            <Input
              type="text"
              id="twitter"
              name="socialLinks.twitter"
              value={localLinks.twitter}
              onChange={handleLocalChange}
              placeholder="Twitter username"
            />
          </InputWithIcon>
        </FormGroup>
        <FormGroup>
          <Label htmlFor="discord">Discord</Label>
          <InputWithIcon>
            <MessageSquare size={16} />
            <Input
              type="text"
              id="discord"
              name="socialLinks.discord"
              value={localLinks.discord}
              onChange={handleLocalChange}
              placeholder="Discord username"
            />
          </InputWithIcon>
        </FormGroup>
        <FormGroup>
          <Label htmlFor="twitch">Twitch</Label>
          <InputWithIcon>
            <Twitch size={16} />
            <Input
              type="text"
              id="twitch"
              name="socialLinks.twitch"
              value={localLinks.twitch}
              onChange={handleLocalChange}
              placeholder="Twitch username"
            />
          </InputWithIcon>
        </FormGroup>
      </SocialMediaGrid>
    </FormSection>
  );
};

export default SocialMediaForm; 