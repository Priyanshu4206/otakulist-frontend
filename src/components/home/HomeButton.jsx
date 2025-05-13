import React from 'react';
import styled, { css } from 'styled-components';

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  border: none;
  border-radius: ${({ pill }) => pill ? '999px' : '12px'};
  padding: ${({ size }) => size === 'large' ? '0.95rem 2.1rem' : '0.65rem 1.4rem'};
  font-size: ${({ size }) => size === 'large' ? '1.13rem' : '1rem'};
  font-weight: 700;
  cursor: pointer;
  width: ${({ fullWidth }) => fullWidth ? '100%' : 'auto'};
  background: ${({ variant }) => {
    switch (variant) {
      case 'primary': return 'var(--gradientPrimary)';
      case 'secondary': return 'var(--gradientSecondary)';
      case 'glass': return 'rgba(255,255,255,0.08)';
      default: return 'var(--gradientAccent)';
    }
  }};
  color: ${({ variant }) => variant === 'glass' ? 'var(--textPrimary)' : 'white'};
  box-shadow: ${({ variant }) => variant === 'glass' ? '0 4px 24px rgba(0,0,0,0.10)' : '0 2px 12px rgba(0,0,0,0.13)'};
  backdrop-filter: ${({ variant }) => variant === 'glass' ? 'blur(8px)' : 'none'};
  transition: background 0.18s, color 0.18s, transform 0.18s, box-shadow 0.18s;
  margin: 0;
  outline: none;
  &:hover:not(:disabled) {
    background: ${({ variant }) => variant === 'glass' ? 'rgba(255,255,255,0.16)' : 'var(--gradientPrimary)'};
    color: white;
    transform: translateY(-2px) scale(1.03);
    box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  }
  &:active:not(:disabled) {
    transform: scale(0.98);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  animation: fadeInBtn 0.7s cubic-bezier(0.23, 1, 0.32, 1);
  @keyframes fadeInBtn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const Spinner = styled.div`
  border: 2.5px solid rgba(255,255,255,0.25);
  border-top: 2.5px solid var(--primary);
  border-radius: 50%;
  width: 1.2em;
  height: 1.2em;
  animation: spin 0.7s linear infinite;
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const HomeButton = ({
  icon: Icon,
  label,
  variant = 'primary',
  pill = false,
  size = 'medium',
  loading = false,
  fullWidth = false,
  onClick,
  ...props
}) => (
  <Button
    variant={variant}
    pill={pill}
    size={size}
    fullWidth={fullWidth}
    onClick={onClick}
    disabled={loading || props.disabled}
    {...props}
  >
    {loading ? <Spinner /> : Icon && <Icon size={20} />}
    {label}
  </Button>
);

export default HomeButton; 