import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, CheckCheck, Users, ChevronLeft, Play } from 'lucide-react';
import { StarBackground } from '../components/StarBackground';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { useGame } from '../context/GameContext';

export default function Lobby() {
  const navigate = useNavigate();
  const { state } = useGame();
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [visibleBots, setVisibleBots] = useState<string[]>([]);

  const bots = state.players.filter(p => p.isBot);
  const me = state.players.find(p => p.id === state.myPlayerId);

  // Bots "join" one by one for a fun lobby feel
  useEffect(() => {
    bots.forEach((bot, i) => {
      const t = setTimeout(() => {
        setVisibleBots(prev => [...prev, bot.id]);
      }, 600 + i * 700);
      return () => clearTimeout(t);
    });
  }, []);

  const copyCode = async () => {
    await navigator.clipboard.writeText(state.roomCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startGame = () => {
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      navigate('/game');
      return;
    }
    const t = setTimeout(() => setCountdown(c => (c ?? 1) - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, navigate]);

  const shownPlayers = [
    ...(me ? [me] : []),
    ...bots.filter(b => visibleBots.includes(b.id)),
  ];

  if (!state.roomCode) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0d0820] flex flex-col items-center px-4 py-8 relative overflow-hidden">
      <StarBackground />

      {/* Countdown overlay */}
      <AnimatePresence>
        {countdown !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(13,8,32,0.9)' }}
          >
            <motion.div
              key={countdown}
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              exit={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              {countdown > 0 ? (
                <>
                  <div
                    className="text-[120px]"
                    style={{
                      fontFamily: 'Fredoka, sans-serif',
                      background: 'linear-gradient(135deg, #FF6B35, #FFD700)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {countdown}
                  </div>
                  <p className="text-white/60 text-xl" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                    Get ready...
                  </p>
                </>
              ) : (
                <div className="text-6xl text-white" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                  🚀 GO!
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 w-full max-w-lg">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer text-white"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 className="text-3xl text-white" style={{ fontFamily: 'Fredoka, sans-serif' }}>
              {state.gameName}
            </h2>
            <p className="text-white/40 text-sm" style={{ fontFamily: 'Nunito, sans-serif' }}>
              {state.questions.length} questions ready
            </p>
          </div>
        </motion.div>

        {/* Room code */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl p-6 mb-6 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(255,107,53,0.12), rgba(255,215,0,0.08))',
            border: '1px solid rgba(255,215,0,0.25)',
          }}
        >
          <p className="text-white/50 text-sm mb-1" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Share this code with friends
          </p>
          <div className="flex items-center justify-center gap-3">
            <span
              className="text-5xl tracking-widest"
              style={{
                fontFamily: 'Fredoka, sans-serif',
                background: 'linear-gradient(135deg, #FF6B35, #FFD700)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {state.roomCode}
            </span>
            <button
              onClick={copyCode}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer"
              style={{ backgroundColor: copied ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.08)' }}
            >
              {copied ? (
                <CheckCheck size={18} className="text-green-400" />
              ) : (
                <Copy size={18} className="text-white/60" />
              )}
            </button>
          </div>
        </motion.div>

        {/* Players */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-3xl p-5 mb-6"
          style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Users size={16} className="text-orange-400" />
            <span className="text-white/70 text-sm" style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}>
              Players ({shownPlayers.length})
            </span>
          </div>

          <div className="flex flex-col gap-3">
            <AnimatePresence>
              {shownPlayers.map((player, i) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-2xl"
                  style={{ backgroundColor: player.id === state.myPlayerId ? 'rgba(255,107,53,0.1)' : 'rgba(255,255,255,0.04)' }}
                >
                  <PlayerAvatar player={player} size="md" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold" style={{ fontFamily: 'Nunito, sans-serif' }}>
                        {player.name}
                      </span>
                      {player.id === state.myPlayerId && (
                        <span className="text-xs px-2 py-0.5 rounded-full text-orange-300 border border-orange-500/30" style={{ backgroundColor: 'rgba(255,107,53,0.1)', fontFamily: 'Nunito, sans-serif' }}>
                          You
                        </span>
                      )}
                      {player.isHost && (
                        <span className="text-xs text-yellow-400" style={{ fontFamily: 'Nunito, sans-serif' }}>
                          👑 Host
                        </span>
                      )}
                    </div>
                    <p className="text-white/40 text-xs" style={{ fontFamily: 'Nunito, sans-serif' }}>
                      {player.isBot ? 'Competitor' : 'Ready to slam!'}
                    </p>
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                    className="w-2 h-2 rounded-full bg-green-400"
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {bots.length > visibleBots.length && (
              <div className="flex items-center gap-2 p-3 rounded-2xl" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                      className="w-1.5 h-1.5 rounded-full bg-white/30"
                    />
                  ))}
                </div>
                <span className="text-white/30 text-sm" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  More players joining...
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Start button */}
        {state.isHost && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={startGame}
              disabled={countdown !== null}
              className="w-full py-5 rounded-3xl flex items-center justify-center gap-3 text-white text-xl cursor-pointer disabled:opacity-60"
              style={{
                fontFamily: 'Fredoka, sans-serif',
                background: 'linear-gradient(135deg, #FF6B35, #FF8C00, #FFD700)',
                boxShadow: '0 8px 32px rgba(255,107,53,0.45)',
              }}
            >
              <Play size={22} fill="white" />
              Start the Battle!
            </motion.button>
            <p className="text-white/30 text-sm text-center mt-3" style={{ fontFamily: 'Nunito, sans-serif' }}>
              All players will start at the same time
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
