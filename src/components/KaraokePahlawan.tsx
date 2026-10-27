import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Play,
  RotateCcw,
  Trash2,
  Award,
  CheckCircle2,
  Sparkles,
  Info,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SYAIR_UTAMA, IRAMA_LIST } from '../data/syairData';
import { IramaId, StudentProfile } from '../types/syair';
import { audioEngine } from '../utils/audioEngine';
import { bgMusicManager } from '../utils/bgMusicManager';

interface KaraokePahlawanProps {
  onEarnXp: (amount: number, reason: string) => void;
  onEarnBadge: (badgeId: string) => void;
  onSaveKaraokeAssessment: (assessment: {
    sebutan: number;
    kelancaran: number;
    irama: number;
    penghayatan: number;
    totalScore: number;
    recordedAt: string;
    iramaChosen: IramaId;
    studentReflection: string;
  }) => void;
  student: StudentProfile;
}

export const KaraokePahlawan: React.FC<KaraokePahlawanProps> = ({
  onEarnXp,
  onEarnBadge,
  onSaveKaraokeAssessment,
  student
}) => {
  const [selectedRangkapIdx, setSelectedRangkapIdx] = useState<number>(0);
  const [selectedIrama, setSelectedIrama] = useState<IramaId>('dodoi');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [micErrorMessage, setMicErrorMessage] = useState<string | null>(null);

  // Rubric Self-Reflection State (Scale 1 to 4)
  const [rubricSebutan, setRubricSebutan] = useState<number>(3);
  const [rubricKelancaran, setRubricKelancaran] = useState<number>(3);
  const [rubricIrama, setRubricIrama] = useState<number>(3);
  const [rubricPenghayatan, setRubricPenghayatan] = useState<number>(3);
  const [reflectionText, setReflectionText] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Refs for Web Audio analyser and MediaRecorder
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);

  const currentRangkap = SYAIR_UTAMA.rangkap[selectedRangkapIdx];
  const currentIramaObj = IRAMA_LIST.find((i) => i.id === selectedIrama) || IRAMA_LIST[0];

  useEffect(() => {
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
      }
      bgMusicManager.resumeAfterActivity();
    };
  }, [recordedAudioUrl]);

  const startRecording = async () => {
    setMicErrorMessage(null);
    setIsSaved(false);
    audioEngine.playTapSfx();
    bgMusicManager.pauseForActivity();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      // Draw real-time audio waveform canvas
      const draw = () => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        analyser.getByteFrequencyData(dataArray);

        ctx.fillStyle = '#1c1917';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2.2;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height * 0.9;
          const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
          gradient.addColorStop(0, '#f59e0b');
          gradient.addColorStop(1, '#10b981');

          ctx.fillStyle = gradient;
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          x += barWidth + 1;
        }

        animFrameIdRef.current = requestAnimationFrame(draw);
      };

      draw();

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());

        if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
        audioCtx.close();
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      // Play backing synthesized melody softly in background
      audioEngine.playIramaMelody(selectedIrama);

      timerIntervalRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Akses mikrofon tidak dibenarkan atau gagal:', err);
      bgMusicManager.resumeAfterActivity();
      setMicErrorMessage(
        'Akses mikrofon tidak dapat dibuka. Sila pastikan anda membenarkan kebenaran mikrofon pada pelayar web.'
      );
    }
  };

  const stopRecording = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    audioEngine.stopAll();
    bgMusicManager.resumeAfterActivity();

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    audioEngine.playTapSfx();
  };

  const handleDeleteRecording = () => {
    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
    }
    setRecordedAudioUrl(null);
    setRecordingSeconds(0);
    audioEngine.playTapSfx();
  };

  const handleSaveSelfReflection = (e: React.FormEvent) => {
    e.preventDefault();
    const totalScore = Math.round(
      ((rubricSebutan + rubricKelancaran + rubricIrama + rubricPenghayatan) / 16) * 100
    );

    onSaveKaraokeAssessment({
      sebutan: rubricSebutan,
      kelancaran: rubricKelancaran,
      irama: rubricIrama,
      penghayatan: rubricPenghayatan,
      totalScore,
      recordedAt: new Date().toISOString().split('T')[0],
      iramaChosen: selectedIrama,
      studentReflection: reflectionText
    });

    setIsSaved(true);
    audioEngine.playFanfareSfx();
    confetti({ particleCount: 70, spread: 65, origin: { y: 0.6 } });
    onEarnBadge('maestro_syair');
    onEarnXp(50, 'Menyelesaikan Refleksi Lagukan Syair');
  };

  // Rubric aspect labels and descriptors
  const rubricAspects = [
    {
      id: 'sebutan',
      name: '1. Kejelasan Sebutan Baku',
      val: rubricSebutan,
      set: setRubricSebutan,
      desc: {
        1: 'Sebutan kurang jelas dan banyak kesalahan perkataan.',
        2: 'Sebutan memuaskan, beberapa perkataan masih kurang jelas.',
        3: 'Sebutan jelas, tepat dan baku pada kebanyakan baris.',
        4: 'Sebutan amat jelas, tepat, fasih dan mengikut sebutan baku sepenuhnya.'
      }
    },
    {
      id: 'kelancaran',
      name: '2. Kelancaran Melafazkan Syair',
      val: rubricKelancaran,
      set: setRubricKelancaran,
      desc: {
        1: 'Sering tersangkut atau terhenti semasa melagukan.',
        2: 'Kelancaran sederhana dengan beberapa kali teragak-agak.',
        3: 'Lancar dan tertib dari baris pertama hingga akhir.',
        4: 'Sangat lancar, yakin dan tidak menunjukkan keraguan.'
      }
    },
    {
      id: 'irama',
      name: `3. Kesesuaian Irama & Intonasi (${currentIramaObj.name})`,
      val: rubricIrama,
      set: setRubricIrama,
      desc: {
        1: 'Irama tidak sepadan dan tiada lenggok syair.',
        2: 'Irama ada tetapi lenggok melodi kurang konsisten.',
        3: 'Irama sesuai dan lenggok tradisional dapat didengar jelas.',
        4: 'Irama amat sesuai, lenggok tradisional merdu dan mantap.'
      }
    },
    {
      id: 'penghayatan',
      name: '4. Penghayatan & Penggunaan Tanda Jeda (/ dan //)',
      val: rubricPenghayatan,
      set: setRubricPenghayatan,
      desc: {
        1: 'Mengabaikan jeda nafas dan tiada penghayatan maksud.',
        2: 'Menggunakan jeda sekali-sekala, penghayatan sederhana.',
        3: 'Mematuhi jeda pendek dan henti penuh dengan tertib.',
        4: 'Penghayatan amat mendalam dengan kawalan nafas dan jeda yang sempurna.'
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-amber-900/10 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 uppercase tracking-wider mb-1">
            <span>Permainan 03</span>
            <span aria-hidden="true">·</span>
            <span>Studio Melagukan Syair & Refleksi Kendiri (SP 4.2.1)</span>
          </div>
          <h2 className="text-2xl font-bold text-amber-950 font-display">
            Lagukan Syair
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Lagu kan syair dengan iringan <strong>Irama Dodoi</strong> atau <strong>Irama Selendang Delima</strong>, rakam suara anda secara setempat, dan lengkapkan rubrik penilaian kendiri.
          </p>
        </div>

        {/* Live Mic Indicator */}
        <div className="flex items-center gap-2.5 bg-amber-50 px-3.5 py-2 rounded-xl border border-amber-200 shrink-0">
          <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}`} />
          <span className="text-xs font-semibold text-amber-900">
            {isRecording ? `Merakam (${recordingSeconds}s)` : 'Mikrofon Sedia'}
          </span>
        </div>
      </div>

      {micErrorMessage && (
        <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-950 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <strong>Pemberitahuan Mikrofon:</strong> {micErrorMessage} Anda masih boleh berlatih melagukan syair bersama lirik dan mengisi rubrik pentaksiran kendiri di bawah.
          </div>
        </div>
      )}

      {/* Main Studio Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Teleprompter & Live Waveform Canvas */}
        <div className="lg:col-span-7 bg-amber-950 text-amber-50 rounded-2xl p-6 border border-amber-900 shadow-lg space-y-5">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-900 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-amber-400 font-semibold uppercase">Pilih Rangkap:</span>
              <div className="flex gap-1">
                {SYAIR_UTAMA.rangkap.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (!isRecording) {
                        setSelectedRangkapIdx(i);
                        audioEngine.playTapSfx();
                      }
                    }}
                    disabled={isRecording}
                    className={`px-2.5 py-1 text-xs font-bold rounded transition-colors ${
                      selectedRangkapIdx === i
                        ? 'bg-amber-400 text-amber-950'
                        : 'text-amber-300 hover:text-white bg-amber-900/50'
                    }`}
                  >
                    R{i + 1}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-amber-400 font-semibold uppercase">Irama:</span>
              <select
                value={selectedIrama}
                onChange={(e) => {
                  setSelectedIrama(e.target.value as IramaId);
                  audioEngine.playTapSfx();
                }}
                disabled={isRecording}
                className="bg-amber-900 text-amber-100 text-xs rounded-lg px-2.5 py-1 border border-amber-700 focus:outline-none"
              >
                {IRAMA_LIST.map((irama) => (
                  <option key={irama.id} value={irama.id}>
                    {irama.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Teleprompter Lyrics Display */}
          <div className="space-y-2.5 py-1">
            <span className="text-[11px] text-amber-400 font-mono block uppercase font-bold">
              Lirik Syair (Perhatikan Jeda / dan //)
            </span>
            {currentRangkap.baris.map((b, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border transition-all ${
                  isRecording
                    ? 'bg-amber-900/40 border-amber-400/60 text-amber-100'
                    : 'bg-amber-900/20 border-transparent text-amber-200/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base sm:text-lg font-serif font-medium">
                    {b.textWithPauses}
                  </span>
                  <span className="text-xs font-mono text-amber-400 bg-amber-950 px-2 py-0.5 rounded">
                    Rima: {b.endRhyme}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Live Waveform Canvas */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-amber-300">
              <span>Visualizer Gelombang Suara (Waveform FFT)</span>
              <span className="text-amber-400/80">
                {isRecording ? 'Frekuensi Vokal Aktif' : 'Menunggu Rakaman'}
              </span>
            </div>
            <div className="w-full h-24 bg-stone-900 rounded-xl overflow-hidden border border-amber-800/60 relative">
              <canvas
                ref={canvasRef}
                width={500}
                height={96}
                className="w-full h-full block"
              />
              {!isRecording && (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-amber-400/60 italic">
                  Tekan butang di bawah untuk memulakan rakaman suara
                </div>
              )}
            </div>
            <p className="text-[10px] text-amber-400/60 italic">
              * Visualizer ini memaparkan tahap amplitud frekuensi audio dan tidak menilai ketepatan irama secara automatik.
            </p>
          </div>

          {/* Recording Trigger Actions */}
          <div className="pt-2 border-t border-amber-900 flex flex-wrap items-center justify-between gap-3">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-md transition-all active:scale-95 text-xs sm:text-sm"
              >
                <Mic className="w-4 h-4 fill-current" />
                <span>Mula Rakam Suara</span>
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="flex items-center gap-2 px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold rounded-xl shadow-md transition-all active:scale-95 text-xs sm:text-sm animate-pulse"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Hentikan Rakaman</span>
              </button>
            )}

            {/* Playback & Delete Local Audio Controls */}
            {recordedAudioUrl && !isRecording && (
              <div className="flex items-center gap-2 bg-amber-900/60 p-1.5 rounded-xl border border-amber-700/60">
                <audio controls src={recordedAudioUrl} className="h-8 w-44 rounded" />
                <button
                  onClick={handleDeleteRecording}
                  title="Padam Rakaman Setempat"
                  className="p-1.5 text-rose-300 hover:text-white hover:bg-rose-900/60 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Rubric Self-Reflection Form (Scale 1 to 4) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
              Borang Pentaksiran Kendiri Murid
            </span>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Rubrik Penilaian 4 Aspek (Skala 1 - 4)
            </h3>
            <p className="text-[11px] text-slate-500">
              Sila dengar semula rakaman anda dan nilaikan persembahan berdasarkan kriteria DSKP SP 4.2.1.
            </p>
          </div>

          <form onSubmit={handleSaveSelfReflection} className="space-y-3.5 text-xs">
            {rubricAspects.map((aspect) => (
              <div key={aspect.id} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-800">{aspect.name}</span>
                  <span className="font-mono font-bold text-amber-900">Tahap {aspect.val}/4</span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {[1, 2, 3, 4].map((scale) => (
                    <button
                      type="button"
                      key={scale}
                      onClick={() => aspect.set(scale)}
                      className={`py-1 text-center rounded border font-semibold ${
                        aspect.val === scale
                          ? 'bg-amber-800 text-white border-amber-800 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {scale}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 italic">
                  {aspect.desc[aspect.val as 1 | 2 | 3 | 4]}
                </p>
              </div>
            ))}

            {/* Student's Written Reflection */}
            <div className="pt-2 border-t border-slate-100">
              <label className="font-semibold text-slate-700 block mb-1">
                Refleksi Kendiri (Apa yang saya pelajari):
              </label>
              <textarea
                rows={2}
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                placeholder="Contoh: Saya berjaya mengalunkan Irama Dodoi dengan lembut..."
                className="w-full p-2.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* Calculated Score Summary */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
              <span className="font-bold text-amber-950">Jumlah Skor Kendiri:</span>
              <span className="font-mono text-base font-bold text-amber-900">
                {Math.round(((rubricSebutan + rubricKelancaran + rubricIrama + rubricPenghayatan) / 16) * 100)}%
              </span>
            </div>

            {isSaved && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-900 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Refleksi kendiri berjaya disimpan dan disahkan (+50 XP)!</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-amber-800 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition-colors shadow-sm"
            >
              Hantar Penilaian Kendiri & Terima XP
            </button>
          </form>

          {/* Teacher's Feedback View if Evaluated */}
          {student.teacherAssessment && (
            <div className="mt-4 pt-3 border-t border-slate-100 bg-amber-50/60 p-3 rounded-xl border border-amber-200/60 text-xs space-y-1">
              <strong className="text-amber-950 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-600" />
                <span>Ulasan Pentaksiran Guru ({student.teacherAssessment.teacherName}):</span>
              </strong>
              <p className="text-slate-700 italic">“{student.teacherAssessment.comments}”</p>
              <span className="text-[10px] text-emerald-700 font-bold block font-mono">
                Markah PBD Guru: {student.teacherAssessment.totalScore}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
