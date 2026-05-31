/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from "xlsx";
import { Student, CorrectionRequest } from "./types";

/**
 * Utility to export Students & Correction Requests data to an Excel (.xlsx) file
 */
export function exportDatabaseToExcel(students: Student[], requests: CorrectionRequest[]) {
  // 1. Prepare Students Data Sheet with all 60 fields from Purwokerto Form
  const studentsRows = students.map((s, index) => {
    return {
      "No": index + 1,
      "ID Siswa": s.id,
      "No. Pendaftaran": s.noPendaftaran || "-",
      "No. Induk SMANSA": s.school.nomorStb || "-",
      "NISN": s.personal.nisn || "-",
      "NIS": s.personal.nis || "-",
      "NIK Siswa": s.nik || "-",
      "Nomor KK": s.noKk || "-",
      "No. KIP": s.noKip || "-",
      "ID DTKS": s.idDtks || "-",
      
      // A. KETERANGAN TENTANG DIRI MURID
      "Nama Lengkap": s.personal.namaLengkap || "-",
      "Nama Panggilan": s.personal.namaPanggilan || "-",
      "Jenis Kelamin": s.personal.jenisKelamin || "-",
      "Tempat Lahir": s.personal.tempatLahir || "-",
      "Tanggal Lahir": s.personal.tanggalLahir || "-",
      "Agama": s.personal.agama || "-",
      "Kewarganegaraan": s.personal.kewarganegaraan || "-",
      "Anak Ke": s.personal.anakKe || 1,
      "Jumlah Saudara Kembar": s.personal.saudaraKembar !== undefined ? s.personal.saudaraKembar : 0,
      "Jumlah Saudara Kandung": s.personal.saudaraKandung || 0,
      "Jumlah Saudara Tiri": s.personal.saudaraTiri || 0,
      "Jumlah Saudara Angkat": s.personal.saudaraAngkat || 0,
      "Anak Yatim/Piatu/Yatim-Piatu": s.personal.anakYatimPiatu || "Bukan Anak Yatim Piatu",
      "Status Hubungan Keluarga": s.personal.statusKeluarga || "Lengkap",
      "Bahasa Sehari-hari Rumah": s.personal.bahasaSehariHari || "Bahasa Indonesia",

      // B. KETERANGAN TEMPAT TINGGAL
      "Alamat Lengkap": s.address.alamatLengkap || "-",
      "No. Telepon": s.address.telepon || "-",
      "Tinggal Dengan": s.address.tinggalDengan || "-",
      "Jarak Ke Sekolah (Meter)": s.address.jarakKeSekolah || "-",
      "Transportasi": s.address.transportasi || "-",

      // C. KETERANGAN KESEHATAN
      "Golongan Darah": s.health.golonganDarah || "-",
      "Penyakit Pernah Diderita": s.health.penyakitPernahDiderita || "-",
      "Kelainan Jasmani": s.health.kelainanJasmani || "-",
      "Tinggi Badan (cm)": s.health.tinggiBadan || 0,
      "Berat Badan (kg)": s.health.beratBadan || 0,

      // D. KETERANGAN PENDIDIKAN
      "Lulusan Dari": s.education.lulusanDari || "-",
      "Tanggal Ijazah": s.education.tanggalIjazah || "-",
      "Nomor Ijazah": s.education.nomorIjazah || "-",
      "Lama Belajar": s.education.lamaBelajar || "3 Tahun",
      "Nilai Agama": s.education.nilaiRerataSMP?.agama || 0,
      "Nilai PPKn": s.education.nilaiRerataSMP?.ppkn || 0,
      "Nilai B. Indonesia": s.education.nilaiRerataSMP?.bIndonesia || 0,
      "Nilai Matematika": s.education.nilaiRerataSMP?.matematika || 0,
      "Nilai IPA": s.education.nilaiRerataSMP?.ipa || 0,
      "Nilai IPS": s.education.nilaiRerataSMP?.ips || 0,
      "Nilai B. Inggris": s.education.nilaiRerataSMP?.bInggris || 0,
      "Prestasi Akademik": s.education.prestasiAkademik || "-",
      "Prestasi Non Akademik": s.education.prestasiNonAkademik || "-",

      // E. KETERANGAN AYAH KANDUNG
      "Nama Ayah": s.parents.ayah.nama || "-",
      "NIK Ayah": s.parents.ayah.nik || "-",
      "Tempat Lahir Ayah": s.parents.ayah.tempatLahir || "-",
      "Tanggal Lahir Ayah": s.parents.ayah.tanggalLahir || "-",
      "Agama Ayah": s.parents.ayah.agama || "-",
      "Kewarganegaraan Ayah": s.parents.ayah.kewarganegaraan || "WNI",
      "Pendidikan Ayah": s.parents.ayah.pendidikan || "-",
      "Pekerjaan Ayah": s.parents.ayah.pekerjaan || "-",
      "Penghasilan Ayah": s.parents.ayah.penghasilan || "-",
      "Alamat Ayah": s.parents.ayah.alamat || "-",
      "No. HP Ayah": s.parents.ayah.telepon || "-",
      "Status Ayah (Hidup)": s.parents.ayah.isMasihHidup !== false ? "Masih Hidup" : "Meninggal Dunia",

      // F. KETERANGAN IBU KANDUNG
      "Nama Ibu": s.parents.ibu.nama || "-",
      "NIK Ibu": s.parents.ibu.nik || "-",
      "Tempat Lahir Ibu": s.parents.ibu.tempatLahir || "-",
      "Tanggal Lahir Ibu": s.parents.ibu.tanggalLahir || "-",
      "Agama Ibu": s.parents.ibu.agama || "-",
      "Kewarganegaraan Ibu": s.parents.ibu.kewarganegaraan || "WNI",
      "Pendidikan Ibu": s.parents.ibu.pendidikan || "-",
      "Pekerjaan Ibu": s.parents.ibu.pekerjaan || "-",
      "Penghasilan Ibu": s.parents.ibu.penghasilan || "-",
      "Alamat Ibu": s.parents.ibu.alamat || "-",
      "No. HP Ibu": s.parents.ibu.telepon || "-",
      "Status Ibu (Hidup)": s.parents.ibu.isMasihHidup !== false ? "Masih Hidup" : "Meninggal Dunia",

      // G. KETERANGAN WALI
      "Wali Terdaftar": s.guardian.hasWali ? "YA" : "TIDAK",
      "Nama Wali": s.guardian.nama || "-",
      "NIK Wali": s.guardian.nik || "-",
      "Tempat Lahir Wali": s.guardian.tempatLahir || "-",
      "Tanggal Lahir Wali": s.guardian.tanggalLahir || "-",
      "Agama Wali": s.guardian.agama || "-",
      "Kewarganegaraan Wali": s.guardian.kewarganegaraan || "WNI",
      "Pendidikan Wali": s.guardian.pendidikan || "-",
      "Pekerjaan Wali": s.guardian.pekerjaan || "-",
      "Penghasilan Wali": s.guardian.penghasilan || "-",
      "Alamat Wali": s.guardian.alamat || "-",
      "No. HP Wali": s.guardian.telepon || "-",
      "Hubungan Wali Dengan Siswa": s.guardian.hubunganSiswa || "-",

      // H. KEGEMARAN MURID
      "Kegemaran Kesenian": s.kegemaran?.kesenian || "-",
      "Kegemaran Olahraga": s.kegemaran?.olahraga || "-",
      "Kegemaran Organisasi": s.kegemaran?.organisasi || "-",

      // LAIN-LAIN
      "Kelas Sekarang": s.school.kelasSkarang || "-",
      "Program Keahlian": s.school.programKeahlian || "-",
      "Tanggal Masuk SMANSA": s.school.tanggalMasuk || "-",
      "Izin Cetak Mandiri": s.allowPrint !== false ? "AKTIF" : "NONAKTIF",
    };
  });

  // 2. Prepare Requests Data Sheet
  const requestsRows = requests.map((r, index) => {
    return {
      "No": index + 1,
      "ID Pengajuan": r.id,
      "NISN": r.studentNisn,
      "Nama Siswa": r.studentNama,
      "Tanggal Pengajuan": r.requestDate,
      "Kolom Biodata": r.fieldLabel,
      "Nama Field": r.fieldName,
      "Nilai Lama (Semula)": r.oldValue || "-",
      "Nilai Baru (Usulan)": r.newValue || "-",
      "Status Verifikasi": r.status,
      "Catatan Staf": r.notes || "-",
    };
  });

  // 3. Create Workbook
  const workbook = XLSX.utils.book_new();

  // Create Sheets
  const studentsSheet = XLSX.utils.json_to_sheet(studentsRows);
  const requestsSheet = XLSX.utils.json_to_sheet(requestsRows);

  // Auto-fit column widths
  function autoFitColumns(sheet: XLSX.WorkSheet, rows: any[]) {
    if (rows.length === 0) return;
    const keys = Object.keys(rows[0]);
    const colWidths = keys.map((key) => {
      let maxLen = key.toString().length;
      rows.forEach((row) => {
        const val = row[key];
        if (val !== null && val !== undefined) {
          const str = val.toString();
          if (str.length > maxLen) {
            maxLen = str.length;
          }
        }
      });
      return { wch: Math.min(Math.max(maxLen + 3, 10), 50) }; // cap between 10 and 50 chars
    });
    sheet["!cols"] = colWidths;
  }

  autoFitColumns(studentsSheet, studentsRows);
  autoFitColumns(requestsSheet, requestsRows);

  // Append Sheets to Workbook
  XLSX.utils.book_append_sheet(workbook, studentsSheet, "BIODATA SISWA");
  XLSX.utils.book_append_sheet(workbook, requestsSheet, "RIWAYAT REVISI DATA");

  // Generate Excel File name with Timestamp
  const dateStr = new Date().toISOString().slice(0, 10);
  const fileName = `E-Buku_Induk_SMANSA_Database_${dateStr}.xlsx`;

  // Write file out
  XLSX.writeFile(workbook, fileName);
}

/**
 * Robust parser to convert raw worksheets into Student profiles.
 * Maps both Indonesian headers from export and generic english equivalents.
 */
export function parseExcelToStudents(sheetData: any[]): { students: Student[]; errors: string[] } {
  const students: Student[] = [];
  const errors: string[] = [];

  sheetData.forEach((row, i) => {
    try {
      const nama = row["Nama Lengkap"] || row["namaLengkap"] || row["nama_lengkap"] || row["Nama"] || row["nama"] || row["NAMA LENGKAP"];
      const nisnVal = row["NISN"] !== undefined ? String(row["NISN"]).trim() : "";
      const nisVal = row["NIS"] !== undefined ? String(row["NIS"]).trim() : "";

      if (!nama) {
        errors.push(`Baris ${i + 2}: Nama Lengkap kosong atau nama murid tidak ditemukan.`);
        return;
      }

      // Generate or retrieve unique keys
      const rawId = row["ID Siswa"] || row["id"] || row["id_siswa"] || row["ID SISWA"];
      const id = rawId ? String(rawId).trim() : (nisnVal || nisVal || `siswa-${Math.random().toString(36).substring(2, 11)}`);

      let jk: "Laki-laki" | "Perempuan" = "Laki-laki";
      const rawJk = String(row["Jenis Kelamin"] || row["jenisKelamin"] || row["jk"] || "L").trim().toLowerCase();
      if (
        rawJk.startsWith("per") || 
        rawJk.startsWith("p") || 
        rawJk === "female" || 
        rawJk === "wanita" || 
        rawJk === "pr"
      ) {
        jk = "Perempuan";
      }

      const anakKe = parseInt(row["Anak Ke"] || "1", 10) || 1;
      const jlhKembar = parseInt(row["Jumlah Saudara Kembar"] || "0", 10) || 0;
      const jlhKandung = parseInt(row["Jumlah Saudara Kandung"] || row["Jumlah Saudara"] || "0", 10) || 0;
      const jlhTiri = parseInt(row["Jumlah Saudara Tiri"] || "0", 10) || 0;
      const jlhAngkat = parseInt(row["Jumlah Saudara Angkat"] || "0", 10) || 0;

      const tb = parseFloat(row["Tinggi Badan (cm)"] || "0") || 0;
      const bb = parseFloat(row["Berat Badan (kg)"] || "0") || 0;

      const allowPrintVal = String(row["Izin Cetak Mandiri"] || "AKTIF").toUpperCase();
      const allowPrint = allowPrintVal !== "NONAKTIF" && allowPrintVal !== "FALSE" && allowPrintVal !== "0" && allowPrintVal !== "TIDAK";

      // Parse average scores
      let rAgama = parseFloat(row["Nilai Agama"] || "0") || 0;
      let rPpkn = parseFloat(row["Nilai PPKn"] || "0") || 0;
      let rBi = parseFloat(row["Nilai B. Indonesia"] || "0") || 0;
      let rMat = parseFloat(row["Nilai Matematika"] || "0") || 0;
      let rIpa = parseFloat(row["Nilai IPA"] || "0") || 0;
      let rIps = parseFloat(row["Nilai IPS"] || "0") || 0;
      let rBing = parseFloat(row["Nilai B. Inggris"] || "0") || 0;

      const student: Student = {
        id,
        noPendaftaran: row["No. Pendaftaran"] !== undefined ? String(row["No. Pendaftaran"]).trim() : "",
        nik: row["NIK Siswa"] !== undefined ? String(row["NIK Siswa"]).trim() : "",
        noKk: row["Nomor KK"] !== undefined ? String(row["Nomor KK"]).trim() : "",
        noKip: row["No. KIP"] !== undefined ? String(row["No. KIP"]).trim() : "",
        idDtks: row["ID DTKS"] !== undefined ? String(row["ID DTKS"]).trim() : "",
        personal: {
          namaLengkap: String(nama).trim(),
          namaPanggilan: String(row["Nama Panggilan"] || nama).trim(),
          nis: nisVal,
          nisn: nisnVal,
          jenisKelamin: jk,
          tempatLahir: String(row["Tempat Lahir"] || "-").trim(),
          tanggalLahir: String(row["Tanggal Lahir"] || "2008-01-01").trim(),
          agama: String(row["Agama"] || "Islam").trim(),
          kewarganegaraan: String(row["Kewarganegaraan"] || "WNI").trim(),
          anakKe,
          saudaraKandung: jlhKandung,
          saudaraTiri: jlhTiri,
          saudaraAngkat: jlhAngkat,
          saudaraKembar: jlhKembar,
          anakYatimPiatu: String(row["Anak Yatim/Piatu/Yatim-Piatu"] || "Bukan Anak Yatim Piatu").trim(),
          statusKeluarga: String(row["Status Hubungan Keluarga"] || "Lengkap").trim(),
          bahasaSehariHari: String(row["Bahasa Sehari-hari Rumah"] || "Bahasa Indonesia").trim(),
        },
        address: {
          alamatLengkap: String(row["Alamat Lengkap"] || "-").trim(),
          telepon: String(row["No. Telepon"] || "-").trim(),
          tinggalDengan: String(row["Tinggal Dengan"] || "Orang Tua").trim(),
          jarakKeSekolah: String(row["Jarak Ke Sekolah (Meter)"] || "150 meter").trim(),
          transportasi: String(row["Transportasi"] || "Jalan Kaki").trim(),
        },
        health: {
          golonganDarah: String(row["Golongan Darah"] || "-").trim(),
          penyakitPernahDiderita: String(row["Penyakit Pernah Diderita"] || "-").trim(),
          kelainanJasmani: String(row["Kelainan Jasmani"] || "-").trim(),
          tinggiBadan: tb,
          beratBadan: bb,
        },
        education: {
          lulusanDari: String(row["Lulusan Dari"] || "-").trim(),
          tanggalIjazah: String(row["Tanggal Ijazah"] || "-").trim(),
          nomorIjazah: String(row["Nomor Ijazah"] || "-").trim(),
          lamaBelajar: String(row["Lama Belajar"] || "3 Tahun").trim(),
          nilaiRerataSMP: {
            agama: rAgama,
            ppkn: rPpkn,
            bIndonesia: rBi,
            matematika: rMat,
            ipa: rIpa,
            ips: rIps,
            bInggris: rBing
          },
          prestasiAkademik: String(row["Prestasi Akademik"] || "-").trim(),
          prestasiNonAkademik: String(row["Prestasi Non Akademik"] || "-").trim(),
        },
        parents: {
          ayah: {
            nama: String(row["Nama Ayah"] || "-").trim(),
            nik: String(row["NIK Ayah"] || "-").trim(),
            tempatLahir: String(row["Tempat Lahir Ayah"] || "-").trim(),
            tanggalLahir: String(row["Tanggal Lahir Ayah"] || "-").trim(),
            agama: String(row["Agama Ayah"] || "Islam").trim(),
            kewarganegaraan: String(row["Kewarganegaraan Ayah"] || "WNI").trim(),
            pendidikan: String(row["Pendidikan Ayah"] || "-").trim(),
            pekerjaan: String(row["Pekerjaan Ayah"] || "-").trim(),
            penghasilan: String(row["Penghasilan Ayah"] || "-").trim(),
            alamat: String(row["Alamat Ayah"] || "-").trim(),
            telepon: String(row["No. HP Ayah"] || "-").trim(),
            isMasihHidup: String(row["Status Ayah (Hidup)"] || "Masih Hidup").trim() !== "Meninggal Dunia",
          },
          ibu: {
            nama: String(row["Nama Ibu"] || "-").trim(),
            nik: String(row["NIK Ibu"] || "-").trim(),
            tempatLahir: String(row["Tempat Lahir Ibu"] || "-").trim(),
            tanggalLahir: String(row["Tanggal Lahir Ibu"] || "-").trim(),
            agama: String(row["Agama Ibu"] || "Islam").trim(),
            kewarganegaraan: String(row["Kewarganegaraan Ibu"] || "WNI").trim(),
            pendidikan: String(row["Pendidikan Ibu"] || "-").trim(),
            pekerjaan: String(row["Pekerjaan Ibu"] || "-").trim(),
            penghasilan: String(row["Penghasilan Ibu"] || "-").trim(),
            alamat: String(row["Alamat Ibu"] || "-").trim(),
            telepon: String(row["No. HP Ibu"] || "-").trim(),
            isMasihHidup: String(row["Status Ibu (Hidup)"] || "Masih Hidup").trim() !== "Meninggal Dunia",
          },
        },
        guardian: {
          hasWali: String(row["Wali Terdaftar"] || "TIDAK").trim().toUpperCase() === "YA",
          nama: String(row["Nama Wali"] || "-").trim(),
          nik: String(row["NIK Wali"] || "-").trim(),
          tempatLahir: String(row["Tempat Lahir Wali"] || "-").trim(),
          tanggalLahir: String(row["Tanggal Lahir Wali"] || "-").trim(),
          agama: String(row["Agama Wali"] || "-").trim(),
          kewarganegaraan: String(row["Kewarganegaraan Wali"] || "WNI").trim(),
          pendidikan: String(row["Pendidikan Wali"] || "-").trim(),
          pekerjaan: String(row["Pekerjaan Wali"] || "-").trim(),
          penghasilan: String(row["Penghasilan Wali"] || "-").trim(),
          alamat: String(row["Alamat Wali"] || "-").trim(),
          telepon: String(row["No. HP Wali"] || "-").trim(),
          hubunganSiswa: String(row["Hubungan Wali Dengan Siswa"] || "-").trim(),
        },
        school: {
          kelasSkarang: String(row["Kelas Sekarang"] || "X").trim(),
          programKeahlian: String(row["Program Keahlian"] || "MIPA").trim(),
          tanggalMasuk: String(row["Tanggal Masuk SMANSA"] || "2025-07-15").trim(),
          nomorStb: String(row["No. Induk SMANSA"] || "-").trim(),
        },
        kegemaran: {
          kesenian: String(row["Kegemaran Kesenian"] || "-").trim(),
          olahraga: String(row["Kegemaran Olahraga"] || "-").trim(),
          organisasi: String(row["Kegemaran Organisasi"] || "-").trim(),
        },
        allowPrint,
      };

      students.push(student);
    } catch (err: any) {
      errors.push(`Baris ${i + 2}: Gagal di-parsing (${err.message || err}).`);
    }
  });

  return { students, errors };
}
