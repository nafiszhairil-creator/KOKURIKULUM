/**
 * Klien API Keselamatan Pahlawan Syair
 * Mengurus komunikasi dengan pelayan keselamatan:
 * - Pengesahan token pelayan bagi Guru dan Murid
 * - Perlindungan data pentaksiran dan rakaman audio
 * - Pengasingan akses mengikut kelas tanggungjawab guru
 */

import { StudentProfile } from '../types/syair';

const TOKEN_KEY = 'ps_auth_token_v1';
const ROLE_KEY = 'ps_auth_role_v1';

export interface TeacherInfo {
  id: string;
  name: string;
  username: string;
  assignedClasses: string[];
  role: 'teacher';
}

export interface AuthSessionResponse {
  role: 'guest' | 'teacher' | 'student';
  teacher?: TeacherInfo;
  student?: StudentProfile;
}

class ApiClient {
  private token: string | null = null;
  private currentTeacher: TeacherInfo | null = null;

  constructor() {
    // Restore token from sessionStorage if valid
    try {
      this.token = sessionStorage.getItem(TOKEN_KEY);
    } catch {
      this.token = null;
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  public setSession(token: string, role: 'teacher' | 'student', teacherInfo?: TeacherInfo) {
    this.token = token;
    if (teacherInfo) {
      this.currentTeacher = teacherInfo;
    }
    try {
      sessionStorage.setItem(TOKEN_KEY, token);
      sessionStorage.setItem(ROLE_KEY, role);
    } catch (e) {
      console.warn('Gagal menyimpan token ke sessionStorage:', e);
    }
  }

  public clearSession() {
    this.token = null;
    this.currentTeacher = null;
    try {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(ROLE_KEY);
      sessionStorage.clear();
    } catch (e) {
      console.warn('Gagal mengosongkan sessionStorage:', e);
    }
  }

  public getTeacherInfo(): TeacherInfo | null {
    return this.currentTeacher;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  // --- Auth Requests ---

  public async loginTeacher(codeOrUsername: string, password?: string): Promise<{ success: boolean; teacher?: TeacherInfo; error?: string }> {
    try {
      const payload: Record<string, string> = {};
      if (password) {
        payload.username = codeOrUsername;
        payload.password = password;
      } else {
        payload.code = codeOrUsername;
      }

      const res = await fetch('/api/auth/teacher/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Akses ditolak. Sila semak semula maklumat log masuk.' };
      }

      this.setSession(data.token, 'teacher', data.teacher);
      return { success: true, teacher: data.teacher };
    } catch (err) {
      return { success: false, error: 'Ralat rangkaian semasa log masuk guru.' };
    }
  }

  public async loginStudent(studentData: { name: string; className: string; character: 'tuah' | 'teja'; studentId?: string }): Promise<{ success: boolean; student?: StudentProfile; error?: string }> {
    try {
      const res = await fetch('/api/auth/student/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData)
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Gagal mendaftar atau log masuk murid.' };
      }

      this.setSession(data.token, 'student');
      return { success: true, student: data.student };
    } catch (err) {
      return { success: false, error: 'Ralat rangkaian semasa log masuk murid.' };
    }
  }

  public async validateSession(): Promise<AuthSessionResponse> {
    if (!this.token) {
      return { role: 'guest' };
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: this.getHeaders()
      });

      if (!res.ok) {
        this.clearSession();
        return { role: 'guest' };
      }

      const data = await res.json();
      if (data.role === 'teacher') {
        this.currentTeacher = data.teacher;
        return { role: 'teacher', teacher: data.teacher };
      } else if (data.role === 'student') {
        return { role: 'student', student: data.student };
      }
      return { role: 'guest' };
    } catch {
      return { role: 'guest' };
    }
  }

  public async logout(): Promise<void> {
    try {
      if (this.token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: this.getHeaders()
        });
      }
    } catch {
      // Ignore network errors on logout
    } finally {
      this.clearSession();
    }
  }

  // --- Teacher Endpoints ---

  public async getTeacherStudents(): Promise<{ success: boolean; students?: StudentProfile[]; assignedClasses?: string[]; error?: string; code?: string }> {
    try {
      const res = await fetch('/api/teacher/students', {
        headers: this.getHeaders()
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          error: data.error || 'Akses ditolak. Bahagian ini hanya untuk guru yang diberi kebenaran.',
          code: data.code
        };
      }

      return {
        success: true,
        students: data.students,
        assignedClasses: data.assignedClasses
      };
    } catch (err) {
      return {
        success: false,
        error: 'Ralat rangkaian semasa memuat turun rekod murid.'
      };
    }
  }

  public async getStudentDetailedAssessment(studentId: string): Promise<{ success: boolean; student?: StudentProfile; error?: string }> {
    try {
      const res = await fetch(`/api/teacher/students/${encodeURIComponent(studentId)}`, {
        headers: this.getHeaders()
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          error: data.error || 'Anda tidak mempunyai kebenaran untuk mengakses rekod ini.'
        };
      }

      return { success: true, student: data.student };
    } catch (err) {
      return { success: false, error: 'Ralat komunikasi pelayan.' };
    }
  }

  public async saveTeacherAssessment(
    studentId: string,
    rubric: { sebutan: number; kelancaran: number; irama: number; penghayatan: number; comments: string }
  ): Promise<{ success: boolean; student?: StudentProfile; error?: string }> {
    try {
      const res = await fetch(`/api/teacher/students/${encodeURIComponent(studentId)}/assessment`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(rubric)
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          error: data.error || 'Gagal menyimpan pentaksiran guru.'
        };
      }

      return { success: true, student: data.student };
    } catch (err) {
      return { success: false, error: 'Ralat rangkaian semasa menyimpan pentaksiran.' };
    }
  }

  // --- Audio Storage Endpoints ---

  public async uploadAudioRecording(
    audioBlob: Blob,
    irama: string,
    studentId?: string
  ): Promise<{ success: boolean; recordingId?: string; error?: string }> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Data = (reader.result as string).split(',')[1];
          const res = await fetch('/api/audio/upload', {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({
              dataBase64: base64Data,
              mimeType: audioBlob.type || 'audio/webm',
              irama,
              studentId
            })
          });

          const data = await res.json();
          if (!res.ok) {
            resolve({ success: false, error: data.error || 'Gagal memuat naik rakaman.' });
          } else {
            resolve({ success: true, recordingId: data.recordingId });
          }
        } catch (e) {
          resolve({ success: false, error: 'Ralat rangkaian semasa memuat naik audio.' });
        }
      };
      reader.onerror = () => {
        resolve({ success: false, error: 'Gagal membaca fail audio.' });
      };
      reader.readAsDataURL(audioBlob);
    });
  }

  public getAudioStreamUrl(recordingId: string): string {
    if (!this.token) {
      return `/api/audio/recordings/${encodeURIComponent(recordingId)}`;
    }
    return `/api/audio/recordings/${encodeURIComponent(recordingId)}?token=${encodeURIComponent(this.token)}`;
  }

  // --- Student Progress Sync ---

  public async syncStudentProgress(progress: Partial<StudentProfile>): Promise<void> {
    if (!this.token) return;
    try {
      await fetch('/api/student/progress', {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(progress)
      });
    } catch (e) {
      console.warn('Gagal menyelaraskan kemajuan murid ke pelayan:', e);
    }
  }

  // --- Public Safe Leaderboard ---

  public async getLeaderboard(): Promise<any[]> {
    try {
      const res = await fetch('/api/public/leaderboard');
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  }
}

export const apiClient = new ApiClient();
