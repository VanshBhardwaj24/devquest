import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Calendar, BarChart3, Activity } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface ChartDataPoint {
  date: string;
  xp: number;
  tasks: number;
  streak: number;
  productivity: number;
}

interface PerformanceChartProps {
  data?: ChartDataPoint[];
}

export function PerformanceChart({ data: externalData }: PerformanceChartProps) {
  const { state } = useApp();
  const { darkMode } = state;
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const [chartType, setChartType] = useState<'line' | 'area'>('area');

  // Generate mock performance data
  const generateData = (days: number) => {
    const data = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        xp: Math.floor(Math.random() * 200) + 50,
        tasks: Math.floor(Math.random() * 5) + 1,
        streak: Math.max(0, Math.floor(Math.random() * 10)),
        productivity: Math.floor(Math.random() * 40) + 60,
      });
    }
    
    return data;
  };

  const windowSize = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
  const data = externalData ? externalData.slice(-windowSize) : generateData(windowSize);

  const metrics = [
    {
      name: 'XP Gained',
      value: data.reduce((sum, day) => sum + day.xp, 0),
      change: '+12%',
      color: '#8B5CF6',
    },
    {
      name: 'Tasks Completed',
      value: data.reduce((sum, day) => sum + day.tasks, 0),
      change: '+8%',
      color: '#10B981',
    },
    {
      name: 'Avg Productivity',
      value: Math.round(data.reduce((sum, day) => sum + day.productivity, 0) / data.length),
      change: '+5%',
      color: '#F59E0B',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-2xl ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      } shadow-lg`}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Performance Analytics
        </h2>
        
        <div className="flex items-center space-x-2">
          {/* Chart Type Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setChartType('area')}
              className={`p-2 rounded ${
                chartType === 'area'
                  ? 'bg-white dark:bg-gray-600 shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              <Activity size={16} />
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`p-2 rounded ${
                chartType === 'line'
                  ? 'bg-white dark:bg-gray-600 shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              <TrendingUp size={16} />
            </button>
          </div>
          
          {/* Timeframe Selector */}
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className={`px-3 py-2 rounded-lg border ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg ${
              darkMode ? 'bg-gray-700' : 'bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {metric.name}
              </span>
              <span className="text-xs text-green-500 font-medium">{metric.change}</span>
            </div>
            <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {metric.value}
              {metric.name === 'Avg Productivity' && '%'}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
              <XAxis 
                dataKey="date" 
                stroke={darkMode ? '#9CA3AF' : '#6B7280'}
                fontSize={12}
              />
              <YAxis 
                stroke={darkMode ? '#9CA3AF' : '#6B7280'}
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                  border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
                  borderRadius: '8px',
                  color: darkMode ? '#FFFFFF' : '#000000',
                }}
              />
              <Area
                type="monotone"
                dataKey="xp"
                stroke="#8B5CF6"
                fill="url(#xpGradient)"
                strokeWidth={2}
              />
              <defs>
                <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
              </defs>
            </AreaChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
              <XAxis 
                dataKey="date" 
                stroke={darkMode ? '#9CA3AF' : '#6B7280'}
                fontSize={12}
              />
              <YAxis 
                stroke={darkMode ? '#9CA3AF' : '#6B7280'}
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                  border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
                  borderRadius: '8px',
                  color: darkMode ? '#FFFFFF' : '#000000',
                }}
              />
              <Line
                type="monotone"
                dataKey="xp"
                stroke="#8B5CF6"
                strokeWidth={3}
                dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="tasks"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
