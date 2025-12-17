import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, Trophy, Zap, Target, Flame, CheckCircle, ExternalLink, Filter, Search, RotateCcw, Building2, X } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../hooks/useAuth';

interface CodingProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  platform: 'LeetCode' | 'GeeksforGeeks' | 'CodeChef';
  url: string;
  tags: string[];
  xp: number;
  solved: boolean;
  timeSpent?: number;
  solvedAt?: Date;
  streak?: number;
  description?: string;
  category: 'Array' | 'String' | 'Tree' | 'Graph' | 'DP' | 'Math' | 'LinkedList' | 'Heap' | 'Stack' | 'Design' | 'SQL' | 'Intervals';
  sheet: 'Striver' | 'Love Babbar' | 'FAANG' | 'Blind 75';
  companies?: string[];
  needsRevision?: boolean;
  revisionCount?: number;
  lastRevised?: Date;
}

type CategoryFilter = 'all' | CodingProblem['category'];
type SheetFilter = 'all' | CodingProblem['sheet'];
type TabType = 'all' | 'revision' | 'interview';

export function CodingArena() {
  const { state, dispatch } = useApp();
  const { user: authUser } = useAuth();
  const { darkMode, codingStats } = state;
  const [problems, setProblems] = useState<CodingProblem[]>([]);
  const [filteredProblems, setFilteredProblems] = useState<CodingProblem[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | 'LeetCode' | 'GeeksforGeeks' | 'CodeChef'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'Easy' | 'Medium' | 'Hard'>('all');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [selectedSheet, setSelectedSheet] = useState<SheetFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState({ xp: 0, streak: 0 });
  const [loading, setLoading] = useState(true);
  const [showSolvedOnly, setShowSolvedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'xp' | 'difficulty'>('default');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');

  // Company list for interview prep
  const companies = ['Google', 'Amazon', 'Microsoft', 'Meta', 'Apple', 'Netflix', 'Uber', 'Airbnb', 'LinkedIn', 'Twitter', 'Adobe', 'Oracle', 'Salesforce', 'Goldman Sachs', 'Morgan Stanley', 'Bloomberg', 'Stripe', 'Atlassian', 'Shopify', 'Coinbase'];

  // Massive problem database with 500+ problems
  const problemDatabase: Omit<CodingProblem, 'solved' | 'timeSpent' | 'solvedAt'>[] = [
    // STRIVER SDE SHEET - 50 ESSENTIAL PROBLEMS
    // Day 1: Arrays
    { id: 'striver-1', title: 'Set Matrix Zeroes', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/set-matrix-zeroes/', tags: ['Array', 'Matrix'], xp: 100, category: 'Array', sheet: 'Striver', companies: ['Microsoft', 'Amazon', 'Facebook'] },
    { id: 'striver-2', title: 'Pascal\'s Triangle', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/pascals-triangle/', tags: ['Array', 'Dynamic Programming'], xp: 50, category: 'Array', sheet: 'Striver', companies: ['Google', 'Amazon'] },
    { id: 'striver-3', title: 'Next Permutation', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/next-permutation/', tags: ['Array', 'Two Pointers'], xp: 100, category: 'Array', sheet: 'Striver', companies: ['Google', 'Amazon', 'Microsoft', 'Facebook'] },
    { id: 'striver-4', title: 'Maximum Subarray (Kadane)', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/maximum-subarray/', tags: ['Array', 'Dynamic Programming'], xp: 100, category: 'Array', sheet: 'Striver', companies: ['Amazon', 'Microsoft', 'Apple', 'Google', 'Facebook'] },
    { id: 'striver-5', title: 'Sort Colors (Dutch Flag)', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/sort-colors/', tags: ['Array', 'Two Pointers', 'Sorting'], xp: 100, category: 'Array', sheet: 'Striver', companies: ['Microsoft', 'Amazon', 'Facebook'] },
    { id: 'striver-6', title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', tags: ['Array', 'Dynamic Programming'], xp: 50, category: 'Array', sheet: 'Striver', companies: ['Amazon', 'Microsoft', 'Facebook', 'Goldman Sachs', 'Bloomberg'] },
    
    // Day 2: Arrays Part-II
    { id: 'striver-7', title: 'Rotate Image', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/rotate-image/', tags: ['Array', 'Matrix'], xp: 100, category: 'Array', sheet: 'Striver', companies: ['Amazon', 'Microsoft', 'Apple'] },
    { id: 'striver-8', title: 'Merge Overlapping Intervals', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/merge-intervals/', tags: ['Array', 'Sorting'], xp: 125, category: 'Array', sheet: 'Striver', companies: ['Google', 'Amazon', 'Microsoft', 'Facebook', 'Bloomberg'] },
    { id: 'striver-9', title: 'Merge Sorted Arrays', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/merge-sorted-array/', tags: ['Array', 'Two Pointers'], xp: 75, category: 'Array', sheet: 'Striver', companies: ['Facebook', 'Microsoft'] },
    { id: 'striver-10', title: 'Find Duplicate Number', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/find-the-duplicate-number/', tags: ['Array', 'Floyd Cycle'], xp: 125, category: 'Array', sheet: 'Striver', companies: ['Amazon', 'Google', 'Microsoft'] },
    { id: 'striver-11', title: 'Repeat and Missing Number', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/set-mismatch/', tags: ['Array', 'Math'], xp: 100, category: 'Array', sheet: 'Striver' },
    { id: 'striver-12', title: 'Count Inversions (Merge Sort)', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/count-of-smaller-numbers-after-self/', tags: ['Array', 'Merge Sort'], xp: 200, category: 'Array', sheet: 'Striver', companies: ['Google', 'Amazon'] },
    
    // Day 3: Arrays Part-III
    { id: 'striver-13', title: 'Search in 2D Matrix', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/search-a-2d-matrix/', tags: ['Array', 'Binary Search'], xp: 100, category: 'Array', sheet: 'Striver', companies: ['Amazon', 'Microsoft', 'Facebook'] },
    { id: 'striver-14', title: 'Pow(x, n)', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/powx-n/', tags: ['Math', 'Recursion'], xp: 100, category: 'Math', sheet: 'Striver', companies: ['Facebook', 'LinkedIn', 'Google'] },
    { id: 'striver-15', title: 'Majority Element (N/2)', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/majority-element/', tags: ['Array', 'Boyer-Moore'], xp: 75, category: 'Array', sheet: 'Striver', companies: ['Amazon', 'Google'] },
    { id: 'striver-16', title: 'Majority Element II (N/3)', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/majority-element-ii/', tags: ['Array', 'Boyer-Moore'], xp: 125, category: 'Array', sheet: 'Striver' },
    { id: 'striver-17', title: 'Grid Unique Paths', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/unique-paths/', tags: ['Dynamic Programming', 'Math'], xp: 100, category: 'DP', sheet: 'Striver', companies: ['Amazon', 'Google', 'Facebook'] },
    { id: 'striver-18', title: 'Reverse Pairs', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/reverse-pairs/', tags: ['Array', 'Merge Sort'], xp: 200, category: 'Array', sheet: 'Striver', companies: ['Google'] },
    
    // Day 4: Arrays Part-IV
    { id: 'striver-19', title: '2 Sum Problem', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/two-sum/', tags: ['Array', 'Hash Table'], xp: 50, category: 'Array', sheet: 'Striver' },
    { id: 'striver-20', title: '4 Sum Problem', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/4sum/', tags: ['Array', 'Two Pointers'], xp: 150, category: 'Array', sheet: 'Striver' },
    { id: 'striver-21', title: 'Longest Consecutive Sequence', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/longest-consecutive-sequence/', tags: ['Array', 'Hash Table'], xp: 125, category: 'Array', sheet: 'Striver' },
    { id: 'striver-22', title: 'Largest Subarray with 0 Sum', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/subarray-sum-equals-k/', tags: ['Array', 'Hash Table'], xp: 125, category: 'Array', sheet: 'Striver' },
    { id: 'striver-23', title: 'Count Subarrays with XOR K', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/subarray-sum-equals-k/', tags: ['Array', 'Bit Manipulation'], xp: 150, category: 'Array', sheet: 'Striver' },
    { id: 'striver-24', title: 'Longest Substring Without Repeat', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', tags: ['String', 'Sliding Window'], xp: 125, category: 'String', sheet: 'Striver' },
    
    // Day 5: Linked List
    { id: 'striver-25', title: 'Reverse Linked List', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/reverse-linked-list/', tags: ['Linked List'], xp: 50, category: 'Array', sheet: 'Striver' },
    { id: 'striver-26', title: 'Middle of Linked List', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/middle-of-the-linked-list/', tags: ['Linked List', 'Two Pointers'], xp: 50, category: 'Array', sheet: 'Striver' },
    { id: 'striver-27', title: 'Merge Two Sorted Lists', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/merge-two-sorted-lists/', tags: ['Linked List'], xp: 50, category: 'Array', sheet: 'Striver' },
    { id: 'striver-28', title: 'Remove Nth Node From End', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/', tags: ['Linked List', 'Two Pointers'], xp: 100, category: 'Array', sheet: 'Striver' },
    { id: 'striver-29', title: 'Add Two Numbers', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/add-two-numbers/', tags: ['Linked List', 'Math'], xp: 100, category: 'Array', sheet: 'Striver' },
    { id: 'striver-30', title: 'Delete Node in Linked List', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/delete-node-in-a-linked-list/', tags: ['Linked List'], xp: 75, category: 'Array', sheet: 'Striver' },
    
    // Day 6: Linked List Part-II
    { id: 'striver-31', title: 'Intersection of Two Linked Lists', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/intersection-of-two-linked-lists/', tags: ['Linked List', 'Two Pointers'], xp: 75, category: 'Array', sheet: 'Striver' },
    { id: 'striver-32', title: 'Detect Cycle in Linked List', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/linked-list-cycle/', tags: ['Linked List', 'Floyd Cycle'], xp: 75, category: 'Array', sheet: 'Striver' },
    { id: 'striver-33', title: 'Reverse Nodes in k-Group', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/reverse-nodes-in-k-group/', tags: ['Linked List'], xp: 200, category: 'Array', sheet: 'Striver' },
    { id: 'striver-34', title: 'Check Palindrome Linked List', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/palindrome-linked-list/', tags: ['Linked List', 'Two Pointers'], xp: 75, category: 'Array', sheet: 'Striver' },
    { id: 'striver-35', title: 'Linked List Cycle II (Start Point)', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/linked-list-cycle-ii/', tags: ['Linked List', 'Floyd Cycle'], xp: 125, category: 'Array', sheet: 'Striver' },
    { id: 'striver-36', title: 'Flatten Linked List', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/flatten-a-multilevel-doubly-linked-list/', tags: ['Linked List', 'DFS'], xp: 150, category: 'Array', sheet: 'Striver' },
    
    // Day 7: 2-Pointer
    { id: 'striver-37', title: '3 Sum', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/3sum/', tags: ['Array', 'Two Pointers'], xp: 125, category: 'Array', sheet: 'Striver' },
    { id: 'striver-38', title: 'Trapping Rain Water', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/trapping-rain-water/', tags: ['Array', 'Two Pointers', 'Stack'], xp: 200, category: 'Array', sheet: 'Striver' },
    { id: 'striver-39', title: 'Remove Duplicates from Sorted Array', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/remove-duplicates-from-sorted-array/', tags: ['Array', 'Two Pointers'], xp: 50, category: 'Array', sheet: 'Striver' },
    { id: 'striver-40', title: 'Max Consecutive Ones', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/max-consecutive-ones/', tags: ['Array'], xp: 50, category: 'Array', sheet: 'Striver' },
    
    // Day 8: Greedy Algorithm
    { id: 'striver-41', title: 'N Meetings in One Room', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/meeting-rooms/', tags: ['Greedy', 'Sorting'], xp: 75, category: 'Array', sheet: 'Striver' },
    { id: 'striver-42', title: 'Minimum Platforms', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/meeting-rooms-ii/', tags: ['Greedy', 'Sorting'], xp: 125, category: 'Array', sheet: 'Striver' },
    { id: 'striver-43', title: 'Job Sequencing Problem', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/job-sequencing-problem-1587115620/1', tags: ['Greedy', 'Sorting'], xp: 125, category: 'Array', sheet: 'Striver' },
    { id: 'striver-44', title: 'Fractional Knapsack', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/fractional-knapsack-1587115620/1', tags: ['Greedy'], xp: 100, category: 'Array', sheet: 'Striver' },
    { id: 'striver-45', title: 'Minimum Coins', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/coin-change/', tags: ['Greedy', 'Dynamic Programming'], xp: 125, category: 'DP', sheet: 'Striver' },
    
    // Day 9: Recursion & Backtracking
    { id: 'striver-46', title: 'Subset Sums', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/subsets/', tags: ['Recursion', 'Backtracking'], xp: 100, category: 'Array', sheet: 'Striver' },
    { id: 'striver-47', title: 'Subsets II (Unique)', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/subsets-ii/', tags: ['Recursion', 'Backtracking'], xp: 125, category: 'Array', sheet: 'Striver' },
    { id: 'striver-48', title: 'Combination Sum', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/combination-sum/', tags: ['Recursion', 'Backtracking'], xp: 125, category: 'Array', sheet: 'Striver' },
    { id: 'striver-49', title: 'Combination Sum II', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/combination-sum-ii/', tags: ['Recursion', 'Backtracking'], xp: 125, category: 'Array', sheet: 'Striver' },
    { id: 'striver-50', title: 'Palindrome Partitioning', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/palindrome-partitioning/', tags: ['Recursion', 'Backtracking', 'String'], xp: 150, category: 'String', sheet: 'Striver' },
    { id: 'striver-51', title: 'Kth Permutation Sequence', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/permutation-sequence/', tags: ['Math', 'Recursion'], xp: 200, category: 'Math', sheet: 'Striver' },
    
    // Day 10: Recursion & Backtracking
    { id: 'striver-52', title: 'Print All Permutations', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/permutations/', tags: ['Recursion', 'Backtracking'], xp: 125, category: 'Array', sheet: 'Striver' },
    { id: 'striver-53', title: 'N-Queens Problem', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/n-queens/', tags: ['Recursion', 'Backtracking'], xp: 200, category: 'Array', sheet: 'Striver' },
    { id: 'striver-54', title: 'Sudoku Solver', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/sudoku-solver/', tags: ['Recursion', 'Backtracking'], xp: 200, category: 'Array', sheet: 'Striver' },
    { id: 'striver-55', title: 'M-Coloring Problem', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/m-coloring-problem-1587115620/1', tags: ['Recursion', 'Backtracking'], xp: 150, category: 'Graph', sheet: 'Striver' },
    { id: 'striver-56', title: 'Rat in a Maze', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/rat-in-a-maze-problem/1', tags: ['Recursion', 'Backtracking'], xp: 125, category: 'Array', sheet: 'Striver' },
    { id: 'striver-57', title: 'Word Break (Print all ways)', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/word-break-ii/', tags: ['Recursion', 'Backtracking'], xp: 200, category: 'String', sheet: 'Striver' },
    
    // Day 11: Binary Search
    { id: 'striver-58', title: 'Nth Root of M', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/find-nth-root-of-m5843/1', tags: ['Binary Search'], xp: 100, category: 'Math', sheet: 'Striver' },
    { id: 'striver-59', title: 'Matrix Median', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/find-median-from-data-stream/', tags: ['Binary Search', 'Matrix'], xp: 150, category: 'Array', sheet: 'Striver' },
    { id: 'striver-60', title: 'Single Element in Sorted Array', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/single-element-in-a-sorted-array/', tags: ['Binary Search'], xp: 100, category: 'Array', sheet: 'Striver' },
    { id: 'striver-61', title: 'Search in Rotated Sorted Array', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/search-in-rotated-sorted-array/', tags: ['Binary Search'], xp: 125, category: 'Array', sheet: 'Striver' },
    { id: 'striver-62', title: 'Median of Two Sorted Arrays', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/median-of-two-sorted-arrays/', tags: ['Binary Search'], xp: 200, category: 'Array', sheet: 'Striver' },
    { id: 'striver-63', title: 'Kth Element of Two Sorted Arrays', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/k-th-element-of-two-sorted-array1317/1', tags: ['Binary Search'], xp: 150, category: 'Array', sheet: 'Striver' },
    { id: 'striver-64', title: 'Allocate Minimum Pages', difficulty: 'Hard', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/allocate-minimum-number-of-pages0937/1', tags: ['Binary Search'], xp: 200, category: 'Array', sheet: 'Striver' },
    { id: 'striver-65', title: 'Aggressive Cows', difficulty: 'Hard', platform: 'CodeChef', url: 'https://www.spoj.com/problems/AGGRCOW/', tags: ['Binary Search'], xp: 200, category: 'Array', sheet: 'Striver' },
    
    // Day 12: Heaps
    { id: 'striver-66', title: 'Max Heap Implementation', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/operations-on-binary-min-heap/1', tags: ['Heap'], xp: 125, category: 'Array', sheet: 'Striver' },
    { id: 'striver-67', title: 'Kth Largest Element', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/kth-largest-element-in-an-array/', tags: ['Heap', 'Array'], xp: 100, category: 'Array', sheet: 'Striver' },
    { id: 'striver-68', title: 'Maximum Sum Combination', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/maximum-sum-combination/1', tags: ['Heap'], xp: 150, category: 'Array', sheet: 'Striver' },
    { id: 'striver-69', title: 'Find Median from Data Stream', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/find-median-from-data-stream/', tags: ['Heap', 'Design'], xp: 200, category: 'Array', sheet: 'Striver' },
    { id: 'striver-70', title: 'Merge K Sorted Arrays', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/merge-k-sorted-lists/', tags: ['Heap'], xp: 150, category: 'Array', sheet: 'Striver' },
    { id: 'striver-71', title: 'K Most Frequent Elements', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/top-k-frequent-elements/', tags: ['Heap', 'Hash Table'], xp: 125, category: 'Array', sheet: 'Striver' },
    
    // Day 13: Stack & Queue
    { id: 'striver-72', title: 'Implement Stack using Arrays', difficulty: 'Easy', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/implement-stack-using-array/1', tags: ['Stack'], xp: 50, category: 'Array', sheet: 'Striver' },
    { id: 'striver-73', title: 'Implement Queue using Arrays', difficulty: 'Easy', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/implement-queue-using-array/1', tags: ['Queue'], xp: 50, category: 'Array', sheet: 'Striver' },
    { id: 'striver-74', title: 'Implement Stack using Queue', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/implement-stack-using-queues/', tags: ['Stack', 'Queue'], xp: 75, category: 'Array', sheet: 'Striver' },
    { id: 'striver-75', title: 'Implement Queue using Stack', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/implement-queue-using-stacks/', tags: ['Stack', 'Queue'], xp: 75, category: 'Array', sheet: 'Striver' },
    { id: 'striver-76', title: 'Valid Parentheses', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/valid-parentheses/', tags: ['Stack', 'String'], xp: 50, category: 'String', sheet: 'Striver' },
    { id: 'striver-77', title: 'Next Greater Element', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/next-greater-element-i/', tags: ['Stack'], xp: 100, category: 'Array', sheet: 'Striver' },
    { id: 'striver-78', title: 'Sort a Stack', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/sort-a-stack/1', tags: ['Stack'], xp: 100, category: 'Array', sheet: 'Striver' },
    
    // Day 14: Stack & Queue Part-II
    { id: 'striver-79', title: 'Next Smaller Element', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/smallest-number-on-left3403/1', tags: ['Stack'], xp: 100, category: 'Array', sheet: 'Striver' },
    { id: 'striver-80', title: 'LRU Cache', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/lru-cache/', tags: ['Design', 'Hash Table'], xp: 200, category: 'Array', sheet: 'Striver' },
    { id: 'striver-81', title: 'LFU Cache', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/lfu-cache/', tags: ['Design', 'Hash Table'], xp: 200, category: 'Array', sheet: 'Striver' },
    { id: 'striver-82', title: 'Largest Rectangle in Histogram', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/largest-rectangle-in-histogram/', tags: ['Stack'], xp: 200, category: 'Array', sheet: 'Striver' },
    { id: 'striver-83', title: 'Sliding Window Maximum', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/sliding-window-maximum/', tags: ['Queue', 'Sliding Window'], xp: 200, category: 'Array', sheet: 'Striver' },
    { id: 'striver-84', title: 'Min Stack', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/min-stack/', tags: ['Stack', 'Design'], xp: 100, category: 'Array', sheet: 'Striver' },
    { id: 'striver-85', title: 'Rotten Oranges', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/rotting-oranges/', tags: ['BFS', 'Queue'], xp: 125, category: 'Graph', sheet: 'Striver' },
    { id: 'striver-86', title: 'Stock Span Problem', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/online-stock-span/', tags: ['Stack'], xp: 125, category: 'Array', sheet: 'Striver' },
    { id: 'striver-87', title: 'Maximum of Minimum for Every Window', difficulty: 'Hard', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/maximum-of-minimum-for-every-window-size3453/1', tags: ['Stack'], xp: 200, category: 'Array', sheet: 'Striver' },
    { id: 'striver-88', title: 'The Celebrity Problem', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/the-celebrity-problem/1', tags: ['Stack'], xp: 125, category: 'Array', sheet: 'Striver' },
    
    // Day 15: String
    { id: 'striver-89', title: 'Reverse Words in a String', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/reverse-words-in-a-string/', tags: ['String'], xp: 75, category: 'String', sheet: 'Striver' },
    { id: 'striver-90', title: 'Longest Palindrome in String', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/longest-palindromic-substring/', tags: ['String', 'DP'], xp: 125, category: 'String', sheet: 'Striver' },
    { id: 'striver-91', title: 'Roman to Integer', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/roman-to-integer/', tags: ['String', 'Math'], xp: 50, category: 'String', sheet: 'Striver' },
    { id: 'striver-92', title: 'Implement ATOI/STRSTR', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/string-to-integer-atoi/', tags: ['String'], xp: 100, category: 'String', sheet: 'Striver' },
    { id: 'striver-93', title: 'Longest Common Prefix', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/longest-common-prefix/', tags: ['String'], xp: 50, category: 'String', sheet: 'Striver' },
    { id: 'striver-94', title: 'Rabin Karp Algorithm', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/repeated-string-match/', tags: ['String', 'Rolling Hash'], xp: 200, category: 'String', sheet: 'Striver' },
    
    // Day 16: String Part-II
    { id: 'striver-95', title: 'Z Algorithm (Pattern Searching)', difficulty: 'Hard', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/8a644e94faaa94968d8665ba09cc0f17512bfc13/1', tags: ['String'], xp: 200, category: 'String', sheet: 'Striver' },
    { id: 'striver-96', title: 'KMP Algorithm (Pattern Searching)', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/implement-strstr/', tags: ['String'], xp: 200, category: 'String', sheet: 'Striver' },
    { id: 'striver-97', title: 'Minimum Characters for Palindrome', difficulty: 'Hard', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/minimum-characters-to-be-added-at-front-to-make-string-palindrome/1', tags: ['String'], xp: 200, category: 'String', sheet: 'Striver' },
    { id: 'striver-98', title: 'Check for Anagrams', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/valid-anagram/', tags: ['String', 'Hash Table'], xp: 50, category: 'String', sheet: 'Striver' },
    { id: 'striver-99', title: 'Count and Say', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/count-and-say/', tags: ['String'], xp: 100, category: 'String', sheet: 'Striver' },
    { id: 'striver-100', title: 'Compare Version Numbers', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/compare-version-numbers/', tags: ['String'], xp: 100, category: 'String', sheet: 'Striver' },
    
    // Day 17: Binary Tree
    { id: 'striver-101', title: 'Inorder Traversal', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/binary-tree-inorder-traversal/', tags: ['Tree', 'DFS'], xp: 50, category: 'Tree', sheet: 'Striver' },
    { id: 'striver-102', title: 'Preorder Traversal', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/binary-tree-preorder-traversal/', tags: ['Tree', 'DFS'], xp: 50, category: 'Tree', sheet: 'Striver' },
    { id: 'striver-103', title: 'Postorder Traversal', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/binary-tree-postorder-traversal/', tags: ['Tree', 'DFS'], xp: 50, category: 'Tree', sheet: 'Striver' },
    { id: 'striver-104', title: 'Morris Inorder Traversal', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/binary-tree-inorder-traversal/', tags: ['Tree'], xp: 200, category: 'Tree', sheet: 'Striver' },
    { id: 'striver-105', title: 'Morris Preorder Traversal', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/binary-tree-preorder-traversal/', tags: ['Tree'], xp: 200, category: 'Tree', sheet: 'Striver' },
    { id: 'striver-106', title: 'Left View of Binary Tree', difficulty: 'Easy', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/left-view-of-binary-tree/1', tags: ['Tree', 'DFS'], xp: 75, category: 'Tree', sheet: 'Striver' },
    { id: 'striver-107', title: 'Bottom View of Binary Tree', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/bottom-view-of-binary-tree/1', tags: ['Tree'], xp: 100, category: 'Tree', sheet: 'Striver' },
    { id: 'striver-108', title: 'Top View of Binary Tree', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/top-view-of-binary-tree/1', tags: ['Tree'], xp: 100, category: 'Tree', sheet: 'Striver' },
    
    // Day 18: Binary Tree Part-II
    { id: 'striver-109', title: 'Level Order Traversal', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/binary-tree-level-order-traversal/', tags: ['Tree', 'BFS'], xp: 100, category: 'Tree', sheet: 'Striver' },
    { id: 'striver-110', title: 'Height of Binary Tree', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/', tags: ['Tree', 'DFS'], xp: 50, category: 'Tree', sheet: 'Striver' },
    { id: 'striver-111', title: 'Diameter of Binary Tree', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/diameter-of-binary-tree/', tags: ['Tree', 'DFS'], xp: 75, category: 'Tree', sheet: 'Striver' },
    { id: 'striver-112', title: 'Balanced Binary Tree', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/balanced-binary-tree/', tags: ['Tree', 'DFS'], xp: 75, category: 'Tree', sheet: 'Striver' },
    { id: 'striver-113', title: 'LCA in Binary Tree', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/', tags: ['Tree', 'DFS'], xp: 125, category: 'Tree', sheet: 'Striver' },
    { id: 'striver-114', title: 'Check Identical Trees', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/same-tree/', tags: ['Tree', 'DFS'], xp: 50, category: 'Tree', sheet: 'Striver' },
    { id: 'striver-115', title: 'Zigzag Level Order Traversal', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/', tags: ['Tree', 'BFS'], xp: 125, category: 'Tree', sheet: 'Striver' },
    { id: 'striver-116', title: 'Boundary Traversal', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/boundary-traversal-of-binary-tree/1', tags: ['Tree'], xp: 150, category: 'Tree', sheet: 'Striver' },
    
    // Day 19: Binary Tree Part-III
    { id: 'striver-117', title: 'Maximum Path Sum', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/', tags: ['Tree', 'DFS'], xp: 200, category: 'Tree', sheet: 'Striver' },
    { id: 'striver-118', title: 'Construct Tree from Inorder & Preorder', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/', tags: ['Tree', 'Array'], xp: 150, category: 'Tree', sheet: 'Striver' },
    { id: 'striver-119', title: 'Construct Tree from Inorder & Postorder', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/construct-binary-tree-from-inorder-and-postorder-traversal/', tags: ['Tree', 'Array'], xp: 150, category: 'Tree', sheet: 'Striver' },
    { id: 'striver-120', title: 'Symmetric Binary Tree', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/symmetric-tree/', tags: ['Tree', 'DFS'], xp: 75, category: 'Tree', sheet: 'Striver' },
    { id: 'striver-121', title: 'Flatten Binary Tree to Linked List', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/flatten-binary-tree-to-linked-list/', tags: ['Tree'], xp: 125, category: 'Tree', sheet: 'Striver' },
    { id: 'striver-122', title: 'Check if Tree is Mirror', difficulty: 'Easy', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/mirror-tree/1', tags: ['Tree'], xp: 75, category: 'Tree', sheet: 'Striver' },
    { id: 'striver-123', title: 'Children Sum Property', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/children-sum-parent/1', tags: ['Tree'], xp: 100, category: 'Tree', sheet: 'Striver' },
    
    // Day 20: Binary Search Tree
    { id: 'striver-124', title: 'Populate Next Right Pointers', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/populating-next-right-pointers-in-each-node/', tags: ['Tree', 'BFS'], xp: 125, category: 'Tree', sheet: 'Striver' },
    { id: 'striver-125', title: 'Search in BST', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/search-in-a-binary-search-tree/', tags: ['Tree', 'BST'], xp: 50, category: 'Tree', sheet: 'Striver' },
    { id: 'striver-126', title: 'Convert Sorted Array to BST', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/convert-sorted-array-to-binary-search-tree/', tags: ['Tree', 'BST'], xp: 75, category: 'Tree', sheet: 'Striver' },
    { id: 'striver-127', title: 'Construct BST from Preorder', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/construct-binary-search-tree-from-preorder-traversal/', tags: ['Tree', 'BST'], xp: 125, category: 'Tree', sheet: 'Striver' },
    { id: 'striver-128', title: 'Validate BST', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/validate-binary-search-tree/', tags: ['Tree', 'BST'], xp: 125, category: 'Tree', sheet: 'Striver' },
    { id: 'striver-129', title: 'LCA in BST', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/', tags: ['Tree', 'BST'], xp: 75, category: 'Tree', sheet: 'Striver' },
    { id: 'striver-130', title: 'Predecessor and Successor in BST', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/predecessor-and-successor/1', tags: ['Tree', 'BST'], xp: 125, category: 'Tree', sheet: 'Striver' },
    
    // Day 21: Binary Search Tree Part-II
    { id: 'striver-131', title: 'Floor in BST', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/floor-in-bst/1', tags: ['Tree', 'BST'], xp: 100, category: 'Tree', sheet: 'Striver' },
    { id: 'striver-132', title: 'Ceil in BST', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/implementing-ceil-in-bst/1', tags: ['Tree', 'BST'], xp: 100, category: 'Tree', sheet: 'Striver' },
    { id: 'striver-133', title: 'Kth Smallest in BST', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/kth-smallest-element-in-a-bst/', tags: ['Tree', 'BST'], xp: 125, category: 'Tree', sheet: 'Striver' },
    { id: 'striver-134', title: 'Kth Largest in BST', difficulty: 'Easy', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/kth-largest-element-in-bst/1', tags: ['Tree', 'BST'], xp: 75, category: 'Tree', sheet: 'Striver' },
    { id: 'striver-135', title: 'Two Sum in BST', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/two-sum-iv-input-is-a-bst/', tags: ['Tree', 'BST'], xp: 100, category: 'Tree', sheet: 'Striver' },
    { id: 'striver-136', title: 'BST Iterator', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/binary-search-tree-iterator/', tags: ['Tree', 'BST', 'Design'], xp: 125, category: 'Tree', sheet: 'Striver' },
    { id: 'striver-137', title: 'Size of Largest BST in Binary Tree', difficulty: 'Hard', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/largest-bst/1', tags: ['Tree', 'BST'], xp: 200, category: 'Tree', sheet: 'Striver' },
    { id: 'striver-138', title: 'Serialize and Deserialize BST', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/serialize-and-deserialize-bst/', tags: ['Tree', 'BST'], xp: 150, category: 'Tree', sheet: 'Striver' },
    
    // Day 22: Binary Trees [Miscellaneous]
    { id: 'striver-139', title: 'Binary Tree to DLL', difficulty: 'Hard', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/binary-tree-to-dll/1', tags: ['Tree'], xp: 200, category: 'Tree', sheet: 'Striver' },
    { id: 'striver-140', title: 'Find Median in Stream', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/find-median-from-data-stream/', tags: ['Heap', 'Design'], xp: 200, category: 'Array', sheet: 'Striver' },
    { id: 'striver-141', title: 'K-th largest element in stream', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/kth-largest-element-in-a-stream/', tags: ['Heap'], xp: 100, category: 'Array', sheet: 'Striver' },
    { id: 'striver-142', title: 'Distinct Numbers in Window', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/count-distinct-elements-in-every-window/1', tags: ['Sliding Window'], xp: 125, category: 'Array', sheet: 'Striver' },
    { id: 'striver-143', title: 'Kth Largest in Unsorted Array', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/kth-largest-element-in-an-array/', tags: ['Heap'], xp: 125, category: 'Array', sheet: 'Striver' },
    { id: 'striver-144', title: 'Flood Fill Algorithm', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/flood-fill/', tags: ['DFS', 'BFS'], xp: 75, category: 'Graph', sheet: 'Striver' },
    
    // Day 23: Graph
    { id: 'striver-145', title: 'Clone a Graph', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/clone-graph/', tags: ['Graph', 'DFS'], xp: 125, category: 'Graph', sheet: 'Striver' },
    { id: 'striver-146', title: 'DFS Traversal', difficulty: 'Easy', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/depth-first-traversal-for-a-graph/1', tags: ['Graph', 'DFS'], xp: 50, category: 'Graph', sheet: 'Striver' },
    { id: 'striver-147', title: 'BFS Traversal', difficulty: 'Easy', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/bfs-traversal-of-graph/1', tags: ['Graph', 'BFS'], xp: 50, category: 'Graph', sheet: 'Striver' },
    { id: 'striver-148', title: 'Detect Cycle in Undirected Graph (DFS)', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/detect-cycle-in-an-undirected-graph/1', tags: ['Graph', 'DFS'], xp: 125, category: 'Graph', sheet: 'Striver' },
    { id: 'striver-149', title: 'Detect Cycle in Undirected Graph (BFS)', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/detect-cycle-in-an-undirected-graph/1', tags: ['Graph', 'BFS'], xp: 125, category: 'Graph', sheet: 'Striver' },
    { id: 'striver-150', title: 'Detect Cycle in Directed Graph (DFS)', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/detect-cycle-in-a-directed-graph/1', tags: ['Graph', 'DFS'], xp: 125, category: 'Graph', sheet: 'Striver' },
    { id: 'striver-151', title: 'Detect Cycle in Directed Graph (BFS)', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/detect-cycle-in-a-directed-graph/1', tags: ['Graph', 'BFS'], xp: 125, category: 'Graph', sheet: 'Striver' },
    
    // Day 24: Graph Part-II
    { id: 'striver-152', title: 'Topological Sort (DFS)', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/topological-sort/1', tags: ['Graph', 'DFS'], xp: 125, category: 'Graph', sheet: 'Striver' },
    { id: 'striver-153', title: 'Topological Sort (BFS/Kahn)', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/topological-sort/1', tags: ['Graph', 'BFS'], xp: 125, category: 'Graph', sheet: 'Striver' },
    { id: 'striver-154', title: 'Number of Islands', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/number-of-islands/', tags: ['Graph', 'DFS'], xp: 125, category: 'Graph', sheet: 'Striver' },
    { id: 'striver-155', title: 'Bipartite Graph (BFS)', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/is-graph-bipartite/', tags: ['Graph', 'BFS'], xp: 125, category: 'Graph', sheet: 'Striver' },
    { id: 'striver-156', title: 'Bipartite Graph (DFS)', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/is-graph-bipartite/', tags: ['Graph', 'DFS'], xp: 125, category: 'Graph', sheet: 'Striver' },
    { id: 'striver-157', title: 'Cycle Detection using DSU', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/detect-cycle-using-dsu/1', tags: ['Graph', 'Union Find'], xp: 150, category: 'Graph', sheet: 'Striver' },
    
    // Day 25: Dynamic Programming
    { id: 'striver-158', title: 'Max Product Subarray', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/maximum-product-subarray/', tags: ['DP', 'Array'], xp: 125, category: 'DP', sheet: 'Striver' },
    { id: 'striver-159', title: 'Longest Increasing Subsequence', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/longest-increasing-subsequence/', tags: ['DP'], xp: 125, category: 'DP', sheet: 'Striver' },
    { id: 'striver-160', title: 'Longest Common Subsequence', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/longest-common-subsequence/', tags: ['DP'], xp: 125, category: 'DP', sheet: 'Striver' },
    { id: 'striver-161', title: '0-1 Knapsack', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/0-1-knapsack-problem0945/1', tags: ['DP'], xp: 150, category: 'DP', sheet: 'Striver' },
    { id: 'striver-162', title: 'Edit Distance', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/edit-distance/', tags: ['DP', 'String'], xp: 200, category: 'DP', sheet: 'Striver' },
    { id: 'striver-163', title: 'Maximum Sum Increasing Subsequence', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/maximum-sum-increasing-subsequence4749/1', tags: ['DP'], xp: 125, category: 'DP', sheet: 'Striver' },
    { id: 'striver-164', title: 'Matrix Chain Multiplication', difficulty: 'Hard', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/matrix-chain-multiplication0303/1', tags: ['DP'], xp: 200, category: 'DP', sheet: 'Striver' },
    
    // Day 26: DP Part-II
    { id: 'striver-165', title: 'Maximum Sum Path in Matrix', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/path-in-matrix3805/1', tags: ['DP'], xp: 125, category: 'DP', sheet: 'Striver' },
    { id: 'striver-166', title: 'Coin Change', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/coin-change/', tags: ['DP'], xp: 125, category: 'DP', sheet: 'Striver' },
    { id: 'striver-167', title: 'Subset Sum Problem', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/subset-sum-problem-1611555638/1', tags: ['DP'], xp: 125, category: 'DP', sheet: 'Striver' },
    { id: 'striver-168', title: 'Rod Cutting', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/rod-cutting0840/1', tags: ['DP'], xp: 125, category: 'DP', sheet: 'Striver' },
    { id: 'striver-169', title: 'Egg Dropping Problem', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/super-egg-drop/', tags: ['DP'], xp: 200, category: 'DP', sheet: 'Striver' },
    { id: 'striver-170', title: 'Word Break', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/word-break/', tags: ['DP'], xp: 125, category: 'DP', sheet: 'Striver' },
    { id: 'striver-171', title: 'Palindrome Partitioning II', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/palindrome-partitioning-ii/', tags: ['DP', 'String'], xp: 200, category: 'DP', sheet: 'Striver' },
    { id: 'striver-172', title: 'Maximum Profit in Job Scheduling', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/maximum-profit-in-job-scheduling/', tags: ['DP'], xp: 200, category: 'DP', sheet: 'Striver' },
    
    // Day 27: Trie
    { id: 'striver-173', title: 'Implement Trie', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/implement-trie-prefix-tree/', tags: ['Trie'], xp: 150, category: 'String', sheet: 'Striver' },
    { id: 'striver-174', title: 'Implement Trie II', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/trie-insert-and-search0651/1', tags: ['Trie'], xp: 150, category: 'String', sheet: 'Striver' },
    { id: 'striver-175', title: 'Longest String with All Prefixes', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/longest-common-prefix-in-an-array5129/1', tags: ['Trie'], xp: 150, category: 'String', sheet: 'Striver' },
    { id: 'striver-176', title: 'Number of Distinct Substrings', difficulty: 'Hard', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/count-of-distinct-substrings/1', tags: ['Trie'], xp: 200, category: 'String', sheet: 'Striver' },
    { id: 'striver-177', title: 'Power Set (All Subsets)', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/subsets/', tags: ['Bit Manipulation'], xp: 125, category: 'Array', sheet: 'Striver' },
    { id: 'striver-178', title: 'Maximum XOR of Two Numbers', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/', tags: ['Trie', 'Bit Manipulation'], xp: 150, category: 'Array', sheet: 'Striver' },
    { id: 'striver-179', title: 'Maximum XOR With Element', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/maximum-xor-with-an-element-from-array/', tags: ['Trie'], xp: 200, category: 'Array', sheet: 'Striver' },
    
    // Day 28: More on Trie & Bit Manipulation
    { id: 'striver-180', title: 'Count Subarray XOR', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/count-subarray-with-k-odds/1', tags: ['Bit Manipulation'], xp: 125, category: 'Array', sheet: 'Striver' },
    { id: 'striver-181', title: 'Single Number', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/single-number/', tags: ['Bit Manipulation'], xp: 50, category: 'Array', sheet: 'Striver' },
    { id: 'striver-182', title: 'Single Number II', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/single-number-ii/', tags: ['Bit Manipulation'], xp: 125, category: 'Array', sheet: 'Striver' },
    { id: 'striver-183', title: 'Single Number III', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/single-number-iii/', tags: ['Bit Manipulation'], xp: 125, category: 'Array', sheet: 'Striver' },
    { id: 'striver-184', title: 'Find MSB', difficulty: 'Easy', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/find-position-of-set-bit3706/1', tags: ['Bit Manipulation'], xp: 50, category: 'Math', sheet: 'Striver' },
    { id: 'striver-185', title: 'Divide Two Integers', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/divide-two-integers/', tags: ['Bit Manipulation', 'Math'], xp: 150, category: 'Math', sheet: 'Striver' },
    { id: 'striver-186', title: 'Count Set Bits', difficulty: 'Easy', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/count-total-set-bits-1587115620/1', tags: ['Bit Manipulation'], xp: 75, category: 'Math', sheet: 'Striver' },
    
    // Day 29: Advanced Graph Algorithms
    { id: 'striver-187', title: 'Shortest Path in DAG', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/shortest-path-in-dag/1', tags: ['Graph'], xp: 150, category: 'Graph', sheet: 'Striver' },
    { id: 'striver-188', title: 'Dijkstra Algorithm', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/implementing-dijkstra-set-1-adjacency-matrix/1', tags: ['Graph'], xp: 175, category: 'Graph', sheet: 'Striver' },
    { id: 'striver-189', title: 'Bellman Ford Algorithm', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/distance-from-the-source-bellman-ford-algorithm/1', tags: ['Graph'], xp: 175, category: 'Graph', sheet: 'Striver' },
    { id: 'striver-190', title: 'Floyd Warshall Algorithm', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/implementing-floyd-warshall2042/1', tags: ['Graph', 'DP'], xp: 175, category: 'Graph', sheet: 'Striver' },
    { id: 'striver-191', title: 'MST using Prims Algorithm', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/minimum-spanning-tree/1', tags: ['Graph'], xp: 175, category: 'Graph', sheet: 'Striver' },
    { id: 'striver-192', title: 'MST using Kruskal Algorithm', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/minimum-spanning-tree/1', tags: ['Graph', 'Union Find'], xp: 175, category: 'Graph', sheet: 'Striver' },
    { id: 'striver-193', title: 'Strongly Connected Components (Kosaraju)', difficulty: 'Hard', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/strongly-connected-components-kosarajus-algo/1', tags: ['Graph'], xp: 200, category: 'Graph', sheet: 'Striver' },
    { id: 'striver-194', title: 'Bridges in Graph', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/critical-connections-in-a-network/', tags: ['Graph'], xp: 200, category: 'Graph', sheet: 'Striver' },
    { id: 'striver-195', title: 'Articulation Point', difficulty: 'Hard', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/articulation-point-1/1', tags: ['Graph'], xp: 200, category: 'Graph', sheet: 'Striver' },
    
    // BLIND 75 - ESSENTIAL PROBLEMS
    { id: 'blind-1', title: 'Two Sum', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/two-sum/', tags: ['Array', 'Hash Table'], xp: 50, category: 'Array', sheet: 'Blind 75', companies: ['Google', 'Amazon', 'Microsoft', 'Facebook', 'Apple', 'Adobe', 'Bloomberg'] },
    { id: 'blind-2', title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', tags: ['Array', 'Dynamic Programming'], xp: 50, category: 'Array', sheet: 'Blind 75', companies: ['Amazon', 'Facebook', 'Goldman Sachs', 'Morgan Stanley', 'Bloomberg'] },
    { id: 'blind-3', title: 'Contains Duplicate', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/contains-duplicate/', tags: ['Array', 'Hash Table'], xp: 25, category: 'Array', sheet: 'Blind 75', companies: ['Amazon', 'Google', 'Apple'] },
    { id: 'blind-4', title: 'Product of Array Except Self', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/product-of-array-except-self/', tags: ['Array', 'Prefix Sum'], xp: 100, category: 'Array', sheet: 'Blind 75', companies: ['Amazon', 'Facebook', 'Microsoft', 'Apple', 'LinkedIn'] },
    { id: 'blind-5', title: 'Maximum Subarray', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/maximum-subarray/', tags: ['Array', 'Dynamic Programming'], xp: 75, category: 'Array', sheet: 'Blind 75', companies: ['Amazon', 'Microsoft', 'LinkedIn', 'Apple', 'Google'] },
    
    // FAANG PREPARATION
    { id: 'faang-1', title: 'Merge Intervals', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/merge-intervals/', tags: ['Array', 'Sorting'], xp: 125, category: 'Array', sheet: 'FAANG', companies: ['Google', 'Amazon', 'Microsoft', 'Facebook', 'Bloomberg', 'Uber'] },
    { id: 'faang-2', title: 'Insert Interval', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/insert-interval/', tags: ['Array'], xp: 125, category: 'Array', sheet: 'FAANG', companies: ['Google', 'Facebook', 'LinkedIn'] },
    { id: 'faang-3', title: '3Sum', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/3sum/', tags: ['Array', 'Two Pointers'], xp: 125, category: 'Array', sheet: 'FAANG', companies: ['Amazon', 'Facebook', 'Microsoft', 'Google', 'Bloomberg', 'Apple'] },
    { id: 'faang-4', title: 'Container With Most Water', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/container-with-most-water/', tags: ['Array', 'Two Pointers'], xp: 125, category: 'Array', sheet: 'FAANG', companies: ['Amazon', 'Facebook', 'Google', 'Goldman Sachs'] },
    { id: 'faang-5', title: 'Sliding Window Maximum', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/sliding-window-maximum/', tags: ['Array', 'Sliding Window', 'Deque'], xp: 200, category: 'Array', sheet: 'FAANG', companies: ['Amazon', 'Google', 'Microsoft', 'Uber'] },
    
    // LOVE BABBAR SHEET
    { id: 'babbar-1', title: 'Reverse the Array', difficulty: 'Easy', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/reverse-an-array/0', tags: ['Array'], xp: 25, category: 'Array', sheet: 'Love Babbar' },
    { id: 'babbar-2', title: 'Find the Maximum and Minimum Element', difficulty: 'Easy', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/find-minimum-and-maximum-element-in-an-array4428/1', tags: ['Array'], xp: 25, category: 'Array', sheet: 'Love Babbar' },
    { id: 'babbar-3', title: 'Kth Smallest Element', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/kth-smallest-element5635/1', tags: ['Array', 'Sorting'], xp: 100, category: 'Array', sheet: 'Love Babbar' },
    { id: 'babbar-4', title: 'Sort 0s, 1s and 2s', difficulty: 'Easy', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/sort-an-array-of-0s-1s-and-2s4231/1', tags: ['Array', 'Sorting'], xp: 50, category: 'Array', sheet: 'Love Babbar' },
    { id: 'babbar-5', title: 'Move Negative Numbers', difficulty: 'Easy', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/move-all-negative-numbers-to-beginning-and-positive-to-end-with-constant-extra-space/1', tags: ['Array', 'Two Pointers'], xp: 50, category: 'Array', sheet: 'Love Babbar' },

    // STRING PROBLEMS
    { id: 'str-1', title: 'Valid Anagram', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/valid-anagram/', tags: ['String', 'Hash Table'], xp: 50, category: 'String', sheet: 'Blind 75', companies: ['Amazon', 'Google', 'Microsoft'] },
    { id: 'str-2', title: 'Valid Parentheses', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/valid-parentheses/', tags: ['String', 'Stack'], xp: 50, category: 'String', sheet: 'Blind 75', companies: ['Amazon', 'Facebook', 'Google', 'Bloomberg', 'Microsoft'] },
    { id: 'str-3', title: 'Valid Palindrome', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/valid-palindrome/', tags: ['String', 'Two Pointers'], xp: 50, category: 'String', sheet: 'Blind 75', companies: ['Facebook', 'Microsoft'] },
    { id: 'str-4', title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', tags: ['String', 'Sliding Window'], xp: 125, category: 'String', sheet: 'Blind 75', companies: ['Amazon', 'Google', 'Microsoft', 'Facebook', 'Bloomberg', 'Apple', 'Uber'] },
    { id: 'str-5', title: 'Longest Repeating Character Replacement', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/longest-repeating-character-replacement/', tags: ['String', 'Sliding Window'], xp: 125, category: 'String', sheet: 'Blind 75', companies: ['Google', 'Facebook'] },
    { id: 'str-6', title: 'Minimum Window Substring', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/minimum-window-substring/', tags: ['String', 'Sliding Window'], xp: 200, category: 'String', sheet: 'Blind 75', companies: ['Facebook', 'Amazon', 'Google', 'LinkedIn', 'Uber', 'Airbnb'] },
    { id: 'str-7', title: 'Group Anagrams', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/group-anagrams/', tags: ['String', 'Hash Table'], xp: 125, category: 'String', sheet: 'Blind 75', companies: ['Amazon', 'Facebook', 'Google', 'Microsoft', 'Bloomberg'] },
    { id: 'str-8', title: 'Longest Palindromic Substring', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/longest-palindromic-substring/', tags: ['String', 'Dynamic Programming'], xp: 125, category: 'String', sheet: 'Blind 75', companies: ['Amazon', 'Microsoft', 'Google', 'Facebook'] },
    { id: 'str-9', title: 'Palindromic Substrings', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/palindromic-substrings/', tags: ['String', 'Dynamic Programming'], xp: 125, category: 'String', sheet: 'Blind 75', companies: ['Facebook', 'LinkedIn'] },
    { id: 'str-10', title: 'Encode and Decode Strings', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/encode-and-decode-strings/', tags: ['String', 'Design'], xp: 125, category: 'String', sheet: 'Blind 75', companies: ['Google', 'Facebook'] },

    // TREE PROBLEMS
    { id: 'tree-1', title: 'Maximum Depth of Binary Tree', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/', tags: ['Tree', 'DFS'], xp: 50, category: 'Tree', sheet: 'Blind 75', companies: ['Amazon', 'LinkedIn', 'Apple'] },
    { id: 'tree-2', title: 'Same Tree', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/same-tree/', tags: ['Tree', 'DFS'], xp: 50, category: 'Tree', sheet: 'Blind 75', companies: ['Amazon', 'Bloomberg'] },
    { id: 'tree-3', title: 'Invert Binary Tree', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/invert-binary-tree/', tags: ['Tree', 'DFS'], xp: 50, category: 'Tree', sheet: 'Blind 75', companies: ['Google', 'Amazon'] },
    { id: 'tree-4', title: 'Binary Tree Maximum Path Sum', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/', tags: ['Tree', 'DFS'], xp: 200, category: 'Tree', sheet: 'Blind 75', companies: ['Facebook', 'Microsoft', 'Amazon', 'Google'] },
    { id: 'tree-5', title: 'Binary Tree Level Order Traversal', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/binary-tree-level-order-traversal/', tags: ['Tree', 'BFS'], xp: 125, category: 'Tree', sheet: 'Blind 75', companies: ['Amazon', 'Facebook', 'LinkedIn', 'Microsoft'] },
    { id: 'tree-6', title: 'Serialize and Deserialize Binary Tree', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/', tags: ['Tree', 'Design'], xp: 200, category: 'Tree', sheet: 'Blind 75', companies: ['Facebook', 'Amazon', 'Microsoft', 'LinkedIn', 'Uber'] },
    { id: 'tree-7', title: 'Subtree of Another Tree', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/subtree-of-another-tree/', tags: ['Tree', 'DFS'], xp: 75, category: 'Tree', sheet: 'Blind 75', companies: ['Facebook', 'Amazon'] },
    { id: 'tree-8', title: 'Construct Binary Tree from Preorder and Inorder', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/', tags: ['Tree', 'Array'], xp: 125, category: 'Tree', sheet: 'Blind 75', companies: ['Microsoft', 'Google', 'Amazon'] },
    { id: 'tree-9', title: 'Validate Binary Search Tree', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/validate-binary-search-tree/', tags: ['Tree', 'DFS'], xp: 125, category: 'Tree', sheet: 'Blind 75', companies: ['Amazon', 'Facebook', 'Microsoft', 'Bloomberg'] },
    { id: 'tree-10', title: 'Kth Smallest Element in a BST', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/kth-smallest-element-in-a-bst/', tags: ['Tree', 'DFS'], xp: 125, category: 'Tree', sheet: 'Blind 75', companies: ['Amazon', 'Facebook', 'Google'] },

    // GRAPH PROBLEMS
    { id: 'graph-1', title: 'Clone Graph', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/clone-graph/', tags: ['Graph', 'DFS', 'BFS'], xp: 125, category: 'Graph', sheet: 'Blind 75', companies: ['Facebook', 'Google', 'Amazon', 'Uber'] },
    { id: 'graph-2', title: 'Course Schedule', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/course-schedule/', tags: ['Graph', 'Topological Sort'], xp: 125, category: 'Graph', sheet: 'Blind 75', companies: ['Amazon', 'Facebook', 'Microsoft', 'Google', 'Uber'] },
    { id: 'graph-3', title: 'Pacific Atlantic Water Flow', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/pacific-atlantic-water-flow/', tags: ['Graph', 'DFS'], xp: 125, category: 'Graph', sheet: 'Blind 75', companies: ['Google', 'Amazon'] },
    { id: 'graph-4', title: 'Number of Islands', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/number-of-islands/', tags: ['Graph', 'DFS', 'BFS'], xp: 125, category: 'Graph', sheet: 'Blind 75', companies: ['Amazon', 'Facebook', 'Microsoft', 'Google', 'Bloomberg', 'Uber', 'LinkedIn'] },
    { id: 'graph-5', title: 'Longest Consecutive Sequence', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/longest-consecutive-sequence/', tags: ['Array', 'Hash Table'], xp: 125, category: 'Graph', sheet: 'Blind 75', companies: ['Google', 'Amazon', 'Facebook'] },
    { id: 'graph-6', title: 'Alien Dictionary', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/alien-dictionary/', tags: ['Graph', 'Topological Sort'], xp: 200, category: 'Graph', sheet: 'Blind 75', companies: ['Facebook', 'Airbnb', 'Google', 'Amazon'] },
    { id: 'graph-7', title: 'Graph Valid Tree', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/graph-valid-tree/', tags: ['Graph', 'Union Find'], xp: 125, category: 'Graph', sheet: 'Blind 75', companies: ['Facebook', 'Google', 'LinkedIn'] },
    { id: 'graph-8', title: 'Number of Connected Components', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/', tags: ['Graph', 'Union Find'], xp: 125, category: 'Graph', sheet: 'Blind 75', companies: ['Google', 'LinkedIn', 'Twitter'] },

    // DYNAMIC PROGRAMMING
    { id: 'dp-1', title: 'Climbing Stairs', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/climbing-stairs/', tags: ['Dynamic Programming'], xp: 50, category: 'DP', sheet: 'Blind 75', companies: ['Amazon', 'Google', 'Apple'] },
    { id: 'dp-2', title: 'Coin Change', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/coin-change/', tags: ['Dynamic Programming'], xp: 125, category: 'DP', sheet: 'Blind 75', companies: ['Amazon', 'Microsoft', 'Google', 'Goldman Sachs'] },
    { id: 'dp-3', title: 'Longest Increasing Subsequence', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/longest-increasing-subsequence/', tags: ['Dynamic Programming'], xp: 125, category: 'DP', sheet: 'Blind 75', companies: ['Amazon', 'Microsoft', 'Google', 'Facebook'] },
    { id: 'dp-4', title: 'Longest Common Subsequence', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/longest-common-subsequence/', tags: ['Dynamic Programming'], xp: 125, category: 'DP', sheet: 'Blind 75', companies: ['Amazon', 'Google'] },
    { id: 'dp-5', title: 'Word Break', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/word-break/', tags: ['Dynamic Programming'], xp: 125, category: 'DP', sheet: 'Blind 75', companies: ['Amazon', 'Facebook', 'Google', 'Microsoft', 'Bloomberg', 'Apple'] },
    { id: 'dp-6', title: 'Combination Sum IV', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/combination-sum-iv/', tags: ['Dynamic Programming'], xp: 125, category: 'DP', sheet: 'Blind 75', companies: ['Google', 'Facebook'] },
    { id: 'dp-7', title: 'House Robber', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/house-robber/', tags: ['Dynamic Programming'], xp: 100, category: 'DP', sheet: 'Blind 75', companies: ['Amazon', 'Google', 'Microsoft', 'LinkedIn'] },
    { id: 'dp-8', title: 'House Robber II', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/house-robber-ii/', tags: ['Dynamic Programming'], xp: 125, category: 'DP', sheet: 'Blind 75', companies: ['Google', 'Microsoft'] },
    { id: 'dp-9', title: 'Decode Ways', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/decode-ways/', tags: ['Dynamic Programming'], xp: 125, category: 'DP', sheet: 'Blind 75', companies: ['Facebook', 'Microsoft', 'Google', 'Amazon'] },
    { id: 'dp-10', title: 'Unique Paths', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/unique-paths/', tags: ['Dynamic Programming'], xp: 100, category: 'DP', sheet: 'Blind 75', companies: ['Amazon', 'Google', 'Facebook', 'Bloomberg'] },

    // MATH PROBLEMS
    { id: 'math-1', title: 'Happy Number', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/happy-number/', tags: ['Math', 'Hash Table'], xp: 50, category: 'Math', sheet: 'FAANG' },
    { id: 'math-2', title: 'Plus One', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/plus-one/', tags: ['Math', 'Array'], xp: 25, category: 'Math', sheet: 'FAANG' },
    { id: 'math-3', title: 'Pow(x, n)', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/powx-n/', tags: ['Math', 'Recursion'], xp: 100, category: 'Math', sheet: 'FAANG' },
    { id: 'math-4', title: 'Sqrt(x)', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/sqrtx/', tags: ['Math', 'Binary Search'], xp: 50, category: 'Math', sheet: 'FAANG' },
    { id: 'math-5', title: 'Integer to Roman', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/integer-to-roman/', tags: ['Math', 'String'], xp: 100, category: 'Math', sheet: 'FAANG' },

    // GEEKSFORGEEKS EXCLUSIVE
    { id: 'gfg-1', title: 'Rotate Array', difficulty: 'Easy', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/rotate-array-by-n-elements-1587115621/1', tags: ['Array'], xp: 50, category: 'Array', sheet: 'Love Babbar' },
    { id: 'gfg-2', title: 'Missing Number', difficulty: 'Easy', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/missing-number-in-array1416/1', tags: ['Array', 'Math'], xp: 50, category: 'Array', sheet: 'Love Babbar' },
    { id: 'gfg-3', title: 'Count Inversions', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/inversion-of-array-1587115620/1', tags: ['Array', 'Merge Sort'], xp: 125, category: 'Array', sheet: 'Striver' },
    { id: 'gfg-4', title: 'Majority Element', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/majority-element-1587115620/1', tags: ['Array'], xp: 100, category: 'Array', sheet: 'Striver' },
    { id: 'gfg-5', title: 'Stock Buy Sell', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/stock-buy-and-sell-1587115621/1', tags: ['Array', 'Greedy'], xp: 125, category: 'Array', sheet: 'Love Babbar' },

    // CODECHEF EXCLUSIVE
    { id: 'cc-1', title: 'Life Universe Everything', difficulty: 'Easy', platform: 'CodeChef', url: 'https://www.codechef.com/problems/TEST', tags: ['Basic Programming'], xp: 25, category: 'Math', sheet: 'Love Babbar' },
    { id: 'cc-2', title: 'ATM Problem', difficulty: 'Easy', platform: 'CodeChef', url: 'https://www.codechef.com/problems/HS08TEST', tags: ['Basic Programming'], xp: 50, category: 'Math', sheet: 'Love Babbar' },
    { id: 'cc-3', title: 'Sum of Digits', difficulty: 'Easy', platform: 'CodeChef', url: 'https://www.codechef.com/problems/FLOW006', tags: ['Basic Programming'], xp: 25, category: 'Math', sheet: 'Love Babbar' },
    { id: 'cc-4', title: 'Factorial', difficulty: 'Easy', platform: 'CodeChef', url: 'https://www.codechef.com/problems/FCTRL', tags: ['Math'], xp: 50, category: 'Math', sheet: 'Love Babbar' },
    { id: 'cc-5', title: 'Prime Generator', difficulty: 'Medium', platform: 'CodeChef', url: 'https://www.codechef.com/problems/PRIME1', tags: ['Math', 'Number Theory'], xp: 125, category: 'Math', sheet: 'Love Babbar' },

    // ============ COMPLETE BLIND 75 PROBLEMS ============
    // Array
    { id: 'blind-6', title: 'Maximum Product Subarray', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/maximum-product-subarray/', tags: ['Array', 'Dynamic Programming'], xp: 125, category: 'Array', sheet: 'Blind 75' },
    { id: 'blind-7', title: 'Find Minimum in Rotated Sorted Array', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/', tags: ['Array', 'Binary Search'], xp: 125, category: 'Array', sheet: 'Blind 75' },
    { id: 'blind-8', title: 'Search in Rotated Sorted Array', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/search-in-rotated-sorted-array/', tags: ['Array', 'Binary Search'], xp: 125, category: 'Array', sheet: 'Blind 75' },
    { id: 'blind-9', title: '3Sum', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/3sum/', tags: ['Array', 'Two Pointers'], xp: 125, category: 'Array', sheet: 'Blind 75' },
    { id: 'blind-10', title: 'Container With Most Water', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/container-with-most-water/', tags: ['Array', 'Two Pointers'], xp: 125, category: 'Array', sheet: 'Blind 75' },
    
    // Binary
    { id: 'blind-11', title: 'Sum of Two Integers', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/sum-of-two-integers/', tags: ['Bit Manipulation'], xp: 100, category: 'Math', sheet: 'Blind 75' },
    { id: 'blind-12', title: 'Number of 1 Bits', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/number-of-1-bits/', tags: ['Bit Manipulation'], xp: 50, category: 'Math', sheet: 'Blind 75' },
    { id: 'blind-13', title: 'Counting Bits', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/counting-bits/', tags: ['Bit Manipulation', 'Dynamic Programming'], xp: 75, category: 'Math', sheet: 'Blind 75' },
    { id: 'blind-14', title: 'Missing Number', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/missing-number/', tags: ['Bit Manipulation', 'Array'], xp: 50, category: 'Array', sheet: 'Blind 75' },
    { id: 'blind-15', title: 'Reverse Bits', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/reverse-bits/', tags: ['Bit Manipulation'], xp: 50, category: 'Math', sheet: 'Blind 75' },
    
    // Dynamic Programming
    { id: 'blind-16', title: 'Jump Game', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/jump-game/', tags: ['Dynamic Programming', 'Greedy'], xp: 125, category: 'DP', sheet: 'Blind 75' },
    
    // Interval
    { id: 'blind-17', title: 'Insert Interval', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/insert-interval/', tags: ['Array', 'Interval'], xp: 125, category: 'Array', sheet: 'Blind 75' },
    { id: 'blind-18', title: 'Merge Intervals', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/merge-intervals/', tags: ['Array', 'Interval', 'Sorting'], xp: 125, category: 'Array', sheet: 'Blind 75' },
    { id: 'blind-19', title: 'Non-overlapping Intervals', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/non-overlapping-intervals/', tags: ['Array', 'Greedy'], xp: 125, category: 'Array', sheet: 'Blind 75' },
    { id: 'blind-20', title: 'Meeting Rooms', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/meeting-rooms/', tags: ['Array', 'Sorting'], xp: 75, category: 'Array', sheet: 'Blind 75' },
    { id: 'blind-21', title: 'Meeting Rooms II', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/meeting-rooms-ii/', tags: ['Array', 'Heap'], xp: 125, category: 'Array', sheet: 'Blind 75' },
    
    // Linked List
    { id: 'blind-22', title: 'Reverse Linked List', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/reverse-linked-list/', tags: ['Linked List'], xp: 50, category: 'Array', sheet: 'Blind 75' },
    { id: 'blind-23', title: 'Detect Cycle in Linked List', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/linked-list-cycle/', tags: ['Linked List', 'Two Pointers'], xp: 75, category: 'Array', sheet: 'Blind 75' },
    { id: 'blind-24', title: 'Merge Two Sorted Lists', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/merge-two-sorted-lists/', tags: ['Linked List'], xp: 50, category: 'Array', sheet: 'Blind 75' },
    { id: 'blind-25', title: 'Merge K Sorted Lists', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/merge-k-sorted-lists/', tags: ['Linked List', 'Heap'], xp: 200, category: 'Array', sheet: 'Blind 75' },
    { id: 'blind-26', title: 'Remove Nth Node From End', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/', tags: ['Linked List', 'Two Pointers'], xp: 100, category: 'Array', sheet: 'Blind 75' },
    { id: 'blind-27', title: 'Reorder List', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/reorder-list/', tags: ['Linked List', 'Two Pointers'], xp: 125, category: 'Array', sheet: 'Blind 75' },
    
    // Matrix
    { id: 'blind-28', title: 'Set Matrix Zeroes', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/set-matrix-zeroes/', tags: ['Array', 'Matrix'], xp: 100, category: 'Array', sheet: 'Blind 75' },
    { id: 'blind-29', title: 'Spiral Matrix', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/spiral-matrix/', tags: ['Array', 'Matrix'], xp: 125, category: 'Array', sheet: 'Blind 75' },
    { id: 'blind-30', title: 'Rotate Image', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/rotate-image/', tags: ['Array', 'Matrix'], xp: 100, category: 'Array', sheet: 'Blind 75' },
    { id: 'blind-31', title: 'Word Search', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/word-search/', tags: ['Array', 'Matrix', 'Backtracking'], xp: 150, category: 'Array', sheet: 'Blind 75' },
    
    // Heap
    { id: 'blind-32', title: 'Top K Frequent Elements', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/top-k-frequent-elements/', tags: ['Array', 'Heap', 'Hash Table'], xp: 125, category: 'Array', sheet: 'Blind 75' },
    { id: 'blind-33', title: 'Find Median from Data Stream', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/find-median-from-data-stream/', tags: ['Heap', 'Design'], xp: 200, category: 'Array', sheet: 'Blind 75' },
    
    // ============ MORE STRIVER A2Z PROBLEMS ============
    // Sorting
    { id: 'striver-196', title: 'Selection Sort', difficulty: 'Easy', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/selection-sort/1', tags: ['Sorting'], xp: 25, category: 'Array', sheet: 'Striver' },
    { id: 'striver-197', title: 'Bubble Sort', difficulty: 'Easy', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/bubble-sort/1', tags: ['Sorting'], xp: 25, category: 'Array', sheet: 'Striver' },
    { id: 'striver-198', title: 'Insertion Sort', difficulty: 'Easy', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/insertion-sort/1', tags: ['Sorting'], xp: 25, category: 'Array', sheet: 'Striver' },
    { id: 'striver-199', title: 'Merge Sort', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/merge-sort/1', tags: ['Sorting', 'Divide and Conquer'], xp: 100, category: 'Array', sheet: 'Striver' },
    { id: 'striver-200', title: 'Quick Sort', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/quick-sort/1', tags: ['Sorting', 'Divide and Conquer'], xp: 100, category: 'Array', sheet: 'Striver' },
    { id: 'striver-201', title: 'Heap Sort', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/heap-sort/1', tags: ['Sorting', 'Heap'], xp: 125, category: 'Array', sheet: 'Striver' },
    { id: 'striver-202', title: 'Counting Sort', difficulty: 'Easy', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/counting-sort/1', tags: ['Sorting'], xp: 75, category: 'Array', sheet: 'Striver' },
    { id: 'striver-203', title: 'Radix Sort', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/radix-sort/1', tags: ['Sorting'], xp: 100, category: 'Array', sheet: 'Striver' },
    
    // Recursion & Backtracking Extended
    { id: 'striver-204', title: 'Print 1 to N Using Recursion', difficulty: 'Easy', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/print-1-to-n-without-using-loops-1587115620/1', tags: ['Recursion'], xp: 25, category: 'Math', sheet: 'Striver' },
    { id: 'striver-205', title: 'Print N to 1 Using Recursion', difficulty: 'Easy', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/print-n-to-1-without-loop/1', tags: ['Recursion'], xp: 25, category: 'Math', sheet: 'Striver' },
    { id: 'striver-206', title: 'Sum of First N Numbers', difficulty: 'Easy', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/sum-of-first-n-terms5843/1', tags: ['Recursion'], xp: 25, category: 'Math', sheet: 'Striver' },
    { id: 'striver-207', title: 'Factorial Using Recursion', difficulty: 'Easy', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/factorial5739/1', tags: ['Recursion'], xp: 25, category: 'Math', sheet: 'Striver' },
    { id: 'striver-208', title: 'Reverse Array Using Recursion', difficulty: 'Easy', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/reverse-an-array/0', tags: ['Recursion', 'Array'], xp: 50, category: 'Array', sheet: 'Striver' },
    { id: 'striver-209', title: 'Check Palindrome Using Recursion', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/valid-palindrome/', tags: ['Recursion', 'String'], xp: 50, category: 'String', sheet: 'Striver' },
    { id: 'striver-210', title: 'Fibonacci Number', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/fibonacci-number/', tags: ['Recursion', 'Dynamic Programming'], xp: 50, category: 'DP', sheet: 'Striver' },
    { id: 'striver-211', title: 'Generate Parentheses', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/generate-parentheses/', tags: ['Backtracking', 'Recursion'], xp: 125, category: 'String', sheet: 'Striver' },
    { id: 'striver-212', title: 'Letter Combinations of Phone Number', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/letter-combinations-of-a-phone-number/', tags: ['Backtracking', 'Recursion'], xp: 125, category: 'String', sheet: 'Striver' },
    
    // Binary Search Extended
    { id: 'striver-213', title: 'Binary Search', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/binary-search/', tags: ['Binary Search'], xp: 50, category: 'Array', sheet: 'Striver' },
    { id: 'striver-214', title: 'Lower Bound', difficulty: 'Easy', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/floor-in-a-sorted-array-1587115620/1', tags: ['Binary Search'], xp: 50, category: 'Array', sheet: 'Striver' },
    { id: 'striver-215', title: 'Upper Bound', difficulty: 'Easy', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/ceil-the-floor2802/1', tags: ['Binary Search'], xp: 50, category: 'Array', sheet: 'Striver' },
    { id: 'striver-216', title: 'Search Insert Position', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/search-insert-position/', tags: ['Binary Search'], xp: 50, category: 'Array', sheet: 'Striver' },
    { id: 'striver-217', title: 'Floor in Sorted Array', difficulty: 'Easy', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/floor-in-a-sorted-array-1587115620/1', tags: ['Binary Search'], xp: 50, category: 'Array', sheet: 'Striver' },
    { id: 'striver-218', title: 'First and Last Position', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/', tags: ['Binary Search'], xp: 100, category: 'Array', sheet: 'Striver' },
    { id: 'striver-219', title: 'Count Occurrences in Sorted Array', difficulty: 'Easy', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/number-of-occurrence2259/1', tags: ['Binary Search'], xp: 75, category: 'Array', sheet: 'Striver' },
    { id: 'striver-220', title: 'Peak Element', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/find-peak-element/', tags: ['Binary Search'], xp: 100, category: 'Array', sheet: 'Striver' },
    { id: 'striver-221', title: 'Square Root Using Binary Search', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/sqrtx/', tags: ['Binary Search', 'Math'], xp: 75, category: 'Math', sheet: 'Striver' },
    { id: 'striver-222', title: 'Koko Eating Bananas', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/koko-eating-bananas/', tags: ['Binary Search'], xp: 125, category: 'Array', sheet: 'Striver' },
    { id: 'striver-223', title: 'Minimum Days to Make M Bouquets', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/minimum-number-of-days-to-make-m-bouquets/', tags: ['Binary Search'], xp: 125, category: 'Array', sheet: 'Striver' },
    { id: 'striver-224', title: 'Smallest Divisor Given Threshold', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/find-the-smallest-divisor-given-a-threshold/', tags: ['Binary Search'], xp: 125, category: 'Array', sheet: 'Striver' },
    { id: 'striver-225', title: 'Capacity to Ship Packages', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/', tags: ['Binary Search'], xp: 125, category: 'Array', sheet: 'Striver' },
    { id: 'striver-226', title: 'Split Array Largest Sum', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/split-array-largest-sum/', tags: ['Binary Search', 'Dynamic Programming'], xp: 200, category: 'Array', sheet: 'Striver' },
    
    // Sliding Window & Two Pointers
    { id: 'striver-227', title: 'Maximum Points from Cards', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/maximum-points-you-can-obtain-from-cards/', tags: ['Sliding Window'], xp: 125, category: 'Array', sheet: 'Striver' },
    { id: 'striver-228', title: 'Longest Substring with At Most K Distinct', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/longest-substring-with-at-most-k-distinct-characters/', tags: ['Sliding Window'], xp: 150, category: 'String', sheet: 'Striver' },
    { id: 'striver-229', title: 'Fruit Into Baskets', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/fruit-into-baskets/', tags: ['Sliding Window'], xp: 125, category: 'Array', sheet: 'Striver' },
    { id: 'striver-230', title: 'Number of Substrings with All 3 Chars', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/number-of-substrings-containing-all-three-characters/', tags: ['Sliding Window'], xp: 125, category: 'String', sheet: 'Striver' },
    { id: 'striver-231', title: 'Max Consecutive Ones III', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/max-consecutive-ones-iii/', tags: ['Sliding Window'], xp: 125, category: 'Array', sheet: 'Striver' },
    { id: 'striver-232', title: 'Binary Subarrays With Sum', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/binary-subarrays-with-sum/', tags: ['Sliding Window', 'Hash Table'], xp: 125, category: 'Array', sheet: 'Striver' },
    { id: 'striver-233', title: 'Count Nice Subarrays', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/count-number-of-nice-subarrays/', tags: ['Sliding Window'], xp: 125, category: 'Array', sheet: 'Striver' },
    { id: 'striver-234', title: 'Subarrays with K Different Integers', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/subarrays-with-k-different-integers/', tags: ['Sliding Window'], xp: 200, category: 'Array', sheet: 'Striver' },
    
    // More DP Problems
    { id: 'striver-235', title: 'Frog Jump', difficulty: 'Easy', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/geek-jump/1', tags: ['Dynamic Programming'], xp: 75, category: 'DP', sheet: 'Striver' },
    { id: 'striver-236', title: 'Frog Jump with K Distances', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/minimal-cost/1', tags: ['Dynamic Programming'], xp: 100, category: 'DP', sheet: 'Striver' },
    { id: 'striver-237', title: 'Maximum Sum Non-Adjacent Elements', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/house-robber/', tags: ['Dynamic Programming'], xp: 100, category: 'DP', sheet: 'Striver' },
    { id: 'striver-238', title: 'House Robber II', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/house-robber-ii/', tags: ['Dynamic Programming'], xp: 125, category: 'DP', sheet: 'Striver' },
    { id: 'striver-239', title: 'Ninjas Training', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/geeks-training/1', tags: ['Dynamic Programming'], xp: 125, category: 'DP', sheet: 'Striver' },
    { id: 'striver-240', title: 'Grid Unique Paths 2', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/unique-paths-ii/', tags: ['Dynamic Programming'], xp: 125, category: 'DP', sheet: 'Striver' },
    { id: 'striver-241', title: 'Minimum Path Sum', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/minimum-path-sum/', tags: ['Dynamic Programming'], xp: 125, category: 'DP', sheet: 'Striver' },
    { id: 'striver-242', title: 'Triangle', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/triangle/', tags: ['Dynamic Programming'], xp: 125, category: 'DP', sheet: 'Striver' },
    { id: 'striver-243', title: 'Minimum Falling Path Sum', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/minimum-falling-path-sum/', tags: ['Dynamic Programming'], xp: 125, category: 'DP', sheet: 'Striver' },
    { id: 'striver-244', title: 'Cherry Pickup II', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/cherry-pickup-ii/', tags: ['Dynamic Programming'], xp: 200, category: 'DP', sheet: 'Striver' },
    { id: 'striver-245', title: 'Partition Equal Subset Sum', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/partition-equal-subset-sum/', tags: ['Dynamic Programming'], xp: 150, category: 'DP', sheet: 'Striver' },
    { id: 'striver-246', title: 'Partition Array Into Two with Min Diff', difficulty: 'Hard', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/minimum-sum-partition3317/1', tags: ['Dynamic Programming'], xp: 200, category: 'DP', sheet: 'Striver' },
    { id: 'striver-247', title: 'Count Subsets with Sum K', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/perfect-sum-problem5633/1', tags: ['Dynamic Programming'], xp: 150, category: 'DP', sheet: 'Striver' },
    { id: 'striver-248', title: 'Count Partitions with Given Difference', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/partitions-with-given-difference/1', tags: ['Dynamic Programming'], xp: 150, category: 'DP', sheet: 'Striver' },
    { id: 'striver-249', title: 'Target Sum', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/target-sum/', tags: ['Dynamic Programming'], xp: 150, category: 'DP', sheet: 'Striver' },
    { id: 'striver-250', title: 'Coin Change II', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/coin-change-2/', tags: ['Dynamic Programming'], xp: 150, category: 'DP', sheet: 'Striver' },
    { id: 'striver-251', title: 'Unbounded Knapsack', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/knapsack-with-duplicate-items4201/1', tags: ['Dynamic Programming'], xp: 150, category: 'DP', sheet: 'Striver' },
    { id: 'striver-252', title: 'Rod Cutting Problem', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/rod-cutting0840/1', tags: ['Dynamic Programming'], xp: 150, category: 'DP', sheet: 'Striver' },
    
    // String DP
    { id: 'striver-253', title: 'Longest Common Substring', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/longest-common-substring1452/1', tags: ['Dynamic Programming', 'String'], xp: 150, category: 'DP', sheet: 'Striver' },
    { id: 'striver-254', title: 'Longest Palindromic Subsequence', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/longest-palindromic-subsequence/', tags: ['Dynamic Programming', 'String'], xp: 150, category: 'DP', sheet: 'Striver' },
    { id: 'striver-255', title: 'Minimum Insertions for Palindrome', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/minimum-insertion-steps-to-make-a-string-palindrome/', tags: ['Dynamic Programming', 'String'], xp: 200, category: 'DP', sheet: 'Striver' },
    { id: 'striver-256', title: 'Delete Operation for Two Strings', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/delete-operation-for-two-strings/', tags: ['Dynamic Programming', 'String'], xp: 150, category: 'DP', sheet: 'Striver' },
    { id: 'striver-257', title: 'Shortest Common Supersequence', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/shortest-common-supersequence/', tags: ['Dynamic Programming', 'String'], xp: 200, category: 'DP', sheet: 'Striver' },
    { id: 'striver-258', title: 'Distinct Subsequences', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/distinct-subsequences/', tags: ['Dynamic Programming', 'String'], xp: 200, category: 'DP', sheet: 'Striver' },
    { id: 'striver-259', title: 'Wildcard Matching', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/wildcard-matching/', tags: ['Dynamic Programming', 'String'], xp: 200, category: 'DP', sheet: 'Striver' },
    
    // More Graph Problems
    { id: 'striver-260', title: 'Surrounded Regions', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/surrounded-regions/', tags: ['Graph', 'DFS'], xp: 125, category: 'Graph', sheet: 'Striver' },
    { id: 'striver-261', title: 'Number of Enclaves', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/number-of-enclaves/', tags: ['Graph', 'DFS'], xp: 125, category: 'Graph', sheet: 'Striver' },
    { id: 'striver-262', title: 'Word Ladder', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/word-ladder/', tags: ['Graph', 'BFS'], xp: 200, category: 'Graph', sheet: 'Striver' },
    { id: 'striver-263', title: 'Word Ladder II', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/word-ladder-ii/', tags: ['Graph', 'BFS'], xp: 250, category: 'Graph', sheet: 'Striver' },
    { id: 'striver-264', title: 'Number of Distinct Islands', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/number-of-distinct-islands/', tags: ['Graph', 'DFS'], xp: 150, category: 'Graph', sheet: 'Striver' },
    { id: 'striver-265', title: 'Cheapest Flights Within K Stops', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/cheapest-flights-within-k-stops/', tags: ['Graph', 'Dijkstra'], xp: 175, category: 'Graph', sheet: 'Striver' },
    { id: 'striver-266', title: 'Network Delay Time', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/network-delay-time/', tags: ['Graph', 'Dijkstra'], xp: 150, category: 'Graph', sheet: 'Striver' },
    { id: 'striver-267', title: 'Path with Minimum Effort', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/path-with-minimum-effort/', tags: ['Graph', 'Binary Search'], xp: 150, category: 'Graph', sheet: 'Striver' },
    { id: 'striver-268', title: 'Swim in Rising Water', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/swim-in-rising-water/', tags: ['Graph', 'Binary Search'], xp: 200, category: 'Graph', sheet: 'Striver' },
    { id: 'striver-269', title: 'Number of Ways to Arrive at Destination', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/number-of-ways-to-arrive-at-destination/', tags: ['Graph', 'Dijkstra'], xp: 175, category: 'Graph', sheet: 'Striver' },
    { id: 'striver-270', title: 'Accounts Merge', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/accounts-merge/', tags: ['Graph', 'Union Find'], xp: 175, category: 'Graph', sheet: 'Striver' },
    { id: 'striver-271', title: 'Making a Large Island', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/making-a-large-island/', tags: ['Graph', 'Union Find'], xp: 200, category: 'Graph', sheet: 'Striver' },
    { id: 'striver-272', title: 'Most Stones Removed', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/most-stones-removed-with-same-row-or-column/', tags: ['Graph', 'Union Find'], xp: 150, category: 'Graph', sheet: 'Striver' },
    
    // ============ ADDITIONAL TOPIC PROBLEMS ============
    // Segment Trees
    { id: 'seg-1', title: 'Range Sum Query - Mutable', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/range-sum-query-mutable/', tags: ['Segment Tree'], xp: 175, category: 'Tree', sheet: 'FAANG' },
    { id: 'seg-2', title: 'Range Minimum Query', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/range-minimum-query/1', tags: ['Segment Tree'], xp: 175, category: 'Tree', sheet: 'FAANG' },
    { id: 'seg-3', title: 'Count of Smaller Numbers After Self', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/count-of-smaller-numbers-after-self/', tags: ['Segment Tree', 'Merge Sort'], xp: 225, category: 'Array', sheet: 'FAANG' },
    
    // Monotonic Stack
    { id: 'mono-1', title: 'Daily Temperatures', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/daily-temperatures/', tags: ['Stack', 'Monotonic Stack'], xp: 125, category: 'Array', sheet: 'FAANG' },
    { id: 'mono-2', title: 'Largest Rectangle in Histogram', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/largest-rectangle-in-histogram/', tags: ['Stack', 'Monotonic Stack'], xp: 200, category: 'Array', sheet: 'FAANG' },
    { id: 'mono-3', title: 'Maximal Rectangle', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/maximal-rectangle/', tags: ['Stack', 'Monotonic Stack'], xp: 225, category: 'Array', sheet: 'FAANG' },
    { id: 'mono-4', title: '132 Pattern', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/132-pattern/', tags: ['Stack', 'Monotonic Stack'], xp: 150, category: 'Array', sheet: 'FAANG' },
    
    // Greedy
    { id: 'greedy-1', title: 'Jump Game II', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/jump-game-ii/', tags: ['Greedy'], xp: 150, category: 'Array', sheet: 'FAANG' },
    { id: 'greedy-2', title: 'Gas Station', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/gas-station/', tags: ['Greedy'], xp: 150, category: 'Array', sheet: 'FAANG' },
    { id: 'greedy-3', title: 'Candy', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/candy/', tags: ['Greedy'], xp: 200, category: 'Array', sheet: 'FAANG' },
    { id: 'greedy-4', title: 'Task Scheduler', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/task-scheduler/', tags: ['Greedy', 'Heap'], xp: 175, category: 'Array', sheet: 'FAANG' },
    { id: 'greedy-5', title: 'Queue Reconstruction by Height', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/queue-reconstruction-by-height/', tags: ['Greedy', 'Sorting'], xp: 150, category: 'Array', sheet: 'FAANG' },
    
    // Math & Number Theory
    { id: 'math-6', title: 'GCD of Two Numbers', difficulty: 'Easy', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/gcd-of-two-numbers3459/1', tags: ['Math'], xp: 25, category: 'Math', sheet: 'Striver' },
    { id: 'math-7', title: 'LCM of Two Numbers', difficulty: 'Easy', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/lcm-and-gcd4516/1', tags: ['Math'], xp: 25, category: 'Math', sheet: 'Striver' },
    { id: 'math-8', title: 'Check Prime Number', difficulty: 'Easy', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/prime-number2314/1', tags: ['Math'], xp: 25, category: 'Math', sheet: 'Striver' },
    { id: 'math-9', title: 'Sieve of Eratosthenes', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/sieve-of-eratosthenes5242/1', tags: ['Math'], xp: 100, category: 'Math', sheet: 'Striver' },
    { id: 'math-10', title: 'Prime Factorization', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/prime-factorization2633/1', tags: ['Math'], xp: 100, category: 'Math', sheet: 'Striver' },
    { id: 'math-11', title: 'Modular Exponentiation', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/modular-exponentiation-for-large-numbers5537/1', tags: ['Math'], xp: 125, category: 'Math', sheet: 'Striver' },
    
    // Design Problems
    { id: 'design-1', title: 'Design HashMap', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/design-hashmap/', tags: ['Design', 'Hash Table'], xp: 100, category: 'Design', sheet: 'FAANG' },
    { id: 'design-2', title: 'Design HashSet', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/design-hashset/', tags: ['Design', 'Hash Table'], xp: 100, category: 'Design', sheet: 'FAANG' },
    { id: 'design-3', title: 'Design Twitter', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/design-twitter/', tags: ['Design', 'Heap'], xp: 175, category: 'Design', sheet: 'FAANG' },
    { id: 'design-4', title: 'Design Add and Search Words', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/design-add-and-search-words-data-structure/', tags: ['Design', 'Trie'], xp: 175, category: 'Design', sheet: 'FAANG' },
    { id: 'design-5', title: 'Implement Trie', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/implement-trie-prefix-tree/', tags: ['Design', 'Trie'], xp: 150, category: 'Design', sheet: 'FAANG' },
    { id: 'design-6', title: 'Design Tic-Tac-Toe', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/design-tic-tac-toe/', tags: ['Design', 'Matrix'], xp: 150, category: 'Design', sheet: 'FAANG' },
    { id: 'design-7', title: 'Design Hit Counter', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/design-hit-counter/', tags: ['Design', 'Queue'], xp: 150, category: 'Design', sheet: 'FAANG' },
    { id: 'design-8', title: 'Design Leaderboard', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/design-a-leaderboard/', tags: ['Design', 'Heap'], xp: 150, category: 'Design', sheet: 'FAANG' },
    { id: 'design-9', title: 'Design File System', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/design-file-system/', tags: ['Design', 'Trie'], xp: 175, category: 'Design', sheet: 'FAANG' },
    { id: 'design-10', title: 'Design Browser History', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/design-browser-history/', tags: ['Design', 'Stack'], xp: 125, category: 'Design', sheet: 'FAANG' },
    { id: 'design-11', title: 'Design Parking System', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/design-parking-system/', tags: ['Design'], xp: 50, category: 'Design', sheet: 'FAANG' },
    { id: 'design-12', title: 'Design Underground System', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/design-underground-system/', tags: ['Design', 'Hash Table'], xp: 150, category: 'Design', sheet: 'FAANG' },
    { id: 'design-13', title: 'Design Circular Queue', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/design-circular-queue/', tags: ['Design', 'Queue'], xp: 125, category: 'Design', sheet: 'FAANG' },
    { id: 'design-14', title: 'Design Circular Deque', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/design-circular-deque/', tags: ['Design', 'Queue'], xp: 125, category: 'Design', sheet: 'FAANG' },

    // BLIND 75 - Complete List
    // Arrays & Hashing
    { id: 'blind-1', title: 'Contains Duplicate', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/contains-duplicate/', tags: ['Array', 'Hash Table'], xp: 50, category: 'Array', sheet: 'Blind 75' },
    { id: 'blind-2', title: 'Valid Anagram', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/valid-anagram/', tags: ['String', 'Hash Table'], xp: 50, category: 'String', sheet: 'Blind 75' },
    { id: 'blind-3', title: 'Group Anagrams', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/group-anagrams/', tags: ['String', 'Hash Table'], xp: 125, category: 'String', sheet: 'Blind 75' },
    { id: 'blind-4', title: 'Top K Frequent Elements', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/top-k-frequent-elements/', tags: ['Array', 'Heap'], xp: 125, category: 'Heap', sheet: 'Blind 75' },
    { id: 'blind-5', title: 'Product of Array Except Self', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/product-of-array-except-self/', tags: ['Array'], xp: 125, category: 'Array', sheet: 'Blind 75' },
    { id: 'blind-6', title: 'Valid Sudoku', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/valid-sudoku/', tags: ['Array', 'Hash Table'], xp: 125, category: 'Array', sheet: 'Blind 75' },
    { id: 'blind-7', title: 'Encode and Decode Strings', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/encode-and-decode-strings/', tags: ['String'], xp: 125, category: 'String', sheet: 'Blind 75' },
    { id: 'blind-8', title: 'Longest Consecutive Sequence', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/longest-consecutive-sequence/', tags: ['Array', 'Hash Table'], xp: 150, category: 'Array', sheet: 'Blind 75' },

    // Two Pointers
    { id: 'blind-9', title: 'Valid Palindrome', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/valid-palindrome/', tags: ['Two Pointers', 'String'], xp: 50, category: 'String', sheet: 'Blind 75' },
    { id: 'blind-10', title: '3Sum', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/3sum/', tags: ['Array', 'Two Pointers'], xp: 150, category: 'Array', sheet: 'Blind 75' },
    { id: 'blind-11', title: 'Container With Most Water', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/container-with-most-water/', tags: ['Array', 'Two Pointers'], xp: 125, category: 'Array', sheet: 'Blind 75' },

    // Sliding Window
    { id: 'blind-12', title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', tags: ['Array', 'Sliding Window'], xp: 75, category: 'Array', sheet: 'Blind 75' },
    { id: 'blind-13', title: 'Longest Substring Without Repeating', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', tags: ['String', 'Sliding Window'], xp: 125, category: 'String', sheet: 'Blind 75' },
    { id: 'blind-14', title: 'Longest Repeating Character Replacement', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/longest-repeating-character-replacement/', tags: ['String', 'Sliding Window'], xp: 150, category: 'String', sheet: 'Blind 75' },
    { id: 'blind-15', title: 'Minimum Window Substring', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/minimum-window-substring/', tags: ['String', 'Sliding Window'], xp: 200, category: 'String', sheet: 'Blind 75' },

    // Stack
    { id: 'blind-16', title: 'Valid Parentheses', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/valid-parentheses/', tags: ['Stack', 'String'], xp: 50, category: 'Stack', sheet: 'Blind 75' },

    // Binary Search
    { id: 'blind-17', title: 'Search in Rotated Sorted Array', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/search-in-rotated-sorted-array/', tags: ['Array', 'Binary Search'], xp: 150, category: 'Array', sheet: 'Blind 75' },
    { id: 'blind-18', title: 'Find Minimum in Rotated Sorted Array', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/', tags: ['Array', 'Binary Search'], xp: 125, category: 'Array', sheet: 'Blind 75' },

    // Linked List
    { id: 'blind-19', title: 'Reverse Linked List', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/reverse-linked-list/', tags: ['Linked List'], xp: 50, category: 'LinkedList', sheet: 'Blind 75' },
    { id: 'blind-20', title: 'Merge Two Sorted Lists', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/merge-two-sorted-lists/', tags: ['Linked List'], xp: 50, category: 'LinkedList', sheet: 'Blind 75' },
    { id: 'blind-21', title: 'Reorder List', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/reorder-list/', tags: ['Linked List'], xp: 125, category: 'LinkedList', sheet: 'Blind 75' },
    { id: 'blind-22', title: 'Remove Nth Node From End', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/', tags: ['Linked List', 'Two Pointers'], xp: 125, category: 'LinkedList', sheet: 'Blind 75' },
    { id: 'blind-23', title: 'Linked List Cycle', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/linked-list-cycle/', tags: ['Linked List', 'Two Pointers'], xp: 50, category: 'LinkedList', sheet: 'Blind 75' },
    { id: 'blind-24', title: 'Merge K Sorted Lists', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/merge-k-sorted-lists/', tags: ['Linked List', 'Heap'], xp: 200, category: 'LinkedList', sheet: 'Blind 75' },

    // Trees
    { id: 'blind-25', title: 'Invert Binary Tree', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/invert-binary-tree/', tags: ['Tree', 'DFS'], xp: 50, category: 'Tree', sheet: 'Blind 75' },
    { id: 'blind-26', title: 'Maximum Depth of Binary Tree', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/', tags: ['Tree', 'DFS'], xp: 50, category: 'Tree', sheet: 'Blind 75' },
    { id: 'blind-27', title: 'Same Tree', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/same-tree/', tags: ['Tree', 'DFS'], xp: 50, category: 'Tree', sheet: 'Blind 75' },
    { id: 'blind-28', title: 'Subtree of Another Tree', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/subtree-of-another-tree/', tags: ['Tree', 'DFS'], xp: 75, category: 'Tree', sheet: 'Blind 75' },
    { id: 'blind-29', title: 'Lowest Common Ancestor of BST', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/', tags: ['Tree', 'BST'], xp: 100, category: 'Tree', sheet: 'Blind 75' },
    { id: 'blind-30', title: 'Binary Tree Level Order Traversal', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/binary-tree-level-order-traversal/', tags: ['Tree', 'BFS'], xp: 100, category: 'Tree', sheet: 'Blind 75' },
    { id: 'blind-31', title: 'Validate Binary Search Tree', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/validate-binary-search-tree/', tags: ['Tree', 'BST'], xp: 125, category: 'Tree', sheet: 'Blind 75' },
    { id: 'blind-32', title: 'Kth Smallest Element in BST', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/kth-smallest-element-in-a-bst/', tags: ['Tree', 'BST'], xp: 125, category: 'Tree', sheet: 'Blind 75' },
    { id: 'blind-33', title: 'Construct Binary Tree from Preorder and Inorder', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/', tags: ['Tree'], xp: 150, category: 'Tree', sheet: 'Blind 75' },
    { id: 'blind-34', title: 'Binary Tree Maximum Path Sum', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/', tags: ['Tree', 'DFS'], xp: 200, category: 'Tree', sheet: 'Blind 75' },
    { id: 'blind-35', title: 'Serialize and Deserialize Binary Tree', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/', tags: ['Tree', 'Design'], xp: 200, category: 'Tree', sheet: 'Blind 75' },

    // Tries
    { id: 'blind-36', title: 'Implement Trie (Prefix Tree)', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/implement-trie-prefix-tree/', tags: ['Trie', 'Design'], xp: 150, category: 'Design', sheet: 'Blind 75' },
    { id: 'blind-37', title: 'Design Add and Search Words', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/design-add-and-search-words-data-structure/', tags: ['Trie', 'Design'], xp: 175, category: 'Design', sheet: 'Blind 75' },
    { id: 'blind-38', title: 'Word Search II', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/word-search-ii/', tags: ['Trie', 'Backtracking'], xp: 225, category: 'String', sheet: 'Blind 75' },

    // Heap / Priority Queue
    { id: 'blind-39', title: 'Find Median from Data Stream', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/find-median-from-data-stream/', tags: ['Heap', 'Design'], xp: 200, category: 'Heap', sheet: 'Blind 75' },

    // Backtracking
    { id: 'blind-40', title: 'Combination Sum', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/combination-sum/', tags: ['Backtracking'], xp: 125, category: 'Array', sheet: 'Blind 75' },
    { id: 'blind-41', title: 'Word Search', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/word-search/', tags: ['Backtracking', 'Matrix'], xp: 150, category: 'String', sheet: 'Blind 75' },

    // Graphs
    { id: 'blind-42', title: 'Number of Islands', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/number-of-islands/', tags: ['Graph', 'DFS'], xp: 125, category: 'Graph', sheet: 'Blind 75' },
    { id: 'blind-43', title: 'Clone Graph', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/clone-graph/', tags: ['Graph', 'DFS'], xp: 125, category: 'Graph', sheet: 'Blind 75' },
    { id: 'blind-44', title: 'Pacific Atlantic Water Flow', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/pacific-atlantic-water-flow/', tags: ['Graph', 'DFS'], xp: 150, category: 'Graph', sheet: 'Blind 75' },
    { id: 'blind-45', title: 'Course Schedule', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/course-schedule/', tags: ['Graph', 'Topological Sort'], xp: 150, category: 'Graph', sheet: 'Blind 75' },
    { id: 'blind-46', title: 'Course Schedule II', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/course-schedule-ii/', tags: ['Graph', 'Topological Sort'], xp: 150, category: 'Graph', sheet: 'Blind 75' },
    { id: 'blind-47', title: 'Number of Connected Components', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/', tags: ['Graph', 'Union Find'], xp: 150, category: 'Graph', sheet: 'Blind 75' },
    { id: 'blind-48', title: 'Graph Valid Tree', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/graph-valid-tree/', tags: ['Graph', 'Union Find'], xp: 150, category: 'Graph', sheet: 'Blind 75' },

    // Advanced Graphs
    { id: 'blind-49', title: 'Alien Dictionary', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/alien-dictionary/', tags: ['Graph', 'Topological Sort'], xp: 225, category: 'Graph', sheet: 'Blind 75' },

    // 1-D Dynamic Programming
    { id: 'blind-50', title: 'Climbing Stairs', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/climbing-stairs/', tags: ['DP'], xp: 50, category: 'DP', sheet: 'Blind 75' },
    { id: 'blind-51', title: 'House Robber', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/house-robber/', tags: ['DP'], xp: 100, category: 'DP', sheet: 'Blind 75' },
    { id: 'blind-52', title: 'House Robber II', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/house-robber-ii/', tags: ['DP'], xp: 125, category: 'DP', sheet: 'Blind 75' },
    { id: 'blind-53', title: 'Longest Palindromic Substring', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/longest-palindromic-substring/', tags: ['String', 'DP'], xp: 150, category: 'DP', sheet: 'Blind 75' },
    { id: 'blind-54', title: 'Palindromic Substrings', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/palindromic-substrings/', tags: ['String', 'DP'], xp: 125, category: 'DP', sheet: 'Blind 75' },
    { id: 'blind-55', title: 'Decode Ways', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/decode-ways/', tags: ['String', 'DP'], xp: 150, category: 'DP', sheet: 'Blind 75' },
    { id: 'blind-56', title: 'Coin Change', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/coin-change/', tags: ['DP'], xp: 150, category: 'DP', sheet: 'Blind 75' },
    { id: 'blind-57', title: 'Maximum Product Subarray', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/maximum-product-subarray/', tags: ['Array', 'DP'], xp: 125, category: 'DP', sheet: 'Blind 75' },
    { id: 'blind-58', title: 'Word Break', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/word-break/', tags: ['String', 'DP'], xp: 150, category: 'DP', sheet: 'Blind 75' },
    { id: 'blind-59', title: 'Longest Increasing Subsequence', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/longest-increasing-subsequence/', tags: ['Array', 'DP'], xp: 150, category: 'DP', sheet: 'Blind 75' },

    // 2-D Dynamic Programming
    { id: 'blind-60', title: 'Unique Paths', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/unique-paths/', tags: ['DP', 'Matrix'], xp: 100, category: 'DP', sheet: 'Blind 75' },
    { id: 'blind-61', title: 'Longest Common Subsequence', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/longest-common-subsequence/', tags: ['String', 'DP'], xp: 150, category: 'DP', sheet: 'Blind 75' },

    // Intervals
    { id: 'blind-62', title: 'Insert Interval', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/insert-interval/', tags: ['Array', 'Intervals'], xp: 125, category: 'Intervals', sheet: 'Blind 75' },
    { id: 'blind-63', title: 'Merge Intervals', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/merge-intervals/', tags: ['Array', 'Intervals'], xp: 125, category: 'Intervals', sheet: 'Blind 75' },
    { id: 'blind-64', title: 'Non-overlapping Intervals', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/non-overlapping-intervals/', tags: ['Array', 'Intervals'], xp: 150, category: 'Intervals', sheet: 'Blind 75' },
    { id: 'blind-65', title: 'Meeting Rooms', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/meeting-rooms/', tags: ['Array', 'Intervals'], xp: 75, category: 'Intervals', sheet: 'Blind 75' },
    { id: 'blind-66', title: 'Meeting Rooms II', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/meeting-rooms-ii/', tags: ['Array', 'Intervals', 'Heap'], xp: 150, category: 'Intervals', sheet: 'Blind 75' },

    // Math & Geometry
    { id: 'blind-67', title: 'Rotate Image', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/rotate-image/', tags: ['Array', 'Matrix'], xp: 125, category: 'Math', sheet: 'Blind 75' },
    { id: 'blind-68', title: 'Spiral Matrix', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/spiral-matrix/', tags: ['Array', 'Matrix'], xp: 125, category: 'Math', sheet: 'Blind 75' },
    { id: 'blind-69', title: 'Set Matrix Zeroes', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/set-matrix-zeroes/', tags: ['Array', 'Matrix'], xp: 125, category: 'Math', sheet: 'Blind 75' },

    // Bit Manipulation
    { id: 'blind-70', title: 'Number of 1 Bits', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/number-of-1-bits/', tags: ['Bit Manipulation'], xp: 50, category: 'Math', sheet: 'Blind 75' },
    { id: 'blind-71', title: 'Counting Bits', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/counting-bits/', tags: ['Bit Manipulation', 'DP'], xp: 75, category: 'Math', sheet: 'Blind 75' },
    { id: 'blind-72', title: 'Reverse Bits', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/reverse-bits/', tags: ['Bit Manipulation'], xp: 50, category: 'Math', sheet: 'Blind 75' },
    { id: 'blind-73', title: 'Missing Number', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/missing-number/', tags: ['Bit Manipulation', 'Math'], xp: 50, category: 'Math', sheet: 'Blind 75' },
    { id: 'blind-74', title: 'Sum of Two Integers', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/sum-of-two-integers/', tags: ['Bit Manipulation'], xp: 125, category: 'Math', sheet: 'Blind 75' },
    { id: 'blind-75', title: 'Reverse Integer', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/reverse-integer/', tags: ['Math'], xp: 100, category: 'Math', sheet: 'Blind 75' },

    // LINKED LIST ADVANCED
    { id: 'linked-1', title: 'Add Two Numbers', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/add-two-numbers/', tags: ['Linked List', 'Math'], xp: 125, category: 'LinkedList', sheet: 'FAANG' },
    { id: 'linked-2', title: 'Reverse Linked List II', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/reverse-linked-list-ii/', tags: ['Linked List'], xp: 125, category: 'LinkedList', sheet: 'FAANG' },
    { id: 'linked-3', title: 'Partition List', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/partition-list/', tags: ['Linked List'], xp: 125, category: 'LinkedList', sheet: 'FAANG' },
    { id: 'linked-4', title: 'Copy List with Random Pointer', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/copy-list-with-random-pointer/', tags: ['Linked List', 'Hash Table'], xp: 150, category: 'LinkedList', sheet: 'FAANG' },
    { id: 'linked-5', title: 'Rotate List', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/rotate-list/', tags: ['Linked List'], xp: 125, category: 'LinkedList', sheet: 'FAANG' },
    { id: 'linked-6', title: 'Swap Nodes in Pairs', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/swap-nodes-in-pairs/', tags: ['Linked List'], xp: 100, category: 'LinkedList', sheet: 'FAANG' },
    { id: 'linked-7', title: 'Remove Duplicates from Sorted List II', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/remove-duplicates-from-sorted-list-ii/', tags: ['Linked List'], xp: 125, category: 'LinkedList', sheet: 'FAANG' },
    { id: 'linked-8', title: 'Odd Even Linked List', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/odd-even-linked-list/', tags: ['Linked List'], xp: 100, category: 'LinkedList', sheet: 'FAANG' },
    { id: 'linked-9', title: 'Sort List', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/sort-list/', tags: ['Linked List', 'Merge Sort'], xp: 150, category: 'LinkedList', sheet: 'FAANG' },
    { id: 'linked-10', title: 'Insertion Sort List', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/insertion-sort-list/', tags: ['Linked List', 'Sorting'], xp: 125, category: 'LinkedList', sheet: 'FAANG' },
    { id: 'linked-11', title: 'Palindrome Linked List', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/palindrome-linked-list/', tags: ['Linked List', 'Two Pointers'], xp: 75, category: 'LinkedList', sheet: 'FAANG' },
    { id: 'linked-12', title: 'Middle of Linked List', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/middle-of-the-linked-list/', tags: ['Linked List', 'Two Pointers'], xp: 50, category: 'LinkedList', sheet: 'FAANG' },
    { id: 'linked-13', title: 'Intersection of Two Linked Lists', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/intersection-of-two-linked-lists/', tags: ['Linked List', 'Two Pointers'], xp: 75, category: 'LinkedList', sheet: 'FAANG' },
    { id: 'linked-14', title: 'Delete Node in a Linked List', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/delete-node-in-a-linked-list/', tags: ['Linked List'], xp: 50, category: 'LinkedList', sheet: 'FAANG' },
    { id: 'linked-15', title: 'Flatten a Multilevel Doubly Linked List', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/flatten-a-multilevel-doubly-linked-list/', tags: ['Linked List', 'DFS'], xp: 150, category: 'LinkedList', sheet: 'FAANG' },

    // HEAP / PRIORITY QUEUE
    { id: 'heap-1', title: 'Kth Largest Element in Array', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/kth-largest-element-in-an-array/', tags: ['Heap', 'Divide and Conquer'], xp: 125, category: 'Heap', sheet: 'FAANG' },
    { id: 'heap-2', title: 'Find K Closest Elements', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/find-k-closest-elements/', tags: ['Heap', 'Binary Search'], xp: 125, category: 'Heap', sheet: 'FAANG' },
    { id: 'heap-3', title: 'K Closest Points to Origin', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/k-closest-points-to-origin/', tags: ['Heap', 'Divide and Conquer'], xp: 125, category: 'Heap', sheet: 'FAANG' },
    { id: 'heap-4', title: 'Task Scheduler', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/task-scheduler/', tags: ['Heap', 'Greedy'], xp: 150, category: 'Heap', sheet: 'FAANG' },
    { id: 'heap-5', title: 'Reorganize String', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/reorganize-string/', tags: ['Heap', 'Greedy'], xp: 125, category: 'Heap', sheet: 'FAANG' },
    { id: 'heap-6', title: 'Ugly Number II', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/ugly-number-ii/', tags: ['Heap', 'DP'], xp: 125, category: 'Heap', sheet: 'FAANG' },
    { id: 'heap-7', title: 'Super Ugly Number', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/super-ugly-number/', tags: ['Heap', 'DP'], xp: 150, category: 'Heap', sheet: 'FAANG' },
    { id: 'heap-8', title: 'Kth Smallest Element in Sorted Matrix', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/', tags: ['Heap', 'Binary Search'], xp: 150, category: 'Heap', sheet: 'FAANG' },
    { id: 'heap-9', title: 'Smallest Range Covering Elements from K Lists', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/smallest-range-covering-elements-from-k-lists/', tags: ['Heap', 'Sliding Window'], xp: 200, category: 'Heap', sheet: 'FAANG' },
    { id: 'heap-10', title: 'IPO', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/ipo/', tags: ['Heap', 'Greedy'], xp: 200, category: 'Heap', sheet: 'FAANG' },

    // STACK & QUEUE
    { id: 'stack-1', title: 'Daily Temperatures', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/daily-temperatures/', tags: ['Stack', 'Monotonic Stack'], xp: 125, category: 'Stack', sheet: 'FAANG' },
    { id: 'stack-2', title: 'Car Fleet', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/car-fleet/', tags: ['Stack', 'Monotonic Stack'], xp: 150, category: 'Stack', sheet: 'FAANG' },
    { id: 'stack-3', title: 'Evaluate Reverse Polish Notation', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/evaluate-reverse-polish-notation/', tags: ['Stack', 'Math'], xp: 100, category: 'Stack', sheet: 'FAANG' },
    { id: 'stack-4', title: 'Generate Parentheses', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/generate-parentheses/', tags: ['Stack', 'Backtracking'], xp: 125, category: 'Stack', sheet: 'FAANG' },
    { id: 'stack-5', title: 'Asteroid Collision', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/asteroid-collision/', tags: ['Stack'], xp: 125, category: 'Stack', sheet: 'FAANG' },
    { id: 'stack-6', title: 'Remove K Digits', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/remove-k-digits/', tags: ['Stack', 'Greedy'], xp: 150, category: 'Stack', sheet: 'FAANG' },
    { id: 'stack-7', title: 'Decode String', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/decode-string/', tags: ['Stack', 'String'], xp: 125, category: 'Stack', sheet: 'FAANG' },
    { id: 'stack-8', title: 'Basic Calculator', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/basic-calculator/', tags: ['Stack', 'Math'], xp: 200, category: 'Stack', sheet: 'FAANG' },
    { id: 'stack-9', title: 'Basic Calculator II', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/basic-calculator-ii/', tags: ['Stack', 'Math'], xp: 150, category: 'Stack', sheet: 'FAANG' },
    { id: 'stack-10', title: 'Largest Rectangle in Histogram', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/largest-rectangle-in-histogram/', tags: ['Stack', 'Monotonic Stack'], xp: 200, category: 'Stack', sheet: 'FAANG' },
    { id: 'stack-11', title: 'Maximal Rectangle', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/maximal-rectangle/', tags: ['Stack', 'DP'], xp: 225, category: 'Stack', sheet: 'FAANG' },
    { id: 'stack-12', title: 'Trapping Rain Water', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/trapping-rain-water/', tags: ['Stack', 'Two Pointers'], xp: 200, category: 'Stack', sheet: 'FAANG' },
    { id: 'stack-13', title: 'Min Stack', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/min-stack/', tags: ['Stack', 'Design'], xp: 100, category: 'Stack', sheet: 'FAANG' },
    { id: 'stack-14', title: 'Simplify Path', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/simplify-path/', tags: ['Stack', 'String'], xp: 100, category: 'Stack', sheet: 'FAANG' },
    { id: 'stack-15', title: 'Next Greater Element I', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/next-greater-element-i/', tags: ['Stack', 'Monotonic Stack'], xp: 75, category: 'Stack', sheet: 'FAANG' },

    // SQL PROBLEMS
    { id: 'sql-1', title: 'Combine Two Tables', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/combine-two-tables/', tags: ['SQL', 'Join'], xp: 50, category: 'SQL', sheet: 'FAANG' },
    { id: 'sql-2', title: 'Second Highest Salary', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/second-highest-salary/', tags: ['SQL'], xp: 100, category: 'SQL', sheet: 'FAANG' },
    { id: 'sql-3', title: 'Nth Highest Salary', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/nth-highest-salary/', tags: ['SQL'], xp: 125, category: 'SQL', sheet: 'FAANG' },
    { id: 'sql-4', title: 'Rank Scores', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/rank-scores/', tags: ['SQL'], xp: 125, category: 'SQL', sheet: 'FAANG' },
    { id: 'sql-5', title: 'Consecutive Numbers', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/consecutive-numbers/', tags: ['SQL'], xp: 125, category: 'SQL', sheet: 'FAANG' },
    { id: 'sql-6', title: 'Employees Earning More Than Their Managers', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/employees-earning-more-than-their-managers/', tags: ['SQL', 'Join'], xp: 50, category: 'SQL', sheet: 'FAANG' },
    { id: 'sql-7', title: 'Duplicate Emails', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/duplicate-emails/', tags: ['SQL'], xp: 50, category: 'SQL', sheet: 'FAANG' },
    { id: 'sql-8', title: 'Customers Who Never Order', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/customers-who-never-order/', tags: ['SQL', 'Join'], xp: 50, category: 'SQL', sheet: 'FAANG' },
    { id: 'sql-9', title: 'Department Highest Salary', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/department-highest-salary/', tags: ['SQL', 'Join'], xp: 125, category: 'SQL', sheet: 'FAANG' },
    { id: 'sql-10', title: 'Department Top Three Salaries', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/department-top-three-salaries/', tags: ['SQL'], xp: 175, category: 'SQL', sheet: 'FAANG' },
    { id: 'sql-11', title: 'Delete Duplicate Emails', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/delete-duplicate-emails/', tags: ['SQL'], xp: 50, category: 'SQL', sheet: 'FAANG' },
    { id: 'sql-12', title: 'Rising Temperature', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/rising-temperature/', tags: ['SQL', 'Join'], xp: 75, category: 'SQL', sheet: 'FAANG' },

    // MORE INTERVAL PROBLEMS
    { id: 'interval-1', title: 'Interval List Intersections', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/interval-list-intersections/', tags: ['Array', 'Intervals'], xp: 125, category: 'Intervals', sheet: 'FAANG' },
    { id: 'interval-2', title: 'Minimum Number of Arrows to Burst Balloons', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons/', tags: ['Array', 'Intervals'], xp: 150, category: 'Intervals', sheet: 'FAANG' },
    { id: 'interval-3', title: 'Employee Free Time', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/employee-free-time/', tags: ['Heap', 'Intervals'], xp: 200, category: 'Intervals', sheet: 'FAANG' },
    { id: 'interval-4', title: 'Range Module', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/range-module/', tags: ['Design', 'Intervals'], xp: 225, category: 'Intervals', sheet: 'FAANG' },
    { id: 'interval-5', title: 'Data Stream as Disjoint Intervals', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/data-stream-as-disjoint-intervals/', tags: ['Design', 'Intervals'], xp: 200, category: 'Intervals', sheet: 'FAANG' },
    { id: 'interval-6', title: 'My Calendar I', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/my-calendar-i/', tags: ['Design', 'Intervals'], xp: 125, category: 'Intervals', sheet: 'FAANG' },
    { id: 'interval-7', title: 'My Calendar II', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/my-calendar-ii/', tags: ['Design', 'Intervals'], xp: 150, category: 'Intervals', sheet: 'FAANG' },
    { id: 'interval-8', title: 'My Calendar III', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/my-calendar-iii/', tags: ['Design', 'Intervals'], xp: 200, category: 'Intervals', sheet: 'FAANG' },

    // BACKTRACKING PROBLEMS
    { id: 'backtrack-1', title: 'Subsets', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/subsets/', tags: ['Backtracking', 'Array'], xp: 100, category: 'Array', sheet: 'Striver' },
    { id: 'backtrack-2', title: 'Subsets II', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/subsets-ii/', tags: ['Backtracking', 'Array'], xp: 125, category: 'Array', sheet: 'Striver' },
    { id: 'backtrack-3', title: 'Permutations', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/permutations/', tags: ['Backtracking'], xp: 125, category: 'Array', sheet: 'Striver' },
    { id: 'backtrack-4', title: 'Permutations II', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/permutations-ii/', tags: ['Backtracking'], xp: 150, category: 'Array', sheet: 'Striver' },
    { id: 'backtrack-5', title: 'Combination Sum II', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/combination-sum-ii/', tags: ['Backtracking'], xp: 150, category: 'Array', sheet: 'Striver' },
    { id: 'backtrack-6', title: 'Combination Sum III', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/combination-sum-iii/', tags: ['Backtracking'], xp: 125, category: 'Array', sheet: 'Striver' },
    { id: 'backtrack-7', title: 'Letter Combinations of Phone', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/letter-combinations-of-a-phone-number/', tags: ['Backtracking', 'String'], xp: 125, category: 'String', sheet: 'Striver' },
    { id: 'backtrack-8', title: 'Palindrome Partitioning', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/palindrome-partitioning/', tags: ['Backtracking', 'String', 'DP'], xp: 175, category: 'String', sheet: 'Striver' },
    { id: 'backtrack-9', title: 'N-Queens', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/n-queens/', tags: ['Backtracking'], xp: 200, category: 'Array', sheet: 'Striver' },
    { id: 'backtrack-10', title: 'N-Queens II', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/n-queens-ii/', tags: ['Backtracking'], xp: 200, category: 'Array', sheet: 'Striver' },
    { id: 'backtrack-11', title: 'Sudoku Solver', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/sudoku-solver/', tags: ['Backtracking', 'Matrix'], xp: 225, category: 'Array', sheet: 'Striver' },
    { id: 'backtrack-12', title: 'Restore IP Addresses', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/restore-ip-addresses/', tags: ['Backtracking', 'String'], xp: 150, category: 'String', sheet: 'FAANG' },

    // BINARY SEARCH PROBLEMS
    { id: 'bsearch-1', title: 'Binary Search', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/binary-search/', tags: ['Binary Search'], xp: 50, category: 'Array', sheet: 'Striver' },
    { id: 'bsearch-2', title: 'Search Insert Position', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/search-insert-position/', tags: ['Binary Search'], xp: 50, category: 'Array', sheet: 'Striver' },
    { id: 'bsearch-3', title: 'Find First and Last Position', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/', tags: ['Binary Search'], xp: 125, category: 'Array', sheet: 'Striver' },
    { id: 'bsearch-4', title: 'Search a 2D Matrix', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/search-a-2d-matrix/', tags: ['Binary Search', 'Matrix'], xp: 100, category: 'Array', sheet: 'Striver' },
    { id: 'bsearch-5', title: 'Search a 2D Matrix II', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/search-a-2d-matrix-ii/', tags: ['Binary Search', 'Matrix'], xp: 125, category: 'Array', sheet: 'Striver' },
    { id: 'bsearch-6', title: 'Median of Two Sorted Arrays', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/median-of-two-sorted-arrays/', tags: ['Binary Search'], xp: 225, category: 'Array', sheet: 'Striver' },
    { id: 'bsearch-7', title: 'Koko Eating Bananas', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/koko-eating-bananas/', tags: ['Binary Search'], xp: 150, category: 'Array', sheet: 'FAANG' },
    { id: 'bsearch-8', title: 'Split Array Largest Sum', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/split-array-largest-sum/', tags: ['Binary Search', 'DP'], xp: 200, category: 'Array', sheet: 'FAANG' },
    { id: 'bsearch-9', title: 'Capacity to Ship Packages', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/', tags: ['Binary Search'], xp: 150, category: 'Array', sheet: 'FAANG' },
    { id: 'bsearch-10', title: 'Aggressive Cows', difficulty: 'Hard', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/aggressive-cows/1', tags: ['Binary Search'], xp: 175, category: 'Array', sheet: 'Striver' },

    // MORE DP PROBLEMS
    { id: 'dp-extra-1', title: 'Edit Distance', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/edit-distance/', tags: ['DP', 'String'], xp: 175, category: 'DP', sheet: 'Striver' },
    { id: 'dp-extra-2', title: 'Regular Expression Matching', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/regular-expression-matching/', tags: ['DP', 'String'], xp: 225, category: 'DP', sheet: 'FAANG' },
    { id: 'dp-extra-3', title: 'Wildcard Matching', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/wildcard-matching/', tags: ['DP', 'String'], xp: 200, category: 'DP', sheet: 'FAANG' },
    { id: 'dp-extra-4', title: 'Interleaving String', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/interleaving-string/', tags: ['DP', 'String'], xp: 175, category: 'DP', sheet: 'FAANG' },
    { id: 'dp-extra-5', title: 'Distinct Subsequences', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/distinct-subsequences/', tags: ['DP', 'String'], xp: 200, category: 'DP', sheet: 'Striver' },
    { id: 'dp-extra-6', title: 'Best Time to Buy Stock III', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii/', tags: ['DP'], xp: 200, category: 'DP', sheet: 'Striver' },
    { id: 'dp-extra-7', title: 'Best Time to Buy Stock IV', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iv/', tags: ['DP'], xp: 225, category: 'DP', sheet: 'Striver' },
    { id: 'dp-extra-8', title: 'Partition Equal Subset Sum', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/partition-equal-subset-sum/', tags: ['DP'], xp: 150, category: 'DP', sheet: 'Striver' },
    { id: 'dp-extra-9', title: 'Target Sum', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/target-sum/', tags: ['DP', 'Backtracking'], xp: 150, category: 'DP', sheet: 'FAANG' },
    { id: 'dp-extra-10', title: 'Coin Change II', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/coin-change-ii/', tags: ['DP'], xp: 150, category: 'DP', sheet: 'Striver' },
    { id: 'dp-extra-11', title: 'Minimum Path Sum', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/minimum-path-sum/', tags: ['DP', 'Matrix'], xp: 125, category: 'DP', sheet: 'Striver' },
    { id: 'dp-extra-12', title: 'Unique Paths II', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/unique-paths-ii/', tags: ['DP', 'Matrix'], xp: 125, category: 'DP', sheet: 'Striver' },
    { id: 'dp-extra-13', title: 'Triangle', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/triangle/', tags: ['DP'], xp: 125, category: 'DP', sheet: 'Striver' },
    { id: 'dp-extra-14', title: 'Dungeon Game', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/dungeon-game/', tags: ['DP', 'Matrix'], xp: 200, category: 'DP', sheet: 'FAANG' },
    { id: 'dp-extra-15', title: 'Cherry Pickup', difficulty: 'Hard', platform: 'LeetCode', url: 'https://leetcode.com/problems/cherry-pickup/', tags: ['DP', 'Matrix'], xp: 225, category: 'DP', sheet: 'FAANG' },

    // LOVE BABBAR SHEET PROBLEMS
    { id: 'babbar-1', title: 'Reverse an Array', difficulty: 'Easy', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/reverse-an-array/0', tags: ['Array'], xp: 25, category: 'Array', sheet: 'Love Babbar' },
    { id: 'babbar-2', title: 'Find Max and Min', difficulty: 'Easy', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/find-minimum-and-maximum-element-in-an-array4428/1', tags: ['Array'], xp: 25, category: 'Array', sheet: 'Love Babbar' },
    { id: 'babbar-3', title: 'Kth Smallest Element', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/kth-smallest-element5635/1', tags: ['Array', 'Heap'], xp: 100, category: 'Array', sheet: 'Love Babbar' },
    { id: 'babbar-4', title: 'Sort 0s 1s 2s', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/sort-an-array-of-0s-1s-and-2s4231/1', tags: ['Array', 'Sorting'], xp: 75, category: 'Array', sheet: 'Love Babbar' },
    { id: 'babbar-5', title: 'Move Negative Elements', difficulty: 'Easy', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/move-all-negative-elements-to-end1813/1', tags: ['Array'], xp: 50, category: 'Array', sheet: 'Love Babbar' },
    { id: 'babbar-6', title: 'Find Union and Intersection', difficulty: 'Easy', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/union-of-two-arrays3538/1', tags: ['Array', 'Set'], xp: 50, category: 'Array', sheet: 'Love Babbar' },
    { id: 'babbar-7', title: 'Cyclically Rotate Array', difficulty: 'Easy', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/cyclically-rotate-an-array-by-one2614/1', tags: ['Array'], xp: 25, category: 'Array', sheet: 'Love Babbar' },
    { id: 'babbar-8', title: 'Minimize Heights II', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/minimize-the-heights3351/1', tags: ['Array', 'Greedy'], xp: 125, category: 'Array', sheet: 'Love Babbar' },
    { id: 'babbar-9', title: 'Minimum Jumps', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/minimum-number-of-jumps-1587115620/1', tags: ['Array', 'DP', 'Greedy'], xp: 125, category: 'Array', sheet: 'Love Babbar' },
    { id: 'babbar-10', title: 'Find Duplicate Number', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/find-the-duplicate-number/', tags: ['Array', 'Two Pointers'], xp: 125, category: 'Array', sheet: 'Love Babbar' },
    { id: 'babbar-11', title: 'Merge Without Extra Space', difficulty: 'Hard', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/merge-two-sorted-arrays-1587115620/1', tags: ['Array', 'Sorting'], xp: 150, category: 'Array', sheet: 'Love Babbar' },
    { id: 'babbar-12', title: 'Kadane\'s Algorithm', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/kadanes-algorithm-1587115620/1', tags: ['Array', 'DP'], xp: 100, category: 'Array', sheet: 'Love Babbar' },
    { id: 'babbar-13', title: 'Merge Overlapping Intervals', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/overlapping-intervals--170633/1', tags: ['Array', 'Intervals'], xp: 125, category: 'Intervals', sheet: 'Love Babbar' },
    { id: 'babbar-14', title: 'Next Permutation', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/next-permutation/', tags: ['Array'], xp: 125, category: 'Array', sheet: 'Love Babbar' },
    { id: 'babbar-15', title: 'Count Inversions', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/inversion-of-array-1587115620/1', tags: ['Array', 'Merge Sort'], xp: 150, category: 'Array', sheet: 'Love Babbar' },
  ];

  const loadProblems = useCallback(() => {
    setLoading(true);
    // Simulate loading
    setTimeout(() => {
      const problemsWithSubmissions = problemDatabase.map(p => ({ 
        ...p, 
        solved: Math.random() > 0.85 
      }));
      setProblems(problemsWithSubmissions);
      setLoading(false);
    }, 800);
    // problemDatabase is a stable constant, no need to include in deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadProblems();
  }, [authUser, loadProblems]);

  const filterProblems = useCallback(() => {
    let filtered = [...problems];

    // Platform filter
    if (selectedPlatform !== 'all') {
      filtered = filtered.filter(p => p.platform === selectedPlatform);
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(p => p.difficulty === selectedDifficulty);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Sheet filter
    if (selectedSheet !== 'all') {
      filtered = filtered.filter(p => p.sheet === selectedSheet);
    }

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(term) ||
        p.tags.some(tag => tag.toLowerCase().includes(term)) ||
        p.category.toLowerCase().includes(term)
      );
    }

    // Solved filter
    if (showSolvedOnly) {
      filtered = filtered.filter(p => p.solved);
    }

    // Tab filter
    if (activeTab === 'revision') {
      filtered = filtered.filter(p => p.needsRevision);
    } else if (activeTab === 'interview') {
      filtered = filtered.filter(p => p.companies && p.companies.length > 0);
      // Company filter within interview tab
      if (selectedCompany !== 'all') {
        filtered = filtered.filter(p => p.companies?.includes(selectedCompany));
      }
    }

    // Sorting
    if (sortBy === 'xp') {
      filtered.sort((a, b) => b.xp - a.xp);
    } else if (sortBy === 'difficulty') {
      const diffOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
      filtered.sort((a, b) => diffOrder[a.difficulty] - diffOrder[b.difficulty]);
    }

    setFilteredProblems(filtered);
  }, [problems, selectedPlatform, selectedDifficulty, selectedCategory, selectedSheet, searchTerm, showSolvedOnly, sortBy, activeTab, selectedCompany]);

  // Update useEffect to include new filter dependencies
  useEffect(() => {
    filterProblems();
  }, [filterProblems]);

  // Toggle revision status for a problem
  const toggleRevision = (problemId: string) => {
    setProblems(prev => prev.map(p => 
      p.id === problemId 
        ? { 
            ...p, 
            needsRevision: !p.needsRevision,
            revisionCount: p.needsRevision ? p.revisionCount : (p.revisionCount || 0) + 1,
            lastRevised: p.needsRevision ? p.lastRevised : new Date()
          }
        : p
    ));

    const problem = problems.find(p => p.id === problemId);
    if (problem) {
      dispatch({ type: 'ADD_NOTIFICATION', payload: {
        id: Date.now().toString(),
        type: 'achievement',
        title: problem.needsRevision ? 'Removed from Revision' : 'Added to Revision 📚',
        message: problem.needsRevision 
          ? `"${problem.title}" removed from revision list`
          : `"${problem.title}" marked for revision`,
        read: false,
        timestamp: new Date()
      }});
    }
  };

  const solveProblem = async (problemId: string) => {
    if (!authUser) return;

    const problem = problems.find(p => p.id === problemId);
    if (!problem || problem.solved) return;

    // Update local state
    setProblems(prev => prev.map(p => 
      p.id === problemId 
        ? { ...p, solved: true, solvedAt: new Date(), timeSpent: Math.floor(Math.random() * 60) + 15 }
        : p
    ));

    // Add XP and update stats
    dispatch({ type: 'ADD_XP', payload: { amount: problem.xp, source: `Solved ${problem.title}` } });
    dispatch({ type: 'SOLVE_PROBLEM', payload: { xp: problem.xp, difficulty: problem.difficulty, platform: problem.platform, topic: problem.tags[0] || 'General' } });

    // Update coding streak
    const newStreak = codingStats.currentStreak + 1;
    dispatch({ type: 'UPDATE_CODING_STATS', payload: { currentStreak: newStreak, totalSolved: codingStats.totalSolved + 1 } });

    // Show celebration
    setCelebrationData({ xp: problem.xp, streak: newStreak });
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);

    // Add notification
    dispatch({ type: 'ADD_NOTIFICATION', payload: {
      id: Date.now().toString(),
      type: 'achievement',
      title: 'Problem Solved! 🎉',
      message: `You solved "${problem.title}" and earned ${problem.xp} XP!`,
      timestamp: new Date(),
      read: false,
      priority: 'medium',
    }});
  };

  const unsolveProblem = async (problemId: string) => {
    if (!authUser) return;

    const problem = problems.find(p => p.id === problemId);
    if (!problem || !problem.solved) return;

    // Update local state - mark as unsolved
    setProblems(prev => prev.map(p => 
      p.id === problemId 
        ? { ...p, solved: false, solvedAt: undefined, timeSpent: undefined }
        : p
    ));

    // Deduct XP (reverse the XP gain)
    dispatch({ type: 'ADD_XP', payload: { amount: -problem.xp, source: `Unmarked ${problem.title}` } });

    // Update stats (decrease solved count)
    dispatch({ type: 'UPDATE_CODING_STATS', payload: { totalSolved: Math.max(0, codingStats.totalSolved - 1) } });

    // Add notification
    dispatch({ type: 'ADD_NOTIFICATION', payload: {
      id: Date.now().toString(),
      type: 'info',
      title: 'Problem Unmarked',
      message: `"${problem.title}" unmarked as solved. ${problem.xp} XP deducted.`,
      timestamp: new Date(),
      read: false,
      priority: 'low',
    }});
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'from-green-400 to-emerald-500';
      case 'Medium': return 'from-yellow-400 to-orange-500';
      case 'Hard': return 'from-red-400 to-pink-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'LeetCode': return 'from-orange-400 to-red-500';
      case 'GeeksforGeeks': return 'from-green-400 to-emerald-500';
      case 'CodeChef': return 'from-blue-400 to-cyan-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getSheetColor = (sheet?: string) => {
    switch (sheet) {
      case 'Striver': return 'from-purple-400 to-purple-600';
      case 'Love Babbar': return 'from-pink-400 to-pink-600';
      case 'FAANG': return 'from-indigo-400 to-indigo-600';
      case 'Blind 75': return 'from-cyan-400 to-cyan-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const stats = {
    totalSolved: problems.filter(p => p.solved).length,
    totalProblems: problems.length,
    easyCount: problems.filter(p => p.difficulty === 'Easy' && p.solved).length,
    mediumCount: problems.filter(p => p.difficulty === 'Medium' && p.solved).length,
    hardCount: problems.filter(p => p.difficulty === 'Hard' && p.solved).length,
    totalXP: problems.filter(p => p.solved).reduce((sum, p) => sum + p.xp, 0),
  };

  if (loading) {
    return (
      <div className={`p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-6 gap-4 mb-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 bg-[#0a0a0a] min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header - Neo Brutalist */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-1 sm:mb-2 font-mono">
            CODE_ARENA <span className="text-lime-400">🚀</span>
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-500 font-mono">
            // Master {problems.length}+ problems from top platforms
          </p>
        </div>

        {/* Enhanced Stats Overview - Neo Brutalist */}
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6 lg:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05, y: -2 }}
            className="p-2 sm:p-3 lg:p-4 brutal-card bg-gray-900 border-lime-500/50"
          >
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Trophy className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-lime-400" />
              <div>
                <div className="text-lg sm:text-xl lg:text-2xl font-black text-white font-mono">
                  {stats.totalSolved}
                </div>
                <div className="text-[10px] sm:text-xs text-gray-500 font-mono uppercase">
                  SOLVED
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.05, y: -2 }}
            className="p-2 sm:p-3 lg:p-4 brutal-card bg-gray-900 border-orange-500/50"
          >
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Flame className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-orange-400" />
              <div>
                <div className="text-lg sm:text-xl lg:text-2xl font-black text-white font-mono">
                  {codingStats.currentStreak}
                </div>
                <div className="text-[10px] sm:text-xs text-gray-500 font-mono uppercase">
                  STREAK
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05, y: -2 }}
            className="p-2 sm:p-3 lg:p-4 brutal-card bg-gray-900 border-cyan-500/50"
          >
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Target className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-cyan-400" />
              <div>
                <div className="text-lg sm:text-xl lg:text-2xl font-black text-white font-mono">
                  {codingStats.todaysSolved}
                </div>
                <div className="text-[10px] sm:text-xs text-gray-500 font-mono uppercase">
                  TODAY
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.05, y: -2 }}
            className="p-2 sm:p-3 lg:p-4 brutal-card bg-gray-900 border-lime-400/50"
          >
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 bg-lime-500 border border-black flex items-center justify-center text-black text-xs sm:text-sm font-black">
                E
              </div>
              <div>
                <div className="text-lg sm:text-xl lg:text-2xl font-black text-white font-mono">
                  {stats.easyCount}
                </div>
                <div className="text-[10px] sm:text-xs text-gray-500 font-mono uppercase">
                  EASY
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            className={`p-2 sm:p-3 lg:p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg border-l-4 border-yellow-400`}
          >
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold">
                M
              </div>
              <div>
                <div className={`text-lg sm:text-xl lg:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.mediumCount}
                </div>
                <div className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Medium
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
            className={`p-2 sm:p-3 lg:p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg border-l-4 border-red-400`}
          >
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold">
                H
              </div>
              <div>
                <div className={`text-lg sm:text-xl lg:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.hardCount}
                </div>
                <div className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Hard
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-4 sm:mb-6">
          <div className="flex gap-2 p-1 brutal-card bg-gray-900/80 rounded-xl">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setActiveTab('all'); setSelectedCompany('all'); }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'all'
                  ? 'bg-lime-500 text-black shadow-lg'
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Code className="w-4 h-4" />
              All Problems
              <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'all' ? 'bg-black/20' : 'bg-gray-700'}`}>
                {problems.length}
              </span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('revision')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'revision'
                  ? 'bg-orange-500 text-black shadow-lg'
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              Revision
              <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'revision' ? 'bg-black/20' : 'bg-gray-700'}`}>
                {problems.filter(p => p.needsRevision).length}
              </span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('interview')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'interview'
                  ? 'bg-cyan-500 text-black shadow-lg'
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Interview Prep
              <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'interview' ? 'bg-black/20' : 'bg-gray-700'}`}>
                {problems.filter(p => p.companies && p.companies.length > 0).length}
              </span>
            </motion.button>
          </div>
        </div>

        {/* Company Filter - Only visible in Interview tab */}
        {activeTab === 'interview' && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <div className="brutal-card bg-gray-900/80 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-5 h-5 text-cyan-400" />
                <span className="text-sm font-bold text-white">Filter by Company</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCompany('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedCompany === 'all'
                      ? 'bg-cyan-500 text-black'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  All Companies
                </motion.button>
                {companies.map((company) => (
                  <motion.button
                    key={company}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCompany(company)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selectedCompany === company
                        ? 'bg-cyan-500 text-black'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {company}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Enhanced Filters */}
        <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search problems..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 rounded-lg border text-sm sm:text-base ${
                darkMode
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
            />
          </div>

          {/* Filter Buttons - Scrollable on mobile */}
          <div className="space-y-3 sm:space-y-4">
            {/* Platform Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <span className={`text-xs sm:text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} self-center whitespace-nowrap`}>
                Platform:
              </span>
              {(['all', 'LeetCode', 'GeeksforGeeks', 'CodeChef'] as const).map((platform) => (
                <motion.button
                  key={platform}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedPlatform(platform)}
                  className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium capitalize transition-colors whitespace-nowrap ${
                    selectedPlatform === platform
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                      : darkMode
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {platform}
                </motion.button>
              ))}
            </div>

            {/* Difficulty Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <span className={`text-xs sm:text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} self-center whitespace-nowrap`}>
                Difficulty:
              </span>
              {(['all', 'Easy', 'Medium', 'Hard'] as const).map((difficulty) => (
                <motion.button
                  key={difficulty}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedDifficulty(difficulty)}
                  className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium capitalize transition-colors whitespace-nowrap ${
                    selectedDifficulty === difficulty
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                      : darkMode
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {difficulty}
                </motion.button>
              ))}
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <span className={`text-xs sm:text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} self-center whitespace-nowrap`}>
                Topic:
              </span>
              {(['all', 'Array', 'String', 'Tree', 'Graph', 'DP', 'Math', 'LinkedList', 'Heap', 'Stack', 'Design', 'SQL', 'Intervals'] as const).map((category) => (
                <motion.button
                  key={category}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium capitalize transition-colors whitespace-nowrap ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                      : darkMode
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {category}
                </motion.button>
              ))}
            </div>

            {/* Sheet Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <span className={`text-xs sm:text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} self-center whitespace-nowrap`}>
                Sheet:
              </span>
              {(['all', 'Striver', 'Love Babbar', 'FAANG', 'Blind 75'] as const).map((sheet) => (
                <motion.button
                  key={sheet}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedSheet(sheet)}
                  className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                    selectedSheet === sheet
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                      : darkMode
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {sheet}
                </motion.button>
              ))}
            </div>

            {/* Additional Controls Row */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {/* Sort By */}
              <div className="flex items-center gap-2">
                <span className={`text-xs sm:text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Sort:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'default' | 'xp' | 'difficulty')}
                  className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium border ${
                    darkMode
                      ? 'bg-gray-800 border-gray-700 text-gray-300'
                      : 'bg-white border-gray-300 text-gray-700'
                  } focus:ring-2 focus:ring-purple-500`}
                >
                  <option value="default">Default</option>
                  <option value="xp">XP (High to Low)</option>
                  <option value="difficulty">Difficulty</option>
                </select>
              </div>

              {/* Show Solved Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSolvedOnly(!showSolvedOnly)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  showSolvedOnly
                    ? 'bg-green-500 text-white'
                    : darkMode
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                Solved Only
              </motion.button>

              {/* Clear Filters Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedPlatform('all');
                  setSelectedDifficulty('all');
                  setSelectedCategory('all');
                  setSelectedSheet('all');
                  setSearchTerm('');
                  setShowSolvedOnly(false);
                  setSortBy('default');
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  darkMode
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    : 'bg-red-100 text-red-600 hover:bg-red-200'
                }`}
              >
                <Filter className="w-4 h-4" />
                Clear All
              </motion.button>
            </div>
          </div>
        </div>

        {/* Results Count & View Toggle */}
        <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Showing {filteredProblems.length} of {problems.length} problems • {stats.totalSolved} solved
          </p>
          <div className="flex items-center gap-2">
            <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              💡 Tip: Click a row to expand
            </span>
          </div>
        </div>

        {/* Compact Stacked List View */}
        <div className={`rounded-xl sm:rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl overflow-hidden`}>
          {/* Table Header */}
          <div className={`grid grid-cols-12 gap-2 px-4 py-3 ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <div className="col-span-1 text-center">#</div>
            <div className="col-span-4">Problem</div>
            <div className="col-span-2 text-center">Difficulty</div>
            <div className="col-span-2 text-center">Platform</div>
            <div className="col-span-1 text-center">XP</div>
            <div className="col-span-2 text-center">Actions</div>
          </div>

          {/* Problem Rows */}
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredProblems.map((problem, index) => (
              <motion.div
                key={problem.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(index * 0.02, 0.5) }}
                className={`grid grid-cols-12 gap-2 px-4 py-3 items-center transition-all duration-200 cursor-pointer
                  ${problem.solved 
                    ? darkMode ? 'bg-green-900/10 hover:bg-green-900/20' : 'bg-green-50 hover:bg-green-100'
                    : darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                  }
                `}
              >
                {/* Row Number & Status */}
                <div className="col-span-1 text-center">
                  {problem.solved ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                  ) : (
                    <span className={`text-sm font-medium ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {index + 1}
                    </span>
                  )}
                </div>

                {/* Problem Title & Tags */}
                <div className="col-span-4 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className={`font-medium truncate ${
                      problem.solved 
                        ? 'line-through opacity-60' 
                        : darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {problem.title}
                    </h4>
                    {problem.needsRevision && (
                      <span className="hidden sm:inline-flex px-1.5 py-0.5 text-xs rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                        📝 Revise
                      </span>
                    )}
                    {problem.sheet && (
                      <span className={`hidden lg:inline-flex px-1.5 py-0.5 text-xs rounded bg-gradient-to-r ${getSheetColor(problem.sheet)} text-white`}>
                        {problem.sheet}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {problem.tags.slice(0, 2).map(tag => (
                      <span
                        key={tag}
                        className={`px-1.5 py-0.5 rounded text-xs ${
                          darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                    {problem.tags.length > 2 && (
                      <span className={`px-1.5 py-0.5 rounded text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        +{problem.tags.length - 2}
                      </span>
                    )}
                    {problem.companies && problem.companies.length > 0 && (
                      <span className="px-1.5 py-0.5 rounded text-xs bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
                        <Building2 size={10} />
                        {problem.companies.slice(0, 2).join(', ')}
                        {problem.companies.length > 2 && ` +${problem.companies.length - 2}`}
                      </span>
                    )}
                  </div>
                </div>

                {/* Difficulty Badge */}
                <div className="col-span-2 text-center">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getDifficultyColor(problem.difficulty)} text-white`}>
                    {problem.difficulty}
                  </span>
                </div>

                {/* Platform Badge */}
                <div className="col-span-2 text-center">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getPlatformColor(problem.platform)} text-white`}>
                    {problem.platform === 'GeeksforGeeks' ? 'GFG' : problem.platform}
                  </span>
                </div>

                {/* XP */}
                <div className="col-span-1 text-center">
                  <span className={`font-bold text-sm ${problem.solved ? 'text-green-500' : 'text-yellow-500'}`}>
                    {problem.solved ? '✓' : ''}{problem.xp}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="col-span-2 flex justify-center gap-1">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => { e.stopPropagation(); window.open(problem.url, '_blank'); }}
                    className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                    title="Open Problem"
                  >
                    <ExternalLink size={14} />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => { e.stopPropagation(); toggleRevision(problem.id); }}
                    className={`p-2 rounded-lg transition-colors ${
                      problem.needsRevision
                        ? 'bg-orange-500 hover:bg-orange-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                    title={problem.needsRevision ? "Remove from Revision" : "Add to Revision"}
                  >
                    <RotateCcw size={14} />
                  </motion.button>
                  
                  {problem.solved ? (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => { e.stopPropagation(); unsolveProblem(problem.id); }}
                      className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
                      title="Undo - Mark as Unsolved"
                    >
                      <X size={14} />
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => { e.stopPropagation(); solveProblem(problem.id); }}
                      className="p-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors"
                      title="Mark as Solved"
                    >
                      <CheckCircle size={14} />
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Load More / Pagination hint */}
          {filteredProblems.length > 50 && (
            <div className={`px-4 py-3 text-center ${darkMode ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Showing all {filteredProblems.length} problems • Keep grinding! 💪
              </span>
            </div>
          )}
        </div>

        {/* Enhanced Celebration Modal */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0, rotateY: 180 }}
                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                exit={{ scale: 0.5, opacity: 0, rotateY: -180 }}
                transition={{ type: 'spring', duration: 0.8 }}
                className={`p-8 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-2xl text-center max-w-md mx-4`}
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  className="text-8xl mb-4"
                >
                  🎉
                </motion.div>
                
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className={`text-3xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}
                >
                  Problem Solved!
                </motion.h2>
                
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-3"
                >
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <Zap className="h-6 w-6 text-yellow-500" />
                      <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        +{celebrationData.xp} XP
                      </span>
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-center space-x-2">
                      <Flame className="h-6 w-6 text-orange-500" />
                      <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {celebrationData.streak} Day Streak!
                      </span>
                    </div>
                  </div>
                </motion.div>
                
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className={`text-lg mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
                >
                  You're on fire! Keep the momentum going! 🔥
                </motion.p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {filteredProblems.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Code className={`h-16 w-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              No problems found
            </h3>
            <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Try adjusting your filters or search terms
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}