import React, { useState, useEffect } from 'react';
import { TeacherBayatiProfile } from '../types/bayatiCertification';
import { DaarulAbidinLogo } from './DaarulAbidinLogo';
import { exportElementAsPng } from '../utils/exportUtils';
import {
  X,
  Printer,
  Image as ImageIcon,
  FileDown,
  MessageCircle,
  Award,
  Edit3,
  RotateCcw,
  Save,
  Check,
  Sparkles,
  Sliders,
  FileText,
  UserCheck,
} from 'lucide-react';

interface BayatiCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: TeacherBayatiProfile;
}

export interface CertTextTemplate {
  institutionHeader: string;
  certTitle: string;
  introSentence: string;
  mainStatement: string;
  tonePatternText: string;
  scopeStatement: string;
  closingPrayer: string;
  mudirTitle: string;
  mudirName: string;
  mudirNip: string;
  supervisorTitle: string;
  supervisorName: string;
  supervisorNip: string;
  signatoryHeadingMudir: string;
}

const DEFAULT_CERT_TEXTS: CertTextTemplate = {
  institutionHeader: 'YAYASAN DAARUL ABIDIN • DEPOK JAWA BARAT',
  certTitle: 'SERTIFIKAT KELULUSAN & KOMPETENSI IRAMA BAYATI',
  introSentence: 'Dengan penuh rasa bangga dan apresiasi, sertifikat ini dianugerahkan kepada:',
  mainStatement:
    'Telah menyelesaikan seluruh rangkaian ujian dan dinyatakan LULUS TERSTANDARISASI dalam penguasaan dan pengajaran Irama Bayati Al-Qur\'an dengan pola siklus baku:',
  tonePatternText: 'Naik • Datar • Miring • Naik • Datar • Turun',
  scopeStatement:
    'Meliputi 6 klaster surat (Doa Belajar & Al-Fatihah hingga An-Nazi\'at s.d. An-Naba\')',
  closingPrayer:
    'Semoga senantiasa istiqamah mengajarkan Al-Qur\'an dengan tartil, menjaga keindahan nagham yang syar\'i, serta melahirkan generasi pencinta Al-Qur\'an.',
  mudirTitle: 'Mudir Tahfidz Qur’an Daarul Abidin',
  mudirName: 'K.H. Muhammad Shodiq, M.Ag.',
  mudirNip: 'NIP: DA-MDR-001',
  supervisorTitle: 'Supervisor & Master Trainer Nagham Bayati',
  supervisorName: 'Drs. H. Syamsul Arifin, M.Ag.',
  supervisorNip: 'NIP: DA-SUP-042',
  signatoryHeadingMudir: 'Mengetahui,',
};

export const BayatiCertificateModal: React.FC<BayatiCertificateModalProps> = ({
  isOpen,
  onClose,
  teacher,
}) => {
  if (!isOpen) return null;

  // 1. Text Template State (Persisted in localStorage)
  const [certTexts, setCertTexts] = useState<CertTextTemplate>(() => {
    const saved = localStorage.getItem('bayati_cert_template');
    if (saved) {
      try {
        return { ...DEFAULT_CERT_TEXTS, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_CERT_TEXTS;
      }
    }
    return DEFAULT_CERT_TEXTS;
  });

  // 2. Specific Certificate Meta
  const [certNumber, setCertNumber] = useState<string>(
    `DA/SERT-BAYATI/${new Date().getFullYear()}/${teacher.teacherId.replace('t_', '0')}`
  );
  const [issuePlaceDate, setIssuePlaceDate] = useState<string>(
    `Depok, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`
  );
  const [recipientUnit, setRecipientUnit] = useState<string>(teacher.unit);
  const [recipientClass, setRecipientClass] = useState<string>(teacher.teachingClass);

  useEffect(() => {
    setRecipientUnit(teacher.unit);
    setRecipientClass(teacher.teachingClass);
  }, [teacher]);

  // 3. UI States
  const [isEditing, setIsEditing] = useState(false);
  const [editTab, setEditTab] = useState<'SENTENCES' | 'SIGNATORIES'>('SENTENCES');
  const [isExporting, setIsExporting] = useState(false);
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);

  // Sync edits to LocalStorage
  const handleSaveToLocalStorage = () => {
    localStorage.setItem('bayati_cert_template', JSON.stringify(certTexts));
    setShowSavedFeedback(true);
    setTimeout(() => setShowSavedFeedback(false), 2500);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Kembalikan semua kalimat dan data pejabat sertifikat ke teks standar bawaan?')) {
      setCertTexts(DEFAULT_CERT_TEXTS);
      localStorage.removeItem('bayati_cert_template');
      setShowSavedFeedback(true);
      setTimeout(() => setShowSavedFeedback(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPng = async () => {
    setIsExporting(true);
    await exportElementAsPng(
      'bayati-certificate-sheet',
      `Sertifikat_Bayati_${teacher.teacherName.replace(/\s+/g, '_')}`
    );
    setIsExporting(false);
  };

  const handleExportWord = () => {
    const predikatText =
      teacher.averageScore >= 89 ? 'MUMTAZ (Sangat Bermutu)' : 'JAYYID JIDDAN (Bermutu)';

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Sertifikat Irama Bayati - ${teacher.teacherName}</title>
        <style>
          body { font-family: 'Calibri', 'Georgia', serif; margin: 40px; color: #1e293b; text-align: center; }
          .cert-border { border: 8px double #047857; padding: 40px; }
          .inst-header { font-size: 13px; font-weight: bold; color: #047857; letter-spacing: 2px; margin-bottom: 8px; }
          h1 { color: #047857; font-size: 24px; margin-top: 0; margin-bottom: 2px; }
          .cert-num { font-size: 12px; color: #64748b; font-family: monospace; font-weight: bold; }
          .recipient { font-size: 28px; font-weight: bold; color: #0f172a; border-bottom: 2px solid #d97706; display: inline-block; padding: 0 40px; margin: 20px 0; }
          .role { font-size: 13px; color: #475569; font-weight: bold; }
          .details { font-size: 14px; line-height: 1.8; max-width: 650px; margin: 0 auto; color: #334155; }
          .pattern { color: #047857; font-weight: bold; font-size: 15px; margin: 12px 0; display: inline-block; padding: 6px 16px; background-color: #ecfdf5; border: 1px solid #6ee7b7; border-radius: 6px; }
          .closing { font-style: italic; font-size: 12px; color: #475569; margin-top: 15px; padding: 8px 20px; }
          table.sign { width: 100%; margin-top: 50px; text-align: center; }
          table.sign td { width: 50%; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="cert-border">
          <p class="inst-header">${certTexts.institutionHeader}</p>
          <h1>${certTexts.certTitle}</h1>
          <p class="cert-num">Nomor: ${certNumber}</p>
          <br>
          <p style="font-size: 13px; font-style: italic; color: #475569;">${certTexts.introSentence}</p>
          <div class="recipient">${teacher.teacherName}</div>
          <p class="role">Unit Pendidik: ${recipientUnit} (${recipientClass})</p>
          <br>
          <div class="details">
            ${certTexts.mainStatement}
            <br>
            <div class="pattern">[ ${certTexts.tonePatternText} ]</div>
            <br>
            ${certTexts.scopeStatement} dengan skor akhir <strong>${teacher.averageScore} Pts</strong> (<strong>${predikatText}</strong>).
            <br>
            <div class="closing">"${certTexts.closingPrayer}"</div>
          </div>
          <br>
          <table class="sign">
            <tr>
              <td>
                ${certTexts.signatoryHeadingMudir}<br>
                <strong>${certTexts.mudirTitle}</strong><br><br><br><br>
                <strong><u>${certTexts.mudirName}</u></strong><br>
                <small style="color: #64748b;">${certTexts.mudirNip}</small>
              </td>
              <td>
                ${issuePlaceDate}<br>
                <strong>${certTexts.supervisorTitle}</strong><br><br><br><br>
                <strong><u>${certTexts.supervisorName}</u></strong><br>
                <small style="color: #64748b;">${certTexts.supervisorNip}</small>
              </td>
            </tr>
          </table>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `Sertifikat_Bayati_${teacher.teacherName.replace(/\s+/g, '_')}.doc`;
    link.href = url;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleShareWhatsApp = () => {
    const text =
      `*${certTexts.certTitle}*\n` +
      `*${certTexts.institutionHeader}*\n\n` +
      `Alhamdulillah, selamat kepada *${teacher.teacherName}* (${recipientUnit} - ${recipientClass}) atas kelulusan sertifikasi Irama Bayati:\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📜 *No Sertifikat:* ${certNumber}\n` +
      `🎼 *Pola Siklus Nada:* ${certTexts.tonePatternText}\n` +
      `⭐ *Nilai Akhir:* ${teacher.averageScore} Pts (${teacher.averageScore >= 89 ? 'Mumtaz / Sangat Bermutu' : 'Jayyid Jiddan / Bermutu'})\n` +
      `🏛️ *Mudir:* ${certTexts.mudirName}\n` +
      `🎓 *Supervisor:* ${certTexts.supervisorName}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `"${certTexts.closingPrayer}"`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Parse pattern into individual badges if matches Naik/Datar/etc
  const patternSegments = certTexts.tonePatternText
    .split(/[•,\-\/]/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[96vh] flex flex-col">
        {/* Top Control Bar (Hidden on print) */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-amber-300" />
            <div>
              <h2 className="text-sm font-bold flex items-center gap-2">
                <span>Penerbitan Sertifikat Sertifikasi Irama Bayati</span>
                {showSavedFeedback && (
                  <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/40 animate-fade-in flex items-center gap-1">
                    <Check className="w-3 h-3" /> Tersimpan
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-emerald-200">
                Pendidik: {teacher.teacherName} ({teacher.unit})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isEditing
                  ? 'bg-amber-400 text-slate-950 font-black ring-2 ring-amber-300'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title="Edit semua kalimat isi sertifikat, nama mudir, dan supervisor"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Tutup Edit Kalimat' : 'Edit Kalimat Sertifikat'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportPng}
              disabled={isExporting}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
              title="Unduh Gambar Sertifikat (PNG)"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isExporting ? 'Proses...' : 'Foto (PNG)'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportWord}
              className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
              title="Unduh Format Dokumen Word (.doc)"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Word</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-white text-slate-900 text-xs font-extrabold flex items-center gap-1 cursor-pointer"
              title="Cetak PDF / Print"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cetak</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Edit Sentences & Signatories Drawer Form */}
        {isEditing && (
          <div className="p-4 sm:p-5 bg-amber-50/90 border-b border-amber-200 text-xs space-y-4 print:hidden max-h-72 overflow-y-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-amber-200 text-amber-900">
                  <Sliders className="w-3.5 h-3.5" />
                </span>
                <span className="font-extrabold text-amber-950 text-xs sm:text-sm">
                  Pengaturan & Pengeditan Teks Sertifikat:
                </span>
              </div>

              {/* Sub-tabs */}
              <div className="flex items-center gap-2">
                <div className="bg-amber-100 p-0.5 rounded-lg flex items-center border border-amber-300">
                  <button
                    type="button"
                    onClick={() => setEditTab('SENTENCES')}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                      editTab === 'SENTENCES'
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'text-amber-900 hover:bg-amber-200'
                    }`}
                  >
                    <FileText className="w-3 h-3" />
                    <span>Kalimat & Pernyataan</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditTab('SIGNATORIES')}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                      editTab === 'SIGNATORIES'
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'text-amber-900 hover:bg-amber-200'
                    }`}
                  >
                    <UserCheck className="w-3 h-3" />
                    <span>Pejabat & No. Surat</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSaveToLocalStorage}
                  className="px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] flex items-center gap-1 shadow-2xs cursor-pointer"
                  title="Simpan teks ini sebagai format baku tetap"
                >
                  <Save className="w-3 h-3" />
                  <span>Simpan Template</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="px-2 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                  title="Kembalikan kalimat ke teks bawaan"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* TAB 1: Edit Sentences */}
            {editTab === 'SENTENCES' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    1. Header Lembaga / Yayasan:
                  </label>
                  <input
                    type="text"
                    value={certTexts.institutionHeader}
                    onChange={(e) =>
                      setCertTexts({ ...certTexts, institutionHeader: e.target.value })
                    }
                    className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    2. Judul Sertifikat:
                  </label>
                  <input
                    type="text"
                    value={certTexts.certTitle}
                    onChange={(e) => setCertTexts({ ...certTexts, certTitle: e.target.value })}
                    className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs font-bold text-emerald-950 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    3. Kalimat Pengantar Penerima:
                  </label>
                  <input
                    type="text"
                    value={certTexts.introSentence}
                    onChange={(e) =>
                      setCertTexts({ ...certTexts, introSentence: e.target.value })
                    }
                    className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    4. Urutan Pola Siklus Nada (Bayati):
                  </label>
                  <input
                    type="text"
                    value={certTexts.tonePatternText}
                    onChange={(e) =>
                      setCertTexts({ ...certTexts, tonePatternText: e.target.value })
                    }
                    placeholder="Contoh: Naik • Datar • Miring • Naik • Datar • Turun"
                    className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs font-bold text-emerald-800"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    5. Kalimat Pernyataan Kelulusan & Uji Kompetensi:
                  </label>
                  <textarea
                    rows={2}
                    value={certTexts.mainStatement}
                    onChange={(e) =>
                      setCertTexts({ ...certTexts, mainStatement: e.target.value })
                    }
                    className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    6. Kalimat Cakupan Materi Surat:
                  </label>
                  <input
                    type="text"
                    value={certTexts.scopeStatement}
                    onChange={(e) =>
                      setCertTexts({ ...certTexts, scopeStatement: e.target.value })
                    }
                    className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    7. Kalimat Doa & Penutup:
                  </label>
                  <input
                    type="text"
                    value={certTexts.closingPrayer}
                    onChange={(e) =>
                      setCertTexts({ ...certTexts, closingPrayer: e.target.value })
                    }
                    className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs italic"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="block text-[11px] font-bold text-slate-700">
                      8. Unit Pendidik di Sertifikat:
                    </label>
                    <span className="text-[10px] text-emerald-700 font-bold">Ketik unit bebas</span>
                  </div>
                  <input
                    type="text"
                    value={recipientUnit}
                    onChange={(e) => setRecipientUnit(e.target.value)}
                    placeholder="Contoh: SD, SMPIT, Ma'had Tahfidz, KBTK..."
                    className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs font-bold text-slate-800"
                  />
                  <div className="flex flex-wrap gap-1 mt-1">
                    {['TK', 'SD', 'SMP', 'SMA', 'SDIT', 'SMPIT', 'SMAIT', 'Tahsin Dewasa', "Ma'had"].map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => setRecipientUnit(u)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                          recipientUnit === u
                            ? 'bg-emerald-700 text-white'
                            : 'bg-white text-slate-600 border border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="block text-[11px] font-bold text-slate-700">
                      9. Kelas / Halaqah di Sertifikat:
                    </label>
                    <span className="text-[10px] text-emerald-700 font-bold">Ketik kelas bebas</span>
                  </div>
                  <input
                    type="text"
                    value={recipientClass}
                    onChange={(e) => setRecipientClass(e.target.value)}
                    placeholder="Contoh: Kelas 4 Tahfidz, Tahsin Maqdis..."
                    className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs font-semibold text-slate-800"
                  />
                  <div className="flex flex-wrap gap-1 mt-1">
                    {['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6', 'Tahsin Maqdis', 'Tahfidz Intensif'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setRecipientClass(c)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium cursor-pointer transition-colors ${
                          recipientClass === c
                            ? 'bg-teal-700 text-white font-bold'
                            : 'bg-white text-slate-600 border border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Edit Signatories & Meta */}
            {editTab === 'SIGNATORIES' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Nomor Sertifikat:
                  </label>
                  <input
                    type="text"
                    value={certNumber}
                    onChange={(e) => setCertNumber(e.target.value)}
                    className="w-full p-2 bg-white border border-amber-300 rounded-lg font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Kota & Tanggal:
                  </label>
                  <input
                    type="text"
                    value={issuePlaceDate}
                    onChange={(e) => setIssuePlaceDate(e.target.value)}
                    className="w-full p-2 bg-white border border-amber-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Nama Mudir:
                  </label>
                  <input
                    type="text"
                    value={certTexts.mudirName}
                    onChange={(e) =>
                      setCertTexts({ ...certTexts, mudirName: e.target.value })
                    }
                    className="w-full p-2 bg-white border border-amber-300 rounded-lg font-bold text-emerald-950"
                  />
                  <input
                    type="text"
                    value={certTexts.mudirTitle}
                    onChange={(e) =>
                      setCertTexts({ ...certTexts, mudirTitle: e.target.value })
                    }
                    placeholder="Jabatan Mudir"
                    className="w-full p-1 bg-white border border-amber-200 rounded text-[10px] mt-1"
                  />
                  <input
                    type="text"
                    value={certTexts.mudirNip}
                    onChange={(e) =>
                      setCertTexts({ ...certTexts, mudirNip: e.target.value })
                    }
                    placeholder="NIP Mudir"
                    className="w-full p-1 bg-white border border-amber-200 rounded text-[10px] mt-1 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Nama Supervisor Penguji:
                  </label>
                  <input
                    type="text"
                    value={certTexts.supervisorName}
                    onChange={(e) =>
                      setCertTexts({ ...certTexts, supervisorName: e.target.value })
                    }
                    className="w-full p-2 bg-white border border-amber-300 rounded-lg font-bold text-teal-950"
                  />
                  <input
                    type="text"
                    value={certTexts.supervisorTitle}
                    onChange={(e) =>
                      setCertTexts({ ...certTexts, supervisorTitle: e.target.value })
                    }
                    placeholder="Jabatan Supervisor"
                    className="w-full p-1 bg-white border border-amber-200 rounded text-[10px] mt-1"
                  />
                  <input
                    type="text"
                    value={certTexts.supervisorNip}
                    onChange={(e) =>
                      setCertTexts({ ...certTexts, supervisorNip: e.target.value })
                    }
                    placeholder="NIP Supervisor"
                    className="w-full p-1 bg-white border border-amber-200 rounded text-[10px] mt-1 font-mono"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Certificate Display Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 flex justify-center print:p-0 print:bg-white">
          <div
            id="bayati-certificate-sheet"
            className="w-full max-w-[820px] bg-white rounded-xl shadow-xl p-8 sm:p-12 relative border-8 border-double border-emerald-800 text-center select-none print:shadow-none print:border-8 print:w-full print:m-0"
            style={{
              backgroundImage:
                'radial-gradient(#ecfdf5 1px, transparent 1px), radial-gradient(#ecfdf5 1px, #ffffff 1px)',
              backgroundSize: '24px 24px',
              backgroundPosition: '0 0, 12px 12px',
            }}
          >
            {/* Corner Decorative Ornaments */}
            <div className="absolute top-2 left-2 w-10 h-10 border-t-4 border-l-4 border-amber-500 rounded-tl-lg pointer-events-none" />
            <div className="absolute top-2 right-2 w-10 h-10 border-t-4 border-r-4 border-amber-500 rounded-tr-lg pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-10 h-10 border-b-4 border-l-4 border-amber-500 rounded-bl-lg pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-10 h-10 border-b-4 border-r-4 border-amber-500 rounded-br-lg pointer-events-none" />

            {/* Logo Emblem Header */}
            <div className="flex flex-col items-center justify-center mb-3">
              <DaarulAbidinLogo size={80} className="mb-2" />
              <span className="text-[11px] font-bold tracking-widest text-emerald-900 uppercase font-sans">
                {certTexts.institutionHeader}
              </span>
            </div>

            {/* Certificate Title */}
            <h1 className="text-xl sm:text-2xl font-black text-emerald-950 uppercase tracking-wide font-serif">
              {certTexts.certTitle}
            </h1>
            <p className="text-xs text-slate-500 font-mono mt-0.5 font-bold">
              Nomor: {certNumber}
            </p>

            <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto my-3" />

            {/* Recipient Section */}
            <p className="text-xs text-slate-600 font-serif italic">
              {certTexts.introSentence}
            </p>

            <div className="my-3 py-1 border-b-2 border-amber-500 inline-block px-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">
                {teacher.teacherName}
              </h2>
            </div>
            <p className="text-xs font-semibold text-slate-500">
              Unit: <strong>{recipientUnit}</strong> &bull; Kelas: <strong>{recipientClass}</strong>
            </p>

            {/* Competency Statement with the 6 Tone Cycle */}
            <div className="my-5 max-w-xl mx-auto text-xs text-slate-700 leading-relaxed font-sans">
              <p className="leading-relaxed">
                {certTexts.mainStatement}
              </p>

              {/* Dynamic Tone Cycle Badges */}
              <div className="my-3 py-2 px-3 bg-emerald-50/90 border border-emerald-300 rounded-xl inline-flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-xs font-black text-emerald-950 shadow-2xs">
                {patternSegments.map((seg, i) => (
                  <React.Fragment key={i}>
                    <span className="bg-white px-2 py-0.5 rounded shadow-2xs">
                      {seg.toLowerCase().includes('naik') && '↗ '}
                      {seg.toLowerCase().includes('datar') && '➡️ '}
                      {seg.toLowerCase().includes('miring') && '↘ '}
                      {seg.toLowerCase().includes('turun') && '⬇ '}
                      {seg}
                    </span>
                    {i < patternSegments.length - 1 && (
                      <span className="text-emerald-400">&bull;</span>
                    )}
                  </React.Fragment>
                ))}
              </div>

              <p className="text-[11px] text-slate-600">
                {certTexts.scopeStatement} dengan perolehan skor akhir{' '}
                <strong className="text-slate-900">{teacher.averageScore} Pts</strong> (
                <strong className="text-emerald-800">
                  {teacher.averageScore >= 89
                    ? 'Mumtaz / Sangat Bermutu'
                    : 'Jayyid Jiddan / Bermutu'}
                </strong>).
              </p>

              {/* Closing Prayer Box */}
              {certTexts.closingPrayer && (
                <div className="mt-3 p-2 bg-slate-50/80 rounded-lg border border-slate-200 text-[11px] italic text-slate-600 max-w-lg mx-auto">
                  "{certTexts.closingPrayer}"
                </div>
              )}
            </div>

            {/* Signatures Area (Editable Mudir & Supervisor) */}
            <div className="mt-8 pt-4 grid grid-cols-2 gap-6 text-xs font-sans">
              <div>
                <p className="text-slate-500 mb-1">{certTexts.signatoryHeadingMudir}</p>
                <p className="font-bold text-slate-800 mb-14">{certTexts.mudirTitle}</p>
                <p className="font-bold text-slate-900 underline text-sm">{certTexts.mudirName}</p>
                <p className="text-[10px] text-slate-400">{certTexts.mudirNip}</p>
              </div>

              <div>
                <p className="text-slate-500 mb-1">{issuePlaceDate}</p>
                <p className="font-bold text-slate-800 mb-14">{certTexts.supervisorTitle}</p>
                <p className="font-bold text-slate-900 underline text-sm">{certTexts.supervisorName}</p>
                <p className="text-[10px] text-slate-400">{certTexts.supervisorNip}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer with WhatsApp Direct Share */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              Kalimat sertifikat dapat diedit bebas dan tersimpan otomatis untuk pencetakan resmi.
            </span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Kirim Notifikasi Sertifikat ke WA Guru</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
