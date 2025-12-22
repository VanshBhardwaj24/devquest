import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Users, Linkedin, Mail, Twitter, Plus, ExternalLink, Briefcase } from 'lucide-react';
import { Contact } from '../../types';
import { Progress } from '../ui/progress';

export function Networking() {
  const { state } = useApp();
  const { user, darkMode } = state;
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    if (user?.contacts) {
      // Sort by lastContactedDate
      const sorted = [...user.contacts].sort((a, b) => 
        new Date(b.lastContactedDate).getTime() - new Date(a.lastContactedDate).getTime()
      );
      setContacts(sorted);
    }
  }, [user]);

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
          <Button className="bg-fuchsia-500 text-black font-bold font-mono border-2 border-black brutal-shadow">
            <Plus className="w-4 h-4 mr-2" /> Add Contact
          </Button>
        </div>

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
             {contacts.map((contact) => (
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
                       <button className="p-2 hover:bg-black hover:text-white transition-colors border border-transparent hover:border-gray-700">
                          {contact.linkedin && <Linkedin className="w-4 h-4" />}
                          {!contact.linkedin && <Mail className="w-4 h-4" />}
                       </button>
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
