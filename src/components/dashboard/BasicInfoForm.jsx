import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Save, CheckCircle } from 'lucide-react';
import styled from 'styled-components';
import { 
  FormGroup, 
  Label, 
  Input, 
  TextArea,
  InputWithIcon
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

const BasicInfoForm = ({ formData, updateProfile }) => {
  const [localData, setLocalData] = useState({
    displayName: '',
    bio: '',
    location: '',
    birthday: ''
  });
  const [hasChanges, setHasChanges] = useState(false);
  
  // Initialize local data from props
  useEffect(() => {
    setLocalData({
      displayName: formData.displayName || '',
      bio: formData.bio || '',
      location: formData.location || '',
      birthday: formData.birthday || ''
    });
  }, [formData]);
  
  // Handle local changes
  const handleLocalChange = (e) => {
    const { name, value } = e.target;
    setLocalData(prev => ({
      ...prev,
      [name]: value
    }));
    setHasChanges(true);
  };
  
  // Handle save
  const handleSave = () => {
    // Create filtered data object with only non-empty fields
    const basicData = {};
    
    // Only include fields that have values
    Object.entries(localData).forEach(([key, value]) => {
      if (value && value.trim() !== '') {
        basicData[key] = value.trim();
      }
    });
    
    // Update profile directly
    updateProfile({
      basic: true,
      basicData,
      preferences: { skipDebounce: true }
    });
    setHasChanges(false);
  };
  
  return (
    <div>
      <FormGroup>
        <Label htmlFor="displayName">Display Name</Label>
        <Input
          type="text"
          id="displayName"
          name="displayName"
          value={localData.displayName}
          onChange={handleLocalChange}
          placeholder="Your display name"
          maxLength={50}
        />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="bio">Bio</Label>
        <TextArea
          id="bio"
          name="bio"
          value={localData.bio}
          onChange={handleLocalChange}
          placeholder="Tell us about yourself..."
          maxLength={500}
        />
        <small style={{ color: 'var(--textSecondary)', display: 'block', marginTop: '0.5rem', textAlign: 'right' }}>
          {localData.bio.length}/500
        </small>
      </FormGroup>
      <FormGroup>
        <Label htmlFor="location">Location</Label>
        <InputWithIcon>
          <MapPin size={16} />
          <Input
            type="text"
            id="location"
            name="location"
            value={localData.location}
            onChange={handleLocalChange}
            placeholder="City, Country"
            maxLength={100}
          />
        </InputWithIcon>
      </FormGroup>
      <FormGroup>
        <Label htmlFor="birthday">Birthday</Label>
        <InputWithIcon>
          <Calendar size={16} />
          <Input
            type="date"
            id="birthday"
            name="birthday"
            value={localData.birthday}
            onChange={handleLocalChange}
          />
        </InputWithIcon>
      </FormGroup>
      
      <SaveButton 
        onClick={handleSave}
        disabled={!hasChanges}
      >
        <Save size={18} />
        Save Basic Info
      </SaveButton>
    </div>
  );
};

export default BasicInfoForm; 