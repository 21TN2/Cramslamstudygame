import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, FileText, ChevronLeft, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import { StarBackground } from '../components/StarBackground';
import { useGame } from '../context/GameContext';
import { generateQuestionsFromText } from '../data/questions';

type Tab = 'pdf' | 'text';
type Phase = 'upload' | 'generating' | 'review';

const GENERATION_STEPS = [
  { icon: '📖', text: 'Analyzing your notes...' },
  { icon: '🧠', text: 'Identifying key concepts...' },
  { icon: '✨', text: 'Crafting tricky questions...' },
  { icon: '🎯', text: 'Calibrating difficulty...' },
  { icon: '🚀', text: 'Almost ready!' },
];

const SUBJECT_ICONS: Record<string, string> = {
  Biology: '🧬',
  History: '📜',
  Physics: '⚛️',
  Chemistry: '🧪',
  Mathematics: '📐',
  Literature: '📚',
  Geography: '🌍',
  'Computer Science': '💻',
  Economics: '📊',
};

export default function CreateGame() {
  const navigate = useNavigate();
  const { initGame } = useGame();

  const [tab, setTab] = useState<Tab>('pdf');
  const [phase, setPhase] = useState<Phase>('upload');
  const [gameName, setGameName] = useState('');
  const [myName, setMyName] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [questionCount, setQuestionCount] = useState(10);
  const [generationStep, setGenerationStep] = useState(0);
  const [generatedQuestions, setGeneratedQuestions] = useState<ReturnType<typeof generateQuestionsFromText>>([]);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file.');
      return;
    }
    setError('');
    setUploadedFileName(file.name);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileChange(file);
  }, []);

  const canGenerate =
    gameName.trim().length > 0 &&
    myName.trim().length > 0 &&
    (tab === 'pdf' ? uploadedFileName.length > 0 : pastedText.trim().length > 20);

  const startGeneration = async () => {
    if (!canGenerate) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');
    setPhase('generating');

    const content = tab === 'text' ? pastedText : uploadedFileName;
    const totalMs = 3200;
    const stepMs = totalMs / GENERATION_STEPS.length;

    for (let i = 0; i < GENERATION_STEPS.length; i++) {
      await new Promise(r => setTimeout(r, stepMs));
      setGenerationStep(i + 1);
    }

    const questions = generateQuestionsFromText(content, questionCount);
    setGeneratedQuestions(questions);
    setPhase('review');
  };

  const handleStart = () => {
    initGame(gameName.trim(), generatedQuestions, myName.trim(), questionCount);
    navigate('/lobby');
  };

  const subjects = [...new Set(generatedQuestions.map(q => q.subject))];

  return (
    <div className="min-h-screen bg-[#0d0820] flex flex-col items-center px-4 py-8 relative overflow-hidden">
      <StarBackground />

      <div className="relative z-10 w-full max-w-xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer text-white"
          >
            <ChevronLeft size={20} />
          </button>
          <h2
            className="text-3xl text-white"
            style={{ fontFamily: 'Fredoka, sans-serif' }}
          >
            Create a Game
          </h2>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* UPLOAD PHASE */}
          {phase === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col gap-5"
            >
              {/* Game name + host name */}
              <div className="rounded-3xl p-5 border border-white/10 bg-white/4" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
                <label className="text-white/70 text-sm mb-2 block" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  Game Name *
                </label>
                <input
                  type="text"
                  value={gameName}
                  onChange={e => setGameName(e.target.value)}
                  placeholder="e.g. Biology Midterm Blitz"
                  className="w-full bg-white/8 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-white/30 outline-none focus:border-orange-500/60 transition-colors"
                  style={{ fontFamily: 'Nunito, sans-serif', backgroundColor: 'rgba(255,255,255,0.06)' }}
                />
                <label className="text-white/70 text-sm mt-4 mb-2 block" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  Your Name *
                </label>
                <input
                  type="text"
                  value={myName}
                  onChange={e => setMyName(e.target.value)}
                  placeholder="e.g. Alex"
                  className="w-full bg-white/8 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-white/30 outline-none focus:border-orange-500/60 transition-colors"
                  style={{ fontFamily: 'Nunito, sans-serif', backgroundColor: 'rgba(255,255,255,0.06)' }}
                />
              </div>

              {/* Upload source tabs */}
              <div className="rounded-3xl overflow-hidden border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
                {/* Tabs */}
                <div className="flex border-b border-white/10">
                  {(['pdf', 'text'] as Tab[]).map(t => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`flex-1 py-3.5 flex items-center justify-center gap-2 transition-all text-sm cursor-pointer ${
                        tab === t
                          ? 'text-orange-400 border-b-2 border-orange-400 bg-orange-500/5'
                          : 'text-white/40 hover:text-white/70'
                      }`}
                      style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}
                    >
                      {t === 'pdf' ? <Upload size={15} /> : <FileText size={15} />}
                      {t === 'pdf' ? 'Upload PDF' : 'Paste Text'}
                    </button>
                  ))}
                </div>

                <div className="p-5">
                  {tab === 'pdf' ? (
                    <div
                      onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`rounded-2xl border-2 border-dashed flex flex-col items-center justify-center py-10 cursor-pointer transition-all ${
                        isDragging
                          ? 'border-orange-400 bg-orange-500/10'
                          : uploadedFileName
                          ? 'border-green-500/60 bg-green-500/5'
                          : 'border-white/20 hover:border-orange-400/50 hover:bg-white/3'
                      }`}
                    >
                      {uploadedFileName ? (
                        <>
                          <CheckCircle className="text-green-400 mb-2" size={32} />
                          <p className="text-green-400 font-semibold" style={{ fontFamily: 'Nunito, sans-serif' }}>
                            {uploadedFileName}
                          </p>
                          <p className="text-white/40 text-sm mt-1" style={{ fontFamily: 'Nunito, sans-serif' }}>
                            Click to replace
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="text-4xl mb-3">📄</div>
                          <p className="text-white/70" style={{ fontFamily: 'Nunito, sans-serif' }}>
                            Drop your PDF here or <span className="text-orange-400 underline">browse</span>
                          </p>
                          <p className="text-white/30 text-xs mt-1" style={{ fontFamily: 'Nunito, sans-serif' }}>
                            Lecture notes, textbook chapters, study guides
                          </p>
                        </>
                      )}
                    </div>
                  ) : (
                    <textarea
                      value={pastedText}
                      onChange={e => setPastedText(e.target.value)}
                      placeholder="Paste your lecture notes, study material, or any text here... The AI will extract key concepts and generate challenging questions."
                      rows={7}
                      className="w-full rounded-2xl border border-white/10 px-4 py-3 text-white placeholder-white/30 outline-none focus:border-orange-500/60 transition-colors resize-none"
                      style={{ fontFamily: 'Nunito, sans-serif', backgroundColor: 'rgba(255,255,255,0.06)' }}
                    />
                  )}
                </div>
              </div>

              {/* Question count */}
              <div className="rounded-3xl p-5 border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
                <p className="text-white/70 text-sm mb-3" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  Number of Questions
                </p>
                <div className="flex gap-3">
                  {[5, 10, 15, 20].map(n => (
                    <button
                      key={n}
                      onClick={() => setQuestionCount(n)}
                      className={`flex-1 py-2.5 rounded-2xl text-sm font-bold cursor-pointer transition-all ${
                        questionCount === n
                          ? 'text-white'
                          : 'text-white/50 border border-white/10 hover:border-white/20'
                      }`}
                      style={{
                        fontFamily: 'Nunito, sans-serif',
                        background: questionCount === n
                          ? 'linear-gradient(135deg, #FF6B35, #FFD700)'
                          : 'rgba(255,255,255,0.04)',
                        boxShadow: questionCount === n ? '0 4px 16px rgba(255,107,53,0.35)' : 'none',
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm px-1" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  <AlertCircle size={15} />
                  {error}
                </div>
              )}

              <motion.button
                whileHover={{ scale: canGenerate ? 1.03 : 1 }}
                whileTap={{ scale: canGenerate ? 0.97 : 1 }}
                onClick={startGeneration}
                disabled={!canGenerate}
                className="w-full py-5 rounded-3xl flex items-center justify-center gap-3 text-white text-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  fontFamily: 'Fredoka, sans-serif',
                  background: canGenerate
                    ? 'linear-gradient(135deg, #FF6B35, #FF8C00, #FFD700)'
                    : 'rgba(255,255,255,0.1)',
                  boxShadow: canGenerate ? '0 8px 32px rgba(255,107,53,0.45)' : 'none',
                }}
              >
                <Sparkles size={22} />
                Generate Questions with AI
              </motion.button>
            </motion.div>
          )}

          {/* GENERATING PHASE */}
          {phase === 'generating' && (
            <motion.div
              key="generating"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center min-h-[400px] gap-8"
            >
              {/* Spinning star loader */}
              <div className="relative w-28 h-28">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-full border-4 border-transparent"
                  style={{
                    borderTopColor: '#FF6B35',
                    borderRightColor: '#FFD700',
                  }}
                />
                <div className="absolute inset-3 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,107,53,0.15)' }}>
                  <span className="text-4xl">🧠</span>
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-2xl text-white mb-6" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                  AI is cooking up questions...
                </h3>
                <div className="flex flex-col gap-3">
                  {GENERATION_STEPS.map((step, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0.2, x: -10 }}
                      animate={{
                        opacity: generationStep > i ? 1 : generationStep === i ? 0.6 : 0.2,
                        x: 0,
                      }}
                      className="flex items-center gap-3 text-white/80"
                      style={{ fontFamily: 'Nunito, sans-serif' }}
                    >
                      <span className="text-lg">{generationStep > i ? '✅' : step.icon}</span>
                      <span className={generationStep > i ? 'text-green-400' : 'text-white/60'}>
                        {step.text}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* REVIEW PHASE */}
          {phase === 'review' && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-5"
            >
              <div className="rounded-3xl p-5 border border-green-500/30" style={{ backgroundColor: 'rgba(34,197,94,0.05)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="text-green-400" size={24} />
                  <h3 className="text-white text-xl" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                    {generatedQuestions.length} Questions Generated!
                  </h3>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {subjects.map(sub => (
                    <span
                      key={sub}
                      className="px-3 py-1 rounded-full text-xs text-orange-300 border border-orange-500/30"
                      style={{ backgroundColor: 'rgba(255,107,53,0.1)', fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}
                    >
                      {SUBJECT_ICONS[sub] ?? '📌'} {sub}
                    </span>
                  ))}
                </div>

                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1 custom-scroll">
                  {generatedQuestions.slice(0, 5).map((q, i) => (
                    <div
                      key={q.id}
                      className="flex gap-3 items-start p-3 rounded-2xl"
                      style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
                    >
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white shrink-0 mt-0.5"
                        style={{ background: 'linear-gradient(135deg, #FF6B35, #FFD700)', fontFamily: 'Nunito, sans-serif', fontWeight: 800 }}
                      >
                        {i + 1}
                      </span>
                      <p className="text-white/80 text-sm" style={{ fontFamily: 'Nunito, sans-serif' }}>
                        {q.text}
                      </p>
                    </div>
                  ))}
                  {generatedQuestions.length > 5 && (
                    <p className="text-white/40 text-sm text-center py-1" style={{ fontFamily: 'Nunito, sans-serif' }}>
                      + {generatedQuestions.length - 5} more questions...
                    </p>
                  )}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleStart}
                className="w-full py-5 rounded-3xl flex items-center justify-center gap-3 text-white text-xl cursor-pointer"
                style={{
                  fontFamily: 'Fredoka, sans-serif',
                  background: 'linear-gradient(135deg, #FF6B35, #FF8C00, #FFD700)',
                  boxShadow: '0 8px 32px rgba(255,107,53,0.45)',
                }}
              >
                <span className="text-2xl">🚀</span>
                Open the Lobby
              </motion.button>

              <button
                onClick={() => setPhase('upload')}
                className="text-white/40 hover:text-white/70 text-sm transition-colors py-2 cursor-pointer"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                ← Regenerate questions
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={e => e.target.files?.[0] && handleFileChange(e.target.files[0])}
      />
    </div>
  );
}
