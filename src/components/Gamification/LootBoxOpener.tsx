import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Sparkles, Zap, Coins, Gift, Crown } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import confetti from 'canvas-confetti';

interface LootBoxReward {
  id: string;
  type: 'xp' | 'coins' | 'powerup' | 'badge';
  amount: number;
  name: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  color: string;
}

const LOOT_REWARDS: Record<string, LootBoxReward[]> = {
  common: [
    { id: 'c1', type: 'xp', amount: 50, name: 'Small XP Boost', icon: '⚡', rarity: 'common', color: 'from-gray-400 to-gray-600' },
    { id: 'c2', type: 'coins', amount: 100, name: 'Coins', icon: '💰', rarity: 'common', color: 'from-green-400 to-green-600' },
    { id: 'c3', type: 'xp', amount: 75, name: 'XP Boost', icon: '⚡', rarity: 'common', color: 'from-blue-400 to-blue-600' },
  ],
  rare: [
    { id: 'r1', type: 'xp', amount: 200, name: 'XP Bundle', icon: '⚡', rarity: 'rare', color: 'from-cyan-400 to-blue-500' },
    { id: 'r2', type: 'coins', amount: 500, name: 'Coin Pack', icon: '💰', rarity: 'rare', color: 'from-purple-400 to-pink-500' },
    { id: 'r3', type: 'powerup', amount: 1, name: 'Focus Mode', icon: '🎯', rarity: 'rare', color: 'from-orange-400 to-red-500' },
  ],
  epic: [
    { id: 'e1', type: 'xp', amount: 500, name: 'Massive XP', icon: '⚡', rarity: 'epic', color: 'from-purple-500 to-pink-500' },
    { id: 'e2', type: 'coins', amount: 1000, name: 'Coin Stash', icon: '💰', rarity: 'epic', color: 'from-fuchsia-500 to-purple-500' },
    { id: 'e3', type: 'powerup', amount: 3, name: 'Power-Up Pack', icon: '🎁', rarity: 'epic', color: 'from-yellow-400 to-orange-500' },
  ],
  legendary: [
    { id: 'l1', type: 'xp', amount: 1000, name: 'LEGENDARY XP', icon: '⚡', rarity: 'legendary', color: 'from-yellow-300 to-amber-500' },
    { id: 'l2', type: 'coins', amount: 2500, name: 'LEGENDARY COINS', icon: '💰', rarity: 'legendary', color: 'from-amber-300 to-yellow-500' },
    { id: 'l3', type: 'badge', amount: 1, name: 'LEGENDARY BADGE', icon: '👑', rarity: 'legendary', color: 'from-yellow-200 to-amber-400' },
  ],
};

interface LootBox {
  id: string;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  owned: number;
  icon: string;
}

export function LootBoxOpener() {
  const { state, dispatch } = useApp();
  const [isOpening, setIsOpening] = useState(false);
  const [openedReward, setOpenedReward] = useState<LootBoxReward | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [selectedBox, setSelectedBox] = useState<LootBox | null>(null);

  // Mock loot boxes - in real app, get from state
  const lootBoxes: LootBox[] = [
    { id: '1', name: 'Common Chest', rarity: 'common', owned: 3, icon: '📦' },
    { id: '2', name: 'Rare Chest', rarity: 'rare', owned: 1, icon: '✨' },
    { id: '3', name: 'Epic Chest', rarity: 'epic', owned: 0, icon: '💎' },
    { id: '4', name: 'Legendary Chest', rarity: 'legendary', owned: 0, icon: '👑' },
  ];

  const openLootBox = (box: LootBox) => {
    if (box.owned === 0 || isOpening) return;

    setIsOpening(true);
    setSelectedBox(box);
    setShowResult(false);
    setOpenedReward(null);

    // Select reward based on rarity with weighted probabilities
    const rewards = LOOT_REWARDS[box.rarity];
    let selectedReward: LootBoxReward;

    if (box.rarity === 'common') {
      selectedReward = rewards[Math.floor(Math.random() * rewards.length)];
    } else if (box.rarity === 'rare') {
      const weights = [60, 30, 10]; // Common, Rare, Epic
      const random = Math.random() * 100;
      if (random < weights[0]) {
        selectedReward = LOOT_REWARDS.common[Math.floor(Math.random() * LOOT_REWARDS.common.length)];
      } else if (random < weights[0] + weights[1]) {
        selectedReward = rewards[Math.floor(Math.random() * rewards.length)];
      } else {
        selectedReward = LOOT_REWARDS.epic[Math.floor(Math.random() * LOOT_REWARDS.epic.length)];
      }
    } else if (box.rarity === 'epic') {
      const weights = [30, 50, 15, 5]; // Common, Rare, Epic, Legendary
      const random = Math.random() * 100;
      if (random < weights[0]) {
        selectedReward = LOOT_REWARDS.common[Math.floor(Math.random() * LOOT_REWARDS.common.length)];
      } else if (random < weights[0] + weights[1]) {
        selectedReward = LOOT_REWARDS.rare[Math.floor(Math.random() * LOOT_REWARDS.rare.length)];
      } else if (random < weights[0] + weights[1] + weights[2]) {
        selectedReward = rewards[Math.floor(Math.random() * rewards.length)];
      } else {
        selectedReward = LOOT_REWARDS.legendary[Math.floor(Math.random() * LOOT_REWARDS.legendary.length)];
      }
    } else {
      // Legendary - always gives epic or legendary
      const weights = [20, 80]; // Epic, Legendary
      const random = Math.random() * 100;
      if (random < weights[0]) {
        selectedReward = LOOT_REWARDS.epic[Math.floor(Math.random() * LOOT_REWARDS.epic.length)];
      } else {
        selectedReward = rewards[Math.floor(Math.random() * rewards.length)];
      }
    }

    setOpenedReward(selectedReward);

    // Animation delay
    setTimeout(() => {
      setIsOpening(false);
      setShowResult(true);

      // Award reward
      if (selectedReward.type === 'xp') {
        dispatch({ type: 'ADD_XP', payload: { amount: selectedReward.amount, source: `${box.name} Opening` } });
      }

      // Confetti based on rarity
      if (selectedReward.rarity === 'legendary') {
        confetti({ particleCount: 300, spread: 120, origin: { y: 0.5 } });
        setTimeout(() => confetti({ particleCount: 300, spread: 120, origin: { y: 0.5 } }), 400);
        setTimeout(() => confetti({ particleCount: 300, spread: 120, origin: { y: 0.5 } }), 800);
      } else if (selectedReward.rarity === 'epic') {
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 } });
        setTimeout(() => confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 } }), 300);
      } else if (selectedReward.rarity === 'rare') {
        confetti({ particleCount: 75, spread: 60, origin: { y: 0.5 } });
      } else {
        confetti({ particleCount: 30, spread: 40, origin: { y: 0.5 } });
      }

      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: Date.now().toString(),
          type: 'reward',
          title: `🎁 ${selectedReward.name}!`,
          message: `You opened ${box.name} and got ${selectedReward.name}!`,
          timestamp: new Date(),
          priority: selectedReward.rarity === 'legendary' ? 'high' : 'medium',
        },
      });
    }, 3000);
  };

  const getRarityStyles = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'border-yellow-400 bg-gradient-to-br from-yellow-900/30 to-amber-900/30';
      case 'epic':
        return 'border-purple-400 bg-gradient-to-br from-purple-900/30 to-pink-900/30';
      case 'rare':
        return 'border-blue-400 bg-gradient-to-br from-blue-900/30 to-cyan-900/30';
      default:
        return 'border-gray-400 bg-gray-800/30';
    }
  };

  return (
    <div className="brutal-card bg-gray-900 border-cyan-500/30 p-4 sm:p-6">
      <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2 mb-6">
        <Package className="text-cyan-400" size={20} />
        Treasure Chests
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {lootBoxes.map((box) => (
          <motion.div
            key={box.id}
            whileHover={box.owned > 0 && !isOpening ? { y: -4, scale: 1.05 } : {}}
            whileTap={box.owned > 0 && !isOpening ? { scale: 0.95 } : {}}
            onClick={() => box.owned > 0 && !isOpening && openLootBox(box)}
            className={`relative p-4 rounded-lg border-4 cursor-pointer text-center transition-all ${
              box.owned > 0 && !isOpening
                ? `${getRarityStyles(box.rarity)} hover:brightness-110`
                : 'border-gray-700 bg-gray-800/50 opacity-50 cursor-not-allowed'
            }`}
          >
            <div className="text-5xl mb-2">{box.icon}</div>
            <h4 className="font-bold text-white text-sm mb-1">{box.name}</h4>
            <p className="text-xs text-gray-400">Owned: {box.owned}</p>
            {box.owned > 0 && !isOpening && (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute -top-2 -right-2 bg-lime-500 border-2 border-black rounded-full w-6 h-6 flex items-center justify-center"
              >
                <Sparkles size={12} className="text-black" />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Opening Animation */}
      <AnimatePresence>
        {isOpening && selectedBox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -180 }}
              animate={{ scale: [1, 1.2, 1], rotate: [0, 360, 720] }}
              transition={{ duration: 3, ease: 'easeInOut' }}
              className="text-8xl"
            >
              {selectedBox.icon}
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute text-4xl text-yellow-400 font-black"
            >
              OPENING...
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result Modal */}
      <AnimatePresence>
        {showResult && openedReward && selectedBox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={() => setShowResult(false)}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              className={`brutal-card p-8 max-w-sm w-full text-center border-4 ${getRarityStyles(openedReward.rarity)}`}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.5, 1] }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="text-7xl mb-4"
              >
                {openedReward.icon}
              </motion.div>
              <motion.h3
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-black text-white mb-2"
              >
                {openedReward.rarity === 'legendary' && '👑 LEGENDARY! 👑'}
                {openedReward.rarity === 'epic' && '💎 EPIC! 💎'}
                {openedReward.rarity === 'rare' && '✨ RARE! ✨'}
                {openedReward.rarity === 'common' && '📦 UNLOCKED!'}
              </motion.h3>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xl font-bold text-lime-400 mb-6"
              >
                {openedReward.name}
              </motion.p>
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowResult(false)}
                className="px-8 py-4 bg-lime-500 text-black font-black text-lg border-4 border-black brutal-shadow"
              >
                CLAIM REWARD
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

