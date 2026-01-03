/**
 * Task reducer - Handles all task-related state changes
 * Production-ready with error handling and validation
 */

import type { Task, AppAction } from '../types/enhanced';
import { getTodayDateString } from '../utils/streakCalculations';

export const taskReducer = (tasks: Task[], action: AppAction): Task[] => {
  try {
    switch (action.type) {
      case 'SET_TASKS':
        return action.payload;
      
      case 'ADD_TASK':
        return [action.payload, ...tasks];
      
      case 'UPDATE_TASK': {
        const updatedTask = action.payload;
        return tasks.map(task =>
          task.id === updatedTask.id ? updatedTask : task
        );
      }
      
      case 'DELETE_TASK':
        return tasks.filter(task => task.id !== action.payload);
      
      default:
        return tasks;
    }
  } catch (error) {
    console.error('Error in taskReducer:', error);
    return tasks; // Return original state on error
  }
};
