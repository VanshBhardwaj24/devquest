import React, { useMemo } from 'react';
import { PerformanceChart } from '../Analytics/PerformanceChart';
import { useApp } from '../../contexts/AppContext';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function AnalyticsDashboard() {
  const { state } = useApp();
  const { darkMode, tasks, user, timeBasedStreak } = state;

  const focusData = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const counts: Record<string, number> = { career: 0, learning: 0, personal: 0, health: 0, finance: 0 };
    tasks.forEach(t => {
      const d = t.completedAt || t.dueDate || t.createdAt;
      if (!d) return;
      const dt = new Date(d);
      if (dt >= cutoff) {
        counts[t.category] = (counts[t.category] || 0) + 1;
      }
    });
    const colorMap: Record<string, string> = {
      career: '#84cc16',
      learning: '#22d3ee',
      personal: '#d946ef',
      health: '#f97316',
      finance: '#f59e0b',
    };
    return Object.entries(counts).map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value,
      color: colorMap[key],
    }));
  }, [tasks]);

  const completionData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (6 - i));
        return d;
    });

    return last7Days.map(date => {
        const dayName = days[date.getDay()];
        // Check if task completed on this date
        const completedCount = tasks.filter(t => {
            if (!t.completed || !t.completedAt) return false;
            const completedDate = new Date(t.completedAt);
            return completedDate.toDateString() === date.toDateString();
        }).length;

        // Check if task is pending and due on this date
        const pendingCount = tasks.filter(t => {
            if (t.completed || !t.dueDate) return false;
            const dueDate = new Date(t.dueDate);
            return dueDate.toDateString() === date.toDateString();
        }).length;
        
        return {
            name: dayName,
            completed: completedCount,
            pending: pendingCount
        };
    });
  }, [tasks]);

  const performanceData = useMemo(() => {
    const today = new Date();
    const daysBack = 90;
    const dates = Array.from({ length: daysBack }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (daysBack - 1 - i));
      return d;
    });
    const toIso = (date: Date) => date.toISOString().split('T')[0];
    return dates.map(d => {
      const label = `${d.toLocaleDateString('en-US', { month: 'short' })} ${d.getDate()}`;
      const iso = toIso(d);
      const fromLog = (user?.activityLog || []).find(entry => entry.date === iso);
      const fromStreak = timeBasedStreak.dailyActivity[iso];
      let xp = fromLog ? fromLog.xpEarned : (fromStreak?.xpEarned || 0);
      let tasksCompleted = fromLog ? fromLog.tasksCompleted : (fromStreak?.tasksCompleted || 0);
      if ((!fromLog && !fromStreak) || (xp === 0 && tasksCompleted === 0)) {
        const completedTasks = tasks.filter(t => t.completed && t.completedAt && new Date(t.completedAt).toISOString().split('T')[0] === iso);
        tasksCompleted = completedTasks.length;
        xp = completedTasks.reduce((sum, t) => sum + (t.xp || t.xpReward || 0), 0);
      }
      const productivity = fromLog && typeof fromLog.productivityScore === 'number'
        ? fromLog.productivityScore
        : Math.min(100, Math.round((fromStreak?.activeMinutes || 0) / 10) * 10);
      return {
        date: label,
        xp,
        tasks: tasksCompleted,
        streak: timeBasedStreak.currentStreak,
        productivity,
      };
    });
  }, [user, timeBasedStreak, tasks]);

  return (
    <div className={`min-h-screen p-4 md:p-8 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-black font-mono uppercase tracking-tight mb-2">
            Data <span className="text-lime-500">Center</span>
          </h1>
          <p className="text-gray-500 font-mono">Detailed performance metrics and analysis.</p>
        </div>

        <PerformanceChart data={performanceData} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-6 border-4 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-black'} brutal-shadow`}>
                <h3 className="font-bold font-mono text-xl mb-4">Focus Distribution</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={focusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {focusData.map((entry, index) => (
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
                <h3 className="font-bold font-mono text-xl mb-4">Task Completion Rate</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={completionData}>
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
      </div>
    </div>
  );
}
