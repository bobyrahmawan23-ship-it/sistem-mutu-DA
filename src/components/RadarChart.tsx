import React, { useState } from 'react';
import { CRITERIA_DEFINITIONS, QUALITY_CATEGORIES } from '../data/criteriaData';
import { CriterionScore } from '../types/competency';

interface RadarChartProps {
  primaryScores: CriterionScore[];
  primaryLabel?: string;
  primaryColor?: string;
  secondaryScores?: CriterionScore[];
  secondaryLabel?: string;
  secondaryColor?: string;
  benchmarkScores?: CriterionScore[];
  benchmarkLabel?: string;
  size?: number;
  showLegend?: boolean;
  interactive?: boolean;
  onSelectCriterion?: (criterionId: string) => void;
  selectedCriterionId?: string | null;
}

export const RadarChart: React.FC<RadarChartProps> = ({
  primaryScores,
  primaryLabel = 'Nilai Guru',
  primaryColor = '#059669', // Emerald 600
  secondaryScores,
  secondaryLabel = 'Evaluasi Diri (Self)',
  secondaryColor = '#0284c7', // Sky 600
  benchmarkScores,
  benchmarkLabel = 'Rata-Rata Lembaga (Benchmark)',
  size = 460,
  showLegend = true,
  interactive = true,
  onSelectCriterion,
  selectedCriterionId,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [showSecondary, setShowSecondary] = useState(true);
  const [showBenchmark, setShowBenchmark] = useState(true);

  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.36; // leave room for axis text
  const totalAxes = CRITERIA_DEFINITIONS.length; // 9 criteria

  // Compute angles for each criterion
  const getCoordinates = (index: number, value: number, maxVal = 100) => {
    const angle = (index * 2 * Math.PI) / totalAxes - Math.PI / 2;
    const r = (value / maxVal) * radius;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    return { x, y, angle };
  };

  // Build polygons
  const buildPolygonPoints = (scoresList: CriterionScore[]) => {
    return CRITERIA_DEFINITIONS.map((crit, idx) => {
      const match = scoresList.find((s) => s.criterionId === crit.id);
      const val = match ? Math.max(0, Math.min(100, match.score)) : 0;
      const { x, y } = getCoordinates(idx, val);
      return `${x},${y}`;
    }).join(' ');
  };

  // Concentric polygon web rings (20, 40, 60, 80, 100)
  const webLevels = [20, 40, 60, 80, 100];

  const primaryPoints = buildPolygonPoints(primaryScores);
  const secondaryPoints = secondaryScores ? buildPolygonPoints(secondaryScores) : '';
  const benchmarkPoints = benchmarkScores ? buildPolygonPoints(benchmarkScores) : '';

  return (
    <div className="flex flex-col items-center select-none w-full">
      {/* Legend & Series toggles */}
      {showLegend && (
        <div className="flex flex-wrap items-center justify-center gap-3 mb-2 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 font-medium">
            <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block"></span>
            <span>{primaryLabel}</span>
          </div>

          {secondaryScores && (
            <button
              type="button"
              onClick={() => setShowSecondary(!showSecondary)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                showSecondary
                  ? 'bg-sky-50 border-sky-300 text-sky-900 font-medium shadow-xs'
                  : 'bg-gray-100 border-gray-200 text-gray-400 line-through'
              }`}
              title="Klik untuk tampilkan/sembunyikan perbandingan"
            >
              <span className="w-3 h-3 rounded-full bg-sky-500 inline-block"></span>
              <span>{secondaryLabel}</span>
            </button>
          )}

          {benchmarkScores && (
            <button
              type="button"
              onClick={() => setShowBenchmark(!showBenchmark)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                showBenchmark
                  ? 'bg-amber-50 border-amber-300 text-amber-900 font-medium shadow-xs'
                  : 'bg-gray-100 border-gray-200 text-gray-400 line-through'
              }`}
              title="Klik untuk tampilkan/sembunyikan benchmark lembaga"
            >
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block border border-dashed border-amber-700"></span>
              <span>{benchmarkLabel}</span>
            </button>
          )}
        </div>
      )}

      {/* SVG Canvas */}
      <div className="relative w-full flex justify-center">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full max-w-[480px] h-auto drop-shadow-sm transition-all"
        >
          <defs>
            {/* Gradients */}
            <radialGradient id="radarBgGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f0fdf4" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.2" />
            </radialGradient>
            <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={primaryColor} stopOpacity="0.45" />
              <stop offset="100%" stopColor={primaryColor} stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id="secondaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={secondaryColor} stopOpacity="0.35" />
              <stop offset="100%" stopColor={secondaryColor} stopOpacity="0.10" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#059669" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Background circle */}
          <circle cx={cx} cy={cy} r={radius} fill="url(#radarBgGrad)" />

          {/* Concentric grid rings */}
          {webLevels.map((lvl) => {
            const pts = CRITERIA_DEFINITIONS.map((_, i) => {
              const { x, y } = getCoordinates(i, lvl);
              return `${x},${y}`;
            }).join(' ');

            return (
              <g key={`ring-${lvl}`}>
                <polygon
                  points={pts}
                  fill="none"
                  stroke={lvl === 100 ? '#10b981' : lvl === 60 ? '#f59e0b' : '#e2e8f0'}
                  strokeWidth={lvl === 100 ? '1.5' : lvl === 60 ? '1.2' : '0.75'}
                  strokeDasharray={lvl === 60 ? '3,3' : 'none'}
                  strokeOpacity={lvl === 100 ? 0.6 : 0.8}
                />
                {/* Level indicator tag */}
                <text
                  x={cx + 4}
                  y={cy - (lvl / 100) * radius + 3}
                  fontSize="9"
                  fill="#94a3b8"
                  fontWeight="500"
                >
                  {lvl}
                </text>
              </g>
            );
          })}

          {/* Radial axis lines */}
          {CRITERIA_DEFINITIONS.map((crit, idx) => {
            const { x, y } = getCoordinates(idx, 100);
            const isHovered = hoveredIdx === idx || selectedCriterionId === crit.id;

            return (
              <g key={`axis-${crit.id}`}>
                <line
                  x1={cx}
                  y1={cy}
                  x2={x}
                  y2={y}
                  stroke={isHovered ? '#059669' : '#cbd5e1'}
                  strokeWidth={isHovered ? '2' : '1'}
                  strokeDasharray={isHovered ? 'none' : '2,2'}
                />
              </g>
            );
          })}

          {/* Secondary Series Polygon (Self Assessment or Previous) */}
          {secondaryScores && showSecondary && (
            <g className="transition-opacity duration-300">
              <polygon
                points={secondaryPoints}
                fill="url(#secondaryGrad)"
                stroke={secondaryColor}
                strokeWidth="2"
                strokeDasharray="4,3"
                opacity="0.85"
              />
            </g>
          )}

          {/* Benchmark Series Polygon */}
          {benchmarkScores && showBenchmark && (
            <g className="transition-opacity duration-300">
              <polygon
                points={benchmarkPoints}
                fill="#f59e0b"
                fillOpacity="0.08"
                stroke="#d97706"
                strokeWidth="1.75"
                strokeDasharray="3,3"
              />
            </g>
          )}

          {/* Primary Series Polygon (Evaluated Teacher) */}
          <polygon
            points={primaryPoints}
            fill="url(#primaryGrad)"
            stroke={primaryColor}
            strokeWidth="2.5"
            filter="url(#glow)"
            className="transition-all duration-300"
          />

          {/* Benchmark node circles */}
          {benchmarkScores &&
            showBenchmark &&
            CRITERIA_DEFINITIONS.map((crit, idx) => {
              const match = benchmarkScores.find((s) => s.criterionId === crit.id);
              const val = match?.score ?? 0;
              const { x, y } = getCoordinates(idx, val);
              return (
                <circle
                  key={`bm-node-${crit.id}`}
                  cx={x}
                  cy={y}
                  r="3"
                  fill="#d97706"
                  stroke="#ffffff"
                  strokeWidth="1.2"
                />
              );
            })}

          {/* Secondary node circles */}
          {secondaryScores &&
            showSecondary &&
            CRITERIA_DEFINITIONS.map((crit, idx) => {
              const match = secondaryScores.find((s) => s.criterionId === crit.id);
              const val = match?.score ?? 0;
              const { x, y } = getCoordinates(idx, val);
              return (
                <circle
                  key={`sec-node-${crit.id}`}
                  cx={x}
                  cy={y}
                  r="3.5"
                  fill={secondaryColor}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              );
            })}

          {/* Primary node circles (interactive) */}
          {CRITERIA_DEFINITIONS.map((crit, idx) => {
            const match = primaryScores.find((s) => s.criterionId === crit.id);
            const val = match ? match.score : 0;
            const { x, y } = getCoordinates(idx, val);
            const isHovered = hoveredIdx === idx || selectedCriterionId === crit.id;

            return (
              <g
                key={`primary-node-${crit.id}`}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => onSelectCriterion && onSelectCriterion(crit.id)}
              >
                {/* Larger invisible hover target */}
                <circle cx={x} cy={y} r="12" fill="transparent" />
                {/* Visual node */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? '6.5' : '4.5'}
                  fill={isHovered ? '#10b981' : primaryColor}
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="transition-all duration-150 shadow-sm"
                />
              </g>
            );
          })}

          {/* Axis Labels Around Perimeter */}
          {CRITERIA_DEFINITIONS.map((crit, idx) => {
            const { x, y, angle } = getCoordinates(idx, 100);
            const offset = 26;
            const lx = cx + (radius + offset) * Math.cos(angle);
            const ly = cy + (radius + offset) * Math.sin(angle);

            const isHovered = hoveredIdx === idx || selectedCriterionId === crit.id;
            const matchScore = primaryScores.find((s) => s.criterionId === crit.id)?.score ?? 0;

            // Anchor logic
            let textAnchor: 'start' | 'middle' | 'end' = 'middle';
            if (Math.cos(angle) > 0.3) textAnchor = 'start';
            else if (Math.cos(angle) < -0.3) textAnchor = 'end';

            return (
              <g
                key={`label-${crit.id}`}
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => onSelectCriterion && onSelectCriterion(crit.id)}
              >
                <text
                  x={lx}
                  y={ly - 2}
                  textAnchor={textAnchor}
                  fontSize="10"
                  fontWeight={isHovered ? '700' : '600'}
                  fill={isHovered ? '#047857' : '#1e293b'}
                  className="transition-colors"
                >
                  {crit.code}. {crit.shortName}
                </text>
                <text
                  x={lx}
                  y={ly + 10}
                  textAnchor={textAnchor}
                  fontSize="9.5"
                  fontWeight="700"
                  fill={
                    matchScore >= 89
                      ? '#059669'
                      : matchScore >= 76
                      ? '#0d9488'
                      : matchScore >= 60
                      ? '#d97706'
                      : '#e11d48'
                  }
                >
                  {matchScore} Pts
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredIdx !== null && (
          <div
            className="absolute top-2 right-2 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-emerald-200 shadow-xl max-w-xs text-xs z-20 pointer-events-none transition-all"
          >
            <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-1.5 mb-1.5">
              <span className="font-bold text-gray-900">
                {CRITERIA_DEFINITIONS[hoveredIdx].code} - {CRITERIA_DEFINITIONS[hoveredIdx].name}
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                Bobot {CRITERIA_DEFINITIONS[hoveredIdx].weight}%
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Nilai Supervisi:</span>
                <span className="font-bold text-emerald-700 text-sm">
                  {primaryScores.find((s) => s.criterionId === CRITERIA_DEFINITIONS[hoveredIdx].id)?.score ?? '-'} / 100
                </span>
              </div>

              {secondaryScores && showSecondary && (
                <div className="flex justify-between items-center text-sky-700">
                  <span>Evaluasi Diri Guru:</span>
                  <span className="font-semibold">
                    {secondaryScores.find((s) => s.criterionId === CRITERIA_DEFINITIONS[hoveredIdx].id)?.score ?? '-'}
                  </span>
                </div>
              )}

              {benchmarkScores && showBenchmark && (
                <div className="flex justify-between items-center text-amber-700">
                  <span>Benchmark Lembaga:</span>
                  <span className="font-semibold">
                    {benchmarkScores.find((s) => s.criterionId === CRITERIA_DEFINITIONS[hoveredIdx].id)?.score ?? '-'}
                  </span>
                </div>
              )}
            </div>

            <p className="text-[11px] text-gray-500 mt-2 italic leading-tight">
              {CRITERIA_DEFINITIONS[hoveredIdx].description}
            </p>
          </div>
        )}
      </div>

      <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-1.5">
        <span>💡 Klik nama indikator atau titik untuk melihat detail rubrik & rekomendasi</span>
      </div>
    </div>
  );
};
