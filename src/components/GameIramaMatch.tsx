import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Square,
  Headphones,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Sparkles,
  Trophy,
  ExternalLink,
  AlertCircle,
  Volume2,
  ArrowRight,
  Home,
  ShieldCheck,
  Star
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PADANKAN_IRAMA_QUESTIONS, PadankanIramaQuestionData } from '../data/syairData';
import { IramaId } from '../types/syair';
import { audioEngine } from '../utils/audioEngine';
import { bgMusicManager } from '../utils/bgMusicManager';
import { getTeacherAudioKeys } from '../utils/storage';
import { motion, AnimatePresence } from 'framer-motion';

interface GameIramaMatchProps {
  onEarnXp: (amount: number, reason: string) => void;
  onEarnBadge: (badgeId: string) => void;
  onMarkModuleCompleted: () => void;
  onBackToMenu?: () => void;
}

export const GameIramaMatch: React.FC<GameIramaMatchProps> = ({
  onEarnXp,
  onEarnBadge,
  onMarkModuleCompleted,
  onBackToMenu
}) => {
  // Game Flow States: 'intro' | 'playing' | 'completed'
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'completed'>('intro');
  const [questions, setQuestions] = useState<PadankanIramaQuestionData[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedChoice, setSelectedChoice] = useState<IramaId | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [hasAwardedCurrentQuestionXp, setHasAwardedCurrentQuestionXp] = useState<boolean>(false);
  const [floatingXpPopup, setFloatingXpPopup] = useState<string | null>(null);

  // Audio Playback States
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [isAudioPaused, setIsAudioPaused] = useState<boolean>(false);
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(0);
  const [hasPlayerError, setHasPlayerError] = useState<boolean>(false);
  const [isPlayerReady, setIsPlayerReady] = useState<boolean>(false);

  // Scoring & Stats
  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0);
  const [totalXpEarnedInGame, setTotalXpEarnedInGame] = useState<number>(0);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);

  // YouTube Player Ref & Monitoring Interval
  const ytPlayerRef = useRef<any>(null);
  const monitorIntervalRef = useRef<number | null>(null);

  // Helper to load and prepare the 4 mandatory questions with teacher-verified keys
  const prepareSessionQuestions = (): PadankanIramaQuestionData[] => {
    const teacherKeys = getTeacherAudioKeys();
    const updated = PADANKAN_IRAMA_QUESTIONS.map((q) => {
      if (q.id === 3 && teacherKeys.audio3CorrectIrama) {
        return {
          ...q,
          correctIrama: teacherKeys.audio3CorrectIrama,
          verificationStatus: 'disahkan' as const,
          verificationNote: `Disahkan oleh guru: Irama ${
            teacherKeys.audio3CorrectIrama === 'dodoi' ? 'Dodoi' : 'Selendang Delima'
          }`
        };
      }
      if (q.id === 4 && teacherKeys.audio4CorrectIrama) {
        return {
          ...q,
          correctIrama: teacherKeys.audio4CorrectIrama,
          verificationStatus: 'disahkan' as const,
          verificationNote: `Disahkan oleh guru: Irama ${
            teacherKeys.audio4CorrectIrama === 'dodoi' ? 'Dodoi' : 'Selendang Delima'
          }`
        };
      }
      return q;
    });

    // Shuffle questions so each session has a varied order, but all 4 segments are used exactly once
    const shuffled = [...updated].sort(() => Math.random() - 0.5);
    return shuffled;
  };

  // Initialize questions on mount and ensure background music is paused
  useEffect(() => {
    setQuestions(prepareSessionQuestions());
    bgMusicManager.pauseForActivity();

    return () => {
      stopGameAudio();
      bgMusicManager.resumeAfterActivity();
    };
  }, []);

  const currentQ: PadankanIramaQuestionData | undefined = questions[currentQuestionIndex];

  // Stop game audio completely
  const stopGameAudio = () => {
    if (monitorIntervalRef.current) {
      clearInterval(monitorIntervalRef.current);
      monitorIntervalRef.current = null;
    }
    if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
      try {
        ytPlayerRef.current.pauseVideo();
      } catch {}
    }
    setIsAudioPlaying(false);
    setIsAudioPaused(false);
  };

  // Start monitoring timestamp to strictly enforce segment end time
  const startSegmentMonitoring = (endTime: number) => {
    if (monitorIntervalRef.current) clearInterval(monitorIntervalRef.current);

    monitorIntervalRef.current = window.setInterval(() => {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
        try {
          const currentT = ytPlayerRef.current.getCurrentTime();
          setCurrentTimeSec(Math.round(currentT));

          // Enforce exact segment boundary
          if (currentT >= endTime) {
            stopGameAudio();
            setCurrentTimeSec(endTime);
          }
        } catch {}
      }
    }, 250);
  };

  // Cue or initialize YouTube player when current question changes in 'playing' state
  useEffect(() => {
    if (gameState !== 'playing' || !currentQ) return;

    setHasPlayerError(false);
    setIsAudioPlaying(false);
    setIsAudioPaused(false);
    setCurrentTimeSec(currentQ.startTime);

    const initOrCuePlayer = () => {
      if (window.YT && window.YT.Player) {
        if (!ytPlayerRef.current) {
          try {
            ytPlayerRef.current = new window.YT.Player('padankan-irama-yt-player', {
              videoId: currentQ.videoId,
              playerVars: {
                autoplay: 0,
                controls: 0,
                start: currentQ.startTime,
                enablejsapi: 1,
                modestbranding: 1,
                rel: 0,
                playsinline: 1
              },
              events: {
                onReady: () => {
                  setIsPlayerReady(true);
                  setHasPlayerError(false);
                },
                onStateChange: (event: any) => {
                  // 1: PLAYING, 2: PAUSED, 0: ENDED
                  if (event.data === 1) {
                    setIsAudioPlaying(true);
                    setIsAudioPaused(false);
                  } else if (event.data === 2) {
                    setIsAudioPlaying(false);
                    setIsAudioPaused(true);
                  } else if (event.data === 0) {
                    setIsAudioPlaying(false);
                    setIsAudioPaused(false);
                  }
                },
                onError: () => {
                  setHasPlayerError(true);
                  setIsAudioPlaying(false);
                }
              }
            });
          } catch (e) {
            console.warn('Ralat inisialisasi pemain YouTube Teka Irama:', e);
            setHasPlayerError(true);
          }
        } else {
          try {
            ytPlayerRef.current.cueVideoById({
              videoId: currentQ.videoId,
              startSeconds: currentQ.startTime,
              endSeconds: currentQ.endTime
            });
            setIsPlayerReady(true);
          } catch (e) {
            console.warn('Ralat menukar segmen video YouTube:', e);
          }
        }
      }
    };

    const timer = setTimeout(initOrCuePlayer, 150);
    return () => {
      clearTimeout(timer);
      stopGameAudio();
    };
  }, [currentQuestionIndex, gameState, currentQ?.videoId]);

  // Mainkan Audio: Starts playback from the specified segment start time or resumes if paused
  const handlePlayAudio = () => {
    if (!currentQ) return;

    // Ensure background music is paused
    bgMusicManager.pauseForActivity();

    if (isAudioPaused && ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === 'function') {
      try {
        ytPlayerRef.current.playVideo();
        setIsAudioPlaying(true);
        setIsAudioPaused(false);
        startSegmentMonitoring(currentQ.endTime);
        return;
      } catch {}
    }

    if (ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
      try {
        ytPlayerRef.current.seekTo(currentQ.startTime, true);
        ytPlayerRef.current.playVideo();
        setIsAudioPlaying(true);
        setIsAudioPaused(false);
        setCurrentTimeSec(currentQ.startTime);
        startSegmentMonitoring(currentQ.endTime);
      } catch (err) {
        console.warn('Gagal memulakan audio:', err);
        setHasPlayerError(true);
      }
    } else {
      setHasPlayerError(true);
    }
  };

  // Jeda Audio: Pauses the currently playing audio segment
  const handlePauseAudio = () => {
    if (monitorIntervalRef.current) {
      clearInterval(monitorIntervalRef.current);
      monitorIntervalRef.current = null;
    }
    if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
      try {
        ytPlayerRef.current.pauseVideo();
      } catch {}
    }
    setIsAudioPlaying(false);
    setIsAudioPaused(true);
    audioEngine.playTapSfx();
  };

  // Start / Restart game
  const handleStartGame = () => {
    const freshQuestions = prepareSessionQuestions();
    setQuestions(freshQuestions);
    setGameState('playing');
    setCurrentQuestionIndex(0);
    setCorrectAnswersCount(0);
    setTotalXpEarnedInGame(0);
    setCurrentStreak(0);
    setBestStreak(0);
    setSelectedChoice(null);
    setIsAnswerSubmitted(false);
    setHasAwardedCurrentQuestionXp(false);
    audioEngine.playTapSfx();
  };

  // Select an irama choice (Dodoi or Selendang Delima)
  const handleSelectChoice = (choice: IramaId) => {
    if (isAnswerSubmitted) return;
    setSelectedChoice(choice);
    audioEngine.playTapSfx();
  };

  // Submit and verify answer
  const handleSubmitAnswer = () => {
    if (!currentQ || !selectedChoice || isAnswerSubmitted || hasAwardedCurrentQuestionXp) return;

    setIsAnswerSubmitted(true);
    setHasAwardedCurrentQuestionXp(true);
    stopGameAudio();

    const isCorrect = selectedChoice === currentQ.correctIrama;
    if (isCorrect) {
      audioEngine.playCorrectSfx();
      setCorrectAnswersCount((prev) => prev + 1);
      setTotalXpEarnedInGame((prev) => prev + 10);
      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      setBestStreak((prev) => Math.max(prev, newStreak));
      setFloatingXpPopup('+10 XP!');
      try {
        confetti({
          particleCount: 45,
          spread: 65,
          origin: { y: 0.6 },
          colors: ['#D4AF37', '#10B981', '#F59E0B']
        });
      } catch {}
      setTimeout(() => setFloatingXpPopup(null), 2400);
      onEarnXp(10, `Teka Irama: Jawapan Betul (${currentQ.correctIrama === 'dodoi' ? 'Irama Dodoi' : 'Irama Selendang Delima'})`);
    } else {
      audioEngine.playIncorrectSfx();
      setCurrentStreak(0);
    }
  };

  // Advance to next question or complete game session
  const handleNextQuestion = () => {
    stopGameAudio();

    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedChoice(null);
      setIsAnswerSubmitted(false);
      setHasAwardedCurrentQuestionXp(false);
      audioEngine.playTapSfx();
    } else {
      // Completed all 4 questions
      setGameState('completed');
      audioEngine.playFanfareSfx();

      const finalCorrectCount = correctAnswersCount;
      const isBadgeEarned = finalCorrectCount >= 3; // 3/4 or 4/4 qualifies for Jaguh Irama

      if (isBadgeEarned) {
        onEarnBadge('jaguh_irama');
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      }
      onMarkModuleCompleted();
      bgMusicManager.resumeAfterActivity();
    }
  };

  const handleReturnToMenu = () => {
    stopGameAudio();
    bgMusicManager.resumeAfterActivity();
    if (onBackToMenu) {
      onBackToMenu();
    }
  };

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Accuracy calculation for 4 questions
  const calculateAccuracyPct = (correct: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((correct / total) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Hidden YouTube Iframe Player for the Teka Irama Audio */}
      <div className="fixed -bottom-96 -left-96 w-1 h-1 opacity-0 pointer-events-none" aria-hidden="true">
        <div id="padankan-irama-yt-player" />
      </div>

      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-amber-900/10 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 uppercase tracking-wider mb-1">
            <span>Permainan 01</span>
            <span aria-hidden="true">·</span>
            <span>Ujian Pendengaran & Pengecaman Irama</span>
          </div>
          <h2 className="text-2xl font-bold text-amber-950 font-display">
            Teka Irama
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Dua kategori irama sahaja: <strong>Irama Dodoi</strong> dan <strong>Irama Selendang Delima</strong> dengan 4 segmen audio rasmi YouTube.
          </p>
        </div>

        {/* Live Counters Strip with Framer Motion spring updates */}
        {gameState === 'playing' && (
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap relative">
            <div className="bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 text-center min-w-[70px]">
              <span className="text-[10px] text-amber-800 font-bold uppercase block">Betul</span>
              <motion.div
                key={correctAnswersCount}
                initial={{ scale: 1.35, y: -2 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 450, damping: 14 }}
                className="text-base font-bold font-mono text-amber-950 tabular-nums block"
              >
                {correctAnswersCount}/4
              </motion.div>
            </div>

            <div className="bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-200 text-center min-w-[70px]">
              <span className="text-[10px] text-orange-800 font-bold uppercase block">Streak 🔥</span>
              <motion.div
                key={currentStreak}
                initial={{ scale: 1.35, y: -2 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 450, damping: 14 }}
                className="text-base font-bold font-mono text-orange-950 tabular-nums block"
              >
                {currentStreak}
              </motion.div>
            </div>

            <div className="bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-center min-w-[70px] relative">
              <span className="text-[10px] text-emerald-800 font-bold uppercase block">XP Diraih</span>
              <motion.div
                key={totalXpEarnedInGame}
                initial={{ scale: 1.35, y: -2 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 450, damping: 14 }}
                className="text-base font-bold font-mono text-emerald-950 tabular-nums block"
              >
                +{totalXpEarnedInGame}
              </motion.div>

              {/* Floating +10 XP popup */}
              <AnimatePresence>
                {floatingXpPopup && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.6 }}
                    animate={{ opacity: 1, y: -28, scale: 1.15 }}
                    exit={{ opacity: 0, y: -40, scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                    className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 font-bold px-2 py-0.5 rounded-full text-xs shadow-lg border border-amber-300 pointer-events-none whitespace-nowrap z-20 flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-amber-900" />
                    <span>{floatingXpPopup}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* STATE 1: INTRO SCREEN */}
      {/* ======================================================== */}
      {gameState === 'intro' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shadow-xs">
            <Headphones className="w-10 h-10" />
          </div>

          <div className="max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono font-bold text-amber-700 uppercase tracking-widest block">
              Arahan Rasmi Permainan
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold font-display text-amber-950 leading-snug">
              “Dengarlah alunan muzik dengan teliti. Kenal pasti irama yang dimainkan, kemudian pilih jawapan yang betul!”
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans pt-1">
              Permainan ini mengandungi tepat <strong>4 soalan</strong>. Anda akan mendengar setiap segmen audio daripada rakaman video YouTube dan mengenal pasti sama ada ia <strong>Irama Dodoi</strong> atau <strong>Irama Selendang Delima</strong>.
            </p>
          </div>

          {/* 4 Audio Segments Guide Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto text-left text-xs">
            <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200/80">
              <div className="flex items-center justify-between mb-1">
                <strong className="text-amber-950 font-bold">1. Irama Dodoi</strong>
                <span className="text-[10px] font-mono bg-amber-200/70 text-amber-900 px-1.5 py-0.5 rounded">
                  Perlahan
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Alunan sangat perlahan, mendayu-dayu dan menenangkan jiwa. Sangat sesuai untuk bait nasihat moral dan kasih ibu bapa.
              </p>
            </div>

            <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200/80">
              <div className="flex items-center justify-between mb-1">
                <strong className="text-amber-950 font-bold">2. Irama Selendang Delima</strong>
                <span className="text-[10px] font-mono bg-amber-200/70 text-amber-900 px-1.5 py-0.5 rounded">
                  Merdu Bersahaja
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Alunan tradisional Melayu dengan lenggok merdu bersahaja dan seimbang, melatih intonasi dan kesantunan bahasa sastera.
              </p>
            </div>
          </div>

          {/* Rules & Rewards summary */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-600 pt-2">
            <span className="inline-flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>4 Soalan (10 XP setiap soalan)</span>
            </span>
            <span className="inline-flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Maksimum 40 XP</span>
            </span>
            <span className="inline-flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg">
              <Trophy className="w-3.5 h-3.5 text-amber-600" />
              <span>Lencana Jaguh Irama (3/4 betul)</span>
            </span>
          </div>

          {/* Start Game Button */}
          <div className="pt-2">
            <button
              onClick={handleStartGame}
              className="px-8 py-3.5 bg-amber-800 hover:bg-amber-700 text-white font-bold rounded-xl text-sm shadow-md transition-all active:scale-95 inline-flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Mula Permainan</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STATE 2: PLAYING ROUND SCREEN */}
      {/* ======================================================== */}
      {gameState === 'playing' && currentQ && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          {/* Question Progress Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-semibold text-slate-500 font-mono block">
                Soalan {currentQuestionIndex + 1} daripada {questions.length}
              </span>
              <h3 className="text-base font-bold text-slate-900 font-display">
                {currentQ.label}
              </h3>
            </div>

            {/* Step Indicators */}
            <div className="flex items-center gap-2">
              {questions.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    idx === currentQuestionIndex
                      ? 'w-8 bg-amber-500 ring-2 ring-amber-300'
                      : idx < currentQuestionIndex
                      ? 'w-4 bg-emerald-500'
                      : 'w-4 bg-slate-200'
                  }`}
                  title={`Soalan ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Audio Player Deck */}
          <div className="bg-gradient-to-br from-amber-950 via-stone-900 to-amber-950 rounded-2xl p-6 sm:p-8 text-center text-amber-50 shadow-inner space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center">
              <Volume2
                className={`w-8 h-8 text-amber-300 ${isAudioPlaying ? 'animate-bounce' : ''}`}
              />
            </div>

            <div className="max-w-md mx-auto space-y-1">
              <div className="flex items-center justify-center gap-2 text-xs text-amber-400 font-mono uppercase tracking-widest font-bold">
                <span>Segmen Audio ({formatTime(currentQ.startTime)} - {formatTime(currentQ.endTime)})</span>
                {currentQ.verificationStatus === 'disahkan' && (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-600/50 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Disahkan</span>
                  </span>
                )}
              </div>
              <p className="text-sm font-serif italic text-amber-100 leading-relaxed">
                “{currentQ.clueText}”
              </p>
            </div>

            {/* Time progress bar */}
            <div className="max-w-xs mx-auto space-y-1">
              <div className="flex justify-between text-[11px] font-mono text-amber-300">
                <span>Masa Semasa: {formatTime(currentTimeSec)}</span>
                <span>Tamat: {formatTime(currentQ.endTime)}</span>
              </div>
              <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 transition-all duration-300 rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(
                        0,
                        ((currentTimeSec - currentQ.startTime) /
                          (currentQ.endTime - currentQ.startTime)) *
                          100
                      )
                    )}%`
                  }}
                />
              </div>
            </div>

            {/* Audio Controls: Play, Pause, External Link */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              {/* Play Button */}
              <button
                onClick={handlePlayAudio}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 ${
                  isAudioPlaying
                    ? 'bg-amber-300 text-amber-950 ring-2 ring-amber-400'
                    : 'bg-amber-400 hover:bg-amber-300 text-amber-950'
                }`}
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{isAudioPaused ? 'Sambung Main' : 'Mainkan Audio'}</span>
              </button>

              {/* Pause Button */}
              <button
                onClick={handlePauseAudio}
                disabled={!isAudioPlaying}
                className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all active:scale-95 ${
                  isAudioPlaying
                    ? 'bg-stone-800 hover:bg-stone-700 text-amber-200 border border-amber-700/60'
                    : 'bg-stone-900 text-stone-500 border border-stone-800 cursor-not-allowed'
                }`}
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Jeda Audio</span>
              </button>

              {/* External YouTube Link Fallback */}
              <a
                href={currentQ.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-800/80 hover:bg-stone-800 text-amber-200 border border-amber-900/60 rounded-xl text-xs transition-colors"
                title="Buka Video Asal di YouTube"
              >
                <span>Buka Video Asal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Error Message if video fails to load */}
            {hasPlayerError && (
              <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-200 rounded-xl text-xs flex items-center justify-center gap-2 max-w-lg mx-auto text-left">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <div>
                  <strong className="block font-semibold">Audio tidak dapat dimainkan buat masa ini.</strong>
                  <span>Sila cuba sekali lagi atau klik butang “Buka Video Asal” di atas untuk mendengar di YouTube.</span>
                </div>
              </div>
            )}

            <p className="text-[11px] text-amber-300/70 italic">
              Petunjuk: {currentQ.hint}
            </p>
          </div>

          {/* TWO CHOICES ONLY: Dodoi & Selendang Delima */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Pilih Kategori Irama:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: Dodoi */}
              {(() => {
                const choiceId: IramaId = 'dodoi';
                const isSelected = selectedChoice === choiceId;
                const isTargetCorrect = choiceId === currentQ.correctIrama;

                let stateClasses = 'bg-slate-50 border-slate-200 hover:bg-amber-50/70 hover:border-amber-400 text-slate-800';
                if (isAnswerSubmitted) {
                  if (isTargetCorrect) {
                    stateClasses = 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/40';
                  } else if (isSelected && !isTargetCorrect) {
                    stateClasses = 'bg-rose-50 border-rose-300 text-rose-950 line-through opacity-75';
                  }
                } else if (isSelected) {
                  stateClasses = 'bg-amber-100 border-amber-500 text-amber-950 ring-2 ring-amber-400/50 shadow-xs';
                }

                return (
                  <motion.button
                    whileHover={!isAnswerSubmitted ? { scale: 1.015 } : {}}
                    whileTap={!isAnswerSubmitted ? { scale: 0.985 } : {}}
                    onClick={() => handleSelectChoice(choiceId)}
                    disabled={isAnswerSubmitted}
                    className={`p-5 rounded-2xl border text-left transition-all ${stateClasses}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded">
                        Perlahan & Mendayu-dayu
                      </span>
                      {isAnswerSubmitted && isTargetCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      )}
                      {isAnswerSubmitted && isSelected && !isTargetCorrect && (
                        <XCircle className="w-5 h-5 text-rose-500" />
                      )}
                    </div>
                    <h4 className="text-lg font-bold font-display text-slate-900">
                      Dodoi
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Alunan sangat perlahan, mendayu-dayu dan membuai jiwa, menyampaikan bait nasihat akhlak mulia.
                    </p>
                  </motion.button>
                );
              })()}

              {/* Option 2: Selendang Delima */}
              {(() => {
                const choiceId: IramaId = 'selendang_delima';
                const isSelected = selectedChoice === choiceId;
                const isTargetCorrect = choiceId === currentQ.correctIrama;

                let stateClasses = 'bg-slate-50 border-slate-200 hover:bg-amber-50/70 hover:border-amber-400 text-slate-800';
                if (isAnswerSubmitted) {
                  if (isTargetCorrect) {
                    stateClasses = 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/40';
                  } else if (isSelected && !isTargetCorrect) {
                    stateClasses = 'bg-rose-50 border-rose-300 text-rose-950 line-through opacity-75';
                  }
                } else if (isSelected) {
                  stateClasses = 'bg-amber-100 border-amber-500 text-amber-950 ring-2 ring-amber-400/50 shadow-xs';
                }

                return (
                  <motion.button
                    whileHover={!isAnswerSubmitted ? { scale: 1.015 } : {}}
                    whileTap={!isAnswerSubmitted ? { scale: 0.985 } : {}}
                    onClick={() => handleSelectChoice(choiceId)}
                    disabled={isAnswerSubmitted}
                    className={`p-5 rounded-2xl border text-left transition-all ${stateClasses}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded">
                        Sederhana & Merdu
                      </span>
                      {isAnswerSubmitted && isTargetCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      )}
                      {isAnswerSubmitted && isSelected && !isTargetCorrect && (
                        <XCircle className="w-5 h-5 text-rose-500" />
                      )}
                    </div>
                    <h4 className="text-lg font-bold font-display text-slate-900">
                      Selendang Delima
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Alunan tradisional Melayu dengan lenggok merdu bersahaja dan seimbang, melatih sebutan baku.
                    </p>
                  </motion.button>
                );
              })()}
            </div>
          </div>

          {/* Action Footer & Prompt Feedback */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
            {!isAnswerSubmitted ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedChoice}
                className="w-full sm:w-auto px-6 py-2.5 bg-amber-800 hover:bg-amber-700 disabled:opacity-40 text-white font-bold rounded-xl text-xs transition-colors shadow-sm ml-auto"
              >
                Sahkan Jawapan Irama
              </button>
            ) : (
              <div className="w-full space-y-3">
                <div
                  className={`p-4 rounded-xl text-xs sm:text-sm font-sans ${
                    selectedChoice === currentQ.correctIrama
                      ? 'bg-emerald-50 text-emerald-950 border border-emerald-200'
                      : 'bg-rose-50 text-rose-950 border border-rose-200'
                  }`}
                >
                  <strong className="block mb-1 font-bold text-sm">
                    {selectedChoice === currentQ.correctIrama
                      ? 'Tepat sekali! Anda berjaya mengenal pasti irama yang dimainkan. +10 XP.'
                      : 'Belum tepat. Cuba dengar semula alunan muzik dan perhatikan lenggok iramanya.'}
                  </strong>
                  <p>{currentQ.explanation}</p>
                </div>

                <button
                  onClick={handleNextQuestion}
                  className="w-full sm:w-auto px-6 py-2.5 bg-amber-800 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm ml-auto flex items-center justify-center gap-2"
                >
                  <span>
                    {currentQuestionIndex + 1 < questions.length
                      ? 'Soalan Seterusnya'
                      : 'Tamatkan Permainan & Lihat Keputusan'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STATE 3: COMPLETED SUMMARY SCREEN */}
      {/* ======================================================== */}
      {gameState === 'completed' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-6 shadow-sm">
          <div className="w-20 h-20 mx-auto rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shadow-xs">
            <Trophy className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-widest block font-mono">
              Keputusan Penuh: Teka Irama
            </span>
            <h3 className="text-3xl font-bold text-amber-950 font-display">
              {correctAnswersCount >= 3 ? 'Tahniah, Jaguh Irama Melayu!' : 'Percubaan Yang Baik, Pendekar!'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              {correctAnswersCount >= 3
                ? 'Kepekaan pendengaran anda amat luar biasa! Anda telah menguasai lenggok perbezaan Irama Dodoi dan Irama Selendang Delima.'
                : 'Teruskan latihan mendengar segmen alunan lagu untuk membezakan lenggok Dodoi dan Selendang Delima dengan lebih tepat.'}
            </p>
          </div>

          {/* Metrics Overview Strip with Framer Motion spring */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 450, damping: 25 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto"
          >
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
              <span className="text-[11px] text-amber-800 block uppercase font-bold">Jawapan Betul</span>
              <motion.div
                initial={{ scale: 1.35, y: -2 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 450, damping: 14 }}
                className="text-xl font-bold font-mono text-amber-950 tabular-nums"
              >
                {correctAnswersCount} / 4
              </motion.div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-[11px] text-emerald-800 block uppercase font-bold">Ketepatan</span>
              <motion.div
                initial={{ scale: 1.35, y: -2 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 450, damping: 14, delay: 0.05 }}
                className="text-xl font-bold font-mono text-emerald-950 tabular-nums"
              >
                {calculateAccuracyPct(correctAnswersCount, 4)}%
              </motion.div>
            </div>

            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
              <span className="text-[11px] text-blue-800 block uppercase font-bold">Streak Terbaik</span>
              <motion.div
                initial={{ scale: 1.35, y: -2 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 450, damping: 14, delay: 0.1 }}
                className="text-xl font-bold font-mono text-blue-950 tabular-nums"
              >
                {bestStreak} 🔥
              </motion.div>
            </div>

            <div className="p-3 bg-orange-50 rounded-xl border border-orange-200">
              <span className="text-[11px] text-orange-800 block uppercase font-bold">XP Diperoleh</span>
              <motion.div
                initial={{ scale: 1.35, y: -2 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 450, damping: 14, delay: 0.15 }}
                className="text-xl font-bold font-mono text-orange-950 tabular-nums"
              >
                +{totalXpEarnedInGame} XP
              </motion.div>
            </div>
          </motion.div>

          {/* Lencana Jaguh Irama Awarded Banner with Framer Motion pop-up */}
          {correctAnswersCount >= 3 && (
            <motion.div
              initial={{ scale: 0.7, opacity: 0, y: 25 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 0.1 }}
              className="p-4 bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 rounded-2xl border-2 border-amber-400 max-w-md mx-auto flex items-center justify-center gap-3 shadow-md"
            >
              <div className="w-12 h-12 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center font-bold shrink-0 shadow-inner">
                <Star className="w-6 h-6 fill-amber-950 text-amber-950 animate-spin" />
              </div>
              <div className="text-left text-xs">
                <div className="flex items-center gap-1.5 text-amber-900 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Lencana “Jaguh Irama” Diperoleh!</span>
                </div>
                <span className="text-amber-800">
                  Tahniah! Anda berjaya mencapai sekurang-kurangnya 3 daripada 4 jawapan betul.
                </span>
              </div>
            </motion.div>
          )}

          {/* Buttons: Main Semula & Kembali ke Menu */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleStartGame}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-800 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Main Semula</span>
            </button>

            <button
              onClick={handleReturnToMenu}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors border border-slate-300"
            >
              <Home className="w-4 h-4" />
              <span>Kembali ke Menu</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
