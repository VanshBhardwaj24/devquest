import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import confetti from 'canvas-confetti';

const SLOT_SYMBOLS = ['⚡', '💰', '🎁', '⭐', '🔥', '👑', '💎', '🚀'];

interface SlotResult {
  reels: string[];
  reward: {
    type: 'xp' | 'coins' | 'powerup';
    amount: number;
    multiplier: number;
  } | null;
}

export function SlotMachineReward({ onComplete }: { onComplete?: () => void }) {
  const { dispatch } = useApp();
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState(['⚡', '💰', '🎁']);
  const [result, setResult] = useState<SlotResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [spinsLeft, setSpinsLeft] = useState(3); // Free spins per day

  const spin = () => {
    if (isSpinning || spinsLeft === 0) return;

    setIsSpinning(true);
    setShowResult(false);
    setResult(null);

    // Animate spinning reels
    const spinDuration = 2000;
    const spinInterval = 50;
    let elapsed = 0;

    const spinIntervalId = setInterval(() => {
      elapsed += spinInterval;
      setReels([
        SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
        SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
        SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
      ]);

      if (elapsed >= spinDuration) {
        clearInterval(spinIntervalId);
        
        // Final result with weighted probabilities
        const finalReels = [
          SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
          SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
          SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
        ];

        // Check for wins
        let reward: SlotResult['reward'] = null;
        let multiplier = 1;

        // Three of a kind
        if (finalReels[0] === finalReels[1] && finalReels[1] === finalReels[2]) {
          multiplier = 10;
          reward = {
            type: finalReels[0] === '⚡' ? 'xp' : finalReels[0] === '💰' ? 'coins' : 'powerup',
            amount: finalReels[0] === '⚡' ? 500 : finalReels[0] === '💰' ? 1000 : 1,
            multiplier: 10,
          };
        }
        // Two of a kind
        else if (finalReels[0] === finalReels[1] || finalReels[1] === finalReels[2] || finalReels[0] === finalReels[2]) {
          multiplier = 3;
          const matchingSymbol = finalReels[0] === finalReels[1] ? finalReels[0] : finalReels[2];
          reward = {
            type: matchingSymbol === '⚡' ? 'xp' : matchingSymbol === '💰' ? 'coins' : 'powerup',
            amount: matchingSymbol === '⚡' ? 100 : matchingSymbol === '💰' ? 200 : 1,
            multiplier: 3,
          };
        }
        // No match - small reward
        else {
          multiplier = 1;
          reward = {
            type: 'xp',
            amount: 25,
            multiplier: 1,
          };
        }

        setReels(finalReels);
        setResult({ reels: finalReels, reward });
        setIsSpinning(false);
        setSpinsLeft(spinsLeft - 1);
        setShowResult(true);

        // Award reward
        if (reward) {
          const finalAmount = reward.amount * reward.multiplier;
          if (reward.type === 'xp') {
            dispatch({ type: 'ADD_XP', payload: { amount: finalAmount, source: 'Slot Machine' } });
          }

          // Confetti for big wins
          if (multiplier >= 10) {
            confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
            setTimeout(() => confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } }), 300);
          } else if (multiplier >= 3) {
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });
          } else {
            confetti({ particleCount: 30, spread: 40, origin: { y: 0.5 } });
          }
        }
      }
    }, spinInterval);
  };

  return (
    <div className="brutal-card bg-gray-900 border-fuchsia-500/30 p-3 sm:p-4 lg:p-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
        <h3 className="text-base sm:text-lg lg:text-xl font-black text-white flex items-center gap-1.5 sm:gap-2 min-w-0">
          <Sparkles className="text-fuchsia-400 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span className="truncate">Lucky Slots</span>
        </h3>
        <div className="text-[10px] sm:text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
          Spins: <span className="text-fuchsia-400 font-bold">{spinsLeft}</span>
        </div>
      </div>

      {/* Slot Machine */}
      <div className="bg-gray-800 border-4 border-fuchsia-500/50 p-3 sm:p-4 md:p-6 rounded-lg mb-3 sm:mb-4">
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          {reels.map((symbol, index) => (
            <motion.div
              key={index}
              animate={isSpinning ? { y: [0, -20, 0] } : {}}
              transition={{ duration: 0.2, repeat: isSpinning ? Infinity : 0 }}
              className="bg-gray-900 border-4 border-fuchsia-400 aspect-square flex items-center justify-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl"
            >
              {symbol}
            </motion.div>
          ))}
        </div>

        {/* Spin Button */}
        <motion.button
          whileHover={!isSpinning && spinsLeft > 0 ? { scale: 1.05 } : {}}
          whileTap={!isSpinning && spinsLeft > 0 ? { scale: 0.95 } : {}}
          onClick={spin}
          disabled={isSpinning || spinsLeft === 0}
          className={`w-full px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 font-black text-sm sm:text-base md:text-lg border-4 border-black brutal-shadow transition-all ${
            spinsLeft === 0
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : isSpinning
              ? 'bg-fuchsia-500 text-white animate-pulse'
              : 'bg-gradient-to-r from-fuchsia-500 via-pink-500 to-purple-500 text-white hover:from-fuchsia-400 hover:via-pink-400 hover:to-purple-400'
          }`}
        >
          {isSpinning ? (
            <>
              <span className="hidden sm:inline">SPINNING...</span>
              <span className="sm:hidden">SPIN...</span>
            </>
          ) : spinsLeft === 0 ? (
            <>
              <span className="hidden sm:inline">NO SPINS LEFT</span>
              <span className="sm:hidden">NO SPINS</span>
            </>
          ) : (
            <>
              <span className="hidden sm:inline">🎰 SPIN! ({spinsLeft} left)</span>
              <span className="sm:hidden">🎰 SPIN ({spinsLeft})</span>
            </>
          )}
        </motion.button>
      </div>

      {/* Payout Table */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
        <div className="bg-gray-800 p-1.5 sm:p-2 text-center border border-gray-700">
          <div className="text-base sm:text-lg mb-0.5 sm:mb-1">⚡⚡⚡</div>
          <div className="text-lime-400 font-bold truncate">500 XP</div>
        </div>
        <div className="bg-gray-800 p-1.5 sm:p-2 text-center border border-gray-700">
          <div className="text-base sm:text-lg mb-0.5 sm:mb-1">💰💰💰</div>
          <div className="text-lime-400 font-bold truncate">1000 Coins</div>
        </div>
        <div className="bg-gray-800 p-1.5 sm:p-2 text-center border border-gray-700">
          <div className="text-base sm:text-lg mb-0.5 sm:mb-1">🎁🎁🎁</div>
          <div className="text-lime-400 font-bold truncate">Power-Up</div>
        </div>
      </div>

      {/* Result Modal */}
      <AnimatePresence>
        {showResult && result && result.reward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={() => {
              setShowResult(false);
              onComplete?.();
            }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              className={`brutal-card p-8 max-w-sm w-full text-center border-4 ${
                result.reward.multiplier >= 10
                  ? 'border-yellow-400 bg-yellow-900/20'
                  : result.reward.multiplier >= 3
                  ? 'border-purple-400 bg-purple-900/20'
                  : 'border-gray-400 bg-gray-800/20'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.5, 1] }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4"
              >
                {result.reels[0]}
              </motion.div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white mb-1.5 sm:mb-2">
                {result.reward.multiplier >= 10 && '🎉 JACKPOT! 🎉'}
                {result.reward.multiplier >= 3 && result.reward.multiplier < 10 && '✨ WIN! ✨'}
                {result.reward.multiplier === 1 && '🎁 Reward!'}
              </h3>
              <p className="text-base sm:text-lg md:text-xl font-bold text-lime-400 mb-1.5 sm:mb-2">
                +{result.reward.amount * result.reward.multiplier}{' '}
                {result.reward.type === 'xp' ? 'XP' : result.reward.type === 'coins' ? 'Coins' : 'Power-Up'}
              </p>
              {result.reward.multiplier > 1 && (
                <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">×{result.reward.multiplier} Multiplier!</p>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowResult(false);
                  onComplete?.();
                }}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-lime-500 text-black font-black border-2 border-black brutal-shadow text-sm sm:text-base"
              >
                CLAIM
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

