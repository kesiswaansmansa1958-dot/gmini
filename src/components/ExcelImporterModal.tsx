/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { Student } from "../types";
import { parseExcelToStudents } from "../excelUtils";
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  FileWarning, 
  Check, 
  Download, 
  AlertTriangle, 
  Info,
  RefreshCw
} from "lucide-react";

interface ExcelImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (importedList: Student[], strategy: "UPSERT" | "REPLACE") => Promise<void>;
}

export const ExcelImporterModal: React.FC<ExcelImporterModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedList, setParsedList] = useState<Student[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [strategy, setStrategy] = useState<"UPSERT" | "REPLACE">("UPSERT");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Generate and download a sample excel template for the school Admin
  const downloadTemplate = () => {
    const templateHeaders = [
      {
        "ID Siswa": "",
        "NISN": "0081234567",
        "NIS": "232401001",
        "No. Buku Induk (STB)": "1958/01",
        "Nama Lengkap": "Ahmad Farhan",
        "Nama Panggilan": "Farhan",
        "Jenis Kelamin": "Laki-laki",
        "Tempat Lahir": "Boyolali",
        "Tanggal Lahir": "2008-05-14",
        "Kelas Sekarang": "X",
        "Program Keahlian": "MIPA",
        "Tanggal Masuk": "2023-07-15",
        "Agama": "Islam",
        "Kewarganegaraan": "WNI",
        "Anak Ke": 1,
        "Jumlah Saudara": 2,
        "Status Keluarga": "Lengkap",
        "Alamat Lengkap": "Jl. Merdeka No. 19, Boyolali",
        "No. Telepon": "081234567890",
        "Tinggal Dengan": "Orang Tua",
        "Golongan Darah": "O",
        "Tinggi Badan (cm)": 165,
        "Berat Badan (kg)": 54,
        "Lulusan Dari": "SMP Negeri 1 Boyolali",
        "Nomor Ijazah": "DN-01/D-SMP/23/00123",
        "Nama Ayah": "Budi Sulistyo",
        "Pekerjaan Ayah": "Wiraswasta",
        "Nama Ibu": "Siti Aminah",
        "Pekerjaan Ibu": "Guru",
        "Nama Wali": "-",
        "Izin Cetak Mandiri": "AKTIF"
      }
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(templateHeaders);
    XLSX.utils.book_append_sheet(workbook, worksheet, "BIODATA SISWA");

    // Auto-fit column widths
    const colWidths = Object.keys(templateHeaders[0]).map((key) => {
      return { wch: Math.max(key.length + 3, 14) };
    });
    worksheet["!cols"] = colWidths;

    XLSX.writeFile(workbook, "Template_Import_Siswa_SMANSA.xlsx");
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndParseFile(droppedFile);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndParseFile(e.target.files[0]);
    }
  };

  const validateAndParseFile = (uploadedFile: File) => {
    const extension = uploadedFile.name.substring(uploadedFile.name.lastIndexOf(".")).toLowerCase();
    if (![".xlsx", ".xls", ".csv"].includes(extension)) {
      setError("Jenis berkas tidak didukung. Silakan gunakan ekstensi .xlsx, .xls, atau .csv.");
      return;
    }

    setFile(uploadedFile);
    setError(null);
    setParsedList([]);
    setParseErrors([]);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const arrayBuffer = evt.target?.result as ArrayBuffer;
        const data = new Uint8Array(arrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        let targetSheetName = "";
        if (workbook.SheetNames.includes("BIODATA SISWA")) {
          targetSheetName = "BIODATA SISWA";
        } else {
          targetSheetName = workbook.SheetNames[0];
        }

        if (!targetSheetName) {
          setError("File Excel tidak memiliki lembar sheet data.");
          return;
        }

        const worksheet = workbook.Sheets[targetSheetName];
        const rawRows = XLSX.utils.sheet_to_json(worksheet);

        if (rawRows.length === 0) {
          setError(`Lembar kerja "${targetSheetName}" kosong atau tidak memiliki data.`);
          return;
        }

        const { students, errors } = parseExcelToStudents(rawRows);
        setParsedList(students);
        setParseErrors(errors);
      } catch (err: any) {
        setError(`Gagal memparsing spreadsheet: ${err.message || err}`);
      }
    };
    reader.readAsArrayBuffer(uploadedFile);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleConfirmImport = async () => {
    if (parsedList.length === 0) return;
    setIsProcessing(true);
    try {
      await onImport(parsedList, strategy);
      // Clean states and close
      setFile(null);
      setParsedList([]);
      setParseErrors([]);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Gagal menyelesaikan proses importing ke database.");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetImporter = () => {
    setFile(null);
    setParsedList([]);
    setParseErrors([]);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-gray-200 w-full max-w-4xl shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-150 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-black text-sm text-slate-900">
                Impor Data Siswa Dari Excel
              </h3>
              <p className="text-[11.5px] text-gray-500 font-sans mt-0.5">
                Tambahkan siswa baru atau perbarui biodata secara massal dari dokumen spreadsheet.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 px-3 bg-gray-150 hover:bg-gray-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer"
          >
            Tutup
          </button>
        </div>

        {/* Outer content container */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* Quick instructions & template download */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 p-4 bg-slate-50 border border-gray-200 rounded-2xl text-[11px] text-slate-650 space-y-2 leading-relaxed">
              <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <Info className="w-4 h-4 text-emerald-600 shrink-0" />
                Panduan Penting Sebelum Mengimpor
              </h4>
              <ul className="list-disc pl-4 space-y-1">
                <li>Gunakan kolom dengan nama persis sesuai template (atau gunakan file hasil ekspor database).</li>
                <li>Gunakan format tanggal <strong className="text-slate-900 font-mono">YYYY-MM-DD</strong> (contoh: <strong className="font-mono">2008-05-14</strong>).</li>
                <li>Kolom <strong>Nama Lengkap</strong> wajib diisi, kosong akan berakibat baris tersebut dilewati.</li>
                <li>Supabase RLS diaktifkan. Data akan langsung terunggah ke cloud jika koneksi aktif.</li>
              </ul>
            </div>

            <div className="bg-emerald-50/40 border border-emerald-150 p-4 rounded-2xl flex flex-col justify-between space-y-3">
              <div>
                <h5 className="text-[11px] font-extrabold text-emerald-950 uppercase tracking-wider font-sans">
                  Template Excel
                </h5>
                <p className="text-[10px] text-emerald-800 font-sans mt-1 leading-snug">
                  Unduh template spreadsheet kosong dengan list header kolom yang siap digunakan.
                </p>
              </div>
              <button
                type="button"
                onClick={downloadTemplate}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-bold text-[11px] rounded-xl flex items-center justify-center gap-1.5 transition whitespace-nowrap shadow-sm cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Unduh Template Excel
              </button>
            </div>
          </div>

          {/* File Upload Drop Area */}
          {!file ? (
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
              className={`border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-4 ${
                dragActive
                  ? "border-emerald-500 bg-emerald-50/30"
                  : "border-gray-300 bg-slate-50/50 hover:bg-slate-50 hover:border-emerald-400"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileInput}
                className="hidden"
              />
              <div className="p-4 bg-white shadow-md rounded-2xl border border-gray-100 text-emerald-600">
                <Upload className="w-8 h-8" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Tarik & taruh file Excel (.xlsx, .xls, .csv) di sini
                </p>
                <p className="text-[11px] text-gray-400 font-sans mt-1">
                  Atau klik untuk memilih berkas dari komputer Anda
                </p>
              </div>
              <span className="text-[10px] bg-slate-100 border border-gray-200 text-slate-600 px-3 py-1 rounded-full font-mono">
                MAX 10MB
              </span>
            </div>
          ) : (
            /* File Loaded block */
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-gray-200 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 line-clamp-1">{file.name}</h5>
                    <p className="text-[10.5px] text-gray-500 mt-0.5 font-sans">
                      Terbaca: <strong className="text-slate-800 text-xs font-mono font-black">{parsedList.length}</strong> siswa
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={resetImporter}
                  className="p-1.5 px-3 bg-white hover:bg-rose-50 border border-gray-250 text-slate-700 hover:text-rose-600 text-[11px] font-bold rounded-xl transition cursor-pointer"
                >
                  Ganti File
                </button>
              </div>

              {/* Strategy Selector & Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 rounded-2xl space-y-3 bg-white">
                  <span className="text-[10px] font-black tracking-wider text-slate-450 uppercase font-sans">
                    STRATEGI IMPORE DATA
                  </span>
                  <div className="space-y-2">
                    <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-gray-250 hover:bg-slate-50/50 cursor-pointer transition">
                      <input
                        type="radio"
                        name="conflict-strategy"
                        value="UPSERT"
                        checked={strategy === "UPSERT"}
                        onChange={() => setStrategy("UPSERT")}
                        className="mt-1"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Gabungkan / Pembaruan Cerdas</span>
                        <span className="text-[10.5px] font-medium text-gray-500 block mt-0.5">
                          Siswa yang sudah ada akan diperbarui biodatanya, siswa baru akan ditambahkan ke sistem.
                        </span>
                      </div>
                    </label>

                    <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-rose-150 hover:bg-rose-50/30 cursor-pointer transition">
                      <input
                        type="radio"
                        name="conflict-strategy"
                        value="REPLACE"
                        checked={strategy === "REPLACE"}
                        onChange={() => setStrategy("REPLACE")}
                        className="mt-1 text-rose-600"
                      />
                      <div>
                        <span className="text-xs font-bold text-rose-800 flex items-center gap-1">
                          Timpa Seluruh Database
                          <span className="bg-rose-100 border border-rose-200 text-rose-700 font-black text-[9px] px-1.5 py-0.2 rounded-md uppercase">
                            Bahaya
                          </span>
                        </span>
                        <span className="text-[10.5px] font-medium text-gray-500 block mt-0.5">
                          Menghapus semua siswa yang ada di sistem sekarang dan menggantinya persis dengan isi file Excel ini.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Parsing Status and Validation Logs */}
                <div className="p-4 border border-gray-200 rounded-2xl space-y-3 bg-white flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-black tracking-wider text-slate-450 uppercase font-sans">
                      HASIL VALIDASI STRUKTUR
                    </span>
                    {parseErrors.length > 0 ? (
                      <div className="mt-2 text-[11px] text-rose-800 bg-rose-50/50 border border-rose-100 p-3 rounded-xl max-h-[120px] overflow-y-auto space-y-1 font-mono">
                        <span className="font-sans font-bold flex items-center gap-1 text-rose-950 mb-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          Ditemukan {parseErrors.length} Peringatan:
                        </span>
                        {parseErrors.map((err, idx) => (
                          <div key={idx}>• {err}</div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-2 text-[11px] text-emerald-800 bg-emerald-50/40 border border-emerald-100 p-3 rounded-xl flex items-center gap-1.5 font-bold">
                        <Check className="w-4 h-4 text-emerald-600" />
                        Struktur database prima! Seluruh baris siap diimpor tanpa kesalahan.
                      </div>
                    )}
                  </div>

                  <div className="text-[10px] text-gray-400 font-sans italic pt-2 border-t border-gray-100">
                    Siswa teridentifikasi berdasarkan data NISN, NIS, atau kolom ID Siswa.
                  </div>
                </div>
              </div>

              {/* Student parsed Preview */}
              {parsedList.length > 0 && (
                <div className="border border-gray-200 rounded-2xl overflow-hidden">
                  <div className="p-3 bg-slate-55 border-b border-gray-200 flex items-center justify-between px-4 bg-slate-50">
                    <h6 className="text-[10.5px] font-black text-slate-800 font-sans uppercase tracking-wide">
                      PREVIEW DATA SISWA ({parsedList.length} BARIS TERDETEKSI)
                    </h6>
                    <span className="text-[10px] bg-slate-200 text-slate-700 font-mono font-bold px-2 py-0.5 rounded-full">
                      Daftar Pratinjau
                    </span>
                  </div>
                  <div className="max-h-[180px] overflow-y-auto divide-y divide-gray-150">
                    {parsedList.map((st, sidx) => (
                      <div key={st.id || sidx} className="p-2.5 px-4 flex items-center justify-between text-xs hover:bg-slate-50 transition">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-gray-400 font-bold w-4">
                            {sidx + 1}
                          </span>
                          <div>
                            <span className="font-bold text-slate-900 block font-sans">
                              {st.personal.namaLengkap}
                            </span>
                            <span className="text-[10px] text-gray-500 font-mono flex items-center gap-1.5 mt-0.5">
                              NISN: {st.personal.nisn || "-"} • NIS: {st.personal.nis || "-"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 font-sans font-semibold text-[11px]">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg">
                            Kls {st.school.kelasSkarang} - {st.school.programKeahlian || "MIPA"}
                          </span>
                          <span className={`px-2 py-0.5 rounded-lg border ${
                            st.personal.jenisKelamin === "Perempuan"
                              ? "bg-rose-50 text-rose-700 border-rose-100"
                              : "bg-sky-50 text-sky-700 border-sky-100"
                          }`}>
                            {st.personal.jenisKelamin}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-150 rounded-2xl text-rose-900 flex items-start gap-2 text-xs">
              <FileWarning className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-rose-950 font-bold block mb-0.5">Kesalahan Mengunggah File</strong>
                {error}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-gray-150 bg-slate-50 flex items-center justify-between">
          <p className="text-[10px] text-gray-400 font-sans max-w-sm">
            Setelah mengimpor, harap periksa seluruh biodata siswa yang diperbarui di panel Dashboard Admin Utama.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 border border-gray-250 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-sans font-semibold text-xs rounded-xl transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={parsedList.length === 0 || isProcessing}
              onClick={handleConfirmImport}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-55 active:bg-blue-800 font-sans font-bold text-white text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Mengimpor...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Konfirmasi Impor ({parsedList.length} Siswa)
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
