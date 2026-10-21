export interface MusyrifProfile {
  id: string;
  nip: string;
  name: string;
  title: string;
  phone: string; // Nomor WhatsApp resmi musyrif/penguji
  specialization: string; // e.g. 'Master Trainer Nagham Bayati & Koordinator Tahsin'
  unit: string; // 'SEMUA' | 'SD' | 'SMP' | 'SMA' | custom
  email?: string;
  isActive: boolean;
  notes?: string;
}

export const DEFAULT_MUSYRIFS: MusyrifProfile[] = [
  {
    id: 'msy_001',
    nip: 'MSY-MTQ-2021-001',
    name: 'Drs. H. Syamsul Arifin',
    title: 'M.Ag., Master Trainer Nagham',
    phone: '0812-9876-5432',
    specialization: 'Master Trainer Nagham Bayati & Penguji Standarisasi Maqdis',
    unit: 'SEMUA',
    email: 'syamsul.arifin@darulabidin.sch.id',
    isActive: true,
    notes: 'Pembina utama sertifikasi irama Bayati 6 klaster surat MTQ Darul Abidin',
  },
  {
    id: 'msy_002',
    nip: 'MSY-MTQ-2022-002',
    name: 'Ustadz Boby Rahmawan',
    title: 'S.Pd.I, Koordinator Supervisi',
    phone: '0813-1122-3344',
    specialization: 'Koordinator Supervisi Mutu & Verifikator Rekaman Tahsin',
    unit: 'SD & SMP',
    email: 'boby.rahmawan@darulabidin.sch.id',
    isActive: true,
    notes: 'Pemeriksa pengiriman rekaman harian & talaqqi irama Bayati guru',
  },
  {
    id: 'msy_003',
    nip: 'MSY-MTQ-2020-003',
    name: 'K.H. Muhammad Shodiq',
    title: 'M.Ag., Mudir MTQ',
    phone: '0811-2233-4455',
    specialization: 'Mudir MTQ & Penguji Sidang Paripurna Irama Bayati',
    unit: 'SEMUA',
    email: 'muhammad.shodiq@darulabidin.sch.id',
    isActive: true,
    notes: 'Penanggung jawab legalitas kelulusan sertifikasi dan tanda tangan sertifikat',
  },
  {
    id: 'msy_004',
    nip: 'MSY-MTQ-2023-004',
    name: 'Ustadzah Hj. Fatimah Zahra',
    title: 'Lc., Al-Hafizhah',
    phone: '0815-6677-8899',
    specialization: 'Musyrifah Tahsin & Pembimbing Nagham Khusus Guru Putri',
    unit: 'SMP & SMA',
    email: 'fatimah.zahra@darulabidin.sch.id',
    isActive: true,
    notes: 'Musyrifah penguji halaqah tahfidz dan irama tilawah akhawat',
  },
  {
    id: 'msy_005',
    nip: 'MSY-MTQ-2023-005',
    name: 'Ustadz Ridwan Hakim',
    title: 'M.Pd., Trainer Maqdis',
    phone: '0818-4455-6677',
    specialization: 'Musyrif Ketukan Mad Thabi\'i & Fashohah Lanjutan',
    unit: 'SD',
    email: 'ridwan.hakim@darulabidin.sch.id',
    isActive: true,
    notes: 'Spesialis pengawalan ketukan mad dan fashohah huruf dalam nagham',
  },
];

const STORAGE_KEY = 'mtq_musyrif_list';

export function getStoredMusyrifList(): MusyrifProfile[] {
  if (typeof window === 'undefined') return DEFAULT_MUSYRIFS;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_MUSYRIFS;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_MUSYRIFS;
  } catch {
    return DEFAULT_MUSYRIFS;
  }
}

export function saveStoredMusyrifList(list: MusyrifProfile[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent('mtq_musyrif_updated', { detail: list }));
}

export function resetStoredMusyrifList(): MusyrifProfile[] {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('mtq_musyrif_updated', { detail: DEFAULT_MUSYRIFS }));
  }
  return DEFAULT_MUSYRIFS;
}

export function formatWhatsAppUrl(phoneNumber: string, message: string): string {
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  const targetPhone = cleanPhone.startsWith('0')
    ? `62${cleanPhone.slice(1)}`
    : cleanPhone.startsWith('62')
    ? cleanPhone
    : `62${cleanPhone}`;
  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
}
