export type IramaId = 'dodoi' | 'selendang_delima';

export interface IramaDetail {
  id: IramaId;
  name: string;
  alias: string;
  character: string;
  description: string;
  tempo: 'Perlahan & Mendayu-dayu' | 'Sederhana & Merdu';
  tempoBpm: number;
  youtubeId: string;
  youtubeUrl: string;
  rhythmStyle: string;
  suitableTheme: string;
  tips: string;
}

export interface BarisSyair {
  textWithPauses: string;
  cleanText: string;
  meaning: string;
  syllablesCount: number;
  endRhyme: string;
}

export interface KataSukar {
  perkataan: string;
  maksud: string;
  contoh: string;
}

export interface QuizQuestion {
  id: number;
  soalan: string;
  pilihan: [string, string, string, string];
  jawapanBetul: number; // 0, 1, 2, 3
  penerangan: string;
}

export interface RangkapSyair {
  nombor: number;
  tajukRangkap: string;
  baris: BarisSyair[];
  maksudHarafiah: string;
  ideaKeseluruhan: string;
  kataSukar: KataSukar[];
  kataKunciIdea: string[];
  distractors: string[];
  kuiz: QuizQuestion[];
}

export interface SyairPenuh {
  tajuk: string;
  tema: string;
  sasaran: string;
  dskp: {
    standardKandungan: string;
    standardPembelajaran: string;
    aspek: string;
  };
  pendahuluan: string;
  rangkap: RangkapSyair[];
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlockedAtXp: number;
  criteria: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  className: string;
  character: 'tuah' | 'teja';
  xp: number;
  stars: number;
  badges: string[];
  completedModules: {
    pondokIrama: boolean;
    bedahMakna: boolean;
    gameIramaMatch: boolean;
    gameTangkapKata: boolean;
    karaoke: boolean;
  };
  quizScores: {
    rangkap1: number; // out of 5
    rangkap2: number;
    rangkap3: number;
    rangkap4: number;
  };
  quizAttempts: Record<string, number>; // key: rangkap1, value: count
  earnedQuizXp: Record<string, boolean>; // ensure capped 35 XP per rangkap
  karaokeAssessment?: {
    sebutan: number; // 1-4
    kelancaran: number; // 1-4
    irama: number; // 1-4
    penghayatan: number; // 1-4
    totalScore: number; // %
    recordedAt: string;
    iramaChosen: IramaId;
    studentReflection?: string;
  };
  teacherAssessment?: {
    sebutan: number;
    kelancaran: number;
    irama: number;
    penghayatan: number;
    totalScore: number;
    comments: string;
    evaluatedAt: string;
    teacherName: string;
  };
  createdAt: string;
  lastActive: string;
}

export interface NotaIramaDetail {
  id: IramaId;
  nama: string;
  gelaran: string;
  motif: string;
  pengenalan: string;
  ciriCiri: {
    tempo: string;
    melodi: string;
    intonasi: string;
    penyampaian: string;
    fungsi: string;
  };
  contohPenggunaan?: string;
  perananSyair?: string;
  petuaMendengar: string;
  faktaMenarik?: string;
}

export interface SoalanKenaliIrama {
  id: number;
  soalan: string;
  ciriUtama: string;
  jawapanBetul: IramaId;
  penerangan: string;
}
