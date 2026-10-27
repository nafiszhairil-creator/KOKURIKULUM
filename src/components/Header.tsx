import React from 'react';
import { Volume2, VolumeX, BookOpen, Sparkles, LogOut, User, GraduationCap } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  onOpenDskpModal: () => void;
  onLogout: () => void;
  role: 'student' | 'teacher';
  studentName?: string;
  xp?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isMuted,
  setIsMuted,
  onOpenDskpModal,
  onLogout,
  role,
  studentName,
  xp = 0
}) => {
  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    audioEngine.setMute(next);
    if (!next) {
      audioEngine.playTapSfx();
    }
  };

  const studentNavItems = [
    { id: 'utama', label: 'Utama' },
    { id: 'pondok', label: 'Pondok Irama' },
    { id: 'bedah', label: 'Fahami Syair' },
    { id: 'game_match', label: 'Teka Irama' },
    { id: 'game_tangkap', label: 'Tangkap Kata' },
    { id: 'karaoke', label: 'Lagukan Syair' },
    { id: 'ganjaran', label: 'Ganjaran' },
  ];

  const teacherNavItems = [
    { id: 'guru', label: 'Dashboard Guru' },
  ];

  const navItems = role === 'teacher' ? teacherNavItems : studentNavItems;

  return (
    <header className="sticky top-0 z-40 bg-amber-950 text-amber-50 shadow-md border-b border-amber-900/60 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <button
          onClick={() => {
            setActiveTab(role === 'teacher' ? 'guru' : 'utama');
            audioEngine.playTapSfx();
          }}
          className="flex items-center gap-2 text-left group whitespace-nowrap shrink-0 focus:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-xl font-bold tracking-tight text-amber-100 font-display">
            Pahlawan Syair
          </span>
        </button>

        {/* Zone 2: Navigation Links (Single line, whitespace-nowrap) */}
        <nav className="hidden lg:flex items-center gap-5 text-sm font-medium">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  audioEngine.playTapSfx();
                }}
                className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                  isActive
                    ? 'text-amber-400 font-semibold border-b-2 border-amber-400'
                    : 'text-amber-200/80 hover:text-amber-100'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action & Controls (Single-line controls) */}
        <div className="flex items-center gap-3 shrink-0">
          {role === 'student' ? (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-amber-300 font-mono tabular-nums bg-amber-900/60 px-2.5 py-1 rounded-md border border-amber-700/50">
              <span className="text-amber-400/80">XP:</span>
              <span className="font-bold text-amber-200">{xp}</span>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-amber-300 bg-amber-900/60 px-2.5 py-1 rounded-md border border-amber-700/50">
              <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold">Guru Pentaksir</span>
            </div>
          )}

          <button
            onClick={toggleMute}
            aria-label={isMuted ? 'Buka Bunyi' : 'Senyapkan Bunyi'}
            className="p-2 rounded-lg bg-amber-900/40 hover:bg-amber-800/60 text-amber-200 transition-colors border border-amber-700/40"
            title={isMuted ? 'Buka Bunyi' : 'Senyapkan'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-300" /> : <Volume2 className="w-4 h-4 text-emerald-300" />}
          </button>

          <button
            onClick={() => {
              onOpenDskpModal();
              audioEngine.playTapSfx();
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Skrip DSKP</span>
          </button>

          <button
            onClick={() => {
              onLogout();
              audioEngine.playTapSfx();
            }}
            title="Log Keluar"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-amber-300 hover:text-white bg-amber-900/50 hover:bg-rose-900/70 border border-amber-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Log Keluar</span>
          </button>
        </div>
      </div>

      {/* Mobile nav drawer strip */}
      <div className="lg:hidden flex items-center overflow-x-auto gap-2.5 px-4 py-2 bg-amber-900/40 border-t border-amber-800/30 text-xs no-scrollbar">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                audioEngine.playTapSfx();
              }}
              className={`whitespace-nowrap px-2.5 py-1 rounded-md transition-colors ${
                isActive
                  ? 'bg-amber-400 text-amber-950 font-semibold'
                  : 'text-amber-200/80 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
