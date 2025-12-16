import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Clock } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export function BonusXPIndicator() {
  const { state } = useApp();
  const { xpSystem, darkMode } = state;

  if (!xpSystem.bonusXPActive || !xpSystem.bonusXPExpiry) return null;

  const timeRemaining = xpSystem.bonusXPExpiry.getTime() - new Date().getTime();
  const minutesLeft = Math.ceil(timeRemaining / (1000 * 60));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.9 }}
        className="fixed top-20 right-4 z-40"
      >
        <motion.div
          animate={{ 
            boxShadow: [
              '0 0 20px rgba(245, 158, 11, 0.3)',
              '0 0 30px rgba(245, 158, 11, 0.5)',
              '0 0 20px rgba(245, 158, 11, 0.3)'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`p-4 rounded-xl ${
            darkMode ? 'bg-gray-800 border-yellow-500' : 'bg-white border-yellow-400'
          } border-2 shadow-lg`}
        >
          <div className="flex items-center space-x-3">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg"
            >
              <Zap className="h-5 w-5 text-white" />
            </motion.div>
            
            <div>
              <div className={`font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                {xpSystem.xpMultiplier}x XP Boost Active!
              </div>
              <div className={`text-sm flex items-center space-x-1 ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                <Clock className="h-4 w-4" />
                <span>{minutesLeft}m remaining</span>
              </div>
            </div>
          </div>
          
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ 
                duration: timeRemaining / 1000,
                ease: 'linear'
              }}
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}