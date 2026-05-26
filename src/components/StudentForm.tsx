/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Student } from "../types";
import { X, Save, User, MapPin, GraduationCap, Users, Camera, AlertCircle, Info, Heart } from "lucide-react";

interface StudentFormProps {
  student?: Student; // If provided, edit mode. Otherwise, add mode.
  onSave: (data: Omit<Student, "id"> | Student) => void;
  onClose: () => void;
}

const EMPTY_STUDENT: Omit<Student, "id"> = {
  personal: {
    namaLengkap: "",
    namaPanggilan: "",
    nis: "",
    nisn: "",
    jenisKelamin: "Laki-laki",
    tempatLahir: "",
    tanggalLahir: "",
    agama: "Islam",
    kewarganegaraan: "WNI",
    anakKe: 1,
    saudaraKandung: 0,
    saudaraTiri: 0,
    saudaraAngkat: 0,
    statusKeluarga: "Lengkap",
    bahasaSehariHari: "Bahasa Indonesia",
  },
  address: {
    alamatLengkap: "",
    telepon: "",
    tinggalDengan: "Orang Tua",
    jarakKeSekolah: "1",
    transportasi: "Jalan Kaki",
  },
  health: {
    golonganDarah: "O",
    penyakitPernahDiderita: "-",
    kelainanJasmani: "-",
    tinggiBadan: 160,
    beratBadan: 50,
  },
  education: {
    lulusanDari: "",
    tanggalIjazah: "",
    nomorIjazah: "",
    pindahanDari: "",
    alasanPindah: "",
  },
  parents: {
    ayah: {
      nama: "",
      agama: "Islam",
      kewarganegaraan: "WNI",
      pendidikan: "SMA",
      pekerjaan: "",
      penghasilan: "Rp 1.000.000 - Rp 3.000.000",
      alamat: "",
      telepon: "",
      isMasihHidup: true,
    },
    ibu: {
      nama: "",
      agama: "Islam",
      kewarganegaraan: "WNI",
      pendidikan: "SMA",
      pekerjaan: "",
      penghasilan: "Rp 1.000.000 - Rp 3.000.000",
      alamat: "",
      telepon: "",
      isMasihHidup: true,
    }
  },
  guardian: {
    hasWali: false,
    nama: "",
    agama: "Islam",
    kewarganegaraan: "WNI",
    pendidikan: "SMA",
    pekerjaan: "",
    penghasilan: "",
    alamat: "",
    telepon: "",
    hubunganSiswa: "",
  },
  school: {
    kelasSkarang: "X-A",
    programKeahlian: "MIPA",
    tanggalMasuk: new Date().toISOString().split("T")[0],
    beasiswa: "-",
    nomorStb: "",
  },
  foto: "",
};

export const StudentForm: React.FC<StudentFormProps> = ({ student, onSave, onClose }) => {
  const isEdit = !!student;
  const [activeTab, setActiveTab] = useState<"pribadi" | "alamat_sehat" | "sekolah_pddk" | "keluarga">("pribadi");
  const [formData, setFormData] = useState<Student | Omit<Student, "id">>(
    student ? JSON.parse(JSON.stringify(student)) : JSON.parse(JSON.stringify(EMPTY_STUDENT))
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePersonalChange = (field: keyof typeof EMPTY_STUDENT.personal, value: any) => {
    setFormData((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        [field]: value,
      },
    }));
  };

  const handleAddressChange = (field: keyof typeof EMPTY_STUDENT.address, value: any) => {
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));
  };

  const handleHealthChange = (field: keyof typeof EMPTY_STUDENT.health, value: any) => {
    setFormData((prev) => ({
      ...prev,
      health: {
        ...prev.health,
        [field]: value,
      },
    }));
  };

  const handleEducationChange = (field: keyof typeof EMPTY_STUDENT.education, value: any) => {
    setFormData((prev) => ({
      ...prev,
      education: {
        ...prev.education,
        [field]: value,
      },
    }));
  };

  const handleSchoolChange = (field: keyof typeof EMPTY_STUDENT.school, value: any) => {
    setFormData((prev) => ({
      ...prev,
      school: {
        ...prev.school,
        [field]: value,
      },
    }));
  };

  const handleParentChange = (parentRole: "ayah" | "ibu", field: any, value: any) => {
    setFormData((prev) => ({
      ...prev,
      parents: {
        ...prev.parents,
        [parentRole]: {
          ...prev.parents[parentRole],
          [field]: value,
        },
      },
    }));
  };

  const handleGuardianChange = (field: keyof typeof EMPTY_STUDENT.guardian, value: any) => {
    setFormData((prev) => ({
      ...prev,
      guardian: {
        ...prev.guardian,
        [field]: value,
      },
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMsg("Ukuran berkas melebihi 2MB. Silakan pilih foto yang lebih kecil.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          foto: reader.result as string,
        }));
        setErrorMsg(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setFormData((prev) => ({
      ...prev,
      foto: "",
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Simple validation
    if (!formData.personal.namaLengkap.trim()) {
      setErrorMsg("Nama Lengkap wajib diisi!");
      setActiveTab("pribadi");
      return;
    }
    if (!formData.personal.nisn.trim() || formData.personal.nisn.length < 5) {
      setErrorMsg("NISN valid wajib diisi!");
      setActiveTab("pribadi");
      return;
    }
    if (!formData.personal.nis.trim()) {
      setErrorMsg("NIS wajib diisi!");
      setActiveTab("pribadi");
      return;
    }

    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-800/80 text-blue-400 rounded-xl border border-slate-700">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-white text-lg">
                {isEdit ? "Sunting Data Buku Induk" : "Tambah Siswa Baru"}
              </h3>
              <p className="text-xs text-slate-300">
                Lengkapi seluruh data akademis dan data keluarga siswa sesuai Kartu Keluarga & Rapor.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition"
            title="Keluar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="bg-slate-50 border-b border-gray-200 px-6 pt-3 flex overflow-x-auto gap-2 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("pribadi")}
            className={`pb-3 px-4 text-xs font-bold font-sans flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === "pribadi"
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            1. Data Pribadi
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("alamat_sehat")}
            className={`pb-3 px-4 text-xs font-bold font-sans flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === "alamat_sehat"
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            2. Alamat & Kesehatan
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("sekolah_pddk")}
            className={`pb-3 px-4 text-xs font-bold font-sans flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === "sekolah_pddk"
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-gray-500 hover:text-gray-805 hover:text-gray-800"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            3. Pendidikan & Sekolah
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("keluarga")}
            className={`pb-3 px-4 text-xs font-bold font-sans flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === "keluarga"
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-gray-500 hover:text-gray-805 hover:text-gray-800"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            4. Orang Tua & Wali
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-start gap-2.5 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: DATA PRIBADI */}
          {activeTab === "pribadi" && (
            <div className="space-y-6">
              {/* Photo Upload and Top Info */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
                <div className="md:col-span-1 flex flex-col items-center">
                  <span className="text-xs font-bold text-gray-600 mb-2 font-sans self-start">Foto Resmi Siswa</span>
                  <div className="w-full aspect-[3/4] rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100/50 transition relative overflow-hidden flex flex-col items-center justify-center p-2 group">
                    {formData.foto ? (
                      <>
                        <img
                          src={formData.foto}
                          alt="Pas Foto"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover rounded-xl"
                        />
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg opacity-0 group-hover:opacity-100 transition shadow-lg shadow-red-600/30 text-xs"
                        >
                          Hapus
                        </button>
                      </>
                    ) : (
                      <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center gap-2">
                        <div className="p-3 bg-white text-emerald-600 rounded-2xl shadow-sm border border-gray-100">
                          <Camera className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                          <span className="text-xs font-bold text-emerald-600 block">Pilih Berkas</span>
                          <span className="text-[10px] text-gray-400 block mt-0.5">3x4 (Maks 2MB)</span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nama Lengkap*</label>
                    <input
                      type="text"
                      required
                      value={formData.personal.namaLengkap}
                      onChange={(e) => handlePersonalChange("namaLengkap", e.target.value)}
                      placeholder="Contoh: Rian Hidayat Siregar"
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nama Panggilan</label>
                    <input
                      type="text"
                      value={formData.personal.namaPanggilan}
                      onChange={(e) => handlePersonalChange("namaPanggilan", e.target.value)}
                      placeholder="Contoh: Rian"
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">NIS (Nomor Induk Siswa)*</label>
                    <input
                      type="text"
                      required
                      value={formData.personal.nis}
                      onChange={(e) => handlePersonalChange("nis", e.target.value)}
                      placeholder="Contoh: 221001"
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 font-semibold font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">NISN (Nasional)*</label>
                    <input
                      type="text"
                      required
                      maxLength={10}
                      value={formData.personal.nisn}
                      onChange={(e) => handlePersonalChange("nisn", e.target.value)}
                      placeholder="10 digit nomor NISN"
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 font-semibold font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Jenis Kelamin</label>
                    <div className="flex gap-4 mt-1.5">
                      <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                        <input
                          type="radio"
                          name="jenisKelamin"
                          checked={formData.personal.jenisKelamin === "Laki-laki"}
                          onChange={() => handlePersonalChange("jenisKelamin", "Laki-laki")}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        Laki-laki
                      </label>
                      <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                        <input
                          type="radio"
                          name="jenisKelamin"
                          checked={formData.personal.jenisKelamin === "Perempuan"}
                          onChange={() => handlePersonalChange("jenisKelamin", "Perempuan")}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        Perempuan
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Agama</label>
                    <select
                      value={formData.personal.agama}
                      onChange={(e) => handlePersonalChange("agama", e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                    >
                      <option value="Islam">Islam</option>
                      <option value="Kristen">Kristen</option>
                      <option value="Katolik">Katolik</option>
                      <option value="Hindu">Hindu</option>
                      <option value="Buddha">Buddha</option>
                      <option value="Konghucu">Konghucu</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-gray-100 pt-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    value={formData.personal.tempatLahir}
                    onChange={(e) => handlePersonalChange("tempatLahir", e.target.value)}
                    placeholder="Contoh: Medan"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={formData.personal.tanggalLahir}
                    onChange={(e) => handlePersonalChange("tanggalLahir", e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 font-semibold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Kewarganegaraan</label>
                  <input
                    type="text"
                    value={formData.personal.kewarganegaraan}
                    onChange={(e) => handlePersonalChange("kewarganegaraan", e.target.value)}
                    placeholder="Contoh: WNI"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-gray-100 pt-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Anak Ke-</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.personal.anakKe}
                    onChange={(e) => handlePersonalChange("anakKe", parseInt(e.target.value) || 1)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Saudara Kandung</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.personal.saudaraKandung}
                    onChange={(e) => handlePersonalChange("saudaraKandung", parseInt(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-400/20 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Saudara Tiri</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.personal.saudaraTiri}
                    onChange={(e) => handlePersonalChange("saudaraTiri", parseInt(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Bahasa Sehari-hari</label>
                  <input
                    type="text"
                    value={formData.personal.bahasaSehariHari}
                    onChange={(e) => handlePersonalChange("bahasaSehariHari", e.target.value)}
                    placeholder="Indonesia / Sunda"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Status Hubungan Keluarga</label>
                  <select
                    value={formData.personal.statusKeluarga}
                    onChange={(e) => handlePersonalChange("statusKeluarga", e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                  >
                    <option value="Lengkap">Lengkap (Bersama Ayah & Ibu)</option>
                    <option value="Yatim">Yatim (Ayah telah Wafat)</option>
                    <option value="Piatu">Piatu (Ibu telah Wafat)</option>
                    <option value="Yatim Piatu">Yatim Piatu</option>
                    <option value="Broken Home / Ditinggal">Lainnya / Ditinggali</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ALAMAT & KESEHATAN */}
          {activeTab === "alamat_sehat" && (
            <div className="space-y-6">
              <h4 className="text-sm font-bold text-slate-800 border-b border-gray-100 pb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" /> Keterangan Tempat Tinggal
              </h4>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Alamat Domisili Lengkap</label>
                  <textarea
                    rows={2}
                    value={formData.address.alamatLengkap}
                    onChange={(e) => handleAddressChange("alamatLengkap", e.target.value)}
                    placeholder="Nama jalan, nomor rumah, RT/RW, pedesaan/kelurahan, kecamatan dan kota"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nomor Telepon / HP</label>
                  <input
                    type="text"
                    value={formData.address.telepon}
                    onChange={(e) => handleAddressChange("telepon", e.target.value)}
                    placeholder="0812xxxxxx"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 font-semibold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tinggal Dengan</label>
                  <select
                    value={formData.address.tinggalDengan}
                    onChange={(e) => handleAddressChange("tinggalDengan", e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                  >
                    <option value="Orang Tua">Orang Tua Kandung</option>
                    <option value="Wali (Paman/Bibi)">Wali / Kerabat</option>
                    <option value="Kos">Kos Mandiri</option>
                    <option value="Asrama / Pondok">Asrama / Pondok Pesantren</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Transportasi ke Sekolah</label>
                  <input
                    type="text"
                    value={formData.address.transportasi}
                    onChange={(e) => handleAddressChange("transportasi", e.target.value)}
                    placeholder="Contoh: Sepeda Motor / Angkot"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Jarak ke Sekolah (KM)</label>
                  <input
                    type="text"
                    value={formData.address.jarakKeSekolah}
                    onChange={(e) => handleAddressChange("jarakKeSekolah", e.target.value)}
                    placeholder="Contoh: 1.5"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 font-semibold font-mono"
                  />
                </div>
              </div>

              <h4 className="text-sm font-bold text-slate-800 border-b border-gray-100 pb-2 pt-4 flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-600" /> Keterangan Riwayat Kesehatan
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Golongan Darah</label>
                  <select
                    value={formData.health.golonganDarah}
                    onChange={(e) => handleHealthChange("golonganDarah", e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="AB">AB</option>
                    <option value="O">O</option>
                    <option value="-">- (Belum Tahu)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tinggi Badan (cm)</label>
                  <input
                    type="number"
                    value={formData.health.tinggiBadan}
                    onChange={(e) => handleHealthChange("tinggiBadan", parseInt(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 font-semibold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Berat Badan (kg)</label>
                  <input
                    type="number"
                    value={formData.health.beratBadan}
                    onChange={(e) => handleHealthChange("beratBadan", parseInt(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 font-semibold font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Penyakit yang Pernah Diderita</label>
                  <input
                    type="text"
                    value={formData.health.penyakitPernahDiderita}
                    onChange={(e) => handleHealthChange("penyakitPernahDiderita", e.target.value)}
                    placeholder="Contoh: Asma (Terkontrol)"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Kelainan Jasmani / Disabilitas</label>
                  <input
                    type="text"
                    value={formData.health.kelainanJasmani}
                    onChange={(e) => handleHealthChange("kelainanJasmani", e.target.value)}
                    placeholder="Menggunakan kacamata / Tidak ada"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PENDIDIKAN & SEKOLAH */}
          {activeTab === "sekolah_pddk" && (
            <div className="space-y-6">
              <h4 className="text-sm font-bold text-slate-800 border-b border-gray-100 pb-2 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-600" /> Riwayat Pendidikan Sebelumnya (Dasar)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Lulus dari Sekolah (SMP/MTs)</label>
                  <input
                    type="text"
                    value={formData.education.lulusanDari}
                    onChange={(e) => handleEducationChange("lulusanDari", e.target.value)}
                    placeholder="Contoh: SMP Negeri 1 Medan"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nomor Ijazah</label>
                  <input
                    type="text"
                    value={formData.education.nomorIjazah}
                    onChange={(e) => handleEducationChange("nomorIjazah", e.target.value)}
                    placeholder="Nama seri nomor ijazah"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 font-semibold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tanggal Kelulusan Ijazah</label>
                  <input
                    type="date"
                    value={formData.education.tanggalIjazah}
                    onChange={(e) => handleEducationChange("tanggalIjazah", e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 font-semibold font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Pindahan Dari Sekolah (Jika ada)</label>
                  <input
                    type="text"
                    value={formData.education.pindahanDari}
                    onChange={(e) => handleEducationChange("pindahanDari", e.target.value)}
                    placeholder="Nama SMA asal jika mutasi"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Alasan Pindah Sekolah</label>
                  <input
                    type="text"
                    value={formData.education.alasanPindah}
                    onChange={(e) => handleEducationChange("alasanPindah", e.target.value)}
                    placeholder="Mengikuti tugas kerja orang tua..."
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                  />
                </div>
              </div>

              <h4 className="text-sm font-bold text-slate-800 border-b border-gray-100 pb-2 pt-4 flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-600" /> Status Registrasi Sekolah Ini
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Kelas Aktif*</label>
                  <select
                    value={formData.school.kelasSkarang}
                    onChange={(e) => handleSchoolChange("kelasSkarang", e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                  >
                    <option value="X-A">X-A</option>
                    <option value="X-B">X-B</option>
                    <option value="XI-A">XI-A</option>
                    <option value="XI-B">XI-B</option>
                    <option value="XII-A">XII-A</option>
                    <option value="XII-B">XII-B</option>
                    <option value="XII-C">XII-C</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Program / Jurusan Keahlian</label>
                  <input
                    type="text"
                    value={formData.school.programKeahlian}
                    onChange={(e) => handleSchoolChange("programKeahlian", e.target.value)}
                    placeholder="MIPA / IPS / RPL / Tata Boga"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nomor Buku Induk (STB)</label>
                  <input
                    type="text"
                    value={formData.school.nomorStb}
                    onChange={(e) => handleSchoolChange("nomorStb", e.target.value)}
                    placeholder="Contoh: BI-2025-004"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 font-semibold font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tanggal Masuk</label>
                  <input
                    type="date"
                    value={formData.school.tanggalMasuk}
                    onChange={(e) => handleSchoolChange("tanggalMasuk", e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 font-semibold font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Keterangan Beasiswa</label>
                  <input
                    type="text"
                    value={formData.school.beasiswa}
                    onChange={(e) => handleSchoolChange("beasiswa", e.target.value)}
                    placeholder="Penerima PIP / Beasiswa Yayasan..."
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ORANG TUA & WALI */}
          {activeTab === "keluarga" && (
            <div className="space-y-6">
              {/* AYAH */}
              <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/50">
                <h4 className="text-sm font-bold text-slate-800 border-b border-gray-100 pb-2 mb-4 flex items-center justify-between">
                  <span>👨‍💼 Data Ayah Kandung</span>
                  <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer Normal select-none">
                    <input
                      type="checkbox"
                      checked={formData.parents.ayah.isMasihHidup}
                      onChange={(e) => handleParentChange("ayah", "isMasihHidup", e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    Masih Hidup
                  </label>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nama Ayah</label>
                    <input
                      type="text"
                      value={formData.parents.ayah.nama}
                      onChange={(e) => handleParentChange("ayah", "nama", e.target.value)}
                      placeholder="Nama ayah lengkap"
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                    />
                  </div>
                  {formData.parents.ayah.isMasihHidup && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Pendidikan</label>
                        <input
                          type="text"
                          value={formData.parents.ayah.pendidikan}
                          onChange={(e) => handleParentChange("ayah", "pendidikan", e.target.value)}
                          placeholder="SD/SMP/SMA/S1"
                          className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Pekerjaan</label>
                        <input
                          type="text"
                          value={formData.parents.ayah.pekerjaan}
                          onChange={(e) => handleParentChange("ayah", "pekerjaan", e.target.value)}
                          placeholder="Karyawan Swasta / Wiraswasta"
                          className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Rentang Penghasilan</label>
                        <select
                          value={formData.parents.ayah.penghasilan}
                          onChange={(e) => handleParentChange("ayah", "penghasilan", e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                        >
                          <option value="Tidak Berpenghasilan">Tidak Berpenghasilan</option>
                          <option value="Kurang dari Rp 1.000.000">Kurang dari Rp 1.000.000</option>
                          <option value="Rp 1.000.000 - Rp 3.000.000">Rp 1.000.000 - Rp 3.000.000</option>
                          <option value="Rp 3.000.000 - Rp 5.000.000">Rp 3.000.000 - Rp 5.000.000</option>
                          <option value="Rp 5.000.000 - Rp 10.000.000">Rp 5.000.000 - Rp 10.000.000</option>
                          <option value="Lebih dari Rp 10.000.000">Lebih dari Rp 10.000.000</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nomor Telp/HP</label>
                        <input
                          type="text"
                          value={formData.parents.ayah.telepon}
                          onChange={(e) => handleParentChange("ayah", "telepon", e.target.value)}
                          placeholder="0812xxxxx"
                          className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 font-semibold font-mono"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Alamat Domisili Ayah</label>
                        <input
                          type="text"
                          value={formData.parents.ayah.alamat}
                          onChange={(e) => handleParentChange("ayah", "alamat", e.target.value)}
                          placeholder="Tulis alamat atau 'Sama dengan siswa'"
                          className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* IBU */}
              <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/50">
                <h4 className="text-sm font-bold text-slate-800 border-b border-gray-100 pb-2 mb-4 flex items-center justify-between">
                  <span>👩‍💼 Data Ibu Kandung</span>
                  <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer Normal select-none">
                    <input
                      type="checkbox"
                      checked={formData.parents.ibu.isMasihHidup}
                      onChange={(e) => handleParentChange("ibu", "isMasihHidup", e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    Masih Hidup
                  </label>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nama Ibu</label>
                    <input
                      type="text"
                      value={formData.parents.ibu.nama}
                      onChange={(e) => handleParentChange("ibu", "nama", e.target.value)}
                      placeholder="Nama ibu lengkap"
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                    />
                  </div>
                  {formData.parents.ibu.isMasihHidup && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Pendidikan</label>
                        <input
                          type="text"
                          value={formData.parents.ibu.pendidikan}
                          onChange={(e) => handleParentChange("ibu", "pendidikan", e.target.value)}
                          placeholder="SD/SMP/SMA/S1"
                          className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Pekerjaan</label>
                        <input
                          type="text"
                          value={formData.parents.ibu.pekerjaan}
                          onChange={(e) => handleParentChange("ibu", "pekerjaan", e.target.value)}
                          placeholder="Ibu Rumah Tangga / PNS"
                          className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Rentang Penghasilan</label>
                        <select
                          value={formData.parents.ibu.penghasilan}
                          onChange={(e) => handleParentChange("ibu", "penghasilan", e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                        >
                          <option value="Tidak Berpenghasilan">Tidak Berpenghasilan</option>
                          <option value="Kurang dari Rp 1.000.000">Kurang dari Rp 1.000.000</option>
                          <option value="Rp 1.000.000 - Rp 3.000.000">Rp 1.000.000 - Rp 3.000.000</option>
                          <option value="Rp 3.000.000 - Rp 5.000.000">Rp 3.000.000 - Rp 5.000.000</option>
                          <option value="Rp 5.000.000 - Rp 10.000.000">Rp 5.000.000 - Rp 10.000.000</option>
                          <option value="Lebih dari Rp 10.000.000">Lebih dari Rp 10.000.000</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nomor Telp/HP</label>
                        <input
                          type="text"
                          value={formData.parents.ibu.telepon}
                          onChange={(e) => handleParentChange("ibu", "telepon", e.target.value)}
                          placeholder="0852xxxxx"
                          className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 font-semibold font-mono"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Alamat Domisili Ibu</label>
                        <input
                          type="text"
                          value={formData.parents.ibu.alamat}
                          onChange={(e) => handleParentChange("ibu", "alamat", e.target.value)}
                          placeholder="Tulis alamat atau 'Sama dengan siswa'"
                          className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* WALI */}
              <div className="border border-slate-105 rounded-2xl p-5 bg-slate-50/50">
                <h4 className="text-sm font-bold text-slate-800 border-b border-gray-100 pb-2 mb-4 flex items-center justify-between">
                  <span>🛡️ Keterangan Wali Siswa</span>
                  <label className="flex items-center gap-1.5 text-xs text-slate-600 font-sans cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.guardian.hasWali}
                      onChange={(e) => handleGuardianChange("hasWali", e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    Menggunakan Wali
                  </label>
                </h4>
                {formData.guardian.hasWali ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nama Lengkap Wali</label>
                      <input
                        type="text"
                        required
                        value={formData.guardian.nama}
                        onChange={(e) => handleGuardianChange("nama", e.target.value)}
                        placeholder="Nama wali murid"
                        className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Hubungan dengan Siswa</label>
                      <input
                        type="text"
                        required
                        value={formData.guardian.hubunganSiswa}
                        onChange={(e) => handleGuardianChange("hubunganSiswa", e.target.value)}
                        placeholder="Paman / Bibi / Kakak Kandung"
                        className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Pekerjaan Wali</label>
                      <input
                        type="text"
                        value={formData.guardian.pekerjaan}
                        onChange={(e) => handleGuardianChange("pekerjaan", e.target.value)}
                        placeholder="Pekerjaan wali"
                        className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nomor Telp/HP Wali</label>
                      <input
                        type="text"
                        value={formData.guardian.telepon}
                        onChange={(e) => handleGuardianChange("telepon", e.target.value)}
                        placeholder="0813xxxxxxxx"
                        className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 font-semibold font-mono"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Alamat Domisili Wali</label>
                      <input
                        type="text"
                        value={formData.guardian.alamat}
                        onChange={(e) => handleGuardianChange("alamat", e.target.value)}
                        placeholder="Alamat lengkap tempat tinggal wali"
                        className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic bg-gray-50 border border-gray-100 p-3 rounded-xl flex items-center gap-2">
                    <Info className="w-4 h-4 text-gray-400" />
                    Siswa tidak diwakili oleh wali (Data administrasi full merujuk langsung kepada orang tua kandung).
                  </p>
                )}
              </div>
            </div>
          )}
        </form>

        {/* Footer actions */}
        <div className="bg-slate-50 border-t border-gray-100 p-5 px-6 flex items-center justify-between sticky bottom-0 z-10">
          <div className="text-xs text-gray-500">
            * Menunjukkan kolom wajib diisi.
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-sm font-semibold transition"
            >
              Batalkan
            </button>
            <button
              type="button"
              id="submit-form-button"
              onClick={handleSubmit}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/10 transition"
            >
              <Save className="w-4 h-4" />
              {isEdit ? "Simpan Perubahan" : "Simpan Siswa"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
