import React, { useState } from 'react';
import {
  Users,
  Award,
  BookOpen,
  Search,
  Filter,
  Download,
  Printer,
  Eye,
  CheckCircle2,
  XCircle,
  Save,
  Shield,
  EyeOff,
  LogOut,
  Sparkles,
  ShieldCheck,
  ExternalLink,
  Music,
  Headphones
} from 'lucide-react';
import { StudentProfile } from '../types/syair';
import {
  getStoredStudents,
  saveStudentProfile,
  exportStudentsToCsv,
  getTeacherSettings,
  saveTeacherSettings,
  TeacherSettings,
  getTeacherAudioKeys,
  saveTeacherAudioKeys,
  TeacherAudioKeys
} from '../utils/storage';
import { PADANKAN_IRAMA_QUESTIONS } from '../data/syairData';
import { audioEngine } from '../utils/audioEngine';

interface TeacherDashboardProps {
  onLogout: () => void;
  onOpenDskpModal: () => void;
}

const CLASS_FILTER_OPTIONS = [
  'Semua Kelas',
  'Tahun 5 Bestari',
  'Tahun 5 Cemerlang',
  'Tahun 5 Gemilang',
  'Tahun 5 Wawasan'
];

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  onLogout,
  onOpenDskpModal
}) => {
  const [students, setStudents] = useState<StudentProfile[]>(getStoredStudents());
  const [selectedClass, setSelectedClass] = useState<string>('Semua Kelas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [teacherSettings, setTeacherSettings] = useState<TeacherSettings>(getTeacherSettings());

  // Assessment rubric state for currently inspected student
  const [rubricSebutan, setRubricSebutan] = useState<number>(4);
  const [rubricKelancaran, setRubricKelancaran] = useState<number>(4);
  const [rubricIrama, setRubricIrama] = useState<number>(4);
  const [rubricPenghayatan, setRubricPenghayatan] = useState<number>(4);
  const [teacherComment, setTeacherComment] = useState<string>('');
  const [teacherNameInput, setTeacherNameInput] = useState<string>('Cikgu Zulaikha');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Teka Irama Audio Keys Verification State
  const [teacherAudioKeys, setTeacherAudioKeys] = useState<TeacherAudioKeys>(getTeacherAudioKeys());
  const [keyUpdateMsg, setKeyUpdateMsg] = useState<string | null>(null);

  const handleUpdateAudioKey = (audioNum: 3 | 4, irama: 'dodoi' | 'selendang_delima') => {
    const updated: TeacherAudioKeys = {
      ...teacherAudioKeys,
      [audioNum === 3 ? 'audio3CorrectIrama' : 'audio4CorrectIrama']: irama,
      [audioNum === 3 ? 'audio3VerifiedByTeacher' : 'audio4VerifiedByTeacher']: true
    };
    setTeacherAudioKeys(updated);
    saveTeacherAudioKeys(updated);
    audioEngine.playCorrectSfx();
    setKeyUpdateMsg(
      `Kunci jawapan Audio ${audioNum} telah disahkan sebagai Irama ${
        irama === 'dodoi' ? 'Dodoi' : 'Selendang Delima'
      }!`
    );
    setTimeout(() => setKeyUpdateMsg(null), 4000);
  };

  const refreshStudents = () => {
    setStudents(getStoredStudents());
  };

  const handleSelectStudentForInspection = (student: StudentProfile) => {
    setSelectedStudent(student);
    if (student.teacherAssessment) {
      setRubricSebutan(student.teacherAssessment.sebutan);
      setRubricKelancaran(student.teacherAssessment.kelancaran);
      setRubricIrama(student.teacherAssessment.irama);
      setRubricPenghayatan(student.teacherAssessment.penghayatan);
      setTeacherComment(student.teacherAssessment.comments);
      setTeacherNameInput(student.teacherAssessment.teacherName || 'Cikgu Zulaikha');
    } else {
      setRubricSebutan(student.karaokeAssessment?.sebutan || 3);
      setRubricKelancaran(student.karaokeAssessment?.kelancaran || 3);
      setRubricIrama(student.karaokeAssessment?.irama || 3);
      setRubricPenghayatan(student.karaokeAssessment?.penghayatan || 3);
      setTeacherComment('Lafaz sebutan jelas dan intonasi irama dihayati dengan baik.');
    }
    setSaveSuccessMsg(null);
    audioEngine.playTapSfx();
  };

  const handleSaveAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const totalScore = Math.round(
      ((rubricSebutan + rubricKelancaran + rubricIrama + rubricPenghayatan) / 16) * 100
    );

    const updatedProfile: StudentProfile = {
      ...selectedStudent,
      teacherAssessment: {
        sebutan: rubricSebutan,
        kelancaran: rubricKelancaran,
        irama: rubricIrama,
        penghayatan: rubricPenghayatan,
        totalScore,
        comments: teacherComment,
        evaluatedAt: new Date().toISOString().split('T')[0],
        teacherName: teacherNameInput
      }
    };

    saveStudentProfile(updatedProfile);
    refreshStudents();
    setSelectedStudent(updatedProfile);
    setSaveSuccessMsg('Pentaksiran guru telah berjaya disimpan ke rekod murid!');
    audioEngine.playCorrectSfx();
  };

  const handleToggleLeaderboardPrivacy = () => {
    const next = {
      ...teacherSettings,
      showLeaderboard: !teacherSettings.showLeaderboard
    };
    setTeacherSettings(next);
    saveTeacherSettings(next);
    audioEngine.playTapSfx();
  };

  // Filtered Students
  const filteredStudents = students.filter((s) => {
    const matchClass = selectedClass === 'Semua Kelas' || s.className === selectedClass;
    const matchSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.className.toLowerCase().includes(searchQuery.toLowerCase());
    return matchClass && matchSearch;
  });

  // Calculate Aggregates
  const totalRegistered = students.length;
  const activeStudents = students.filter((s) => s.lastActive).length;
  const avgQuizScore = Math.round(
    students.reduce((acc, s) => {
      const tot = s.quizScores.rangkap1 + s.quizScores.rangkap2 + s.quizScores.rangkap3 + s.quizScores.rangkap4;
      return acc + (tot / 20) * 100;
    }, 0) / (students.length || 1)
  );
  const assessedStudents = students.filter((s) => s.teacherAssessment);
  const avgKaraoke = Math.round(
    assessedStudents.reduce((acc, s) => acc + (s.teacherAssessment?.totalScore || 0), 0) /
      (assessedStudents.length || 1)
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-amber-950 text-amber-50 p-6 rounded-2xl border border-amber-900 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1 font-mono">
            <span>Portal Pentaksiran Bilik Darjah (PBD)</span>
            <span>·</span>
            <span>Bahasa Melayu Tahun 5 (SP 4.2.1)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-amber-100">
            Dashboard Pengurusan & Pentaksiran Guru
          </h2>
          <p className="text-xs sm:text-sm text-amber-200/80">
            Pemberitahuan: Rekod prototaip disimpan setempat (localStorage) dengan data demonstrasi kelas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenDskpModal}
            className="px-3.5 py-2 bg-amber-900 hover:bg-amber-800 text-amber-200 border border-amber-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Skrip DSKP</span>
          </button>

          <button
            onClick={exportStudentsToCsv}
            className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-amber-950 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Eksport CSV Laporan</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-amber-900 hover:bg-amber-800 text-amber-200 border border-amber-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak</span>
          </button>

          <button
            onClick={onLogout}
            className="px-3.5 py-2 bg-rose-900/80 hover:bg-rose-800 text-rose-200 border border-rose-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Keluar Guru</span>
          </button>
        </div>
      </div>

      {/* Section A: Class Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase">Jumlah Murid</span>
            <Users className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {totalRegistered}
          </span>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            {activeStudents} murid aktif minggu ini
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase">Purata Kuiz</span>
            <BookOpen className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {avgQuizScore}%
          </span>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            Berdasarkan 4 rangkap syair
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase">Purata Pentaksiran</span>
            <Award className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {avgKaraoke > 0 ? `${avgKaraoke}%` : 'Belum dinilai'}
          </span>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            {assessedStudents.length} murid telah dinilai
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase">Privasi Papan Skor</span>
            {teacherSettings.showLeaderboard ? (
              <Eye className="w-4 h-4 text-emerald-600" />
            ) : (
              <EyeOff className="w-4 h-4 text-rose-600" />
            )}
          </div>
          <button
            onClick={handleToggleLeaderboardPrivacy}
            className={`w-full py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors ${
              teacherSettings.showLeaderboard
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            {teacherSettings.showLeaderboard ? 'Paparan: Dibuka Kepada Murid' : 'Paparan: Disembunyikan (Privasi)'}
          </button>
          <span className="text-[10px] text-slate-500 block mt-1">
            Klik untuk tukar tetapan privasi kelas
          </span>
        </div>
      </div>

      {/* Section B & C: Students List & Individual Assessment Inspection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Students Table with Filters */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-amber-950 font-display flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-600" />
              <span>Senarai Rekod Murid</span>
            </h3>

            {/* Filter and Search Bar */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari murid..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 w-36 sm:w-44"
                />
              </div>

              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="py-1.5 px-2.5 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none"
              >
                {CLASS_FILTER_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Murid</th>
                  <th className="py-2.5 px-2">Kelas</th>
                  <th className="py-2.5 px-2 font-mono">XP</th>
                  <th className="py-2.5 px-2">Modul</th>
                  <th className="py-2.5 px-2">Pentaksiran</th>
                  <th className="py-2.5 px-2 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((s) => {
                    const isSelected = selectedStudent?.id === s.id;
                    const modulesDone = Object.values(s.completedModules).filter(Boolean).length;
                    return (
                      <tr
                        key={s.id}
                        className={`transition-colors hover:bg-amber-50/60 ${
                          isSelected ? 'bg-amber-50/80 font-medium' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-slate-900 block">{s.name}</span>
                          <span className="text-[10px] text-slate-500">
                            {s.character === 'tuah' ? 'Pendekar Tuah' : 'Srikandi Teja'}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-slate-700">{s.className}</td>
                        <td className="py-2.5 px-2 font-mono font-bold text-amber-900 tabular-nums">
                          {s.xp}
                        </td>
                        <td className="py-2.5 px-2">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 font-mono">
                            {modulesDone}/5 Modul
                          </span>
                        </td>
                        <td className="py-2.5 px-2">
                          {s.teacherAssessment ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold text-[11px]">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{s.teacherAssessment.totalScore}%</span>
                            </span>
                          ) : s.karaokeAssessment ? (
                            <span className="inline-block text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                              Refleksi ({s.karaokeAssessment.totalScore}%)
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Belum dinilai</span>
                          )}
                        </td>
                        <td className="py-2.5 px-2 text-right">
                          <button
                            onClick={() => handleSelectStudentForInspection(s)}
                            className="px-2.5 py-1 text-xs font-semibold bg-amber-800 hover:bg-amber-700 text-amber-100 rounded-md transition-colors"
                          >
                            Taksir
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400 text-xs">
                      Tiada rekod murid yang sepadan dengan carian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column (5 cols): Assessment Rubric & Feedback Form */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
              Borang Pentaksiran PBD (SP 4.2.1)
            </span>
            <h3 className="text-base font-bold text-slate-900 font-display">
              {selectedStudent ? selectedStudent.name : 'Pilih Murid dari Jadual'}
            </h3>
            {selectedStudent && (
              <span className="text-xs text-slate-500">
                {selectedStudent.className} · ID: {selectedStudent.id}
              </span>
            )}
          </div>

          {selectedStudent ? (
            <form onSubmit={handleSaveAssessment} className="space-y-4 text-xs">
              {/* Module Completion Indicators */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-800 block">
                  Status Penyelesaian 5 Modul:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                      selectedStudent.completedModules.pondokIrama
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {selectedStudent.completedModules.pondokIrama ? '✓' : '○'} Pondok Irama
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                      selectedStudent.completedModules.bedahMakna
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {selectedStudent.completedModules.bedahMakna ? '✓' : '○'} Fahami Syair
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                      selectedStudent.completedModules.gameIramaMatch
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {selectedStudent.completedModules.gameIramaMatch ? '✓' : '○'} Teka Irama
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                      selectedStudent.completedModules.gameTangkapKata
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {selectedStudent.completedModules.gameTangkapKata ? '✓' : '○'} Tangkap Kata
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                      selectedStudent.completedModules.karaoke
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {selectedStudent.completedModules.karaoke ? '✓' : '○'} Lagukan Syair
                  </span>
                </div>
              </div>

              {/* Student's Quiz Performance Snapshot */}
              <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/60">
                <span className="font-bold text-amber-950 block mb-1">
                  Prestasi Kuiz Kefahaman Syair:
                </span>
                <div className="grid grid-cols-4 gap-1 text-center font-mono">
                  <div className="bg-white p-1 rounded border border-amber-200">
                    <span className="text-[10px] text-slate-500 block">R1</span>
                    <strong className="text-amber-900">{selectedStudent.quizScores.rangkap1}/5</strong>
                  </div>
                  <div className="bg-white p-1 rounded border border-amber-200">
                    <span className="text-[10px] text-slate-500 block">R2</span>
                    <strong className="text-amber-900">{selectedStudent.quizScores.rangkap2}/5</strong>
                  </div>
                  <div className="bg-white p-1 rounded border border-amber-200">
                    <span className="text-[10px] text-slate-500 block">R3</span>
                    <strong className="text-amber-900">{selectedStudent.quizScores.rangkap3}/5</strong>
                  </div>
                  <div className="bg-white p-1 rounded border border-amber-200">
                    <span className="text-[10px] text-slate-500 block">R4</span>
                    <strong className="text-amber-900">{selectedStudent.quizScores.rangkap4}/5</strong>
                  </div>
                </div>
              </div>

              {/* Rubric Scales: 1 to 4 */}
              <div className="space-y-3">
                <span className="font-bold text-slate-800 block uppercase">
                  Rubrik Penilaian 4 Aspek (Skala 1 - 4):
                </span>

                {/* 1. Sebutan */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-slate-700">1. Kejelasan Sebutan Baku</span>
                    <span className="font-bold text-amber-900 font-mono">Skala {rubricSebutan}/4</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {[1, 2, 3, 4].map((val) => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => setRubricSebutan(val)}
                        className={`py-1 text-center rounded border font-semibold ${
                          rubricSebutan === val
                            ? 'bg-amber-800 text-white border-amber-800'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        Tahap {val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Kelancaran */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-slate-700">2. Kelancaran Melafazkan</span>
                    <span className="font-bold text-amber-900 font-mono">Skala {rubricKelancaran}/4</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {[1, 2, 3, 4].map((val) => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => setRubricKelancaran(val)}
                        className={`py-1 text-center rounded border font-semibold ${
                          rubricKelancaran === val
                            ? 'bg-amber-800 text-white border-amber-800'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        Tahap {val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Kesesuaian Irama */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-slate-700">3. Kesesuaian Irama & Intonasi</span>
                    <span className="font-bold text-amber-900 font-mono">Skala {rubricIrama}/4</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {[1, 2, 3, 4].map((val) => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => setRubricIrama(val)}
                        className={`py-1 text-center rounded border font-semibold ${
                          rubricIrama === val
                            ? 'bg-amber-800 text-white border-amber-800'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        Tahap {val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Penghayatan & Jeda */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-slate-700">4. Penghayatan & Tanda Jeda</span>
                    <span className="font-bold text-amber-900 font-mono">Skala {rubricPenghayatan}/4</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {[1, 2, 3, 4].map((val) => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => setRubricPenghayatan(val)}
                        className={`py-1 text-center rounded border font-semibold ${
                          rubricPenghayatan === val
                            ? 'bg-amber-800 text-white border-amber-800'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        Tahap {val}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Comments & Teacher Signature */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Ulasan & Maklum Balas Guru Pentaksir:
                  </label>
                  <textarea
                    rows={2}
                    value={teacherComment}
                    onChange={(e) => setTeacherComment(e.target.value)}
                    placeholder="Tulis maklum balas membina..."
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Nama Guru:
                  </label>
                  <input
                    type="text"
                    value={teacherNameInput}
                    onChange={(e) => setTeacherNameInput(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              {saveSuccessMsg && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-900 text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-800 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Pentaksiran Murid</span>
              </button>
            </form>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              Sila pilih salah seorang murid daripada jadual di sebelah kiri untuk melihat rekod kemajuan dan mengisi borang pentaksiran.
            </div>
          )}
        </div>
      </div>

      {/* Section D: Pengesahan Kunci Jawapan Segmen Audio — Teka Irama */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider mb-0.5">
              <Headphones className="w-4 h-4 text-amber-700" />
              <span>Kawalan Pedagogi Guru</span>
            </div>
            <h3 className="text-base font-bold text-amber-950 font-display">
              Pengesahan Kunci Jawapan Segmen Audio — Teka Irama
            </h3>
            <p className="text-xs text-slate-500">
              Guru boleh menyemak pautan video YouTube, julat masa rasmi dan mengesahkan kategori irama bagi 4 segmen soalan murid.
            </p>
          </div>

          {keyUpdateMsg && (
            <div className="p-2 px-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-900 text-xs flex items-center gap-1.5 shrink-0 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold">{keyUpdateMsg}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Audio 1 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <strong className="text-slate-900 font-bold text-sm">Audio 1 — Irama Dodoi</strong>
              <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                <ShieldCheck className="w-3 h-3" />
                <span>Disahkan</span>
              </span>
            </div>
            <p className="text-slate-600">
              ID Video: <code className="bg-white px-1 py-0.5 rounded border border-slate-200 font-mono">Ew2DqLW-xfI</code> · Masa: <strong>00:19 - 01:16</strong> (19s - 76s)
            </p>
            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-700">Kunci Jawapan: <strong className="text-amber-950">Dodoi</strong></span>
              <a
                href="https://youtu.be/Ew2DqLW-xfI"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-amber-800 hover:text-amber-900 hover:underline"
              >
                <span>Dengar di YouTube</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Audio 2 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <strong className="text-slate-900 font-bold text-sm">Audio 2 — Irama Selendang Delima</strong>
              <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                <ShieldCheck className="w-3 h-3" />
                <span>Disahkan</span>
              </span>
            </div>
            <p className="text-slate-600">
              ID Video: <code className="bg-white px-1 py-0.5 rounded border border-slate-200 font-mono">za2agXGQAeg</code> · Masa: <strong>00:08 - 01:47</strong> (8s - 107s)
            </p>
            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-700">Kunci Jawapan: <strong className="text-amber-950">Selendang Delima</strong></span>
              <a
                href="https://youtu.be/za2agXGQAeg?list=RDza2agXGQAeg"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-amber-800 hover:text-amber-900 hover:underline"
              >
                <span>Dengar di YouTube</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Audio 3 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <strong className="text-slate-900 font-bold text-sm">Audio 3 — Segmen Audio Baharu</strong>
              <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                <ShieldCheck className="w-3 h-3" />
                <span>Disahkan</span>
              </span>
            </div>
            <p className="text-slate-600">
              ID Video: <code className="bg-white px-1 py-0.5 rounded border border-slate-200 font-mono">fX61D-XA-6c</code> · Masa: <strong>00:14 - 01:41</strong> (14s - 101s)
            </p>
            <div>
              <span className="text-slate-700 block mb-1">Tetapkan Kunci Jawapan Betul bagi Murid:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateAudioKey(3, 'selendang_delima')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                    (teacherAudioKeys.audio3CorrectIrama || 'selendang_delima') === 'selendang_delima'
                      ? 'bg-amber-800 text-white'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Selendang Delima {(teacherAudioKeys.audio3CorrectIrama || 'selendang_delima') === 'selendang_delima' && '✓'}
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateAudioKey(3, 'dodoi')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                    teacherAudioKeys.audio3CorrectIrama === 'dodoi'
                      ? 'bg-amber-800 text-white'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Dodoi {teacherAudioKeys.audio3CorrectIrama === 'dodoi' && '✓'}
                </button>
                <a
                  href="https://youtu.be/fX61D-XA-6c?list=RDfX61D-XA-6c"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto inline-flex items-center gap-1 text-amber-800 hover:text-amber-900 hover:underline"
                >
                  <span>Buka Video</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Audio 4 */}
          <div className="p-4 rounded-xl border border-amber-300/80 bg-amber-50/50 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <strong className="text-slate-900 font-bold text-sm">Audio 4 — Segmen Audio Baharu</strong>
              <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                <ShieldCheck className="w-3 h-3" />
                <span>Disahkan</span>
              </span>
            </div>
            <p className="text-slate-600">
              ID Video: <code className="bg-white px-1 py-0.5 rounded border border-slate-200 font-mono">gCEPfMQqVtY</code> · Masa: <strong>01:02 - 01:29</strong> (62s - 89s)
            </p>
            <div>
              <span className="text-slate-700 block mb-1">Tetapkan Kunci Jawapan Betul bagi Murid:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateAudioKey(4, 'dodoi')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                    (teacherAudioKeys.audio4CorrectIrama || 'dodoi') === 'dodoi'
                      ? 'bg-amber-800 text-white'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Dodoi {(teacherAudioKeys.audio4CorrectIrama || 'dodoi') === 'dodoi' && '✓'}
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateAudioKey(4, 'selendang_delima')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                    teacherAudioKeys.audio4CorrectIrama === 'selendang_delima'
                      ? 'bg-amber-800 text-white'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Selendang Delima {teacherAudioKeys.audio4CorrectIrama === 'selendang_delima' && '✓'}
                </button>
                <a
                  href="https://youtu.be/gCEPfMQqVtY?list=RDgCEPfMQqVtY"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto inline-flex items-center gap-1 text-amber-800 hover:text-amber-900 hover:underline"
                >
                  <span>Buka Video</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
