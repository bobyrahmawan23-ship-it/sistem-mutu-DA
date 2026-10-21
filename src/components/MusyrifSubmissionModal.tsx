import React, { useState, useEffect } from 'react';
import {
  BayatiStageId,
  TaskStatus,
  TeacherBayatiProfile,
  BayatiTaskSubmission,
} from '../types/bayatiCertification';
import { BAYATI_STAGES } from '../data/bayatiCertificationData';
import {
  X,
  UserCheck,
  PlusCircle,
  Save,
  Music,
  CheckCircle2,
  Clock,
  AlertCircle,
  UploadCloud,
  FileAudio,
  Calendar,
  Sparkles,
  Sliders,
  Check,
} from 'lucide-react';

interface MusyrifSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  bayatiProfiles: TeacherBayatiProfile[];
  initialTeacherId?: string;
  initialStageId?: BayatiStageId;
  onSave: (updatedProfiles: TeacherBayatiProfile[]) => void;
}

export const MusyrifSubmissionModal: React.FC<MusyrifSubmissionModalProps> = ({
  isOpen,
  onClose,
  bayatiProfiles,
  initialTeacherId,
  initialStageId,
  onSave,
}) => {
  if (!isOpen) return null;

  // Mode: select existing musyrif or create new musyrif
  const [isNewMusyrif, setIsNewMusyrif] = useState<boolean>(!initialTeacherId && bayatiProfiles.length === 0);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(
    initialTeacherId || (bayatiProfiles[0]?.teacherId ?? '')
  );

  // New Musyrif Form Data
  const [newMusyrifName, setNewMusyrifName] = useState('');
  const [newMusyrifUnit, setNewMusyrifUnit] = useState('SD');
  const [newMusyrifClass, setNewMusyrifClass] = useState('Tahsin & Tahfidz');
  const [newMusyrifPhone, setNewMusyrifPhone] = useState('0812-');
  const [assignedMusyrif, setAssignedMusyrif] = useState('Ustadz Drs. H. Syamsul Arifin, M.Ag.');

  // Input Mode: Single Stage or Multi-Stage Batch
  const [inputMode, setInputMode] = useState<'SINGLE_STAGE' | 'BATCH_ALL'>('SINGLE_STAGE');

  // Single Stage Form States
  const [selectedStageId, setSelectedStageId] = useState<BayatiStageId>(
    initialStageId || 'stage_doa_fatihah'
  );
  const [status, setStatus] = useState<TaskStatus>('LULUS');
  const [submissionDate, setSubmissionDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [score, setScore] = useState<number>(88);
  const [toneAccuracy, setToneAccuracy] = useState<number>(88);
  const [tajwidAccuracy, setTajwidAccuracy] = useState<number>(90);
  const [tempoStability, setTempoStability] = useState<number>(86);
  const [audioAttachmentName, setAudioAttachmentName] = useState<string>('Setoran_Bayati_Audio.mp3');
  const [evaluatorNotes, setEvaluatorNotes] = useState<string>(
    'Siklus 6 nada Bayati (Naik, Datar, Miring, Naik, Datar, Turun) telah dikerjakan dengan tartil & fashih.'
  );
  const [musyrifExaminer, setMusyrifExaminer] = useState<string>('Ustadz Drs. H. Syamsul Arifin, M.Ag.');
  const [musyrifExaminerNip, setMusyrifExaminerNip] = useState<string>('DA-SUP-042');

  // Batch Multi-Stage States
  const [batchStatus, setBatchStatus] = useState<Record<BayatiStageId, TaskStatus>>({
    stage_doa_fatihah: 'LULUS',
    stage_annas_alqariah: 'LULUS',
    stage_adiyat_asysyams: 'LULUS',
    stage_balad_alburuj: 'LULUS',
    stage_insyiqoq_abasa: 'LULUS',
    stage_naziat_annaba: 'LULUS',
  });
  const [batchScore, setBatchScore] = useState<number>(90);

  // Sync state when selected teacher changes
  useEffect(() => {
    if (!isNewMusyrif && selectedTeacherId) {
      const teacher = bayatiProfiles.find((t) => t.teacherId === selectedTeacherId);
      if (teacher) {
        if (teacher.assignedMusyrif) {
          setAssignedMusyrif(teacher.assignedMusyrif);
        }
        const currentSub = teacher.submissions[selectedStageId];
        if (currentSub) {
          setStatus(currentSub.status || 'LULUS');
          setScore(currentSub.score || 85);
          setToneAccuracy(currentSub.toneAccuracy || 85);
          setTajwidAccuracy(currentSub.tajwidAccuracy || 90);
          setTempoStability(currentSub.tempoStability || 85);
          setSubmissionDate(currentSub.submissionDate || new Date().toISOString().split('T')[0]);
          setEvaluatorNotes(currentSub.evaluatorNotes || '');
          setAudioAttachmentName(currentSub.audioAttachmentName || `Setoran_Bayati_${selectedStageId}.mp3`);
          if (currentSub.musyrifName) setMusyrifExaminer(currentSub.musyrifName);
        }
      }
    }
  }, [selectedTeacherId, selectedStageId, isNewMusyrif, bayatiProfiles]);

  const handleStageSelect = (stageId: BayatiStageId) => {
    setSelectedStageId(stageId);
    if (!isNewMusyrif) {
      const teacher = bayatiProfiles.find((t) => t.teacherId === selectedTeacherId);
      const sub = teacher?.submissions[stageId];
      if (sub) {
        setStatus(sub.status || 'LULUS');
        setScore(sub.score || 85);
        setToneAccuracy(sub.toneAccuracy || 85);
        setTajwidAccuracy(sub.tajwidAccuracy || 90);
        setTempoStability(sub.tempoStability || 85);
        setSubmissionDate(sub.submissionDate || new Date().toISOString().split('T')[0]);
        setEvaluatorNotes(sub.evaluatorNotes || '');
        setAudioAttachmentName(sub.audioAttachmentName || `Setoran_Bayati_${stageId}.mp3`);
      }
    }
  };

  const handleSetAllBatchStatus = (newStatus: TaskStatus) => {
    const updated = { ...batchStatus };
    BAYATI_STAGES.forEach((stg) => {
      updated[stg.id] = newStatus;
    });
    setBatchStatus(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let targetTeacher: TeacherBayatiProfile;
    let updatedProfiles = [...bayatiProfiles];

    if (isNewMusyrif) {
      if (!newMusyrifName.trim()) {
        alert('Mohon masukkan nama musyrif/pendidik.');
        return;
      }

      const newId = `t_${Date.now()}`;
      const emptySubs: Record<BayatiStageId, BayatiTaskSubmission> = {} as any;
      BAYATI_STAGES.forEach((s) => {
        emptySubs[s.id] = {
          stageId: s.id,
          status: 'BELUM_KIRIM',
        };
      });

      targetTeacher = {
        teacherId: newId,
        teacherName: newMusyrifName.trim(),
        unit: newMusyrifUnit,
        teachingClass: newMusyrifClass,
        phone: newMusyrifPhone,
        submissions: emptySubs,
        completedStagesCount: 0,
        averageScore: 0,
        isFullyCertified: false,
        assignedMusyrif,
        lastSubmissionDate: submissionDate,
      };

      updatedProfiles = [targetTeacher, ...updatedProfiles];
    } else {
      const existing = updatedProfiles.find((t) => t.teacherId === selectedTeacherId);
      if (!existing) return;
      targetTeacher = { ...existing };
    }

    // Apply submissions
    const newSubs = { ...targetTeacher.submissions };

    if (inputMode === 'SINGLE_STAGE') {
      newSubs[selectedStageId] = {
        stageId: selectedStageId,
        status,
        submissionDate,
        score: status === 'BELUM_KIRIM' ? 0 : score,
        toneAccuracy,
        tajwidAccuracy,
        tempoStability,
        audioAttachmentName,
        evaluatorNotes,
        evaluatedAt: new Date().toISOString().split('T')[0],
        musyrifName: musyrifExaminer,
        musyrifNip: musyrifExaminerNip,
      };
    } else {
      // BATCH ALL
      BAYATI_STAGES.forEach((stg) => {
        const stgStatus = batchStatus[stg.id];
        newSubs[stg.id] = {
          stageId: stg.id,
          status: stgStatus,
          submissionDate,
          score: stgStatus === 'BELUM_KIRIM' ? 0 : batchScore,
          toneAccuracy: batchScore,
          tajwidAccuracy: Math.min(100, batchScore + 2),
          tempoStability: Math.max(70, batchScore - 2),
          audioAttachmentName: `Setoran_Bayati_${stg.id}.mp3`,
          evaluatorNotes: `Tugas pengiriman klaster ${stg.title} telah diverifikasi dan dinilai oleh ${musyrifExaminer}.`,
          evaluatedAt: new Date().toISOString().split('T')[0],
          musyrifName: musyrifExaminer,
          musyrifNip: musyrifExaminerNip,
        };
      });
    }

    // Recalculate statistics
    const passedCount = Object.values(newSubs).filter((s) => s?.status === 'LULUS').length;
    const validScores = Object.values(newSubs)
      .map((s) => s?.score)
      .filter((sc): sc is number => typeof sc === 'number' && sc > 0);
    const avg =
      validScores.length > 0
        ? Math.round((validScores.reduce((a, b) => a + b, 0) / validScores.length) * 10) / 10
        : 0;

    const finalTeacher: TeacherBayatiProfile = {
      ...targetTeacher,
      submissions: newSubs,
      completedStagesCount: passedCount,
      averageScore: avg,
      isFullyCertified: passedCount === 6,
      assignedMusyrif: assignedMusyrif || musyrifExaminer,
      lastSubmissionDate: submissionDate,
    };

    const finalResult = updatedProfiles.map((tp) =>
      tp.teacherId === finalTeacher.teacherId ? finalTeacher : tp
    );

    onSave(finalResult);
    onClose();
  };

  const currentTeacherObj = !isNewMusyrif
    ? bayatiProfiles.find((t) => t.teacherId === selectedTeacherId)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[95vh] flex flex-col text-xs">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-white/10 text-emerald-300">
              <UploadCloud className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Input Data Musyrif & Tugas Pengiriman Irama Bayati</span>
                <span className="text-[10px] bg-emerald-400 text-emerald-950 font-black px-2 py-0.5 rounded-full">
                  6 Klaster Surat
                </span>
              </h2>
              <p className="text-[11px] text-emerald-200">
                Catat tugas setoran rekaman talaqqi, akurasi pola nada siklus Bayati, dan status kelulusan.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* 1. Mode: Pilih Musyrif Terdaftar vs Input Musyrif Baru */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>1. Identitas Musyrif / Pendidik yang Menyetorkan Tugas</span>
              </span>

              <div className="inline-flex p-0.5 bg-slate-200 rounded-lg">
                <button
                  type="button"
                  onClick={() => setIsNewMusyrif(false)}
                  className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    !isNewMusyrif ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Pilih Musyrif Terdaftar
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewMusyrif(true)}
                  className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    isNewMusyrif ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  + Musyrif Baru
                </button>
              </div>
            </div>

            {!isNewMusyrif ? (
              <div className="space-y-2">
                <label className="block text-[11px] text-slate-600 font-semibold">
                  Pilih Nama Musyrif:
                </label>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {bayatiProfiles.map((p) => (
                    <option key={p.teacherId} value={p.teacherId}>
                      {p.teacherName} — {p.unit} ({p.teachingClass}) • {p.completedStagesCount}/6 Lulus
                    </option>
                  ))}
                </select>

                {currentTeacherObj && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-[11px] text-emerald-900">
                    <span>
                      Status Saat Ini: <strong>{currentTeacherObj.completedStagesCount} dari 6 Klaster Selesai</strong>
                    </span>
                    <span className="font-black">Rata-rata: {currentTeacherObj.averageScore}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-slate-600 font-semibold mb-1">
                    Nama Lengkap Musyrif / Guru:
                  </label>
                  <input
                    type="text"
                    required
                    value={newMusyrifName}
                    onChange={(e) => setNewMusyrifName(e.target.value)}
                    placeholder="Contoh: Ustadz Muhammad Salman, S.Pd.I"
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-600 font-semibold mb-1">
                    Unit Jenjang:
                  </label>
                  <input
                    type="text"
                    value={newMusyrifUnit}
                    onChange={(e) => setNewMusyrifUnit(e.target.value)}
                    placeholder="e.g. SD, SMP, SMA, Ma'had, TK"
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-600 font-semibold mb-1">
                    Kelas / Halaqah Binaan:
                  </label>
                  <input
                    type="text"
                    value={newMusyrifClass}
                    onChange={(e) => setNewMusyrifClass(e.target.value)}
                    placeholder="e.g. Tahsin & Tahfidz Al-Qur'an"
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-600 font-semibold mb-1">
                    No. WhatsApp / HP:
                  </label>
                  <input
                    type="text"
                    value={newMusyrifPhone}
                    onChange={(e) => setNewMusyrifPhone(e.target.value)}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-600 font-semibold mb-1">
                    Musyrif Pembimbing / Penguji Utama:
                  </label>
                  <input
                    type="text"
                    value={assignedMusyrif}
                    onChange={(e) => setAssignedMusyrif(e.target.value)}
                    placeholder="Nama Musyrif Pembimbing"
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 2. Mode Input: Per Tahapan vs Input Multi-Tahapan */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Music className="w-4 h-4 text-emerald-600" />
              <span>2. Detail Pengerjaan & Pengiriman Tugas Bayati</span>
            </span>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setInputMode('SINGLE_STAGE')}
                className={`px-3 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                  inputMode === 'SINGLE_STAGE'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Input Per Klaster
              </button>
              <button
                type="button"
                onClick={() => setInputMode('BATCH_ALL')}
                className={`px-3 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                  inputMode === 'BATCH_ALL'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Input 6 Klaster Sekaligus (Cepat)
              </button>
            </div>
          </div>

          {/* Single Stage Form */}
          {inputMode === 'SINGLE_STAGE' ? (
            <div className="space-y-4">
              {/* Select Stage Buttons */}
              <div className="space-y-1.5">
                <label className="block text-[11px] text-slate-600 font-semibold">
                  Pilih Klaster Surat yang Dikerjakan:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {BAYATI_STAGES.map((stg) => {
                    const isSelected = selectedStageId === stg.id;
                    return (
                      <button
                        key={stg.id}
                        type="button"
                        onClick={() => handleStageSelect(stg.id)}
                        className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-extrabold">{stg.order}. {stg.title}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                        </div>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {stg.surahRange}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status & Tanggal & Skor */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-600 font-semibold mb-1">
                    Status Tugas Pengiriman:
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900"
                  >
                    <option value="LULUS">✅ LULUS (Tuntas Standar)</option>
                    <option value="PROSES_REVIEW">⏳ PROSES REVIEW (Sedang Ditashih)</option>
                    <option value="REVISI">⚠️ PERLU REVISI TALAQQI</option>
                    <option value="BELUM_KIRIM">❌ BELUM KIRIM TUGAS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-600 font-semibold mb-1">
                    Tanggal Pengerjaan/Setor:
                  </label>
                  <input
                    type="date"
                    value={submissionDate}
                    onChange={(e) => setSubmissionDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-600 font-semibold mb-1">
                    Nilai Irama Bayati (0 - 100):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={score}
                    onChange={(e) => setScore(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-black text-emerald-800 text-sm"
                  />
                </div>
              </div>

              {/* 3 Parameter Rincian Nada Bayati */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="font-bold text-slate-700 block text-[11px]">
                  Rincian Parameter Irama Bayati (Pola 6 Nada):
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">
                      Akurasi 6 Nada Bayati:
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={toneAccuracy}
                      onChange={(e) => setToneAccuracy(Number(e.target.value))}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded-lg font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">
                      Tajwid & Makhraj:
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={tajwidAccuracy}
                      onChange={(e) => setTajwidAccuracy(Number(e.target.value))}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded-lg font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">
                      Tempo & Ketukan:
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={tempoStability}
                      onChange={(e) => setTempoStability(Number(e.target.value))}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded-lg font-bold text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Lampiran Audio & Musyrif Penguji */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-600 font-semibold mb-1 flex items-center gap-1">
                    <FileAudio className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Nama Berkas / Rekaman Setoran:</span>
                  </label>
                  <input
                    type="text"
                    value={audioAttachmentName}
                    onChange={(e) => setAudioAttachmentName(e.target.value)}
                    placeholder="Contoh: Setoran_Bayati_Fatihah_01.mp3"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-600 font-semibold mb-1">
                    Musyrif / Supervisor Penguji:
                  </label>
                  <input
                    type="text"
                    value={musyrifExaminer}
                    onChange={(e) => setMusyrifExaminer(e.target.value)}
                    placeholder="Nama Musyrif Penguji"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-semibold"
                  />
                </div>
              </div>

              {/* Catatan Evaluasi */}
              <div>
                <label className="block text-[11px] text-slate-600 font-semibold mb-1">
                  Catatan Evaluasi / Koreksi Nada Bayati:
                </label>
                <textarea
                  rows={2}
                  value={evaluatorNotes}
                  onChange={(e) => setEvaluatorNotes(e.target.value)}
                  placeholder="Catatan fashohah, ketepatan nada miring, atau penguasaan nada jawab..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          ) : (
            /* Multi-Stage Batch Input */
            <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                <div>
                  <span className="font-bold text-slate-800 block text-xs">
                    Pengisian Tugas Sekaligus (6 Klaster Surat):
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Sangat praktis untuk musyrif yang telah menyelesaikan seluruh setoran tugas sertifikasi.
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSetAllBatchStatus('LULUS')}
                    className="px-2.5 py-1 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-[10px] cursor-pointer"
                  >
                    ✓ Tandai Semua LULUS (6/6)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetAllBatchStatus('PROSES_REVIEW')}
                    className="px-2.5 py-1 rounded bg-sky-100 hover:bg-sky-200 text-sky-800 font-bold text-[10px] cursor-pointer"
                  >
                    ⏳ Semua Review
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pb-2">
                <div>
                  <label className="text-[10px] text-slate-600 font-semibold block mb-0.5">
                    Tanggal Pengiriman Bersama:
                  </label>
                  <input
                    type="date"
                    value={submissionDate}
                    onChange={(e) => setSubmissionDate(e.target.value)}
                    className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-600 font-semibold block mb-0.5">
                    Nilai Rata-rata Keseluruhan:
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={batchScore}
                    onChange={(e) => setBatchScore(Number(e.target.value))}
                    className="w-full p-1.5 bg-white border border-slate-300 rounded-lg font-bold text-emerald-800 text-xs"
                  />
                </div>
              </div>

              {/* 6 Stage Rows */}
              <div className="space-y-1.5">
                {BAYATI_STAGES.map((stg) => (
                  <div
                    key={stg.id}
                    className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div className="truncate max-w-[260px]">
                      <span className="font-bold text-slate-900 block truncate">
                        {stg.order}. {stg.title}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {stg.surahRange}
                      </span>
                    </div>

                    <select
                      value={batchStatus[stg.id]}
                      onChange={(e) =>
                        setBatchStatus((prev) => ({
                          ...prev,
                          [stg.id]: e.target.value as TaskStatus,
                        }))
                      }
                      className="p-1 bg-slate-50 border border-slate-300 rounded font-semibold text-xs"
                    >
                      <option value="LULUS">✅ LULUS</option>
                      <option value="PROSES_REVIEW">⏳ PROSES REVIEW</option>
                      <option value="REVISI">⚠️ PERLU REVISI</option>
                      <option value="BELUM_KIRIM">❌ BELUM KIRIM</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <span className="text-[11px] text-slate-500 italic">
              Data tugas pengiriman akan langsung terbarui di tabel & grafik.
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Tugas Pengiriman Musyrif</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
