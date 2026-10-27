/**
 * Pengurus Storan Setempat (localStorage)
 * Mengasingkan rekod murid, sesi guru, pentaksiran, dan tetapan privasi.
 */

import { StudentProfile } from '../types/syair';

const STORAGE_KEY_STUDENTS = 'pahlawan_syair_students_v2';
const STORAGE_KEY_SESSION = 'pahlawan_syair_session_v2';
const STORAGE_KEY_SETTINGS = 'pahlawan_syair_settings_v2';

export interface AppSession {
  role: 'guest' | 'student' | 'teacher';
  activeStudentId?: string;
  teacherAuthenticated?: boolean;
}

export interface TeacherSettings {
  showLeaderboard: boolean;
  schoolName: string;
}

const DEFAULT_SETTINGS: TeacherSettings = {
  showLeaderboard: true,
  schoolName: 'Sekolah Kebangsaan Seri Budiman'
};

const INITIAL_DEMO_STUDENTS: StudentProfile[] = [
  {
    id: 'std_demo_1',
    name: 'Ahmad Faiz bin Zulkifli',
    className: 'Tahun 5 Bestari',
    character: 'tuah',
    xp: 280,
    stars: 8,
    badges: ['pujangga_muda', 'jaguh_irama'],
    completedModules: {
      pondokIrama: true,
      bedahMakna: true,
      gameIramaMatch: true,
      gameTangkapKata: false,
      karaoke: true
    },
    quizScores: { rangkap1: 5, rangkap2: 4, rangkap3: 4, rangkap4: 3 },
    quizAttempts: { rangkap1: 1, rangkap2: 2, rangkap3: 1, rangkap4: 2 },
    earnedQuizXp: { rangkap1: true, rangkap2: true, rangkap3: true },
    karaokeAssessment: {
      sebutan: 4,
      kelancaran: 3,
      irama: 4,
      penghayatan: 3,
      totalScore: 88,
      recordedAt: '2026-10-25',
      iramaChosen: 'dodoi',
      studentReflection: 'Saya berasa tenang melagukan Irama Dodoi dengan alunan mendayu.'
    },
    teacherAssessment: {
      sebutan: 4,
      kelancaran: 3,
      irama: 4,
      penghayatan: 4,
      totalScore: 94,
      comments: 'Lafaz sebutan Faiz sangat jelas dan intonasi Dodoi dihayati dengan bersopan santun.',
      evaluatedAt: '2026-10-26',
      teacherName: 'Cikgu Zulaikha'
    },
    createdAt: '2026-10-20',
    lastActive: '2026-10-26'
  },
  {
    id: 'std_demo_2',
    name: 'Nurul Huda binti Azman',
    className: 'Tahun 5 Bestari',
    character: 'teja',
    xp: 350,
    stars: 10,
    badges: ['pujangga_muda', 'jaguh_irama', 'penyusun_hikmah'],
    completedModules: {
      pondokIrama: true,
      bedahMakna: true,
      gameIramaMatch: true,
      gameTangkapKata: true,
      karaoke: true
    },
    quizScores: { rangkap1: 5, rangkap2: 5, rangkap3: 5, rangkap4: 4 },
    quizAttempts: { rangkap1: 1, rangkap2: 1, rangkap3: 1, rangkap4: 1 },
    earnedQuizXp: { rangkap1: true, rangkap2: true, rangkap3: true, rangkap4: true },
    karaokeAssessment: {
      sebutan: 4,
      kelancaran: 4,
      irama: 4,
      penghayatan: 4,
      totalScore: 96,
      recordedAt: '2026-10-25',
      iramaChosen: 'selendang_delima',
      studentReflection: 'Saya berlatih jeda pendek dan henti penuh dengan teliti.'
    },
    teacherAssessment: {
      sebutan: 4,
      kelancaran: 4,
      irama: 4,
      penghayatan: 4,
      totalScore: 100,
      comments: 'Cemerlang! Lenggok Irama Selendang Delima dinyanyikan dengan cukup merdu.',
      evaluatedAt: '2026-10-26',
      teacherName: 'Cikgu Zulaikha'
    },
    createdAt: '2026-10-20',
    lastActive: '2026-10-26'
  },
  {
    id: 'std_demo_3',
    name: 'Danish Iskandar bin Roslan',
    className: 'Tahun 5 Cemerlang',
    character: 'tuah',
    xp: 190,
    stars: 5,
    badges: ['pujangga_muda'],
    completedModules: {
      pondokIrama: true,
      bedahMakna: true,
      gameIramaMatch: false,
      gameTangkapKata: false,
      karaoke: false
    },
    quizScores: { rangkap1: 4, rangkap2: 3, rangkap3: 3, rangkap4: 2 },
    quizAttempts: { rangkap1: 2, rangkap2: 2, rangkap3: 2, rangkap4: 3 },
    earnedQuizXp: { rangkap1: true, rangkap2: true },
    createdAt: '2026-10-22',
    lastActive: '2026-10-26'
  },
  {
    id: 'std_demo_4',
    name: 'Tan Mei Ling',
    className: 'Tahun 5 Gemilang',
    character: 'teja',
    xp: 220,
    stars: 6,
    badges: ['pujangga_muda', 'jaguh_irama'],
    completedModules: {
      pondokIrama: true,
      bedahMakna: true,
      gameIramaMatch: true,
      gameTangkapKata: false,
      karaoke: false
    },
    quizScores: { rangkap1: 4, rangkap2: 4, rangkap3: 4, rangkap4: 4 },
    quizAttempts: { rangkap1: 1, rangkap2: 1, rangkap3: 1, rangkap4: 1 },
    earnedQuizXp: { rangkap1: true, rangkap2: true, rangkap3: true, rangkap4: true },
    createdAt: '2026-10-23',
    lastActive: '2026-10-25'
  }
];

export const getStoredStudents = (): StudentProfile[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STUDENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(INITIAL_DEMO_STUDENTS));
      return INITIAL_DEMO_STUDENTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Gagal membaca rekod murid dari storan:', e);
    return INITIAL_DEMO_STUDENTS;
  }
};

export const saveStudentProfile = (student: StudentProfile): void => {
  try {
    const current = getStoredStudents();
    const existingIndex = current.findIndex((s) => s.id === student.id);
    let updated: StudentProfile[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = { ...student, lastActive: new Date().toISOString().split('T')[0] };
    } else {
      updated = [student, ...current];
    }
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(updated));
  } catch (e) {
    console.error('Gagal menyimpan rekod murid:', e);
  }
};

export const getStoredSession = (): AppSession => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSION);
    if (!raw) return { role: 'guest' };
    return JSON.parse(raw);
  } catch {
    return { role: 'guest' };
  }
};

export const saveStoredSession = (session: AppSession): void => {
  try {
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
  } catch (e) {
    console.error('Gagal menyimpan sesi:', e);
  }
};

export const getTeacherSettings = (): TeacherSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveTeacherSettings = (settings: TeacherSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Gagal menyimpan tetapan guru:', e);
  }
};

export const exportStudentsToCsv = (): void => {
  const students = getStoredStudents();
  const headers = [
    'ID Murid',
    'Nama Murid',
    'Kelas',
    'Watak',
    'Jumlah XP',
    'Jumlah Bintang',
    'Lencana',
    'Pondok Irama',
    'Fahami Syair',
    'Teka Irama',
    'Tangkap Kata',
    'Lagukan Syair',
    'Purata Kuiz (%)',
    'Markah Pentaksiran Guru (%)',
    'Komen Guru'
  ];

  const rows = students.map((s) => {
    const totalQuiz = s.quizScores.rangkap1 + s.quizScores.rangkap2 + s.quizScores.rangkap3 + s.quizScores.rangkap4;
    const quizPct = Math.round((totalQuiz / 20) * 100);
    const teacherScore = s.teacherAssessment ? `${s.teacherAssessment.totalScore}%` : 'Belum dinilai';
    const teacherComment = s.teacherAssessment ? `"${s.teacherAssessment.comments.replace(/"/g, '""')}"` : 'Tiada';

    return [
      s.id,
      `"${s.name}"`,
      `"${s.className}"`,
      s.character === 'tuah' ? 'Pendekar Tuah' : 'Srikandi Teja',
      s.xp,
      s.stars,
      `"${s.badges.join(', ')}"`,
      s.completedModules.pondokIrama ? 'Selesai' : 'Belum',
      s.completedModules.bedahMakna ? 'Selesai' : 'Belum',
      s.completedModules.gameIramaMatch ? 'Selesai' : 'Belum',
      s.completedModules.gameTangkapKata ? 'Selesai' : 'Belum',
      s.completedModules.karaoke ? 'Selesai' : 'Belum',
      `${quizPct}%`,
      teacherScore,
      teacherComment
    ].join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `laporan_pahlawan_syair_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const STORAGE_KEY_TEACHER_AUDIO_KEYS = 'pahlawan_syair_padankan_irama_keys_v1';

export interface TeacherAudioKeys {
  audio3CorrectIrama?: 'dodoi' | 'selendang_delima';
  audio4CorrectIrama?: 'dodoi' | 'selendang_delima';
  audio3VerifiedByTeacher?: boolean;
  audio4VerifiedByTeacher?: boolean;
}

export const getTeacherAudioKeys = (): TeacherAudioKeys => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TEACHER_AUDIO_KEYS);
    if (!raw) {
      return {
        audio3CorrectIrama: 'selendang_delima',
        audio4CorrectIrama: 'dodoi',
        audio3VerifiedByTeacher: true,
        audio4VerifiedByTeacher: true
      };
    }
    const parsed = JSON.parse(raw);
    return {
      audio3CorrectIrama: parsed.audio3CorrectIrama || 'selendang_delima',
      audio4CorrectIrama: parsed.audio4CorrectIrama || 'dodoi',
      audio3VerifiedByTeacher: true,
      audio4VerifiedByTeacher: true
    };
  } catch {
    return {
      audio3CorrectIrama: 'selendang_delima',
      audio4CorrectIrama: 'dodoi',
      audio3VerifiedByTeacher: true,
      audio4VerifiedByTeacher: true
    };
  }
};

export const saveTeacherAudioKeys = (keys: TeacherAudioKeys): void => {
  try {
    localStorage.setItem(STORAGE_KEY_TEACHER_AUDIO_KEYS, JSON.stringify(keys));
  } catch (e) {
    console.error('Gagal menyimpan kunci audio guru:', e);
  }
};

