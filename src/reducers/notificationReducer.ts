/**
 * Notification reducer - Handles notification state changes
 */

import type { Notification, AppAction } from '../types/enhanced';

export const notificationReducer = (notifications: Notification[], action: AppAction): Notification[] => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return [action.payload, ...notifications.slice(0, 9)];
    
    case 'REMOVE_NOTIFICATION':
      return notifications.filter(n => n.id !== action.payload);
    
    case 'MARK_NOTIFICATION_READ':
      return notifications.map(n => 
        n.id === action.payload ? { ...n, read: true } : n
      );
    
    default:
      return notifications;
  }
};
