import React, { useState } from 'react';
import { TeacherProfile, EvaluationRecord, DailyQuranLog, CriterionScore } from '../types/competency';
import { CRITERIA_DEFINITIONS, QUALITY_CATEGORIES } from '../data/criteriaData';
import { RadarChart } from './RadarChart';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  TrendingUp,
  PlusCircle,
  FileText,
  Target,
  ArrowRight,
  ShieldCheck,
  FileDown,
} from 'lucide-react';

interface TeacherDashboardProps {
  teacher: TeacherProfile;
  currentEvaluation: EvaluationRecord;
  dailyLogs: DailyQuranLog[];
  onAddDailyLog: (log: DailyQuranLog) => void;
  onUpdateSelfAssessment: (selfScores: CriterionScore[]) => void;
  onOpenReportModal: () => void;
  onOpenPdfExport?: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  teacher,
  currentEvaluation,
  dailyLogs,
  onAddDailyLog,
  onUpdateSelfAssessment,
  onOpenReportModal,
  onOpenPdfExport,
}) => {
  const [activeTab, setActiveTab] = useState<'RADAR_AND_GAP' | 'DAILY_JOURNAL' | 'SELF_ASSESSMENT'>('RADAR_AND_GAP');

  // Form state for new daily log
  const [newLogPages, setNewLogPages] = useState(20);
  const [newLogMurojaah, setNewLogMurojaah] = useState('Juz 30 (Surat An-Naba s.d An-Nas)');
  const [newLogZiyadah, setNewLogZiyadah] = useState(15);
  const [newLogNotes, setNewLogNotes] = useState('');
  const [isAddingLog, setIsAddingLog] = useState(false);

  // Self assessment state
  const [selfScoresState, setSelfScoresState] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    CRITERIA_DEFINITIONS.forEach((c) => {
      const match = currentEvaluation.selfScores?.find((s) => s.criterionId === c.id);
      init[c.id] = match ? match.score : 80;
    });
    return init;
  });

  const selfScoresList: CriterionScore[] = CRITERIA_DEFINITIONS.map((c) => ({
    criterionId: c.id,
    score: selfScoresState[c.id] ?? 80,
  }));

  const handleSelfScoreChange = (critId: string, val: number) => {
    setSelfScoresState((prev) => ({
      ...prev,
      [critId]: Math.min(100, Math.max(0, val)),
    }));
  };

  const handleSaveSelfAssessment = () => {
    onUpdateSelfAssessment(selfScoresList);
    setActiveTab('RADAR_AND_GAP');
  };

  const handleCreateDailyLog = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: DailyQuranLog = {
      id: `log_${Date.now()}`,
      teacherId: teacher.id,
      date: new Date().toISOString().split('T')[0],
      tilawahPages: Number(newLogPages),
      murojaahJuz: newLogMurojaah,
      ziyadahAyatCount: Number(newLogZiyadah),
      targetAchieved: Number(newLogPages) >= 20,
      notes: newLogNotes || 'Tilawah dan murojaah harian telah tuntas dilaksanakan.',
    };
    onAddDailyLog(newLog);
    setIsAddingLog(false);
    setNewLogNotes('');
  };

  const catMeta = QUALITY_CATEGORIES[currentEvaluation.qualityCategory];

  // Calculate self average
  const selfAvg = Math.round(
    selfScoresList.reduce((acc, c) => acc + c.score, 0) / selfScoresList.length
  );

  return (
    <div className="space-y-6">
      {/* 1. Welcoming Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 sm:p-8 shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Portal Guru Al-Qur'an MTQ Darul Abidin</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Ahlan wa Sahlan, {teacher.name}, {teacher.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Pantau kemajuan tilawah harian, kelancaran hafalan mutqin, dan capaian 9 indikator kompetensi pengajaran Al-Qur'an Anda.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-200">
              <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                Hafalan: <strong>{teacher.hafalanCountJuz} Juz Mutqin</strong>
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                Status Maqdis:{' '}
                <strong>{teacher.certifiedMaqdis ? 'Tersertifikasi' : 'Dalam Proses'}</strong>
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                Unit: <strong>{teacher.unit} ({teacher.teachingClass})</strong>
              </span>
            </div>
          </div>

          {/* Quick Score Card */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex flex-col items-center text-center shrink-0 min-w-[180px]">
            <span className="text-xs text-emerald-200 font-semibold uppercase">
              Nilai Mutu Terakhir
            </span>
            <div className="text-3xl font-black text-white my-1">{currentEvaluation.overallScore}</div>
            <span
              className={`text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase border ${catMeta.badgeBg}`}
            >
              {catMeta.label}
            </span>
            <div className="flex flex-col gap-1.5 w-full mt-3">
              <button
                type="button"
                onClick={onOpenReportModal}
                className="w-full px-3 py-1.5 rounded-xl bg-white text-emerald-950 font-bold text-xs flex items-center justify-center gap-1 hover:bg-emerald-50 transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Lihat Raport Resmi</span>
              </button>

              {onOpenPdfExport && (
                <button
                  type="button"
                  onClick={onOpenPdfExport}
                  className="w-full px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Unduh PDF Grafik</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('RADAR_AND_GAP')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'RADAR_AND_GAP'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Visualisasi Radar & Gap Analysis
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('DAILY_JOURNAL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'DAILY_JOURNAL'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Jurnal Tilawah & Muroja'ah Harian</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('SELF_ASSESSMENT')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'SELF_ASSESSMENT'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>Form Self-Assessment (Evaluasi Mandiri)</span>
        </button>
      </div>

      {/* 3. Tab Content 1: Radar & Gap Analysis */}
      {activeTab === 'RADAR_AND_GAP' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Radar Chart (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Grafik Radar: Perbandingan Nilai Supervisi vs Evaluasi Mandiri
                </h3>
                <p className="text-xs text-slate-500">
                  Garis hijau tebal merepresentasikan penilaian supervisor; garis biru putus-putus merepresentasikan evaluasi mandiri Anda.
                </p>
              </div>
              {onOpenPdfExport && (
                <button
                  type="button"
                  onClick={onOpenPdfExport}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
                >
                  <FileDown className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Download PDF Grafik</span>
                </button>
              )}
            </div>

            <div className="flex justify-center">
              <RadarChart
                primaryScores={currentEvaluation.scores}
                primaryLabel="Nilai Supervisor"
                secondaryScores={selfScoresList}
                secondaryLabel="Evaluasi Mandiri (Self)"
                size={450}
              />
            </div>
          </div>

          {/* Gap Analysis & Action Roadmap (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Gap Analysis Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-600" />
                <span>Analisis Kesenjangan (Gap Analysis)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Menemukan selisih antara persepsi diri dan observasi supervisor untuk menyelaraskan ekspektasi mutu.
              </p>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 text-xs">
                {CRITERIA_DEFINITIONS.map((crit) => {
                  const supScore =
                    currentEvaluation.scores.find((s) => s.criterionId === crit.id)?.score ?? 0;
                  const myScore = selfScoresState[crit.id] ?? 0;
                  const gap = supScore - myScore;

                  return (
                    <div
                      key={crit.id}
                      className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-slate-800">
                          {crit.code}. {crit.shortName}
                        </span>
                        <div className="text-[11px] text-slate-400">
                          Supervisor: <strong className="text-emerald-700">{supScore}</strong> | Diri:{' '}
                          <strong className="text-sky-700">{myScore}</strong>
                        </div>
                      </div>

                      <span
                        className={`text-xs font-extrabold px-2 py-0.5 rounded ${
                          gap === 0
                            ? 'bg-slate-200 text-slate-700'
                            : gap > 0
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {gap === 0 ? 'Sesuai' : gap > 0 ? `+${gap} (Optimis)` : `${gap} (Kritis)`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Target Roadmap Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 p-5 shadow-xs space-y-3 text-xs">
              <h3 className="font-bold text-emerald-950 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-700" />
                <span>Target Peningkatan Kompetensi Selanjutnya:</span>
              </h3>

              <div className="space-y-2">
                {currentEvaluation.recommendedPrograms.map((prog, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white rounded-xl border border-emerald-200/80 shadow-xs flex items-start gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900">{prog}</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Fokus semester ini untuk mencapai predikat Mumtaz mutlak.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Tab Content 2: Daily Quran Journal */}
      {activeTab === 'DAILY_JOURNAL' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>Mutabaah Yaumiyyah (Jurnal Tilawah & Muroja'ah Harian)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Pencatatan istiqamah membaca Al-Qur'an harian (minimal 1 juz/hari atau 20 halaman).
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddingLog(true)}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Isi Jurnal Hari Ini</span>
            </button>
          </div>

          {/* New Log Input Form Modal/Box */}
          {isAddingLog && (
            <form
              onSubmit={handleCreateDailyLog}
              className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200 space-y-4 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-950 text-sm">
                  Input Capaian Tilawah & Muroja'ah Harian:
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingLog(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Jumlah Halaman Tilawah:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newLogPages}
                    onChange={(e) => setNewLogPages(Number(e.target.value))}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    (Target standar MTQ: 20 halaman / 1 Juz)
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Juz Muroja'ah:
                  </label>
                  <input
                    type="text"
                    value={newLogMurojaah}
                    onChange={(e) => setNewLogMurojaah(e.target.value)}
                    placeholder="Contoh: Juz 30 / Juz 29"
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Ziyadah (Ayat Baru):
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newLogZiyadah}
                    onChange={(e) => setNewLogZiyadah(Number(e.target.value))}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Catatan Fashohah / Refleksi:
                </label>
                <input
                  type="text"
                  value={newLogNotes}
                  onChange={(e) => setNewLogNotes(e.target.value)}
                  placeholder="Contoh: Tasmi mandiri bakda Subuh, pengulangan makhraj huruf istila..."
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingLog(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-700 text-white font-bold hover:bg-emerald-800"
                >
                  Simpan Jurnal
                </button>
              </div>
            </form>
          )}

          {/* Daily Logs Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Tilawah (Halaman)</th>
                  <th className="px-4 py-3">Muroja'ah Juz</th>
                  <th className="px-4 py-3">Ziyadah</th>
                  <th className="px-4 py-3">Status Target</th>
                  <th className="px-4 py-3">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dailyLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-semibold text-slate-900">{log.date}</td>
                    <td className="px-4 py-3 font-bold text-emerald-800">
                      {log.tilawahPages} Halaman ({Math.round((log.tilawahPages / 20) * 10) / 10} Juz)
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">{log.murojaahJuz}</td>
                    <td className="px-4 py-3 text-slate-600">{log.ziyadahAyatCount} Ayat</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.targetAchieved
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {log.targetAchieved ? '✅ Target Tuntas' : '⚠️ Di Bawah 1 Juz'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 italic max-w-xs truncate">
                      {log.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Tab Content 3: Self-Assessment Form */}
      {activeTab === 'SELF_ASSESSMENT' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Formulir Evaluasi Diri (Self-Assessment) Guru
              </h3>
              <p className="text-xs text-slate-500">
                Lakukan muhasabah dan penilaian objektif mandiri terhadap 9 indikator kompetensi MTQ Darul Abidin.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-500">Rata-Rata Mandiri:</span>
              <span className="text-xl font-black text-sky-700">{selfAvg} Pts</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CRITERIA_DEFINITIONS.map((crit) => {
              const val = selfScoresState[crit.id] ?? 80;

              return (
                <div
                  key={crit.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">
                      {crit.code}. {crit.name}
                    </span>
                    <span className="font-extrabold text-sky-800 bg-sky-100 px-2 py-0.5 rounded">
                      {val} Pts
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">{crit.description}</p>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={val}
                    onChange={(e) => handleSelfScoreChange(crit.id, Number(e.target.value))}
                    className="w-full accent-sky-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Kurang (&lt;60)</span>
                    <span>Cukup (60-75)</span>
                    <span>Bermutu (76-88)</span>
                    <span>Mumtaz (89-100)</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button
              type="button"
              onClick={handleSaveSelfAssessment}
              className="px-6 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              Simpan & Perbarui Radar Evaluasi Mandiri
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
