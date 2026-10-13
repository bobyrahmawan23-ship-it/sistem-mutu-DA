import React, { useState } from 'react';
import { EVALUATION_PERIODS } from '../data/mockTeachers';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  BookOpen,
  UserCheck,
  ShieldAlert,
  Database,
  Plus,
  Printer,
  ChevronDown,
  Settings,
  Download,
  Smartphone,
  Sliders,
  Check,
} from 'lucide-react';

interface NavbarProps {
  currentRole: 'SUPERVISOR' | 'TEACHER';
  onSwitchRole: (role: 'SUPERVISOR' | 'TEACHER') => void;
  currentView: 'DASHBOARD' | 'BAYATI_CERTIFICATION' | 'SETTINGS';
  onSwitchView: (view: 'DASHBOARD' | 'BAYATI_CERTIFICATION' | 'SETTINGS') => void;
  selectedPeriodId: string;
  onSelectPeriod: (periodId: string) => void;
  onOpenArchitectureDocs: () => void;
  onOpenNewAssessment: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onSwitchRole,
  currentView,
  onSwitchView,
  selectedPeriodId,
  onSelectPeriod,
  onOpenArchitectureDocs,
  onOpenNewAssessment,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand identity */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => onSwitchView('DASHBOARD')}
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-800 to-teal-900 text-white flex items-center justify-center font-bold text-lg shadow-sm border border-emerald-700/30 shrink-0">
            <span className="font-serif">DA</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight font-serif">
                MTQ DARUL ABIDIN
              </span>
              <span className="hidden md:inline-block text-[10px] uppercase font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                Sistem Mutu Qur'ani
              </span>
            </div>
            <p className="text-[11px] text-slate-500 line-clamp-1">
              Evaluasi 9 Kompetensi & Sertifikasi Irama Bayati Guru
            </p>
          </div>
        </div>

        {/* Action Controls, PWA Mobile button, & Navigation */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* PWA Download / Mobile Install Button */}
          {isInstallable && (
            <button
              type="button"
              onClick={install}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-xs cursor-pointer animate-pulse"
              title="Download aplikasi ke layar HP"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Install di HP</span>
            </button>
          )}

          {isIOS && !isInstalled && (
            <button
              type="button"
              onClick={() => setShowIOSModal(true)}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 cursor-pointer"
              title="Petunjuk pasang di layar iPhone"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pasang di iPhone</span>
            </button>
          )}

          {/* Sertifikasi Bayati Navigation Tab */}
          <button
            type="button"
            onClick={() => onSwitchView(currentView === 'BAYATI_CERTIFICATION' ? 'DASHBOARD' : 'BAYATI_CERTIFICATION')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentView === 'BAYATI_CERTIFICATION'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
            }`}
            title="Buka Rekapitulasi Tugas Sertifikasi Irama Bayati (6 Klaster Surat)"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Sertifikasi Bayati (6 Surat)</span>
          </button>

          {/* Settings Tab Button */}
          <button
            type="button"
            onClick={() => onSwitchView(currentView === 'SETTINGS' ? 'DASHBOARD' : 'SETTINGS')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentView === 'SETTINGS'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
            }`}
            title="Buka Dasbor Pengaturan: Edit Nama Guru, 9 Parameter, dan Sub-Aspek"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden md:inline">
              {currentView === 'SETTINGS' ? 'Kembali' : 'Pengaturan'}
            </span>
          </button>

          {/* Architecture Docs Button */}
          <button
            type="button"
            onClick={onOpenArchitectureDocs}
            className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            title="Lihat Skema SQL, JSON, User Journey & Desain Sistem"
          >
            <Database className="w-3.5 h-3.5 text-emerald-700" />
            <span>Skema</span>
          </button>

          {/* Quick Assessment Button */}
          {currentRole === 'SUPERVISOR' && (
            <button
              type="button"
              onClick={onOpenNewAssessment}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Input Nilai</span>
            </button>
          )}

          {/* Role Mode Switcher Switch */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
            <button
              type="button"
              onClick={() => {
                onSwitchRole('SUPERVISOR');
                onSwitchView('DASHBOARD');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentRole === 'SUPERVISOR' && currentView === 'DASHBOARD'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Supervisor</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onSwitchRole('TEACHER');
                onSwitchView('DASHBOARD');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentRole === 'TEACHER' && currentView === 'DASHBOARD'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Guru</span>
            </button>
          </div>
        </div>
      </div>

      {/* iOS Install Helper Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-slate-200 text-xs space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>Pasang di Layar iPhone / iPad</span>
            </h3>
            <p className="text-slate-600 leading-relaxed">
              1. Ketuk tombol <strong>Bagikan (Share)</strong> di bagian bawah Safari (ikon kotak bertanda panah ke atas).<br />
              2. Gulir ke bawah lalu ketuk <strong>"Tambah ke Layar Utama" (Add to Home Screen)</strong>.<br />
              3. Ketuk <strong>"Tambah" (Add)</strong> di pojok kanan atas.
            </p>
            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2 bg-emerald-700 text-white font-bold rounded-xl"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
