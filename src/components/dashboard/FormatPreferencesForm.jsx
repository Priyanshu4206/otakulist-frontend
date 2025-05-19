import React, { useState, useEffect } from 'react';
import { 
  FormSection,
  FormGroup,
  Label
} from '../../styles/ProfileStyles';
import FormatPreferences from '../profile/FormatPreferences';
import styled from 'styled-components';
import { BarChart2, Save, CheckCircle } from 'lucide-react';

const FormatDescription = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--bgSecondary);
  border-left: 3px solid var(--primary);
  border-radius: 4px;
  margin-bottom: 1.5rem;

  p {
    margin: 0;
    color: var(--textSecondary);
    font-size: 0.9rem;
    line-height: 1.5;
  }
`;

const VisualizationBar = styled.div`
  width: 100%;
  height: 0.5rem;
  background: var(--textSecondary);
  border-radius: 4px;
  overflow: hidden;
  margin-top: 0.5rem;
  margin-bottom: 1.5rem;
  display: flex;
`;

const BarSegment = styled.div`
  height: 100%;
  flex: ${props => props.weight};
  background-color: ${props => props.color};
  transition: flex 0.3s ease;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

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

const ALL_FORMATS = [
  'tv', 'movie', 'ova', 'ona', 'special',
  'manga', 'manhwa', 'novel'
];

const getDefaultWeight = (format) => {
  const defaultMap = {
    tv: 1.0,
    movie: 1.0,
    ova: 1.0,
    ona: 1.0,
    special: 1.0,
    manga: 1.0,
    manhwa: 1.0,
    novel: 1.0
  };
  return defaultMap[format] || 1.0;
};

const getFormatColor = (format) => {
  const colors = {
    tv: 'var(--success)',
    movie: 'var(--primary)',
    ova: 'var(--warning)',
    ona: 'var(--info)',
    special: 'var(--danger)',
    manga: '#9b59b6',   // Purple
    manhwa: '#e67e22',  // Orange
    novel: '#3498db'    // Blue
  };
  return colors[format] || 'var(--textSecondary)';
};

const getFormatName = (format) => {
  const names = {
    tv: 'TV Series',
    movie: 'Movies',
    ova: 'OVAs',
    ona: 'ONAs',
    special: 'Specials',
    manga: 'Manga',
    manhwa: 'Manhwa',
    novel: 'Light Novels'
  };
  return names[format] || format;
};

const FormatPreferencesForm = ({ formData, handleFormatPreferenceChange, updateProfile }) => {
  const [localFormatPrefs, setLocalFormatPrefs] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (formData.preferences?.formatPreferences) {
      setLocalFormatPrefs({ ...formData.preferences.formatPreferences });
    }
  }, [formData.preferences]);

  const formatPreferencesData = {
    formats: localFormatPrefs
  };

  const handleLocalPreferenceChange = (updatedPreferences) => {
    const formatPrefs = updatedPreferences.formats || {};
    setLocalFormatPrefs(formatPrefs);
    setHasChanges(true);
  };

  const handleSavePreferences = () => {
    const updatedFormatPreferences = {};
    Object.entries(localFormatPrefs).forEach(([format, value]) => {
      updatedFormatPreferences[format] = parseFloat(value);
    });

    handleFormatPreferenceChange('formats', {
      ...updatedFormatPreferences,
      _skipDebounce: true
    });

    updateProfile?.({
      preferences: {
        field: 'formatPreferences',
        data: updatedFormatPreferences,
        skipDebounce: true
      }
    });

    setHasChanges(false);
  };

  const getFormatWeights = () => {
    const formats = localFormatPrefs || {};
    return ALL_FORMATS.map(format => ({
      format,
      weight: formats[format] !== undefined ? formats[format] : getDefaultWeight(format)
    }));
  };

  const formatWeights = getFormatWeights();

  return (
    <FormSection>
      <HeaderRow>
        <h3>Format Preferences</h3>
        <SaveButton
          onClick={handleSavePreferences}
          disabled={!hasChanges}
        >
          <Save size={18} />
          Save Formats
        </SaveButton>
      </HeaderRow>

      <FormatDescription>
        <BarChart2 size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
        <p>
          Adjust how frequently different formats (anime or reading) appear in your recommendations.
          Higher values mean you'll see more of that format.
        </p>
      </FormatDescription>

      <Label>Your current format balance</Label>
      <VisualizationBar>
        {formatWeights.map(item => (
          <BarSegment
            key={item.format}
            weight={item.weight}
            color={getFormatColor(item.format)}
            title={`${getFormatName(item.format)}: ${item.weight.toFixed(1)}`}
          />
        ))}
      </VisualizationBar>

      <FormGroup>
        <FormatPreferences
          preferences={formatPreferencesData}
          onPreferenceChange={handleLocalPreferenceChange}
        />
      </FormGroup>
    </FormSection>
  );
};

export default FormatPreferencesForm;
