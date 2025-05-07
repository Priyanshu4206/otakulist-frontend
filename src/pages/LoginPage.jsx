import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn, User, Key, ChevronRight, MessageSquare, Quote } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { resetAuthFailedState } from '../services/api';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import { motion } from 'framer-motion';

const PageContainer = styled.div`
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: calc(100vh - var(--header-height));
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--textPrimary);
  letter-spacing: -0.5px;
  text-align: center;
  background: var(--gradientPrimary);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const PageSubtitle = styled.p`
  font-size: 1.1rem;
  color: var(--textSecondary);
  margin-bottom: 2rem;
  text-align: center;
  max-width: 600px;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  width: 100%;
  max-width: 1200px;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const LoginSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const FeaturesSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const LoginButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  margin-top: 1rem;
  box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.2);
  
  &:hover {
    background-color: var(--primaryLight);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(var(--primary-rgb), 0.25);
  }
  
  svg {
    margin-right: 10px;
  }
`;

const FeatureCard = styled(motion.div)`
  background-color: var(--cardBackground);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border: 1px solid var(--borderColor);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  h3 {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
    color: var(--textPrimary);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  p {
    color: var(--textSecondary);
    font-size: 0.95rem;
    line-height: 1.6;
  }
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    border-color: rgba(var(--primary-rgb), 0.3);
  }
`;

const QuoteCard = styled(motion.div)`
  background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.08), rgba(var(--secondary-rgb), 0.08));
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1rem;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 80px;
    height: 80px;
    background: radial-gradient(circle, rgba(var(--primary-rgb), 0.2) 0%, transparent 70%);
    border-radius: 50%;
    transform: translate(30%, -30%);
  }
  
  p {
    font-style: italic;
    color: var(--textPrimary);
    font-size: 1.1rem;
    line-height: 1.6;
    margin-bottom: 1rem;
    position: relative;
    z-index: 1;
  }
  
  cite {
    display: block;
    font-size: 0.9rem;
    color: var(--textSecondary);
    text-align: right;
    position: relative;
    z-index: 1;
  }
`;

const ErrorMessage = styled.div`
  background-color: rgba(var(--danger-rgb), 0.1);
  color: var(--danger);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Logo = styled.div`
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  img {
    height: 80px;
    width: 80px;
    margin-bottom: 1rem;
  }
  
  h1 {
    font-size: 2.2rem;
    color: var(--textPrimary);
    margin-bottom: 0.5rem;
    font-weight: 800;
    background: var(--gradientPrimary);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

// LogoFallback component in case the image doesn't load
const LogoFallback = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--gradientPrimary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 800;
  color: white;
  margin-bottom: 1rem;
`;

// Sample anime quotes
const animeQuotes = [
  {
    quote: "Whatever you lose, you'll find it again. But what you throw away you'll never get back.",
    source: "Himura Kenshin, Rurouni Kenshin"
  },
  {
    quote: "We don't have to know what tomorrow holds! That's why we can live for everything we're worth today!",
    source: "Natsu Dragneel, Fairy Tail"
  },
  {
    quote: "If you don't take risks, you can't create a future!",
    source: "Monkey D. Luffy, One Piece"
  },
  {
    quote: "It's just pathetic to give up on something before you even give it a shot.",
    source: "Reiko Mikami, Another"
  },
  {
    quote: "People's lives don't end when they die. It ends when they lose faith.",
    source: "Itachi Uchiha, Naruto"
  }
];

// Features for the features section
const features = [
  {
    icon: <User size={20} />,
    title: "Personalized Experience",
    description: "Get recommendations tailored to your watching history and preferences."
  },
  {
    icon: <ChevronRight size={20} />,
    title: "Track Your Progress",
    description: "Keep track of what you're watching, plan to watch, and have completed."
  },
  {
    icon: <MessageSquare size={20} />,
    title: "Join the Community",
    description: "Discuss your favorite anime with fellow fans and make new friends."
  }
];

const LoginPage = () => {
  const { isAuthenticated, loading, initialAuthCheckComplete, loginWithGoogle, handleLoginSuccess } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const [error, setError] = useState(queryParams.get('error') || '');
  
  // Get random quote
  const randomQuote = animeQuotes[Math.floor(Math.random() * animeQuotes.length)];
  
  // Check if we have a redirect path
  const from = location.state?.from || '/';
  
  // Check for token in URL (from OAuth callback)
  const token = queryParams.get('token');
  const userData = queryParams.get('user');
  const authSuccess = queryParams.get('auth_success');
  
  // Custom Google login function with additional cleanup
  const handleGoogleLogin = () => {
    // Clear all possible auth flags and tokens before initiating login    
    // Clear all auth-related storage items
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_from_callback');
    localStorage.removeItem('auth_checked');
    localStorage.removeItem('has_valid_token');
    sessionStorage.removeItem('auth_callback_processed');
    sessionStorage.removeItem('from_logout');
    
    // Reset auth failed state in API service
    resetAuthFailedState();
    
    // Now initiate the login
    loginWithGoogle();
  };
  
  // Handle OAuth callback with token
  useEffect(() => {
    // Check if we have token in URL (legacy/fallback approach)
    if (token) {
      try {
        // Parse user data if available
        const parsedUserData = userData ? JSON.parse(userData) : null;
        
        // Set flag to indicate we're coming from direct token auth
        localStorage.setItem('auth_from_callback', 'true');
        
        // Handle successful login
        handleLoginSuccess(parsedUserData, token);
        
        // Remove token from URL (to prevent accidental shares)
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
        
        // Navigate to destination
        navigate(from, { replace: true });
      } catch (err) {
        console.error('[AUTH DEBUG] Error processing login data:', err);
        setError('Failed to process login data');
      }
      return;
    }
    
    // If redirected from OAuth with no visible token, check for cookies
    const referrer = document.referrer;
    const comingFromOAuth = referrer && 
                          (referrer.includes('/auth/google') || 
                           referrer.includes('/api/v1/auth'));
    
    const justLoggedIn = authSuccess === 'true' || comingFromOAuth;
    
    if (justLoggedIn) {      
      // Set flag to indicate we're coming from direct callback
      localStorage.setItem('auth_from_callback', 'true');
      
      // The backend should have set cookies - try to authenticate with them
      handleLoginSuccess(null, null);
      
      // Remove any query params
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      
      // Navigate to destination
      navigate(from, { replace: true });
    }
  }, [token, userData, authSuccess, handleLoginSuccess, navigate, from]);
  
  // Reset auth failed state when login page loads
  useEffect(() => {
    // Reset the auth failed state when the login page mounts
    resetAuthFailedState();
    
    // Also clear any localStorage flags that might prevent auth checks
    localStorage.removeItem('auth_checked');
    localStorage.removeItem('auth_from_callback');
    
    // Check if we came from a logout
    const fromLogout = sessionStorage.getItem('from_logout');
    if (fromLogout) {      // Remove the flag
      sessionStorage.removeItem('from_logout');
      
      // Clear all auth-related data
      localStorage.removeItem('has_valid_token');
      localStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_callback_processed');
      
      // Ensure cookies are cleared
      document.cookie = 'jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=' + window.location.hostname;
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=' + window.location.hostname;
      document.cookie = 'jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
    }
    
    // Check for URL parameters that indicate auth failure
    const hasAuthError = queryParams.get('error') || location.hash.includes('error');
    if (hasAuthError) { 
      // Clear cookies as they might be stale or invalid
      document.cookie = 'jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=' + window.location.hostname;
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=' + window.location.hostname;
      document.cookie = 'jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
    }
  }, []);
  
  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated && !loading && initialAuthCheckComplete) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, loading, initialAuthCheckComplete, navigate, from]);
  
  if (loading || !initialAuthCheckComplete) {
    return (
      <Layout>
        <PageContainer style={{ justifyContent: 'center' }}>
          <LoadingSpinner size={40} />
          <p style={{ marginTop: '1rem', color: 'var(--textSecondary)' }}>Loading authentication status...</p>
        </PageContainer>
      </Layout>
    );
  }
  
  // If not loading and not authenticated, show login UI
  return (
    <Layout>
      <PageContainer>
        <PageTitle>Welcome to OtakuList</PageTitle>
        <PageSubtitle>
          Track, discover, and share your favorite anime with fellow otaku from around the world
        </PageSubtitle>
        
        <ContentGrid>
          <LoginSection>
            <Card>
              <Logo>
                {/* Try to load logo image with fallback */}
                <img 
                  src="/images/logo.png" 
                  alt="OtakuList Logo" 
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const fallback = document.getElementById('logo-fallback');
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <LogoFallback id="logo-fallback" style={{ display: 'none' }}>
                  O
                </LogoFallback>
                <h1>OtakuList</h1>
              </Logo>
              
              {error && (
                <ErrorMessage>
                  <Key size={16} />
                  {error}
                </ErrorMessage>
              )}
              
              <p style={{ marginBottom: '1.5rem', color: 'var(--textSecondary)' }}>
                Sign in to track your anime, create custom lists, and join the community.
              </p>
              
              <LoginButton onClick={handleGoogleLogin}>
                <LogIn size={20} />
                Continue with Google
              </LoginButton>
              
              <QuoteCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Quote size={24} style={{ color: 'var(--primary)', opacity: 0.5, marginBottom: '0.5rem' }} />
                <p>"{randomQuote.quote}"</p>
                <cite>— {randomQuote.source}</cite>
              </QuoteCard>
            </Card>
          </LoginSection>
          
          <FeaturesSection>
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * (index + 1) }}
              >
                <h3>{feature.icon} {feature.title}</h3>
                <p>{feature.description}</p>
              </FeatureCard>
            ))}
            
            <Card style={{ marginTop: '1rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Why Join OtakuList?</h3>
              <ul style={{ color: 'var(--textSecondary)', lineHeight: '1.6' }}>
                <li>Automatically track your watching progress</li>
                <li>Discover new anime based on your preferences</li>
                <li>Create custom watchlists and playlists</li>
                <li>Share recommendations with friends</li>
                <li>Get notified when new episodes are available</li>
              </ul>
            </Card>
          </FeaturesSection>
        </ContentGrid>
      </PageContainer>
    </Layout>
  );
};

export default LoginPage; 