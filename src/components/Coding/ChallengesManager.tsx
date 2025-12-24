import React, { useEffect, useMemo, useState, useReducer, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, Edit2, Trash2, Plus, ExternalLink, CheckCircle, 
  Search, RefreshCw, AlertTriangle, FileText, BarChart2, Filter,
  ArrowUp, ArrowDown, ChevronLeft, ChevronRight, MoreHorizontal,
  Download, Upload, CheckSquare, Square, X
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { isValidUrl } from '../../lib/utils';
import { Progress } from '../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import toast from 'react-hot-toast';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from 'recharts';

// --- Types & Interfaces ---

type Frequency = 'Daily' | 'Weekly' | 'Monthly';
type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Expert';
type Platform = 'LeetCode' | 'GeeksforGeeks' | 'CodeChef' | 'HackerRank' | 'Codeforces' | 'Other';
type SortField = 'date' | 'xp' | 'difficulty' | 'title' | 'status';
type SortOrder = 'asc' | 'desc';

interface ChallengeItem {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  platform: Platform;
  url: string;
  xp: number;
  tags: string[];
  frequency: Frequency;
  completed: boolean;
  completedAt?: string; // ISO Date
  createdAt: string;    // ISO Date
  updatedAt: string;    // ISO Date
  notes?: string;
  attempts?: number;
}

interface ChallengeStats {
  total: number;
  completed: number;
  totalXp: number;
  earnedXp: number;
  byDifficulty: Record<Difficulty, number>;
  byPlatform: Record<Platform, number>;
  completionRate: number;
  averageXp: number;
}

// --- Validation Logic ---

class ChallengeValidator {
  static validate(item: Partial<ChallengeItem>): Record<string, string> {
    const errors: Record<string, string> = {};

    if (!item.title || item.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters long.';
    }
    if (item.title && item.title.length > 100) {
      errors.title = 'Title must be less than 100 characters.';
    }

    if (!item.platform) {
      errors.platform = 'Platform is required.';
    }

    if (item.url && !isValidUrl(item.url)) {
      errors.url = 'Please enter a valid URL (http/https).';
    }

    if (item.xp === undefined || item.xp < 0 || item.xp > 1000) {
      errors.xp = 'XP must be between 0 and 1000.';
    }

    if (item.difficulty && !['Easy', 'Medium', 'Hard', 'Expert'].includes(item.difficulty)) {
      errors.difficulty = 'Invalid difficulty level.';
    }

    return errors;
  }
}

// --- Simulated Async Data Service ---

class ChallengeService {
  private static STORAGE_PREFIX = 'challenges_v2_';
  private static SIMULATED_DELAY_MS = 600;
  private static ERROR_RATE = 0.05; // 5% chance of error

  static async fetchChallenges(frequency: Frequency): Promise<ChallengeItem[]> {
    await this.delay();
    this.maybeThrowError();
    
    const key = `${this.STORAGE_PREFIX}${frequency.toLowerCase()}`;
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  static async saveChallenge(frequency: Frequency, item: ChallengeItem): Promise<ChallengeItem> {
    await this.delay();
    this.maybeThrowError();

    const key = `${this.STORAGE_PREFIX}${frequency.toLowerCase()}`;
    const current = await this.fetchChallenges(frequency);
    
    const exists = current.find(c => c.id === item.id);
    let updated: ChallengeItem[];

    if (exists) {
      updated = current.map(c => c.id === item.id ? { ...item, updatedAt: new Date().toISOString() } : c);
    } else {
      updated = [item, ...current];
    }

    localStorage.setItem(key, JSON.stringify(updated));
    return item;
  }

  static async deleteChallenge(frequency: Frequency, id: string): Promise<void> {
    await this.delay();
    
    const key = `${this.STORAGE_PREFIX}${frequency.toLowerCase()}`;
    const current = await this.fetchChallenges(frequency);
    const updated = current.filter(c => c.id !== id);
    
    localStorage.setItem(key, JSON.stringify(updated));
  }

  static async bulkDelete(frequency: Frequency, ids: string[]): Promise<void> {
    await this.delay();
    
    const key = `${this.STORAGE_PREFIX}${frequency.toLowerCase()}`;
    const current = await this.fetchChallenges(frequency);
    const updated = current.filter(c => !ids.includes(c.id));
    
    localStorage.setItem(key, JSON.stringify(updated));
  }

  private static delay() {
    return new Promise(resolve => setTimeout(resolve, this.SIMULATED_DELAY_MS));
  }

  private static maybeThrowError() {
    if (Math.random() < this.ERROR_RATE) {
      throw new Error('Network error: Failed to synchronize with server.');
    }
  }
}

// --- State Management (Reducer) ---

interface State {
  items: ChallengeItem[];
  loading: boolean;
  error: string | null;
  selectedIds: Set<string>;
  searchQuery: string;
  filters: {
    difficulty: Difficulty | 'All';
    platform: Platform | 'All';
    status: 'All' | 'Completed' | 'Pending';
  };
  sorting: {
    field: SortField;
    order: SortOrder;
  };
  pagination: {
    page: number;
    pageSize: number;
  };
  viewMode: 'list' | 'grid' | 'analytics';
  isDirty: boolean; // Has unsaved changes (if we were batching)
}

type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: ChallengeItem[] }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'ADD_ITEM'; payload: ChallengeItem }
  | { type: 'UPDATE_ITEM'; payload: ChallengeItem }
  | { type: 'DELETE_ITEM'; payload: string }
  | { type: 'BULK_DELETE'; payload: string[] }
  | { type: 'TOGGLE_SELECT'; payload: string }
  | { type: 'SELECT_ALL'; payload: boolean }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_FILTER'; payload: Partial<State['filters']> }
  | { type: 'SET_SORT'; payload: Partial<State['sorting']> }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_VIEW_MODE'; payload: State['viewMode'] }
  | { type: 'CLEAR_ERROR' };

const initialState: State = {
  items: [],
  loading: true,
  error: null,
  selectedIds: new Set(),
  searchQuery: '',
  filters: { difficulty: 'All', platform: 'All', status: 'All' },
  sorting: { field: 'date', order: 'desc' },
  pagination: { page: 1, pageSize: 6 },
  viewMode: 'list',
  isDirty: false,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, items: action.payload, selectedIds: new Set() };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'ADD_ITEM':
      return { ...state, items: [action.payload, ...state.items] };
    case 'UPDATE_ITEM':
      return { 
        ...state, 
        items: state.items.map(i => i.id === action.payload.id ? action.payload : i) 
      };
    case 'DELETE_ITEM':
      return { 
        ...state, 
        items: state.items.filter(i => i.id !== action.payload),
        selectedIds: new Set([...state.selectedIds].filter(id => id !== action.payload))
      };
    case 'BULK_DELETE':
      return {
        ...state,
        items: state.items.filter(i => !action.payload.includes(i.id)),
        selectedIds: new Set()
      };
    case 'TOGGLE_SELECT':
      const newSelected = new Set(state.selectedIds);
      if (newSelected.has(action.payload)) {
        newSelected.delete(action.payload);
      } else {
        newSelected.add(action.payload);
      }
      return { ...state, selectedIds: newSelected };
    case 'SELECT_ALL':
      return {
        ...state,
        selectedIds: action.payload ? new Set(state.items.map(i => i.id)) : new Set()
      };
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload, pagination: { ...state.pagination, page: 1 } };
    case 'SET_FILTER':
      return { ...state, filters: { ...state.filters, ...action.payload }, pagination: { ...state.pagination, page: 1 } };
    case 'SET_SORT':
      return { ...state, sorting: { ...state.sorting, ...action.payload } };
    case 'SET_PAGE':
      return { ...state, pagination: { ...state.pagination, page: action.payload } };
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

// --- Main Component ---

export function ChallengesManager({ frequency }: { frequency: Frequency }) {
  const { state: appState, dispatch: appDispatch } = useApp();
  const { darkMode, user } = appState;
  
  const [state, dispatch] = useReducer(reducer, initialState);
  
  // Form State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<ChallengeItem> | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState('');

  // Initial Fetch
  useEffect(() => {
    fetchData();
  }, [frequency]);

  const fetchData = async () => {
    dispatch({ type: 'FETCH_START' });
    try {
      const data = await ChallengeService.fetchChallenges(frequency);
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    } catch (err) {
      dispatch({ type: 'FETCH_ERROR', payload: (err as Error).message });
      toast.error('Failed to load challenges');
    }
  };

  // --- Derived State (Filtering & Sorting) ---

  const processedItems = useMemo(() => {
    let result = [...state.items];

    // 1. Filter
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      result = result.filter(i => 
        i.title.toLowerCase().includes(q) || 
        i.description.toLowerCase().includes(q) ||
        i.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    if (state.filters.difficulty !== 'All') {
      result = result.filter(i => i.difficulty === state.filters.difficulty);
    }
    if (state.filters.platform !== 'All') {
      result = result.filter(i => i.platform === state.filters.platform);
    }
    if (state.filters.status !== 'All') {
      result = result.filter(i => 
        state.filters.status === 'Completed' ? i.completed : !i.completed
      );
    }

    // 2. Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (state.sorting.field) {
        case 'xp':
          comparison = a.xp - b.xp;
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'difficulty': {
          const levels: Record<string, number> = { Easy: 1, Medium: 2, Hard: 3, Expert: 4 };
          comparison = (levels[a.difficulty] || 0) - (levels[b.difficulty] || 0);
          break;
        }
        case 'status':
          comparison = (a.completed === b.completed) ? 0 : a.completed ? 1 : -1;
          break;
        case 'date':
        default:
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return state.sorting.order === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [state.items, state.searchQuery, state.filters, state.sorting]);

  // --- Pagination Logic ---

  const totalPages = Math.ceil(processedItems.length / state.pagination.pageSize);
  const paginatedItems = processedItems.slice(
    (state.pagination.page - 1) * state.pagination.pageSize,
    state.pagination.page * state.pagination.pageSize
  );

  // --- Statistics Calculation ---

  const stats: ChallengeStats = useMemo(() => {
    const total = state.items.length;
    const completed = state.items.filter(i => i.completed).length;
    const totalXp = state.items.reduce((acc, curr) => acc + curr.xp, 0);
    const earnedXp = state.items.filter(i => i.completed).reduce((acc, curr) => acc + curr.xp, 0);
    
    const byDifficulty = state.items.reduce((acc, curr) => {
      acc[curr.difficulty] = (acc[curr.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<Difficulty, number>);

    const byPlatform = state.items.reduce((acc, curr) => {
      acc[curr.platform] = (acc[curr.platform] || 0) + 1;
      return acc;
    }, {} as Record<Platform, number>);

    return {
      total,
      completed,
      totalXp,
      earnedXp,
      byDifficulty: byDifficulty as any,
      byPlatform: byPlatform as any,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      averageXp: total > 0 ? totalXp / total : 0,
    };
  }, [state.items]);

  // --- Handlers ---

  const handleSave = async () => {
    if (!editingItem) return;

    // Validation
    const errors = ChallengeValidator.validate(editingItem);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error('Please fix the errors before saving.');
      return;
    }

    // Construct Item
    const newItem: ChallengeItem = {
      id: editingItem.id || `${frequency}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: editingItem.title || '',
      description: editingItem.description || '',
      difficulty: editingItem.difficulty || 'Easy',
      platform: editingItem.platform || 'LeetCode',
      url: editingItem.url || '',
      xp: editingItem.xp || 50,
      tags: editingItem.tags || [],
      frequency,
      completed: editingItem.completed || false,
      completedAt: editingItem.completedAt,
      createdAt: editingItem.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attempts: editingItem.attempts || 0,
      notes: editingItem.notes || '',
    };

    try {
      await ChallengeService.saveChallenge(frequency, newItem);
      if (editingItem.id) {
        dispatch({ type: 'UPDATE_ITEM', payload: newItem });
        toast.success('Challenge updated successfully');
      } else {
        dispatch({ type: 'ADD_ITEM', payload: newItem });
        toast.success('New challenge added');
      }
      setIsDialogOpen(false);
      setEditingItem(null);
    } catch (err) {
      toast.error('Failed to save challenge');
      dispatch({ type: 'FETCH_ERROR', payload: (err as Error).message });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this challenge?')) return;
    try {
      await ChallengeService.deleteChallenge(frequency, id);
      dispatch({ type: 'DELETE_ITEM', payload: id });
      toast.success('Challenge deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleBulkDelete = async () => {
    if (state.selectedIds.size === 0) return;
    if (!confirm(`Delete ${state.selectedIds.size} challenges?`)) return;
    
    try {
      const ids = Array.from(state.selectedIds);
      await ChallengeService.bulkDelete(frequency, ids);
      dispatch({ type: 'BULK_DELETE', payload: ids });
      toast.success(`${ids.length} challenges deleted`);
    } catch (err) {
      toast.error('Bulk delete failed');
    }
  };

  const handleToggleComplete = async (item: ChallengeItem) => {
    const updated = {
      ...item,
      completed: !item.completed,
      completedAt: !item.completed ? new Date().toISOString() : undefined
    };

    try {
      await ChallengeService.saveChallenge(frequency, updated);
      dispatch({ type: 'UPDATE_ITEM', payload: updated });
      
      if (updated.completed) {
        toast.success(`Completed! +${item.xp} XP`);
        appDispatch({ type: 'ADD_XP', payload: { amount: item.xp, source: `${frequency} Challenge` } });
        appDispatch({ 
          type: 'SOLVE_PROBLEM', 
          payload: { 
            xp: item.xp, 
            difficulty: item.difficulty, 
            platform: item.platform, 
            topic: item.tags[0] || 'General' 
          } 
        });
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  // --- Render Helpers ---

  const renderPagination = () => (
    <div className="flex items-center justify-between mt-4 px-2">
      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        Showing {(state.pagination.page - 1) * state.pagination.pageSize + 1} to {Math.min(state.pagination.page * state.pagination.pageSize, processedItems.length)} of {processedItems.length}
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => dispatch({ type: 'SET_PAGE', payload: Math.max(1, state.pagination.page - 1) })}
          disabled={state.pagination.page === 1}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => dispatch({ type: 'SET_PAGE', payload: Math.min(totalPages, state.pagination.page + 1) })}
          disabled={state.pagination.page === totalPages || totalPages === 0}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Challenges', value: stats.total, icon: FileText, color: 'text-blue-500' },
          { label: 'Completion Rate', value: `${stats.completionRate.toFixed(1)}%`, icon: CheckCircle, color: 'text-green-500' },
          { label: 'Total XP Available', value: stats.totalXp, icon: BarChart2, color: 'text-purple-500' },
          { label: 'XP Earned', value: stats.earnedXp, icon: Award, color: 'text-yellow-500' },
        ].map((stat, i) => (
          <div key={i} className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</span>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h4 className={`text-lg font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Difficulty Distribution</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={Object.entries(stats.byDifficulty).map(([k, v]) => ({ name: k, value: v }))}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
              <XAxis dataKey="name" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
              <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: darkMode ? '#1f2937' : '#fff', borderColor: darkMode ? '#374151' : '#e5e7eb' }}
              />
              <Area type="monotone" dataKey="value" stroke="#8884d8" fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  // --- Main Render ---

  return (
    <div className={`min-h-[600px] flex flex-col p-6 rounded-2xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} shadow-xl border-l-4 ${frequency === 'Daily' ? 'border-yellow-500' : frequency === 'Weekly' ? 'border-cyan-500' : 'border-fuchsia-500'}`}>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${frequency === 'Daily' ? 'bg-yellow-500/10' : frequency === 'Weekly' ? 'bg-cyan-500/10' : 'bg-fuchsia-500/10'}`}>
            {frequency === 'Weekly' ? (
              <Clock className={`w-6 h-6 ${frequency === 'Weekly' ? 'text-cyan-500' : ''}`} />
            ) : (
              <Calendar className={`w-6 h-6 ${frequency === 'Daily' ? 'text-yellow-500' : 'text-fuchsia-500'}`} />
            )}
          </div>
          <div>
            <h2 className={`text-2xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {frequency} Challenges
            </h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Manage and track your {frequency.toLowerCase()} coding goals
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <Button
            variant="outline"
            size="sm"
            onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: state.viewMode === 'analytics' ? 'list' : 'analytics' })}
            className={state.viewMode === 'analytics' ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
          >
            <BarChart2 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
          <Button
            onClick={() => {
              setEditingItem({});
              setIsDialogOpen(true);
            }}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Challenge
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {state.error && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{state.error}</p>
          <Button variant="ghost" size="sm" onClick={fetchData} className="ml-auto hover:bg-red-500/20">
            <RefreshCw className="w-4 h-4 mr-2" /> Retry
          </Button>
        </div>
      )}

      {/* Analytics View */}
      {state.viewMode === 'analytics' ? (
        renderAnalytics()
      ) : (
        <>
          {/* Controls Bar */}
          <div className={`p-4 rounded-xl border mb-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} space-y-4`}>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  placeholder="Search challenges..." 
                  className="pl-10"
                  value={state.searchQuery}
                  onChange={(e) => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                <Select 
                  value={state.filters.difficulty} 
                  onValueChange={(v) => dispatch({ type: 'SET_FILTER', payload: { difficulty: v as any } })}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Levels</SelectItem>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                    <SelectItem value="Expert">Expert</SelectItem>
                  </SelectContent>
                </Select>

                <Select 
                  value={state.filters.status} 
                  onValueChange={(v) => dispatch({ type: 'SET_FILTER', payload: { status: v as any } })}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Status</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Filter className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {['date', 'xp', 'difficulty', 'title'].map((field) => (
                      <DropdownMenuItem 
                        key={field}
                        onClick={() => dispatch({ type: 'SET_SORT', payload: { field: field as SortField } })}
                      >
                        <span className="capitalize">{field}</span>
                        {state.sorting.field === field && (
                          state.sorting.order === 'asc' ? <ArrowUp className="w-3 h-3 ml-2" /> : <ArrowDown className="w-3 h-3 ml-2" />
                        )}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => dispatch({ type: 'SET_SORT', payload: { order: state.sorting.order === 'asc' ? 'desc' : 'asc' } })}>
                      Toggle Order
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="w-px h-full bg-gray-200 dark:bg-gray-700 mx-1" />

                <div className="flex items-center gap-1 border rounded-md p-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 ${state.viewMode === 'list' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                    onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'list' })}
                  >
                    <Menu className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 ${state.viewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                    onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'grid' })}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Bulk Actions */}
            {state.selectedIds.size > 0 && (
              <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm text-blue-600 dark:text-blue-400 animate-in slide-in-from-top-2">
                <span className="font-medium">{state.selectedIds.size} items selected</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => dispatch({ type: 'SELECT_ALL', payload: false })}>
                    Deselect
                  </Button>
                  <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
                    Delete Selected
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Content Area */}
          {state.loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
               <RefreshCw className="w-8 h-8 animate-spin text-primary" />
               <p className="text-muted-foreground">Syncing with secure storage...</p>
            </div>
          ) : paginatedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-xl">
              <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium">No challenges found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your filters or create a new one.</p>
              <Button onClick={() => { setEditingItem({}); setIsDialogOpen(true); }}>
                Create Challenge
              </Button>
            </div>
          ) : (
            <div className={state.viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-3'}>
              <AnimatePresence mode="popLayout">
                {paginatedItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className={`group relative p-4 rounded-xl border transition-all hover:shadow-md ${
                      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    } ${item.completed ? 'opacity-75' : ''}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="pt-1">
                        <div 
                          className={`w-5 h-5 rounded border cursor-pointer flex items-center justify-center transition-colors ${
                            state.selectedIds.has(item.id) 
                              ? 'bg-primary border-primary text-primary-foreground' 
                              : 'border-gray-400 hover:border-primary'
                          }`}
                          onClick={() => dispatch({ type: 'TOGGLE_SELECT', payload: item.id })}
                        >
                          {state.selectedIds.has(item.id) && <CheckSquare className="w-3.5 h-3.5" />}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge variant={item.difficulty === 'Easy' ? 'default' : item.difficulty === 'Medium' ? 'secondary' : 'destructive'} className="h-5 text-[10px] px-1.5">
                            {item.difficulty}
                          </Badge>
                          <Badge variant="outline" className="h-5 text-[10px] px-1.5 border-blue-500 text-blue-500">
                            {item.platform}
                          </Badge>
                          {item.completed && (
                            <Badge variant="outline" className="h-5 text-[10px] px-1.5 border-green-500 text-green-500 gap-1">
                              <CheckCircle className="w-3 h-3" /> Done
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground ml-auto">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <h3 className={`font-semibold truncate pr-8 ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {item.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mt-3">
                          {item.tags.map(tag => (
                            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                              #{tag}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-3 mt-4">
                          {item.url && (
                            <a 
                              href={item.url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-xs font-medium text-blue-500 hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" /> Solve Problem
                            </a>
                          )}
                          <div className="ml-auto flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => {
                                setEditingItem(item);
                                setIsDialogOpen(true);
                              }}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <Button
                            size="sm"
                            variant={item.completed ? "outline" : "default"}
                            className={item.completed ? "ml-2" : "ml-2 bg-green-600 hover:bg-green-700"}
                            onClick={() => handleToggleComplete(item)}
                          >
                            {item.completed ? 'Undo' : 'Complete'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
          
          {renderPagination()}
        </>
      )}

      {/* Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem?.id ? 'Edit Challenge' : 'Create New Challenge'}</DialogTitle>
            <DialogDescription>
              {editingItem?.id ? 'Update the details of your coding challenge.' : 'Add a new challenge to your tracking list.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-right">Title</Label>
              <Input
                id="title"
                value={editingItem?.title || ''}
                onChange={(e) => setEditingItem(prev => ({ ...prev, title: e.target.value }))}
                className={formErrors.title ? 'border-red-500' : ''}
              />
              {formErrors.title && <span className="text-xs text-red-500">{formErrors.title}</span>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Platform</Label>
                <Select 
                  value={editingItem?.platform || 'LeetCode'} 
                  onValueChange={(v) => setEditingItem(prev => ({ ...prev, platform: v as Platform }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['LeetCode', 'GeeksforGeeks', 'CodeChef', 'HackerRank', 'Codeforces', 'Other'].map(p => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Difficulty</Label>
                <Select 
                  value={editingItem?.difficulty || 'Easy'} 
                  onValueChange={(v) => setEditingItem(prev => ({ ...prev, difficulty: v as Difficulty }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['Easy', 'Medium', 'Hard', 'Expert'].map(d => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>URL</Label>
              <Input
                value={editingItem?.url || ''}
                onChange={(e) => setEditingItem(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://leetcode.com/problems/..."
                className={formErrors.url ? 'border-red-500' : ''}
              />
              {formErrors.url && <span className="text-xs text-red-500">{formErrors.url}</span>}
            </div>

            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea
                value={editingItem?.description || ''}
                onChange={(e) => setEditingItem(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (tagInput.trim()) {
                        setEditingItem(prev => ({ ...prev, tags: [...(prev?.tags || []), tagInput.trim()] }));
                        setTagInput('');
                      }
                    }
                  }}
                  placeholder="Add a tag..."
                />
                <Button 
                  type="button" 
                  onClick={() => {
                    if (tagInput.trim()) {
                      setEditingItem(prev => ({ ...prev, tags: [...(prev?.tags || []), tagInput.trim()] }));
                      setTagInput('');
                    }
                  }}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {editingItem?.tags?.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="gap-1 pr-1">
                    {tag}
                    <X 
                      className="w-3 h-3 cursor-pointer hover:text-red-500" 
                      onClick={() => setEditingItem(prev => ({ ...prev, tags: prev?.tags?.filter(t => t !== tag) }))}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
               <Label>XP Reward</Label>
               <Input
                 type="number"
                 value={editingItem?.xp || 50}
                 onChange={(e) => setEditingItem(prev => ({ ...prev, xp: parseInt(e.target.value) || 0 }))}
                 min={0}
                 max={1000}
               />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Icons for toggle buttons
const Menu = ({ className }: { className?: string }) => (
  <svg className={className} width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 3.5C0 3.22386 0.223858 3 0.5 3H14.5C14.7761 3 15 3.22386 15 3.5C15 3.77614 14.7761 4 14.5 4H0.5C0.223858 4 0 3.77614 0 3.5ZM0 7.5C0 7.22386 0.223858 7 0.5 7H14.5C14.7761 7 15 7.22386 15 7.5C15 7.77614 14.7761 8 14.5 8H0.5C0.223858 8 0 7.77614 0 7.5ZM0 11.5C0 11.2239 0.223858 11 0.5 11H14.5C14.7761 11 15 11.2239 15 11.5C15 11.7761 14.7761 12 14.5 12H0.5C0.223858 12 0 11.7761 0 11.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
);
const Grid = ({ className }: { className?: string }) => (
  <svg className={className} width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 1.5C0 0.671573 0.671573 0 1.5 0H6.5C7.32843 0 8 0.671573 8 1.5V6.5C8 7.32843 7.32843 8 6.5 8H1.5C0.671573 8 0 7.32843 0 6.5V1.5ZM1.5 1H6.5C6.77614 1 7 1.22386 7 1.5V6.5C7 6.77614 6.77614 7 6.5 7H1.5C1.22386 7 1 6.77614 1 6.5V1.5C1 1.22386 1.22386 1 1.5 1ZM0 9.5C0 8.67157 0.671573 8 1.5 8H6.5C7.32843 8 8 8.67157 8 9.5V14.5C8 15.3284 7.32843 16 6.5 16H1.5C0.671573 16 0 15.3284 0 14.5V9.5ZM1.5 9H6.5C6.77614 9 7 9.22386 7 9.5V14.5C7 14.7761 6.77614 15 6.5 15H1.5C1.22386 15 1 14.7761 1 14.5V9.5C1 9.22386 1.22386 9 1.5 9ZM9.5 0C8.67157 0 8 0.671573 8 1.5V6.5C8 7.32843 8.67157 8 9.5 8H14.5C15.3284 8 16 7.32843 16 6.5V1.5C16 0.671573 15.3284 0 14.5 0H9.5ZM9 1.5C9 1.22386 9.22386 1 9.5 1H14.5C14.7761 1 15 1.22386 15 1.5V6.5C15 6.77614 14.7761 7 14.5 7H9.5C9.22386 7 9 6.77614 9 6.5V1.5ZM9.5 8C8.67157 8 8 8.67157 8 9.5V14.5C8 15.3284 8.67157 16 9.5 16H14.5C15.3284 16 16 15.3284 16 14.5V9.5C16 8.67157 15.3284 8 14.5 8H9.5ZM9 9.5C9 9.22386 9.22386 9 9.5 9H14.5C14.7761 9 15 9.22386 15 9.5V14.5C15 14.7761 14.7761 15 14.5 15H9.5C9.22386 15 9 14.7761 9 14.5V9.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
);
const Award = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
);
