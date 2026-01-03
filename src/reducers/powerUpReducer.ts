/**
 * Power-up reducer - Handles all power-up related state changes
 * Production-ready with error handling and validation
 */

import type { PowerUpEffect, OwnedPowerUps, AppAction } from '../types/enhanced';
import { ALL_POWER_UPS } from '../data/powerUps';

export const powerUpReducer = (
  state: { activePowerUps: PowerUpEffect[]; ownedPowerUps: OwnedPowerUps }, 
  action: AppAction
): { activePowerUps: PowerUpEffect[]; ownedPowerUps: OwnedPowerUps } => {
  try {
    switch (action.type) {
      case 'BUY_POWERUP': {
        const { powerUpId, cost } = action.payload;
        const currentCount = state.ownedPowerUps?.[powerUpId] || 0;
        
        return {
          ...state,
          ownedPowerUps: {
            ...state.ownedPowerUps,
            [powerUpId]: currentCount + 1,
          },
        };
      }
      
      case 'ACTIVATE_POWERUP': {
        const { powerUpId, duration } = action.payload;
        const currentCount = state.ownedPowerUps?.[powerUpId] || 0;
        
        if (currentCount <= 0) {
          console.warn(`No power-ups available for ${powerUpId}`);
          return state;
        }
        
        const powerUpMeta = ALL_POWER_UPS.find(p => p.id === powerUpId);
        if (!powerUpMeta) {
          console.warn(`Power-up ${powerUpId} not found in registry`);
          return state;
        }
        
        const expiresAt = Date.now() + duration * 60 * 1000;
        
        return {
          ...state,
          ownedPowerUps: {
            ...state.ownedPowerUps,
            [powerUpId]: currentCount - 1,
          },
          activePowerUps: [
            ...(state.activePowerUps || []),
            { id: powerUpId, expiresAt },
          ],
        };
      }
      
      case 'EXPIRE_POWERUP': {
        const remaining = state.activePowerUps.filter(p => p.id !== action.payload);
        
        return {
          ...state,
          activePowerUps: remaining,
        };
      }
      
      default:
        return state;
    }
  } catch (error) {
    console.error('Error in powerUpReducer:', error);
    return state; // Return original state on error
  }
};
