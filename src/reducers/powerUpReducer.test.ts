import { describe, it, expect } from 'vitest';
import { powerUpReducer } from './powerUpReducer';

type Action =
  | { type: 'BUY_POWERUP'; payload: { powerUpId: string; cost: number } }
  | { type: 'ACTIVATE_POWERUP'; payload: { powerUpId: string; duration: number } }
  | { type: 'EXPIRE_POWERUP'; payload: string };

describe('powerUpReducer', () => {
  it('increments owned count on BUY_POWERUP', () => {
    const initial = { activePowerUps: [], ownedPowerUps: { 'pu-2': 0 } };
    const next = powerUpReducer(initial, {
      type: 'BUY_POWERUP',
      payload: { powerUpId: 'pu-2', cost: 100 },
    } as Action);
    expect(next.ownedPowerUps['pu-2']).toBe(1);
    expect(next.activePowerUps.length).toBe(0);
  });

  it('activates power-up and decreases owned count', () => {
    const initial = { activePowerUps: [], ownedPowerUps: { 'pu-2': 1 } };
    const activated = powerUpReducer(initial, {
      type: 'ACTIVATE_POWERUP',
      payload: { powerUpId: 'pu-2', duration: 1 },
    } as Action);
    expect(activated.ownedPowerUps['pu-2']).toBe(0);
    expect(activated.activePowerUps.length).toBe(1);
    expect(activated.activePowerUps[0].id).toBe('pu-2');
    expect(activated.activePowerUps[0].expiresAt).toBeGreaterThan(Date.now());
  });

  it('expires power-up and removes from active list', () => {
    const initial = {
      activePowerUps: [{ id: 'pu-2', expiresAt: Date.now() + 60000 }],
      ownedPowerUps: { 'pu-2': 0 },
    };
    const expired = powerUpReducer(initial, {
      type: 'EXPIRE_POWERUP',
      payload: 'pu-2',
    } as Action);
    expect(expired.activePowerUps.length).toBe(0);
    expect(expired.ownedPowerUps['pu-2']).toBe(0);
  });
});
