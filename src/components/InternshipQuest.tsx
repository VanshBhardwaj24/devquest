import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { InternshipApplication } from '../types';
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
  Trophy
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import toast from 'react-hot-toast';

export function InternshipQuest() {
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
  
  // Form state
  const [newApp, setNewApp] = useState<Partial<InternshipApplication>>({
    status: 'Applied',
    dateApplied: new Date(),
  });

  useEffect(() => {
    setLoading(true);
    try {
      const local = typeof window !== 'undefined' ? window.localStorage.getItem('internshipApps') : null;
      if (local) {
        const parsed = JSON.parse(local) as InternshipApplication[];
        const normalized = parsed.map(a => ({ ...a, dateApplied: new Date(a.dateApplied) }));
        setApplications(normalized);
      } else if (user?.internships) {
        setApplications(user.internships);
      } else {
        setApplications([]);
      }
    } catch {
      toast.error('Failed to load applications');
      setApplications(user?.internships || []);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const serializable = applications.map(a => ({ ...a, dateApplied: a.dateApplied instanceof Date ? a.dateApplied.toISOString() : a.dateApplied }));
        window.localStorage.setItem('internshipApps', JSON.stringify(serializable));
      }
    } catch {
      toast.error('Could not persist applications');
    }
  }, [applications]);

  // Dynamic Stats
  const stats = useMemo(() => {
    return {
      total: applications.length,
      interviewing: applications.filter(app => app.status === 'Interviewing').length,
      offers: applications.filter(app => app.status === 'Offer' || app.status === 'Accepted').length,
      rejected: applications.filter(app => app.status === 'Rejected').length,
    };
  }, [applications]);

  const handleAddApplication = () => {
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
    if (user) {
      const updatedUser = { ...user, internships: updatedApplications };
      dispatch({ type: 'SET_USER', payload: updatedUser });
    }
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

  const handleSaveEdit = () => {
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
    if (user) {
      const updatedUser = { ...user, internships: updated };
      dispatch({ type: 'SET_USER', payload: updatedUser });
    }
    setIsEditModalOpen(false);
    setEditId(null);
    setNewApp({ status: 'Applied', dateApplied: new Date() });
    toast.success('Application updated');
  };

  const handleDelete = (id: string) => {
    const updated = applications.filter(a => a.id !== id);
    setApplications(updated);
    if (user) {
      dispatch({ type: 'SET_USER', payload: { ...user, internships: updated } });
    }
    toast.success('Application deleted');
  };

  const cycleStatus = (id: string) => {
    const order = ['Applied', 'Screening', 'Interviewing', 'Offer', 'Accepted', 'Rejected'];
    const updated = applications.map(a => {
      if (a.id !== id) return a;
      const idx = order.indexOf(a.status || 'Applied');
      const next = order[(idx + 1) % order.length];
      return { ...a, status: next };
    });
    setApplications(updated);
    if (user) {
      dispatch({ type: 'SET_USER', payload: { ...user, internships: updated } });
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
    .filter(app => locationFilter === 'all' ? true : (app.location || '').toLowerCase().includes(locationFilter.toLowerCase()));

  const sortedApplications = useMemo(() => {
    const list = [...filteredApplications];
    if (sortBy === 'date_desc') list.sort((a, b) => new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime());
    if (sortBy === 'date_asc') list.sort((a, b) => new Date(a.dateApplied).getTime() - new Date(b.dateApplied).getTime());
    if (sortBy === 'company_asc') list.sort((a, b) => a.company.localeCompare(b.company));
    if (sortBy === 'company_desc') list.sort((a, b) => b.company.localeCompare(a.company));
    return list;
  }, [filteredApplications, sortBy]);

  return (
    <div className={`space-y-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black font-mono uppercase tracking-tight flex items-center gap-3">
            <Briefcase className="text-lime-500" size={32} />
            Internship <span className="text-lime-500">Quest</span>
          </h1>
          <p className="text-gray-500 font-mono">Track your journey to the dream offer.</p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-lime-500 text-black hover:bg-lime-400 font-bold border-2 border-lime-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Application
          </Button>
        </div>
      </div>

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
      </div>

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
