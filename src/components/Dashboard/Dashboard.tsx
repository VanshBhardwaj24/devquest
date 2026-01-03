import { useState, useEffect, useReducer, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../contexts/AppContext';
import { Skill } from '../../types';
import { 
  Zap, Trophy, Target, Crown, CheckCircle, Activity, Map, Menu, User, 
  AlertTriangle, RefreshCw, Grid, List, Briefcase, Terminal, Cpu, 
  Shield, BarChart2, Clock, Calendar, Flame, Lock, ChevronRight,
  TrendingUp, Star, Award, Hash, Code, Quote as QuoteIcon, Sparkles, Database, Plus, Cloud
} from 'lucide-react';
import DashboardService from '../../services/dashboardService';
import { DailyMissions } from '../Gamification/DailyMissions';
import { Networking } from '../Life/Networking';
import { Accountability } from '../Life/Accountability';
import { LifeMap } from '../Life/LifeMap';
import { Achievements } from './Achievements';
import { QuickActions } from './QuickActions';
import { ErrorBoundary } from '../ErrorBoundary';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { dashboardReducer, initialDashboardState } from './dashboardReducer';
import { RecentActivity } from './RecentActivity';
import { ProjectShowcase } from '../Progress/ProjectShowcase';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, Tooltip, CartesianGrid, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { cn } from '@/lib/utils';

// --- Sub-components with Cyber/Glitch Theme ---

const CyberStatCard = ({ label, value, icon: Icon, color, trend }: { label: string, value: string | number, icon: any, color: string, trend?: string }) => (
  <Card variant="neon" className="relative overflow-hidden group">
    <div className={`absolute inset-0 bg-gradient-to-br from-${color}-500/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity`} />
    <CardContent className="p-4 relative z-10">
      <div className="flex justify-between items-start mb-2">
        <div className={`p-2 rounded-lg bg-${color}-500/20 text-${color}-400`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <Badge variant="outline" className={`bg-${color}-500/10 text-${color}-400 border-${color}-500/30`}>
            {trend}
          </Badge>
        )}
      </div>
      <div className="text-2xl font-bold font-mono text-white mb-1">{value}</div>
      <div className="text-xs text-gray-400 uppercase tracking-wider">{label}</div>
    </CardContent>
  </Card>
);

const UserProfileCard = ({ user, level, xp, nextLevelXp }: { user: any, level: number, xp: number, nextLevelXp: number }) => {
  const progress = Math.min(100, (xp / (xp + nextLevelXp)) * 100); // Simplified progress
  
  return (
    <Card variant="neon" className="h-full relative overflow-hidden group">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />
      <div className="absolute top-0 right-0 p-2 opacity-50">
        <Cpu className="w-12 h-12 text-neon-blue/20" />
      </div>
      
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple p-[2px] animate-pulse-slow">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden border-2 border-black">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-gray-400" />
                )}
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-neon-yellow text-black text-xs font-bold px-2 py-0.5 rounded-sm border border-black shadow-[0_0_10px_rgba(250,204,21,0.5)] font-mono">
              Lvl {level}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white font-cyber tracking-wide">{user?.name || 'OPERATOR'}</h3>
            <p className="text-xs text-neon-blue uppercase tracking-widest font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-neon-blue rounded-full animate-pulse" />
              Netrunner Class
            </p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between text-xs text-gray-400 uppercase font-mono tracking-wider">
            <span>XP Progress</span>
            <span className="text-neon-purple">{Math.floor(progress)}%</span>
          </div>
          <div className="h-2 bg-black rounded-full overflow-hidden border border-white/10 relative">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink shadow-[0_0_10px_currentColor]"
            />
          </div>
          <div className="flex justify-between text-[10px] text-gray-500 font-mono">
            <span>{xp} XP</span>
            <span>{nextLevelXp} XP to Next</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const SystemStatus = ({ vitality }: { vitality: any }) => {
  const energy = vitality?.energy?.current || 100;
  
  return (
    <Card variant="neon" className="p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/5 to-transparent pointer-events-none" />
      <h4 className="text-xs font-bold text-neon-blue uppercase mb-4 flex items-center gap-2 relative z-10 font-cyber">
        <Activity className="w-4 h-4" /> System Status
      </h4>
      
      <div className="space-y-4 relative z-10">
        <div>
          <div className="flex justify-between text-xs mb-1 font-mono">
            <span className="text-gray-400">ENERGY</span>
            <span className={energy > 50 ? "text-neon-green" : "text-red-400"}>{energy}%</span>
          </div>
          <div className="h-1 bg-gray-800 w-full relative overflow-hidden">
            <div 
              className={`h-full ${energy > 50 ? "bg-neon-green" : "bg-red-500"} shadow-[0_0_10px_currentColor] transition-all duration-500`} 
              style={{ width: `${energy}%` }} 
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
           <div className="bg-black/60 p-2 border border-white/10 rounded backdrop-blur-sm">
             <div className="text-[10px] text-gray-500 uppercase tracking-wider">CPU Load</div>
             <div className="text-sm font-mono text-neon-purple font-bold">12%</div>
           </div>
           <div className="bg-black/60 p-2 border border-white/10 rounded backdrop-blur-sm">
             <div className="text-[10px] text-gray-500 uppercase tracking-wider">Memory</div>
             <div className="text-sm font-mono text-neon-blue font-bold">45%</div>
           </div>
        </div>
      </div>
    </Card>
  );
};

const GlitchClock = () => {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="font-mono text-xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-white tracking-widest">
      {time.toLocaleTimeString([], { hour12: false })}
    </div>
  );
};

const SkillRadar = ({ skills }: { skills?: Skill[] }) => {
  const defaultData = [
    { subject: 'Coding', A: 20, fullMark: 150 },
    { subject: 'Design', A: 10, fullMark: 150 },
    { subject: 'Logic', A: 15, fullMark: 150 },
    { subject: 'Focus', A: 25, fullMark: 150 },
    { subject: 'Speed', A: 10, fullMark: 150 },
    { subject: 'Stamina', A: 30, fullMark: 150 },
  ];

  const data = skills && skills.length > 0 
    ? skills.map(skill => ({
        subject: skill.name,
        A: skill.level,
        fullMark: skill.maxLevel
      }))
    : defaultData;

  return (
    <Card variant="neon" className="relative h-[300px] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" />
      <CardHeader className="pb-2 relative z-10">
        <CardTitle className="text-sm uppercase text-gray-400 font-cyber flex items-center gap-2">
          <Activity className="w-4 h-4 text-neon-blue" /> Skill Matrix
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[240px] flex items-center justify-center relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="#333" strokeDasharray="3 3" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 10, fontFamily: 'monospace' }} />
            <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
            <Radar
              name="Skills"
              dataKey="A"
              stroke="#00f3ff"
              strokeWidth={2}
              fill="#00f3ff"
              fillOpacity={0.2}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#000', borderColor: '#333' }}
              itemStyle={{ color: '#00f3ff' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

import { SkillMatrix } from './SkillMatrix';

// --- New Feature Components ---

const ProjectHub = ({ projects }: { projects: any[] }) => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold font-cyber text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-purple-500">PROJECT PROTOCOLS</h2>
        <p className="text-gray-400 font-mono text-xs">ACTIVE DEVELOPMENT STREAMS</p>
      </div>
      <Button variant="neon">
        <Plus className="w-4 h-4 mr-2" /> INIT NEW PROJECT
      </Button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {projects && projects.length > 0 ? projects.map((project) => (
        <Card key={project.id} variant="neon" className="group hover:border-neon-pink/50 transition-all">
          <CardHeader>
            <CardTitle className="flex justify-between items-start">
              <span className="font-cyber text-lg">{project.title}</span>
              <Badge variant="outline" className={`${
                project.status === 'completed' ? 'border-neon-green text-neon-green' :
                project.status === 'in-progress' ? 'border-neon-blue text-neon-blue' :
                'border-gray-500 text-gray-500'
              }`}>
                {project.status}
              </Badge>
            </CardTitle>
            <CardDescription className="font-mono text-xs text-gray-400">
              {project.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span>PROGRESS</span>
                <span className="text-neon-pink">{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-1" />
              <div className="flex gap-2 mt-4">
                {project.techStack?.map((tech: string) => (
                  <Badge key={tech} variant="secondary" className="text-[10px] bg-white/5 border-white/10">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )) : (
        <div className="col-span-full text-center py-12 border border-dashed border-gray-800 rounded-lg">
           <Code className="w-12 h-12 text-gray-600 mx-auto mb-4" />
           <p className="text-gray-400 font-mono">NO ACTIVE PROJECTS FOUND IN DATABASE</p>
        </div>
      )}
    </div>
  </div>
);

const SecurityCenter = ({ security, dispatch }: { security: any, dispatch: any }) => (
  <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
       <Card variant="neon" className="md:col-span-2 bg-black/40 border-red-500/20">
         <CardHeader>
           <CardTitle className="flex items-center gap-2 font-cyber text-red-500">
             <Shield className="w-6 h-6" /> SYSTEM SECURITY STATUS
           </CardTitle>
         </CardHeader>
         <CardContent className="space-y-6">
           <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg border border-red-500/20">
             <div className="flex items-center gap-4">
               <div className={`w-3 h-3 rounded-full ${security.firewallStatus === 'active' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
               <div>
                 <div className="font-bold text-white font-mono">FIREWALL</div>
                 <div className="text-xs text-red-400 font-mono">{security.firewallStatus.toUpperCase()}</div>
               </div>
             </div>
             <div className="flex gap-2">
              <Button
                 size="sm"
                 variant={security.firewallStatus === 'active' ? 'ghost' : 'neon'}
                 className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                 onClick={() => dispatch({ type: 'UPDATE_SECURITY_STATUS', payload: { firewallStatus: security.firewallStatus === 'active' ? 'warning' : 'active' } })}
               >
                 {security.firewallStatus === 'active' ? 'DISABLE' : 'ENABLE'}
               </Button>
             </div>
           </div>

           <div className="space-y-2">
             <div className="flex justify-between text-xs font-mono text-gray-400">
               <span>THREAT LEVEL</span>
               <span className="text-red-500">{security.threatLevel.toUpperCase()}</span>
             </div>
             <Progress value={security.threatLevel === 'low' ? 20 : security.threatLevel === 'medium' ? 50 : 90} className="h-2 bg-red-950" />
             <div className="mt-2 flex gap-2">
               <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => dispatch({ type: 'UPDATE_SECURITY_STATUS', payload: { threatLevel: 'low' } })}>LOW</Button>
               <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => dispatch({ type: 'UPDATE_SECURITY_STATUS', payload: { threatLevel: 'medium' } })}>MEDIUM</Button>
               <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => dispatch({ type: 'UPDATE_SECURITY_STATUS', payload: { threatLevel: 'high' } })}>HIGH</Button>
             </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
             <div className="p-3 bg-black/60 rounded border border-white/5">
               <div className="text-xs text-gray-500 font-mono mb-1">LAST SCAN</div>
               <div className="text-white font-mono">{new Date(security.lastScan).toLocaleDateString()}</div>
             </div>
             <div className="p-3 bg-black/60 rounded border border-white/5">
               <div className="text-xs text-gray-500 font-mono mb-1">BREACH ATTEMPTS</div>
               <div className="text-white font-mono">{security.breachAttempts}</div>
             </div>
           </div>
         </CardContent>
         <CardFooter>
           <Button 
             className="w-full bg-red-600 hover:bg-red-700 text-white font-cyber tracking-widest"
             onClick={() => dispatch({ type: 'UPDATE_SECURITY_STATUS', payload: { lastScan: new Date(), breachAttempts: (security.breachAttempts || 0) + 1 } })}
           >
             <RefreshCw className="w-4 h-4 mr-2 animate-spin-slow" /> RUN DIAGNOSTICS
           </Button>
         </CardFooter>
       </Card>

       <div className="space-y-4">
         <Card variant="neon" className="h-full">
           <CardHeader>
             <CardTitle className="font-cyber text-sm text-gray-400">ACTIVE PROTOCOLS</CardTitle>
           </CardHeader>
           <CardContent className="space-y-2">
             {security.activeProtocols?.map((protocol: string, i: number) => (
               <div key={i} className="flex items-center gap-2 text-xs font-mono text-neon-blue">
                 <Lock className="w-3 h-3" /> {protocol}
               </div>
             ))}
            <div className="mt-3 flex gap-2">
              <Button variant="ghost" size="sm" className="text-xs font-mono text-gray-500" onClick={() => dispatch({ type: 'UPDATE_SECURITY_STATUS', payload: { activeProtocols: [...(security.activeProtocols || []), 'Zero-Trust Access'] } })}>
                + ZERO-TRUST
              </Button>
              <Button variant="ghost" size="sm" className="text-xs font-mono text-gray-500" onClick={() => dispatch({ type: 'UPDATE_SECURITY_STATUS', payload: { activeProtocols: [...(security.activeProtocols || []), 'Multi-Factor Auth'] } })}>
                + MFA
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

const InventoryManager = ({ inventory, dispatch }: { inventory: any[]; dispatch: any }) => {
  const useItem = (itemId: string) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;
    const qty = item.quantity || 1;
    if (qty <= 1) {
      dispatch({ type: 'REMOVE_INVENTORY_ITEM', payload: itemId });
    } else {
      dispatch({ type: 'UPDATE_INVENTORY_ITEM', payload: { id: itemId, updates: { quantity: qty - 1 } } });
    }
  };
  return (
    <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold font-cyber text-transparent bg-clip-text bg-gradient-to-r from-neon-yellow to-orange-500">RESOURCE CACHE</h2>
        <Badge variant="outline" className="font-mono">{inventory?.length || 0} ITEMS</Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {inventory && inventory.length > 0 ? inventory.map((item) => (
          <Card key={item.id} variant="neon" className="group hover:bg-white/5 transition-colors">
            <CardContent className="p-4 flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                {item.icon || '📦'}
              </div>
              <div>
                <div className="font-bold text-white text-sm font-cyber truncate w-full">{item.name}</div>
                <div className="text-[10px] text-gray-400 font-mono uppercase">{item.type}</div>
              </div>
              <Badge className="bg-neon-yellow/10 text-neon-yellow border-neon-yellow/20 text-[10px]">
                x{item.quantity || 1}
              </Badge>
              <Button variant="neon" size="sm" className="w-full mt-2 text-xs font-mono" onClick={() => useItem(item.id)}>
                USE
              </Button>
            </CardContent>
          </Card>
        )) : (
          <div className="col-span-full py-12 text-center text-gray-500 font-mono border border-dashed border-gray-800 rounded">
            CACHE EMPTY. ACQUIRE RESOURCES FROM QUESTS.
          </div>
        )}
        
        {[...Array(5)].map((_, i) => (
          <div key={`empty-${i}`} className="border border-dashed border-white/5 rounded-lg bg-black/20 flex items-center justify-center aspect-square opacity-50">
            <span className="text-xs font-mono text-gray-700">EMPTY SLOT</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const AITerminal = ({ aiState, dispatch, appContext }: { aiState: any, dispatch: any, appContext: string }) => {
  const [input, setInput] = useState('');
  const send = async () => {
    const content = input.trim();
    if (!content) return;
    dispatch({ type: 'ADD_CHAT_MESSAGE', payload: { role: 'user', content } });
    setInput('');
    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      if (!apiKey) {
        dispatch({ type: 'ADD_CHAT_MESSAGE', payload: { role: 'assistant', content: 'GROQ API key missing. Set VITE_GROQ_API_KEY.' } });
        return;
      }
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          temperature: 0.2,
          messages: [
            { role: 'system', content: 'You are Neural Link in DevQuest. Answer concisely with structured bullets, code fences for code, and clear sections. Give step-by-step navigation help and practical day plans.' },
            { role: 'system', content: appContext },
            { role: 'user', content },
          ],
        }),
      });
      const data = await res.json();
      const answer = data?.choices?.[0]?.message?.content || 'No response from Groq.';
      dispatch({ type: 'ADD_CHAT_MESSAGE', payload: { role: 'assistant', content: answer } });
    } catch {
      dispatch({ type: 'ADD_CHAT_MESSAGE', payload: { role: 'assistant', content: 'AI request failed. Try again.' } });
    }
  };
  return (
    <Card variant="cyber" className="h-[600px] flex flex-col bg-black/90 border-neon-purple/30">
      <CardHeader className="border-b border-neon-purple/20 bg-neon-purple/5">
        <CardTitle className="flex items-center gap-2 font-cyber text-neon-purple">
          <Cpu className="w-5 h-5" /> NEURAL LINK INTERFACE
        </CardTitle>
        <CardDescription className="font-mono text-xs text-gray-400 flex justify-between">
          <span>STATUS: {aiState.isEnabled ? 'CONNECTED' : 'DISABLED'}</span>
          <span>TOKENS: {aiState.tokensUsed}</span>
        </CardDescription>
      </CardHeader>
       <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-sm custom-scrollbar">
         {aiState.chatHistory?.length > 0 ? aiState.chatHistory.map((msg: any) => (
           <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg border whitespace-pre-wrap ${
              msg.role === 'user' 
                ? 'bg-neon-blue/10 border-neon-blue/30 text-neon-blue rounded-tr-none' 
                : 'bg-neon-purple/10 border-neon-purple/30 text-neon-purple rounded-tl-none'
            }`}>
              {msg.content}
            </div>
          </div>
        )) : (
          <div className="text-center text-gray-600 mt-20">
            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>INITIALIZING NEURAL LINK...</p>
            <p className="text-xs mt-2">Ask me anything about your code or career.</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 border-t border-white/10 bg-black">
        <div className="flex w-full gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-3 text-neon-purple font-bold">{'>'}</span>
             <input 
               type="text" 
               placeholder="Enter command or query..." 
               value={input}
               autoFocus
               onChange={(e) => setInput(e.target.value)}
               className="w-full bg-black border border-white/20 rounded-md py-2 pl-8 pr-4 text-white font-mono focus:outline-none focus:border-neon-purple transition-colors"
               onKeyDown={(e) => {
                 if (e.key === 'Enter') send();
               }}
            />
          </div>
          <Button variant="neon" size="icon" onClick={send} disabled={!aiState.isEnabled || !input.trim()}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};


// --- Main Dashboard Component ---

export function Dashboard({ onNavigate, initialTab }: { onNavigate?: (tab: string) => void; initialTab?: string }) {
  const { state: appState, dispatch: appDispatch } = useApp();
  const { user, xpSystem, tasks, codingStats, darkMode, vitality, skills, aiAssistant, security, inventory, quests } = appState;
  
  const [state, localDispatch] = useReducer(dashboardReducer, { ...initialDashboardState, activeTab: initialTab || initialDashboardState.activeTab });

  const assistantContext = useMemo(() => {
    const pendingTasks = (tasks || []).filter(t => !t.completed).length;
    const completedTasks = (tasks || []).filter(t => t.completed).length;
    const lifeSections = ['fitness','accountability','finance','relationships','learning','lifemap','mindfulness','networking','bucketlist'];
    const tabs = [
      'dashboard','tasks','coding','challenges-daily','challenges-weekly','challenges-monthly',
      'gamification','rewards','internships','placement','placement-quests','analytics','skills',
      'projects','activity','profile','help'
    ];
    return [
      `App Overview:`,
      `- Main Tabs: ${tabs.join(', ')}`,
      `- Quick Actions: Overview, AI, Placemt, Quests, Shop`,
      `- Life Sections: ${lifeSections.join(', ')}`,
      `User Stats:`,
      `- Name: ${user?.name || 'Operator'}`,
      `- Level: ${xpSystem?.currentLevel || user?.level || 1}, XP: ${xpSystem?.currentXP || user?.xp || 0}`,
      `- Streak: ${codingStats?.currentStreak || user?.streak || 0} days`,
      `- Tasks: ${pendingTasks} pending / ${completedTasks} completed`,
      `- Gold: ${user?.gold || 0} G`,
      `Guidance:`,
      `- For navigation, reference tab names and quick actions; provide step-by-step clicks.`,
      `- For planning, propose a structured daily plan with time blocks for DSA, Coding Arena, Quests, Learning, Fitness, and breaks.`,
    ].join('\n');
  }, [tasks, user, xpSystem, codingStats]);
  
  // Initial Data Fetch
  useEffect(() => {
    const initDashboard = async () => {
        if (!user) {
            localDispatch({ type: 'FETCH_ERROR', payload: 'User not authenticated' });
            return;
        }
        localDispatch({ type: 'INIT_FETCH' });
        try {
            const data = await DashboardService.fetchDashboardData(user);
            localDispatch({ type: 'FETCH_SUCCESS', payload: data });
        } catch (error) {
            localDispatch({ type: 'FETCH_ERROR', payload: error instanceof Error ? error.message : 'Unknown system failure' });
        }
    };
    initDashboard();
  }, [xpSystem, user, tasks, codingStats]);

  // Real-time updates: refresh system logs
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const logs = await DashboardService.refreshSystemLogs();
        localDispatch({ type: 'REFRESH_LOGS', payload: logs });
      } catch {
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [user?.gold]);

  // Live weather for Delhi
  useEffect(() => {
    let mounted = true;
    const updateWeather = async () => {
      try {
        const res = await fetch('https://wttr.in/Delhi?format=j1');
        const json = await res.json();
        const current = json?.current_condition?.[0];
        const temp = parseInt(current?.temp_C ?? '0', 10);
        const condition = current?.weatherDesc?.[0]?.value ?? 'Clear';
        if (mounted) {
          localDispatch({ type: 'UPDATE_WIDGETS', payload: { weather: { temp, condition, location: 'Delhi' } } });
        }
      } catch {
      }
    };
    updateWeather();
    const interval = setInterval(updateWeather, 10 * 60 * 1000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Combined Stats Calculation
  const stats = useMemo(() => {
    const currentLevel = xpSystem?.currentLevel || user?.level || 1;
    const currentXP = xpSystem?.currentXP || user?.xp || 0;
    const streak = codingStats?.currentStreak || user?.streak || 0;
    const completedTasks = tasks?.filter(t => t.completed).length || 0;
    const totalTasks = tasks?.length || 0;
    
    const getXPForLevel = (level: number) => Math.floor(1000 * Math.pow(1.1, level - 1));
    const xpForCurrentLevel = getXPForLevel(currentLevel);
    const xpForNextLevel = getXPForLevel(currentLevel + 1);
    
    return {
      level: currentLevel,
      xp: currentXP,
      streak,
      taskRate: totalTasks > 0 ? Math.floor((completedTasks / totalTasks) * 100) : 0,
      nextLevelXP: xpForNextLevel - currentXP
    };
  }, [xpSystem, user, tasks, codingStats]);

  const priorityTasks = useMemo(() => {
    return [...(tasks || [])]
      .filter(t => !t.completed)
      .sort((a, b) => {
        const priorityMap = { high: 3, medium: 2, low: 1 };
        const pA = priorityMap[a.priority as keyof typeof priorityMap] || 0;
        const pB = priorityMap[b.priority as keyof typeof priorityMap] || 0;
        return pB - pA;
      })
      .slice(0, 5);
  }, [tasks]);

  const renderContent = () => {
    if (state.loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-neon-blue border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Zap className="w-6 h-6 text-neon-purple animate-pulse" />
                    </div>
                </div>
                <p className="font-mono text-neon-blue animate-pulse">INITIALIZING SYSTEM...</p>
            </div>
        );
    }

    if (state.error) {
        return (
            <Card variant="cyber" className="p-8 border-red-500/50">
                <div className="flex flex-col items-center text-center space-y-4">
                    <AlertTriangle className="h-12 w-12 text-red-500 animate-bounce" />
                    <h3 className="text-xl font-bold font-cyber text-red-400">SYSTEM FAILURE</h3>
                    <p className="font-mono text-sm text-gray-400">{state.error}</p>
                    <Button onClick={() => localDispatch({ type: 'INIT_FETCH' })} variant="glitch">
                        <RefreshCw className="mr-2 h-4 w-4" /> REBOOT SYSTEM
                    </Button>
                </div>
            </Card>
        );
    }

    // Main Content Switch
    switch (state.activeTab) {
      case 'overview':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <CyberStatCard 
                label="Daily Streak" 
                value={`${stats.streak} Days`} 
                icon={Flame} 
                color="orange" 
                trend="+1"
              />
              <CyberStatCard 
                label="Task Completion" 
                value={`${stats.taskRate}%`} 
                icon={CheckCircle} 
                color="green" 
              />
              <CyberStatCard 
                label="Focus Time" 
                value="4h 12m" 
                icon={Clock} 
                color="blue" 
              />
              <CyberStatCard 
                label="Achievements" 
                value="12/50" 
                icon={Trophy} 
                color="yellow" 
              />
              <CyberStatCard 
                label="AI Tokens" 
                value={aiAssistant?.tokensUsed || 0} 
                icon={Cpu} 
                color="purple" 
              />
              <CyberStatCard 
                label="Security Status" 
                value={security?.firewallStatus || 'Active'} 
                icon={Shield} 
                color="red" 
              />
              <CyberStatCard 
                label="Net Worth" 
                value={`${user?.gold || 0} G`} 
                icon={Database} 
                color="yellow" 
              />
              <CyberStatCard 
                label="Active Quests" 
                value={quests?.filter(q => q.status === 'active').length || 0} 
                icon={Map} 
                color="pink" 
              />
            </div>

            {/* Expanded Overview Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <Card variant="neon" className="bg-black/40 border-green-500/20">
                 <CardHeader className="pb-2">
                   <CardTitle className="text-sm font-cyber text-green-500 flex items-center gap-2">
                     <TrendingUp className="w-4 h-4" /> FINANCIAL MARKET
                   </CardTitle>
                 </CardHeader>
                 <CardContent>
                   <div className="space-y-3">
                     <div className="flex justify-between items-center text-xs font-mono">
                       <span className="text-gray-400">GOLD RESERVES</span>
                       <span className="text-yellow-400 font-bold">{user?.gold || 0} G</span>
                     </div>
                     <div className="flex justify-between items-center text-xs font-mono">
                       <span className="text-gray-400">XP/HOUR</span>
                       <span className="text-neon-blue font-bold">~450 XP</span>
                     </div>
                     <div className="h-[60px] w-full mt-2">
                       <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={[{v:10},{v:25},{v:15},{v:30},{v:45},{v:35},{v:60}]}>
                           <defs>
                             <linearGradient id="colorGold" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                               <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                             </linearGradient>
                           </defs>
                           <Area type="monotone" dataKey="v" stroke="#fbbf24" fillOpacity={1} fill="url(#colorGold)" />
                         </AreaChart>
                       </ResponsiveContainer>
                     </div>
                   </div>
                 </CardContent>
               </Card>

               <Card variant="neon" className="bg-black/40 border-pink-500/20">
                 <CardHeader className="pb-2">
                   <CardTitle className="text-sm font-cyber text-pink-500 flex items-center gap-2">
                     <Activity className="w-4 h-4" /> BIO-METRICS
                   </CardTitle>
                 </CardHeader>
                 <CardContent>
                   <div className="space-y-4">
                     <div>
                        <div className="flex justify-between text-[10px] font-mono mb-1 text-gray-400">
                          <span>PHYSICAL</span>
                          <span className="text-pink-400">87%</span>
                        </div>
                        <Progress value={87} className="h-1 bg-pink-900/20" />
                     </div>
                     <div>
                        <div className="flex justify-between text-[10px] font-mono mb-1 text-gray-400">
                          <span>MENTAL</span>
                          <span className="text-blue-400">65%</span>
                        </div>
                        <Progress value={65} className="h-1 bg-blue-900/20" />
                     </div>
                     <div className="flex gap-2 mt-2">
                       <Badge variant="outline" className="text-[9px] border-pink-500/30 text-pink-400">PULSE: NORMAL</Badge>
                       <Badge variant="outline" className="text-[9px] border-blue-500/30 text-blue-400">SLEEP: 7h</Badge>
                     </div>
                   </div>
                 </CardContent>
               </Card>

               <Card variant="neon" className="bg-black/40 border-purple-500/20">
                 <CardHeader className="pb-2">
                   <CardTitle className="text-sm font-cyber text-purple-500 flex items-center gap-2">
                     <Target className="w-4 h-4" /> LEARNING PATH
                   </CardTitle>
                 </CardHeader>
                 <CardContent>
                   <div className="text-xs font-mono text-gray-300 mb-2">CURRENT FOCUS: <span className="text-white font-bold">REACT MASTERY</span></div>
                   <div className="flex items-center gap-3 mb-3">
                     <div className="w-10 h-10 rounded bg-gray-800 flex items-center justify-center text-xl">⚛️</div>
                     <div className="flex-1">
                       <Progress value={75} className="h-2 bg-gray-800" />
                     </div>
                     <span className="text-xs font-bold text-neon-purple">75%</span>
                   </div>
                   <Button size="sm" variant="ghost" className="w-full text-xs h-6 text-gray-400 hover:text-white">
                     VIEW CURRICULUM <ChevronRight className="w-3 h-3 ml-1" />
                   </Button>
                 </CardContent>
               </Card>
            </div>

            {/* Live Summary & Widgets */}
            {state.data && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card variant="neon" className="bg-black/40 border-cyan-500/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-cyber text-cyan-500 flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> Life Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Workouts This Week</span>
                        <span className="text-neon-green font-bold">{state.data.lifeSummary.workoutsThisWeek}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Finance Balance</span>
                        <span className="text-neon-yellow font-bold">{Math.round(state.data.lifeSummary.financeBalance)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Pending Goals</span>
                        <span className="text-neon-pink font-bold">{state.data.lifeSummary.pendingGoals}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card variant="neon" className="bg-black/40 border-purple-500/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-cyber text-purple-500 flex items-center gap-2">
                      <Cloud className="w-4 h-4" /> Weather
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs font-mono text-gray-300">
                      {state.data.widgets.weather.location}: {state.data.widgets.weather.temp}°C, {state.data.widgets.weather.condition}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Main Dashboard Grid - 3 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Left Column: System Status & Skills */}
              <div className="space-y-6">
                <SystemStatus vitality={vitality} />
                <SkillRadar skills={skills} />
                <SkillMatrix />
              </div>

              {/* Center Column: Missions & Tasks */}
              <div className="space-y-6">
                 <DailyMissions />
                 
                 {/* Priority Targets */}
                 <Card variant="neon" className="min-h-[300px] relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />
                  <CardHeader className="border-b border-white/10 pb-3 relative z-10">
                    <CardTitle className="flex justify-between items-center text-white">
                      <span className="flex items-center gap-2 uppercase text-sm font-bold text-neon-pink font-cyber tracking-wider">
                        <Target className="h-5 w-5" /> Priority Targets
                      </span>
                      <Button size="sm" variant="neon" className="text-xs h-7 px-2">
                        <Plus className="w-3 h-3 mr-1" /> New
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3 relative z-10">
                     {priorityTasks.length > 0 ? priorityTasks.map((task) => (
                       <div key={task.id} className="group relative p-3 bg-black/40 border border-white/5 rounded-lg hover:border-neon-blue/50 transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,243,255,0.1)] hover:-translate-y-1">
                         <div className="flex items-center justify-between relative z-10">
                           <div className="flex items-center gap-3">
                             <div className={`w-1 h-8 rounded-full ${task.priority === 'high' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-blue-500'}`} />
                             <div>
                               <h4 className="font-bold text-sm text-white group-hover:text-neon-blue transition-colors font-mono line-clamp-1">{task.title}</h4>
                               <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono mt-0.5">
                                 <Badge variant="outline" className="text-[9px] py-0 px-1 border-gray-700 text-gray-400 uppercase tracking-wider">{task.category || 'General'}</Badge>
                                 <span>•</span>
                                 <span className="uppercase">{task.difficulty}</span>
                               </div>
                             </div>
                           </div>
                           <Button 
                              onClick={() => appDispatch({ type: 'UPDATE_TASK', payload: { ...task, completed: true } })}
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 text-gray-500 hover:text-neon-green hover:bg-neon-green/10 rounded-full"
                           >
                             <CheckCircle className="h-4 w-4" />
                           </Button>
                         </div>
                       </div>
                     )) : (
                       <div className="text-center py-12 text-gray-600 border border-dashed border-gray-800 rounded-lg bg-black/20">
                         <CheckCircle className="h-10 w-10 mx-auto mb-3 opacity-20" />
                         <p className="font-mono text-xs uppercase tracking-widest">No active targets</p>
                       </div>
                     )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Logs & Wisdom */}
              <div className="space-y-6">
                <Card variant="neon" className="p-0 overflow-hidden relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/5 to-transparent pointer-events-none" />
                  <CardHeader className="bg-black/60 border-b border-white/10 py-3 backdrop-blur-sm">
                    <CardTitle className="text-sm uppercase text-gray-400 font-cyber flex items-center gap-2">
                       <Terminal className="w-4 h-4 text-neon-purple" /> System Logs
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 relative z-10">
                    <RecentActivity activities={state.data?.activities || []} />
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-900/20 to-black border-purple-500/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-20">
                    <QuoteIcon className="w-12 h-12 text-neon-purple" />
                  </div>
                  <CardContent className="p-6 relative z-10">
                    <h4 className="text-neon-purple font-cyber mb-3 text-lg tracking-wide flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> Daily Wisdom
                    </h4>
                    <p className="text-gray-300 italic text-sm border-l-2 border-neon-purple pl-4 py-2 leading-relaxed font-mono">
                      "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle."
                    </p>
                    <p className="text-right text-xs text-neon-blue mt-3 font-bold uppercase tracking-widest">- Steve Jobs</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );
      case 'projects':
        return <ProjectShowcase />;
      case 'security':
        return <SecurityCenter security={security} dispatch={appDispatch} />;
      case 'inventory':
        return <InventoryManager inventory={inventory} dispatch={appDispatch} />;
      case 'ai':
        return <AITerminal aiState={aiAssistant} dispatch={appDispatch} appContext={assistantContext} />;
      case 'achievements':
        return <Achievements />;
      case 'career':
        return <Accountability />; // Placeholder as in original
      case 'map':
        return <LifeMap />;
      case 'social':
        return <Networking />;
      default:
        return <div className="p-12 text-center text-gray-500 font-mono">MODULE UNDER CONSTRUCTION...</div>;
    }
  };

  return (
    <div className={`min-h-screen p-4 md:p-8 font-sans ${darkMode ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-900'} selection:bg-neon-blue selection:text-black`}>
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-transparent to-black/80"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/10 pb-6">
          <div className="flex items-center gap-6">
            <UserProfileCard user={user} level={stats.level} xp={stats.xp} nextLevelXp={stats.nextLevelXP} />
            <div className="hidden md:block h-24 w-[1px] bg-white/10" />
            <div className="hidden md:block space-y-1">
               <h1 className="text-4xl font-extrabold tracking-tight font-cyber text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
                 COMMAND CENTER
               </h1>
               <p className="text-neon-blue font-mono text-sm tracking-widest flex items-center gap-2">
                 <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                 SYSTEM ONLINE
               </p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <GlitchClock />
            <div className="flex gap-2">
              {['overview', 'ai', 'career', 'achievements', 'map', 'social'].map((tab) => (
                <Button
                  key={tab}
                  variant={state.activeTab === tab ? "neon" : "ghost"}
                  size="sm"
                  onClick={() => localDispatch({ type: 'SET_TAB', payload: tab })}
                  className="uppercase text-xs"
                >
                  {tab}
                </Button>
              ))}
            </div>
          </div>
        </header>

        {/* Navigation Grid for Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
           <Button 
             variant="glitch" 
             className="h-12 w-full justify-start px-4"
             onClick={() => localDispatch({ type: 'SET_TAB', payload: 'overview' })}
           >
              <Grid className="mr-2 h-4 w-4" /> Overview
           </Button>
           <Button 
             variant="neon" 
             className="h-12 w-full justify-start px-4"
             onClick={() => localDispatch({ type: 'SET_TAB', payload: 'ai' })}
           >
              <Cpu className="mr-2 h-4 w-4" /> AI
           </Button>
           <Button 
             variant="neon" 
             className="h-12 w-full justify-start px-4"
             onClick={() => onNavigate ? onNavigate('placement-quests') : localDispatch({ type: 'SET_TAB', payload: 'career' })}
           >
              <Target className="mr-2 h-4 w-4" /> Placemt
           </Button>
           <Button 
             variant="outline" 
             className="h-12 w-full justify-start px-4 border-white/10 hover:bg-white/5 hover:text-neon-purple transition-colors"
             onClick={() => onNavigate ? onNavigate('tasks') : localDispatch({ type: 'SET_TAB', payload: 'achievements' })}
           >
              <CheckCircle className="mr-2 h-4 w-4" /> Quests
           </Button>
           <Button 
             variant="outline" 
             className="h-12 w-full justify-start px-4 border-white/10 hover:bg-white/5 hover:text-neon-green transition-colors"
             onClick={() => onNavigate ? onNavigate('rewards') : localDispatch({ type: 'SET_TAB', payload: 'inventory' })}
           >
              <Briefcase className="mr-2 h-4 w-4" /> Shop
           </Button>
           <Button 
             variant="outline" 
             className="h-12 w-full justify-start px-4 border-white/10 hover:bg-white/5 hover:text-neon-pink transition-colors"
             onClick={() => localDispatch({ type: 'SET_TAB', payload: 'social' })}
           >
              <User className="mr-2 h-4 w-4" /> Squad Uplink
           </Button>
           <Button 
             variant="outline" 
             className="h-12 w-full justify-start px-4 border-white/10 hover:bg-white/5 hover:text-neon-yellow transition-colors"
             onClick={() => localDispatch({ type: 'SET_TAB', payload: 'projects' })}
           >
              <Code className="mr-2 h-4 w-4" /> Projects
           </Button>
        </div>

        {/* Main Content Area */}
        <main className="min-h-[500px]">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

// Helper Components
const PlusIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12h14M12 5v14" />
  </svg>
);

const DatabaseIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);
