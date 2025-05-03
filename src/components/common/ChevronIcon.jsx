import { ChevronDown } from 'lucide-react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const IconWrapper = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--textSecondary);
`;

const ChevronIcon = ({ isRotated, size = 16 }) => {
  return (
    <IconWrapper
      animate={{ rotate: isRotated ? 180 : 0 }}
      transition={{ duration: 0.3 }}
    >
      <ChevronDown size={size} />
    </IconWrapper>
  );
};

export default ChevronIcon; 