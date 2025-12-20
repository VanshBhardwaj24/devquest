import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gift, Coffee, Gamepad2, Users, ShoppingBag, 
  Sparkles, Crown, Lock, TrendingUp, Heart,
  CheckCircle, Plus, Coins, Diamond, AlertTriangle,
  RotateCw, Star, Clock, Timer, Zap
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Reward } from '../../types';

// 6 hour cooldown in milliseconds
const SPIN_COOLDOWN_MS = 6 * 60 * 60 * 1000; // 6 hours

// Default rewards that users can redeem with XP
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
  { id: 'ent-5', name: 'Social Media Scroll', description: '15 minutes of social media', cost: 100, category: 'entertainment', icon: '📲', rarity: 'common', timesRedeemed: 0 },
  
  // Food Rewards
  { id: 'food-1', name: 'Snack Break', description: 'Treat yourself to a snack', cost: 125, category: 'food', icon: '🍿', rarity: 'common', timesRedeemed: 0 },
  { id: 'food-2', name: 'Coffee/Tea', description: 'Enjoy your favorite beverage', cost: 75, category: 'food', icon: '☕', rarity: 'common', timesRedeemed: 0 },
  { id: 'food-3', name: 'Order Food', description: 'Order food delivery as a treat', cost: 500, category: 'food', icon: '🍕', rarity: 'epic', timesRedeemed: 0 },
  { id: 'food-4', name: 'Ice Cream', description: 'Sweet cold treat time!', cost: 150, category: 'food', icon: '🍦', rarity: 'rare', timesRedeemed: 0 },
  { id: 'food-5', name: 'Bubble Tea', description: 'Enjoy a refreshing bubble tea', cost: 175, category: 'food', icon: '🧋', rarity: 'rare', timesRedeemed: 0 },
  
  // Gaming Rewards
  { id: 'game-1', name: '30 Min Gaming', description: '30 minutes of gaming time', cost: 250, category: 'gaming', icon: '🎮', rarity: 'rare', timesRedeemed: 0 },
  { id: 'game-2', name: '1 Hour Gaming', description: 'Full hour of gaming session', cost: 450, category: 'gaming', icon: '🕹️', rarity: 'epic', timesRedeemed: 0 },
  { id: 'game-3', name: 'Quick Match', description: 'Play one quick game match', cost: 150, category: 'gaming', icon: '⚔️', rarity: 'common', timesRedeemed: 0 },
  { id: 'game-4', name: 'Mobile Gaming', description: '20 minutes of mobile games', cost: 100, category: 'gaming', icon: '📱', rarity: 'common', timesRedeemed: 0 },
  
  // Social Rewards
  { id: 'social-1', name: 'Call a Friend', description: 'Catch up with a friend', cost: 100, category: 'social', icon: '📞', rarity: 'common', timesRedeemed: 0 },
  { id: 'social-2', name: 'Video Chat', description: 'Video call with friends/family', cost: 150, category: 'social', icon: '💬', rarity: 'rare', timesRedeemed: 0 },
  { id: 'social-3', name: 'Go Outside', description: 'Take a 15 min walk outside', cost: 75, category: 'social', icon: '🚶', rarity: 'common', timesRedeemed: 0 },
  
  // Premium/Legendary Rewards
  { id: 'premium-1', name: 'Skip a Task', description: 'Skip one low-priority task guilt-free', cost: 750, category: 'custom', icon: '⏭️', rarity: 'legendary', timesRedeemed: 0, unlockLevel: 10 },
  { id: 'premium-2', name: 'Lazy Day Pass', description: 'Take a half-day off from grinding', cost: 1500, category: 'custom', icon: '🛋️', rarity: 'legendary', timesRedeemed: 0, unlockLevel: 15 },
  { id: 'premium-3', name: 'Movie Night', description: 'Full movie watching session', cost: 600, category: 'entertainment', icon: '🎥', rarity: 'epic', timesRedeemed: 0 },
  { id: 'premium-4', name: 'Buy Something Nice', description: 'Small purchase under $20', cost: 2000, category: 'custom', icon: '🛍️', rarity: 'legendary', timesRedeemed: 0, unlockLevel: 20 },
  { id: 'premium-5', name: 'Gaming Marathon', description: '2 hours of uninterrupted gaming', cost: 1000, category: 'gaming', icon: '🏆', rarity: 'legendary', timesRedeemed: 0, unlockLevel: 12 },
];

export function RewardsShop() {
  const { state, dispatch } = useApp();
  const { darkMode, user } = state;
  const [rewards, setRewards] = useState<Reward[]>(DEFAULT_REWARDS);
  const [selectedCategory, setSelectedCategory] = useState<'all' | Reward['category']>('all');
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [recentlyRedeemed, setRecentlyRedeemed] = useState<string[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<{ prize: string; xp: number } | null>(null);
  const [freeSpinsAvailable, setFreeSpinsAvailable] = useState(1);
  
  // 6-hour cooldown state
  const [lastSpinTime, setLastSpinTime] = useState<number>(() => {
    const saved = localStorage.getItem('lastSpinTime');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  
  const [customReward, setCustomReward] = useState({
    name: '',
    description: '',
    cost: 100,
    category: 'custom' as Reward['category'],
    icon: '🎁',
  });

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

  // Format cooldown time
  const formatCooldown = (ms: number): string => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const isCooldownActive = cooldownRemaining > 0 && freeSpinsAvailable <= 0;

  const currentXP = user?.xp || 0;
  const userLevel = user?.level || 1;

  const categories = [
    { id: 'all', name: 'All Rewards', icon: Gift, color: 'from-purple-500 to-pink-500' },
    { id: 'break', name: 'Breaks', icon: Coffee, color: 'from-blue-500 to-cyan-500' },
    { id: 'entertainment', name: 'Entertainment', icon: Sparkles, color: 'from-pink-500 to-rose-500' },
    { id: 'food', name: 'Food & Drinks', icon: Coffee, color: 'from-orange-500 to-amber-500' },
    { id: 'gaming', name: 'Gaming', icon: Gamepad2, color: 'from-green-500 to-emerald-500' },
    { id: 'social', name: 'Social', icon: Users, color: 'from-indigo-500 to-violet-500' },
    { id: 'custom', name: 'Special', icon: Crown, color: 'from-yellow-500 to-amber-500' },
  ];

  const filteredRewards = selectedCategory === 'all' 
    ? rewards 
    : rewards.filter(r => r.category === selectedCategory);

  const getRarityColor = (rarity: Reward['rarity']) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-500';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 to-orange-500';
    }
  };

  const getRarityBorder = (rarity: Reward['rarity']) => {
    switch (rarity) {
      case 'common': return 'border-gray-400';
      case 'rare': return 'border-blue-400';
      case 'epic': return 'border-purple-400';
      case 'legendary': return 'border-yellow-400 animate-pulse';
    }
  };

  const canAfford = (cost: number) => currentXP >= cost;
  const isLocked = (reward: Reward): boolean => !!(reward.unlockLevel && userLevel < reward.unlockLevel);

  const handleRedeem = (reward: Reward) => {
    if (!canAfford(reward.cost) || isLocked(reward)) return;
    setSelectedReward(reward);
    setShowRedeemModal(true);
  };

  const confirmRedeem = () => {
    if (!selectedReward || !user) return;

    // Deduct XP
    dispatch({
      type: 'ADD_XP',
      payload: { amount: -selectedReward.cost, source: `Redeemed: ${selectedReward.name}` }
    });

    // Update reward stats
    setRewards(prev => prev.map(r => 
      r.id === selectedReward.id 
        ? { ...r, timesRedeemed: r.timesRedeemed + 1, lastRedeemed: new Date() }
        : r
    ));

    // Add to recently redeemed
    setRecentlyRedeemed(prev => [selectedReward.id, ...prev.slice(0, 4)]);

    // Show notification
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: Date.now().toString(),
        type: 'reward',
        title: '🎁 Reward Redeemed!',
        message: `You spent ${selectedReward.cost} XP on "${selectedReward.name}". Enjoy!`,
        timestamp: new Date(),
      }
    });

    // Show confetti
    dispatch({ type: 'SHOW_CONFETTI', payload: true });
    setTimeout(() => dispatch({ type: 'SHOW_CONFETTI', payload: false }), 3000);

    setShowRedeemModal(false);
    setSelectedReward(null);
  };

  const addCustomReward = () => {
    if (!customReward.name.trim()) return;

    const newReward: Reward = {
      id: `custom-${Date.now()}`,
      name: customReward.name,
      description: customReward.description || 'Custom reward',
      cost: customReward.cost,
      category: 'custom',
      icon: customReward.icon,
      rarity: customReward.cost >= 500 ? 'epic' : customReward.cost >= 200 ? 'rare' : 'common',
      timesRedeemed: 0,
    };

    setRewards(prev => [...prev, newReward]);
    setCustomReward({ name: '', description: '', cost: 100, category: 'custom', icon: '🎁' });
    setShowAddCustom(false);

    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: Date.now().toString(),
        type: 'reward',
        title: '✨ Custom Reward Added!',
        message: `"${newReward.name}" is now available in your shop!`,
        timestamp: new Date(),
      }
    });
  };

  // Calculate stats
  const totalSpent = rewards.reduce((sum, r) => sum + (r.timesRedeemed * r.cost), 0);
  const totalRedeemed = rewards.reduce((sum, r) => sum + r.timesRedeemed, 0);
  const favoriteReward = rewards.reduce((max, r) => r.timesRedeemed > max.timesRedeemed ? r : max, rewards[0]);

  // Spin wheel prizes
  const spinPrizes = [
    { prize: '50 XP', xp: 50, color: 'from-green-400 to-green-500', weight: 30 },
    { prize: '100 XP', xp: 100, color: 'from-blue-400 to-blue-500', weight: 25 },
    { prize: '150 XP', xp: 150, color: 'from-purple-400 to-purple-500', weight: 15 },
    { prize: '250 XP', xp: 250, color: 'from-pink-400 to-pink-500', weight: 10 },
    { prize: '500 XP', xp: 500, color: 'from-yellow-400 to-orange-500', weight: 5 },
    { prize: '1000 XP JACKPOT!', xp: 1000, color: 'from-red-400 to-red-600', weight: 2 },
    { prize: 'Free Spin!', xp: 0, color: 'from-cyan-400 to-cyan-500', weight: 8 },
    { prize: 'Try Again', xp: 0, color: 'from-gray-400 to-gray-500', weight: 5 },
  ];

  const spinWheel = () => {
    if (isSpinning) return;
    if (isCooldownActive) return; // Check cooldown
    if (freeSpinsAvailable <= 0 && currentXP < 100) return;
    
    // Deduct cost if no free spins
    if (freeSpinsAvailable <= 0) {
      dispatch({ type: 'ADD_XP', payload: { amount: -100, source: 'Lucky Spin cost' } });
      // Start cooldown when using paid spin
      const now = Date.now();
      setLastSpinTime(now);
      localStorage.setItem('lastSpinTime', now.toString());
    } else {
      setFreeSpinsAvailable(prev => prev - 1);
    }

    setIsSpinning(true);
    setSpinResult(null);

    // Weighted random selection
    const totalWeight = spinPrizes.reduce((sum, p) => sum + p.weight, 0);
    let random = Math.random() * totalWeight;
    let selectedPrize = spinPrizes[0];
    
    for (const prize of spinPrizes) {
      random -= prize.weight;
      if (random <= 0) {
        selectedPrize = prize;
        break;
      }
    }

    // Spin animation duration
    setTimeout(() => {
      setIsSpinning(false);
      setSpinResult({ prize: selectedPrize.prize, xp: selectedPrize.xp });
      
      if (selectedPrize.prize === 'Free Spin!') {
        setFreeSpinsAvailable(prev => prev + 1);
      } else if (selectedPrize.xp > 0) {
        dispatch({ type: 'ADD_XP', payload: { amount: selectedPrize.xp, source: `Lucky Spin: ${selectedPrize.prize}` } });
        if (selectedPrize.xp >= 500) {
          dispatch({ type: 'SHOW_CONFETTI', payload: true });
          setTimeout(() => dispatch({ type: 'SHOW_CONFETTI', payload: false }), 3000);
        }
      }

      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: Date.now().toString(),
          type: 'reward',
          title: '🎰 Lucky Spin Result!',
          message: selectedPrize.xp > 0 ? `You won ${selectedPrize.prize}!` : selectedPrize.prize,
          timestamp: new Date(),
        }
      });
    }, 3000);
  };

  return (
    <div className={`p-3 sm:p-4 lg:p-6 ${darkMode ? 'bg-[#0a0a0a]' : 'bg-gray-50'} min-h-screen pb-20 lg:pb-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <h1 className={`text-2xl sm:text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-2 sm:gap-3`}>
                <ShoppingBag className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
                Rewards Shop 
                <span className="text-xl sm:text-2xl">🎁</span>
              </h1>
              <p className={`text-sm sm:text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'} mt-1 sm:mt-2`}>
                Spend your hard-earned XP on well-deserved rewards!
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddCustom(true)}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg text-sm sm:text-base w-full sm:w-auto justify-center"
            >
              <Plus size={18} />
              Add Custom Reward
            </motion.button>
          </motion.div>
        </div>

        {/* XP Balance & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.03 }}
            className={`p-6 rounded-2xl ${darkMode ? 'bg-gradient-to-br from-purple-900 to-indigo-900' : 'bg-gradient-to-br from-purple-500 to-indigo-600'} shadow-xl text-white`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm font-medium">Available XP</p>
                <div className="flex items-center gap-2 mt-1">
                  <Coins className="h-6 w-6 text-yellow-400" />
                  <span className="text-3xl font-bold">{currentXP.toLocaleString()}</span>
                </div>
              </div>
              <Diamond className="h-12 w-12 text-purple-300 opacity-50" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.03 }}
            className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg border-l-4 border-green-500`}
          >
            <div className="flex items-center gap-3">
              <TrendingUp className="h-10 w-10 text-green-500" />
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Spent</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {totalSpent.toLocaleString()} XP
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.03 }}
            className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg border-l-4 border-blue-500`}
          >
            <div className="flex items-center gap-3">
              <Gift className="h-10 w-10 text-blue-500" />
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Times Redeemed</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {totalRedeemed}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.03 }}
            className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg border-l-4 border-pink-500`}
          >
            <div className="flex items-center gap-3">
              <Heart className="h-10 w-10 text-pink-500" />
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Favorite Reward</p>
                <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'} truncate`}>
                  {favoriteReward?.name || 'None yet'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          {categories.map((cat) => (
            <motion.button
              key={cat.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(cat.id as 'all' | Reward['category'])}
              className={`px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all ${
                selectedCategory === cat.id
                  ? `bg-gradient-to-r ${cat.color} text-white shadow-lg`
                  : darkMode
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
              }`}
            >
              <cat.icon size={18} />
              {cat.name}
            </motion.button>
          ))}
        </div>

        {/* Lucky Spin Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-4 sm:mb-8 p-4 sm:p-6 rounded-xl sm:rounded-2xl ${darkMode ? 'bg-gradient-to-r from-purple-900 via-pink-900 to-purple-900' : 'bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500'} shadow-2xl relative overflow-hidden`}
        >
          {/* Animated background */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -right-20 -top-20 w-40 sm:w-60 h-40 sm:h-60 bg-white/10 rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -left-10 -bottom-10 w-32 sm:w-40 h-32 sm:h-40 bg-yellow-400/20 rounded-full"
          />

          <div className="relative z-10 flex flex-col items-center justify-between gap-4 sm:gap-6">
            <div className="text-center">
              <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3 justify-center">
                <span className="text-2xl sm:text-3xl">🎰</span>
                Lucky Spin
                <span className="text-2xl sm:text-3xl">✨</span>
              </h3>
              <p className="text-white/80 mt-2 text-sm sm:text-base">
                Spin the wheel for a chance to win bonus XP!
              </p>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3 justify-center">
                <div className="flex items-center gap-2 bg-white/20 rounded-lg px-2 sm:px-3 py-1 text-sm">
                  <RotateCw size={14} className="text-cyan-300" />
                  <span className="text-white font-medium">{freeSpinsAvailable} Free</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 rounded-lg px-2 sm:px-3 py-1 text-sm">
                  <Coins size={14} className="text-yellow-300" />
                  <span className="text-white font-medium">100 XP</span>
                </div>
                {/* Cooldown Timer Display */}
                {isCooldownActive && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 bg-red-500/30 rounded-lg px-2 sm:px-3 py-1 border border-red-400/50 text-sm"
                  >
                    <Timer size={16} className="text-red-300 animate-pulse" />
                    <span className="text-white font-medium font-mono">{formatCooldown(cooldownRemaining)}</span>
                  </motion.div>
                )}
                {!isCooldownActive && lastSpinTime > 0 && freeSpinsAvailable <= 0 && (
                  <div className="flex items-center gap-2 bg-green-500/30 rounded-lg px-3 py-1 border border-green-400/50">
                    <Zap size={16} className="text-green-300" />
                    <span className="text-white font-medium">Ready to spin!</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center gap-4">
              {/* Spin Wheel Visual */}
              <div className="relative">
                <motion.div
                  animate={isSpinning ? { rotate: [0, 1800 + Math.random() * 720] } : {}}
                  transition={{ duration: 3, ease: "easeOut" }}
                  className="w-28 h-28 sm:w-40 sm:h-40 rounded-full border-4 sm:border-8 border-white/30 bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center shadow-2xl"
                >
                  {isSpinning ? (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="text-3xl sm:text-4xl"
                    >
                      🎡
                    </motion.div>
                  ) : spinResult ? (
                    <div className="text-center p-2">
                      <div className="text-xl sm:text-2xl mb-1">{spinResult.xp > 0 ? '🎉' : spinResult.prize === 'Free Spin!' ? '🔄' : '😅'}</div>
                      <div className="text-white text-xs sm:text-sm font-bold">{spinResult.prize}</div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Star className="h-8 w-8 sm:h-12 sm:w-12 text-white mx-auto" />
                      <p className="text-white text-xs font-bold mt-1">SPIN!</p>
                    </div>
                  )}
                </motion.div>
                {/* Pointer */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] sm:border-l-[10px] border-r-[8px] sm:border-r-[10px] border-b-[16px] sm:border-b-[20px] border-l-transparent border-r-transparent border-b-yellow-400" />
              </div>

              <motion.button
                whileHover={{ scale: isCooldownActive ? 1 : 1.05 }}
                whileTap={{ scale: isCooldownActive ? 1 : 0.95 }}
                onClick={spinWheel}
                disabled={isSpinning || isCooldownActive || (freeSpinsAvailable <= 0 && currentXP < 100)}
                className={`px-6 sm:px-8 py-2 sm:py-3 rounded-xl font-bold text-base sm:text-lg shadow-lg transition-all ${
                  isSpinning || isCooldownActive || (freeSpinsAvailable <= 0 && currentXP < 100)
                    ? 'bg-gray-500 cursor-not-allowed text-gray-300'
                    : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600'
                }`}
              >
                {isSpinning ? (
                  <span className="flex items-center gap-2">
                    <RotateCw className="animate-spin" size={18} />
                    Spinning...
                  </span>
                ) : isCooldownActive ? (
                  <span className="flex items-center gap-2">
                    <Clock size={20} />
                    Cooldown Active
                  </span>
                ) : freeSpinsAvailable > 0 ? (
                  'Spin Free!'
                ) : (
                  `Spin (100 XP)`
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          <AnimatePresence>
            {filteredRewards.map((reward, index) => {
              const locked = isLocked(reward);
              const affordable = canAfford(reward.cost);
              const wasRecentlyRedeemed = recentlyRedeemed.includes(reward.id);

              return (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className={`relative rounded-2xl overflow-hidden ${
                    darkMode ? 'bg-gray-800' : 'bg-white'
                  } shadow-lg border-2 ${getRarityBorder(reward.rarity)} ${
                    locked ? 'opacity-60' : ''
                  } ${wasRecentlyRedeemed ? 'ring-4 ring-green-500 ring-opacity-50' : ''}`}
                >
                  {/* Rarity Banner */}
                  <div className={`h-2 bg-gradient-to-r ${getRarityColor(reward.rarity)}`} />

                  {/* Locked Overlay */}
                  {locked && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                      <div className="text-center">
                        <Lock className="h-12 w-12 text-white mx-auto mb-2" />
                        <p className="text-white font-bold">Level {reward.unlockLevel} Required</p>
                      </div>
                    </div>
                  )}

                  <div className="p-5">
                    {/* Icon & Title */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`text-4xl ${locked ? 'grayscale' : ''}`}>
                          {reward.icon}
                        </div>
                        <div>
                          <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {reward.name}
                          </h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${getRarityColor(reward.rarity)} text-white capitalize`}>
                            {reward.rarity}
                          </span>
                        </div>
                      </div>
                      {reward.timesRedeemed > 0 && (
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          x{reward.timesRedeemed}
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {reward.description}
                    </p>

                    {/* Cost & Redeem Button */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Coins className={`h-5 w-5 ${affordable ? 'text-yellow-500' : 'text-red-400'}`} />
                        <span className={`font-bold ${affordable ? (darkMode ? 'text-yellow-400' : 'text-yellow-600') : 'text-red-400'}`}>
                          {reward.cost.toLocaleString()}
                        </span>
                      </div>

                      <motion.button
                        whileHover={{ scale: affordable && !locked ? 1.1 : 1 }}
                        whileTap={{ scale: affordable && !locked ? 0.95 : 1 }}
                        onClick={() => handleRedeem(reward)}
                        disabled={!affordable || locked}
                        className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 ${
                          affordable && !locked
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {locked ? (
                          <>
                            <Lock size={16} />
                            Locked
                          </>
                        ) : affordable ? (
                          <>
                            <Gift size={16} />
                            Redeem
                          </>
                        ) : (
                          <>
                            <AlertTriangle size={16} />
                            Need More XP
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Redeem Confirmation Modal */}
        <AnimatePresence>
          {showRedeemModal && selectedReward && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
              onClick={() => setShowRedeemModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-8 max-w-md w-full shadow-2xl`}
                onClick={e => e.stopPropagation()}
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">{selectedReward.icon}</div>
                  <h3 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Redeem "{selectedReward.name}"?
                  </h3>
                  <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {selectedReward.description}
                  </p>

                  <div className={`p-4 rounded-xl mb-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className="flex items-center justify-center gap-4">
                      <div className="text-center">
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Current XP</p>
                        <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {currentXP.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-2xl">→</div>
                      <div className="text-center">
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>After Redeem</p>
                        <p className="text-xl font-bold text-green-500">
                          {(currentXP - selectedReward.cost).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-center gap-2 text-red-400">
                      <Coins size={18} />
                      <span className="font-bold">-{selectedReward.cost.toLocaleString()} XP</span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowRedeemModal(false)}
                      className={`flex-1 px-6 py-3 rounded-xl font-bold ${
                        darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={confirmRedeem}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold hover:from-green-600 hover:to-emerald-600"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <CheckCircle size={20} />
                        Confirm
                      </span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Custom Reward Modal */}
        <AnimatePresence>
          {showAddCustom && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
              onClick={() => setShowAddCustom(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-8 max-w-md w-full shadow-2xl`}
                onClick={e => e.stopPropagation()}
              >
                <h3 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-3`}>
                  <Plus className="h-6 w-6 text-purple-500" />
                  Create Custom Reward
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Reward Name
                    </label>
                    <input
                      type="text"
                      value={customReward.name}
                      onChange={e => setCustomReward(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Watch a Movie"
                      className={`w-full px-4 py-3 rounded-xl border ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      } focus:ring-2 focus:ring-purple-500`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Description
                    </label>
                    <input
                      type="text"
                      value={customReward.description}
                      onChange={e => setCustomReward(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="What's this reward about?"
                      className={`w-full px-4 py-3 rounded-xl border ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      } focus:ring-2 focus:ring-purple-500`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      XP Cost
                    </label>
                    <input
                      type="number"
                      value={customReward.cost}
                      onChange={e => setCustomReward(prev => ({ ...prev, cost: parseInt(e.target.value) || 0 }))}
                      min={10}
                      step={10}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      } focus:ring-2 focus:ring-purple-500`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Emoji Icon
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['🎁', '🎮', '🍕', '☕', '🎬', '📱', '🎵', '🛋️', '🍦', '💤', '🎉', '⭐'].map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => setCustomReward(prev => ({ ...prev, icon: emoji }))}
                          className={`text-2xl p-2 rounded-lg ${
                            customReward.icon === emoji
                              ? 'bg-purple-500 ring-2 ring-purple-300'
                              : darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAddCustom(false)}
                    className={`flex-1 px-6 py-3 rounded-xl font-bold ${
                      darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={addCustomReward}
                    disabled={!customReward.name.trim()}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold disabled:opacity-50"
                  >
                    Create Reward
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
