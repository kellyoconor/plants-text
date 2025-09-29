import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User, Droplets, Flower, Sparkles } from 'lucide-react';
import TypeWriter from '../animations/TypeWriter';

interface ChatMessage {
  id: string;
  type: 'user' | 'plant' | 'care_reminder';
  message: string;
  timestamp: string;
  taskType?: string;
  isNew?: boolean;
}

interface AnimatedChatBubbleProps {
  message: ChatMessage;
  plantPersonality?: string;
  index: number;
}

const AnimatedChatBubble: React.FC<AnimatedChatBubbleProps> = ({
  message,
  plantPersonality = 'chill',
  index,
}) => {
  const getPersonalityGradient = (personality: string) => {
    switch (personality) {
      case 'dramatic': return 'from-purple-500 to-pink-500';
      case 'sarcastic': return 'from-blue-500 to-cyan-500';
      case 'chill': return 'from-green-500 to-emerald-500';
      case 'chatty': return 'from-orange-500 to-yellow-500';
      case 'zen': return 'from-indigo-500 to-purple-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getCareIcon = (taskType?: string) => {
    switch (taskType) {
      case 'watering': return <Droplets className="w-3 h-3" />;
      case 'fertilizing': return <Flower className="w-3 h-3" />;
      case 'misting': return <Sparkles className="w-3 h-3" />;
      default: return <Bot className="w-3 h-3" />;
    }
  };

  const isUser = message.type === 'user';
  const isCareReminder = message.type === 'care_reminder';

  return (
    <motion.div
      className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 25,
        delay: index * 0.1,
      }}
    >
      <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Avatar */}
        {!isUser && (
          <motion.div
            className={`
              w-8 h-8 rounded-full bg-gradient-to-br ${getPersonalityGradient(plantPersonality)}
              flex items-center justify-center text-white shadow-lg
            `}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isCareReminder ? getCareIcon(message.taskType) : <Bot className="w-4 h-4" />}
          </motion.div>
        )}

        {isUser && (
          <motion.div
            className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-lg"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <User className="w-4 h-4" />
          </motion.div>
        )}

        {/* Message bubble */}
        <motion.div
          className={`
            relative px-4 py-3 rounded-2xl shadow-lg max-w-full
            ${isUser 
              ? 'bg-blue-500 text-white rounded-br-sm' 
              : isCareReminder
                ? 'bg-gradient-to-br from-amber-100 to-orange-100 text-amber-800 border border-amber-200 rounded-bl-sm'
                : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'
            }
          `}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          {/* Care reminder header */}
          {isCareReminder && (
            <motion.div 
              className="flex items-center space-x-1 mb-2 text-amber-700"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {getCareIcon(message.taskType)}
              <span className="text-xs font-medium uppercase tracking-wider">
                {message.taskType} Reminder
              </span>
            </motion.div>
          )}

          {/* Message content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {message.isNew ? (
              <TypeWriter 
                text={message.message} 
                speed={30}
                className="text-sm leading-relaxed"
              />
            ) : (
              <p className="text-sm leading-relaxed">{message.message}</p>
            )}
          </motion.div>

          {/* Timestamp */}
          <motion.p 
            className={`text-xs mt-2 ${
              isUser ? 'text-blue-100' : 'text-gray-500'
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 0.3 }}
          >
            {new Date(message.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </motion.p>

          {/* Message tail */}
          <div 
            className={`
              absolute top-4 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent
              ${isUser 
                ? 'right-0 transform translate-x-2 border-t-blue-500' 
                : 'left-0 transform -translate-x-2 border-t-white'
              }
              ${isCareReminder && !isUser ? 'border-t-amber-100' : ''}
            `}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AnimatedChatBubble;
