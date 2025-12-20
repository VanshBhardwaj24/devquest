import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Battery, Zap, Coffee, Clock } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export function EnergySystem() {
  const { state, dispatch } = useApp();
  const [energy, setEnergy] = useState(100);
  const [maxEnergy] = useState(100);
  const [rechargeTime, setRechargeTime] = useState(0);

  // Simulate energy consumption and recharge
  useEffect(() => {
    const interval = setInterval(() => {
      setEnergy((prev) => {
        if (prev < maxEnergy) {
          const newEnergy = Math.min(prev + 1, maxEnergy);
          return newEnergy;
        }
        return prev;
      });
    }, 30000); // Recharge 1 energy every 30 seconds

    return () => clearInterval(interval);
  }, [maxEnergy]);

  // Calculate recharge time
  useEffect(() => {
    if (energy < maxEnergy) {
      const missing = maxEnergy - energy;
      const minutes = missing * 0.5; // 30 seconds per energy = 0.5 minutes
      setRechargeTime(Math.ceil(minutes));
    } else {
      setRechargeTime(0);
    }
  }, [energy, maxEnergy]);

  const useEnergy = (amount: number) => {
    if (energy >= amount) {
      setEnergy(energy - amount);
      return true;
    }
    return false;
  };

  const getEnergyColor = () => {
    if (energy >= 75) return 'from-green-400 to-emerald-500';
    if (energy >= 50) return 'from-yellow-400 to-orange-500';
    if (energy >= 25) return 'from-orange-400 to-red-500';
    return 'from-red-500 to-red-700';
  };

  const getEnergyIcon = () => {
    if (energy >= 75) return '⚡';
    if (energy >= 50) return '🔋';
    if (energy >= 25) return '🔌';
    return '💀';
  };

  return (
    <div className="brutal-card bg-gray-900 border-cyan-500/30 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
          <Battery className="text-cyan-400" size={18} />
          Energy
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{getEnergyIcon()}</span>
          <span className="text-sm font-black text-cyan-400">{energy}/{maxEnergy}</span>
        </div>
      </div>

      {/* Energy Bar */}
      <div className="relative h-6 bg-gray-800 border-2 border-gray-700 overflow-hidden mb-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(energy / maxEnergy) * 100}%` }}
          transition={{ duration: 0.5 }}
          className={`h-full bg-gradient-to-r ${getEnergyColor()} relative`}
        >
          <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_4px,rgba(255,255,255,0.1)_4px,rgba(255,255,255,0.1)_8px)]" />
        </motion.div>
        {energy < maxEnergy && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-bold text-white drop-shadow-lg">
              {energy}%
            </span>
          </div>
        )}
      </div>

      {/* Recharge Info */}
      {energy < maxEnergy && (
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-gray-400">
            <Clock size={12} />
            <span>Recharge in {rechargeTime} min</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1 px-2 py-1 bg-lime-500/20 border border-lime-500/50 text-lime-400 hover:bg-lime-500/30 transition-colors"
            onClick={() => {
              // Quick recharge - costs coins or watch ad
              if (confirm('Quick recharge? (Costs 50 coins)')) {
                setEnergy(maxEnergy);
                dispatch({ type: 'ADD_XP', payload: { amount: -50, source: 'Energy Recharge' } });
              }
            }}
          >
            <Coffee size={12} />
            <span>Quick Recharge</span>
          </motion.button>
        </div>
      )}

      {energy >= maxEnergy && (
        <div className="text-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-xs text-lime-400 font-bold flex items-center justify-center gap-1"
          >
            <Zap size={12} />
            <span>ENERGY FULL!</span>
          </motion.div>
        </div>
      )}

      {/* Energy Usage Info */}
      <div className="mt-3 pt-3 border-t border-gray-800">
        <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500">
          <div>Task: -5 energy</div>
          <div>Coding: -10 energy</div>
          <div>Challenge: -15 energy</div>
          <div>Recharge: 1/30s</div>
        </div>
      </div>
    </div>
  );
}

// Export hook for using energy
export const useEnergy = () => {
  // This would be connected to the EnergySystem state
  // For now, it's a placeholder
  return {
    energy: 100,
    maxEnergy: 100,
    useEnergy: (amount: number) => true,
  };
};

