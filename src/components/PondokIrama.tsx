import React, { useState, useEffect } from 'react';
import {
  Play,
  Square,
  Volume2,
  ExternalLink,
  ChevronRight,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  XCircle,
  Info,
  Sliders,
  BookOpen,
  X,
  Heart,
  Feather,
  Music2,
  HelpCircle,
  Award,
  ArrowRight,
  BookmarkCheck,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { IramaDetail, IramaId } from '../types/syair';
import { IRAMA_LIST, SYAIR_UTAMA, NOTA_IRAMA_LENGKAP, SOALAN_KENALI_IRAMA } from '../data/syairData';
import { audioEngine } from '../utils/audioEngine';
import { bgMusicManager } from '../utils/bgMusicManager';

interface PondokIramaProps {
  onEarnXp: (amount: number, reason: string) => void;
  character: 'tuah' | 'teja';
}

export const PondokIrama: React.FC<PondokIramaProps> = ({ onEarnXp, character }) => {
  const [selectedIramaId, setSelectedIramaId] = useState<IramaId>('dodoi');
  const [selectedRangkapIndex, setSelectedRangkapIndex] = useState<number>(0);
  const [isMelodyPlaying, setIsMelodyPlaying] = useState<boolean>(false);
  const [activeLineIndex, setActiveLineIndex] = useState<number>(0);
  const [tempoScale, setTempoScale] = useState<number>(1);
  const [hasPracticed, setHasPracticed] = useState<Record<string, boolean>>({});

  // State for Educational Notes Modal
  const [modalIramaNote, setModalIramaNote] = useState<IramaId | null>(null);

  // State for "Kenali Irama" Reinforcement Practice
  const [quizQuestionIdx, setQuizQuestionIdx] = useState<number>(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, IramaId>>({});
  const [quizFeedback, setQuizFeedback] = useState<Record<number, { isCorrect: boolean; message: string }>>({});
  const [quizXpAwarded, setQuizXpAwarded] = useState<Record<number, boolean>>({});

  const currentIrama: IramaDetail =
    IRAMA_LIST.find((i) => i.id === selectedIramaId) || IRAMA_LIST[0];
  const currentRangkap = SYAIR_UTAMA.rangkap[selectedRangkapIndex];

  useEffect(() => {
    return () => {
      audioEngine.stopAll();
      bgMusicManager.resumeAfterActivity();
    };
  }, []);

  const handleSelectIrama = (id: IramaId) => {
    audioEngine.stopAll();
    setIsMelodyPlaying(false);
    bgMusicManager.resumeAfterActivity();
    setSelectedIramaId(id);
    audioEngine.playTapSfx();
  };

  const handleNextLine = () => {
    setActiveLineIndex((prev) => (prev + 1) % currentRangkap.baris.length);
    audioEngine.playTapSfx();
  };

  const handleResetLine = () => {
    setActiveLineIndex(0);
    audioEngine.playTapSfx();
  };

  const handlePlaySynthesizedMelody = () => {
    if (isMelodyPlaying) {
      audioEngine.stopAll();
      setIsMelodyPlaying(false);
      bgMusicManager.resumeAfterActivity();
      return;
    }

    bgMusicManager.pauseForActivity();
    setIsMelodyPlaying(true);
    audioEngine.playIramaMelody(
      selectedIramaId,
      (step, total) => {
        // Track melody notes progress
        const line = Math.min(3, Math.floor((step / total) * 4));
        setActiveLineIndex(line);
      },
      () => {
        setIsMelodyPlaying(false);
        bgMusicManager.resumeAfterActivity();
        const practiceKey = `${selectedIramaId}_${selectedRangkapIndex}`;
        if (!hasPracticed[practiceKey]) {
          setHasPracticed((prev) => ({ ...prev, [practiceKey]: true }));
          onEarnXp(40, `Menghayati Alunan ${currentIrama.name}`);
        }
      }
    );
  };

  const scrollToStudio = () => {
    const el = document.getElementById('studio-karaoke-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle Reinforcement Practice Answer
  const handleAnswerQuiz = (chosenIrama: IramaId) => {
    const q = SOALAN_KENALI_IRAMA[quizQuestionIdx];
    const isCorrect = chosenIrama === q.jawapanBetul;

    setQuizAnswers((prev) => ({ ...prev, [quizQuestionIdx]: chosenIrama }));

    if (isCorrect) {
      audioEngine.playCorrectSfx();
      setQuizFeedback((prev) => ({
        ...prev,
        [quizQuestionIdx]: {
          isCorrect: true,
          message: 'Syabas! Kamu berjaya mengenali ciri irama ini dengan tepat.'
        }
      }));

      if (!quizXpAwarded[quizQuestionIdx]) {
        setQuizXpAwarded((prev) => ({ ...prev, [quizQuestionIdx]: true }));
        onEarnXp(10, `Latihan Kenali Irama (Soalan ${quizQuestionIdx + 1})`);
      }
    } else {
      audioEngine.playIncorrectSfx();
      setQuizFeedback((prev) => ({
        ...prev,
        [quizQuestionIdx]: {
          isCorrect: false,
          message: 'Cuba baca semula nota dan perhatikan ciri-ciri irama.'
        }
      }));
    }
  };

  const handleNextQuizQuestion = () => {
    audioEngine.playTapSfx();
    if (quizQuestionIdx < SOALAN_KENALI_IRAMA.length - 1) {
      setQuizQuestionIdx((prev) => prev + 1);
    }
  };

  const handleResetQuiz = () => {
    audioEngine.playTapSfx();
    setQuizQuestionIdx(0);
    setQuizAnswers({});
    setQuizFeedback({});
  };

  const currentQuiz = SOALAN_KENALI_IRAMA[quizQuestionIdx];
  const userCurrentAnswer = quizAnswers[quizQuestionIdx];
  const currentFeedback = quizFeedback[quizQuestionIdx];

  const modalData = modalIramaNote ? NOTA_IRAMA_LENGKAP[modalIramaNote] : null;

  // Count correct answers
  const correctCount = Object.keys(quizFeedback).filter(
    (key) => quizFeedback[parseInt(key, 10)]?.isCorrect
  ).length;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-amber-900/10 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded font-bold">Modul Pembelajaran 01</span>
            <span aria-hidden="true">·</span>
            <span>DSKP SK 4.2 / SP 4.2.1</span>
          </div>
          <h2 className="text-2xl font-bold text-amber-950 font-display">
            Pondok Irama Syair Melayu
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Kuasai konsep, ciri-ciri melodi, intonasi dan fungsi dua irama rasmi KSSR Bahasa Melayu Tahun 5: <strong>Irama Dodoi</strong> dan <strong>Irama Selendang Delima</strong> dengan video rujukan YouTube sahih serta latihan interaktif.
          </p>
        </div>

        {/* Companion Avatar */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-amber-50 to-emerald-50 px-4 py-2.5 rounded-2xl border border-amber-200/80 shadow-xs shrink-0">
          <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-amber-400 shadow-xs">
            <img
              src={
                character === 'tuah'
                  ? '/src/assets/images/karakter_pendekar_melayu_1793033989287.jpg'
                  : '/src/assets/images/karakter_srikandi_melayu_1793033989429.jpg'
              }
              alt="Sahabat Kembara"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="text-xs">
            <span className="font-bold text-amber-950 block">
              {character === 'tuah' ? 'Pendekar Tuah Cilik' : 'Srikandi Teja Cilik'}
            </span>
            <span className="text-emerald-800 font-medium text-[11px]">
              Dua Irama Warisan Melayu
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 1: NOTA PEMBELAJARAN (KAD A & KAD B) - DSKP TAHUN 5
         ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider">
              <BookOpen className="w-4 h-4 text-emerald-700" />
              <span>Nota Pembelajaran Irama Warisan</span>
            </div>
            <h3 className="text-xl font-bold text-amber-950 font-display">
              Kenali Irama Dodoi & Irama Selendang Delima
            </h3>
          </div>
          <span className="text-xs text-amber-800 bg-amber-100/80 border border-amber-200 px-3 py-1 rounded-full font-semibold hidden sm:inline-block">
            Tahun 5 KSSR Semakan
          </span>
        </div>

        {/* Two Structured Side-by-Side Cards (Emerald Green & Gold Theme) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Kad A: Irama Dodoi (Emerald Theme with Gentle Cradle Motif) */}
          <div className="bg-gradient-to-b from-emerald-50/70 to-white p-5 sm:p-6 rounded-2xl border-2 border-emerald-300 shadow-sm flex flex-col justify-between hover:border-emerald-400 transition-all">
            <div className="space-y-3.5">
              {/* Badge & Motif */}
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-800 text-white shadow-xs">
                  <Feather className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Kad A: Irama Dodoi</span>
                </span>
                <span className="text-xs font-bold font-mono text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-md">
                  60 BPM · Perlahan
                </span>
              </div>

              {/* Title & Alias */}
              <div>
                <h4 className="text-xl font-bold text-emerald-950 font-display">
                  Irama Dodoi
                </h4>
                <p className="text-xs font-semibold text-emerald-800 mt-0.5">
                  Alunan Lembut Pembelai Jiwa (Buaian Tradisional)
                </p>
              </div>

              {/* Pengenalan */}
              <p className="text-xs text-slate-700 leading-relaxed bg-white/80 p-3 rounded-xl border border-emerald-100 shadow-xs">
                {NOTA_IRAMA_LENGKAP.dodoi.pengenalan}
              </p>

              {/* 5 Ciri-ciri Irama Dodoi */}
              <div className="space-y-2 pt-1">
                <span className="text-xs font-bold text-emerald-900 block uppercase tracking-wide">
                  Ciri-ciri Utama Irama Dodoi:
                </span>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  <li className="flex items-start gap-2 bg-emerald-50/60 p-2 rounded-lg border border-emerald-100">
                    <span className="font-bold text-emerald-900 shrink-0 w-24">⏱️ Tempo:</span>
                    <span>{NOTA_IRAMA_LENGKAP.dodoi.ciriCiri.tempo}</span>
                  </li>
                  <li className="flex items-start gap-2 bg-emerald-50/60 p-2 rounded-lg border border-emerald-100">
                    <span className="font-bold text-emerald-900 shrink-0 w-24">🎵 Melodi:</span>
                    <span>{NOTA_IRAMA_LENGKAP.dodoi.ciriCiri.melodi}</span>
                  </li>
                  <li className="flex items-start gap-2 bg-emerald-50/60 p-2 rounded-lg border border-emerald-100">
                    <span className="font-bold text-emerald-900 shrink-0 w-24">🔉 Intonasi:</span>
                    <span>{NOTA_IRAMA_LENGKAP.dodoi.ciriCiri.intonasi}</span>
                  </li>
                  <li className="flex items-start gap-2 bg-emerald-50/60 p-2 rounded-lg border border-emerald-100">
                    <span className="font-bold text-emerald-900 shrink-0 w-24">🗣️ Penyampaian:</span>
                    <span>{NOTA_IRAMA_LENGKAP.dodoi.ciriCiri.penyampaian}</span>
                  </li>
                  <li className="flex items-start gap-2 bg-emerald-50/60 p-2 rounded-lg border border-emerald-100">
                    <span className="font-bold text-emerald-900 shrink-0 w-24">💡 Fungsi:</span>
                    <span>{NOTA_IRAMA_LENGKAP.dodoi.ciriCiri.fungsi}</span>
                  </li>
                </ul>
              </div>

              {/* Petua Mendengar Ringkas */}
              <div className="bg-amber-50/90 p-3 rounded-xl border border-amber-200 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Petua Mengecam Irama Dodoi:</span>
                </div>
                <p className="text-slate-700 italic">
                  {NOTA_IRAMA_LENGKAP.dodoi.petuaMendengar}
                </p>
              </div>
            </div>

            {/* Actions for Kad A */}
            <div className="pt-4 border-t border-emerald-200/80 flex items-center justify-between gap-2 mt-4">
              <button
                onClick={() => setModalIramaNote('dodoi')}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Baca Nota Penuh</span>
              </button>

              <button
                onClick={() => {
                  handleSelectIrama('dodoi');
                  scrollToStudio();
                }}
                className="px-3.5 py-2 bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Latih Irama Ini</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Kad B: Irama Selendang Delima (Gold/Amber Theme with Traditional Malay Motif) */}
          <div className="bg-gradient-to-b from-amber-50/70 to-white p-5 sm:p-6 rounded-2xl border-2 border-amber-300 shadow-sm flex flex-col justify-between hover:border-amber-400 transition-all">
            <div className="space-y-3.5">
              {/* Badge & Motif */}
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-900 text-amber-100 shadow-xs">
                  <Music2 className="w-3.5 h-3.5 text-amber-300" />
                  <span>Kad B: Irama Selendang Delima</span>
                </span>
                <span className="text-xs font-bold font-mono text-amber-900 bg-amber-100/80 px-2.5 py-0.5 rounded-md">
                  70 BPM · Sederhana
                </span>
              </div>

              {/* Title & Alias */}
              <div>
                <h4 className="text-xl font-bold text-amber-950 font-display">
                  Irama Selendang Delima
                </h4>
                <p className="text-xs font-semibold text-amber-800 mt-0.5">
                  Alunan Tradisional Merdu (Estetika Lagu Melayu)
                </p>
              </div>

              {/* Pengenalan */}
              <p className="text-xs text-slate-700 leading-relaxed bg-white/80 p-3 rounded-xl border border-amber-100 shadow-xs">
                {NOTA_IRAMA_LENGKAP.selendang_delima.pengenalan}
              </p>

              {/* 5 Ciri-ciri Irama Selendang Delima */}
              <div className="space-y-2 pt-1">
                <span className="text-xs font-bold text-amber-950 block uppercase tracking-wide">
                  Ciri-ciri Utama Irama Selendang Delima:
                </span>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  <li className="flex items-start gap-2 bg-amber-50/60 p-2 rounded-lg border border-amber-100">
                    <span className="font-bold text-amber-950 shrink-0 w-24">⏱️ Tempo:</span>
                    <span>{NOTA_IRAMA_LENGKAP.selendang_delima.ciriCiri.tempo}</span>
                  </li>
                  <li className="flex items-start gap-2 bg-amber-50/60 p-2 rounded-lg border border-amber-100">
                    <span className="font-bold text-amber-950 shrink-0 w-24">🎵 Melodi:</span>
                    <span>{NOTA_IRAMA_LENGKAP.selendang_delima.ciriCiri.melodi}</span>
                  </li>
                  <li className="flex items-start gap-2 bg-amber-50/60 p-2 rounded-lg border border-amber-100">
                    <span className="font-bold text-amber-950 shrink-0 w-24">🔉 Intonasi:</span>
                    <span>{NOTA_IRAMA_LENGKAP.selendang_delima.ciriCiri.intonasi}</span>
                  </li>
                  <li className="flex items-start gap-2 bg-amber-50/60 p-2 rounded-lg border border-amber-100">
                    <span className="font-bold text-amber-950 shrink-0 w-24">🗣️ Penyampaian:</span>
                    <span>{NOTA_IRAMA_LENGKAP.selendang_delima.ciriCiri.penyampaian}</span>
                  </li>
                  <li className="flex items-start gap-2 bg-amber-50/60 p-2 rounded-lg border border-amber-100">
                    <span className="font-bold text-amber-950 shrink-0 w-24">💡 Fungsi:</span>
                    <span>{NOTA_IRAMA_LENGKAP.selendang_delima.ciriCiri.fungsi}</span>
                  </li>
                </ul>
              </div>

              {/* Petua Mendengar Ringkas */}
              <div className="bg-emerald-50/90 p-3 rounded-xl border border-emerald-200 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-emerald-950 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Petua Mengecam Irama Selendang Delima:</span>
                </div>
                <p className="text-slate-700 italic">
                  {NOTA_IRAMA_LENGKAP.selendang_delima.petuaMendengar}
                </p>
              </div>
            </div>

            {/* Actions for Kad B */}
            <div className="pt-4 border-t border-amber-200/80 flex items-center justify-between gap-2 mt-4">
              <button
                onClick={() => setModalIramaNote('selendang_delima')}
                className="px-4 py-2 bg-amber-900 hover:bg-amber-950 text-amber-50 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Baca Nota Penuh</span>
              </button>

              <button
                onClick={() => {
                  handleSelectIrama('selendang_delima');
                  scrollToStudio();
                }}
                className="px-3.5 py-2 bg-white hover:bg-amber-50 text-amber-950 border border-amber-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Latih Irama Ini</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: STUDIO ALUNAN & KARAOKE LIRIK (DUA-ZON ASAL DENGAN AUDIO YOUTUBE)
         ========================================================================= */}
      <div id="studio-karaoke-section" className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-wider">
              <Music2 className="w-4 h-4 text-amber-700" />
              <span>Studio Alunan & Karaoke Interaktif</span>
            </div>
            <h3 className="text-xl font-bold text-amber-950 font-display">
              Praktis Melagukan Syair Mengikut Irama
            </h3>
          </div>
          <span className="text-xs text-slate-500 hidden sm:inline">
            Pilih irama aktif di bawah untuk menyelaraskan video dan bait rangkap.
          </span>
        </div>

        {/* Two Official Rhythms Selector Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {IRAMA_LIST.map((irama) => {
            const isSelected = irama.id === selectedIramaId;
            return (
              <button
                key={irama.id}
                onClick={() => handleSelectIrama(irama.id)}
                className={`p-4 sm:p-5 rounded-2xl text-left transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-amber-950 text-amber-50 border-amber-700 shadow-md ring-2 ring-amber-400/40'
                    : 'bg-white hover:bg-amber-50/70 text-slate-800 border-slate-200 hover:border-amber-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded ${
                      isSelected ? 'bg-amber-800 text-amber-200' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {irama.tempo}
                  </span>
                  <span className={`text-xs font-mono font-bold ${isSelected ? 'text-amber-300' : 'text-slate-500'}`}>
                    {irama.tempoBpm} BPM
                  </span>
                </div>
                <h4 className={`text-lg font-bold font-display ${isSelected ? 'text-amber-100' : 'text-amber-950'}`}>
                  {irama.name}
                </h4>
                <p className={`text-xs mt-1 leading-relaxed line-clamp-2 ${isSelected ? 'text-amber-200/90' : 'text-slate-600'}`}>
                  {irama.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Main Two-Zone Sandbox */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Zone (7 cols): Karaoke Lyrics & YouTube Embedded Player */}
          <div className="lg:col-span-7 space-y-5">
            {/* Official YouTube Reference Video Player */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                    Rujukan Audio Sahih (YouTube)
                  </span>
                  <h4 className="text-base font-bold text-slate-900 font-display">
                    Rakaman Asal: {currentIrama.name}
                  </h4>
                </div>

                <a
                  href={currentIrama.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors shrink-0"
                >
                  <span>Buka di YouTube</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Embedded YouTube Iframe */}
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-slate-200 shadow-inner">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${currentIrama.youtubeId}?enablejsapi=1&rel=0`}
                  title={`Rujukan Audio ${currentIrama.name}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>

              <p className="text-[11px] text-slate-500 italic">
                * Sekiranya video YouTube tidak dapat dimuatkan pada rangkaian anda, sila klik butang “Buka di YouTube” di atas atau gunakan melodi seruling sintesis di bawah.
              </p>
            </div>

            {/* Karaoke Lyrics Display */}
            <div className="bg-amber-950 text-amber-50 p-6 rounded-2xl border border-amber-900 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-amber-900 pb-3">
                <div>
                  <span className="text-xs text-amber-400 font-mono uppercase font-bold block">
                    {currentRangkap.tajukRangkap}
                  </span>
                  <span className="text-xs text-amber-200/70">
                    Rima: {currentRangkap.baris[0].endRhyme} (a-a-a-a)
                  </span>
                </div>

                {/* Rangkap Selector */}
                <div className="flex items-center gap-1 bg-amber-900/60 p-1 rounded-lg">
                  {SYAIR_UTAMA.rangkap.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        audioEngine.stopAll();
                        setIsMelodyPlaying(false);
                        setSelectedRangkapIndex(idx);
                        setActiveLineIndex(0);
                      }}
                      className={`px-2.5 py-1 text-xs font-bold rounded transition-colors cursor-pointer ${
                        selectedRangkapIndex === idx
                          ? 'bg-amber-400 text-amber-950 shadow-xs'
                          : 'text-amber-300 hover:text-white'
                      }`}
                    >
                      R{idx + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4 Lines of Poetry with Line-by-Line Highlight */}
              <div className="space-y-3 py-1">
                {currentRangkap.baris.map((b, lIdx) => {
                  const isCurrent = activeLineIndex === lIdx;
                  return (
                    <div
                      key={lIdx}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isCurrent
                          ? 'bg-amber-900/90 border-amber-400 shadow-md ring-1 ring-amber-400/40 text-amber-100'
                          : 'bg-amber-900/20 border-transparent text-amber-200/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-2.5">
                          <span className="text-xs font-mono font-bold text-amber-400">
                            0{lIdx + 1}.
                          </span>
                          <span className="text-base sm:text-lg font-serif font-medium tracking-wide">
                            {b.textWithPauses}
                          </span>
                        </div>
                        <span className="text-xs font-mono text-amber-400 bg-amber-950 px-2 py-0.5 rounded shrink-0">
                          {b.syllablesCount} suku kata
                        </span>
                      </div>

                      {isCurrent && (
                        <p className="text-xs text-amber-300/80 mt-1.5 pl-6 font-sans">
                          Maksud: {b.meaning}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Karaoke Line Navigation Buttons */}
              <div className="pt-3 border-t border-amber-900 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleNextLine}
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <span>Baris Seterusnya</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleResetLine}
                    className="p-2 text-amber-300 hover:text-white hover:bg-amber-900 rounded-lg transition-colors cursor-pointer"
                    title="Mula dari Baris 1"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                {/* Synthesized Melodic Guide for Offline / Audio Practice */}
                <button
                  onClick={handlePlaySynthesizedMelody}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                    isMelodyPlaying
                      ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                      : 'bg-amber-900 text-amber-200 border-amber-700/60 hover:bg-amber-800'
                  }`}
                >
                  {isMelodyPlaying ? <Square className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span>{isMelodyPlaying ? 'Henti Melodi' : `Melodi Seruling (${currentIrama.name})`}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Zone (5 cols): Pedagogical Guide & Breathing Pauses */}
          <div className="lg:col-span-5 space-y-4">
            {/* Rhythm Details Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                Panduan Melagukan {currentIrama.name}
              </span>

              <p className="text-xs text-slate-700 leading-relaxed font-sans">
                <strong>Sifat Irama:</strong> {currentIrama.character}
              </p>

              <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200/60 text-xs space-y-1">
                <strong className="text-amber-950 block">Petua Guru Pendekar:</strong>
                <p className="text-slate-700 leading-normal font-serif">
                  {currentIrama.tips}
                </p>
              </div>

              {/* Tempo Slider with Explicit Disclaimer */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5 text-amber-600" />
                    <span>Kawalan Tempo Melodi Seruling</span>
                  </span>
                  <span className="font-mono font-bold text-amber-900">{Math.round(tempoScale * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="1.3"
                  step="0.1"
                  value={tempoScale}
                  onChange={(e) => setTempoScale(parseFloat(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400 italic">
                  * Pemberitahuan: Peluncur ini melaraskan tempo melodi seruling latihan. Audio YouTube dimainkan pada kelajuan asal rakaman.
                </p>
              </div>
            </div>

            {/* Guide on Pauses and Breathing Rules (KSSR SP 4.2.1) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h4 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Panduan Tanda Jeda Pernafasan (SP 4.2.1)</span>
              </h4>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60 flex items-start gap-2.5">
                  <span className="font-mono font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded text-xs">
                    /
                  </span>
                  <div>
                    <strong className="text-slate-800 block">Tanda Jeda Pendek (Setengah Nafas)</strong>
                    <span>Berhenti seketika di tengah baris (selepas 4 atau 5 suku kata) untuk mengambil nafas tanpa memutuskan alunan melodi.</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/60 flex items-start gap-2.5">
                  <span className="font-mono font-bold text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded text-xs">
                    //
                  </span>
                  <div>
                    <strong className="text-slate-800 block">Tanda Henti Penuh (Selesai Sebaris)</strong>
                    <span>Berhenti sepenuhnya di hujung baris dengan lenggok lembut penutup sebelum menyambung baris seterusnya.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Practice Completion Action */}
            <div className="p-4 rounded-xl bg-amber-950 text-amber-100 flex items-center justify-between shadow-xs">
              <div className="text-xs">
                <span className="font-bold text-amber-300 block">Selesai Meneliti Irama?</span>
                <span className="text-amber-200/80">Sahkan kefahaman anda untuk memperoleh XP.</span>
              </div>
              <button
                onClick={() => {
                  onEarnXp(25, `Menghayati panduan ${currentIrama.name}`);
                  audioEngine.playCorrectSfx();
                }}
                className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold rounded-lg text-xs transition-colors shrink-0 cursor-pointer"
              >
                Faham (+25 XP)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 3: LATIHAN PENGUKUHAN SEGERA "KENALI IRAMA" (2 PILIHAN CEPAT)
         ========================================================================= */}
      <div className="bg-gradient-to-br from-amber-950 via-stone-900 to-amber-950 text-amber-50 p-6 sm:p-7 rounded-3xl border-2 border-amber-600/40 shadow-xl space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-800/60 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>Aktiviti Pengukuhan Segera</span>
              <span aria-hidden="true">·</span>
              <span className="text-amber-300">+10 XP Setiap Jawapan Betul</span>
            </div>
            <h3 className="text-2xl font-bold font-display text-white">
              Kenali Irama: Dodoi atau Selendang Delima?
            </h3>
            <p className="text-xs text-amber-200/80 mt-1">
              Pilih irama yang tepat berdasarkan ciri-ciri melodi, tempo dan fungsi yang telah anda pelajari.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-amber-900/60 px-4 py-2 rounded-xl border border-amber-700/60 shrink-0 self-start sm:self-auto">
            <Award className="w-5 h-5 text-amber-400" />
            <div className="text-xs">
              <span className="text-amber-200 block text-[10px] font-semibold">Skor Latihan</span>
              <span className="font-bold text-amber-300 text-sm font-mono">
                {correctCount} / {SOALAN_KENALI_IRAMA.length} Betul
              </span>
            </div>
          </div>
        </div>

        {/* Question Stepper / Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-amber-300">
            <span className="font-semibold">Soalan {quizQuestionIdx + 1} daripada {SOALAN_KENALI_IRAMA.length}</span>
            <span className="font-mono">{Math.round(((quizQuestionIdx + 1) / SOALAN_KENALI_IRAMA.length) * 100)}%</span>
          </div>
          <div className="h-2 w-full bg-amber-900/40 rounded-full overflow-hidden border border-amber-700/40">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 transition-all duration-300"
              style={{ width: `${((quizQuestionIdx + 1) / SOALAN_KENALI_IRAMA.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Current Question Card */}
        <div className="bg-amber-900/30 p-5 sm:p-6 rounded-2xl border border-amber-700/40 space-y-4">
          <div className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Petunjuk: {currentQuiz.ciriUtama}
          </div>

          <h4 className="text-lg sm:text-xl font-medium text-amber-100 font-serif leading-relaxed">
            "{currentQuiz.soalan}"
          </h4>

          {/* 2 Big Choice Buttons (Dodoi vs Selendang Delima) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Option 1: Irama Dodoi */}
            <button
              onClick={() => handleAnswerQuiz('dodoi')}
              disabled={Boolean(userCurrentAnswer)}
              className={`p-4 sm:p-5 rounded-2xl text-left border transition-all cursor-pointer flex items-center justify-between group ${
                userCurrentAnswer === 'dodoi'
                  ? currentQuiz.jawapanBetul === 'dodoi'
                    ? 'bg-emerald-950/80 border-emerald-400 ring-2 ring-emerald-400 text-white'
                    : 'bg-rose-950/80 border-rose-400 ring-2 ring-rose-400 text-white'
                  : userCurrentAnswer
                  ? 'bg-amber-950/30 border-amber-900/40 opacity-60 text-amber-200'
                  : 'bg-emerald-950/30 hover:bg-emerald-900/50 border-emerald-700/50 hover:border-emerald-400 text-amber-100 hover:scale-[1.01]'
              }`}
            >
              <div className="space-y-1">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide block">
                  Pilihan A
                </span>
                <span className="text-lg font-bold text-white block">
                  Irama Dodoi
                </span>
                <span className="text-xs text-emerald-200/80 block">
                  Tempo Perlahan & Mendayu-dayu
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-emerald-900/60 border border-emerald-500/40 flex items-center justify-center shrink-0">
                {userCurrentAnswer === 'dodoi' ? (
                  currentQuiz.jawapanBetul === 'dodoi' ? (
                    <Check className="w-5 h-5 text-emerald-300" />
                  ) : (
                    <X className="w-5 h-5 text-rose-300" />
                  )
                ) : (
                  <Feather className="w-4 h-4 text-emerald-300 group-hover:scale-110 transition-transform" />
                )}
              </div>
            </button>

            {/* Option 2: Irama Selendang Delima */}
            <button
              onClick={() => handleAnswerQuiz('selendang_delima')}
              disabled={Boolean(userCurrentAnswer)}
              className={`p-4 sm:p-5 rounded-2xl text-left border transition-all cursor-pointer flex items-center justify-between group ${
                userCurrentAnswer === 'selendang_delima'
                  ? currentQuiz.jawapanBetul === 'selendang_delima'
                    ? 'bg-emerald-950/80 border-emerald-400 ring-2 ring-emerald-400 text-white'
                    : 'bg-rose-950/80 border-rose-400 ring-2 ring-rose-400 text-white'
                  : userCurrentAnswer
                  ? 'bg-amber-950/30 border-amber-900/40 opacity-60 text-amber-200'
                  : 'bg-amber-950/30 hover:bg-amber-900/50 border-amber-700/50 hover:border-amber-400 text-amber-100 hover:scale-[1.01]'
              }`}
            >
              <div className="space-y-1">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wide block">
                  Pilihan B
                </span>
                <span className="text-lg font-bold text-white block">
                  Irama Selendang Delima
                </span>
                <span className="text-xs text-amber-200/80 block">
                  Tempo Sederhana & Berlagu Merdu
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-amber-900/60 border border-amber-500/40 flex items-center justify-center shrink-0">
                {userCurrentAnswer === 'selendang_delima' ? (
                  currentQuiz.jawapanBetul === 'selendang_delima' ? (
                    <Check className="w-5 h-5 text-emerald-300" />
                  ) : (
                    <X className="w-5 h-5 text-rose-300" />
                  )
                ) : (
                  <Music2 className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
                )}
              </div>
            </button>
          </div>

          {/* Instant Responsive Feedback */}
          <AnimatePresence mode="wait">
            {currentFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  currentFeedback.isCorrect
                    ? 'bg-emerald-950/70 border-emerald-500 text-emerald-100'
                    : 'bg-amber-950/70 border-amber-500 text-amber-100'
                }`}
              >
                {currentFeedback.isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1 text-xs">
                  <span className="font-bold text-sm block">
                    {currentFeedback.message}
                  </span>
                  <p className="text-amber-200/90 leading-relaxed font-sans">
                    {currentQuiz.penerangan}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleResetQuiz}
            className="px-3.5 py-2 text-xs font-semibold text-amber-300 hover:text-white bg-amber-900/40 hover:bg-amber-800/60 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Mula Semula Latihan</span>
          </button>

          {userCurrentAnswer && (
            <div>
              {quizQuestionIdx < SOALAN_KENALI_IRAMA.length - 1 ? (
                <button
                  onClick={handleNextQuizQuestion}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <span>Soalan Seterusnya</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Latihan Lengkap!</span>
                  </span>
                  <button
                    onClick={() => {
                      onEarnXp(20, 'Menamatkan Latihan Pengukuhan Kenali Irama');
                      audioEngine.playCorrectSfx();
                    }}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
                  >
                    Tuntut Ganjaran Latihan (+20 XP)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          DETAILED LEARNING NOTES MODAL (BACA NOTA PENUH)
         ========================================================================= */}
      <AnimatePresence>
        {modalData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-amber-300 shadow-2xl space-y-6 p-6 sm:p-7 relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setModalIramaNote(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                aria-label="Tutup Nota"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Tabs Header */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                <button
                  onClick={() => setModalIramaNote('dodoi')}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                    modalIramaNote === 'dodoi'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Feather className="w-3.5 h-3.5" />
                  <span>Nota: Irama Dodoi</span>
                </button>

                <button
                  onClick={() => setModalIramaNote('selendang_delima')}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                    modalIramaNote === 'selendang_delima'
                      ? 'bg-amber-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Music2 className="w-3.5 h-3.5" />
                  <span>Nota: Irama Selendang Delima</span>
                </button>
              </div>

              {/* Banner Details */}
              <div className={`p-4 rounded-2xl border ${
                modalData.id === 'dodoi'
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50/80 border-amber-200 text-amber-950'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {modalData.motif}
                  </span>
                  <span className="text-xs font-mono font-bold bg-white/90 px-2.5 py-0.5 rounded-md border border-slate-200">
                    {modalData.id === 'dodoi' ? '60 BPM (Perlahan)' : '70 BPM (Sederhana)'}
                  </span>
                </div>
                <h3 className="text-2xl font-bold font-display mt-1">
                  {modalData.nama}
                </h3>
                <p className="text-xs font-medium text-slate-700 mt-0.5">
                  {modalData.gelaran}
                </p>
              </div>

              {/* 1. Pengenalan Lengkap */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                  <BookmarkCheck className="w-4 h-4 text-amber-600" />
                  <span>Pengenalan Irama</span>
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed bg-stone-50 p-3.5 rounded-xl border border-stone-200 font-sans">
                  {modalData.pengenalan}
                </p>
              </div>

              {/* 2. Ciri-ciri Utama (5 Dimensi) */}
              <div className="space-y-2.5">
                <h4 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Ciri-ciri Utama (SK 4.2 / SP 4.2.1)</span>
                </h4>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                    <span className="font-bold text-slate-900 w-28 shrink-0">⏱️ Tempo:</span>
                    <span className="text-slate-700">{modalData.ciriCiri.tempo}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                    <span className="font-bold text-slate-900 w-28 shrink-0">🎵 Melodi:</span>
                    <span className="text-slate-700">{modalData.ciriCiri.melodi}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                    <span className="font-bold text-slate-900 w-28 shrink-0">🔉 Intonasi:</span>
                    <span className="text-slate-700">{modalData.ciriCiri.intonasi}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                    <span className="font-bold text-slate-900 w-28 shrink-0">🗣️ Penyampaian:</span>
                    <span className="text-slate-700">{modalData.ciriCiri.penyampaian}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                    <span className="font-bold text-slate-900 w-28 shrink-0">💡 Fungsi:</span>
                    <span className="text-slate-700">{modalData.ciriCiri.fungsi}</span>
                  </div>
                </div>
              </div>

              {/* 3. Contoh Penggunaan / Peranan dalam Penyampaian Syair */}
              {modalData.contohPenggunaan && (
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-emerald-600" />
                    <span>Contoh Penggunaan</span>
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed bg-emerald-50/60 p-3 rounded-xl border border-emerald-200">
                    {modalData.contohPenggunaan}
                  </p>
                </div>
              )}

              {modalData.perananSyair && (
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>Peranan dalam Penyampaian Syair</span>
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed bg-amber-50/60 p-3 rounded-xl border border-amber-200">
                    {modalData.perananSyair}
                  </p>
                </div>
              )}

              {/* 4. Petua Mendengar / Mengecam */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-amber-600" />
                  <span>Petua Mendengar & Mengecam Irama</span>
                </h4>
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-slate-800 italic leading-relaxed">
                  "{modalData.petuaMendengar}"
                </div>
              </div>

              {/* 5. Fakta Menarik Warisan Melayu */}
              {modalData.faktaMenarik && (
                <div className="p-3.5 rounded-xl bg-slate-100 text-xs text-slate-600 space-y-1">
                  <strong className="text-slate-800 block">Fakta Khazanah Budaya Melayu:</strong>
                  <p>{modalData.faktaMenarik}</p>
                </div>
              )}

              {/* Modal Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
                <button
                  onClick={() => setModalIramaNote(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Tutup Nota
                </button>

                <button
                  onClick={() => {
                    handleSelectIrama(modalData.id);
                    setModalIramaNote(null);
                    scrollToStudio();
                    onEarnXp(15, `Membaca Nota Penuh ${modalData.nama}`);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  <span>Pilih Irama Ini & Latih Syair</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
