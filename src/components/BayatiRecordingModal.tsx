import React, { useState, useEffect } from 'react';
import {
  BayatiStageDefinition,
  BayatiStageId,
  TeacherBayatiProfile,
  TaskStatus,
} from '../types/bayatiCertification';
import { BAYATI_STAGES } from '../data/bayatiCertificationData';
import { MusyrifProfile, getStoredMusyrifList, formatWhatsAppUrl } from '../types/musyrif';
import {
  X,
  Mic,
  Music,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Send,
  MessageCircle,
  Sparkles,
  Save,
  Sliders,
  FileText,
  UserCheck,
  Check,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Volume2,
} from 'lucide-react';

interface BayatiRecordingModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: TeacherBayatiProfile;
  initialStageId?: BayatiStageId;
  musyrifList?: MusyrifProfile[];
  onSaveSubmission: (
    teacherId: string,
    stageId: BayatiStageId,
    submissionData: {
      hasSubmittedRecording: boolean;
      recordingSubmissionDate: string;
      recordingAttachmentName: string;
      recordingUrl: string;
      recordingNotes: string;
      subToneAccuracy: number;
      subTajwidAccuracy: number;
      subCengkokFluency: number;
      subTempoFashohah: number;
      score: number;
      status: TaskStatus;
      evaluatorNotes: string;
      evaluatorMusyrifId: string;
      evaluatorMusyrifName: string;
      evaluatorMusyrifPhone: string;
      syncToAssessment: boolean;
    }
  ) => void;
  onOpenSettingsToMusyrif?: () => void;
}

export const BayatiRecordingModal: React.FC<BayatiRecordingModalProps> = ({
  isOpen,
  onClose,
  teacher,
  initialStageId = 'stage_doa_fatihah',
  musyrifList: externalMusyrifs,
  onSaveSubmission,
  onOpenSettingsToMusyrif,
}) => {
  if (!isOpen) return null;

  // 1. Musyrif List state
  const [musyrifs, setMusyrifs] = useState<MusyrifProfile[]>(() => {
    return externalMusyrifs && externalMusyrifs.length > 0
      ? externalMusyrifs
      : getStoredMusyrifList();
  });

  useEffect(() => {
    if (externalMusyrifs && externalMusyrifs.length > 0) {
      setMusyrifs(externalMusyrifs);
    }
  }, [externalMusyrifs]);

  // Selected Stage
  const [selectedStageId, setSelectedStageId] = useState<BayatiStageId>(initialStageId);
  const activeStage = BAYATI_STAGES.find((s) => s.id === selectedStageId) || BAYATI_STAGES[0];
  const existingSub = teacher.submissions[selectedStageId];

  // 2. Recording Submission State
  const [hasSubmittedRecording, setHasSubmittedRecording] = useState<boolean>(() => {
    return existingSub?.hasSubmittedRecording ?? (existingSub?.status !== 'BELUM_KIRIM');
  });

  const [recordingDate, setRecordingDate] = useState<string>(() => {
    return (
      existingSub?.recordingSubmissionDate ||
      existingSub?.submissionDate ||
      new Date().toISOString().split('T')[0]
    );
  });

  const [recordingFileName, setRecordingFileName] = useState<string>(() => {
    return (
      existingSub?.recordingAttachmentName ||
      existingSub?.audioAttachmentName ||
      `Setoran_Bayati_${teacher.teacherName.replace(/[\s,.]+/g, '_')}_${selectedStageId}.mp3`
    );
  });

  const [recordingUrl, setRecordingUrl] = useState<string>(() => {
    return existingSub?.recordingUrl || '';
  });

  const [recordingNotes, setRecordingNotes] = useState<string>(() => {
    return (
      existingSub?.recordingNotes ||
      `Setoran rekaman tilawah irama Bayati siklus 6 nada untuk materi ${activeStage.title}.`
    );
  });

  // 3. Sub-Aspects Scoring State
  const [subTone, setSubTone] = useState<number>(() => {
    return existingSub?.subToneAccuracy ?? (existingSub?.toneAccuracy || 85);
  });
  const [subTajwid, setSubTajwid] = useState<number>(() => {
    return existingSub?.subTajwidAccuracy ?? (existingSub?.tajwidAccuracy || 85);
  });
  const [subCengkok, setSubCengkok] = useState<number>(() => {
    return existingSub?.subCengkokFluency ?? 80;
  });
  const [subTempo, setSubTempo] = useState<number>(() => {
    return existingSub?.subTempoFashohah ?? (existingSub?.tempoStability || 82);
  });

  // Calculate live average score
  const calculatedScore = Math.round((subTone + subTajwid + subCengkok + subTempo) / 4);

  // Status & Notes
  const [status, setStatus] = useState<TaskStatus>(() => {
    if (existingSub?.status) return existingSub.status;
    return calculatedScore >= 80 ? 'LULUS' : 'REVISI';
  });

  const [evalNotes, setEvalNotes] = useState<string>(() => {
    return (
      existingSub?.evaluatorNotes ||
      'Nada Bayati dibawakan dengan fasih, peralihan nada naik ke datar cukup halus. Pertahankan keindahan nagham dan ketukan mad thabi\'i.'
    );
  });

  // 4. Musyrif Selection
  const defaultMusyrifId =
    existingSub?.evaluatorMusyrifId || teacher.assignedMusyrifId || musyrifs[0]?.id || '';
  const [selectedMusyrifId, setSelectedMusyrifId] = useState<string>(defaultMusyrifId);

  const selectedMusyrif =
    musyrifs.find((m) => m.id === selectedMusyrifId) || musyrifs[0] || null;

  // 5. Sync to MTQ C5 assessment checkbox
  const [syncToAssessment, setSyncToAssessment] = useState<boolean>(true);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // When changing stage in modal, sync states to existing submission
  const handleSelectStage = (newStageId: BayatiStageId) => {
    setSelectedStageId(newStageId);
    const sub = teacher.submissions[newStageId];
    const newStageDef = BAYATI_STAGES.find((s) => s.id === newStageId) || BAYATI_STAGES[0];

    const hasSub = sub?.hasSubmittedRecording ?? (sub?.status !== 'BELUM_KIRIM');
    setHasSubmittedRecording(hasSub);
    setRecordingDate(
      sub?.recordingSubmissionDate || sub?.submissionDate || new Date().toISOString().split('T')[0]
    );
    setRecordingFileName(
      sub?.recordingAttachmentName ||
        sub?.audioAttachmentName ||
        `Setoran_Bayati_${teacher.teacherName.replace(/[\s,.]+/g, '_')}_${newStageId}.mp3`
    );
    setRecordingUrl(sub?.recordingUrl || '');
    setRecordingNotes(
      sub?.recordingNotes ||
        `Setoran rekaman tilawah irama Bayati siklus 6 nada untuk materi ${newStageDef.title}.`
    );

    const sTone = sub?.subToneAccuracy ?? (sub?.toneAccuracy || 85);
    const sTajwid = sub?.subTajwidAccuracy ?? (sub?.tajwidAccuracy || 85);
    const sCengkok = sub?.subCengkokFluency ?? 80;
    const sTempo = sub?.subTempoFashohah ?? (sub?.tempoStability || 82);

    setSubTone(sTone);
    setSubTajwid(sTajwid);
    setSubCengkok(sCengkok);
    setSubTempo(sTempo);

    const avg = Math.round((sTone + sTajwid + sCengkok + sTempo) / 4);
    setStatus(sub?.status || (avg >= 80 ? 'LULUS' : 'REVISI'));
    setEvalNotes(
      sub?.evaluatorNotes ||
        'Nada Bayati dibawakan dengan fasih, peralihan nada naik ke datar cukup halus. Pertahankan keindahan nagham dan ketukan mad thabi\'i.'
    );
    if (sub?.evaluatorMusyrifId) {
      setSelectedMusyrifId(sub.evaluatorMusyrifId);
    }
  };

  // Build WhatsApp report text
  const buildWhatsAppMessage = (recipient: 'MUSYRIF' | 'GURU') => {
    const musyrifName = selectedMusyrif?.name || 'Musyrif MTQ';
    const musyrifTitle = selectedMusyrif?.title || '';
    const statusLabel =
      status === 'LULUS'
        ? '✅ LULUS SERTIFIKASI TAHAP INI'
        : status === 'REVISI'
        ? '⚠️ PERLU REVISI TALAQQI'
        : status === 'PROSES_REVIEW'
        ? '⏳ SEDANG DALAM PROSES REVIEW'
        : '❌ BELUM MENYERAHKAN REKAMAN';

    const recordingStatusText = hasSubmittedRecording
      ? `✅ SUDAH MENYERAHKAN REKAMAN (Tgl: ${recordingDate})`
      : '❌ BELUM MENYERAHKAN REKAMAN';

    return (
      `*LAPORAN PENGIRIMAN REKAMAN & NILAI SUB-ASPEK IRAMA BAYATI*\n` +
      `*MTQ DAARUL ABIDIN DEPOK*\n\n` +
      `Assalamu'alaikum Warahmatullahi Wabarakatuh,\n` +
      (recipient === 'MUSYRIF'
        ? `Yth. Musyrif Pengampu: *${musyrifName} ${musyrifTitle}*\n` +
          `Berikut adalah laporan setoran rekaman & penilaian guru binaan:\n\n`
        : `Yth. *${teacher.teacherName}* (${teacher.unit} - ${teacher.teachingClass})\n` +
          `Berikut adalah hasil penilaian setoran rekaman Irama Bayati Anda:\n\n`) +
      `👤 *Data Guru:* ${teacher.teacherName}\n` +
      `🏫 *Unit/Kelas:* ${teacher.unit} - ${teacher.teachingClass}\n` +
      `📱 *No. WA Guru:* ${teacher.phone}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🎼 *Materi Tahapan:* ${activeStage.order}. ${activeStage.title}\n` +
      `📖 *Cakupan Ayat:* ${activeStage.surahRange}\n` +
      `🎯 *Fokus Nada:* ${activeStage.focusTone}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📼 *Status Pengiriman Rekaman:*\n` +
      `• Status: ${recordingStatusText}\n` +
      `• File/Judul: ${recordingFileName}\n` +
      (recordingUrl ? `• Tautan Audio: ${recordingUrl}\n` : '') +
      `• Catatan Setoran: "${recordingNotes}"\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📊 *Rincian Nilai Per-Sub Aspek:*\n` +
      `1️⃣ Ketepatan 6 Pola Nada Bayati: *${subTone} / 100*\n` +
      `2️⃣ Kaidah Tajwid & Mad Maqdis: *${subTajwid} / 100*\n` +
      `3️⃣ Cengkok Miring & Transisi Jawab: *${subCengkok} / 100*\n` +
      `4️⃣ Kestabilan Tempo & Fashohah: *${subTempo} / 100*\n` +
      `─────────────────────────\n` +
      `⭐ *Rata-Rata Nilai Akhir:* *${calculatedScore} / 100*\n` +
      `🏆 *Status Kelulusan:* *${statusLabel}*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📝 *Catatan & Masukan Musyrif:*\n` +
      `"${evalNotes}"\n\n` +
      `Musyrif Penilai: *${musyrifName}* (WA: ${selectedMusyrif?.phone || '-'})\n` +
      `_Lembaga Penjaminan Mutu MTQ Yayasan Daarul Abidin_`
    );
  };

  // Send directly to Musyrif WA
  const handleSendToMusyrifWA = () => {
    if (!selectedMusyrif || !selectedMusyrif.phone) {
      alert('Nomor WhatsApp Musyrif belum terdaftar. Silakan lengkapi di menu Pengaturan Data Musyrif.');
      return;
    }
    const msg = buildWhatsAppMessage('MUSYRIF');
    const url = formatWhatsAppUrl(selectedMusyrif.phone, msg);
    window.open(url, '_blank');
  };

  // Send copy to Teacher WA
  const handleSendToTeacherWA = () => {
    if (!teacher.phone) {
      alert('Nomor WhatsApp Guru belum terdaftar.');
      return;
    }
    const msg = buildWhatsAppMessage('GURU');
    const url = formatWhatsAppUrl(teacher.phone, msg);
    window.open(url, '_blank');
  };

  // Copy text to clipboard
  const handleCopyReport = () => {
    const msg = buildWhatsAppMessage('MUSYRIF');
    navigator.clipboard.writeText(msg);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  // Submit and Save
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSaveSubmission(teacher.teacherId, selectedStageId, {
      hasSubmittedRecording,
      recordingSubmissionDate: recordingDate,
      recordingAttachmentName: recordingFileName,
      recordingUrl,
      recordingNotes,
      subToneAccuracy: subTone,
      subTajwidAccuracy: subTajwid,
      subCengkokFluency: subCengkok,
      subTempoFashohah: subTempo,
      score: calculatedScore,
      status,
      evaluatorNotes: evalNotes,
      evaluatorMusyrifId: selectedMusyrif?.id || '',
      evaluatorMusyrifName: selectedMusyrif?.name || '',
      evaluatorMusyrifPhone: selectedMusyrif?.phone || '',
      syncToAssessment,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[95vh] flex flex-col text-xs">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300 border border-white/20 shrink-0">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold">
                  Input Pengiriman Rekaman & Penilaian Nilai Per-Sub
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold">
                  Irama Bayati
                </span>
              </div>
              <p className="text-[11px] text-emerald-100">
                Guru: <strong>{teacher.teacherName}</strong> ({teacher.unit} - {teacher.teachingClass}) • WA: {teacher.phone}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stage Selector Pills */}
        <div className="bg-slate-100 border-b border-slate-200 px-5 py-2.5 shrink-0 overflow-x-auto">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-600 shrink-0 mr-1">Klaster Surat:</span>
            {BAYATI_STAGES.map((s) => {
              const sub = teacher.submissions[s.id];
              const isSelected = selectedStageId === s.id;
              const isPassed = sub?.status === 'LULUS';
              const hasRec = sub?.hasSubmittedRecording ?? (sub?.status && sub.status !== 'BELUM_KIRIM');

              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSelectStage(s.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-[11px] shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  <span>{s.order}. {s.title.split(' ')[0]}</span>
                  {hasRec && <Mic className="w-3 h-3 text-emerald-400" />}
                  {isPassed && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Active Stage Info Card */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                <Music className="w-4 h-4 text-emerald-700" />
                <span>Klaster {activeStage.order}: {activeStage.title}</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                <strong>Cakupan:</strong> {activeStage.surahRange}
              </p>
              <p className="text-[10px] text-emerald-800 font-medium">
                <strong>Fokus Pola Nada:</strong> {activeStage.focusTone}
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-emerald-200 shadow-2xs">
              <span className="text-[10px] font-semibold text-slate-500">Skor Saat Ini:</span>
              <span className="text-sm font-black text-emerald-800">{calculatedScore} / 100</span>
            </div>
          </div>

          {/* SECTION 1: PENGIRIMAN REKAMAN */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-emerald-700" />
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  1. Data Pengiriman Rekaman Tilawah Guru
                </h3>
              </div>
              <span className="text-[10px] text-slate-500">Verifikasi pengumpulan audio</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Status Pengerjaan Rekaman */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Status Pengiriman Rekaman:
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setHasSubmittedRecording(true)}
                    className={`flex-1 py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      hasSubmittedRecording
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Sudah Mengirim Rekaman</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setHasSubmittedRecording(false);
                      setStatus('BELUM_KIRIM');
                    }}
                    className={`flex-1 py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      !hasSubmittedRecording
                        ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Belum Mengirim</span>
                  </button>
                </div>
              </div>

              {/* Tanggal Kirim */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tanggal Pengiriman Rekaman:
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={recordingDate}
                    onChange={(e) => setRecordingDate(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama File / Judul Rekaman Audio:
                </label>
                <input
                  type="text"
                  value={recordingFileName}
                  onChange={(e) => setRecordingFileName(e.target.value)}
                  placeholder="Contoh: Setoran_Bayati_Fatihah_UstadzFauzi.mp3"
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tautan File Rekaman (Opsional - GDrive/WhatsApp):
                </label>
                <input
                  type="text"
                  value={recordingUrl}
                  onChange={(e) => setRecordingUrl(e.target.value)}
                  placeholder="Contoh: https://drive.google.com/file/d/... atau tautan WA"
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Catatan Setoran Guru:
              </label>
              <input
                type="text"
                value={recordingNotes}
                onChange={(e) => setRecordingNotes(e.target.value)}
                placeholder="Catatan dari guru saat mengirim rekaman..."
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* SECTION 2: PEMBERIAN NILAI PER-SUB */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-700" />
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  2. Pemberian Nilai Per-Sub (Sub-Aspek Irama Bayati)
                </h3>
              </div>
              <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                4 Sub-Aspek Terstandarisasi
              </span>
            </div>

            {/* Sub-Aspects 1 & 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sub 1: Pola Siklus Nada */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 text-[11px] leading-tight">
                    Sub 1: 6 Pola Siklus Nada Bayati
                  </label>
                  <span className="font-black text-sm text-emerald-800 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                    {subTone}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">
                  Naik → Datar → Miring → Naik → Datar → Turun tanpa tertukar atau hilang tingkatan nada.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={subTone}
                    onChange={(e) => setSubTone(Number(e.target.value))}
                    className="flex-1 accent-emerald-600 cursor-pointer"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={subTone}
                    onChange={(e) => setSubTone(Number(e.target.value))}
                    className="w-14 p-1.5 text-center font-bold text-xs bg-white border border-slate-300 rounded-md"
                  />
                </div>
              </div>

              {/* Sub 2: Tajwid & Mad Maqdis */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 text-[11px] leading-tight">
                    Sub 2: Kesesuaian Tajwid & Mad Thabi'i
                  </label>
                  <span className="font-black text-sm text-emerald-800 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                    {subTajwid}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">
                  Ketukan mad 2 harakat metode Maqdis tertib, tidak memanjangkan huruf karena terbawa nada.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={subTajwid}
                    onChange={(e) => setSubTajwid(Number(e.target.value))}
                    className="flex-1 accent-emerald-600 cursor-pointer"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={subTajwid}
                    onChange={(e) => setSubTajwid(Number(e.target.value))}
                    className="w-14 p-1.5 text-center font-bold text-xs bg-white border border-slate-300 rounded-md"
                  />
                </div>
              </div>

              {/* Sub 3: Cengkok & Transisi Jawab */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 text-[11px] leading-tight">
                    Sub 3: Cengkok Miring & Transisi Nada Jawab
                  </label>
                  <span className="font-black text-sm text-emerald-800 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                    {subCengkok}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">
                  Keluwesan cengkok nada miring tidak kaku, transisi ke nada jawab tinggi tidak fals.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={subCengkok}
                    onChange={(e) => setSubCengkok(Number(e.target.value))}
                    className="flex-1 accent-emerald-600 cursor-pointer"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={subCengkok}
                    onChange={(e) => setSubCengkok(Number(e.target.value))}
                    className="w-14 p-1.5 text-center font-bold text-xs bg-white border border-slate-300 rounded-md"
                  />
                </div>
              </div>

              {/* Sub 4: Tempo & Fashohah */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 text-[11px] leading-tight">
                    Sub 4: Kestabilan Tempo & Fashohah Mutqin
                  </label>
                  <span className="font-black text-sm text-emerald-800 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                    {subTempo}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">
                  Pengaturan nafas teratur, tempo bacaan tidak terburu-buru, artikulasi makhraj bersih.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={subTempo}
                    onChange={(e) => setSubTempo(Number(e.target.value))}
                    className="flex-1 accent-emerald-600 cursor-pointer"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={subTempo}
                    onChange={(e) => setSubTempo(Number(e.target.value))}
                    className="w-14 p-1.5 text-center font-bold text-xs bg-white border border-slate-300 rounded-md"
                  />
                </div>
              </div>
            </div>

            {/* Overall Stage Score & Status */}
            <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex flex-col items-center justify-center font-black shadow-xs">
                  <span className="text-base leading-none">{calculatedScore}</span>
                  <span className="text-[9px] uppercase tracking-tighter text-emerald-200">Rata2</span>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-600">Rata-Rata Nilai 4 Sub-Aspek:</div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span>Hasil Penilaian:</span>
                    <span
                      className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] ${
                        calculatedScore >= 80
                          ? 'bg-emerald-100 text-emerald-800'
                          : calculatedScore >= 60
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {calculatedScore >= 80 ? 'LULUS MEMENUHI STANDAR' : 'PERLU REVISI TALAQQI'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Selector */}
              <div className="w-full sm:w-auto">
                <label className="block text-[10px] font-bold text-slate-700 mb-1">
                  Status Kelulusan Klaster Ini:
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  className="w-full sm:w-48 p-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-900 text-xs focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="LULUS">✅ LULUS (Tuntas)</option>
                  <option value="PROSES_REVIEW">⏳ PROSES REVIEW</option>
                  <option value="REVISI">⚠️ PERLU REVISI TALAQQI</option>
                  <option value="BELUM_KIRIM">❌ BELUM KIRIM REKAMAN</option>
                </select>
              </div>
            </div>

            {/* Evaluator Notes */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Catatan Evaluasi Musyrif & Saran Perbaikan Irama:
              </label>
              <textarea
                rows={2}
                value={evalNotes}
                onChange={(e) => setEvalNotes(e.target.value)}
                placeholder="Tuliskan catatan perbaikan talaqqi untuk guru..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* SECTION 3: DATA MUSYRIF PENERIMA & NOMOR WHATSAPP */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-700" />
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  3. Musyrif Penerima Setoran & Nomor WhatsApp
                </h3>
              </div>
              {onOpenSettingsToMusyrif && (
                <button
                  type="button"
                  onClick={onOpenSettingsToMusyrif}
                  className="text-[10px] text-emerald-700 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <ShieldCheck className="w-3 h-3" />
                  <span>Kelola Data Musyrif</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Select Musyrif */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Pilih Musyrif Pengampu / Penguji:
                </label>
                <select
                  value={selectedMusyrifId}
                  onChange={(e) => setSelectedMusyrifId(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-900 text-xs focus:ring-2 focus:ring-emerald-500"
                >
                  {musyrifs.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} {m.title} ({m.phone})
                    </option>
                  ))}
                </select>
              </div>

              {/* Musyrif WhatsApp Details */}
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold block">
                    Nomor WA Musyrif (Otomatis):
                  </span>
                  <div className="font-extrabold text-emerald-800 text-xs flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{selectedMusyrif?.phone || 'Belum ada nomor WA'}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {selectedMusyrif?.specialization || 'Musyrif MTQ'}
                  </span>
                </div>

                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Terverifikasi
                  </span>
                </div>
              </div>
            </div>

            {/* Direct Send Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
              <button
                type="button"
                onClick={handleSendToMusyrifWA}
                className="w-full sm:flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                title="Kirim laporan pengiriman rekaman dan nilai per-sub langsung ke WhatsApp Musyrif"
              >
                <MessageCircle className="w-4 h-4 text-emerald-200" />
                <span>Kirimkan Langsung ke WA Musyrif ({selectedMusyrif?.name.split(' ')[0] || 'Musyrif'})</span>
              </button>

              <button
                type="button"
                onClick={handleSendToTeacherWA}
                className="w-full sm:w-auto py-2.5 px-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                title="Kirimkan salinan hasil nilai ke nomor WA Guru"
              >
                <Send className="w-3.5 h-3.5 text-slate-600" />
                <span>Salinan ke WA Guru</span>
              </button>

              <button
                type="button"
                onClick={handleCopyReport}
                className="w-full sm:w-auto py-2.5 px-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                title="Salin teks laporan ke clipboard"
              >
                {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <FileText className="w-3.5 h-3.5" />}
                <span>{copySuccess ? 'Tersalin!' : 'Salin Teks'}</span>
              </button>
            </div>
          </div>

          {/* SECTION 4: SINKRONISASI ASESMEN */}
          <div className="p-3 bg-emerald-50 border border-emerald-300/80 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                id="syncAssessmentCheckbox"
                checked={syncToAssessment}
                onChange={(e) => setSyncToAssessment(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
              />
              <label
                htmlFor="syncAssessmentCheckbox"
                className="text-[11px] font-bold text-emerald-950 cursor-pointer"
              >
                Sinkronkan nilai ini ke Parameter Asesmen MTQ (C5 - Penguasaan Irama Bayati)
              </label>
            </div>
            <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-bold shrink-0">
              Sinkron Otomatis
            </span>
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Penilaian Rekaman & Sub-Aspek</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
