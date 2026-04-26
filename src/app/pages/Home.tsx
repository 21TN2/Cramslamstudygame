import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Zap, Users, BookOpen, Trophy } from 'lucide-react';
import { StarBackground } from '../components/StarBackground';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0d0820] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <StarBackground />

      <div className="relative z-10 flex flex-col items-center w-full max-w-lg">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: -40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.1 }}
          className="text-center mb-2"
        >
          <div className="flex items-center justify-center gap-3 mb-1">
            <motion.span
              animate={{ rotate: [-10, 10, -10] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="text-5xl"
            >
              ⭐
            </motion.span>
            <h1
              className="text-7xl tracking-tight select-none"
              style={{
                fontFamily: 'Fredoka, sans-serif',
                background: 'linear-gradient(135deg, #FF6B35 0%, #FFD700 50%, #FF8C00 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: 'none',
                filter: 'drop-shadow(0 0 20px rgba(255,140,0,0.4))',
              }}
            >
              CRAM SLAM
            </h1>
            <motion.span
              animate={{ rotate: [10, -10, 10] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="text-5xl"
            >
              ⭐
            </motion.span>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-white/60 text-lg mt-2"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            Upload notes. Generate questions. Crush your classmates.
          </motion.p>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap gap-2 justify-center mb-10 mt-4"
        >
          {[
            { icon: <Zap size={13} />, label: 'AI-Generated Questions' },
            { icon: <Users size={13} />, label: 'Multiplayer Battles' },
            { icon: <Trophy size={13} />, label: 'Live Leaderboard' },
            { icon: <BookOpen size={13} />, label: 'PDF & Text Upload' },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-yellow-300/90 border border-yellow-500/20 bg-yellow-500/5"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              {item.icon}
              {item.label}
            </div>
          ))}
        </motion.div>

        {/* Main buttons */}
        <div className="flex flex-col gap-4 w-full">
          <motion.button
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, type: 'spring', stiffness: 180 }}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/create')}
            className="w-full py-5 rounded-3xl flex items-center justify-center gap-3 text-white text-xl cursor-pointer"
            style={{
              fontFamily: 'Fredoka, sans-serif',
              background: 'linear-gradient(135deg, #FF6B35, #FF8C00, #FFD700)',
              boxShadow: '0 8px 32px rgba(255,107,53,0.45), inset 0 1px 0 rgba(255,255,255,0.2)',
            }}
          >
            <span className="text-2xl">🚀</span>
            Host a Game
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, type: 'spring', stiffness: 180 }}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/join')}
            className="w-full py-5 rounded-3xl flex items-center justify-center gap-3 text-white text-xl cursor-pointer"
            style={{
              fontFamily: 'Fredoka, sans-serif',
              background: 'rgba(255,255,255,0.06)',
              border: '2px solid rgba(255,215,0,0.3)',
              boxShadow: '0 4px 20px rgba(255,215,0,0.1)',
            }}
          >
            <span className="text-2xl">🎯</span>
            Join a Game
          </motion.button>
        </div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-10 text-white/30 text-sm text-center"
          style={{ fontFamily: 'Nunito, sans-serif' }}
        >
          Built for students who study smarter ⚡
        </motion.p>
      </div>
    </div>
  );
}
