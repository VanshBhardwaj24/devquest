import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Map,
  Star,
  Lock,
  CheckCircle,
  Circle,
  ChevronRight,
  ChevronDown,
  Trophy,
  Target,
  Clock,
  BookOpen,
  Code,
  Rocket,
  Gift,
  Play,
  Video,
  FileText,
  ExternalLink,
  Filter,
  Search,
  LayoutGrid,
  List,
  Briefcase,
  TrendingUp,
  Send,
  XOctagon,
  Users,
  CheckSquare,
  Activity,
  Zap
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface Milestone {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  status: 'completed' | 'in-progress' | 'locked' | 'available';
  dueDate?: string;
  estimatedTime?: string;
  skills: string[];
  resources: { type: 'video' | 'article' | 'project' | 'quiz' | 'github'; title: string; url?: string }[];
  subtasks: { id: string; title: string; completed: boolean }[];
  progress: number;
  track?: 'frontend' | 'ai-ml' | 'open-source' | 'general';
}

interface CareerPhase {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  level: string;
  description: string;
  milestones: Milestone[];
  unlocked: boolean;
  completed: boolean;
  xpRequired: number;
  bonusReward?: { type: string; value: string };
}

export function CareerRoadmap() {
  const { state } = useApp();
  const { user, careerStats } = state;
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'in-progress' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Career phases with milestones
  const careerPhases: CareerPhase[] = [
    {
      id: 'foundation',
      title: 'Foundation',
      subtitle: 'Build Your Base',
      icon: '🌱',
      color: 'lime',
      level: 'Beginner',
      description: 'Master the fundamentals and establish strong coding habits',
      unlocked: true,
      completed: (user?.level || 1) >= 5,
      xpRequired: 0,
      bonusReward: { type: 'badge', value: 'Foundation Master' },
      milestones: [
        {
          id: 'f1',
          title: 'First Steps',
          description: 'Complete your profile and set your first goal',
          xpReward: 100,
          status: 'completed',
          estimatedTime: '15 min',
          skills: ['Goal Setting', 'Planning'],
          progress: 100,
          resources: [
            { type: 'article', title: 'How to Set SMART Goals', url: '#' },
            { type: 'video', title: 'Getting Started Guide', url: '#' }
          ],
          subtasks: [
            { id: 's1', title: 'Complete profile setup', completed: true },
            { id: 's2', title: 'Set your first weekly goal', completed: true },
            { id: 's3', title: 'Explore the dashboard', completed: true }
          ]
        },
        {
          id: 'f2',
          title: 'Daily Warrior',
          description: 'Complete tasks for 7 consecutive days',
          xpReward: 250,
          status: 'completed',
          estimatedTime: '7 days',
          skills: ['Consistency', 'Discipline'],
          progress: 100,
          resources: [
            { type: 'article', title: 'Building Habits That Stick', url: '#' }
          ],
          subtasks: [
            { id: 's1', title: 'Day 1 complete', completed: true },
            { id: 's2', title: 'Day 2 complete', completed: true },
            { id: 's3', title: 'Day 3 complete', completed: true },
            { id: 's4', title: 'Day 4 complete', completed: true },
            { id: 's5', title: 'Day 5 complete', completed: true },
            { id: 's6', title: 'Day 6 complete', completed: true },
            { id: 's7', title: 'Day 7 complete', completed: true }
          ]
        },
        {
          id: 'f3',
          title: 'Skill Explorer',
          description: 'Unlock your first 3 skills in the skill tree',
          xpReward: 200,
          status: 'in-progress',
          estimatedTime: '2 hours',
          skills: ['Learning', 'Exploration'],
          progress: 66,
          resources: [
            { type: 'article', title: 'Skill Tree Overview', url: '#' },
            { type: 'project', title: 'Practice Challenge', url: '#' }
          ],
          subtasks: [
            { id: 's1', title: 'Unlock first skill', completed: true },
            { id: 's2', title: 'Unlock second skill', completed: true },
            { id: 's3', title: 'Unlock third skill', completed: false }
          ]
        },
        {
          id: 'f4',
          title: 'First Challenge',
          description: 'Complete your first coding challenge',
          xpReward: 300,
          status: 'available',
          estimatedTime: '30 min',
          skills: ['Problem Solving', 'Coding'],
          progress: 0,
          resources: [
            { type: 'video', title: 'How to Approach Challenges', url: '#' },
            { type: 'quiz', title: 'Pre-Challenge Quiz', url: '#' }
          ],
          subtasks: [
            { id: 's1', title: 'Read challenge requirements', completed: false },
            { id: 's2', title: 'Write solution', completed: false },
            { id: 's3', title: 'Submit and pass tests', completed: false }
          ]
        }
      ]
    },
    {
      id: 'growth',
      title: 'Growth',
      subtitle: 'Level Up Your Skills',
      icon: '🚀',
      color: 'cyan',
      level: 'Intermediate',
      description: 'Expand your abilities and tackle harder challenges',
      unlocked: (user?.level || 1) >= 5,
      completed: (user?.level || 1) >= 15,
      xpRequired: 5000,
      bonusReward: { type: 'title', value: 'Rising Developer' },
      milestones: [
        {
          id: 'g1',
          title: 'Challenge Champion',
          description: 'Complete 25 coding challenges',
          xpReward: 500,
          status: (user?.level || 1) >= 5 ? 'in-progress' : 'locked',
          estimatedTime: '2 weeks',
          skills: ['Algorithms', 'Problem Solving'],
          progress: 40,
          resources: [
            { type: 'article', title: 'Common Algorithm Patterns', url: '#' },
            { type: 'video', title: 'Problem Solving Strategies', url: '#' }
          ],
          subtasks: [
            { id: 's1', title: 'Complete 10 easy challenges', completed: true },
            { id: 's2', title: 'Complete 10 medium challenges', completed: false },
            { id: 's3', title: 'Complete 5 hard challenges', completed: false }
          ]
        },
        {
          id: 'g2',
          title: 'Streak Master',
          description: 'Maintain a 30-day streak',
          xpReward: 750,
          status: (user?.level || 1) >= 5 ? 'available' : 'locked',
          estimatedTime: '30 days',
          dueDate: '2025-01-15',
          skills: ['Consistency', 'Dedication'],
          progress: 0,
          resources: [
            { type: 'article', title: 'Maintaining Long Streaks', url: '#' }
          ],
          subtasks: [
            { id: 's1', title: 'Reach 10-day streak', completed: false },
            { id: 's2', title: 'Reach 20-day streak', completed: false },
            { id: 's3', title: 'Complete 30-day streak', completed: false }
          ]
        },
        {
          id: 'g3',
          title: 'Skill Specialist',
          description: 'Max out one complete skill branch',
          xpReward: 600,
          status: (user?.level || 1) >= 7 ? 'available' : 'locked',
          estimatedTime: '1 week',
          skills: ['Specialization', 'Mastery'],
          progress: 0,
          resources: [
            { type: 'project', title: 'Skill Mastery Project', url: '#' }
          ],
          subtasks: [
            { id: 's1', title: 'Choose a skill branch', completed: false },
            { id: 's2', title: 'Unlock all skills in branch', completed: false },
            { id: 's3', title: 'Complete mastery challenge', completed: false }
          ]
        },
        {
          id: 'g4',
          title: 'Community Star',
          description: 'Help 10 other users with their goals',
          xpReward: 400,
          status: 'locked',
          estimatedTime: '2 weeks',
          skills: ['Collaboration', 'Mentoring'],
          progress: 0,
          resources: [
            { type: 'article', title: 'How to Help Others Effectively', url: '#' }
          ],
          subtasks: [
            { id: 's1', title: 'Join a study group', completed: false },
            { id: 's2', title: 'Answer 5 questions', completed: false },
            { id: 's3', title: 'Help 10 users', completed: false }
          ]
        }
      ]
    },
    {
      id: 'mastery',
      title: 'Mastery',
      subtitle: 'Become Elite',
      icon: '👑',
      color: 'magenta',
      level: 'Advanced',
      description: 'Prove your expertise and lead others',
      unlocked: (user?.level || 1) >= 15,
      completed: (user?.level || 1) >= 30,
      xpRequired: 15000,
      bonusReward: { type: 'exclusive', value: 'Elite Status + Custom Theme' },
      milestones: [
        {
          id: 'm1',
          title: 'Elite Coder',
          description: 'Solve 50 hard challenges with optimal solutions',
          xpReward: 1000,
          status: 'locked',
          estimatedTime: '1 month',
          skills: ['Advanced Algorithms', 'Optimization'],
          progress: 0,
          resources: [
            { type: 'video', title: 'Advanced Problem Solving', url: '#' },
            { type: 'article', title: 'Optimization Techniques', url: '#' }
          ],
          subtasks: [
            { id: 's1', title: 'Complete 25 hard challenges', completed: false },
            { id: 's2', title: 'Achieve optimal solutions', completed: false },
            { id: 's3', title: 'Complete 50 hard challenges', completed: false }
          ]
        },
        {
          id: 'm2',
          title: 'Century Streak',
          description: 'Maintain a 100-day streak',
          xpReward: 2000,
          status: 'locked',
          estimatedTime: '100 days',
          skills: ['Legendary Consistency'],
          progress: 0,
          resources: [],
          subtasks: [
            { id: 's1', title: 'Reach 50-day streak', completed: false },
            { id: 's2', title: 'Reach 75-day streak', completed: false },
            { id: 's3', title: 'Complete 100-day streak', completed: false }
          ]
        },
        {
          id: 'm3',
          title: 'Mentor',
          description: 'Help 50 users achieve their goals',
          xpReward: 1500,
          status: 'locked',
          estimatedTime: '2 months',
          skills: ['Leadership', 'Teaching'],
          progress: 0,
          resources: [],
          subtasks: [
            { id: 's1', title: 'Complete mentor training', completed: false },
            { id: 's2', title: 'Help 25 users', completed: false },
            { id: 's3', title: 'Help 50 users', completed: false }
          ]
        },
        {
          id: 'm4',
          title: 'Legend',
          description: 'Reach the top 1% of all users',
          xpReward: 5000,
          status: 'locked',
          estimatedTime: 'Ongoing',
          skills: ['Excellence', 'Dedication'],
          progress: 0,
          resources: [],
          subtasks: [
            { id: 's1', title: 'Reach top 10%', completed: false },
            { id: 's2', title: 'Reach top 5%', completed: false },
            { id: 's3', title: 'Reach top 1%', completed: false }
          ]
        }
      ]
    }
  ];

  const getStatusIcon = (status: Milestone['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-lime-400" />;
      case 'in-progress':
        return <Play className="w-5 h-5 text-cyan-400" />;
      case 'available':
        return <Circle className="w-5 h-5 text-yellow-400" />;
      case 'locked':
        return <Lock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Milestone['status']) => {
    switch (status) {
      case 'completed':
        return 'border-lime-500 bg-lime-500/10';
      case 'in-progress':
        return 'border-cyan-500 bg-cyan-500/10';
      case 'available':
        return 'border-yellow-500 bg-yellow-500/10';
      case 'locked':
        return 'border-gray-600 bg-gray-800/50';
    }
  };

  const getPhaseProgress = (phase: CareerPhase) => {
    const completed = phase.milestones.filter(m => m.status === 'completed').length;
    return Math.round((completed / phase.milestones.length) * 100);
  };

  const getTotalProgress = () => {
    const allMilestones = careerPhases.flatMap(p => p.milestones);
    const completed = allMilestones.filter(m => m.status === 'completed').length;
    return Math.round((completed / allMilestones.length) * 100);
  };

  const filteredPhases = careerPhases.map(phase => ({
    ...phase,
    milestones: phase.milestones.filter(m => {
      const matchesStatus = filterStatus === 'all' || m.status === filterStatus;
      const matchesSearch = searchQuery === '' || 
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesStatus && matchesSearch;
    })
  }));

  const selectedPhaseData = careerPhases.find(p => p.id === selectedPhase);

  // Stats calculation
  const totalApplications = careerStats?.totalApplications || 0;
  const interviews = careerStats?.interviews || 0;
  const offers = careerStats?.offers || 0;
  const rejections = careerStats?.rejections || 0;
  const successRate = totalApplications > 0 ? Math.round((offers / totalApplications) * 100) : 0;
  const interviewRate = totalApplications > 0 ? Math.round((interviews / totalApplications) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-3 sm:p-4 lg:p-6 pb-20 lg:pb-6 relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-20" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl lg:text-4xl font-black text-white font-mono flex items-center gap-3">
                <Map className="w-8 h-8 text-lime-400" />
                CAREER ROADMAP
              </h1>
              <p className="text-gray-400 font-mono mt-1">Your journey from beginner to legend</p>
            </div>

            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex bg-gray-800 border-2 border-gray-700 rounded-none">
                <button
                  onClick={() => setViewMode('map')}
                  className={`p-2 ${viewMode === 'map' ? 'bg-lime-500 text-black' : 'text-gray-400 hover:text-white'}`}
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-lime-500 text-black' : 'text-gray-400 hover:text-white'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 border-2 ${showFilters ? 'border-lime-500 text-lime-400' : 'border-gray-700 text-gray-400'} hover:text-white bg-gray-800`}
              >
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </motion.div>

          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 bg-gray-900 border-2 border-gray-700"
              >
                <div className="flex flex-wrap gap-4">
                  {/* Search */}
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        placeholder="Search milestones..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-800 border-2 border-gray-700 text-white font-mono text-sm focus:border-lime-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div className="flex gap-2">
                    {(['all', 'available', 'in-progress', 'completed'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-3 py-2 font-mono text-sm border-2 ${
                          filterStatus === status
                            ? 'border-lime-500 bg-lime-500 text-black'
                            : 'border-gray-700 bg-gray-800 text-gray-400 hover:text-white'
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Career Stats HUD */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {/* Applications Card */}
          <div className="brutal-card bg-gray-900 border-cyan-500/30 p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-cyan-900/30 rounded border border-cyan-500/30">
                <Send className="text-cyan-400 w-5 h-5" />
              </div>
              <span className="text-xs text-cyan-400 font-mono bg-cyan-900/20 px-2 py-1 rounded">APPLIED</span>
            </div>
            <div className="text-3xl font-black text-white font-mono">{totalApplications}</div>
            <p className="text-xs text-gray-500 font-mono mt-1">Total Applications Sent</p>
          </div>

          {/* Interviews Card */}
          <div className="brutal-card bg-gray-900 border-yellow-500/30 p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-yellow-900/30 rounded border border-yellow-500/30">
                <Users className="text-yellow-400 w-5 h-5" />
              </div>
              <span className="text-xs text-yellow-400 font-mono bg-yellow-900/20 px-2 py-1 rounded">INTERVIEWS</span>
            </div>
            <div className="text-3xl font-black text-white font-mono">{interviews}</div>
            <div className="w-full bg-gray-800 h-1.5 mt-2 rounded-full overflow-hidden">
              <div className="bg-yellow-500 h-full" style={{ width: `${interviewRate}%` }}></div>
            </div>
            <p className="text-xs text-gray-500 font-mono mt-1">{interviewRate}% Response Rate</p>
          </div>

          {/* Offers Card */}
          <div className="brutal-card bg-gray-900 border-lime-500/30 p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-lime-900/30 rounded border border-lime-500/30">
                <CheckSquare className="text-lime-400 w-5 h-5" />
              </div>
              <span className="text-xs text-lime-400 font-mono bg-lime-900/20 px-2 py-1 rounded">OFFERS</span>
            </div>
            <div className="text-3xl font-black text-white font-mono">{offers}</div>
             <div className="w-full bg-gray-800 h-1.5 mt-2 rounded-full overflow-hidden">
              <div className="bg-lime-500 h-full" style={{ width: `${successRate}%` }}></div>
            </div>
            <p className="text-xs text-gray-500 font-mono mt-1">{successRate}% Success Rate</p>
          </div>

          {/* Rejections/Learning Card */}
          <div className="brutal-card bg-gray-900 border-red-500/30 p-4">
             <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-red-900/30 rounded border border-red-500/30">
                <XOctagon className="text-red-400 w-5 h-5" />
              </div>
              <span className="text-xs text-red-400 font-mono bg-red-900/20 px-2 py-1 rounded">REJECTIONS</span>
            </div>
            <div className="text-3xl font-black text-white font-mono">{rejections}</div>
            <p className="text-xs text-gray-500 font-mono mt-1">Learning Opportunities</p>
          </div>
        </motion.div>

        {/* Overall Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 p-6 bg-gray-900 border-4 border-gray-700 brutal-shadow"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-lime-500 via-cyan-500 to-magenta-500 border-2 border-black flex items-center justify-center">
                <Trophy className="w-8 h-8 text-black" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white font-mono">Overall Progress</h2>
                <p className="text-gray-400 font-mono text-sm">
                  {careerPhases.flatMap(p => p.milestones).filter(m => m.status === 'completed').length} / {careerPhases.flatMap(p => p.milestones).length} milestones completed
                </p>
              </div>
            </div>

            <div className="flex-1 max-w-md">
              <div className="flex justify-between text-sm font-mono mb-1">
                <span className="text-gray-400">Journey Progress</span>
                <span className="text-lime-400">{getTotalProgress()}%</span>
              </div>
              <div className="h-4 bg-gray-800 border-2 border-gray-700 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${getTotalProgress()}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-lime-500 via-cyan-500 to-magenta-500"
                />
              </div>
            </div>

            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-2xl font-black text-lime-400 font-mono">{user?.level || 1}</div>
                <div className="text-xs text-gray-500 font-mono">LEVEL</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-cyan-400 font-mono">{user?.xp?.toLocaleString() || 0}</div>
                <div className="text-xs text-gray-500 font-mono">TOTAL XP</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-yellow-400 font-mono">{user?.streak || 0}</div>
                <div className="text-xs text-gray-500 font-mono">STREAK</div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Phases List */}
          <div className={`${viewMode === 'map' ? 'lg:w-1/3' : 'w-full'}`}>
            <div className="space-y-4">
              {filteredPhases.map((phase, index) => (
                <motion.div
                  key={phase.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => {
                    setSelectedPhase(phase.id);
                    setSelectedMilestone(null);
                  }}
                  className={`p-4 border-4 cursor-pointer transition-all ${
                    selectedPhase === phase.id
                      ? 'border-lime-500 bg-gray-900 brutal-shadow'
                      : phase.unlocked
                      ? 'border-gray-700 bg-gray-900/50 hover:border-gray-500'
                      : 'border-gray-800 bg-gray-900/30 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 flex items-center justify-center text-3xl border-2 ${
                      phase.completed ? 'border-lime-500 bg-lime-500/20' :
                      phase.unlocked ? `border-${phase.color}-500 bg-${phase.color}-500/20` :
                      'border-gray-700 bg-gray-800'
                    }`}>
                      {phase.unlocked ? phase.icon : '🔒'}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-black text-white font-mono">{phase.title}</h3>
                        <span className={`text-xs font-mono px-2 py-1 ${
                          phase.completed ? 'bg-lime-500/20 text-lime-400' :
                          phase.unlocked ? 'bg-cyan-500/20 text-cyan-400' :
                          'bg-gray-700 text-gray-500'
                        }`}>
                          {phase.level}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm font-mono mt-1">{phase.subtitle}</p>

                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="flex justify-between text-xs font-mono mb-1">
                          <span className="text-gray-500">{phase.milestones.filter(m => m.status === 'completed').length}/{phase.milestones.length} milestones</span>
                          <span className="text-lime-400">{getPhaseProgress(phase)}%</span>
                        </div>
                        <div className="h-2 bg-gray-800 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${getPhaseProgress(phase)}%` }}
                            className={`h-full ${
                              phase.color === 'lime' ? 'bg-lime-500' :
                              phase.color === 'cyan' ? 'bg-cyan-500' :
                              'bg-magenta-500'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Bonus Reward */}
                      {phase.bonusReward && (
                        <div className="mt-2 flex items-center gap-2 text-xs font-mono text-yellow-400">
                          <Gift className="w-3 h-3" />
                          <span>Bonus: {phase.bonusReward.value}</span>
                        </div>
                      )}
                    </div>

                    <ChevronRight className={`w-5 h-5 transition-transform ${
                      selectedPhase === phase.id ? 'rotate-90 text-lime-400' : 'text-gray-600'
                    }`} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Phase Details */}
          {viewMode === 'map' && selectedPhaseData && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:w-2/3"
            >
              <div className="p-6 bg-gray-900 border-4 border-gray-700 brutal-shadow">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{selectedPhaseData.icon}</div>
                    <div>
                      <h2 className="text-2xl font-black text-white font-mono">{selectedPhaseData.title}</h2>
                      <p className="text-gray-400 font-mono">{selectedPhaseData.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-lime-400 font-mono">{getPhaseProgress(selectedPhaseData)}%</div>
                    <div className="text-xs text-gray-500 font-mono">COMPLETE</div>
                  </div>
                </div>

                {/* Milestones Grid */}
                <div className="grid gap-4">
                  {selectedPhaseData.milestones.map((milestone, index) => (
                    <motion.div
                      key={milestone.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setSelectedMilestone(selectedMilestone === milestone.id ? null : milestone.id)}
                      className={`p-4 border-2 cursor-pointer transition-all ${getStatusColor(milestone.status)} ${
                        selectedMilestone === milestone.id ? 'ring-2 ring-lime-500' : ''
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="mt-1">{getStatusIcon(milestone.status)}</div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className={`font-bold font-mono ${
                              milestone.status === 'locked' ? 'text-gray-500' : 'text-white'
                            }`}>
                              {milestone.title}
                            </h3>
                            <div className="flex items-center gap-2">
                              <span className="text-yellow-400 font-mono text-sm flex items-center gap-1">
                                <Star className="w-4 h-4" />
                                +{milestone.xpReward} XP
                              </span>
                            </div>
                          </div>

                          <p className={`text-sm mt-1 ${
                            milestone.status === 'locked' ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            {milestone.description}
                          </p>

                          {/* Progress and Skills */}
                          <div className="mt-3 flex flex-wrap items-center gap-3">
                            {milestone.estimatedTime && (
                              <span className="flex items-center gap-1 text-xs text-gray-500 font-mono">
                                <Clock className="w-3 h-3" />
                                {milestone.estimatedTime}
                              </span>
                            )}
                            {milestone.skills.map((skill, i) => (
                              <span key={i} className="px-2 py-0.5 text-xs font-mono bg-gray-800 text-gray-400 border border-gray-700">
                                {skill}
                              </span>
                            ))}
                          </div>

                          {/* Progress Bar */}
                          {milestone.status !== 'locked' && milestone.progress > 0 && (
                            <div className="mt-3">
                              <div className="h-2 bg-gray-800 overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${milestone.progress}%` }}
                                  className={`h-full ${
                                    milestone.status === 'completed' ? 'bg-lime-500' : 'bg-cyan-500'
                                  }`}
                                />
                              </div>
                            </div>
                          )}

                          {/* Expanded Details */}
                          <AnimatePresence>
                            {selectedMilestone === milestone.id && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 pt-4 border-t border-gray-700"
                              >
                                {/* Subtasks */}
                                <div className="mb-4">
                                  <h4 className="text-sm font-bold text-white font-mono mb-2 flex items-center gap-2">
                                    <Target className="w-4 h-4 text-cyan-400" />
                                    Tasks ({milestone.subtasks.filter(s => s.completed).length}/{milestone.subtasks.length})
                                  </h4>
                                  <div className="space-y-2">
                                    {milestone.subtasks.map((subtask) => (
                                      <div key={subtask.id} className="flex items-center gap-2">
                                        {subtask.completed ? (
                                          <CheckCircle className="w-4 h-4 text-lime-400" />
                                        ) : (
                                          <Circle className="w-4 h-4 text-gray-600" />
                                        )}
                                        <span className={`text-sm font-mono ${
                                          subtask.completed ? 'text-gray-400 line-through' : 'text-gray-300'
                                        }`}>
                                          {subtask.title}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Resources */}
                                {milestone.resources.length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-bold text-white font-mono mb-2 flex items-center gap-2">
                                      <BookOpen className="w-4 h-4 text-magenta-400" />
                                      Resources
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                      {milestone.resources.map((resource, i) => (
                                        <a
                                          key={i}
                                          href={resource.url}
                                          className="flex items-center gap-2 px-3 py-1 bg-gray-800 border border-gray-700 text-sm font-mono text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
                                        >
                                          {resource.type === 'video' && <Video className="w-3 h-3 text-red-400" />}
                                          {resource.type === 'article' && <FileText className="w-3 h-3 text-blue-400" />}
                                          {resource.type === 'project' && <Code className="w-3 h-3 text-green-400" />}
                                          {resource.type === 'quiz' && <Target className="w-3 h-3 text-yellow-400" />}
                                          {resource.title}
                                          <ExternalLink className="w-3 h-3" />
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Action Button */}
                                {milestone.status === 'available' && (
                                  <motion.button
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="mt-4 w-full py-3 bg-lime-500 border-2 border-black text-black font-black font-mono flex items-center justify-center gap-2 brutal-shadow"
                                  >
                                    <Rocket className="w-5 h-5" />
                                    START MILESTONE
                                  </motion.button>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <ChevronDown className={`w-5 h-5 transition-transform ${
                          selectedMilestone === milestone.id ? 'rotate-180 text-lime-400' : 'text-gray-600'
                        }`} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="w-full">
              {filteredPhases.map((phase) => (
                <div key={phase.id} className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{phase.icon}</span>
                    <h2 className="text-xl font-black text-white font-mono">{phase.title}</h2>
                    <span className="text-sm text-gray-500 font-mono">({phase.milestones.length} milestones)</span>
                  </div>

                  <div className="grid gap-3">
                    {phase.milestones.map((milestone) => (
                      <div
                        key={milestone.id}
                        className={`p-4 border-2 ${getStatusColor(milestone.status)} flex items-center justify-between`}
                      >
                        <div className="flex items-center gap-3">
                          {getStatusIcon(milestone.status)}
                          <div>
                            <h3 className={`font-bold font-mono ${
                              milestone.status === 'locked' ? 'text-gray-500' : 'text-white'
                            }`}>
                              {milestone.title}
                            </h3>
                            <p className="text-xs text-gray-500 font-mono">{milestone.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="text-yellow-400 font-mono text-sm">+{milestone.xpReward} XP</span>
                            {milestone.estimatedTime && (
                              <div className="text-xs text-gray-500 font-mono">{milestone.estimatedTime}</div>
                            )}
                          </div>
                          <div className="w-24 h-2 bg-gray-800">
                            <div
                              className={`h-full ${
                                milestone.status === 'completed' ? 'bg-lime-500' :
                                milestone.status === 'in-progress' ? 'bg-cyan-500' :
                                'bg-gray-700'
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
