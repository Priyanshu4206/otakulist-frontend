import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import styled from 'styled-components';
import { CheckCircle, XCircle } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import { motion } from 'framer-motion';

// Styled components for the loading screen
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--background);
  padding: 2rem;
  text-align: center;
`;

const LoadingCard = styled(motion.div)`
  background-color: var(--cardBackground);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  padding: 3rem;
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--gradientPrimary);
  }
`;

const LoadingMessage = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--textPrimary);
  margin: 1.5rem 0 0.5rem 0;
`;

const LoadingDescription = styled.p`
  font-size: 1rem;
  color: var(--textSecondary);
  margin-bottom: 2rem;
  max-width: 320px;
`;

const StatusMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  font-size: 0.9rem;
  color: ${props => props.success ? 'var(--success)' : props.error ? 'var(--danger)' : 'var(--textSecondary)'};
`;

const ProgressSteps = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 320px;
  margin-top: 1.5rem;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 2px;
    background-color: var(--borderColor);
    transform: translateY(-50%);
    z-index: 0;
  }
`;

const ProgressStep = styled.div`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background-color: ${props => props.active ? 'var(--primary)' : 'var(--borderColor)'};
  z-index: 1;
  transition: background-color 0.3s ease;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: ${props => props.active ? '24px' : '0'};
    height: ${props => props.active ? '24px' : '0'};
    border-radius: 50%;
    background-color: rgba(var(--primary-rgb), 0.1);
    transform: translate(-50%, -50%);
    transition: all 0.3s ease;
  }
`;

const Logo = styled.div`
  font-size: 2rem;
  font-weight: 800;
  background: var(--gradientPrimary);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1rem;
`;

// Flag to prevent duplicate API calls
const AUTH_PROCESSED_FLAG = 'auth_callback_processed';

function AuthCallback() {
  const navigate = useNavigate();
  const { handleLoginSuccess } = useAuth();
  const [status, setStatus] = useState({ step: 1, message: 'Establishing secure connection...' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if we've already processed this auth callback session
    const alreadyProcessed = sessionStorage.getItem(AUTH_PROCESSED_FLAG);
    
    if (alreadyProcessed === 'true') {
      navigate('/dashboard', { replace: true });
      return;
    }
    
    const processAuth = async () => {
      try {
        // Set the flag immediately to prevent duplicate processing if component remounts
        sessionStorage.setItem(AUTH_PROCESSED_FLAG, 'true');
        
        // Step 1: Establish connection
        setStatus({ step: 1, message: 'Establishing secure connection...' });
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Step 2: Verify credentials
        setStatus({ step: 2, message: 'Verifying credentials...' });
        
        // Extract data from URL hash fragment
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1) // Remove the leading #
        );
        
        const token = hashParams.get('token');
        const userDataEncoded = hashParams.get('user');
        
        if (!token || !userDataEncoded) {
          throw new Error('Authentication failed. Missing credentials.');
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Step 3: Process data
        setStatus({ step: 3, message: 'Processing user data...' });
        
        // Decode user data
        const userData = JSON.parse(decodeURIComponent(userDataEncoded));
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Step 4: Complete login
        setStatus({ step: 4, message: 'Completing login...' });
        
        // Set a flag to tell the AuthContext we're coming from the auth callback
        // This will be checked in the AuthContext to prevent duplicate API calls
        localStorage.setItem('auth_from_callback', 'true');
        
        // Use the auth context to handle login success with skipRefresh=true to prevent duplicate API calls
        handleLoginSuccess(userData, token);
        
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Step 5: Success
        setStatus({ step: 5, message: 'Authentication successful!' });
        setSuccess(true);
        
        // Final delay before redirect for visual feedback
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Redirect to dashboard
        navigate('/dashboard', { replace: true });
        
      } catch (error) {
        setError(error.message || 'Authentication failed. Please try again.');
        
        // Clear the processed flag on error so user can try again
        sessionStorage.removeItem(AUTH_PROCESSED_FLAG);
        
        // Wait a bit before redirecting after error
        await new Promise(resolve => setTimeout(resolve, 2000));
        navigate('/login?error=auth_failed', { replace: true });
      }
    };

    processAuth();
    
    // Cleanup function to remove the flag if we navigate away before completing
    return () => {
      if (!success && !error) {
        sessionStorage.removeItem(AUTH_PROCESSED_FLAG);
      }
    };
  }, [navigate, handleLoginSuccess, success, error]);

  return (
    <LoadingContainer>
      <LoadingCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Logo>OtakuList</Logo>
        
        {!error && !success && (
          <LoadingSpinner size={48} />
        )}
        
        {success && (
          <CheckCircle size={48} color="var(--success)" />
        )}
        
        {error && (
          <XCircle size={48} color="var(--danger)" />
        )}
        
        <LoadingMessage>
          {error ? 'Authentication Failed' : success ? 'Login Successful!' : 'Authenticating...'}
        </LoadingMessage>
        
        <LoadingDescription>
          {error 
            ? 'We encountered an issue while signing you in. Please try again.' 
            : success 
              ? 'You have been successfully authenticated. Redirecting to dashboard...' 
              : 'Please wait while we securely sign you in to your account.'}
        </LoadingDescription>
        
        {!error && !success && (
          <ProgressSteps>
            <ProgressStep active={status.step >= 1} />
            <ProgressStep active={status.step >= 2} />
            <ProgressStep active={status.step >= 3} />
            <ProgressStep active={status.step >= 4} />
            <ProgressStep active={status.step >= 5} />
          </ProgressSteps>
        )}
        
        <StatusMessage success={success} error={error}>
          {error ? error : status.message}
        </StatusMessage>
      </LoadingCard>
    </LoadingContainer>
  );
}

export default AuthCallback; 