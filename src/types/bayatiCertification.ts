export type BayatiStageId =
  | 'stage_doa_fatihah'
  | 'stage_annas_alqariah'
  | 'stage_adiyat_asysyams'
  | 'stage_balad_alburuj'
  | 'stage_insyiqoq_abasa'
  | 'stage_naziat_annaba';

export type TaskStatus = 'LULUS' | 'PROSES_REVIEW' | 'REVISI' | 'BELUM_KIRIM';

export interface BayatiStageDefinition {
  id: BayatiStageId;
  order: number;
  title: string;
  surahRange: string;
  description: string;
  focusTone: string; // e.g., 'Pengenalan Nada Qarar & Nawa Dasar'
  sampleAyat: string;
  weight: number;
}

export interface BayatiTaskSubmission {
  stageId: BayatiStageId;
  status: TaskStatus;
  submissionDate?: string;
  score?: number; // 0 - 100
  toneAccuracy?: number; // 0 - 100
  tajwidAccuracy?: number; // 0 - 100
  tempoStability?: number; // 0 - 100
  evaluatorNotes?: string;
  audioAttachmentName?: string;
  evaluatedAt?: string;
  musyrifName?: string; // Nama Musyrif / Evaluator Penguji tugas pengiriman
  musyrifNip?: string;
  // Recording submissions fields
  hasSubmittedRecording?: boolean;
  recordingSubmissionDate?: string;
  recordingAttachmentName?: string;
  recordingUrl?: string;
  recordingNotes?: string;
  subToneAccuracy?: number;
  subTajwidAccuracy?: number;
  subCengkokFluency?: number;
  subTempoFashohah?: number;
  evaluatorMusyrifId?: string;
}

export interface TeacherBayatiProfile {
  teacherId: string;
  teacherName: string;
  unit: string;
  teachingClass: string;
  phone: string;
  submissions: Record<BayatiStageId, BayatiTaskSubmission>;
  completedStagesCount: number; // out of 6
  averageScore: number;
  isFullyCertified: boolean;
  assignedMusyrif?: string; // Musyrif pembimbing / penguji talaqqi
  assignedMusyrifId?: string;
  lastSubmissionDate?: string;
}
