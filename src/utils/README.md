# DevQuest Utilities

This directory contains core utility functions used throughout the DevQuest application.

## 📁 Files

### `logger.ts` - Centralized Logging System
**Purpose:** Environment-aware logging with structured output

**Key Features:**
- Different log levels (debug, info, warn, error)
- Specialized methods for game events (XP, streaks, achievements)
- Development-only debug logging
- In-memory log storage
- Export functionality

**Usage:**
```typescript
import { logger } from './utils/logger';

// XP events
logger.xp('gained', 100, 'task_completion');

// Level up
logger.levelUp(5, 6, 6500);

// Achievements
logger.achievement('First Task Complete');

// Errors
logger.error('Failed to save', 'DATA_SERVICE', error);
```

---

### `xpCalculations.ts` - XP System Utilities
**Purpose:** Single source of truth for all XP calculations

**Key Features:**
- XP constants and reward amounts
- Tier thresholds (Bronze → Legend)
- Level calculation from XP
- XP progress tracking
- Multiplier application
- Level-up detection

**Constants:**
```typescript
XP_CONSTANTS = {
  BASE_XP: 1000,
  GROWTH_RATE: 1.1,
  MIN_XP: 0,
  MAX_XP: 999999999,
  MIN_LEVEL: 1,
  MAX_LEVEL: 100,
}

XP_REWARDS = {
  TASK_EASY: 50,
  TASK_MEDIUM: 100,
  TASK_HARD: 200,
  TASK_ELITE: 500,
  PROBLEM_EASY: 30,
  PROBLEM_MEDIUM: 75,
  PROBLEM_HARD: 150,
  DAILY_LOGIN: 25,
  STREAK_BONUS: 10,
  CHALLENGE_COMPLETE: 300,
  ACHIEVEMENT_UNLOCK: 100,
}

TIER_THRESHOLDS = {
  Bronze: 0,
  Silver: 10,
  Gold: 25,
  Platinum: 50,
  Mythic: 75,
  Legend: 100,
}
```

**Usage:**
```typescript
import { 
  XP_REWARDS, 
  getXPForLevel, 
  calculateLevelFromXP,
  checkLevelUp 
} from './utils/xpCalculations';

// Use constants
const reward = XP_REWARDS.TASK_MEDIUM; // 100 XP

// Calculate level
const level = calculateLevelFromXP(5000);

// Check level up
const { leveledUp, newLevel } = checkLevelUp(4500, 5500);
```

---

### `errorHandlingEnhanced.ts` - Error Management
**Purpose:** Production-ready error handling with recovery strategies

**Key Features:**
- Custom error types (ValidationError, NetworkError, etc.)
- Retry logic with exponential backoff
- Safe execution wrappers
- Input validation
- Data sanitization
- Batched error reporting

**Error Types:**
- `AppError` - Base error class
- `ValidationError` - Input validation failures
- `NetworkError` - Network-related issues
- `AuthError` - Authentication failures
- `DataError` - Data integrity issues

**Usage:**
```typescript
import { 
  withRetry, 
  validateInput, 
  ValidationError 
} from './utils/errorHandlingEnhanced';

// Retry with backoff
const data = await withRetry(
  () => fetchData(),
  { maxRetries: 3, delay: 1000, backoff: true }
);

// Validate input
const validation = validateInput(email, 'email', { required: true });
if (!validation.valid) {
  throw new ValidationError(validation.error);
}

// Safe execution
const result = tryCatch(() => JSON.parse(data), {});
```

---

### `streakCalculations.ts` - Streak Logic
**Purpose:** Calculate and manage user streaks

**Key Features:**
- Daily streak tracking
- Timezone-aware calculations
- Streak milestone detection
- Streak recovery logic

**Usage:**
```typescript
import { calculateStreak, isStreakActive } from './utils/streakCalculations';

const streak = calculateStreak(lastActivityDate);
const active = isStreakActive(lastActivityDate);
```

---

### `dailyReset.ts` - Daily Reset Logic
**Purpose:** Handle daily resets and countdowns

**Key Features:**
- Reset time calculation
- Countdown timers
- Daily task reset
- Timezone handling

**Usage:**
```typescript
import { getDailyResetTime, shouldReset } from './utils/dailyReset';

const resetTime = getDailyResetTime();
if (shouldReset(lastResetDate)) {
  // Perform daily reset
}
```

---

### `performance.ts` - Performance Utilities
**Purpose:** Monitor and optimize application performance

**Key Features:**
- Performance tracking
- Memoization
- Debouncing
- Throttling
- Batch updates
- Memory management

**Usage:**
```typescript
import { 
  memoize, 
  debounce, 
  throttle, 
  PerformanceTracker 
} from './utils/performance';

// Memoize expensive function
const expensiveCalc = memoize((data) => {
  return data.reduce(/* complex calculation */);
});

// Debounce input
const debouncedSearch = debounce((query) => {
  searchAPI(query);
}, 300);

// Track performance
const endMeasure = PerformanceTracker.startMeasure('component_name');
// ... render component
endMeasure();
```

---

### `gameContent.ts` - Game Content Generation
**Purpose:** Generate badges, challenges, and achievements

**Key Features:**
- Dynamic badge generation
- Challenge creation
- Achievement unlocking
- Reward calculation

**Usage:**
```typescript
import { generateBadges, createChallenge } from './utils/gameContent';

const badges = generateBadges(userLevel, userXP);
const challenge = createChallenge('daily', difficulty);
```

---

## 🎯 Best Practices

### 1. Logging
- ✅ Use `logger` instead of `console.log`
- ✅ Provide context for all logs
- ✅ Use appropriate log levels
- ✅ Include relevant data

### 2. XP System
- ✅ Use constants instead of magic numbers
- ✅ Validate XP before applying
- ✅ Check for level-ups after XP changes
- ✅ Apply multipliers consistently

### 3. Error Handling
- ✅ Use custom error types
- ✅ Sanitize data before logging
- ✅ Provide recovery options
- ✅ Use retry logic for transient failures

### 4. Performance
- ✅ Memoize expensive calculations
- ✅ Debounce user inputs
- ✅ Throttle frequent events
- ✅ Clean up resources properly

## 🔧 Development

### Adding New Utilities
1. Create file in `src/utils/`
2. Export functions and types
3. Add tests in `src/utils/__tests__/`
4. Update this README
5. Add examples in `QUICK_REFERENCE.md`

### Testing Utilities
```bash
npm run test -- src/utils
```

### Linting
```bash
npm run lint -- src/utils
```

## 📚 Related Documentation
- [Full Improvements](../IMPROVEMENTS.md)
- [Quick Reference](../QUICK_REFERENCE.md)
- [Implementation Plan](../.agent/workflows/code-improvement-plan.md)

---

**Last Updated:** 2026-01-04  
**Maintainer:** DevQuest Team
