import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Card from '../components/common/Card';

export const DashboardHeader = styled(motion.div)`
  background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.15), rgba(var(--secondary-rgb), 0.15));
  padding: 2.5rem;
  border-radius: 20px;
  margin-bottom: 2.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(var(--primary-rgb), 0.1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 150px;
    height: 150px;
    background: radial-gradient(circle, rgba(var(--primary-rgb), 0.1) 0%, transparent 70%);
    border-radius: 50%;
    transform: translate(30%, -30%);
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100px;
    height: 100px;
    background: radial-gradient(circle, rgba(var(--secondary-rgb), 0.1) 0%, transparent 70%);
    border-radius: 50%;
    transform: translate(-30%, 30%);
  }
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    margin-top: 1rem;
    margin-bottom: 1.5rem;
  }
  
  @media (max-width: 480px) {
    padding: 1.25rem;
    border-radius: 16px;
    margin-top: 0.5rem;
    margin-bottom: 1rem;
  }
`;

export const WelcomeMessage = styled.div`
  margin-bottom: 1.5rem;
  
  @media (max-width: 480px) {
    margin-bottom: 1rem;
  }
`;

export const Greeting = styled.h1`
  font-size: 2.75rem;
  font-weight: 800;
  margin-bottom: 0.75rem;
  color: var(--textPrimary);
  background: var(--gradientPrimary);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  
  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.75rem;
  }
`;

export const SubGreeting = styled.p`
  font-size: 1.1rem;
  color: var(--textSecondary);
  max-width: 700px;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    line-height: 1.5;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

export const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 1.25rem;
  margin-top: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    margin-top: 1rem;
    width: 100%;
  }
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

export const AvatarSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  
  @media (max-width: 768px) {
    margin-bottom: 1rem;
  }
`;

export const AvatarWrapper = styled.div`
  position: relative;
  margin-bottom: 1rem;
  cursor: pointer;
`;

export const AvatarOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: 1;
  }
`;

export const AvatarInput = styled.input`
  display: none;
`;

export const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  
  @media (max-width: 480px) {
    margin-bottom: 1rem;
  }
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--textPrimary);
  
  @media (max-width: 480px) {
    margin-bottom: 0.35rem;
    font-size: 0.9rem;
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--borderColor);
  border-radius: 4px;
  background-color: var(--inputBackground);
  color: var(--textPrimary);
  font-size: 1rem;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(70, 54, 113, 0.2);
  }
  
  @media (max-width: 480px) {
    padding: 0.65rem 0.85rem;
    font-size: 0.9rem;
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--borderColor);
  border-radius: 4px;
  background-color: var(--inputBackground);
  color: var(--textPrimary);
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(70, 54, 113, 0.2);
  }
  
  @media (max-width: 480px) {
    padding: 0.65rem 0.85rem;
    font-size: 0.9rem;
    min-height: 80px;
  }
`;

export const Button = styled.button`
  background-color: var(--primary);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background-color: var(--primaryLight);
  }
  
  &:disabled {
    background-color: var(--textSecondary);
    cursor: not-allowed;
  }
  
  @media (max-width: 480px) {
    width: 100%;
    justify-content: center;
    padding: 0.7rem 1rem;
  }
`;

export const ViewProfileButton = styled(Link)`
  background-color: var(--cardBackground);
  color: var(--textPrimary);
  border: 1px solid var(--borderColor);
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  
  &:hover {
    background-color: var(--backgroundLight);
    border-color: var(--primary);
  }
  
  @media (max-width: 480px) {
    width: 100%;
    justify-content: center;
    padding: 0.7rem 1rem;
  }
`;

export const ProfileSummary = styled(Card)`
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  text-align: center;
  border: 1px solid var(--borderColor);
  box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.1);
  
  h2 {
    margin: 0.5rem 0 0.25rem;
    font-weight: 700;
    font-size: 2rem;
    
    @media (max-width: 480px) {
      font-size: 1.5rem;
    }
  }
  
  .username {
    color: var(--textSecondary);
    font-size: 1.1rem;
    margin-bottom: 8px;
    
    @media (max-width: 480px) {
      font-size: 0.9rem;
    }
  }
  
  .bio {
    color: var(--textPrimary);
    margin-bottom: 12px;
    padding: 0 1rem;
    
    @media (max-width: 480px) {
      font-size: 0.9rem;
    }
  }
`;

export const EditProfileCard = styled(Card)`
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  margin-top: 0;
`;

export const FormSection = styled.div`
  margin-bottom: 1.5rem;
  h3 {
    margin-bottom: 1rem;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--textPrimary);
    border-bottom: 1px solid var(--borderColor);
    padding-bottom: 0.5rem;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 1rem;
    
    h3 {
      font-size: 1rem;
      margin-bottom: 0.75rem;
    }
  }
`;

export const SocialMediaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
`;

export const InputWithIcon = styled.div`
  position: relative;
  
  input {
    padding-left: 2.5rem;
  }
  
  svg {
    position: absolute;
    top: 50%;
    left: 1rem;
    transform: translateY(-50%);
    color: var(--textSecondary);
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--borderColor);
  border-radius: 4px;
  background-color: var(--inputBackground);
  color: var(--textPrimary);
  font-size: 1rem;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(70, 54, 113, 0.2);
  }
  
  @media (max-width: 480px) {
    padding: 0.65rem 0.85rem;
    font-size: 0.9rem;
  }
`;

export const CheckboxGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

export const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  background-color: var(--backgroundLight);
  border: 1px solid var(--borderColor);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: var(--primary);
  }
  
  &.selected {
    background-color: rgba(var(--primary-rgb), 0.1);
    border-color: var(--primary);
  }
  
  input {
    display: none;
  }
`;

export const TabButton = styled.button`
  padding: 0.75rem 1.25rem;
  background-color: ${props => props.active ? 'var(--primary)' : 'transparent'};
  color: ${props => props.active ? 'white' : 'var(--textPrimary)'};
  border: ${props => props.active ? 'none' : '1px solid var(--borderColor)'};
  border-radius: 4px;
  cursor: pointer;
  margin-right: 0.5rem;
  margin-bottom: 1rem;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.active ? 'var(--primary)' : 'var(--textSecondary)'};
  }
`;

export const SliderContainer = styled.div`
  width: 100%;
  margin-top: 0.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const Slider = styled.input`
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 4px;
  background: var(--textSecondary);
  border-radius: 4px;
  outline: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--primary);
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      transform: scale(1.2);
      background: var(--primaryLight);
    }
  }
  
  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--primary);
    cursor: pointer;
    border: none;
    transition: all 0.2s ease;
    
    &:hover {
      transform: scale(1.2);
      background: var(--primaryLight);
    }
  }
`;

export const Badge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: ${props => props.background || 'var(--bgSecondary)'};
  color: ${props => props.color || 'var(--textSecondary)'};
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
`;

export const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  -webkit-appearance: none;
  appearance: none;
  background-color: var(--bgSecondary);
  margin: 0;
  width: 1.5rem;
  height: 1.5rem;
  border: 1px solid var(--borderColor);
  border-radius: 4px;
  display: grid;
  place-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: var(--primary);
  }
  
  &:checked {
    background-color: var(--primary);
    border-color: var(--primary);
  }
  
  &:checked::before {
    content: "";
    width: 0.65em;
    height: 0.65em;
    transform: scale(1);
    transform-origin: center;
    clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
    background-color: white;
  }
`; 