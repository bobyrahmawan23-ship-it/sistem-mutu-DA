import React, { useState } from 'react';
import {
  BayatiStageDefinition,
  BayatiStageId,
  TeacherBayatiProfile,
} from '../types/bayatiCertification';
import { BAYATI_STAGES } from '../data/bayatiCertificationData';
import { exportElementAsPng } from '../utils/exportUtils';
import {
  X,
  Share2,
  Image as ImageIcon,
  FileDown,
  Printer,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  MessageCircle,
  Copy,
  Check,
} from 'lucide-react';

interface BayatiShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: TeacherBayatiProfile;
  initialStageId?: BayatiStageId;
}

export const BayatiShareModal: React.FC<BayatiShareModalProps> = ({
  isOpen,
  onClose,
  teacher,
  initialStageId,
}) => {
  if (!isOpen) return null;

  const [selectedStageId, setSelectedStageId] = useState<BayatiStageId>(
    initialStageId || 'stage_doa_fatihah'
  );
  const [shareMode, setShareMode] = useState<'SINGLE_STAGE' | 'ALL_STAGES'>('SINGLE_STAGE');
  const [isCopied, setIsCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const activeStage =
    BAYATI_STAGES.find((s) => s.id === selectedStageId) || BAYATI_STAGES[0];
  const submission = teacher.submissions[activeStage.id];
  const score = submission?.score ?? 0;

  // Build formal WhatsApp message text
  const generateWhatsAppMessage = () => {
    if (shareMode === 'SINGLE_STAGE') {
      const statusText =
        submission.status === 'LULUS'
          ? '✅ LULUS SERTIFIKASI'
          : submission.status === 'REVISI'
          ? '⚠️ PERLU REVISI TALAQQI'
          : submission.status === 'PROSES_REVIEW'
          ? '⏳ DALAM PROSES REVIEW'
          : '❌ BELUM MENGIRIMKAN TUGAS';

      return (
        `*HASIL EVALUASI TUGAS SERTIFIKASI IRAMA BAYATI*\n` +
        `*MTQ DARUL ABIDIN*\n\n` +
        `Assalamu'alaikum Warahmatullahi Wabarakatuh,\n` +
        `Yth. *${teacher.teacherName}* (${teacher.unit} - ${teacher.teachingClass})\n\n` +
        `Berikut adalah hasil evaluasi setoran rekaman/uji Irama Bayati:\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `📌 *Materi Uji:* ${activeStage.title}\n` +
        `📖 *Cakupan Surat:* ${activeStage.surahRange}\n` +
        `🎼 *Fokus Nada:* ${activeStage.focusTone}\n` +
        `📊 *Status:* ${statusText}\n` +
        `⭐ *Nilai:* ${score > 0 ? `${score} / 100` : '-'}\n` +
        (submission.musyrifName ? `👨‍🏫 *Musyrif Penguji:* ${submission.musyrifName}\n` : '') +
        (submission.submissionDate ? `📅 *Tanggal Setor:* ${submission.submissionDate}\n` : '') +
        `📝 *Catatan Supervisor:*\n` +
        `"${submission.evaluatorNotes || 'Tetap istiqamah menjaga keindahan tartil dan nada Bayati terstandar.'}"\n` +
        `━━━━━━━━━━━━━━━━━━━━\n\n` +
        `Jazakumullah khayran atas komitmen menjaga mutu pengajaran Al-Qur'an.\n` +
        `_Lembaga Penjaminan Mutu MTQ Darul Abidin_`
      );
    } else {
      // Summary of all 6 stages
      const stagesSummary = BAYATI_STAGES.map((s, idx) => {
        const sub = teacher.submissions[s.id];
        const icon =
          sub.status === 'LULUS'
            ? '✅'
            : sub.status === 'REVISI'
            ? '⚠️'
            : sub.status === 'PROSES_REVIEW'
            ? '⏳'
            : '❌';
        return `${idx + 1}. ${s.title}: ${icon} ${sub.status} (${sub.score ? `${sub.score} Pts` : '-'})`;
      }).join('\n');

      return (
        `*RAPORT LENGKAP SERTIFIKASI IRAMA BAYATI*\n` +
        `*MTQ DARUL ABIDIN*\n\n` +
        `Assalamu'alaikum Warahmatullahi Wabarakatuh,\n` +
        `Yth. *${teacher.teacherName}* (${teacher.unit})\n\n` +
        `Rekapitulasi 6 Klaster Tugas Irama Bayati:\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `${stagesSummary}\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `🏆 *Ketuntasan:* ${teacher.completedStagesCount} dari 6 Tahapan Lulus\n` +
        `📈 *Rata-Rata Nilai:* ${teacher.averageScore} Pts\n` +
        `🎖️ *Status Akhir:* ${teacher.isFullyCertified ? 'TERSERTIFIKASI PENUH (MUMTAZ)' : 'DALAM PROSES PENYELESAIAN'}\n\n` +
        `_Lembaga Penjaminan Mutu MTQ Darul Abidin_`
      );
    }
  };

  const textMessage = generateWhatsAppMessage();

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(textMessage);
    const cleanPhone = teacher.phone.replace(/[^0-9]/g, '');
    const targetPhone = cleanPhone.startsWith('0') ? `62${cleanPhone.slice(1)}` : cleanPhone;
    window.open(`https://wa.me/${targetPhone}?text=${encoded}`, '_blank');
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(textMessage);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleExportPng = async () => {
    setIsExporting(true);
    await exportElementAsPng(
      'bayati-card-graphic',
      `Sertifikasi_Bayati_${teacher.teacherName.replace(/\s+/g, '_')}_${activeStage.id}`
    );
    setIsExporting(false);
  };

  const handleExportWord = () => {
    const html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Sertifikasi Bayati - ${teacher.teacherName}</title>
        <style>
          body { font-family: 'Calibri', 'Segoe UI', Arial, sans-serif; margin: 40px; color: #1e293b; }
          .header { text-align: center; border-bottom: 2px solid #047857; padding-bottom: 15px; margin-bottom: 25px; }
          .header h1 { color: #047857; margin: 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px 12px; font-size: 13px; text-align: left; }
          th { background-color: #f1f5f9; }
          .status-lulus { color: #047857; font-weight: bold; }
          .status-revisi { color: #b45309; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>MTQ DARUL ABIDIN</h1>
          <p>Lembaga Penjaminan Mutu & Sertifikasi Pengajaran Al-Qur'an</p>
          <h3>LEMBAR HASIL EVALUASI TUGAS SERTIFIKASI IRAMA BAYATI</h3>
        </div>

        <p><strong>Nama Guru:</strong> ${teacher.teacherName}</p>
        <p><strong>Unit / Kelas:</strong> ${teacher.unit} (${teacher.teachingClass})</p>
        <p><strong>Status Sertifikasi:</strong> ${teacher.isFullyCertified ? 'Lulus Bersertifikat' : 'Dalam Proses'}</p>

        <table>
          <thead>
            <tr>
              <th>Tahapan / Klaster Surat</th>
              <th>Status</th>
              <th>Nilai</th>
              <th>Catatan Supervisor</th>
            </tr>
          </thead>
          <tbody>
            ${BAYATI_STAGES.map((s) => {
              const sub = teacher.submissions[s.id];
              return `
                <tr>
                  <td><strong>${s.title}</strong><br><small>${s.surahRange}</small></td>
                  <td class="${sub.status === 'LULUS' ? 'status-lulus' : 'status-revisi'}">${sub.status}</td>
                  <td>${sub.score || '-'}</td>
                  <td><em>${sub.evaluatorNotes || '-'}</em></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <div style="margin-top: 40px; text-align: right;">
          <p>Depok, ${new Date().toLocaleDateString('id-ID')}<br>Supervisor Penguji Bayati,</p>
          <br><br>
          <p><strong>Drs. H. Syamsul Arifin, M.Ag.</strong><br>Koordinator MTQ Darul Abidin</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', html], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = `Sertifikasi_Bayati_${teacher.teacherName.replace(/\s+/g, '_')}.doc`;
    a.href = url;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[95vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-200 border border-white/20">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                Kirim Hasil Evaluasi Sertifikasi Irama Bayati
              </h2>
              <p className="text-xs text-emerald-100">
                Penerima: {teacher.teacherName} ({teacher.unit}) • Telp: {teacher.phone}
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

        {/* Action Toggle: Per Sub/Surat vs Seluruh 6 Tahapan */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-200 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setShareMode('SINGLE_STAGE')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                shareMode === 'SINGLE_STAGE'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Per Sub / Klaster Surat
            </button>
            <button
              type="button"
              onClick={() => setShareMode('ALL_STAGES')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                shareMode === 'ALL_STAGES'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rekap Semua 6 Surat
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportPng}
              disabled={isExporting}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Unduh grafik sebagai gambar Foto (PNG)"
            >
              <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isExporting ? 'Proses...' : 'Foto (PNG)'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportWord}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-sky-500 hover:bg-sky-50 text-slate-700 font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Unduh laporan Word (.docx)"
            >
              <FileDown className="w-3.5 h-3.5 text-sky-600" />
              <span>Word (.docx)</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-slate-400 text-slate-700 font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Cetak PDF"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>PDF</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-800">
          {/* Stage Selector Pills (if Single Stage Mode) */}
          {shareMode === 'SINGLE_STAGE' && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Pilih Sub-Materi / Klaster Surat yang Ingin Dikirimkan:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {BAYATI_STAGES.map((stg) => {
                  const sub = teacher.submissions[stg.id];
                  const isSelected = selectedStageId === stg.id;
                  const isPassed = sub.status === 'LULUS';
                  const isRevision = sub.status === 'REVISI';

                  return (
                    <button
                      key={stg.id}
                      type="button"
                      onClick={() => setSelectedStageId(stg.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50 shadow-xs'
                          : 'border-slate-200 bg-slate-50/60 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="truncate">{stg.title}</span>
                        {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                        {isRevision && <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                        {sub.status === 'PROSES_REVIEW' && <Clock className="w-3.5 h-3.5 text-sky-600 shrink-0" />}
                      </div>
                      <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                        {sub.score ? `Skor: ${sub.score} Pts` : sub.status}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Visual Graphic Card (Capturable to PNG / Printable) */}
          <div
            id="bayati-card-graphic-wrapper"
            className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 space-y-4 shadow-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Sertifikasi Irama Bayati MTQ Darul Abidin
                </span>
                <h3 className="text-base font-extrabold text-slate-900">
                  {shareMode === 'SINGLE_STAGE' ? activeStage.title : 'Rekap 6 Tahapan Tugas'}
                </h3>
                <p className="text-xs text-slate-500">
                  {shareMode === 'SINGLE_STAGE' ? activeStage.surahRange : 'Progres Keseluruhan Guru'}
                </p>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black text-slate-900">
                  {shareMode === 'SINGLE_STAGE' ? `${score}` : `${teacher.averageScore}`}
                </span>
                <span className="text-xs text-slate-400"> / 100</span>
                <span
                  className={`block text-[10px] font-extrabold px-2 py-0.5 rounded-full border mt-0.5 ${
                    submission.status === 'LULUS'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : submission.status === 'REVISI'
                      ? 'bg-amber-100 text-amber-800 border-amber-200'
                      : submission.status === 'PROSES_REVIEW'
                      ? 'bg-sky-100 text-sky-800 border-sky-200'
                      : 'bg-rose-100 text-rose-800 border-rose-200'
                  }`}
                >
                  {submission.status}
                </span>
              </div>
            </div>

            {/* SVG Visual Graphic */}
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <svg id="bayati-card-graphic" viewBox="0 0 520 120" className="w-full h-auto">
                <defs>
                  <linearGradient id="bayatiBarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#059669" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>

                {/* Horizontal track */}
                <rect x="20" y="25" width="480" height="24" rx="12" fill="#f1f5f9" />

                {/* Score bar */}
                <rect
                  x="20"
                  y="25"
                  width={Math.max(12, ((score || 40) / 100) * 480)}
                  height="24"
                  rx="12"
                  fill="url(#bayatiBarGrad)"
                />

                {/* Passing grade line at 76 */}
                <line
                  x1={20 + 0.76 * 480}
                  y1="18"
                  x2={20 + 0.76 * 480}
                  y2="56"
                  stroke="#d97706"
                  strokeWidth="2.5"
                  strokeDasharray="3,2"
                />

                <text
                  x={20 + 0.76 * 480}
                  y="14"
                  fontSize="9"
                  fill="#b45309"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  Batas Kelulusan (76)
                </text>

                {/* Marker labels */}
                <text x="20" y="68" fontSize="9.5" fill="#94a3b8" fontWeight="600">
                  0 (Belum Setor)
                </text>
                <text x="240" y="68" fontSize="9.5" fill="#94a3b8" fontWeight="600">
                  60 (Revisi)
                </text>
                <text x="360" y="68" fontSize="9.5" fill="#047857" fontWeight="bold">
                  76 (Lulus)
                </text>
                <text x="470" y="68" fontSize="9.5" fill="#059669" fontWeight="bold">
                  100 (Mumtaz)
                </text>
              </svg>

              <div className="mt-2 text-xs text-slate-600 flex items-center justify-between">
                <span>
                  Fokus Nada: <strong>{activeStage.focusTone}</strong>
                </span>
                <span>
                  Ayat Contoh: <em>{activeStage.sampleAyat}</em>
                </span>
              </div>
            </div>

            {/* Supervisor Notes */}
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs space-y-1">
              <span className="font-bold text-emerald-900 block">
                Catatan Fashohah & Irama dari Supervisor:
              </span>
              <p className="text-slate-700 italic">
                "{submission.evaluatorNotes || 'Belum ada catatan koreksi khusus untuk tugas ini.'}"
              </p>
            </div>
          </div>

          {/* WhatsApp Message Preview & Instant Send */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Pratinjau Pesan WhatsApp ke Guru:</span>
              </span>

              <button
                type="button"
                onClick={handleCopyText}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{isCopied ? 'Tersalin' : 'Salin Teks'}</span>
              </button>
            </div>

            <pre className="p-4 bg-slate-900 text-emerald-300 rounded-xl text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
              {textMessage}
            </pre>
          </div>
        </div>

        {/* Modal Footer with Direct WhatsApp Send Button */}
        <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200"
          >
            Tutup
          </button>

          <button
            type="button"
            onClick={handleOpenWhatsApp}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Kirim Langsung ke WhatsApp Guru ({teacher.teacherName.split(' ')[1] || teacher.teacherName})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
