import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Github, Code2, Calendar, Monitor, Link2, Unlink,
  RefreshCw, Clock, Zap,
  GitCommit, GitPullRequest, Flame, Star, TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import {
  loadIntegrationState,
  saveIntegrationState,
  fetchGitHubStats,
  fetchLeetCodeStats,
  fetchVSCodeStats,
  fetchCalendarEvents,
  calculateIntegrationXP,
  disconnectIntegration,
  IntegrationState,
} from '../../services/integrationService';

type IntegrationType = 'github' | 'leetcode' | 'vscode' | 'calendar';

interface ConnectModalProps {
  type: IntegrationType;
  onClose: () => void;
  onConnect: (username?: string) => void;
}

function ConnectModal({ type, onClose, onConnect }: ConnectModalProps) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const config = {
    github: {
      title: 'Connect GitHub',
      icon: <Github size={32} className="text-white" />,
      color: 'from-gray-700 to-gray-900',
      description: 'Track your commits, PRs, and contributions automatically',
      fields: [],
      buttonText: 'Connect with GitHub',
    },
    leetcode: {
      title: 'Connect LeetCode',
      icon: <Code2 size={32} className="text-yellow-400" />,
      color: 'from-yellow-600 to-orange-600',
      description: 'Import your solved problems and contest ratings',
      fields: [{ name: 'username', label: 'LeetCode Username', placeholder: 'your_username' }],
      buttonText: 'Connect LeetCode',
    },
    vscode: {
      title: 'Connect VS Code',
      icon: <Monitor size={32} className="text-blue-400" />,
      color: 'from-blue-600 to-blue-800',
      description: 'Track coding time and earn XP while you code',
      fields: [],
      buttonText: 'Install Extension',
    },
    calendar: {
      title: 'Connect Calendar',
      icon: <Calendar size={32} className="text-green-400" />,
      color: 'from-green-600 to-emerald-600',
      description: 'Sync deadlines and reminders for XP rewards',
      fields: [],
      buttonText: 'Connect Google Calendar',
    },
  };

  const handleConnect = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    onConnect(username || undefined);
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="max-w-md w-full bg-gray-900 border-2 border-gray-700 rounded-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-6 bg-gradient-to-r ${config[type].color}`}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-black/20 rounded-xl flex items-center justify-center">
              {config[type].icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{config[type].title}</h2>
              <p className="text-white/70 text-sm">{config[type].description}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {config[type].fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm text-gray-400 mb-2">{field.label}</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={field.placeholder}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-lime-500 focus:outline-none"
              />
            </div>
          ))}

          {type === 'vscode' && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <h4 className="font-bold text-blue-400 mb-2">How it works:</h4>
              <ol className="text-sm text-gray-400 space-y-1">
                <li>1. Install the DevQuest extension in VS Code</li>
                <li>2. Sign in with your DevQuest account</li>
                <li>3. Start coding and earn XP automatically!</li>
              </ol>
            </div>
          )}

          {type === 'github' && (
            <div className="p-4 bg-gray-800 rounded-lg">
              <h4 className="font-bold text-white mb-2">What we track:</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>✓ Commits: +2 XP each</li>
                <li>✓ Pull Requests: +10 XP each</li>
                <li>✓ Daily Streaks: +25 XP/day</li>
                <li>✓ Contribution Graph</li>
              </ul>
            </div>
          )}

          {type === 'leetcode' && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <h4 className="font-bold text-yellow-400 mb-2">XP Rewards:</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>🟢 Easy: +10 XP</li>
                <li>🟡 Medium: +25 XP</li>
                <li>🔴 Hard: +50 XP</li>
                <li>🔥 Daily Streak: +20 XP</li>
              </ul>
            </div>
          )}

          {type === 'calendar' && (
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConnect}
                className="flex-1 py-3 bg-white text-gray-900 rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConnect}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M0 0h11.5v11.5H0V0zm12.5 0H24v11.5H12.5V0zM0 12.5h11.5V24H0V12.5zm12.5 0H24V24H12.5V12.5z"/>
                </svg>
                Outlook
              </motion.button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-800 text-gray-300 rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          {type !== 'calendar' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleConnect}
              disabled={loading || (type === 'leetcode' && !username)}
              className="flex-1 py-3 bg-lime-500 text-black rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <>
                  <Link2 size={18} />
                  {config[type].buttonText}
                </>
              )}
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function IntegrationsHub() {
  const { dispatch } = useApp();
  const [integrations, setIntegrations] = useState<IntegrationState>(loadIntegrationState);
  const [connectModal, setConnectModal] = useState<IntegrationType | null>(null);
  const [syncing, setSyncing] = useState<IntegrationType | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'github' | 'leetcode' | 'vscode' | 'calendar'>('overview');

  // Calculate total XP from integrations
  const totalIntegrationXP = useMemo(() => calculateIntegrationXP(integrations), [integrations]);

  // Connected count
  const connectedCount = [
    integrations.github.connected,
    integrations.leetcode.connected,
    integrations.vscode.connected,
    integrations.calendar.connected,
  ].filter(Boolean).length;

  // Handle connect
  const handleConnect = async (type: IntegrationType, username?: string) => {
    // Store the type locally since modal will close
    const connectionType = type;
    setSyncing(connectionType);
    setConnectModal(null);

    try {
      let newState: Partial<IntegrationState> = {};

      switch (connectionType) {
        case 'github': {
          const githubStats = await fetchGitHubStats('mock_token');
          newState = { github: githubStats };
          break;
        }
        case 'leetcode': {
          const leetcodeUsername = username || 'demo_user';
          const leetcodeStats = await fetchLeetCodeStats(leetcodeUsername);
          newState = { leetcode: leetcodeStats };
          break;
        }
        case 'vscode': {
          const vscodeStats = await fetchVSCodeStats();
          newState = { vscode: vscodeStats };
          break;
        }
        case 'calendar': {
          const calendarStats = await fetchCalendarEvents('google');
          newState = { calendar: calendarStats };
          break;
        }
      }

      if (Object.keys(newState).length > 0) {
        setIntegrations(prev => ({ ...prev, ...newState }));
        saveIntegrationState(newState);

        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            id: Date.now().toString(),
            type: 'achievement',
            title: '🔗 Integration Connected!',
            message: `${connectionType.charAt(0).toUpperCase() + connectionType.slice(1)} is now syncing.`,
            timestamp: new Date(),
          },
        });
      }
    } catch (error) {
      console.error('Failed to connect:', error);
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: Date.now().toString(),
          type: 'challenge',
          title: '❌ Connection Failed',
          message: `Could not connect to ${connectionType}. Please try again.`,
          timestamp: new Date(),
        },
      });
    }

    setSyncing(null);
  };

  // Handle disconnect
  const handleDisconnect = (type: IntegrationType) => {
    disconnectIntegration(type);
    setIntegrations(prev => ({
      ...prev,
      [type]: type === 'github' ? { ...prev.github, connected: false } :
              type === 'leetcode' ? { ...prev.leetcode, connected: false } :
              type === 'vscode' ? { ...prev.vscode, connected: false } :
              { ...prev.calendar, connected: false },
    }));
  };

  // Handle sync
  const handleSync = async (type: IntegrationType) => {
    if (!integrations[type].connected) return;
    setSyncing(type);
    
    await handleConnect(type, type === 'leetcode' ? integrations.leetcode.username || undefined : undefined);
    
    setSyncing(null);
  };

  // Render contribution graph
  const renderContributionGraph = (data: { date: string; count: number }[]) => {
    if (!data || data.length === 0) {
      return (
        <div className="p-8 text-center text-gray-500">
          <p>No contribution data available</p>
        </div>
      );
    }

    const weeks = [];
    for (let i = 0; i < 52; i++) {
      const week = data.slice(i * 7, (i + 1) * 7);
      if (week.length > 0) {
        weeks.push(week);
      }
    }

    const getColor = (count: number) => {
      if (count === 0) return 'bg-gray-800';
      if (count <= 2) return 'bg-lime-900';
      if (count <= 4) return 'bg-lime-700';
      if (count <= 6) return 'bg-lime-500';
      return 'bg-lime-400';
    };

    return (
      <div className="overflow-x-auto">
        <div className="flex gap-1 min-w-max p-4">
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="flex flex-col gap-1">
              {week.map((day, dayIdx) => (
                <motion.div
                  key={`${weekIdx}-${dayIdx}`}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: weekIdx * 0.01 }}
                  className={`w-3 h-3 rounded-sm ${getColor(day.count)}`}
                  title={`${day.date}: ${day.count} contributions`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render overview tab
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div whileHover={{ y: -2 }} className="brutal-card bg-gray-900 border-lime-500/50 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-lime-500/20 rounded-lg flex items-center justify-center">
              <Link2 className="text-lime-400" size={20} />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{connectedCount}/4</p>
              <p className="text-xs text-gray-500">Connected</p>
            </div>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="brutal-card bg-gray-900 border-cyan-500/50 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
              <Zap className="text-cyan-400" size={20} />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{totalIntegrationXP.toLocaleString()}</p>
              <p className="text-xs text-gray-500">XP Earned</p>
            </div>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="brutal-card bg-gray-900 border-orange-500/50 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <Flame className="text-orange-400" size={20} />
            </div>
            <div>
              <p className="text-2xl font-black text-white">
                {Math.max(integrations.github.streak, integrations.leetcode.streak)}
              </p>
              <p className="text-xs text-gray-500">Best Streak</p>
            </div>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="brutal-card bg-gray-900 border-fuchsia-500/50 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-fuchsia-500/20 rounded-lg flex items-center justify-center">
              <Clock className="text-fuchsia-400" size={20} />
            </div>
            <div>
              <p className="text-2xl font-black text-white">
                {Math.floor(integrations.vscode.totalCodingTime / 60)}h
              </p>
              <p className="text-xs text-gray-500">Coding Time</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* GitHub Card */}
        <motion.div
          whileHover={{ y: -2 }}
          className={`p-5 rounded-xl border-2 ${
            integrations.github.connected ? 'border-gray-600 bg-gray-800' : 'border-dashed border-gray-700 bg-gray-900'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center">
                <Github size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white">GitHub</h3>
                <p className="text-xs text-gray-500">
                  {integrations.github.connected ? `@${integrations.github.username}` : 'Not connected'}
                </p>
              </div>
            </div>
            {integrations.github.connected ? (
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleSync('github')}
                  disabled={syncing === 'github'}
                  className="p-2 bg-gray-700 rounded-lg text-gray-400 hover:text-white"
                >
                  <RefreshCw size={16} className={syncing === 'github' ? 'animate-spin' : ''} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDisconnect('github')}
                  className="p-2 bg-red-500/20 rounded-lg text-red-400 hover:text-red-300"
                >
                  <Unlink size={16} />
                </motion.button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setConnectModal('github')}
                className="px-4 py-2 bg-lime-500 text-black rounded-lg font-medium text-sm"
              >
                Connect
              </motion.button>
            )}
          </div>

          {integrations.github.connected && (
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-gray-900 rounded-lg">
                <GitCommit size={14} className="text-lime-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{integrations.github.totalCommits}</p>
                <p className="text-[10px] text-gray-500">Commits</p>
              </div>
              <div className="p-2 bg-gray-900 rounded-lg">
                <GitPullRequest size={14} className="text-cyan-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{integrations.github.totalPRs}</p>
                <p className="text-[10px] text-gray-500">PRs</p>
              </div>
              <div className="p-2 bg-gray-900 rounded-lg">
                <Flame size={14} className="text-orange-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{integrations.github.streak}</p>
                <p className="text-[10px] text-gray-500">Streak</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* LeetCode Card */}
        <motion.div
          whileHover={{ y: -2 }}
          className={`p-5 rounded-xl border-2 ${
            integrations.leetcode.connected ? 'border-yellow-600/50 bg-gray-800' : 'border-dashed border-gray-700 bg-gray-900'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <Code2 size={24} className="text-yellow-400" />
              </div>
              <div>
                <h3 className="font-bold text-white">LeetCode</h3>
                <p className="text-xs text-gray-500">
                  {integrations.leetcode.connected ? `@${integrations.leetcode.username}` : 'Not connected'}
                </p>
              </div>
            </div>
            {integrations.leetcode.connected ? (
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleSync('leetcode')}
                  disabled={syncing === 'leetcode'}
                  className="p-2 bg-gray-700 rounded-lg text-gray-400 hover:text-white"
                >
                  <RefreshCw size={16} className={syncing === 'leetcode' ? 'animate-spin' : ''} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDisconnect('leetcode')}
                  className="p-2 bg-red-500/20 rounded-lg text-red-400 hover:text-red-300"
                >
                  <Unlink size={16} />
                </motion.button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setConnectModal('leetcode')}
                className="px-4 py-2 bg-yellow-500 text-black rounded-lg font-medium text-sm"
              >
                Connect
              </motion.button>
            )}
          </div>

          {integrations.leetcode.connected && (
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2 bg-gray-900 rounded-lg">
                <p className="text-lg font-bold text-white">{integrations.leetcode.totalSolved}</p>
                <p className="text-[10px] text-gray-500">Total</p>
              </div>
              <div className="p-2 bg-gray-900 rounded-lg">
                <p className="text-lg font-bold text-green-400">{integrations.leetcode.easySolved}</p>
                <p className="text-[10px] text-gray-500">Easy</p>
              </div>
              <div className="p-2 bg-gray-900 rounded-lg">
                <p className="text-lg font-bold text-yellow-400">{integrations.leetcode.mediumSolved}</p>
                <p className="text-[10px] text-gray-500">Medium</p>
              </div>
              <div className="p-2 bg-gray-900 rounded-lg">
                <p className="text-lg font-bold text-red-400">{integrations.leetcode.hardSolved}</p>
                <p className="text-[10px] text-gray-500">Hard</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* VS Code Card */}
        <motion.div
          whileHover={{ y: -2 }}
          className={`p-5 rounded-xl border-2 ${
            integrations.vscode.connected ? 'border-blue-600/50 bg-gray-800' : 'border-dashed border-gray-700 bg-gray-900'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Monitor size={24} className="text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-white">VS Code</h3>
                <p className="text-xs text-gray-500">
                  {integrations.vscode.connected ? 'Extension active' : 'Not connected'}
                </p>
              </div>
            </div>
            {integrations.vscode.connected ? (
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleSync('vscode')}
                  disabled={syncing === 'vscode'}
                  className="p-2 bg-gray-700 rounded-lg text-gray-400 hover:text-white"
                >
                  <RefreshCw size={16} className={syncing === 'vscode' ? 'animate-spin' : ''} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDisconnect('vscode')}
                  className="p-2 bg-red-500/20 rounded-lg text-red-400 hover:text-red-300"
                >
                  <Unlink size={16} />
                </motion.button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setConnectModal('vscode')}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium text-sm"
              >
                Install
              </motion.button>
            )}
          </div>

          {integrations.vscode.connected && (
            <>
              <div className="grid grid-cols-3 gap-2 text-center mb-3">
                <div className="p-2 bg-gray-900 rounded-lg">
                  <p className="text-lg font-bold text-white">{Math.floor(integrations.vscode.todayCodingTime / 60)}h</p>
                  <p className="text-[10px] text-gray-500">Today</p>
                </div>
                <div className="p-2 bg-gray-900 rounded-lg">
                  <p className="text-lg font-bold text-white">{Math.floor(integrations.vscode.weekCodingTime / 60)}h</p>
                  <p className="text-[10px] text-gray-500">Week</p>
                </div>
                <div className="p-2 bg-gray-900 rounded-lg">
                  <p className="text-lg font-bold text-blue-400">{integrations.vscode.productivityScore}%</p>
                  <p className="text-[10px] text-gray-500">Score</p>
                </div>
              </div>
              <div className="space-y-1">
                {integrations.vscode.topLanguages.slice(0, 3).map((lang, i) => (
                  <div key={lang.language} className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-20">{lang.language}</span>
                    <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${i === 0 ? 'bg-blue-500' : i === 1 ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${lang.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{lang.percentage}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>

        {/* Calendar Card */}
        <motion.div
          whileHover={{ y: -2 }}
          className={`p-5 rounded-xl border-2 ${
            integrations.calendar.connected ? 'border-green-600/50 bg-gray-800' : 'border-dashed border-gray-700 bg-gray-900'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Calendar size={24} className="text-green-400" />
              </div>
              <div>
                <h3 className="font-bold text-white">Calendar</h3>
                <p className="text-xs text-gray-500">
                  {integrations.calendar.connected ? integrations.calendar.email : 'Not connected'}
                </p>
              </div>
            </div>
            {integrations.calendar.connected ? (
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleSync('calendar')}
                  disabled={syncing === 'calendar'}
                  className="p-2 bg-gray-700 rounded-lg text-gray-400 hover:text-white"
                >
                  <RefreshCw size={16} className={syncing === 'calendar' ? 'animate-spin' : ''} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDisconnect('calendar')}
                  className="p-2 bg-red-500/20 rounded-lg text-red-400 hover:text-red-300"
                >
                  <Unlink size={16} />
                </motion.button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setConnectModal('calendar')}
                className="px-4 py-2 bg-green-500 text-black rounded-lg font-medium text-sm"
              >
                Connect
              </motion.button>
            )}
          </div>

          {integrations.calendar.connected && (
            <div className="space-y-2">
              {integrations.calendar.todayEvents.length > 0 ? (
                integrations.calendar.todayEvents.slice(0, 2).map((event) => (
                  <div key={event.id} className="p-2 bg-gray-900 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        event.type === 'deadline' ? 'bg-red-500' :
                        event.type === 'interview' ? 'bg-purple-500' :
                        event.type === 'study' ? 'bg-blue-500' :
                        'bg-gray-500'
                      }`} />
                      <span className="text-sm text-white truncate max-w-[150px]">{event.title}</span>
                    </div>
                    <span className="text-xs text-lime-400">+{event.xpReward} XP</span>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 text-sm py-4">No events today</p>
              )}
              <p className="text-xs text-gray-500 text-center">
                {integrations.calendar.upcomingEvents.length} upcoming events
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* GitHub Contribution Graph */}
      {integrations.github.connected && (
        <div className="brutal-card bg-gray-900 border-gray-700 p-4">
          <h3 className="font-bold text-white mb-3 flex items-center gap-2">
            <Github size={18} /> Contribution Graph
          </h3>
          {renderContributionGraph(integrations.github.contributionGraph)}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            <Link2 className="text-lime-400" size={28} />
            Integrations
          </h1>
          <p className="text-gray-400 mt-1">Connect your accounts to earn XP automatically</p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'github', label: 'GitHub', icon: Github },
            { id: 'leetcode', label: 'LeetCode', icon: Code2 },
            { id: 'vscode', label: 'VS Code', icon: Monitor },
            { id: 'calendar', label: 'Calendar', icon: Calendar },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-lime-500 text-black'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'github' && integrations.github.connected && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="brutal-card bg-gray-900 p-4 text-center">
                    <GitCommit className="text-lime-400 mx-auto mb-2" size={24} />
                    <p className="text-3xl font-black text-white">{integrations.github.totalCommits}</p>
                    <p className="text-sm text-gray-500">Commits</p>
                  </div>
                  <div className="brutal-card bg-gray-900 p-4 text-center">
                    <GitPullRequest className="text-cyan-400 mx-auto mb-2" size={24} />
                    <p className="text-3xl font-black text-white">{integrations.github.totalPRs}</p>
                    <p className="text-sm text-gray-500">Pull Requests</p>
                  </div>
                  <div className="brutal-card bg-gray-900 p-4 text-center">
                    <Star className="text-yellow-400 mx-auto mb-2" size={24} />
                    <p className="text-3xl font-black text-white">{integrations.github.repositories}</p>
                    <p className="text-sm text-gray-500">Repositories</p>
                  </div>
                  <div className="brutal-card bg-gray-900 p-4 text-center">
                    <Flame className="text-orange-400 mx-auto mb-2" size={24} />
                    <p className="text-3xl font-black text-white">{integrations.github.streak}</p>
                    <p className="text-sm text-gray-500">Day Streak</p>
                  </div>
                </div>

                <div className="brutal-card bg-gray-900 p-4">
                  <h3 className="font-bold text-white mb-4">Contribution Graph</h3>
                  {renderContributionGraph(integrations.github.contributionGraph)}
                </div>

                <div className="brutal-card bg-gray-900 p-4">
                  <h3 className="font-bold text-white mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {integrations.github.recentActivity.map((activity, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                        {activity.type === 'commit' ? (
                          <GitCommit className="text-lime-400" size={18} />
                        ) : (
                          <GitPullRequest className="text-cyan-400" size={18} />
                        )}
                        <div className="flex-1">
                          <p className="text-white text-sm">{activity.message}</p>
                          <p className="text-gray-500 text-xs">{activity.repo}</p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(activity.date).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {activeTab !== 'overview' && !integrations[activeTab as keyof IntegrationState]?.connected && (
              <div className="text-center py-12">
                <AlertCircle className="text-gray-600 mx-auto mb-4" size={48} />
                <h3 className="text-xl font-bold text-white mb-2">Not Connected</h3>
                <p className="text-gray-500 mb-4">Connect your {activeTab} account to see detailed stats</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setConnectModal(activeTab as IntegrationType)}
                  className="px-6 py-3 bg-lime-500 text-black rounded-lg font-bold"
                >
                  Connect {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </motion.button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Connect Modal */}
      <AnimatePresence>
        {connectModal && (
          <ConnectModal
            type={connectModal}
            onClose={() => setConnectModal(null)}
            onConnect={(username) => handleConnect(connectModal, username)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
