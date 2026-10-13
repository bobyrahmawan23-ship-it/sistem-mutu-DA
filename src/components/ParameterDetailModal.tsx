import React, { useState } from 'react';
import { CriterionDefinition, EvaluationRecord, TeacherProfile, CriterionScore } from '../types/competency';
import { QUALITY_CATEGORIES } from '../data/criteriaData';
import { exportElementAsPng, exportParameterToWordDoc, shareParameterReport } from '../utils/exportUtils';
import {
  X,
  Share2,
  Image as ImageIcon,
  FileText,
  FileDown,
  Printer,
  Sparkles,
  Award,
  CheckCircle2,
  TrendingUp,
  Sliders,
  Check,
} from 'lucide-react';

interface ParameterDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  criterion: CriterionDefinition;
  teacher: TeacherProfile;
  evaluation: EvaluationRecord;
  benchmarkScore: number;
  allEvaluations: EvaluationRecord[];
}

export const ParameterDetailModal: React.FC<ParameterDetailModalProps> = ({
  isOpen,
  onClose,
  criterion,
  teacher,
  evaluation,
  benchmarkScore,
  allEvaluations,
}) => {
  if (!isOpen) return null;

  const [isCopied, setIsCopied] = useState(false);
  const [isExportingImg, setIsExportingImg] = useState(false);

  const scoreObj = evaluation.scores.find((s) => s.criterionId === criterion.id);
  const currentScore = scoreObj ? scoreObj.score : 0;
  const notes = scoreObj?.notes;

  const catMeta =
    currentScore >= 89
      ? QUALITY_CATEGORIES.MUMTAZ
      : currentScore >= 76
      ? QUALITY_CATEGORIES.JAYYID_JIDDAN
      : currentScore >= 60
      ? QUALITY_CATEGORIES.JAYYID
      : QUALITY_CATEGORIES.MAQBUL;

  // History for this parameter
  const parameterHistory = allEvaluations
    .filter((e) => e.teacherId === teacher.id)
    .map((e) => {
      const match = e.scores.find((s) => s.criterionId === criterion.id);
      return {
        period: e.periodName,
        score: match ? match.score : 0,
        date: e.evaluationDate,
      };
    })
    .reverse();

  // Export handlers
  const handleExportPng = async () => {
    setIsExportingImg(true);
    await exportElementAsPng(
      'parameter-svg-card',
      `Grafik_${criterion.code}_${teacher.name.replace(/\s+/g, '_')}`
    );
    setIsExportingImg(false);
  };

  const handleExportWord = () => {
    exportParameterToWordDoc({
      criterion,
      teacher,
      evaluation,
      score: currentScore,
      notes,
    });
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const handleShareMobile = async () => {
    const textMsg = `*Hasil Penilaian Kompetensi Guru Al-Qur'an MTQ Darul Abidin*\n\n` +
      `Nama Guru: ${teacher.name}, ${teacher.title} (${teacher.unit})\n` +
      `Parameter: ${criterion.code} - ${criterion.name}\n` +
      `Skor: ${currentScore}/100 (${catMeta.label} - ${catMeta.arabicLabel})\n` +
      `Rata-Rata Lembaga: ${benchmarkScore} Pts\n` +
      `Sub-Aspek: ${criterion.focusAspects.join(', ')}\n` +
      `Rekomendasi: ${criterion.defaultRecommendation.title}`;

    const shared = await shareParameterReport({
      title: `Hasil Asesmen MTQ Darul Abidin - ${criterion.name}`,
      text: textMsg,
    });

    if (!shared) {
      // Fallback copy text
      navigator.clipboard.writeText(textMsg);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[95vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-200 font-extrabold text-sm border border-white/20">
              {criterion.code}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">{criterion.name}</h2>
                <span className="text-[10px] bg-emerald-700/80 text-emerald-100 px-2 py-0.5 rounded-full font-bold">
                  Bobot {criterion.weight}%
                </span>
              </div>
              <p className="text-xs text-emerald-100">
                Grafik Detail & Analisis Mutu Pengajaran — {teacher.name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Action Bar (Export to Photo, Word, PDF, Share) */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-bold text-slate-600 flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Bagikan / Unduh Hasil Grafik:</span>
          </span>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportPng}
              disabled={isExportingImg}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="Unduh grafik sebagai gambar Foto (PNG)"
            >
              <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isExportingImg ? 'Memproses...' : 'Foto (PNG)'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrintPdf}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="Cetak atau Simpan PDF"
            >
              <Printer className="w-3.5 h-3.5 text-teal-600" />
              <span>PDF</span>
            </button>

            <button
              type="button"
              onClick={handleExportWord}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-sky-500 hover:bg-sky-50 text-slate-700 font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="Unduh laporan lengkap dalam format Word (.doc/.docx)"
            >
              <FileDown className="w-3.5 h-3.5 text-sky-600" />
              <span>Word (.docx)</span>
            </button>

            <button
              type="button"
              onClick={handleShareMobile}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="Bagikan ke WhatsApp atau copy ringkasan"
            >
              {isCopied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'Tersalin!' : 'Bagikan ke HP'}</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-800">
          {/* Card to be converted to PNG/Printed */}
          <div
            id="parameter-svg-card-wrapper"
            className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 shadow-xs space-y-5"
          >
            {/* Top Score Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                  Capaian Guru
                </span>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900">
                    {currentScore}
                    <span className="text-sm text-slate-400 font-medium"> / 100</span>
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-extrabold border ${catMeta.badgeBg}`}
                  >
                    {catMeta.label} ({catMeta.arabicLabel})
                  </span>
                </div>
              </div>

              <div className="text-left sm:text-right bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Benchmark MTQ Lembaga
                </span>
                <span className="text-lg font-black text-amber-700">{benchmarkScore} Pts</span>
                <span className="text-[10px] block text-slate-500">
                  Selisih:{' '}
                  <strong
                    className={
                      currentScore >= benchmarkScore ? 'text-emerald-700' : 'text-rose-700'
                    }
                  >
                    {currentScore >= benchmarkScore ? `+${currentScore - benchmarkScore}` : `${currentScore - benchmarkScore}`} Pts
                  </strong>
                </span>
              </div>
            </div>

            {/* SVG Visual Graphic for this specific parameter */}
            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Grafik Komparasi Nilai & Ambang Mutu</span>
                <span className="text-[10px] text-emerald-700 font-normal">
                  Grafik Vektor Resolusi Tinggi
                </span>
              </h4>

              <svg
                id="parameter-svg-card"
                viewBox="0 0 540 140"
                className="w-full h-auto drop-shadow-xs"
              >
                <defs>
                  <linearGradient id="paramBarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#059669" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>

                {/* Background track */}
                <rect x="20" y="30" width="500" height="28" rx="14" fill="#f1f5f9" />

                {/* Score bar */}
                <rect
                  x="20"
                  y="30"
                  width={Math.max(10, (currentScore / 100) * 500)}
                  height="28"
                  rx="14"
                  fill="url(#paramBarGrad)"
                />

                {/* Benchmark line */}
                <line
                  x1={20 + (benchmarkScore / 100) * 500}
                  y1="22"
                  x2={20 + (benchmarkScore / 100) * 500}
                  y2="66"
                  stroke="#d97706"
                  strokeWidth="3"
                  strokeDasharray="3,2"
                />

                {/* Mumtaz threshold line (89) */}
                <line
                  x1={20 + 0.89 * 500}
                  y1="26"
                  x2={20 + 0.89 * 500}
                  y2="62"
                  stroke="#10b981"
                  strokeWidth="1.5"
                  strokeDasharray="2,2"
                />

                {/* Text markers */}
                <text x="20" y="80" fontSize="10" fill="#94a3b8" fontWeight="600">
                  0 (Kurang)
                </text>
                <text x="320" y="80" fontSize="10" fill="#94a3b8" fontWeight="600">
                  60 (Cukup)
                </text>
                <text x="400" y="80" fontSize="10" fill="#94a3b8" fontWeight="600">
                  76 (Bermutu)
                </text>
                <text x="465" y="80" fontSize="10" fill="#059669" fontWeight="700">
                  89 (Mumtaz)
                </text>

                {/* Benchmark tag */}
                <text
                  x={20 + (benchmarkScore / 100) * 500}
                  y="18"
                  fontSize="9.5"
                  fill="#b45309"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  Benchmark ({benchmarkScore})
                </text>

                {/* Current Score bubble */}
                <text
                  x={Math.min(480, Math.max(50, 20 + (currentScore / 100) * 500 - 10))}
                  y="48"
                  fontSize="12"
                  fill="#ffffff"
                  fontWeight="900"
                  textAnchor="middle"
                >
                  {currentScore}
                </text>
              </svg>
            </div>

            {/* Historical Progress Trend for this exact parameter */}
            {parameterHistory.length > 1 && (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Histori Nilai {criterion.shortName} Lintas Semester:</span>
                </h4>
                <div className="flex items-center gap-3 overflow-x-auto py-1">
                  {parameterHistory.map((item, i) => (
                    <div
                      key={i}
                      className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs shrink-0 min-w-[130px]"
                    >
                      <span className="text-[10px] text-slate-400 block">{item.period}</span>
                      <div className="text-base font-extrabold text-slate-900 mt-0.5">
                        {item.score} Pts
                      </div>
                      <span className="text-[10px] text-slate-500">{item.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sub-Sub Aspek yang Dinilai (Configurable by supervisor in Settings) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-600" />
                <span>Sub-Sub Aspek yang Dinilai ({criterion.focusAspects.length} Aspek):</span>
              </h3>
              <span className="text-[11px] text-slate-400">
                Dapat disesuaikan di menu Pengaturan
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {criterion.focusAspects.map((aspect, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-emerald-100 bg-emerald-50/50 flex items-center gap-2.5 text-xs font-medium text-slate-800"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{aspect}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Notes & Rubrik Deskriptor */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <span className="font-bold text-slate-800">Catatan Kualitatif Supervisor:</span>
            <p className="text-slate-700 italic bg-white p-2.5 rounded-lg border border-slate-200">
              "{notes || 'Belum ada catatan kualitatif khusus untuk kriteria ini.'}"
            </p>
          </div>

          {/* Actionable Recommendation */}
          <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200 space-y-1.5 text-xs text-amber-950">
            <div className="flex items-center gap-2 font-bold">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Rekomendasi Peningkatan Mutu MTQ:</span>
            </div>
            <strong className="block text-slate-900">
              {criterion.defaultRecommendation.title}
            </strong>
            <p className="text-slate-700">{criterion.defaultRecommendation.action}</p>
            <div className="text-[11px] text-amber-800 pt-1 flex gap-3">
              <span>⏱️ Durasi: {criterion.defaultRecommendation.duration}</span>
              <span>🎯 Target: {criterion.defaultRecommendation.targetMilestone}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-white hover:bg-slate-900 transition-colors cursor-pointer"
          >
            Tutup Pratinjau
          </button>
        </div>
      </div>
    </div>
  );
};
