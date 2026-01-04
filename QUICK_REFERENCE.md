# DevQuest - Quick Reference Guide

## 🚀 Common Tasks

### Logging
```typescript
import { logger } from './utils/logger';

// XP events
logger.xp('gained', 100, 'task_completion');
logger.xp('spent', -50, 'reward_purchase');

// Level up
logger.levelUp(5, 6, 6500);

// Achievements
logger.achievement('First Task Complete', { taskId: '123' });

// Streaks
logger.streak('updated', { currentStreak: 7, longestStreak: 10 });

// Tasks
logger.taskComplete('task-123', 'Complete project', 100);

// Auth
logger.auth('Sign in successful', 'user@example.com');

// API calls
logger.api('GET', '/api/users', 200);
logger.api('POST', '/api/tasks', undefined, error);

// General
logger.debug('Debug info', 'CONTEXT', data);
logger.info('Info message', 'CONTEXT', data);
logger.warn('Warning message', 'CONTEXT', data);
logger.error('Error message', 'CONTEXT', error);
```

### XP System
```typescript
import { 
  XP_CONSTANTS, 
  XP_REWARDS, 
  TIER_THRESHOLDS,
  getXPForLevel,
  calculateLevelFromXP,
  calculateXPProgress,
  validateXP,
  applyXPMultiplier,
  getTierFromLevel,
  checkLevelUp,
  calculateStreakBonus
} from './utils/xpCalculations';

// Use constants
const taskReward = XP_REWARDS.TASK_MEDIUM; // 100 XP
const dailyBonus = XP_REWARDS.DAILY_LOGIN; // 25 XP

// Calculate XP for level
const xpNeeded = getXPForLevel(10); // XP needed for level 10

// Get level from XP
const level = calculateLevelFromXP(5000);

// Get progress info
const progress = calculateXPProgress(5000, 5);
// Returns: { levelXP, neededXP, progress, xpToNext }

// Validate XP
const safeXP = validateXP(userInput); // Ensures valid range

// Apply multiplier
const bonusXP = applyXPMultiplier(100, 2.5); // 250 XP (capped at 10x)

// Get tier
const tier = getTierFromLevel(30); // 'Gold'

// Check level up
const levelUpInfo = checkLevelUp(4500, 5500);
// Returns: { leveledUp: true, oldLevel: 5, newLevel: 6, levelsGained: 1 }

// Calculate streak bonus
const bonus = calculateStreakBonus(7); // 70 XP (7 days * 10)
```

### Error Handling
```typescript
import { 
  withRetry,
  tryCatch,
  tryCatchAsync,
  validateInput,
  ValidationError,
  NetworkError,
  AuthError,
  DataError,
  getErrorMessage,
  isRecoverableError
} from './utils/errorHandlingEnhanced';

// Retry with exponential backoff
const data = await withRetry(
  () => fetchData(),
  { maxRetries: 3, delay: 1000, backoff: true, context: 'FETCH_DATA' }
);

// Safe execution
const result = tryCatch(
  () => JSON.parse(data),
  {},
  'JSON_PARSE'
);

// Async safe execution
const user = await tryCatchAsync(
  () => fetchUser(id),
  null,
  'FETCH_USER'
);

// Validate input
const emailValidation = validateInput(email, 'email', { required: true });
if (!emailValidation.valid) {
  throw new ValidationError(emailValidation.error, 'SIGNUP');
}

const ageValidation = validateInput(age, 'number', { min: 18, max: 120 });

// Throw custom errors
throw new ValidationError('Invalid email format', 'FORM');
throw new NetworkError('Failed to connect', 'API');
throw new AuthError('Invalid credentials', 'LOGIN');
throw new DataError('Corrupted data', 'STORAGE');

// Get user-friendly message
const message = getErrorMessage(error);

// Check if recoverable
if (isRecoverableError(error)) {
  // Retry or show retry option
}
```

### Using Hooks

#### useXPSystem
```typescript
import { useXPSystem } from './hooks/useXPSystem';

function MyComponent() {
  const {
    // Data
    currentXP,
    currentLevel,
    xpToNextLevel,
    totalXPEarned,
    xpMultiplier,
    bonusXPActive,
    progress,
    stats,
    
    // Actions
    addXP,
    spendXP,
    convertXPToGold,
    activateBonusXP,
    calculateXPForAction,
  } = useXPSystem();
  
  // Add XP
  addXP(100, 'task_completion');
  addXP(50, 'daily_login', 2); // With 2x multiplier
  
  // Spend XP
  const success = spendXP(200, 'reward_purchase');
  
  // Convert to gold
  convertXPToGold(1000); // Converts to 100 gold
  
  // Activate bonus
  activateBonusXP(2, 60); // 2x for 60 minutes
  
  // Calculate XP for action
  const xp = calculateXPForAction('task_completion', 'Hard');
  
  return (
    <div>
      <p>Level: {currentLevel}</p>
      <p>XP: {currentXP} / {xpToNextLevel}</p>
      <p>Progress: {progress.progress}%</p>
    </div>
  );
}
```

#### useAuth
```typescript
import { useAuth } from './hooks/useAuth';

function AuthComponent() {
  const {
    user,
    loading,
    error,
    isDemoMode,
    signUp,
    signIn,
    signOut,
    resetPassword,
    demoLogin,
  } = useAuth();
  
  const handleSignUp = async () => {
    const { data, error } = await signUp(email, password);
    if (error) {
      // Handle error
    }
  };
  
  const handleSignIn = async () => {
    const { data, error } = await signIn(email, password);
    if (error) {
      // Handle error
    }
  };
  
  const handleSignOut = async () => {
    await signOut();
  };
  
  const handleDemo = () => {
    demoLogin();
  };
  
  return (
    <div>
      {user ? (
        <button onClick={handleSignOut}>Sign Out</button>
      ) : (
        <>
          <button onClick={handleSignIn}>Sign In</button>
          <button onClick={handleDemo}>Demo Mode</button>
        </>
      )}
    </div>
  );
}
```

## 📋 Cheat Sheet

### XP Rewards
| Action | XP Reward |
|--------|-----------|
| Easy Task | 50 |
| Medium Task | 100 |
| Hard Task | 200 |
| Elite Task | 500 |
| Easy Problem | 30 |
| Medium Problem | 75 |
| Hard Problem | 150 |
| Daily Login | 25 |
| Streak Bonus | 10/day |
| Challenge Complete | 300 |
| Achievement | 100 |

### Tier Thresholds
| Tier | Level Required |
|------|----------------|
| Bronze | 0 |
| Silver | 10 |
| Gold | 25 |
| Platinum | 50 |
| Mythic | 75 |
| Legend | 100 |

### Log Levels
| Level | When to Use | Production |
|-------|-------------|------------|
| debug | Detailed debugging | ❌ Hidden |
| info | General information | ✅ Shown |
| warn | Potential issues | ✅ Shown |
| error | Errors and failures | ✅ Shown |

### Validation Types
| Type | Example | Options |
|------|---------|---------|
| string | 'hello' | min, max, pattern |
| number | 42 | min, max |
| boolean | true | - |
| email | 'user@example.com' | - |

## 🎯 Best Practices

### DO ✅
- Use logger instead of console.log
- Use XP constants instead of magic numbers
- Validate user input before processing
- Handle errors with try-catch
- Use retry logic for API calls
- Sanitize data before logging
- Provide context in logs
- Use custom error types

### DON'T ❌
- Use console.log in production code
- Hard-code XP values
- Trust user input without validation
- Ignore errors silently
- Log sensitive data (passwords, tokens)
- Use generic error messages
- Skip error handling

## 🔧 Development Commands

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Run tests
npm run test

# Preview production build
npm run preview
```

## 📚 File Structure

```
src/
├── utils/
│   ├── logger.ts                    # Logging utility
│   ├── xpCalculations.ts            # XP system
│   ├── errorHandlingEnhanced.ts     # Error handling
│   ├── streakCalculations.ts        # Streak logic
│   ├── dailyReset.ts                # Daily reset
│   └── performance.ts               # Performance utils
├── hooks/
│   ├── useXPSystem.ts               # XP hook
│   ├── useAuth.tsx                  # Auth hook
│   └── useUniversalXP.ts            # Universal XP
├── services/
│   ├── appDataService.ts            # App data
│   ├── progressionService.ts        # Progression
│   └── ...
└── contexts/
    ├── AppContext.tsx               # Main context
    └── AppContext.refactored.tsx    # Refactored (use this!)
```

## 🐛 Debugging

### View Recent Logs
```typescript
import { logger } from './utils/logger';

// Get last 50 logs
const recentLogs = logger.getRecentLogs(50);
console.table(recentLogs);

// Get errors only
const errors = logger.getLogsByLevel('error');

// Export all logs
const logsJson = logger.exportLogs();
```

### Performance Tracking
```typescript
import { logger } from './utils/logger';

const start = performance.now();
// ... your code ...
const end = performance.now();
logger.performance('operation_name', end - start);
```

---

**Quick Links:**
- [Full Improvements Doc](./IMPROVEMENTS.md)
- [Implementation Plan](./.agent/workflows/code-improvement-plan.md)
- [Architecture README](./src/README.md)
