import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../ui/card';
import { PieChart } from 'lucide-react';

export function ProgressRings() {
  const { state } = useApp();
  const { careerStats, darkMode } = state;

  const stats = [
    { name: 'Knowledge', value: careerStats.knowledge, color: '#a855f7', max: 100 }, // Purple-500
    { name: 'Mindset', value: careerStats.mindset, color: '#06b6d4', max: 100 },    // Cyan-500
    { name: 'Communication', value: careerStats.communication, color: '#10b981', max: 100 }, // Emerald-500
    { name: 'Portfolio', value: careerStats.portfolio, color: '#f59e0b', max: 100 }, // Amber-500
  ];

  const circumference = 2 * Math.PI * 45;

  return (
    <Card variant="brutal" className={`p-6 rounded-none ${darkMode ? 'bg-zinc-900 border-white text-white' : 'bg-white border-black text-black'}`}>
      <h2 className="text-2xl font-black font-mono mb-6 uppercase tracking-tight flex items-center gap-2">
        <PieChart className={darkMode ? "text-white" : "text-black"} />
        Career Stats
      </h2>
      
      <div className="grid grid-cols-2 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="flex flex-col items-center"
          >
            <div className="relative w-24 h-24 mb-3">
              <svg className="w-24 h-24 transform -rotate-90 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                <circle
                  cx="48"
                  cy="48"
                  r="45"
                  stroke={darkMode ? '#3f3f46' : '#e5e7eb'} // zinc-700 / gray-200
                  strokeWidth="8"
                  fill="none"
                />
                <motion.circle
                  cx="48"
                  cy="48"
                  r="45"
                  stroke={stat.color}
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="butt"
                  initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
                  animate={{
                    strokeDashoffset: circumference - (stat.value / stat.max) * circumference,
                  }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-lg font-black font-mono ${darkMode ? 'text-white' : 'text-black'}`}>
                  {stat.value}%
                </span>
              </div>
            </div>
            <div className={`text-xs font-bold font-mono uppercase tracking-wider border-2 border-black px-2 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${darkMode ? 'bg-zinc-800 text-white' : 'bg-white text-black'}`}>
              {stat.name}
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
