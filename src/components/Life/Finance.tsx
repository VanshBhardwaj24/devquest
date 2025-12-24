import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, TrendingUp, TrendingDown, PiggyBank, Target, 
  Plus, Wallet, CreditCard, ArrowUpRight, ArrowDownRight,
  CheckCircle, Trophy, Coins
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([
    { id: '1', name: 'Emergency Fund', target: 100000, current: 25000, icon: '🆘' },
    { id: '2', name: 'Investment Portfolio', target: 500000, current: 75000, icon: '📊' },
    { id: '3', name: 'Dream Vacation', target: 50000, current: 15000, icon: '✈️' },
  ]);
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

  const addTransaction = () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) return;

    const xpEarned = calculateXP(transactionType, selectedCategory, amt);
    
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: transactionType,
      category: selectedCategory.name,
      amount: amt,
      description: description || selectedCategory.name,
      date: new Date(),
      xpEarned,
    };

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
  };

  const addSavingsGoal = () => {
    const target = parseFloat(newGoalTarget);
    if (!newGoalName || isNaN(target) || target <= 0) return;

    const newGoal: SavingsGoal = {
      id: Date.now().toString(),
      name: newGoalName,
      target,
      current: 0,
      icon: newGoalIcon,
    };

    setSavingsGoals(prev => [...prev, newGoal]);
    setShowGoalModal(false);
    setNewGoalName('');
    setNewGoalTarget('');
    setNewGoalIcon('🎯');

    dispatch({ 
      type: 'ADD_XP', 
      payload: { amount: 25, source: `Created savings goal: ${newGoalName}` } 
    });
  };

  const contributeToGoal = (goalId: string, amount: number) => {
    setSavingsGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        const newCurrent = Math.min(goal.current + amount, goal.target);
        const completed = newCurrent >= goal.target;
        
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
        
        return { ...goal, current: newCurrent };
      }
      return goal;
    }));
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
              {savingsGoals.map((goal, index) => {
                const progress = (goal.current / goal.target) * 100;
                const isComplete = goal.current >= goal.target;
                
                return (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`brutal-card p-4 ${
                      isComplete ? 'bg-green-900/30 border-green-500' : 'bg-gray-900 border-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-4xl">{goal.icon}</span>
                      <div className="flex-1">
                        <h3 className="text-white font-bold flex items-center gap-2">
                          {goal.name}
                          {isComplete && <CheckCircle className="text-green-400" size={16} />}
                        </h3>
                        <p className="text-sm text-gray-500">
                          ₹{goal.current.toLocaleString()} / ₹{goal.target.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="h-4 bg-gray-800 border border-gray-700 rounded-full overflow-hidden mb-4">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(progress, 100)}%` }}
                        transition={{ duration: 1 }}
                        className={`h-full ${isComplete ? 'bg-green-500' : 'bg-gradient-to-r from-cyan-500 to-green-500'}`}
                      />
                    </div>

                    <div className="flex justify-between items-center">
                      <span className={`text-lg font-black ${isComplete ? 'text-green-400' : 'text-cyan-400'}`}>
                        {Math.round(progress)}%
                      </span>
                      {!isComplete && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => contributeToGoal(goal.id, 1000)}
                          className="px-3 py-1 bg-cyan-500 text-black font-bold text-sm border-2 border-cyan-400"
                        >
                          + ₹1,000
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Add Transaction Modal */}
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
                className="brutal-card bg-gray-900 border-green-500 p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
              >
                <h2 className="text-2xl font-black text-white mb-4 font-mono">
                  ADD {transactionType.toUpperCase()}
                </h2>

                {/* Type Selection */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { type: 'income', label: 'Income', color: 'green', icon: ArrowUpRight },
                    { type: 'expense', label: 'Expense', color: 'red', icon: ArrowDownRight },
                    { type: 'savings', label: 'Savings', color: 'cyan', icon: PiggyBank },
                  ].map(t => (
                        <button
                          key={t.type}
                          onClick={() => {
                            setTransactionType(t.type as 'income' | 'expense' | 'savings');
                            setSelectedCategory(
                              t.type === 'income' ? incomeCategories[0] :
                              t.type === 'savings' ? savingsCategories[0] :
                              expenseCategories[0]
                            );
                      }}
                      className={`p-2 font-bold border-2 text-xs sm:text-sm transition-colors flex flex-col items-center gap-1 ${
                        transactionType === t.type
                          ? t.color === 'green' ? 'bg-green-500 text-black border-green-400' :
                            t.color === 'red' ? 'bg-red-500 text-black border-red-400' :
                            'bg-cyan-500 text-black border-cyan-400'
                          : 'bg-gray-800 text-gray-400 border-gray-700'
                      }`}
                    >
                      <t.icon size={20} />
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 font-mono block mb-2">CATEGORY</label>
                    <select
                      value={selectedCategory.name}
                      onChange={e => setSelectedCategory(getCategoryList().find(c => c.name === e.target.value)!)}
                      className="w-full bg-gray-800 border-2 border-gray-700 text-white p-3 font-mono focus:border-green-500 outline-none"
                    >
                      {getCategoryList().map(cat => (
                        <option key={cat.name} value={cat.name}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 font-mono block mb-2">AMOUNT (₹)</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full bg-gray-800 border-2 border-gray-700 text-white p-3 font-mono focus:border-green-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 font-mono block mb-2">DESCRIPTION (Optional)</label>
                    <input
                      type="text"
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="What was it for?"
                      className="w-full bg-gray-800 border-2 border-gray-700 text-white p-3 font-mono focus:border-green-500 outline-none"
                    />
                  </div>

                  {amount && !isNaN(parseFloat(amount)) && (
                    <div className={`brutal-card p-4 ${
                      calculateXP(transactionType, selectedCategory, parseFloat(amount)) >= 0 
                        ? 'bg-green-900/30 border-green-500/50' 
                        : 'bg-red-900/30 border-red-500/50'
                    }`}>
                      <p className={`font-mono text-sm ${
                        calculateXP(transactionType, selectedCategory, parseFloat(amount)) >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        ⚡ {calculateXP(transactionType, selectedCategory, parseFloat(amount)) >= 0 ? 'You will earn' : 'You will lose'} 
                        <span className="font-black text-lg ml-2">
                          {calculateXP(transactionType, selectedCategory, parseFloat(amount)) >= 0 ? '+' : ''}
                          {calculateXP(transactionType, selectedCategory, parseFloat(amount))} XP
                        </span>
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={addTransaction}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-black font-black py-3 px-4 border-2 border-green-400 brutal-shadow"
                    >
                      <CheckCircle className="inline mr-2" size={16} />
                      SAVE
                    </button>
                    <button
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-black py-3 px-4 border-2 border-gray-600 brutal-shadow"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Goal Modal */}
        <AnimatePresence>
          {showGoalModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowGoalModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="brutal-card bg-gray-900 border-cyan-500 p-6 max-w-md w-full"
              >
                <h2 className="text-2xl font-black text-white mb-4 font-mono flex items-center gap-2">
                  <Target className="text-cyan-500" /> NEW SAVINGS GOAL
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 font-mono block mb-2">GOAL NAME</label>
                    <input
                      type="text"
                      value={newGoalName}
                      onChange={e => setNewGoalName(e.target.value)}
                      placeholder="e.g., New Laptop"
                      className="w-full bg-gray-800 border-2 border-gray-700 text-white p-3 font-mono focus:border-cyan-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 font-mono block mb-2">TARGET AMOUNT (₹)</label>
                    <input
                      type="number"
                      value={newGoalTarget}
                      onChange={e => setNewGoalTarget(e.target.value)}
                      placeholder="Enter target amount"
                      className="w-full bg-gray-800 border-2 border-gray-700 text-white p-3 font-mono focus:border-cyan-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 font-mono block mb-2">ICON</label>
                    <div className="flex flex-wrap gap-2">
                      {['🎯', '🏠', '🚗', '✈️', '💻', '📱', '💍', '🎓', '🏖️', '💰'].map(icon => (
                        <button
                          key={icon}
                          onClick={() => setNewGoalIcon(icon)}
                          className={`text-2xl p-2 border-2 transition-colors ${
                            newGoalIcon === icon ? 'border-cyan-500 bg-cyan-500/20' : 'border-gray-700 hover:border-cyan-500/50'
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={addSavingsGoal}
                      className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-black font-black py-3 px-4 border-2 border-cyan-400 brutal-shadow"
                    >
                      CREATE GOAL
                    </button>
                    <button
                      onClick={() => setShowGoalModal(false)}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-black py-3 px-4 border-2 border-gray-600 brutal-shadow"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
