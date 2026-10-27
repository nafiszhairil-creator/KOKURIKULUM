import React, { useState } from 'react';
import {
  Award,
  Trophy,
  Star,
  Sparkles,
  Printer,
  EyeOff,
  CheckCircle2,
  Lock,
  Download
} from 'lucide-react';
import { StudentProfile } from '../types/syair';
import { BADGES_LIST } from '../data/syairData';
import { getStoredStudents, getTeacherSettings } from '../utils/storage';
import { audioEngine } from '../utils/audioEngine';

interface PapanGanjaranProps {
  student: StudentProfile;
}

export const PapanGanjaran: React.FC<PapanGanjaranProps> = ({ student }) => {
  const settings = getTeacherSettings();
  const allStudents = getStoredStudents();

  // Certificate Form State
  const [studentNameInput, setStudentNameInput] = useState<string>(student.name);
  const [schoolNameInput, setSchoolNameInput] = useState<string>(settings.schoolName);
  const [classNameInput, setClassNameInput] = useState<string>(student.className);
  const [dateInput, setDateInput] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showCertificateModal, setShowCertificateModal] = useState<boolean>(false);

  // Sort students by XP for leaderboard
  const sortedLeaderboard = [...allStudents].sort((a, b) => b.xp - a.xp);
  const myRank = sortedLeaderboard.findIndex((s) => s.id === student.id) + 1;

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-amber-900/10 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 uppercase tracking-wider mb-1">
            <span>Modul Ganjaran & Pengiktirafan</span>
            <span aria-hidden="true">·</span>
            <span>Pencapaian Seni Bahasa Tahun 5</span>
          </div>
          <h2 className="text-2xl font-bold text-amber-950 font-display">
            Papan Ganjaran & Sijil Penghargaan
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Kumpul mata pengalaman (XP), semak lencana kebesaran yang diraih, dan cetak Sijil Penghargaan Aktiviti Pembelajaran!
          </p>
        </div>

        <button
          onClick={() => {
            setShowCertificateModal(true);
            audioEngine.playFanfareSfx();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold rounded-lg text-xs shadow-sm transition-colors shrink-0"
        >
          <Award className="w-4 h-4" />
          <span>Jana Sijil Penghargaan A4</span>
        </button>
      </div>

      {/* Grid: Badges & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Badges System */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-amber-950 font-display flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Koleksi Lencana Pahlawan Syair</span>
            </h3>
            <span className="text-xs font-semibold text-slate-500 font-mono">
              {student.badges.length} / {BADGES_LIST.length} Dibuka
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {BADGES_LIST.map((badge) => {
              const isUnlocked = student.badges.includes(badge.id) || student.xp >= badge.unlockedAtXp;
              return (
                <div
                  key={badge.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isUnlocked
                      ? 'bg-gradient-to-br from-amber-50 to-orange-50/50 border-amber-300 shadow-xs'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold ${
                        isUnlocked
                          ? 'bg-amber-400 text-amber-950 shadow-xs'
                          : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      {isUnlocked ? <Trophy className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    </div>

                    <span className="text-[11px] font-mono tabular-nums font-semibold text-slate-500">
                      {badge.unlockedAtXp} XP
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 font-display">
                    {badge.name}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-snug">
                    {badge.description}
                  </p>
                  <span className="text-[10px] text-amber-800 font-medium block mt-2 pt-2 border-t border-amber-200/50">
                    Syarat: {badge.criteria}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (5 cols): Leaderboard with Teacher Privacy Setting */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-amber-950 font-display flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-600" />
              <span>Carta Pahlawan Kelas</span>
            </h3>
            <span className="text-xs text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded font-semibold">
              {student.className}
            </span>
          </div>

          {settings.showLeaderboard ? (
            <div className="space-y-3">
              {/* My Position Card */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950 to-amber-900 text-amber-50 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-400 text-amber-950 font-bold flex items-center justify-center text-xs">
                    #{myRank > 0 ? myRank : 1}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-amber-100 block">
                      {student.name} (Anda)
                    </span>
                    <span className="text-[11px] text-amber-300">
                      {student.character === 'tuah' ? 'Pendekar Tuah Cilik' : 'Srikandi Teja Cilik'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-bold font-mono text-amber-300 tabular-nums">
                    {student.xp} XP
                  </span>
                  <span className="text-[10px] text-amber-200/80 block">{student.stars} Bintang</span>
                </div>
              </div>

              {/* Class Leaderboard List */}
              <div className="space-y-2">
                {sortedLeaderboard.slice(0, 5).map((s, idx) => (
                  <div
                    key={s.id}
                    className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center font-bold font-mono text-[11px] ${
                          idx === 0
                            ? 'bg-amber-400 text-amber-950'
                            : idx === 1
                            ? 'bg-slate-300 text-slate-800'
                            : 'bg-amber-700/20 text-amber-900'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div>
                        <span className="font-semibold text-slate-800 block">{s.name}</span>
                        <span className="text-[10px] text-slate-500">{s.className}</span>
                      </div>
                    </div>

                    <span className="font-mono font-bold text-amber-900 tabular-nums">
                      {s.xp} XP
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Privacy Message if Hidden by Teacher */
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-2">
              <EyeOff className="w-8 h-8 text-slate-400 mx-auto" />
              <strong className="text-xs font-bold text-slate-700 block">
                Papan Kedudukan Disembunyikan
              </strong>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Guru telah menetapkan paparan skor tertutup untuk menjaga privasi murid dan menggalakkan pembelajaran santai tanpa tekanan persaingan.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sijil Penghargaan A4 Modal */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="bg-white max-w-3xl w-full rounded-2xl shadow-2xl border-4 border-amber-600 p-6 sm:p-8 space-y-5 relative max-h-[92vh] overflow-y-auto">
            {/* Modal Title & Disclaimer Notice */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 text-center">
              <strong>Sijil Penghargaan Aktiviti Pembelajaran:</strong> Pengiktirafan bagi kejayaan melengkapkan aktiviti sastera syair Tahun 5 mengikut SP 4.2.1.
            </div>

            {/* Certificate A4 Outer Container */}
            <div
              id="printable-certificate"
              className="border-4 border-double border-amber-700 p-6 sm:p-8 rounded-xl bg-gradient-to-br from-[#FFF9EE] via-[#FFFDF8] to-[#FFF5DF] text-center space-y-4 shadow-sm relative overflow-hidden"
            >
              {/* Corner Decorative Motifs */}
              <div className="absolute top-2 left-2 text-amber-700/30 text-2xl font-serif">❦</div>
              <div className="absolute top-2 right-2 text-amber-700/30 text-2xl font-serif">❦</div>
              <div className="absolute bottom-2 left-2 text-amber-700/30 text-2xl font-serif">❦</div>
              <div className="absolute bottom-2 right-2 text-amber-700/30 text-2xl font-serif">❦</div>

              <div className="flex justify-center items-center gap-2 text-amber-800">
                <Sparkles className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-widest font-mono">
                  Seni Bahasa Melayu · Tahun 5 (SP 4.2.1)
                </span>
                <Sparkles className="w-5 h-5" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold font-display text-amber-950">
                Sijil Penghargaan
              </h2>
              <span className="text-sm font-serif italic text-amber-900 block">
                Pahlawan Syair: Kembara Irama Melayu
              </span>

              <p className="text-xs text-slate-700 max-w-lg mx-auto leading-relaxed pt-2">
                Dengan ini diperakui bahawa murid yang bernama di bawah telah melafazkan dan melagukan syair menggunakan irama warisan serta menyatakan idea keseluruhan syair dengan cemerlang:
              </p>

              {/* Editable Name & Details */}
              <div className="max-w-md mx-auto py-2 space-y-3">
                <div>
                  <input
                    type="text"
                    value={studentNameInput}
                    onChange={(e) => setStudentNameInput(e.target.value)}
                    className="w-full text-center text-xl sm:text-2xl font-bold font-serif text-amber-950 border-b-2 border-amber-700 bg-transparent py-1 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Sekolah:</span>
                    <input
                      type="text"
                      value={schoolNameInput}
                      onChange={(e) => setSchoolNameInput(e.target.value)}
                      className="w-full text-center border-b border-amber-400 bg-transparent py-0.5 focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Kelas:</span>
                    <input
                      type="text"
                      value={classNameInput}
                      onChange={(e) => setClassNameInput(e.target.value)}
                      className="w-full text-center border-b border-amber-400 bg-transparent py-0.5 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Competency & Signature Strip */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-amber-200/80 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Tarikh:</span>
                  <input
                    type="date"
                    value={dateInput}
                    onChange={(e) => setDateInput(e.target.value)}
                    className="text-center font-mono font-bold text-amber-900 bg-transparent border-b border-amber-300 focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Mata Pengalaman</span>
                  <strong className="text-amber-950 font-mono text-sm">{student.xp} XP</strong>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Tandatangan Guru</span>
                  <div className="h-6 border-b border-dashed border-slate-400 mx-auto w-32 mt-1" />
                  <span className="text-[10px] text-slate-500 block mt-0.5">Guru Bahasa Melayu</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setShowCertificateModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Tutup
              </button>

              <button
                onClick={handlePrintCertificate}
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-800 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shadow-md transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / Simpan PDF Sijil (A4)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
