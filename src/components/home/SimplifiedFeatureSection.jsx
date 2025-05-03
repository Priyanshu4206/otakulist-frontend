import styled from 'styled-components';
import { 
  Database, 
  Calendar, 
  ListChecks, 
  Users, 
  Cloud,
  Sparkles 
} from 'lucide-react';
import useTheme from '../../hooks/useTheme';

const SectionContainer = styled.section`
  padding: 6rem 2rem;
  background-color: rgba(var(--backgroundLight-rgb), 0.7);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  margin: 2rem;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
  
  @media (max-width: 768px) {
    padding: 4rem 1.5rem;
    margin: 1rem;
  }
`;

const SectionTitle = styled.h2`
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: var(--textPrimary);
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const SectionSubtitle = styled.p`
  text-align: center;
  max-width: 800px;
  margin: 0 auto 4rem;
  font-size: 1.2rem;
  color: var(--textSecondary);
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 3rem;
  }
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FeatureCard = styled.div`
  background: ${props => props.background || 'var(--cardBackground)'};
  border-radius: 12px;
  padding: 1.5rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  color: white;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.15);
  }
`;

const IconContainer = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
`;

const FeatureTitle = styled.h3`
  font-size: 1.4rem;
  margin-bottom: 1rem;
  color: var(--textPrimary);
`;

const FeatureDescription = styled.p`
  font-size: 1rem;
  color: var(--textSecondary);
  line-height: 1.6;
`;

const SimplifiedFeatureSection = () => {
  const { currentTheme, availableThemes } = useTheme();
  const theme = availableThemes[currentTheme];
  
  // Use theme variables for feature gradients and colors
  const features = [
    {
      title: 'Comprehensive Anime Database',
      description: 'Access detailed information on thousands of anime series, movies, and OVAs.',
      icon: Database,
      gradient: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryLight} 100%)`,
      iconColor: theme.primary
    },
    {
      title: 'Personalized Recommendations',
      description: 'Get customized anime recommendations based on your preferences and watching history.',
      icon: Sparkles,
      gradient: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentLight} 100%)`,
      iconColor: theme.accent
    },
    {
      title: 'Real-time Airing Schedule',
      description: 'Stay updated with the latest airing schedules for all currently running anime.',
      icon: Calendar,
      gradient: `linear-gradient(135deg, ${theme.secondary} 0%, ${theme.secondaryLight} 100%)`,
      iconColor: theme.secondary
    },
    {
      title: 'Custom Watch Lists',
      description: 'Create and manage your personal watch lists to keep track of what to watch next.',
      icon: ListChecks,
      gradient: `linear-gradient(135deg, ${theme.tertiary} 0%, ${theme.tertiaryLight} 100%)`,
      iconColor: theme.tertiary
    },
    {
      title: 'Community & Discussions',
      description: 'Connect with other fans and participate in discussions about your favorite anime.',
      icon: Users,
      gradient: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondaryLight} 100%)`,
      iconColor: theme.primary
    },
    {
      title: 'Cloud Synchronization',
      description: 'Your lists and preferences are synced across all your devices for seamless access.',
      icon: Cloud,
      gradient: `linear-gradient(135deg, ${theme.secondary} 0%, ${theme.primaryLight} 100%)`,
      iconColor: theme.secondary
    }
  ];
  
  return (
    <SectionContainer>
      <SectionTitle>Discover Our Features</SectionTitle>
      <SectionSubtitle>
        Everything you need for the perfect anime experience, all in one place.
      </SectionSubtitle>
      
      <FeaturesGrid>
        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          
          return (
            <FeatureCard 
              key={index}
              style={{
                backgroundImage: feature.gradient,
              }}
            >
              <IconContainer style={{ backgroundColor: `rgba(255, 255, 255, 0.2)` }}>
                <IconComponent size={28} color="#fff" />
              </IconContainer>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
            </FeatureCard>
          );
        })}
      </FeaturesGrid>
    </SectionContainer>
  );
};

export default SimplifiedFeatureSection; 