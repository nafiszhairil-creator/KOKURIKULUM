import React from 'react';
import {
  Sparkles,
  Award,
  Star,
  CheckCircle2,
  Circle,
  Play,
  ArrowRight,
  BookOpen,
  Music,
  Gamepad2,
  Mic,
  Trophy,
  LogOut
} from 'lucide-react';
import { StudentProfile } from '../types/syair';
import { BADGES_LIST } from '../data/syairData';
import { audioEngine } from '../utils/audioEngine';
import { motion } from 'framer-motion';
import { StudentProgressChart } from './StudentProgressChart';

interface StudentDashboardProps {
  student: StudentProfile;
  onNavigate: (tab: string) => void;
  onLogout: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student,
  onNavigate,
  onLogout
}) => {
  const completedCount = Object.values(student.completedModules).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / 5) * 100);

  const modules = [
    {
      id: 'pondok',
      title: 'Pondok Irama Syair',
      subtitle: 'Dua Irama Rasmi: Dodoi & Selendang Delima',
      icon: Music,
      isDone: student.completedModules.pondokIrama,
      desc: 'Dengar rujukan video YouTube dan hayati latihan jeda nafas.'
    },
    {
      id: 'bedah',
      title: 'Bedah Makna Syair',
      subtitle: '4 Rangkap & Glosari Kata Klasik',
      icon: BookOpen,
      isDone: student.completedModules.bedahMakna,
      desc: 'Terokai maksud tersirat, glosari dan jawab kuiz pemahaman.'
    },
    {
      id: 'game_match',
      title: 'Permainan 1: Padankan Irama',
      subtitle: 'Dengar & Padankan Dodoi vs Selendang Delima (4 Soalan)',
      icon: Gamepad2,
      isDone: student.completedModules.gameIramaMatch,
      desc: 'Dengar 4 segmen audio dan kenal pasti irama Dodoi atau Selendang Delima.'
    },
    {
      id: 'game_tangkap',
      title: 'Permainan 2: Tangkap Kunci Kata',
      subtitle: 'Bina Idea Keseluruhan Arkade (35s)',
      icon: Sparkles,
      isDone: student.completedModules.gameTangkapKata,
      desc: 'Kumpul 4 rangkai kata kunci dan susun rumusan idea.'
    },
    {
      id: 'karaoke',
      title: 'Permainan 3: Karaoke Pahlawan',
      subtitle: 'Rakaman Suara & Refleksi Kendiri',
      icon: Mic,
      isDone: student.completedModules.karaoke,
      desc: 'Rakam alunan syair anda dengan iringan irama warisan.'
    }
  ];

  const handleNextModuleAction = () => {
    audioEngine.playTapSfx();
    if (!student.completedModules.pondokIrama) onNavigate('pondok');
    else if (!student.completedModules.bedahMakna) onNavigate('bedah');
    else if (!student.completedModules.gameIramaMatch) onNavigate('game_match');
    else if (!student.completedModules.gameTangkapKata) onNavigate('game_tangkap');
    else if (!student.completedModules.karaoke) onNavigate('karaoke');
    else onNavigate('ganjaran');
  };

  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 text-amber-50 p-6 sm:p-8 border border-amber-800/80 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left flex-1">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-amber-400 shrink-0 shadow-lg ring-4 ring-amber-400/20">
              <img
                src={
                  student.character === 'tuah'
                    ? '/src/assets/images/karakter_pendekar_melayu_1793033989287.jpg'
                    : '/src/assets/images/karakter_srikandi_melayu_1793033989429.jpg'
                }
                alt={student.character === 'tuah' ? 'Pendekar Tuah' : 'Srikandi Teja'}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs text-amber-300 font-medium">
                <span>{student.className}</span>
                <span aria-hidden="true">·</span>
                <span>
                  Sahabat: {student.character === 'tuah' ? 'Pendekar Tuah Cilik' : 'Srikandi Teja Cilik'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-display text-amber-100">
                Selamat Datang, {student.name}!
              </h1>
              <p className="text-xs sm:text-sm text-amber-200/90 italic font-serif">
                {student.character === 'tuah'
                  ? '“Wahai rakan seperjuangan! Ayuh kita asah lenggok Irama Dodoi dan Selendang Delima hari ini!”'
                  : '“Salam mesra wahai pujangga! Mari kita teliti bait Syair Pesanan Bonda dan petik hikmah ilmunya.”'}
              </p>
            </div>
          </div>

            {/* Quick Metrics Cards with Framer Motion spring updates */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="p-3 bg-amber-900/60 rounded-xl border border-amber-700/60 text-center min-w-[85px] shadow-xs">
                <span className="text-[11px] text-amber-300 font-semibold block uppercase">Jumlah XP</span>
                <motion.div
                  key={student.xp}
                  initial={{ scale: 1.35, y: -2 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 14 }}
                  className="text-xl font-bold font-mono text-amber-100 tabular-nums block"
                >
                  {student.xp}
                </motion.div>
              </div>

              <div className="p-3 bg-amber-900/60 rounded-xl border border-amber-700/60 text-center min-w-[85px] shadow-xs">
                <span className="text-[11px] text-amber-300 font-semibold block uppercase">Bintang</span>
                <motion.div
                  key={student.stars}
                  initial={{ scale: 1.35, y: -2 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 14 }}
                  className="text-xl font-bold font-mono text-amber-100 tabular-nums flex items-center justify-center gap-1"
                >
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{student.stars}</span>
                </motion.div>
              </div>

              <button
                onClick={() => {
                  onLogout();
                  audioEngine.playTapSfx();
                }}
                title="Log Keluar"
                className="p-3 bg-stone-900/80 hover:bg-stone-800 text-amber-300 hover:text-white rounded-xl border border-amber-800/60 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Learning Progress Bar with Motion */}
          <div className="mt-6 pt-4 border-t border-amber-800/60 space-y-2">
            <div className="flex items-center justify-between text-xs text-amber-300">
              <span className="font-semibold">Kemajuan Keseluruhan Kembara</span>
              <motion.div
                key={completedCount}
                initial={{ scale: 1.15, y: -1 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 16 }}
                className="font-mono font-bold"
              >
                {completedCount} daripada 5 Modul Selesai ({progressPercent}%)
              </motion.div>
            </div>
            <div className="w-full h-2.5 bg-amber-950/80 rounded-full overflow-hidden border border-amber-800/80">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>

      {/* Action Buttons Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={handleNextModuleAction}
            className="px-5 py-2.5 bg-amber-800 hover:bg-amber-700 text-amber-50 font-bold rounded-lg text-xs transition-colors flex items-center gap-2 shadow-sm"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Sambung Kembara Seterusnya</span>
          </button>

          <button
            onClick={() => {
              onNavigate('ganjaran');
              audioEngine.playTapSfx();
            }}
            className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Trophy className="w-4 h-4 text-amber-600" />
            <span>Lihat Ganjaran & Sijil</span>
          </button>
        </div>

        {/* Teacher Assessment Status Indicator */}
        <div className="text-xs">
          {student.teacherAssessment ? (
            <span className="text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 font-semibold inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Pentaksiran Guru: {student.teacherAssessment.totalScore}% ({student.teacherAssessment.teacherName})</span>
            </span>
          ) : (
            <span className="text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              Pentaksiran Guru: Belum Dinilai
            </span>
          )}
        </div>
      </div>

      {/* Recharts Analytics: Student XP Growth & Quiz Performance */}
      <StudentProgressChart student={student} />

      {/* Modules Roadmap Grid */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-amber-950 font-display flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>Peta Modul Pembelajaran & Permainan</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((m, idx) => {
            const Icon = m.icon;
            return (
              <motion.button
                key={m.id}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onNavigate(m.id);
                  audioEngine.playTapSfx();
                }}
                className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between group ${
                  m.isDone
                    ? 'bg-gradient-to-br from-emerald-50/60 to-white border-emerald-200 hover:border-emerald-400'
                    : 'bg-white border-slate-200 hover:border-amber-400 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      m.isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    {m.isDone ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Selesai
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium">
                        Belum Selesai
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                    Modul 0{idx + 1}
                  </span>
                  <h4 className="text-base font-bold text-slate-900 font-display group-hover:text-amber-900 transition-colors">
                    {m.title}
                  </h4>
                  <span className="text-xs font-semibold text-amber-800 block mt-0.5">
                    {m.subtitle}
                  </span>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {m.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-amber-900 group-hover:text-amber-700">
                  <span>Buka Aktiviti</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Badges Earned Strip */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-amber-950 font-display flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-600" />
            <span>Koleksi Lencana Pahlawan Syair</span>
          </h4>
          <span className="text-xs text-slate-500 font-mono">
            {student.badges.length} / {BADGES_LIST.length} Diperoleh
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {BADGES_LIST.map((b) => {
            const hasBadge = student.badges.includes(b.id) || student.xp >= b.unlockedAtXp;
            return (
              <div
                key={b.id}
                className={`p-3 rounded-xl border flex items-center gap-2.5 ${
                  hasBadge
                    ? 'bg-amber-50/80 border-amber-300 text-amber-950'
                    : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold shrink-0 ${
                  hasBadge ? 'bg-amber-400 text-amber-950 shadow-xs' : 'bg-slate-200 text-slate-400'
                }`}>
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold block leading-tight">{b.name}</span>
                  <span className="text-[10px] text-slate-500">{b.unlockedAtXp} XP</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
