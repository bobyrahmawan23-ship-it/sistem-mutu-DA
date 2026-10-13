import React, { useState } from 'react';
import { CRITERIA_DEFINITIONS, QUALITY_CATEGORIES, getQualityCategory } from '../data/criteriaData';
import { EvaluationRecord, TeacherProfile, CriterionScore, QualityCategory } from '../types/competency';
import { calculateWeightedScore, EVALUATION_PERIODS } from '../data/mockTeachers';
import { X, CheckCircle, Sparkles, BookOpen, Award, AlertCircle, Save } from 'lucide-react';

interface AssessmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  teachers: TeacherProfile[];
  initialTeacherId?: string;
  onSaveEvaluation: (record: EvaluationRecord) => void;
}

export const AssessmentFormModal: React.FC<AssessmentFormModalProps> = ({
  isOpen,
  onClose,
  teachers,
  initialTeacherId,
  onSaveEvaluation,
}) => {
  if (!isOpen) return null;

  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(
    initialTeacherId || (teachers[0]?.id ?? '')
  );
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('p_2025_ganjil');
  const [evaluatorName, setEvaluatorName] = useState('Drs. H. Syamsul Arifin, M.Ag.');
  const [evaluatorRole, setEvaluatorRole] = useState<'SUPERVISOR' | 'KEPALA_SEKOLAH' | 'KOORDINATOR_QURAN'>('SUPERVISOR');

  // Initialize scores for all 9 criteria
  const [scoresState, setScoresState] = useState<Record<string, { score: number; notes: string }>>(() => {
    const init: Record<string, { score: number; notes: string }> = {};
    CRITERIA_DEFINITIONS.forEach((c) => {
      init[c.id] = { score: 80, notes: '' };
    });
    return init;
  });

  const [activeCriterionTab, setActiveCriterionTab] = useState<string>(CRITERIA_DEFINITIONS[0].id);
  const [supervisorNotes, setSupervisorNotes] = useState('');
  const [strengthsInput, setStrengthsInput] = useState('Makhraj huruf jelas, Disiplin kehadiran tinggi');
  const [improvementsInput, setImprovementsInput] = useState('Penguasaan irama Bayati nawa, Pendalaman bacaan ghorib');
  const [recommendedProgramsInput, setRecommendedProgramsInput] = useState('Workshop Nagham Bayati & Sertifikasi Lanjutan');

  // Calculate live overall weighted score
  const scoreArray: CriterionScore[] = CRITERIA_DEFINITIONS.map((c) => ({
    criterionId: c.id,
    score: scoresState[c.id]?.score ?? 0,
    notes: scoresState[c.id]?.notes ?? '',
  }));

  const overallScore = calculateWeightedScore(scoreArray);
  const qualityCategory: QualityCategory = getQualityCategory(overallScore);
  const categoryMeta = QUALITY_CATEGORIES[qualityCategory];

  const handleScoreChange = (criterionId: string, value: number) => {
    setScoresState((prev) => ({
      ...prev,
      [criterionId]: {
        ...prev[criterionId],
        score: Math.min(100, Math.max(0, value)),
      },
    }));
  };

  const handleNotesChange = (criterionId: string, notes: string) => {
    setScoresState((prev) => ({
      ...prev,
      [criterionId]: {
        ...prev[criterionId],
        notes,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedTeacher = teachers.find((t) => t.id === selectedTeacherId);
    const selectedPeriod = EVALUATION_PERIODS.find((p) => p.id === selectedPeriodId);

    const newRecord: EvaluationRecord = {
      id: `eval_${Date.now()}`,
      teacherId: selectedTeacherId,
      evaluatorId: 'sup_active',
      evaluatorName,
      evaluatorRole,
      periodId: selectedPeriodId,
      periodName: selectedPeriod?.name ?? 'Semester Ganjil 2025/2026',
      evaluationDate: new Date().toISOString().split('T')[0],
      scores: scoreArray,
      overallScore,
      qualityCategory,
      supervisorNotes: supervisorNotes || `Evaluasi berkala kompetensi pengajaran Al-Qur'an ${selectedTeacher?.name ?? ''} berbasis 9 kriteria MTQ Darul Abidin.`,
      strengths: strengthsInput.split(',').map((s) => s.trim()).filter(Boolean),
      areasForImprovement: improvementsInput.split(',').map((s) => s.trim()).filter(Boolean),
      recommendedPrograms: recommendedProgramsInput.split(',').map((s) => s.trim()).filter(Boolean),
    };

    onSaveEvaluation(newRecord);
    onClose();
  };

  const activeCrit = CRITERIA_DEFINITIONS.find((c) => c.id === activeCriterionTab) || CRITERIA_DEFINITIONS[0];
  const activeCurrentScore = scoresState[activeCrit.id]?.score ?? 80;

  // Matching rubric descriptor
  const activeRubric =
    activeCrit.rubricLevels.find(
      (r) => activeCurrentScore >= r.range[0] && activeCurrentScore <= r.range[1]
    ) || activeCrit.rubricLevels[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-200 border border-white/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Formulir Asesmen Supervisor MTQ Darul Abidin</h2>
              <p className="text-xs text-emerald-100">
                Rubrik Penilaian Objektif 9 Indikator Kompetensi Guru Al-Qur'an Bermutu
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Metadata Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pilih Guru Al-Qur'an
              </label>
              <select
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.unit} - {t.teachingClass})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Periode Evaluasi
              </label>
              <select
                value={selectedPeriodId}
                onChange={(e) => setSelectedPeriodId(e.target.value)}
                className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {EVALUATION_PERIODS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Supervisor / Penilai
              </label>
              <input
                type="text"
                value={evaluatorName}
                onChange={(e) => setEvaluatorName(e.target.value)}
                className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="Nama Penguji / Supervisor"
              />
            </div>
          </div>

          {/* Live Score & Predikat Mutu Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 border border-emerald-200 rounded-2xl gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl shadow-md">
                {overallScore}
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Prediksi Skor Tertimbang</div>
                <div className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>Predikat:</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${categoryMeta.badgeBg}`}>
                    {categoryMeta.label} ({categoryMeta.arabicLabel})
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right text-xs text-slate-600 max-w-sm">
              <span className="font-semibold text-emerald-800">Standar MTQ Darul Abidin:</span>
              <p className="text-[11px] text-slate-500">{categoryMeta.description}</p>
            </div>
          </div>

          {/* 9 Criteria Nav Tabs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                9 Parameter Kompetensi MTQ Darul Abidin
              </h3>
              <span className="text-[11px] text-emerald-700 font-medium">
                Pilih tab di bawah untuk menilai rubrik
              </span>
            </div>

            <div className="flex overflow-x-auto gap-1.5 pb-2 border-b border-slate-200 scrollbar-thin">
              {CRITERIA_DEFINITIONS.map((c) => {
                const s = scoresState[c.id]?.score ?? 0;
                const isSelected = activeCriterionTab === c.id;
                const isPassing = s >= 60;

                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActiveCriterionTab(c.id)}
                    className={`shrink-0 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-700 text-white shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <span>{c.code}</span>
                    <span className="hidden sm:inline">{c.shortName}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
                        isSelected
                          ? 'bg-emerald-900 text-white'
                          : isPassing
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {s}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Criterion Interactive Scoring Card */}
          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-md">
                    {activeCrit.code}
                  </span>
                  <h4 className="text-base font-bold text-slate-900">{activeCrit.name}</h4>
                  <span className="text-xs text-slate-500 font-semibold">(Bobot: {activeCrit.weight}%)</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{activeCrit.description}</p>
              </div>

              {/* Score Input & Presets */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[11px] text-slate-500">Nilai (1 - 100):</div>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={activeCurrentScore}
                    onChange={(e) => handleScoreChange(activeCrit.id, Number(e.target.value))}
                    className="w-20 text-center font-extrabold text-lg text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-lg p-1 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Range Slider */}
            <div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
                <span>0 (Kurang)</span>
                <span>60 (Cukup)</span>
                <span>76 (Bermutu)</span>
                <span>89 (Mumtaz)</span>
                <span>100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={activeCurrentScore}
                onChange={(e) => handleScoreChange(activeCrit.id, Number(e.target.value))}
                className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* Quick Level Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {activeCrit.rubricLevels.map((lvl) => {
                const isActive = activeCurrentScore >= lvl.range[0] && activeCurrentScore <= lvl.range[1];
                return (
                  <button
                    key={lvl.level}
                    type="button"
                    onClick={() => handleScoreChange(activeCrit.id, Math.round((lvl.range[0] + lvl.range[1]) / 2))}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                      isActive
                        ? 'border-emerald-500 bg-emerald-50/70 shadow-xs'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <span className={isActive ? 'text-emerald-800' : 'text-slate-700'}>
                        {lvl.label}
                      </span>
                      <span className="text-[10px] text-slate-500">{lvl.range[0]}-{lvl.range[1]}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                      {lvl.description}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Active Rubrik Descriptor Detail */}
            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Deskriptor Rubrik Terpilih ({activeRubric?.label}):</span>
                <p className="mt-0.5 text-slate-700 leading-relaxed">{activeRubric?.description}</p>
              </div>
            </div>

            {/* Qualitative Note for this Criterion */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catatan Kualitatif Supervisor untuk {activeCrit.shortName}:
              </label>
              <input
                type="text"
                value={scoresState[activeCrit.id]?.notes ?? ''}
                onChange={(e) => handleNotesChange(activeCrit.id, e.target.value)}
                placeholder={`Contoh: Fashohah makhraj ra dan lam tebal sudah baik, perhatikan tempo...`}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Overall Qualitative Feedback & Action Plan */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Catatan Rekomendasi & Rencana Tindak Lanjut Lembaga
            </h4>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catatan Keseluruhan Supervisor:
              </label>
              <textarea
                rows={2}
                value={supervisorNotes}
                onChange={(e) => setSupervisorNotes(e.target.value)}
                placeholder="Berikan apresiasi pencapaian dan rekomendasi strategis bagi guru..."
                className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kekuatan Utama (Pisahkan koma):
                </label>
                <input
                  type="text"
                  value={strengthsInput}
                  onChange={(e) => setStrengthsInput(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Area Perlu Peningkatan:
                </label>
                <input
                  type="text"
                  value={improvementsInput}
                  onChange={(e) => setImprovementsInput(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Program Pembinaan Rekomendasi:
                </label>
                <input
                  type="text"
                  value={recommendedProgramsInput}
                  onChange={(e) => setRecommendedProgramsInput(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Simpan & Terbitkan Hasil Penilaian
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
