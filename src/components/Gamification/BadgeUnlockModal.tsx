import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, X } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useConfetti } from './ConfettiProvider';

export function BadgeUnlockModal() {
  const { state } = useApp();
  const { darkMode, badges } = state;
  const { celebrate } = useConfetti();
  const [unlockedBadges, setUnlockedBadges] = useState<typeof state.badges>([]);
  const [currentBadgeIndex, setCurrentBadgeIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const recentlyUnlocked = badges.filter(badge => 
      badge.unlocked && badge.unlockedAt && 
      new Date().getTime() - new Date(badge.unlockedAt).getTime() < 5000
    );

    if (recentlyUnlocked.length > 0) {
      setUnlockedBadges(recentlyUnlocked);
      setCurrentBadgeIndex(0);
      setIsOpen(true);
      celebrate('achievement');
    }
  }, [badges, celebrate]);

  const handleClose = () => {
    if (currentBadgeIndex < unlockedBadges.length - 1) {
      setCurrentBadgeIndex(prev => prev + 1);
    } else {
      setIsOpen(false);
      setUnlockedBadges([]);
      setCurrentBadgeIndex(0);
    }
  };

  const currentBadge = unlockedBadges[currentBadgeIndex];

  if (!isOpen || !currentBadge) return null;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'mythic': return 'from-red-500 to-pink-500';
      case 'platinum': return 'from-purple-500 to-indigo-500';
      case 'gold': return 'from-yellow-400 to-orange-500';
      case 'silver': return 'from-gray-400 to-gray-600';
      case 'bronze': return 'from-amber-600 to-amber-800';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotateY: 180 }}
          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
          exit={{ scale: 0.5, opacity: 0, rotateY: -180 }}
          transition={{ type: 'spring', duration: 0.8 }}
          className={`relative max-w-md w-full p-8 rounded-2xl ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-2xl`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleClose}
            className={`absolute top-4 right-4 p-2 rounded-lg ${
              darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            } transition-colors`}
          >
            <X size={20} />
          </button>

          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="mb-6"
            >
              <div className={`relative mx-auto w-24 h-24 bg-gradient-to-r ${getRarityColor(currentBadge.rarity)} rounded-full flex items-center justify-center`}>
                <span className="text-4xl">{currentBadge.icon}</span>
                <motion.div
                  animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute inset-0 border-4 border-dashed border-white/30 rounded-full"
                />
              </div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}
            >
              Badge Unlocked! 🏆
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-6"
            >
              <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {currentBadge.name}
              </h3>
              <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {currentBadge.description}
              </p>
              
              <div className="flex items-center justify-center space-x-4">
                <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getRarityColor(currentBadge.rarity)} text-white text-sm font-medium capitalize`}>
                  {currentBadge.rarity}
                </div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {currentBadge.category}
                </div>
              </div>
            </motion.div>

            {unlockedBadges.length > 1 && (
              <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {currentBadgeIndex + 1} of {unlockedBadges.length} new badges
              </p>
            )}

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClose}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-200"
            >
              {currentBadgeIndex < unlockedBadges.length - 1 ? 'Next Badge' : 'Awesome!'}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
