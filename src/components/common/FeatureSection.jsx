import { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { featuresList } from '../../assets/anime-landscape';
import useTheme from '../../hooks/useTheme';
import * as Icons from 'lucide-react';

// Main section container
const SectionContainer = styled.section`
  padding: 6rem 2rem;
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 4rem 1rem;
  }
`;

// Section heading with subtle animation
const SectionHeading = styled(motion.h2)`
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 1rem;
  background: var(--gradientPrimary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

// Section description
const SectionDescription = styled(motion.p)`
  text-align: center;
  max-width: 800px;
  margin: 0 auto 4rem;
  font-size: 1.2rem;
  color: var(--textSecondary);
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 3rem;
  }
`;

// Features grid layout
const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

// Individual feature card with themed gradients
const FeatureCard = styled(motion.div)`
  background: ${props => props.theme === 'dark' || props.theme === 'default' ? 
    'rgba(30, 30, 50, 0.7)' : 
    'rgba(255, 255, 255, 0.7)'
  };
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-top: 4px solid transparent;
  border-image: ${props => props.gradient};
  border-image-slice: 1;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

// Feature icon with gradient background
const FeatureIconWrapper = styled(motion.div)`
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  background: ${props => props.gradient};
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  
  svg {
    color: white;
    width: 30px;
    height: 30px;
  }
`;

// Feature title
const FeatureTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  background: ${props => props.gradient};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
`;

// Feature description
const FeatureDescription = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  color: var(--textPrimary);
  opacity: 0.9;
`;

// Animation variants for features
const featureSectionVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } }
};

const featureCardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: 0.1 * index,
      ease: "easeOut"
    }
  }),
  hover: {
    y: -10,
    scale: 1.02,
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
    transition: { duration: 0.3 }
  }
};

const iconVariants = {
  hidden: { scale: 0.8, opacity: 0.5 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.4 } },
  hover: { scale: 1.1, transition: { duration: 0.2 } }
};

const FeatureSection = () => {
  const { currentTheme } = useTheme();
  
  // Get icon component dynamically from Lucide
  const getIcon = (iconName) => {
    const Icon = Icons[iconName];
    return Icon ? <Icon /> : <Icons.HelpCircle />;
  };
  
  return (
    <SectionContainer as={motion.section} variants={featureSectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
      <SectionHeading
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        Epic Features
      </SectionHeading>
      
      <SectionDescription
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        Discover all the powerful tools and features that make OtakuList the ultimate platform for anime enthusiasts.
      </SectionDescription>
      
      <FeaturesGrid>
        {featuresList.map((feature, index) => (
          <FeatureCard 
            key={index}
            theme={currentTheme}
            gradient={feature.gradient}
            custom={index}
            variants={featureCardVariants}
            initial="hidden"
            whileInView="visible"
            whileHover="hover"
            viewport={{ once: true, amount: 0.1 }}
          >
            <FeatureIconWrapper 
              gradient={feature.gradient}
              variants={iconVariants}
            >
              {getIcon(feature.icon)}
            </FeatureIconWrapper>
            <FeatureTitle gradient={feature.gradient}>
              {feature.title}
            </FeatureTitle>
            <FeatureDescription>
              {feature.description}
            </FeatureDescription>
          </FeatureCard>
        ))}
      </FeaturesGrid>
    </SectionContainer>
  );
};

export default FeatureSection; 