import React from 'react';
import styled from 'styled-components';
import { Info } from 'lucide-react';

// Styled components
const FormatPreferencesContainer = styled.div`
  margin-top: 1rem;
`;

const FormatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
`;

const FormatCard = styled.div`
  border-radius: 8px;
  border: 1px solid var(--borderColor);
  padding: 1.25rem;
  background: var(--bgSecondary);
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;

  &:hover {
    border-color: var(--primary);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const FormatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const FormatTitle = styled.div`
  font-weight: 600;
  color: var(--textPrimary);
  font-size: 1.1rem;
`;

const FormatDescription = styled.div`
  font-size: 0.875rem;
  color: var(--textSecondary);
  line-height: 1.5;
  margin-bottom: 1.25rem;
`;

const SliderContainer = styled.div`
  margin-top: auto
`;

const SliderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const SliderLabel = styled.span`
  font-size: 0.875rem;
  color: var(--textPrimary);
`;

const SliderValue = styled.span`
  font-size: 0.875rem;
  color: var(--primary);
  font-weight: 500;
`;

const WeightSlider = styled.input.attrs({ type: 'range' })`
  width: 100%;
  background: var(--textSecondary);
  height: 6px;
  border-radius: 3px;
  appearance: none;
  outline: none;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--primary);
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--primary);
    cursor: pointer;
    border: none;
  }
`;

const InfoBox = styled.div`
  margin-bottom: 1.5rem;
  padding: 1rem;
  border-radius: 6px;
  background-color: rgba(var(--primary-rgb), 0.08);
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  
  svg {
    flex-shrink: 0;
    color: var(--primary);
    margin-top: 0.25rem;
  }
  
  p {
    margin: 0;
    color: var(--textSecondary);
    font-size: 0.875rem;
    line-height: 1.5;
  }
`;

// Anime format definitions with descriptions
const ANIME_FORMATS = [
  {
    id: 'tv',
    name: 'TV Series',
    description: 'Standard TV anime series, typically with 12-26 episodes per season and weekly releases.',
    defaultWeight: 1.0
  },
  {
    id: 'movie',
    name: 'Movies',
    description: 'Full-length anime films, either standalone stories or part of a larger franchise.',
    defaultWeight: 1.0
  },
  {
    id: 'ova',
    name: 'OVA/OAD',
    description: 'Original Video/Animation/Disc, direct-to-video anime releases that aren\'t shown on TV or in theaters.',
    defaultWeight: 1.0
  },
  {
    id: 'ona',
    name: 'ONA',
    description: 'Original Net Animation, anime released directly to internet streaming platforms.',
    defaultWeight: 1.0
  },
  {
    id: 'special',
    name: 'Specials',
    description: 'Bonus episodes, side stories, or short content related to main series but separately released.',
    defaultWeight: 1.0
  },
  {
    id: 'manga',
    name: 'Manga',
    description: 'Japanese comics typically serialized in magazines and later compiled into volumes.',
    defaultWeight: 1.0
  },
  {
    id: 'manhwa',
    name: 'Manhwa',
    description: 'Korean comics, often read vertically and published on web platforms.',
    defaultWeight: 1.0
  },
  {
    id: 'novel',
    name: 'Light Novels',
    description: 'Japanese novels with anime-style illustrations, often adapted into anime or manga.',
    defaultWeight: 1.0
  },
];

const FormatPreferences = ({ 
  preferences, 
  onPreferenceChange
}) => {
  // Get current format preferences or set defaults
  const formatPreferences = preferences?.formats || {};

  // Handle weight change for a format
  const handleWeightChange = (formatId, value) => {
    const weight = parseFloat(value);
    const currentPreferences = preferences || {};
    
    // Update the format preference
    onPreferenceChange({
      ...currentPreferences,
      formats: {
        ...(currentPreferences.formats || {}),
        [formatId]: weight
      }
    });
  };

  // Helper to get a format's current weight
  const getFormatWeight = (formatId) => {
    if (formatId in formatPreferences) {
      return formatPreferences[formatId];
    }
    
    // Return default weight if not set
    const format = ANIME_FORMATS.find(f => f.id === formatId);
    return format ? format.defaultWeight : 1.0;
  };

  // Helper to get weight description
  const getWeightDescription = (weight) => {
    if (weight <= 0.2) return "Rarely show";
    if (weight <= 0.4) return "Sometimes show";
    if (weight <= 0.6) return "Neutral";
    if (weight <= 0.8) return "Often show";
    return "Frequently show";
  };

  return (
    <FormatPreferencesContainer>
      <InfoBox>
        <Info size={20} />
        <p>
          Adjust the sliders to indicate how often you want to see each anime format in your recommendations.
          Higher values mean you'll receive more recommendations of that format type.
        </p>
      </InfoBox>
      
      <FormatGrid>
        {ANIME_FORMATS.map(format => (
          <FormatCard key={format.id}>
            <FormatHeader>
              <FormatTitle>{format.name}</FormatTitle>
            </FormatHeader>
            
            <FormatDescription>
              {format.description}
            </FormatDescription>
            
            <SliderContainer>
              <SliderHeader>
                <SliderLabel>Preference</SliderLabel>
                <SliderValue>{getWeightDescription(getFormatWeight(format.id))}</SliderValue>
              </SliderHeader>
              
              <WeightSlider
                min="0"
                max="1"
                step="0.1"
                value={getFormatWeight(format.id)}
                onChange={(e) => handleWeightChange(format.id, e.target.value)}
              />
              
              <SliderHeader>
                <SliderLabel>Less Often</SliderLabel>
                <SliderLabel>More Often</SliderLabel>
              </SliderHeader>
            </SliderContainer>
          </FormatCard>
        ))}
      </FormatGrid>
    </FormatPreferencesContainer>
  );
};

export default FormatPreferences; 