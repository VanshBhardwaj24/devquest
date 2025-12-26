import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Linkedin, Mail, Plus, Briefcase } from 'lucide-react';
import { Contact } from '../../types';
import { Progress } from '../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import toast from 'react-hot-toast';
import { appDataService } from '../../services/appDataService';

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
    if (authUser) {
      try {
        await appDataService.updateAppDataField(authUser.id, 'contacts', updated);
      } catch (error) {
        console.error('Error saving contact:', error);
      }
    }
    
    if (user) {
      dispatch({ type: 'SET_USER', payload: { ...user, contacts: updated } });
    }
    setNewContact({ relationshipScore: 50, lastContactedDate: new Date() });
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
    setNewContact({ relationshipScore: 50, lastContactedDate: new Date() });
    setEditingId(null);
    toast.success('Contact updated');
  };

  const cancelEdit = () => {
    setNewContact({ relationshipScore: 50, lastContactedDate: new Date() });
    setEditingId(null);
  };

  const removeContact = (id: string) => {
    const updated = contacts.filter(c => c.id !== id);
    setContacts(updated);
    if (user) {
      dispatch({ type: 'SET_USER', payload: { ...user, contacts: updated } });
    }
    toast.success('Contact removed');
  };

  const markContactedNow = (id: string) => {
    const updated = contacts.map(c => c.id === id ? { ...c, lastContactedDate: new Date(), relationshipScore: Math.min(100, c.relationshipScore + 5) } : c);
    setContacts(updated);
    if (user) {
      dispatch({ type: 'SET_USER', payload: { ...user, contacts: updated } });
    }
    toast.success('Contacted updated');
  };

  const nudgeScore = (id: string, delta: number) => {
    const updated = contacts.map(c => c.id === id ? { ...c, relationshipScore: Math.max(0, Math.min(100, c.relationshipScore + delta)) } : c);
    setContacts(updated);
    if (user) {
      dispatch({ type: 'SET_USER', payload: { ...user, contacts: updated } });
    }
  };
  return (
    <div className={`p-4 md:p-8 ${darkMode ? 'text-white' : 'text-gray-900'} min-h-screen`}>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black font-mono uppercase tracking-tight mb-2">
              Network <span className="text-fuchsia-500">Graph</span>
            </h1>
            <p className="text-gray-500 font-mono">Manage professional relationships and opportunities.</p>
          </div>
          <Button onClick={addContact} className="bg-fuchsia-500 text-black font-bold font-mono border-2 border-black brutal-shadow">
            <Plus className="w-4 h-4 mr-2" /> Add Contact
          </Button>
        </div>

        {/* Add/Edit Contact Form - Always Visible */}
        {
          <div className={`p-6 border-4 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-black'} brutal-shadow`}>
            <h2 className="text-xl font-bold font-mono mb-4">
              {editingId ? 'Edit Contact' : 'Add New Contact'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono uppercase text-gray-500">Name *</label>
                <Input 
                  value={newContact.name}
                  onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                  placeholder="Contact name"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-mono uppercase text-gray-500">Company *</label>
                <Input 
                  value={newContact.company}
                  onChange={(e) => setNewContact({...newContact, company: e.target.value})}
                  placeholder="Company name"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-mono uppercase text-gray-500">Role</label>
                <Input 
                  value={newContact.role}
                  onChange={(e) => setNewContact({...newContact, role: e.target.value})}
                  placeholder="Job title"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-mono uppercase text-gray-500">Email</label>
                <Input 
                  value={newContact.email}
                  onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                  placeholder="email@example.com"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-mono uppercase text-gray-500">LinkedIn</label>
                <Input 
                  value={newContact.linkedin}
                  onChange={(e) => setNewContact({...newContact, linkedin: e.target.value})}
                  placeholder="LinkedIn profile URL"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-mono uppercase text-gray-500">Twitter</label>
                <Input 
                  value={newContact.twitter}
                  onChange={(e) => setNewContact({...newContact, twitter: e.target.value})}
                  placeholder="Twitter handle"
                  className="mt-1"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-mono uppercase text-gray-500">Notes</label>
                <textarea 
                  value={newContact.notes}
                  onChange={(e) => setNewContact({...newContact, notes: e.target.value})}
                  placeholder="Meeting notes, conversation topics, etc."
                  className="w-full mt-1 p-2 border border-gray-300 rounded font-mono text-sm"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              {editingId ? (
                <>
                  <Button onClick={saveEdit} className="bg-cyan-500 text-black">
                    Save Changes
                  </Button>
                  <Button onClick={cancelEdit} variant="outline">
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={addContact} className="bg-fuchsia-500 text-black">
                  Add Contact
                </Button>
              )}
            </div>
          </div>
        }

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {/* Stats */}
           <Card className={`border-4 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-black'} brutal-shadow lg:col-span-3`}>
             <CardContent className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-black font-mono text-lime-500">{totalContacts}</div>
                  <div className="text-xs font-mono uppercase text-gray-500">Total Contacts</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black font-mono text-cyan-400">{thisMonth}</div>
                  <div className="text-xs font-mono uppercase text-gray-500">This Month</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black font-mono text-fuchsia-500">{pendingActions}</div>
                  <div className="text-xs font-mono uppercase text-gray-500">Needs Attention</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black font-mono text-orange-500">{avgScore}%</div>
                  <div className="text-xs font-mono uppercase text-gray-500">Avg Relationship</div>
                </div>
             </CardContent>
           </Card>

           {/* Contact List */}
           <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="md:col-span-2 flex items-center gap-3 mb-2">
               <div className="relative flex-1">
                 <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, company, role" className={`${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-black'}`} />
               </div>
               <div className="w-40">
                 <Select value={warmth} onValueChange={(v: string) => setWarmth(v)}>
                   <SelectTrigger>
                     <SelectValue placeholder="Warmth" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="all">All</SelectItem>
                     <SelectItem value="hot">Hot</SelectItem>
                     <SelectItem value="warm">Warm</SelectItem>
                     <SelectItem value="cold">Cold</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
               <div className="w-40">
                 <Input placeholder="Company filter" value={companyFilter} onChange={(e) => setCompanyFilter(e.target.value)} />
               </div>
               <div className="w-44">
                 <Select value={sortBy} onValueChange={(v: string) => setSortBy(v)}>
                   <SelectTrigger>
                     <SelectValue placeholder="Sort" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="last_desc">Recent</SelectItem>
                     <SelectItem value="last_asc">Oldest</SelectItem>
                     <SelectItem value="name_asc">Name A-Z</SelectItem>
                     <SelectItem value="name_desc">Name Z-A</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
             </div>
             {loading ? (
               Array.from({ length: 6 }).map((_, i) => (
                 <div key={i} className={`p-6 border-4 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-black'} brutal-shadow h-40 animate-pulse`} />
               ))
             ) : sorted.map((contact) => (
               <div key={contact.id} className={`p-6 border-4 relative group ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-black'} brutal-shadow hover:border-fuchsia-500 transition-colors`}>
                 <div className="flex justify-between items-start mb-4">
                   <div className="flex items-center gap-3">
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 border-black ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} overflow-hidden`}>
                       {contact.avatar ? (
                         <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover" />
                       ) : (
                         <span className="font-bold font-mono">{contact.name.charAt(0)}</span>
                       )}
                     </div>
                     <div>
                       <h3 className="font-bold font-mono text-lg">{contact.name}</h3>
                       <p className="text-xs font-mono text-gray-500 flex items-center gap-1">
                         <Briefcase className="w-3 h-3" /> {contact.role} @ {contact.company}
                       </p>
                     </div>
                   </div>
                   <div className="text-right">
                      <div className={`px-2 py-1 text-xs font-mono font-bold uppercase border border-black inline-block mb-1 ${
                        contact.relationshipScore >= 80 ? 'bg-lime-400 text-black' : 
                        contact.relationshipScore >= 50 ? 'bg-yellow-400 text-black' : 'bg-red-400 text-black'
                      }`}>
                        {contact.relationshipScore >= 80 ? 'HOT' : contact.relationshipScore >= 50 ? 'WARM' : 'COLD'}
                      </div>
                   </div>
                 </div>

                 <div className="mb-4">
                    <div className="flex justify-between text-xs font-mono text-gray-500 mb-1">
                      <span>Relationship Score</span>
                      <span>{contact.relationshipScore}%</span>
                    </div>
                    <Progress value={contact.relationshipScore} className="h-2 border border-black" indicatorClassName="bg-fuchsia-500" />
                 </div>

                 <p className="text-sm text-gray-500 font-mono mb-4 bg-black/5 p-2 border-l-2 border-black">
                   "{contact.notes}"
                 </p>

                 <div className="flex justify-between items-center text-xs font-mono text-gray-400">
                    <span>Last: {new Date(contact.lastContactedDate).toLocaleDateString()}</span>
                    <div className="flex gap-2">
                       <button className="p-2 hover:bg-black hover:text-white transition-colors border border-transparent hover:border-gray-700" onClick={() => markContactedNow(contact.id)}>
                         {contact.linkedin && <Linkedin className="w-4 h-4" />}
                         {!contact.linkedin && <Mail className="w-4 h-4" />}
                       </button>
                       <Button variant="outline" className={`${darkMode ? 'border-gray-700 text-white' : 'border-black text-black'} px-3`} onClick={() => nudgeScore(contact.id, 5)}>
                         +5
                       </Button>
                       <Button variant="outline" className={`${darkMode ? 'border-gray-700 text-white' : 'border-black text-black'} px-3`} onClick={() => nudgeScore(contact.id, -5)}>
                         -5
                       </Button>
                       <Button variant="outline" className={`${darkMode ? 'border-gray-700 text-white' : 'border-black text-black'} px-3`} onClick={() => startEdit(contact.id)}>
                         Edit
                       </Button>
                       <Button variant="destructive" className="px-3" onClick={() => removeContact(contact.id)}>
                         Remove
                       </Button>
                    </div>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}
