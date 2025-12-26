import React, { createContext, useContext, useCallback } from 'react';
/* eslint-disable react-refresh/only-export-components */
import confetti from 'canvas-confetti';

interface ConfettiContextType {
  celebrate: (type?: 'achievement' | 'levelup' | 'task' | 'general') => void;
}

const ConfettiContext = createContext<ConfettiContextType | null>(null);

export function ConfettiProvider({ children }: { children: React.ReactNode }) {
  const celebrate = useCallback((type: 'achievement' | 'levelup' | 'task' | 'general' = 'general') => {
    const configs = {
      achievement: {
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF6347'],
      },
      levelup: {
        particleCount: 150,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#8B5CF6', '#3B82F6', '#10B981'],
        startVelocity: 45,
      },
      task: {
        particleCount: 50,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#10B981', '#059669'],
      },
      general: {
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      },
    };

    const config = configs[type];
    
    confetti({
      ...config,
      shapes: ['star', 'circle'],
      scalar: 1.2,
    });

    // Add a second burst for special occasions
    if (type === 'levelup' || type === 'achievement') {
      setTimeout(() => {
        confetti({
          ...config,
          particleCount: config.particleCount / 2,
          angle: 60,
          origin: { x: 0, y: 0.8 },
        });
        confetti({
          ...config,
          particleCount: config.particleCount / 2,
          angle: 120,
          origin: { x: 1, y: 0.8 },
        });
      }, 300);
    }
  }, []);

  return (
    <ConfettiContext.Provider value={{ celebrate }}>
      {children}
    </ConfettiContext.Provider>
  );
}

export const useConfetti = () => {
  const context = useContext(ConfettiContext);
  if (!context) {
    throw new Error('useConfetti must be used within a ConfettiProvider');
  }
  return context;
};