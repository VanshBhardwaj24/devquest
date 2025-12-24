import React, { useEffect, useReducer } from 'react';
import { PerformanceChart } from '../Analytics/PerformanceChart';
import { useApp } from '../../contexts/AppContext';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, YAxis, CartesianGrid } from 'recharts';
import { analyticsReducer, initialAnalyticsState } from './analyticsReducer';
import { AnalyticsService } from '../../services/analyticsService';
import { AlertTriangle, RefreshCw, BarChart2, PieChart as PieIcon, Activity, TrendingUp } from 'lucide-react';
import { Button } from '../ui/button';
import { motion } from 'framer-motion';

export function AnalyticsDashboard() {
  const { state: appState } = useApp();
  const { darkMode, tasks, user } = appState;
  
  const [state, dispatch] = useReducer(analyticsReducer, initialAnalyticsState);

  const fetchData = async () => {
    dispatch({ type: 'INIT_FETCH' });
    try {
        const data = await AnalyticsService.fetchAnalyticsData(user as any, tasks as any);
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
    } catch (error) {
        dispatch({ type: 'FETCH_ERROR', payload: error instanceof Error ? error.message : 'Failed to load analytics' });
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, tasks]);

  if (state.loading && !state.data) {
    return (
        <div className={`min-h-screen flex flex-col items-center justify-center ${darkMode ? 'text-white' : 'text-black'}`}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current mb-4"></div>
            <p className="font-mono animate-pulse">ANALYZING PERFORMANCE DATA...</p>
        </div>
    );
  }

  if (state.error) {
      return (
        <div className={`min-h-screen flex flex-col items-center justify-center ${darkMode ? 'text-white' : 'text-black'}`}>
            <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-black font-mono mb-2">SYSTEM ERROR</h2>
            <p className="font-mono mb-6 text-red-400">{state.error}</p>
            <Button onClick={fetchData} variant="outline" className="border-2 border-current">
                <RefreshCw className="mr-2 h-4 w-4" /> RETRY
            </Button>
        </div>
      );
  }

  const { data } = state;

  return (
    <div className={`min-h-screen p-4 md:p-8 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
            <h1 className="text-4xl font-black font-mono uppercase tracking-tight mb-2">
                Data <span className="text-lime-500">Center</span>
            </h1>
            <p className="text-gray-500 font-mono">Detailed performance metrics and analysis.</p>
            </div>
            
            <div className="flex gap-2">
                <Button 
                    variant="outline" 
                    size="sm"
                    onClick={fetchData}
                    disabled={state.loading}
                    className={state.loading ? 'opacity-50' : ''}
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${state.loading ? 'animate-spin' : ''}`} />
                    REFRESH
                </Button>
            </div>
        </div>

        {/* Insights Banner */}
        {data?.insights && data.insights.length > 0 && (
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 border-l-4 ${darkMode ? 'bg-zinc-900 border-lime-500' : 'bg-lime-50 border-lime-600'} rounded-r-lg`}
            >
                <div className="flex items-start gap-3">
                    <Activity className="h-5 w-5 text-lime-500 mt-1" />
                    <div>
                        <h3 className="font-bold font-mono uppercase text-sm mb-1">System Insights</h3>
                        <ul className="list-disc list-inside text-sm space-y-1 opacity-80 font-mono">
                            {data.insights.map((insight, i) => (
                                <li key={i}>{insight}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </motion.div>
        )}

        <PerformanceChart data={data?.performance} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-6 border-4 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-black'} brutal-shadow`}>
                <div className="flex items-center gap-2 mb-4">
                    <PieIcon className="h-5 w-5" />
                    <h3 className="font-bold font-mono text-xl">Focus Distribution</h3>
                </div>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data?.focusDistribution || []}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data?.focusDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke={darkMode ? '#111' : '#fff'} strokeWidth={2} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: darkMode ? '#111' : '#fff',
                                    borderColor: darkMode ? '#333' : '#ddd',
                                    borderRadius: '0px',
                                    fontFamily: 'monospace'
                                }}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
            <div className={`p-6 border-4 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-black'} brutal-shadow`}>
                <div className="flex items-center gap-2 mb-4">
                    <BarChart2 className="h-5 w-5" />
                    <h3 className="font-bold font-mono text-xl">Task Completion Rate</h3>
                </div>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data?.completionRate || []}>
                            <XAxis 
                                dataKey="name" 
                                stroke={darkMode ? '#888' : '#444'} 
                                fontSize={12} 
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip 
                                cursor={{ fill: darkMode ? '#333' : '#eee' }}
                                contentStyle={{ 
                                    backgroundColor: darkMode ? '#111' : '#fff',
                                    borderColor: darkMode ? '#333' : '#ddd',
                                    borderRadius: '0px',
                                    fontFamily: 'monospace'
                                }}
                            />
                            <Legend />
                            <Bar dataKey="completed" name="Completed" fill="#84cc16" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="pending" name="Pending" fill="#334155" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* Life Integration Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-6 border-4 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-black'} brutal-shadow`}>
                <div className="flex items-center gap-2 mb-4">
                    <Activity className="h-5 w-5 text-orange-500" />
                    <h3 className="font-bold font-mono text-xl">Workout Intensity</h3>
                </div>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data?.lifeAnalytics?.workoutTrend || []}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                            <XAxis 
                                dataKey="date" 
                                stroke={darkMode ? '#888' : '#444'} 
                                fontSize={12} 
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: darkMode ? '#111' : '#fff',
                                    borderColor: darkMode ? '#333' : '#ddd',
                                    borderRadius: '0px',
                                    fontFamily: 'monospace'
                                }}
                            />
                            <Area type="monotone" dataKey="duration" name="Minutes" stroke="#f97316" fill="#f97316" fillOpacity={0.2} strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className={`p-6 border-4 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-black'} brutal-shadow`}>
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <h3 className="font-bold font-mono text-xl">Daily Spending</h3>
                </div>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data?.lifeAnalytics?.spendingTrend || []}>
                            <XAxis 
                                dataKey="date" 
                                stroke={darkMode ? '#888' : '#444'} 
                                fontSize={12} 
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip 
                                cursor={{ fill: darkMode ? '#333' : '#eee' }}
                                contentStyle={{ 
                                    backgroundColor: darkMode ? '#111' : '#fff',
                                    borderColor: darkMode ? '#333' : '#ddd',
                                    borderRadius: '0px',
                                    fontFamily: 'monospace'
                                }}
                            />
                            <Bar dataKey="amount" name="Expense (₹)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
