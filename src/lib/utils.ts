import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date and time utilities
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }).format(d);
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d);
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', { 
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(d);
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
  if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
  if (weeks > 0) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'just now';
}

export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

export function getYesterdayDateString(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

export function getDaysBetween(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  const diff = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function isToday(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return d.toDateString() === today.toDateString();
}

export function isYesterday(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return d.toDateString() === yesterday.toDateString();
}

export function isThisWeek(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  return d >= weekAgo && d <= today;
}

export function isThisMonth(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
}

// Time formatting utilities
export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

export function formatDurationShort(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}

export function formatCountdown(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatCountdownShort(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

// Number formatting utilities
export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatPercentage(value: number, total: number): string {
  if (total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
}

export function formatPercentageDecimal(value: number, total: number, decimals: number = 1): string {
  if (total === 0) return '0%';
  return `${((value / total) * 100).toFixed(decimals)}%`;
}

// XP and level utilities
export function calculateXPForLevel(level: number): number {
  return Math.floor(1000 * Math.pow(1.1, level - 1));
}

export function calculateLevelFromXP(totalXP: number): number {
  let level = 1;
  let cumulativeXP = 0;
  
  while (true) {
    const xpNeeded = calculateXPForLevel(level + 1);
    if (cumulativeXP + xpNeeded > totalXP) break;
    cumulativeXP += xpNeeded;
    level++;
  }
  return level;
}

export function calculateXPToNextLevel(currentXP: number, currentLevel: number): number {
  return calculateXPForLevel(currentLevel + 1);
}

export function calculateXPProgress(currentXP: number, currentLevel: number): {
  levelXP: number;
  neededXP: number;
  progress: number;
} {
  const xpForCurrentLevel = calculateXPForLevel(currentLevel);
  const xpForNextLevel = calculateXPForLevel(currentLevel + 1);
  const levelXP = Math.max(0, currentXP - xpForCurrentLevel);
  const neededXP = xpForNextLevel - xpForCurrentLevel;
  const progress = Math.min(Math.max((levelXP / neededXP) * 100, 0), 100);
  
  return { levelXP, neededXP, progress };
}

export function calculateTier(xp: number): 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Mythic' | 'Legend' {
  if (xp >= 100000) return 'Legend';
  if (xp >= 50000) return 'Mythic';
  if (xp >= 30000) return 'Platinum';
  if (xp >= 15000) return 'Gold';
  if (xp >= 5000) return 'Silver';
  return 'Bronze';
}

// Streak utilities
export function calculateStreak(lastActivityDate: string | Date, currentStreak: number = 0): {
  newStreak: number;
  streakBroken: boolean;
  streakContinued: boolean;
} {
  if (!lastActivityDate) {
    return { newStreak: 1, streakBroken: false, streakContinued: false };
  }

  const lastDate = typeof lastActivityDate === 'string' ? new Date(lastActivityDate) : lastActivityDate;
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Normalize to just dates (remove time)
  const lastDateOnly = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const daysDiff = Math.floor((todayOnly.getTime() - lastDateOnly.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff === 0) {
    return { newStreak: currentStreak, streakBroken: false, streakContinued: true };
  } else if (daysDiff === 1) {
    return { newStreak: currentStreak + 1, streakBroken: false, streakContinued: true };
  } else {
    return { newStreak: 1, streakBroken: true, streakContinued: false };
  }
}

export function getStreakMultiplier(streak: number): number {
  return 1 + (streak * 0.1);
}

export function getStreakBonusXP(streak: number): number {
  if (streak < 7) return 0;
  if (streak < 30) return 50;
  if (streak < 100) return 200;
  return 500;
}

// Color and styling utilities
export function getRarityColor(rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic'): string {
  const colors = {
    common: 'text-gray-400',
    rare: 'text-blue-400',
    epic: 'text-purple-400',
    legendary: 'text-yellow-400',
    mythic: 'text-pink-400',
  };
  return colors[rarity] || colors.common;
}

export function getRarityBgColor(rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic'): string {
  const colors = {
    common: 'bg-gray-500/20',
    rare: 'bg-blue-500/20',
    epic: 'bg-purple-500/20',
    legendary: 'bg-yellow-500/20',
    mythic: 'bg-pink-500/20',
  };
  return colors[rarity] || colors.common;
}

export function getTierColor(tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Mythic' | 'Legend'): string {
  const colors = {
    Bronze: 'text-orange-400',
    Silver: 'text-gray-300',
    Gold: 'text-yellow-400',
    Platinum: 'text-cyan-400',
    Mythic: 'text-purple-400',
    Legend: 'text-red-400',
  };
  return colors[tier] || colors.Bronze;
}

export function getDifficultyColor(difficulty: 'Easy' | 'Medium' | 'Hard' | 'Elite'): string {
  const colors = {
    Easy: 'text-green-400',
    Medium: 'text-yellow-400',
    Hard: 'text-orange-400',
    Elite: 'text-red-400',
  };
  return colors[difficulty] || colors.Easy;
}

export function getPriorityColor(priority: 'Elite' | 'Core' | 'Bonus'): string {
  const colors = {
    Elite: 'text-red-400',
    Core: 'text-cyan-400',
    Bonus: 'text-lime-400',
  };
  return colors[priority] || colors.Core;
}

// Array and object utilities
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const group = String(item[key]);
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

export function sortBy<T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

export function uniqueBy<T>(array: T[], key: keyof T): T[] {
  const seen = new Set();
  return array.filter(item => {
    const val = item[key];
    if (seen.has(val)) return false;
    seen.add(val);
    return true;
  });
}

export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// String utilities
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function camelToTitle(str: string): string {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Validation utilities
export function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isValidDate(date: unknown): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

// Storage utilities
export function getLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setLocalStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

export function removeLocalStorage(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
}

// Debounce and throttle utilities
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Random utilities
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function randomChoices<T>(array: T[], count: number): T[] {
  const shuffled = shuffle([...array]);
  return shuffled.slice(0, count);
}

// Math utilities
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

// Async utilities
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxAttempts - 1) {
        await sleep(delay * (i + 1));
      }
    }
  }
  throw lastError!;
}

// Export all utilities
export const utils = {
  date: {
    formatDate,
    formatDateTime,
    formatTime,
    formatRelativeTime,
    getTodayDateString,
    getYesterdayDateString,
    getDaysBetween,
    isToday,
    isYesterday,
    isThisWeek,
    isThisMonth,
  },
  time: {
    formatDuration,
    formatDurationShort,
    formatCountdown,
    formatCountdownShort,
  },
  number: {
    formatNumber,
    formatCurrency,
    formatPercentage,
    formatPercentageDecimal,
  },
  xp: {
    calculateXPForLevel,
    calculateLevelFromXP,
    calculateXPToNextLevel,
    calculateXPProgress,
    calculateTier,
  },
  streak: {
    calculateStreak,
    getStreakMultiplier,
    getStreakBonusXP,
  },
  color: {
    getRarityColor,
    getRarityBgColor,
    getTierColor,
    getDifficultyColor,
    getPriorityColor,
  },
  array: {
    groupBy,
    sortBy,
    uniqueBy,
    chunk,
    shuffle,
  },
  string: {
    truncate,
    capitalize,
    camelToTitle,
    slugify,
  },
  validation: {
    isValidEmail,
    isValidUrl,
    isValidDate,
  },
  storage: {
    getLocalStorage,
    setLocalStorage,
    removeLocalStorage,
  },
  async: {
    debounce,
    throttle,
  },
  random: {
    randomInt,
    randomFloat,
    randomChoice,
    randomChoices,
  },
  math: {
    clamp,
    lerp,
    mapRange,
  },
  asyncUtils: {
    sleep,
    retry,
  },
};
