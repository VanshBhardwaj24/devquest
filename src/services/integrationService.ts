// Integration Service for external platforms
// This service manages connections to GitHub, LeetCode, VS Code, and Calendar

export interface GitHubStats {
  connected: boolean;
  username: string | null;
  totalCommits: number;
  totalPRs: number;
  totalContributions: number;
  streak: number;
  repositories: number;
  followers: number;
  following: number;
  contributionGraph: { date: string; count: number }[];
  recentActivity: { type: string; repo: string; message: string; date: Date }[];
  lastSynced: Date | null;
}

export interface LeetCodeStats {
  connected: boolean;
  username: string | null;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  ranking: number;
  contestRating: number;
  streak: number;
  recentSubmissions: { title: string; difficulty: string; date: Date; status: string }[];
  lastSynced: Date | null;
}

export interface VSCodeStats {
  connected: boolean;
  totalCodingTime: number; // in minutes
  todayCodingTime: number;
  weekCodingTime: number;
  topLanguages: { language: string; time: number; percentage: number }[];
  topProjects: { name: string; time: number }[];
  dailyAverage: number;
  productivityScore: number;
  lastSynced: Date | null;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  type: 'deadline' | 'reminder' | 'study' | 'interview' | 'meeting';
  xpReward: number;
  completed: boolean;
}

export interface CalendarStats {
  connected: boolean;
  provider: 'google' | 'outlook' | null;
  email: string | null;
  upcomingEvents: CalendarEvent[];
  todayEvents: CalendarEvent[];
  weekEvents: CalendarEvent[];
  lastSynced: Date | null;
}

export interface IntegrationState {
  github: GitHubStats;
  leetcode: LeetCodeStats;
  vscode: VSCodeStats;
  calendar: CalendarStats;
}

// Default states
const defaultGitHubStats: GitHubStats = {
  connected: false,
  username: null,
  totalCommits: 0,
  totalPRs: 0,
  totalContributions: 0,
  streak: 0,
  repositories: 0,
  followers: 0,
  following: 0,
  contributionGraph: [],
  recentActivity: [],
  lastSynced: null,
};

const defaultLeetCodeStats: LeetCodeStats = {
  connected: false,
  username: null,
  totalSolved: 0,
  easySolved: 0,
  mediumSolved: 0,
  hardSolved: 0,
  ranking: 0,
  contestRating: 0,
  streak: 0,
  recentSubmissions: [],
  lastSynced: null,
};

const defaultVSCodeStats: VSCodeStats = {
  connected: false,
  totalCodingTime: 0,
  todayCodingTime: 0,
  weekCodingTime: 0,
  topLanguages: [],
  topProjects: [],
  dailyAverage: 0,
  productivityScore: 0,
  lastSynced: null,
};

const defaultCalendarStats: CalendarStats = {
  connected: false,
  provider: null,
  email: null,
  upcomingEvents: [],
  todayEvents: [],
  weekEvents: [],
  lastSynced: null,
};

// Storage keys
const STORAGE_KEYS = {
  github: 'devquest_github_integration',
  leetcode: 'devquest_leetcode_integration',
  vscode: 'devquest_vscode_integration',
  calendar: 'devquest_calendar_integration',
};

// Load integration state from localStorage
export function loadIntegrationState(): IntegrationState {
  const github = localStorage.getItem(STORAGE_KEYS.github);
  const leetcode = localStorage.getItem(STORAGE_KEYS.leetcode);
  const vscode = localStorage.getItem(STORAGE_KEYS.vscode);
  const calendar = localStorage.getItem(STORAGE_KEYS.calendar);

  return {
    github: github ? JSON.parse(github) : defaultGitHubStats,
    leetcode: leetcode ? JSON.parse(leetcode) : defaultLeetCodeStats,
    vscode: vscode ? JSON.parse(vscode) : defaultVSCodeStats,
    calendar: calendar ? JSON.parse(calendar) : defaultCalendarStats,
  };
}

// Save integration state to localStorage
export function saveIntegrationState(state: Partial<IntegrationState>): void {
  if (state.github) {
    localStorage.setItem(STORAGE_KEYS.github, JSON.stringify(state.github));
  }
  if (state.leetcode) {
    localStorage.setItem(STORAGE_KEYS.leetcode, JSON.stringify(state.leetcode));
  }
  if (state.vscode) {
    localStorage.setItem(STORAGE_KEYS.vscode, JSON.stringify(state.vscode));
  }
  if (state.calendar) {
    localStorage.setItem(STORAGE_KEYS.calendar, JSON.stringify(state.calendar));
  }
}

// GitHub OAuth URL generator
export function getGitHubAuthUrl(): string {
  const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID || 'your_github_client_id';
  const redirectUri = `${window.location.origin}/auth/github/callback`;
  const scope = 'read:user repo';
  return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
}

// Google Calendar OAuth URL generator
export function getGoogleCalendarAuthUrl(): string {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your_google_client_id';
  const redirectUri = `${window.location.origin}/auth/google/callback`;
  const scope = 'https://www.googleapis.com/auth/calendar.readonly';
  return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline`;
}

// Simulate GitHub data fetch (replace with real API calls)
export async function fetchGitHubStats(_accessToken: string): Promise<GitHubStats> {
  // In production, this would call GitHub's GraphQL API
  // For now, we simulate the response
  
  // Simulated API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generate contribution graph for last 365 days
  const contributionGraph: { date: string; count: number }[] = [];
  const today = new Date();
  for (let i = 365; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    contributionGraph.push({
      date: date.toISOString().split('T')[0],
      count: Math.floor(Math.random() * 10),
    });
  }

  return {
    connected: true,
    username: 'developer',
    totalCommits: Math.floor(Math.random() * 1000) + 500,
    totalPRs: Math.floor(Math.random() * 100) + 20,
    totalContributions: Math.floor(Math.random() * 2000) + 1000,
    streak: Math.floor(Math.random() * 30) + 5,
    repositories: Math.floor(Math.random() * 50) + 10,
    followers: Math.floor(Math.random() * 200) + 50,
    following: Math.floor(Math.random() * 100) + 30,
    contributionGraph,
    recentActivity: [
      { type: 'commit', repo: 'devquest', message: 'Add new feature', date: new Date() },
      { type: 'pr', repo: 'open-source-lib', message: 'Fix bug in parser', date: new Date(Date.now() - 86400000) },
      { type: 'commit', repo: 'portfolio', message: 'Update styles', date: new Date(Date.now() - 172800000) },
    ],
    lastSynced: new Date(),
  };
}

// Simulate LeetCode data fetch (replace with real API/scraping)
export async function fetchLeetCodeStats(username: string): Promise<LeetCodeStats> {
  // In production, this would scrape LeetCode or use unofficial API
  await new Promise(resolve => setTimeout(resolve, 1000));

  const easy = Math.floor(Math.random() * 200) + 50;
  const medium = Math.floor(Math.random() * 150) + 30;
  const hard = Math.floor(Math.random() * 50) + 10;

  return {
    connected: true,
    username,
    totalSolved: easy + medium + hard,
    easySolved: easy,
    mediumSolved: medium,
    hardSolved: hard,
    ranking: Math.floor(Math.random() * 100000) + 10000,
    contestRating: Math.floor(Math.random() * 500) + 1500,
    streak: Math.floor(Math.random() * 20) + 1,
    recentSubmissions: [
      { title: 'Two Sum', difficulty: 'Easy', date: new Date(), status: 'Accepted' },
      { title: 'Add Two Numbers', difficulty: 'Medium', date: new Date(Date.now() - 86400000), status: 'Accepted' },
      { title: 'Longest Substring', difficulty: 'Medium', date: new Date(Date.now() - 172800000), status: 'Accepted' },
      { title: 'Median of Two Sorted Arrays', difficulty: 'Hard', date: new Date(Date.now() - 259200000), status: 'Accepted' },
    ],
    lastSynced: new Date(),
  };
}

// Simulate VS Code extension data (would connect via WebSocket in production)
export async function fetchVSCodeStats(): Promise<VSCodeStats> {
  await new Promise(resolve => setTimeout(resolve, 500));

  return {
    connected: true,
    totalCodingTime: Math.floor(Math.random() * 10000) + 5000,
    todayCodingTime: Math.floor(Math.random() * 300) + 60,
    weekCodingTime: Math.floor(Math.random() * 2000) + 500,
    topLanguages: [
      { language: 'TypeScript', time: 1200, percentage: 40 },
      { language: 'JavaScript', time: 900, percentage: 30 },
      { language: 'Python', time: 450, percentage: 15 },
      { language: 'CSS', time: 300, percentage: 10 },
      { language: 'HTML', time: 150, percentage: 5 },
    ],
    topProjects: [
      { name: 'devquest', time: 800 },
      { name: 'portfolio', time: 400 },
      { name: 'side-project', time: 300 },
    ],
    dailyAverage: 180,
    productivityScore: Math.floor(Math.random() * 30) + 70,
    lastSynced: new Date(),
  };
}

// Simulate Calendar events fetch
export async function fetchCalendarEvents(provider: 'google' | 'outlook'): Promise<CalendarStats> {
  await new Promise(resolve => setTimeout(resolve, 800));

  const generateEvent = (daysFromNow: number, type: CalendarEvent['type']): CalendarEvent => {
    const start = new Date();
    start.setDate(start.getDate() + daysFromNow);
    start.setHours(10 + Math.floor(Math.random() * 8), 0, 0, 0);
    
    const end = new Date(start);
    end.setHours(start.getHours() + 1);

    const titles: Record<CalendarEvent['type'], string[]> = {
      deadline: ['Project Deadline', 'Submit Assignment', 'Code Review Due'],
      reminder: ['Study Session', 'Practice DSA', 'Read Documentation'],
      study: ['React Course', 'System Design Study', 'Algorithm Practice'],
      interview: ['Technical Interview', 'HR Round', 'Final Interview'],
      meeting: ['Team Standup', 'Sprint Planning', '1:1 with Manager'],
    };

    return {
      id: `event-${Date.now()}-${Math.random()}`,
      title: titles[type][Math.floor(Math.random() * titles[type].length)],
      description: `${type} event`,
      startDate: start,
      endDate: end,
      type,
      xpReward: type === 'interview' ? 200 : type === 'deadline' ? 150 : 50,
      completed: false,
    };
  };

  const todayEvents = [
    generateEvent(0, 'study'),
    generateEvent(0, 'reminder'),
  ];

  const weekEvents = [
    ...todayEvents,
    generateEvent(1, 'deadline'),
    generateEvent(2, 'meeting'),
    generateEvent(3, 'study'),
    generateEvent(5, 'interview'),
  ];

  return {
    connected: true,
    provider,
    email: provider === 'google' ? 'user@gmail.com' : 'user@outlook.com',
    upcomingEvents: weekEvents.filter(e => e.startDate > new Date()),
    todayEvents,
    weekEvents,
    lastSynced: new Date(),
  };
}

// Calculate XP from integrations
export function calculateIntegrationXP(state: IntegrationState): number {
  let xp = 0;

  // GitHub XP
  if (state.github.connected) {
    xp += state.github.totalCommits * 2;
    xp += state.github.totalPRs * 10;
    xp += state.github.streak * 25;
  }

  // LeetCode XP
  if (state.leetcode.connected) {
    xp += state.leetcode.easySolved * 10;
    xp += state.leetcode.mediumSolved * 25;
    xp += state.leetcode.hardSolved * 50;
    xp += state.leetcode.streak * 20;
  }

  // VS Code XP (1 XP per minute of coding)
  if (state.vscode.connected) {
    xp += Math.floor(state.vscode.totalCodingTime / 10);
  }

  return xp;
}

// Disconnect integration
export function disconnectIntegration(type: keyof IntegrationState): void {
  switch (type) {
    case 'github':
      localStorage.removeItem(STORAGE_KEYS.github);
      break;
    case 'leetcode':
      localStorage.removeItem(STORAGE_KEYS.leetcode);
      break;
    case 'vscode':
      localStorage.removeItem(STORAGE_KEYS.vscode);
      break;
    case 'calendar':
      localStorage.removeItem(STORAGE_KEYS.calendar);
      break;
  }
}
