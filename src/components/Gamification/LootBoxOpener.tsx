import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import confetti from 'canvas-confetti';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

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
    { id: 'c1', type: 'xp', amount: 50, name: 'Small XP Boost', icon: '⚡', rarity: 'common', color: 'bg-gray-400' },
    { id: 'c2', type: 'coins', amount: 100, name: 'Coins', icon: '💰', rarity: 'common', color: 'bg-green-400' },
    { id: 'c3', type: 'xp', amount: 75, name: 'XP Boost', icon: '⚡', rarity: 'common', color: 'bg-blue-400' },
  ],
  rare: [
    { id: 'r1', type: 'xp', amount: 200, name: 'XP Bundle', icon: '⚡', rarity: 'rare', color: 'bg-cyan-400' },
    { id: 'r2', type: 'coins', amount: 500, name: 'Coin Pack', icon: '💰', rarity: 'rare', color: 'bg-purple-400' },
    { id: 'r3', type: 'powerup', amount: 1, name: 'Focus Mode', icon: '🎯', rarity: 'rare', color: 'bg-orange-400' },
  ],
  epic: [
    { id: 'e1', type: 'xp', amount: 500, name: 'Massive XP', icon: '⚡', rarity: 'epic', color: 'bg-purple-500' },
    { id: 'e2', type: 'coins', amount: 1000, name: 'Coin Stash', icon: '💰', rarity: 'epic', color: 'bg-fuchsia-500' },
    { id: 'e3', type: 'powerup', amount: 3, name: 'Power-Up Pack', icon: '🎁', rarity: 'epic', color: 'bg-yellow-400' },
  ],
  legendary: [
    { id: 'l1', type: 'xp', amount: 1000, name: 'LEGENDARY XP', icon: '⚡', rarity: 'legendary', color: 'bg-yellow-300' },
    { id: 'l2', type: 'coins', amount: 2500, name: 'LEGENDARY COINS', icon: '💰', rarity: 'legendary', color: 'bg-amber-300' },
    { id: 'l3', type: 'badge', amount: 1, name: 'LEGENDARY BADGE', icon: '👑', rarity: 'legendary', color: 'bg-yellow-200' },
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
  const { darkMode } = state;
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

  return (
    <Card variant="brutal" className="p-6">
      <h3 className={`text-xl font-black font-mono uppercase mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-black'}`}>
        <Package className="w-6 h-6 text-purple-500" />
        Loot Crates
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {lootBoxes.map((box) => (
          <motion.button
            key={box.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openLootBox(box)}
            disabled={box.owned === 0 || isOpening}
            className={`
              relative p-4 flex flex-col items-center justify-center gap-2
              border-2 transition-all
              ${box.owned > 0 
                ? `cursor-pointer ${darkMode ? 'bg-zinc-800 border-white hover:bg-zinc-700' : 'bg-white border-black hover:bg-gray-50'}` 
                : `opacity-50 cursor-not-allowed ${darkMode ? 'bg-zinc-900 border-zinc-700' : 'bg-gray-100 border-gray-300'}`
              }
              ${selectedBox?.id === box.id ? 'ring-2 ring-purple-500 ring-offset-2' : ''}
              font-mono
            `}
            style={{
              boxShadow: box.owned > 0 ? '4px 4px 0px 0px rgba(0,0,0,1)' : 'none'
            }}
          >
            <div className="text-3xl filter drop-shadow-md">{box.icon}</div>
            <div className={`text-xs font-bold uppercase ${darkMode ? 'text-white' : 'text-black'}`}>{box.name}</div>
            <div className={`
              px-2 py-0.5 text-[10px] font-bold border border-current
              ${box.owned > 0 ? 'bg-green-400 text-black' : 'bg-gray-300 text-gray-600'}
            `}>
              x{box.owned}</div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {isOpening && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <Card variant="brutal" className="w-full max-w-md bg-white dark:bg-zinc-900 p-8 flex flex-col items-center text-center relative overflow-hidden">
              <button 
                onClick={() => {
                  setIsOpening(false);
                  setShowResult(false);
                  setOpenedReward(null);
                  setSelectedBox(null);
                }}
                className="absolute top-4 right-4 text-gray-500 hover:text-black dark:hover:text-white"
              >
                ✕
              </button>

              {!showResult ? (
                <motion.div
                  animate={{ 
                    rotate: [0, -5, 5, -5, 5, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="mb-6"
                >
                  <div className="text-8xl">{selectedBox?.icon}</div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                  className="mb-6"
                >
                  <div className={`w-32 h-32 rounded-full flex items-center justify-center text-6xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${openedReward?.color}`}>
                    {openedReward?.icon}
                  </div>
                </motion.div>
              )}

              <h3 className={`text-2xl font-black uppercase font-mono mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>
                {showResult ? openedReward?.name : 'Opening...'}
              </h3>
              
              {showResult && (
                <div className={`text-lg font-bold font-mono mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {openedReward?.type === 'xp' && `+${openedReward.amount} XP`}
                  {openedReward?.type === 'coins' && `+${openedReward.amount} Coins`}
                  {openedReward?.type === 'powerup' && `x${openedReward.amount} Power-up`}
                </div>
              )}

              {showResult && (
                <Button 
                  variant="brutal-primary"
                  onClick={() => {
                    setIsOpening(false);
                    setShowResult(false);
                    setOpenedReward(null);
                    setSelectedBox(null);
                  }}
                  className="w-full"
                >
                  CLAIM REWARD
                </Button>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
