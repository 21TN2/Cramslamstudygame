import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { StarBackground } from '../components/StarBackground';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { useGame } from '../context/GameContext';

export default function Results() {
  const navigate = useNavigate();
  const { state, resetGame } = useGame();
  const { players } = state;
  const firedRef = useRef(false);

  const sorted = [...players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];
  const myRank = sorted.findIndex(p => p.id === state.myPlayerId) + 1;
  const iWon = winner?.id === state.myPlayerId;

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;

    if (iWon) {
      const end = Date.now() + 3000;
      const fireConfetti = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#FF6B35', '#FFD700', '#FF8C00', '#FFEC55'],
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#FF6B35', '#FFD700', '#FF8C00', '#FFEC55'],
        });
        if (Date.now() < end) requestAnimationFrame(fireConfetti);
      };
      fireConfetti();
    } else {
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.4 },
        colors: ['#FF6B35', '#FFD700', '#FF8C00'],
      });
    }
  }, []);

  const podium = [sorted[1], sorted[0], sorted[2]].filter(Boolean);
  const podiumHeights = ['h-24', 'h-32', 'h-16'];
  const podiumRanks = [2, 1, 3];
  const podiumEmojis = ['🥈', '🥇', '🥉'];
  const podiumColors = [
    'rgba(192,192,192,0.15)',
    'linear-gradient(180deg, rgba(255,215,0,0.2), rgba(255,140,0,0.1))',
    'rgba(205,127,50,0.15)',
  ];

  const handlePlayAgain = () => {
    resetGame();
    navigate('/create');
  };

  const handleHome = () => {
    resetGame();
    navigate('/');
  };

  if (!state.roomCode) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0d0820] flex flex-col items-center px-4 py-8 relative overflow-hidden">
      <StarBackground />

      <div className="relative z-10 w-full max-w-lg">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ rotate: [-5, 5, -5], scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-6xl mb-3"
          >
            🏆
          </motion.div>
          <h2 className="text-4xl text-white mb-1" style={{ fontFamily: 'Fredoka, sans-serif' }}>
            {iWon ? 'You Won! 🎉' : `${winner?.name} Wins!`}
          </h2>
          <p className="text-white/50" style={{ fontFamily: 'Nunito, sans-serif' }}>
            {iWon
              ? 'Absolute domination. You crushed it! 🔥'
              : myRank === 2
              ? `So close! You finished 2nd 🥈`
              : `You finished #${myRank} — keep grinding! 💪`}
          </p>
        </motion.div>

        {/* Podium */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-end justify-center gap-3 mb-8"
        >
          {podium.map((player, i) => (
            <div key={player.id} className="flex flex-col items-center gap-2">
              <PlayerAvatar player={player} size="lg" rank={podiumRanks[i]} showName showScore />
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                style={{ transformOrigin: 'bottom' }}
                className={`w-20 ${podiumHeights[i]} rounded-t-2xl flex items-center justify-center`}
              >
                <div
                  className={`w-full ${podiumHeights[i]} rounded-t-2xl flex items-center justify-center`}
                  style={{
                    background: podiumColors[i],
                    border: i === 1 ? '1px solid rgba(255,215,0,0.3)' : '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <span className="text-2xl">{podiumEmojis[i]}</span>
                </div>
              </motion.div>
            </div>
          ))}
        </motion.div>

        {/* Full leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-3xl p-5 mb-6"
          style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <h3 className="text-white text-lg mb-4" style={{ fontFamily: 'Fredoka, sans-serif' }}>
            Final Standings
          </h3>
          <div className="flex flex-col gap-2">
            {sorted.map((player, rank) => {
              const isMe = player.id === state.myPlayerId;
              const rankEmoji = rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : null;

              return (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + rank * 0.07 }}
                  className="flex items-center gap-3 p-3 rounded-2xl"
                  style={{
                    background: isMe
                      ? 'linear-gradient(135deg, rgba(255,107,53,0.18), rgba(255,215,0,0.08))'
                      : 'rgba(255,255,255,0.03)',
                    border: isMe ? '1px solid rgba(255,107,53,0.3)' : '1px solid transparent',
                  }}
                >
                  <div className="w-8 text-center">
                    {rankEmoji ? (
                      <span className="text-lg">{rankEmoji}</span>
                    ) : (
                      <span className="text-white/30 text-sm" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                        #{rank + 1}
                      </span>
                    )}
                  </div>
                  <PlayerAvatar player={player} size="sm" />
                  <div className="flex-1">
                    <span className="text-white font-semibold text-sm" style={{ fontFamily: 'Nunito, sans-serif' }}>
                      {player.name}
                    </span>
                    {isMe && (
                      <span className="ml-2 text-xs text-orange-300" style={{ fontFamily: 'Nunito, sans-serif' }}>
                        (You)
                      </span>
                    )}
                  </div>
                  <span className="text-yellow-300 font-bold" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                    {player.score.toLocaleString()} pts
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col gap-3"
        >
          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={handlePlayAgain}
            className="w-full py-4 rounded-3xl flex items-center justify-center gap-2 text-white text-xl cursor-pointer"
            style={{
              fontFamily: 'Fredoka, sans-serif',
              background: 'linear-gradient(135deg, #FF6B35, #FF8C00, #FFD700)',
              boxShadow: '0 8px 32px rgba(255,107,53,0.4)',
            }}
          >
            <span>🚀</span>
            Play Again
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleHome}
            className="w-full py-4 rounded-3xl flex items-center justify-center gap-2 text-white/60 hover:text-white transition-colors cursor-pointer"
            style={{
              fontFamily: 'Fredoka, sans-serif',
              fontSize: '1.1rem',
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            🏠 Back to Home
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}