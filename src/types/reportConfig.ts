export interface ReportTextConfig {
  // Institutional Header
  institutionName: string;
  institutionSub: string;
  institutionContact: string;
  logoInitials: string;

  // Document Title & Intro
  reportTitle: string;
  introSentence: string;

  // Section Headings & Sentences
  radarHeading: string;
  radarSubText: string;
  tableHeading: string;
  strengthsHeading: string;
  recommendationsHeading: string;
  closingNotes: string;

  // Mudir MTQ Configuration
  mudirTitle: string;
  mudirName: string;
  mudirNip: string;
  mudirSignHeading: string;

  // Supervisor Configuration
  supervisorTitle: string;
  supervisorName: string;
  supervisorNip: string;
  supervisorSignHeading: string;

  // Teacher Signatory
  teacherSignHeading: string;

  // Options & Location
  showMudirSignature: boolean;
  cityLocation: string;
}

export const DEFAULT_REPORT_CONFIG: ReportTextConfig = {
  institutionName: 'MTQ DARUL ABIDIN',
  institutionSub: "Lembaga Manajemen Tahfidz & Pengajaran Al-Qur'an Terpadu",
  institutionContact: 'Depok, Jawa Barat | Website: darulabidin.sch.id | Email: mtq@darulabidin.sch.id',
  logoInitials: 'DA',

  reportTitle: "RAPORT EVALUASI & PROFIL KOMPETENSI GURU AL-QUR'AN",
  introSentence:
    "Dokumen resmi pemetaan kompetensi pengajar Al-Qur'an berkala berbasis 9 indikator kinerja objektif dan standarisasi bacaan tartil.",

  radarHeading: 'Visualisasi Poligon Radar 9 Parameter Kompetensi',
  radarSubText: 'Grafik jaring laba-laba menunjukkan profil keseimbangan penguasaan pada seluruh dimensi kompetensi guru.',
  tableHeading: 'Rincian Perolehan Nilai 9 Indikator Utama',
  strengthsHeading: 'Kekuatan Utama Guru (Pilar Keunggulan):',
  recommendationsHeading: 'Rekomendasi Program Peningkatan Mutu:',
  closingNotes:
    "Catatan Resmi: Raport ini diterbitkan sebagai pedoman pembinaan berkelanjutan dan standarisasi kompetensi guru Al-Qur'an MTQ Darul Abidin. Semoga Allah Subhanahu Wa Ta'ala senantiasa memberkahi ikhtiar dakwah dan pengajaran Al-Qur'an.",

  mudirTitle: 'Mudir MTQ Darul Abidin',
  mudirName: 'K.H. Muhammad Shodiq, M.Ag.',
  mudirNip: 'NIP: DA-MDR-001',
  mudirSignHeading: 'Mengetahui,',

  supervisorTitle: 'Supervisor / Kepala MTQ',
  supervisorName: 'Ustadz Boby Rahmawan, S.Pd.I',
  supervisorNip: 'NIP: DA-MTQ-SUP-001',
  supervisorSignHeading: 'Pemeriksa & Penilai,',

  teacherSignHeading: 'Guru Yang Dinilai,',

  showMudirSignature: true,
  cityLocation: 'Depok',
};

const STORAGE_KEY = 'mtq_teacher_report_config';

export function getStoredReportConfig(): ReportTextConfig {
  if (typeof window === 'undefined') return DEFAULT_REPORT_CONFIG;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_REPORT_CONFIG;
  try {
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_REPORT_CONFIG, ...parsed };
  } catch {
    return DEFAULT_REPORT_CONFIG;
  }
}

export function saveStoredReportConfig(config: ReportTextConfig): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  // Dispatch custom storage event for instant tab/window sync
  window.dispatchEvent(new CustomEvent('mtq_report_config_updated', { detail: config }));
}

export function resetStoredReportConfig(): ReportTextConfig {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('mtq_report_config_updated', { detail: DEFAULT_REPORT_CONFIG }));
  }
  return DEFAULT_REPORT_CONFIG;
}
