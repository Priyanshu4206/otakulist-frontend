import styled from 'styled-components';

export const GroupContainer = styled.section`
  background: rgba(var(--cardBackground-rgb), 0.95);
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.10);
  border: 1px solid var(--borderColor);
  margin-bottom: 2.5rem;
  padding: 2rem 2.5rem;
  position: relative;
  transition: background 0.3s, box-shadow 0.3s;
  @media (max-width: 600px) {
    padding: 1.25rem 0.75rem;
  }
`;

export const GroupTitle = styled.h2`
  font-size: 1.35rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--primary);
  background: var(--gradientPrimary);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

export const GroupDescription = styled.p`
  color: var(--textSecondary);
  font-size: 1rem;
  margin-bottom: 1.5rem;
`; 