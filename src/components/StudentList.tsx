/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Student } from "../types";
import { Search, Plus, Filter, User, Printer, Edit2, Trash2, ShieldAlert, Check, MoreVertical } from "lucide-react";

interface StudentListProps {
  students: Student[];
  onSelectStudent: (student: Student) => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onAddStudent: () => void;
  onTogglePrintPermission?: (id: string, allow: boolean) => void;
}

export const StudentList: React.FC<StudentListProps> = ({
  students,
  onSelectStudent,
  onEditStudent,
  onDeleteStudent,
  onAddStudent,
  onTogglePrintPermission,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("SEMUA");
  const [selectedGender, setSelectedGender] = useState("SEMUA");
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);

  // Extract unique classes for the dropdown filter list dynamically
  const classesList = ["SEMUA", ...Array.from(new Set(students.map((s) => s.school.kelasSkarang)))];

  // Filtering calculations
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.personal.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.personal.nisn.includes(searchTerm) ||
      student.personal.nis.includes(searchTerm) ||
      (student.personal.namaPanggilan && student.personal.namaPanggilan.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesClass = selectedClass === "SEMUA" || student.school.kelasSkarang === selectedClass;
    const matchesGender = selectedGender === "SEMUA" || student.personal.jenisKelamin === selectedGender;

    return matchesSearch && matchesClass && matchesGender;
  });

  // Calculate quick indicators
  const totalCount = filteredStudents.length;
  const countLaki = filteredStudents.filter((s) => s.personal.jenisKelamin === "Laki-laki").length;
  const countPerempuan = filteredStudents.filter((s) => s.personal.jenisKelamin === "Perempuan").length;

  const confirmDelete = (id: string) => {
    onDeleteStudent(id);
    setShowConfirmDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-bold text-blue-800 uppercase font-sans tracking-wider block">Total Siswa Aktif</span>
            <span className="text-3xl font-black text-blue-950 mt-1 block font-mono">{students.length}</span>
            <p className="text-[10px] text-blue-700/70 mt-1 font-semibold">{totalCount} siswa di filter saat ini</p>
          </div>
          <div className="p-4 bg-white/80 rounded-2xl border border-blue-100 text-blue-600">
            <User className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-100 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-bold text-sky-800 uppercase font-sans tracking-wider block">Siswa Laki-laki</span>
            <span className="text-3xl font-black text-sky-950 mt-1 block font-mono">
              {students.filter((s) => s.personal.jenisKelamin === "Laki-laki").length}
            </span>
            <p className="text-[10px] text-sky-700/70 mt-1 font-semibold">{countLaki} pria dalam pencarian</p>
          </div>
          <div className="p-4 bg-white/80 rounded-2xl border border-sky-100 text-sky-600">
            <User className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-bold text-rose-800 uppercase font-sans tracking-wider block">Siswa Perempuan</span>
            <span className="text-3xl font-black text-rose-950 mt-1 block font-mono">
              {students.filter((s) => s.personal.jenisKelamin === "Perempuan").length}
            </span>
            <p className="text-[10px] text-rose-700/70 mt-1 font-semibold">{countPerempuan} wanita dalam pencarian</p>
          </div>
          <div className="p-4 bg-white/80 rounded-2xl border border-rose-100 text-rose-600">
            <User className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Control, Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="search-input-list"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari siswa berdasarkan nama lengkap, panggilan, NIS, atau NISN..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-55/40 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 font-semibold text-slate-800"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter Kelas */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-xl bg-white text-xs font-semibold text-gray-600">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <span>Kelas:</span>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="bg-transparent border-none font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                {classesList.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Gender */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-xl bg-white text-xs font-semibold text-gray-600">
              <User className="w-3.5 h-3.5 text-gray-400" />
              <span>Gender:</span>
              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="bg-transparent border-none font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="SEMUA">Semua Gender</option>
                <option value="Laki-laki">Laki-Laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>

            {/* Add Student Button */}
            <button
              id="btn-add-student-trigger"
              onClick={onAddStudent}
              className="px-4 py-2.5 whitespace-nowrap bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-sans font-semibold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-blue-600/10 transition"
            >
              <Plus className="w-4 h-4" />
              Tambah Siswa
            </button>
          </div>
        </div>
      </div>

      {/* Main Table / Grid representation */}
      {filteredStudents.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-sm">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-gray-150 text-slate-600 text-xs font-bold font-sans tracking-wide">
                  <th className="py-4 px-5">Siswa</th>
                  <th className="py-4 px-5">NIS / NISN</th>
                  <th className="py-4 px-5">Kelas</th>
                  <th className="py-4 px-5">Kontak & Alamat</th>
                  <th className="py-4 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4.5 px-5">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-12 rounded-lg border border-gray-200 overflow-hidden bg-slate-50 shrink-0 relative flex items-center justify-center">
                          {student.foto ? (
                            <img
                              src={student.foto}
                              alt={student.personal.namaLengkap}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className={`text-[10px] font-bold ${student.personal.jenisKelamin === "Perempuan" ? "text-rose-400" : "text-sky-400"}`}>
                              3x4
                            </span>
                          )}
                        </div>
                        <div>
                          <span
                            onClick={() => onSelectStudent(student)}
                            className="font-sans font-bold text-slate-900 line-clamp-1 hover:text-blue-600 cursor-pointer text-sm block"
                          >
                            {student.personal.namaLengkap}
                          </span>
                          <span className="text-[11px] text-gray-500 font-mono tracking-normal block mt-0.5">
                            {student.personal.jenisKelamin} • Agama : {student.personal.agama}
                          </span>
                          
                          {/* Print permission toggle menu / badge */}
                          <div className="flex items-center gap-1.5 mt-1.5">
                            {student.allowPrint !== false ? (
                              <button
                                type="button"
                                onClick={() => onTogglePrintPermission?.(student.id, false)}
                                className="px-2 py-0.5 rounded bg-blue-50 hover:bg-rose-50 border border-blue-200/50 hover:border-rose-200/50 text-blue-700 hover:text-rose-700 text-[9px] font-black tracking-wide uppercase flex items-center gap-1 transition"
                                title="Klik untuk menonaktifkan cetak mandiri siswa ini"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                                Cetak Mandiri: AKTIF
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => onTogglePrintPermission?.(student.id, true)}
                                className="px-2 py-0.5 rounded bg-rose-50 hover:bg-blue-50 border border-rose-200/50 hover:border-blue-200/50 text-rose-700 hover:text-blue-700 text-[9px] font-black tracking-wide uppercase flex items-center gap-1 transition"
                                title="Klik untuk mengaktifkan cetak mandiri siswa ini"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                                Cetak Mandiri: NONAKTIF
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4.5 px-5 font-mono text-xs text-slate-700">
                      <div>
                        <span className="block font-bold">NIS: {student.personal.nis}</span>
                        <span className="block text-gray-400">NISN: {student.personal.nisn}</span>
                      </div>
                    </td>
                    <td className="py-4.5 px-5">
                      <div>
                        <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                          {student.school.kelasSkarang}
                        </span>
                        <span className="block text-[10px] text-gray-500 mt-1 line-clamp-1 max-w-[150px]">
                          {student.school.programKeahlian || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4.5 px-5 text-xs">
                      <div>
                        <span className="block font-bold text-slate-700">{student.address.telepon || "-"}</span>
                        <span className="block text-gray-400 font-sans line-clamp-1 max-w-[220px]" title={student.address.alamatLengkap}>
                          {student.address.alamatLengkap}
                        </span>
                      </div>
                    </td>
                    <td className="py-4.5 px-5 text-right">
                      {showConfirmDelete === student.id ? (
                        <div className="flex items-center justify-end gap-1.5 animate-pulse">
                          <span className="text-[11px] font-bold text-rose-600 mr-2">Yakin?</span>
                          <button
                              type="button"
                              onClick={() => confirmDelete(student.id)}
                              className="p-1 px-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold"
                          >
                            Ya
                          </button>
                          <button
                              type="button"
                              onClick={() => setShowConfirmDelete(null)}
                              className="p-1 px-2 bg-gray-150 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold"
                          >
                            X
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onSelectStudent(student)}
                            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                            title="Pratinjau & Cetak Buku Induk"
                          >
                            <Printer className="w-4 h-4 text-blue-600" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onEditStudent(student)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit Data"
                          >
                            <Edit2 className="w-4 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowConfirmDelete(student.id)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Hapus Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="block md:hidden divide-y divide-gray-100">
            {filteredStudents.map((student) => (
              <div key={student.id} className="p-4 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-16 rounded-xl border border-gray-200 overflow-hidden bg-slate-50 shrink-0 flex items-center justify-center">
                      {student.foto ? (
                        <img
                          src={student.foto}
                          alt={student.personal.namaLengkap}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className={`text-[11px] font-bold ${student.personal.jenisKelamin === "Perempuan" ? "text-rose-400" : "text-sky-400"}`}>
                          3x4
                        </span>
                      )}
                    </div>
                    <div>
                      <span
                        onClick={() => onSelectStudent(student)}
                        className="font-sans font-bold text-slate-800 hover:text-blue-600 text-sm block"
                      >
                        {student.personal.namaLengkap}
                      </span>
                      <span className="text-[11px] text-gray-500 font-mono tracking-normal block mt-1">
                        Kelas {student.school.kelasSkarang} • {student.personal.jenisKelamin}
                      </span>
                      
                      {/* Print permission toggle for mobile */}
                      <div className="flex items-center gap-1.5 mt-1.5">
                        {student.allowPrint !== false ? (
                          <button
                            type="button"
                            onClick={() => onTogglePrintPermission?.(student.id, false)}
                            className="px-2 py-0.5 rounded bg-blue-50 hover:bg-rose-50 border border-blue-200/50 text-blue-700 hover:text-rose-700 text-[9px] font-black tracking-wide uppercase flex items-center gap-1 transition"
                            title="Klik untuk menonaktifkan cetak mandiri"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                            Cetak Mandiri: AKTIF
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onTogglePrintPermission?.(student.id, true)}
                            className="px-2 py-0.5 rounded bg-rose-50 hover:bg-blue-50 border border-rose-200/50 text-rose-700 hover:text-blue-700 text-[9px] font-black tracking-wide uppercase flex items-center gap-1 transition"
                            title="Klik untuk mengaktifkan cetak mandiri"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                            Cetak Mandiri: NONAKTIF
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-800 font-mono">
                    NIS : {student.personal.nis}
                  </span>
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                  <p className="line-clamp-1"><strong>NISN:</strong> {student.personal.nisn}</p>
                  <p className="line-clamp-1">
                    <strong>Alamat:</strong> {student.address.alamatLengkap}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                  {showConfirmDelete === student.id ? (
                    <div className="flex items-center gap-1.5 animate-pulse">
                      <span className="text-xs font-bold text-rose-600 mr-1">Konfirmasi hapus?</span>
                      <button
                        type="button"
                        onClick={() => confirmDelete(student.id)}
                        className="p-1 px-3 bg-rose-600 text-white rounded text-xs font-bold"
                      >
                        Ya, Hapus
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowConfirmDelete(null)}
                        className="p-1 px-2.5 bg-gray-150 text-gray-700 rounded text-xs font-bold"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => onSelectStudent(student)}
                        className="p-2 py-1 bg-blue-50 text-blue-750 hover:bg-blue-100 rounded-lg text-xs font-bold flex items-center gap-1.5 transition text-blue-700"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Pratinjau Cetak
                      </button>
                      <button
                        type="button"
                        onClick={() => onEditStudent(student)}
                        className="p-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Sunting
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowConfirmDelete(student.id)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center shadow-inner">
          <ShieldAlert className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h4 className="font-sans font-bold text-slate-800 text-base">Tidak Ada Data Siswa Ditemukan</h4>
          <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
            Data siswa tidak cocok dengan kriteria pencarian "{searchTerm}" atau filter kelas "{selectedClass}". Coba kata kunci lain atau tambahkan siswa baru.
          </p>
          <button
            type="button"
            onClick={onAddStudent}
            className="mt-4 px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition inline-flex items-center gap-1.5 shadow-md shadow-blue-600/10"
          >
            <Plus className="w-3.5 h-3.5" /> Tambah Siswa Baru
          </button>
        </div>
      )}
    </div>
  );
};
