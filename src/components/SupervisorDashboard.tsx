import React, { useState } from 'react';
import { CriterionDefinition, EvaluationRecord, TeacherProfile, CriterionScore } from '../types/competency';
import { QUALITY_CATEGORIES } from '../data/criteriaData';
import { RadarChart } from './RadarChart';
import { TrendLineChart } from './TrendLineChart';
import {
  Users,
  Award,
  AlertTriangle,
  TrendingUp,
  Search,
  Filter,
  FileText,
  Edit3,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Scale,
  CheckCircle2,
  ChevronRight,
  BookOpen,
  Sliders,
  Share2,
  Settings,
  FileDown,
  BarChart3,
} from 'lucide-react';

interface SupervisorDashboardProps {
  teachers: TeacherProfile[];
  evaluations: EvaluationRecord[];
  criteria: CriterionDefinition[];
  selectedTeacherId: string;
  onSelectTeacher: (id: string) => void;
  onOpenAssessmentModal: (teacherId?: string) => void;
  onOpenReportModal: (teacher: TeacherProfile, evalRecord: EvaluationRecord) => void;
  onOpenParameterDetail: (criterion: CriterionDefinition) => void;
  onOpenSettings: () => void;
  onOpenPdfExport?: (teacher: TeacherProfile, evalRecord: EvaluationRecord) => void;
}

export const SupervisorDashboard: React.FC<SupervisorDashboardProps> = ({
  teachers,
  evaluations,
  criteria,
  selectedTeacherId,
  onSelectTeacher,
  onOpenAssessmentModal,
  onOpenReportModal,
  onOpenParameterDetail,
  onOpenSettings,
  onOpenPdfExport,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<string>('ALL');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [isComparing, setIsComparing] = useState(false);
  const [compareTeacherId, setCompareTeacherId] = useState<string>('');
  const [activeTabDetail, setActiveTabDetail] = useState<'RADAR' | 'BAR_TREND' | 'INDIVIDUAL_CRITERIA_GRAPHS' | 'RUBRIC_DETAILS'>('RADAR');

  // Compute institution benchmark averages per criteria for active period
  const benchmarkScores: CriterionScore[] = criteria.map((crit) => {
    let total = 0;
    let count = 0;
    evaluations.forEach((rec) => {
      const match = rec.scores.find((s) => s.criterionId === crit.id);
      if (match) {
        total += match.score;
        count++;
      }
    });
    return {
      criterionId: crit.id,
      score: count > 0 ? Math.round((total / count) * 10) / 10 : 75,
    };
  });

  // Institution Overall Average
  const institutionAvg =
    evaluations.length > 0
      ? Math.round(
          (evaluations.reduce((acc, curr) => acc + curr.overallScore, 0) / evaluations.length) * 10
        ) / 10
      : 0;

  // Quality distribution counts
  const countMumtaz = evaluations.filter((e) => e.qualityCategory === 'MUMTAZ').length;
  const countJayyidJiddan = evaluations.filter((e) => e.qualityCategory === 'JAYYID_JIDDAN').length;
  const countJayyid = evaluations.filter((e) => e.qualityCategory === 'JAYYID').length;
  const countMaqbul = evaluations.filter((e) => e.qualityCategory === 'MAQBUL').length;

  // Filtered teachers list
  const filteredTeachers = teachers.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.nip.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.teachingClass.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesUnit = selectedUnit === 'ALL' || t.unit === selectedUnit;

    const teacherEval = evaluations.find((e) => e.teacherId === t.id);
    const matchesCat =
      selectedCategoryFilter === 'ALL' ||
      (teacherEval && teacherEval.qualityCategory === selectedCategoryFilter);

    return matchesSearch && matchesUnit && matchesCat;
  });

  // Selected teacher and their evaluation
  const activeTeacher = teachers.find((t) => t.id === selectedTeacherId) || teachers[0];
  const activeEval = evaluations.find((e) => e.teacherId === activeTeacher?.id) || evaluations[0];

  // Compare teacher evaluation (if comparison active)
  const compareTeacher = teachers.find((t) => t.id === compareTeacherId);
  const compareEval = evaluations.find((e) => e.teacherId === compareTeacher?.id);

  // Identify lowest and highest criteria in institution
  const sortedCriteriaAvg = [...benchmarkScores].sort((a, b) => a.score - b.score);
  const lowestCriterionObj = criteria.find((c) => c.id === sortedCriteriaAvg[0]?.criterionId);
  const highestCriterionObj = criteria.find(
    (c) => c.id === sortedCriteriaAvg[sortedCriteriaAvg.length - 1]?.criterionId
  );

  return (
    <div className="space-y-6">
      {/* 1. Header Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Teachers */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Total Guru Qur'an</span>
            <div className="text-xl sm:text-2xl font-black text-slate-900">{teachers.length} Guru</div>
            <span className="text-[10px] text-emerald-600 font-semibold">100% Terdaftar MTQ</span>
          </div>
        </div>

        {/* Institution Average Score */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Rata-Rata Lembaga</span>
            <div className="text-xl sm:text-2xl font-black text-slate-900">{institutionAvg} Pts</div>
            <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-1.5 py-0.5 rounded">
              Bermutu (Jayyid Jiddan)
            </span>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="w-full">
            <span className="text-xs text-slate-500 font-medium">Sebaran Predikat</span>
            <div className="flex items-center gap-2 mt-0.5 text-xs font-bold text-slate-800">
              <span className="text-emerald-700 font-bold" title="Mumtaz">{countMumtaz} Mumtaz</span>
              <span className="text-slate-300">•</span>
              <span className="text-teal-700" title="Jayyid Jiddan">{countJayyidJiddan} JJ</span>
              <span className="text-slate-300">•</span>
              <span className="text-amber-700" title="Jayyid">{countJayyid} Jayyid</span>
            </div>
            {/* Mini Progress Bar */}
            <div className="h-2 w-full bg-slate-100 rounded-full flex overflow-hidden mt-1.5">
              <div style={{ width: `${(countMumtaz / evaluations.length) * 100}%` }} className="bg-emerald-500" />
              <div style={{ width: `${(countJayyidJiddan / evaluations.length) * 100}%` }} className="bg-teal-500" />
              <div style={{ width: `${(countJayyid / evaluations.length) * 100}%` }} className="bg-amber-400" />
              <div style={{ width: `${(countMaqbul / evaluations.length) * 100}%` }} className="bg-rose-500" />
            </div>
          </div>
        </div>

        {/* Action Priority / Coaching Needed */}
        <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-xs flex items-center gap-3.5 bg-gradient-to-br from-white to-rose-50/40">
          <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Perlu Pembinaan</span>
            <div className="text-xl sm:text-2xl font-black text-rose-700">{countMaqbul} Guru</div>
            <span className="text-[10px] text-rose-600 font-semibold">Skor &lt; 60 (Prioritas)</span>
          </div>
        </div>
      </div>

      {/* 2. Actionable Insights Alert Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-white/10 text-emerald-300 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-wider bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-md">
                Rekomendasi Otomatis Lembaga (Actionable Insights)
              </span>
              <span className="text-xs text-slate-300">Hasil Analisis 9 Kriteria</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 mt-1">
              Aspek terendah lembaga saat ini:{' '}
              <strong className="text-amber-300">{lowestCriterionObj?.name}</strong> (Rata-rata:{' '}
              {sortedCriteriaAvg[0]?.score} Pts).
              <span className="block text-xs text-slate-300 mt-0.5">
                💡 Disarankan: <em>{lowestCriterionObj?.defaultRecommendation.title}</em> — {lowestCriterionObj?.defaultRecommendation.action}
              </span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onOpenAssessmentModal()}
          className="shrink-0 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
        >
          <Edit3 className="w-4 h-4" />
          <span>+ Input Nilai Asesmen Baru</span>
        </button>
      </div>

      {/* 3. Main Workspace Grid: Teachers List (Left) & Inspector Detail (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Teacher Selection & Filter (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              <span>Daftar Guru Al-Qur'an</span>
            </h3>
            <span className="text-xs font-semibold text-slate-400">
              {filteredTeachers.length} dari {teachers.length}
            </span>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama guru atau NIP..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {['ALL', ...Array.from(new Set(teachers.map((t) => t.unit).filter(Boolean)))].map((unit) => (
              <button
                key={unit}
                type="button"
                onClick={() => setSelectedUnit(unit)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  selectedUnit === unit
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {unit === 'ALL' ? 'Semua Unit' : unit}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1 text-[11px] overflow-x-auto pb-1">
            <span className="text-slate-400 shrink-0">Status:</span>
            {['ALL', 'MUMTAZ', 'JAYYID_JIDDAN', 'JAYYID', 'MAQBUL'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 cursor-pointer ${
                  selectedCategoryFilter === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'ALL'
                  ? 'Semua'
                  : cat === 'MUMTAZ'
                  ? 'Mumtaz'
                  : cat === 'JAYYID_JIDDAN'
                  ? 'Bermutu'
                  : cat === 'JAYYID'
                  ? 'Cukup'
                  : 'Perlu'}
              </button>
            ))}
          </div>

          {/* Teachers Scroll List */}
          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {filteredTeachers.map((t) => {
              const tEval = evaluations.find((e) => e.teacherId === t.id);
              const catMeta = tEval ? QUALITY_CATEGORIES[tEval.qualityCategory] : null;
              const isSelected = t.id === activeTeacher?.id;

              return (
                <div
                  key={t.id}
                  onClick={() => onSelectTeacher(t.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-50/80 border-emerald-500 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center text-xs shrink-0 ${
                        isSelected
                          ? 'bg-emerald-700 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {t.name
                        .split(' ')
                        .slice(1, 3)
                        .map((p) => p[0])
                        .join('')}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 text-xs">{t.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold">
                          {t.unit}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate max-w-[160px]">
                        {t.teachingClass}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    {tEval ? (
                      <>
                        <div className="text-sm font-extrabold text-slate-900">
                          {tEval.overallScore}
                        </div>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase inline-block border ${catMeta?.badgeBg}`}
                        >
                          {catMeta?.label}
                        </span>
                      </>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Belum Dinilai</span>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredTeachers.length === 0 && (
              <div className="p-6 text-center text-slate-400 text-xs">
                Tidak ada guru yang cocok dengan kriteria filter.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Selected Teacher Inspector & Charts (8 cols) */}
        {activeTeacher && activeEval && (
          <div className="lg:col-span-8 space-y-5">
            {/* Teacher Profile Summary Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                    {activeTeacher.name
                      .split(' ')
                      .slice(1, 3)
                      .map((p) => p[0])
                      .join('')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-extrabold text-slate-900">{activeTeacher.name}</h2>
                      <span className="text-xs text-slate-500">{activeTeacher.title}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span className="font-mono text-[11px]">NIP: {activeTeacher.nip}</span>
                      <span>•</span>
                      <span>Unit: {activeTeacher.unit}</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-semibold">
                        {activeTeacher.hafalanCountJuz} Juz Mutqin
                      </span>
                      <span>•</span>
                      <span>
                        {activeTeacher.certifiedMaqdis ? '✅ Sertifikasi Maqdis' : '❌ Belum Maqdis'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Score & Actions */}
                <div className="flex items-center gap-2 self-start sm:self-center">
                  <div className="text-right mr-2">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Skor MTQ
                    </span>
                    <span className="text-2xl font-black text-slate-900 leading-none">
                      {activeEval.overallScore}
                    </span>
                    <span
                      className={`block text-[10px] font-extrabold px-2 py-0.5 rounded-full border mt-0.5 ${
                        QUALITY_CATEGORIES[activeEval.qualityCategory].badgeBg
                      }`}
                    >
                      {QUALITY_CATEGORIES[activeEval.qualityCategory].label}
                    </span>
                  </div>

                  {onOpenPdfExport && (
                    <button
                      type="button"
                      onClick={() => onOpenPdfExport(activeTeacher, activeEval)}
                      className="px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                      title="Generate dan download PDF Laporan Grafik Radar & Bar Chart (jsPDF)"
                    >
                      <FileDown className="w-4 h-4 text-emerald-200" />
                      <span className="hidden sm:inline">Export PDF Grafik</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onOpenReportModal(activeTeacher, activeEval)}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    title="Cetak Raport Resmi MTQ Darul Abidin"
                  >
                    <FileText className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenAssessmentModal(activeTeacher.id)}
                    className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors"
                    title="Edit / Perbarui Nilai Guru Ini"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Inspector View Navigation */}
              <div className="flex items-center justify-between pt-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTabDetail('RADAR')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTabDetail === 'RADAR'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Radar Spider 9-Axis
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTabDetail('BAR_TREND')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTabDetail === 'BAR_TREND'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Bar & Tren Histori
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTabDetail('INDIVIDUAL_CRITERIA_GRAPHS')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTabDetail === 'INDIVIDUAL_CRITERIA_GRAPHS'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Grafik 9 Parameter (Detail & Ekspor)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTabDetail('RUBRIC_DETAILS')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTabDetail === 'RUBRIC_DETAILS'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Rincian Rubrik & Catatan
                  </button>
                </div>

                {/* Compare Mode Toggle */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsComparing(!isComparing)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                      isComparing
                        ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>{isComparing ? 'Tutup Komparasi' : 'Bandingkan Guru Lain'}</span>
                  </button>
                </div>
              </div>

              {/* Compare Teacher Selector if active */}
              {isComparing && (
                <div className="mt-3 p-3 bg-sky-50/70 border border-sky-200 rounded-xl flex items-center gap-3 text-xs">
                  <span className="font-bold text-sky-900 shrink-0">Bandingkan dengan:</span>
                  <select
                    value={compareTeacherId}
                    onChange={(e) => setCompareTeacherId(e.target.value)}
                    className="p-1.5 bg-white border border-sky-300 rounded-lg text-xs font-medium text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="">-- Pilih Guru Pembanding --</option>
                    {teachers
                      .filter((t) => t.id !== activeTeacher.id)
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.unit})
                        </option>
                      ))}
                  </select>
                  {compareTeacher && (
                    <span className="text-sky-800 font-semibold text-[11px]">
                      Garis Biru Putus-Putus akan memetakan {compareTeacher.name}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* View Tab 1: Radar Chart */}
            {activeTabDetail === 'RADAR' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 border-b border-slate-100 pb-3 gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Profil Kompetensi Poligon 9-Axis (Spider Chart)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Klik salah satu titik atau nama parameter untuk membuka grafik detail dan membagikan (Foto / Word / PDF).
                    </p>
                  </div>
                  {onOpenPdfExport && (
                    <button
                      type="button"
                      onClick={() => onOpenPdfExport(activeTeacher, activeEval)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
                    >
                      <FileDown className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Download PDF Grafik (Radar & Bar)</span>
                    </button>
                  )}
                </div>

                <div className="flex justify-center">
                  <RadarChart
                    primaryScores={activeEval.scores}
                    primaryLabel={activeTeacher.name}
                    secondaryScores={compareEval ? compareEval.scores : undefined}
                    secondaryLabel={compareTeacher ? `Komparasi: ${compareTeacher.name}` : undefined}
                    benchmarkScores={benchmarkScores}
                    benchmarkLabel="Rata-Rata Lembaga MTQ"
                    size={460}
                    onSelectCriterion={(critId) => {
                      const c = criteria.find((x) => x.id === critId);
                      if (c) onOpenParameterDetail(c);
                    }}
                  />
                </div>
              </div>
            )}

            {/* View Tab 2: Bar Comparison & Trend Line */}
            {activeTabDetail === 'BAR_TREND' && (
              <div className="space-y-3">
                {onOpenPdfExport && (
                  <div className="bg-white rounded-xl border border-slate-200 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shadow-2xs">
                    <span className="font-semibold text-slate-700">
                      Cetak komparasi grafik diagram batang dan histori tren semester dalam format PDF resmi:
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenPdfExport(activeTeacher, activeEval)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors self-start sm:self-auto"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      <span>Export PDF Grafik (jsPDF)</span>
                    </button>
                  </div>
                )}
                <TrendLineChart
                  currentEvaluation={activeEval}
                  historicalEvaluations={evaluations.filter((e) => e.teacherId === activeTeacher.id)}
                  benchmarkScores={benchmarkScores}
                />
              </div>
            )}

            {/* View Tab 3: Dedicated 9 Individual Criteria Graphical Breakdown */}
            {activeTabDetail === 'INDIVIDUAL_CRITERIA_GRAPHS' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Hasil Grafik & Capaian di Setiap 9 Parameter Mutu
                    </h3>
                    <p className="text-xs text-slate-500">
                      Setiap parameter dapat diinspeksi secara mendalam, melihat sub-sub aspek, dan diekspor ke Foto (PNG), PDF, atau Word (.docx).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenSettings}
                    className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-xs hover:bg-emerald-100 transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Edit Sub-Aspek di Pengaturan</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {criteria.map((crit) => {
                    const scoreObj = activeEval.scores.find((s) => s.criterionId === crit.id);
                    const score = scoreObj ? scoreObj.score : 0;
                    const bm = benchmarkScores.find((b) => b.criterionId === crit.id)?.score ?? 75;

                    const isMumtaz = score >= 89;
                    const isJayyidJiddan = score >= 76 && score < 89;
                    const isJayyid = score >= 60 && score < 76;

                    return (
                      <div
                        key={crit.id}
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-emerald-400 transition-all shadow-2xs space-y-3 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-black text-xs text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                              {crit.code}
                            </span>
                            <span
                              className={`font-black text-xs px-2 py-0.5 rounded ${
                                isMumtaz
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : isJayyidJiddan
                                  ? 'bg-teal-100 text-teal-800'
                                  : isJayyid
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {score} Pts
                            </span>
                          </div>

                          <h4 className="font-bold text-slate-900 text-xs mt-2 line-clamp-1">
                            {crit.name}
                          </h4>
                          <span className="text-[10px] text-slate-400">
                            Bobot: {crit.weight}% • Benchmark: {bm}
                          </span>

                          {/* Mini Progress Bar */}
                          <div className="relative h-2 w-full bg-slate-200 rounded-full overflow-hidden my-2.5">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isMumtaz
                                  ? 'bg-emerald-500'
                                  : isJayyidJiddan
                                  ? 'bg-teal-500'
                                  : isJayyid
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${Math.max(4, score)}%` }}
                            />
                          </div>

                          {/* Sub-aspect preview chips */}
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-400 block font-semibold">
                              Sub-Aspek ({crit.focusAspects.length}):
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {crit.focusAspects.slice(0, 2).map((asp, i) => (
                                <span
                                  key={i}
                                  className="text-[9.5px] bg-white border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded truncate max-w-[140px]"
                                >
                                  • {asp}
                                </span>
                              ))}
                              {crit.focusAspects.length > 2 && (
                                <span className="text-[9px] text-slate-400 self-center">
                                  +{crit.focusAspects.length - 2} lainnya
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action: Open Graph & Export */}
                        <button
                          type="button"
                          onClick={() => onOpenParameterDetail(crit)}
                          className="w-full mt-2 py-1.5 px-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                        >
                          <Share2 className="w-3 h-3" />
                          <span>Grafik & Ekspor (Foto/Word/PDF)</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* View Tab 4: Detailed 9 Criteria Breakdown & Rubrics */}
            {activeTabDetail === 'RUBRIC_DETAILS' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <h3 className="font-bold text-slate-900 text-sm">
                  Evaluasi Rinci Tiap Kriteria & Catatan Kualitatif
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {criteria.map((crit) => {
                    const scoreObj = activeEval.scores.find((s) => s.criterionId === crit.id);
                    const score = scoreObj ? scoreObj.score : 0;
                    const notes = scoreObj?.notes;

                    const isMumtaz = score >= 89;
                    const isJayyidJiddan = score >= 76 && score < 89;
                    const isJayyid = score >= 60 && score < 76;

                    return (
                      <div
                        key={crit.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all space-y-1.5 cursor-pointer"
                        onClick={() => onOpenParameterDetail(crit)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-emerald-800">
                              {crit.code}. {crit.shortName}
                            </span>
                            <span className="text-[10px] text-slate-400">({crit.weight}%)</span>
                          </div>
                          <span
                            className={`font-black text-xs px-2 py-0.5 rounded ${
                              isMumtaz
                                ? 'bg-emerald-100 text-emerald-800'
                                : isJayyidJiddan
                                ? 'bg-teal-100 text-teal-800'
                                : isJayyid
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {score} Pts
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-tight">
                          {crit.description}
                        </p>
                        {notes && (
                          <div className="p-2 bg-white rounded-lg border border-slate-200 text-[11px] text-slate-700 italic">
                            💬 "{notes}"
                          </div>
                        )}
                        <span className="text-[10px] text-emerald-700 font-semibold block pt-1">
                          🔍 Klik untuk buka grafik & bagikan ke Foto / Word / PDF &rarr;
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Supervisor Conclusion & Action Plan */}
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2 text-xs">
                  <span className="font-bold text-emerald-900 block">
                    Kesimpulan & Rencana Tindak Lanjut Supervisor:
                  </span>
                  <p className="text-slate-700 italic">"{activeEval.supervisorNotes}"</p>
                  <div className="pt-2 flex flex-wrap gap-2">
                    {activeEval.recommendedPrograms.map((prog, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-white border border-emerald-300 text-emerald-900 font-semibold rounded-lg text-[11px]"
                      >
                        🎯 {prog}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
