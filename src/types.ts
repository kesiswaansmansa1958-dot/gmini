/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface StudentPersonalData {
  namaLengkap: string;
  namaPanggilan: string;
  nis: string;
  nisn: string;
  jenisKelamin: "Laki-laki" | "Perempuan";
  tempatLahir: string;
  tanggalLahir: string; // YYYY-MM-DD
  agama: string;
  kewarganegaraan: string;
  anakKe: number;
  saudaraKandung: number;
  saudaraTiri: number;
  saudaraAngkat: number;
  saudaraKembar?: number; // Added from Purwokerto form
  anakYatimPiatu?: string; // Added: "Bukan Anak Yatim Piatu" etc.
  statusKeluarga: string; // Yatim / Piatu / Yatim Piatu / Lengkap
  bahasaSehariHari: string;
}

export interface StudentAddressData {
  alamatLengkap: string;
  telepon: string;
  tinggalDengan: string; // Orang Tua / Wali / Asrama / Kos
  jarakKeSekolah: string; // km or meters
  transportasi: string;
}

export interface StudentHealthData {
  golonganDarah: string;
  penyakitPernahDiderita: string;
  kelainanJasmani: string;
  tinggiBadan: number; // cm
  beratBadan: number; // kg
}

export interface StudentEducationData {
  lulusanDari: string;
  tanggalIjazah: string;
  nomorIjazah: string;
  pindahanDari?: string;
  alasanPindah?: string;
  lamaBelajar?: string; // e.g. "3 Tahun"
  nilaiRerataSMP?: {
    agama?: number;
    ppkn?: number;
    bIndonesia?: number;
    matematika?: number;
    ipa?: number;
    ips?: number;
    bInggris?: number;
  };
  prestasiAkademik?: string;
  prestasiNonAkademik?: string;
}

export interface ParentData {
  nama: string;
  nik?: string; // Added from Purwokerto form
  tempatLahir?: string; // Added
  tanggalLahir?: string; // Added
  agama: string;
  kewarganegaraan: string;
  pendidikan: string;
  pekerjaan: string;
  penghasilan: string;
  alamat: string;
  telepon: string;
  isMasihHidup: boolean;
}

export interface StudentParentsData {
  ayah: ParentData;
  ibu: ParentData;
}

export interface StudentGuardianData {
  hasWali: boolean;
  nama: string;
  nik?: string; // Added
  tempatLahir?: string; // Added
  tanggalLahir?: string; // Added
  agama: string;
  kewarganegaraan: string;
  pendidikan: string;
  pekerjaan: string;
  penghasilan: string;
  alamat: string;
  telepon: string;
  hubunganSiswa: string;
}

export interface StudentSchoolData {
  kelasSkarang: string; // X, XI, XII
  programKeahlian?: string; // MIPA, IPS, Bahasa, atau Jurusan SMK
  tanggalMasuk: string;
  beasiswa?: string;
  tanggalKeluar?: string;
  alasanKeluar?: string;
  nomorStb?: string; // Nomor Buku Induk
}

export interface StudentKegemaranData {
  kesenian?: string;
  olahraga?: string;
  organisasi?: string;
}

export interface Student {
  id: string; // Unique GUID or NISN
  noPendaftaran?: string; // Added
  nik?: string; // Added: NIK Siswa
  noKk?: string; // Added: Nomor KK
  noKip?: string; // Added: No KIP
  idDtks?: string; // Added: ID DTKS
  personal: StudentPersonalData;
  address: StudentAddressData;
  health: StudentHealthData;
  education: StudentEducationData;
  parents: StudentParentsData;
  guardian: StudentGuardianData;
  school: StudentSchoolData;
  kegemaran?: StudentKegemaranData; // Added
  foto?: string; // Base64 string or placeholder path
  allowPrint?: boolean; // Controls whether this student is allowed to print their record book
}

export interface CorrectionRequest {
  id: string;
  studentId: string;
  studentNisn: string;
  studentNama: string;
  requestDate: string; // YYYY-MM-DD HH:mm
  fieldName: string; // format: "personal.namaLengkap" or "address.alamatLengkap"
  fieldLabel: string; // e.g., "Nama Lengkap" or "Alamat Lengkap"
  oldValue: string;
  newValue: string;
  status: "Diproses" | "Disetujui" | "Ditolak";
  notes?: string; // Rejection feedback or admin notes
}

export type AppRole = "ADMIN" | "SISWA" | "GUEST";
