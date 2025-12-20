import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Zap, X, Cpu, ChevronRight, Terminal } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useConfetti } from './ConfettiProvider';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
  xpGained: number;
}

export function LevelUpModal({ isOpen, onClose, newLevel, xpGained }: LevelUpModalProps) {
  const { state } = useApp();
  const { darkMode } = state;
  const { celebrate } = useConfetti();

  useEffect(() => {
    if (isOpen) {
      celebrate('levelup');
    }
  }, [isOpen, celebrate]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Matrix Rain Effect Background (CSS-only simplified) */}
          <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://media.giphy.com/media/U3qYN8S0j3bpK/giphy.gif')] bg-cover mix-blend-screen opacity-10" />
          </div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50, rotateX: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 15 }}
            className="relative max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Card variant="holographic" className="border-neon-purple shadow-[0_0_50px_rgba(168,85,247,0.4)]">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-20"
              >
                <X size={24} />
              </button>

              <div className="p-8 text-center relative overflow-hidden">
                {/* Glitch Title */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mb-8 relative z-10"
                >
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-neon-purple blur-xl opacity-50 animate-pulse" />
                    <Cpu className="w-24 h-24 text-white relative z-10 mx-auto drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-[-10px] border-2 border-dashed border-neon-blue rounded-full opacity-50"
                    />
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-[-20px] border border-dotted border-neon-pink rounded-full opacity-30"
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink mb-2 font-cyber tracking-widest animate-pulse">
                    SYSTEM UPGRADE
                  </h2>
                  <div className="flex items-center justify-center gap-2 text-neon-blue font-mono text-sm mb-6">
                    <Terminal size={14} />
                    <span>PROTOCOL: LEVEL_{newLevel} INSTALLED</span>
                  </div>
                </motion.div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="bg-black/40 border border-neon-blue/30 p-4 rounded-lg"
                  >
                    <p className="text-xs text-neon-blue font-mono mb-1">XP GAINED</p>
                    <p className="text-2xl font-bold text-white">+{xpGained}</p>
                  </motion.div>
                  <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="bg-black/40 border border-neon-purple/30 p-4 rounded-lg"
                  >
                    <p className="text-xs text-neon-purple font-mono mb-1">NEW LEVEL</p>
                    <p className="text-2xl font-bold text-white">{newLevel}</p>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="space-y-3 mb-8"
                >
                  <div className="h-[1px] bg-gradient-to-r from-transparent via-gray-500 to-transparent" />
                  <p className="text-gray-300 font-mono text-sm">
                    <span className="text-green-400">SUCCESS:</span> Neural pathways expanded.
                    <br />
                    New capabilities unlocked in Skill Tree.
                  </p>
                  <div className="h-[1px] bg-gradient-to-r from-transparent via-gray-500 to-transparent" />
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  <Button 
                    variant="neon" 
                    size="lg" 
                    className="w-full font-bold tracking-wider"
                    onClick={onClose}
                  >
                    ACKNOWLEDGE <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
