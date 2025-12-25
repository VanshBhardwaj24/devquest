import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { MapPin, CheckSquare, Plus, Globe, Camera } from 'lucide-react';
import { BucketItem } from '../../types';
import { appDataService } from '../../services/appDataService';

export function BucketList() {
  const { state, dispatch } = useApp();
  const { user: authUser } = useAuth();
  const { user, darkMode } = state;
  const [items, setItems] = useState<BucketItem[]>([]);

  useEffect(() => {
    if (user?.bucketList) {
      setItems(user.bucketList);
    }
  }, [user]);

  useEffect(() => {
    const loadBackend = async () => {
      if (!authUser?.id) return;
      try {
        const data = await appDataService.getAppData(authUser.id);
        const stored = (data?.bucketList || []) as BucketItem[];
        if (stored && stored.length > 0) {
          setItems(stored);
          if (user) {
            dispatch({ type: 'SET_USER', payload: { ...user, bucketList: stored } });
          }
        }
      } catch {
        // ignore
      }
    };
    loadBackend();
  }, [authUser?.id]);

  const persist = async (updated: BucketItem[]) => {
    if (!authUser?.id) return;
    try {
      await appDataService.updateAppDataField(authUser.id, 'bucketList', updated);
    } catch {}
  };

  const addItem = () => {
    const item: BucketItem = {
      id: `bucket-${Date.now()}`,
      title: 'New Dream',
      completed: false,
      category: 'experience',
    };
    const updated = [item, ...items];
    setItems(updated);
    if (user) {
      dispatch({ type: 'SET_USER', payload: { ...user, bucketList: updated } });
    }
    persist(updated);
  };

  const toggleComplete = (id: string) => {
    const updated = items.map(i => i.id === id ? { ...i, completed: !i.completed } : i);
    setItems(updated);
    if (user) {
      dispatch({ type: 'SET_USER', payload: { ...user, bucketList: updated } });
    }
    persist(updated);
  };

  const removeItem = (id: string) => {
    const updated = items.filter(i => i.id !== id);
    setItems(updated);
    if (user) {
      dispatch({ type: 'SET_USER', payload: { ...user, bucketList: updated } });
    }
    persist(updated);
  };

  return (
    <div className={`p-4 md:p-8 ${darkMode ? 'text-white' : 'text-gray-900'} min-h-screen`}>
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black font-mono uppercase tracking-tight mb-2">
              Bucket <span className="text-orange-500">List</span>
            </h1>
            <p className="text-gray-500 font-mono">Dreams to reality. One check at a time.</p>
          </div>
          <Button onClick={addItem} className="bg-orange-500 text-black font-bold font-mono border-2 border-black brutal-shadow">
            <Plus className="w-4 h-4 mr-2" /> Add Dream
          </Button>
        </header>

        {/* World Map Placeholder / Hero */}
        <div className={`h-64 border-4 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-black'} brutal-shadow relative overflow-hidden flex items-center justify-center`}>
           <Globe className={`w-32 h-32 ${darkMode ? 'text-gray-800' : 'text-gray-200'}`} />
           <div className="absolute inset-0 flex items-center justify-center">
             <div className="text-center">
               <div className="text-4xl font-black font-mono">{items.filter(i => i.completed).length}/{items.length}</div>
               <div className="text-xs uppercase font-mono tracking-widest">Dreams Achieved</div>
             </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className={`relative group border-4 ${item.completed ? 'border-lime-500' : darkMode ? 'border-gray-800' : 'border-black'} ${darkMode ? 'bg-gray-900' : 'bg-white'} brutal-shadow transition-all hover:-translate-y-1`}>
              {/* Image Placeholder */}
              <div className={`h-32 w-full ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} flex items-center justify-center border-b-2 ${darkMode ? 'border-gray-800' : 'border-black'}`}>
                 <Camera className="text-gray-400" />
              </div>

              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`font-bold font-mono text-lg ${item.completed ? 'line-through text-gray-500' : ''}`}>{item.title}</h3>
                  <button onClick={() => toggleComplete(item.id)} className={`w-6 h-6 border-2 border-black flex items-center justify-center ${item.completed ? 'bg-lime-500' : 'bg-transparent'}`}>
                    {item.completed && <CheckSquare className="w-4 h-4 text-black" />}
                  </button>
                </div>
                
                {item.location && (
                  <div className="flex items-center gap-1 text-xs font-mono text-gray-500 mb-4">
                    <MapPin className="w-3 h-3" /> {item.location}
                  </div>
                )}

                <div className="flex justify-between items-center mt-4">
                   <span className="text-xs font-bold uppercase px-2 py-1 border border-gray-500 rounded-full">{item.category}</span>
                   <Button onClick={() => removeItem(item.id)} size="sm" variant="ghost" className="h-6 text-xs font-mono uppercase hover:bg-red-500 hover:text-white">
                     Remove
                   </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
