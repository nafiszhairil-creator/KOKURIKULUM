import React, { useState, useEffect } from 'react';
import { Timer, Trophy, Sparkles, Check, AlertCircle, RotateCcw, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SYAIR_UTAMA } from '../data/syairData';
import { audioEngine } from '../utils/audioEngine';

interface GameTangkapKataProps {
  onEarnXp: (amount: number, reason: string) => void;
  onEarnBadge: (badgeId: string) => void;
  onMarkModuleCompleted: () => void;
}

interface TileItem {
  id: string;
  text: string;
  isCorrect: boolean;
}

export const GameTangkapKata: React.FC<GameTangkapKataProps> = ({
  onEarnXp,
  onEarnBadge,
  onMarkModuleCompleted
}) => {
  const [currentRoundIdx, setCurrentRoundIdx] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(35);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [collectedKeywords, setCollectedKeywords] = useState<string[]>([]);
  const [availableTiles, setAvailableTiles] = useState<TileItem[]>([]);
  const [score, setScore] = useState<number>(0);
  const [roundCompleted, setRoundCompleted] = useState<boolean>(false);
  const [allGamesDone, setAllGamesDone] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const rangkap = SYAIR_UTAMA.rangkap[currentRoundIdx];

  const setupRound = (idx: number) => {
    const r = SYAIR_UTAMA.rangkap[idx];
    const correct: TileItem[] = r.kataKunciIdea.map((txt, i) => ({
      id: `c_${i}_${txt}`,
      text: txt,
      isCorrect: true
    }));
    const wrong: TileItem[] = r.distractors.map((txt, i) => ({
      id: `w_${i}_${txt}`,
      text: txt,
      isCorrect: false
    }));

    const combined = [...correct, ...wrong].sort(() => Math.random() - 0.5);
    setAvailableTiles(combined);
    setCollectedKeywords([]);
    setTimeLeft(35);
    setRoundCompleted(false);
    setIsActive(true);
    setFeedbackMsg(null);
  };

  useEffect(() => {
    setupRound(currentRoundIdx);
  }, [currentRoundIdx]);

  // Fair Countdown timer
  useEffect(() => {
    if (!isActive || timeLeft <= 0 || roundCompleted || allGamesDone) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsActive(false);
          audioEngine.playIncorrectSfx();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, timeLeft, roundCompleted, allGamesDone]);

  const handleTileClick = (tile: TileItem) => {
    if (!isActive || roundCompleted || collectedKeywords.includes(tile.text)) return;

    if (tile.isCorrect) {
      audioEngine.playCorrectSfx();
      const nextList = [...collectedKeywords, tile.text];
      setCollectedKeywords(nextList);
      setScore((s) => s + 40);
      setFeedbackMsg({ text: `Tepat! “${tile.text}” dimasukkan ke idea keseluruhan.`, isError: false });

      if (nextList.length === rangkap.kataKunciIdea.length) {
        setRoundCompleted(true);
        setIsActive(false);
        audioEngine.playFanfareSfx();
        onEarnXp(40, `Idea Rangkap ${rangkap.nombor} Lengkap`);
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      }
    } else {
      audioEngine.playIncorrectSfx();
      // Gentle penalty: only -2 seconds, plenty of time remains
      setTimeLeft((t) => Math.max(0, t - 2));
      setFeedbackMsg({
        text: `“${tile.text}” bukan kata kunci rangkap ini. Sila pilih yang berkaitan. (-2s)`,
        isError: true
      });
    }
  };

  const handleNextRound = () => {
    if (currentRoundIdx + 1 < SYAIR_UTAMA.rangkap.length) {
      setCurrentRoundIdx((prev) => prev + 1);
      audioEngine.playTapSfx();
    } else {
      setAllGamesDone(true);
      audioEngine.playFanfareSfx();
      confetti({ particleCount: 90, spread: 80 });
      onEarnBadge('penyusun_hikmah');
      onEarnXp(75, 'Menjuarai Tangkap Kunci Kata (Semua 4 Rangkap)');
      onMarkModuleCompleted();
    }
  };

  const handleRestartEntireGame = () => {
    setCurrentRoundIdx(0);
    setScore(0);
    setAllGamesDone(false);
    setupRound(0);
    audioEngine.playTapSfx();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-amber-900/10 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 uppercase tracking-wider mb-1">
            <span>Permainan 02</span>
            <span aria-hidden="true">·</span>
            <span>Arkade Menjana Idea Keseluruhan</span>
          </div>
          <h2 className="text-2xl font-bold text-amber-950 font-display">
            Tangkap Kunci Kata
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Pilih 4 kata kunci yang tepat daripada 8 jubin sebelum masa tamat untuk merumuskan idea keseluruhan bagi setiap rangkap!
          </p>
        </div>

        {/* Timer & Score Indicators */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            className={`px-3.5 py-2 rounded-xl border text-center flex items-center gap-2 ${
              timeLeft < 10
                ? 'bg-rose-50 border-rose-300 text-rose-900 animate-pulse'
                : 'bg-amber-50 border-amber-200 text-amber-950'
            }`}
          >
            <Timer className="w-4 h-4 text-amber-700" />
            <div>
              <span className="text-[10px] uppercase font-bold block">Masa</span>
              <span className="text-base font-bold font-mono tabular-nums">{timeLeft}s</span>
            </div>
          </div>

          <div className="bg-amber-50 px-3.5 py-2 rounded-xl border border-amber-200 text-center">
            <span className="text-[10px] text-amber-800 font-bold uppercase block">Skor</span>
            <span className="text-base font-bold font-mono text-amber-950 tabular-nums">{score}</span>
          </div>
        </div>
      </div>

      {!allGamesDone ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          {/* Round Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-xs font-mono text-amber-700 font-bold uppercase">
                Tahap {currentRoundIdx + 1} daripada {SYAIR_UTAMA.rangkap.length}
              </span>
              <h3 className="text-lg font-bold text-amber-950 font-display">
                {rangkap.tajukRangkap}
              </h3>
            </div>

            <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
              Kunci Terkumpul:{' '}
              <span className="text-amber-800 font-bold font-mono">
                {collectedKeywords.length} / 4
              </span>
            </div>
          </div>

          {/* Stanza Context Snippet */}
          <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200/60">
            <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wide block mb-1">
              Bait Syair Panduan:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs font-serif text-slate-800">
              {rangkap.baris.map((b, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="text-amber-600 font-mono text-[10px]">{i + 1}.</span>
                  <span>{b.cleanText}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Idea Construction Box */}
          <div className="bg-amber-950 text-amber-50 p-5 rounded-2xl border border-amber-900 shadow-inner space-y-3">
            <span className="text-xs text-amber-300 font-semibold uppercase tracking-wider block">
              Rumusan Idea Keseluruhan Yang Sedang Dibina:
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 min-h-[50px]">
              {[...Array(4)].map((_, idx) => {
                const keyword = collectedKeywords[idx];
                return (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border flex items-center justify-center text-center transition-all ${
                      keyword
                        ? 'bg-amber-400 text-amber-950 font-bold text-xs shadow-md border-amber-300'
                        : 'bg-amber-900/40 border-amber-800/80 border-dashed text-amber-400/40 text-[11px]'
                    }`}
                  >
                    {keyword ? (
                      <span className="flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>{keyword}</span>
                      </span>
                    ) : (
                      <span>Kunci {idx + 1}</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Display full idea once 4 keywords caught */}
            {roundCompleted && (
              <div className="p-3.5 rounded-xl bg-amber-900/90 border border-amber-400/60 mt-3 animate-fadeIn">
                <span className="text-[11px] text-amber-300 font-bold uppercase block mb-0.5">
                  Idea Keseluruhan Selesai Dirumus:
                </span>
                <p className="text-xs sm:text-sm font-serif italic text-amber-100 leading-relaxed">
                  “{rangkap.ideaKeseluruhan}”
                </p>
              </div>
            )}
          </div>

          {/* Feedback message banner */}
          {feedbackMsg && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                feedbackMsg.isError
                  ? 'bg-rose-50 border border-rose-200 text-rose-800'
                  : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              }`}
            >
              {feedbackMsg.isError ? (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              ) : (
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              <span>{feedbackMsg.text}</span>
            </div>
          )}

          {/* 8 Word Tiles (4 correct, 4 distractors) */}
          {!roundCompleted && timeLeft > 0 && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Pilih 4 Kata Kunci Tepat (Klik Jubin):
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {availableTiles.map((tile) => {
                  const isCollected = collectedKeywords.includes(tile.text);
                  return (
                    <button
                      key={tile.id}
                      onClick={() => handleTileClick(tile)}
                      disabled={isCollected}
                      className={`p-4 rounded-xl text-center text-xs font-bold transition-all border shadow-xs ${
                        isCollected
                          ? 'bg-slate-100 text-slate-400 border-slate-200 opacity-40 cursor-not-allowed scale-95'
                          : 'bg-white hover:bg-amber-100/70 border-slate-200 hover:border-amber-400 text-slate-800 active:scale-95'
                      }`}
                    >
                      {tile.text}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Round Controls */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            {roundCompleted ? (
              <button
                onClick={handleNextRound}
                className="w-full sm:w-auto px-6 py-2.5 bg-amber-800 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition-colors shadow-sm ml-auto flex items-center justify-center gap-2"
              >
                <span>
                  {currentRoundIdx + 1 < SYAIR_UTAMA.rangkap.length
                    ? 'Tahap Seterusnya'
                    : 'Tamatkan Permainan'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : timeLeft <= 0 ? (
              <div className="w-full flex items-center justify-between">
                <span className="text-xs font-semibold text-rose-700">
                  Masa telah tamat! Jangan bimbang, cuba lagi.
                </span>
                <button
                  onClick={() => setupRound(currentRoundIdx)}
                  className="px-4 py-2 bg-amber-800 text-white font-bold rounded-lg text-xs"
                >
                  Cuba Semula
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        /* Game Completion Celebration Screen */
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-5 shadow-sm">
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shadow-xs">
            <Trophy className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold text-amber-800 uppercase tracking-widest block mb-1">
              Semua 4 Rangkap Lengkap Dirumus!
            </span>
            <h3 className="text-3xl font-bold text-amber-950 font-display">
              Penyusun Hikmah Terbilang!
            </h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto mt-2">
              Anda berjaya mengenal pasti kata kunci utama dan membina idea keseluruhan bagi setiap rangkap Syair Pesanan Bonda.
            </p>
          </div>

          <div className="inline-flex items-center gap-6 bg-amber-50 px-6 py-3 rounded-xl border border-amber-200">
            <div>
              <span className="text-xs text-amber-800 block">Markah Keseluruhan</span>
              <span className="text-2xl font-bold font-mono text-amber-950">{score}</span>
            </div>
            <div className="h-8 w-px bg-amber-200" />
            <div>
              <span className="text-xs text-amber-800 block">Lencana Dianugerahkan</span>
              <span className="text-sm font-bold text-amber-900 flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Penyusun Hikmah
              </span>
            </div>
          </div>

          <div>
            <button
              onClick={handleRestartEntireGame}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-800 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Main Semula Arkade</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
