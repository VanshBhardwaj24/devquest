/**
 * Performance optimization utilities for 50k+ users
 * Includes memoization, debouncing, throttling, and memory management
 */

/**
 * Generic memoization function with cache size limit
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  cacheSize: number = 100
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    
    // Implement LRU cache behavior
    if (cache.size >= cacheSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Batch state updates to reduce re-renders
 */
export class BatchUpdateManager {
  private static pendingUpdates: Array<() => void> = [];
  private static isScheduled = false;
  
  /**
   * Schedule a batch update
   */
  static schedule(update: () => void): void {
    this.pendingUpdates.push(update);
    
    if (!this.isScheduled) {
      this.isScheduled = true;
      requestAnimationFrame(() => {
        this.flush();
      });
    }
  }
  
  /**
   * Execute all pending updates
   */
  private static flush(): void {
    const updates = this.pendingUpdates.splice(0);
    this.isScheduled = false;
    
    updates.forEach(update => {
      try {
        update();
      } catch (error) {
        console.error('Error in batched update:', error);
      }
    });
  }
  
  /**
   * Clear pending updates
   */
  static clear(): void {
    this.pendingUpdates = [];
    this.isScheduled = false;
  }
}

/**
 * Memory management utilities
 */
export class MemoryManager {
  private static observers: Set<ResizeObserver> = new Set();
  private static timers: Set<NodeJS.Timeout> = new Set();
  private static intervals: Set<NodeJS.Timeout> = new Set();
  
  /**
   * Register a timer for automatic cleanup
   */
  static registerTimer(timer: NodeJS.Timeout): void {
    this.timers.add(timer);
  }
  
  /**
   * Register an interval for automatic cleanup
   */
  static registerInterval(interval: NodeJS.Timeout): void {
    this.intervals.add(interval);
  }
  
  /**
   * Register a ResizeObserver for automatic cleanup
   */
  static registerObserver(observer: ResizeObserver): void {
    this.observers.add(observer);
  }
  
  /**
   * Clear all registered resources
   */
  static cleanup(): void {
    // Clear timers
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
    
    // Clear intervals
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();
    
    // Disconnect observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

/**
 * Virtual scrolling utilities for large lists
 */
export class VirtualScrollManager {
  private itemHeight: number;
  private containerHeight: number;
  private scrollTop: number = 0;
  
  constructor(itemHeight: number, containerHeight: number) {
    this.itemHeight = itemHeight;
    this.containerHeight = containerHeight;
  }
  
  /**
   * Calculate visible range for virtual scrolling
   */
  getVisibleRange(totalItems: number): { start: number; end: number; offsetY: number } {
    const start = Math.floor(this.scrollTop / this.itemHeight);
    const visibleCount = Math.ceil(this.containerHeight / this.itemHeight);
    const end = Math.min(start + visibleCount + 1, totalItems);
    const offsetY = start * this.itemHeight;
    
    return { start: Math.max(0, start - 1), end, offsetY };
  }
  
  /**
   * Update scroll position
   */
  updateScrollTop(scrollTop: number): void {
    this.scrollTop = scrollTop;
  }
  
  /**
   * Get total height for all items
   */
  getTotalHeight(totalItems: number): number {
    return totalItems * this.itemHeight;
  }
}

/**
 * Performance monitoring for React components
 */
export class PerformanceTracker {
  private static measurements: Map<string, number[]> = new Map();
  
  /**
   * Start measuring render time
   */
  static startMeasure(name: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (!this.measurements.has(name)) {
        this.measurements.set(name, []);
      }
      
      const measurements = this.measurements.get(name)!;
      measurements.push(duration);
      
      // Keep only last 50 measurements
      if (measurements.length > 50) {
        measurements.shift();
      }
      
      // Warn about slow renders
      if (duration > 16.67) { // 60fps threshold
        console.warn(`Slow render detected for ${name}: ${duration.toFixed(2)}ms`);
      }
    };
  }
  
  /**
   * Get performance statistics
   */
  static getStats(name: string): { avg: number; max: number; min: number; count: number } | null {
    const measurements = this.measurements.get(name);
    if (!measurements || measurements.length === 0) return null;
    
    const avg = measurements.reduce((sum, val) => sum + val, 0) / measurements.length;
    const max = Math.max(...measurements);
    const min = Math.min(...measurements);
    
    return { avg, max, min, count: measurements.length };
  }
  
  /**
   * Clear all measurements
   */
  static clear(): void {
    this.measurements.clear();
  }
}

/**
 * Optimized array operations for large datasets
 */
export class ArrayUtils {
  /**
   * Binary search for sorted arrays
   */
  static binarySearch<T>(array: T[], item: T, compareFn: (a: T, b: T) => number): number {
    let low = 0;
    let high = array.length - 1;
    
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const cmp = compareFn(array[mid], item);
      
      if (cmp === 0) return mid;
      if (cmp < 0) low = mid + 1;
      else high = mid - 1;
    }
    
    return -1;
  }
  
  /**
   * Chunk array for processing large datasets
   */
  static chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
  
  /**
   * Paginate array data
   */
  static paginate<T>(array: T[], page: number, pageSize: number): {
    items: T[];
    totalPages: number;
    currentPage: number;
  } {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const items = array.slice(startIndex, endIndex);
    const totalPages = Math.ceil(array.length / pageSize);
    
    return { items, totalPages, currentPage: page };
  }
}

/**
 * Lazy loading utilities
 */
export class LazyLoader {
  private static loadedItems = new Set<string>();
  private static loadingPromises = new Map<string, Promise<any>>();
  
  /**
   * Load item with caching
   */
  static async load<T>(
    key: string,
    loader: () => Promise<T>
  ): Promise<T> {
    // Return cached item if already loaded
    if (this.loadedItems.has(key)) {
      return this.loadingPromises.get(key) as Promise<T>;
    }
    
    // Return existing promise if currently loading
    if (this.loadingPromises.has(key)) {
      return this.loadingPromises.get(key) as Promise<T>;
    }
    
    // Start loading
    const promise = loader();
    this.loadingPromises.set(key, promise);
    
    try {
      const result = await promise;
      this.loadedItems.add(key);
      return result;
    } catch (error) {
      this.loadingPromises.delete(key);
      throw error;
    }
  }
  
  /**
   * Preload multiple items
   */
  static async preload<T>(keys: string[], loader: (key: string) => Promise<T>): Promise<T[]> {
    const promises = keys.map(key => this.load(key, () => loader(key)));
    return Promise.all(promises);
  }
  
  /**
   * Clear cache
   */
  static clear(): void {
    this.loadedItems.clear();
    this.loadingPromises.clear();
  }
}

/**
 * Optimized event listener management
 */
export class EventManager {
  private static listeners = new Map<string, Set<EventTarget>>();
  
  /**
   * Add event listener with automatic cleanup
   */
  static addListener(
    target: EventTarget,
    event: string,
    handler: EventListener,
    options?: AddEventListenerOptions
  ): void {
    target.addEventListener(event, handler, options);
    
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    this.listeners.get(event)!.add(target);
  }
  
  /**
   * Remove event listener
   */
  static removeListener(
    target: EventTarget,
    event: string,
    handler: EventListener,
    options?: EventListenerOptions
  ): void {
    target.removeEventListener(event, handler, options);
    
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(target);
      if (listeners.size === 0) {
        this.listeners.delete(event);
      }
    }
  }
  
  /**
   * Remove all listeners for an event
   */
  static removeAllListeners(event: string): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(target => {
        // This is a simplified cleanup - in practice, you'd need to store handlers
        console.log(`Cleaning up ${event} listeners`);
      });
      this.listeners.delete(event);
    }
  }
  
  /**
   * Clear all event listeners
   */
  static clear(): void {
    this.listeners.clear();
  }
}

/**
 * Performance-optimized React HOC for memoization
 */
export function withMemo<P extends object>(
  Component: React.ComponentType<P>,
  areEqual?: (prevProps: P, nextProps: P) => boolean
): React.MemoExoticComponent<React.ComponentType<P>> {
  return React.memo(Component, areEqual);
}

/**
 * Performance monitoring hook
 */
export function usePerformanceMonitor(componentName: string) {
  const renderCount = React.useRef(0);
  
  React.useEffect(() => {
    renderCount.current++;
    const endMeasure = PerformanceTracker.startMeasure(componentName);
    
    return endMeasure;
  });
  
  return {
    renderCount: renderCount.current,
    getStats: () => PerformanceTracker.getStats(componentName),
  };
}

export class PriorityScheduler {
  private queue: { priority: number; task: () => void }[] = [];
  private running = false;
  add(task: () => void, priority: number = 0): void {
    this.queue.push({ priority, task });
    this.queue.sort((a, b) => b.priority - a.priority);
    if (!this.running) {
      this.running = true;
      this.flush();
    }
  }
  private flush(): void {
    const next = this.queue.shift();
    if (!next) {
      this.running = false;
      return;
    }
    try {
      next.task();
    } finally {
      if (typeof window !== 'undefined' && (window as any).requestIdleCallback) {
        (window as any).requestIdleCallback(() => this.flush());
      } else {
        setTimeout(() => this.flush(), 0);
      }
    }
  }
}

export class RollingStats {
  private values: number[] = [];
  private limit: number;
  constructor(limit: number = 100) {
    this.limit = limit;
  }
  add(value: number): void {
    this.values.push(value);
    if (this.values.length > this.limit) this.values.shift();
  }
  get avg(): number {
    if (this.values.length === 0) return 0;
    return this.values.reduce((a, b) => a + b, 0) / this.values.length;
  }
  get min(): number {
    if (this.values.length === 0) return 0;
    return Math.min(...this.values);
  }
  get max(): number {
    if (this.values.length === 0) return 0;
    return Math.max(...this.values);
  }
  get count(): number {
    return this.values.length;
  }
}

export class TTLCache<K, V> {
  private store = new Map<K, { value: V; expires: number }>();
  private ttl: number;
  constructor(ttlMs: number) {
    this.ttl = ttlMs;
  }
  set(key: K, value: V): void {
    const expires = Date.now() + this.ttl;
    this.store.set(key, { value, expires });
  }
  get(key: K): V | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expires) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }
  clear(): void {
    this.store.clear();
  }
  prune(): void {
    const now = Date.now();
    for (const [k, v] of this.store.entries()) {
      if (now > v.expires) this.store.delete(k);
    }
  }
}

export class TaskQueue {
  private q: Array<() => Promise<void>> = [];
  private active = 0;
  private concurrency: number;
  constructor(concurrency: number = 4) {
    this.concurrency = concurrency;
  }
  add(task: () => Promise<void>): void {
    this.q.push(task);
    this.run();
  }
  private run(): void {
    if (this.active >= this.concurrency) return;
    const next = this.q.shift();
    if (!next) return;
    this.active++;
    next().finally(() => {
      this.active--;
      this.run();
    });
  }
  size(): number {
    return this.q.length;
  }
}

export class WorkerPool {
  private queue: Array<() => Promise<any>> = [];
  private running = 0;
  private max: number;
  private results: any[] = [];
  constructor(max: number = 2) {
    this.max = max;
  }
  submit<T>(task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const res = await task();
          this.results.push(res);
          resolve(res);
        } catch (e) {
          reject(e);
        }
      });
      this.dispatch();
    });
  }
  private dispatch(): void {
    if (this.running >= this.max) return;
    const job = this.queue.shift();
    if (!job) return;
    this.running++;
    job().finally(() => {
      this.running--;
      this.dispatch();
    });
  }
  getResults(): any[] {
    return this.results.slice();
  }
}
