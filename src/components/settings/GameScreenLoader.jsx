import React from 'react';
import ReactDOM from 'react-dom';
import styled, { keyframes } from 'styled-components';

/**
 * GameScreenLoader - A full screen, theme-aware loader using Portal.
 * @param {object} props
 * @param {string} [props.text] - Optional loading text
 */
const pulse = keyframes`
  0% { opacity: 0.5; transform: scale(0.9); }
  50% { opacity: 1; transform: scale(1.1); }
  100% { opacity: 0.5; transform: scale(0.9); }
`;

const LoaderOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 9999;
  background: rgba(var(--primary-rgb), 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  width: 100vw;
  transition: background 0.3s;
`;

const AnimatedDots = styled.div`
  display: flex;
  gap: 0.7rem;
  margin-bottom: 1.5rem;
`;

const Dot = styled.div`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--gradientPrimary);
  animation: ${pulse} 1.2s infinite;
  &:nth-child(2) { animation-delay: 0.2s; }
  &:nth-child(3) { animation-delay: 0.4s; }
`;

const LoaderText = styled.div`
  color: var(--primary);
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-align: center;
`;

const GameScreenLoader = ({ text = 'Loading settings...' }) => {
  const portalRoot = document.getElementById('portal-root') || document.body;

  return ReactDOM.createPortal(
    (
      <LoaderOverlay>
        <AnimatedDots>
          <Dot />
          <Dot />
          <Dot />
        </AnimatedDots>
        <LoaderText>{text}</LoaderText>
      </LoaderOverlay>
    ),
    portalRoot
  );
};

export default GameScreenLoader;
