/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Student, CorrectionRequest } from "../types";
import { X, Send, AlertCircle, FileText, HelpCircle, CheckCircle } from "lucide-react";

interface CorrectionRequestModalProps {
  student: Student;
  onSubmit: (request: Omit<CorrectionRequest, "id" | "studentId" | "studentNisn" | "studentNama" | "requestDate" | "status">) => void;
  onClose: () => void;
}

// Map Indonesian visual labels to internal nested object string paths
const REVISABLE_FIELDS = [
  { path: "personal.namaLengkap", label: "Data Pribadi - Nama Lengkap" },
  { path: "personal.namaPanggilan", label: "Data Pribadi - Nama Panggilan" },
  { path: "personal.tempatLahir", label: "Data Pribadi - Tempat Lahir" },
  { path: "personal.tanggalLahir", label: "Data Pribadi - Tanggal Lahir" },
  { path: "personal.agama", label: "Data Pribadi - Agama" },
  { path: "personal.kewarganegaraan", label: "Data Pribadi - Kewarganegaraan" },
  { path: "address.alamatLengkap", label: "Domisili - Alamat Domisili Lengkap" },
  { path: "address.telepon", label: "Domisili - Nomor HP / Telepon" },
  { path: "health.penyakitPernahDiderita", label: "Kesehatan - Riwayat Penyakit" },
  { path: "health.kelainanJasmani", label: "Kesehatan - Kelainan Jasmani / Alat Bantu" },
  { path: "education.lulusanDari", label: "Pendidikan - Asal Sekolah Dasar (SMP)" },
  { path: "parents.ayah.nama", label: "Keluarga - Nama Lengkap Ayah" },
  { path: "parents.ayah.pekerjaan", label: "Keluarga - Pekerjaan Ayah" },
  { path: "parents.ibu.nama", label: "Keluarga - Nama Lengkap Ibu" },
  { path: "parents.ibu.pekerjaan", label: "Keluarga - Pekerjaan Ibu" },
  { path: "guardian.nama", label: "Wali - Nama Lengkap Wali" },
];

export const CorrectionRequestModal: React.FC<CorrectionRequestModalProps> = ({ student, onSubmit, onClose }) => {
  const [selectedField, setSelectedField] = useState(REVISABLE_FIELDS[0].path);
  const [oldValue, setOldValue] = useState("");
  const [newValue, setNewValue] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Helper function to dynamically retrieve nested properties based on string path (e.g. "parents.ayah.nama")
  const getNestedValue = (obj: any, path: string): string => {
    try {
      const parts = path.split(".");
      let current = obj;
      for (const part of parts) {
        if (current === undefined || current === null) return "";
        current = current[part];
      }
      if (typeof current === "boolean") {
        return current ? "Ya" : "Tidak";
      }
      return current !== undefined && current !== null ? String(current) : "";
    } catch {
      return "";
    }
  };

  useEffect(() => {
    // Whenever selected field updates, fetch the accurate old value from the student profile
    const value = getNestedValue(student, selectedField);
    setOldValue(value);
    setNewValue("");
    setErrorMsg(null);
  }, [selectedField, student]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!newValue.trim()) {
      setErrorMsg("Nilai koreksi baru tidak boleh kosong!");
      return;
    }

    if (newValue.trim().toLowerCase() === oldValue.trim().toLowerCase()) {
      setErrorMsg("Nilai koreksi baru sama dengan nilai di database saat ini.");
      return;
    }

    const fieldObj = REVISABLE_FIELDS.find((item) => item.path === selectedField);
    const label = fieldObj ? fieldObj.label : selectedField;

    onSubmit({
      fieldName: selectedField,
      fieldLabel: label,
      oldValue: oldValue,
      newValue: newValue.trim(),
    });

    setSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fade-in border border-gray-100">
        
        {/* Header */}
        <div className="bg-slate-900 p-5 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-800 rounded-lg">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-sm">Ajukan Perbaikan Data</h3>
              <p className="text-[11px] text-slate-300">Laporkan revisi e-Buku Induk kepada staf tata usaha.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        {success ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h4 className="font-sans font-bold text-sm text-slate-800">Pengajuan Berhasil Dikirim!</h4>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              Permohonan perbaikan biodata Anda telah masuk dalam antrean verifikasi staf Tata Usaha (TU).
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl flex items-start gap-2 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Choose Field Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Pilih Kolom Yang Salah</label>
              <select
                value={selectedField}
                onChange={(e) => setSelectedField(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 bg-white"
              >
                {REVISABLE_FIELDS.map((f) => (
                  <option key={f.path} value={f.path}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Current Value Visual Indicator */}
            <div className="bg-gray-50 border border-gray-150 p-3.5 rounded-xl text-xs space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Nilai Tercatat Saat Ini:</span>
              <p className="font-mono font-semibold text-slate-700 bg-white border border-gray-100 p-2 rounded break-all shadow-inner">
                {oldValue || <span className="italic text-gray-400 font-normal">Belum diisi / Kosong (-)</span>}
              </p>
            </div>

            {/* Correct Value Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nilai Baru / Yang Benar</label>
              <textarea
                rows={2}
                required
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="Tuliskan isian yang tepat sesuai akta kelahiran atau ijazah asli..."
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500 text-slate-800"
              />
            </div>

            {/* Warning guidelines */}
            <div className="p-3 bg-sky-50 text-sky-800 border border-sky-100 rounded-xl flex items-start gap-1.5 text-[11px] leading-relaxed">
              <AlertCircle className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <span>
                <strong>Perhatian:</strong> Perubahan data tidak langsung terverifikasi secara instant. Staf sekolah akan mencocokkan perubahan ini berdasarkan berkas cetak berkas fisik Anda.
              </span>
            </div>

            {/* Form actions */}
            <div className="flex gap-2.5 justify-end pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold transition"
              >
                Batalkan
              </button>
              <button
                type="submit"
                id="submit-request-action"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-600/10 transition"
              >
                <Send className="w-3.5 h-3.5" />
                Kirim Pengajuan
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
