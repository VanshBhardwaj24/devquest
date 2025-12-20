import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Battery, Zap, Coffee, Clock, Activity, Brain } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

export function EnergySystem() {
  const { state, dispatch } = useApp();
  const { darkMode } = state;
  const energyState = state.vitality?.energy || { current: 100, max: 100, lastUpdated: new Date().toISOString() };
  const moodState = state.vitality?.mood || { value: 100, label: 'Energized' };
  
  const [rechargeTime, setRechargeTime] = useState(0);

  // Passive recharge on mount (catch up logic)
  useEffect(() => {
    const lastUpdate = new Date(energyState.lastUpdated);
    const now = new Date();
    const diffSeconds = (now.getTime() - lastUpdate.getTime()) / 1000;
    
    // Recharge 1 energy every 30 seconds
    const rechargeAmount = Math.floor(diffSeconds / 30);
    
    if (rechargeAmount > 0 && energyState.current < energyState.max) {
      dispatch({ type: 'RESTORE_ENERGY', payload: rechargeAmount });
    }
  }, []);

  // Active recharge interval
  useEffect(() => {
    const interval = setInterval(() => {
      if (energyState.current < energyState.max) {
        dispatch({ type: 'RESTORE_ENERGY', payload: 1 });
      }
    }, 30000); // Recharge 1 energy every 30 seconds

    return () => clearInterval(interval);
  }, [energyState.current, energyState.max, dispatch]);

  // Calculate recharge time text
  useEffect(() => {
    if (energyState.current < energyState.max) {
      const missing = energyState.max - energyState.current;
      const minutes = missing * 0.5; // 30 seconds per energy = 0.5 minutes
      setRechargeTime(Math.ceil(minutes));
    } else {
      setRechargeTime(0);
    }
  }, [energyState.current, energyState.max]);

  const getEnergyColor = () => {
    if (energyState.current >= 75) return 'bg-green-500';
    if (energyState.current >= 50) return 'bg-yellow-500';
    if (energyState.current >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getEnergyIcon = () => {
    if (energyState.current >= 75) return '⚡';
    if (energyState.current >= 50) return '🔋';
    if (energyState.current >= 25) return '🔌';
    return '💀';
  };
  
  const getMoodColor = () => {
    switch (moodState.label) {
      case 'Energized': return 'text-green-500';
      case 'Motivated': return 'text-blue-500';
      case 'Neutral': return 'text-gray-500';
      case 'Tired': return 'text-orange-500';
      case 'Exhausted': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <Card variant="brutal" className={`p-4 rounded-none ${darkMode ? 'bg-zinc-900 border-white text-white' : 'bg-white border-black text-black'}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm sm:text-base font-bold font-mono uppercase tracking-wider flex items-center gap-2">
          <Battery className={darkMode ? "text-white" : "text-black"} size={18} />
          Vitality
        </h3>
        <div className="flex items-center gap-2 font-mono">
          <span className="text-xs opacity-100">{getEnergyIcon()}</span>
          <span className="text-sm font-black">{energyState.current}/{energyState.max}</span>
        </div>
      </div>

      {/* Energy Bar */}
      <div className={`relative h-8 border-2 mb-2 rounded-none ${darkMode ? 'bg-zinc-800 border-white' : 'bg-gray-100 border-black'}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(energyState.current / energyState.max) * 100}%` }}
          transition={{ duration: 0.5 }}
          className={`h-full border-r-2 border-black ${getEnergyColor()}`}
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className={`text-xs font-bold font-mono uppercase ${energyState.current > 50 ? 'text-black' : (darkMode ? 'text-white' : 'text-black')}`}>
            {energyState.current}% CHARGED
          </span>
        </div>
      </div>
      
      {/* Mood Indicator */}
      <div className={`flex items-center justify-between p-2 mb-2 border-2 ${darkMode ? 'bg-zinc-800 border-white' : 'bg-gray-50 border-black'}`}>
        <div className="flex items-center gap-2">
          <Brain size={16} />
          <span className="text-xs font-bold font-mono uppercase">Mood Status</span>
        </div>
        <div className={`text-xs font-black font-mono uppercase ${getMoodColor()}`}>
          {moodState.label}
        </div>
      </div>

      {/* Recharge Info */}
      {energyState.current < energyState.max && (
        <div className="flex items-center justify-between text-xs mt-2 font-mono uppercase">
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>Recharge: {rechargeTime} min</span>
          </div>
          <Button
            variant="brutal"
            size="sm"
            className="h-6 text-[10px] px-2 bg-yellow-400 hover:bg-yellow-500 border-black text-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all"
            onClick={() => {
              if (state.user && state.user.gold >= 50) {
                 if (confirm('Quick recharge? (Costs 50 gold)')) {
                    dispatch({ type: 'RESTORE_ENERGY', payload: 100 }); // Full restore
                    dispatch({ type: 'SPEND_GOLD', payload: { amount: 50, item: 'Energy Drink' } });
                 }
              } else {
                alert('Not enough gold! Need 50 gold.');
              }
            }}
          >
            <Coffee size={12} className="mr-1" />
            QUICK RECHARGE
          </Button>
        </div>
      )}

      {energyState.current >= energyState.max && (
        <div className="text-center mt-2">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-xs font-bold font-mono flex items-center justify-center gap-1 uppercase bg-green-400 text-black border-2 border-black p-1 inline-block shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <Zap size={12} />
            <span>Energy Full</span>
          </motion.div>
        </div>
      )}

      {/* Energy Usage Info */}
      <div className={`mt-3 pt-3 border-t-2 ${darkMode ? 'border-zinc-700' : 'border-black'}`}>
        <div className="grid grid-cols-2 gap-2 text-[10px] uppercase font-mono font-bold">
          <div>Task: -5 energy</div>
          <div>Coding: -10 energy</div>
          <div>Challenge: -15 energy</div>
          <div>Recharge: 1/30s</div>
        </div>
      </div>
    </Card>
  );
}
