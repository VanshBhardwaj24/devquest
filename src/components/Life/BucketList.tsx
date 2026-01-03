import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { CheckCircle, Circle, Plus, Trash2, Edit2, Save, X, MapPin, Calendar, Star, Trophy, Flame, Timer, Crown, Shield, Gem, Coins, Gift, Bell, TrendingUp, TrendingDown, Users, Clock, Award, Medal, Heart, Zap, Target, AlertTriangle, Rocket, Lock } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../hooks/useAuth';
import { appDataService } from '../../services/appDataService';

interface BucketItem {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  createdAt: Date;
  targetDate?: Date;
  location?: string;
  estimatedCost?: number;
}

const CATEGORIES = [
  'Adventure', 'Travel', 'Career', 'Personal Growth', 'Health & Fitness',
  'Relationships', 'Creative', 'Financial', 'Learning', 'Experience'
];

const PRIORITY_COLORS = {
  low: 'bg-neon-green/10 text-neon-green border-neon-green/30',
  medium: 'bg-neon-yellow/10 text-neon-yellow border-neon-yellow/30',
  high: 'bg-neon-pink/10 text-neon-pink border-neon-pink/30'
};

export function BucketList() {
  const { state, dispatch } = useApp();
  const { user: authUser } = useAuth();
  const [items, setItems] = useState<BucketItem[]>([]);
  const [newItem, setNewItem] = useState<Partial<BucketItem>>({
    title: '',
    description: '',
    category: 'Personal Growth',
    priority: 'medium',
    completed: false
  });
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'date' | 'category'>('priority');

  useEffect(() => {
    if (authUser) {
      loadBucketList();
    }
  }, [authUser]);

  const loadBucketList = async () => {
    try {
      const appData = await appDataService.getAppData(authUser!.id);
      const existingItems = (appData?.bucketList || []).map((i: any) => ({
        ...i,
        createdAt: i.createdAt ? new Date(i.createdAt) : new Date(),
        targetDate: i.targetDate ? new Date(i.targetDate) : undefined,
      }));
      
      // If no items exist, add some default bucket list items
      if (existingItems.length === 0) {
        const defaultItems: BucketItem[] = [
          {
            id: '1',
            title: 'Visit the Great Wall of China',
            description: 'Walk along one of the wonders of the world and experience ancient Chinese history',
            category: 'Travel',
            priority: 'high',
            completed: false,
            createdAt: new Date(),
            targetDate: new Date('2025-12-31'),
            location: 'Beijing, China',
            estimatedCost: 3000
          },
          {
            id: '2',
            title: 'Learn to Play Piano',
            description: 'Master classical piano pieces and be able to play my favorite songs',
            category: 'Personal Growth',
            priority: 'medium',
            completed: false,
            createdAt: new Date(),
            estimatedCost: 500
          },
          {
            id: '3',
            title: 'Run a Marathon',
            description: 'Complete a full 26.2 mile marathon and achieve peak physical fitness',
            category: 'Health & Fitness',
            priority: 'high',
            completed: false,
            createdAt: new Date(),
            targetDate: new Date('2025-06-01'),
            estimatedCost: 200
          },
          {
            id: '4',
            title: 'Write a Novel',
            description: 'Complete and publish a full-length fiction novel',
            category: 'Creative',
            priority: 'medium',
            completed: false,
            createdAt: new Date(),
            estimatedCost: 1000
          },
          {
            id: '5',
            title: 'Start a Tech Company',
            description: 'Build a successful startup that solves real-world problems',
            category: 'Career',
            priority: 'high',
            completed: false,
            createdAt: new Date(),
            estimatedCost: 50000
          },
          {
            id: '6',
            title: 'Scuba Dive in the Great Barrier Reef',
            description: 'Explore the underwater world and see marine life up close',
            category: 'Adventure',
            priority: 'high',
            completed: false,
            createdAt: new Date(),
            targetDate: new Date('2026-08-15'),
            location: 'Australia',
            estimatedCost: 4000
          },
          {
            id: '7',
            title: 'Learn a New Language Fluently',
            description: 'Become conversational in Spanish and connect with millions of new people',
            category: 'Learning',
            priority: 'medium',
            completed: false,
            createdAt: new Date(),
            estimatedCost: 300
          },
          {
            id: '8',
            title: 'Go on a Road Trip Across the USA',
            description: 'Drive from coast to coast and see all the national parks',
            category: 'Travel',
            priority: 'medium',
            completed: false,
            createdAt: new Date(),
            targetDate: new Date('2025-07-01'),
            estimatedCost: 2500
          }
        ];
        
        const serializable = defaultItems.map(i => ({
          ...i,
          createdAt: i.createdAt.toISOString(),
          targetDate: i.targetDate ? i.targetDate.toISOString() : undefined,
        }));
        await appDataService.updateAppDataField(authUser!.id, 'bucketList', serializable);
        setItems(defaultItems);
      } else {
        setItems(existingItems);
      }
    } catch (error) {
      console.error('Error loading bucket list:', error);
    }
  };

  const saveBucketList = async (updatedItems: BucketItem[]) => {
    try {
      const serializable = updatedItems.map(i => ({
        ...i,
        createdAt: i.createdAt instanceof Date ? i.createdAt.toISOString() : i.createdAt,
        targetDate: i.targetDate instanceof Date ? i.targetDate.toISOString() : i.targetDate,
      }));
      await appDataService.updateAppDataField(authUser!.id, 'bucketList', serializable);
      setItems(updatedItems);
    } catch (error) {
      console.error('Error saving bucket list:', error);
    }
  };

  const addItem = async () => {
    if (!newItem.title?.trim()) return;

    const item: BucketItem = {
      id: Date.now().toString(),
      title: newItem.title,
      description: newItem.description || '',
      category: newItem.category || 'Personal Growth',
      priority: newItem.priority || 'medium',
      completed: false,
      createdAt: new Date(),
      targetDate: newItem.targetDate,
      location: newItem.location,
      estimatedCost: newItem.estimatedCost
    };

    const updatedItems = [...items, item];
    await saveBucketList(updatedItems);

    // Award XP for adding a bucket list item
    dispatch({ type: 'ADD_XP', payload: { amount: 5, source: 'Bucket List Item Added' } });
    dispatch({ type: 'ADD_NOTIFICATION', payload: {
      id: Date.now().toString(),
      type: 'achievement',
      title: 'Dream Added!',
      message: `Added "${item.title}" to your bucket list (+5 XP)`,
      timestamp: new Date(),
      read: false,
      priority: 'low'
    }});

    setNewItem({
      title: '',
      description: '',
      category: 'Personal Growth',
      priority: 'medium',
      completed: false
    });
  };

  const updateItem = async (id: string, updates: Partial<BucketItem>) => {
    const updatedItems = items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    );
    await saveBucketList(updatedItems);
  };

  const deleteItem = async (id: string) => {
    const updatedItems = items.filter(item => item.id !== id);
    await saveBucketList(updatedItems);
  };

  const toggleComplete = async (item: BucketItem) => {
    const updatedItem = { ...item, completed: !item.completed };
    await updateItem(item.id, updatedItem);

    if (!item.completed) {
      // Award XP for completing a bucket list item
      const xpReward = item.priority === 'high' ? 50 : item.priority === 'medium' ? 30 : 20;
      dispatch({ type: 'ADD_XP', payload: { amount: xpReward, source: 'Bucket List Item Completed' } });
      dispatch({ type: 'ADD_NOTIFICATION', payload: {
        id: Date.now().toString(),
        type: 'achievement',
        title: 'Dream Achieved!',
        message: `Completed "${item.title}" (+${xpReward} XP)`,
        timestamp: new Date(),
        read: false,
        priority: 'high'
      }});
    }
  };

  const filteredAndSortedItems = items
    .filter(item => {
      if (filter === 'active') return !item.completed;
      if (filter === 'completed') return item.completed;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      if (sortBy === 'date') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'category') {
        return a.category.localeCompare(b.category);
      }
      return 0;
    });

  const stats = {
    total: items.length,
    completed: items.filter(item => item.completed).length,
    active: items.filter(item => !item.completed).length,
    completionRate: items.length > 0 ? Math.round((items.filter(item => item.completed).length / items.length) * 100) : 0
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">My Bucket List</h2>
        <div className="flex gap-2">
          <Badge variant="outline" className="px-3 py-1">
            {stats.completed}/{stats.total} Complete
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            {stats.completionRate}% Done
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="neon">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-neon-blue font-mono">{stats.total}</div>
            <div className="text-sm text-gray-400 font-cyber">Total Dreams</div>
          </CardContent>
        </Card>
        <Card variant="neon">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-neon-green font-mono">{stats.completed}</div>
            <div className="text-sm text-gray-400 font-cyber">Completed</div>
          </CardContent>
        </Card>
        <Card variant="neon">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-neon-orange font-mono">{stats.active}</div>
            <div className="text-sm text-gray-400 font-cyber">In Progress</div>
          </CardContent>
        </Card>
        <Card variant="neon">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-neon-purple font-mono">{stats.completionRate}%</div>
            <div className="text-sm text-gray-400 font-cyber">Completion Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Extreme Gamification Components */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Dream Hunter Progress */}
        <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-2 border-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-400">
              <Crown className="w-5 h-5" />
              Dream Hunter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Hunter Level</span>
                <span className="text-lg font-bold text-purple-400">Level {Math.floor(stats.completed / 5) + 1}</span>
              </div>
              <div className="h-3 bg-black border-2 border-purple-500/30 rounded-full">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                  style={{ width: `${(stats.completed % 5) * 20}%` }}
                />
              </div>
              <div className="text-xs text-gray-400">
                {stats.completed} dreams conquered • {stats.completionRate}% life complete
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Flame className="w-3 h-3 text-orange-400" />
                <span className="text-orange-400">{stats.completed * 7} day dream streak</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievement Vault */}
        <Card className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-2 border-yellow-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-400">
              <Trophy className="w-5 h-5" />
              Achievement Vault
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Achievements</span>
                <span className="text-lg font-bold text-yellow-400">{stats.completed * 2}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="text-center p-2 bg-yellow-500/20 border border-yellow-500/50 rounded">
                    <Medal className="w-6 h-6 mx-auto text-yellow-400 mb-1" />
                    <div className="text-xs text-yellow-400">Tier {i}</div>
                  </div>
                ))}
              </div>
              <div className="text-xs text-gray-400">
                Next achievement: Complete 3 more dreams
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dream Quest System */}
        <Card className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-2 border-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-400">
              <Target className="w-5 h-5" />
              Dream Quests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-blue-500/20 border border-blue-500/50 rounded">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm">Add 1 dream</span>
                  </div>
                  <span className="text-xs text-green-400">+30 XP</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-700/50 border border-gray-600/50 rounded">
                  <div className="flex items-center gap-2">
                    <Circle className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">Complete 2 dreams</span>
                  </div>
                  <span className="text-xs text-blue-400">+75 XP</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-700/50 border border-gray-600/50 rounded">
                  <div className="flex items-center gap-2">
                    <Circle className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">Plan adventure</span>
                  </div>
                  <span className="text-xs text-purple-400">+150 XP</span>
                </div>
              </div>
              <div className="text-xs text-gray-400">
                1/3 quests completed • Reset in 6h 45m
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dream Streak Guardian */}
        <Card className="bg-gradient-to-br from-red-900/20 to-orange-900/20 border-2 border-red-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              Dream Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Dream Streak</span>
                <span className="text-lg font-bold text-red-400">{stats.completed * 12} days</span>
              </div>
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <Timer className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-medium text-red-400">STREAK AT RISK!</span>
                </div>
                <div className="text-xs text-gray-300">
                  Complete a dream in 2h 15m to keep your streak alive
                </div>
                <Button className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white text-xs">
                  PROTECT STREAK (150 XP)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dream Rewards Vault */}
        <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-2 border-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-400">
              <Gift className="w-5 h-5" />
              Dream Rewards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Dream Coins</span>
                <span className="text-lg font-bold text-green-400">{stats.completed * 250}</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-green-500/20 border border-green-500/50 rounded">
                  <div className="flex items-center gap-2">
                    <Gem className="w-4 h-4 text-green-400" />
                    <span className="text-sm">Mystery Dream</span>
                  </div>
                  <Button className="text-xs bg-green-600 hover:bg-green-700">750</Button>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-700/50 border border-gray-600/50 rounded">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">Dream Shield</span>
                  </div>
                  <Button className="text-xs bg-gray-600 hover:bg-gray-700" disabled>1500</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dream Leaderboard */}
        <Card className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-2 border-indigo-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-400">
              <Users className="w-5 h-5" />
              Dream Leaders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="space-y-2">
                {[
                  { rank: 1, name: "DreamMaster", score: 18420, trend: "up" },
                  { rank: 2, name: "BucketCrusher", score: 16850, trend: "down" },
                  { rank: 3, name: "You", score: 15200, trend: "up", isUser: true },
                  { rank: 4, name: "Achiever", score: 14900, trend: "same" }
                ].map(leader => (
                  <div key={leader.rank} className={`flex items-center justify-between p-2 rounded ${leader.isUser ? 'bg-indigo-500/30 border border-indigo-500/50' : 'bg-gray-700/50'}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-indigo-400">#{leader.rank}</span>
                      <span className={`text-sm ${leader.isUser ? 'text-indigo-300' : 'text-gray-300'}`}>{leader.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{leader.score}</span>
                      {leader.trend === "up" && <TrendingUp className="w-3 h-3 text-green-400" />}
                      {leader.trend === "down" && <TrendingDown className="w-3 h-3 text-red-400" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add New Item */}
      <Card variant="neon">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-neon-blue">
            <Plus className="w-5 h-5" />
            Add New Dream
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Dream title..."
              value={newItem.title || ''}
              onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
              className="bg-black/50 border-white/10 text-white placeholder:text-gray-500"
            />
            <select
              className="px-3 py-2 bg-black/50 border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-neon-blue text-white"
              value={newItem.category || 'Personal Growth'}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat} className="bg-black text-white">{cat}</option>
              ))}
            </select>
          </div>
          <Textarea
            placeholder="Describe your dream..."
            value={newItem.description || ''}
            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            rows={3}
            className="bg-black/50 border-white/10 text-white placeholder:text-gray-500"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Target date (optional)"
              type="date"
              value={newItem.targetDate ? new Date(newItem.targetDate).toISOString().split('T')[0] : ''}
              onChange={(e) => setNewItem({ ...newItem, targetDate: e.target.value ? new Date(e.target.value) : undefined })}
              className="bg-black/50 border-white/10 text-white"
            />
            <Input
              placeholder="Location (optional)"
              value={newItem.location || ''}
              onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
              className="bg-black/50 border-white/10 text-white placeholder:text-gray-500"
            />
            <Input
              placeholder="Estimated cost (optional)"
              type="number"
              value={newItem.estimatedCost || ''}
              onChange={(e) => setNewItem({ ...newItem, estimatedCost: e.target.value ? parseFloat(e.target.value) : undefined })}
              className="bg-black/50 border-white/10 text-white placeholder:text-gray-500"
            />
          </div>
          <div className="flex items-center gap-4">
            <select
              className="px-3 py-2 bg-black/50 border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-neon-blue text-white"
              value={newItem.priority || 'medium'}
              onChange={(e) => setNewItem({ ...newItem, priority: e.target.value as 'low' | 'medium' | 'high' })}
            >
              <option value="low" className="bg-black text-white">Low Priority</option>
              <option value="medium" className="bg-black text-white">Medium Priority</option>
              <option value="high" className="bg-black text-white">High Priority</option>
            </select>
            <Button onClick={addItem} disabled={!newItem.title?.trim()} variant="neon" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Dream
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Sort */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All ({stats.total})
          </Button>
          <Button
            variant={filter === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('active')}
          >
            Active ({stats.active})
          </Button>
          <Button
            variant={filter === 'completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('completed')}
          >
            Completed ({stats.completed})
          </Button>
        </div>
        <select
          className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'priority' | 'date' | 'category')}
        >
          <option value="priority">Sort by Priority</option>
          <option value="date">Sort by Date</option>
          <option value="category">Sort by Category</option>
        </select>
      </div>

      {/* Bucket List Items */}
      <div className="space-y-4">
        {filteredAndSortedItems.map(item => (
          <Card key={item.id} variant="neon" className={`transition-all ${item.completed ? 'opacity-75 border-green-500/30' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleComplete(item)}
                  className="mt-1 flex-shrink-0"
                >
                  {item.completed ? (
                    <CheckCircle className="w-6 h-6 text-neon-green" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-500 hover:text-neon-blue transition-colors" />
                  )}
                </button>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className={`text-lg font-bold font-cyber ${item.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-gray-400 mt-1 font-mono text-sm">{item.description}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant="outline" className="text-xs border-white/10 text-gray-400 font-mono">
                          {item.category}
                        </Badge>
                        <Badge className={`text-xs font-mono ${PRIORITY_COLORS[item.priority]}`}>
                          {item.priority} priority
                        </Badge>
                        {item.targetDate && (
                          <Badge variant="outline" className="text-xs flex items-center gap-1 border-white/10 text-gray-400 font-mono">
                            <Calendar className="w-3 h-3" />
                            {new Date(item.targetDate).toLocaleDateString()}
                          </Badge>
                        )}
                        {item.location && (
                          <Badge variant="outline" className="text-xs flex items-center gap-1 border-white/10 text-gray-400 font-mono">
                            <MapPin className="w-3 h-3" />
                            {item.location}
                          </Badge>
                        )}
                        {item.estimatedCost && (
                          <Badge variant="outline" className="text-xs border-white/10 text-gray-400 font-mono">
                            ${item.estimatedCost}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteItem(item.id)}
                        className="text-red-500 hover:text-red-400 hover:bg-red-950/30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredAndSortedItems.length === 0 && (
          <Card variant="neon" className="border-dashed border-gray-800">
            <CardContent className="p-8 text-center">
              <Star className="w-12 h-12 text-gray-700 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-500 mb-2 font-cyber">
                {filter === 'completed' ? 'NO COMPLETED DREAMS DETECTED' : 
                 filter === 'active' ? 'NO ACTIVE DREAMS DETECTED' : 
                 'DATABASE EMPTY'}
              </h3>
              <p className="text-gray-600 font-mono text-sm">
                {filter === 'all' ? 'INITIATE DREAM SEQUENCE. ADD GOALS TO DATABASE.' : 
                 'ADJUST FILTERS TO VIEW DATA.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
