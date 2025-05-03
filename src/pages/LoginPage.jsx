import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { resetAuthFailedState } from '../services/api';

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: var(--background);
  padding: 2rem;
`;

const LoginCard = styled.div`
  background-color: var(--cardBackground);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

const Logo = styled.div`
  margin-bottom: 2rem;
  
  img {
    height: 80px;
    width: 80px;
    margin-bottom: 1rem;
  }
  
  h1 {
    font-size: 1.8rem;
    color: var(--textPrimary);
    margin-bottom: 0.5rem;
  }
  
  p {
    color: var(--textSecondary);
  }
`;

const LoginButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--tertiary);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  width: 100%;
  margin-top: 1.5rem;
  
  &:hover {
    background-color: var(--tertiaryLight);
  }
  
  svg {
    margin-right: 8px;
  }
`;

const QuoteContainer = styled.div`
  margin-top: 2.5rem;
  padding: 1rem;
  background-color: rgba(99, 102, 241, 0.1);
  border-radius: 8px;
  
  p {
    font-style: italic;
    color: var(--textPrimary);
  }
  
  cite {
    display: block;
    margin-top: 0.5rem;
    font-size: 0.9rem;
    color: var(--textSecondary);
  }
`;

// Handle query parameters for token
const useQueryParams = () => {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
};

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
  
  // Handle OAuth callback with token
  useEffect(() => {
    console.log('[AUTH DEBUG] LoginPage mounted, checking for auth tokens/cookies');
    console.log('[AUTH DEBUG] URL params:', {
      token: token ? 'exists' : 'not found',
      userData: userData ? 'exists' : 'not found',
      authSuccess: authSuccess
    });
    
    // According to backend docs, we should have a JWT cookie set automatically
    // after successful OAuth. Check for it or other success indicators.
    
    // Check if we have token in URL (legacy/fallback approach)
    if (token) {
      console.log('[AUTH DEBUG] Found token in URL, processing login');
      try {
        // Parse user data if available
        const parsedUserData = userData ? JSON.parse(userData) : null;
        
        // Handle successful login
        handleLoginSuccess(parsedUserData, token);
        
        // Remove token from URL (to prevent accidental shares)
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
        
        // Navigate to destination
        console.log('[AUTH DEBUG] Navigating to:', from);
        navigate(from, { replace: true });
      } catch (err) {
        console.error('[AUTH DEBUG] Error processing login data:', err);
        setError('Failed to process login data');
      }
      return;
    }
    
    // If redirected from OAuth with no visible token, check for cookies
    // We can't directly access httpOnly cookies, but we can check for success parameters
    // or assume cookies are set after redirect from OAuth endpoint
    
    // Get the referrer to check if we're coming from OAuth
    const referrer = document.referrer;
    const comingFromOAuth = referrer && 
                          (referrer.includes('/auth/google') || 
                           referrer.includes('/api/v1/auth'));
    
    const justLoggedIn = authSuccess === 'true' || comingFromOAuth;
    
    if (justLoggedIn) {
      console.log('[AUTH DEBUG] Detected OAuth redirect with cookies, refreshing user data');
      
      // The backend should have set cookies - try to authenticate with them
      handleLoginSuccess(null, null);
      
      // Remove any query params
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      
      // Navigate to destination
      console.log('[AUTH DEBUG] Navigating to:', from);
      navigate(from, { replace: true });
    }
  }, [token, userData, authSuccess, handleLoginSuccess, navigate, from]);
  
  // Reset auth failed state when login page loads
  useEffect(() => {
    console.log('[AUTH DEBUG] Resetting auth failed state and clearing auth_checked flag');
    
    // Reset the auth failed state when the login page mounts
    resetAuthFailedState();
    
    // Also clear any localStorage flags that might prevent auth checks
    localStorage.removeItem('auth_checked');
    
    // Check for URL parameters that indicate auth failure
    const hasAuthError = queryParams.get('error') || location.hash.includes('error');
    if (hasAuthError) {
      console.log('[AUTH DEBUG] Auth error detected in URL');
      // Clear cookies as they might be stale or invalid
      document.cookie = 'jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=' + window.location.hostname;
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=' + window.location.hostname;
      document.cookie = 'jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
    }
    
    // If we came from a logout, we might need to clear some additional state
    const fromLogout = sessionStorage.getItem('from_logout');
    if (fromLogout) {
      console.log('[AUTH DEBUG] User came from logout, clearing additional state');
      // Remove the flag
      sessionStorage.removeItem('from_logout');
      // Clear additional state
      localStorage.removeItem('has_valid_token');
      localStorage.removeItem('auth_token');
      // Ensure cookies are cleared
      document.cookie = 'jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=' + window.location.hostname;
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=' + window.location.hostname;
      document.cookie = 'jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
    }
  }, []);
  
  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated && !loading) {
      console.log('[AUTH DEBUG] Already authenticated, redirecting to:', from);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, from]);
  
  // If still loading or initial auth check is not complete, show a loading spinner
  if (loading || !initialAuthCheckComplete) {
    return <LoadingSpinner fullScreen />;
  }

  // If authenticated but still on this page (rare race condition), redirect immediately
  if (isAuthenticated) {
    console.log('[AUTH DEBUG] User authenticated but still on login page, redirecting immediately');
    navigate(from, { replace: true });
    return null;
  }
  
  return (
    <LoginContainer>
      <LoginCard>
        <Logo>
          <img src="/images/logo.svg" alt="Anime-Share Logo" />
          <h1>Anime-Share</h1>
          <p>Join the community of anime enthusiasts</p>
        </Logo>
        
        {error && (
          <div style={{ 
            padding: '0.75rem',
            marginBottom: '1rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--error)',
            borderRadius: '4px'
          }}>
            {error === 'auth_failed' ? 'Authentication failed. Please try again.' : error}
          </div>
        )}
        
        <LoginButton onClick={loginWithGoogle}>
          <LogIn size={20} /> Login with Google
        </LoginButton>
        
        <QuoteContainer>
          <p>"{randomQuote.quote}"</p>
          <cite>— {randomQuote.source}</cite>
        </QuoteContainer>
      </LoginCard>
    </LoginContainer>
  );
};

export default LoginPage; 