/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from "react";
import { Student } from "../types";
import { Printer, X, Award, ShieldAlert, Heart, MapPin, User, GraduationCap } from "lucide-react";

interface StudentPrintViewProps {
  student: Student;
  onClose: () => void;
}

export const StudentPrintView: React.FC<StudentPrintViewProps> = ({ student, onClose }) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  // Helper inside the printable page to show elegant field rows
  const renderRow = (num: string | number, label: string, value: string | number | undefined) => {
    return (
      <tr className="border-b border-gray-100 hover:bg-gray-50/50 print:hover:bg-transparent">
        <td className="py-2 px-3 text-center font-mono text-xs text-gray-400 w-10 print:py-1 print:px-2">{num}</td>
        <td className="py-2 px-3 text-sm text-gray-600 font-medium w-64 print:py-1 print:px-2 print:text-xs">{label}</td>
        <td className="py-2 px-3 text-sm text-gray-400 w-4 print:py-1 print:px-2 print:text-xs text-center">:</td>
        <td className="py-2 px-3 text-sm text-gray-900 font-semibold print:py-1 print:px-2 print:text-xs">
          {value !== undefined && value !== null && value !== "" ? value : <span className="text-gray-300 font-normal italic">-</span>}
        </td>
      </tr>
    );
  };

  const renderSectionHeader = (title: string, icon: React.ReactNode) => {
    return (
      <tr className="bg-slate-50/80 print:bg-slate-100/50">
        <td colSpan={4} className="py-2 px-3 print:py-1.5 font-sans font-bold text-sm text-slate-800 tracking-wide border-y border-slate-200">
          <div className="flex items-center gap-2">
            <span className="print:hidden text-slate-500">{icon}</span>
            <span>{title}</span>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div id="print-modal-container" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4 md:p-8">
      {/* Container containing control panel AND the printable paper sheet */}
      <div className="bg-slate-100 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-4 relative flex flex-col print:bg-white print:m-0 print:p-0 print:shadow-none print:rounded-none">
        
        {/* Navigation / Control bar - HIDE ON PRINT */}
        <div className="bg-white border-b border-gray-200 p-4 sticky top-0 flex flex-wrap items-center justify-between gap-3 z-10 print:hidden shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-slate-800">Pratinjau Cetak Buku Induk</h3>
              <p className="font-mono text-xs text-gray-500">
                Siswa: {student.personal.namaLengkap} - NISN: {student.personal.nisn}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              id="btn-print-action"
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-sans font-semibold rounded-xl text-sm transition shadow-md shadow-emerald-600/10"
            >
              <Printer className="w-4 h-4" />
              Cetak Sekarang
            </button>
            <button
              id="btn-close-print"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Informative Tip - HIDE ON PRINT */}
        <div className="print:hidden bg-blue-50/70 border-b border-blue-100 p-3 text-xs text-blue-700 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
          <span>
            <strong>Tips Cetak:</strong> Pastikan opsi <em>Background graphics</em> dicentang dan <em>Headers and footers</em> dinonaktifkan di pengaturan dialog print browser untuk hasil terbaik.
          </span>
        </div>

        {/* The Actual Sheet Paper */}
        <div 
          ref={printAreaRef}
          id="printable-buku-induk-page"
          className="bg-white p-8 md:p-12 mx-auto w-full min-h-[1123px] text-zinc-800 font-sans shadow-inner print:p-0 print:shadow-none"
        >
          {/* Header Garuda / KOP */}
          <div className="text-center border-b-2 border-double border-slate-800 pb-5 mb-6">
            <h1 className="text-lg font-extrabold tracking-widest text-slate-900 uppercase">
              KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI
            </h1>
            <h2 className="text-xl font-black uppercase text-slate-900 tracking-wider">
              BUKU INDUK PESERTA DIDIK
            </h2>
            <h3 className="text-md font-bold text-slate-700 uppercase tracking-widest mt-0.5">
              SEKOLAH MENENGAH ATAS / KEJURUAN NEGERI INDONESIA
            </h3>
            <p className="text-xs font-mono text-slate-500 mt-2">
              Status Terakreditasi A • NPSN: 12345678 • Email: info@sekolah.sch.id
            </p>
          </div>

          {/* Subtitle / Registry Number */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6 border-b border-dashed border-gray-200 pb-4">
            <div>
              <span className="text-xs font-mono text-gray-400 block uppercase">No. Seri Buku Induk</span>
              <span className="text-sm font-mono font-bold text-slate-800 text-left">
                {student.school.nomorStb || `BI-${student.personal.nisn}`}
              </span>
            </div>
            <div className="sm:text-right">
              <span className="text-xs font-mono text-gray-400 block uppercase">Status Terdaftar</span>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                Aktif (Kelas {student.school.kelasSkarang})
              </span>
            </div>
          </div>

          {/* Paper Body layout: List data + big student photo on top right */}
          <div className="relative">
            {/* Stamp / Photo area on upper right of the profile */}
            <div className="float-right ml-6 mb-4 mt-1 border-2 border-slate-700 p-1 bg-white print:border-slate-800 w-36 h-48 flex flex-col items-center justify-between shadow-md print:shadow-none relative">
              {student.foto ? (
                <img 
                  src={student.foto} 
                  alt={student.personal.namaLengkap} 
                  referrerPolicy="no-referrer"
                  className="w-full h-[142px] object-cover rounded-sm"
                />
              ) : (
                <div className={`w-full h-[142px] flex flex-col items-center justify-center gap-2 rounded-sm ${student.personal.jenisKelamin === "Perempuan" ? "bg-rose-50" : "bg-sky-50"}`}>
                  <User className={`w-12 h-12 ${student.personal.jenisKelamin === "Perempuan" ? "text-rose-300" : "text-sky-300"}`} />
                  <span className="text-[10px] text-gray-400 font-mono italic">Foto 3x4</span>
                </div>
              )}
              <div className="w-full text-center border-t border-slate-200 py-1 bg-slate-50">
                <span className="font-mono text-[9px] uppercase font-bold text-slate-500">
                  {student.personal.nisn}
                </span>
              </div>
            </div>

            {/* Introduction block */}
            <div className="mb-4">
              <p className="text-xs text-justify text-slate-600 leading-relaxed">
                Berikut adalah lembar ringkasan informasi siswa yang ditarik dari Sistem Database Buku Induk Sekolah Menengah. Seluruh entries di bawah ini bernilai absah sesuai dengan berkas rapor, ijazah pendidikan dasar siswa yang bersangkutan, serta verifikasi data wali amanah.
              </p>
            </div>

            <div className="clear-none">
              <table className="w-full text-left border-collapse">
                <tbody>
                  {/* ====== SECTION 1 ====== */}
                  {renderSectionHeader("I. KETERANGAN PRIBADI SISWA", <User className="w-4 h-4 text-emerald-600" />)}
                  {renderRow("1", "Nama Lengkap Peserta Didik", student.personal.namaLengkap)}
                  {renderRow("2", "Nama Panggilan", student.personal.namaPanggilan)}
                  {renderRow("3", "Nomor Induk Siswa (NIS)", student.personal.nis)}
                  {renderRow("4", "Nomor Induk Siswa Nasional (NISN)", student.personal.nisn)}
                  {renderRow("5", "Jenis Kelamin", student.personal.jenisKelamin)}
                  {renderRow("6", "Tempat & Tanggal Lahir", `${student.personal.tempatLahir}, ${student.personal.tanggalLahir}`)}
                  {renderRow("7", "Agama", student.personal.agama)}
                  {renderRow("8", "Kewarganegaraan", student.personal.kewarganegaraan)}
                  {renderRow("9", "Anak Ke-", `${student.personal.anakKe}`)}
                  {renderRow("10", "Jumlah Saudara Kandung", `${student.personal.saudaraKandung} Orang`)}
                  {renderRow("11", "Jumlah Saudara Tiri / Angkat", `${student.personal.saudaraTiri} / ${student.personal.saudaraAngkat} Orang`)}
                  {renderRow("12", "Status Hubungan Keluarga", student.personal.statusKeluarga)}
                  {renderRow("13", "Bahasa Sehari-hari Rumah", student.personal.bahasaSehariHari)}

                  {/* ====== SECTION 2 ====== */}
                  {renderSectionHeader("II. KETERANGAN TEMPAT TINGGAL", <MapPin className="w-4 h-4 text-emerald-600" />)}
                  {renderRow("14", "Alamat Domisili Lengkap", student.address.alamatLengkap)}
                  {renderRow("15", "Nomor Telepon Rumah / HP", student.address.telepon)}
                  {renderRow("16", "Tinggal Bersama", student.address.tinggalDengan)}
                  {renderRow("17", "Jarak Rumah ke Sekolah", `${student.address.jarakKeSekolah} KM`)}
                  {renderRow("18", "Moda Transportasi Harian", student.address.transportasi)}

                  {/* ====== SECTION 3 ====== */}
                  {renderSectionHeader("III. KETERANGAN KESEHATAN", <Heart className="w-4 h-4 text-emerald-600" />)}
                  {renderRow("19", "Golongan Darah", student.health.golonganDarah)}
                  {renderRow("20", "Riwayat Penyakit Signifikan", student.health.penyakitPernahDiderita)}
                  {renderRow("21", "Kelainan Jasmani / Disabilitas", student.health.kelainanJasmani)}
                  {renderRow("22", "Tinggi & Berat Badan", `${student.health.tinggiBadan} cm / ${student.health.beratBadan} kg`)}

                  {/* ====== SECTION 4 ====== */}
                  {renderSectionHeader("IV. KETERANGAN IPTEK & PENDIDIKAN SEBELUMNYA", <GraduationCap className="w-4 h-4 text-emerald-600" />)}
                  {renderRow("23", "Asal Satuan Pendidikan Dasar (SMP/MTs)", student.education.lulusanDari)}
                  {renderRow("24", "Nomor & Tanggal Ijazah Sebelumnya", `${student.education.nomorIjazah} (${student.education.tanggalIjazah})`)}
                  {student.education.pindahanDari && renderRow("25", "Sekolah Pindahan Asal", student.education.pindahanDari)}
                  {student.education.alasanPindah && renderRow("26", "Alasan Kepindahan Sekolah", student.education.alasanPindah)}

                  {/* ====== SECTION 5 ====== */}
                  {renderSectionHeader("V. DATA AKADEMIK SEKOLAH INI", <Award className="w-4 h-4 text-emerald-600" />)}
                  {renderRow("27", "Kelas / Program Studi Saat Ini", `${student.school.kelasSkarang} - ${student.school.programKeahlian || '-'}`)}
                  {renderRow("28", "Tanggal Resmi Terdaftar", student.school.tanggalMasuk)}
                  {renderRow("29", "Keterangan Beasiswa", student.school.beasiswa)}
                  {student.school.tanggalKeluar && renderRow("30", "Tanggal Meninggalkan Sekolah", student.school.tanggalKeluar)}
                  {student.school.alasanKeluar && renderRow("31", "Alasan Meninggalkan Sekolah / Lulus", student.school.alasanKeluar)}

                  {/* ====== SECTION 6 ====== */}
                  {renderSectionHeader("VI. KETERANGAN ORANG TUA KANDUNG", <User className="w-4 h-4 text-emerald-600" />)}
                  {renderRow("32", "Nama Ayah Kandung", student.parents.ayah.nama)}
                  {renderRow("33", "Status Ayah Kandung", student.parents.ayah.isMasihHidup ? "Masih Hidup" : "Almarhum / Wafat")}
                  {student.parents.ayah.isMasihHidup && (
                    <>
                      {renderRow("34", "Pendidikan Terakhir Ayah", student.parents.ayah.pendidikan)}
                      {renderRow("35", "Pekerjaan Ayah Kandung", student.parents.ayah.pekerjaan)}
                      {renderRow("36", "Rentang Penghasilan / Bulan", student.parents.ayah.penghasilan)}
                      {renderRow("37", "Nomor Seluler Ayah", student.parents.ayah.telepon)}
                    </>
                  )}
                  {renderRow("38", "Nama Ibu Kandung", student.parents.ibu.nama)}
                  {renderRow("39", "Status Ibu Kandung", student.parents.ibu.isMasihHidup ? "Masih Hidup" : "Almarhum / Wafat")}
                  {student.parents.ibu.isMasihHidup && (
                    <>
                      {renderRow("40", "Pendidikan Terakhir Ibu", student.parents.ibu.pendidikan)}
                      {renderRow("41", "Pekerjaan Ibu Kandung", student.parents.ibu.pekerjaan)}
                      {renderRow("42", "Rentang Penghasilan / Bulan", student.parents.ibu.penghasilan)}
                      {renderRow("43", "Nomor Seluler Ibu", student.parents.ibu.telepon)}
                    </>
                  )}

                  {/* ====== SECTION 7 ====== */}
                  {student.guardian.hasWali ? (
                    <>
                      {renderSectionHeader("VII. KETERANGAN WALI", <ShieldAlert className="w-4 h-4 text-emerald-600" />)}
                      {renderRow("44", "Nama Lengkap Wali", student.guardian.nama)}
                      {renderRow("45", "Hubungan Kekerabatan Siswa", student.guardian.hubunganSiswa)}
                      {renderRow("46", "Pendidikan Terakhir Wali", student.guardian.pendidikan)}
                      {renderRow("47", "Pekerjaan Wali", student.guardian.pekerjaan)}
                      {renderRow("48", "Penghasilan Bulanan Wali", student.guardian.penghasilan)}
                      {renderRow("49", "Nomor Seluler Wali", student.guardian.telepon)}
                    </>
                  ) : (
                    <>
                      {renderSectionHeader("VII. KETERANGAN WALI", <ShieldAlert className="w-4 h-4 text-emerald-600" />)}
                      <tr className="border-b border-gray-100">
                        <td className="py-2 px-3 text-center text-xs font-mono text-gray-400">44</td>
                        <td colSpan={3} className="py-2 px-3 text-sm text-gray-500 italic">
                          Siswa terdaftar tidak menggunakan data wali (Berpijak penuh pada orang tua kandung).
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Verification section & Signature block at bottom */}
          <div className="mt-12 grid grid-cols-2 text-center text-xs text-slate-800 break-inside-avoid print:mt-10">
            <div>
              <p className="invisible">Space</p>
              <p className="font-semibold text-slate-600 mb-16">Wali Murid / Peserta Didik,</p>
              <p className="font-bold underline text-slate-900 border-none">
                {student.guardian.hasWali ? student.guardian.nama : (student.parents.ibu.isMasihHidup ? student.parents.ibu.nama : student.parents.ayah.nama || ".............................")}
              </p>
              <p className="text-gray-400 font-mono text-[10px] mt-0.5">Penanggung Jawab Siswa</p>
            </div>
            
            <div>
              <p className="text-gray-500 italic mb-0.5">Jakarta, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
              <p className="font-semibold text-slate-600 mb-16">Kepala Sekolah,</p>
              <p className="font-bold underline text-slate-900 border-none">Drs. H. Mulyono, M.Pd.</p>
              <p className="text-gray-400 font-mono text-[10px] mt-0.5">NIP. 19741103 200312 1 002</p>
            </div>
          </div>
          
          {/* Bottom Stamp Line */}
          <div className="text-center font-mono text-[9px] text-gray-400 border-t border-gray-200 mt-12 pt-3 print:mt-8 flex justify-between">
            <span>DIHASILKAN SECARA ELEKTRONIK OLEH SIAKAD BUKU INDUK</span>
            <span>SALINAN ABSAH - {student.personal.nisn}</span>
          </div>
        </div>
        
      </div>
    </div>
  );
};
