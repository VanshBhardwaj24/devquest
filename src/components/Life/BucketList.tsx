import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { CheckCircle, Circle, Plus, Trash2, Edit2, Save, X, MapPin, Calendar, Star } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
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
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800'
};

export function BucketList() {
  const { state, dispatch } = useApp();
  const { authUser } = state;
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
      const existingItems = appData?.bucketList || [];
      
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
        
        await appDataService.updateAppDataField(authUser!.id, 'bucketList', defaultItems);
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
      await appDataService.updateAppDataField(authUser!.id, 'bucketList', updatedItems);
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
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Dreams</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{stats.active}</div>
            <div className="text-sm text-gray-600">In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.completionRate}%</div>
            <div className="text-sm text-gray-600">Completion Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Add New Item */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
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
            />
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newItem.category || 'Personal Growth'}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <Textarea
            placeholder="Describe your dream..."
            value={newItem.description || ''}
            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            rows={3}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Target date (optional)"
              type="date"
              value={newItem.targetDate ? new Date(newItem.targetDate).toISOString().split('T')[0] : ''}
              onChange={(e) => setNewItem({ ...newItem, targetDate: e.target.value ? new Date(e.target.value) : undefined })}
            />
            <Input
              placeholder="Location (optional)"
              value={newItem.location || ''}
              onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
            />
            <Input
              placeholder="Estimated cost (optional)"
              type="number"
              value={newItem.estimatedCost || ''}
              onChange={(e) => setNewItem({ ...newItem, estimatedCost: e.target.value ? parseFloat(e.target.value) : undefined })}
            />
          </div>
          <div className="flex items-center gap-4">
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newItem.priority || 'medium'}
              onChange={(e) => setNewItem({ ...newItem, priority: e.target.value as 'low' | 'medium' | 'high' })}
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            <Button onClick={addItem} disabled={!newItem.title?.trim()}>
              <Plus className="w-4 h-4 mr-2" />
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
          <Card key={item.id} className={`transition-all ${item.completed ? 'opacity-75' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleComplete(item)}
                  className="mt-1 flex-shrink-0"
                >
                  {item.completed ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-400" />
                  )}
                </button>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold ${item.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-gray-600 mt-1">{item.description}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                        <Badge className={`text-xs ${PRIORITY_COLORS[item.priority]}`}>
                          {item.priority} priority
                        </Badge>
                        {item.targetDate && (
                          <Badge variant="outline" className="text-xs flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(item.targetDate).toLocaleDateString()}
                          </Badge>
                        )}
                        {item.location && (
                          <Badge variant="outline" className="text-xs flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {item.location}
                          </Badge>
                        )}
                        {item.estimatedCost && (
                          <Badge variant="outline" className="text-xs">
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
                        className="text-red-600 hover:text-red-700"
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
          <Card>
            <CardContent className="p-8 text-center">
              <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                {filter === 'completed' ? 'No completed dreams yet' : 
                 filter === 'active' ? 'No active dreams' : 
                 'No dreams yet'}
              </h3>
              <p className="text-gray-500">
                {filter === 'all' ? 'Start adding your dreams and goals to your bucket list!' : 
                 'Try changing the filter to see more items.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
