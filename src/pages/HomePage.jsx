import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../components/layout/Layout.jsx';
import useAuth from '../hooks/useAuth.js';
import SimplifiedBackground from '../components/common/SimplifiedBackground.jsx';
import SimplifiedHero from '../components/common/SimplifiedHero.jsx';
import SimplifiedFeatureSection from '../components/home/SimplifiedFeatureSection.jsx';

// Styled container specifically for the HomePage
const HomePageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  position: relative;
  width: 100%;
  background: transparent !important; /* Force transparency */
`;

// Wrapper to prevent background color inheritance from global styles
const HomePageWrapper = styled.div`
  background: transparent !important; /* Force transparency */
  min-height: 100dvh;
  width: 100%;
`;

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loginWithGoogle } = useAuth();
  
  const handleExplore = () => {
    navigate('/schedule');
  };
  
  const handleLearnMore = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      loginWithGoogle();
    }
  };
  
  return (
    <HomePageWrapper>
      <Layout transparentHeader={true}>
        <HomePageContainer>
          {/* Simplified Background */}
          <SimplifiedBackground />
          
          {/* Simplified Hero Section */}
          <SimplifiedHero 
            onExplore={handleExplore}
            onLearnMore={handleLearnMore}
          />
          
          {/* Simplified Features Section */}
          <SimplifiedFeatureSection />
        </HomePageContainer>
      </Layout>
    </HomePageWrapper>
  );
};

export default HomePage; 