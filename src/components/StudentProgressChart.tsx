import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ComposedChart
} from 'recharts';
import { TrendingUp, BarChart2, Award, Zap, CheckCircle2, Target } from 'lucide-react';
import { StudentProfile } from '../types/syair';
import { BADGES_LIST } from '../data/syairData';

interface StudentProgressChartProps {
  student: StudentProfile;
}

export const StudentProgressChart: React.FC<StudentProgressChartProps> = ({ student }) => {
  const [activeView, setActiveView] = useState<'xp' | 'quiz' | 'combined'>('combined');

  // Compute quiz performance data
  const quizData = useMemo(() => {
    const r1 = student.quizScores.rangkap1 || 0;
    const r2 = student.quizScores.rangkap2 || 0;
    const r3 = student.quizScores.rangkap3 || 0;
    const r4 = student.quizScores.rangkap4 || 0;

    return [
      {
        rangkap: 'Rangkap 1',
        tajuk: 'Adab Berilmu',
        skor: r1,
        peratus: Math.round((r1 / 5) * 100),
        sasaran: 80,
        markahPenuh: 5
      },
      {
        rangkap: 'Rangkap 2',
        tajuk: 'Hormat Guru',
        skor: r2,
        peratus: Math.round((r2 / 5) * 100),
        sasaran: 80,
        markahPenuh: 5
      },
      {
        rangkap: 'Rangkap 3',
        tajuk: 'Pilih Sahabat',
        skor: r3,
        peratus: Math.round((r3 / 5) * 100),
        sasaran: 80,
        markahPenuh: 5
      },
      {
        rangkap: 'Rangkap 4',
        tajuk: 'Tekad Watan',
        skor: r4,
        peratus: Math.round((r4 / 5) * 100),
        sasaran: 80,
        markahPenuh: 5
      }
    ];
  }, [student.quizScores]);

  // Compute timeline data for XP Growth
  const timelineData = useMemo(() => {
    const currentXp = student.xp;
    const r1 = student.quizScores.rangkap1 || 0;
    const r2 = student.quizScores.rangkap2 || 0;
    const r3 = student.quizScores.rangkap3 || 0;
    const r4 = student.quizScores.rangkap4 || 0;

    // Sequential checkpoints of the learning quest
    const stages = [
      {
        fasa: 'Mula',
        label: 'Daftar Kembara',
        xpGain: 10,
        quizScorePct: 0
      },
      {
        fasa: 'Fasa 1',
        label: 'Pondok Irama',
        xpGain: student.completedModules.pondokIrama ? 40 : 0,
        quizScorePct: student.completedModules.pondokIrama ? 85 : 0
      },
      {
        fasa: 'Fasa 2',
        label: 'Bedah Makna (R1 & R2)',
        xpGain: (r1 > 0 ? 35 : 0) + (r2 > 0 ? 35 : 0),
        quizScorePct: Math.round(((r1 + r2) / 10) * 100)
      },
      {
        fasa: 'Fasa 3',
        label: 'Padankan Irama',
        xpGain: student.completedModules.gameIramaMatch ? 40 : 0,
        quizScorePct: student.completedModules.gameIramaMatch ? 90 : 0
      },
      {
        fasa: 'Fasa 4',
        label: 'Tangkap Kata (R3 & R4)',
        xpGain: (r3 > 0 ? 35 : 0) + (r4 > 0 ? 35 : 0),
        quizScorePct: Math.round(((r3 + r4) / 10) * 100)
      },
      {
        fasa: 'Fasa 5',
        label: 'Karaoke Pahlawan',
        xpGain: student.completedModules.karaoke ? 60 : 0,
        quizScorePct: student.karaokeAssessment ? student.karaokeAssessment.totalScore : 0
      }
    ];

    let runningXp = 0;
    return stages.map((st, idx) => {
      // Smooth interpolation to ensure cumulative reaches the student's exact current XP
      runningXp += st.xpGain;
      // Cap or normalize running XP proportionally so the last completed phase aligns with actual student XP
      const proportionalXp = Math.min(currentXp, Math.round((currentXp / Math.max(1, stages.reduce((a, b) => a + b.xpGain, 10))) * runningXp));
      const displayXp = idx === stages.length - 1 ? currentXp : Math.min(currentXp, Math.max(10, proportionalXp));

      return {
        fasa: st.fasa,
        aktiviti: st.label,
        xpTerkumpul: displayXp,
        skorKuiz: st.quizScorePct,
        sasaranXP: idx === 0 ? 10 : idx === 1 ? 80 : idx === 2 ? 150 : idx === 3 ? 220 : idx === 4 ? 300 : 400
      };
    });
  }, [student]);

  // Overall Statistics Summary
  const totalQuizScore = (student.quizScores.rangkap1 || 0) + (student.quizScores.rangkap2 || 0) + (student.quizScores.rangkap3 || 0) + (student.quizScores.rangkap4 || 0);
  const quizAveragePct = Math.round((totalQuizScore / 20) * 100);

  // Next badge target
  const nextBadge = useMemo(() => {
    return BADGES_LIST.find((b) => student.xp < b.unlockedAtXp);
  }, [student.xp]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header and Toggle Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4 text-amber-600" />
            <span>Analisis Perkembangan Murid</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 font-display">
            Pertumbuhan XP & Prestasi Kuiz Syair
          </h3>
          <p className="text-xs text-slate-500">
            Pantau graf peningkatan ilmu, konsistensi pembelajaran dan penguasaan kefahaman rangkap syair.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => setActiveView('combined')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeView === 'combined'
                ? 'bg-white text-amber-950 font-bold shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
            <span>Gabungan</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveView('xp')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeView === 'xp'
                ? 'bg-white text-amber-950 font-bold shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Kembara XP</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveView('quiz')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeView === 'quiz'
                ? 'bg-white text-amber-950 font-bold shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Skor Rangkap</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Pill Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200">
          <span className="text-[11px] font-semibold text-amber-800 uppercase block">XP Terkumpul</span>
          <span className="text-xl font-bold font-mono text-amber-950 tabular-nums">
            {student.xp} XP
          </span>
          <span className="text-[10px] text-amber-700/80 block mt-0.5">
            {student.xp >= 400 ? 'Tahap Tertinggi!' : nextBadge ? `+${nextBadge.unlockedAtXp - student.xp} XP ke Lencana Seterusnya` : ''}
          </span>
        </div>

        <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200">
          <span className="text-[11px] font-semibold text-emerald-800 uppercase block">Purata Skor Kuiz</span>
          <span className="text-xl font-bold font-mono text-emerald-950 tabular-nums">
            {quizAveragePct}%
          </span>
          <span className="text-[10px] text-emerald-700/80 block mt-0.5">
            {totalQuizScore} / 20 Soalan Betul
          </span>
        </div>

        <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200">
          <span className="text-[11px] font-semibold text-blue-800 uppercase block">Tahap Penguasaan</span>
          <span className="text-base font-bold text-blue-950 block truncate">
            {quizAveragePct >= 80 ? 'Cemerlang (TP 5-6)' : quizAveragePct >= 60 ? 'Baik (TP 3-4)' : 'Perlu Bimbingan'}
          </span>
          <span className="text-[10px] text-blue-700/80 block mt-0.5">
            DSKP SK 4.2 & SP 4.2.1
          </span>
        </div>

        <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-200">
          <span className="text-[11px] font-semibold text-purple-800 uppercase block">Lencana Dibuka</span>
          <span className="text-xl font-bold font-mono text-purple-950 tabular-nums">
            {student.badges.length} / {BADGES_LIST.length}
          </span>
          <span className="text-[10px] text-purple-700/80 block mt-0.5">
            {nextBadge ? `Seterusnya: ${nextBadge.name}` : 'Semua Lencana Diperoleh!'}
          </span>
        </div>
      </div>

      {/* Chart Visualization Area */}
      <div className="h-72 w-full pt-2">
        {activeView === 'combined' && (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={timelineData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
              <defs>
                <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d97706" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#d97706" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="aktiviti"
                tick={{ fontSize: 11, fill: '#64748b' }}
                interval={0}
                angle={-15}
                textAnchor="end"
                height={50}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11, fill: '#64748b' }}
                label={{ value: 'XP Terkumpul', angle: -90, position: 'insideLeft', offset: 15, style: { fontSize: 11, fill: '#92400e' } }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: '#64748b' }}
                label={{ value: 'Skor (%)', angle: 90, position: 'insideRight', offset: 10, style: { fontSize: 11, fill: '#065f46' } }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontSize: '12px'
                }}
                formatter={(val: any, name?: any) => {
                  if (name === 'xpTerkumpul') return [`${val} XP`, 'XP Terkumpul'];
                  if (name === 'skorKuiz') return [`${val}%`, 'Skor Kefahaman'];
                  return [val, String(name ?? '')];
                }}
                labelFormatter={(lbl) => `Aktiviti: ${lbl}`}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }}
                formatter={(value) => (value === 'xpTerkumpul' ? 'XP Terkumpul' : 'Skor Kuiz (%)')}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="xpTerkumpul"
                stroke="#d97706"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#xpGradient)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="skorKuiz"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 4, fill: '#10b981', strokeWidth: 1.5, stroke: '#ffffff' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}

        {activeView === 'xp' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
              <defs>
                <linearGradient id="xpAreaOnly" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#b45309" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#b45309" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="aktiviti"
                tick={{ fontSize: 11, fill: '#64748b' }}
                interval={0}
                angle={-15}
                textAnchor="end"
                height={50}
              />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontSize: '12px'
                }}
                formatter={(val: any) => [`${val} XP`, 'Jumlah XP']}
                labelFormatter={(lbl) => `Peringkat: ${lbl}`}
              />
              <ReferenceLine y={80} stroke="#d97706" strokeDasharray="3 3" label={{ value: 'Lencana 1 (80 XP)', fill: '#b45309', fontSize: 10 }} />
              <ReferenceLine y={180} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Jaguh Irama (180 XP)', fill: '#b45309', fontSize: 10 }} />
              <ReferenceLine y={280} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Penyusun Hikmah (280 XP)', fill: '#047857', fontSize: 10 }} />
              <ReferenceLine y={400} stroke="#6366f1" strokeDasharray="3 3" label={{ value: 'Maestro Syair (400 XP)', fill: '#4338ca', fontSize: 10 }} />
              <Area
                type="monotone"
                dataKey="xpTerkumpul"
                stroke="#b45309"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#xpAreaOnly)"
                dot={{ r: 4, fill: '#d97706', strokeWidth: 2, stroke: '#ffffff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {activeView === 'quiz' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={quizData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="rangkap"
                tick={{ fontSize: 12, fill: '#64748b' }}
                interval={0}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: '#64748b' }}
                label={{ value: 'Ketepatan Skor (%)', angle: -90, position: 'insideLeft', offset: 15, style: { fontSize: 11, fill: '#065f46' } }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontSize: '12px'
                }}
                formatter={(val: any, _name?: any, item?: any) => [
                  `${val}% (${item?.payload?.skor ?? 0}/${item?.payload?.markahPenuh ?? 5} Soalan Betul)`,
                  item?.payload?.tajuk ?? 'Kefahaman Rangkap'
                ]}
              />
              <ReferenceLine
                y={80}
                stroke="#10b981"
                strokeDasharray="3 3"
                label={{ value: 'Sasaran Cemerlang (80%)', fill: '#047857', fontSize: 11 }}
              />
              <Bar
                dataKey="peratus"
                name="Skor Rangkap (%)"
                fill="#059669"
                radius={[8, 8, 0, 0]}
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Helpful Pedagogical Footer Note */}
      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-500 gap-2">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Setiap jawapan betul menambah <strong>+10 XP</strong> dan setiap penyelesaian kuiz rangkap menyumbang <strong>+35 XP</strong>.</span>
        </span>
        <span className="text-[11px] font-mono text-slate-400">
          Graf dikemas kini secara automatik mengikut kemajuan murid
        </span>
      </div>
    </div>
  );
};
