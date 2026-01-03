import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { 
  Target, Trophy, Heart, Brain, 
  Briefcase, Users, Plane,
  Zap, Award, Sparkles, Flag, CheckCircle,
  Circle, Plus, Globe,
  GraduationCap, Rocket, Lock, TrendingUp,
  AlertTriangle, Flame, Timer, Star, Crown, Shield, Swords, Gem, Coins, Gift, Bell, TrendingDown, Clock, Calendar, Award as AwardIcon, Medal, Ban, Sword, MessageSquare, Eye, EyeOff, Meh, Smile, Laugh, Wind, Earth, Moon, Sun, Cloud, Frown, AlertCircle, XCircle
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { appDataService } from '../../services/appDataService';

interface LifeArea {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  currentLevel: number;
  targetLevel: number;
  progress: number;
  goals: LifeGoal[];
  milestones: Milestone[];
  isUnlocked: boolean;
  requiredAreas: string[];
}

interface LifeGoal {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  targetDate: Date;
  progress: number;
  rewards: {
    xp: number;
    achievement?: string;
    unlock?: string;
  };
  dependencies: string[];
  subtasks: Subtask[];
  // New components
  habits: GoalHabit[];
  milestones: GoalMilestone[];
  resources: GoalResource[];
  reflections: GoalReflection[];
  connections: GoalConnection[];
  timeline: GoalTimeline[];
  metrics: GoalMetric[];
}

interface GoalHabit {
  id: string;
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  targetCount: number;
  currentCount: number;
  streak: number;
  completedDates: Date[];
  reminderTime?: string;
}

interface GoalMilestone {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  completed: boolean;
  completedAt?: Date;
  progress: number;
  rewards: {
    xp: number;
    badge?: string;
  };
}

interface GoalResource {
  id: string;
  title: string;
  type: 'article' | 'video' | 'course' | 'book' | 'tool' | 'person';
  url?: string;
  description: string;
  rating: number;
  tags: string[];
  completed: boolean;
  bookmarked: boolean;
}

interface GoalReflection {
  id: string;
  date: Date;
  prompt: string;
  response: string;
  mood: 'excellent' | 'good' | 'neutral' | 'challenging' | 'difficult';
  insights: string[];
  nextActions: string[];
}

interface GoalConnection {
  id: string;
  type: 'related_goal' | 'skill' | 'life_area' | 'person' | 'resource';
  targetId: string;
  targetName: string;
  strength: 'weak' | 'moderate' | 'strong';
  description: string;
  mutual: boolean;
}

interface GoalTimeline {
  id: string;
  date: Date;
  type: 'created' | 'updated' | 'milestone' | 'reflection' | 'habit_completed';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
}

interface GoalMetric {
  id: string;
  name: string;
  type: 'number' | 'percentage' | 'boolean' | 'time';
  target: number;
  current: number;
  unit: string;
  trend: 'improving' | 'stable' | 'declining';
  history: {
    date: Date;
    value: number;
  }[];
}

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: Date;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  achieved: boolean;
  achievedDate?: Date;
  icon: React.ReactNode;
  rewards: {
    xp: number;
    title: string;
    ability?: string;
  };
}

interface Journey {
  id: string;
  name: string;
  description: string;
  areas: LifeArea[];
  currentArea: string;
  journeyProgress: number;
  totalGoals: number;
  completedGoals: number;
  achievements: Achievement[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  unlockedDate?: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const LIFE_AREAS: LifeArea[] = [
  {
    id: 'career',
    name: 'Career & Professional',
    description: 'Professional growth, skills, and achievements',
    icon: <Briefcase className="w-6 h-6" />,
    color: 'blue',
    currentLevel: 1,
    targetLevel: 10,
    progress: 10,
    goals: [],
    milestones: [
      {
        id: 'first_job',
        title: 'First Professional Role',
        description: 'Land your first career position',
        achieved: false,
        icon: <Trophy className="w-5 h-5" />,
        rewards: { xp: 100, title: 'Career Starter' }
      },
      {
        id: 'promotion',
        title: 'First Promotion',
        description: 'Get promoted to a higher position',
        achieved: false,
        icon: <TrendingUp className="w-5 h-5" />,
        rewards: { xp: 200, title: 'Rising Star', ability: 'Leadership Basics' }
      }
    ],
    isUnlocked: true,
    requiredAreas: []
  },
  {
    id: 'relationships',
    name: 'Relationships & Social',
    description: 'Family, friends, and social connections',
    icon: <Users className="w-6 h-6" />,
    color: 'pink',
    currentLevel: 1,
    targetLevel: 10,
    progress: 10,
    goals: [],
    milestones: [
      {
        id: 'deep_connection',
        title: 'Deep Connection',
        description: 'Form a meaningful, lasting relationship',
        achieved: false,
        icon: <Heart className="w-5 h-5" />,
        rewards: { xp: 150, title: 'Connection Master' }
      }
    ],
    isUnlocked: true,
    requiredAreas: []
  },
  {
    id: 'health',
    name: 'Health & Wellness',
    description: 'Physical and mental well-being',
    icon: <Heart className="w-6 h-6" />,
    color: 'green',
    currentLevel: 1,
    targetLevel: 10,
    progress: 10,
    goals: [],
    milestones: [
      {
        id: 'fitness_goal',
        title: 'Fitness Achievement',
        description: 'Reach your fitness goals',
        achieved: false,
        icon: <Zap className="w-5 h-5" />,
        rewards: { xp: 120, title: 'Health Warrior' }
      }
    ],
    isUnlocked: true,
    requiredAreas: []
  },
  {
    id: 'finance',
    name: 'Financial Freedom',
    description: 'Money management, investments, and wealth',
    icon: <Trophy className="w-6 h-6" />,
    color: 'yellow',
    currentLevel: 1,
    targetLevel: 10,
    progress: 10,
    goals: [],
    milestones: [
      {
        id: 'first_savings',
        title: 'Emergency Fund',
        description: 'Build your first emergency fund',
        achieved: false,
        icon: <Award className="w-5 h-5" />,
        rewards: { xp: 100, title: 'Financial Planner' }
      }
    ],
    isUnlocked: false,
    requiredAreas: ['career']
  },
  {
    id: 'personal_growth',
    name: 'Personal Growth',
    description: 'Learning, skills, and self-improvement',
    icon: <Brain className="w-6 h-6" />,
    color: 'purple',
    currentLevel: 1,
    targetLevel: 10,
    progress: 10,
    goals: [],
    milestones: [
      {
        id: 'skill_mastery',
        title: 'Skill Mastery',
        description: 'Master a new skill completely',
        achieved: false,
        icon: <GraduationCap className="w-5 h-5" />,
        rewards: { xp: 180, title: 'Lifelong Learner', ability: 'Accelerated Learning' }
      }
    ],
    isUnlocked: true,
    requiredAreas: []
  },
  {
    id: 'adventure',
    name: 'Adventure & Travel',
    description: 'Exploration, experiences, and memories',
    icon: <Plane className="w-6 h-6" />,
    color: 'orange',
    currentLevel: 1,
    targetLevel: 10,
    progress: 10,
    goals: [],
    milestones: [
      {
        id: 'first_trip',
        title: 'First Big Adventure',
        description: 'Embark on a memorable journey',
        achieved: false,
        icon: <Globe className="w-5 h-5" />,
        rewards: { xp: 150, title: 'Explorer' }
      }
    ],
    isUnlocked: false,
    requiredAreas: ['finance', 'health']
  }
];

const getColorClasses = (color: string) => {
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    blue: { bg: 'bg-neon-blue/10', text: 'text-neon-blue', border: 'border-neon-blue/30' },
    pink: { bg: 'bg-neon-pink/10', text: 'text-neon-pink', border: 'border-neon-pink/30' },
    green: { bg: 'bg-neon-green/10', text: 'text-neon-green', border: 'border-neon-green/30' },
    yellow: { bg: 'bg-neon-yellow/10', text: 'text-neon-yellow', border: 'border-neon-yellow/30' },
    purple: { bg: 'bg-neon-purple/10', text: 'text-neon-purple', border: 'border-neon-purple/30' },
    orange: { bg: 'bg-neon-orange/10', text: 'text-neon-orange', border: 'border-neon-orange/30' }
  };
  return colorMap[color] || { bg: 'bg-zinc-900', text: 'text-zinc-400', border: 'border-zinc-800' };
};

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'goal_setter',
    title: 'Goal Setter',
    description: 'Set your first life goal',
    icon: <Target className="w-5 h-5" />,
    unlocked: false,
    rarity: 'common'
  },
  {
    id: 'milestone_master',
    title: 'Milestone Master',
    description: 'Complete 5 milestones',
    icon: <Flag className="w-5 h-5" />,
    unlocked: false,
    rarity: 'rare'
  },
  {
    id: 'life_balancer',
    title: 'Life Balancer',
    description: 'Balance all 6 life areas',
    icon: <Sparkles className="w-5 h-5" />,
    unlocked: false,
    rarity: 'epic'
  },
  {
    id: 'journey_complete',
    title: 'Journey Complete',
    description: 'Complete your life journey',
    icon: <Rocket className="w-5 h-5" />,
    unlocked: false,
    rarity: 'legendary'
  }
];

export function LifeMap() {
  const { state, dispatch } = useApp();
  const { user } = state;
  const [journey, setJourney] = useState<Journey>({
    id: 'main_journey',
    name: 'My Life Journey',
    description: 'The path to your ideal life',
    areas: LIFE_AREAS,
    currentArea: 'career',
    journeyProgress: 0,
    totalGoals: 0,
    completedGoals: 0,
    achievements: ACHIEVEMENTS
  });
  const [selectedArea, setSelectedArea] = useState<string>('career');
  const [newGoal, setNewGoal] = useState<Partial<LifeGoal>>({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    status: 'not_started',
    targetDate: new Date(),
    progress: 0,
    rewards: { xp: 50 },
    dependencies: [],
    subtasks: []
  });
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [userLevel, setUserLevel] = useState(1);

  useEffect(() => {
    if (user) {
      const loadLifeMapData = async () => {
        try {
          const appData = await appDataService.getAppData(user!.id);
          const savedJourney = appData?.lifeMap as Journey | undefined;
          
          if (savedJourney) {
            setJourney(savedJourney);
            calculateJourneyProgress(savedJourney);
          } else {
            // Initialize with default goals
            const initializedJourney = await initializeDefaultGoals();
            setJourney(initializedJourney);
            await saveLifeMapData(initializedJourney);
          }
        } catch (error) {
          console.error('Error loading life map data:', error);
        }
      };

      loadLifeMapData();
    }
  }, [user]);

  const initializeDefaultGoals = async () => {
    const defaultGoals: LifeGoal[] = [
      {
        id: 'career_start',
        title: 'Get First Job',
        description: 'Land your first professional position in your field',
        category: 'career',
        priority: 'high',
        status: 'not_started',
        targetDate: new Date('2025-06-01'),
        progress: 0,
        rewards: { xp: 100, achievement: 'Career Starter' },
        dependencies: [],
        subtasks: [
          { id: 'resume', title: 'Update Resume', completed: false },
          { id: 'apply', title: 'Apply to 10 companies', completed: false },
          { id: 'interview', title: 'Complete 3 interviews', completed: false }
        ]
      },
      {
        id: 'health_fitness',
        title: 'Improve Physical Fitness',
        description: 'Reach a healthy weight and fitness level',
        category: 'health',
        priority: 'medium',
        status: 'not_started',
        targetDate: new Date('2025-12-31'),
        progress: 0,
        rewards: { xp: 80, achievement: 'Health Warrior' },
        dependencies: [],
        subtasks: [
          { id: 'exercise', title: 'Exercise 3x per week', completed: false },
          { id: 'diet', title: 'Eat healthy meals', completed: false },
          { id: 'sleep', title: 'Get 8 hours sleep', completed: false }
        ]
      },
      {
        id: 'learning_skill',
        title: 'Learn New Skill',
        description: 'Master a valuable new skill',
        category: 'personal_growth',
        priority: 'medium',
        status: 'not_started',
        targetDate: new Date('2025-09-01'),
        progress: 0,
        rewards: { xp: 120, achievement: 'Skill Master' },
        dependencies: [],
        subtasks: [
          { id: 'research', title: 'Research skill options', completed: false },
          { id: 'course', title: 'Enroll in course', completed: false },
          { id: 'practice', title: 'Practice daily', completed: false }
        ]
      }
    ];

    const updatedAreas = LIFE_AREAS.map(area => {
      const areaGoals = defaultGoals.filter(goal => goal.category === area.id);
      return { ...area, goals: areaGoals };
    });

    return {
      ...journey,
      areas: updatedAreas,
      totalGoals: defaultGoals.length,
      completedGoals: 0
    };
  };

  const saveLifeMapData = async (updatedJourney: Journey) => {
    try {
      await appDataService.updateAppDataField(user!.id, 'lifeMap' as any, updatedJourney);
      setJourney(updatedJourney);
    } catch (error) {
      console.error('Error saving life map data:', error);
    }
  };

  const calculateJourneyProgress = (journeyData: Journey) => {
    const totalGoals = journeyData.areas.reduce((sum, area) => sum + area.goals.length, 0);
    const completedGoals = journeyData.areas.reduce((sum, area) => 
      sum + area.goals.filter(goal => goal.status === 'completed').length, 0
    );
    
    const progress = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;
    
    // Update user level based on completed goals
    const newLevel = Math.max(1, Math.floor(completedGoals / 2) + 1);
    setUserLevel(newLevel);
    
    return { totalGoals, completedGoals, progress };
  };

  const addGoal = async () => {
    if (!newGoal.title || !selectedArea) return;

    const goal: LifeGoal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description || '',
      category: selectedArea,
      priority: newGoal.priority || 'medium',
      status: 'not_started',
      targetDate: newGoal.targetDate || new Date(),
      progress: 0,
      rewards: newGoal.rewards || { xp: 50 },
      dependencies: newGoal.dependencies || [],
      subtasks: newGoal.subtasks || []
    };

    const updatedJourney = {
      ...journey,
      areas: journey.areas.map(area => {
        if (area.id === selectedArea) {
          return { ...area, goals: [...area.goals, goal] };
        }
        return area;
      })
    };

    const { totalGoals, completedGoals, progress } = calculateJourneyProgress(updatedJourney);
    updatedJourney.totalGoals = totalGoals;
    updatedJourney.completedGoals = completedGoals;
    updatedJourney.journeyProgress = progress;

    await saveLifeMapData(updatedJourney);

    // Award XP for setting a goal
    dispatch({ type: 'ADD_XP', payload: { amount: 10, source: 'Life Goal Set' } });
    
    dispatch({ type: 'ADD_NOTIFICATION', payload: {
      id: Date.now().toString(),
      type: 'achievement',
      title: 'New Life Goal!',
      message: `Added "${goal.title}" to your life map (+10 XP)`,
      timestamp: new Date(),
      read: false,
      priority: 'low'
    }});

    setNewGoal({
      title: '',
      description: '',
      category: '',
      priority: 'medium',
      status: 'not_started',
      targetDate: new Date(),
      progress: 0,
      rewards: { xp: 50 },
      dependencies: [],
      subtasks: []
    });
    setShowGoalForm(false);
  };

  const updateGoalProgress = async (areaId: string, goalId: string, newProgress: number) => {
    const updatedJourney = {
      ...journey,
      areas: journey.areas.map(area => {
        if (area.id === areaId) {
          return {
            ...area,
            goals: area.goals.map(goal => {
              if (goal.id === goalId) {
                const updatedGoal = { ...goal, progress: newProgress };
                
                // Check if goal is completed
                if (newProgress >= 100 && goal.status !== 'completed') {
                  updatedGoal.status = 'completed';
                  
                  // Award rewards
                  dispatch({ type: 'ADD_XP', payload: { 
                    amount: goal.rewards.xp, 
                    source: `Life Goal Completed: ${goal.title}` 
                  }});
                  
                  dispatch({ type: 'ADD_NOTIFICATION', payload: {
                    id: Date.now().toString(),
                    type: 'achievement',
                    title: 'Life Goal Achieved!',
                    message: `Completed "${goal.title}" (+${goal.rewards.xp} XP)`,
                    timestamp: new Date(),
                    read: false,
                    priority: 'high'
                  }});
                } else if (newProgress > 0 && newProgress < 100 && goal.status === 'not_started') {
                  updatedGoal.status = 'in_progress';
                }
                
                return updatedGoal;
              }
              return goal;
            })
          };
        }
        return area;
      })
    };

    const { totalGoals, completedGoals, progress } = calculateJourneyProgress(updatedJourney);
    updatedJourney.totalGoals = totalGoals;
    updatedJourney.completedGoals = completedGoals;
    updatedJourney.journeyProgress = progress;

    await saveLifeMapData(updatedJourney);
  };

  const toggleSubtask = async (areaId: string, goalId: string, subtaskId: string) => {
    const updatedJourney = {
      ...journey,
      areas: journey.areas.map(area => {
        if (area.id === areaId) {
          return {
            ...area,
            goals: area.goals.map(goal => {
              if (goal.id === goalId) {
                const updatedSubtasks = goal.subtasks.map(subtask =>
                  subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
                );
                
                const completedSubtasks = updatedSubtasks.filter(st => st.completed).length;
                const newProgress = (completedSubtasks / updatedSubtasks.length) * 100;
                
                return { ...goal, subtasks: updatedSubtasks, progress: newProgress };
              }
              return goal;
            })
          };
        }
        return area;
      })
    };

    await saveLifeMapData(updatedJourney);
  };

  const currentArea = journey.areas.find(area => area.id === selectedArea);
  const areaStats = useMemo(() => {
    return journey.areas.map(area => ({
      id: area.id,
      name: area.name,
      progress: area.goals.length > 0 
        ? (area.goals.filter(g => g.status === 'completed').length / area.goals.length) * 100
        : 0,
      goalsCount: area.goals.length,
      completedCount: area.goals.filter(g => g.status === 'completed').length
    }));
  }, [journey.areas]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold font-cyber text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">Life Map</h2>
        <div className="flex gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-neon-purple">Level {userLevel}</div>
            <div className="text-sm text-zinc-400">Life Level</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-neon-green">{journey.completedGoals}</div>
            <div className="text-sm text-zinc-400">Goals Completed</div>
          </div>
        </div>
      </div>

      {/* Journey Progress */}
      <Card variant="neon">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="w-6 h-6 text-neon-blue" />
            {journey.name}
          </CardTitle>
          <p className="text-zinc-400">{journey.description}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-300">Journey Progress</span>
              <span className="text-neon-blue font-mono">{Math.round(journey.journeyProgress)}%</span>
            </div>
            <Progress value={journey.journeyProgress} className="h-3 bg-black/50" />
            <div className="text-sm text-zinc-500">
              {journey.completedGoals} of {journey.totalGoals} goals completed
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Extreme Gamification Components */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Life Mastery Progress */}
        <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-neon-purple">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-neon-purple">
              <Crown className="w-5 h-5" />
              Life Mastery
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-zinc-300">Mastery Level</span>
                <span className="text-lg font-bold text-neon-purple">Master {userLevel}</span>
              </div>
              <div className="h-3 bg-black border border-neon-purple/30 rounded-full">
                <div 
                  className="h-full bg-gradient-to-r from-neon-purple to-neon-pink rounded-full transition-all duration-500 shadow-[0_0_10px_var(--neon-purple)]"
                  style={{ width: `${(userLevel / 100) * 100}%` }}
                />
              </div>
              <div className="text-xs text-zinc-400">
                {journey.completedGoals} goals mastered • {Math.round(journey.journeyProgress)}% life complete
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Flame className="w-3 h-3 text-neon-orange" />
                <span className="text-neon-orange">30 day mastery streak</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievement Hunter */}
        <Card className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border border-neon-yellow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-neon-yellow">
              <Trophy className="w-5 h-5" />
              Achievement Hunter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-zinc-300">Achievements</span>
                <span className="text-lg font-bold text-neon-yellow">{journey.completedGoals * 3}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="text-center p-2 bg-neon-yellow/10 border border-neon-yellow/30 rounded">
                    <Medal className="w-6 h-6 mx-auto text-neon-yellow mb-1" />
                    <div className="text-xs text-neon-yellow">Tier {i}</div>
                  </div>
                ))}
              </div>
              <div className="text-xs text-zinc-400">
                Next achievement: Complete 5 more goals
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Life Quest System */}
        <Card className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-neon-blue">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-neon-blue">
              <Target className="w-5 h-5" />
              Daily Quests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-neon-blue/10 border border-neon-blue/30 rounded">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-neon-green" />
                    <span className="text-sm text-zinc-200">Complete 1 goal</span>
                  </div>
                  <span className="text-xs text-neon-green">+50 XP</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-black/40 border border-zinc-800 rounded">
                  <div className="flex items-center gap-2">
                    <Circle className="w-4 h-4 text-zinc-500" />
                    <span className="text-sm text-zinc-400">Progress 3 areas</span>
                  </div>
                  <span className="text-xs text-neon-blue">+100 XP</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-black/40 border border-zinc-800 rounded">
                  <div className="flex items-center gap-2">
                    <Circle className="w-4 h-4 text-zinc-500" />
                    <span className="text-sm text-zinc-400">Master new skill</span>
                  </div>
                  <span className="text-xs text-neon-purple">+200 XP</span>
                </div>
              </div>
              <div className="text-xs text-zinc-500">
                1/3 quests completed • Reset in 8h 23m
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Life Streak Guardian */}
        <Card className="bg-gradient-to-br from-red-900/20 to-orange-900/20 border border-neon-red">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-neon-red">
              <AlertTriangle className="w-5 h-5" />
              Streak Guardian
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-300">Life Streak</span>
                <span className="text-lg font-bold text-neon-red">47 days</span>
              </div>
              <div className="p-3 bg-neon-red/10 border border-neon-red/30 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <Timer className="w-4 h-4 text-neon-red" />
                  <span className="text-sm font-medium text-neon-red">STREAK AT RISK!</span>
                </div>
                <div className="text-xs text-zinc-300">
                  Complete a goal in 4h 32m to keep your streak alive
                </div>
                <Button className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white text-xs border-none">
                  PROTECT STREAK (200 XP)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Life Rewards Vault */}
        <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-neon-green">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-neon-green">
              <Gift className="w-5 h-5" />
              Rewards Vault
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-zinc-300">Life Coins</span>
                <span className="text-lg font-bold text-neon-green">{journey.completedGoals * 100}</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-neon-green/10 border border-neon-green/30 rounded">
                  <div className="flex items-center gap-2">
                    <Gem className="w-4 h-4 text-neon-green" />
                    <span className="text-sm text-zinc-200">Mystery Box</span>
                  </div>
                  <Button size="sm" className="text-xs bg-neon-green/20 hover:bg-neon-green/40 text-neon-green border-neon-green">500</Button>
                </div>
                <div className="flex items-center justify-between p-2 bg-black/40 border border-zinc-800 rounded">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-zinc-500" />
                    <span className="text-sm text-zinc-400">Life Shield</span>
                  </div>
                  <Button size="sm" variant="ghost" className="text-xs text-zinc-500" disabled>1000</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Life Leaderboard */}
        <Card className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-400">
              <Users className="w-5 h-5" />
              Life Leaders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="space-y-2">
                {[
                  { rank: 1, name: "LifeMaster", score: 15420, trend: "up" },
                  { rank: 2, name: "GoalCrusher", score: 14850, trend: "down" },
                  { rank: 3, name: "You", score: 13200, trend: "up", isUser: true },
                  { rank: 4, name: "Achiever", score: 12900, trend: "same" }
                ].map(leader => (
                  <div key={leader.rank} className={`flex items-center justify-between p-2 rounded ${leader.isUser ? 'bg-indigo-500/20 border border-indigo-500/40' : 'bg-black/40 border border-zinc-800'}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-indigo-400">#{leader.rank}</span>
                      <span className={`text-sm ${leader.isUser ? 'text-indigo-300' : 'text-zinc-400'}`}>{leader.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500">{leader.score}</span>
                      {leader.trend === "up" && <TrendingUp className="w-3 h-3 text-neon-green" />}
                      {leader.trend === "down" && <TrendingDown className="w-3 h-3 text-neon-red" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Life Areas Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {areaStats.map(stat => {
          const area = journey.areas.find(a => a.id === stat.id);
          if (!area) return null;
          
          return (
            <Card 
              key={stat.id} 
              variant="neon"
              className={`cursor-pointer transition-all ${selectedArea === stat.id ? 'ring-2 ring-neon-blue shadow-[0_0_15px_var(--neon-blue)]' : ''} ${area.isUnlocked ? 'hover:shadow-[0_0_15px_rgba(0,243,255,0.3)]' : 'opacity-50'}`}
              onClick={() => area.isUnlocked && setSelectedArea(stat.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${getColorClasses(area.color).bg} ${getColorClasses(area.color).text} border ${getColorClasses(area.color).border}`}>
                    {area.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-zinc-200">{area.name}</h3>
                    <div className="text-sm text-zinc-500">Level {area.currentLevel}</div>
                  </div>
                  {!area.isUnlocked && <Lock className="w-4 h-4 text-zinc-600" />}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Progress</span>
                    <span className="text-neon-blue">{Math.round(stat.progress)}%</span>
                  </div>
                  <Progress value={stat.progress} className="h-2 bg-black/50" />
                  <div className="text-xs text-zinc-600">
                    {stat.completedCount}/{stat.goalsCount} goals
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected Area Details */}
      {currentArea && (
        <Card variant="neon">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-neon-blue">
                {currentArea.icon}
                {currentArea.name}
              </CardTitle>
              <Button onClick={() => setShowGoalForm(!showGoalForm)} variant="neon" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Goal
              </Button>
            </div>
            <p className="text-zinc-400">{currentArea.description}</p>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-3 border border-zinc-800 bg-black/40 rounded-lg">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-zinc-400">Goal Progress Distribution</span>
                <span className="text-zinc-500">{currentArea.goals.length} goals</span>
              </div>
              <div style={{ height: 80 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={currentArea.goals.map((g, i) => ({ name: i + 1, progress: Math.round(g.progress) }))}>
                    <XAxis dataKey="name" hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#000', borderColor: '#333', color: '#fff' }}
                      itemStyle={{ color: '#00f3ff' }}
                    />
                    <Bar dataKey="progress" fill="#00f3ff" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Add Goal Form */}
            {showGoalForm && (
              <div className="mb-6 p-4 border border-neon-blue/30 bg-neon-blue/5 rounded-lg space-y-4">
                <h3 className="font-semibold text-neon-blue font-mono">Add New Goal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Goal title..."
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    className="bg-black/50 border-white/10 text-white focus:border-neon-blue rounded-md"
                  />
                  <select
                    className="px-3 py-2 border border-white/10 bg-black/50 text-white rounded-md w-full focus:outline-none focus:border-neon-blue"
                    value={newGoal.priority}
                    onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value as any })}
                  >
                    <option value="low" className="bg-black">Low Priority</option>
                    <option value="medium" className="bg-black">Medium Priority</option>
                    <option value="high" className="bg-black">High Priority</option>
                    <option value="critical" className="bg-black">Critical</option>
                  </select>
                </div>
                <Textarea
                  placeholder="Goal description..."
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  rows={3}
                  className="bg-black/50 border-white/10 text-white focus:border-neon-blue rounded-md"
                />
                <div className="flex gap-2">
                  <Button onClick={addGoal} disabled={!newGoal.title} variant="neon" className="font-mono">
                    ADD GOAL
                  </Button>
                  <Button variant="outline" onClick={() => setShowGoalForm(false)} className="font-mono">
                    CANCEL
                  </Button>
                </div>
              </div>
            )}

            {/* Goals List */}
            <div className="space-y-4">
              {currentArea.goals.map(goal => (
                <Card key={goal.id} variant="neon" className={`border-l-4 ${
                  goal.status === 'completed' ? 'border-l-neon-green border-white/10' :
                  goal.status === 'in_progress' ? 'border-l-neon-blue border-white/10' :
                  goal.priority === 'critical' ? 'border-l-neon-red border-white/10' :
                  goal.priority === 'high' ? 'border-l-neon-orange border-white/10' :
                  goal.priority === 'medium' ? 'border-l-neon-yellow border-white/10' :
                  'border-l-zinc-500 border-white/10'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-zinc-200">{goal.title}</h4>
                        <p className="text-sm text-zinc-400 mb-2">{goal.description}</p>
                        <div className="flex gap-2 mb-2">
                          <Badge variant={
                            goal.status === 'completed' ? 'default' :
                            goal.status === 'in_progress' ? 'secondary' :
                            'outline'
                          } className={goal.status === 'completed' ? 'bg-neon-green text-black' : goal.status === 'in_progress' ? 'bg-neon-blue text-black' : 'border-zinc-600 text-zinc-400'}>
                            {goal.status.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline" className="border-zinc-600 text-zinc-400">{goal.priority}</Badge>
                          <Badge variant="outline" className="border-neon-purple text-neon-purple">+{goal.rewards.xp} XP</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-zinc-500">
                          Target: {goal.targetDate.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-500">Progress</span>
                        <span className="text-neon-blue">{Math.round(goal.progress)}%</span>
                      </div>
                      <Progress value={goal.progress} className="h-2 bg-black/50" />
                      
                      {/* Subtasks */}
                      {goal.subtasks.length > 0 && (
                        <div className="mt-3 space-y-1">
                          {goal.subtasks.map(subtask => (
                            <div key={subtask.id} className="flex items-center gap-2 text-sm">
                              <button
                                onClick={() => toggleSubtask(currentArea.id, goal.id, subtask.id)}
                                className="flex-shrink-0"
                              >
                                {subtask.completed ? (
                                  <CheckCircle className="w-4 h-4 text-neon-green" />
                                ) : (
                                  <Circle className="w-4 h-4 text-zinc-600" />
                                )}
                              </button>
                              <span className={subtask.completed ? 'line-through text-zinc-600' : 'text-zinc-300'}>
                                {subtask.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {currentArea.goals.length === 0 && (
                <div className="text-center py-8 text-zinc-600">
                  <Target className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>No goals yet. Add your first goal to get started!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
