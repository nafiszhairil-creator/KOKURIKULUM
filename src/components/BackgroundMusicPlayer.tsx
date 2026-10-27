import React, { useEffect, useState, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  ExternalLink,
  Music,
  Sliders,
  ChevronUp,
  ChevronDown,
  AlertCircle
} from 'lucide-react';
import { bgMusicManager, BgMusicState, BG_MUSIC_YOUTUBE_ID, BG_MUSIC_URL } from '../utils/bgMusicManager';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: any;
  }
}

export const BackgroundMusicPlayer: React.FC = () => {
  const [state, setState] = useState<BgMusicState>(bgMusicManager.getState());
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    const unsubscribe = bgMusicManager.subscribe((newState) => {
      setState(newState);
    });

    // Initialize YouTube Player
    const initYT = () => {
      if (window.YT && window.YT.Player && containerRef.current && !playerRef.current) {
        try {
          playerRef.current = new window.YT.Player('bg-music-iframe-element', {
            videoId: BG_MUSIC_YOUTUBE_ID,
            playerVars: {
              autoplay: 0,
              controls: 0,
              disablekb: 1,
              fs: 0,
              loop: 1,
              playlist: BG_MUSIC_YOUTUBE_ID,
              modestbranding: 1,
              rel: 0,
              playsinline: 1
            },
            events: {
              onReady: (event: any) => {
                bgMusicManager.setPlayerInstance(event.target);
              },
              onStateChange: (event: any) => {
                bgMusicManager.onPlayerStateChange(event.data);
              },
              onError: () => {
                bgMusicManager.setPlayerError();
              }
            }
          });
        } catch (e) {
          console.warn('Ralat inisialisasi pemain YouTube latar:', e);
          bgMusicManager.setPlayerError();
        }
      }
    };

    if (window.YT && window.YT.Player) {
      initYT();
    } else {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof prev === 'function') prev();
        initYT();
      };
    }

    return () => {
      unsubscribe();
    };
  }, []);

  const handleTogglePlay = () => {
    bgMusicManager.toggle();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    bgMusicManager.setVolume(val);
  };

  return (
    <>
      {/* Hidden container for the YouTube Player */}
      <div
        ref={containerRef}
        className="fixed bottom-0 left-0 w-1 h-1 opacity-0 pointer-events-none overflow-hidden z-0"
        aria-hidden="true"
      >
        <div id="bg-music-iframe-element" />
      </div>

      {/* Neat Floating Background Music Bar at Bottom-Right Corner */}
      <div className="fixed bottom-4 left-4 z-40 select-none">
        <div
          className={`bg-stone-900/95 backdrop-blur-md text-amber-50 rounded-2xl border border-amber-800/80 shadow-2xl transition-all duration-300 overflow-hidden ${
            isExpanded ? 'w-72 p-3.5 space-y-3' : 'w-auto px-3 py-2'
          }`}
        >
          {/* Collapsed / Header Row */}
          <div className="flex items-center justify-between gap-2.5">
            <button
              onClick={handleTogglePlay}
              title={state.isPlaying ? 'Jedakan Muzik Latar' : 'Mainkan Muzik Latar'}
              className={`flex items-center gap-2 p-1.5 rounded-xl transition-all active:scale-95 ${
                state.isPlaying
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 ring-2 ring-amber-400/20'
                  : 'bg-stone-800/80 hover:bg-stone-800 text-amber-200/80 border border-amber-900/60'
              }`}
            >
              <div className="relative w-6 h-6 rounded-lg bg-amber-400 text-amber-950 flex items-center justify-center font-bold shrink-0">
                {state.isPlaying ? (
                  <Pause className="w-3.5 h-3.5 fill-current" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                )}
              </div>

              <div className="text-left pr-1">
                <span className="text-xs font-bold text-amber-100 block font-display leading-tight">
                  Muzik Latar
                </span>
                <span className="text-[10px] text-amber-300/80 flex items-center gap-1 font-mono">
                  {state.isActivityPaused ? (
                    <span className="text-amber-400 italic">Dijeda untuk aktiviti</span>
                  ) : state.isPlaying ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Sedang berputar (Loop)
                    </span>
                  ) : (
                    <span>Dimatikan</span>
                  )}
                </span>
              </div>
            </button>

            {/* Expand / Minimize toggle button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 text-amber-300/80 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
              title={isExpanded ? 'Kecilkan Kawalan' : 'Buka Kawalan Kelantangan'}
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>

          {/* Expanded Drawer: Volume Slider & External YouTube Fallback */}
          {isExpanded && (
            <div className="space-y-3 pt-2 border-t border-amber-900/60 text-xs animate-fadeIn">
              {/* Volume Slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-amber-200/90 text-[11px]">
                  <span className="flex items-center gap-1">
                    {state.volume === 0 ? (
                      <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    <span>Kelantangan Muzik</span>
                  </span>
                  <span className="font-mono font-bold text-amber-300">{state.volume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={state.volume}
                  onChange={handleVolumeChange}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
                />
              </div>

              {/* YouTube Reference Link & Fallback */}
              <div className="p-2 bg-stone-950/70 rounded-xl border border-amber-900/40 text-[10px] text-amber-300/80 flex items-center justify-between gap-2">
                <span className="truncate">Sumber: Gamelan Melayu Asli</span>
                <a
                  href={BG_MUSIC_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:text-amber-200 flex items-center gap-1 font-semibold underline shrink-0"
                >
                  <span>Buka YouTube</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {state.hasError && (
                <div className="p-2 bg-rose-950/80 border border-rose-800 text-rose-200 rounded-lg text-[10px] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                  <span>Audio YouTube disekat oleh rangkaian peranti. Sila klik pautan YouTube di atas.</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
