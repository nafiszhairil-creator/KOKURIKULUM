import React, { useState } from 'react';
import { BookOpen, Lightbulb, Check, X, HelpCircle, Volume2, Award, Compass, RotateCcw } from 'lucide-react';
import { SYAIR_UTAMA, IDEA_KESELURUHAN_SYAIR } from '../data/syairData';
import { KataSukar, QuizQuestion, StudentProfile } from '../types/syair';
import { audioEngine } from '../utils/audioEngine';

interface BedahMaknaProps {
  onEarnXp: (amount: number, reason: string) => void;
  onUpdateQuizProgress: (rangkapIndex: number, scoreOutOf5: number) => void;
  student: StudentProfile;
}

export const BedahMakna: React.FC<BedahMaknaProps> = ({
  onEarnXp,
  onUpdateQuizProgress,
  student
}) => {
  const [activeRangkapIndex, setActiveRangkapIndex] = useState<number>(0);
  const [selectedWord, setSelectedWord] = useState<KataSukar | null>(null);

  // Quiz state for current rangkap
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userSelectedOption, setUserSelectedOption] = useState<number | null>(null);
  const [isQuestionChecked, setIsQuestionChecked] = useState<boolean>(false);
  const [sessionCorrectCount, setSessionCorrectCount] = useState<number>(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState<boolean>(false);

  const rangkap = SYAIR_UTAMA.rangkap[activeRangkapIndex];
  const currentQuizList: QuizQuestion[] = rangkap.kuiz;
  const currentQ = currentQuizList[currentQuestionIndex];

  const rangkapKey = `rangkap${rangkap.nombor}`;
  const isXpAlreadyEarnedForThisRangkap = student.earnedQuizXp[rangkapKey] === true;

  const handleSelectRangkap = (index: number) => {
    setActiveRangkapIndex(index);
    setSelectedWord(null);
    setCurrentQuestionIndex(0);
    setUserSelectedOption(null);
    setIsQuestionChecked(false);
    setSessionCorrectCount(0);
    setIsQuizCompleted(false);
    audioEngine.playTapSfx();
  };

  const handleWordClick = (word: KataSukar) => {
    setSelectedWord(word);
    audioEngine.reciteTextWithVoice(word.perkataan);
    audioEngine.playTapSfx();
  };

  const handleSelectOption = (idx: number) => {
    if (isQuestionChecked) return;
    setUserSelectedOption(idx);
    audioEngine.playTapSfx();
  };

  const handleCheckQuestion = () => {
    if (userSelectedOption === null || isQuestionChecked) return;
    setIsQuestionChecked(true);

    const isCorrect = userSelectedOption === currentQ.jawapanBetul;
    if (isCorrect) {
      audioEngine.playCorrectSfx();
      setSessionCorrectCount((prev) => prev + 1);
    } else {
      audioEngine.playIncorrectSfx();
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < currentQuizList.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setUserSelectedOption(null);
      setIsQuestionChecked(false);
      audioEngine.playTapSfx();
    } else {
      // Quiz finished for this rangkap
      setIsQuizCompleted(true);
      const finalScore = sessionCorrectCount + (userSelectedOption === currentQ.jawapanBetul ? 0 : 0);
      onUpdateQuizProgress(activeRangkapIndex, sessionCorrectCount);

      // Award exactly 35 XP capped per rangkap
      if (!isXpAlreadyEarnedForThisRangkap && sessionCorrectCount >= 3) {
        onEarnXp(35, `Kefahaman Rangkap ${rangkap.nombor} (Had 35 XP Diperoleh)`);
        audioEngine.playFanfareSfx();
      } else {
        audioEngine.playTapSfx();
      }
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setUserSelectedOption(null);
    setIsQuestionChecked(false);
    setSessionCorrectCount(0);
    setIsQuizCompleted(false);
    audioEngine.playTapSfx();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-amber-900/10 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 uppercase tracking-wider mb-1">
            <span>Modul Pembelajaran 02</span>
            <span aria-hidden="true">·</span>
            <span>Kefahaman Syair & Kosa Kata Klasik</span>
          </div>
          <h2 className="text-2xl font-bold text-amber-950 font-display">
            Fahami Syair: Syair Pesanan Bonda
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Terokai maksud harafiah dan idea keseluruhan setiap rangkap, semak glosari kata klasik, dan uji kefahaman melalui kuiz objektif 5 soalan.
          </p>
        </div>

        {/* 4 Rangkap Selector Tabs */}
        <div className="flex items-center gap-1.5 bg-amber-50 p-1.5 rounded-xl border border-amber-200/80 shrink-0">
          {SYAIR_UTAMA.rangkap.map((item, idx) => {
            const isActive = activeRangkapIndex === idx;
            const isEarned = student.earnedQuizXp[`rangkap${item.nombor}`];
            return (
              <button
                key={idx}
                onClick={() => handleSelectRangkap(idx)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-amber-800 text-amber-100 shadow-xs'
                    : 'text-amber-900 hover:bg-amber-100'
                }`}
              >
                <span>Rangkap {item.nombor}</span>
                {isEarned && <Check className="w-3.5 h-3.5 text-emerald-300" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Stanza Analysis & Comprehensive Quiz */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Full Stanza & Glossary */}
        <div className="lg:col-span-7 space-y-6">
          {/* Stanza Card */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50/40 p-6 rounded-2xl border border-amber-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-amber-200/60">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 font-mono">
                {rangkap.tajukRangkap}
              </span>
              <span className="text-xs text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-md font-semibold">
                Rima Akhir: {rangkap.baris[0].endRhyme} (a-a-a-a)
              </span>
            </div>

            {/* 4 Lines of Poetry */}
            <div className="space-y-2.5">
              {rangkap.baris.map((b, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white/90 rounded-xl border border-amber-100 shadow-xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-baseline gap-3">
                    <span className="text-xs font-mono text-amber-600 font-bold">
                      0{idx + 1}.
                    </span>
                    <span className="text-base sm:text-lg font-serif font-medium text-amber-950">
                      {b.cleanText}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded shrink-0">
                    {b.endRhyme}
                  </span>
                </div>
              ))}
            </div>

            {/* Maksud Harafiah Rangkap */}
            <div className="bg-white/80 p-3.5 rounded-xl border border-amber-200/60 text-xs text-slate-800 space-y-1">
              <strong className="text-amber-950 block">Maksud Harafiah:</strong>
              <p className="leading-relaxed font-sans">{rangkap.maksudHarafiah}</p>
            </div>

            {/* Idea Keseluruhan Rangkap (KSSR SP 4.2.1) */}
            <div className="bg-amber-900 text-amber-50 p-4 rounded-xl border border-amber-800 shadow-xs space-y-1">
              <span className="text-[11px] text-amber-300 font-bold uppercase block tracking-wider">
                Idea Keseluruhan Rangkap {rangkap.nombor} (SP 4.2.1):
              </span>
              <p className="text-xs sm:text-sm font-serif italic text-amber-100 leading-relaxed">
                “{rangkap.ideaKeseluruhan}”
              </p>
            </div>
          </div>

          {/* Kad Glosari Kosa Kata Interaktif */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-amber-950 font-display flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                <span>Glosari Kosa Kata Klasik (Klik untuk Sebutan)</span>
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                {IDEA_KESELURUHAN_SYAIR.glosariLengkap.length} Istilah
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {IDEA_KESELURUHAN_SYAIR.glosariLengkap.map((item, idx) => {
                const isSelected = selectedWord?.perkataan === item.perkataan;
                return (
                  <button
                    key={idx}
                    onClick={() => handleWordClick(item)}
                    className={`p-3 rounded-xl text-left border transition-all ${
                      isSelected
                        ? 'bg-amber-800 text-amber-50 border-amber-700 shadow-xs ring-1 ring-amber-400'
                        : 'bg-amber-50/50 hover:bg-amber-100/70 text-slate-800 border-amber-200/60'
                    }`}
                  >
                    <span className={`text-xs font-bold block ${isSelected ? 'text-amber-200' : 'text-amber-900'}`}>
                      {item.perkataan}
                    </span>
                    <span className={`text-[11px] block truncate ${isSelected ? 'text-amber-100/80' : 'text-slate-600'}`}>
                      {item.maksud}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Word Detail Box with Speech Button */}
            {selectedWord && (
              <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-200 text-xs space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-amber-950 font-serif">
                    “{selectedWord.perkataan}”
                  </span>
                  <button
                    onClick={() => audioEngine.reciteTextWithVoice(selectedWord.perkataan)}
                    className="flex items-center gap-1 text-amber-800 hover:text-amber-950 font-semibold text-xs bg-amber-100/80 px-2.5 py-1 rounded-md transition-colors"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Dengar Sebutan Baku</span>
                  </button>
                </div>
                <p className="text-slate-800">
                  <strong>Maksud:</strong> {selectedWord.maksud}
                </p>
                <p className="text-slate-600 italic">
                  <strong>Contoh Ayat:</strong> “{selectedWord.contoh}”
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): 5 Objective Questions Quiz */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                  Kuiz Kefahaman Rangkap {rangkap.nombor}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Soalan {currentQuestionIndex + 1} daripada {currentQuizList.length}
                </span>
              </div>

              {isXpAlreadyEarnedForThisRangkap ? (
                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  35 XP Diperoleh (Had Penuh)
                </span>
              ) : (
                <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Ganjaran: 35 XP
                </span>
              )}
            </div>

            {!isQuizCompleted ? (
              <div className="space-y-4">
                <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug">
                  {currentQ.soalan}
                </p>

                {/* 4 Options (A, B, C, D) */}
                <div className="space-y-2">
                  {currentQ.pilihan.map((pilihan, pIdx) => {
                    const isSelected = userSelectedOption === pIdx;
                    const isCorrectOption = pIdx === currentQ.jawapanBetul;

                    let btnClasses = 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700';

                    if (isQuestionChecked) {
                      if (isCorrectOption) {
                        btnClasses = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold ring-1 ring-emerald-400';
                      } else if (isSelected && !isCorrectOption) {
                        btnClasses = 'bg-rose-50 border-rose-300 text-rose-900 line-through';
                      }
                    } else if (isSelected) {
                      btnClasses = 'bg-amber-100 border-amber-500 text-amber-950 font-medium ring-1 ring-amber-400';
                    }

                    return (
                      <button
                        key={pIdx}
                        onClick={() => handleSelectOption(pIdx)}
                        disabled={isQuestionChecked}
                        className={`w-full p-3 rounded-xl border text-xs text-left transition-all flex items-start gap-2.5 ${btnClasses}`}
                      >
                        <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center shrink-0 text-[10px] mt-0.5 font-bold font-mono">
                          {String.fromCharCode(65 + pIdx)}
                        </span>
                        <span className="flex-1">{pilihan}</span>
                        {isQuestionChecked && isCorrectOption && (
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                        {isQuestionChecked && isSelected && !isCorrectOption && (
                          <X className="w-4 h-4 text-rose-500 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation on Check */}
                {isQuestionChecked && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1 animate-fadeIn">
                    <strong className="text-slate-900 block">Penerangan:</strong>
                    <p>{currentQ.penerangan}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  {!isQuestionChecked ? (
                    <button
                      onClick={handleCheckQuestion}
                      disabled={userSelectedOption === null}
                      className="w-full py-2.5 bg-amber-800 hover:bg-amber-700 disabled:opacity-40 text-white font-bold rounded-lg text-xs transition-colors shadow-sm"
                    >
                      Sahkan Jawapan
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="w-full py-2.5 bg-amber-800 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition-colors shadow-sm"
                    >
                      {currentQuestionIndex + 1 < currentQuizList.length ? 'Soalan Seterusnya →' : 'Lihat Keputusan Kuiz'}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Quiz Summary Card */
              <div className="text-center py-6 space-y-4 animate-fadeIn">
                <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
                  <Award className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-amber-950 font-display">
                    Kuiz Rangkap {rangkap.nombor} Selesai!
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Anda menjawab betul <strong className="font-mono text-amber-900">{sessionCorrectCount}</strong> daripada <strong className="font-mono">5</strong> soalan.
                  </p>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                  {isXpAlreadyEarnedForThisRangkap ? (
                    <span>Ganjaran 35 XP telah pun dimasukkan ke akaun anda sebelum ini.</span>
                  ) : sessionCorrectCount >= 3 ? (
                    <span className="font-semibold text-emerald-800">Tahniah! Anda berjaya meraih 35 XP untuk rangkap ini.</span>
                  ) : (
                    <span>Cuba semula untuk menguasai sekurang-kurangnya 3 soalan bagi memperoleh ganjaran 35 XP.</span>
                  )}
                </div>

                <button
                  onClick={handleRestartQuiz}
                  className="px-4 py-2 bg-amber-900 hover:bg-amber-800 text-amber-100 font-semibold rounded-lg text-xs transition-colors inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Ulang Semula Kuiz Rangkap Ini</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full Poem Macro Synopsis (Rumusan Keseluruhan Syair) */}
      <div className="bg-amber-950 text-amber-50 p-6 rounded-2xl border border-amber-900 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-900 pb-3">
          <div>
            <span className="text-xs text-amber-400 font-mono font-bold uppercase tracking-wider block">
              Rumusan Keseluruhan Syair (DSKP SP 4.2.1)
            </span>
            <h3 className="text-xl font-bold font-display text-amber-100">
              Idea Keseluruhan “Syair Pesanan Bonda: Pelita Menuntut Ilmu”
            </h3>
          </div>
          <span className="text-xs font-semibold text-amber-300 bg-amber-900/80 px-3 py-1 rounded-lg border border-amber-800">
            4 Rangkap Bersepadu
          </span>
        </div>

        <p className="text-sm sm:text-base font-serif text-amber-100/90 leading-relaxed italic">
          “{IDEA_KESELURUHAN_SYAIR.ringkasan}”
        </p>

        {/* 4 Core Moral Values */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {IDEA_KESELURUHAN_SYAIR.nilaiMurni.map((n, idx) => (
            <div key={idx} className="bg-amber-900/40 p-3 rounded-xl border border-amber-800/60 text-xs">
              <strong className="text-amber-300 block mb-1">
                {idx + 1}. {n.nilai}
              </strong>
              <p className="text-amber-200/80 leading-snug">{n.huraian}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
