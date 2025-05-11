import styled from 'styled-components';

// Layout components
export const PageContainer = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  min-height: 100vh;  
`;

export const ContentWrapper = styled.div`
  padding: 0 2rem;
  padding-left: 0;
  
  @media (max-width: 768px) {
    padding: 0;
  }
`;

export const PlaylistGrid = styled.div`
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 2rem;
  min-height: 100vh;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

// Utility components
export const LoadingWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  min-height: 300px;
`;

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  
  svg {
    color: var(--textSecondary);
    margin-bottom: 1rem;
    opacity: 0.7;
  }
  
  h3 {
    font-size: 1.2rem;
    color: var(--textPrimary);
    margin-bottom: 0.5rem;
  }
  
  p {
    color: var(--textSecondary);
    max-width: 500px;
  }
`;

// Utility functions
export const formatDateString = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}; 