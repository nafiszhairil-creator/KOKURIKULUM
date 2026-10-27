import React, { useState } from 'react';
import { Sparkles, Shield, User, GraduationCap, ArrowRight, AlertCircle, Info, BookOpen } from 'lucide-react';
import { StudentProfile } from '../types/syair';
import { saveStudentProfile, saveStoredSession, getStoredStudents } from '../utils/storage';
import { audioEngine } from '../utils/audioEngine';
import { apiClient } from '../utils/apiClient';

interface LoginPageProps {
  onLoginStudent: (student: StudentProfile) => void;
  onLoginTeacher: () => void;
  onOpenDskpModal: () => void;
}

const CLASS_OPTIONS = [
  'Tahun 5 Bestari',
  'Tahun 5 Cemerlang',
  'Tahun 5 Gemilang',
  'Tahun 5 Wawasan'
];

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginStudent,
  onLoginTeacher,
  onOpenDskpModal
}) => {
  const [activeTab, setActiveTab] = useState<'student' | 'teacher'>('student');

  // Student Form State
  const [studentName, setStudentName] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>(CLASS_OPTIONS[0]);
  const [character, setCharacter] = useState<'tuah' | 'teja'>('tuah');
  const [studentError, setStudentError] = useState<string | null>(null);

  // Teacher Form State
  const [teacherCode, setTeacherCode] = useState<string>('');
  const [teacherError, setTeacherError] = useState<string | null>(null);

  // Existing students on this device
  const existingStudents = getStoredStudents().filter((s) => !s.id.startsWith('std_demo'));
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = studentName.trim();
    if (!cleanName) {
      setStudentError('Sila masukkan nama anda sebelum memulakan kembara.');
      audioEngine.playIncorrectSfx();
      return;
    }
    setStudentError(null);
    setIsLoading(true);

    const res = await apiClient.loginStudent({
      name: cleanName,
      className: selectedClass,
      character
    });

    setIsLoading(false);
    if (!res.success || !res.student) {
      setStudentError(res.error || 'Gagal mendaftar murid pada pelayan.');
      audioEngine.playIncorrectSfx();
      return;
    }

    // Save fallback in local storage as well for fast client cache
    saveStudentProfile(res.student);
    saveStoredSession({ role: 'student', activeStudentId: res.student.id });
    audioEngine.playFanfareSfx();
    onLoginStudent(res.student);
  };

  const handleQuickSelectStudent = async (student: StudentProfile) => {
    setIsLoading(true);
    const res = await apiClient.loginStudent({
      name: student.name,
      className: student.className,
      character: student.character,
      studentId: student.id
    });
    setIsLoading(false);

    const activeStudent = res.student || student;
    saveStoredSession({ role: 'student', activeStudentId: activeStudent.id });
    audioEngine.playTapSfx();
    onLoginStudent(activeStudent);
  };

  const handleTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = teacherCode.trim();
    if (!cleanCode) {
      setTeacherError('Sila masukkan kod keselamatan atau kata laluan guru.');
      audioEngine.playIncorrectSfx();
      return;
    }

    setTeacherError(null);
    setIsLoading(true);

    const res = await apiClient.loginTeacher(cleanCode);
    setIsLoading(false);

    if (res.success && res.teacher) {
      saveStoredSession({ role: 'teacher', teacherAuthenticated: true });
      audioEngine.playFanfareSfx();
      onLoginTeacher();
    } else {
      setTeacherError(res.error || 'Akses ditolak. Kod keselamatan guru tidak tepat.');
      audioEngine.playIncorrectSfx();
    }
  };

  const handleSelectQuickTeacher = async (code: string) => {
    setTeacherCode(code);
    setTeacherError(null);
    setIsLoading(true);
    const res = await apiClient.loginTeacher(code);
    setIsLoading(false);

    if (res.success && res.teacher) {
      saveStoredSession({ role: 'teacher', teacherAuthenticated: true });
      audioEngine.playFanfareSfx();
      onLoginTeacher();
    } else {
      setTeacherError(res.error || 'Akses ditolak. Kod keselamatan guru tidak tepat.');
      audioEngine.playIncorrectSfx();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-900 via-amber-950 to-stone-950 text-amber-50 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Bar Branding */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <span className="text-xl font-bold font-display text-amber-100 block leading-none">
              Pahlawan Syair
            </span>
            <span className="text-[11px] text-amber-300/80 font-mono">
              Kembara Irama Melayu · Tahun 5 SK/SJK
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            onOpenDskpModal();
            audioEngine.playTapSfx();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:text-white bg-amber-900/50 hover:bg-amber-900 border border-amber-700/60 rounded-lg transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Panduan DSKP 4.2.1</span>
        </button>
      </div>

      {/* Main Center Content Box */}
      <div className="max-w-4xl mx-auto w-full my-6 bg-stone-900/90 rounded-2xl border border-amber-800/60 shadow-2xl overflow-hidden backdrop-blur-md">
        {/* Banner with Illustrated Heritage Scrim */}
        <div className="relative p-6 sm:p-8 border-b border-amber-800/60 overflow-hidden bg-amber-950/60">
          <img
            src="/src/assets/images/hero_pahlawan_syair_1793033987403.jpg"
            alt="Pahlawan Syair"
            className="absolute inset-0 w-full h-full object-cover opacity-25 object-center"
            referrerPolicy="no-referrer"
          />
          <div className="relative z-10 text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <span>Kurikulum Standard Sekolah Rendah (KSSR Semakan)</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold font-display text-amber-100 text-balance">
              Selamat Datang ke Gerbang Pahlawan Syair
            </h1>
            <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed font-sans">
              Terokai keindahan dua irama warisan, <strong>Irama Dodoi</strong> dan <strong>Irama Selendang Delima</strong>, serta fahami hikmah <strong>Syair Pesanan Bonda</strong> secara interaktif.
            </p>
          </div>
        </div>

        {/* Role Switcher Tabs */}
        <div className="grid grid-cols-2 border-b border-amber-800/60 bg-stone-950/60">
          <button
            onClick={() => {
              setActiveTab('student');
              audioEngine.playTapSfx();
            }}
            className={`py-3.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'student'
                ? 'bg-amber-900/70 text-amber-300 border-b-2 border-amber-400'
                : 'text-amber-200/60 hover:text-amber-100 hover:bg-amber-950/40'
            }`}
          >
            <User className="w-4 h-4" />
            <span>A. LOG MASUK MURID</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('teacher');
              audioEngine.playTapSfx();
            }}
            className={`py-3.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'teacher'
                ? 'bg-amber-900/70 text-amber-300 border-b-2 border-amber-400'
                : 'text-amber-200/60 hover:text-amber-100 hover:bg-amber-950/40'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>B. LOG MASUK GURU</span>
          </button>
        </div>

        {/* Tab 1: Student Login Form */}
        {activeTab === 'student' && (
          <div className="p-6 sm:p-8 space-y-6">
            <form onSubmit={handleStudentSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-amber-300 uppercase tracking-wide mb-1.5">
                    Nama Murid:
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Contoh: Danish Haikal"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-amber-700/60 text-amber-100 placeholder-amber-400/40 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-300 uppercase tracking-wide mb-1.5">
                    Kelas:
                  </label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-amber-700/60 text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                  >
                    {CLASS_OPTIONS.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Character Selection */}
              <div>
                <label className="block text-xs font-bold text-amber-300 uppercase tracking-wide mb-2">
                  Pilih Watak Kembara Anda:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <button
                    type="button"
                    onClick={() => {
                      setCharacter('tuah');
                      audioEngine.playTapSfx();
                    }}
                    className={`p-3.5 rounded-xl text-left border flex items-center gap-3.5 transition-all ${
                      character === 'tuah'
                        ? 'bg-amber-900/80 border-amber-400 shadow-md ring-2 ring-amber-400/30'
                        : 'bg-stone-950/60 border-amber-900/60 hover:bg-stone-900'
                    }`}
                  >
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-amber-400 shrink-0">
                      <img
                        src="/src/assets/images/karakter_pendekar_melayu_1793033989287.jpg"
                        alt="Pendekar Tuah Cilik"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <span className="font-bold text-amber-200 text-sm block">Pendekar Tuah Cilik</span>
                      <span className="text-[11px] text-amber-300/80 block">Pakaian silat songket & seruling buluh</span>
                      <span className="text-[10px] text-emerald-400 font-medium">Fokus: Irama, Sebutan & Disiplin</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCharacter('teja');
                      audioEngine.playTapSfx();
                    }}
                    className={`p-3.5 rounded-xl text-left border flex items-center gap-3.5 transition-all ${
                      character === 'teja'
                        ? 'bg-amber-900/80 border-amber-400 shadow-md ring-2 ring-amber-400/30'
                        : 'bg-stone-950/60 border-amber-900/60 hover:bg-stone-900'
                    }`}
                  >
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-amber-400 shrink-0">
                      <img
                        src="/src/assets/images/karakter_srikandi_melayu_1793033989429.jpg"
                        alt="Srikandi Teja Cilik"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <span className="font-bold text-amber-200 text-sm block">Srikandi Teja Cilik</span>
                      <span className="text-[11px] text-amber-300/80 block">Kurung songket merah & skrol hikmah</span>
                      <span className="text-[10px] text-emerald-400 font-medium">Fokus: Maksud Syair & Nilai Murni</span>
                    </div>
                  </button>
                </div>
              </div>

              {studentError && (
                <div className="p-3 bg-rose-950/80 border border-rose-700/60 text-rose-200 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{studentError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold rounded-xl text-sm transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <span>Mulakan Kembara Pahlawan (+50 XP)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Resume for Previously Registered Students on this Device */}
            {existingStudents.length > 0 && (
              <div className="pt-4 border-t border-amber-900/50">
                <span className="text-xs font-semibold text-amber-400 block mb-2">
                  Atau sambung kembara murid sedia ada pada peranti ini:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {existingStudents.slice(0, 4).map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleQuickSelectStudent(s)}
                      className="p-2.5 bg-stone-950/80 hover:bg-amber-950/60 border border-amber-800/40 rounded-xl text-left flex items-center justify-between text-xs transition-colors"
                    >
                      <div>
                        <span className="font-bold text-amber-100 block">{s.name}</span>
                        <span className="text-[11px] text-amber-400/80">{s.className}</span>
                      </div>
                      <span className="font-mono text-amber-300 font-bold">{s.xp} XP →</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Teacher Login Form (Secured by Server Auth) */}
        {activeTab === 'teacher' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="p-4 bg-amber-950/40 border border-amber-800/40 rounded-xl text-xs text-amber-200/90 flex items-start gap-3">
              <Shield className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300 block mb-0.5 text-sm">
                  Portal Pentaksiran Guru (Kawalan Keselamatan Pelayan)
                </strong>
                <p className="leading-relaxed">
                  Akses kepada jawapan, rakaman suara dan markah pentaksiran murid dilindungi di peringkat pelayan. Guru hanya dibenarkan mengakses data kelas di bawah tanggungjawab masing-masing.
                </p>
              </div>
            </div>

            {/* Quick Select Teacher Account with Class Segregation Badges */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wide block">
                Pilih Akaun Guru Berdaftar:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleSelectQuickTeacher('123')}
                  className="p-3.5 bg-stone-950/80 hover:bg-amber-950/70 border border-amber-800/60 hover:border-amber-400 rounded-xl text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-amber-200 text-xs group-hover:text-amber-100">
                      Cikgu Zulaikha
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-amber-900/60 text-amber-300 px-2 py-0.5 rounded">
                      Kod: 123
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-400 block font-medium">
                    Kelas: Tahun 5 Bestari, 5 Cemerlang
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectQuickTeacher('456')}
                  className="p-3.5 bg-stone-950/80 hover:bg-amber-950/70 border border-amber-800/60 hover:border-amber-400 rounded-xl text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-amber-200 text-xs group-hover:text-amber-100">
                      Ustaz Radzi
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-amber-900/60 text-amber-300 px-2 py-0.5 rounded">
                      Kod: 456
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-400 block font-medium">
                    Kelas: Tahun 5 Gemilang, 5 Wawasan
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectQuickTeacher('789')}
                  className="p-3.5 bg-stone-950/80 hover:bg-amber-950/70 border border-amber-800/60 hover:border-amber-400 rounded-xl text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-amber-200 text-xs group-hover:text-amber-100">
                      Guru Besar / Admin
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-amber-900/60 text-amber-300 px-2 py-0.5 rounded">
                      Kod: 789
                    </span>
                  </div>
                  <span className="text-[11px] text-amber-300 block font-medium">
                    Semua Kelas (Pentadbir Penuh)
                  </span>
                </button>
              </div>
            </div>

            <form onSubmit={handleTeacherSubmit} className="space-y-4 max-w-md mx-auto pt-2">
              <div>
                <label className="block text-xs font-bold text-amber-300 uppercase tracking-wide mb-1.5 text-center">
                  Atau Masukkan Kod Akses Guru / Kata Laluan:
                </label>
                <input
                  type="password"
                  value={teacherCode}
                  onChange={(e) => setTeacherCode(e.target.value)}
                  placeholder="Masukkan kod (123, 456 atau 789)"
                  disabled={isLoading}
                  className="w-full text-center px-4 py-3 rounded-xl bg-stone-950 border border-amber-700/60 text-amber-100 placeholder-amber-400/40 focus:outline-none focus:ring-2 focus:ring-amber-400 text-lg tracking-widest font-mono"
                />
              </div>

              {teacherError && (
                <div className="p-3 bg-rose-950/80 border border-rose-700/60 text-rose-200 rounded-xl text-xs flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{teacherError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-amber-950 font-bold rounded-xl text-sm transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Shield className="w-4 h-4" />
                <span>{isLoading ? 'Mengesahkan dengan Pelayan...' : 'Sahkan & Buka Dashboard Guru'}</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="max-w-4xl mx-auto w-full text-center text-xs text-amber-400/60 py-2">
        <span>Bahasa Melayu Tahun 5 KSSR Semakan · Aspek Seni Bahasa 4.2.1</span>
      </div>
    </div>
  );
};
