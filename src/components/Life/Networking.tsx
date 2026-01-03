import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Linkedin, Mail, Plus, Briefcase, User, Search, Filter, SortAsc, SortDesc, Trash2, Edit, MessageCircle, TrendingUp, TrendingDown, Users, Calendar } from 'lucide-react';
import { Contact } from '../../types';
import { Progress } from '../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import toast from 'react-hot-toast';
import { appDataService } from '../../services/appDataService';
import { Badge } from '../ui/badge';

export function Networking() {
  const { state, dispatch } = useApp();
  const { user: authUser } = useAuth();
  const { user, darkMode } = state;
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState('');
  const [warmth, setWarmth] = useState('all');
  const [companyFilter, setCompanyFilter] = useState('');
  const [sortBy, setSortBy] = useState('last_desc');
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContact, setNewContact] = useState<Partial<Contact>>({
    name: '',
    role: '',
    company: '',
    relationshipScore: 50,
    lastContactedDate: new Date(),
    notes: '',
  });

  useEffect(() => {
    if (user?.contacts) {
      // Sort by lastContactedDate
      const sorted = [...user.contacts].sort((a, b) => 
        new Date(b.lastContactedDate).getTime() - new Date(a.lastContactedDate).getTime()
      );
      setContacts(sorted);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const loadBackend = async () => {
      if (!authUser?.id) return;
      setLoading(true);
      try {
        const data = await appDataService.getAppData(authUser.id);
        const stored = (data?.contacts || []) as Contact[];
        const normalized = stored.map(c => ({ ...c, lastContactedDate: new Date(c.lastContactedDate) }));
        if (normalized.length > 0) {
          setContacts(normalized as Contact[]);
          if (user) {
            dispatch({ type: 'SET_USER', payload: { ...user, contacts: normalized as Contact[] } });
          }
        }
      } catch (e) {
        void e;
        toast.error('Failed to load contacts');
      } finally {
        setLoading(false);
      }
    };
    loadBackend();
  }, [authUser?.id]);

  const persistContacts = async (list: Contact[]) => {
    if (!authUser?.id) return;
    try {
      const serializable = list.map(c => ({
        ...c,
        lastContactedDate: c.lastContactedDate instanceof Date ? c.lastContactedDate.toISOString() : c.lastContactedDate,
      }));
      await appDataService.updateAppDataField(authUser.id, 'contacts', serializable);
    } catch {
      toast.error('Could not persist contacts');
    }
  };

  useEffect(() => {
    if (!authUser?.id) return;
    const sync = async () => {
      try {
        const serializable = contacts.map(c => ({ ...c, lastContactedDate: c.lastContactedDate instanceof Date ? c.lastContactedDate.toISOString() : c.lastContactedDate }));
        await appDataService.updateAppDataField(authUser.id, 'contacts', serializable);
      } catch (e) {
        void e;
        toast.error('Could not persist contacts');
      }
    };
    sync();
  }, [contacts, authUser?.id]);
  // Calculate stats
  const totalContacts = contacts.length;
  const thisMonth = contacts.filter(c => {
    const d = new Date(c.lastContactedDate);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const pendingActions = contacts.filter(c => c.relationshipScore < 50).length; // Example logic
  const avgScore = contacts.length > 0 
    ? Math.round(contacts.reduce((acc, c) => acc + c.relationshipScore, 0) / contacts.length) 
    : 0;

  const filtered = contacts
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.company.toLowerCase().includes(search.toLowerCase()) || c.role.toLowerCase().includes(search.toLowerCase()))
    .filter(c => warmth === 'all' ? true : warmth === 'hot' ? c.relationshipScore >= 80 : warmth === 'warm' ? c.relationshipScore >= 50 && c.relationshipScore < 80 : c.relationshipScore < 50)
    .filter(c => companyFilter ? c.company.toLowerCase().includes(companyFilter.toLowerCase()) : true);

  const sorted = useMemo(() => {
    const list = [...filtered];
    if (sortBy === 'last_desc') list.sort((a, b) => new Date(b.lastContactedDate).getTime() - new Date(a.lastContactedDate).getTime());
    if (sortBy === 'last_asc') list.sort((a, b) => new Date(a.lastContactedDate).getTime() - new Date(b.lastContactedDate).getTime());
    if (sortBy === 'name_asc') list.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === 'name_desc') list.sort((a, b) => b.name.localeCompare(a.name));
    return list;
  }, [filtered, sortBy]);

  const addContact = async () => {
    if (!newContact.name || !newContact.company) {
      toast.error('Name and company are required');
      return;
    }
    const contact: Contact = {
      id: Math.random().toString(36).slice(2),
      name: newContact.name || '',
      role: newContact.role || '',
      company: newContact.company || '',
      relationshipScore: newContact.relationshipScore || 50,
      lastContactedDate: newContact.lastContactedDate ? new Date(newContact.lastContactedDate) : new Date(),
      notes: newContact.notes || '',
      avatar: newContact.avatar,
      linkedin: newContact.linkedin,
      twitter: newContact.twitter,
      email: newContact.email,
    } as Contact;
    const updated = [contact, ...contacts];
    setContacts(updated);
    
    // Save to appDataService
    await persistContacts(updated);
    
    if (user) {
      dispatch({ type: 'SET_USER', payload: { ...user, contacts: updated } });
    }
    setNewContact({ relationshipScore: 50, lastContactedDate: new Date() });
    setShowAddForm(false);
    toast.success('Contact added');
  };

  const startEdit = (id: string) => {
    const c = contacts.find(x => x.id === id);
    if (!c) return;
    setNewContact({
      name: c.name,
      role: c.role,
      company: c.company,
      relationshipScore: c.relationshipScore,
      lastContactedDate: c.lastContactedDate,
      notes: c.notes,
      avatar: c.avatar,
      linkedin: c.linkedin,
      twitter: c.twitter,
      email: c.email,
    });
    setEditingId(id);
    setShowAddForm(true);
  };

  const [editingId, setEditingId] = useState<string | null>(null);

  const saveEdit = () => {
    if (!editingId || !newContact.name || !newContact.company) {
      toast.error('Name and company are required');
      return;
    }
    const updated = contacts.map(c => c.id === editingId ? {
      ...c,
      name: newContact.name || c.name,
      role: newContact.role || c.role,
      company: newContact.company || c.company,
      relationshipScore: newContact.relationshipScore || c.relationshipScore,
      lastContactedDate: newContact.lastContactedDate ? new Date(newContact.lastContactedDate) : c.lastContactedDate,
      notes: newContact.notes || c.notes,
      avatar: newContact.avatar || c.avatar,
      linkedin: newContact.linkedin || c.linkedin,
      twitter: newContact.twitter || c.twitter,
      email: newContact.email || c.email,
    } : c);
    setContacts(updated);
    if (user) {
      dispatch({ type: 'SET_USER', payload: { ...user, contacts: updated } });
    }
    void persistContacts(updated);
    setNewContact({ relationshipScore: 50, lastContactedDate: new Date() });
    setEditingId(null);
    setShowAddForm(false);
    toast.success('Contact updated');
  };

  const cancelEdit = () => {
    setNewContact({ relationshipScore: 50, lastContactedDate: new Date() });
    setEditingId(null);
    setShowAddForm(false);
  };

  const removeContact = (id: string) => {
    const updated = contacts.filter(c => c.id !== id);
    setContacts(updated);
    if (user) {
      dispatch({ type: 'SET_USER', payload: { ...user, contacts: updated } });
    }
    void persistContacts(updated);
    toast.success('Contact removed');
  };

  const markContactedNow = (id: string) => {
    const updated = contacts.map(c => c.id === id ? { ...c, lastContactedDate: new Date(), relationshipScore: Math.min(100, c.relationshipScore + 5) } : c);
    setContacts(updated);
    if (user) {
      dispatch({ type: 'SET_USER', payload: { ...user, contacts: updated } });
    }
    void persistContacts(updated);
    toast.success('Contacted updated');
  };

  const nudgeScore = (id: string, delta: number) => {
    const updated = contacts.map(c => c.id === id ? { ...c, relationshipScore: Math.max(0, Math.min(100, c.relationshipScore + delta)) } : c);
    setContacts(updated);
    if (user) {
      dispatch({ type: 'SET_USER', payload: { ...user, contacts: updated } });
    }
    void persistContacts(updated);
  };
  
  const nudgeScoreDown = (id: string, delta: number) => {
    const updated = contacts.map(c => c.id === id ? { ...c, relationshipScore: Math.max(0, Math.min(100, c.relationshipScore - delta)) } : c);
    setContacts(updated);
    if (user) {
      dispatch({ type: 'SET_USER', payload: { ...user, contacts: updated } });
    }
    void persistContacts(updated);
  };
  return (
    <div className={`p-4 md:p-8 ${darkMode ? 'text-white' : 'text-gray-900'} min-h-screen relative`}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-white/10">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight font-cyber text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-neon-purple">
              NETWORK MATRIX
            </h1>
            <p className="text-neon-blue font-mono text-sm tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
              CONNECTION STATUS: ONLINE
            </p>
          </div>
          <Button 
            onClick={() => setShowAddForm(!showAddForm)} 
            variant="neon"
            className="group"
          >
            <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" /> 
            {showAddForm ? 'Close Uplink' : 'New Connection'}
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card variant="neon" className="bg-black/40">
             <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-mono text-gray-500 uppercase">Total Nodes</p>
                  <p className="text-2xl font-bold text-neon-blue font-cyber">{totalContacts}</p>
                </div>
                <Users className="w-8 h-8 text-neon-blue/20" />
             </CardContent>
          </Card>
          <Card variant="neon" className="bg-black/40">
             <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-mono text-gray-500 uppercase">Active (Mo)</p>
                  <p className="text-2xl font-bold text-neon-green font-cyber">{thisMonth}</p>
                </div>
                <Calendar className="w-8 h-8 text-neon-green/20" />
             </CardContent>
          </Card>
          <Card variant="neon" className="bg-black/40">
             <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-mono text-gray-500 uppercase">Pending</p>
                  <p className="text-2xl font-bold text-neon-pink font-cyber">{pendingActions}</p>
                </div>
                <MessageCircle className="w-8 h-8 text-neon-pink/20" />
             </CardContent>
          </Card>
          <Card variant="neon" className="bg-black/40">
             <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-mono text-gray-500 uppercase">Avg Signal</p>
                  <p className="text-2xl font-bold text-neon-yellow font-cyber">{avgScore}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-neon-yellow/20" />
             </CardContent>
          </Card>
        </div>

        {/* Add/Edit Contact Form */}
        {showAddForm && (
          <Card variant="neon" className="border-neon-pink/50 relative overflow-hidden animate-in slide-in-from-top-4 duration-300">
            <div className="absolute inset-0 bg-neon-pink/5 pointer-events-none" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-neon-pink font-cyber">
                <User className="w-5 h-5" />
                {editingId ? 'RECONFIGURE NODE' : 'ESTABLISH NEW UPLINK'}
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase text-neon-blue">Identity *</label>
                  <Input 
                    value={newContact.name}
                    onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                    placeholder="Contact name"
                    className="bg-black/50 border-white/10 focus:border-neon-pink"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase text-neon-blue">Organization *</label>
                  <Input 
                    value={newContact.company}
                    onChange={(e) => setNewContact({...newContact, company: e.target.value})}
                    placeholder="Company name"
                    className="bg-black/50 border-white/10 focus:border-neon-pink"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase text-gray-500">Designation</label>
                  <Input 
                    value={newContact.role}
                    onChange={(e) => setNewContact({...newContact, role: e.target.value})}
                    placeholder="Job title"
                    className="bg-black/50 border-white/10 focus:border-neon-blue"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase text-gray-500">Comms Frequency</label>
                  <Input 
                    value={newContact.email}
                    onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                    placeholder="email@example.com"
                    className="bg-black/50 border-white/10 focus:border-neon-blue"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase text-gray-500">Neural Link (LinkedIn)</label>
                  <Input 
                    value={newContact.linkedin}
                    onChange={(e) => setNewContact({...newContact, linkedin: e.target.value})}
                    placeholder="LinkedIn profile URL"
                    className="bg-black/50 border-white/10 focus:border-neon-blue"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase text-gray-500">Subspace Channel (Twitter)</label>
                  <Input 
                    value={newContact.twitter}
                    onChange={(e) => setNewContact({...newContact, twitter: e.target.value})}
                    placeholder="Twitter handle"
                    className="bg-black/50 border-white/10 focus:border-neon-blue"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-mono uppercase text-gray-500">Data Logs</label>
                  <textarea 
                    value={newContact.notes}
                    onChange={(e) => setNewContact({...newContact, notes: e.target.value})}
                    placeholder="Meeting notes, conversation topics, etc."
                    className="w-full p-3 bg-black/50 border border-white/10 rounded-md font-mono text-sm focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none min-h-[100px]"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6 justify-end">
                {editingId ? (
                  <>
                    <Button onClick={cancelEdit} variant="ghost" className="hover:bg-red-500/10 hover:text-red-500">
                      Abort
                    </Button>
                    <Button onClick={saveEdit} variant="neon" className="min-w-[120px]">
                      Save Config
                    </Button>
                  </>
                ) : (
                  <Button onClick={addContact} variant="neon" className="w-full md:w-auto min-w-[150px]">
                    Initialize Link
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters & Controls */}
        <div className="flex flex-col md:flex-row gap-4 p-4 bg-black/40 border border-white/5 rounded-lg backdrop-blur-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Search nodes..." 
              className="pl-10 bg-black/50 border-white/10 focus:border-neon-blue" 
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            <Select value={warmth} onValueChange={(v: string) => setWarmth(v)}>
              <SelectTrigger className="w-[120px] bg-black/50 border-white/10">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Signals</SelectItem>
                <SelectItem value="hot">Strong</SelectItem>
                <SelectItem value="warm">Stable</SelectItem>
                <SelectItem value="cold">Weak</SelectItem>
              </SelectContent>
            </Select>
            <Input 
              placeholder="Filter Org" 
              value={companyFilter} 
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="w-[150px] bg-black/50 border-white/10"
            />
            <Select value={sortBy} onValueChange={(v: string) => setSortBy(v)}>
              <SelectTrigger className="w-[120px] bg-black/50 border-white/10">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last_desc">Recent</SelectItem>
                <SelectItem value="last_asc">Oldest</SelectItem>
                <SelectItem value="name_asc">A-Z</SelectItem>
                <SelectItem value="name_desc">Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Contact List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 bg-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorted.map((contact) => (
              <Card key={contact.id} variant="neon" className="group hover:border-neon-blue/50 transition-all duration-300">
                <CardContent className="p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center overflow-hidden relative group-hover:shadow-[0_0_15px_rgba(0,243,255,0.3)] transition-shadow">
                        {contact.avatar ? (
                          <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-bold font-cyber text-neon-blue text-lg">{contact.name.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold font-cyber text-white group-hover:text-neon-blue transition-colors truncate max-w-[150px]">{contact.name}</h3>
                        <p className="text-xs font-mono text-gray-400 flex items-center gap-1 truncate max-w-[150px]">
                          <Briefcase className="w-3 h-3 text-neon-purple" /> {contact.role}
                        </p>
                        <p className="text-xs font-mono text-gray-500 truncate max-w-[150px]">
                           @ {contact.company}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className={`
                      ${contact.relationshipScore >= 80 ? 'border-neon-green text-neon-green bg-neon-green/10' : 
                        contact.relationshipScore >= 50 ? 'border-neon-yellow text-neon-yellow bg-neon-yellow/10' : 
                        'border-neon-red text-neon-red bg-neon-red/10'} 
                      font-mono text-[10px] uppercase tracking-wider
                    `}>
                      {contact.relationshipScore >= 80 ? 'STRONG' : contact.relationshipScore >= 50 ? 'STABLE' : 'WEAK'}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                     <div className="flex justify-between text-[10px] font-mono text-gray-500 uppercase">
                       <span>Link Strength</span>
                       <span>{contact.relationshipScore}%</span>
                     </div>
                     <Progress value={contact.relationshipScore} className="h-1 bg-white/10" indicatorClassName={`
                       ${contact.relationshipScore >= 80 ? 'bg-neon-green' : 
                         contact.relationshipScore >= 50 ? 'bg-neon-yellow' : 'bg-neon-red'}
                     `} />
                  </div>

                  {contact.notes && (
                    <div className="p-3 bg-black/40 border border-white/5 rounded text-xs text-gray-400 font-mono italic line-clamp-2 min-h-[3rem]">
                      "{contact.notes}"
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-between border-t border-white/5">
                     <span className="text-[10px] font-mono text-gray-600">
                       Last: {new Date(contact.lastContactedDate).toLocaleDateString()}
                     </span>
                     <div className="flex gap-1">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-7 w-7 text-gray-400 hover:text-neon-blue hover:bg-neon-blue/10"
                          onClick={() => markContactedNow(contact.id)}
                          title="Log Contact"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-7 w-7 text-gray-400 hover:text-neon-green hover:bg-neon-green/10"
                          onClick={() => nudgeScore(contact.id, 5)}
                          title="Boost Score"
                        >
                          <TrendingUp className="w-3.5 h-3.5" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-7 w-7 text-gray-400 hover:text-neon-red hover:bg-neon-red/10"
                          onClick={() => nudgeScoreDown(contact.id, 5)}
                          title="Lower Score"
                        >
                          <TrendingDown className="w-3.5 h-3.5" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-7 w-7 text-gray-400 hover:text-neon-purple hover:bg-neon-purple/10"
                          onClick={() => startEdit(contact.id)}
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-7 w-7 text-gray-400 hover:text-red-500 hover:bg-red-500/10"
                          onClick={() => removeContact(contact.id)}
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                     </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
