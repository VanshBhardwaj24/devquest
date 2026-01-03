import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Users, UserPlus, MessageCircle, Star,
  Plus, Sparkles, Trophy, Clock, Crown
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';

interface SocialInteraction {
  id: string;
  type: string;
  person: string;
  category: 'family' | 'friends' | 'romantic' | 'professional' | 'community';
  duration?: number; // minutes
  quality: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  date: Date;
  xpEarned: number;
}

interface Relationship {
  id: string;
  name: string;
  category: 'family' | 'friends' | 'romantic' | 'professional' | 'community';
  connectionLevel: number; // 0-100
  lastContact: Date;
  totalInteractions: number;
  icon: string;
}

const interactionTypes = [
  { name: 'Quality Time', icon: '⏰', baseXP: 50, description: 'Spent meaningful time together' },
  { name: 'Deep Conversation', icon: '💬', baseXP: 60, description: 'Had a heart-to-heart talk' },
  { name: 'Phone/Video Call', icon: '📞', baseXP: 35, description: 'Called to catch up' },
  { name: 'Message/Text', icon: '💌', baseXP: 15, description: 'Sent a thoughtful message' },
  { name: 'Gift Given', icon: '🎁', baseXP: 75, description: 'Gave a meaningful gift' },
  { name: 'Act of Kindness', icon: '💝', baseXP: 80, description: 'Did something kind' },
  { name: 'Date Night', icon: '💑', baseXP: 100, description: 'Special romantic time' },
  { name: 'Family Gathering', icon: '👨‍👩‍👧‍👦', baseXP: 70, description: 'Family event or meal' },
  { name: 'Networking', icon: '🤝', baseXP: 45, description: 'Professional connection' },
  { name: 'Helped Someone', icon: '🙏', baseXP: 90, description: 'Provided help or support' },
];

const categoryColors = {
  family: { bg: 'bg-orange-900/20', border: 'border-orange-500/50', text: 'text-orange-400', icon: '👨‍👩‍👧‍👦' },
  friends: { bg: 'bg-cyan-900/20', border: 'border-cyan-500/50', text: 'text-cyan-400', icon: '👥' },
  romantic: { bg: 'bg-pink-900/20', border: 'border-pink-500/50', text: 'text-pink-400', icon: '💕' },
  professional: { bg: 'bg-blue-900/20', border: 'border-blue-500/50', text: 'text-blue-400', icon: '💼' },
  community: { bg: 'bg-green-900/20', border: 'border-green-500/50', text: 'text-green-400', icon: '🌍' },
};

export function Relationships() {
  const { dispatch } = useApp();
  const [interactions, setInteractions] = useState<SocialInteraction[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([
    { id: '1', name: 'Mom', category: 'family', connectionLevel: 85, lastContact: new Date(), totalInteractions: 12, icon: '👩' },
    { id: '2', name: 'Dad', category: 'family', connectionLevel: 75, lastContact: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), totalInteractions: 8, icon: '👨' },
    { id: '3', name: 'Best Friend', category: 'friends', connectionLevel: 90, lastContact: new Date(), totalInteractions: 25, icon: '🧑' },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPersonModal, setShowPersonModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'interactions' | 'people' | 'stats'>('interactions');
  
  // Form state
  const [selectedType, setSelectedType] = useState(interactionTypes[0]);
  const [personName, setPersonName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof categoryColors>('friends');
  const [quality, setQuality] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [duration, setDuration] = useState(30);
  const [notes, setNotes] = useState('');

  // New person state
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonCategory, setNewPersonCategory] = useState<keyof typeof categoryColors>('friends');
  const [newPersonIcon, setNewPersonIcon] = useState('🧑');

  const calculateXP = () => {
    const qualityMultiplier = quality * 0.3 + 0.7; // 1x to 2.2x based on quality
    const durationBonus = Math.floor(duration / 30) * 10;
    return Math.floor(selectedType.baseXP * qualityMultiplier + durationBonus);
  };

  const addInteraction = () => {
    if (!personName.trim()) return;

    const xpEarned = calculateXP();
    
    const newInteraction: SocialInteraction = {
      id: Date.now().toString(),
      type: selectedType.name,
      person: personName,
      category: selectedCategory,
      duration,
      quality,
      notes: notes.trim(),
      date: new Date(),
      xpEarned,
    };

    setInteractions(prev => [newInteraction, ...prev]);

    // Update or create relationship
    setRelationships(prev => {
      const existing = prev.find(r => r.name.toLowerCase() === personName.toLowerCase());
      if (existing) {
        return prev.map(r => {
          if (r.id === existing.id) {
            return {
              ...r,
              connectionLevel: Math.min(100, r.connectionLevel + quality * 2),
              lastContact: new Date(),
              totalInteractions: r.totalInteractions + 1,
            };
          }
          return r;
        });
      }
      return prev;
    });

    dispatch({ 
      type: 'ADD_XP', 
      payload: { 
        amount: xpEarned, 
        source: `Social: ${selectedType.name} with ${personName}` 
      } 
    });

    dispatch({ 
      type: 'ADD_NOTIFICATION', 
      payload: {
        id: Date.now().toString(),
        type: 'achievement',
        title: 'Connection Made! 💖',
        message: `+${xpEarned} XP for ${selectedType.name.toLowerCase()} with ${personName}`,
        timestamp: new Date(),
        read: false,
        priority: 'medium',
      }
    });

    setShowAddModal(false);
    setPersonName('');
    setNotes('');
    setQuality(3);
    setDuration(30);
  };

  const addPerson = () => {
    if (!newPersonName.trim()) return;

    const newRelationship: Relationship = {
      id: Date.now().toString(),
      name: newPersonName,
      category: newPersonCategory,
      connectionLevel: 10,
      lastContact: new Date(),
      totalInteractions: 0,
      icon: newPersonIcon,
    };

    setRelationships(prev => [...prev, newRelationship]);
    
    dispatch({ 
      type: 'ADD_XP', 
      payload: { amount: 20, source: `Added relationship: ${newPersonName}` } 
    });

    setShowPersonModal(false);
    setNewPersonName('');
    setNewPersonIcon('🧑');
  };

  // Stats
  const totalInteractions = interactions.length;
  const totalXPEarned = interactions.reduce((sum, i) => sum + i.xpEarned, 0);
  const avgQuality = interactions.length > 0 
    ? (interactions.reduce((sum, i) => sum + i.quality, 0) / interactions.length).toFixed(1) 
    : 0;
  const categoryStats = Object.keys(categoryColors).map(cat => ({
    category: cat,
    count: interactions.filter(i => i.category === cat).length,
    ...categoryColors[cat as keyof typeof categoryColors],
  }));

  return (
    <div className="p-3 sm:p-4 lg:p-6 bg-[#0a0a0a] min-h-screen pb-20 lg:pb-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 font-mono flex items-center gap-3">
            <Heart className="text-pink-400" size={36} />
            SOCIAL <span className="text-pink-400">❤️</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-500 font-mono">
            // Level up your relationships. Connections = Power.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'interactions', label: 'Interactions', icon: MessageCircle },
            { id: 'people', label: 'People', icon: Users },
            { id: 'stats', label: 'Stats', icon: Trophy },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'interactions' | 'people' | 'stats')}
              className={`flex items-center gap-2 px-4 py-2 font-bold border-2 brutal-shadow whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-pink-500 text-black border-pink-400'
                  : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-pink-500/50'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Stats Overview */}
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card variant="neon" className="border-neon-pink/50">
              <CardContent className="p-4 flex items-center gap-3">
                <Heart className="text-neon-pink" size={28} />
                <div>
                  <p className="text-xs text-gray-500 font-mono uppercase">Interactions</p>
                  <p className="text-2xl font-black text-neon-pink font-mono">{totalInteractions}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card variant="neon" className="border-neon-yellow/50">
              <CardContent className="p-4 flex items-center gap-3">
                <Sparkles className="text-neon-yellow" size={28} />
                <div>
                  <p className="text-xs text-gray-500 font-mono uppercase">XP Earned</p>
                  <p className="text-2xl font-black text-neon-yellow font-mono">+{totalXPEarned}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card variant="neon" className="border-neon-blue/50">
              <CardContent className="p-4 flex items-center gap-3">
                <Users className="text-neon-blue" size={28} />
                <div>
                  <p className="text-xs text-gray-500 font-mono uppercase">People</p>
                  <p className="text-2xl font-black text-neon-blue font-mono">{relationships.length}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card variant="neon" className="border-neon-purple/50">
              <CardContent className="p-4 flex items-center gap-3">
                <Star className="text-neon-purple" size={28} />
                <div>
                  <p className="text-xs text-gray-500 font-mono uppercase">Avg Quality</p>
                  <p className="text-2xl font-black text-neon-purple font-mono">{avgQuality}⭐</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          <Button
            variant={activeTab === 'interactions' ? 'neon' : 'outline'}
            onClick={() => setActiveTab('interactions')}
            className="font-mono"
          >
            INTERACTIONS
          </Button>
          <Button
            variant={activeTab === 'people' ? 'neon' : 'outline'}
            onClick={() => setActiveTab('people')}
            className="font-mono"
          >
            PEOPLE
          </Button>
          <Button
            variant={activeTab === 'stats' ? 'neon' : 'outline'}
            onClick={() => setActiveTab('stats')}
            className="font-mono"
          >
            STATS
          </Button>
        </div>
        {activeTab === 'interactions' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-black text-white font-mono">RECENT INTERACTIONS</h2>
              <Button
                variant="neon"
                onClick={() => setShowAddModal(true)}
                className="font-mono"
              >
                <Plus size={16} className="mr-2" /> LOG INTERACTION
              </Button>
            </div>

            <Card variant="neon" className="bg-black/40 border-white/10 p-4">
              {interactions.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="text-gray-600 mx-auto mb-4" size={64} />
                  <p className="text-gray-500 font-mono">No interactions logged yet.</p>
                  <p className="text-gray-600 text-sm font-mono mt-2">Start connecting! 💖</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {interactions.map((interaction, index) => (
                    <motion.div
                      key={interaction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <Card variant="neon" className={`p-4 transition-colors ${categoryColors[interaction.category].bg} ${categoryColors[interaction.category].border}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <span className="text-3xl">
                              {interactionTypes.find(t => t.name === interaction.type)?.icon || '💬'}
                            </span>
                            <div>
                              <h3 className="text-white font-bold flex items-center gap-2">
                                {interaction.type}
                                <span className={`text-sm ${categoryColors[interaction.category].text}`}>
                                  with {interaction.person}
                                </span>
                              </h3>
                              <div className="flex items-center gap-3 mt-1 text-sm">
                                <span className="text-neon-yellow">
                                  {'⭐'.repeat(interaction.quality)}
                                </span>
                                {interaction.duration && (
                                  <span className="text-gray-500 font-mono flex items-center gap-1">
                                    <Clock size={12} /> {interaction.duration} min
                                  </span>
                                )}
                                <span className="text-gray-500 font-mono">
                                  {interaction.date.toLocaleDateString()}
                                </span>
                              </div>
                              {interaction.notes && (
                                <p className="text-gray-400 text-sm mt-1 italic">"{interaction.notes}"</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-black text-neon-pink">+{interaction.xpEarned} XP</p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {/* People Tab */}
        {activeTab === 'people' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-black text-white font-mono">YOUR PEOPLE</h2>
              <Button
                variant="neon"
                onClick={() => setShowPersonModal(true)}
                className="font-mono"
              >
                <UserPlus size={16} className="mr-2" /> ADD PERSON
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {relationships.map((person, index) => (
                <motion.div
                  key={person.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card variant="neon" className={`p-4 h-full ${categoryColors[person.category].bg} ${categoryColors[person.category].border}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-4xl">{person.icon}</span>
                      <div className="flex-1">
                        <h3 className="text-white font-bold">{person.name}</h3>
                        <p className={`text-sm ${categoryColors[person.category].text} capitalize`}>
                          {categoryColors[person.category].icon} {person.category}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400 font-mono">Connection Level</span>
                        <span className={`font-bold ${categoryColors[person.category].text}`}>{person.connectionLevel}%</span>
                      </div>
                      <div className="h-3 bg-black border border-white/20 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${person.connectionLevel}%` }}
                          transition={{ duration: 1 }}
                          className="h-full bg-gradient-to-r from-neon-pink to-neon-purple shadow-[0_0_10px_rgba(255,0,255,0.5)]"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{person.totalInteractions} interactions</span>
                      <span>Last: {person.lastContact.toLocaleDateString()}</span>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Breakdown */}
              <Card variant="neon" className="border-neon-purple/50">
                <CardHeader>
                  <CardTitle className="text-neon-purple font-mono">CATEGORY BREAKDOWN</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {categoryStats.map(stat => (
                    <div key={stat.category} className="flex items-center gap-4">
                      <span className="text-2xl">{stat.icon}</span>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-white font-medium capitalize">{stat.category}</span>
                          <span className={stat.text}>{stat.count}</span>
                        </div>
                        <div className="h-2 bg-black border border-white/20 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${totalInteractions > 0 ? (stat.count / totalInteractions) * 100 : 0}%` }}
                            className="h-full bg-gradient-to-r from-neon-purple to-neon-pink shadow-[0_0_5px_rgba(188,19,254,0.5)]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Tips */}
              <Card variant="neon" className="border-neon-yellow/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-neon-yellow font-mono">
                    <Sparkles className="w-5 h-5" /> SOCIAL TIPS
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { icon: '💬', tip: 'Deep conversations earn 60+ XP', color: 'text-neon-blue' },
                    { icon: '🎁', tip: 'Giving gifts = 75 XP + connection boost', color: 'text-neon-pink' },
                    { icon: '⭐', tip: 'Quality matters! 5-star interactions = 2.2x XP', color: 'text-neon-yellow' },
                    { icon: '🙏', tip: 'Helping others earns the most XP (90)', color: 'text-neon-green' },
                    { icon: '📞', tip: 'Even a quick call earns 35 XP', color: 'text-neon-purple' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <p className={item.color}>{item.tip}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Add Interaction Modal */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowAddModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="w-full max-w-md"
              >
                <Card variant="neon" className="border-neon-pink p-6 max-h-[90vh] overflow-y-auto">
                  <h2 className="text-2xl font-black text-white mb-4 font-mono flex items-center gap-2">
                    <Heart className="text-neon-pink" /> LOG INTERACTION
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400 font-mono block mb-2">INTERACTION TYPE</label>
                      <select
                        value={selectedType.name}
                        onChange={e => setSelectedType(interactionTypes.find(t => t.name === e.target.value)!)}
                        className="w-full bg-black/50 border-2 border-white/10 text-white p-3 font-mono focus:border-neon-pink outline-none rounded-md"
                      >
                        {interactionTypes.map(type => (
                          <option key={type.name} value={type.name} className="bg-black text-white">
                            {type.icon} {type.name} ({type.baseXP} XP)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 font-mono block mb-2">WITH WHO?</label>
                      <input
                        type="text"
                        value={personName}
                        onChange={e => setPersonName(e.target.value)}
                        placeholder="Enter name"
                        list="people-list"
                        className="w-full bg-black/50 border-2 border-white/10 text-white p-3 font-mono focus:border-neon-pink outline-none rounded-md"
                      />
                      <datalist id="people-list">
                        {relationships.map(r => (
                          <option key={r.id} value={r.name} />
                        ))}
                      </datalist>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 font-mono block mb-2">CATEGORY</label>
                      <div className="grid grid-cols-5 gap-2">
                        {(Object.keys(categoryColors) as Array<keyof typeof categoryColors>).map(cat => (
                          <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`p-2 text-2xl border-2 transition-colors rounded-md ${
                              selectedCategory === cat
                                ? `${categoryColors[cat].border} ${categoryColors[cat].bg}`
                                : 'border-white/10 hover:border-neon-pink/50'
                            }`}
                            title={cat}
                          >
                            {categoryColors[cat].icon}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 font-mono block mb-2">QUALITY (1-5 STARS)</label>
                      <div className="flex gap-2">
                        {([1, 2, 3, 4, 5] as const).map(star => (
                          <button
                            key={star}
                            onClick={() => setQuality(star)}
                            className={`flex-1 p-3 text-2xl border-2 transition-colors rounded-md ${
                              quality >= star
                                ? 'border-neon-yellow bg-neon-yellow/20'
                                : 'border-white/10 hover:border-neon-yellow/50'
                            }`}
                          >
                            {quality >= star ? '⭐' : '☆'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 font-mono block mb-2">DURATION (MINUTES)</label>
                      <input
                        type="number"
                        value={duration}
                        onChange={e => setDuration(parseInt(e.target.value))}
                        min="5"
                        step="5"
                        className="w-full bg-black/50 border-2 border-white/10 text-white p-3 font-mono focus:border-neon-pink outline-none rounded-md"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 font-mono block mb-2">NOTES (Optional)</label>
                      <textarea
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="What did you talk about?"
                        className="w-full bg-black/50 border-2 border-white/10 text-white p-3 font-mono focus:border-neon-pink outline-none resize-none rounded-md"
                        rows={2}
                      />
                    </div>

                    <Card variant="neon" className="bg-neon-pink/10 border-neon-pink/50 p-4">
                      <p className="text-neon-pink font-mono text-sm">
                        ⚡ You will earn <span className="font-black text-lg">+{calculateXP()} XP</span>
                      </p>
                    </Card>

                    <div className="flex gap-3">
                      <Button
                        variant="neon"
                        onClick={addInteraction}
                        className="flex-1 font-mono"
                      >
                        LOG IT
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowAddModal(false)}
                        className="flex-1 font-mono"
                      >
                        CANCEL
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Person Modal */}
        <AnimatePresence>
          {showPersonModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowPersonModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="w-full max-w-md"
              >
                <Card variant="neon" className="border-neon-blue p-6">
                  <h2 className="text-2xl font-black text-white mb-4 font-mono flex items-center gap-2">
                    <UserPlus className="text-neon-blue" /> ADD PERSON
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400 font-mono block mb-2">NAME</label>
                      <input
                        type="text"
                        value={newPersonName}
                        onChange={e => setNewPersonName(e.target.value)}
                        placeholder="Enter their name"
                        className="w-full bg-black/50 border-2 border-white/10 text-white p-3 font-mono focus:border-neon-blue outline-none rounded-md"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 font-mono block mb-2">CATEGORY</label>
                      <div className="grid grid-cols-5 gap-2">
                        {(Object.keys(categoryColors) as Array<keyof typeof categoryColors>).map(cat => (
                          <button
                            key={cat}
                            onClick={() => setNewPersonCategory(cat)}
                            className={`p-2 text-2xl border-2 transition-colors rounded-md ${
                              newPersonCategory === cat
                                ? `${categoryColors[cat].border} ${categoryColors[cat].bg}`
                                : 'border-white/10 hover:border-neon-blue/50'
                            }`}
                            title={cat}
                          >
                            {categoryColors[cat].icon}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 font-mono block mb-2">ICON</label>
                      <div className="flex flex-wrap gap-2">
                        {['🧑', '👨', '👩', '👴', '👵', '🧑‍💼', '👨‍💻', '👩‍💻', '🧑‍🎓', '👶'].map(icon => (
                          <button
                            key={icon}
                            onClick={() => setNewPersonIcon(icon)}
                            className={`text-2xl p-2 border-2 transition-colors rounded-md ${
                              newPersonIcon === icon ? 'border-neon-blue bg-neon-blue/20' : 'border-white/10 hover:border-neon-blue/50'
                            }`}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="neon"
                        onClick={addPerson}
                        className="flex-1 font-mono bg-neon-blue border-neon-blue hover:bg-neon-blue/80 text-black"
                      >
                        ADD PERSON
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowPersonModal(false)}
                        className="flex-1 font-mono"
                      >
                        CANCEL
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
