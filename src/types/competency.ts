export type QualityCategory = 'MUMTAZ' | 'JAYYID_JIDDAN' | 'JAYYID' | 'MAQBUL';

export interface RubricLevel {
  level: number;
  label: string;
  range: [number, number];
  description: string;
}

export interface CriterionDefinition {
  id: string;
  code: string;
  name: string;
  shortName: string;
  description: string;
  focusAspects: string[];
  weight: number; // percentage (e.g. 15%)
  rubricLevels: RubricLevel[];
  defaultRecommendation: {
    title: string;
    action: string;
    duration: string;
    targetMilestone: string;
  };
}

export interface CriterionScore {
  criterionId: string;
  score: number; // 0 - 100
  notes?: string;
}

export interface EvaluationRecord {
  id: string;
  teacherId: string;
  evaluatorId: string;
  evaluatorName: string;
  evaluatorRole: 'SUPERVISOR' | 'KEPALA_SEKOLAH' | 'KOORDINATOR_QURAN';
  periodId: string;
  periodName: string;
  evaluationDate: string;
  scores: CriterionScore[];
  selfScores?: CriterionScore[]; // Optional self-assessment scores for comparison
  overallScore: number;
  qualityCategory: QualityCategory;
  supervisorNotes: string;
  strengths: string[];
  areasForImprovement: string[];
  recommendedPrograms: string[];
}

export interface TeacherProfile {
  id: string;
  nip: string;
  name: string;
  title: string;
  gender: 'L' | 'P';
  unit: string; // Fleksibel: dapat berupa TK, SD, SMP, SMA, SDIT, SMPIT, Ma'had, atau unit custom sesuai keinginan
  teachingClass: string;
  joinDate: string;
  hafalanCountJuz: number;
  certifiedMaqdis: boolean;
  avatarUrl?: string;
  email: string;
  phone: string;
}

export interface EvaluationPeriod {
  id: string;
  name: string;
  academicYear: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface DailyQuranLog {
  id: string;
  teacherId: string;
  date: string;
  tilawahPages: number;
  murojaahJuz: string;
  ziyadahAyatCount: number;
  targetAchieved: boolean;
  notes?: string;
}

export interface RecommendationInsight {
  id: string;
  criterionId: string;
  criterionName: string;
  thresholdScore: number;
  affectedTeachersCount: number;
  programTitle: string;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendedActions: string[];
  expectedImpact: string;
}
