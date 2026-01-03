/**
 * Vitality reducer - Handles energy and mood state changes
 */

import type { Vitality, AppAction } from '../types/enhanced';

export const vitalityReducer = (vitality: Vitality, action: AppAction): Vitality => {
  switch (action.type) {
    case 'UPDATE_ENERGY': {
      const { amount } = action.payload;
      const currentEnergy = vitality.energy.current;
      const maxEnergy = vitality.energy.max;
      
      const newEnergy = Math.max(0, Math.min(maxEnergy, currentEnergy + amount));
      
      // Derive mood from energy
      let moodLabel = 'Neutral';
      let moodValue = 50;
      
      if (newEnergy >= 80) {
        moodLabel = 'Energized';
        moodValue = 100;
      } else if (newEnergy >= 50) {
        moodLabel = 'Motivated';
        moodValue = 75;
      } else if (newEnergy >= 20) {
        moodLabel = 'Tired';
        moodValue = 40;
      } else {
        moodLabel = 'Exhausted';
        moodValue = 10;
      }

      return {
        energy: {
          current: newEnergy,
          max: maxEnergy,
          lastUpdated: new Date().toISOString(),
        },
        mood: {
          value: moodValue,
          label: moodLabel,
        }
      };
    }
    
    case 'RESTORE_ENERGY': {
      const currentEnergy = vitality.energy.current;
      const maxEnergy = vitality.energy.max;
      return {
        ...vitality,
        energy: {
          current: Math.min(maxEnergy, currentEnergy + action.payload),
          max: maxEnergy,
          lastUpdated: new Date().toISOString(),
        },
      };
    }
    
    default:
      return vitality;
  }
};
