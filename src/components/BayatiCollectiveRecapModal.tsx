import React, { useState } from 'react';
import {
  BayatiStageDefinition,
  BayatiStageId,
  TeacherBayatiProfile,
  TaskStatus,
} from '../types/bayatiCertification';
import { BAYATI_STAGES } from '../data/bayatiCertificationData';
import {
  X,
  MessageCircle,
  FileDown,
  Copy,
  Check,
  Printer,
  Users,
  Award,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  FileText,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface BayatiCollectiveRecapModalProps {
  isOpen: boolean;
  onClose: () => void;
  bayatiProfiles: TeacherBayatiProfile[];
}

export const BayatiCollectiveRecapModal: React.FC<BayatiCollectiveRecapModalProps> = ({
  isOpen,
  onClose,
  bayatiProfiles,
}) => {
  if (!isOpen) return null;

  // Filter states
  const [filterMode, setFilterMode] = useState<'SUBMITTED_ONLY' | 'ALL' | 'CERTIFIED' | 'IN_PROGRESS'>('SUBMITTED_ONLY');
  const [unitFilter, setUnitFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTeacherId, setExpandedTeacherId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Helper: check if a teacher has submitted at least one task
  const hasSubmittedAny = (t: TeacherBayatiProfile) => {
    return (
      t.completedStagesCount > 0 ||
      Object.values(t.submissions).some(
        (s) => s && (s.status !== 'BELUM_KIRIM' || s.hasSubmittedRecording)
      )
    );
  };

  // Filter profiles based on selected mode, unit, and search
  const filteredProfiles = bayatiProfiles.filter((t) => {
    // Mode filter
    if (filterMode === 'SUBMITTED_ONLY' && !hasSubmittedAny(t)) return false;
    if (filterMode === 'CERTIFIED' && !t.isFullyCertified) return false;
    if (filterMode === 'IN_PROGRESS' && (t.isFullyCertified || !hasSubmittedAny(t))) return false;

    // Unit filter
    if (unitFilter !== 'ALL' && t.unit !== unitFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = t.teacherName.toLowerCase().includes(q);
      const matchUnit = t.unit.toLowerCase().includes(q);
      const matchClass = t.teachingClass.toLowerCase().includes(q);
      const matchMusyrif = t.assignedMusyrif && t.assignedMusyrif.toLowerCase().includes(q);
      if (!matchName && !matchUnit && !matchClass && !matchMusyrif) return false;
    }

    return true;
  });

  // Calculate statistics for the filtered list
  const totalSubmittedInSystem = bayatiProfiles.filter(hasSubmittedAny).length;
  const certifiedCount = bayatiProfiles.filter((t) => t.isFullyCertified).length;
  const totalTasksSubmitted = bayatiProfiles.reduce((acc, t) => {
    const submittedCount = Object.values(t.submissions).filter(
      (s) => s && (s.status !== 'BELUM_KIRIM' || s.hasSubmittedRecording)
    ).length;
    return acc + submittedCount;
  }, 0);

  // Generate formatted WhatsApp Text Message
  const generateWhatsAppMessage = () => {
    const today = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    let msg = `*REKAPITULASI DETAIL PENGIRIMAN TUGAS IRAMA BAYATI*\n`;
    msg += `*LEMBAGA MTQ YAYASAN DARUL ABIDIN*\n`;
    msg += `_Tanggal Laporan: ${today}_\n\n`;

    msg += `📊 *RINGKASAN PROGRES:*\n`;
    msg += `• Total Musyrif Terdaftar: ${bayatiProfiles.length} Orang\n`;
    msg += `• Musyrif Sudah Kirim Tugas: ${totalSubmittedInSystem} Orang\n`;
    msg += `• Lulus Penuh 6 Klaster: ${certifiedCount} Orang\n`;
    msg += `• Total Setoran Terkirim: ${totalTasksSubmitted} Dokumen/Rekaman\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━\n\n`;

    msg += `📋 *DAFTAR RINCIAN MUSYRIF YANG SUDAH MENGERJAKAN TUGAS:*\n\n`;

    if (filteredProfiles.length === 0) {
      msg += `_(Tidak ada data musyrif yang cocok dengan kriteria filter saat ini)_\n\n`;
    } else {
      filteredProfiles.forEach((tp, idx) => {
        const passedCount = tp.completedStagesCount;
        const statusBadge = tp.isFullyCertified
          ? '🌟 [LULUS PENUH - TERSERTIFIKASI]'
          : passedCount > 0
          ? `⏳ [DALAM PROSES: ${passedCount}/6 KLASTER]`
          : '❌ [BELUM KIRIM]';

        msg += `*${idx + 1}. ${tp.teacherName}* (${tp.unit} - ${tp.teachingClass})\n`;
        msg += `   Status: ${statusBadge}\n`;
        if (tp.assignedMusyrif) {
          msg += `   Penguji/Talaqqi: ${tp.assignedMusyrif}\n`;
        }
        msg += `   Rata-rata Nilai: *${tp.averageScore || '-'}*\n`;
        if (tp.lastSubmissionDate) {
          msg += `   Tgl Setoran Terakhir: ${tp.lastSubmissionDate}\n`;
        }
        msg += `   *Rincian Klaster Surat:*\n`;

        BAYATI_STAGES.forEach((stg) => {
          const sub = tp.submissions[stg.id];
          let statusText = 'Belum Kirim';
          let icon = '⚪';

          if (sub?.status === 'LULUS') {
            icon = '✅';
            statusText = `Lulus (Nilai: ${sub.score || '-'})`;
          } else if (sub?.status === 'PROSES_REVIEW') {
            icon = '⏳';
            statusText = `Review (Nilai: ${sub.score || '-'})`;
          } else if (sub?.status === 'REVISI') {
            icon = '⚠️';
            statusText = `Revisi (Nilai: ${sub.score || '-'})`;
          }

          msg += `   ${icon} ${stg.order}. ${stg.title}: ${statusText}\n`;
          if (sub?.evaluatorNotes && sub.status !== 'BELUM_KIRIM') {
            msg += `      _Catatan: ${sub.evaluatorNotes.slice(0, 60)}${sub.evaluatorNotes.length > 60 ? '...' : ''}_\n`;
          }
        });

        msg += `\n`;
      });
    }

    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `_Disusun otomatis oleh Sistem Evaluasi & Sertifikasi MTQ Darul Abidin_\n`;
    return msg;
  };

  // Copy WhatsApp Text to Clipboard
  const handleCopyWhatsApp = () => {
    const text = generateWhatsAppMessage();
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  // Open WhatsApp with pre-filled message
  const handleShareToWhatsApp = () => {
    const text = generateWhatsAppMessage();
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  // Download Word Document (.doc)
  const handleDownloadWord = () => {
    const today = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const rowsHtml = filteredProfiles
      .map((tp, idx) => {
        const stageColumns = BAYATI_STAGES.map((stg) => {
          const sub = tp.submissions[stg.id];
          let badge = '<span style="color:#94a3b8;">-</span>';
          if (sub?.status === 'LULUS') {
            badge = `<b style="color:#065f46;">Lulus (${sub.score ?? 85})</b>`;
          } else if (sub?.status === 'PROSES_REVIEW') {
            badge = `<span style="color:#0284c7;">Review (${sub.score ?? '-'})</span>`;
          } else if (sub?.status === 'REVISI') {
            badge = `<span style="color:#d97706;">Revisi (${sub.score ?? '-'})</span>`;
          }
          return `<td style="border:1px solid #cbd5e1; padding:6px; font-size:9pt; text-align:center;">${badge}</td>`;
        }).join('');

        return `
          <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
            <td style="border:1px solid #cbd5e1; padding:6px; font-size:9pt; text-align:center;">${idx + 1}</td>
            <td style="border:1px solid #cbd5e1; padding:6px; font-size:9pt; font-weight:bold; color:#0f172a;">
              ${tp.teacherName}
              <div style="font-size:8pt; color:#64748b; font-weight:normal;">${tp.unit} - ${tp.teachingClass}</div>
            </td>
            <td style="border:1px solid #cbd5e1; padding:6px; font-size:9pt; color:#334155;">
              ${tp.assignedMusyrif || '-'}
            </td>
            ${stageColumns}
            <td style="border:1px solid #cbd5e1; padding:6px; font-size:9pt; text-align:center; font-weight:bold; color:#064e3b;">
              ${tp.completedStagesCount}/6
            </td>
            <td style="border:1px solid #cbd5e1; padding:6px; font-size:9pt; text-align:center; font-weight:bold; color:#0f172a;">
              ${tp.averageScore || '-'}
            </td>
          </tr>
        `;
      })
      .join('');

    const stagesHeaderHtml = BAYATI_STAGES.map(
      (s) => `<th style="border:1px solid #cbd5e1; padding:6px; font-size:8pt; background-color:#ecfdf5; color:#065f46;">${s.order}. ${s.title}</th>`
    ).join('');

    const fullDocHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Rekapitulasi Tugas Pengiriman Musyrif MTQ</title>
        <style>
          body { font-family: 'Calibri', 'Arial', sans-serif; margin: 20px; color: #1e293b; }
          h2 { color: #064e3b; margin: 0; text-transform: uppercase; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th { border: 1px solid #cbd5e1; padding: 6px; font-size: 9pt; background-color: #065f46; color: #ffffff; }
        </style>
      </head>
      <body>
        <div style="text-align: center; border-bottom: 2px solid #065f46; padding-bottom: 10px; margin-bottom: 15px;">
          <h2>LEMBAGA PENGEMBANGAN MUTU AL-QUR'AN MTQ</h2>
          <p style="margin: 2px 0; font-size: 11pt; color: #334155; font-weight: bold;">YAYASAN DARUL ABIDIN</p>
          <p style="margin: 2px 0; font-size: 9pt; color: #64748b;">Laporan Rekapitulasi Tugas Pengiriman 6 Klaster Irama Bayati Guru Al-Qur'an</p>
          <p style="margin: 2px 0; font-size: 9pt; color: #64748b;">Tanggal Dokumen: ${today}</p>
        </div>

        <div style="background-color: #f1f5f9; padding: 10px; border-radius: 6px; margin-bottom: 15px; font-size: 9pt;">
          <b>Ringkasan Laporan:</b> Total Musyrif Pengirim: ${filteredProfiles.length} Orang | Lulus Penuh: ${certifiedCount} Guru | Total Setoran: ${totalTasksSubmitted} Tugas
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 30px;">No</th>
              <th>Nama Musyrif / Guru</th>
              <th>Musyrif Pembimbing</th>
              ${stagesHeaderHtml}
              <th>Lulus</th>
              <th>Rata2</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div style="margin-top: 30px; display: flex; justify-content: space-between; font-size: 9pt;">
          <div style="width: 45%; text-align: center;">
            <p>Mengetahui,<br><b>Mudir MTQ Darul Abidin</b></p>
            <br><br><br>
            <p><b>Ustadz H. Rahmat Hidayat, M.Ag</b><br><span style="font-size: 8pt; color: #64748b;">NIP. DA-MTQ-2019-001</span></p>
          </div>
          <div style="width: 45%; text-align: center; float: right;">
            <p>Depok, ${today}<br><b>Koordinator Sertifikasi & Talaqqi</b></p>
            <br><br><br>
            <p><b>Ustadz Drs. H. Syamsul Arifin, M.Ag.</b><br><span style="font-size: 8pt; color: #64748b;">NIP. DA-SUP-042</span></p>
          </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', fullDocHtml], {
      type: 'application/msword',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Rekapitulasi_Detail_Tugas_Musyrif_Bayati_${new Date().toISOString().split('T')[0]}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download CSV / Excel Spreadsheet
  const handleDownloadCSV = () => {
    const headers = [
      'No',
      'Nama Musyrif',
      'Unit',
      'Kelas Pengajaran',
      'No Telepon',
      'Musyrif Pembimbing',
      'Status Sertifikasi',
      'Klaster Lulus',
      'Nilai Rata-rata',
      'Tgl Kirim Terakhir',
      ...BAYATI_STAGES.map((s) => `${s.order}. ${s.title} (Status)`),
      ...BAYATI_STAGES.map((s) => `${s.order}. ${s.title} (Nilai)`),
    ];

    const rows = filteredProfiles.map((tp, idx) => {
      const stageStatuses = BAYATI_STAGES.map((s) => tp.submissions[s.id]?.status || 'BELUM_KIRIM');
      const stageScores = BAYATI_STAGES.map((s) => tp.submissions[s.id]?.score ?? 0);

      return [
        idx + 1,
        `"${tp.teacherName.replace(/"/g, '""')}"`,
        `"${tp.unit}"`,
        `"${tp.teachingClass}"`,
        `"${tp.phone || ''}"`,
        `"${(tp.assignedMusyrif || '').replace(/"/g, '""')}"`,
        tp.isFullyCertified ? 'LULUS PENUH' : tp.completedStagesCount > 0 ? 'DALAM PROSES' : 'BELUM KIRIM',
        `${tp.completedStagesCount}/6`,
        tp.averageScore || 0,
        tp.lastSubmissionDate || '-',
        ...stageStatuses.map((st) => `"${st}"`),
        ...stageScores,
      ];
    });

    const csvContent =
      '\ufeff' +
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Rekap_Detail_Musyrif_Bayati_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Browser Print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col text-xs">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-white/10 text-emerald-300">
              <Users className="w-5 h-5" />
            </span>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-semibold mb-0.5">
                <Award className="w-3 h-3" />
                <span>Rekapitulasi Pengiriman Tugas Lembaga</span>
              </div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                Rekapan Detail Musyrif yang Telah Mengirimkan Tugas Bayati
              </h2>
              <p className="text-[11px] text-slate-300">
                Kirimkan daftar nama musyrif beserta rincian status setoran 6 klaster irama Bayati ke WhatsApp, Word, atau Excel.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar & Filters */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 shrink-0 space-y-3">
          {/* Top Row: Quick Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleShareToWhatsApp}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
                title="Kirim pesan rekapan detail musyrif langsung ke WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Kirim Rekap ke WA</span>
              </button>

              <button
                type="button"
                onClick={handleCopyWhatsApp}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
                title="Salin format teks rekapan lengkap untuk dikirim manual"
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
                <span>{isCopied ? 'Tersalin ke Clipboard!' : 'Salin Teks WA'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadWord}
                className="px-3 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                title="Unduh Rekapan Resmi Format Microsoft Word (.doc)"
              >
                <FileText className="w-4 h-4 text-teal-700" />
                <span>Unduh Word (.doc)</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadCSV}
                className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                title="Unduh Tabel Format CSV untuk Excel"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                <span>Unduh CSV / Excel</span>
              </button>
            </div>

            {/* Quick Count Badge */}
            <div className="flex items-center gap-2 bg-emerald-100/70 border border-emerald-200 text-emerald-900 px-3 py-1.5 rounded-xl font-bold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>
                Menampilkan: <strong>{filteredProfiles.length} Musyrif</strong> ({totalSubmittedInSystem} Sudah Kirim di Sistem)
              </span>
            </div>
          </div>

          {/* Bottom Row: Filter Controls */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/60">
            {/* Filter Mode Buttons */}
            <div className="inline-flex rounded-xl bg-slate-200/80 p-0.5 border border-slate-300">
              <button
                type="button"
                onClick={() => setFilterMode('SUBMITTED_ONLY')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  filterMode === 'SUBMITTED_ONLY'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sudah Kirim Tugas ({totalSubmittedInSystem})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('CERTIFIED')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  filterMode === 'CERTIFIED'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Lulus 6 Klaster ({certifiedCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('ALL')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  filterMode === 'ALL'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua Terdaftar ({bayatiProfiles.length})
              </button>
            </div>

            {/* Unit Dropdown */}
            <select
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              className="p-1.5 bg-white border border-slate-300 rounded-xl font-semibold text-slate-700 text-xs focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">Semua Unit MTQ</option>
              {Array.from(new Set(bayatiProfiles.map((p) => p.unit).filter(Boolean))).map((u) => (
                <option key={u} value={u}>
                  Unit {u}
                </option>
              ))}
            </select>

            {/* Search Input */}
            <div className="relative flex-1 min-w-[180px]">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama musyrif / pembimbing..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Content: List of Musyrifs & Details */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-slate-100/50">
          {filteredProfiles.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-2">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">Tidak Ditemukan Musyrif</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Tidak ada data musyrif yang sesuai dengan filter saat ini. Coba pilih filter "Semua Terdaftar" atau bersihkan kolom pencarian.
              </p>
            </div>
          ) : (
            filteredProfiles.map((tp, idx) => {
              const isExpanded = expandedTeacherId === tp.teacherId;
              const hasSubmitted = hasSubmittedAny(tp);

              return (
                <div
                  key={tp.teacherId}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all hover:border-slate-300"
                >
                  {/* Card Header Row */}
                  <div
                    onClick={() => setExpandedTeacherId(isExpanded ? null : tp.teacherId)}
                    className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-xs shrink-0 mt-0.5 sm:mt-0">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-black text-slate-900 text-sm hover:text-emerald-800 transition-colors">
                            {tp.teacherName}
                          </h4>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">
                            {tp.unit} • {tp.teachingClass}
                          </span>
                          {tp.isFullyCertified ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] inline-flex items-center gap-1 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Lulus Penuh (6 Klaster)
                            </span>
                          ) : tp.completedStagesCount > 0 ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-extrabold text-[10px] inline-flex items-center gap-1 border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600" />
                              {tp.completedStagesCount}/6 Klaster Selesai
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-semibold text-[10px]">
                              Belum Kirim Tugas
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-slate-500">
                          {tp.assignedMusyrif && (
                            <span>
                              Penguji/Talaqqi: <strong className="text-slate-700">{tp.assignedMusyrif}</strong>
                            </span>
                          )}
                          {tp.phone && (
                            <span>
                              WA: <strong className="text-slate-700">{tp.phone}</strong>
                            </span>
                          )}
                          {tp.lastSubmissionDate && (
                            <span>
                              Setoran: <strong className="text-emerald-700">{tp.lastSubmissionDate}</strong>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right summary & Toggle */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-slate-400 block font-medium">Rata-rata Nilai</span>
                        <span className="text-base font-black text-slate-900 leading-none">
                          {tp.averageScore || '-'}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <span>{isExpanded ? 'Tutup Rincian' : 'Lihat 6 Klaster'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded 6-Stage Breakdown */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 bg-slate-50/70 border-t border-slate-100 space-y-2">
                      <span className="font-extrabold text-[11px] text-slate-700 uppercase tracking-wider block">
                        Rincian Setoran 6 Klaster Surat Irama Bayati:
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {BAYATI_STAGES.map((stg) => {
                          const sub = tp.submissions[stg.id];
                          const isPassed = sub?.status === 'LULUS';
                          const isReview = sub?.status === 'PROSES_REVIEW';
                          const isRevision = sub?.status === 'REVISI';

                          return (
                            <div
                              key={stg.id}
                              className={`p-2.5 rounded-xl border transition-all ${
                                isPassed
                                  ? 'bg-emerald-50/60 border-emerald-200'
                                  : isReview
                                  ? 'bg-sky-50/60 border-sky-200'
                                  : isRevision
                                  ? 'bg-amber-50/60 border-amber-200'
                                  : 'bg-white border-slate-200'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-black text-slate-900 text-xs truncate max-w-[170px]">
                                  {stg.order}. {stg.title}
                                </span>
                                <span
                                  className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase ${
                                    isPassed
                                      ? 'bg-emerald-200 text-emerald-900'
                                      : isReview
                                      ? 'bg-sky-200 text-sky-900'
                                      : isRevision
                                      ? 'bg-amber-200 text-amber-900'
                                      : 'bg-slate-100 text-slate-500'
                                  }`}
                                >
                                  {sub?.status || 'BELUM KIRIM'}
                                </span>
                              </div>

                              <div className="text-[10px] text-slate-500 flex items-center justify-between">
                                <span>Nilai Irama: <strong className="text-slate-800">{sub?.score ?? '-'}</strong></span>
                                {sub?.submissionDate && <span>Tgl: {sub.submissionDate}</span>}
                              </div>

                              {sub?.audioAttachmentName && (
                                <div className="mt-1 text-[10px] text-teal-700 bg-teal-100/50 px-1.5 py-0.5 rounded truncate font-mono">
                                  📎 {sub.audioAttachmentName}
                                </div>
                              )}

                              {sub?.evaluatorNotes && (
                                <p className="mt-1 text-[10px] text-slate-600 italic bg-white p-1 rounded border border-slate-200/60 line-clamp-2">
                                  "{sub.evaluatorNotes}"
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-slate-200 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-slate-500 text-[11px]">
            * Klik nama musyrif di atas untuk melihat detail per klaster surat. Pesan WhatsApp & ekspor akan memuat seluruh data yang terfilter.
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handleShareToWhatsApp}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Kirimkan ke WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
