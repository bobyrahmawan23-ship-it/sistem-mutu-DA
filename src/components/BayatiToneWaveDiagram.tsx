import React from 'react';
import { TrendingUp, ArrowRight, Music, Activity } from 'lucide-react';

export const BAYATI_TONE_CYCLE = [
  {
    step: 1,
    name: 'Naik',
    arabic: 'صاعد (Naik)',
    direction: '↗',
    color: '#059669', // Emerald
    bgColor: 'bg-emerald-50 border-emerald-300 text-emerald-900',
    description: 'Mengawali bacaan dengan nada terangkat (menanjak), menguatkan intonasi pembuka ayat.',
    yLevel: 35,
  },
  {
    step: 2,
    name: 'Datar',
    arabic: 'مستو (Datar)',
    direction: '➡️',
    color: '#0284c7', // Sky
    bgColor: 'bg-sky-50 border-sky-300 text-sky-900',
    description: 'Menjaga kestabilan tempo bacaan, ketukan mad thabi\'i tetap tenang dan konsisten.',
    yLevel: 55,
  },
  {
    step: 3,
    name: 'Miring',
    arabic: 'مائل (Miring)',
    direction: '↘',
    color: '#d97706', // Amber
    bgColor: 'bg-amber-50 border-amber-300 text-amber-900',
    description: 'Cengkok khas irama Bayati, meliuk miring condong memberikan variasi estetika tilawah.',
    yLevel: 75,
  },
  {
    step: 4,
    name: 'Naik',
    arabic: 'صاعد (Naik)',
    direction: '↗',
    color: '#059669', // Emerald
    bgColor: 'bg-emerald-50 border-emerald-300 text-emerald-900',
    description: 'Mengangkat kembali nada ke tingkatan nada tinggi (Jawab) untuk penghayatan makna.',
    yLevel: 25,
  },
  {
    step: 5,
    name: 'Datar',
    arabic: 'مستو (Datar)',
    direction: '➡️',
    color: '#0284c7', // Sky
    bgColor: 'bg-sky-50 border-sky-300 text-sky-900',
    description: 'Menyeimbangkan nada tinggi agar nafas stabil sebelum penutupan akhir bait/ayat.',
    yLevel: 55,
  },
  {
    step: 6,
    name: 'Turun',
    arabic: 'هابط (Turun)',
    direction: '⬇',
    color: '#7c3aed', // Purple/Violet
    bgColor: 'bg-purple-50 border-purple-300 text-purple-900',
    description: 'Menurunkan nada kembali ke posisi Qarar (rendah tenang) untuk waqaf yang sempurna.',
    yLevel: 90,
  },
];

interface BayatiToneWaveDiagramProps {
  interactive?: boolean;
  activeStep?: number;
}

export const BayatiToneWaveDiagram: React.FC<BayatiToneWaveDiagramProps> = ({
  interactive = true,
  activeStep,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <Activity className="w-4 h-4" />
            </span>
            <h3 className="font-extrabold text-sm text-slate-900">
              Pola 6 Siklus Nada Irama Bayati MTQ Daarul Abidin
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Pola wajib: <strong>Naik &rarr; Datar &rarr; Miring &rarr; Naik &rarr; Datar &rarr; Turun</strong>
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold self-start sm:self-auto">
          <Music className="w-3.5 h-3.5" />
          <span>Standar Baku Tahfidz Daarul Abidin</span>
        </div>
      </div>

      {/* SVG Wave Visualization */}
      <div className="w-full bg-slate-50 rounded-xl p-3 border border-slate-200">
        <svg viewBox="0 0 600 130" className="w-full h-auto drop-shadow-xs">
          <defs>
            <linearGradient id="waveLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="20%" stopColor="#0284c7" />
              <stop offset="40%" stopColor="#d97706" />
              <stop offset="60%" stopColor="#059669" />
              <stop offset="80%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>

          {/* Guidelines */}
          <line x1="30" y1="30" x2="570" y2="30" stroke="#e2e8f0" strokeDasharray="3,3" strokeWidth="1" />
          <line x1="30" y1="60" x2="570" y2="60" stroke="#e2e8f0" strokeDasharray="3,3" strokeWidth="1" />
          <line x1="30" y1="95" x2="570" y2="95" stroke="#e2e8f0" strokeDasharray="3,3" strokeWidth="1" />

          {/* Level tags */}
          <text x="10" y="34" fontSize="8" fill="#94a3b8" fontWeight="600">Jawab (Tinggi)</text>
          <text x="10" y="64" fontSize="8" fill="#94a3b8" fontWeight="600">Nawa (Tengah)</text>
          <text x="10" y="99" fontSize="8" fill="#94a3b8" fontWeight="600">Qarar (Rendah)</text>

          {/* Smooth connecting curve through the 6 points */}
          {(() => {
            const points = [
              { x: 70, y: 38 },   // 1. Naik
              { x: 170, y: 58 },  // 2. Datar
              { x: 270, y: 78 },  // 3. Miring
              { x: 370, y: 28 },  // 4. Naik
              { x: 470, y: 58 },  // 5. Datar
              { x: 550, y: 98 },  // 6. Turun
            ];

            const dPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

            return (
              <>
                <path d={dPath} fill="none" stroke="url(#waveLineGrad)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                {points.map((p, i) => {
                  const node = BAYATI_TONE_CYCLE[i];
                  const isActive = activeStep === node.step;

                  return (
                    <g key={i}>
                      <circle cx={p.x} cy={p.y} r={isActive ? 9 : 7} fill={node.color} stroke="#ffffff" strokeWidth="2.5" />
                      <text x={p.x} y={p.y - 12} textAnchor="middle" fontSize="10" fontWeight="800" fill={node.color}>
                        {node.step}. {node.name}
                      </text>
                    </g>
                  );
                })}
              </>
            );
          })()}
        </svg>
      </div>

      {/* 6 Grid Steps Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {BAYATI_TONE_CYCLE.map((step) => {
          const isActive = activeStep === step.step;

          return (
            <div
              key={step.step}
              className={`p-3 rounded-xl border text-center transition-all ${step.bgColor} ${
                isActive ? 'ring-2 ring-emerald-600 shadow-xs' : ''
              }`}
            >
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="text-sm font-black">{step.direction}</span>
                <span className="text-xs font-black">{step.step}. {step.name}</span>
              </div>
              <span className="text-[10px] font-arabic block font-serif opacity-90">{step.arabic}</span>
              <p className="text-[10px] text-slate-600 mt-1 line-clamp-3 leading-tight">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
