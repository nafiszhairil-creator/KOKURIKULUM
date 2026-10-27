import React from 'react';
import { X, BookOpen, Music, Sparkles } from 'lucide-react';
import { SYAIR_UTAMA, IRAMA_LIST, IDEA_KESELURUHAN_SYAIR } from '../data/syairData';

interface DokumentasiDSKPModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DokumentasiDSKPModal: React.FC<DokumentasiDSKPModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 sm:p-6 backdrop-blur-xs">
      <div className="bg-white max-w-4xl w-full rounded-2xl shadow-2xl border border-amber-900/30 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-amber-950 text-amber-50 flex items-center justify-between border-b border-amber-900 shrink-0">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1 font-mono">
              <span>Kurikulum Standard Sekolah Rendah (KSSR Semakan)</span>
              <span>·</span>
              <span>Bahasa Melayu Tahun 5</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-amber-100">
              Dokumentasi Lengkap & Skrip DSKP SP 4.2.1
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-amber-300 hover:text-white rounded-lg hover:bg-amber-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 text-xs sm:text-sm text-slate-700">
          {/* Section 1: Konsep & Standard Kurikulum */}
          <section className="space-y-3">
            <h3 className="text-base sm:text-lg font-bold text-amber-950 font-display flex items-center gap-2 border-b border-amber-100 pb-2">
              <span className="w-6 h-6 rounded-md bg-amber-800 text-amber-100 flex items-center justify-center text-xs font-mono font-bold">1</span>
              <span>Nama & Konsep Utama Aplikasi</span>
            </h3>

            <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200/60 space-y-2">
              <p>
                <strong>Tajuk Rasmi:</strong> <span className="font-semibold text-amber-950">Pahlawan Syair: Kembara Irama Melayu</span>
              </p>
              <p>
                <strong>Dua Irama Rasmi:</strong> <strong>Irama Dodoi</strong> (alunan lembut, perlahan dan mendayu-dayu) dan <strong>Irama Selendang Delima</strong> (alunan tradisional merdu).
              </p>
              <p>
                <strong>Standard Kandungan (SK) 4.2:</strong> Menghayati keindahan dan kesantunan bahasa dalam bahan sastera.
              </p>
              <p>
                <strong>Standard Pembelajaran (SP) 4.2.1:</strong> Melafazkan dan melagukan syair dengan irama yang sesuai serta menyatakan idea keseluruhan syair.
              </p>
              <p>
                <strong>Kod Akses Guru Prototaip:</strong> <span className="font-mono font-bold text-amber-900">123</span> (untuk demonstrasi dan pentaksiran PBD).
              </p>
            </div>
          </section>

          {/* Section 2: Peta Antaramuka (UI Flow Map) */}
          <section className="space-y-3">
            <h3 className="text-base sm:text-lg font-bold text-amber-950 font-display flex items-center gap-2 border-b border-amber-100 pb-2">
              <span className="w-6 h-6 rounded-md bg-amber-800 text-amber-100 flex items-center justify-center text-xs font-mono font-bold">2</span>
              <span>Peta Aliran Antaramuka (UI Flow Map)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-sans">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <strong className="text-amber-900 block text-xs uppercase">1. Pintu Masuk / Log Masuk</strong>
                <p className="text-[11px] text-slate-600">
                  Pilihan Log Masuk Murid (Nama, Kelas, Watak Tuah / Teja) vs Log Masuk Guru (Kod akses 123). Pengasingan profil setempat.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <strong className="text-amber-900 block text-xs uppercase">2. Mod Pembelajaran</strong>
                <p className="text-[11px] text-slate-600">
                  <strong>Pondok Irama:</strong> Pemain YouTube sah, melodi seruling sintesis, jeda nafas.<br />
                  <strong>Fahami Syair:</strong> 4 rangkap, glosari 8 kata klasik, kuiz 5 soalan bertaraf DSKP.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <strong className="text-amber-900 block text-xs uppercase">3. Permainan & Pentaksiran</strong>
                <p className="text-[11px] text-slate-600">
                  <strong>Teka Irama:</strong> 4 segmen Dodoi vs Selendang Delima.<br />
                  <strong>Tangkap Kunci Kata:</strong> 35s arkade membina idea.<br />
                  <strong>Lagukan Syair & PBD:</strong> Rakaman suara + rubrik skala 1-4.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Skrip Penuh 4 Rangkap Syair Tahun 5 */}
          <section className="space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-amber-950 font-display flex items-center gap-2 border-b border-amber-100 pb-2">
              <span className="w-6 h-6 rounded-md bg-amber-800 text-amber-100 flex items-center justify-center text-xs font-mono font-bold">3</span>
              <span>Skrip Penuh: “Syair Pesanan Bonda: Pelita Menuntut Ilmu”</span>
            </h3>

            <div className="space-y-4">
              {SYAIR_UTAMA.rangkap.map((r) => (
                <div key={r.nombor} className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-900 font-display text-sm">
                      {r.tajukRangkap}
                    </span>
                    <span className="text-xs font-mono text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-semibold">
                      Rima Akhir: {r.baris[0].endRhyme} (a-a-a-a)
                    </span>
                  </div>

                  {/* Lirik berserta Tanda Jeda */}
                  <div className="space-y-1 pl-3 border-l-2 border-amber-400 font-serif text-slate-900">
                    {r.baris.map((b, bIdx) => (
                      <div key={bIdx} className="flex justify-between items-center text-xs sm:text-sm">
                        <span>{b.textWithPauses}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({b.syllablesCount} suku kata)</span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-2 border-t border-amber-200/60">
                    <div>
                      <strong className="text-slate-800 block">Maksud Harafiah:</strong>
                      <p className="text-slate-600">{r.maksudHarafiah}</p>
                    </div>
                    <div className="bg-white/80 p-2.5 rounded-lg border border-amber-200/80">
                      <strong className="text-amber-950 block">Idea Keseluruhan Rangkap (SP 4.2.1):</strong>
                      <p className="text-amber-900 font-medium italic">“{r.ideaKeseluruhan}”</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Rumusan Keseluruhan Syair */}
            <div className="p-4 bg-amber-950 text-amber-100 rounded-xl space-y-1 font-serif">
              <strong className="text-amber-300 block text-xs uppercase font-sans font-bold">
                Idea Keseluruhan Keseluruhan Syair:
              </strong>
              <p className="italic">“{IDEA_KESELURUHAN_SYAIR.ringkasan}”</p>
            </div>
          </section>

          {/* Section 4: Panduan 2 Irama Rasmi */}
          <section className="space-y-3">
            <h3 className="text-base sm:text-lg font-bold text-amber-950 font-display flex items-center gap-2 border-b border-amber-100 pb-2">
              <span className="w-6 h-6 rounded-md bg-amber-800 text-amber-100 flex items-center justify-center text-xs font-mono font-bold">4</span>
              <span>Dua Irama Rasmi & Panduan Ton Suara</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {IRAMA_LIST.map((irama) => (
                <div key={irama.id} className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1.5">
                  <span className="font-bold text-amber-900 block text-sm">{irama.name}</span>
                  <span className="text-[11px] text-slate-500 block">Tempo: {irama.tempo} ({irama.tempoBpm} BPM)</span>
                  <p className="text-slate-600">{irama.description}</p>
                  <p className="text-amber-800 font-serif italic pt-1 border-t border-slate-100">
                    Petua: {irama.tips}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            Pahlawan Syair · Modul Pembelajaran Interaktif KSSR Semakan Bahasa Melayu Tahun 5
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-amber-900 hover:bg-amber-800 text-amber-50 font-bold rounded-lg text-xs transition-colors"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
