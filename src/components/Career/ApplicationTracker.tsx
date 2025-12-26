import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../contexts/AppContext';
import { InternshipApplication } from '../../types';
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Plus, 
  Search,
  DollarSign,
  ExternalLink,
  Trash2,
  Edit2,
  Trophy,
  Tag,
  CalendarCheck,
  ClipboardList,
  Upload,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import toast from 'react-hot-toast';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Legend, LineChart, Line, CartesianGrid } from 'recharts';
import { appDataService } from '../../services/appDataService';

export function ApplicationTracker() {
  const { state, dispatch } = useApp();
  const { user, darkMode } = state;
  const [applications, setApplications] = useState<InternshipApplication[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date_desc');
  const [kanbanMode, setKanbanMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [tagFilter, setTagFilter] = useState<string>('');
  const appsLoadedRef = useRef(false);
  
  // Extras per application (tags, interviews, checklist, reminders)
  interface InterviewEvent { id: string; dateISO: string; type: string; notes?: string }
  interface ChecklistItem { id: string; title: string; done: boolean }
  interface Reminder { id: string; title: string; dueISO: string }
  interface Extras { tags: string[]; interviews: InterviewEvent[]; checklist: ChecklistItem[]; reminders: Reminder[] }
  type StoredApplication = Omit<InternshipApplication, 'dateApplied'> & { dateApplied: string | Date };
  const [extrasMap, setExtrasMap] = useState<Record<string, Extras>>({});
  const [accountabilityData, setAccountabilityData] = useState<Record<string, unknown>>({});
  
  // Form state
  const [newApp, setNewApp] = useState<Partial<InternshipApplication>>({
    status: 'Applied',
    dateApplied: new Date(),
  });

  useEffect(() => {
    setLoading(true);
    try {
      const mapStatus = (s: string | undefined) => {
        const t = String(s || 'Applied').toLowerCase();
        if (t === 'applied') return 'Applied';
        if (t === 'screening') return 'Screening';
        if (t === 'interviewing' || t === 'interview') return 'Interviewing';
        if (t === 'offer') return 'Offer';
        if (t === 'accepted') return 'Accepted';
        if (t === 'rejected') return 'Rejected';
        return 'Applied';
      };

      const tryLoad = async () => {
        if (user?.id) {
          const data = await appDataService.getAppData(user.id);
          const backendApps = (data?.accountabilityData as { internshipApplications?: StoredApplication[] } | undefined)?.internshipApplications;
          if (backendApps && Array.isArray(backendApps)) {
            const normalized = backendApps.map((a: StoredApplication) => ({
              ...a,
              status: mapStatus(a.status),
              dateApplied: new Date(a.dateApplied),
            }));
            setApplications(normalized);
            appsLoadedRef.current = true;
            return;
          }
        }
        const local = typeof window !== 'undefined' ? window.localStorage.getItem('internshipApps') : null;
        if (local) {
          const parsed = JSON.parse(local) as InternshipApplication[];
          const normalized = parsed.map(a => ({ 
            ...a, 
            status: mapStatus(a.status),
            dateApplied: new Date(a.dateApplied) 
          }));
          setApplications(normalized);
          appsLoadedRef.current = true;
        } else if (user?.internships) {
          const normalized = user.internships.map(a => ({ ...a, status: mapStatus(a.status) }));
          setApplications(normalized);
          appsLoadedRef.current = true;
        } else {
          setApplications([]);
          appsLoadedRef.current = true;
        }
      };
      tryLoad().finally(() => setLoading(false));
    } catch {
      toast.error('Failed to load applications');
      setApplications(user?.internships || []);
      setLoading(false);
    }
  }, [user?.id]);

  // Load extras
  useEffect(() => {
    try {
      const loadBackend = async () => {
        if (user?.id) {
          const data = await appDataService.getAppData(user.id);
          if (data?.accountabilityData) {
            setAccountabilityData(data.accountabilityData as Record<string, unknown>);
            const backendExtras = (data.accountabilityData as { internshipExtras?: Record<string, Extras> } | undefined)?.internshipExtras;
            if (backendExtras && typeof backendExtras === 'object') {
              setExtrasMap(backendExtras as Record<string, Extras>);
              extrasLoadedRef.current = true;
              return;
            }
          }
        }
        const raw = typeof window !== 'undefined' ? window.localStorage.getItem('internshipExtras_v1') : null;
        if (raw) {
          setExtrasMap(JSON.parse(raw));
          extrasLoadedRef.current = true;
        }
      };
      loadBackend();
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      if (!appsLoadedRef.current) return;
      if (typeof window !== 'undefined') {
        const serializable = applications.map(a => ({ ...a, dateApplied: a.dateApplied instanceof Date ? a.dateApplied.toISOString() : a.dateApplied }));
        window.localStorage.setItem('internshipApps', JSON.stringify(serializable));
      }
    } catch {
      toast.error('Could not persist applications');
    }
  }, [applications]);

  // Persist extras
  const extrasLoadedRef = useRef(false);
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('internshipExtras_v1', JSON.stringify(extrasMap));
      }
      if (user?.id) {
        const nextAcc = { ...accountabilityData, internshipExtras: extrasMap };
        appDataService.updateAppDataField(user.id, 'accountabilityData', nextAcc).then(() => {
          setAccountabilityData(nextAcc as Record<string, unknown>);
        }).catch(() => {
          // ignore backend save failures; localStorage remains as backup
        });
      }
    } catch {
      // ignore
    }
  }, [extrasMap, user?.id, accountabilityData]);

  // Dynamic Stats
  const stats = useMemo(() => {
    return {
      total: applications.length,
      interviewing: applications.filter(app => app.status === 'Interviewing').length,
      offers: applications.filter(app => app.status === 'Offer' || app.status === 'Accepted').length,
      rejected: applications.filter(app => app.status === 'Rejected').length,
    };
  }, [applications]);
  
  const statusChartData = useMemo(() => {
    const statuses: Array<InternshipApplication['status']> = ['Applied','Screening','Interviewing','Offer','Accepted','Rejected'];
    return statuses.map(s => ({
      name: s,
      count: applications.filter(a => a.status === s).length,
    }));
  }, [applications]);

  const getExtras = (id: string): Extras => extrasMap[id] || { tags: [], interviews: [], checklist: [], reminders: [] };
  const upsertExtras = (id: string, update: Partial<Extras>) => {
    setExtrasMap(prev => {
      const base = getExtras(id);
      return { ...prev, [id]: { ...base, ...update } };
    });
  };

  const handleAddApplication = async () => {
    if (!newApp.company || !newApp.role) {
      toast.error('Company and Role are required');
      return;
    }
    const duplicate = applications.find(a => a.company?.toLowerCase() === (newApp.company || '').toLowerCase() && a.role?.toLowerCase() === (newApp.role || '').toLowerCase());
    if (duplicate) {
      toast.error('Duplicate application detected');
      return;
    }
    const application: InternshipApplication = {
      id: Math.random().toString(36).slice(2),
      company: newApp.company || '',
      role: newApp.role || '',
      status: (newApp.status as string) || 'Applied',
      dateApplied: newApp.dateApplied ? new Date(newApp.dateApplied) : new Date(),
      location: newApp.location,
      salary: newApp.salary,
      notes: newApp.notes,
      link: newApp.link,
    } as InternshipApplication;
    const updatedApplications = [...applications, application];
    setApplications(updatedApplications);
    try {
      const serializable = updatedApplications.map(a => ({
        ...a,
        dateApplied: a.dateApplied instanceof Date ? a.dateApplied.toISOString() : a.dateApplied,
      }));
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('internshipApps', JSON.stringify(serializable));
      }
      if (user?.id) {
        const nextAcc = { ...accountabilityData, internshipApplications: serializable };
        await appDataService.updateAppDataField(user.id, 'accountabilityData', nextAcc);
        setAccountabilityData(nextAcc as Record<string, unknown>);
      }
    } catch {
      // ignore
    }
    upsertExtras(application.id, { tags: [], interviews: [], checklist: [], reminders: [] });
    if (user) {
      const updatedUser = { ...user, internships: updatedApplications };
      dispatch({ type: 'SET_USER', payload: updatedUser });
    }
    dispatch({ type: 'ADD_XP', payload: { amount: 20, source: 'Internship: Application Added' } });
    dispatch({ type: 'UPDATE_ENERGY', payload: { amount: -2 } });
    dispatch({ type: 'UPDATE_STATS', payload: { totalApplications: (state.careerStats.totalApplications || 0) + 1 } });
    setIsAddModalOpen(false);
    setNewApp({ status: 'Applied', dateApplied: new Date() });
    toast.success('Application added');
  };

  const startEdit = (id: string) => {
    const target = applications.find(a => a.id === id);
    if (!target) return;
    setEditId(id);
    setNewApp({
      company: target.company,
      role: target.role,
      status: target.status,
      dateApplied: target.dateApplied,
      location: target.location,
      salary: target.salary,
      notes: target.notes,
      link: target.link,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editId) return;
    if (!newApp.company || !newApp.role) {
      toast.error('Company and Role are required');
      return;
    }
    const updated = applications.map(a => a.id === editId ? {
      ...a,
      company: newApp.company || '',
      role: newApp.role || '',
      status: (newApp.status as string) || a.status,
      dateApplied: newApp.dateApplied ? new Date(newApp.dateApplied) : a.dateApplied,
      location: newApp.location,
      salary: newApp.salary,
      notes: newApp.notes,
      link: newApp.link,
    } : a);
    setApplications(updated);
    try {
      const serializable = updated.map(a => ({
        ...a,
        dateApplied: a.dateApplied instanceof Date ? a.dateApplied.toISOString() : a.dateApplied,
      }));
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('internshipApps', JSON.stringify(serializable));
      }
      if (user?.id) {
        const nextAcc = { ...accountabilityData, internshipApplications: serializable };
        await appDataService.updateAppDataField(user.id, 'accountabilityData', nextAcc);
        setAccountabilityData(nextAcc as Record<string, unknown>);
      }
    } catch {
      // ignore
    }
    if (user) {
      const updatedUser = { ...user, internships: updated };
      dispatch({ type: 'SET_USER', payload: updatedUser });
    }
    setIsEditModalOpen(false);
    setEditId(null);
    setNewApp({ status: 'Applied', dateApplied: new Date() });
    toast.success('Application updated');
  };

  const handleDelete = async (id: string) => {
    const updated = applications.filter(a => a.id !== id);
    setApplications(updated);
    try {
      const serializable = updated.map(a => ({
        ...a,
        dateApplied: a.dateApplied instanceof Date ? a.dateApplied.toISOString() : a.dateApplied,
      }));
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('internshipApps', JSON.stringify(serializable));
      }
      if (user?.id) {
        const nextAcc = { ...accountabilityData, internshipApplications: serializable };
        await appDataService.updateAppDataField(user.id, 'accountabilityData', nextAcc);
        setAccountabilityData(nextAcc as Record<string, unknown>);
      }
    } catch {
      // ignore
    }
    setExtrasMap(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    if (user) {
      dispatch({ type: 'SET_USER', payload: { ...user, internships: updated } });
    }
    toast.success('Application deleted');
  };

  const cycleStatus = (id: string) => {
    const order = ['Applied', 'Screening', 'Interviewing', 'Offer', 'Accepted', 'Rejected'];
    let prevStatus: InternshipApplication['status'] | null = null;
    let nextStatus: InternshipApplication['status'] | null = null;
    const updated = applications.map(a => {
      if (a.id !== id) return a;
      const idx = order.indexOf(a.status || 'Applied');
      const next = order[(idx + 1) % order.length];
      prevStatus = (a.status || 'Applied') as InternshipApplication['status'];
      nextStatus = next as InternshipApplication['status'];
      return { ...a, status: nextStatus };
    });
    setApplications(updated);
    try {
      const serializable = updated.map(a => ({
        ...a,
        dateApplied: a.dateApplied instanceof Date ? a.dateApplied.toISOString() : a.dateApplied,
      }));
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('internshipApps', JSON.stringify(serializable));
      }
      if (user?.id) {
        const nextAcc = { ...accountabilityData, internshipApplications: serializable };
        appDataService.updateAppDataField(user.id, 'accountabilityData', nextAcc).then(() => {
          setAccountabilityData(nextAcc as Record<string, unknown>);
        });
      }
    } catch {
      // ignore
    }
    if (user) {
      dispatch({ type: 'SET_USER', payload: { ...user, internships: updated } });
    }
    if (nextStatus) {
      if (nextStatus === 'Interviewing' && prevStatus !== 'Interviewing') {
        dispatch({ type: 'ADD_XP', payload: { amount: 30, source: 'Internship: Interview Stage' } });
        dispatch({ type: 'UPDATE_STATS', payload: { interviews: state.careerStats.interviews + 1 } });
      }
      if (nextStatus === 'Offer' && prevStatus !== 'Offer') {
        dispatch({ type: 'ADD_XP', payload: { amount: 50, source: 'Internship: Offer Received' } });
        dispatch({ type: 'SHOW_CONFETTI', payload: true });
      }
      if (nextStatus === 'Accepted' && prevStatus !== 'Accepted') {
        dispatch({ type: 'ADD_XP', payload: { amount: 100, source: 'Internship: Offer Accepted' } });
        dispatch({ type: 'SHOW_CONFETTI', payload: true });
      }
      if (nextStatus === 'Rejected' && prevStatus !== 'Rejected') {
        dispatch({ type: 'ADD_XP', payload: { amount: 5, source: 'Internship: Rejection Resilience' } });
        dispatch({ type: 'UPDATE_STATS', payload: { rejections: state.careerStats.rejections + 1 } });
        dispatch({ type: 'UPDATE_ENERGY', payload: { amount: -5 } });
      }
    }
    toast.success('Status changed');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Applied': return 'bg-blue-500/20 text-blue-500 border-blue-500/50';
      case 'Screening': return 'bg-purple-500/20 text-purple-500 border-purple-500/50';
      case 'Interviewing': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50';
      case 'Offer': return 'bg-green-500/20 text-green-500 border-green-500/50';
      case 'Accepted': return 'bg-lime-500/20 text-lime-500 border-lime-500/50';
      case 'Rejected': return 'bg-red-500/20 text-red-500 border-red-500/50';
      default: return 'bg-gray-500/20 text-gray-500 border-gray-500/50';
    }
  };

  const filteredApplications = applications
    .filter(app => app.company.toLowerCase().includes(searchTerm.toLowerCase()) || app.role.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(app => statusFilter === 'all' ? true : app.status === statusFilter)
    .filter(app => locationFilter === 'all' ? true : (app.location || '').toLowerCase().includes(locationFilter.toLowerCase()))
    .filter(app => tagFilter.trim() === '' ? true : getExtras(app.id).tags.some(t => t.toLowerCase().includes(tagFilter.toLowerCase())));

  const sortedApplications = useMemo(() => {
    const list = [...filteredApplications];
    if (sortBy === 'date_desc') list.sort((a, b) => new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime());
    if (sortBy === 'date_asc') list.sort((a, b) => new Date(a.dateApplied).getTime() - new Date(b.dateApplied).getTime());
    if (sortBy === 'company_asc') list.sort((a, b) => a.company.localeCompare(b.company));
    if (sortBy === 'company_desc') list.sort((a, b) => b.company.localeCompare(a.company));
    return list;
  }, [filteredApplications, sortBy]);
  
  // Import / Export
  const exportData = () => {
    const blob = new Blob([JSON.stringify({ applications, extrasMap }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `internship-quest-export-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Export complete');
  };
  const importData = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed.applications) && typeof parsed.extrasMap === 'object') {
        const normalized = parsed.applications.map((a: InternshipApplication) => ({ ...a, dateApplied: new Date(a.dateApplied) }));
        setApplications(normalized);
        setExtrasMap(parsed.extrasMap);
        toast.success('Import successful');
      } else {
        toast.error('Invalid import format');
      }
    } catch {
      toast.error('Failed to import file');
    }
  };
  
  const timelineData = useMemo(() => {
    const map: Record<string, number> = {};
    applications.forEach(a => {
      const d = new Date(a.dateApplied);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      map[key] = (map[key] || 0) + 1;
    });
    const keys = Object.keys(map).sort((a,b) => a.localeCompare(b));
    return keys.map(k => ({ name: k, count: map[k] }));
  }, [applications]);

  return (
    <div className={`space-y-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black font-mono uppercase tracking-tight flex items-center gap-3">
            <Briefcase className="text-lime-500" size={24} />
            Application <span className="text-lime-500">Tracker</span>
          </h2>
          <p className="text-gray-500 font-mono text-sm">Manage your job hunt pipeline.</p>
        </div>
        
        <div className="flex gap-2 md:gap-3">
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-lime-500 text-black hover:bg-lime-400 font-bold border-2 border-lime-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Application
          </Button>
          <Button 
            onClick={() => setKanbanMode(m => !m)}
            variant="outline"
            className={`${darkMode ? 'border-gray-700 text-white' : 'border-black text-black'} font-bold`}
          >
            {kanbanMode ? 'List View' : 'Kanban View'}
          </Button>
          <Button 
            onClick={exportData}
            variant="outline"
            className={`${darkMode ? 'border-gray-700 text-white' : 'border-black text-black'} font-bold`}
          >
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) importData(f);
            if (fileInputRef.current) fileInputRef.current.value = '';
          }} />
          <Button 
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className={`${darkMode ? 'border-gray-700 text-white' : 'border-black text-black'} font-bold`}
          >
            <Upload className="mr-2 h-4 w-4" /> Import
          </Button>
        </div>
      </div>

      {/* Status Distribution */}
      <Card className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-black'} border-2 brutal-shadow`}>
        <CardHeader className="pb-2">
          <CardTitle className="font-mono text-sm uppercase">Status Distribution</CardTitle>
        </CardHeader>
        <CardContent style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusChartData}>
              <XAxis dataKey="name" stroke={darkMode ? '#888' : '#333'} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: darkMode ? '#111' : '#fff', borderRadius: 0, fontFamily: 'monospace' }} />
              <Legend />
              <Bar dataKey="count" name="Applications" fill="#84cc16" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-black'} border-2 brutal-shadow`}>
        <CardHeader className="pb-2">
          <CardTitle className="font-mono text-sm uppercase">Applications Timeline</CardTitle>
        </CardHeader>
        <CardContent style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#222' : '#ddd'} />
              <XAxis dataKey="name" stroke={darkMode ? '#888' : '#333'} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: darkMode ? '#111' : '#fff', borderRadius: 0, fontFamily: 'monospace' }} />
              <Legend />
              <Line type="monotone" dataKey="count" name="Applications" stroke="#84cc16" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Applied', value: stats.total, icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Interviewing', value: stats.interviewing, icon: Calendar, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
          { label: 'Offers', value: stats.offers, icon: Trophy, color: 'text-lime-500', bg: 'bg-lime-500/10' },
          { label: 'Rejections', value: stats.rejected, icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
        ].map((stat, i) => (
          <Card key={i} className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-black'} border-2 brutal-shadow`}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-mono uppercase text-gray-500 mb-1">{stat.label}</p>
                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
              </div>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input 
            placeholder="Search companies or roles..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`pl-10 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-black'}`}
          />
        </div>
        <div className="w-40">
          <Select value={statusFilter} onValueChange={(val: string) => setStatusFilter(val)}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Applied">Applied</SelectItem>
              <SelectItem value="Screening">Screening</SelectItem>
              <SelectItem value="Interviewing">Interviewing</SelectItem>
              <SelectItem value="Offer">Offer</SelectItem>
              <SelectItem value="Accepted">Accepted</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-40">
          <Input placeholder="Location filter" value={locationFilter === 'all' ? '' : locationFilter} onChange={(e) => setLocationFilter(e.target.value || 'all')} />
        </div>
        <div className="w-44">
          <Select value={sortBy} onValueChange={(val: string) => setSortBy(val)}>
            <SelectTrigger>
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date_desc">Newest</SelectItem>
              <SelectItem value="date_asc">Oldest</SelectItem>
              <SelectItem value="company_asc">Company A-Z</SelectItem>
              <SelectItem value="company_desc">Company Z-A</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-44">
          <Input placeholder="Tag filter" value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} />
        </div>
      </div>

      {!kanbanMode && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-black'} border-2 brutal-shadow h-40 animate-pulse`} />
            ))
          ) : sortedApplications.length > 0 ? (
            sortedApplications.map((app) => (
              <motion.div
                key={app.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Card className={`h-full border-2 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-black'} hover:border-lime-500 transition-colors group relative overflow-hidden`}>
                  <div className={`absolute top-0 left-0 w-1 h-full ${getStatusColor(app.status).split(' ')[1].replace('text-', 'bg-')}`} />
                  
                  <CardHeader className="pb-2 pl-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                          {app.company}
                        </CardTitle>
                        <p className="text-sm text-gray-500 font-mono">{app.role}</p>
                      </div>
                      <Badge className={`font-mono ${getStatusColor(app.status)}`}>
                        {app.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pl-6 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>Applied: {new Date(app.dateApplied).toLocaleDateString()}</span>
                    </div>
                    
                    {app.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin className="h-4 w-4" />
                        <span>{app.location}</span>
                      </div>
                    )}
                    
                    {app.salary && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <DollarSign className="h-4 w-4" />
                        <span>{app.salary}</span>
                      </div>
                    )}

                    {app.link && (
                      <a 
                        href={app.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs flex items-center gap-1 text-lime-500 hover:underline mt-2"
                      >
                        <ExternalLink className="h-3 w-3" /> View Job Post
                      </a>
                    )}
                    
                    {/* Tags */}
                    <div className="pt-2">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        <div className="flex flex-wrap gap-2">
                          {getExtras(app.id).tags.map(t => (
                            <button 
                              key={t} 
                              className="text-xs px-2 py-0.5 border border-black brutal-shadow flex items-center gap-1"
                              onClick={() => {
                                const next = getExtras(app.id).tags.filter(x => x !== t);
                                upsertExtras(app.id, { tags: next });
                              }}
                              title="Remove tag"
                            >
                              <span>{t}</span>
                              <XCircle className="h-3 w-3 opacity-60" />
                            </button>
                          ))}
                          <Input 
                            placeholder="Add tag" 
                            className="h-7 w-28 text-xs"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const val = (e.target as HTMLInputElement).value.trim();
                                if (val) {
                                  upsertExtras(app.id, { tags: Array.from(new Set([...getExtras(app.id).tags, val])) });
                                  (e.target as HTMLInputElement).value = '';
                                }
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <Tabs defaultValue="interviews" className="pt-2">
                      <TabsList>
                        <TabsTrigger value="interviews">Interviews</TabsTrigger>
                        <TabsTrigger value="reminders">Reminders</TabsTrigger>
                      </TabsList>
                      <TabsContent value="interviews">
                        <div className="flex items-center gap-2">
                          <CalendarCheck className="h-4 w-4" />
                          <span className="text-xs font-mono uppercase">Upcoming Interviews</span>
                        </div>
                        <div className="space-y-1 mt-1">
                          {getExtras(app.id).interviews.filter(i => new Date(i.dateISO) >= new Date()).slice(0,3).map(i => (
                            <div key={i.id} className="text-xs flex items-center gap-2">
                              <span className="font-mono">{new Date(i.dateISO).toLocaleString([], { hour: '2-digit', minute:'2-digit', month:'short', day:'numeric' })}</span>
                              <span className="opacity-70">• {i.type}</span>
                              {i.notes && <span className="opacity-50">— {i.notes}</span>}
                            </div>
                          ))}
                          <div className="flex gap-2">
                            <Input placeholder="Type (HR/Tech)" className="h-8 text-xs w-24" id={`int-type-${app.id}`} />
                            <Input type="datetime-local" className="h-8 text-xs w-40" id={`int-date-${app.id}`} />
                            <Input placeholder="Notes" className="h-8 text-xs flex-1" id={`int-notes-${app.id}`} />
                            <Button 
                              variant="outline" 
                              className="h-8 text-xs"
                              onClick={() => {
                                const typeEl = document.getElementById(`int-type-${app.id}`) as HTMLInputElement | null;
                                const dateEl = document.getElementById(`int-date-${app.id}`) as HTMLInputElement | null;
                                const notesEl = document.getElementById(`int-notes-${app.id}`) as HTMLInputElement | null;
                                if (typeEl && dateEl && dateEl.value) {
                                  const ev: InterviewEvent = { id: Math.random().toString(36).slice(2), type: typeEl.value || 'Interview', dateISO: dateEl.value, notes: notesEl?.value || '' };
                                  upsertExtras(app.id, { interviews: [...getExtras(app.id).interviews, ev] });
                                  if (typeEl) typeEl.value = '';
                                  if (dateEl) dateEl.value = '';
                                  if (notesEl) notesEl.value = '';
                                  toast.success('Interview scheduled');
                                  dispatch({ type: 'ADD_XP', payload: { amount: 10, source: 'Internship: Interview Scheduled' } });
                                } else {
                                  toast.error('Select date/time');
                                }
                              }}
                            >
                              Add
                            </Button>
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="reminders">
                        <div className="flex items-center gap-2">
                          <ClipboardList className="h-4 w-4" />
                          <span className="text-xs font-mono uppercase">Checklist</span>
                        </div>
                        <div className="space-y-1 mt-1">
                          {getExtras(app.id).checklist.slice(0,4).map(item => (
                            <label key={item.id} className="flex items-center gap-2 text-xs">
                              <input 
                                type="checkbox" 
                                checked={item.done}
                                onChange={() => {
                                  const list = getExtras(app.id).checklist.map(ci => ci.id === item.id ? { ...ci, done: !ci.done } : ci);
                                  upsertExtras(app.id, { checklist: list });
                                }}
                              />
                              <span className={item.done ? 'line-through opacity-60' : ''}>{item.title}</span>
                            </label>
                          ))}
                          <div className="flex gap-2">
                            <Input placeholder="Add item" className="h-8 text-xs flex-1" id={`chk-${app.id}`} onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const val = (e.target as HTMLInputElement).value.trim();
                                if (val) {
                                  const newItem: ChecklistItem = { id: Math.random().toString(36).slice(2), title: val, done: false };
                                  upsertExtras(app.id, { checklist: [newItem, ...getExtras(app.id).checklist] });
                                  (e.target as HTMLInputElement).value = '';
                                  dispatch({ type: 'ADD_XP', payload: { amount: 5, source: 'Internship: Checklist Item Added' } });
                                }
                              }
                            }} />
                          </div>
                        </div>
                        <div className="pt-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span className="text-xs font-mono uppercase">Reminders</span>
                          </div>
                          <div className="space-y-1 mt-1">
                            {getExtras(app.id).reminders.filter(r => new Date(r.dueISO) >= new Date()).slice(0,3).map(r => (
                              <div key={r.id} className="text-xs flex items-center gap-2">
                                <span className="font-mono">{new Date(r.dueISO).toLocaleDateString()}</span>
                                <span className="opacity-70">• {r.title}</span>
                              </div>
                            ))}
                            <div className="flex gap-2">
                              <Input placeholder="Title" className="h-8 text-xs w-40" id={`rem-title-${app.id}`} />
                              <Input type="date" className="h-8 text-xs w-32" id={`rem-date-${app.id}`} />
                              <Button 
                                variant="outline" 
                                className="h-8 text-xs"
                                onClick={() => {
                                  const tEl = document.getElementById(`rem-title-${app.id}`) as HTMLInputElement | null;
                                  const dEl = document.getElementById(`rem-date-${app.id}`) as HTMLInputElement | null;
                                  if (tEl && tEl.value && dEl && dEl.value) {
                                    const r: Reminder = { id: Math.random().toString(36).slice(2), title: tEl.value, dueISO: dEl.value };
                                    upsertExtras(app.id, { reminders: [r, ...getExtras(app.id).reminders] });
                                    tEl.value = '';
                                    dEl.value = '';
                                    toast.success('Reminder added');
                                    dispatch({ type: 'ADD_XP', payload: { amount: 5, source: 'Internship: Reminder Added' } });
                                    dispatch({ type: 'UPDATE_ENERGY', payload: { amount: -1 } });
                                  } else {
                                    toast.error('Fill title and date');
                                  }
                                }}
                              >
                                Add
                              </Button>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>

                    <div className="flex items-center justify-between pt-3">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" className={`${darkMode ? 'border-gray-700 text-white' : 'border-black text-black'} px-3`} onClick={() => cycleStatus(app.id)}>
                          <CheckCircle2 className="h-4 w-4 mr-2" /> Next Status
                        </Button>
                        <Button variant="outline" className={`${darkMode ? 'border-gray-700 text-white' : 'border-black text-black'} px-3`} onClick={() => startEdit(app.id)}>
                          <Edit2 className="h-4 w-4 mr-2" /> Edit
                        </Button>
                      </div>
                      <Button variant="destructive" className="px-3" onClick={() => handleDelete(app.id)}>
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 mb-4">
                <Briefcase className="h-8 w-8 text-gray-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-500">No applications found</h3>
              <p className="text-gray-600">Start applying to fill up your quest log</p>
            </div>
          )}
        </AnimatePresence>
      </div>
      )}

      {kanbanMode && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {(['Applied','Screening','Interviewing','Offer','Accepted','Rejected'] as InternshipApplication['status'][]).map((col) => (
            <Card key={col} className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-black'} border-2 brutal-shadow`}>
              <CardHeader className="pb-2">
                <CardTitle className="font-mono text-sm uppercase">{col}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {sortedApplications.filter(a => a.status === col).map(app => (
                  <div key={app.id} className={`p-2 border-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-black'} brutal-shadow`}>
                    <div className="font-bold text-sm">{app.company}</div>
                    <div className="text-xs opacity-70">{app.role}</div>
                    <div className="flex gap-2 mt-2">
                      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => cycleStatus(app.id)}>Next</Button>
                      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => startEdit(app.id)}>Edit</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className={`${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-black'} sm:max-w-[425px]`}>
          <DialogHeader>
            <DialogTitle className="font-mono">Add New Application</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="company">Company *</Label>
              <Input id="company" value={newApp.company || ''} onChange={(e) => setNewApp({...newApp, company: e.target.value})} placeholder="e.g. Google" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role *</Label>
              <Input id="role" value={newApp.role || ''} onChange={(e) => setNewApp({...newApp, role: e.target.value})} placeholder="e.g. Frontend Intern" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={newApp.status} onValueChange={(val: string) => setNewApp({...newApp, status: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Applied">Applied</SelectItem>
                    <SelectItem value="Screening">Screening</SelectItem>
                    <SelectItem value="Interviewing">Interviewing</SelectItem>
                    <SelectItem value="Offer">Offer</SelectItem>
                    <SelectItem value="Accepted">Accepted</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" value={newApp.location || ''} onChange={(e) => setNewApp({...newApp, location: e.target.value})} placeholder="Remote / City" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="salary">Salary / Stipend</Label>
              <Input id="salary" value={newApp.salary || ''} onChange={(e) => setNewApp({...newApp, salary: e.target.value})} placeholder="e.g. $30/hr" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="link">Job Link</Label>
              <Input id="link" value={newApp.link || ''} onChange={(e) => setNewApp({...newApp, link: e.target.value})} placeholder="https://..." />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" value={newApp.notes || ''} onChange={(e) => setNewApp({...newApp, notes: e.target.value})} placeholder="Referral used, specific tech stack..." />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddApplication} className="w-full bg-lime-500 text-black hover:bg-lime-400 font-bold">
              Save Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className={`${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-black'} sm:max-w-[425px]`}>
          <DialogHeader>
            <DialogTitle className="font-mono">Edit Application</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="company-edit">Company *</Label>
              <Input id="company-edit" value={newApp.company || ''} onChange={(e) => setNewApp({...newApp, company: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role-edit">Role *</Label>
              <Input id="role-edit" value={newApp.role || ''} onChange={(e) => setNewApp({...newApp, role: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status-edit">Status</Label>
                <Select value={newApp.status} onValueChange={(val: string) => setNewApp({...newApp, status: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Applied">Applied</SelectItem>
                    <SelectItem value="Screening">Screening</SelectItem>
                    <SelectItem value="Interviewing">Interviewing</SelectItem>
                    <SelectItem value="Offer">Offer</SelectItem>
                    <SelectItem value="Accepted">Accepted</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location-edit">Location</Label>
                <Input id="location-edit" value={newApp.location || ''} onChange={(e) => setNewApp({...newApp, location: e.target.value})} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="salary-edit">Salary / Stipend</Label>
              <Input id="salary-edit" value={newApp.salary || ''} onChange={(e) => setNewApp({...newApp, salary: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="link-edit">Job Link</Label>
              <Input id="link-edit" value={newApp.link || ''} onChange={(e) => setNewApp({...newApp, link: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes-edit">Notes</Label>
              <Textarea id="notes-edit" value={newApp.notes || ''} onChange={(e) => setNewApp({...newApp, notes: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveEdit} className="w-full bg-lime-500 text-black hover:bg-lime-400 font-bold">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
