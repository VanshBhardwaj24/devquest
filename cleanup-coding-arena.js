const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'Coding', 'CodingArena.tsx');

console.log('Reading file...');
let content = fs.readFileSync(filePath, 'utf8');

console.log('Cleaning up problem database...');

// Find the problem database section
const dbStart = content.indexOf('const problemDatabase:');
const dbEnd = content.indexOf('];', dbStart) + 2;

if (dbStart === -1 || dbEnd === 1) {
  console.error('Could not find problem database section');
  process.exit(1);
}

// Extract before and after
const before = content.substring(0, dbStart);
const after = content.substring(dbEnd);

// Create minimal problem database
const minimalDatabase = `  // Essential problem database
  const problemDatabase: Omit<CodingProblem, 'solved' | 'timeSpent' | 'solvedAt'>[] = [
    // Basic Array Problems
    { id: 'day1-1', title: 'Sort an array of 0\'s 1\'s 2\'s without using extra space or sorting algo', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/sort-an-array-of-0s-1s-and-2s4231/1', tags: ['Array', 'Two Pointers', 'Sorting'], xp: 100, category: 'Array', sheet: 'Striver', day: 1, dayTitle: 'Day 1 (Arrays)' },
    { id: 'day1-2', title: 'Repeat and Missing Number', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/find-missing-and-repeating2512/1', tags: ['Array', 'Math', 'Hash Table'], xp: 125, category: 'Array', sheet: 'Striver', day: 1, dayTitle: 'Day 1 (Arrays)' },
    { id: 'day1-3', title: 'Kadane\'s Algorithm', difficulty: 'Medium', platform: 'GeeksforGeeks', url: 'https://practice.geeksforgeeks.org/problems/kadanes-algorithm-1587115620/1', tags: ['Array', 'Dynamic Programming'], xp: 100, category: 'Array', sheet: 'Striver', day: 1, dayTitle: 'Day 1 (Arrays)' },
    { id: 'day1-4', title: 'Merge Overlapping Subintervals', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/merge-intervals/', tags: ['Array', 'Sorting', 'Intervals'], xp: 125, category: 'Intervals', sheet: 'Striver', day: 1, dayTitle: 'Day 1 (Arrays)' },
    
    // Day 2: Arrays
    { id: 'day2-1', title: 'Set Matrix Zeroes', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/set-matrix-zeroes/', tags: ['Array', 'Matrix'], xp: 100, category: 'Array', sheet: 'Striver', companies: ['Microsoft', 'Amazon', 'Facebook'], day: 2, dayTitle: 'Day 2 (Arrays)' },
    { id: 'day2-2', title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy', platform: 'LeetCode', url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', tags: ['Array', 'Dynamic Programming'], xp: 50, category: 'Array', sheet: 'Striver', companies: ['Amazon', 'Microsoft', 'Facebook', 'Goldman Sachs', 'Bloomberg'], day: 2, dayTitle: 'Day 2 (Arrays)' },
    
    // Day 23: Graph
    { id: 'day23-1', title: 'Number of Islands', difficulty: 'Medium', platform: 'LeetCode', url: 'https://leetcode.com/problems/number-of-islands/', tags: ['Graph', 'DFS'], xp: 125, category: 'Graph', sheet: 'Striver', day: 23, dayTitle: 'Day 23 (Graph)' },
  ];`;

// Reconstruct file
content = before + minimalDatabase + after;

// Remove any remaining problematic references
console.log('Removing problematic references...');

// Remove timeBasedStreak references
content = content.replace(/codingStats\?\.timeBasedStreak\?\./g, 'codingStats?.');
content = content.replace(/codingStats\.timeBasedStreak\./g, 'codingStats.');
content = content.replace(/timeBasedStreak\.currentStreak/g, 'currentStreak');
content = content.replace(/timeBasedStreak\./g, '');

// Remove dailyReset references
content = content.replace(/dailyReset\s*&&\s*dailyReset\.resetCountdown[^}]*}/g, '');
content = content.replace(/dailyReset\?\./g, '');
content = content.replace(/,\s*dailyReset/g, '');

// Remove globalStreak references if any
content = content.replace(/,\s*globalStreak/g, '');

// Remove any appDataService imports or calls
content = content.replace(/import\s+.*appDataService.*\n/g, '');
content = content.replace(/appDataService\.[^\n]*\n/g, '');

// Remove any async/await patterns that might cause issues
content = content.replace(/const\s+(\w+)\s*=\s*async\s*\(\)\s*=>\s*\{[^}]*localStorage[^}]*\}/g, 'const $1 = () => { /* localStorage only */ }');

console.log('Writing cleaned file...');
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Cleanup complete!');
console.log(`File size reduced from ${fs.statSync(filePath).size} bytes`);
