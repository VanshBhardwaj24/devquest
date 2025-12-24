import { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Battery, Zap, Coffee, Clock, Brain } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { getStreakMultiplier, clamp } from '../../lib/utils';

export function EnergySystem() {
  const { state, dispatch } = useApp();
  const { darkMode } = state;
  const energyState = useMemo(
    () => state.vitality?.energy || { current: 100, max: 100, lastUpdated: new Date().toISOString() },
    [state.vitality?.energy]
  );
  const moodState = useMemo(
    () => state.vitality?.mood || { value: 100, label: 'Energized' },
    [state.vitality?.mood]
  );
  
  const [rechargeTime, setRechargeTime] = useState(0);
  const mountedRef = useRef(false);

  // Passive recharge on mount (catch up logic)
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    const lastUpdate = new Date(energyState.lastUpdated);
    const now = new Date();
    const diffSeconds = (now.getTime() - lastUpdate.getTime()) / 1000;
    const baseInterval = 30;
    const streakBoost = getStreakMultiplier(state.globalStreak.currentStreak || 0);
    const moodBoost = moodState.label === 'Energized' ? 1.25 : moodState.label === 'Motivated' ? 1.1 : 1;
    const effectiveInterval = Math.max(10, Math.floor(baseInterval / (streakBoost * moodBoost)));
    const rechargeAmount = Math.floor(diffSeconds / effectiveInterval);
    if (rechargeAmount > 0 && energyState.current < energyState.max) {
      dispatch({ type: 'RESTORE_ENERGY', payload: rechargeAmount });
    }
  }, [dispatch, energyState.lastUpdated, energyState.current, energyState.max, state.globalStreak.currentStreak, moodState.label]);

  // Active recharge interval
  useEffect(() => {
    const baseInterval = 30000;
    const streakBoost = getStreakMultiplier(state.globalStreak.currentStreak || 0);
    const moodBoost = moodState.label === 'Energized' ? 1.25 : moodState.label === 'Motivated' ? 1.1 : 1;
    const effectiveMs = clamp(Math.floor(baseInterval / (streakBoost * moodBoost)), 10000, 60000);
    const interval = setInterval(() => {
      if (energyState.current < energyState.max) {
        dispatch({ type: 'RESTORE_ENERGY', payload: 1 });
      }
    }, effectiveMs);

    return () => clearInterval(interval);
  }, [energyState, dispatch, state.globalStreak.currentStreak, moodState.label]);

  // Calculate recharge time text
  useEffect(() => {
    if (energyState.current < energyState.max) {
      const missing = energyState.max - energyState.current;
      const baseMinutesPerEnergy = 0.5;
      const streakBoost = getStreakMultiplier(state.globalStreak.currentStreak || 0);
      const moodBoost = moodState.label === 'Energized' ? 1.25 : moodState.label === 'Motivated' ? 1.1 : 1;
      const minutes = Math.ceil(missing * (baseMinutesPerEnergy / (streakBoost * moodBoost)));
      setRechargeTime(Math.ceil(minutes));
    } else {
      setRechargeTime(0);
    }
  }, [energyState, state.globalStreak.currentStreak, moodState.label]);

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
