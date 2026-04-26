import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ChevronLeft, AlertCircle } from 'lucide-react';
import { StarBackground } from '../components/StarBackground';
import { useGame } from '../context/GameContext';
import { generateQuestionsFromText } from '../data/questions';

export default function JoinGame() {
  const navigate = useNavigate();
  const { initGame } = useGame();
  const [roomCode, setRoomCode] = useState('');
  const [myName, setMyName] = useState('');
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = async () => {
    if (!myName.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (roomCode.replace('-', '').length < 7) {
      setError('Please enter a valid room code (e.g. SLAM-1234).');
      return;
    }
    setError('');
    setIsJoining(true);

    // Simulate joining — generate a mock game
    await new Promise(r => setTimeout(r, 1200));

    const questions = generateQuestionsFromText('', 10);
    initGame('Quick Study Battle', questions, myName.trim(), 10);
    navigate('/lobby');
  };

  return (
    <div className="min-h-screen bg-[#0d0820] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <StarBackground />

      <div className="relative z-10 w-full max-w-sm">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer text-white"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-3xl text-white" style={{ fontFamily: 'Fredoka, sans-serif' }}>
            Join a Game
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-3xl p-6 border border-white/10 flex flex-col gap-5"
          style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
        >
          <div className="text-center mb-2">
            <div className="text-5xl mb-2">🎯</div>
            <p className="text-white/60 text-sm" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Enter the room code your host shared
            </p>
          </div>

          <div>
            <label className="text-white/60 text-sm mb-2 block" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Room Code
            </label>
            <input
              type="text"
              value={roomCode}
              onChange={e => setRoomCode(e.target.value.toUpperCase())}
              placeholder="e.g. SLAM-4829"
              maxLength={9}
              className="w-full border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder-white/30 outline-none focus:border-orange-500/60 transition-colors text-center tracking-widest text-xl"
              style={{ fontFamily: 'Fredoka, sans-serif', backgroundColor: 'rgba(255,255,255,0.06)' }}
            />
          </div>

          <div>
            <label className="text-white/60 text-sm mb-2 block" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Your Name
            </label>
            <input
              type="text"
              value={myName}
              onChange={e => setMyName(e.target.value)}
              placeholder="What should we call you?"
              className="w-full border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-white/30 outline-none focus:border-orange-500/60 transition-colors"
              style={{ fontFamily: 'Nunito, sans-serif', backgroundColor: 'rgba(255,255,255,0.06)' }}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm" style={{ fontFamily: 'Nunito, sans-serif' }}>
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleJoin}
            disabled={isJoining}
            className="w-full py-4 rounded-3xl flex items-center justify-center gap-2 text-white text-xl cursor-pointer disabled:opacity-60"
            style={{
              fontFamily: 'Fredoka, sans-serif',
              background: 'linear-gradient(135deg, #FF6B35, #FF8C00, #FFD700)',
              boxShadow: '0 8px 32px rgba(255,107,53,0.4)',
            }}
          >
            {isJoining ? (
              <>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  className="inline-block"
                >
                  ⭐
                </motion.span>
                Joining...
              </>
            ) : (
              <>
                <span>🎮</span>
                Join Game
              </>
            )}
          </motion.button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center text-white/30 text-sm"
          style={{ fontFamily: 'Nunito, sans-serif' }}
        >
          Ask your host for the room code to join their battle!
        </motion.p>
      </div>
    </div>
  );
}
