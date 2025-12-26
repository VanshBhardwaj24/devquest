import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../ui/card';

export function StatBasedRealityEngine() {
  const { state } = useApp();
  const { darkMode } = state;
  
  // Mock stats data based on the provided information
  const [stats] = useState([
    { name: 'Money', current: 4.0, target: 8.0, icon: '💸' },
    { name: 'Relationships', current: 3.0, target: 8.0, icon: '❤️' },
    { name: 'Health', current: 6.0, target: 8.0, icon: '💪' },
    { name: 'Mindset', current: 3.7, target: 8.0, icon: '🧠' },
    { name: 'Skills', current: 5.8, target: 9.0, icon: '🛠️' },
    { name: 'Purpose', current: 4.0, target: 8.0, icon: '🧭' },
    { name: 'Discipline', current: 3.0, target: 8.0, icon: '🔒' },
    { name: 'Social Confidence', current: 4.0, target: 8.0, icon: '🗣️' },
  ]);
  
  // Calculate average stat
  const avgStat = stats.reduce((sum, stat) => sum + stat.current, 0) / stats.length;
  
  // Calculate power level
  const powerLevel = avgStat.toFixed(2);
  
  // Tier information
  const tierInfo = {
    name: 'Bronze',
    avgStatRange: '1.0–4.9',
    identity: 'Slave of Comfort',
    status: 'LIVE'
  };
  
  // Time remaining
  const timeRemaining = '182 Days to Year-End';
  
  return (
    <Card variant="brutal" className={`p-6 ${darkMode ? 'bg-zinc-900 border-white text-white' : 'bg-white border-black text-black'}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-black mb-2 uppercase tracking-tight">
            Stat-Based Reality Engine
          </h2>
          <p className="text-sm opacity-75 mb-4">
            Life changes only through Real Actions, not imagination.
          </p>
          
          {/* Primary Objective */}
          <div className="bg-red-500 text-white p-3 border-2 border-black mb-4">
            <p className="font-bold uppercase tracking-widest">🎯 PRIMARY OBJECTIVE</p>
            <p className="text-lg font-black">REACH AVG STAT 8.0+ BY DEC 31</p>
          </div>
          
          {/* System Status */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="font-bold bg-red-500 text-white px-2 py-1 border border-black">🔴 SYSTEM STATUS: LIVE</span>
            <span className="font-bold bg-purple-500 text-white px-2 py-1 border border-black">🕹️ CURRENT MODE: {tierInfo.name}</span>
            <span className="font-bold bg-blue-500 text-white px-2 py-1 border border-black">⏳ TIME LEFT: {timeRemaining}</span>
          </div>
        </div>
        
        {/* Power Level Display */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-3 border-2 border-black text-center ${darkMode ? 'bg-zinc-800' : 'bg-gray-100'}`}>
            <p className="text-sm font-bold uppercase">🎮 Current Power Level</p>
            <p className="text-3xl font-black text-red-500">{powerLevel}</p>
          </div>
          <div className={`p-3 border-2 border-black text-center ${darkMode ? 'bg-zinc-800' : 'bg-gray-100'}`}>
            <p className="text-sm font-bold uppercase">🚀 Goal Power Level</p>
            <p className="text-3xl font-black text-green-500">8.0+</p>
          </div>
        </div>
        
        {/* Stats Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-b-2 border-black ${darkMode ? 'bg-zinc-800' : 'bg-gray-100'}`}>
                <th className="text-left p-2 font-bold uppercase">🧩 Stat</th>
                <th className="text-left p-2 font-bold uppercase">🧍 Current</th>
                <th className="text-left p-2 font-bold uppercase">🎯 Target</th>
                <th className="text-left p-2 font-bold uppercase">⏫ Growth Needed</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((stat, index) => (
                <tr key={stat.name} className={`border-b border-gray-500 ${index % 2 === 0 ? (darkMode ? 'bg-zinc-800' : 'bg-gray-50') : ''}`}>
                  <td className="p-2 font-bold">
                    <span className="mr-2">{stat.icon}</span> {stat.name}
                  </td>
                  <td className="p-2">{stat.current.toFixed(1)}</td>
                  <td className="p-2">{stat.target.toFixed(1)}</td>
                  <td className="p-2 font-bold text-green-500">+{(stat.target - stat.current).toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Tier Protocol */}
        <div className={`p-4 border-2 border-black ${darkMode ? 'bg-zinc-800' : 'bg-gray-100'}`}>
          <h3 className="font-bold text-lg mb-3 uppercase">🏆 TIER PROTOCOL – SOLO RANK ASCENT</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b-2 border-black ${darkMode ? 'bg-zinc-700' : 'bg-gray-200'}`}>
                  <th className="text-left p-2 font-bold uppercase">🏅 Tier</th>
                  <th className="text-left p-2 font-bold uppercase">Avg Stat</th>
                  <th className="text-left p-2 font-bold uppercase">🎯 Identity</th>
                  <th className="text-left p-2 font-bold uppercase">⚠️ Lockdown</th>
                  <th className="text-left p-2 font-bold uppercase">🧨 Escape</th>
                </tr>
              </thead>
              <tbody>
                <tr className={`border-b border-gray-500 ${darkMode ? 'bg-zinc-800' : 'bg-white'}`}>
                  <td className="p-2 font-bold">⚪ Bronze</td>
                  <td className="p-2">1.0–4.9</td>
                  <td className="p-2">Slave of Comfort</td>
                  <td className="p-2 text-red-500">3d no log = reset to 3.02<br/>dopamine loops = −0.5<br/>🔒No movement 4d = −0.3</td>
                  <td className="p-2 text-green-500">🔓 Wake 5:30AM<br/>1K reps<br/>Cold shower<br/>Delete 1 app<br/>Post proof</td>
                </tr>
                <tr className={`border-b border-gray-500 ${darkMode ? 'bg-zinc-800' : 'bg-white'}`}>
                  <td className="p-2 font-bold">🟡 Silver</td>
                  <td className="p-2">5.0–6.9</td>
                  <td className="p-2">Low-Level Operator</td>
                  <td className="p-2 text-red-500">2 drops = 7d freeze<br/>3 lazy days = −0.3 weakest<br/>No $/Skill/Discipline = −0.2 each</td>
                  <td className="p-2 text-green-500">🔓 3-day full log<br/>1 scary task<br/>2pg reflection (write + voice)</td>
                </tr>
                <tr className={`border-b border-gray-500 ${darkMode ? 'bg-zinc-800' : 'bg-white'}`}>
                  <td className="p-2 font-bold">🟠 Gold</td>
                  <td className="p-2">7.0–7.9</td>
                  <td className="p-2">Matrix Breaker</td>
                  <td className="p-2 text-red-500">No output 7d = −0.3<br/>🧭3 hard skips = −0.5<br/>🔒2 tier drops = stat lockdown</td>
                  <td className="p-2 text-green-500">🔓 Emergency Ritual<br/>Post output<br/>Show 1 person</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Card>
  );
}
