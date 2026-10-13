import React, { useState, useEffect } from 'react';
import { CriterionDefinition, TeacherProfile } from '../types/competency';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  ReportTextConfig,
  getStoredReportConfig,
  saveStoredReportConfig,
  resetStoredReportConfig,
} from '../types/reportConfig';
import {
  Users,
  Sliders,
  Smartphone,
  Plus,
  Trash2,
  Edit2,
  Save,
  Check,
  AlertCircle,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Download,
  Info,
  RefreshCw,
  FileText,
  Building,
  UserCheck,
  FileSignature,
  Sparkles,
  RotateCcw,
} from 'lucide-react';

interface SettingsDashboardProps {
  teachers: TeacherProfile[];
  onUpdateTeachers: (teachers: TeacherProfile[]) => void;
  criteria: CriterionDefinition[];
  onUpdateCriteria: (criteria: CriterionDefinition[]) => void;
  onResetDefaults: () => void;
}

export const SettingsDashboard: React.FC<SettingsDashboardProps> = ({
  teachers,
  onUpdateTeachers,
  criteria,
  onUpdateCriteria,
  onResetDefaults,
}) => {
  const [activeTab, setActiveTab] = useState<'TEACHERS' | 'CRITERIA_ASPECTS' | 'REPORT_SETTINGS' | 'MOBILE_PWA'>('TEACHERS');

  // Report config state
  const [reportConfig, setReportConfig] = useState<ReportTextConfig>(() => getStoredReportConfig());

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<ReportTextConfig>;
      if (customEvent.detail) {
        setReportConfig(customEvent.detail);
      }
    };
    window.addEventListener('mtq_report_config_updated', handleUpdate);
    return () => window.removeEventListener('mtq_report_config_updated', handleUpdate);
  }, []);

  const handleUpdateReportConfig = <K extends keyof ReportTextConfig>(field: K, val: ReportTextConfig[K]) => {
    const updated = { ...reportConfig, [field]: val };
    setReportConfig(updated);
    saveStoredReportConfig(updated);
  };

  const handleResetReportConfig = () => {
    if (confirm('Kembalikan format, kalimat rapot, dan nama Mudir MTQ ke standar bawaan?')) {
      const def = resetStoredReportConfig();
      setReportConfig(def);
      showToast('Format dan kalimat rapot berhasil direset ke standar');
    }
  };

  // Teacher editing states
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  const [teacherFormData, setTeacherFormData] = useState<Partial<TeacherProfile>>({});
  const [isAddingTeacher, setIsAddingTeacher] = useState(false);

  // Criteria editing states
  const [selectedCritId, setSelectedCritId] = useState<string>(criteria[0]?.id ?? 'c1_tartil');
  const [newSubAspectText, setNewSubAspectText] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // PWA Install hook
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // Active Criterion
  const activeCriterion = criteria.find((c) => c.id === selectedCritId) || criteria[0];

  // 1. Handlers for Teachers
  const handleStartEditTeacher = (t: TeacherProfile) => {
    setEditingTeacherId(t.id);
    setTeacherFormData({ ...t });
    setIsAddingTeacher(false);
  };

  const handleSaveTeacherEdit = () => {
    if (!editingTeacherId) return;
    const updated = teachers.map((t) =>
      t.id === editingTeacherId ? ({ ...t, ...teacherFormData } as TeacherProfile) : t
    );
    onUpdateTeachers(updated);
    setEditingTeacherId(null);
    setTeacherFormData({});
    showToast('Data guru berhasil diperbarui');
  };

  const handleSaveNewTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherFormData.name) return;

    const newTeacher: TeacherProfile = {
      id: `t_${Date.now()}`,
      nip: teacherFormData.nip || `DA-QUR-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      name: teacherFormData.name,
      title: teacherFormData.title || 'S.Pd.I',
      gender: (teacherFormData.gender as 'L' | 'P') || 'L',
      unit: teacherFormData.unit || 'SD',
      teachingClass: teacherFormData.teachingClass || 'Tahsin & Tahfidz',
      joinDate: new Date().toISOString().split('T')[0],
      hafalanCountJuz: Number(teacherFormData.hafalanCountJuz || 3),
      certifiedMaqdis: Boolean(teacherFormData.certifiedMaqdis),
      email: teacherFormData.email || `${teacherFormData.name.toLowerCase().replace(/\s+/g, '.')}@darulabidin.sch.id`,
      phone: teacherFormData.phone || '0812-0000-0000',
    };

    onUpdateTeachers([...teachers, newTeacher]);
    setIsAddingTeacher(false);
    setTeacherFormData({});
    showToast(`Guru ${newTeacher.name} berhasil ditambahkan`);
  };

  const handleDeleteTeacher = (id: string, name: string) => {
    if (confirm(`Yakin ingin menghapus guru ${name}?`)) {
      onUpdateTeachers(teachers.filter((t) => t.id !== id));
      showToast(`Guru ${name} telah dihapus`);
    }
  };

  // 2. Handlers for Sub-Aspects in 9 Criteria
  const handleAddSubAspect = (critId: string) => {
    if (!newSubAspectText.trim()) return;
    const updated = criteria.map((c) => {
      if (c.id === critId) {
        return {
          ...c,
          focusAspects: [...c.focusAspects, newSubAspectText.trim()],
        };
      }
      return c;
    });
    onUpdateCriteria(updated);
    setNewSubAspectText('');
    showToast('Sub-aspek penilaian baru berhasil ditambahkan');
  };

  const handleDeleteSubAspect = (critId: string, aspectIndex: number) => {
    const updated = criteria.map((c) => {
      if (c.id === critId) {
        const newAspects = [...c.focusAspects];
        newAspects.splice(aspectIndex, 1);
        return {
          ...c,
          focusAspects: newAspects,
        };
      }
      return c;
    });
    onUpdateCriteria(updated);
    showToast('Sub-aspek berhasil dihapus');
  };

  const handleUpdateCriterionDetails = (
    critId: string,
    field: keyof CriterionDefinition,
    value: any
  ) => {
    const updated = criteria.map((c) => {
      if (c.id === critId) {
        return { ...c, [field]: value };
      }
      return c;
    });
    onUpdateCriteria(updated);
  };

  // Total weights check
  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-800 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold animate-fade-in border border-emerald-600">
          <Check className="w-4 h-4 text-emerald-300" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Sliders className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-black text-slate-900">
              Dasbor Pengaturan Sistem & Kriteria Penilaian
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Sesuaikan data guru, sub-sub aspek pada 9 kriteria mutu Al-Qur'an, dan konfigurasi tampilan mobile/HP.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (confirm('Kembalikan semua nama guru dan 9 kriteria ke standar bawaan MTQ Darul Abidin?')) {
              onResetDefaults();
              showToast('Data default berhasil dipulihkan');
            }
          }}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset ke Bawaan</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('TEACHERS')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'TEACHERS'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Manajemen Guru ({teachers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('CRITERIA_ASPECTS')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'CRITERIA_ASPECTS'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>9 Kriteria & Sub-Aspek Penilaian</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('REPORT_SETTINGS')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'REPORT_SETTINGS'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileSignature className="w-4 h-4" />
          <span>Format Rapot & Nama Mudir MTQ</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('MOBILE_PWA')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'MOBILE_PWA'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Unduh Aplikasi Layar HP (PWA)</span>
        </button>
      </div>

      {/* TAB 1: TEACHER MANAGEMENT */}
      {activeTab === 'TEACHERS' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Daftar Pendidik Al-Qur'an MTQ Darul Abidin
              </h3>
              <p className="text-xs text-slate-500">
                Edit nama guru, NIP, unit jenjang, hafalan mutqin, dan status sertifikasi Maqdis.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsAddingTeacher(true);
                setEditingTeacherId(null);
                setTeacherFormData({
                  name: '',
                  title: 'S.Pd.I',
                  unit: 'SD',
                  teachingClass: 'Tahsin Maqdis',
                  hafalanCountJuz: 3,
                  certifiedMaqdis: true,
                });
              }}
              className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Guru Baru</span>
            </button>
          </div>

          {/* Datalists for custom unit and class suggestions */}
          <datalist id="unitOptions">
            <option value="TK" />
            <option value="SD" />
            <option value="SMP" />
            <option value="SMA" />
            <option value="SDIT" />
            <option value="SMPIT" />
            <option value="SMAIT" />
            <option value="KBTK" />
            <option value="Tahsin Dewasa" />
            <option value="Ma'had Tahfidz" />
            <option value="Pondok Pesantren" />
          </datalist>

          <datalist id="classOptions">
            <option value="Kelas 1" />
            <option value="Kelas 2" />
            <option value="Kelas 3" />
            <option value="Kelas 4" />
            <option value="Kelas 5" />
            <option value="Kelas 6" />
            <option value="Tahsin Maqdis" />
            <option value="Tahfidz Intensif" />
            <option value="Halaqah Qur'an" />
            <option value="Pra-Tahsin" />
          </datalist>

          {/* Add Teacher Form */}
          {isAddingTeacher && (
            <form
              onSubmit={handleSaveNewTeacher}
              className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-4 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-950 text-sm">
                  Formulir Penambahan Guru Al-Qur'an Baru
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingTeacher(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap Guru:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Ustadz Bilal Ramadhan"
                    value={teacherFormData.name || ''}
                    onChange={(e) => setTeacherFormData({ ...teacherFormData, name: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gelar / Akademik:</label>
                  <input
                    type="text"
                    placeholder="Contoh: S.Pd.I, Al-Hafizh"
                    value={teacherFormData.title || ''}
                    onChange={(e) => setTeacherFormData({ ...teacherFormData, title: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIP / ID Guru:</label>
                  <input
                    type="text"
                    placeholder="DA-QUR-2025-..."
                    value={teacherFormData.nip || ''}
                    onChange={(e) => setTeacherFormData({ ...teacherFormData, nip: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">Unit Pengajaran:</label>
                    <span className="text-[10px] text-emerald-700 font-bold">Ketik bebas / pilih</span>
                  </div>
                  <input
                    type="text"
                    list="unitOptions"
                    placeholder="Contoh: SD, SMPIT, Ma'had, KBTK..."
                    value={teacherFormData.unit || ''}
                    onChange={(e) => setTeacherFormData({ ...teacherFormData, unit: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-semibold text-xs"
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {['TK', 'SD', 'SMP', 'SMA', 'SDIT', 'SMPIT', 'SMAIT', 'Tahsin Dewasa', "Ma'had"].map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => setTeacherFormData({ ...teacherFormData, unit: u })}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                          teacherFormData.unit === u
                            ? 'bg-emerald-700 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">Kelas Ajar / Halaqah:</label>
                    <span className="text-[10px] text-emerald-700 font-bold">Ketik kelas bebas</span>
                  </div>
                  <input
                    type="text"
                    list="classOptions"
                    placeholder="Contoh: Kelas 4 Tahfidz, Tahsin Maqdis..."
                    value={teacherFormData.teachingClass || ''}
                    onChange={(e) => setTeacherFormData({ ...teacherFormData, teachingClass: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-xs"
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6', 'Tahsin Maqdis', 'Tahfidz Intensif'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setTeacherFormData({ ...teacherFormData, teachingClass: c })}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium cursor-pointer transition-colors ${
                          teacherFormData.teachingClass === c
                            ? 'bg-teal-700 text-white font-bold'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hafalan Mutqin (Juz):</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={teacherFormData.hafalanCountJuz || 3}
                    onChange={(e) => setTeacherFormData({ ...teacherFormData, hafalanCountJuz: Number(e.target.value) })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="addCertMaqdis"
                  checked={Boolean(teacherFormData.certifiedMaqdis)}
                  onChange={(e) => setTeacherFormData({ ...teacherFormData, certifiedMaqdis: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <label htmlFor="addCertMaqdis" className="text-slate-700 font-semibold cursor-pointer">
                  Tersertifikasi Metode Maqdis Terstandar
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingTeacher(false)}
                  className="px-3.5 py-2 rounded-lg text-slate-600 hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                >
                  Simpan Guru Baru
                </button>
              </div>
            </form>
          )}

          {/* Teacher Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Nama Guru Al-Qur'an</th>
                    <th className="px-4 py-3">NIP</th>
                    <th className="px-4 py-3">Unit & Kelas</th>
                    <th className="px-4 py-3">Hafalan Mutqin</th>
                    <th className="px-4 py-3">Metode Maqdis</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teachers.map((t) => {
                    const isEditing = editingTeacherId === t.id;

                    if (isEditing) {
                      return (
                        <tr key={t.id} className="bg-emerald-50/50">
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={teacherFormData.name || ''}
                              onChange={(e) => setTeacherFormData({ ...teacherFormData, name: e.target.value })}
                              className="w-full p-1.5 bg-white border border-emerald-400 rounded-lg font-bold text-slate-900"
                            />
                            <input
                              type="text"
                              value={teacherFormData.title || ''}
                              onChange={(e) => setTeacherFormData({ ...teacherFormData, title: e.target.value })}
                              placeholder="Gelar"
                              className="w-full p-1 bg-white border border-slate-200 rounded text-[10px] mt-1"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={teacherFormData.nip || ''}
                              onChange={(e) => setTeacherFormData({ ...teacherFormData, nip: e.target.value })}
                              className="w-full p-1.5 bg-white border border-slate-200 rounded-lg font-mono text-[11px]"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="space-y-1">
                              <input
                                type="text"
                                list="unitOptions"
                                placeholder="Edit Unit..."
                                value={teacherFormData.unit ?? t.unit}
                                onChange={(e) => setTeacherFormData({ ...teacherFormData, unit: e.target.value })}
                                className="w-full p-1 bg-white border border-emerald-400 rounded text-xs font-bold text-emerald-950"
                              />
                              <input
                                type="text"
                                list="classOptions"
                                placeholder="Edit Kelas..."
                                value={teacherFormData.teachingClass ?? t.teachingClass}
                                onChange={(e) => setTeacherFormData({ ...teacherFormData, teachingClass: e.target.value })}
                                className="w-full p-1 bg-white border border-slate-300 rounded text-[11px]"
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="1"
                              max="30"
                              value={teacherFormData.hafalanCountJuz || t.hafalanCountJuz}
                              onChange={(e) => setTeacherFormData({ ...teacherFormData, hafalanCountJuz: Number(e.target.value) })}
                              className="w-16 p-1 bg-white border border-slate-200 rounded font-bold"
                            />
                            <span className="text-[10px] text-slate-400 ml-1">Juz</span>
                          </td>
                          <td className="px-4 py-3">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={Boolean(teacherFormData.certifiedMaqdis)}
                                onChange={(e) => setTeacherFormData({ ...teacherFormData, certifiedMaqdis: e.target.checked })}
                                className="rounded text-emerald-600 w-3.5 h-3.5"
                              />
                              <span className="text-[11px]">Sertifikasi</span>
                            </label>
                          </td>
                          <td className="px-4 py-3 text-right space-x-1.5">
                            <button
                              type="button"
                              onClick={handleSaveTeacherEdit}
                              className="px-2.5 py-1 rounded bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700"
                            >
                              Simpan
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingTeacherId(null)}
                              className="px-2 py-1 rounded bg-slate-200 text-slate-700 text-[11px]"
                            >
                              Batal
                            </button>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={t.id} className="hover:bg-slate-50/70">
                        <td className="px-4 py-3">
                          <span className="font-bold text-slate-900 block">{t.name}</span>
                          <span className="text-[10px] text-slate-400">{t.title}</span>
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-600">{t.nip}</td>
                        <td className="px-4 py-3">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px] mr-1">
                            {t.unit}
                          </span>
                          <span className="text-slate-600">{t.teachingClass}</span>
                        </td>
                        <td className="px-4 py-3 font-bold text-emerald-800">
                          {t.hafalanCountJuz} Juz Mutqin
                        </td>
                        <td className="px-4 py-3">
                          {t.certifiedMaqdis ? (
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5" /> Tersertifikasi
                            </span>
                          ) : (
                            <span className="text-slate-400">Belum Sertifikasi</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => handleStartEditTeacher(t)}
                            className="p-1 text-slate-500 hover:text-emerald-700 transition-colors"
                            title="Edit Guru"
                          >
                            <Edit2 className="w-3.5 h-3.5 inline" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTeacher(t.id, t.name)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Hapus Guru"
                          >
                            <Trash2 className="w-3.5 h-3.5 inline" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CRITERIA & SUB-ASPECTS CONFIGURATOR */}
      {activeTab === 'CRITERIA_ASPECTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: 9 Criteria List */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                9 Parameter MTQ Darul Abidin
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  totalWeight === 100
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                Total Bobot: {totalWeight}%
              </span>
            </div>

            <div className="space-y-1.5">
              {criteria.map((c) => {
                const isSelected = c.id === selectedCritId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCritId(c.id)}
                    className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs text-emerald-800">{c.code}</span>
                        <span className="font-bold text-slate-900 text-xs">{c.shortName}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {c.focusAspects.length} Sub-Aspek Dinilai
                      </span>
                    </div>

                    <span className="text-xs font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {c.weight}%
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Criterion Sub-Aspects Editor */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded">
                    {activeCriterion.code}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">{activeCriterion.name}</h3>
                </div>

                {/* Weight Input */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 font-semibold">Bobot:</span>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={activeCriterion.weight}
                    onChange={(e) =>
                      handleUpdateCriterionDetails(activeCriterion.id, 'weight', Number(e.target.value))
                    }
                    className="w-16 p-1 text-center font-bold bg-slate-50 border border-slate-300 rounded-lg text-emerald-800"
                  />
                  <span className="font-bold text-slate-600">%</span>
                </div>
              </div>

              {/* Description Edit */}
              <div className="mt-3">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Deskripsi Fokus Parameter:
                </label>
                <textarea
                  rows={2}
                  value={activeCriterion.description}
                  onChange={(e) =>
                    handleUpdateCriterionDetails(activeCriterion.id, 'description', e.target.value)
                  }
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* SUB-SUB ASPEK DETAIL EDITOR (Requested by supervisor!) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Daftar Sub-Sub Aspek yang Dinilai ({activeCriterion.focusAspects.length}):</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Supervisor dapat menambah, mengubah, atau menghapus poin-poin yang diuji sesuai standar mutakhir MTQ.
                  </p>
                </div>
              </div>

              {/* Add Sub-Aspect Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSubAspectText}
                  onChange={(e) => setNewSubAspectText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubAspect(activeCriterion.id);
                    }
                  }}
                  placeholder={`Tambah sub-aspek baru untuk ${activeCriterion.shortName}...`}
                  className="flex-1 text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleAddSubAspect(activeCriterion.id)}
                  className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Sub-Aspek</span>
                </button>
              </div>

              {/* Sub-Aspects List with Delete buttons */}
              <div className="space-y-2">
                {activeCriterion.focusAspects.map((aspect, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 flex-1">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center text-[10px] shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-slate-800">{aspect}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteSubAspect(activeCriterion.id, idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Hapus Sub-Aspek ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {activeCriterion.focusAspects.length === 0 && (
                  <div className="p-4 text-center text-slate-400 text-xs italic">
                    Belum ada sub-aspek yang didaftarkan. Silakan tambahkan di atas.
                  </div>
                )}
              </div>
            </div>

            {/* Recommendation Plan Template Edit */}
            <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200 space-y-2 text-xs">
              <span className="font-bold text-amber-950 block">
                Template Rekomendasi Program Peningkatan Mutu:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">
                    Judul Program:
                  </label>
                  <input
                    type="text"
                    value={activeCriterion.defaultRecommendation.title}
                    onChange={(e) => {
                      const updated = {
                        ...activeCriterion.defaultRecommendation,
                        title: e.target.value,
                      };
                      handleUpdateCriterionDetails(activeCriterion.id, 'defaultRecommendation', updated);
                    }}
                    className="w-full p-2 bg-white border border-amber-300 rounded-lg font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">
                    Durasi:
                  </label>
                  <input
                    type="text"
                    value={activeCriterion.defaultRecommendation.duration}
                    onChange={(e) => {
                      const updated = {
                        ...activeCriterion.defaultRecommendation,
                        duration: e.target.value,
                      };
                      handleUpdateCriterionDetails(activeCriterion.id, 'defaultRecommendation', updated);
                    }}
                    className="w-full p-2 bg-white border border-amber-300 rounded-lg text-slate-800"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PENGATURAN FORMAT RAPOT & NAMA MUDIR MTQ */}
      {activeTab === 'REPORT_SETTINGS' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileSignature className="w-5 h-5 text-emerald-700" />
                <span>Pengaturan Format Rapot Resmi & Nama Mudir MTQ</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Kustomisasi nama Mudir MTQ, supervisor penguji, kop lembaga, susunan tanda tangan, dan seluruh narasi/kalimat yang tercetak di rapot resmi guru.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetReportConfig}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset ke Standar</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  saveStoredReportConfig(reportConfig);
                  showToast('Pengaturan rapot & nama Mudir MTQ berhasil disimpan');
                }}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Pengaturan</span>
              </button>
            </div>
          </div>

          {/* Section 1: Mudir MTQ & Tanda Tangan */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800">
                  <UserCheck className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">1. Pejabat Mudir MTQ & Tanda Tangan Rapot</h4>
                  <p className="text-[11px] text-slate-500">
                    Atur nama pimpinan tertinggi MTQ, supervisor penguji, dan tata letak tanda tangan resmi.
                  </p>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reportConfig.showMudirSignature}
                  onChange={(e) => handleUpdateReportConfig('showMudirSignature', e.target.checked)}
                  className="rounded accent-emerald-600 cursor-pointer w-4 h-4"
                />
                <span>Tampilkan Format 3 Kolom (Sertakan Mudir MTQ)</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {/* Kolom Mudir */}
              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 space-y-3">
                <span className="font-bold text-amber-900 block text-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Mudir MTQ (Pimpinan Lembaga)
                </span>
                <div>
                  <label className="text-[10px] text-slate-600 font-semibold block mb-1">
                    Nama Lengkap Mudir MTQ:
                  </label>
                  <input
                    type="text"
                    value={reportConfig.mudirName}
                    onChange={(e) => handleUpdateReportConfig('mudirName', e.target.value)}
                    className="w-full p-2 bg-white border border-amber-300 rounded-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="e.g. K.H. Muhammad Shodiq, M.Ag."
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-600 font-semibold block mb-1">
                    Jabatan / Gelar Struktural:
                  </label>
                  <input
                    type="text"
                    value={reportConfig.mudirTitle}
                    onChange={(e) => handleUpdateReportConfig('mudirTitle', e.target.value)}
                    className="w-full p-2 bg-white border border-amber-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="e.g. Mudir MTQ Darul Abidin"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-600 font-semibold block mb-1">
                    NIP / ID Pimpinan:
                  </label>
                  <input
                    type="text"
                    value={reportConfig.mudirNip}
                    onChange={(e) => handleUpdateReportConfig('mudirNip', e.target.value)}
                    className="w-full p-2 bg-white border border-amber-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono text-xs"
                    placeholder="e.g. NIP: DA-MDR-001"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-600 font-semibold block mb-1">
                    Kop Kata Pengantar Tanda Tangan:
                  </label>
                  <input
                    type="text"
                    value={reportConfig.mudirSignHeading}
                    onChange={(e) => handleUpdateReportConfig('mudirSignHeading', e.target.value)}
                    className="w-full p-2 bg-white border border-amber-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="e.g. Mengetahui,"
                  />
                </div>
              </div>

              {/* Kolom Supervisor */}
              <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-200 space-y-3">
                <span className="font-bold text-teal-900 block text-xs">
                  Supervisor / Tim Penilai
                </span>
                <div>
                  <label className="text-[10px] text-slate-600 font-semibold block mb-1">
                    Nama Supervisor Penilai:
                  </label>
                  <input
                    type="text"
                    value={reportConfig.supervisorName}
                    onChange={(e) => handleUpdateReportConfig('supervisorName', e.target.value)}
                    className="w-full p-2 bg-white border border-teal-300 rounded-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-400"
                    placeholder="e.g. Ustadz Boby Rahmawan, S.Pd.I"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-600 font-semibold block mb-1">
                    Jabatan Supervisor:
                  </label>
                  <input
                    type="text"
                    value={reportConfig.supervisorTitle}
                    onChange={(e) => handleUpdateReportConfig('supervisorTitle', e.target.value)}
                    className="w-full p-2 bg-white border border-teal-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400"
                    placeholder="e.g. Supervisor / Kepala MTQ"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-600 font-semibold block mb-1">
                    NIP Supervisor:
                  </label>
                  <input
                    type="text"
                    value={reportConfig.supervisorNip}
                    onChange={(e) => handleUpdateReportConfig('supervisorNip', e.target.value)}
                    className="w-full p-2 bg-white border border-teal-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400 font-mono text-xs"
                    placeholder="e.g. NIP: DA-MTQ-SUP-001"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-600 font-semibold block mb-1">
                    Kop Kata Pengantar Supervisor:
                  </label>
                  <input
                    type="text"
                    value={reportConfig.supervisorSignHeading}
                    onChange={(e) => handleUpdateReportConfig('supervisorSignHeading', e.target.value)}
                    className="w-full p-2 bg-white border border-teal-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400"
                    placeholder="e.g. Pemeriksa & Penilai,"
                  />
                </div>
              </div>

              {/* Kolom Guru & Titimangsa Kota */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="font-bold text-slate-800 block text-xs">
                  Kolom Guru & Titimangsa Tanggal
                </span>
                <div>
                  <label className="text-[10px] text-slate-600 font-semibold block mb-1">
                    Label Tanda Tangan Guru:
                  </label>
                  <input
                    type="text"
                    value={reportConfig.teacherSignHeading}
                    onChange={(e) => handleUpdateReportConfig('teacherSignHeading', e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="e.g. Guru Yang Dinilai,"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-600 font-semibold block mb-1">
                    Kota Titimangsa Penetapan:
                  </label>
                  <input
                    type="text"
                    value={reportConfig.cityLocation}
                    onChange={(e) => handleUpdateReportConfig('cityLocation', e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="e.g. Depok"
                  />
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-[11px] text-emerald-900 leading-relaxed">
                  ✓ Format tanda tangan ini otomatis diterapkan pada cetak rapot (PDF) dan ekspor dokumen Word (.doc).
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: KOP Lembaga & Judul Rapot */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800">
                <Building className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-slate-900">2. KOP Lembaga & Judul Rapot Resmi</h4>
                <p className="text-[11px] text-slate-500">
                  Ubah nama lembaga, inisial logo, kontak instansi, dan judul dokumen rapot.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="text-[10px] text-slate-600 font-semibold block mb-1">
                  Nama Lembaga / Yayasan:
                </label>
                <input
                  type="text"
                  value={reportConfig.institutionName}
                  onChange={(e) => handleUpdateReportConfig('institutionName', e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="e.g. MTQ DARUL ABIDIN"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-600 font-semibold block mb-1">
                  Inisial Logo (Avatar KOP):
                </label>
                <input
                  type="text"
                  value={reportConfig.logoInitials}
                  onChange={(e) => handleUpdateReportConfig('logoInitials', e.target.value)}
                  maxLength={4}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg font-serif font-black text-center text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="e.g. DA"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] text-slate-600 font-semibold block mb-1">
                  Sub-Header / Deskripsi Lembaga:
                </label>
                <input
                  type="text"
                  value={reportConfig.institutionSub}
                  onChange={(e) => handleUpdateReportConfig('institutionSub', e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="e.g. Lembaga Manajemen Tahfidz & Pengajaran Al-Qur'an Terpadu"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-600 font-semibold block mb-1">
                  Alamat & Kontak Lembaga:
                </label>
                <input
                  type="text"
                  value={reportConfig.institutionContact}
                  onChange={(e) => handleUpdateReportConfig('institutionContact', e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="e.g. Depok, Jawa Barat | Website: darulabidin.sch.id..."
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label className="text-[10px] text-slate-600 font-semibold block mb-1">
                  Judul Dokumen Rapot Resmi:
                </label>
                <input
                  type="text"
                  value={reportConfig.reportTitle}
                  onChange={(e) => handleUpdateReportConfig('reportTitle', e.target.value)}
                  className="w-full p-2 bg-white border border-emerald-300 rounded-lg font-black text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="e.g. RAPORT EVALUASI & PROFIL KOMPETENSI GURU AL-QUR'AN"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label className="text-[10px] text-slate-600 font-semibold block mb-1">
                  Kalimat Mukadimah / Narasi Pengantar Rapot:
                </label>
                <textarea
                  rows={2}
                  value={reportConfig.introSentence}
                  onChange={(e) => handleUpdateReportConfig('introSentence', e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="e.g. Dokumen resmi pemetaan kompetensi pengajar Al-Qur'an..."
                />
              </div>
            </div>
          </div>

          {/* Section 3: Kalimat & Narasi Bagian Rapot */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800">
                <BookOpen className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-slate-900">3. Kalimat & Narasi Bagian-Bagian Rapot</h4>
                <p className="text-[11px] text-slate-500">
                  Sesuaikan kalimat judul diagram radar, judul tabel perolehan nilai, kotak pilar kekuatan, rekomendasi, dan doa penutup.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-[10px] text-slate-600 font-semibold block mb-1">
                  Judul Visualisasi Radar Poligon:
                </label>
                <input
                  type="text"
                  value={reportConfig.radarHeading}
                  onChange={(e) => handleUpdateReportConfig('radarHeading', e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-600 font-semibold block mb-1">
                  Keterangan Sub-Radar:
                </label>
                <input
                  type="text"
                  value={reportConfig.radarSubText}
                  onChange={(e) => handleUpdateReportConfig('radarSubText', e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-600 font-semibold block mb-1">
                  Judul Tabel Rincian Nilai 9 Indikator:
                </label>
                <input
                  type="text"
                  value={reportConfig.tableHeading}
                  onChange={(e) => handleUpdateReportConfig('tableHeading', e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-600 font-semibold block mb-1">
                  Judul Kotak Pilar Kekuatan Guru:
                </label>
                <input
                  type="text"
                  value={reportConfig.strengthsHeading}
                  onChange={(e) => handleUpdateReportConfig('strengthsHeading', e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] text-slate-600 font-semibold block mb-1">
                  Judul Kotak Rekomendasi Program Peningkatan Mutu:
                </label>
                <input
                  type="text"
                  value={reportConfig.recommendationsHeading}
                  onChange={(e) => handleUpdateReportConfig('recommendationsHeading', e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] text-slate-600 font-semibold block mb-1">
                  Kalimat Catatan Resmi & Doa Penutup Rapot:
                </label>
                <textarea
                  rows={2}
                  value={reportConfig.closingNotes}
                  onChange={(e) => handleUpdateReportConfig('closingNotes', e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
            </div>
          </div>

          {/* Live Preview Sample Card */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <span className="font-bold text-slate-800 text-xs block">
              Pratinjau KOP & Tanda Tangan Rapot Resmi (Hasil Konfigurasi):
            </span>

            {/* Header Preview */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 text-center space-y-2">
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold font-serif">
                  {reportConfig.logoInitials}
                </div>
                <div className="text-left">
                  <h4 className="text-base font-extrabold uppercase text-emerald-950 font-serif tracking-wide">
                    {reportConfig.institutionName}
                  </h4>
                  <p className="text-[11px] text-slate-600">{reportConfig.institutionSub}</p>
                </div>
              </div>
              <div className="inline-block px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-extrabold text-emerald-900">
                {reportConfig.reportTitle}
              </div>
            </div>

            {/* Signature Preview */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 text-xs">
              {reportConfig.showMudirSignature ? (
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-slate-500 mb-8">{reportConfig.teacherSignHeading}</p>
                    <p className="font-bold text-slate-900 underline">[Nama Guru], S.Pd.I</p>
                    <p className="text-[10px] text-slate-400">NIP: DA-QUR-2025-001</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-8">
                      {reportConfig.cityLocation}, [Tanggal] <br />
                      <span className="text-[10px]">{reportConfig.supervisorTitle}</span>
                    </p>
                    <p className="font-bold text-slate-900 underline">{reportConfig.supervisorName}</p>
                    <p className="text-[10px] text-slate-400">{reportConfig.supervisorNip}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-8">
                      {reportConfig.mudirSignHeading} <br />
                      <span className="text-[10px] font-semibold text-emerald-900">{reportConfig.mudirTitle}</span>
                    </p>
                    <p className="font-bold text-emerald-950 underline">{reportConfig.mudirName}</p>
                    <p className="text-[10px] text-slate-400">{reportConfig.mudirNip}</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 text-center">
                  <div>
                    <p className="text-slate-500 mb-8">{reportConfig.teacherSignHeading}</p>
                    <p className="font-bold text-slate-900 underline">[Nama Guru], S.Pd.I</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-8">
                      {reportConfig.cityLocation}, [Tanggal] <br />
                      <span className="text-[10px] font-semibold text-emerald-900">{reportConfig.mudirTitle}</span>
                    </p>
                    <p className="font-bold text-emerald-950 underline">{reportConfig.mudirName}</p>
                    <p className="text-[10px] text-slate-400">{reportConfig.mudirNip}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MOBILE PWA & DOWNLOAD KE LAYAR HP */}
      {activeTab === 'MOBILE_PWA' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-600" />
                <span>Instalasi & Penggunaan di Layar HP (Progressive Web App)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Aplikasi ini mendukung mode aplikasi penuh (*standalone*), ikon di layar beranda (*Home Screen*), dan berjalan cepat di Android maupun iPhone.
              </p>
            </div>

            {/* In-App Install Button */}
            {isInstallable && (
              <button
                type="button"
                onClick={install}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download ke Layar HP Sekarang</span>
              </button>
            )}

            {isInstalled && (
              <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1.5 border border-emerald-200">
                <Check className="w-4 h-4" />
                <span>Aplikasi Sudah Terpasang (Mode Standalone)</span>
              </span>
            )}
          </div>

          {/* Guide for Android and iOS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Android Guide */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span>🤖 Panduan Pengguna Android (Chrome / Edge):</span>
              </span>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-600 leading-relaxed">
                <li>Buka aplikasi di peramban Google Chrome HP Anda.</li>
                <li>
                  Klik tombol <strong>"Download ke Layar HP"</strong> di menu navigasi atas atau klik ikon titik tiga (⋮) di kanan atas browser.
                </li>
                <li>Pilih <strong>"Instal Aplikasi"</strong> atau <strong>"Tambahkan ke Layar Utama"</strong>.</li>
                <li>Ikon MTQ Darul Abidin akan muncul di menu aplikasi HP Anda seperti aplikasi native Play Store!</li>
              </ol>
            </div>

            {/* iOS Guide */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span>🍎 Panduan Pengguna iPhone / iPad (Safari):</span>
              </span>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-600 leading-relaxed">
                <li>Buka aplikasi menggunakan peramban <strong>Safari</strong> di iPhone/iPad.</li>
                <li>
                  Ketuk tombol <strong>Bagikan (Share)</strong> yang berlogo kotak dengan panah ke atas di bagian bawah layar Safari.
                </li>
                <li>Gulir ke bawah dan ketuk opsi <strong>"Tambah ke Layar Utama" (Add to Home Screen)</strong>.</li>
                <li>Ketuk <strong>"Tambah" (Add)</strong> di kanan atas. Aplikasi siap dibuka langsung dari layar iPhone Anda tanpa browser bar!</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
