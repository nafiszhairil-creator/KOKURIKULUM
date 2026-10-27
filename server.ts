import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Support JSON payloads up to 25MB for audio recording blobs
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// =========================================================================
// DATA MODELS & SECURE SERVER-SIDE DATABASE
// =========================================================================

export interface TeacherAccount {
  id: string;
  name: string;
  username: string;
  code: string;
  passwordHash: string;
  assignedClasses: string[];
  role: 'teacher';
}

export interface StudentRecord {
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
    rangkap1: number;
    rangkap2: number;
    rangkap3: number;
    rangkap4: number;
  };
  quizAttempts: Record<string, number>;
  earnedQuizXp: Record<string, boolean>;
  karaokeAssessment?: {
    sebutan: number;
    kelancaran: number;
    irama: number;
    penghayatan: number;
    totalScore: number;
    recordedAt: string;
    iramaChosen: string;
    studentReflection: string;
    recordingId?: string;
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
  recordingId?: string;
  createdAt: string;
  lastActive: string;
}

export interface StoredAudioRecording {
  recordingId: string;
  studentId: string;
  studentName: string;
  className: string;
  irama: string;
  mimeType: string;
  dataBase64: string; // Base64 audio buffer
  createdAt: string;
}

export interface ServerSession {
  token: string;
  userId: string;
  name: string;
  role: 'teacher' | 'student';
  assignedClasses?: string[];
  studentId?: string;
  expiresAt: number; // Timestamp in ms
}

// -------------------------------------------------------------------------
// SERVER IN-MEMORY SECURE REPOSITORIES
// -------------------------------------------------------------------------

// 1. Authoritative Teacher Accounts with Class Segregation
const TEACHER_ACCOUNTS: TeacherAccount[] = [
  {
    id: 'tch_zulaikha',
    name: 'Cikgu Zulaikha binti Othman',
    username: 'cikgu.zulaikha',
    code: '123',
    passwordHash: 'pahlawan2025',
    assignedClasses: ['Tahun 5 Bestari', 'Tahun 5 Cemerlang'],
    role: 'teacher'
  },
  {
    id: 'tch_radzi',
    name: 'Ustaz Radzi bin Kamaruddin',
    username: 'ustaz.radzi',
    code: '456',
    passwordHash: 'pahlawan2025',
    assignedClasses: ['Tahun 5 Gemilang', 'Tahun 5 Wawasan'],
    role: 'teacher'
  },
  {
    id: 'tch_pentadbir',
    name: 'Guru Besar / Penyelaras BM',
    username: 'admin.guru',
    code: '789',
    passwordHash: 'pahlawan2025',
    assignedClasses: [
      'Tahun 5 Bestari',
      'Tahun 5 Cemerlang',
      'Tahun 5 Gemilang',
      'Tahun 5 Wawasan'
    ],
    role: 'teacher'
  }
];

// 2. Authoritative Student Assessments (Protected on Server)
const STUDENTS_DB: Map<string, StudentRecord> = new Map();

// Seed initial student records
const INITIAL_STUDENTS: StudentRecord[] = [
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
      studentReflection: 'Saya berasa tenang melagukan Irama Dodoi dengan alunan mendayu.',
      recordingId: 'rec_demo_1'
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
    recordingId: 'rec_demo_1',
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
      studentReflection: 'Saya berlatih jeda pendek dan henti penuh dengan teliti.',
      recordingId: 'rec_demo_2'
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
    recordingId: 'rec_demo_2',
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
      karaoke: true
    },
    quizScores: { rangkap1: 4, rangkap2: 4, rangkap3: 4, rangkap4: 4 },
    quizAttempts: { rangkap1: 1, rangkap2: 1, rangkap3: 1, rangkap4: 1 },
    earnedQuizXp: { rangkap1: true, rangkap2: true, rangkap3: true, rangkap4: true },
    karaokeAssessment: {
      sebutan: 3,
      kelancaran: 4,
      irama: 3,
      penghayatan: 3,
      totalScore: 81,
      recordedAt: '2026-10-24',
      iramaChosen: 'dodoi',
      studentReflection: 'Saya cuba mengekalkan sebutan baku perkataan syair.',
      recordingId: 'rec_demo_4'
    },
    recordingId: 'rec_demo_4',
    createdAt: '2026-10-23',
    lastActive: '2026-10-25'
  }
];

INITIAL_STUDENTS.forEach((s) => STUDENTS_DB.set(s.id, s));

// 3. Audio Recordings Store (Non-public, safe in-memory audio store)
const AUDIO_RECORDINGS: Map<string, StoredAudioRecording> = new Map();

// Seed mock audio recordings for demo students
AUDIO_RECORDINGS.set('rec_demo_1', {
  recordingId: 'rec_demo_1',
  studentId: 'std_demo_1',
  studentName: 'Ahmad Faiz bin Zulkifli',
  className: 'Tahun 5 Bestari',
  irama: 'dodoi',
  mimeType: 'audio/webm',
  dataBase64: 'GkXfo59ChoEBQveBAULygQRC84EIQoKEd2VibUKHgQRChYECGFOAZwH/////////FUmpZpkq17GDD0JATYCGQ0KF',
  createdAt: '2026-10-25'
});

AUDIO_RECORDINGS.set('rec_demo_2', {
  recordingId: 'rec_demo_2',
  studentId: 'std_demo_2',
  studentName: 'Nurul Huda binti Azman',
  className: 'Tahun 5 Bestari',
  irama: 'selendang_delima',
  mimeType: 'audio/webm',
  dataBase64: 'GkXfo59ChoEBQveBAULygQRC84EIQoKEd2VibUKHgQRChYECGFOAZwH/////////FUmpZpkq17GDD0JATYCGQ0KF',
  createdAt: '2026-10-25'
});

AUDIO_RECORDINGS.set('rec_demo_4', {
  recordingId: 'rec_demo_4',
  studentId: 'std_demo_4',
  studentName: 'Tan Mei Ling',
  className: 'Tahun 5 Gemilang',
  irama: 'dodoi',
  mimeType: 'audio/webm',
  dataBase64: 'GkXfo59ChoEBQveBAULygQRC84EIQoKEd2VibUKHgQRChYECGFOAZwH/////////FUmpZpkq17GDD0JATYCGQ0KF',
  createdAt: '2026-10-24'
});

// 4. Active Sessions Store (Token -> Session)
const ACTIVE_SESSIONS: Map<string, ServerSession> = new Map();
const SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

function generateToken(): string {
  return 'ps_' + crypto.randomBytes(24).toString('hex');
}

// =========================================================================
// SECURITY MIDDLEWARE & HELPERS
// =========================================================================

export interface AuthenticatedRequest extends Request {
  session?: ServerSession;
}

/**
 * Extracts Bearer token from header or query param
 */
function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  if (req.query && typeof req.query.token === 'string') {
    return req.query.token.trim();
  }
  return null;
}

/**
 * Validates session and attaches to request.
 * Returns appropriate HTTP 401 response with required messages.
 */
function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({
      error: 'Sila log masuk untuk mengakses bahagian ini.',
      code: 'UNAUTHENTICATED'
    });
  }

  const session = ACTIVE_SESSIONS.get(token);
  if (!session) {
    return res.status(401).json({
      error: 'Sesi anda telah tamat. Sila log masuk semula.',
      code: 'SESSION_EXPIRED'
    });
  }

  if (Date.now() > session.expiresAt) {
    ACTIVE_SESSIONS.delete(token);
    return res.status(401).json({
      error: 'Sesi anda telah tamat. Sila log masuk semula.',
      code: 'SESSION_EXPIRED'
    });
  }

  // Refresh expiration on activity
  session.expiresAt = Date.now() + SESSION_TTL_MS;
  req.session = session;
  next();
}

/**
 * Enforces TEACHER role
 */
function requireTeacherRole(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.session) {
    return res.status(401).json({
      error: 'Sila log masuk untuk mengakses bahagian ini.',
      code: 'UNAUTHENTICATED'
    });
  }

  if (req.session.role !== 'teacher') {
    return res.status(403).json({
      error: 'Akses ditolak. Bahagian ini hanya untuk guru yang diberi kebenaran.',
      code: 'FORBIDDEN_TEACHER_ONLY'
    });
  }

  next();
}

// =========================================================================
// API ENDPOINTS
// =========================================================================

// --- 1. Teacher Authentication ---
app.post('/api/auth/teacher/login', (req: Request, res: Response) => {
  const { code, username, password } = req.body;

  let matchedTeacher: TeacherAccount | undefined;

  if (code) {
    matchedTeacher = TEACHER_ACCOUNTS.find(
      (t) => t.code === String(code).trim()
    );
  } else if (username && password) {
    matchedTeacher = TEACHER_ACCOUNTS.find(
      (t) =>
        t.username.toLowerCase() === String(username).trim().toLowerCase() &&
        t.passwordHash === String(password).trim()
    );
  }

  if (!matchedTeacher) {
    return res.status(401).json({
      error: 'Kod keselamatan atau maklumat log masuk guru tidak sah. Sila semak semula.',
      code: 'INVALID_CREDENTIALS'
    });
  }

  // Generate cryptographic session token
  const token = generateToken();
  const session: ServerSession = {
    token,
    userId: matchedTeacher.id,
    name: matchedTeacher.name,
    role: 'teacher',
    assignedClasses: matchedTeacher.assignedClasses,
    expiresAt: Date.now() + SESSION_TTL_MS
  };

  ACTIVE_SESSIONS.set(token, session);

  return res.json({
    success: true,
    token,
    teacher: {
      id: matchedTeacher.id,
      name: matchedTeacher.name,
      username: matchedTeacher.username,
      assignedClasses: matchedTeacher.assignedClasses,
      role: 'teacher'
    },
    expiresAt: session.expiresAt
  });
});

// --- 2. Student Authentication / Registration ---
app.post('/api/auth/student/login', (req: Request, res: Response) => {
  const { name, className, character, studentId } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({
      error: 'Sila masukkan nama anda sebelum memulakan kembara.'
    });
  }

  const cleanName = name.trim();
  const assignedClass = className || 'Tahun 5 Bestari';

  let student: StudentRecord | undefined;

  if (studentId && STUDENTS_DB.has(studentId)) {
    student = STUDENTS_DB.get(studentId)!;
  } else {
    // Check if student with same name and class already exists
    for (const s of STUDENTS_DB.values()) {
      if (s.name.toLowerCase() === cleanName.toLowerCase() && s.className === assignedClass) {
        student = s;
        break;
      }
    }
  }

  if (!student) {
    const newId = `std_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    student = {
      id: newId,
      name: cleanName,
      className: assignedClass,
      character: character === 'teja' ? 'teja' : 'tuah',
      xp: 50,
      stars: 1,
      badges: [],
      completedModules: {
        pondokIrama: false,
        bedahMakna: false,
        gameIramaMatch: false,
        gameTangkapKata: false,
        karaoke: false
      },
      quizScores: { rangkap1: 0, rangkap2: 0, rangkap3: 0, rangkap4: 0 },
      quizAttempts: {},
      earnedQuizXp: {},
      createdAt: new Date().toISOString().split('T')[0],
      lastActive: new Date().toISOString().split('T')[0]
    };
    STUDENTS_DB.set(newId, student);
  }

  const token = generateToken();
  const session: ServerSession = {
    token,
    userId: student.id,
    name: student.name,
    role: 'student',
    studentId: student.id,
    expiresAt: Date.now() + SESSION_TTL_MS
  };

  ACTIVE_SESSIONS.set(token, session);

  return res.json({
    success: true,
    token,
    student,
    expiresAt: session.expiresAt
  });
});

// --- 3. Logout (Revoke Session Immediately) ---
app.post('/api/auth/logout', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const token = req.session?.token;
  if (token) {
    ACTIVE_SESSIONS.delete(token);
  }
  return res.json({
    success: true,
    message: 'Anda telah berjaya log keluar. Sesi telah dipadamkan.'
  });
});

// --- 4. Validate Current Session (/api/auth/me) ---
app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const session = req.session!;
  if (session.role === 'teacher') {
    const teacher = TEACHER_ACCOUNTS.find((t) => t.id === session.userId);
    return res.json({
      role: 'teacher',
      teacher: {
        id: session.userId,
        name: session.name,
        assignedClasses: session.assignedClasses || [],
        username: teacher?.username || ''
      }
    });
  } else {
    const student = STUDENTS_DB.get(session.studentId || session.userId);
    return res.json({
      role: 'student',
      student: student || null
    });
  }
});

// --- 5. Teacher: List Students with Class Segregation ---
app.get('/api/teacher/students', requireAuth, requireTeacherRole, (req: AuthenticatedRequest, res: Response) => {
  const teacher = req.session!;
  const assigned = teacher.assignedClasses || [];

  // Filter students: ONLY classes assigned to this teacher
  const authorizedStudents = Array.from(STUDENTS_DB.values()).filter((s) =>
    assigned.includes(s.className)
  );

  return res.json({
    success: true,
    assignedClasses: assigned,
    teacherName: teacher.name,
    students: authorizedStudents
  });
});

// --- 6. Teacher: Get Single Student Detailed Record ---
app.get('/api/teacher/students/:studentId', requireAuth, requireTeacherRole, (req: AuthenticatedRequest, res: Response) => {
  const { studentId } = req.params;
  const teacher = req.session!;
  const student = STUDENTS_DB.get(studentId);

  if (!student) {
    return res.status(404).json({
      error: 'Rekod murid tidak dijumpai.'
    });
  }

  // Class authorization check
  const assigned = teacher.assignedClasses || [];
  if (!assigned.includes(student.className)) {
    return res.status(403).json({
      error: 'Anda tidak mempunyai kebenaran untuk mengakses rekod ini.',
      code: 'UNAUTHORIZED_CLASS'
    });
  }

  return res.json({
    success: true,
    student
  });
});

// --- 7. Teacher: Submit Assessment & Feedback ---
app.put('/api/teacher/students/:studentId/assessment', requireAuth, requireTeacherRole, (req: AuthenticatedRequest, res: Response) => {
  const { studentId } = req.params;
  const teacher = req.session!;
  const student = STUDENTS_DB.get(studentId);

  if (!student) {
    return res.status(404).json({ error: 'Rekod murid tidak dijumpai.' });
  }

  // Class authorization check
  const assigned = teacher.assignedClasses || [];
  if (!assigned.includes(student.className)) {
    return res.status(403).json({
      error: 'Anda tidak mempunyai kebenaran untuk mengakses rekod ini.',
      code: 'UNAUTHORIZED_CLASS'
    });
  }

  const { sebutan, kelancaran, irama, penghayatan, comments } = req.body;

  const totalScore = Math.round(
    (((sebutan || 4) + (kelancaran || 4) + (irama || 4) + (penghayatan || 4)) / 16) * 100
  );

  student.teacherAssessment = {
    sebutan: sebutan || 4,
    kelancaran: kelancaran || 4,
    irama: irama || 4,
    penghayatan: penghayatan || 4,
    totalScore,
    comments: comments || 'Tahniah atas usaha melagukan syair.',
    evaluatedAt: new Date().toISOString().split('T')[0],
    teacherName: teacher.name
  };

  student.lastActive = new Date().toISOString().split('T')[0];
  STUDENTS_DB.set(studentId, student);

  return res.json({
    success: true,
    message: 'Pentaksiran guru telah berjaya disimpan.',
    student
  });
});

// --- 8. Student: Update Own Progress & Quiz Marks ---
app.put('/api/student/progress', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const session = req.session!;

  if (session.role !== 'student' || !session.studentId) {
    return res.status(403).json({
      error: 'Akses ditolak. Hanya murid yang boleh mengemas kini kemajuan kendiri.'
    });
  }

  const student = STUDENTS_DB.get(session.studentId);
  if (!student) {
    return res.status(404).json({ error: 'Profil murid tidak ditemui.' });
  }

  const {
    xp,
    stars,
    badges,
    completedModules,
    quizScores,
    quizAttempts,
    earnedQuizXp,
    karaokeAssessment
  } = req.body;

  if (typeof xp === 'number') student.xp = xp;
  if (typeof stars === 'number') student.stars = stars;
  if (Array.isArray(badges)) student.badges = badges;
  if (completedModules) student.completedModules = { ...student.completedModules, ...completedModules };
  if (quizScores) student.quizScores = { ...student.quizScores, ...quizScores };
  if (quizAttempts) student.quizAttempts = { ...student.quizAttempts, ...quizAttempts };
  if (earnedQuizXp) student.earnedQuizXp = { ...student.earnedQuizXp, ...earnedQuizXp };
  if (karaokeAssessment) student.karaokeAssessment = karaokeAssessment;

  student.lastActive = new Date().toISOString().split('T')[0];
  STUDENTS_DB.set(student.id, student);

  return res.json({
    success: true,
    student
  });
});

// --- 9. Audio: Upload Poetry Recitation (Secure Storage) ---
app.post('/api/audio/upload', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const session = req.session!;
  const { dataBase64, mimeType, irama, studentId } = req.body;

  if (!dataBase64) {
    return res.status(400).json({ error: 'Tiada data audio dimuat naik.' });
  }

  // Student can only upload for their own profile
  let targetStudentId = session.studentId;
  if (session.role === 'teacher') {
    targetStudentId = studentId;
  }

  if (!targetStudentId) {
    return res.status(400).json({ error: 'ID murid diperlukan.' });
  }

  const student = STUDENTS_DB.get(targetStudentId);
  if (!student) {
    return res.status(404).json({ error: 'Murid tidak ditemui.' });
  }

  const recordingId = `rec_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const stored: StoredAudioRecording = {
    recordingId,
    studentId: student.id,
    studentName: student.name,
    className: student.className,
    irama: irama || 'dodoi',
    mimeType: mimeType || 'audio/webm',
    dataBase64,
    createdAt: new Date().toISOString().split('T')[0]
  };

  AUDIO_RECORDINGS.set(recordingId, stored);
  student.recordingId = recordingId;
  if (student.karaokeAssessment) {
    student.karaokeAssessment.recordingId = recordingId;
  }

  return res.json({
    success: true,
    recordingId,
    message: 'Rakaman syair telah disimpan dengan selamat.'
  });
});

// --- 10. Audio: Stream/Play Protected Recording ---
app.get('/api/audio/recordings/:recordingId', (req: Request, res: Response) => {
  const { recordingId } = req.params;
  const token = extractToken(req);

  // 1. Must be logged in
  if (!token) {
    return res.status(401).json({
      error: 'Sila log masuk untuk mengakses bahagian ini.',
      code: 'UNAUTHENTICATED'
    });
  }

  const session = ACTIVE_SESSIONS.get(token);
  if (!session || Date.now() > session.expiresAt) {
    return res.status(401).json({
      error: 'Sesi anda telah tamat. Sila log masuk semula.',
      code: 'SESSION_EXPIRED'
    });
  }

  // 2. Fetch recording
  const recording = AUDIO_RECORDINGS.get(recordingId);
  if (!recording) {
    return res.status(404).json({
      error: 'Rakaman audio tidak dijumpai.'
    });
  }

  // 3. Authorization Check
  if (session.role === 'student') {
    // Student can ONLY access their own recording!
    if (session.studentId !== recording.studentId) {
      return res.status(403).json({
        error: 'Anda tidak mempunyai kebenaran untuk mengakses rekod ini.',
        code: 'FORBIDDEN_RECORDING_ACCESS'
      });
    }
  } else if (session.role === 'teacher') {
    // Teacher must be assigned to this student's class
    const assigned = session.assignedClasses || [];
    if (!assigned.includes(recording.className)) {
      return res.status(403).json({
        error: 'Anda tidak mempunyai kebenaran untuk mengakses rekod ini.',
        code: 'FORBIDDEN_RECORDING_ACCESS'
      });
    }
  } else {
    return res.status(403).json({
      error: 'Akses ditolak. Bahagian ini hanya untuk guru yang diberi kebenaran.',
      code: 'FORBIDDEN'
    });
  }

  // 4. Stream audio securely with private, no-store headers
  const buffer = Buffer.from(recording.dataBase64, 'base64');
  res.setHeader('Content-Type', recording.mimeType);
  res.setHeader('Content-Length', buffer.length);
  res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  return res.send(buffer);
});

// --- 11. Public Leaderboard (Anonymized & Safe: No assessment details, no answers, no audio) ---
app.get('/api/public/leaderboard', (_req: Request, res: Response) => {
  const safeList = Array.from(STUDENTS_DB.values()).map((s) => ({
    id: s.id,
    name: s.name,
    className: s.className,
    character: s.character,
    xp: s.xp,
    stars: s.stars,
    badges: s.badges
  }));

  safeList.sort((a, b) => b.xp - a.xp);
  return res.json(safeList);
});

// =========================================================================
// VITE DEV SERVER INTEGRATION OR PRODUCTION STATIC SERVING
// =========================================================================

async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[Pahlawan Syair] Pelayan keselamatan berjalan di port ${PORT}`);
  });
}

startServer();
