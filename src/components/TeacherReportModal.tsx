import React, { useState, useEffect } from 'react';
import { EvaluationRecord, TeacherProfile } from '../types/competency';
import { CRITERIA_DEFINITIONS, QUALITY_CATEGORIES } from '../data/criteriaData';
import { RadarChart } from './RadarChart';
import {
  ReportTextConfig,
  getStoredReportConfig,
  saveStoredReportConfig,
  resetStoredReportConfig,
} from '../types/reportConfig';
import jsPDF from 'jspdf';
import { captureElementAsImage } from '../utils/pdfExportUtils';
import {
  X,
  Printer,
  FileText,
  Sliders,
  RotateCcw,
  Save,
  Check,
  UserCheck,
  Building,
  FileSignature,
  FileDown,
  Sparkles,
  Loader2,
} from 'lucide-react';

interface TeacherReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: TeacherProfile;
  evaluation: EvaluationRecord;
}

export const TeacherReportModal: React.FC<TeacherReportModalProps> = ({
  isOpen,
  onClose,
  teacher,
  evaluation,
}) => {
  if (!isOpen) return null;

  // 1. Text & Mudir Configuration State
  const [config, setConfig] = useState<ReportTextConfig>(() => getStoredReportConfig());
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'MUDIR_SIGN' | 'KOP_TITLE' | 'SECTIONS_TEXT'>('MUDIR_SIGN');
  const [hasSaved, setHasSaved] = useState(false);

  // Sync when event updates from other components
  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<ReportTextConfig>;
      if (customEvent.detail) {
        setConfig(customEvent.detail);
      }
    };
    window.addEventListener('mtq_report_config_updated', handleUpdate);
    return () => window.removeEventListener('mtq_report_config_updated', handleUpdate);
  }, []);

  const categoryMeta = QUALITY_CATEGORIES[evaluation.qualityCategory];

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdfWithJsPdf = async () => {
    const reportElem = document.getElementById('printable-official-teacher-report');
    if (!reportElem) return;
    setIsDownloadingPdf(true);
    try {
      const { dataUrl, width, height } = await captureElementAsImage(reportElem, {
        scale: 2.5,
        backgroundColor: '#ffffff',
      });

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
          if (remainingHeight > 0) pdf.addPage();
        }
      }

      pdf.save(`Raport_Resmi_${teacher.name.replace(/\s+/g, '_')}_${new Date().getFullYear()}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
      window.print();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleConfigChange = <K extends keyof ReportTextConfig>(field: K, value: ReportTextConfig[K]) => {
    const updated = { ...config, [field]: value };
    setConfig(updated);
  };

  const handleSaveConfig = () => {
    saveStoredReportConfig(config);
    setHasSaved(true);
    setTimeout(() => setHasSaved(false), 2500);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Kembalikan format dan kalimat rapot serta nama Mudir MTQ ke pengaturan standar bawaan?')) {
      const def = resetStoredReportConfig();
      setConfig(def);
      setHasSaved(true);
      setTimeout(() => setHasSaved(false), 2000);
    }
  };

  // Word Export (.doc)
  const handleExportWord = () => {
    const headerHtml = `
      <div style="text-align: center; border-bottom: 2px solid #065f46; padding-bottom: 12px; margin-bottom: 20px;">
        <h2 style="color: #064e3b; margin: 0; font-family: serif; text-transform: uppercase;">${config.institutionName}</h2>
        <p style="margin: 2px 0; font-size: 11pt; color: #4b5563;">${config.institutionSub}</p>
        <p style="margin: 2px 0; font-size: 9pt; color: #9ca3af;">${config.institutionContact}</p>
        <div style="margin-top: 10px; display: inline-block; padding: 4px 16px; background-color: #ecfdf5; border: 1px solid #a7f3d0; font-weight: bold; font-size: 11pt; color: #065f46;">
          ${config.reportTitle}
        </div>
      </div>
    `;

    const bioHtml = `
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 10pt; background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px;">
        <tr>
          <td style="width: 20%; font-weight: bold; color: #64748b; padding: 4px;">Nama Lengkap:</td>
          <td style="width: 30%; font-weight: bold; color: #0f172a; padding: 4px;">${teacher.name}, ${teacher.title}</td>
          <td style="width: 20%; font-weight: bold; color: #64748b; padding: 4px;">Periode Penilaian:</td>
          <td style="width: 30%; font-weight: bold; color: #065f46; padding: 4px;">${evaluation.periodName}</td>
        </tr>
        <tr>
          <td style="font-weight: bold; color: #64748b; padding: 4px;">NIP / ID Guru:</td>
          <td style="color: #334155; padding: 4px;">${teacher.nip}</td>
          <td style="font-weight: bold; color: #64748b; padding: 4px;">Tanggal Asesmen:</td>
          <td style="color: #334155; padding: 4px;">${evaluation.evaluationDate}</td>
        </tr>
        <tr>
          <td style="font-weight: bold; color: #64748b; padding: 4px;">Unit / Kelas Ajar:</td>
          <td style="color: #1e293b; padding: 4px;">${teacher.unit} (${teacher.teachingClass})</td>
          <td style="font-weight: bold; color: #64748b; padding: 4px;">Hafalan & Maqdis:</td>
          <td style="color: #1e293b; padding: 4px;">${teacher.hafalanCountJuz} Juz | ${teacher.certifiedMaqdis ? 'Tersertifikasi Maqdis' : 'Belum Sertifikasi'}</td>
        </tr>
      </table>
    `;

    const scoreRows = CRITERIA_DEFINITIONS.map((crit) => {
      const item = evaluation.scores.find((s) => s.criterionId === crit.id);
      const score = item?.score ?? 0;
      const notes = item?.notes ?? '-';
      return `
        <tr>
          <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; font-family: monospace; font-weight: bold;">${crit.code}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px; font-weight: bold;">${crit.name}<br/><span style="font-size: 8pt; color: #64748b; font-weight: normal;">${crit.focusAspects.join(' • ')}</span></td>
          <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center;">${crit.weight}%</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; font-weight: bold; font-size: 11pt;">${score}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px; font-size: 9pt; font-style: italic;">${notes}</td>
        </tr>
      `;
    }).join('');

    const tableHtml = `
      <h4 style="margin: 16px 0 6px; text-transform: uppercase; font-size: 10pt; color: #334155;">${config.tableHeading}</h4>
      <table style="width: 100%; border-collapse: collapse; font-size: 9.5pt; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #f1f5f9; color: #334155;">
            <th style="border: 1px solid #cbd5e1; padding: 6px; width: 45px;">Kode</th>
            <th style="border: 1px solid #cbd5e1; padding: 6px;">Parameter Penilaian</th>
            <th style="border: 1px solid #cbd5e1; padding: 6px; width: 60px;">Bobot</th>
            <th style="border: 1px solid #cbd5e1; padding: 6px; width: 60px;">Nilai</th>
            <th style="border: 1px solid #cbd5e1; padding: 6px;">Catatan Penilai</th>
          </tr>
        </thead>
        <tbody>
          ${scoreRows}
        </tbody>
      </table>
    `;

    const summaryBadges = `
      <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 12px; margin-bottom: 16px;">
        <h3 style="margin: 0; color: #064e3b; font-size: 12pt;">
          Capaian Mutu: <strong>${categoryMeta.label} (${categoryMeta.arabicLabel})</strong> — Skor Akhir: <strong>${evaluation.overallScore}</strong>
        </h3>
        <p style="margin: 4px 0 0; font-size: 9.5pt; color: #374151;">${categoryMeta.description}</p>
      </div>
    `;

    const signHtml = config.showMudirSignature
      ? `
      <table style="width: 100%; margin-top: 40px; text-align: center; font-size: 9.5pt; border: none;">
        <tr>
          <td style="width: 33%; vertical-align: top;">
            <p style="color: #64748b; margin-bottom: 50px;">${config.teacherSignHeading}</p>
            <p style="font-weight: bold; text-decoration: underline; margin: 0;">${teacher.name}, ${teacher.title}</p>
            <p style="font-size: 8.5pt; color: #64748b; margin: 2px 0;">NIP: ${teacher.nip}</p>
          </td>
          <td style="width: 33%; vertical-align: top;">
            <p style="color: #64748b; margin-bottom: 50px;">
              ${config.cityLocation}, ${evaluation.evaluationDate}<br />
              ${config.supervisorTitle}
            </p>
            <p style="font-weight: bold; text-decoration: underline; margin: 0;">${config.supervisorName || evaluation.evaluatorName}</p>
            <p style="font-size: 8.5pt; color: #64748b; margin: 2px 0;">${config.supervisorNip}</p>
          </td>
          <td style="width: 33%; vertical-align: top;">
            <p style="color: #64748b; margin-bottom: 50px;">
              ${config.mudirSignHeading}<br />
              ${config.mudirTitle}
            </p>
            <p style="font-weight: bold; text-decoration: underline; margin: 0; color: #064e3b;">${config.mudirName}</p>
            <p style="font-size: 8.5pt; color: #64748b; margin: 2px 0;">${config.mudirNip}</p>
          </td>
        </tr>
      </table>
      `
      : `
      <table style="width: 100%; margin-top: 40px; text-align: center; font-size: 9.5pt; border: none;">
        <tr>
          <td style="width: 50%; vertical-align: top;">
            <p style="color: #64748b; margin-bottom: 50px;">${config.teacherSignHeading}</p>
            <p style="font-weight: bold; text-decoration: underline; margin: 0;">${teacher.name}, ${teacher.title}</p>
            <p style="font-size: 8.5pt; color: #64748b; margin: 2px 0;">NIP: ${teacher.nip}</p>
          </td>
          <td style="width: 50%; vertical-align: top;">
            <p style="color: #64748b; margin-bottom: 50px;">
              ${config.cityLocation}, ${evaluation.evaluationDate}<br />
              ${config.mudirTitle}
            </p>
            <p style="font-weight: bold; text-decoration: underline; margin: 0; color: #064e3b;">${config.mudirName}</p>
            <p style="font-size: 8.5pt; color: #64748b; margin: 2px 0;">${config.mudirNip}</p>
          </td>
        </tr>
      </table>
      `;

    const fullDocHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Raport Guru - ${teacher.name}</title></head>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        ${headerHtml}
        ${bioHtml}
        ${summaryBadges}
        ${tableHtml}
        <div style="font-size: 8.5pt; color: #64748b; font-style: italic; margin-top: 10px; border-top: 1px dashed #cbd5e1; padding-top: 8px;">
          ${config.closingNotes}
        </div>
        ${signHtml}
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', fullDocHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Raport_Kompetensi_${teacher.name.replace(/\s+/g, '_')}_${new Date().getFullYear()}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[95vh] flex flex-col relative">
        {/* Modal Top Control Bar (Hidden on print) */}
        <div className="px-4 sm:px-6 py-3 bg-slate-800 text-white flex items-center justify-between shrink-0 print:hidden gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 truncate">
            <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">Raport Resmi Kompetensi Guru Al-Qur'an</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isEditing
                  ? 'bg-amber-500 text-slate-950 shadow-sm ring-2 ring-amber-300'
                  : 'bg-slate-700 hover:bg-slate-600 text-emerald-300'
              }`}
              title="Edit nama Mudir MTQ, lembaga, dan seluruh kalimat rapot"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Tutup Pengaturan' : 'Edit Teks Rapot & Mudir'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportWord}
              className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs hidden sm:flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Unduh format dokumen Microsoft Word (.doc)"
            >
              <FileDown className="w-3.5 h-3.5 text-blue-400" />
              <span>Word</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Edit Drawer Panel when isEditing is active */}
        {isEditing && (
          <div className="bg-slate-900 border-b border-slate-700 text-slate-200 p-4 sm:p-5 shrink-0 print:hidden shadow-inner space-y-4 max-h-[50vh] overflow-y-auto">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  Pengaturan Format Teks & Mudir MTQ di Rapot Resmi
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {hasSaved && (
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-800">
                    <Check className="w-3.5 h-3.5" /> Tersimpan!
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="px-2.5 py-1 text-xs rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Default</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveConfig}
                  className="px-3 py-1 text-xs rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                >
                  <Save className="w-3 h-3" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </div>

            {/* Tab Navigation inside Drawer */}
            <div className="flex gap-2 border-b border-slate-800 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab('MUDIR_SIGN')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'MUDIR_SIGN'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Nama Mudir & Tanda Tangan</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('KOP_TITLE')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'KOP_TITLE'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>KOP Lembaga & Judul Rapot</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('SECTIONS_TEXT')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'SECTIONS_TEXT'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileSignature className="w-3.5 h-3.5" />
                <span>Kalimat & Narasi Rapot</span>
              </button>
            </div>

            {/* Tab 1: Mudir & Signatures */}
            {activeTab === 'MUDIR_SIGN' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {/* Mudir Card */}
                <div className="sm:col-span-2 lg:col-span-1 bg-slate-800/80 p-3 rounded-xl border border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-400 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" /> Pejabat Mudir MTQ
                    </span>
                    <label className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.showMudirSignature}
                        onChange={(e) => handleConfigChange('showMudirSignature', e.target.checked)}
                        className="rounded accent-emerald-500 cursor-pointer"
                      />
                      <span>Tampilkan TTD Mudir</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Nama Lengkap Mudir MTQ:</label>
                    <input
                      type="text"
                      value={config.mudirName}
                      onChange={(e) => handleConfigChange('mudirName', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-2.5 py-1.5 text-white font-semibold focus:outline-none focus:border-emerald-500"
                      placeholder="e.g. K.H. Muhammad Shodiq, M.Ag."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Jabatan / Gelar Struktural:</label>
                    <input
                      type="text"
                      value={config.mudirTitle}
                      onChange={(e) => handleConfigChange('mudirTitle', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                      placeholder="e.g. Mudir MTQ Darul Abidin"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">NIP / ID Mudir:</label>
                      <input
                        type="text"
                        value={config.mudirNip}
                        onChange={(e) => handleConfigChange('mudirNip', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                        placeholder="e.g. NIP: DA-MDR-001"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">Kop Tanda Tangan:</label>
                      <input
                        type="text"
                        value={config.mudirSignHeading}
                        onChange={(e) => handleConfigChange('mudirSignHeading', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                        placeholder="e.g. Mengetahui,"
                      />
                    </div>
                  </div>
                </div>

                {/* Supervisor Card */}
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 space-y-2">
                  <span className="font-bold text-teal-400 block">Supervisor / Penguji Mutu</span>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Nama Supervisor Penilai:</label>
                    <input
                      type="text"
                      value={config.supervisorName}
                      onChange={(e) => handleConfigChange('supervisorName', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                      placeholder="e.g. Ustadz Boby Rahmawan, S.Pd.I"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Jabatan Supervisor:</label>
                    <input
                      type="text"
                      value={config.supervisorTitle}
                      onChange={(e) => handleConfigChange('supervisorTitle', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                      placeholder="e.g. Supervisor / Kepala MTQ"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">NIP Supervisor:</label>
                      <input
                        type="text"
                        value={config.supervisorNip}
                        onChange={(e) => handleConfigChange('supervisorNip', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                        placeholder="e.g. NIP: DA-MTQ-SUP-001"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">Kota Titimangsa:</label>
                      <input
                        type="text"
                        value={config.cityLocation}
                        onChange={(e) => handleConfigChange('cityLocation', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                        placeholder="e.g. Depok"
                      />
                    </div>
                  </div>
                </div>

                {/* Teacher Signatory Label */}
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 space-y-2">
                  <span className="font-bold text-slate-300 block">Kolom Tanda Tangan Guru</span>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Label Tanda Tangan Guru:</label>
                    <input
                      type="text"
                      value={config.teacherSignHeading}
                      onChange={(e) => handleConfigChange('teacherSignHeading', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                      placeholder="e.g. Guru Yang Dinilai,"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 italic pt-2">
                    Tip: Perubahan pada nama Mudir dan tanda tangan langsung tampak pada pratinjau lembar rapot di bawah serta dokumen Word/PDF.
                  </p>
                </div>
              </div>
            )}

            {/* Tab 2: KOP & Title */}
            {activeTab === 'KOP_TITLE' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Nama Lembaga / Yayasan:</label>
                  <input
                    type="text"
                    value={config.institutionName}
                    onChange={(e) => handleConfigChange('institutionName', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-2.5 py-1.5 text-white font-bold focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. MTQ DARUL ABIDIN"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Inisial Logo (Avatar KOP):</label>
                  <input
                    type="text"
                    value={config.logoInitials}
                    onChange={(e) => handleConfigChange('logoInitials', e.target.value)}
                    maxLength={4}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-2.5 py-1.5 text-white font-bold font-serif focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. DA"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Sub-Header / Deskripsi Lembaga:</label>
                  <input
                    type="text"
                    value={config.institutionSub}
                    onChange={(e) => handleConfigChange('institutionSub', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. Lembaga Manajemen Tahfidz & Pengajaran Al-Qur'an Terpadu"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Alamat & Kontak Lembaga:</label>
                  <input
                    type="text"
                    value={config.institutionContact}
                    onChange={(e) => handleConfigChange('institutionContact', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. Depok, Jawa Barat | Website: darulabidin.sch.id..."
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] text-slate-400 mb-0.5">Judul Dokumen Rapot Resmi:</label>
                  <input
                    type="text"
                    value={config.reportTitle}
                    onChange={(e) => handleConfigChange('reportTitle', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-2.5 py-1.5 text-white font-extrabold focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. RAPORT EVALUASI & PROFIL KOMPETENSI GURU AL-QUR'AN"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] text-slate-400 mb-0.5">Kalimat Pengantar / Mukadimah Rapot:</label>
                  <textarea
                    rows={2}
                    value={config.introSentence}
                    onChange={(e) => handleConfigChange('introSentence', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. Dokumen resmi pemetaan kompetensi pengajar..."
                  />
                </div>
              </div>
            )}

            {/* Tab 3: Section Sentences */}
            {activeTab === 'SECTIONS_TEXT' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Judul Visualisasi Radar Poligon:</label>
                  <input
                    type="text"
                    value={config.radarHeading}
                    onChange={(e) => handleConfigChange('radarHeading', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Keterangan Sub-Radar:</label>
                  <input
                    type="text"
                    value={config.radarSubText}
                    onChange={(e) => handleConfigChange('radarSubText', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Judul Tabel Nilai 9 Indikator:</label>
                  <input
                    type="text"
                    value={config.tableHeading}
                    onChange={(e) => handleConfigChange('tableHeading', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Judul Kotak Pilar Kekuatan Guru:</label>
                  <input
                    type="text"
                    value={config.strengthsHeading}
                    onChange={(e) => handleConfigChange('strengthsHeading', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] text-slate-400 mb-0.5">Judul Kotak Rekomendasi Peningkatan:</label>
                  <input
                    type="text"
                    value={config.recommendationsHeading}
                    onChange={(e) => handleConfigChange('recommendationsHeading', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] text-slate-400 mb-0.5">Kalimat Catatan Resmi & Doa Penutup Rapot:</label>
                  <textarea
                    rows={2}
                    value={config.closingNotes}
                    onChange={(e) => handleConfigChange('closingNotes', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Printable Official Report Card Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-6 text-slate-900 print:p-0 print:m-0 bg-white">
          {/* Institutional Header */}
          <div className="border-b-2 border-emerald-800 pb-4 text-center relative">
            <div className="flex items-center justify-center gap-3 mb-1">
              <div className="w-12 h-12 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-lg font-serif shrink-0 shadow-xs">
                {config.logoInitials}
              </div>
              <div className="text-left">
                <h1 className="text-xl font-extrabold uppercase tracking-wide text-emerald-950 font-serif">
                  {config.institutionName}
                </h1>
                <p className="text-xs font-medium text-slate-600">
                  {config.institutionSub}
                </p>
                <p className="text-[10px] text-slate-400">
                  {config.institutionContact}
                </p>
              </div>
            </div>
            <div className="mt-2 inline-block px-4 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-extrabold text-emerald-900 shadow-2xs">
              {config.reportTitle}
            </div>
            {config.introSentence && (
              <p className="text-[11px] text-slate-500 italic mt-1.5 max-w-2xl mx-auto">
                {config.introSentence}
              </p>
            )}
          </div>

          {/* Teacher Bio & Period Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Nama Lengkap:</span>
                <span className="font-bold text-slate-900">{teacher.name}, {teacher.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">NIP / ID Guru:</span>
                <span className="font-mono font-medium text-slate-700">{teacher.nip}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Unit / Kelas Ajar:</span>
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
                  {teacher.hafalanCountJuz} Juz Mutqin | {teacher.certifiedMaqdis ? 'Tersertifikasi Maqdis' : 'Belum Sertifikasi'}
                </span>
              </div>
            </div>
          </div>

          {/* Overall Quality Badge Showcase */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-700 text-white flex flex-col items-center justify-center shadow-md shrink-0">
                <span className="text-2xl font-black">{evaluation.overallScore}</span>
                <span className="text-[9px] uppercase tracking-wider font-semibold">Skor Akhir</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 font-semibold">Capaian Mutu Kompetensi:</span>
                <h3 className="text-lg font-bold text-slate-900">
                  {categoryMeta.label}{' '}
                  <span className="text-emerald-700 font-serif">({categoryMeta.arabicLabel})</span>
                </h3>
                <p className="text-xs text-slate-600 mt-0.5 max-w-md">{categoryMeta.description}</p>
              </div>
            </div>

            <div className="text-center sm:text-right shrink-0">
              <span className="text-[10px] text-slate-400 block">{config.supervisorTitle}:</span>
              <span className="text-xs font-bold text-slate-800">{config.supervisorName || evaluation.evaluatorName}</span>
              <span className="text-[10px] block text-emerald-700 font-medium">({config.supervisorNip})</span>
            </div>
          </div>

          {/* Visual Radar Profile */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-white flex flex-col items-center">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 text-center">
              {config.radarHeading}
            </h4>
            {config.radarSubText && (
              <p className="text-[11px] text-slate-500 mb-2 text-center max-w-md">
                {config.radarSubText}
              </p>
            )}
            <div className="w-full max-w-[420px]">
              <RadarChart
                primaryScores={evaluation.scores}
                primaryLabel={teacher.name}
                size={380}
                showLegend={false}
                interactive={false}
              />
            </div>
          </div>

          {/* Table of 9 Criteria Detailed Breakdown */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              {config.tableHeading}
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-3 py-2 w-12 text-center">Kode</th>
                    <th className="px-3 py-2">Parameter Penilaian</th>
                    <th className="px-2 py-2 text-center w-16">Bobot</th>
                    <th className="px-2 py-2 text-center w-20">Nilai</th>
                    <th className="px-3 py-2">Catatan Supervisor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {CRITERIA_DEFINITIONS.map((crit) => {
                    const item = evaluation.scores.find((s) => s.criterionId === crit.id);
                    const score = item?.score ?? 0;
                    const notes = item?.notes ?? '-';

                    return (
                      <tr key={crit.id} className="hover:bg-slate-50/50">
                        <td className="px-3 py-2 text-center font-mono font-bold text-emerald-800">
                          {crit.code}
                        </td>
                        <td className="px-3 py-2 font-semibold text-slate-800">
                          {crit.name}
                          <span className="block text-[10px] text-slate-400 font-normal">
                            {crit.focusAspects.join(' • ')}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-center font-medium text-slate-600">
                          {crit.weight}%
                        </td>
                        <td className="px-2 py-2 text-center font-bold text-sm">
                          <span
                            className={
                              score >= 89
                                ? 'text-emerald-700'
                                : score >= 76
                                ? 'text-teal-700'
                                : score >= 60
                                ? 'text-amber-700'
                                : 'text-rose-700'
                            }
                          >
                            {score}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-slate-600 italic text-[11px]">{notes}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actionable Insights & Program Rekomendasi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl">
              <span className="font-bold text-emerald-900 block mb-1">
                {config.strengthsHeading}
              </span>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                {evaluation.strengths.map((str, idx) => (
                  <li key={idx}>{str}</li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl">
              <span className="font-bold text-amber-900 block mb-1">
                {config.recommendationsHeading}
              </span>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                {evaluation.recommendedPrograms.map((prog, idx) => (
                  <li key={idx}>{prog}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Official Closing Note & Prayer */}
          {config.closingNotes && (
            <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-[11px] text-slate-600 italic leading-relaxed">
              {config.closingNotes}
            </div>
          )}

          {/* Official Signatures Section - 3 Columns with Mudir MTQ */}
          <div className="pt-8 border-t border-slate-200 text-xs">
            {config.showMudirSignature ? (
              <div className="grid grid-cols-3 gap-2 text-center">
                {/* 1. Guru Yang Dinilai */}
                <div>
                  <p className="text-slate-500 mb-12">{config.teacherSignHeading}</p>
                  <p className="font-bold text-slate-900 underline">{teacher.name}, {teacher.title}</p>
                  <p className="text-[10px] text-slate-500">NIP: {teacher.nip}</p>
                </div>

                {/* 2. Supervisor / Kepala MTQ */}
                <div>
                  <p className="text-slate-500 mb-12 leading-tight">
                    {config.cityLocation}, {evaluation.evaluationDate} <br />
                    <span className="text-[11px]">{config.supervisorTitle}</span>
                  </p>
                  <p className="font-bold text-slate-900 underline">
                    {config.supervisorName || evaluation.evaluatorName}
                  </p>
                  <p className="text-[10px] text-slate-500">{config.supervisorNip}</p>
                </div>

                {/* 3. Mudir MTQ */}
                <div>
                  <p className="text-slate-500 mb-12 leading-tight">
                    {config.mudirSignHeading} <br />
                    <span className="text-[11px] font-semibold text-emerald-900">{config.mudirTitle}</span>
                  </p>
                  <p className="font-bold text-emerald-950 underline">{config.mudirName}</p>
                  <p className="text-[10px] text-slate-500">{config.mudirNip}</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 text-center">
                <div>
                  <p className="text-slate-500 mb-12">{config.teacherSignHeading}</p>
                  <p className="font-bold text-slate-900 underline">{teacher.name}, {teacher.title}</p>
                  <p className="text-[10px] text-slate-500">NIP: {teacher.nip}</p>
                </div>

                <div>
                  <p className="text-slate-500 mb-12 leading-tight">
                    {config.cityLocation}, {evaluation.evaluationDate} <br />
                    <span className="text-[11px] font-semibold text-emerald-900">{config.mudirTitle}</span>
                  </p>
                  <p className="font-bold text-slate-900 underline text-emerald-950">{config.mudirName}</p>
                  <p className="text-[10px] text-slate-500">{config.mudirNip}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
