import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Sparkles, Zap, Coins, Trophy, Crown } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import confetti from 'canvas-confetti';

interface SpinReward {
  id: string;
  type: 'xp' | 'coins' | 'powerup' | 'chest';
  amount: number;
  label: string;
  icon: string;
  color: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const SPIN_REWARDS: SpinReward[] = [
  { id: '1', type: 'xp', amount: 50, label: '50 XP', icon: '⚡', color: 'from-yellow-400 to-orange-500', rarity: 'common' },
  { id: '2', type: 'coins', amount: 100, label: '100 Coins', icon: '💰', color: 'from-green-400 to-emerald-500', rarity: 'common' },
  { id: '3', type: 'xp', amount: 100, label: '100 XP', icon: '⚡', color: 'from-lime-400 to-green-500', rarity: 'common' },
  { id: '4', type: 'coins', amount: 200, label: '200 Coins', icon: '💰', color: 'from-cyan-400 to-blue-500', rarity: 'rare' },
  { id: '5', type: 'xp', amount: 250, label: '250 XP', icon: '⚡', color: 'from-purple-400 to-pink-500', rarity: 'rare' },
  { id: '6', type: 'powerup', amount: 1, label: 'Power-Up', icon: '🎁', color: 'from-fuchsia-400 to-purple-500', rarity: 'epic' },
  { id: '7', type: 'xp', amount: 500, label: '500 XP', icon: '⚡', color: 'from-orange-400 to-red-500', rarity: 'epic' },
  { id: '8', type: 'chest', amount: 1, label: 'Legendary Chest', icon: '👑', color: 'from-yellow-300 to-amber-500', rarity: 'legendary' },
];

export function DailySpinWheel() {
  const { state, dispatch } = useApp();
  const [isSpinning, setIsSpinning] = useState(false);
  const [wonReward, setWonReward] = useState<SpinReward | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [hasSpunToday, setHasSpunToday] = useState(false);

  const handleSpin = () => {
    if (isSpinning || hasSpunToday) return;

    setIsSpinning(true);
    setShowResult(false);
    setWonReward(null);

    // Random reward selection with weighted probabilities
    const weights = [30, 25, 20, 10, 8, 4, 2, 1]; // Common to Legendary
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    
    let selectedIndex = 0;
    for (let i = 0; i < weights.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        selectedIndex = i;
        break;
      }
    }

    const reward = SPIN_REWARDS[selectedIndex];
    setWonReward(reward);

    // Calculate rotation (multiple full spins + final position)
    const fullSpins = 5 + Math.random() * 2; // 5-7 full spins
    const rewardAngle = (360 / SPIN_REWARDS.length) * selectedIndex;
    const finalRotation = fullSpins * 360 + (360 - rewardAngle);
    setRotation(finalRotation);

    // After animation completes
    setTimeout(() => {
      setIsSpinning(false);
      setShowResult(true);
      setHasSpunToday(true);
      
      // Award the reward
      if (reward.type === 'xp') {
        dispatch({ type: 'ADD_XP', payload: { amount: reward.amount, source: 'Daily Spin' } });
      }
      
      // Confetti based on rarity
      if (reward.rarity === 'legendary') {
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
        setTimeout(() => confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } }), 300);
      } else if (reward.rarity === 'epic') {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });
      } else {
        confetti({ particleCount: 50, spread: 50, origin: { y: 0.5 } });
      }

      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: Date.now().toString(),
          type: 'reward',
          title: `🎉 ${reward.label} Won!`,
          message: `You spun the wheel and won ${reward.label}!`,
          timestamp: new Date(),
          priority: reward.rarity === 'legendary' ? 'high' : 'medium',
        },
      });
    }, 4000);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'border-yellow-400 bg-yellow-900/20';
      case 'epic': return 'border-purple-400 bg-purple-900/20';
      case 'rare': return 'border-blue-400 bg-blue-900/20';
      default: return 'border-gray-400 bg-gray-800/20';
    }
  };

  return (
    <div className="brutal-card bg-gray-900 border-lime-500/30 p-3 sm:p-4 lg:p-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
        <h3 className="text-base sm:text-lg lg:text-xl font-black text-white flex items-center gap-1.5 sm:gap-2 min-w-0">
          <Sparkles className="text-yellow-400 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span className="truncate">Daily Spin</span>
        </h3>
        {hasSpunToday && (
          <span className="text-[10px] sm:text-xs text-gray-500 whitespace-nowrap flex-shrink-0">Spun ✓</span>
        )}
      </div>

      <div className="relative flex flex-col items-center">
        {/* Wheel Container */}
        <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 mb-4 sm:mb-6">
          <div className="absolute inset-0 rounded-full border-8 border-gray-800 bg-gray-900" />
          
          {/* Spinning Wheel */}
          <motion.div
            animate={{ rotate: rotation }}
            transition={{ 
              duration: 4, 
              ease: [0.17, 0.67, 0.83, 0.67] // Ease out cubic
            }}
            className="absolute inset-2 rounded-full overflow-hidden"
            style={{ transformOrigin: 'center' }}
          >
            {SPIN_REWARDS.map((reward, index) => {
              const angle = (360 / SPIN_REWARDS.length) * index;
              const sliceAngle = 360 / SPIN_REWARDS.length;
              return (
                <div
                  key={reward.id}
                  className={`absolute inset-0 ${reward.color} bg-gradient-to-br`}
                  style={{
                    clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos((angle * Math.PI) / 180)}% ${50 + 50 * Math.sin((angle * Math.PI) / 180)}%, ${50 + 50 * Math.cos(((angle + sliceAngle) * Math.PI) / 180)}% ${50 + 50 * Math.sin(((angle + sliceAngle) * Math.PI) / 180)}%)`,
                    transform: `rotate(${angle}deg)`,
                    transformOrigin: 'center',
                  }}
                >
                  <div
                    className="absolute top-2 left-1/2 -translate-x-1/2 text-2xl"
                    style={{ transform: `rotate(${-angle}deg)` }}
                  >
                    {reward.icon}
                  </div>
                </div>
              );
            })}
          </motion.div>

          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
            <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-lime-500" />
          </div>

          {/* Center Circle */}
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gray-900 border-4 border-lime-500 rounded-full flex items-center justify-center brutal-shadow">
              {isSpinning ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="text-yellow-400 w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />
                </motion.div>
              ) : (
                <Gift className="text-lime-400 w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />
              )}
            </div>
          </div>
        </div>

        {/* Spin Button */}
        <motion.button
          whileHover={!hasSpunToday && !isSpinning ? { scale: 1.05 } : {}}
          whileTap={!hasSpunToday && !isSpinning ? { scale: 0.95 } : {}}
          onClick={handleSpin}
          disabled={isSpinning || hasSpunToday}
          className={`w-full px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 font-black text-sm sm:text-base md:text-lg rounded-lg border-4 border-black brutal-shadow transition-all ${
            hasSpunToday
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : isSpinning
              ? 'bg-yellow-500 text-black animate-pulse'
              : 'bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-black hover:from-yellow-300 hover:via-orange-400 hover:to-pink-400'
          }`}
        >
          {isSpinning ? (
            <span className="flex items-center justify-center gap-1.5 sm:gap-2">
              <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                ⚡
              </motion.span>
              <span className="hidden sm:inline">Spinning...</span>
              <span className="sm:hidden">Spin...</span>
            </span>
          ) : hasSpunToday ? (
            <>
              <span className="hidden sm:inline">Already Spun Today</span>
              <span className="sm:hidden">Spun ✓</span>
            </>
          ) : (
            <span className="flex items-center justify-center gap-1.5 sm:gap-2">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">SPIN NOW!</span>
              <span className="sm:hidden">SPIN</span>
            </span>
          )}
        </motion.button>

        {/* Result Modal */}
        <AnimatePresence>
          {showResult && wonReward && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm`}
              onClick={() => setShowResult(false)}
            >
              <motion.div
                initial={{ y: 50 }}
                animate={{ y: 0 }}
                className={`brutal-card p-8 max-w-sm w-full text-center border-4 ${getRarityColor(wonReward.rarity)}`}
                onClick={(e) => e.stopPropagation()}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="text-6xl mb-4"
                >
                  {wonReward.icon}
                </motion.div>
                <h3 className="text-2xl font-black text-white mb-2">
                  {wonReward.rarity === 'legendary' && '🎉 LEGENDARY! 🎉'}
                  {wonReward.rarity === 'epic' && '✨ EPIC! ✨'}
                  {wonReward.rarity === 'rare' && '⭐ RARE! ⭐'}
                  {wonReward.rarity === 'common' && '🎁 NICE!'}
                </h3>
                <p className="text-xl font-bold text-lime-400 mb-4">{wonReward.label}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowResult(false)}
                  className="px-6 py-3 bg-lime-500 text-black font-black border-2 border-black brutal-shadow"
                >
                  CLAIM REWARD
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Rewards Preview */}
      <div className="mt-4 sm:mt-6 grid grid-cols-4 sm:grid-cols-8 gap-1.5 sm:gap-2">
        {SPIN_REWARDS.map((reward) => (
          <div
            key={reward.id}
            className={`p-1.5 sm:p-2 rounded border-2 text-center ${getRarityColor(reward.rarity)}`}
            title={reward.label}
          >
            <div className="text-base sm:text-xl mb-0.5 sm:mb-1">{reward.icon}</div>
            <div className="text-[7px] sm:text-[8px] text-gray-400 truncate">{reward.rarity}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

