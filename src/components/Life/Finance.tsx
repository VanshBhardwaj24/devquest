import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, TrendingUp, TrendingDown, PiggyBank, Target, 
  Plus, Wallet, CreditCard, ArrowUpRight, ArrowDownRight,
  CheckCircle, Trophy, Coins, RefreshCw, AlertTriangle
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { LifeService, Transaction as ServiceTransaction, SavingsGoal as ServiceGoal } from '../../services/lifeService';

// Local interfaces extending/adapting Service interfaces for UI (Dates as objects)
interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'savings' | 'investment';
  category: string;
  amount: number;
  description: string;
  date: Date;
  xpEarned: number;
}

interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline?: Date;
  icon: string;
}

type CategoryType = { name: string; icon: string; xpMultiplier?: number; xpPenalty?: number };

const incomeCategories: CategoryType[] = [
  { name: 'Salary', icon: '💼', xpMultiplier: 0.01 },
  { name: 'Freelance', icon: '💻', xpMultiplier: 0.02 },
  { name: 'Investment Returns', icon: '📈', xpMultiplier: 0.03 },
  { name: 'Side Hustle', icon: '🚀', xpMultiplier: 0.025 },
  { name: 'Gifts', icon: '🎁', xpMultiplier: 0.01 },
  { name: 'Other', icon: '💰', xpMultiplier: 0.01 },
];

const expenseCategories: CategoryType[] = [
  { name: 'Food & Dining', icon: '🍔', xpPenalty: 0 },
  { name: 'Transportation', icon: '🚗', xpPenalty: 0 },
  { name: 'Shopping', icon: '🛍️', xpPenalty: -0.005 },
  { name: 'Entertainment', icon: '🎬', xpPenalty: -0.01 },
  { name: 'Bills & Utilities', icon: '📱', xpPenalty: 0 },
  { name: 'Health', icon: '🏥', xpPenalty: 0 },
  { name: 'Education', icon: '📚', xpPenalty: 0.01 },
  { name: 'Impulse Buy', icon: '😅', xpPenalty: -0.02 },
];

const savingsCategories: CategoryType[] = [
  { name: 'Emergency Fund', icon: '🆘', xpMultiplier: 0.03 },
  { name: 'Investment', icon: '📊', xpMultiplier: 0.04 },
  { name: 'Retirement', icon: '🏖️', xpMultiplier: 0.05 },
  { name: 'Vacation', icon: '✈️', xpMultiplier: 0.02 },
  { name: 'Big Purchase', icon: '🏠', xpMultiplier: 0.03 },
  { name: 'Education', icon: '🎓', xpMultiplier: 0.04 },
];

export function Finance() {
  const { dispatch } = useApp();
  
  // Data State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  
  // UI State
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense' | 'savings'>('income');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>(incomeCategories[0]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'goals'>('overview');

  // New goal state
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalIcon, setNewGoalIcon] = useState('🎯');

  // Initial Fetch
  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await LifeService.getFinanceData();
      
      // Convert ISO strings to Date objects
      const loadedTransactions: Transaction[] = data.transactions.map(t => ({
        ...t,
        date: new Date(t.date)
      }));
      
      const loadedGoals: SavingsGoal[] = data.goals.map(g => ({
        ...g,
        deadline: g.deadline ? new Date(g.deadline) : undefined
      }));

      setTransactions(loadedTransactions);
      setSavingsGoals(loadedGoals);
    } catch (err) {
      setError('Failed to load financial data. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateXP = (type: string, category: CategoryType, amt: number) => {
    if (type === 'income') {
      return Math.floor(amt * (category.xpMultiplier || 0.01));
    } else if (type === 'savings') {
      return Math.floor(amt * (category.xpMultiplier || 0.03));
    } else if (type === 'expense') {
      const penalty = category.xpPenalty || 0;
      if (penalty < 0) {
        return Math.floor(amt * penalty);
      }
      return Math.floor(amt * penalty);
    }
    return 0;
  };

  const addTransaction = async () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) return;

    setIsSubmitting(true);
    const xpEarned = calculateXP(transactionType, selectedCategory, amt);
    const now = new Date();
    
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: transactionType,
      category: selectedCategory.name,
      amount: amt,
      description: description || selectedCategory.name,
      date: now,
      xpEarned,
    };

    // Prepare for Service (convert Date to string)
    const serviceTransaction: ServiceTransaction = {
      ...newTransaction,
      date: now.toISOString()
    };

    try {
      await LifeService.saveTransaction(serviceTransaction);
      setTransactions(prev => [newTransaction, ...prev]);

      if (xpEarned !== 0) {
        dispatch({ 
          type: 'ADD_XP', 
          payload: { 
            amount: xpEarned, 
            source: `Finance: ${transactionType === 'expense' && xpEarned < 0 ? 'Spent on' : transactionType === 'savings' ? 'Saved for' : 'Earned from'} ${selectedCategory.name}` 
          } 
        });

        dispatch({ 
          type: 'ADD_NOTIFICATION', 
          payload: {
            id: Date.now().toString(),
            type: xpEarned > 0 ? 'achievement' : 'streak',
            title: xpEarned > 0 ? 'Financial Win! 💰' : 'Spending Alert ⚠️',
            message: xpEarned > 0 
              ? `+${xpEarned} XP for ${transactionType === 'savings' ? 'saving' : 'earning'} ₹${amt.toLocaleString()}`
              : `${xpEarned} XP - Consider your spending habits`,
            timestamp: new Date(),
            read: false,
            priority: 'medium',
          }
        });
      }

      setShowAddModal(false);
      setAmount('');
      setDescription('');
    } catch {
      alert('Failed to save transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addSavingsGoal = async () => {
    const target = parseFloat(newGoalTarget);
    if (!newGoalName || isNaN(target) || target <= 0) return;

    setIsSubmitting(true);
    const newGoal: SavingsGoal = {
      id: Date.now().toString(),
      name: newGoalName,
      target,
      current: 0,
      icon: newGoalIcon,
    };

    // Service object
    const serviceGoal: ServiceGoal = {
      ...newGoal,
      deadline: undefined // Explicitly undefined if not set
    };

    try {
      await LifeService.saveGoal(serviceGoal);
      setSavingsGoals(prev => [...prev, newGoal]);
      setShowGoalModal(false);
      setNewGoalName('');
      setNewGoalTarget('');
      setNewGoalIcon('🎯');

      dispatch({ 
        type: 'ADD_XP', 
        payload: { amount: 25, source: `Created savings goal: ${newGoalName}` } 
      });
    } catch {
      alert('Failed to create goal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contributeToGoal = async (goalId: string, amount: number) => {
    const goal = savingsGoals.find(g => g.id === goalId);
    if (!goal) return;

    // Optimistic calculation
    const newCurrent = Math.min(goal.current + amount, goal.target);
    const updatedGoal: SavingsGoal = { ...goal, current: newCurrent };
    
    // Service object
    const serviceGoal: ServiceGoal = {
        ...updatedGoal,
        deadline: updatedGoal.deadline?.toISOString()
    };

    try {
      await LifeService.updateGoal(serviceGoal);
      
      // Update local state
      setSavingsGoals(prev => prev.map(g => g.id === goalId ? updatedGoal : g));

      const completed = newCurrent >= goal.target;
      // Only award XP if it wasn't already completed (check old state)
      if (completed && goal.current < goal.target) {
        dispatch({ 
          type: 'ADD_XP', 
          payload: { amount: 500, source: `Completed savings goal: ${goal.name}!` } 
        });
        dispatch({ 
          type: 'ADD_NOTIFICATION', 
          payload: {
            id: Date.now().toString(),
            type: 'achievement',
            title: 'Goal Achieved! 🎉',
            message: `You completed your "${goal.name}" savings goal! +500 XP`,
            timestamp: new Date(),
            read: false,
            priority: 'high',
          }
        });
      }
    } catch {
      alert('Failed to update goal contribution.');
    }
  };

  // Stats
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const totalSavings = transactions.filter(t => t.type === 'savings').reduce((sum, t) => sum + t.amount, 0);
  const netWorth = totalIncome - totalExpenses + totalSavings;
  const totalXPEarned = transactions.reduce((sum, t) => sum + t.xpEarned, 0);
  const savingsRate = totalIncome > 0 ? Math.round((totalSavings / totalIncome) * 100) : 0;

  const getCategoryList = () => {
    switch (transactionType) {
      case 'income': return incomeCategories;
      case 'expense': return expenseCategories;
      case 'savings': return savingsCategories;
      default: return incomeCategories;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] bg-[#0a0a0a]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw className="text-green-500" size={48} />
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] bg-[#0a0a0a] text-center p-4">
        <AlertTriangle className="text-red-500 mb-4" size={48} />
        <h3 className="text-xl font-black text-white mb-2">Failed to Load Finance Data</h3>
        <p className="text-gray-400 mb-4">{error}</p>
        <button 
          onClick={fetchFinanceData}
          className="px-6 py-2 bg-green-500 text-black font-bold brutal-shadow hover:bg-green-400 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 bg-[#0a0a0a] min-h-screen pb-20 lg:pb-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 font-mono flex items-center gap-3">
            <DollarSign className="text-green-400" size={36} />
            FINANCE <span className="text-green-400">💰</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-500 font-mono">
            // Build wealth, earn XP. Every rupee saved is XP gained.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: 'Overview', icon: Wallet },
            { id: 'transactions', label: 'Transactions', icon: CreditCard },
            { id: 'goals', label: 'Savings Goals', icon: Target },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'overview' | 'transactions' | 'goals')}
              className={`flex items-center gap-2 px-4 py-2 font-bold border-2 brutal-shadow whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-green-500 text-black border-green-400'
                  : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-green-500/50'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="brutal-card bg-green-900/20 border-green-500/50 p-4"
              >
                <div className="flex items-center gap-3">
                  <ArrowUpRight className="text-green-400" size={28} />
                  <div>
                    <p className="text-xs text-gray-500 font-mono uppercase">Income</p>
                    <p className="text-xl font-black text-green-400 font-mono">₹{totalIncome.toLocaleString()}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="brutal-card bg-red-900/20 border-red-500/50 p-4"
              >
                <div className="flex items-center gap-3">
                  <ArrowDownRight className="text-red-400" size={28} />
                  <div>
                    <p className="text-xs text-gray-500 font-mono uppercase">Expenses</p>
                    <p className="text-xl font-black text-red-400 font-mono">₹{totalExpenses.toLocaleString()}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="brutal-card bg-cyan-900/20 border-cyan-500/50 p-4"
              >
                <div className="flex items-center gap-3">
                  <PiggyBank className="text-cyan-400" size={28} />
                  <div>
                    <p className="text-xs text-gray-500 font-mono uppercase">Saved</p>
                    <p className="text-xl font-black text-cyan-400 font-mono">₹{totalSavings.toLocaleString()}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="brutal-card bg-yellow-900/20 border-yellow-500/50 p-4"
              >
                <div className="flex items-center gap-3">
                  <Coins className="text-yellow-400" size={28} />
                  <div>
                    <p className="text-xs text-gray-500 font-mono uppercase">XP Earned</p>
                    <p className="text-xl font-black text-yellow-400 font-mono">{totalXPEarned > 0 ? '+' : ''}{totalXPEarned}</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Financial Health Score */}
            <div className="brutal-card bg-gray-900 border-gray-700 p-6 mb-6">
              <h2 className="text-xl font-black text-white mb-4 font-mono flex items-center gap-2">
                <Trophy className="text-yellow-400" /> FINANCIAL HEALTH
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="64" cy="64" r="56" stroke="#374151" strokeWidth="12" fill="none" />
                      <motion.circle
                        cx="64" cy="64" r="56"
                        stroke="#22c55e"
                        strokeWidth="12"
                        fill="none"
                        strokeLinecap="round"
                        initial={{ strokeDasharray: "0 352" }}
                        animate={{ strokeDasharray: `${savingsRate * 3.52} 352` }}
                        transition={{ duration: 1 }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-black text-green-400">{savingsRate}%</span>
                    </div>
                  </div>
                  <p className="text-gray-400 font-mono">Savings Rate</p>
                </div>

                <div className="text-center">
                  <p className="text-4xl font-black text-white mb-2">₹{netWorth.toLocaleString()}</p>
                  <p className="text-gray-400 font-mono">Net Position</p>
                  <div className={`mt-2 inline-flex items-center gap-1 px-3 py-1 rounded font-bold ${
                    netWorth >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {netWorth >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    {netWorth >= 0 ? 'Positive' : 'Negative'}
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-4xl font-black text-white mb-2">{transactions.length}</p>
                  <p className="text-gray-400 font-mono">Transactions</p>
                  <p className="text-sm text-gray-500 mt-2">Keep tracking!</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setTransactionType('income'); setSelectedCategory(incomeCategories[0]); setShowAddModal(true); }}
                className="brutal-card bg-green-500 hover:bg-green-600 border-green-400 text-black p-4 font-black"
              >
                <ArrowUpRight className="mx-auto mb-2" size={32} />
                ADD INCOME
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setTransactionType('expense'); setSelectedCategory(expenseCategories[0]); setShowAddModal(true); }}
                className="brutal-card bg-red-500 hover:bg-red-600 border-red-400 text-black p-4 font-black"
              >
                <ArrowDownRight className="mx-auto mb-2" size={32} />
                ADD EXPENSE
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setTransactionType('savings'); setSelectedCategory(savingsCategories[0]); setShowAddModal(true); }}
                className="brutal-card bg-cyan-500 hover:bg-cyan-600 border-cyan-400 text-black p-4 font-black"
              >
                <PiggyBank className="mx-auto mb-2" size={32} />
                ADD SAVINGS
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-black text-white font-mono">TRANSACTION HISTORY</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddModal(true)}
                className="brutal-card bg-green-500 hover:bg-green-600 border-green-400 text-black px-4 py-2 font-black flex items-center gap-2"
              >
                <Plus size={16} /> ADD
              </motion.button>
            </div>

            <div className="brutal-card bg-gray-900 border-gray-700 p-4">
              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <Wallet className="text-gray-600 mx-auto mb-4" size={64} />
                  <p className="text-gray-500 font-mono">No transactions yet.</p>
                  <p className="text-gray-600 text-sm font-mono mt-2">Start tracking your money! 💰</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction, index) => (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={`brutal-card p-4 transition-colors ${
                        transaction.type === 'income' ? 'bg-green-900/20 border-green-500/30' :
                        transaction.type === 'savings' ? 'bg-cyan-900/20 border-cyan-500/30' :
                        'bg-red-900/20 border-red-500/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-3xl">
                            {(transaction.type === 'income' ? incomeCategories : 
                              transaction.type === 'savings' ? savingsCategories : 
                              expenseCategories).find(c => c.name === transaction.category)?.icon || '💰'}
                          </span>
                          <div>
                            <h3 className="text-white font-bold">{transaction.description}</h3>
                            <p className="text-sm text-gray-500">{transaction.category} • {transaction.date.toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-xl font-black ${
                            transaction.type === 'income' ? 'text-green-400' :
                            transaction.type === 'savings' ? 'text-cyan-400' :
                            'text-red-400'
                          }`}>
                            {transaction.type === 'expense' ? '-' : '+'}₹{transaction.amount.toLocaleString()}
                          </p>
                          {transaction.xpEarned !== 0 && (
                            <p className={`text-sm font-mono ${transaction.xpEarned > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                              {transaction.xpEarned > 0 ? '+' : ''}{transaction.xpEarned} XP
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-black text-white font-mono">SAVINGS GOALS</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowGoalModal(true)}
                className="brutal-card bg-cyan-500 hover:bg-cyan-600 border-cyan-400 text-black px-4 py-2 font-black flex items-center gap-2"
              >
                <Plus size={16} /> NEW GOAL
              </motion.button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savingsGoals.map((goal, index) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="brutal-card bg-gray-900 border-gray-700 p-6 relative overflow-hidden group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-4xl">{goal.icon}</span>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 font-mono">Target</p>
                      <p className="text-xl font-bold text-white">₹{goal.target.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-black text-white mb-4">{goal.name}</h3>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400 font-mono">Progress</span>
                      <span className="text-cyan-400 font-bold font-mono">{Math.round((goal.current / goal.target) * 100)}%</span>
                    </div>
                    <div className="h-3 bg-gray-800 rounded-none border border-gray-700 overflow-hidden">
                      <motion.div 
                        className="h-full bg-cyan-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-1 font-mono">
                      ₹{goal.current.toLocaleString()} saved
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => contributeToGoal(goal.id, 1000)}
                      className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white font-bold text-sm transition-colors"
                    >
                      +₹1k
                    </button>
                    <button 
                      onClick={() => contributeToGoal(goal.id, 5000)}
                      className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white font-bold text-sm transition-colors"
                    >
                      +₹5k
                    </button>
                    <button 
                      onClick={() => contributeToGoal(goal.id, 10000)}
                      className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white font-bold text-sm transition-colors"
                    >
                      +₹10k
                    </button>
                  </div>
                  
                  {goal.current >= goal.target && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-4 text-center backdrop-blur-sm">
                      <CheckCircle className="text-green-500 mb-2" size={48} />
                      <h3 className="text-2xl font-black text-white mb-1">GOAL REACHED!</h3>
                      <p className="text-green-400 font-mono">Great job! +500 XP</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Add Transaction Modal */}
        <AnimatePresence>
          {showAddModal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#0a0a0a] border-2 border-gray-700 brutal-shadow w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
              >
                <h2 className="text-2xl font-black text-white mb-6 font-mono">
                  ADD {transactionType.toUpperCase()}
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-500 text-sm font-mono mb-2">Category</label>
                    <div className="grid grid-cols-3 gap-2">
                      {getCategoryList().map(cat => (
                        <button
                          key={cat.name}
                          onClick={() => setSelectedCategory(cat)}
                          className={`p-2 border-2 text-center transition-all ${
                            selectedCategory.name === cat.name
                              ? 'border-green-500 bg-green-500/20 text-white'
                              : 'border-gray-700 text-gray-500 hover:border-gray-500'
                          }`}
                        >
                          <div className="text-2xl mb-1">{cat.icon}</div>
                          <div className="text-[10px] uppercase font-bold truncate">{cat.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-500 text-sm font-mono mb-2">Amount (₹)</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-gray-900 border-2 border-gray-700 p-3 text-white font-mono focus:border-green-500 focus:outline-none"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-500 text-sm font-mono mb-2">Description</label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-gray-900 border-2 border-gray-700 p-3 text-white font-mono focus:border-green-500 focus:outline-none"
                      placeholder="What was this for?"
                    />
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 py-3 border-2 border-gray-700 text-gray-400 font-bold hover:bg-gray-900"
                      disabled={isSubmitting}
                    >
                      CANCEL
                    </button>
                    <button
                      onClick={addTransaction}
                      disabled={isSubmitting}
                      className="flex-1 py-3 bg-green-500 border-2 border-green-400 text-black font-black hover:bg-green-400 disabled:opacity-50"
                    >
                      {isSubmitting ? 'SAVING...' : 'CONFIRM'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Add Goal Modal */}
        <AnimatePresence>
          {showGoalModal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#0a0a0a] border-2 border-gray-700 brutal-shadow w-full max-w-md p-6"
              >
                <h2 className="text-2xl font-black text-white mb-6 font-mono">NEW SAVINGS GOAL</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-500 text-sm font-mono mb-2">Goal Name</label>
                    <input
                      type="text"
                      value={newGoalName}
                      onChange={(e) => setNewGoalName(e.target.value)}
                      className="w-full bg-gray-900 border-2 border-gray-700 p-3 text-white font-mono focus:border-cyan-500 focus:outline-none"
                      placeholder="e.g. New Car"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-500 text-sm font-mono mb-2">Target Amount (₹)</label>
                    <input
                      type="number"
                      value={newGoalTarget}
                      onChange={(e) => setNewGoalTarget(e.target.value)}
                      className="w-full bg-gray-900 border-2 border-gray-700 p-3 text-white font-mono focus:border-cyan-500 focus:outline-none"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-500 text-sm font-mono mb-2">Icon</label>
                    <div className="flex gap-2">
                      {['🎯', '🏠', '🚗', '✈️', '💻', '🎓', '💍'].map(icon => (
                        <button
                          key={icon}
                          onClick={() => setNewGoalIcon(icon)}
                          className={`w-10 h-10 flex items-center justify-center border-2 transition-all ${
                            newGoalIcon === icon
                              ? 'border-cyan-500 bg-cyan-500/20'
                              : 'border-gray-700 hover:border-gray-500'
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      onClick={() => setShowGoalModal(false)}
                      className="flex-1 py-3 border-2 border-gray-700 text-gray-400 font-bold hover:bg-gray-900"
                      disabled={isSubmitting}
                    >
                      CANCEL
                    </button>
                    <button
                      onClick={addSavingsGoal}
                      disabled={isSubmitting}
                      className="flex-1 py-3 bg-cyan-500 border-2 border-cyan-400 text-black font-black hover:bg-cyan-400 disabled:opacity-50"
                    >
                      {isSubmitting ? 'CREATING...' : 'CREATE GOAL'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
