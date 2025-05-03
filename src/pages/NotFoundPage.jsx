import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { ChevronLeft } from 'lucide-react';
import Layout from '../components/layout/Layout.jsx';

const NotFoundContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 70vh;
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
`;

const ErrorCode = styled.h1`
  font-size: 8rem;
  font-weight: 700;
  color: var(--tertiary);
  margin: 0;
  line-height: 1;
  opacity: 0.8;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    font-size: 6rem;
  }
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 600;
  color: var(--textPrimary);
  margin: 1.5rem 0;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const Description = styled.p`
  font-size: 1.1rem;
  color: var(--textSecondary);
  margin-bottom: 2rem;
`;

const BackButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--tertiary);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--tertiaryLight);
    color: white;
    transform: translateY(-2px);
  }
`;

// const Illustration = styled.div`
//   margin-bottom: 2rem;
  
//   img {
//     max-width: 100%;
//     height: auto;
//     max-height: 200px;
//   }
// `;

const NotFoundPage = () => {
  const navigate = useNavigate();
  
  // Track 404 error for analytics (if needed)
  useEffect(() => {
    // You could add analytics tracking here if needed
  }, []);
  
  return (
    <Layout>
      <NotFoundContainer>
        {/* <Illustration>
          <img src="/images/404-illustration.svg" alt="Page not found" 
               onError={(e) => e.target.style.display = 'none'} />
        </Illustration> */}
        <ErrorCode>404</ErrorCode>
        <Title>Page Not Found</Title>
        <Description>
          Oops! The page you're looking for doesn't exist or has been moved.
        </Description>
        <BackButton to="/">
          <ChevronLeft size={18} />
          Back to Home
        </BackButton>
      </NotFoundContainer>
    </Layout>
  );
};

export default NotFoundPage; 