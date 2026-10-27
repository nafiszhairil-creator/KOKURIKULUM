/**
 * Pengurus Muzik Latar Utama (Background Music Loop)
 * Pautan: https://youtu.be/wzrMoF6dbkQ?list=RDwzrMoF6dbkQ
 * ID Video: wzrMoF6dbkQ
 */

const STORAGE_KEY = 'pahlawan_syair_bg_music_v1';
export const BG_MUSIC_YOUTUBE_ID = 'wzrMoF6dbkQ';
export const BG_MUSIC_URL = 'https://youtu.be/wzrMoF6dbkQ?list=RDwzrMoF6dbkQ';

export interface BgMusicState {
  isPlaying: boolean;
  isEnabled: boolean; // User preference
  volume: number; // 0 to 100
  isActivityPaused: boolean; // Paused because of game / recitation
  isReady: boolean;
  hasError: boolean;
}

type Listener = (state: BgMusicState) => void;

class BgMusicManager {
  private player: any = null;
  private listeners: Set<Listener> = new Set();
  private wasPlayingBeforeActivity: boolean = false;

  private state: BgMusicState = {
    isPlaying: false,
    isEnabled: false,
    volume: 60,
    isActivityPaused: false,
    isReady: false,
    hasError: false
  };

  constructor() {
    this.loadPreferences();
  }

  private loadPreferences() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.isEnabled === 'boolean') this.state.isEnabled = parsed.isEnabled;
        if (typeof parsed.volume === 'number') this.state.volume = Math.max(0, Math.min(100, parsed.volume));
      }
    } catch (e) {
      console.warn('Gagal memuatkan tetapan muzik latar:', e);
    }
  }

  private savePreferences() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          isEnabled: this.state.isEnabled,
          volume: this.state.volume
        })
      );
    } catch (e) {
      console.warn('Gagal menyimpan tetapan muzik latar:', e);
    }
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l({ ...this.state }));
    this.savePreferences();
  }

  public setPlayerInstance(player: any) {
    this.player = player;
    this.state.isReady = true;
    this.state.hasError = false;

    try {
      if (this.player && typeof this.player.setVolume === 'function') {
        this.player.setVolume(this.state.volume);
      }
    } catch {}

    this.notify();
  }

  public setPlayerError() {
    this.state.hasError = true;
    this.state.isPlaying = false;
    this.notify();
  }

  public play() {
    this.state.isEnabled = true;
    this.state.isActivityPaused = false;
    this.wasPlayingBeforeActivity = true;

    if (this.player && typeof this.player.playVideo === 'function') {
      try {
        this.player.setVolume(this.state.volume);
        this.player.playVideo();
      } catch (err) {
        console.warn('Gagal memainkan muzik latar:', err);
      }
    }
    this.state.isPlaying = true;
    this.notify();
  }

  public pause() {
    this.state.isPlaying = false;
    this.wasPlayingBeforeActivity = false;

    if (this.player && typeof this.player.pauseVideo === 'function') {
      try {
        this.player.pauseVideo();
      } catch (err) {}
    }
    this.notify();
  }

  public toggle() {
    if (this.state.isPlaying) {
      this.state.isEnabled = false;
      this.pause();
    } else {
      this.play();
    }
  }

  public setVolume(vol: number) {
    const clamped = Math.max(0, Math.min(100, Math.round(vol)));
    this.state.volume = clamped;
    if (this.player && typeof this.player.setVolume === 'function') {
      try {
        this.player.setVolume(clamped);
      } catch (err) {}
    }
    this.notify();
  }

  /**
   * Jedakan muzik latar secara automatik apabila audio permainan atau syair dimainkan
   */
  public pauseForActivity() {
    if (this.state.isPlaying) {
      this.wasPlayingBeforeActivity = true;
      this.state.isActivityPaused = true;
      this.state.isPlaying = false;
      if (this.player && typeof this.player.pauseVideo === 'function') {
        try {
          this.player.pauseVideo();
        } catch {}
      }
      this.notify();
    }
  }

  /**
   * Sambung semula muzik latar sekiranya murid telah mengaktifkannya sebelum aktiviti
   */
  public resumeAfterActivity() {
    if (this.wasPlayingBeforeActivity && this.state.isEnabled) {
      this.state.isActivityPaused = false;
      this.play();
    }
  }

  public onPlayerStateChange(eventState: number) {
    // YT.PlayerState.PLAYING = 1, PAUSED = 2, ENDED = 0
    if (eventState === 1) {
      this.state.isPlaying = true;
      this.notify();
    } else if (eventState === 2) {
      this.state.isPlaying = false;
      this.notify();
    } else if (eventState === 0) {
      // Loop: video ended, restart automatically
      if (this.state.isEnabled && !this.state.isActivityPaused) {
        try {
          this.player.seekTo(0);
          this.player.playVideo();
        } catch {}
      }
    }
  }

  public getState(): BgMusicState {
    return { ...this.state };
  }
}

export const bgMusicManager = new BgMusicManager();
