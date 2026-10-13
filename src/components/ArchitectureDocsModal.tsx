import React, { useState } from 'react';
import { X, Database, Workflow, Palette, Code2, Copy, Check, Sparkles } from 'lucide-react';

interface ArchitectureDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureDocsModal: React.FC<ArchitectureDocsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'SCHEMA_SQL' | 'SCHEMA_JSON' | 'USER_JOURNEY' | 'DESIGN_SYSTEM'>('SCHEMA_SQL');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sqlSchema = `-- ============================================================================
-- SKEMA BASIS DATA APLIKASI EVALUASI GURU AL-QUR'AN MTQ DARUL ABIDIN
-- PostgreSQL / Supabase / Cloud SQL Relational Schema
-- ============================================================================

-- 1. Tabel Users & Guru (Pendidik Al-Qur'an & Penilai)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nip VARCHAR(30) UNIQUE NOT NULL,
    nama VARCHAR(150) NOT NULL,
    gelar VARCHAR(50),
    role VARCHAR(20) NOT NULL CHECK (role IN ('GURU', 'SUPERVISOR', 'KEPALA_SEKOLAH', 'ADMIN')),
    unit VARCHAR(20) NOT NULL CHECK (unit IN ('TK', 'SD', 'SMP', 'SMA', 'Tahsin Dewasa')),
    kelas_ajar VARCHAR(100),
    hafalan_juz INT DEFAULT 0,
    sertifikasi_maqdis BOOLEAN DEFAULT FALSE,
    email VARCHAR(100) UNIQUE,
    telepon VARCHAR(25),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabel Periode Evaluasi (Semester / Tahunan)
CREATE TABLE evaluation_periods (
    id VARCHAR(50) PRIMARY KEY, -- misal 'p_2025_ganjil'
    nama VARCHAR(100) NOT NULL,
    tahun_ajaran VARCHAR(20) NOT NULL,
    tanggal_mulai DATE NOT NULL,
    tanggal_selesai DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- 3. Tabel Master 9 Kriteria MTQ Darul Abidin
CREATE TABLE criteria (
    id VARCHAR(50) PRIMARY KEY, -- 'c1_tartil', 'c2_kebiasaan_tilawah', etc.
    kode VARCHAR(10) NOT NULL,   -- 'C1', 'C2', ... 'C9'
    nama VARCHAR(150) NOT NULL,
    nama_pendek VARCHAR(50) NOT NULL,
    bobot_persen INT NOT NULL CHECK (bobot_persen > 0 AND bobot_persen <= 100),
    deskripsi TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabel Rubrik Penilaian (Level 1 - 4 / Mumtaz - Perlu Pembinaan)
CREATE TABLE rubric_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    criterion_id VARCHAR(50) REFERENCES criteria(id) ON DELETE CASCADE,
    level INT NOT NULL CHECK (level BETWEEN 1 AND 4),
    label VARCHAR(50) NOT NULL, -- Mumtaz, Jayyid Jiddan, Jayyid, Perlu Pembinaan
    rentang_bawah INT NOT NULL,  -- misal 89
    rentang_atas INT NOT NULL,   -- misal 100
    deskriptor_rubrik TEXT NOT NULL
);

-- 5. Tabel Header Evaluasi (Hasil Supervisi Keseluruhan)
CREATE TABLE evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    evaluator_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    period_id VARCHAR(50) REFERENCES evaluation_periods(id) ON DELETE RESTRICT,
    eval_date DATE NOT NULL,
    skor_akhir_tertimbang DECIMAL(5, 2) NOT NULL,
    predikat_mutu VARCHAR(25) NOT NULL CHECK (predikat_mutu IN ('MUMTAZ', 'JAYYID_JIDDAN', 'JAYYID', 'MAQBUL')),
    catatan_supervisor TEXT,
    kekuatan_utama TEXT[],
    area_peningkatan TEXT[],
    status VARCHAR(20) DEFAULT 'PUBLISHED' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabel Rincian Nilai per Kriteria (9 Score Records)
CREATE TABLE evaluation_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id UUID REFERENCES evaluations(id) ON DELETE CASCADE,
    criterion_id VARCHAR(50) REFERENCES criteria(id) ON DELETE RESTRICT,
    skor_angka INT NOT NULL CHECK (skor_angka BETWEEN 0 AND 100),
    catatan_kualitatif TEXT,
    CONSTRAINT uq_eval_criterion UNIQUE (evaluation_id, criterion_id)
);

-- 7. Tabel Evaluasi Diri Guru (Self-Assessment & Daily Quran Journal)
CREATE TABLE teacher_daily_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL,
    halaman_tilawah INT DEFAULT 0,
    murojaah_juz VARCHAR(100),
    ziyadah_ayat INT DEFAULT 0,
    target_tercapai BOOLEAN DEFAULT TRUE,
    catatan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Indeks Kinerja untuk Kecepatan Query Radar & Trend Line
CREATE INDEX idx_eval_teacher_period ON evaluations(teacher_id, period_id);
CREATE INDEX idx_eval_scores_crit ON evaluation_scores(criterion_id);
`;

  const jsonSchema = `{
  "schema_version": "1.0.0",
  "organization": "MTQ Darul Abidin",
  "entities": {
    "User": {
      "id": "t_001",
      "nip": "DA-QUR-2021-042",
      "name": "Ustadz Ahmad Fauzi",
      "role": "GURU",
      "unit": "SD",
      "hafalanCountJuz": 30,
      "certifiedMaqdis": true
    },
    "Evaluation": {
      "id": "eval_001_p25g",
      "teacherId": "t_001",
      "evaluatorId": "sup_01",
      "periodId": "p_2025_ganjil",
      "evaluationDate": "2025-11-20",
      "overallScore": 91.4,
      "qualityCategory": "MUMTAZ",
      "scores": [
        { "criterionId": "c1_tartil", "score": 94, "notes": "Makhraj & shifatul mutqin" },
        { "criterionId": "c2_kebiasaan_tilawah", "score": 92, "notes": "Tilawah 1.5 juz/hari" },
        { "criterionId": "c3_hafalan_mutqin", "score": 95, "notes": "Tasmi 3 juz lancar" },
        { "criterionId": "c4_ghorib_tajwid", "score": 90, "notes": "Faham saktah & imalah" },
        { "criterionId": "c5_irama_bayati", "score": 86, "notes": "Tangga nada Bayati fasih" },
        { "criterionId": "c6_metode_maqdis", "score": 92, "notes": "Ketukan presisi" },
        { "criterionId": "c7_jiwa_dai_murobbi", "score": 90, "notes": "Qudwah santri" },
        { "criterionId": "c8_disiplin_waktu", "score": 88, "notes": "Hadir 10 menit awal" },
        { "criterionId": "c9_komitmen_mutu", "score": 93, "notes": "Inovasi modul ajar" }
      ],
      "recommendedPrograms": [
        "Pendelegasian sebagai Master Trainer Metode Maqdis MTQ Darul Abidin"
      ]
    }
  }
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300 border border-white/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Arsitektur, Skema Data & Konsep UI/UX</h2>
              <p className="text-xs text-emerald-200">
                Spesifikasi Teknis MTQ Darul Abidin untuk Tim Pengembang & Pimpinan Lembaga
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex flex-wrap gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('SCHEMA_SQL')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'SCHEMA_SQL'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" /> Skema SQL Relasional
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('SCHEMA_JSON')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'SCHEMA_JSON'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" /> Struktur Data JSON
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('USER_JOURNEY')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'USER_JOURNEY'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Workflow className="w-3.5 h-3.5" /> Alur Kerja (User Journey)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('DESIGN_SYSTEM')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'DESIGN_SYSTEM'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" /> Panduan Tema UI & Warna
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 text-slate-800 text-xs leading-relaxed space-y-4">
          {activeTab === 'SCHEMA_SQL' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-700">
                  PostgreSQL Data Definition Language (DDL) Ready-to-Migrate:
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(sqlSchema)}
                  className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 rounded text-slate-800 font-bold flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Tersalin' : 'Salin SQL'}
                </button>
              </div>
              <pre className="bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-[11px] overflow-x-auto max-h-96">
                {sqlSchema}
              </pre>
            </div>
          )}

          {activeTab === 'SCHEMA_JSON' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-700">
                  Representasi JSON Payload untuk API Evaluasi & Visualisasi:
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(jsonSchema)}
                  className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 rounded text-slate-800 font-bold flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Tersalin' : 'Salin JSON'}
                </button>
              </div>
              <pre className="bg-slate-900 text-sky-300 p-4 rounded-xl font-mono text-[11px] overflow-x-auto max-h-96">
                {jsonSchema}
              </pre>
            </div>
          )}

          {activeTab === 'USER_JOURNEY' && (
            <div className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Workflow className="w-4 h-4 text-emerald-600" />
                Alur Kerja Pengguna (User Journey & Lifecycle Penilaian):
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-xs mb-2">
                    1
                  </div>
                  <h4 className="font-bold text-emerald-950 mb-1">Self-Assessment Guru</h4>
                  <p className="text-slate-600 text-[11px]">
                    Guru mengisi jurnal tilawah harian & memberikan taksiran penilaian mandiri terhadap 9 indikator kompetensinya sebagai refleksi awal.
                  </p>
                </div>

                <div className="p-3.5 bg-teal-50 rounded-xl border border-teal-200">
                  <div className="w-6 h-6 rounded-full bg-teal-700 text-white font-bold flex items-center justify-center text-xs mb-2">
                    2
                  </div>
                  <h4 className="font-bold text-teal-950 mb-1">Supervisi & Observasi</h4>
                  <p className="text-slate-600 text-[11px]">
                    Supervisor / Koordinator Qur'an melakukan observasi kelas (micro-teaching, tartil, fashohah) dan tes hafalan mutqin serta irama Bayati.
                  </p>
                </div>

                <div className="p-3.5 bg-sky-50 rounded-xl border border-sky-200">
                  <div className="w-6 h-6 rounded-full bg-sky-700 text-white font-bold flex items-center justify-center text-xs mb-2">
                    3
                  </div>
                  <h4 className="font-bold text-sky-950 mb-1">Input Rubrik & Kalkulasi</h4>
                  <p className="text-slate-600 text-[11px]">
                    Supervisor memasukkan skor 1-100 berdasarkan rubrik objektif. Sistem secara otomatis menghitung skor tertimbang dan predikat mutu (Mumtaz/Jayyid Jiddan/dll).
                  </p>
                </div>

                <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="w-6 h-6 rounded-full bg-amber-700 text-white font-bold flex items-center justify-center text-xs mb-2">
                    4
                  </div>
                  <h4 className="font-bold text-amber-950 mb-1">Visualisasi & Pembinaan</h4>
                  <p className="text-slate-600 text-[11px]">
                    Grafik Radar 9-Axis dan Tren Semesteran langsung terbit. Sistem menyarankan modul peningkatan mutu terarah berdasarkan titik terendah.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-800">
                  Rumus Perhitungan Skor Tertimbang (Weighted Competency Index):
                </h4>
                <p className="font-mono bg-white p-2.5 rounded-lg border border-slate-300 text-[11px] text-emerald-800">
                  Total_Score = (C1 × 15%) + (C2 × 10%) + (C3 × 15%) + (C4 × 10%) + (C5 × 10%) + (C6 × 15%) + (C7 × 10%) + (C8 × 10%) + (C9 × 10%)
                </p>
                <div className="text-[11px] text-slate-600">
                  * Kriteria C1 (Tartil), C3 (Hafalan Mutqin), dan C6 (Metode Maqdis) memiliki bobot tertinggi (15% masing-masing) sebagai pilar utama kurikulum MTQ Darul Abidin.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'DESIGN_SYSTEM' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Palette className="w-4 h-4 text-emerald-600" />
                Panduan Rekomendasi Desain: Ramah, Islami & Modern
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50">
                  <div className="w-8 h-8 rounded-lg bg-emerald-700 mb-2"></div>
                  <span className="font-bold text-emerald-950 block">Hijau Qur'ani (Emerald)</span>
                  <span className="font-mono text-[10px] text-emerald-700">#047857 / #059669</span>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Melambangkan kemuliaan Al-Qur'an, kedamaian, dan pertumbuhan spiritual pendidik. Digunakan pada navbar primer, aksi utama, dan skor Mumtaz.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-sky-200 bg-sky-50">
                  <div className="w-8 h-8 rounded-lg bg-sky-600 mb-2"></div>
                  <span className="font-bold text-sky-950 block">Biru Profesional (Sky/Teal)</span>
                  <span className="font-mono text-[10px] text-sky-700">#0284c7 / #0d9488</span>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Melambangkan akurasi manajerial, objektivitas akademik, dan kepercayaan data supervisi. Digunakan pada grafik perbandingan dan predikat Jayyid Jiddan.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 mb-2"></div>
                  <span className="font-bold text-amber-950 block">Emas Mushaf (Warm Amber)</span>
                  <span className="font-mono text-[10px] text-amber-700">#d97706 / #f59e0b</span>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Aksen hiasan ornamen mushaf klasik dan indikator penanda kategori cukup atau area perhatian pembinaan.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-800">Prinsip Tipografi & Ergonomi:</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px]">
                  <li>
                    <strong>Font Utama:</strong> Plus Jakarta Sans / Inter — sans-serif modern yang mudah dibaca pada perangkat mobile maupun desktop saat observasi kelas.
                  </li>
                  <li>
                    <strong>Font Kaligrafi & Aksen:</strong> Amiri / Scheherazade — memberikan sentuhan kultural Islami pada istilah Arab (Mumtaz, Jayyid Jiddan, Bayati, Maqdis).
                  </li>
                  <li>
                    <strong>Visualisasi Chart:</strong> Garis poligon kontras tinggi dengan grid cincin transparan (20, 40, 60, 80, 100) untuk evaluasi cepat dalam hitungan detik.
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-white hover:bg-slate-900 transition-colors cursor-pointer"
          >
            Tutup Dokumentasi
          </button>
        </div>
      </div>
    </div>
  );
};
