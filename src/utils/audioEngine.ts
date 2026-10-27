/**
 * Enjin Audio Tradisional Melayu (Web Audio API)
 * Dihadkan kepada DUA irama rasmi: Irama Dodoi dan Irama Selendang Delima.
 * Menyediakan sintesis bunyi seruling buluh, gamelan/canang, gong agung, rebana,
 * serta sokongan Web Speech API untuk sebutan kosa kata.
 */

import { IramaId } from '../types/syair';

class MalayAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private currentTrackStopFn: (() => void) | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.currentTrackStopFn) {
      this.currentTrackStopFn();
      this.currentTrackStopFn = null;
    }
  }

  public getMuted() {
    return this.isMuted;
  }

  public stopAll() {
    if (this.currentTrackStopFn) {
      this.currentTrackStopFn();
      this.currentTrackStopFn = null;
    }
  }

  /**
   * Mainkan not Seruling Buluh dengan vibrato lembut (lenggok Melayu)
   */
  public playBambooFluteNote(
    freq: number,
    duration: number,
    delay: number = 0,
    withVibrato: boolean = true
  ) {
    if (this.isMuted) return;
    const ctx = this.initContext();
    const startTime = ctx.currentTime + delay;

    // Main oscillator (sine)
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    // Subtle breath overtone
    const overtone = ctx.createOscillator();
    overtone.type = 'triangle';
    overtone.frequency.setValueAtTime(freq * 2, startTime);

    // Vibrato
    if (withVibrato) {
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(4.8, startTime); // gentle 4.8Hz vibrato
      lfoGain.gain.setValueAtTime(freq * 0.02, startTime);
      lfo.connect(osc.frequency);
      lfo.start(startTime + 0.15);
      lfo.stop(startTime + duration);
    }

    // Gain envelope
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.22, startTime + 0.08);
    gainNode.gain.setValueAtTime(0.2, startTime + duration - 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    const overtoneGain = ctx.createGain();
    overtoneGain.gain.setValueAtTime(0.03, startTime);
    overtoneGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gainNode);
    overtone.connect(overtoneGain);
    overtoneGain.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(startTime);
    overtone.start(startTime);
    osc.stop(startTime + duration + 0.05);
    overtone.stop(startTime + duration + 0.05);
  }

  /**
   * Mainkan Gong Agung untuk penamat baris / rangkap
   */
  public playGong(delay: number = 0) {
    if (this.isMuted) return;
    const ctx = this.initContext();
    const startTime = ctx.currentTime + delay;

    const baseOsc = ctx.createOscillator();
    baseOsc.type = 'sine';
    baseOsc.frequency.setValueAtTime(110, startTime);
    baseOsc.frequency.exponentialRampToValueAtTime(82, startTime + 1.8);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.35, startTime + 0.03);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + 2.8);

    baseOsc.connect(gainNode);
    gainNode.connect(ctx.destination);

    baseOsc.start(startTime);
    baseOsc.stop(startTime + 3.0);
  }

  /**
   * Mainkan Canang / Gamelan Chime
   */
  public playCanang(freq: number = 523.25, delay: number = 0) {
    if (this.isMuted) return;
    const ctx = this.initContext();
    const startTime = ctx.currentTime + delay;

    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.2, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.8);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.85);
  }

  /**
   * Mainkan ketukan Rebana
   */
  public playRebanaTap(delay: number = 0) {
    if (this.isMuted) return;
    const ctx = this.initContext();
    const startTime = ctx.currentTime + delay;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, startTime);
    osc.frequency.exponentialRampToValueAtTime(50, startTime + 0.18);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.3, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.22);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.25);
  }

  /**
   * Mainkan melodi bagi DUA irama rasmi:
   * 1. Dodoi: Sangat perlahan, tenang, mendayu-dayu, membuai jiwa (lullaby advice)
   * 2. Selendang Delima: Sederhana merdu, lenggok klasik bersahaja
   */
  public playIramaMelody(
    iramaId: IramaId,
    onProgress?: (noteIndex: number, totalNotes: number) => void,
    onComplete?: () => void
  ) {
    this.stopAll();
    const ctx = this.initContext();

    let melody: {
      freq: number;
      dur: number;
      delay: number;
      vibrato: boolean;
      hasCanang?: boolean;
      hasGong?: boolean;
    }[] = [];

    if (iramaId === 'dodoi') {
      // Irama Dodoi: Alunan lembut, perlahan dan mendayu-dayu
      melody = [
        { freq: 196.0, dur: 1.1, delay: 0.0, vibrato: false, hasCanang: true }, // G3 - De-
        { freq: 261.6, dur: 1.2, delay: 1.15, vibrato: true },                  // C4 - ngar-
        { freq: 293.7, dur: 1.3, delay: 2.4, vibrato: true },                   // D4 - lah
        { freq: 329.6, dur: 1.6, delay: 3.75, vibrato: true },                  // E4 - a-nak-da (mendayu panjang)
        { freq: 293.7, dur: 1.0, delay: 5.4, vibrato: false },                  // D4 - sua-
        { freq: 261.6, dur: 1.2, delay: 6.45, vibrato: true },                  // C4 - tu
        { freq: 196.0, dur: 2.0, delay: 7.7, vibrato: true, hasGong: true },    // G3 - pe-sa-nan (jeda henti)
      ];
    } else {
      // Irama Selendang Delima: Alunan tradisional sederhana merdu
      melody = [
        { freq: 261.6, dur: 0.9, delay: 0.0, vibrato: false, hasCanang: true }, // C4
        { freq: 329.6, dur: 0.8, delay: 0.95, vibrato: true },                  // E4
        { freq: 392.0, dur: 1.1, delay: 1.8, vibrato: true },                   // G4
        { freq: 440.0, dur: 1.3, delay: 2.95, vibrato: true },                  // A4
        { freq: 392.0, dur: 0.7, delay: 4.3, vibrato: false },                  // G4
        { freq: 329.6, dur: 0.8, delay: 5.05, vibrato: true },                  // E4
        { freq: 293.7, dur: 0.9, delay: 5.9, vibrato: true },                   // D4
        { freq: 261.6, dur: 1.8, delay: 6.85, vibrato: true, hasGong: true },   // C4
      ];
    }

    const timeouts: number[] = [];

    melody.forEach((item, index) => {
      this.playBambooFluteNote(item.freq, item.dur, item.delay, item.vibrato);

      if (item.hasCanang) {
        this.playCanang(item.freq * 2, item.delay);
      }
      if (item.hasGong) {
        this.playGong(item.delay + item.dur * 0.4);
      }

      const t = window.setTimeout(() => {
        if (onProgress) {
          onProgress(index, melody.length);
        }
      }, item.delay * 1000);
      timeouts.push(t);
    });

    const totalDuration =
      melody[melody.length - 1].delay + melody[melody.length - 1].dur + 0.8;
    const finalTimeout = window.setTimeout(() => {
      if (onComplete) onComplete();
    }, totalDuration * 1000);
    timeouts.push(finalTimeout);

    this.currentTrackStopFn = () => {
      timeouts.forEach(clearTimeout);
    };
  }

  /**
   * Kesan Bunyi (Sound Effects)
   */
  public playCorrectSfx() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.18, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.4);
    });
  }

  public playIncorrectSfx() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    const now = ctx.currentTime;
    [240, 210].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.14);
      gain.gain.setValueAtTime(0.15, now + idx * 0.14);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.14 + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.14);
      osc.stop(now + idx * 0.14 + 0.32);
    });
  }

  public playTapSfx() {
    if (this.isMuted) return;
    this.playRebanaTap(0);
  }

  public playFanfareSfx() {
    if (this.isMuted) return;
    this.playGong(0);
    this.playCorrectSfx();
  }

  /**
   * Lafaz sebutan kosa kata menggunakan Web Speech API
   */
  public reciteTextWithVoice(text: string, rate: number = 0.85, onEnd?: () => void) {
    if (!('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ms-MY';
    utterance.rate = rate;
    utterance.pitch = 1.05;

    const voices = window.speechSynthesis.getVoices();
    const malayVoice = voices.find((v) => v.lang.startsWith('ms') || v.lang.startsWith('id'));
    if (malayVoice) {
      utterance.voice = malayVoice;
    }

    utterance.onend = () => {
      if (onEnd) onEnd();
    };
    utterance.onerror = () => {
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  }

  public stopRecitation() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const audioEngine = new MalayAudioEngine();
