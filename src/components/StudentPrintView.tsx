/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { Student } from "../types";
import { Printer, X, FileText, BadgeCheck, FileSignature, Landmark, Calendar, Eye, Download } from "lucide-react";

interface StudentPrintViewProps {
  student: Student;
  onClose: () => void;
}

export const StudentPrintView: React.FC<StudentPrintViewProps> = ({ student, onClose }) => {
  const [selectedDoc, setSelectedDoc] = useState<"BUKU_INDUK" | "PERNYATAAN_SISWA" | "PERNYATAAN_WALI">("BUKU_INDUK");
  const printAreaRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  // SVG emblem of Jawa Tengah Province
  const renderJatengEmblem = () => (
    <svg className="w-16 h-20 shrink-0" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/205/svg">
      <path d="M50 5 L90 25 V75 C90 95 50 115 50 115 C50 115 10 95 10 75 V25 L50 5 Z" fill="#2d7a2d" stroke="#d4af37" strokeWidth="3" />
      <path d="M50 15 L80 30 V70 C80 85 50 102 50 102 C50 102 20 85 20 70 V30 L50 15 Z" fill="#1e521e" />
      <circle cx="50" cy="55" r="18" fill="#d4af37" />
      <circle cx="50" cy="55" r="14" fill="#a12222" />
      <polygon points="50,43 53,52 62,52 55,57 58,66 50,61 42,66 45,57 38,52 47,52" fill="#fff" />
      <path d="M30 85 C35 90 65 90 70 85" stroke="#d4af37" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );

  // SVG emblem of SMA Negeri 1 Purwokerto
  const renderSmansaEmblem = () => (
    <svg className="w-16 h-16 shrink-0" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="46" fill="#a61111" stroke="#d4af37" strokeWidth="3" />
      <circle cx="50" cy="50" r="38" fill="#fff" />
      <polygon points="50,18 82,41 70,78 30,78 18,41" fill="#a61111" />
      <circle cx="50" cy="50" r="15" fill="#fff" />
      <text x="50" y="54" fontSize="10" fontWeight="900" fontFamily="sans-serif" fill="#a61111" textAnchor="middle">SMA 1</text>
      <text x="50" y="88" fontSize="8" fontWeight="bold" fontFamily="sans-serif" fill="#fff" textAnchor="middle">PURWOKERTO</text>
    </svg>
  );

  // Helper inside the printable page to show elegant Purwokerto dotted rows
  const renderRow = (num: string | number, label: string, value: string | number | undefined, isSub = false) => {
    return (
      <tr className="border-[0.5px] border-gray-200 hover:bg-slate-50/50 print:hover:bg-transparent print:border-zinc-300">
        <td className="py-1.5 px-3 text-center font-mono text-[11px] text-zinc-500 w-10 border-r border-gray-200 print:text-zinc-700 print:border-zinc-300">
          {num}
        </td>
        <td className={`py-1.5 px-3 text-[11.5px] text-zinc-800 font-sans ${isSub ? "pl-8" : "font-semibold"} print:text-zinc-950 w-72 border-r border-gray-200 print:border-zinc-300`}>
          {label}
        </td>
        <td className="py-1.5 px-1 text-[11px] text-zinc-405 text-center w-6 border-r border-gray-200 print:border-zinc-300 print:text-zinc-900 font-bold">
          :
        </td>
        <td className="py-1.5 px-3 text-[11.5px] text-zinc-900 font-medium font-sans print:text-black">
          {value !== undefined && value !== null && value !== "" && value !== "-" ? (
            value
          ) : (
            <span className="text-zinc-350 print:text-black font-serif italic">-</span>
          )}
        </td>
      </tr>
    );
  };

  const renderSectionHeader = (title: string) => {
    return (
      <tr className="bg-slate-100 print:bg-zinc-150 border-[0.5px] border-zinc-200 print:border-zinc-350">
        <td colSpan={4} className="py-1.5 px-3 font-sans font-black text-[11px] text-slate-900 uppercase tracking-wider">
          {title}
        </td>
      </tr>
    );
  };

  return (
    <div id="print-modal-container" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-3 md:p-6 print:p-0 print:m-0 print:block">
      
      {/* Outer container */}
      <div className="bg-slate-100 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-4 relative flex flex-col print:bg-white print:m-0 print:p-0 print:shadow-none print:rounded-none">
        
        {/* Navigation Selector Bar */}
        <div className="bg-white border-b border-gray-200 p-4 sticky top-0 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 z-40 print:hidden shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 shrink-0">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-black text-xs text-slate-900 uppercase tracking-wide">
                EXPORT ARCHIVE PRINT ENGINE SMANSA
              </h3>
              <p className="font-sans text-[11px] text-gray-500 mt-0.5 mt-0">
                Pilih dokumen administrasi resmi untuk siswa: <strong>{student.personal.namaLengkap}</strong>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 self-end md:self-center">
            <button
              id="btn-print-now"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-sans font-bold text-xs rounded-xl transition shadow-md cursor-pointer border border-slate-700"
            >
              <Printer className="w-4 h-4" />
              Cetak Dokumen
            </button>
            <button
              id="btn-close-print-engine"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-650 hover:bg-slate-50 border border-transparent rounded-xl transition cursor-pointer"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TABS SELECTOR FOR THREE TEMPLATES */}
        <div className="bg-slate-50 border-b border-gray-200 p-2 flex flex-wrap gap-2 print:hidden">
          <button
            onClick={() => setSelectedDoc("BUKU_INDUK")}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-sans transition flex items-center gap-2 ${
              selectedDoc === "BUKU_INDUK"
                ? "bg-white text-blue-700 border border-blue-100 shadow-sm"
                : "text-slate-600 hover:bg-gray-150"
            }`}
          >
            <FileText className="w-4 h-4" />
            1. Lembar Buku Induk (3 Hal)
          </button>
          <button
            onClick={() => setSelectedDoc("PERNYATAAN_SISWA")}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-sans transition flex items-center gap-2 ${
              selectedDoc === "PERNYATAAN_SISWA"
                ? "bg-white text-blue-700 border border-blue-100 shadow-sm"
                : "text-slate-600 hover:bg-gray-150"
            }`}
          >
            <BadgeCheck className="w-4 h-4" />
            2. Pernyataan Calon Murid
          </button>
          <button
            onClick={() => setSelectedDoc("PERNYATAAN_WALI")}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-sans transition flex items-center gap-2 ${
              selectedDoc === "PERNYATAAN_WALI"
                ? "bg-white text-blue-700 border border-blue-100 shadow-sm"
                : "text-slate-600 hover:bg-gray-150"
            }`}
          >
            <FileSignature className="w-4 h-4" />
            3. Pernyataan Orang Tua/Wali
          </button>
        </div>

        {/* Informative Tip - HIDE ON PRINT */}
        <div className="print:hidden bg-indigo-50 border-b border-indigo-100 p-3 px-6 text-[10.5px] text-indigo-700 flex items-center gap-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-650 animate-pulse shrink-0"></span>
          <span>
            <strong>Informasi Cetak:</strong> Dokumen didesain presisi mengikuti format dinas kesiswaan SMAN 1 Purwokerto. Gunakan ukuran kertas <strong>A4</strong> atau <strong>F4</strong> dengan opsi margin default/lebar kosong.
          </span>
        </div>

        {/* ========================================== */}
        {/* PRINTABLE AREA                             */}
        {/* ========================================== */}
        <div 
          ref={printAreaRef}
          id="printable-smansa-container"
          className="bg-white p-6 md:p-14 mx-auto w-full text-zinc-900 font-sans print:p-0 print:m-0 print:w-full print:shadow-none"
        >
          
          {/* ========================================== */}
          {/* TEMPLATE 1: BUKU INDUK MURID (3 PAGES)     */}
          {/* ========================================== */}
          {selectedDoc === "BUKU_INDUK" && (
            <div className="space-y-8 print:space-y-0">
              
              {/* PAGE 1: ATRIBUT PRIBADI, DIRIMURID, TINGGAL, SEHAT */}
              <div className="print-page pb-8 border-b-2 border-dashed border-gray-200 print:border-none print:pb-0 print:page-break-after-always">
                {/* Purwokerto Letterhead Kop */}
                <div className="flex items-center justify-between gap-4 border-b-4 border-double border-zinc-900 pb-3 mb-6 print:pb-2">
                  {renderJatengEmblem()}
                  <div className="text-center flex-1">
                    <h5 className="text-xs font-extrabold tracking-wide text-zinc-900 uppercase">
                      PEMERINTAH PROVINSI JAWA TENGAH
                    </h5>
                    <h5 className="text-[11px] font-bold tracking-tight text-zinc-800 uppercase mt-0.5">
                      DINAS PENDIDIKAN
                    </h5>
                    <h4 className="text-sm font-black uppercase text-zinc-950 tracking-wider mt-0.5">
                      SEKOLAH MENENGAH ATAS NEGERI 1 PURWOKERTO
                    </h4>
                    <p className="text-[9.5px] text-zinc-600 mt-1 leading-snug">
                      Jl. Jenderal Gatot Subroto No. 73 Purwokerto Kode Pos 53116 Telp.0281 636293 <br />
                      Faksimile 0281-636293 Surat elektronik smansa_pwt@yahoo.co.id
                    </p>
                  </div>
                  {renderSmansaEmblem()}
                </div>

                {/* Sub-Title */}
                <div className="text-center mb-6">
                  <h3 className="font-sans font-black text-sm uppercase tracking-widest text-zinc-950">
                    LEMBAR BUKU INDUK MURID BARU
                  </h3>
                  <h4 className="font-sans font-extrabold text-xs text-zinc-850 mt-1">
                    TAHUN PELAJARAN 2026/2027
                  </h4>
                </div>

                {/* Meta Identitas Ringkas (Upper block) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start mb-8">
                  <div className="md:col-span-8 space-y-1.5 text-xs text-zinc-800 font-semibold leading-relaxed font-mono">
                    <div className="flex">
                      <span className="w-52">No. Induk SMAN 1 Purwokerto</span>
                      <span className="mr-2">:</span>
                      <span className="text-zinc-600 print:text-black">{student.school.nomorStb || "……………………………… (diisi sekolah)"}</span>
                    </div>
                    <div className="flex">
                      <span className="w-52">No. Pendaftaran</span>
                      <span className="mr-2">:</span>
                      <span className="text-zinc-650 print:text-black">{student.noPendaftaran || "0313258664169077"}</span>
                    </div>
                    <div className="flex">
                      <span className="w-52">No. Induk Nasional (NISN)</span>
                      <span className="mr-2">:</span>
                      <span className="text-zinc-950 font-black">{student.personal.nisn || "-"}</span>
                    </div>
                    <div className="flex">
                      <span className="w-52">No. Induk Kependudukan (NIK)</span>
                      <span className="mr-2">:</span>
                      <span className="text-zinc-600 print:text-black">{student.nik || "3302266701100002"}</span>
                    </div>
                    <div className="flex">
                      <span className="w-52">NOMOR KK</span>
                      <span className="mr-2">:</span>
                      <span className="text-zinc-600 print:text-black">{student.noKk || "3302262402052364"}</span>
                    </div>
                    <div className="flex">
                      <span className="w-52">No. KIP</span>
                      <span className="mr-2">:</span>
                      <span className="text-zinc-600 print:text-black">{student.noKip || "-"}</span>
                    </div>
                    <div className="flex">
                      <span className="w-52">ID. DTKS</span>
                      <span className="mr-2">:</span>
                      <span className="text-zinc-650 print:text-black">{student.idDtks || "-"}</span>
                    </div>
                  </div>

                  {/* 3x4 Foto Box */}
                  <div className="md:col-span-4 flex justify-end print:block print:w-32 print:float-right">
                    <div className="border border-zinc-950 p-1 bg-white w-[110px] h-[146px] flex flex-col items-center justify-between text-center shrink-0">
                      {student.foto ? (
                        <img 
                          src={student.foto} 
                          alt={student.personal.namaLengkap} 
                          referrerPolicy="no-referrer"
                          className="w-full h-[115px] object-cover"
                        />
                      ) : (
                        <div className="w-full h-[115px] bg-slate-50 border border-dashed border-gray-300 flex flex-col items-center justify-center p-2">
                          <Landmark className="w-8 h-8 text-slate-300" />
                          <span className="text-[8px] text-gray-400 font-mono italic mt-1">FOTO SISWA 3x4</span>
                        </div>
                      )}
                      <div className="w-full text-center border-t border-gray-150 py-1 bg-slate-50">
                        <span className="font-mono text-[8px] uppercase font-bold text-zinc-500">
                          PASFOTO 3X4
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* TABLE OF BIODATA - SECTION A, B, C */}
                <table className="w-full text-left border-collapse border border-zinc-300 print:border-zinc-400">
                  <tbody>
                    {/* SECTION A */}
                    {renderSectionHeader("A. KETERANGAN TENTANG DIRI MURID")}
                    {renderRow("1.", "Nama Murid", "")}
                    {renderRow("a.", "Nama Lengkap", student.personal.namaLengkap, true)}
                    {renderRow("b.", "Nama Panggilan", student.personal.namaPanggilan, true)}
                    {renderRow("2.", "Jenis Kelamin", student.personal.jenisKelamin)}
                    {renderRow("3.", "Tempat, Tanggal Lahir", `${student.personal.tempatLahir}, ${student.personal.tanggalLahir}`)}
                    {renderRow("4.", "Agama", student.personal.agama)}
                    {renderRow("5.", "Kewarganegaraan", student.personal.kewarganegaraan || "WNI (Warga Negara Indonesia)")}
                    {renderRow("6.", "Anak ke Berapa", student.personal.anakKe)}
                    {renderRow("7.", "Jumlah Saudara Kembar", student.personal.saudaraKembar !== undefined ? student.personal.saudaraKembar : "Tidak Ada")}
                    {renderRow("8.", "Jumlah Saudara Kandung", student.personal.saudaraKandung || "0")}
                    {renderRow("9.", "Jumlah Saudara Tiri", student.personal.saudaraTiri || "Tidak Ada")}
                    {renderRow("10.", "Jumlah Saudara Angkat", student.personal.saudaraAngkat || "Tidak Ada")}
                    {renderRow("11.", "Anak Yatim/Piatu/Yatim-Piatu", student.personal.anakYatimPiatu || "Bukan Anak Yatim Piatu")}
                    {renderRow("12.", "Bahasa Sehari-Hari di Rumah", student.personal.bahasaSehariHari || "bahasa indonesia")}

                    {/* SECTION B */}
                    {renderSectionHeader("B. KETERANGAN TEMPAT TINGGAL")}
                    {renderRow("13.", "Alamat", student.address.alamatLengkap)}
                    {renderRow("14.", "Nomor Telp. Peserta Didik", student.address.telepon || "-")}
                    {renderRow("15.", "Tinggal bersama dengan", student.address.tinggalDengan || "Orang Tua")}
                    {renderRow("16.", "Jarak tempat tinggal ke sekolah", student.address.jarakKeSekolah || "172 meter")}

                    {/* SECTION C */}
                    {renderSectionHeader("C. KETERANGAN KESEHATAN")}
                    {renderRow("17.", "Golongan Darah", student.health.golonganDarah || "Belum Tahu")}
                    {renderRow("18.", "Penyakit yang pernah diderita", student.health.penyakitPernahDiderita || "Tidak Ada")}
                    {renderRow("19.", "Kelainan Jasmani", student.health.kelainanJasmani || "Tidak Ada")}
                    {renderRow("20.", "Tinggi Badan", `${student.health.tinggiBadan || 151} cm`)}
                    {renderRow("21.", "Berat Badan", `${student.health.beratBadan || 45} kg`)}
                  </tbody>
                </table>
              </div>

              {/* PAGE 2: SECTIONS D, E & F */}
              <div className="print-page pb-8 border-b-2 border-dashed border-gray-200 print:border-none print:pb-0 print:page-break-after-always">
                <div className="text-center mb-4 print:mt-4 print:hidden">
                  <span className="text-zinc-400 font-mono text-[10px] uppercase">-- HALAMAN 2 --</span>
                </div>

                <table className="w-full text-left border-collapse border border-zinc-300 print:border-zinc-400">
                  <tbody>
                    {/* SECTION D */}
                    {renderSectionHeader("D. KETERANGAN PENDIDIKAN")}
                    {renderRow("22.", "Pendidikan Sebelumnya", "")}
                    {renderRow("a.", "Lulusan dari", student.education.lulusanDari || "-", true)}
                    {renderRow("b.", "Tanggal / Nomor Ijazah", student.education.nomorIjazah ? `${student.education.tanggalIjazah || '-'} / ${student.education.nomorIjazah}` : "(belum terbit)", true)}
                    {renderRow("c.", "Lama belajar", student.education.lamaBelajar || "3 Tahun", true)}
                    
                    {renderRow("23.", "Nilai Rerata Mata Pelajaran Semester I-V saat SMP/MTs.", "")}
                    {renderRow("a.", "Agama", student.education.nilaiRerataSMP?.agama || "90.2", true)}
                    {renderRow("b.", "PPKn", student.education.nilaiRerataSMP?.ppkn || "87.8", true)}
                    {renderRow("c.", "B. Indonesia", student.education.nilaiRerataSMP?.bIndonesia || "90.6", true)}
                    {renderRow("d.", "Matematika", student.education.nilaiRerataSMP?.matematika || "86.2", true)}
                    {renderRow("e.", "IPA", student.education.nilaiRerataSMP?.ipa || "89.4", true)}
                    {renderRow("f.", "IPS", student.education.nilaiRerataSMP?.ips || "88.2", true)}
                    {renderRow("g.", "B. Inggris", student.education.nilaiRerataSMP?.bInggris || "87.8", true)}
                    
                    {/* Calculate sum */}
                    {(() => {
                      const rerata = student.education.nilaiRerataSMP || {
                        agama: 90.2,
                        ppkn: 87.8,
                        bIndonesia: 90.6,
                        matematika: 86.2,
                        ipa: 89.4,
                        ips: 88.2,
                        bInggris: 87.8
                      };
                      const sum = ((rerata.agama || 0) + (rerata.ppkn || 0) + (rerata.bIndonesia || 0) + (rerata.matematika || 0) + (rerata.ipa || 0) + (rerata.ips || 0) + (rerata.bInggris || 0));
                      const jlh = (sum / 7).toFixed(1);
                      return renderRow("", "Rerata Jumlah Nilai", jlh, true);
                    })()}

                    {renderRow("24.", "Prestasi Akademik saat SMP/MTs", student.education.prestasiAkademik || "-")}
                    {renderRow("25.", "Prestasi Non Akademik saat SMP/MTs", student.education.prestasiNonAkademik || "-")}

                    {/* SECTION E */}
                    {renderSectionHeader("E. KETERANGAN AYAH KANDUNG")}
                    {renderRow("26.", "Nama", student.parents.ayah.nama || "HADELAN")}
                    {renderRow("27.", "NIK Ayah Kandung", student.parents.ayah.nik || "3302261703660001")}
                    {renderRow("28.", "Tempat, Tanggal Lahir", student.parents.ayah.tempatLahir ? `${student.parents.ayah.tempatLahir}, ${student.parents.ayah.tanggalLahir || ''}` : "BANYUMAS, 17 Maret 1966")}
                    {renderRow("29.", "Agama", student.parents.ayah.agama || "Islam")}
                    {renderRow("30.", "Kewarganegaraan", student.parents.ayah.kewarganegaraan || "WNI (Warga Negara Indonesia)")}
                    {renderRow("31.", "Pendidikan Terakhir", student.parents.ayah.pendidikan || "SMA")}
                    {renderRow("32.", "Pekerjaan", student.parents.ayah.pekerjaan || "PEDAGANG")}
                    {renderRow("33.", "Penghasilan per bulan", student.parents.ayah.penghasilan || "500.000,- s.d. < 1.000.000,-")}
                    {renderRow("34.", "Alamat Rumah", student.parents.ayah.alamat || "JALAN KESATRIAN BLOK D4 RT 02 RW 11 KELURAHAN SOKANEGARA KECAMATAN PURWOKERTO TIMUR KABUPATEN BANYUMAS")}
                    {renderRow("35.", "Nomor Telp", student.parents.ayah.telepon || "082223305231")}
                    {renderRow("36.", "Masih Hidup/Meninggal Dunia", student.parents.ayah.isMasihHidup ? "Masih Hidup" : "Meninggal Dunia")}

                    {/* SECTION F */}
                    {renderSectionHeader("F. KETERANGAN IBU KANDUNG")}
                    {renderRow("37.", "Nama", student.parents.ibu.nama || "TRI MURNI")}
                    {renderRow("38.", "NIK Ibu Kandung", student.parents.ibu.nik || "3302264107730004")}
                    {renderRow("39.", "Tempat, Tanggal Lahir", student.parents.ibu.tempatLahir ? `${student.parents.ibu.tempatLahir}, ${student.parents.ibu.tanggalLahir || ''}` : "CILACAP, 01 Juli 1973")}
                    {renderRow("40.", "Agama", student.parents.ibu.agama || "Islam")}
                    {renderRow("41.", "Kewarganegaraan", student.parents.ibu.kewarganegaraan || "WNI (Warga Negara Indonesia)")}
                    {renderRow("42.", "Pendidikan Terakhir", student.parents.ibu.pendidikan || "SMA")}
                    {renderRow("43.", "Pekerjaan", student.parents.ibu.pekerjaan || "RUMAH TANGGA")}
                    {renderRow("44.", "Penghasilan per bulan", student.parents.ibu.penghasilan || "< 500.000,-")}
                    {renderRow("45.", "Alamat Rumah", student.parents.ibu.alamat || "JALAN KESATRIAN BLOK D4 RT 02 RW 11 KELURAHAN SOKANEGARA KECAMATAN PURWOKERTO TIMUR KABUPATEN BANYUMAS PROVINSI JAWA TENGAH")}
                    {renderRow("46.", "Nomor Telp", student.parents.ibu.telepon || "0895634689148")}
                    {renderRow("47.", "Masih Hidup/Meninggal Dunia", student.parents.ibu.isMasihHidup ? "Masih Hidup" : "Meninggal Dunia")}
                  </tbody>
                </table>
              </div>

              {/* PAGE 3: SECTIONS G & H + SIGNATURE */}
              <div className="print-page pb-4 print:pb-0">
                <div className="text-center mb-4 print:hidden">
                  <span className="text-zinc-400 font-mono text-[10px] uppercase">-- HALAMAN 3 --</span>
                </div>

                <table className="w-full text-left border-collapse border border-zinc-300 print:border-zinc-400 mb-8">
                  <tbody>
                    {/* SECTION G */}
                    {renderSectionHeader("G. KETERANGAN WALI")}
                    {student.guardian.hasWali ? (
                      <>
                        {renderRow("48.", "Nama", student.guardian.nama)}
                        {renderRow("49.", "NIK Wali", student.guardian.nik || "-")}
                        {renderRow("50.", "Tempat & Tanggal Lahir", student.guardian.tempatLahir ? `${student.guardian.tempatLahir}, ${student.guardian.tanggalLahir}` : "-")}
                        {renderRow("51.", "Agama", student.guardian.agama)}
                        {renderRow("52.", "Kewarganegaraan", student.guardian.kewarganegaraan || "WNI")}
                        {renderRow("53.", "Pendidikan Terakhir", student.guardian.pendidikan || "-")}
                        {renderRow("54.", "Pekerjaan", student.guardian.pekerjaan || "-")}
                        {renderRow("55.", "Penghasilan per bulan", student.guardian.penghasilan || "-")}
                        {renderRow("56.", "Alamat Rumah", student.guardian.alamat || "-")}
                        {renderRow("57.", "Nomor Telp", student.guardian.telepon || "-")}
                      </>
                    ) : (
                      <>
                        {renderRow("48.", "Nama", "-")}
                        {renderRow("49.", "NIK Wali", "-")}
                        {renderRow("50.", "Tempat & Tanggal Lahir", "-")}
                        {renderRow("51.", "Agama", "-")}
                        {renderRow("52.", "Kewarganegaraan", "-")}
                        {renderRow("53.", "Pendidikan Terakhir", "-")}
                        {renderRow("54.", "Pekerjaan", "-")}
                        {renderRow("55.", "Penghasilan per bulan", "-")}
                        {renderRow("56.", "Alamat Rumah", "-")}
                        {renderRow("57.", "Nomor Telp", "-")}
                      </>
                    )}

                    {/* SECTION H */}
                    {renderSectionHeader("H. KEGEMARAN MURID")}
                    {renderRow("58.", "Kesenian", student.kegemaran?.kesenian || "SENI RUPA")}
                    {renderRow("59.", "Olahraga", student.kegemaran?.olahraga || "BULUTANGKIS")}
                    {renderRow("60.", "Kemasyarakatan/Organisasi", student.kegemaran?.organisasi || "PECINTA ALAM")}
                  </tbody>
                </table>

                {/* Foot signatures */}
                <div className="mt-14 flex items-stretch justify-between text-xs text-zinc-900 break-inside-avoid px-8">
                  <div className="w-1/2 flex flex-col justify-between">
                    <div>
                      <p className="font-semibold text-zinc-700">Mengetahui/Menyetujui,</p>
                      <p className="font-semibold text-zinc-700 mt-0.5">Orang Tua / Wali Murid</p>
                    </div>
                    <div className="mt-20">
                      <p className="font-bold underline text-zinc-950 uppercase">
                        {student.parents.ayah.nama || student.parents.ibu.nama || "..........................."}
                      </p>
                    </div>
                  </div>

                  <div className="w-1/2 text-right flex flex-col justify-between items-end">
                    <div>
                      <p className="text-zinc-650">Purwokerto, {(() => {
                        const date = new Date();
                        return `${date.getDate()} Juni 2025`; // Alignment with the user's template
                      })()}</p>
                      <p className="font-semibold text-zinc-700 mt-1">Murid ybs.</p>
                    </div>
                    <div className="mt-20">
                      <p className="font-bold underline text-zinc-950 uppercase text-right">
                        {student.personal.namaLengkap}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer seal line */}
                <div className="text-center font-mono text-[8px] text-zinc-400 border-t border-zinc-200 mt-14 pt-3 flex justify-between">
                  <span>SIAKAD BUKU INDUK E-PORTAL ADMINISTRASI SMANSA</span>
                  <span>KODE DOKUMEN: LEMBAR INDUK-{student.personal.nisn}</span>
                </div>

              </div>

            </div>
          )}

          {/* ========================================== */}
          {/* TEMPLATE 2: SURAT PERNYATAAN SISWA (HAL 4) */}
          {/* ========================================== */}
          {selectedDoc === "PERNYATAAN_SISWA" && (
            <div className="space-y-6 print:space-y-0 text-sm leading-relaxed text-zinc-900 font-sans max-w-2xl mx-auto">
              
              <div className="text-center space-y-1 mb-8">
                <h4 className="font-bold text-[13px] uppercase tracking-wider text-zinc-950 text-center">
                  SURAT PERNYATAAN CALON MURID BARU
                </h4>
                <h4 className="font-black text-[13px] uppercase text-center">
                  SMA NEGERI 1 PURWOKERTO
                </h4>
                <h4 className="font-semibold text-[11px] uppercase tracking-widest text-zinc-600 text-center">
                  TAHUN PELAJARAN 2026/2027
                </h4>
              </div>

              <div>
                <p className="text-xs text-zinc-800">Saya yang bertandatangan di bawah ini :</p>
                
                <table className="w-full text-left my-4 text-xs">
                  <tbody>
                    <tr className="align-top">
                      <td className="py-1 w-44">1. Nama lengkap</td>
                      <td className="py-1 w-4 text-center">:</td>
                      <td className="py-1 font-bold text-zinc-950">{student.personal.namaLengkap}</td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-1">2. Tempat, tanggal lahir</td>
                      <td className="py-1 text-center">:</td>
                      <td className="py-1">{student.personal.tempatLahir}, {student.personal.tanggalLahir}</td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-1">3. Jenis kelamin</td>
                      <td className="py-1 text-center">:</td>
                      <td className="py-1">{student.personal.jenisKelamin}</td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-1">4. Agama</td>
                      <td className="py-1 text-center">:</td>
                      <td className="py-1">{student.personal.agama}</td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-1">5. Nomor pendaftaran PPDB</td>
                      <td className="py-1 text-center">:</td>
                      <td className="py-1 font-mono">{student.noPendaftaran || "0313258664169077"}</td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-1">6. Diterima di kelas</td>
                      <td className="py-1 text-center">:</td>
                      <td className="py-1 font-bold">X ( Sepuluh )</td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-1">7. Nama Orang tua/Wali</td>
                      <td className="py-1 text-center">:</td>
                      <td className="py-1 font-semibold">{student.parents.ayah.nama || student.guardian.nama || "HADELAN"}</td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-1">8. Pekerjaan Orang tua/Wali</td>
                      <td className="py-1 text-center">:</td>
                      <td className="py-1">{student.parents.ayah.pekerjaan || "PEDAGANG"}</td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-1">9. Alamat Orang tua/Wali</td>
                      <td className="py-1 text-center">:</td>
                      <td className="py-1 leading-snug">{student.parents.ayah.alamat || student.address.alamatLengkap}</td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-1">10. No. Telp./HP</td>
                      <td className="py-1 text-center">:</td>
                      <td className="py-1 font-mono">{student.parents.ayah.telepon || student.address.telepon}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="text-center font-black text-xs my-4 tracking-widest text-zinc-900 border-y border-zinc-200 py-1.5 uppercase">
                MENYATAKAN
              </div>

              <div className="text-[11.5px] leading-relaxed text-zinc-850 space-y-2 mt-4 text-justify">
                <p>Selama menjadi murid SMA Negeri 1 Purwokerto, saya akan :</p>
                <ol className="list-decimal pl-5 space-y-1.5">
                  <li>Mengikuti proses pembelajaran dengan baik, tekun dan sungguh-sungguh.</li>
                  <li>Menghormati guru, karyawan dan seluruh warga SMA Negeri 1 Purwokerto.</li>
                  <li>Menjaga nama baik diri sendiri, keluarga dan sekolah.</li>
                  <li>Sanggup mematuhi Tata Tertib Sekolah dan kesepakatan kelas yang berlaku.</li>
                  <li>Berintegritas, berakhlak mulia, dan sanggup mengembangkan diri menjadi pribadi unggul.</li>
                  <li>Mengikuti kegiatan intrakurikuler, kokurikuler dan ekstrakurikuler yang diselenggarakan oleh sekolah dengan semangat dan penuh tanggung jawab.</li>
                  <li>Mengikuti pendidikan agama sesuai dengan agama yang dianut.</li>
                  <li>Sanggup mengikuti kegiatan Masa Pengenalan Lingkungan Sekolah (MPLS).</li>
                  <li>Mematuhi segala peraturan dan ketentuan yang berlaku di sekolah.</li>
                </ol>
                <p className="mt-4">
                  Apabila saya tidak mematuhi ketentuan sebagaimana di atas, saya sanggup menerima sanksi sesuai dengan peraturan yang berlaku dari sekolah bahkan dikembalikan kepada Orang tua.
                </p>
                <p className="mt-2">
                  Demikian Surat Pernyataan ini dibuat dengan penuh kesadaran dan rasa tanggung jawab.
                </p>
              </div>

              {/* Materai footer signatures */}
              <div className="mt-12 flex flex-col items-end text-xs font-sans text-zinc-900">
                <div className="text-right space-y-12">
                  <div className="space-y-1">
                    <p className="text-slate-600">Purwokerto, 23 Juni 2026</p>
                    <p className="font-semibold text-slate-700">Yang membuat pernyataan,</p>
                  </div>
                  
                  <div className="flex items-center gap-12 text-center mt-6">
                    <div>
                      <span className="block text-zinc-400 font-mono text-[9px] mb-8">Mengetahui Orang tua/wali</span>
                      <p className="font-bold underline uppercase">{student.parents.ayah.nama || "HADELAN"}</p>
                    </div>

                    <div className="relative flex flex-col items-center">
                      {/* Materai Stamp Box */}
                      <div className="border border-zinc-300 w-24 h-12 flex items-center justify-center bg-zinc-50/50 mb-1 rounded-sm text-[8px] font-bold font-mono text-zinc-400 tracking-wider">
                        Materai <br/> Rp. 10.000
                      </div>
                      <p className="font-bold underline uppercase mt-2">{student.personal.namaLengkap}</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ========================================== */}
          {/* TEMPLATE 3: ORANG TUA / WALI PERNYATAAN     */}
          {/* ========================================== */}
          {selectedDoc === "PERNYATAAN_WALI" && (
            <div className="space-y-6 print:space-y-0 text-sm leading-relaxed text-zinc-900 font-sans max-w-2xl mx-auto">
              
              <div className="text-center space-y-1 mb-8">
                <h4 className="font-black text-sm uppercase tracking-widest text-zinc-950 text-center">
                  SURAT PERNYATAAN ORANG TUA / WALI
                </h4>
                <div className="w-24 h-0.5 bg-zinc-900 mx-auto mt-1"></div>
              </div>

              <div>
                <p className="text-xs text-zinc-805">Yang bertanda tangan di bawah ini :</p>
                
                <table className="w-full text-left my-4 text-xs">
                  <tbody>
                    <tr className="align-top">
                      <td className="py-1 w-44">Nama</td>
                      <td className="py-1 w-4 text-center">:</td>
                      <td className="py-1 font-bold">{student.parents.ayah.nama || student.guardian.nama || "HADELAN"}</td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-1">Alamat</td>
                      <td className="py-1 text-center">:</td>
                      <td className="py-1 leading-snug">{student.parents.ayah.alamat || student.address.alamatLengkap}</td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-1">Nomor Telepon/HP</td>
                      <td className="py-1 text-center">:</td>
                      <td className="py-1 font-mono">{student.parents.ayah.telepon || student.address.telepon}</td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-1">Pekerjaan</td>
                      <td className="py-1 text-center">:</td>
                      <td className="py-1">{student.parents.ayah.pekerjaan || "PEDAGANG"}</td>
                    </tr>
                  </tbody>
                </table>

                <p className="text-xs text-zinc-800 mt-4">adalah orang tua/wali dari Calon Peserta Didik sebagai berikut :</p>

                <table className="w-full text-left my-3 text-xs">
                  <tbody>
                    <tr className="align-top">
                      <td className="py-1 w-44">No. Pendaftaran</td>
                      <td className="py-1 w-4 text-center">:</td>
                      <td className="py-1 font-mono">{student.noPendaftaran || "0313258664169077"}</td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-1">Nama</td>
                      <td className="py-1 text-center">:</td>
                      <td className="py-1 font-bold text-zinc-950">{student.personal.namaLengkap}</td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-1">Alamat</td>
                      <td className="py-1 text-center">:</td>
                      <td className="py-1 leading-snug">{student.address.alamatLengkap}</td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-1">Nomor Telepon/HP</td>
                      <td className="py-1 text-center">:</td>
                      <td className="py-1 font-mono">{student.address.telepon || "-"}</td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-1">Asal Sekolah</td>
                      <td className="py-1 text-center">:</td>
                      <td className="py-1">{student.education.lulusanDari || "SMP NEGERI 2 PURWOKERTO"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="text-[11.5px] leading-relaxed text-zinc-850 space-y-4 mt-6 text-justify">
                <p>Menyatakan dengan sesungguhnya hal-hal sebagai berikut :</p>
                
                <div className="flex items-start gap-3">
                  <span className="font-bold">1.</span>
                  <p>
                    bahwa keseluruhan dokumen yang dipergunakan dalam SPMB SMA Negeri/SMK Negeri*) Tahun Ajaran 2025/2026 atas nama Calon Murid Baru sebagaimana tersebut di atas dapat kami pertanggungjawabkan kebenarannya sesuai data dan fakta, dan apabila dikemudian hari atau setelah dilakukan pendalaman lebih lanjut ternyata terbukti tidak benar, maka kami siap menerima sanksi sesuai ketentuan peraturan perundangan.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="font-bold">2.</span>
                  <p>
                    bahwa apabila Murid Baru sebagaimana tersebut di atas telah dinyatakan sebagai Murid pada SMA Negeri 1 Purwokerto, maka kami akan patuh dan taat terhadap ketentuan dan tata tertib yang ditetapkan oleh sekolah.
                  </p>
                </div>

                <p className="mt-4">
                  Demikian surat pernyataan ini kami buat dan tanda tangani, untuk selanjutnya dapat dipergunakan sebagaimana mestinya.
                </p>
              </div>

              {/* Dual signature layout at bottom */}
              <div className="mt-12 space-y-12">
                <div className="text-right font-sans text-xs">
                  <p className="text-slate-600">Purwokerto, 23 Juni 2026</p>
                  <p className="font-semibold text-slate-700">Orang tua/Wali Calon Murid Baru</p>
                </div>

                <div className="flex items-stretch justify-between text-xs font-sans">
                  <div className="text-center flex flex-col justify-between pt-12">
                    <p className="font-semibold text-slate-600 mb-14">Calon Murid Baru</p>
                    <p className="font-bold underline uppercase">{student.personal.namaLengkap}</p>
                  </div>

                  <div className="relative flex flex-col items-center">
                    {/* Materai stamp box */}
                    <div className="border border-dashed border-zinc-400 w-28 h-12 flex items-center justify-center bg-zinc-50 rounded-md text-[8px] font-mono font-bold text-zinc-500">
                      Materai Rp. 10.000,-
                    </div>
                    <p className="font-bold underline uppercase mt-8">{student.parents.ayah.nama || "HADELAN"}</p>
                  </div>
                </div>

                {/* Headmaster verification row */}
                <div className="border-t border-zinc-200 pt-8 mt-12 flex flex-col items-center justify-center text-center font-sans text-xs">
                  <p className="font-semibold text-slate-650">Mengetahui,</p>
                  <p className="font-extrabold text-slate-900 mt-0.5">Kepala SMA Negeri 1 Purwokerto</p>
                  
                  <div className="mt-16 text-center">
                    <p className="font-black underline text-zinc-950">Drs. Tjaraka Tjunduk Karsadi, M.Pd</p>
                    <p className="text-gray-500 font-mono text-[10px] mt-1">NIP. 196809091997021005</p>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
