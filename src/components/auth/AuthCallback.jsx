import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

function AuthCallback() {
  const navigate = useNavigate();
  const { handleLoginSuccess } = useAuth();

  useEffect(() => {
    // Extract data from URL hash fragment
    const hashParams = new URLSearchParams(
      window.location.hash.substring(1) // Remove the leading #
    );
    
    const token = hashParams.get('token');
    const userDataEncoded = hashParams.get('user');
    
    if (token && userDataEncoded) {
      try {
        // Decode user data
        const userData = JSON.parse(decodeURIComponent(userDataEncoded));
        
        // Use the auth context to handle login success
        handleLoginSuccess(userData, token);
        
        // Redirect to dashboard
        navigate('/dashboard');
      } catch (error) {
        console.error('Error parsing user data:', error);
        navigate('/login?error=invalid_data');
      }
    } else {
      // Handle authentication error
      navigate('/login?error=auth_failed');
    }
  }, [navigate, handleLoginSuccess]);

  return (
    <div className="auth-callback">
      <p>Completing authentication, please wait...</p>
    </div>
  );
}

export default AuthCallback; 