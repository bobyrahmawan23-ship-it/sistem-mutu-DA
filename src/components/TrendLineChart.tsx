import React, { useState } from 'react';
import { CRITERIA_DEFINITIONS, QUALITY_CATEGORIES } from '../data/criteriaData';
import { CriterionScore, EvaluationRecord } from '../types/competency';
import { TrendingUp, BarChart3, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface TrendLineChartProps {
  currentEvaluation: EvaluationRecord;
  historicalEvaluations: EvaluationRecord[];
  benchmarkScores: CriterionScore[];
}

export const TrendLineChart: React.FC<TrendLineChartProps> = ({
  currentEvaluation,
  historicalEvaluations,
  benchmarkScores,
}) => {
  const [viewMode, setViewMode] = useState<'BAR_CRITERIA' | 'HISTORICAL_TREND'>('BAR_CRITERIA');

  // Sort historical from oldest to newest
  const allChronological = [...historicalEvaluations].reverse();
  // Ensure current is the latest
  if (!allChronological.some((e) => e.id === currentEvaluation.id)) {
    allChronological.push(currentEvaluation);
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            {viewMode === 'BAR_CRITERIA' ? (
              <>
                <BarChart3 className="w-5 h-5 text-emerald-600" />
                <span>Analisis Komparasi 9 Kriteria vs Rata-Rata Lembaga</span>
              </>
            ) : (
              <>
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <span>Histori Perkembangan (Progress Tracking Bulanan/Semesteran)</span>
              </>
            )}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {viewMode === 'BAR_CRITERIA'
              ? 'Membandingkan skor capaian guru per kriteria dengan benchmark MTQ Darul Abidin'
              : 'Tren nilai keseluruhan dan konsistensi mutu lintas semester'}
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('BAR_CRITERIA')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'BAR_CRITERIA'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            9 Kriteria Bar
          </button>
          <button
            type="button"
            onClick={() => setViewMode('HISTORICAL_TREND')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'HISTORICAL_TREND'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tren Semesteran
          </button>
        </div>
      </div>

      {viewMode === 'BAR_CRITERIA' ? (
        /* BAR COMPARISON VIEW */
        <div className="space-y-3.5">
          {CRITERIA_DEFINITIONS.map((crit) => {
            const scoreObj = currentEvaluation.scores.find((s) => s.criterionId === crit.id);
            const score = scoreObj ? scoreObj.score : 0;
            const benchObj = benchmarkScores.find((s) => s.criterionId === crit.id);
            const benchScore = benchObj ? benchObj.score : 75;
            const diff = Math.round((score - benchScore) * 10) / 10;

            const isMumtaz = score >= 89;
            const isJayyidJiddan = score >= 76 && score < 89;
            const isJayyid = score >= 60 && score < 76;
            const isPerlu = score < 60;

            return (
              <div key={crit.id} className="group">
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">
                      {crit.code}. {crit.shortName}
                    </span>
                    <span className="text-[10px] text-slate-400">({crit.weight}%)</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="text-slate-400 text-[11px]">
                      Benchmark: <strong className="text-slate-600">{benchScore}</strong>
                    </span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-xs ${
                        isMumtaz
                          ? 'bg-emerald-100 text-emerald-800'
                          : isJayyidJiddan
                          ? 'bg-teal-100 text-teal-800'
                          : isJayyid
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {score} Pts
                    </span>

                    <span
                      className={`text-[11px] font-semibold flex items-center min-w-[48px] justify-end ${
                        diff > 0
                          ? 'text-emerald-600'
                          : diff < 0
                          ? 'text-rose-600'
                          : 'text-slate-400'
                      }`}
                    >
                      {diff > 0 ? (
                        <>
                          <ArrowUpRight className="w-3 h-3 inline" /> +{diff}
                        </>
                      ) : diff < 0 ? (
                        <>
                          <ArrowDownRight className="w-3 h-3 inline" /> {diff}
                        </>
                      ) : (
                        <>
                          <Minus className="w-3 h-3 inline" /> 0
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Comparative bar */}
                <div className="relative h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  {/* Quality threshold background markers */}
                  <div
                    className="absolute top-0 bottom-0 border-r border-dashed border-amber-300 z-10 opacity-70"
                    style={{ left: '60%' }}
                    title="Batas Cukup (60)"
                  />
                  <div
                    className="absolute top-0 bottom-0 border-r border-dashed border-teal-300 z-10 opacity-70"
                    style={{ left: '76%' }}
                    title="Batas Bermutu (76)"
                  />
                  <div
                    className="absolute top-0 bottom-0 border-r border-dashed border-emerald-300 z-10 opacity-70"
                    style={{ left: '89%' }}
                    title="Batas Sangat Bermutu / Mumtaz (89)"
                  />

                  {/* Benchmark indicator marker */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-slate-400 z-20 shadow-xs"
                    style={{ left: `${benchScore}%` }}
                    title={`Rata-rata Lembaga: ${benchScore}`}
                  />

                  {/* Teacher Score bar */}
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isMumtaz
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                        : isJayyidJiddan
                        ? 'bg-gradient-to-r from-teal-500 to-teal-600'
                        : isJayyid
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                        : 'bg-gradient-to-r from-rose-500 to-rose-600'
                    }`}
                    style={{ width: `${Math.max(2, score)}%` }}
                  />
                </div>
              </div>
            );
          })}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Mumtaz (≥89)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span> Jayyid Jiddan (76-88)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Jayyid (60-75)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Perlu Pembinaan (&lt;60)
              </span>
            </div>
            <span className="italic">Garis abu-abu = Rata-rata lembaga</span>
          </div>
        </div>
      ) : (
        /* HISTORICAL TREND VIEW */
        <div className="space-y-6">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Kurva Perkembangan Nilai Keseluruhan (Semesteran)
            </h4>

            {/* SVG Trend Line */}
            <div className="w-full h-48 flex items-center justify-center">
              <svg viewBox="0 0 500 160" className="w-full h-full">
                <defs>
                  <linearGradient id="trendAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal gridlines */}
                {[60, 75, 88, 100].map((val) => {
                  const y = 140 - ((val - 50) / 50) * 120;
                  return (
                    <g key={val}>
                      <line
                        x1="40"
                        y1={y}
                        x2="480"
                        y2={y}
                        stroke="#e2e8f0"
                        strokeDasharray="2,2"
                        strokeWidth="1"
                      />
                      <text x="15" y={y + 3} fontSize="9" fill="#94a3b8" fontWeight="600">
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Plot points */}
                {(() => {
                  const pts = allChronological.map((rec, i) => {
                    const step = allChronological.length > 1 ? 400 / (allChronological.length - 1) : 200;
                    const x = 60 + i * step;
                    const y = 140 - ((rec.overallScore - 50) / 50) * 120;
                    return { x, y, rec };
                  });

                  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                  const areaPath = `${linePath} L ${pts[pts.length - 1].x} 140 L ${pts[0].x} 140 Z`;

                  return (
                    <>
                      <path d={areaPath} fill="url(#trendAreaGrad)" />
                      <path d={linePath} fill="none" stroke="#059669" strokeWidth="3" />

                      {pts.map((p, idx) => (
                        <g key={p.rec.id}>
                          <circle cx={p.x} cy={p.y} r="5" fill="#059669" stroke="#ffffff" strokeWidth="2" />
                          <circle cx={p.x} cy={p.y} r="8" fill="#10b981" fillOpacity="0.2" />

                          {/* Value label */}
                          <text
                            x={p.x}
                            y={p.y - 10}
                            textAnchor="middle"
                            fontSize="11"
                            fontWeight="700"
                            fill="#065f46"
                          >
                            {p.rec.overallScore}
                          </text>

                          {/* Period label */}
                          <text
                            x={p.x}
                            y="155"
                            textAnchor="middle"
                            fontSize="9"
                            fontWeight="500"
                            fill="#64748b"
                          >
                            {p.rec.periodName.replace('Semester ', 'Sem ')}
                          </text>
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>
          </div>

          {/* Historical Table Log */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-3 py-2 rounded-l-lg">Periode Evaluasi</th>
                  <th className="px-3 py-2">Tanggal</th>
                  <th className="px-3 py-2">Skor Rata-Rata</th>
                  <th className="px-3 py-2">Predikat Mutu</th>
                  <th className="px-3 py-2 rounded-r-lg">Catatan Supervisor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allChronological.map((item, idx) => {
                  const cat = QUALITY_CATEGORIES[item.qualityCategory];
                  const prev = idx > 0 ? allChronological[idx - 1] : null;
                  const delta = prev
                    ? Math.round((item.overallScore - prev.overallScore) * 10) / 10
                    : null;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70">
                      <td className="px-3 py-2.5 font-bold text-slate-900">{item.periodName}</td>
                      <td className="px-3 py-2.5 text-slate-500">{item.evaluationDate}</td>
                      <td className="px-3 py-2.5 font-bold text-slate-800">
                        {item.overallScore}
                        {delta !== null && (
                          <span
                            className={`ml-1.5 text-[10px] ${
                              delta >= 0 ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'
                            }`}
                          >
                            ({delta >= 0 ? `+${delta}` : delta})
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${cat.badgeBg}`}
                        >
                          {cat.label}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-slate-600 italic max-w-xs truncate">
                        "{item.supervisorNotes}"
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
