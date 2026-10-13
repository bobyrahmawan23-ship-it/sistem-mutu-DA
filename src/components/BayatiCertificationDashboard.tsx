import React, { useState } from 'react';
import {
  BayatiStageDefinition,
  BayatiStageId,
  TeacherBayatiProfile,
  TaskStatus,
} from '../types/bayatiCertification';
import { BAYATI_STAGES } from '../data/bayatiCertificationData';
import { BayatiShareModal } from './BayatiShareModal';
import { BayatiCertificateModal } from './BayatiCertificateModal';
import { BayatiToneWaveDiagram } from './BayatiToneWaveDiagram';
import { exportElementAsPng } from '../utils/exportUtils';
import {
  Music,
  Award,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Share2,
  Image as ImageIcon,
  FileDown,
  Printer,
  Search,
  Filter,
  MessageCircle,
  Edit3,
  Sliders,
  Check,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface BayatiCertificationDashboardProps {
  bayatiProfiles: TeacherBayatiProfile[];
  onUpdateBayatiProfiles: (profiles: TeacherBayatiProfile[]) => void;
}

export const BayatiCertificationDashboard: React.FC<BayatiCertificationDashboardProps> = ({
  bayatiProfiles,
  onUpdateBayatiProfiles,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [unitFilter, setUnitFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals & Active Sharing
  const [sharingTeacher, setSharingTeacher] = useState<TeacherBayatiProfile | null>(null);
  const [sharingStageId, setSharingStageId] = useState<BayatiStageId | undefined>(undefined);
  const [certificateTeacher, setCertificateTeacher] = useState<TeacherBayatiProfile | null>(null);

  // Evaluation Edit Modal State
  const [evaluatingTeacher, setEvaluatingTeacher] = useState<TeacherBayatiProfile | null>(null);
  const [evaluatingStageId, setEvaluatingStageId] = useState<BayatiStageId>('stage_doa_fatihah');
  const [evalScore, setEvalScore] = useState<number>(85);
  const [evalStatus, setEvalStatus] = useState<TaskStatus>('LULUS');
  const [evalNotes, setEvalNotes] = useState<string>('Nada Bayati fasih, transisi nada jawab rapi.');

  const [isExportingAllChart, setIsExportingAllChart] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Filtered teachers list
  const filteredProfiles = bayatiProfiles.filter((t) => {
    const matchesSearch = t.teacherName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUnit = unitFilter === 'ALL' || t.unit === unitFilter;
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'CERTIFIED' && t.isFullyCertified) ||
      (statusFilter === 'IN_PROGRESS' && !t.isFullyCertified);

    return matchesSearch && matchesUnit && matchesStatus;
  });

  // Institution aggregates
  const totalTeachers = bayatiProfiles.length;
  const certifiedCount = bayatiProfiles.filter((t) => t.isFullyCertified).length;
  const inProgressCount = totalTeachers - certifiedCount;

  // Stage completion statistics (Count who completed each stage)
  const stageStats = BAYATI_STAGES.map((stg) => {
    const lulusCount = bayatiProfiles.filter((t) => t.submissions[stg.id]?.status === 'LULUS').length;
    const reviewCount = bayatiProfiles.filter((t) => t.submissions[stg.id]?.status === 'PROSES_REVIEW').length;
    const revisiCount = bayatiProfiles.filter((t) => t.submissions[stg.id]?.status === 'REVISI').length;
    const belumCount = bayatiProfiles.filter(
      (t) => !t.submissions[stg.id] || t.submissions[stg.id]?.status === 'BELUM_KIRIM'
    ).length;

    return {
      stage: stg,
      lulusCount,
      reviewCount,
      revisiCount,
      belumCount,
      submissionRate: Math.round(((lulusCount + reviewCount + revisiCount) / totalTeachers) * 100),
      passRate: Math.round((lulusCount / totalTeachers) * 100),
    };
  });

  // Handle Save Evaluation
  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluatingTeacher) return;

    const updated = bayatiProfiles.map((tp) => {
      if (tp.teacherId === evaluatingTeacher.teacherId) {
        const newSubs = {
          ...tp.submissions,
          [evaluatingStageId]: {
            ...tp.submissions[evaluatingStageId],
            stageId: evaluatingStageId,
            status: evalStatus,
            score: evalScore,
            evaluatorNotes: evalNotes,
            evaluatedAt: new Date().toISOString().split('T')[0],
          },
        };

        // Recalculate completed & average
        const passedStages = Object.values(newSubs).filter((s) => s?.status === 'LULUS').length;
        const validScores = Object.values(newSubs)
          .map((s) => s?.score)
          .filter((sc): sc is number => typeof sc === 'number' && sc > 0);
        const avg =
          validScores.length > 0
            ? Math.round((validScores.reduce((a, b) => a + b, 0) / validScores.length) * 10) / 10
            : 0;

        return {
          ...tp,
          submissions: newSubs,
          completedStagesCount: passedStages,
          averageScore: avg,
          isFullyCertified: passedStages === 6,
        };
      }
      return tp;
    });

    onUpdateBayatiProfiles(updated);
    showToast(`Penilaian ${evaluatingTeacher.teacherName} berhasil disimpan.`);
    setEvaluatingTeacher(null);
  };

  // Export full collective chart as PNG
  const handleExportCollectivePng = async () => {
    setIsExportingAllChart(true);
    await exportElementAsPng(
      'collective-bayati-chart',
      `Rekap_Grafik_Sertifikasi_Bayati_Seluruh_Guru_MTQ_Darul_Abidin`
    );
    setIsExportingAllChart(false);
  };

  // Share overall collective summary to WhatsApp / Group
  const handleShareCollectiveToWA = () => {
    const textMsg =
      `*REKAPITULASI PROGRES SERTIFIKASI IRAMA BAYATI SELURUH GURU*\n` +
      `*MTQ DARUL ABIDIN*\n\n` +
      `📊 *Status Lembaga:*\n` +
      `• Total Guru Diuji: ${totalTeachers} Guru\n` +
      `• Lulus Penuh (6 Klaster): ${certifiedCount} Guru (${Math.round((certifiedCount / totalTeachers) * 100)}%)\n` +
      `• Dalam Proses/Revisi: ${inProgressCount} Guru\n\n` +
      `📈 *Tingkat Pengiriman & Kelulusan per Klaster Surat:*\n` +
      stageStats
        .map(
          (s, i) =>
            `${i + 1}. ${s.stage.title}: ${s.lulusCount}/${totalTeachers} Lulus (${s.passRate}%)`
        )
        .join('\n') +
      `\n\n_Lembaga Penjaminan Mutu MTQ Yayasan Darul Abidin_`;

    window.open(`https://wa.me/?text=${encodeURIComponent(textMsg)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-800 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold animate-fade-in border border-emerald-600">
          <Check className="w-4 h-4 text-emerald-300" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold">
              <Music className="w-3.5 h-3.5" />
              <span>Program Sertifikasi Irama Bayati Guru Al-Qur'an</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Evaluasi & Pengiriman Tugas 6 Klaster Irama Bayati
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Memantau penyelesaian tugas setoran irama Bayati mulai dari <strong>Doa Belajar & Al-Fatihah</strong> hingga <strong>An-Nazi'at s.d. An-Naba'</strong>.
              Supervisor dapat mengirimkan hasil evaluasi per sub/surat langsung ke guru.
            </p>
          </div>

          {/* Collective Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0">
            <button
              type="button"
              onClick={handleExportCollectivePng}
              disabled={isExportingAllChart}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Unduh Grafik Batang Seluruh Guru sebagai Foto (PNG)"
            >
              <ImageIcon className="w-3.5 h-3.5 text-emerald-300" />
              <span>{isExportingAllChart ? 'Memproses...' : 'Unduh Foto Grafik'}</span>
            </button>

            <button
              type="button"
              onClick={handleShareCollectiveToWA}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              title="Bagikan Ringkasan Rekap ke Grup WhatsApp / Pimpinan"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Bagikan Rekap ke WA</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Metric Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shrink-0">
            {totalTeachers}
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium">Total Guru Diuji</span>
            <div className="text-base font-black text-slate-900">{totalTeachers} Guru</div>
            <span className="text-[10px] text-emerald-700 font-semibold">Semua Unit MTQ</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium">Lulus Penuh (6 Surat)</span>
            <div className="text-base font-black text-emerald-700">{certifiedCount} Guru</div>
            <span className="text-[10px] text-emerald-600 font-bold">
              {Math.round((certifiedCount / totalTeachers) * 100)}% Tersertifikasi
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium">Dalam Proses / Revisi</span>
            <div className="text-base font-black text-amber-700">{inProgressCount} Guru</div>
            <span className="text-[10px] text-amber-600 font-semibold">Perlu Pendampingan</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium">Materi Pembuka (Fatihah)</span>
            <div className="text-base font-black text-slate-900">
              {stageStats[0].lulusCount}/{totalTeachers} Lulus
            </div>
            <span className="text-[10px] text-sky-600 font-bold">100% Kepatuhan Awal</span>
          </div>
        </div>
      </div>

      {/* 3. Siklus Nada Irama Bayati: Pola Baku Naik, Datar, Miring, Naik, Datar, Turun */}
      <BayatiToneWaveDiagram />

      {/* 4. Collective Bar Chart: Status Pengerjaan & Pengiriman Seluruh Guru */}
      <div
        id="collective-bayati-chart"
        className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Music className="w-4 h-4 text-emerald-600" />
              <span>Grafik Batang Ketuntasan 6 Klaster Surat Seluruh Guru</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Menampilkan rasio guru yang sudah mengirimkan & lulus tugas sertifikasi irama Bayati untuk masing-masing klaster surat.
            </p>
          </div>

          {/* Chart Legend */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block"></span> Lulus (Sesuai Standar)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-sky-500 inline-block"></span> Sedang Direview
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-amber-500 inline-block"></span> Perlu Revisi
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-slate-200 inline-block"></span> Belum Kirim Tugas
            </span>
          </div>
        </div>

        {/* 6 Stage Cumulative Progress Bars */}
        <div className="space-y-4">
          {stageStats.map((stat, idx) => {
            const lulusPct = (stat.lulusCount / totalTeachers) * 100;
            const reviewPct = (stat.reviewCount / totalTeachers) * 100;
            const revisiPct = (stat.revisiCount / totalTeachers) * 100;
            const belumPct = (stat.belumCount / totalTeachers) * 100;

            return (
              <div key={stat.stage.id} className="space-y-1.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-slate-900">{stat.stage.title}</span>
                    <span className="text-[11px] text-slate-400 hidden md:inline">
                      ({stat.stage.surahRange})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-semibold">
                    <span className="text-emerald-700">{stat.lulusCount} Lulus</span>
                    {stat.reviewCount > 0 && (
                      <span className="text-sky-600">• {stat.reviewCount} Review</span>
                    )}
                    {stat.revisiCount > 0 && (
                      <span className="text-amber-600">• {stat.revisiCount} Revisi</span>
                    )}
                    {stat.belumCount > 0 && (
                      <span className="text-slate-400">• {stat.belumCount} Belum Kirim</span>
                    )}
                    <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      {stat.passRate}% Lulus
                    </span>
                  </div>
                </div>

                {/* Stacked Multi-Color Segment Bar */}
                <div className="h-4 w-full bg-slate-100 rounded-full flex overflow-hidden shadow-2xs">
                  <div
                    style={{ width: `${lulusPct}%` }}
                    className="bg-emerald-500 hover:bg-emerald-600 transition-all"
                    title={`Lulus: ${stat.lulusCount} Guru (${Math.round(lulusPct)}%)`}
                  />
                  <div
                    style={{ width: `${reviewPct}%` }}
                    className="bg-sky-500 hover:bg-sky-600 transition-all"
                    title={`Sedang Direview: ${stat.reviewCount} Guru`}
                  />
                  <div
                    style={{ width: `${revisiPct}%` }}
                    className="bg-amber-400 hover:bg-amber-500 transition-all"
                    title={`Perlu Revisi: ${stat.revisiCount} Guru`}
                  />
                  <div
                    style={{ width: `${belumPct}%` }}
                    className="bg-slate-200 transition-all"
                    title={`Belum Mengirimkan: ${stat.belumCount} Guru`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Table: Detail Setoran Tugas Seluruh Guru & Tombol Kirim per Sub/Surat */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Rekapitulasi Tugas Pendidik & Pengiriman Evaluasi Personal
            </h3>
            <p className="text-xs text-slate-500">
              Klik ikon status untuk menilai setoran, atau klik tombol <strong>Kirim Hasil Evaluasi</strong> untuk mengirimkan via WhatsApp/Word.
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari guru..."
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <select
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
            >
              <option value="ALL">Semua Unit</option>
              {Array.from(new Set(bayatiProfiles.map((p) => p.unit).filter(Boolean))).map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Teachers Table with 6 Surah Status Icons */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
              <tr>
                <th className="px-3 py-2.5">Nama Guru</th>
                <th className="px-2 py-2.5 text-center">1. Doa & Fatihah</th>
                <th className="px-2 py-2.5 text-center">2. An-Nas - Qari'ah</th>
                <th className="px-2 py-2.5 text-center">3. 'Adiyat - Syams</th>
                <th className="px-2 py-2.5 text-center">4. Balad - Buruj</th>
                <th className="px-2 py-2.5 text-center">5. Insyiqaq - 'Abasa</th>
                <th className="px-2 py-2.5 text-center">6. Nazi'at - Naba'</th>
                <th className="px-3 py-2.5 text-center">Skor Rata2</th>
                <th className="px-3 py-2.5 text-right">Kirim Hasil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProfiles.map((tp) => (
                <tr key={tp.teacherId} className="hover:bg-slate-50/70">
                  <td className="px-3 py-3">
                    <span className="font-bold text-slate-900 block">{tp.teacherName}</span>
                    <span className="text-[10px] text-slate-400">
                      {tp.unit} • {tp.teachingClass}
                    </span>
                  </td>

                  {/* 6 Stages Status Buttons */}
                  {BAYATI_STAGES.map((stg) => {
                    const sub = tp.submissions[stg.id];
                    const isPassed = sub?.status === 'LULUS';
                    const isReview = sub?.status === 'PROSES_REVIEW';
                    const isRevision = sub?.status === 'REVISI';

                    return (
                      <td key={stg.id} className="px-2 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setEvaluatingTeacher(tp);
                            setEvaluatingStageId(stg.id);
                            setEvalScore(sub?.score || 85);
                            setEvalStatus(sub?.status || 'LULUS');
                            setEvalNotes(sub?.evaluatorNotes || 'Nada Bayati telah dievaluasi.');
                          }}
                          className={`w-8 h-8 rounded-lg inline-flex items-center justify-center transition-all cursor-pointer ${
                            isPassed
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : isReview
                              ? 'bg-sky-100 text-sky-800 hover:bg-sky-200'
                              : isRevision
                              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                          title={`${stg.title}: ${sub?.status || 'BELUM KIRIM'} (Klik untuk nilai/review)`}
                        >
                          {isPassed && <CheckCircle2 className="w-4 h-4" />}
                          {isReview && <Clock className="w-4 h-4" />}
                          {isRevision && <AlertCircle className="w-4 h-4" />}
                          {!isPassed && !isReview && !isRevision && (
                            <span className="text-[10px] font-bold">-</span>
                          )}
                        </button>
                      </td>
                    );
                  })}

                  {/* Average Score */}
                  <td className="px-3 py-3 text-center">
                    <span className="font-black text-xs text-slate-900 block">
                      {tp.averageScore || '-'}
                    </span>
                    <span
                      className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase ${
                        tp.isFullyCertified
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {tp.completedStagesCount}/6 Lulus
                    </span>
                  </td>

                  {/* Actions: Send Evaluation Report (WhatsApp/Doc/Graphic) & Certificate */}
                  <td className="px-3 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setSharingTeacher(tp);
                          setSharingStageId('stage_doa_fatihah');
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                        title="Kirim hasil evaluasi ke guru via WhatsApp / Word / Foto"
                      >
                        <Share2 className="w-3 h-3" />
                        <span>Kirim</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCertificateTeacher(tp)}
                        className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer shadow-2xs transition-all ${
                          tp.isFullyCertified
                            ? 'bg-amber-400 hover:bg-amber-500 text-slate-950 font-black'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                        title="Terbitkan Sertifikat Sertifikasi Irama Bayati (edit nama mudir & supervisor)"
                      >
                        <Award className={`w-3.5 h-3.5 ${tp.isFullyCertified ? 'text-slate-950' : 'text-amber-600'}`} />
                        <span>Sertifikat</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Evaluation Review / Grading Modal */}
      {evaluatingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-xs">
            <div className="px-5 py-4 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Penilaian Tugas Sertifikasi Irama Bayati</h3>
                <p className="text-[11px] text-emerald-200">
                  Guru: {evaluatingTeacher.teacherName} ({evaluatingTeacher.unit})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEvaluatingTeacher(null)}
                className="text-emerald-200 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEvaluation} className="p-5 space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Pilih Tahapan / Klaster Surat:
                </label>
                <select
                  value={evaluatingStageId}
                  onChange={(e) => {
                    const stgId = e.target.value as BayatiStageId;
                    setEvaluatingStageId(stgId);
                    const sub = evaluatingTeacher.submissions[stgId];
                    setEvalScore(sub?.score || 85);
                    setEvalStatus(sub?.status || 'LULUS');
                    setEvalNotes(sub?.evaluatorNotes || '');
                  }}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900"
                >
                  {BAYATI_STAGES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.order}. {s.title} ({s.surahRange})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nilai Irama (0 - 100):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={evalScore}
                    onChange={(e) => setEvalScore(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-black text-base text-emerald-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Kelulusan:</label>
                  <select
                    value={evalStatus}
                    onChange={(e) => setEvalStatus(e.target.value as TaskStatus)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                  >
                    <option value="LULUS">✅ LULUS (Memenuhi Standar)</option>
                    <option value="PROSES_REVIEW">⏳ PROSES REVIEW</option>
                    <option value="REVISI">⚠️ PERLU REVISI TALAQQI</option>
                    <option value="BELUM_KIRIM">❌ BELUM KIRIM TUGAS</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Catatan Koreksi Fashohah & Tangga Nada Bayati:
                </label>
                <textarea
                  rows={3}
                  value={evalNotes}
                  onChange={(e) => setEvalNotes(e.target.value)}
                  placeholder="Contoh: Nada Qarar sudah stabil, perhatikan mad tabi'i saat nada naik..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEvaluatingTeacher(null)}
                  className="px-3.5 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                >
                  Simpan Hasil Penilaian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Active Share Modal per Sub/Surat */}
      {sharingTeacher && (
        <BayatiShareModal
          isOpen={Boolean(sharingTeacher)}
          onClose={() => setSharingTeacher(null)}
          teacher={sharingTeacher}
          initialStageId={sharingStageId}
        />
      )}

      {/* 7. Certificate Modal (Editable Mudir & Supervisor) */}
      {certificateTeacher && (
        <BayatiCertificateModal
          isOpen={Boolean(certificateTeacher)}
          onClose={() => setCertificateTeacher(null)}
          teacher={certificateTeacher}
        />
      )}
    </div>
  );
};
