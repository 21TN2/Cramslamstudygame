import { useGame, BOT_PLAYERS } from '../context/GameContext';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { StarBackground } from '../components/StarBackground';
import { PlayerAvatar } from '../components/PlayerAvatar';

type GamePhase = 'question' | 'reveal' | 'leaderboard';

const QUESTION_TIME = 15;
const REVEAL_TIME = 3500;
const LEADERBOARD_TIME = 4000;
const ANSWER_COLORS = [
  { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.5)', hover: 'rgba(239,68,68,0.25)', label: 'A', accent: '#EF4444' },
  { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.5)', hover: 'rgba(59,130,246,0.25)', label: 'B', accent: '#3B82F6' },
  { bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.5)', hover: 'rgba(34,197,94,0.25)', label: 'C', accent: '#22C55E' },
  { bg: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.5)', hover: 'rgba(168,85,247,0.25)', label: 'D', accent: '#A855F7' },
];

function getWrongAnswer(correct: number): number {
  const options = [0, 1, 2, 3].filter(i => i !== correct);
  return options[Math.floor(Math.random() * options.length)];
}

export default function Game() {
  const navigate = useNavigate();
  const { state, updateScores } = useGame();
  const { questions, players, myPlayerId } = state;

  const [questionIndex, setQuestionIndex] = useState(0);
  const [phase, setPhase] = useState<GamePhase>('question');
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries(players.map(p => [p.id, 0]))
  );
  const [prevScores, setPrevScores] = useState<Record<string, number>>(
    Object.fromEntries(players.map(p => [p.id, 0]))
  );
  const [roundWinner, setRoundWinner] = useState<{ id: string; name: string; emoji: string } | null>(null);
  const [botAnswers, setBotAnswers] = useState<Record<string, number>>({}); // botId -> answerIndex
  const [correctAnsweredMs, setCorrectAnsweredMs] = useState<number | null>(null);

  const phaseRef = useRef<GamePhase>('question');
  const firstCorrectRef = useRef<string | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const botTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const questionStartRef = useRef(Date.now());
  const scoresRef = useRef(scores);

  scoresRef.current = scores;

  const currentQuestion = questions[questionIndex];

  const clearBotTimeouts = useCallback(() => {
    botTimeoutsRef.current.forEach(clearTimeout);
    botTimeoutsRef.current = [];
  }, []);

  const clearTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  const goToReveal = useCallback((winner: { id: string; name: string; emoji: string } | null, winnerMs?: number) => {
    if (phaseRef.current !== 'question') return;
    phaseRef.current = 'reveal';
    clearTimer();
    clearBotTimeouts();
    setRoundWinner(winner);
    if (winnerMs !== undefined) setCorrectAnsweredMs(winnerMs);
    setPhase('reveal');
  }, [clearTimer, clearBotTimeouts]);

  // Start timer when question begins
  useEffect(() => {
    if (phase !== 'question') return;
    phaseRef.current = 'question';
    firstCorrectRef.current = null;
    questionStartRef.current = Date.now();

    setTimeLeft(QUESTION_TIME);
    setSelectedAnswer(null);
    setBotAnswers({});
    setRoundWinner(null);
    setCorrectAnsweredMs(null);
    // Save current scores as "prev" so leaderboard can show the round diff
    setPrevScores({ ...scoresRef.current });

    // Timer countdown
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current!);
          goToReveal(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Schedule bot answers
    const currentBots = players.filter(p => p.isBot);
    currentBots.forEach((bot, i) => {
      const botConfig = BOT_PLAYERS[i];
      if (!botConfig) return;

      const delayMs = (botConfig.minDelay + Math.random() * (botConfig.maxDelay - botConfig.minDelay)) * 1000;

      if (delayMs > QUESTION_TIME * 1000) return; // Bot won't answer in time

      const t = setTimeout(() => {
        if (phaseRef.current !== 'question') return;

        const isCorrect = Math.random() < botConfig.accuracy;
        const answerIndex = isCorrect
          ? currentQuestion.correctIndex
          : getWrongAnswer(currentQuestion.correctIndex);

        setBotAnswers(prev => ({ ...prev, [bot.id]: answerIndex }));

        if (isCorrect && firstCorrectRef.current === null) {
          firstCorrectRef.current = bot.id;
          const elapsed = Date.now() - questionStartRef.current;
          const speedBonus = Math.max(0, Math.round(500 * (1 - elapsed / (QUESTION_TIME * 1000))));
          const points = 1000 + speedBonus;

          setScores(prev => {
            const updated = { ...prev, [bot.id]: prev[bot.id] + points };
            scoresRef.current = updated;
            return updated;
          });

          goToReveal({ id: bot.id, name: bot.name, emoji: bot.emoji }, elapsed);
        }
      }, delayMs);

      botTimeoutsRef.current.push(t);
    });

    return () => {
      clearTimer();
      clearBotTimeouts();
    };
  }, [questionIndex, phase === 'question']);

  // Phase transitions after reveal / leaderboard
  useEffect(() => {
    if (phase === 'reveal') {
      const t = setTimeout(() => {
        phaseRef.current = 'leaderboard';
        updateScores(scoresRef.current);
        setPhase('leaderboard');
      }, REVEAL_TIME);
      return () => clearTimeout(t);
    }
    if (phase === 'leaderboard') {
      const t = setTimeout(() => {
        if (questionIndex + 1 >= questions.length) {
          updateScores(scoresRef.current);
          navigate('/results');
        } else {
          setQuestionIndex(qi => qi + 1);
          phaseRef.current = 'question';
          setPhase('question');
        }
      }, LEADERBOARD_TIME);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null || phase !== 'question') return;
    setSelectedAnswer(index);

    const elapsed = Date.now() - questionStartRef.current;
    const isCorrect = index === currentQuestion.correctIndex;

    if (isCorrect && firstCorrectRef.current === null) {
      firstCorrectRef.current = myPlayerId;
      const speedBonus = Math.max(0, Math.round(500 * (1 - elapsed / (QUESTION_TIME * 1000))));
      const points = 1000 + speedBonus;
      const me = players.find(p => p.id === myPlayerId)!;

      setScores(prev => {
        const updated = { ...prev, [myPlayerId]: prev[myPlayerId] + points };
        scoresRef.current = updated;
        return updated;
      });

      goToReveal({ id: myPlayerId, name: me.name, emoji: me.emoji }, elapsed);
    }
    // If wrong or too slow — answer is just locked, no points
  };

  const sortedPlayers = [...players].sort((a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0));
  const myRank = sortedPlayers.findIndex(p => p.id === myPlayerId) + 1;
  const timerPercent = (timeLeft / QUESTION_TIME) * 100;
  const timerColor = timeLeft > 8 ? '#22C55E' : timeLeft > 4 ? '#F59E0B' : '#EF4444';
  const me = players.find(p => p.id === myPlayerId);

  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen bg-[#0d0820] flex flex-col relative overflow-hidden">
      <StarBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 text-lg">⭐</span>
            <span className="text-white/60 text-sm" style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}>
              Q{questionIndex + 1}/{questions.length}
            </span>
          </div>

          {me && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ backgroundColor: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.2)' }}>
              <span className="text-yellow-400 text-sm">{me.emoji}</span>
              <span className="text-yellow-300 text-sm font-bold" style={{ fontFamily: 'Nunito, sans-serif' }}>
                {(scores[myPlayerId] ?? 0).toLocaleString()} pts
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-white/40 text-sm" style={{ fontFamily: 'Nunito, sans-serif' }}>
              #{myRank}
            </span>
          </div>
        </div>

        {/* Timer bar */}
        <div className="h-2 mx-4 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: timerColor }}
            animate={{ width: `${timerPercent}%` }}
            transition={{ duration: 0.9, ease: 'linear' }}
          />
        </div>

        <AnimatePresence mode="wait">
          {/* ─── QUESTION PHASE ─── */}
          {phase === 'question' && (
            <motion.div
              key={`question-${questionIndex}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col flex-1 px-4 pt-5 pb-6 gap-4"
            >
              {/* Timer circle */}
              <div className="flex justify-center">
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
                    <circle
                      cx="32" cy="32" r="28"
                      fill="none"
                      stroke={timerColor}
                      strokeWidth="4"
                      strokeDasharray={`${2 * Math.PI * 28}`}
                      strokeDashoffset={`${2 * Math.PI * 28 * (1 - timerPercent / 100)}`}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      className="text-xl"
                      style={{ fontFamily: 'Fredoka, sans-serif', color: timerColor }}
                    >
                      {timeLeft}
                    </span>
                  </div>
                </div>
              </div>

              {/* Question card */}
              <div
                className="rounded-3xl p-5 text-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,107,53,0.1), rgba(255,215,0,0.05))',
                  border: '1px solid rgba(255,215,0,0.2)',
                }}
              >
                <span
                  className="inline-block px-3 py-1 rounded-full text-xs mb-3 text-orange-300"
                  style={{ backgroundColor: 'rgba(255,107,53,0.15)', fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}
                >
                  {currentQuestion.subject}
                </span>
                <h2
                  className="text-white text-xl leading-relaxed"
                  style={{ fontFamily: 'Fredoka, sans-serif' }}
                >
                  {currentQuestion.text}
                </h2>
              </div>

              {/* Answer options */}
              <div className="grid grid-cols-2 gap-3 flex-1">
                {currentQuestion.options.map((option, i) => {
                  const color = ANSWER_COLORS[i];
                  const isSelected = selectedAnswer === i;
                  const isMyAnswer = isSelected;

                  return (
                    <motion.button
                      key={i}
                      whileHover={{ scale: selectedAnswer === null ? 1.03 : 1 }}
                      whileTap={{ scale: selectedAnswer === null ? 0.97 : 1 }}
                      onClick={() => handleAnswer(i)}
                      disabled={selectedAnswer !== null}
                      className="relative rounded-3xl p-4 flex flex-col items-start gap-2 cursor-pointer disabled:cursor-default transition-all text-left overflow-hidden"
                      style={{
                        backgroundColor: isMyAnswer ? color.hover : color.bg,
                        border: `2px solid ${isMyAnswer ? color.accent : color.border}`,
                        boxShadow: isMyAnswer ? `0 4px 20px ${color.accent}30` : 'none',
                        minHeight: '90px',
                      }}
                      animate={isMyAnswer ? { scale: [1, 1.04, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      <span
                        className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-white"
                        style={{ backgroundColor: color.accent, fontFamily: 'Fredoka, sans-serif' }}
                      >
                        {color.label}
                      </span>
                      <span
                        className="text-white/90 text-sm leading-snug"
                        style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}
                      >
                        {option}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Bot activity indicators */}
              <div className="flex items-center justify-center gap-3">
                {players.filter(p => p.isBot).map(bot => (
                  <div key={bot.id} className="flex items-center gap-1.5">
                    <span className="text-sm">{bot.emoji}</span>
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: botAnswers[bot.id] !== undefined ? '#F59E0B' : 'rgba(255,255,255,0.2)',
                      }}
                    />
                  </div>
                ))}
                <span className="text-white/30 text-xs" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  {Object.keys(botAnswers).length} answered
                </span>
              </div>
            </motion.div>
          )}

          {/* ─── REVEAL PHASE ─── */}
          {phase === 'reveal' && (
            <motion.div
              key={`reveal-${questionIndex}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col flex-1 px-4 pt-6 pb-6 gap-5 items-center"
            >
              {/* Winner announcement */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="w-full rounded-3xl p-5 text-center"
                style={{
                  background: roundWinner
                    ? 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,107,53,0.1))'
                    : 'rgba(255,255,255,0.05)',
                  border: roundWinner ? '1px solid rgba(255,215,0,0.3)' : '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {roundWinner ? (
                  <>
                    <motion.div
                      animate={{ scale: [1, 1.3, 1], rotate: [-10, 10, -5, 0] }}
                      transition={{ duration: 0.6 }}
                      className="text-5xl mb-2"
                    >
                      {roundWinner.id === myPlayerId ? '🎉' : roundWinner.emoji}
                    </motion.div>
                    <h3
                      className="text-2xl text-white mb-1"
                      style={{ fontFamily: 'Fredoka, sans-serif' }}
                    >
                      {roundWinner.id === myPlayerId ? 'You got it first!' : `${roundWinner.name} was fastest!`}
                    </h3>
                    <p className="text-yellow-400/80 text-sm" style={{ fontFamily: 'Nunito, sans-serif' }}>
                      {roundWinner.id === myPlayerId
                        ? `+${1000 + Math.max(0, Math.round(500 * (1 - (correctAnsweredMs ?? 7500) / (QUESTION_TIME * 1000))))} points! 🔥`
                        : 'Only the fastest correct answer earns points!'}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-5xl mb-2">⏰</div>
                    <h3 className="text-2xl text-white mb-1" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                      Time's up!
                    </h3>
                    <p className="text-white/50 text-sm" style={{ fontFamily: 'Nunito, sans-serif' }}>
                      Nobody answered correctly this round
                    </p>
                  </>
                )}
              </motion.div>

              {/* Correct answer reveal */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="w-full rounded-3xl p-5"
                style={{ backgroundColor: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)' }}
              >
                <p className="text-green-400/70 text-sm mb-2 font-bold" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  ✅ Correct Answer
                </p>
                <h3 className="text-white text-lg mb-1" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                  {currentQuestion.text}
                </h3>
                <div className="flex items-center gap-3 mt-3">
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                    style={{ backgroundColor: ANSWER_COLORS[currentQuestion.correctIndex].accent, fontFamily: 'Fredoka, sans-serif' }}
                  >
                    {ANSWER_COLORS[currentQuestion.correctIndex].label}
                  </span>
                  <span
                    className="text-green-300 font-semibold"
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  >
                    {currentQuestion.options[currentQuestion.correctIndex]}
                  </span>
                </div>
                {selectedAnswer !== null && selectedAnswer !== currentQuestion.correctIndex && (
                  <div className="flex items-center gap-3 mt-2 opacity-60">
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                      style={{ backgroundColor: ANSWER_COLORS[selectedAnswer].accent, fontFamily: 'Fredoka, sans-serif' }}
                    >
                      {ANSWER_COLORS[selectedAnswer].label}
                    </span>
                    <span className="text-red-400 line-through text-sm" style={{ fontFamily: 'Nunito, sans-serif' }}>
                      {currentQuestion.options[selectedAnswer]} (your answer)
                    </span>
                  </div>
                )}
              </motion.div>

              {/* Explanation */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="w-full rounded-3xl p-4"
                style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <p className="text-white/50 text-xs mb-1" style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}>
                  💡 Explanation
                </p>
                <p className="text-white/80 text-sm" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  {currentQuestion.explanation}
                </p>
              </motion.div>
            </motion.div>
          )}

          {/* ─── LEADERBOARD PHASE ─── */}
          {phase === 'leaderboard' && (
            <motion.div
              key={`leaderboard-${questionIndex}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="flex flex-col flex-1 px-4 pt-5 pb-6 gap-4"
            >
              <div className="text-center">
                <h3 className="text-3xl text-white" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                  Leaderboard
                </h3>
                <p className="text-white/40 text-sm" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  After question {questionIndex + 1}
                </p>
              </div>

              <div className="flex flex-col gap-3 flex-1">
                {sortedPlayers.map((player, rank) => {
                  const score = scores[player.id] ?? 0;
                  const diff = score - (prevScores[player.id] ?? 0);
                  const isMe = player.id === myPlayerId;
                  const rankEmoji = rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : null;

                  return (
                    <motion.div
                      key={player.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: rank * 0.08 }}
                      className="flex items-center gap-3 p-4 rounded-3xl"
                      style={{
                        background: isMe
                          ? 'linear-gradient(135deg, rgba(255,107,53,0.2), rgba(255,215,0,0.1))'
                          : rank === 0
                          ? 'linear-gradient(135deg, rgba(255,215,0,0.12), rgba(255,140,0,0.06))'
                          : 'rgba(255,255,255,0.04)',
                        border: isMe ? '1px solid rgba(255,107,53,0.4)' : rank === 0 ? '1px solid rgba(255,215,0,0.25)' : '1px solid rgba(255,255,255,0.07)',
                      }}
                    >
                      <div className="w-8 text-center">
                        {rankEmoji ? (
                          <span className="text-xl">{rankEmoji}</span>
                        ) : (
                          <span className="text-white/40 text-sm" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                            #{rank + 1}
                          </span>
                        )}
                      </div>

                      <PlayerAvatar player={player} size="sm" />

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-white font-semibold text-sm"
                            style={{ fontFamily: 'Nunito, sans-serif' }}
                          >
                            {player.name}
                          </span>
                          {isMe && (
                            <span
                              className="text-xs px-1.5 py-0.5 rounded-full text-orange-300 border border-orange-500/30"
                              style={{ backgroundColor: 'rgba(255,107,53,0.1)', fontFamily: 'Nunito, sans-serif' }}
                            >
                              You
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {diff > 0 && (
                          <motion.span
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="text-green-400 text-xs font-bold"
                            style={{ fontFamily: 'Nunito, sans-serif' }}
                          >
                            +{diff.toLocaleString()}
                          </motion.span>
                        )}
                        <span
                          className="text-yellow-300 font-bold"
                          style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '1.1rem' }}
                        >
                          {score.toLocaleString()}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="text-center">
                <p className="text-white/30 text-sm" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  {questionIndex + 1 < questions.length
                    ? `Question ${questionIndex + 2} coming up...`
                    : 'Final results loading...'}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}