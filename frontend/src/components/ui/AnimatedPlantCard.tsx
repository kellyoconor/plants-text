import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Droplets, Sun, Thermometer, Sparkles, Heart } from 'lucide-react';
import FadeIn from '../animations/FadeIn';
import FloatingElements from '../animations/FloatingElements';
import { Plant } from '../../types';

interface AnimatedPlantCardProps {
  plant: Plant;
  isSelected: boolean;
  onSelect: (plant: Plant) => void;
  delay?: number;
}

const AnimatedPlantCard: React.FC<AnimatedPlantCardProps> = ({
  plant,
  isSelected,
  onSelect,
  delay = 0,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' };
      case 'medium': return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' };
      case 'hard': return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
    }
  };

  const difficultyStyle = getDifficultyColor(plant.difficulty_level);

  return (
    <FadeIn delay={delay} direction="up">
      <motion.div
        className={`
          relative bg-white rounded-xl shadow-lg border-2 cursor-pointer overflow-hidden
          transition-all duration-300 transform-gpu
          ${isSelected 
            ? 'border-green-400 shadow-green-200 shadow-xl scale-105' 
            : 'border-gray-200 hover:border-green-300 hover:shadow-xl'
          }
        `}
        onClick={() => onSelect(plant)}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ 
          y: -8,
          transition: { type: "spring", stiffness: 300, damping: 20 }
        }}
        whileTap={{ scale: 0.98 }}
        layout
      >
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 opacity-0"
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />

        {/* Floating plant emoji */}
        <div className="absolute top-3 right-3 z-10">
          <FloatingElements intensity="low">
            <div className="text-2xl">🌱</div>
          </FloatingElements>
        </div>

        {/* Like button */}
        <motion.button
          className="absolute top-3 left-3 z-10 p-1 rounded-full bg-white shadow-md"
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Heart 
            className={`w-4 h-4 transition-colors ${
              isLiked ? 'text-red-500 fill-red-500' : 'text-gray-400'
            }`} 
          />
        </motion.button>

        <div className="relative p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div>
              <motion.h3 
                className="font-bold text-gray-900 text-lg leading-tight"
                animate={{ color: isSelected ? '#059669' : '#111827' }}
              >
                {plant.name}
              </motion.h3>
              <p className="text-sm text-gray-600 italic mt-1">{plant.species}</p>
            </div>
            
            <motion.span 
              className={`
                px-3 py-1 rounded-full text-xs font-medium border
                ${difficultyStyle.bg} ${difficultyStyle.text} ${difficultyStyle.border}
              `}
              whileHover={{ scale: 1.05 }}
            >
              {plant.difficulty_level}
            </motion.span>
          </div>

          {/* Care requirements with animations */}
          <div className="space-y-3">
            <motion.div 
              className="flex items-center space-x-3 text-sm text-gray-700"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: delay + 0.1 }}
            >
              <div className="flex items-center space-x-1">
                <Droplets className="w-4 h-4 text-blue-500" />
                <span>Every {plant.care_requirements.watering_frequency_days} days</span>
              </div>
            </motion.div>

            <motion.div 
              className="flex items-center space-x-3 text-sm text-gray-700"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: delay + 0.2 }}
            >
              <div className="flex items-center space-x-1">
                <Sun className="w-4 h-4 text-yellow-500" />
                <span className="capitalize">{plant.care_requirements.light_level} light</span>
              </div>
            </motion.div>

            <motion.div 
              className="flex items-center space-x-3 text-sm text-gray-700"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: delay + 0.3 }}
            >
              <div className="flex items-center space-x-1">
                <Thermometer className="w-4 h-4 text-red-500" />
                <span>
                  {plant.care_requirements.ideal_temp_min}°-{plant.care_requirements.ideal_temp_max}°C
                </span>
              </div>
            </motion.div>
          </div>

          {/* Selection indicator */}
          <motion.div
            className="mt-4 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: isSelected ? 1 : 0,
              scale: isSelected ? 1 : 0.8,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-3 py-1 rounded-full">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Selected</span>
            </div>
          </motion.div>

          {/* Hover effect overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-green-500/5 to-transparent pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          />
        </div>

        {/* Bottom gradient line */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isSelected ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          style={{ transformOrigin: 'left' }}
        />
      </motion.div>
    </FadeIn>
  );
};

export default AnimatedPlantCard;
