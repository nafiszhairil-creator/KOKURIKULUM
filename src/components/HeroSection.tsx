import React from 'react';
import { Play, Sparkles, Award, Star } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

interface HeroSectionProps {
  character: 'tuah' | 'teja';
  setCharacter: (char: 'tuah' | 'teja') => void;
  onStartLearning: () => void;
  onExploreGames: () => void;
  xp: number;
  stars: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  character,
  setCharacter,
  onStartLearning,
  onExploreGames,
  xp,
  stars
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-950 via-amber-900 to-amber-950 text-amber-50 shadow-xl border border-amber-800/60 mb-8">
      {/* Background Hero Illustration with measured scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/hero_pahlawan_syair_1793033987403.jpg"
          alt="Kembara Alam Fantasi Pahlawan Syair Melayu"
          className="w-full h-full object-cover opacity-35 object-center"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-amber-950 via-amber-950/70 to-transparent" />
      </div>

      <div className="relative z-10 p-6 sm:p-8 lg:p-10 flex flex-col lg:flex-row items-center gap-8 justify-between">
        {/* Left Column: Title, Metadata, Dialogue & CTAs */}
        <div className="flex-1 max-w-2xl text-center lg:text-left">
          {/* Clean Unboxed Metadata without pills */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 text-xs text-amber-300 font-medium tracking-wide mb-3">
            <span>Bahasa Melayu Tahun 5</span>
            <span aria-hidden="true" className="text-amber-500">·</span>
            <span>DSKP Aspek Seni Bahasa 4.2.1</span>
            <span aria-hidden="true" className="text-amber-500">·</span>
            <span>Kembara Irama Tradisional Melayu</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-amber-100 font-display text-balance leading-tight mb-3">
            Pahlawan Syair: Kembara Irama Melayu
          </h1>

          <p className="text-sm sm:text-base text-amber-200/90 leading-relaxed mb-6 font-sans">
            Sertai penjelajahan sastera di Pulau Irama! Hayati keindahan melodi tradisional
            <span className="text-amber-300 font-semibold"> Irama Dodoi</span> dan
            <span className="text-amber-300 font-semibold"> Irama Selendang Delima</span>, serta fahami syair dan idea keseluruhan syair Tahun 5 secara interaktif.
          </p>

          {/* Interactive Character Speech Bubble */}
          <div className="bg-amber-900/60 backdrop-blur-md rounded-xl p-4 border border-amber-700/50 mb-6 flex items-start gap-3 text-left">
            <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-amber-400/80 shadow-inner">
              <img
                src={
                  character === 'tuah'
                    ? '/src/assets/images/karakter_pendekar_melayu_1793033989287.jpg'
                    : '/src/assets/images/karakter_srikandi_melayu_1793033989429.jpg'
                }
                alt={character === 'tuah' ? 'Pendekar Tuah Cilik' : 'Srikandi Teja Cilik'}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-1 text-xs sm:text-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-amber-300">
                  {character === 'tuah' ? 'Pendekar Tuah Cilik' : 'Srikandi Teja Cilik'}
                </span>
                <span className="text-[11px] text-amber-400/70">Sahabat Kembara</span>
              </div>
              <p className="text-amber-100/90 italic">
                {character === 'tuah'
                  ? '“Wahai rakan pendekar! Ayuh pasang telinga, kita pelajari lenggok nada dan tanda jeda syair agar lafaz kita merdu bertenaga!”'
                  : '“Salam mesra wahai pujangga! Mari kita teliti setiap bait dan rungkai maksud kata klasik agar idea tersurat difahami sempurna!”'}
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
            <button
              onClick={() => {
                onStartLearning();
                audioEngine.playTapSfx();
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-amber-950 font-semibold rounded-lg shadow-md transition-all active:scale-95 text-sm"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Masuk Pondok Irama</span>
            </button>

            <button
              onClick={() => {
                onExploreGames();
                audioEngine.playTapSfx();
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-900/80 hover:bg-amber-800 text-amber-200 border border-amber-700/60 font-medium rounded-lg transition-all active:scale-95 text-sm"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Cabaran Permainan Mini</span>
            </button>
          </div>
        </div>

        {/* Right Column: Character Companion Switcher & Quick Stats */}
        <div className="w-full lg:w-72 flex flex-col items-center gap-4 bg-amber-900/40 p-5 rounded-xl border border-amber-800/50 backdrop-blur-sm">
          <span className="text-xs uppercase tracking-wider text-amber-300 font-semibold">
            Pilih Sahabat Kembara
          </span>

          <div className="grid grid-cols-2 gap-3 w-full">
            <button
              onClick={() => {
                setCharacter('tuah');
                audioEngine.playTapSfx();
              }}
              className={`p-2.5 rounded-xl flex flex-col items-center gap-2 transition-all ${
                character === 'tuah'
                  ? 'bg-amber-800/90 border-2 border-amber-400 shadow-md ring-2 ring-amber-400/20'
                  : 'bg-amber-950/40 border border-amber-800 hover:bg-amber-900/50'
              }`}
            >
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-400/60 shadow">
                <img
                  src="/src/assets/images/karakter_pendekar_melayu_1793033989287.jpg"
                  alt="Pendekar Tuah"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-xs font-semibold text-amber-200">Pendekar Tuah</span>
            </button>

            <button
              onClick={() => {
                setCharacter('teja');
                audioEngine.playTapSfx();
              }}
              className={`p-2.5 rounded-xl flex flex-col items-center gap-2 transition-all ${
                character === 'teja'
                  ? 'bg-amber-800/90 border-2 border-amber-400 shadow-md ring-2 ring-amber-400/20'
                  : 'bg-amber-950/40 border border-amber-800 hover:bg-amber-900/50'
              }`}
            >
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-400/60 shadow">
                <img
                  src="/src/assets/images/karakter_srikandi_melayu_1793033989429.jpg"
                  alt="Srikandi Teja"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-xs font-semibold text-amber-200">Srikandi Teja</span>
            </button>
          </div>

          {/* Player Progress Snapshot */}
          <div className="w-full mt-2 pt-3 border-t border-amber-800/60 grid grid-cols-2 gap-2 text-center">
            <div className="p-2 bg-amber-950/60 rounded-lg border border-amber-800/40">
              <div className="flex items-center justify-center gap-1 text-amber-400 mb-0.5">
                <Award className="w-3.5 h-3.5" />
                <span className="text-xs text-amber-300">Pengalaman</span>
              </div>
              <span className="text-base font-bold font-mono text-amber-100 tabular-nums">
                {xp} XP
              </span>
            </div>

            <div className="p-2 bg-amber-950/60 rounded-lg border border-amber-800/40">
              <div className="flex items-center justify-center gap-1 text-amber-400 mb-0.5">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span className="text-xs text-amber-300">Bintang</span>
              </div>
              <span className="text-base font-bold font-mono text-amber-100 tabular-nums">
                {stars}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
