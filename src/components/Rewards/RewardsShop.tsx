import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gift, Coffee, Gamepad2, Users, 
  Sparkles, Crown, Lock,
  CheckCircle, Plus,
  RotateCw, Tag
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Reward, ShopItem } from '../../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input'; // Assuming I have Input
import { Label } from '../ui/label'; // Assuming I have Label

// 6 hour cooldown in milliseconds
const SPIN_COOLDOWN_MS = 6 * 60 * 60 * 1000;

// Default rewards that users can redeem with Gold
const DEFAULT_REWARDS: Reward[] = [
  // Break Rewards
  { id: 'break-1', name: '15 Min Break', description: 'Take a well-deserved 15 minute break', cost: 100, category: 'break', icon: '☕', rarity: 'common', timesRedeemed: 0 },
  { id: 'break-2', name: '30 Min Break', description: 'Extended 30 minute relaxation time', cost: 175, category: 'break', icon: '🧘', rarity: 'common', timesRedeemed: 0 },
  { id: 'break-3', name: '1 Hour Break', description: 'Full hour of guilt-free rest', cost: 300, category: 'break', icon: '😴', rarity: 'rare', timesRedeemed: 0 },
  { id: 'break-4', name: 'Power Nap', description: '20 minute power nap to recharge', cost: 150, category: 'break', icon: '💤', rarity: 'common', timesRedeemed: 0 },
  
  // Entertainment Rewards
  { id: 'ent-1', name: '1 YouTube Video', description: 'Watch one entertaining video', cost: 75, category: 'entertainment', icon: '📺', rarity: 'common', timesRedeemed: 0 },
  { id: 'ent-2', name: '30 Min Streaming', description: 'Netflix, Prime, or any streaming', cost: 200, category: 'entertainment', icon: '🎬', rarity: 'rare', timesRedeemed: 0 },
  { id: 'ent-3', name: '1 Episode', description: 'Watch one episode of your favorite show', cost: 250, category: 'entertainment', icon: '📱', rarity: 'rare', timesRedeemed: 0 },
  { id: 'ent-4', name: 'Music Session', description: '30 minutes of music listening', cost: 50, category: 'entertainment', icon: '🎵', rarity: 'common', timesRedeemed: 0 },
  
  // Food Rewards
  { id: 'food-1', name: 'Snack Break', description: 'Treat yourself to a snack', cost: 125, category: 'food', icon: '🍿', rarity: 'common', timesRedeemed: 0 },
  { id: 'food-2', name: 'Coffee/Tea', description: 'Enjoy your favorite beverage', cost: 75, category: 'food', icon: '☕', rarity: 'common', timesRedeemed: 0 },
  { id: 'food-3', name: 'Order Food', description: 'Order food delivery as a treat', cost: 500, category: 'food', icon: '🍕', rarity: 'epic', timesRedeemed: 0 },
  { id: 'food-4', name: 'Ice Cream', description: 'Sweet cold treat time!', cost: 150, category: 'food', icon: '🍦', rarity: 'rare', timesRedeemed: 0 },
  
  // Gaming Rewards
  { id: 'game-1', name: '30 Min Gaming', description: '30 minutes of gaming time', cost: 250, category: 'gaming', icon: '🎮', rarity: 'rare', timesRedeemed: 0 },
  { id: 'game-2', name: '1 Hour Gaming', description: 'Full hour of gaming session', cost: 450, category: 'gaming', icon: '🕹️', rarity: 'epic', timesRedeemed: 0 },
  { id: 'game-3', name: 'Quick Match', description: 'Play one quick game match', cost: 150, category: 'gaming', icon: '⚔️', rarity: 'common', timesRedeemed: 0 },
  
  // Social Rewards
  { id: 'social-1', name: 'Call a Friend', description: 'Catch up with a friend', cost: 100, category: 'social', icon: '📞', rarity: 'common', timesRedeemed: 0 },
  { id: 'social-2', name: 'Video Chat', description: 'Video call with friends/family', cost: 150, category: 'social', icon: '💬', rarity: 'rare', timesRedeemed: 0 },
  
  // Premium/Legendary Rewards
  { id: 'premium-1', name: 'Skip a Task', description: 'Skip one low-priority task guilt-free', cost: 750, category: 'custom', icon: '⏭️', rarity: 'legendary', timesRedeemed: 0, unlockLevel: 10 },
  { id: 'premium-2', name: 'Lazy Day Pass', description: 'Take a half-day off from grinding', cost: 1500, category: 'custom', icon: '🛋️', rarity: 'legendary', timesRedeemed: 0, unlockLevel: 15 },
  { id: 'premium-3', name: 'Movie Night', description: 'Full movie watching session', cost: 600, category: 'entertainment', icon: '🎥', rarity: 'epic', timesRedeemed: 0 },
];

export function RewardsShop() {
  const { state, dispatch } = useApp();
  const { darkMode, user } = state;
  const rewards: ShopItem[] = (state.shopItems && state.shopItems.length > 0)
    ? state.shopItems
    : DEFAULT_REWARDS.map(r => ({ ...r, purchased: false }));
  const [customRewards, setCustomRewards] = useState<ShopItem[]>([]);

  const [lastSpinTime, setLastSpinTime] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('lastSpinTime');
      return saved ? parseInt(saved) : 0;
    } catch {
      return 0;
    }
  });
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const [freeSpinsAvailable, setFreeSpinsAvailable] = useState<number>(1);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [spinResult, setSpinResult] = useState<{ prize: string; xp: number } | null>(null);
  const [selectedReward, setSelectedReward] = useState<ShopItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'break' | 'entertainment' | 'food' | 'gaming' | 'social' | 'custom'>('all');
  const [showRedeemModal, setShowRedeemModal] = useState<boolean>(false);
  const [showAddCustom, setShowAddCustom] = useState<boolean>(false);
  const [customReward, setCustomReward] = useState<Partial<Reward>>({
    name: '',
    description: '',
    cost: 100,
    icon: '🎁',
    category: 'custom',
    rarity: 'common'
  });

  // Local persistence removed in favor of AppContext state

  // Cooldown timer effect
  useEffect(() => {
    const updateCooldown = () => {
      const now = Date.now();
      const elapsed = now - lastSpinTime;
      const remaining = Math.max(0, SPIN_COOLDOWN_MS - elapsed);
      setCooldownRemaining(remaining);
    };

    updateCooldown();
    const interval = setInterval(updateCooldown, 1000);
    return () => clearInterval(interval);
  }, [lastSpinTime]);

  const formatCooldown = (ms: number): string => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const isCooldownActive = cooldownRemaining > 0 && freeSpinsAvailable <= 0;

  const currentGold = user?.gold || 0;
  const userLevel = user?.level || 1;

  const categories = [
    { id: 'all', name: 'All Rewards', icon: Gift },
    { id: 'break', name: 'Breaks', icon: Coffee },
    { id: 'entertainment', name: 'Entertainment', icon: Sparkles },
    { id: 'food', name: 'Food & Drinks', icon: Coffee },
    { id: 'gaming', name: 'Gaming', icon: Gamepad2 },
    { id: 'social', name: 'Social', icon: Users },
    { id: 'custom', name: 'Special', icon: Crown },
  ];

  const displayRewards = [...rewards, ...customRewards];
  const filteredRewards = selectedCategory === 'all' 
    ? displayRewards 
    : displayRewards.filter(r => r.category === selectedCategory);

  const getRarityColor = (rarity: Reward['rarity']) => {
    switch (rarity) {
      case 'common': return 'text-gray-400 border-gray-400/30';
      case 'rare': return 'text-blue-400 border-blue-400/30';
      case 'epic': return 'text-purple-400 border-purple-400/30';
      case 'legendary': return 'text-yellow-400 border-yellow-400/30 shadow-[0_0_10px_rgba(250,204,21,0.2)]';
      default: return 'text-gray-400';
    }
  };

  const canAfford = (cost: number) => currentGold >= cost;
  const isLocked = (reward: Reward): boolean => !!(reward.unlockLevel && userLevel < reward.unlockLevel);

  const handleRedeem = (reward: ShopItem) => {
    if (!canAfford(reward.cost) || isLocked(reward)) return;
    setSelectedReward(reward);
    setShowRedeemModal(true);
  };

  const confirmRedeem = () => {
    if (!selectedReward || !user) return;
    if (selectedReward.id.startsWith('custom-')) {
      dispatch({ type: 'SPEND_GOLD', payload: { amount: selectedReward.cost, item: selectedReward.name } });
    } else {
      dispatch({ type: 'BUY_SHOP_ITEM', payload: { itemId: selectedReward.id, cost: selectedReward.cost } });
    }
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: Date.now().toString(),
        type: 'reward',
        title: '🎁 Reward Redeemed!',
        message: `You spent ${selectedReward.cost} Gold on "${selectedReward.name}". Enjoy!`,
        timestamp: new Date(),
      }
    });
    dispatch({ type: 'SHOW_CONFETTI', payload: true });
    setTimeout(() => dispatch({ type: 'SHOW_CONFETTI', payload: false }), 3000);
    setShowRedeemModal(false);
    setSelectedReward(null);
  };

  const addCustomReward = () => {
    if (!customReward.name.trim()) return;

    const newReward: ShopItem = {
      id: `custom-${Date.now()}`,
      name: customReward.name,
      description: customReward.description || 'Custom reward',
      cost: customReward.cost,
      category: 'custom',
      icon: customReward.icon,
      rarity: 'common',
      timesRedeemed: 0,
      purchased: false
    };

    setCustomRewards(prev => [newReward, ...prev]);

    setShowAddCustom(false);
    setCustomReward({
      name: '',
      description: '',
      cost: 100,
      category: 'custom',
      icon: '🎁',
    });
  };

  const handleSpin = () => {
    if (isCooldownActive || isSpinning) return;

    setIsSpinning(true);
    setFreeSpinsAvailable(prev => Math.max(0, prev - 1));

    // Spin animation duration
    setTimeout(() => {
      const prizes = [
        { name: '50 XP', xp: 50 },
        { name: '100 XP', xp: 100 },
        { name: '200 XP', xp: 200 },
        { name: '500 XP', xp: 500 }, // Rare
        { name: '10 XP', xp: 10 },
      ];
      
      const prize = prizes[Math.floor(Math.random() * prizes.length)];
      setSpinResult({ prize: prize.name, xp: prize.xp });
      setIsSpinning(false);
      
      dispatch({
        type: 'ADD_XP',
        payload: { amount: prize.xp, source: 'Daily Spin Win' }
      });

      setLastSpinTime(Date.now());
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastSpinTime', Date.now().toString());
      }
    }, 3000);
  };

  return (
    <div className={`min-h-screen p-6 ${darkMode ? 'bg-gray-950' : 'bg-gray-50'} transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className={cn(
              "text-4xl font-extrabold tracking-tight mb-2 font-cyber",
              darkMode ? "text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-neon-purple" : "text-gray-900"
            )}>
              REWARDS MARKETPLACE
            </h1>
            <p className={cn("text-lg", darkMode ? "text-gray-400" : "text-gray-600")}>
              Exchange your hard-earned Gold for real-world rewards.
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-black/20 p-4 rounded-xl backdrop-blur-sm border border-white/10">
            <div className="text-right">
              <p className="text-xs text-gray-400 uppercase tracking-widest">Available Gold</p>
              <p className="text-3xl font-bold text-neon-yellow font-mono text-yellow-400">
                {currentGold.toLocaleString()} 🪙
              </p>
            </div>
            <div className="h-10 w-[1px] bg-white/10" />
            <Button variant="neon" size="sm" onClick={() => setShowAddCustom(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Custom
            </Button>
          </div>
        </div>

        {/* Daily Spin Banner */}
        <Card variant="cyber" className="relative overflow-hidden border-neon-purple/50">
          <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/20 to-neon-blue/20" />
          <CardContent className="relative z-10 flex flex-col md:flex-row items-center justify-between p-8">
            <div className="flex items-center gap-6 mb-6 md:mb-0">
              <div className={`p-4 rounded-full bg-neon-purple/20 border border-neon-purple text-neon-purple ${isSpinning ? 'animate-spin' : ''}`}>
                <RotateCw className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white font-cyber">DAILY LUCKY SPIN</h3>
                <p className="text-gray-300">Win up to 500 XP every 6 hours!</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {spinResult && (
                <div className="animate-in fade-in slide-in-from-bottom-4 mr-4">
                  <Badge variant="outline" className="text-neon-green border-neon-green px-4 py-2 text-lg">
                    Won {spinResult.prize}!
                  </Badge>
                </div>
              )}
              
              {isCooldownActive ? (
                <div className="text-center px-6 py-2 bg-black/40 rounded-lg border border-white/10">
                  <p className="text-xs text-gray-400 uppercase">Next Spin In</p>
                  <p className="text-xl font-mono text-white">{formatCooldown(cooldownRemaining)}</p>
                </div>
              ) : (
                <Button 
                  variant="glitch" 
                  size="lg" 
                  onClick={handleSpin}
                  disabled={isSpinning}
                  className="min-w-[150px]"
                >
                  {isSpinning ? 'SPINNING...' : 'SPIN NOW'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <div className="flex flex-wrap gap-3 pb-2 overflow-x-auto">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "neon" : "ghost"}
              onClick={() => setSelectedCategory(category.id as 'all' | 'break' | 'entertainment' | 'food' | 'gaming' | 'social' | 'custom')}
              className="capitalize whitespace-nowrap"
            >
              <category.icon className="w-4 h-4 mr-2" />
              {category.name}
            </Button>
          ))}
        </div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredRewards.map((reward, index) => {
              const affordable = canAfford(reward.cost);
              const locked = isLocked(reward);
              const rarityStyle = getRarityColor(reward.rarity);
              
              return (
                <motion.div
                  key={reward.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card 
                    variant="neon"
                    className={cn(
                      "h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:shadow-neon-blue/20",
                      locked ? "opacity-60 grayscale" : "hover:-translate-y-1",
                      selectedReward?.id === reward.id && "ring-2 ring-neon-blue"
                    )}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="text-4xl mb-2 filter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{reward.icon}</div>
                        <Badge variant="outline" className={cn("capitalize text-xs font-mono border-opacity-50", rarityStyle)}>
                          {reward.rarity}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl font-cyber text-white">{reward.name}</CardTitle>
                      <CardDescription className="line-clamp-2 h-10 text-gray-400 font-mono text-xs">
                        {reward.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="flex-grow">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2 font-mono">
                        <Tag className="w-3 h-3" />
                        <span className="capitalize">{reward.category}</span>
                      </div>
                      {locked && (
                        <div className="flex items-center gap-2 text-red-400 text-xs mt-2 font-mono border border-red-500/30 p-1 rounded bg-red-500/10">
                          <Lock className="w-3 h-3" />
                          <span>Level {reward.unlockLevel} Required</span>
                        </div>
                      )}
                    </CardContent>

                    <CardFooter className="pt-0">
                      <Button 
                        variant={affordable && !locked && !reward.purchased ? "neon" : "ghost"}
                        className={cn(
                          "w-full font-bold font-mono",
                          !affordable && !locked && "text-gray-500 border-gray-700 bg-gray-900/50 hover:bg-gray-900/50 cursor-not-allowed",
                          locked && "opacity-50 cursor-not-allowed"
                        )}
                        disabled={!affordable || locked || !!reward.purchased}
                        onClick={() => handleRedeem(reward)}
                      >
                        {locked ? (
                          <span className="flex items-center gap-2"><Lock className="w-4 h-4" /> LOCKED</span>
                        ) : reward.purchased ? (
                          <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> OWNED</span>
                        ) : (
                          <span className="flex items-center gap-2 text-yellow-400">
                            {reward.cost} Gold
                          </span>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Redeem Confirmation Modal */}
      {selectedReward && (
        <Dialog open={showRedeemModal} onOpenChange={setShowRedeemModal}>
          <DialogContent className="sm:max-w-md border-neon-blue/50 bg-black/90 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-cyber text-center text-neon-blue">
                CONFIRM REDEMPTION
              </DialogTitle>
              <DialogDescription className="text-center pt-4">
                <div className="text-6xl mb-4">{selectedReward.icon}</div>
                <p className="text-lg text-white mb-2">{selectedReward.name}</p>
                <p className="text-gray-400">{selectedReward.description}</p>
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center py-4 space-y-2">
              <div className="text-sm text-gray-400">Cost</div>
              <div className="text-3xl font-mono font-bold text-neon-purple text-yellow-400">{selectedReward.cost} Gold</div>
              <div className="text-xs text-gray-500">Remaining Balance: {(currentGold - selectedReward.cost).toLocaleString()} Gold</div>
            </div>
            <DialogFooter className="sm:justify-center gap-4">
              <Button variant="ghost" onClick={() => setShowRedeemModal(false)}>
                Cancel
              </Button>
              <Button variant="neon" onClick={confirmRedeem} className="w-full sm:w-auto">
                Confirm Purchase
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Custom Reward Modal */}
      <Dialog open={showAddCustom} onOpenChange={setShowAddCustom}>
        <DialogContent className="sm:max-w-md border-neon-purple/50 bg-black/90 backdrop-blur-xl text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-cyber text-neon-purple">Create Custom Reward</DialogTitle>
            <DialogDescription className="text-gray-400">
              Add your own personal rewards to the shop.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reward-name" className="text-gray-300">Reward Name</Label>
              <Input
                id="reward-name"
                placeholder="e.g., Buy a new game"
                value={customReward.name}
                onChange={(e) => setCustomReward({ ...customReward, name: e.target.value })}
                className="bg-gray-800 border-gray-700 text-white focus:border-neon-purple"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reward-desc" className="text-gray-300">Description (Optional)</Label>
              <Input
                id="reward-desc"
                placeholder="What will you do?"
                value={customReward.description}
                onChange={(e) => setCustomReward({ ...customReward, description: e.target.value })}
                className="bg-gray-800 border-gray-700 text-white focus:border-neon-purple"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reward-cost" className="text-gray-300">Cost (Gold)</Label>
                <Input
                  id="reward-cost"
                  type="number"
                  min="1"
                  value={customReward.cost}
                  onChange={(e) => setCustomReward({ ...customReward, cost: parseInt(e.target.value) || 0 })}
                  className="bg-gray-800 border-gray-700 text-white focus:border-neon-purple"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reward-icon" className="text-gray-300">Icon (Emoji)</Label>
                <Input
                  id="reward-icon"
                  placeholder="🎁"
                  value={customReward.icon}
                  onChange={(e) => setCustomReward({ ...customReward, icon: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white focus:border-neon-purple text-center text-2xl"
                  maxLength={2}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAddCustom(false)} className="text-gray-400 hover:text-white">
              Cancel
            </Button>
            <Button variant="neon" onClick={addCustomReward} disabled={!customReward.name}>
              Add Reward
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

