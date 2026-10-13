import React, { useState, useRef } from 'react';
import { CriterionDefinition, EvaluationRecord, TeacherProfile, CriterionScore } from '../types/competency';
import { CRITERIA_DEFINITIONS, QUALITY_CATEGORIES } from '../data/criteriaData';
import { RadarChart } from './RadarChart';
import { getStoredReportConfig } from '../types/reportConfig';
import { generateTeacherChartsPdf, captureElementAsImage } from '../utils/pdfExportUtils';
import jsPDF from 'jspdf';
import {
  X,
  FileDown,
  Printer,
  Sparkles,
  Check,
  Loader2,
  Sliders,
  Award,
  BarChart3,
  TrendingUp,
  GraduationCap,
  Info,
} from 'lucide-react';

interface TeacherChartExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: TeacherProfile;
  evaluation: EvaluationRecord;
  benchmarkScores?: CriterionScore[];
  criteria: CriterionDefinition[];
}

export const TeacherChartExportModal: React.FC<TeacherChartExportModalProps> = ({
  isOpen,
  onClose,
  teacher,
  evaluation,
  benchmarkScores = [],
  criteria,
}) => {
  if (!isOpen) return null;

  const [includeRadar, setIncludeRadar] = useState(true);
  const [includeBar, setIncludeBar] = useState(true);
  const [includeTable, setIncludeTable] = useState(true);
  const [includeRecommendations, setIncludeRecommendations] = useState(true);
  const [includeSignatures, setIncludeSignatures] = useState(true);

  const [isExporting, setIsExporting] = useState(false);
  const [progressMsg, setProgressMsg] = useState<string>('');
  const [exportSuccess, setExportSuccess] = useState(false);

  const previewRef = useRef<HTMLDivElement>(null);
  const config = getStoredReportConfig();
  const categoryMeta = QUALITY_CATEGORIES[evaluation.qualityCategory];

  const handleDownloadPdf = async () => {
    if (!previewRef.current) return;
    setIsExporting(true);
    setProgressMsg('Menyiapkan kanvas grafik resolusi tinggi...');

    try {
      // Use html2canvas to capture the entire styled preview container
      setProgressMsg('Merender elemen grafik (Radar & Bar) dengan html2canvas...');
      const { dataUrl, width, height } = await captureElementAsImage(previewRef.current, {
        scale: 2.5,
        backgroundColor: '#ffffff',
      });

      setProgressMsg('Menyusun halaman PDF dengan jsPDF...');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 8;
      const printableWidth = pageWidth - margin * 2;
      const renderedHeight = (height * printableWidth) / width;

      if (renderedHeight <= pageHeight - margin * 2) {
        pdf.addImage(dataUrl, 'PNG', margin, margin, printableWidth, renderedHeight, undefined, 'FAST');
      } else {
        // Multi-page slicing if content exceeds single A4 page
        let positionY = 0;
        let remainingHeight = renderedHeight;
        const contentHeightPerPage = pageHeight - margin * 2;

        while (remainingHeight > 0) {
          pdf.addImage(
            dataUrl,
            'PNG',
            margin,
            margin - positionY,
            printableWidth,
            renderedHeight,
            undefined,
            'FAST'
          );

          remainingHeight -= contentHeightPerPage;
          positionY += contentHeightPerPage;

          if (remainingHeight > 0) {
            pdf.addPage();
          }
        }
      }

      const safeFilename = `Laporan_Grafik_${teacher.name.replace(/\s+/g, '_')}_${evaluation.periodName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      setProgressMsg('Mengunduh berkas PDF...');
      pdf.save(safeFilename);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Terjadi kesalahan saat membuat file PDF. Silakan gunakan tombol Cetak Langsung.');
    } finally {
      setIsExporting(false);
      setProgressMsg('');
    }
  };

  const handleNativePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[96vh] flex flex-col">
        {/* Modal Top Control Bar */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0 print:hidden gap-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <BarChart3 className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Ekspor & Cetak PDF Grafik (Radar & Bar Chart)</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 font-mono px-2 py-0.5 rounded-full border border-emerald-800">
                  jsPDF + html2canvas
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Guru: <strong className="text-slate-200">{teacher.name}, {teacher.title}</strong> • NIP: {teacher.nip}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {exportSuccess && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-950/70 px-2.5 py-1 rounded-lg border border-emerald-800 animate-fade-in">
                <Check className="w-3.5 h-3.5" /> Berhasil Diunduh!
              </span>
            )}

            <button
              type="button"
              onClick={handleNativePrint}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Cetak lewat peramban (Ctrl+P)"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cetak Print</span>
            </button>

            <button
              type="button"
              disabled={isExporting}
              onClick={handleDownloadPdf}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{progressMsg || 'Membuat PDF...'}</span>
                </>
              ) : (
                <>
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Download PDF (jsPDF)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Option Checkbox Toolbar */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 print:hidden">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-bold text-slate-700 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-emerald-700" /> Sertakan dalam PDF:
            </span>

            <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 hover:text-slate-900">
              <input
                type="checkbox"
                checked={includeRadar}
                onChange={(e) => setIncludeRadar(e.target.checked)}
                className="rounded accent-emerald-600 cursor-pointer"
              />
              <span>Grafik Radar Spider</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 hover:text-slate-900">
              <input
                type="checkbox"
                checked={includeBar}
                onChange={(e) => setIncludeBar(e.target.checked)}
                className="rounded accent-emerald-600 cursor-pointer"
              />
              <span>Grafik Bar & Benchmark</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 hover:text-slate-900">
              <input
                type="checkbox"
                checked={includeTable}
                onChange={(e) => setIncludeTable(e.target.checked)}
                className="rounded accent-emerald-600 cursor-pointer"
              />
              <span>Tabel Skor 9 Indikator</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 hover:text-slate-900">
              <input
                type="checkbox"
                checked={includeRecommendations}
                onChange={(e) => setIncludeRecommendations(e.target.checked)}
                className="rounded accent-emerald-600 cursor-pointer"
              />
              <span>Pilar & Rekomendasi</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 hover:text-slate-900">
              <input
                type="checkbox"
                checked={includeSignatures}
                onChange={(e) => setIncludeSignatures(e.target.checked)}
                className="rounded accent-emerald-600 cursor-pointer"
              />
              <span>Tanda Tangan (Mudir & Supervisor)</span>
            </label>
          </div>

          <div className="text-[11px] text-slate-500 italic hidden lg:block">
            Dokumen terformat pas standar kertas A4
          </div>
        </div>

        {/* Printable & Capturable Preview Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 flex justify-center">
          <div
            ref={previewRef}
            id="printable-teacher-charts-container"
            className="w-full max-w-[820px] bg-white shadow-lg rounded-xl p-8 sm:p-10 text-slate-900 space-y-6 border border-slate-200"
            style={{ minHeight: '1100px' }}
          >
            {/* 1. Institutional KOP Header */}
            <div className="border-b-2 border-emerald-800 pb-4 text-center relative">
              <div className="flex items-center justify-center gap-3.5 mb-1.5">
                <div className="w-12 h-12 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-lg font-serif shrink-0 shadow-xs">
                  {config.logoInitials}
                </div>
                <div className="text-left">
                  <h1 className="text-xl font-black uppercase tracking-wide text-emerald-950 font-serif">
                    {config.institutionName}
                  </h1>
                  <p className="text-xs font-semibold text-slate-700">{config.institutionSub}</p>
                  <p className="text-[10px] text-slate-400">{config.institutionContact}</p>
                </div>
              </div>
              <div className="mt-2 inline-block px-4 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-extrabold text-emerald-900">
                LAPORAN VISUALISASI GRAFIK MUTU & KOMPETENSI GURU AL-QUR'AN
              </div>
            </div>

            {/* 2. Teacher Bio & Period Card */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nama Pendidik:</span>
                  <span className="font-bold text-slate-900">{teacher.name}, {teacher.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">NIP / ID Guru:</span>
                  <span className="font-mono font-medium text-slate-700">{teacher.nip}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Unit & Kelas:</span>
                  <span className="font-medium text-slate-800">{teacher.unit} ({teacher.teachingClass})</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Periode Penilaian:</span>
                  <span className="font-bold text-emerald-800">{evaluation.periodName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tanggal Asesmen:</span>
                  <span className="font-medium text-slate-700">{evaluation.evaluationDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Hafalan & Maqdis:</span>
                  <span className="font-medium text-slate-800">
                    {teacher.hafalanCountJuz} Juz Mutqin | {teacher.certifiedMaqdis ? 'Tersertifikasi' : 'Belum'}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Overall Quality Badge Showcase */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-xl bg-emerald-700 text-white flex flex-col items-center justify-center shadow-md shrink-0">
                  <span className="text-2xl font-black leading-none">{evaluation.overallScore}</span>
                  <span className="text-[8px] uppercase tracking-wider font-semibold mt-0.5">Skor Akhir</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold block">Predikat Kualitas Kompetensi:</span>
                  <h3 className="text-base font-bold text-slate-900">
                    {categoryMeta.label}{' '}
                    <span className="text-emerald-700 font-serif">({categoryMeta.arabicLabel})</span>
                  </h3>
                  <p className="text-[11px] text-slate-600 mt-0.5">{categoryMeta.description}</p>
                </div>
              </div>

              <div className="text-right shrink-0 text-xs">
                <span className="text-[10px] text-slate-400 block">{config.supervisorTitle}:</span>
                <span className="font-bold text-slate-800">{config.supervisorName || evaluation.evaluatorName}</span>
                <span className="text-[10px] block text-emerald-700 font-medium">({config.supervisorNip})</span>
              </div>
            </div>

            {/* 4. Dual Graphical Showcase (Radar Chart + Bar Chart side-by-side or stacked) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              {/* Radar Chart */}
              {includeRadar && (
                <div className="border border-slate-200 rounded-xl p-4 bg-white flex flex-col items-center shadow-2xs">
                  <div className="w-full border-b border-slate-100 pb-2 mb-2 text-center">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      1. Poligon Radar 9-Axis
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      Profil keseimbangan penguasaan pada 9 parameter
                    </p>
                  </div>
                  <div className="w-full flex justify-center overflow-hidden">
                    <RadarChart
                      primaryScores={evaluation.scores}
                      primaryLabel={teacher.name}
                      benchmarkScores={benchmarkScores}
                      benchmarkLabel="Benchmark MTQ"
                      size={340}
                      showLegend={true}
                      interactive={false}
                    />
                  </div>
                </div>
              )}

              {/* Bar Chart: Comparison vs Benchmark */}
              {includeBar && (
                <div className="border border-slate-200 rounded-xl p-4 bg-white flex flex-col shadow-2xs">
                  <div className="w-full border-b border-slate-100 pb-2 mb-3 text-center">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      2. Diagram Batang (Bar) & Benchmark
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      Skor guru (hijau) vs rata-rata lembaga MTQ (garis oranye)
                    </p>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    {CRITERIA_DEFINITIONS.map((crit) => {
                      const scoreItem = evaluation.scores.find((s) => s.criterionId === crit.id);
                      const score = scoreItem ? scoreItem.score : 0;
                      const bm = benchmarkScores.find((b) => b.criterionId === crit.id)?.score ?? 75;

                      const isMumtaz = score >= 89;
                      const isJayyidJiddan = score >= 76 && score < 89;
                      const isJayyid = score >= 60 && score < 76;

                      return (
                        <div key={crit.id} className="space-y-0.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-slate-700 truncate max-w-[190px]">
                              {crit.code}. {crit.shortName}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-emerald-800">{score}</span>
                              <span className="text-[10px] text-slate-400">/ BM: {bm}</span>
                            </div>
                          </div>

                          {/* Dual Bar Graphic */}
                          <div className="relative h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                            {/* Benchmark Marker Indicator */}
                            <div
                              className="absolute top-0 bottom-0 w-1 bg-amber-500 z-10"
                              style={{ left: `${bm}%` }}
                              title={`Benchmark Lembaga: ${bm}`}
                            />
                            {/* Teacher Bar */}
                            <div
                              className={`h-full rounded-full transition-all ${
                                isMumtaz
                                  ? 'bg-emerald-600'
                                  : isJayyidJiddan
                                  ? 'bg-teal-500'
                                  : isJayyid
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${Math.max(4, score)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" /> Nilai Guru
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-1 bg-amber-500 inline-block" /> Benchmark Lembaga
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 5. Breakdown Table of 9 Criteria */}
            {includeTable && (
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  3. {config.tableHeading}
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="px-3 py-2 w-12 text-center">Kode</th>
                        <th className="px-3 py-2">Parameter Penilaian</th>
                        <th className="px-2 py-2 text-center w-14">Bobot</th>
                        <th className="px-2 py-2 text-center w-14">Nilai</th>
                        <th className="px-2 py-2 text-center w-24">Predikat</th>
                        <th className="px-3 py-2">Catatan Ringkas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px]">
                      {CRITERIA_DEFINITIONS.map((crit) => {
                        const item = evaluation.scores.find((s) => s.criterionId === crit.id);
                        const score = item?.score ?? 0;
                        const notes = item?.notes ?? '-';
                        const predikat =
                          score >= 89
                            ? 'Mumtaz'
                            : score >= 76
                            ? 'Jayyid Jiddan'
                            : score >= 60
                            ? 'Jayyid'
                            : 'Perlu Pembinaan';

                        return (
                          <tr key={crit.id} className="hover:bg-slate-50/50">
                            <td className="px-3 py-1.5 text-center font-mono font-bold text-emerald-800">
                              {crit.code}
                            </td>
                            <td className="px-3 py-1.5 font-semibold text-slate-800">
                              {crit.name}
                            </td>
                            <td className="px-2 py-1.5 text-center font-medium text-slate-600">
                              {crit.weight}%
                            </td>
                            <td className="px-2 py-1.5 text-center font-bold text-slate-900">
                              {score}
                            </td>
                            <td className="px-2 py-1.5 text-center">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  score >= 89
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : score >= 76
                                    ? 'bg-teal-100 text-teal-800'
                                    : score >= 60
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {predikat}
                              </span>
                            </td>
                            <td className="px-3 py-1.5 text-slate-600 italic text-[10px] truncate max-w-[200px]">
                              {notes}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 6. Strengths & Recommendations */}
            {includeRecommendations && (
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl">
                  <span className="font-bold text-emerald-900 block mb-1">
                    {config.strengthsHeading}
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px]">
                    {evaluation.strengths.slice(0, 3).map((str, idx) => (
                      <li key={idx}>{str}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl">
                  <span className="font-bold text-amber-900 block mb-1">
                    {config.recommendationsHeading}
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px]">
                    {evaluation.recommendedPrograms.slice(0, 3).map((prog, idx) => (
                      <li key={idx}>{prog}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* 7. Official Signatures (3 Columns) */}
            {includeSignatures && (
              <div className="pt-6 border-t border-slate-200 text-xs">
                {config.showMudirSignature ? (
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {/* Guru */}
                    <div>
                      <p className="text-slate-500 mb-10">{config.teacherSignHeading}</p>
                      <p className="font-bold text-slate-900 underline">{teacher.name}, {teacher.title}</p>
                      <p className="text-[10px] text-slate-400">NIP: {teacher.nip}</p>
                    </div>

                    {/* Supervisor */}
                    <div>
                      <p className="text-slate-500 mb-10 leading-tight">
                        {config.cityLocation}, {evaluation.evaluationDate} <br />
                        <span className="text-[10px]">{config.supervisorTitle}</span>
                      </p>
                      <p className="font-bold text-slate-900 underline">
                        {config.supervisorName || evaluation.evaluatorName}
                      </p>
                      <p className="text-[10px] text-slate-400">{config.supervisorNip}</p>
                    </div>

                    {/* Mudir MTQ */}
                    <div>
                      <p className="text-slate-500 mb-10 leading-tight">
                        {config.mudirSignHeading} <br />
                        <span className="text-[10px] font-semibold text-emerald-900">{config.mudirTitle}</span>
                      </p>
                      <p className="font-bold text-emerald-950 underline">{config.mudirName}</p>
                      <p className="text-[10px] text-slate-400">{config.mudirNip}</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 text-center">
                    <div>
                      <p className="text-slate-500 mb-10">{config.teacherSignHeading}</p>
                      <p className="font-bold text-slate-900 underline">{teacher.name}, {teacher.title}</p>
                      <p className="text-[10px] text-slate-400">NIP: {teacher.nip}</p>
                    </div>

                    <div>
                      <p className="text-slate-500 mb-10 leading-tight">
                        {config.cityLocation}, {evaluation.evaluationDate} <br />
                        <span className="text-[10px] font-semibold text-emerald-900">{config.mudirTitle}</span>
                      </p>
                      <p className="font-bold text-slate-900 underline text-emerald-950">{config.mudirName}</p>
                      <p className="text-[10px] text-slate-400">{config.mudirNip}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Footer Pagination Note */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400">
              <span>Dokumen Resmi Lembaga MTQ Darul Abidin • Generasi PDF Otomatis</span>
              <span>Dicetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
