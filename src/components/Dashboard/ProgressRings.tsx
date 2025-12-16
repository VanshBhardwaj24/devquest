import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../contexts/AppContext';

export function ProgressRings() {
  const { state } = useApp();
  const { careerStats, darkMode } = state;

  const stats = [
    { name: 'Knowledge', value: careerStats.knowledge, color: '#8B5CF6', max: 100 },
    { name: 'Mindset', value: careerStats.mindset, color: '#06B6D4', max: 100 },
    { name: 'Communication', value: careerStats.communication, color: '#10B981', max: 100 },
    { name: 'Portfolio', value: careerStats.portfolio, color: '#F59E0B', max: 100 },
  ];

  const circumference = 2 * Math.PI * 45;

  return (
    <div className={`rounded-2xl p-6 ${
      darkMode ? 'bg-gray-800' : 'bg-white'
    } shadow-lg`}>
      <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
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
            <div className="relative w-24 h-24 mb-2">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="45"
                  stroke={darkMode ? '#374151' : '#E5E7EB'}
                  strokeWidth="6"
                  fill="none"
                />
                <motion.circle
                  cx="48"
                  cy="48"
                  r="45"
                  stroke={stat.color}
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
                  animate={{
                    strokeDashoffset: circumference - (stat.value / stat.max) * circumference,
                  }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stat.value}%
                </span>
              </div>
            </div>
            <div className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {stat.name}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}