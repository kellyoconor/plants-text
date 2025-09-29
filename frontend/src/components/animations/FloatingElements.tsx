import React from 'react';
import { motion } from 'framer-motion';

interface FloatingElementsProps {
  children: React.ReactNode;
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
}

const FloatingElements: React.FC<FloatingElementsProps> = ({
  children,
  intensity = 'medium',
  className = '',
}) => {
  const intensityValues = {
    low: { y: [-2, 2], duration: 4 },
    medium: { y: [-5, 5], duration: 3 },
    high: { y: [-8, 8], duration: 2 },
  };

  const { y, duration } = intensityValues[intensity];

  return (
    <motion.div
      className={className}
      animate={{
        y,
      }}
      transition={{
        duration,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
};

export default FloatingElements;
