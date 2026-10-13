import React, { useState, useEffect } from 'react';
import {
  MOCK_TEACHERS,
  INITIAL_EVALUATION_RECORDS,
  MOCK_DAILY_LOGS,
} from './data/mockTeachers';
import { CRITERIA_DEFINITIONS, QUALITY_CATEGORIES } from './data/criteriaData';
import { INITIAL_TEACHER_BAYATI_PROFILES } from './data/bayatiCertificationData';
import {
  EvaluationRecord,
  TeacherProfile,
  DailyQuranLog,
  CriterionScore,
  CriterionDefinition,
} from './types/competency';
import { TeacherBayatiProfile } from './types/bayatiCertification';
import { Navbar } from './components/Navbar';
import { SupervisorDashboard } from './components/SupervisorDashboard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { SettingsDashboard } from './components/SettingsDashboard';
import { BayatiCertificationDashboard } from './components/BayatiCertificationDashboard';
import { AssessmentFormModal } from './components/AssessmentFormModal';
import { TeacherReportModal } from './components/TeacherReportModal';
import { ParameterDetailModal } from './components/ParameterDetailModal';
import { ArchitectureDocsModal } from './components/ArchitectureDocsModal';
import { TeacherChartExportModal } from './components/TeacherChartExportModal';
import { Database, Sliders, Smartphone } from 'lucide-react';

export default function App() {
  // 1. Core State with LocalStorage Persistence
  const [teachers, setTeachers] = useState<TeacherProfile[]>(() => {
    const saved = localStorage.getItem('mtq_teachers');
    return saved ? JSON.parse(saved) : MOCK_TEACHERS;
  });

  const [criteria, setCriteria] = useState<CriterionDefinition[]>(() => {
    const saved = localStorage.getItem('mtq_criteria');
    return saved ? JSON.parse(saved) : CRITERIA_DEFINITIONS;
  });

  const [evaluations, setEvaluations] = useState<EvaluationRecord[]>(() => {
    const saved = localStorage.getItem('mtq_evaluations');
    return saved ? JSON.parse(saved) : INITIAL_EVALUATION_RECORDS;
  });

  const [dailyLogs, setDailyLogs] = useState<DailyQuranLog[]>(() => {
    const saved = localStorage.getItem('mtq_daily_logs');
    return saved ? JSON.parse(saved) : MOCK_DAILY_LOGS;
  });

  const [bayatiProfiles, setBayatiProfiles] = useState<TeacherBayatiProfile[]>(() => {
    const saved = localStorage.getItem('mtq_bayati_profiles');
    return saved ? JSON.parse(saved) : INITIAL_TEACHER_BAYATI_PROFILES;
  });

  // 2. Navigation & Views
  const [currentRole, setCurrentRole] = useState<'SUPERVISOR' | 'TEACHER'>('SUPERVISOR');
  const [currentView, setCurrentView] = useState<'DASHBOARD' | 'BAYATI_CERTIFICATION' | 'SETTINGS'>('DASHBOARD');
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('p_2025_ganjil');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('t_001');

  // 3. Modals
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [assessmentTeacherId, setAssessmentTeacherId] = useState<string | undefined>(undefined);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportTeacher, setReportTeacher] = useState<TeacherProfile | null>(null);
  const [reportEval, setReportEval] = useState<EvaluationRecord | null>(null);
  const [isArchitectureDocsModalOpen, setIsArchitectureDocsModalOpen] = useState(false);
  const [selectedParamForDetail, setSelectedParamForDetail] = useState<CriterionDefinition | null>(null);
  const [exportPdfTeacher, setExportPdfTeacher] = useState<TeacherProfile | null>(null);
  const [exportPdfEval, setExportPdfEval] = useState<EvaluationRecord | null>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('mtq_teachers', JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem('mtq_criteria', JSON.stringify(criteria));
  }, [criteria]);

  useEffect(() => {
    localStorage.setItem('mtq_evaluations', JSON.stringify(evaluations));
  }, [evaluations]);

  useEffect(() => {
    localStorage.setItem('mtq_daily_logs', JSON.stringify(dailyLogs));
  }, [dailyLogs]);

  useEffect(() => {
    localStorage.setItem('mtq_bayati_profiles', JSON.stringify(bayatiProfiles));
  }, [bayatiProfiles]);

  // Handlers
  const handleSaveEvaluation = (newEval: EvaluationRecord) => {
    setEvaluations((prev) => {
      const existingIdx = prev.findIndex(
        (e) => e.teacherId === newEval.teacherId && e.periodId === newEval.periodId
      );
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = newEval;
        return copy;
      }
      return [newEval, ...prev];
    });
  };

  const handleUpdateTeachers = (newTeachers: TeacherProfile[]) => {
    setTeachers(newTeachers);
    // Also sync teacher name, unit, and teachingClass into bayatiProfiles
    setBayatiProfiles((prevBayati) => {
      return prevBayati.map((bp) => {
        const matched = newTeachers.find((t) => t.id === bp.teacherId);
        if (matched) {
          return {
            ...bp,
            teacherName: matched.name,
            unit: matched.unit,
            teachingClass: matched.teachingClass,
          };
        }
        return bp;
      });
    });
  };

  const handleAddDailyLog = (log: DailyQuranLog) => {
    setDailyLogs((prev) => [log, ...prev]);
  };

  const handleUpdateSelfAssessment = (selfScores: CriterionScore[]) => {
    setEvaluations((prev) =>
      prev.map((item) => {
        if (item.teacherId === 't_001' && item.periodId === selectedPeriodId) {
          return {
            ...item,
            selfScores,
          };
        }
        return item;
      })
    );
  };

  const handleResetDefaults = () => {
    setTeachers(MOCK_TEACHERS);
    setCriteria(CRITERIA_DEFINITIONS);
    setEvaluations(INITIAL_EVALUATION_RECORDS);
    setBayatiProfiles(INITIAL_TEACHER_BAYATI_PROFILES);
    localStorage.removeItem('mtq_teachers');
    localStorage.removeItem('mtq_criteria');
    localStorage.removeItem('mtq_evaluations');
    localStorage.removeItem('mtq_bayati_profiles');
  };

  const handleOpenAssessmentModal = (teacherId?: string) => {
    setAssessmentTeacherId(teacherId || selectedTeacherId);
    setIsAssessmentModalOpen(true);
  };

  const handleOpenReportModal = (teacher: TeacherProfile, evalRecord: EvaluationRecord) => {
    setReportTeacher(teacher);
    setReportEval(evalRecord);
    setIsReportModalOpen(true);
  };

  const handleOpenPdfExport = (teacher: TeacherProfile, evalRecord: EvaluationRecord) => {
    setExportPdfTeacher(teacher);
    setExportPdfEval(evalRecord);
  };

  // Active teacher and their evaluation
  const activeTeacher = teachers.find((t) => t.id === selectedTeacherId) || teachers[0];
  const activeEval =
    evaluations.find((e) => e.teacherId === activeTeacher?.id && e.periodId === selectedPeriodId) ||
    evaluations.find((e) => e.teacherId === activeTeacher?.id) ||
    evaluations[0];

  // Active teacher for Teacher Role view
  const myTeacher = teachers.find((t) => t.id === 't_001') || teachers[0];
  const myEvaluation =
    evaluations.find((e) => e.teacherId === myTeacher.id && e.periodId === selectedPeriodId) ||
    evaluations.find((e) => e.teacherId === myTeacher.id) ||
    evaluations[0];

  // Institution Benchmark Scores across all 9 criteria
  const benchmarkScores: CriterionScore[] = criteria.map((crit) => {
    const list = evaluations.filter((e) => e.periodId === selectedPeriodId || !e.periodId);
    let total = 0;
    let count = 0;
    list.forEach((rec) => {
      const match = rec.scores.find((s) => s.criterionId === crit.id);
      if (match) {
        total += match.score;
        count++;
      }
    });
    return {
      criterionId: crit.id,
      score: count > 0 ? Math.round(total / count) : 75,
    };
  });

  // Benchmark for selected parameter
  const getBenchmarkScoreForCriterion = (critId: string) => {
    const match = benchmarkScores.find((b) => b.criterionId === critId);
    return match ? match.score : 75;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        currentRole={currentRole}
        onSwitchRole={setCurrentRole}
        currentView={currentView}
        onSwitchView={setCurrentView}
        selectedPeriodId={selectedPeriodId}
        onSelectPeriod={setSelectedPeriodId}
        onOpenArchitectureDocs={() => setIsArchitectureDocsModalOpen(true)}
        onOpenNewAssessment={() => handleOpenAssessmentModal()}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentView === 'SETTINGS' ? (
          <SettingsDashboard
            teachers={teachers}
            onUpdateTeachers={handleUpdateTeachers}
            criteria={criteria}
            onUpdateCriteria={setCriteria}
            onResetDefaults={handleResetDefaults}
          />
        ) : currentView === 'BAYATI_CERTIFICATION' ? (
          <BayatiCertificationDashboard
            bayatiProfiles={bayatiProfiles}
            onUpdateBayatiProfiles={setBayatiProfiles}
          />
        ) : currentRole === 'SUPERVISOR' ? (
          <SupervisorDashboard
            teachers={teachers}
            evaluations={evaluations.filter((e) => e.periodId === selectedPeriodId || !e.periodId)}
            criteria={criteria}
            selectedTeacherId={selectedTeacherId}
            onSelectTeacher={setSelectedTeacherId}
            onOpenAssessmentModal={handleOpenAssessmentModal}
            onOpenReportModal={handleOpenReportModal}
            onOpenPdfExport={handleOpenPdfExport}
            onOpenParameterDetail={(crit) => setSelectedParamForDetail(crit)}
            onOpenSettings={() => setCurrentView('SETTINGS')}
          />
        ) : (
          <TeacherDashboard
            teacher={myTeacher}
            currentEvaluation={myEvaluation}
            dailyLogs={dailyLogs.filter((l) => l.teacherId === myTeacher.id)}
            onAddDailyLog={handleAddDailyLog}
            onUpdateSelfAssessment={handleUpdateSelfAssessment}
            onOpenReportModal={() => handleOpenReportModal(myTeacher, myEvaluation)}
            onOpenPdfExport={() => handleOpenPdfExport(myTeacher, myEvaluation)}
          />
        )}
      </main>

      {/* Footer Branding & 9 Criteria Legend */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-xs">
                DA
              </div>
              <div>
                <span className="font-bold text-slate-900 text-sm">
                  MTQ Darul Abidin — Sistem Mutu Guru Al-Qur'an
                </span>
                <p className="text-[11px] text-slate-400">
                  Aplikasi Evaluasi & Visualisasi Grafik Kompetensi Guru Al-Qur'an Berbasis 9 Indikator Objektif
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentView('SETTINGS')}
                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Pengaturan Guru & Kriteria</span>
              </button>

              <button
                type="button"
                onClick={() => setIsArchitectureDocsModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 font-bold hover:bg-emerald-100 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Skema Data & Arsitektur</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
            <span>
              Kategori Mutu: Mumtaz (89-100) • Jayyid Jiddan (76-88) • Jayyid (60-75) • Perlu Pembinaan (&lt;60)
            </span>
            <span>© 2025/2026 MTQ Yayasan Darul Abidin. All rights reserved.</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {isAssessmentModalOpen && (
        <AssessmentFormModal
          isOpen={isAssessmentModalOpen}
          onClose={() => setIsAssessmentModalOpen(false)}
          teachers={teachers}
          initialTeacherId={assessmentTeacherId}
          onSaveEvaluation={handleSaveEvaluation}
        />
      )}

      {isReportModalOpen && reportTeacher && reportEval && (
        <TeacherReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          teacher={reportTeacher}
          evaluation={reportEval}
        />
      )}

      {selectedParamForDetail && activeTeacher && activeEval && (
        <ParameterDetailModal
          isOpen={Boolean(selectedParamForDetail)}
          onClose={() => setSelectedParamForDetail(null)}
          criterion={selectedParamForDetail}
          teacher={activeTeacher}
          evaluation={activeEval}
          benchmarkScore={getBenchmarkScoreForCriterion(selectedParamForDetail.id)}
          allEvaluations={evaluations}
        />
      )}

      {isArchitectureDocsModalOpen && (
        <ArchitectureDocsModal
          isOpen={isArchitectureDocsModalOpen}
          onClose={() => setIsArchitectureDocsModalOpen(false)}
        />
      )}

      {exportPdfTeacher && exportPdfEval && (
        <TeacherChartExportModal
          isOpen={Boolean(exportPdfTeacher && exportPdfEval)}
          onClose={() => {
            setExportPdfTeacher(null);
            setExportPdfEval(null);
          }}
          teacher={exportPdfTeacher}
          evaluation={exportPdfEval}
          benchmarkScores={benchmarkScores}
          criteria={criteria}
        />
      )}
    </div>
  );
}
