/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LoginPage } from './components/LoginPage';
import { StudentDashboard } from './components/StudentDashboard';
import { PondokIrama } from './components/PondokIrama';
import { BedahMakna } from './components/BedahMakna';
import { GameIramaMatch } from './components/GameIramaMatch';
import { GameTangkapKata } from './components/GameTangkapKata';
import { KaraokePahlawan } from './components/KaraokePahlawan';
import { PapanGanjaran } from './components/PapanGanjaran';
import { TeacherDashboard } from './components/TeacherDashboard';
import { DokumentasiDSKPModal } from './components/DokumentasiDSKPModal';
import { BackgroundMusicPlayer } from './components/BackgroundMusicPlayer';
import { RewardCelebrationModal, RewardCelebrationData } from './components/RewardCelebrationModal';
import { Sparkles } from 'lucide-react';
import { StudentProfile, IramaId } from './types/syair';
import { BADGES_LIST } from './data/syairData';
import {
  getStoredSession,
  saveStoredSession,
  getStoredStudents,
  saveStudentProfile
} from './utils/storage';
import { audioEngine } from './utils/audioEngine';

export default function App() {
  const [role, setRole] = useState<'guest' | 'student' | 'teacher'>('guest');
  const [currentStudent, setCurrentStudent] = useState<StudentProfile | null>(null);
  const [activeTab, setActiveTab] = useState<string>('utama');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isDskpModalOpen, setIsDskpModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [rewardCelebration, setRewardCelebration] = useState<RewardCelebrationData | null>(null);

  // Restore saved session on load
  useEffect(() => {
    const session = getStoredSession();
    if (session.role === 'teacher' && session.teacherAuthenticated) {
      setRole('teacher');
      setActiveTab('guru');
    } else if (session.role === 'student' && session.activeStudentId) {
      const allStudents = getStoredStudents();
      const found = allStudents.find((s) => s.id === session.activeStudentId);
      if (found) {
        setCurrentStudent(found);
        setRole('student');
        setActiveTab('utama');
      } else {
        setRole('guest');
      }
    } else {
      setRole('guest');
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleStudentLogin = (student: StudentProfile) => {
    setCurrentStudent(student);
    setRole('student');
    setActiveTab('utama');
    showToast(`Selamat datang wahai pahlawan ${student.name}!`);
  };

  const handleTeacherLogin = () => {
    setRole('teacher');
    setActiveTab('guru');
    showToast('Selamat datang ke Dashboard Guru.');
  };

  const handleLogout = () => {
    saveStoredSession({ role: 'guest' });
    setRole('guest');
    setCurrentStudent(null);
    setActiveTab('utama');
    audioEngine.stopAll();
    showToast('Anda telah berjaya log keluar.');
  };

  const handleEarnXp = (amount: number, reason: string) => {
    if (!currentStudent) return;

    const newXp = currentStudent.xp + amount;
    const newStars = currentStudent.stars + (amount >= 35 ? 1 : 0);

    // Auto-check badges
    const updatedBadges = [...currentStudent.badges];
    let newlyUnlockedBadge: string | null = null;
    BADGES_LIST.forEach((b) => {
      if (newXp >= b.unlockedAtXp && !updatedBadges.includes(b.id)) {
        updatedBadges.push(b.id);
        newlyUnlockedBadge = b.name;
        showToast(`🏆 Lencana Dibuka: ${b.name}!`);
        audioEngine.playFanfareSfx();
      }
    });

    const updatedProfile: StudentProfile = {
      ...currentStudent,
      xp: newXp,
      stars: newStars,
      badges: updatedBadges
    };

    setCurrentStudent(updatedProfile);
    saveStudentProfile(updatedProfile);
    showToast(`+${amount} XP: ${reason}!`);

    // Trigger celebratory pop-up animation with confetti particles
    if (newlyUnlockedBadge) {
      setRewardCelebration({
        type: 'badge',
        title: `Lencana ${newlyUnlockedBadge}!`,
        subtitle: `Tahniah! Anda telah membuka lencana baharu atas pencapaian cemerlang!`,
        badgeName: newlyUnlockedBadge
      });
    } else {
      setRewardCelebration({
        type: 'xp',
        amount,
        title: `+${amount} XP!`,
        subtitle: reason
      });
    }
  };

  const handleEarnBadge = (badgeId: string) => {
    if (!currentStudent) return;
    if (!currentStudent.badges.includes(badgeId)) {
      const updatedBadges = [...currentStudent.badges, badgeId];
      const updatedProfile: StudentProfile = {
        ...currentStudent,
        badges: updatedBadges
      };
      setCurrentStudent(updatedProfile);
      saveStudentProfile(updatedProfile);
      const badgeObj = BADGES_LIST.find((b) => b.id === badgeId);
      if (badgeObj) {
        showToast(`🏆 Lencana Dianugerahkan: ${badgeObj.name}!`);
        audioEngine.playFanfareSfx();
        setRewardCelebration({
          type: 'badge',
          title: `Lencana ${badgeObj.name}!`,
          subtitle: badgeObj.description,
          badgeName: badgeObj.name
        });
      }
    }
  };

  const handleUpdateQuizProgress = (rangkapIndex: number, scoreOutOf5: number) => {
    if (!currentStudent) return;
    const key = `rangkap${rangkapIndex + 1}` as 'rangkap1' | 'rangkap2' | 'rangkap3' | 'rangkap4';
    const currentAttempts = (currentStudent.quizAttempts[key] || 0) + 1;
    const earnedKey = { ...currentStudent.earnedQuizXp, [key]: true };

    const updatedProfile: StudentProfile = {
      ...currentStudent,
      quizScores: {
        ...currentStudent.quizScores,
        [key]: Math.max(currentStudent.quizScores[key] || 0, scoreOutOf5)
      },
      quizAttempts: {
        ...currentStudent.quizAttempts,
        [key]: currentAttempts
      },
      earnedQuizXp: earnedKey,
      completedModules: {
        ...currentStudent.completedModules,
        bedahMakna: true
      }
    };

    setCurrentStudent(updatedProfile);
    saveStudentProfile(updatedProfile);
  };

  const handleSaveKaraokeAssessment = (assessment: {
    sebutan: number;
    kelancaran: number;
    irama: number;
    penghayatan: number;
    totalScore: number;
    recordedAt: string;
    iramaChosen: IramaId;
    studentReflection: string;
  }) => {
    if (!currentStudent) return;
    const updatedProfile: StudentProfile = {
      ...currentStudent,
      karaokeAssessment: assessment,
      completedModules: {
        ...currentStudent.completedModules,
        karaoke: true
      }
    };
    setCurrentStudent(updatedProfile);
    saveStudentProfile(updatedProfile);
  };

  const handleMarkModuleCompleted = (moduleKey: 'pondokIrama' | 'bedahMakna' | 'gameIramaMatch' | 'gameTangkapKata' | 'karaoke') => {
    if (!currentStudent) return;
    const updatedProfile: StudentProfile = {
      ...currentStudent,
      completedModules: {
        ...currentStudent.completedModules,
        [moduleKey]: true
      }
    };
    setCurrentStudent(updatedProfile);
    saveStudentProfile(updatedProfile);
  };

  // If user is guest, show Login Page
  if (role === 'guest' || (!currentStudent && role === 'student')) {
    return (
      <div className="min-h-screen bg-stone-900 text-slate-800 flex flex-col">
        <LoginPage
          onLoginStudent={handleStudentLogin}
          onLoginTeacher={handleTeacherLogin}
          onOpenDskpModal={() => setIsDskpModalOpen(true)}
        />
        <DokumentasiDSKPModal
          isOpen={isDskpModalOpen}
          onClose={() => setIsDskpModalOpen(false)}
        />
        <BackgroundMusicPlayer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-slate-800 flex flex-col selection:bg-amber-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-amber-950 text-amber-100 px-4 py-3 rounded-xl shadow-xl border border-amber-700/80 flex items-center gap-2.5 text-xs sm:text-sm animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        onOpenDskpModal={() => setIsDskpModalOpen(true)}
        onLogout={handleLogout}
        role={role}
        studentName={currentStudent?.name}
        xp={currentStudent?.xp || 0}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Teacher Role Route */}
        {role === 'teacher' && (
          <TeacherDashboard
            onLogout={handleLogout}
            onOpenDskpModal={() => setIsDskpModalOpen(true)}
          />
        )}

        {/* Student Role Routes */}
        {role === 'student' && currentStudent && (
          <>
            {activeTab === 'utama' && (
              <StudentDashboard
                student={currentStudent}
                onNavigate={(tab) => {
                  setActiveTab(tab);
                  audioEngine.playTapSfx();
                }}
                onLogout={handleLogout}
              />
            )}

            {activeTab === 'pondok' && (
              <PondokIrama
                character={currentStudent.character}
                onEarnXp={(amt, reason) => {
                  handleEarnXp(amt, reason);
                  handleMarkModuleCompleted('pondokIrama');
                }}
              />
            )}

            {activeTab === 'bedah' && (
              <BedahMakna
                student={currentStudent}
                onEarnXp={handleEarnXp}
                onUpdateQuizProgress={handleUpdateQuizProgress}
              />
            )}

            {activeTab === 'game_match' && (
              <GameIramaMatch
                onEarnXp={handleEarnXp}
                onEarnBadge={handleEarnBadge}
                onMarkModuleCompleted={() => handleMarkModuleCompleted('gameIramaMatch')}
                onBackToMenu={() => {
                  setActiveTab('utama');
                  audioEngine.playTapSfx();
                }}
              />
            )}

            {activeTab === 'game_tangkap' && (
              <GameTangkapKata
                onEarnXp={handleEarnXp}
                onEarnBadge={handleEarnBadge}
                onMarkModuleCompleted={() => handleMarkModuleCompleted('gameTangkapKata')}
              />
            )}

            {activeTab === 'karaoke' && (
              <KaraokePahlawan
                student={currentStudent}
                onEarnXp={handleEarnXp}
                onEarnBadge={handleEarnBadge}
                onSaveKaraokeAssessment={handleSaveKaraokeAssessment}
              />
            )}

            {activeTab === 'ganjaran' && (
              <PapanGanjaran student={currentStudent} />
            )}
          </>
        )}
      </main>

      {/* Quiet Anti-Slop Footer */}
      <footer className="mt-auto border-t border-amber-900/10 bg-white py-5 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-amber-950 font-display">Pahlawan Syair: Kembara Irama Melayu</span>
            <span aria-hidden="true">·</span>
            <span>KSSR Semakan Bahasa Melayu Tahun 5 (SK 4.2 & SP 4.2.1)</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <button
              onClick={() => setIsDskpModalOpen(true)}
              className="hover:text-amber-900 transition-colors underline"
            >
              Dokumentasi & Skrip DSKP
            </button>
            <span aria-hidden="true">·</span>
            <span>Irama Dodoi & Irama Selendang Delima</span>
          </div>
        </div>
      </footer>

      {/* DSKP Documentation Modal */}
      <DokumentasiDSKPModal
        isOpen={isDskpModalOpen}
        onClose={() => setIsDskpModalOpen(false)}
      />

      {/* Floating Background Music Player */}
      <BackgroundMusicPlayer />

      {/* Gamification Reward Celebration Modal with Confetti Particles */}
      <RewardCelebrationModal
        reward={rewardCelebration}
        onClose={() => setRewardCelebration(null)}
      />
    </div>
  );
}
