import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Skull, TrendingDown, Clock, AlertTriangle, X, Briefcase, Users, Target, 
  CheckCircle, Plus, Award, MapPin, Edit2, Trash2
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../hooks/useAuth';
import { appDataService } from '../../services/appDataService';

interface TimeWaster {
  id: string;
  activity: string;
  hours: number;
  xpLost: number;
  date: string; // ISO string for localStorage
  icon: string;
}

const timeWasterTypes = [
  { name: 'Social Media / Reels', icon: '📱', xpPerHour: -50 },
  { name: 'YouTube / Netflix Binge', icon: '📺', xpPerHour: -40 },
  { name: 'Gaming (Unproductive)', icon: '🎮', xpPerHour: -45 },
  { name: 'Oversleeping', icon: '😴', xpPerHour: -35 },
  { name: 'Junk Food Binge', icon: '🍔', xpPerHour: -30 },
  { name: 'Procrastination', icon: '⏰', xpPerHour: -40 },
  { name: 'Endless Scrolling', icon: '📲', xpPerHour: -55 },
  { name: 'Gossip / Drama', icon: '💬', xpPerHour: -45 },
  { name: 'Missed Workout', icon: '💪', xpPerHour: -30 },
  { name: 'Skipped Learning', icon: '📚', xpPerHour: -40 },
  { name: 'Missed Application Deadline', icon: '📅', xpPerHour: -100 },
  { name: 'Broke Accountability Promise', icon: '⚖️', xpPerHour: -80 },
];

interface BusinessGoal {
  id: string;
  title: string;
  description: string;
  targetDate: string; // ISO string
  progress: number;
  target: number;
  xpReward: number;
  completed: boolean;
  category: 'startup' | 'revenue' | 'customer' | 'product';
  createdAt: string;
  milestones?: { id: string; title: string; completed: boolean }[];
  notes?: string;
  revenue?: number;
  customers?: number;
}

interface InternshipApplication {
  id: string;
  company: string;
  position: string;
  date: string; // ISO string
  status: 'applied' | 'interview' | 'offer' | 'rejected';
  xpEarned: number;
  location?: string;
  salary?: string;
  notes?: string;
  followUpDate?: string;
  interviewDate?: string;
  offerDate?: string;
  rejectionReason?: string;
  portal?: string;
  referral?: boolean;
}

interface NetworkingEvent {
  id: string;
  name: string;
  date: string; // ISO string
  connections: number;
  xpEarned: number;
  type: 'meetup' | 'conference' | 'online' | 'coffee';
  location?: string;
  notes?: string;
  contacts?: { name: string; email?: string; linkedin?: string }[];
  followUp?: boolean;
}

interface PublicCommitment {
  id: string;
  title: string;
  description: string;
  deadline: string; // ISO string
  completed: boolean;
  xpReward: number;
  public: boolean;
  createdAt: string;
  progress?: number;
  target?: number;
  accountabilityPartner?: string;
  notes?: string;
  reminders?: { date: string; sent: boolean }[];
}

type ModalType = 'punishment' | 'business' | 'application' | 'networking' | 'commitment' | null;
type EditMode = { type: ModalType; id: string } | null;

export function Accountability() {
  const { dispatch } = useApp();
  const { user: authUser } = useAuth();
  const [timeWasters, setTimeWasters] = useState<TimeWaster[]>([]);
  
  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      if (!authUser) {
        // Fallback to localStorage if not logged in
        const saved = localStorage.getItem('timeWasters');
        if (saved) {
          try {
            setTimeWasters(JSON.parse(saved));
          } catch {
            setTimeWasters([]);
          }
        }
        return;
      }

      // Load from localStorage only
      const saved = localStorage.getItem('timeWasters');
      if (saved) {
        try {
          setTimeWasters(JSON.parse(saved));
        } catch {
          setTimeWasters([]);
        }
      }
      
      // Load other data from localStorage
      const savedGoals = localStorage.getItem('businessGoals');
      if (savedGoals) {
        try {
          setBusinessGoals(JSON.parse(savedGoals));
        } catch { void 0; }
      }
      
      const savedApps = localStorage.getItem('internshipApplications');
      if (savedApps) {
        try {
          setApplications(JSON.parse(savedApps));
        } catch { void 0; }
      }
      
      const savedNetworking = localStorage.getItem('networkingEvents');
      if (savedNetworking) {
        try {
          setNetworkingEvents(JSON.parse(savedNetworking));
        } catch { void 0; }
      }
      
      const savedCommitments = localStorage.getItem('publicCommitments');
      if (savedCommitments) {
        try {
          setCommitments(JSON.parse(savedCommitments));
        } catch { void 0; }
      }
    };
    loadData();
  }, [authUser]);
  
  const [showModal, setShowModal] = useState<ModalType>(null);
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [selectedActivity, setSelectedActivity] = useState(timeWasterTypes[0]);
  const [hours, setHours] = useState(1);
  const [activeTab, setActiveTab] = useState<'punishments' | 'business' | 'internships' | 'networking' | 'commitments'>('punishments');
  
  // Business Goals Form
  const [businessForm, setBusinessForm] = useState({
    title: '',
    description: '',
    targetDate: new Date().toISOString().split('T')[0],
    target: 100,
    xpReward: 500,
    category: 'startup' as BusinessGoal['category'],
    notes: '',
  });
  
  // Application Form
  const [applicationForm, setApplicationForm] = useState({
    company: '',
    position: '',
    date: new Date().toISOString().split('T')[0],
    status: 'applied' as InternshipApplication['status'],
    location: '',
    salary: '',
    notes: '',
    portal: '',
    referral: false,
  });
  
  // Networking Form
  const [networkingForm, setNetworkingForm] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    connections: 0,
    type: 'meetup' as NetworkingEvent['type'],
    location: '',
    notes: '',
  });
  
  // Commitment Form
  const [commitmentForm, setCommitmentForm] = useState({
    title: '',
    description: '',
    deadline: new Date().toISOString().split('T')[0],
    xpReward: 300,
    public: false,
    target: 1,
    accountabilityPartner: '',
    notes: '',
  });
  
  // Business Goals
  const [businessGoals, setBusinessGoals] = useState<BusinessGoal[]>([]);
  
  // Internship Applications
  const [applications, setApplications] = useState<InternshipApplication[]>([]);
  
  // Networking Events
  const [networkingEvents, setNetworkingEvents] = useState<NetworkingEvent[]>([]);
  
  // Public Commitments
  const [commitments, setCommitments] = useState<PublicCommitment[]>([]);
  
  useEffect(() => {
    const loadBackend = async () => {
      if (!authUser?.id) return;
      try {
        const data = await appDataService.getAppData(authUser.id);
        const acc = (data?.accountabilityData || {}) as any;
        if (Array.isArray(acc.timeWasters)) setTimeWasters(acc.timeWasters);
        if (Array.isArray(acc.businessGoals)) setBusinessGoals(acc.businessGoals);
        if (Array.isArray(acc.internshipApplications)) setApplications(acc.internshipApplications);
        if (Array.isArray(acc.networkingEvents)) setNetworkingEvents(acc.networkingEvents);
        if (Array.isArray(acc.publicCommitments)) setCommitments(acc.publicCommitments);
      } catch {
        void 0;
      }
    };
    loadBackend();
  }, [authUser?.id]);
  
  // Save to backend and localStorage
  useEffect(() => {
    if (!authUser) {
      localStorage.setItem('timeWasters', JSON.stringify(timeWasters));
      return;
    }

    const saveData = () => {
      // Save to localStorage only
      localStorage.setItem('timeWasters', JSON.stringify(timeWasters));
      localStorage.setItem('businessGoals', JSON.stringify(businessGoals));
      localStorage.setItem('internshipApplications', JSON.stringify(applications));
      localStorage.setItem('networkingEvents', JSON.stringify(networkingEvents));
      localStorage.setItem('publicCommitments', JSON.stringify(commitments));
      
      if (authUser?.id) {
        const payload = {
          timeWasters,
          businessGoals,
          internshipApplications: applications,
          networkingEvents,
          publicCommitments: commitments,
        };
        appDataService.updateAppDataField(authUser.id, 'accountabilityData', payload).catch(() => {});
      }
    };

    const timeoutId = setTimeout(saveData, 1000);
    return () => clearTimeout(timeoutId);
  }, [timeWasters, businessGoals, applications, networkingEvents, commitments, authUser]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalXPLost = timeWasters.reduce((sum, w) => sum + w.xpLost, 0);
    const totalHoursWasted = timeWasters.reduce((sum, w) => sum + w.hours, 0);
    const totalApplications = applications.length;
    const totalInterviews = applications.filter(a => a.status === 'interview' || a.status === 'offer').length;
    const totalOffers = applications.filter(a => a.status === 'offer').length;
    const totalConnections = networkingEvents.reduce((sum, e) => sum + e.connections, 0);
    const completedCommitments = commitments.filter(c => c.completed).length;
    const activeBusinessGoals = businessGoals.filter(g => !g.completed).length;
    const completedBusinessGoals = businessGoals.filter(g => g.completed).length;
    const totalRevenue = businessGoals
      .filter(g => g.revenue)
      .reduce((sum, g) => sum + (g.revenue || 0), 0);
    const totalCustomers = businessGoals
      .filter(g => g.customers)
      .reduce((sum, g) => sum + (g.customers || 0), 0);
    
    // Weekly stats
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentApplications = applications.filter(a => new Date(a.date) >= weekAgo).length;
    const recentEvents = networkingEvents.filter(e => new Date(e.date) >= weekAgo).length;
    const recentCommitments = commitments.filter(c => new Date(c.createdAt) >= weekAgo).length;
    
    return {
      totalXPLost,
      totalHoursWasted,
      totalApplications,
      totalInterviews,
      totalOffers,
      totalConnections,
      completedCommitments,
      activeBusinessGoals,
      completedBusinessGoals,
      totalRevenue,
      totalCustomers,
      recentApplications,
      recentEvents,
      recentCommitments,
      totalCommitments: commitments.length,
    };
  }, [timeWasters, applications, networkingEvents, commitments, businessGoals]);

  const addTimeWaster = () => {
    const xpLost = Math.abs(selectedActivity.xpPerHour * hours);
    const newWaster: TimeWaster = {
      id: Date.now().toString(),
      activity: selectedActivity.name,
      hours,
      xpLost,
      date: new Date().toISOString(),
      icon: selectedActivity.icon,
    };

    setTimeWasters(prev => [newWaster, ...prev]);
    
    dispatch({ 
      type: 'ADD_XP', 
      payload: { 
        amount: -xpLost, 
        source: `Punishment: ${selectedActivity.name} (${hours}h)` 
      } 
    });

    dispatch({ 
      type: 'ADD_NOTIFICATION', 
      payload: {
        id: Date.now().toString(),
        type: 'achievement',
        title: 'XP Deducted! ⚠️',
        message: `Lost ${xpLost} XP for ${selectedActivity.name}. Stay focused!`,
        timestamp: new Date(),
        read: false,
        priority: 'high',
      }
    });

    setShowModal(null);
    setHours(1);
  };

  const removeWaster = (id: string) => {
    const waster = timeWasters.find(w => w.id === id);
    if (waster) {
      dispatch({ 
        type: 'ADD_XP', 
        payload: { 
          amount: waster.xpLost, 
          source: `Removed punishment: ${waster.activity}` 
        } 
      });
      setTimeWasters(prev => prev.filter(w => w.id !== id));
    }
  };

  const handleAddBusinessGoal = () => {
    if (!businessForm.title.trim()) return;
    
    const newGoal: BusinessGoal = {
      id: editMode?.id || Date.now().toString(),
      ...businessForm,
      targetDate: new Date(businessForm.targetDate).toISOString(),
      progress: editMode ? businessGoals.find(g => g.id === editMode.id)?.progress || 0 : 0,
      completed: false,
      createdAt: editMode ? businessGoals.find(g => g.id === editMode.id)?.createdAt || new Date().toISOString() : new Date().toISOString(),
    };
    
    if (editMode) {
      setBusinessGoals(prev => prev.map(g => g.id === editMode.id ? newGoal : g));
    } else {
      setBusinessGoals(prev => [...prev, newGoal]);
      dispatch({
        type: 'ADD_XP',
        payload: { amount: 100, source: `Business Goal Created: ${businessForm.title}` }
      });
    }
    
    setBusinessForm({
      title: '',
      description: '',
      targetDate: new Date().toISOString().split('T')[0],
      target: 100,
      xpReward: 500,
      category: 'startup',
      notes: '',
    });
    setShowModal(null);
    setEditMode(null);
  };

  const handleAddApplication = () => {
    if (!applicationForm.company.trim() || !applicationForm.position.trim()) return;
    
    const xpEarned = applicationForm.status === 'offer' ? 1000 : 
                     applicationForm.status === 'interview' ? 500 : 200;
    
    const newApp: InternshipApplication = {
      id: editMode?.id || Date.now().toString(),
      ...applicationForm,
      date: new Date(applicationForm.date).toISOString(),
      xpEarned: editMode ? applications.find(a => a.id === editMode.id)?.xpEarned || xpEarned : xpEarned,
    };
    
    if (editMode) {
      setApplications(prev => prev.map(a => a.id === editMode.id ? newApp : a));
    } else {
      setApplications(prev => [...prev, newApp]);
      dispatch({
        type: 'ADD_XP',
        payload: { amount: xpEarned, source: `Applied to ${applicationForm.company}` }
      });
    }
    
    setApplicationForm({
      company: '',
      position: '',
      date: new Date().toISOString().split('T')[0],
      status: 'applied',
      location: '',
      salary: '',
      notes: '',
      portal: '',
      referral: false,
    });
    setShowModal(null);
    setEditMode(null);
  };

  const handleAddNetworkingEvent = () => {
    if (!networkingForm.name.trim()) return;
    
    const xpEarned = 150 + (networkingForm.connections * 10);
    const newEvent: NetworkingEvent = {
      id: editMode?.id || Date.now().toString(),
      ...networkingForm,
      date: new Date(networkingForm.date).toISOString(),
      xpEarned: editMode ? networkingEvents.find(e => e.id === editMode.id)?.xpEarned || xpEarned : xpEarned,
    };
    
    if (editMode) {
      setNetworkingEvents(prev => prev.map(e => e.id === editMode.id ? newEvent : e));
    } else {
      setNetworkingEvents(prev => [...prev, newEvent]);
      dispatch({
        type: 'ADD_XP',
        payload: { amount: xpEarned, source: `Networking: ${networkingForm.name}` }
      });
    }
    
    setNetworkingForm({
      name: '',
      date: new Date().toISOString().split('T')[0],
      connections: 0,
      type: 'meetup',
      location: '',
      notes: '',
    });
    setShowModal(null);
    setEditMode(null);
  };

  const handleAddCommitment = () => {
    if (!commitmentForm.title.trim()) return;
    
    const newCommitment: PublicCommitment = {
      id: editMode?.id || Date.now().toString(),
      ...commitmentForm,
      deadline: new Date(commitmentForm.deadline).toISOString(),
      completed: false,
      createdAt: editMode ? commitments.find(c => c.id === editMode.id)?.createdAt || new Date().toISOString() : new Date().toISOString(),
      progress: editMode ? commitments.find(c => c.id === editMode.id)?.progress || 0 : 0,
    };
    
    if (editMode) {
      setCommitments(prev => prev.map(c => c.id === editMode.id ? newCommitment : c));
    } else {
      setCommitments(prev => [...prev, newCommitment]);
      dispatch({
        type: 'ADD_XP',
        payload: { amount: 150, source: `Public Commitment: ${commitmentForm.title}` }
      });
    }
    
    setCommitmentForm({
      title: '',
      description: '',
      deadline: new Date().toISOString().split('T')[0],
      xpReward: 300,
      public: false,
      target: 1,
      accountabilityPartner: '',
      notes: '',
    });
    setShowModal(null);
    setEditMode(null);
  };

  const updateBusinessGoalProgress = (id: string, increment: number) => {
    setBusinessGoals(prev => prev.map(goal => {
      if (goal.id === id) {
        const newProgress = Math.max(0, Math.min(goal.target, goal.progress + increment));
        const wasComplete = goal.completed;
        const isNowComplete = newProgress >= goal.target;
        
        if (!wasComplete && isNowComplete) {
          dispatch({
            type: 'ADD_XP',
            payload: { amount: goal.xpReward, source: `Business Goal Completed: ${goal.title}` }
          });
          dispatch({
            type: 'ADD_NOTIFICATION',
            payload: {
              id: Date.now().toString(),
              type: 'achievement',
              title: 'Goal Achieved! 🎉',
              message: `Completed "${goal.title}"! +${goal.xpReward} XP`,
              timestamp: new Date(),
              read: false,
              priority: 'high',
            }
          });
        }
        
        return { ...goal, progress: newProgress, completed: isNowComplete };
      }
      return goal;
    }));
  };

  const updateCommitmentProgress = (id: string, increment: number) => {
    setCommitments(prev => prev.map(commitment => {
      if (commitment.id === id) {
        const target = commitment.target || 1;
        const newProgress = Math.max(0, Math.min(target, (commitment.progress || 0) + increment));
        const wasComplete = commitment.completed;
        const isNowComplete = newProgress >= target;
        
        if (!wasComplete && isNowComplete) {
          dispatch({
            type: 'ADD_XP',
            payload: { amount: commitment.xpReward, source: `Commitment Completed: ${commitment.title}` }
          });
          dispatch({
            type: 'ADD_NOTIFICATION',
            payload: {
              id: Date.now().toString(),
              type: 'achievement',
              title: 'Commitment Kept! 🎉',
              message: `Completed "${commitment.title}"! +${commitment.xpReward} XP`,
              timestamp: new Date(),
              read: false,
              priority: 'high',
            }
          });
        }
        
        return { ...commitment, progress: newProgress, completed: isNowComplete };
      }
      return commitment;
    }));
  };

  const deleteItem = (type: 'business' | 'application' | 'networking' | 'commitment', id: string) => {
    switch (type) {
      case 'business':
        setBusinessGoals(prev => prev.filter(g => g.id !== id));
        break;
      case 'application':
        setApplications(prev => prev.filter(a => a.id !== id));
        break;
      case 'networking':
        setNetworkingEvents(prev => prev.filter(e => e.id !== id));
        break;
      case 'commitment':
        setCommitments(prev => prev.filter(c => c.id !== id));
        break;
    }
  };

  const openEditModal = (type: ModalType, id: string) => {
    setEditMode({ type, id });
    
    switch (type) {
      case 'business': {
        const goal = businessGoals.find(g => g.id === id);
        if (goal) {
          setBusinessForm({
            title: goal.title,
            description: goal.description,
            targetDate: new Date(goal.targetDate).toISOString().split('T')[0],
            target: goal.target,
            xpReward: goal.xpReward,
            category: goal.category,
            notes: goal.notes || '',
          });
          setShowModal('business');
        }
        break;
      }
      case 'application': {
        const app = applications.find(a => a.id === id);
        if (app) {
          setApplicationForm({
            company: app.company,
            position: app.position,
            date: new Date(app.date).toISOString().split('T')[0],
            status: app.status,
            location: app.location || '',
            salary: app.salary || '',
            notes: app.notes || '',
            portal: app.portal || '',
            referral: app.referral || false,
          });
          setShowModal('application');
        }
        break;
      }
      case 'networking': {
        const event = networkingEvents.find(e => e.id === id);
        if (event) {
          setNetworkingForm({
            name: event.name,
            date: new Date(event.date).toISOString().split('T')[0],
            connections: event.connections,
            type: event.type,
            location: event.location || '',
            notes: event.notes || '',
          });
          setShowModal('networking');
        }
        break;
      }
      case 'commitment': {
        const commitment = commitments.find(c => c.id === id);
        if (commitment) {
          setCommitmentForm({
            title: commitment.title,
            description: commitment.description,
            deadline: new Date(commitment.deadline).toISOString().split('T')[0],
            xpReward: commitment.xpReward,
            public: commitment.public,
            target: commitment.target || 1,
            accountabilityPartner: commitment.accountabilityPartner || '',
            notes: commitment.notes || '',
          });
          setShowModal('commitment');
        }
        break;
      }
    }
  };

  const closeModal = () => {
    setShowModal(null);
    setEditMode(null);
    setHours(1);
    setBusinessForm({
      title: '',
      description: '',
      targetDate: new Date().toISOString().split('T')[0],
      target: 100,
      xpReward: 500,
      category: 'startup',
      notes: '',
    });
    setApplicationForm({
      company: '',
      position: '',
      date: new Date().toISOString().split('T')[0],
      status: 'applied',
      location: '',
      salary: '',
      notes: '',
      portal: '',
      referral: false,
    });
    setNetworkingForm({
      name: '',
      date: new Date().toISOString().split('T')[0],
      connections: 0,
      type: 'meetup',
      location: '',
      notes: '',
    });
    setCommitmentForm({
      title: '',
      description: '',
      deadline: new Date().toISOString().split('T')[0],
      xpReward: 300,
      public: false,
      target: 1,
      accountabilityPartner: '',
      notes: '',
    });
  };

  return (
    <div className="p-3 sm:p-4 lg:p-6 bg-[#0a0a0a] min-h-screen pb-20 lg:pb-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 font-mono flex items-center gap-3">
            <Shield className="text-red-500" size={36} />
            ACCOUNTABILITY <span className="text-red-400">⚠️</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-500 font-mono">
            // Track everything: punishments, business goals, internships, networking, and commitments
          </p>
        </motion.div>

        {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2 mb-6"
        >
          {[
            { id: 'punishments', label: 'Punishments', icon: <Skull size={16} />, count: timeWasters.length, color: 'red' },
            { id: 'business', label: 'Business', icon: <Briefcase size={16} />, count: stats.activeBusinessGoals, color: 'green' },
            { id: 'internships', label: 'Internships', icon: <Target size={16} />, count: stats.totalApplications, color: 'blue' },
            { id: 'networking', label: 'Networking', icon: <Users size={16} />, count: networkingEvents.length, color: 'purple' },
            { id: 'commitments', label: 'Commitments', icon: <CheckCircle size={16} />, count: commitments.length, color: 'cyan' },
          ].map(tab => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2 font-black border-2 brutal-shadow flex items-center gap-2 transition-all ${
                activeTab === tab.id
                  ? `bg-${tab.color}-500 text-black border-${tab.color}-400`
                  : 'bg-gray-800 text-white border-gray-700 hover:border-gray-600'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.count > 0 && (
                <span className={`px-2 py-0.5 rounded text-xs ${
                  activeTab === tab.id ? 'bg-black/20' : 'bg-gray-700'
                }`}>
                  {tab.count}
                </span>
              )}
            </motion.button>
          ))}
          </motion.div>

        {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 mb-6"
          >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="brutal-card bg-red-900/20 border-red-500/50 p-3 sm:p-4"
          >
            <TrendingDown className="text-red-400 mb-2" size={24} />
            <p className="text-[10px] sm:text-xs text-gray-500 font-mono uppercase">XP Lost</p>
            <p className="text-lg sm:text-xl font-black text-red-400 font-mono">-{stats.totalXPLost}</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="brutal-card bg-orange-900/20 border-orange-500/50 p-3 sm:p-4"
          >
            <Clock className="text-orange-400 mb-2" size={24} />
            <p className="text-[10px] sm:text-xs text-gray-500 font-mono uppercase">Hours Wasted</p>
            <p className="text-lg sm:text-xl font-black text-orange-400 font-mono">{stats.totalHoursWasted}h</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="brutal-card bg-blue-900/20 border-blue-500/50 p-3 sm:p-4"
          >
            <Briefcase className="text-blue-400 mb-2" size={24} />
            <p className="text-[10px] sm:text-xs text-gray-500 font-mono uppercase">Applications</p>
            <p className="text-lg sm:text-xl font-black text-blue-400 font-mono">{stats.totalApplications}</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="brutal-card bg-green-900/20 border-green-500/50 p-3 sm:p-4"
          >
            <Award className="text-green-400 mb-2" size={24} />
            <p className="text-[10px] sm:text-xs text-gray-500 font-mono uppercase">Offers</p>
            <p className="text-lg sm:text-xl font-black text-green-400 font-mono">{stats.totalOffers}</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="brutal-card bg-purple-900/20 border-purple-500/50 p-3 sm:p-4"
          >
            <Users className="text-purple-400 mb-2" size={24} />
            <p className="text-[10px] sm:text-xs text-gray-500 font-mono uppercase">Connections</p>
            <p className="text-lg sm:text-xl font-black text-purple-400 font-mono">{stats.totalConnections}</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="brutal-card bg-cyan-900/20 border-cyan-500/50 p-3 sm:p-4"
          >
            <CheckCircle className="text-cyan-400 mb-2" size={24} />
            <p className="text-[10px] sm:text-xs text-gray-500 font-mono uppercase">Commitments</p>
            <p className="text-lg sm:text-xl font-black text-cyan-400 font-mono">{stats.completedCommitments}/{stats.totalCommitments}</p>
          </motion.div>
        </motion.div>

        {/* Content based on active tab */}
        <AnimatePresence mode="wait">
          {activeTab === 'punishments' && (
            <motion.div
              key="punishments"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
                onClick={() => setShowModal('punishment')}
          className="brutal-card bg-red-500 hover:bg-red-600 border-red-400 text-black px-6 py-3 font-black mb-6 w-full sm:w-auto"
        >
          <span className="flex items-center gap-2">
            <AlertTriangle size={20} />
            LOG TIME WASTER
          </span>
        </motion.button>

        <div className="brutal-card bg-gray-900 border-gray-700 p-4">
          <h2 className="text-xl font-black text-white mb-4 font-mono">RECENT PUNISHMENTS</h2>
          
          {timeWasters.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="text-gray-600 mx-auto mb-4" size={64} />
              <p className="text-gray-500 font-mono">No punishments logged yet.</p>
              <p className="text-gray-600 text-sm font-mono mt-2">Stay disciplined! 💪</p>
            </div>
          ) : (
            <div className="space-y-3">
              {timeWasters.map((waster, index) => (
                <motion.div
                  key={waster.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="brutal-card bg-gray-800 border-red-500/30 p-4 hover:border-red-500/60 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <span className="text-4xl">{waster.icon}</span>
                      <div className="flex-1">
                        <h3 className="text-white font-bold">{waster.activity}</h3>
                        <div className="flex flex-wrap gap-3 mt-1 text-sm">
                          <span className="text-orange-400 font-mono">⏰ {waster.hours}h wasted</span>
                          <span className="text-red-400 font-mono">💔 -{waster.xpLost} XP</span>
                          <span className="text-gray-500 font-mono">
                                  📅 {new Date(waster.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeWaster(waster.id)}
                      className="p-2 bg-gray-700 hover:bg-red-600 rounded-lg transition-colors"
                      title="Remove (Refund XP)"
                    >
                      <X size={16} className="text-white" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
            </motion.div>
          )}

          {activeTab === 'business' && (
            <motion.div
              key="business"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="brutal-card bg-gray-900 border-gray-700 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-black text-white font-mono">BUSINESS GOALS</h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setEditMode(null);
                      setShowModal('business');
                    }}
                    className="px-4 py-2 bg-green-500 text-black font-black border-2 border-green-400 brutal-shadow flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Add Goal
                  </motion.button>
                </div>
                
                {stats.completedBusinessGoals > 0 && (
                  <div className="mb-4 p-3 bg-green-900/20 border-green-500/50 rounded">
                    <div className="flex items-center justify-between">
                      <span className="text-green-400 font-mono text-sm">Completed Goals</span>
                      <span className="text-green-400 font-black text-lg">{stats.completedBusinessGoals}</span>
                    </div>
                    {stats.totalRevenue > 0 && (
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-yellow-400 font-mono text-sm">Total Revenue</span>
                        <span className="text-yellow-400 font-black text-lg">${stats.totalRevenue.toLocaleString()}</span>
                      </div>
                    )}
                    {stats.totalCustomers > 0 && (
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-blue-400 font-mono text-sm">Total Customers</span>
                        <span className="text-blue-400 font-black text-lg">{stats.totalCustomers}</span>
                      </div>
                    )}
                  </div>
                )}
                
                {businessGoals.length === 0 ? (
                  <div className="text-center py-12">
                    <Briefcase className="text-gray-600 mx-auto mb-4" size={64} />
                    <p className="text-gray-500 font-mono">No business goals yet.</p>
                    <p className="text-gray-600 text-sm font-mono mt-2">Start tracking your business journey! 🚀</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {businessGoals.map((goal) => (
                      <motion.div
                        key={goal.id}
                        whileHover={{ scale: 1.01 }}
                        className={`brutal-card bg-gray-800 border-${goal.completed ? 'green' : 'green'}-500/30 p-4`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className={`text-white font-bold ${goal.completed ? 'line-through text-gray-500' : ''}`}>
                                {goal.title}
                              </h3>
                              {goal.completed && (
                                <CheckCircle className="text-green-400" size={20} />
                              )}
                              <span className={`text-xs px-2 py-1 rounded font-mono ${
                                goal.category === 'startup' ? 'bg-blue-500/20 text-blue-400' :
                                goal.category === 'revenue' ? 'bg-yellow-500/20 text-yellow-400' :
                                goal.category === 'customer' ? 'bg-purple-500/20 text-purple-400' :
                                'bg-green-500/20 text-green-400'
                              }`}>
                                {goal.category.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-gray-400 text-sm mt-1">{goal.description}</p>
                            <div className="mt-3 flex items-center gap-4 text-sm">
                              <span className="text-green-400">Progress: {goal.progress}/{goal.target}</span>
                              <span className="text-yellow-400">+{goal.xpReward} XP</span>
                              <span className="text-gray-500">
                                Due: {new Date(goal.targetDate).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="mt-2 h-2 bg-gray-700 rounded overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, (goal.progress / goal.target) * 100)}%` }}
                                className={`h-full ${goal.completed ? 'bg-green-500' : 'bg-green-400'}`}
                              />
                            </div>
                            {!goal.completed && (
                              <div className="mt-3 flex items-center gap-2">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => updateBusinessGoalProgress(goal.id, 1)}
                                  className="px-3 py-1 bg-green-500 text-black text-xs font-black border-2 border-green-400 brutal-shadow"
                                >
                                  +1
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => updateBusinessGoalProgress(goal.id, 5)}
                                  className="px-3 py-1 bg-green-600 text-white text-xs font-black border-2 border-green-500 brutal-shadow"
                                >
                                  +5
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => updateBusinessGoalProgress(goal.id, 10)}
                                  className="px-3 py-1 bg-green-700 text-white text-xs font-black border-2 border-green-600 brutal-shadow"
                                >
                                  +10
                                </motion.button>
                              </div>
                            )}
                            {goal.notes && (
                              <p className="text-gray-500 text-xs mt-2 italic">{goal.notes}</p>
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => openEditModal('business', goal.id)}
                              className="p-2 bg-gray-700 hover:bg-blue-600 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={16} className="text-white" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => deleteItem('business', goal.id)}
                              className="p-2 bg-gray-700 hover:bg-red-600 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} className="text-white" />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'internships' && (
            <motion.div
              key="internships"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="brutal-card bg-gray-900 border-gray-700 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-black text-white font-mono">INTERNSHIP APPLICATIONS</h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setEditMode(null);
                      setShowModal('application');
                    }}
                    className="px-4 py-2 bg-blue-500 text-black font-black border-2 border-blue-400 brutal-shadow flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Add Application
                  </motion.button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div className="brutal-card bg-blue-900/20 border-blue-500/50 p-3">
                    <p className="text-xs text-gray-400 font-mono">Total Applied</p>
                    <p className="text-2xl font-black text-blue-400">{stats.totalApplications}</p>
                  </div>
                  <div className="brutal-card bg-yellow-900/20 border-yellow-500/50 p-3">
                    <p className="text-xs text-gray-400 font-mono">Interviews</p>
                    <p className="text-2xl font-black text-yellow-400">{stats.totalInterviews}</p>
                  </div>
                  <div className="brutal-card bg-green-900/20 border-green-500/50 p-3">
                    <p className="text-xs text-gray-400 font-mono">Offers</p>
                    <p className="text-2xl font-black text-green-400">{stats.totalOffers}</p>
                  </div>
                </div>
                {applications.length === 0 ? (
                  <div className="text-center py-12">
                    <Target className="text-gray-600 mx-auto mb-4" size={64} />
                    <p className="text-gray-500 font-mono">No applications tracked yet.</p>
                    <p className="text-gray-600 text-sm font-mono mt-2">Start applying! 🎯</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {applications
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((app) => (
                      <motion.div
                        key={app.id}
                        whileHover={{ scale: 1.01 }}
                        className={`brutal-card bg-gray-800 border-${
                          app.status === 'offer' ? 'green' : 
                          app.status === 'interview' ? 'yellow' : 
                          app.status === 'rejected' ? 'red' :
                          'blue'
                        }-500/30 p-4`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-white font-bold text-lg">{app.company}</h3>
                              <span className={`text-xs px-2 py-1 rounded font-mono font-black ${
                                app.status === 'offer' ? 'bg-green-500/20 text-green-400 border border-green-500/50' :
                                app.status === 'interview' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' :
                                app.status === 'rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/50' :
                                'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                              }`}>
                                {app.status.toUpperCase()}
                              </span>
                              {app.referral && (
                                <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">REFERRAL</span>
                              )}
                            </div>
                            <p className="text-gray-300 font-medium">{app.position}</p>
                            {app.location && (
                              <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
                                <MapPin size={12} />
                                {app.location}
                              </p>
                            )}
                            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
                              <span className="text-gray-500 font-mono">
                                📅 {new Date(app.date).toLocaleDateString()}
                              </span>
                              <span className="text-lime-400 font-mono">+{app.xpEarned} XP</span>
                              {app.salary && (
                                <span className="text-yellow-400 font-mono">💰 {app.salary}</span>
                              )}
                              {app.portal && (
                                <span className="text-blue-400 text-xs font-mono">🔗 {app.portal}</span>
                              )}
                            </div>
                            {app.notes && (
                              <p className="text-gray-500 text-xs mt-2 italic">{app.notes}</p>
                            )}
                            {app.interviewDate && (
                              <p className="text-yellow-400 text-xs mt-2">
                                🎤 Interview: {new Date(app.interviewDate).toLocaleDateString()}
                              </p>
                            )}
                            {app.offerDate && (
                              <p className="text-green-400 text-xs mt-2 font-bold">
                                🎉 Offer received: {new Date(app.offerDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => openEditModal('application', app.id)}
                              className="p-2 bg-gray-700 hover:bg-blue-600 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={16} className="text-white" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => deleteItem('application', app.id)}
                              className="p-2 bg-gray-700 hover:bg-red-600 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} className="text-white" />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'networking' && (
            <motion.div
              key="networking"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="brutal-card bg-gray-900 border-gray-700 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-black text-white font-mono">NETWORKING EVENTS</h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setEditMode(null);
                      setShowModal('networking');
                    }}
                    className="px-4 py-2 bg-purple-500 text-black font-black border-2 border-purple-400 brutal-shadow flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Add Event
                  </motion.button>
                </div>
                {networkingEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="text-gray-600 mx-auto mb-4" size={64} />
                    <p className="text-gray-500 font-mono">No networking events tracked yet.</p>
                    <p className="text-gray-600 text-sm font-mono mt-2">Start networking! 🤝</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {networkingEvents
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((event) => (
                      <motion.div
                        key={event.id}
                        whileHover={{ scale: 1.01 }}
                        className="brutal-card bg-gray-800 border-purple-500/30 p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-white font-bold text-lg">{event.name}</h3>
                              <span className={`text-xs px-2 py-1 rounded font-mono ${
                                event.type === 'conference' ? 'bg-blue-500/20 text-blue-400' :
                                event.type === 'meetup' ? 'bg-green-500/20 text-green-400' :
                                event.type === 'online' ? 'bg-purple-500/20 text-purple-400' :
                                'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {event.type.toUpperCase()}
                              </span>
                            </div>
                            {event.location && (
                              <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
                                <MapPin size={12} />
                                {event.location}
                              </p>
                            )}
                            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
                              <span className="text-purple-400 font-mono font-bold">
                                👥 {event.connections} connections
                              </span>
                              <span className="text-gray-500 font-mono">
                                📅 {new Date(event.date).toLocaleDateString()}
                              </span>
                              <span className="text-lime-400 font-mono">+{event.xpEarned} XP</span>
                            </div>
                            {event.notes && (
                              <p className="text-gray-500 text-xs mt-2 italic">{event.notes}</p>
                            )}
                            {event.contacts && event.contacts.length > 0 && (
                              <div className="mt-2 p-2 bg-gray-700/50 rounded">
                                <p className="text-xs text-gray-400 mb-1">Contacts:</p>
                                {event.contacts.map((contact, idx) => (
                                  <div key={idx} className="text-xs text-gray-300">
                                    {contact.name}
                                    {contact.linkedin && <span className="text-blue-400 ml-2">🔗 LinkedIn</span>}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => openEditModal('networking', event.id)}
                              className="p-2 bg-gray-700 hover:bg-purple-600 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={16} className="text-white" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => deleteItem('networking', event.id)}
                              className="p-2 bg-gray-700 hover:bg-red-600 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} className="text-white" />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'commitments' && (
            <motion.div
              key="commitments"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="brutal-card bg-gray-900 border-gray-700 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-black text-white font-mono">PUBLIC COMMITMENTS</h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setEditMode(null);
                      setShowModal('commitment');
                    }}
                    className="px-4 py-2 bg-cyan-500 text-black font-black border-2 border-cyan-400 brutal-shadow flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Make Commitment
                  </motion.button>
                </div>
                {commitments.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="text-gray-600 mx-auto mb-4" size={64} />
                    <p className="text-gray-500 font-mono">No public commitments yet.</p>
                    <p className="text-gray-600 text-sm font-mono mt-2">Make a commitment and stick to it! ⚖️</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {commitments
                      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
                      .map((commitment) => {
                        const daysUntilDeadline = Math.ceil(
                          (new Date(commitment.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                        );
                        const isOverdue = daysUntilDeadline < 0 && !commitment.completed;
                        
                        return (
                          <motion.div
                            key={commitment.id}
                            whileHover={{ scale: 1.01 }}
                            className={`brutal-card bg-gray-800 border-${
                              commitment.completed ? 'green' : 
                              isOverdue ? 'red' :
                              'cyan'
                            }-500/30 p-4`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className={`text-white font-bold ${commitment.completed ? 'line-through text-gray-500' : ''}`}>
                                    {commitment.title}
                                  </h3>
                                  {commitment.completed && (
                                    <CheckCircle className="text-green-400" size={20} />
                                  )}
                                  {commitment.public && (
                                    <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded">PUBLIC</span>
                                  )}
                                  {isOverdue && !commitment.completed && (
                                    <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded font-black">OVERDUE</span>
                                  )}
                                </div>
                                <p className="text-gray-400 text-sm mt-1">{commitment.description}</p>
                                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                                  <span className={`font-mono ${
                                    isOverdue && !commitment.completed ? 'text-red-400' :
                                    daysUntilDeadline <= 3 && !commitment.completed ? 'text-yellow-400' :
                                    'text-gray-500'
                                  }`}>
                                    📅 Deadline: {new Date(commitment.deadline).toLocaleDateString()}
                                    {!commitment.completed && (
                                      <span className="ml-2">
                                        ({daysUntilDeadline > 0 ? `${daysUntilDeadline} days left` : `${Math.abs(daysUntilDeadline)} days overdue`})
                                      </span>
                                    )}
                                  </span>
                                  <span className="text-yellow-400 font-mono">+{commitment.xpReward} XP</span>
                                  {commitment.accountabilityPartner && (
                                    <span className="text-purple-400 text-xs">🤝 Partner: {commitment.accountabilityPartner}</span>
                                  )}
                                </div>
                                {commitment.target && commitment.target > 1 && (
                                  <>
                                    <div className="mt-2 flex items-center gap-2 text-sm">
                                      <span className="text-cyan-400">Progress: {commitment.progress || 0}/{commitment.target}</span>
                                    </div>
                                    <div className="mt-2 h-2 bg-gray-700 rounded overflow-hidden">
                                      <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, ((commitment.progress || 0) / commitment.target) * 100)}%` }}
                                        className={`h-full ${commitment.completed ? 'bg-green-500' : 'bg-cyan-400'}`}
                                      />
                                    </div>
                                    {!commitment.completed && (
                                      <div className="mt-2 flex items-center gap-2">
                                        <motion.button
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                          onClick={() => updateCommitmentProgress(commitment.id, 1)}
                                          className="px-3 py-1 bg-cyan-500 text-black text-xs font-black border-2 border-cyan-400 brutal-shadow"
                                        >
                                          +1
                                        </motion.button>
                                      </div>
                                    )}
                                  </>
                                )}
                                {commitment.notes && (
                                  <p className="text-gray-500 text-xs mt-2 italic">{commitment.notes}</p>
                                )}
                              </div>
                              <div className="flex flex-col gap-2">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => openEditModal('commitment', commitment.id)}
                                  className="p-2 bg-gray-700 hover:bg-cyan-600 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <Edit2 size={16} className="text-white" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => deleteItem('commitment', commitment.id)}
                                  className="p-2 bg-gray-700 hover:bg-red-600 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={16} className="text-white" />
                                </motion.button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modals */}
        <AnimatePresence>
          {showModal === 'punishment' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="brutal-card bg-gray-900 border-red-500 p-6 max-w-md w-full"
            >
              <h2 className="text-2xl font-black text-white mb-4 font-mono flex items-center gap-2">
                <AlertTriangle className="text-red-500" />
                LOG TIME WASTER
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 font-mono block mb-2">ACTIVITY</label>
                  <select
                    value={selectedActivity.name}
                    onChange={e => setSelectedActivity(timeWasterTypes.find(t => t.name === e.target.value)!)}
                    className="w-full bg-gray-800 border-2 border-gray-700 text-white p-3 font-mono focus:border-red-500 outline-none"
                  >
                    {timeWasterTypes.map(type => (
                      <option key={type.name} value={type.name}>
                        {type.icon} {type.name} ({type.xpPerHour} XP/hour)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-400 font-mono block mb-2">HOURS WASTED</label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={hours}
                      onChange={e => setHours(parseFloat(e.target.value) || 0)}
                    className="w-full bg-gray-800 border-2 border-gray-700 text-white p-3 font-mono focus:border-red-500 outline-none"
                  />
                </div>

                <div className="brutal-card bg-red-900/30 border-red-500/50 p-4">
                  <p className="text-red-400 font-mono text-sm">
                    ⚠️ You will lose <span className="font-black text-lg">{Math.abs(selectedActivity.xpPerHour * hours)} XP</span>
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={addTimeWaster}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-black font-black py-3 px-4 border-2 border-red-400 brutal-shadow"
                  >
                    ACCEPT PUNISHMENT
                  </button>
                  <button
                      onClick={closeModal}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-black py-3 px-4 border-2 border-gray-600 brutal-shadow"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

          {showModal === 'business' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={closeModal}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="brutal-card bg-gray-900 border-green-500 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <h2 className="text-2xl font-black text-white mb-4 font-mono flex items-center gap-2">
                  <Briefcase className="text-green-500" />
                  {editMode ? 'EDIT BUSINESS GOAL' : 'ADD BUSINESS GOAL'}
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 font-mono block mb-2">TITLE *</label>
                    <input
                      type="text"
                      value={businessForm.title}
                      onChange={e => setBusinessForm({ ...businessForm, title: e.target.value })}
                      className="w-full bg-gray-800 border-2 border-gray-700 text-white p-3 font-mono focus:border-green-500 outline-none"
                      placeholder="e.g., Launch MVP"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 font-mono block mb-2">DESCRIPTION</label>
                    <textarea
                      value={businessForm.description}
                      onChange={e => setBusinessForm({ ...businessForm, description: e.target.value })}
                      className="w-full bg-gray-800 border-2 border-gray-700 text-white p-3 font-mono focus:border-green-500 outline-none h-24"
                      placeholder="Describe your business goal..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 font-mono block mb-2">TARGET DATE</label>
                      <input
                        type="date"
                        value={businessForm.targetDate}
                        onChange={e => setBusinessForm({ ...businessForm, targetDate: e.target.value })}
                        className="w-full bg-gray-800 border-2 border-gray-700 text-white p-3 font-mono focus:border-green-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 font-mono block mb-2">TARGET VALUE</label>
                      <input
                        type="number"
                        value={businessForm.target}
                        onChange={e => setBusinessForm({ ...businessForm, target: parseInt(e.target.value) || 0 })}
                        className="w-full bg-gray-800 border-2 border-gray-700 text-white p-3 font-mono focus:border-green-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 font-mono block mb-2">CATEGORY</label>
                      <select
                        value={businessForm.category}
                        onChange={e => setBusinessForm({ ...businessForm, category: e.target.value as BusinessGoal['category'] })}
                        className="w-full bg-gray-800 border-2 border-gray-700 text-white p-3 font-mono focus:border-green-500 outline-none"
                      >
                        <option value="startup">Startup</option>
                        <option value="revenue">Revenue</option>
                        <option value="customer">Customer</option>
                        <option value="product">Product</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 font-mono block mb-2">XP REWARD</label>
                      <input
                        type="number"
                        value={businessForm.xpReward}
                        onChange={e => setBusinessForm({ ...businessForm, xpReward: parseInt(e.target.value) || 0 })}
                        className="w-full bg-gray-800 border-2 border-gray-700 text-white p-3 font-mono focus:border-green-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 font-mono block mb-2">NOTES</label>
                    <textarea
                      value={businessForm.notes}
                      onChange={e => setBusinessForm({ ...businessForm, notes: e.target.value })}
                      className="w-full bg-gray-800 border-2 border-gray-700 text-white p-3 font-mono focus:border-green-500 outline-none h-20"
                      placeholder="Additional notes..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleAddBusinessGoal}
                      disabled={!businessForm.title.trim()}
                      className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-700 disabled:text-gray-500 text-black font-black py-3 px-4 border-2 border-green-400 brutal-shadow"
                    >
                      {editMode ? 'UPDATE GOAL' : 'CREATE GOAL'}
                    </button>
                    <button
                      onClick={closeModal}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-black py-3 px-4 border-2 border-gray-600 brutal-shadow"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {showModal === 'application' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={closeModal}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="brutal-card bg-gray-900 border-blue-500 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <h2 className="text-2xl font-black text-white mb-4 font-mono flex items-center gap-2">
                  <Target className="text-blue-500" />
                  {editMode ? 'EDIT APPLICATION' : 'ADD INTERNSHIP APPLICATION'}
                </h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 font-mono block mb-2">COMPANY *</label>
                      <input
                        type="text"
                        value={applicationForm.company}
                        onChange={e => setApplicationForm({ ...applicationForm, company: e.target.value })}
                        className="w-full bg-gray-800 border-2 border-gray-700 text-white p-3 font-mono focus:border-blue-500 outline-none"
                        placeholder="e.g., Google"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 font-mono block mb-2">POSITION *</label>
                      <input
                        type="text"
                        value={applicationForm.position}
                        onChange={e => setApplicationForm({ ...applicationForm, position: e.target.value })}
                        className="w-full bg-gray-800 border-2 border-gray-700 text-white p-3 font-mono focus:border-blue-500 outline-none"
                        placeholder="e.g., Software Engineering Intern"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 font-mono block mb-2">APPLICATION DATE</label>
                      <input
                        type="date"
                        value={applicationForm.date}
                        onChange={e => setApplicationForm({ ...applicationForm, date: e.target.value })}
                        className="w-full bg-gray-800 border-2 border-gray-700 text-white p-3 font-mono focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 font-mono block mb-2">STATUS</label>
                      <select
                        value={applicationForm.status}
                        onChange={e => setApplicationForm({ ...applicationForm, status: e.target.value as InternshipApplication['status'] })}
                        className="w-full bg-gray-800 border-2 border-gray-700 text-white p-3 font-mono focus:border-blue-500 outline-none"
                      >
                        <option value="applied">Applied</option>
                        <option value="interview">Interview</option>
                        <option value="offer">Offer</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 font-mono block mb-2">LOCATION</label>
                      <input
                        type="text"
                        value={applicationForm.location}
                        onChange={e => setApplicationForm({ ...applicationForm, location: e.target.value })}
                        className="w-full bg-gray-800 border-2 border-gray-700 text-white p-3 font-mono focus:border-blue-500 outline-none"
                        placeholder="e.g., Remote, San Francisco"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 font-mono block mb-2">SALARY/STIPEND</label>
                      <input
                        type="text"
                        value={applicationForm.salary}
                        onChange={e => setApplicationForm({ ...applicationForm, salary: e.target.value })}
                        className="w-full bg-gray-800 border-2 border-gray-700 text-white p-3 font-mono focus:border-blue-500 outline-none"
                        placeholder="e.g., $50/hr"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 font-mono block mb-2">APPLICATION PORTAL</label>
                    <input
                      type="text"
                      value={applicationForm.portal}
                      onChange={e => setApplicationForm({ ...applicationForm, portal: e.target.value })}
                      className="w-full bg-gray-800 border-2 border-gray-700 text-white p-3 font-mono focus:border-blue-500 outline-none"
                      placeholder="e.g., LinkedIn, Company Website"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={applicationForm.referral}
                      onChange={e => setApplicationForm({ ...applicationForm, referral: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label className="text-sm text-gray-400 font-mono">Applied with referral</label>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 font-mono block mb-2">NOTES</label>
                    <textarea
                      value={applicationForm.notes}
                      onChange={e => setApplicationForm({ ...applicationForm, notes: e.target.value })}
                      className="w-full bg-gray-800 border-2 border-gray-700 text-white p-3 font-mono focus:border-blue-500 outline-none h-20"
                      placeholder="Additional notes about the application..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleAddApplication}
                      disabled={!applicationForm.company.trim() || !applicationForm.position.trim()}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 disabled:text-gray-500 text-black font-black py-3 px-4 border-2 border-blue-400 brutal-shadow"
                    >
                      {editMode ? 'UPDATE APPLICATION' : 'ADD APPLICATION'}
                    </button>
                    <button
                      onClick={closeModal}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-black py-3 px-4 border-2 border-gray-600 brutal-shadow"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {showModal === 'networking' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={closeModal}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="brutal-card bg-gray-900 border-purple-500 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <h2 className="text-2xl font-black text-white mb-4 font-mono flex items-center gap-2">
                  <Users className="text-purple-500" />
                  {editMode ? 'EDIT NETWORKING EVENT' : 'ADD NETWORKING EVENT'}
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 font-mono block mb-2">EVENT NAME *</label>
                    <input
                      type="text"
                      value={networkingForm.name}
                      onChange={e => setNetworkingForm({ ...networkingForm, name: e.target.value })}
                      className="w-full bg-gray-800 border-2 border-gray-700 text-white p-3 font-mono focus:border-purple-500 outline-none"
                      placeholder="e.g., Tech Meetup SF"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 font-mono block mb-2">DATE</label>
                      <input
                        type="date"
                        value={networkingForm.date}
                        onChange={e => setNetworkingForm({ ...networkingForm, date: e.target.value })}
                        className="w-full bg-gray-800 border-2 border-gray-700 text-white p-3 font-mono focus:border-purple-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 font-mono block mb-2">TYPE</label>
                      <select
                        value={networkingForm.type}
                        onChange={e => setNetworkingForm({ ...networkingForm, type: e.target.value as NetworkingEvent['type'] })}
                        className="w-full bg-gray-800 border-2 border-gray-700 text-white p-3 font-mono focus:border-purple-500 outline-none"
                      >
                        <option value="meetup">Meetup</option>
                        <option value="conference">Conference</option>
                        <option value="online">Online</option>
                        <option value="coffee">Coffee Chat</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 font-mono block mb-2">CONNECTIONS MADE</label>
                      <input
                        type="number"
                        min="0"
                        value={networkingForm.connections}
                        onChange={e => setNetworkingForm({ ...networkingForm, connections: parseInt(e.target.value) || 0 })}
                        className="w-full bg-gray-800 border-2 border-gray-700 text-white p-3 font-mono focus:border-purple-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 font-mono block mb-2">LOCATION</label>
                      <input
                        type="text"
                        value={networkingForm.location}
                        onChange={e => setNetworkingForm({ ...networkingForm, location: e.target.value })}
                        className="w-full bg-gray-800 border-2 border-gray-700 text-white p-3 font-mono focus:border-purple-500 outline-none"
                        placeholder="e.g., San Francisco, CA"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 font-mono block mb-2">NOTES</label>
                    <textarea
                      value={networkingForm.notes}
                      onChange={e => setNetworkingForm({ ...networkingForm, notes: e.target.value })}
                      className="w-full bg-gray-800 border-2 border-gray-700 text-white p-3 font-mono focus:border-purple-500 outline-none h-20"
                      placeholder="Notes about the event, key takeaways..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleAddNetworkingEvent}
                      disabled={!networkingForm.name.trim()}
                      className="flex-1 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-700 disabled:text-gray-500 text-black font-black py-3 px-4 border-2 border-purple-400 brutal-shadow"
                    >
                      {editMode ? 'UPDATE EVENT' : 'ADD EVENT'}
                    </button>
                    <button
                      onClick={closeModal}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-black py-3 px-4 border-2 border-gray-600 brutal-shadow"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {showModal === 'commitment' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={closeModal}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="brutal-card bg-gray-900 border-cyan-500 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <h2 className="text-2xl font-black text-white mb-4 font-mono flex items-center gap-2">
                  <CheckCircle className="text-cyan-500" />
                  {editMode ? 'EDIT COMMITMENT' : 'MAKE PUBLIC COMMITMENT'}
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 font-mono block mb-2">TITLE *</label>
                    <input
                      type="text"
                      value={commitmentForm.title}
                      onChange={e => setCommitmentForm({ ...commitmentForm, title: e.target.value })}
                      className="w-full bg-gray-800 border-2 border-gray-700 text-white p-3 font-mono focus:border-cyan-500 outline-none"
                      placeholder="e.g., Complete 100 LeetCode problems"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 font-mono block mb-2">DESCRIPTION</label>
                    <textarea
                      value={commitmentForm.description}
                      onChange={e => setCommitmentForm({ ...commitmentForm, description: e.target.value })}
                      className="w-full bg-gray-800 border-2 border-gray-700 text-white p-3 font-mono focus:border-cyan-500 outline-none h-24"
                      placeholder="Describe your commitment..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 font-mono block mb-2">DEADLINE</label>
                      <input
                        type="date"
                        value={commitmentForm.deadline}
                        onChange={e => setCommitmentForm({ ...commitmentForm, deadline: e.target.value })}
                        className="w-full bg-gray-800 border-2 border-gray-700 text-white p-3 font-mono focus:border-cyan-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 font-mono block mb-2">TARGET (if applicable)</label>
                      <input
                        type="number"
                        min="1"
                        value={commitmentForm.target}
                        onChange={e => setCommitmentForm({ ...commitmentForm, target: parseInt(e.target.value) || 1 })}
                        className="w-full bg-gray-800 border-2 border-gray-700 text-white p-3 font-mono focus:border-cyan-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 font-mono block mb-2">XP REWARD</label>
                      <input
                        type="number"
                        value={commitmentForm.xpReward}
                        onChange={e => setCommitmentForm({ ...commitmentForm, xpReward: parseInt(e.target.value) || 0 })}
                        className="w-full bg-gray-800 border-2 border-gray-700 text-white p-3 font-mono focus:border-cyan-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 font-mono block mb-2">ACCOUNTABILITY PARTNER</label>
                      <input
                        type="text"
                        value={commitmentForm.accountabilityPartner}
                        onChange={e => setCommitmentForm({ ...commitmentForm, accountabilityPartner: e.target.value })}
                        className="w-full bg-gray-800 border-2 border-gray-700 text-white p-3 font-mono focus:border-cyan-500 outline-none"
                        placeholder="Name or username"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={commitmentForm.public}
                      onChange={e => setCommitmentForm({ ...commitmentForm, public: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label className="text-sm text-gray-400 font-mono">Make this commitment public</label>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 font-mono block mb-2">NOTES</label>
                    <textarea
                      value={commitmentForm.notes}
                      onChange={e => setCommitmentForm({ ...commitmentForm, notes: e.target.value })}
                      className="w-full bg-gray-800 border-2 border-gray-700 text-white p-3 font-mono focus:border-cyan-500 outline-none h-20"
                      placeholder="Additional notes..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleAddCommitment}
                      disabled={!commitmentForm.title.trim()}
                      className="flex-1 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-700 disabled:text-gray-500 text-black font-black py-3 px-4 border-2 border-cyan-400 brutal-shadow"
                    >
                      {editMode ? 'UPDATE COMMITMENT' : 'MAKE COMMITMENT'}
                    </button>
                    <button
                      onClick={closeModal}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-black py-3 px-4 border-2 border-gray-600 brutal-shadow"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
