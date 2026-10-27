import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, Star, CheckCircle, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

export interface RewardCelebrationData {
  type: 'xp' | 'badge';
  amount?: number;
  title: string;
  subtitle: string;
  badgeName?: string;
}

interface RewardCelebrationModalProps {
  reward: RewardCelebrationData | null;
  onClose: () => void;
}

export const RewardCelebrationModal: React.FC<RewardCelebrationModalProps> = ({
  reward,
  onClose
}) => {
  useEffect(() => {
    if (reward) {
      // Fire celebratory confetti particles
      try {
        confetti({
          particleCount: reward.type === 'badge' ? 90 : 50,
          spread: 70,
          origin: { y: 0.65 },
          colors: ['#D4AF37', '#10B981', '#F59E0B', '#3B82F6', '#EF4444']
        });
      } catch {}

      // Auto dismiss after 3 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 3200);

      return () => clearTimeout(timer);
    }
  }, [reward, onClose]);

  return (
    <AnimatePresence>
      {reward && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs cursor-pointer select-none"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 35 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -25 }}
            transition={{ type: 'spring', stiffness: 450, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative overflow-hidden bg-gradient-to-b from-amber-950 via-stone-900 to-amber-950 text-amber-50 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center border-2 border-amber-400/80 shadow-2xl"
          >
            {/* Background glowing aura */}
            <div className="absolute -top-12 -left-12 w-40 h-40 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

            {/* Icon Burst with rotation spring */}
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 0.1 }}
              className="relative w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-amber-950 flex items-center justify-center shadow-lg border-2 border-amber-200"
            >
              {reward.type === 'badge' ? (
                <Trophy className="w-10 h-10" />
              ) : (
                <Sparkles className="w-10 h-10" />
              )}

              {/* Orbiting stars */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0"
              >
                <Star className="w-4 h-4 fill-amber-300 text-amber-300 absolute -top-1 left-1/2 -translate-x-1/2 drop-shadow" />
                <Star className="w-3.5 h-3.5 fill-emerald-300 text-emerald-300 absolute -bottom-1 left-1/2 -translate-x-1/2 drop-shadow" />
              </motion.div>
            </motion.div>

            {/* Type Tag */}
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="inline-block text-[10px] font-mono font-bold uppercase tracking-widest text-amber-300 bg-amber-900/80 border border-amber-600/50 px-2.5 py-0.5 rounded-full mb-2"
            >
              {reward.type === 'badge' ? 'Lencana Baharu Dibuka' : 'Ganjaran Pahlawan'}
            </motion.span>

            {/* Title / Amount */}
            <motion.h3
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="text-2xl font-bold font-display text-amber-100"
            >
              {reward.amount ? `+${reward.amount} XP!` : reward.title}
            </motion.h3>

            {/* Subtitle / Reason */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="text-xs sm:text-sm text-amber-200/90 mt-1 font-serif italic"
            >
              {reward.subtitle}
            </motion.p>

            {/* Dismiss prompt */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="pt-4 mt-4 border-t border-amber-900/60"
            >
              <button
                onClick={onClose}
                className="px-5 py-1.5 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold rounded-xl text-xs transition-colors shadow-sm active:scale-95"
              >
                Teruskan Kembara
              </button>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
