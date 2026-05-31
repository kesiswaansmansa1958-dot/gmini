/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Student, CorrectionRequest, AppRole } from "./types";
import { MOCK_STUDENTS, INITIAL_CORRECTION_REQUESTS } from "./mockData";
import { StudentList } from "./components/StudentList";
import { StudentForm } from "./components/StudentForm";
import { StudentPrintView } from "./components/StudentPrintView";
import { RequestManager } from "./components/RequestManager";
import { CorrectionRequestModal } from "./components/CorrectionRequestModal";
import { ExcelImporterModal } from "./components/ExcelImporterModal";
import { AdminSecuritySettings } from "./components/AdminSecuritySettings";
import { 
  Building, 
  LogOut, 
  User, 
  Lock, 
  Printer, 
  BookOpen, 
  AlertCircle, 
  Bell, 
  Plus, 
  Settings, 
  Activity, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText,
  RefreshCw,
  Eye,
  KeyRound,
  GraduationCap,
  Database,
  HelpCircle,
  Check,
  FileSpreadsheet
} from "lucide-react";
import {
  fetchStudentsFromSupabase,
  fetchRequestsFromSupabase,
  saveAllStudentsToSupabase,
  saveAllRequestsToSupabase,
  deleteStudentFromSupabase
} from "./supabase";
import { exportDatabaseToExcel } from "./excelUtils";

export default function App() {
  // Database states loaded from localStorage or fallback
  const [students, setStudents] = useState<Student[]>([]);
  const [requests, setRequests] = useState<CorrectionRequest[]>([]);

  // Database sync states for Supabase
  const [dbSyncStatus, setDbSyncStatus] = useState<"connecting" | "synced" | "saving" | "error" | "offline">("connecting");
  const [dbErrorMessage, setDbErrorMessage] = useState<string | null>(null);
  const [isSqlGuideOpen, setIsSqlGuideOpen] = useState(false);
  
  // Auth states
  const [role, setRole] = useState<AppRole>("GUEST");
  const [loggedInStudent, setLoggedInStudent] = useState<Student | null>(null);

  // Persisted admin credentials state
  const [savedAdminUsername, setSavedAdminUsername] = useState<string>(() => {
    return localStorage.getItem("buku_induk_admin_username") || "admin";
  });
  const [savedAdminPassword, setSavedAdminPassword] = useState<string>(() => {
    return localStorage.getItem("buku_induk_admin_password") || "admin123";
  });
  
  // Auth Form inputs
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [studentNisn, setStudentNisn] = useState("");
  const [studentDob, setStudentDob] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginTab, setLoginTab] = useState<"siswa" | "admin">("siswa");

  // General App states
  const [activeAdminTab, setActiveAdminTab] = useState<"daftar_siswa" | "pengajuan_revisi" | "ubah_password">("daftar_siswa");
  const [selectedStudentForPrint, setSelectedStudentForPrint] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [isImportExcelOpen, setIsImportExcelOpen] = useState(false);
  const [isFilingRequestModal, setIsFilingRequestModal] = useState(false);

  // Initialize and load Database on mount with Supabase backend synchronization
  useEffect(() => {
    async function loadDataAndSync() {
      setDbSyncStatus("connecting");
      
      try {
        const sbStudents = await fetchStudentsFromSupabase();
        const sbRequests = await fetchRequestsFromSupabase();

        if (sbStudents !== null && sbRequests !== null) {
          // Connected successfully to Supabase!
          if (sbStudents.length === 0 && sbRequests.length === 0) {
            // Empty database detected: perform auto-seeding
            console.info("Supabase connected but is empty. Seeding initial datasets...");
            setDbSyncStatus("saving");
            const seedStudsSucc = await saveAllStudentsToSupabase(MOCK_STUDENTS);
            const seedReqsSucc = await saveAllRequestsToSupabase(INITIAL_CORRECTION_REQUESTS);

            if (seedStudsSucc && seedReqsSucc) {
              setStudents(MOCK_STUDENTS);
              setRequests(INITIAL_CORRECTION_REQUESTS);
              localStorage.setItem("buku_induk_students", JSON.stringify(MOCK_STUDENTS));
              localStorage.setItem("buku_induk_requests", JSON.stringify(INITIAL_CORRECTION_REQUESTS));
              setDbSyncStatus("synced");
              setDbErrorMessage(null);
            } else {
              setDbSyncStatus("error");
              setDbErrorMessage("Berhasil menyambung ke Supabase, namun seeding gagal karena kendala skema atau RLS.");
              loadLocalFallback();
            }
          } else {
            // Normal sync down from remote database
            setStudents(sbStudents);
            setRequests(sbRequests);
            localStorage.setItem("buku_induk_students", JSON.stringify(sbStudents));
            localStorage.setItem("buku_induk_requests", JSON.stringify(sbRequests));
            setDbSyncStatus("synced");
            setDbErrorMessage(null);
          }
        } else {
          // Supabase returned null (tables do not exist or schema mismatch)
          setDbSyncStatus("error");
          setDbErrorMessage("Tabel di database Supabase belum diinisialisasi atau akses terblokir. Gunakan Panduan SQL Pembuatan Tabel.");
          loadLocalFallback();
        }
      } catch (err) {
        console.error("Critical error while connecting to Supabase during initialization:", err);
        setDbSyncStatus("error");
        setDbErrorMessage("Sambungan gagal ke Supabase. Menggunakan data cadangan lokal.");
        loadLocalFallback();
      }
    }

    function loadLocalFallback() {
      const storedStudents = localStorage.getItem("buku_induk_students");
      const storedRequests = localStorage.getItem("buku_induk_requests");

      if (storedStudents) {
        setStudents(JSON.parse(storedStudents));
      } else {
        localStorage.setItem("buku_induk_students", JSON.stringify(MOCK_STUDENTS));
        setStudents(MOCK_STUDENTS);
      }

      if (storedRequests) {
        setRequests(JSON.parse(storedRequests));
      } else {
        localStorage.setItem("buku_induk_requests", JSON.stringify(INITIAL_CORRECTION_REQUESTS));
        setRequests(INITIAL_CORRECTION_REQUESTS);
      }
    }

    loadDataAndSync();
  }, []);

  // Save utilities with background Supabase replication
  const saveStudents = async (updatedList: Student[]) => {
    setStudents(updatedList);
    localStorage.setItem("buku_induk_students", JSON.stringify(updatedList));

    setDbSyncStatus("saving");
    const succ = await saveAllStudentsToSupabase(updatedList);
    if (succ) {
      setDbSyncStatus("synced");
    } else {
      setDbSyncStatus("error");
    }
  };

  const saveRequests = async (updatedReqs: CorrectionRequest[]) => {
    setRequests(updatedReqs);
    localStorage.setItem("buku_induk_requests", JSON.stringify(updatedReqs));

    setDbSyncStatus("saving");
    const succ = await saveAllRequestsToSupabase(updatedReqs);
    if (succ) {
      setDbSyncStatus("synced");
    } else {
      setDbSyncStatus("error");
    }
  };

  // Login handler
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (adminUsername === savedAdminUsername && adminPassword === savedAdminPassword) {
      setRole("ADMIN");
      setLoginError(null);
    } else {
      setLoginError(`Username atau Password Admin salah!`);
    }
  };

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    
    const matched = students.find(
      (s) => s.personal.nisn === studentNisn && s.personal.tanggalLahir === studentDob
    );

    if (matched) {
      setRole("SISWA");
      setLoggedInStudent(matched);
      setLoginError(null);
    } else {
      setLoginError("NISN atau Tanggal Lahir tidak cocok! Silakan periksa kembali data Anda.");
    }
  };

  const handleUpdateAdminCredentials = (currentPasswordInput: string, newUsername: string, newValuePassword?: string): boolean => {
    if (currentPasswordInput !== savedAdminPassword) {
      return false;
    }
    setSavedAdminUsername(newUsername);
    localStorage.setItem("buku_induk_admin_username", newUsername);
    if (newValuePassword) {
      setSavedAdminPassword(newValuePassword);
      localStorage.setItem("buku_induk_admin_password", newValuePassword);
    }
    return true;
  };

  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "warning" } | null>(null);

  const showToast = (message: string, type: "success" | "info" | "warning" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 5500);
  };

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
      return current !== undefined && current !== null ? String(current).trim() : "";
    } catch {
      return "";
    }
  };

  const handleLogout = () => {
    setRole("GUEST");
    setLoggedInStudent(null);
    setAdminUsername("");
    setAdminPassword("");
    setStudentNisn("");
    setStudentDob("");
    setLoginError(null);
  };

  const COMPENSABLE_FIELDS = [
    { path: "personal.namaLengkap", label: "Data Pribadi - Nama Lengkap" },
    { path: "personal.namaPanggilan", label: "Data Pribadi - Nama Panggilan" },
    { path: "personal.nis", label: "Data Pribadi - NIS" },
    { path: "personal.nisn", label: "Data Pribadi - NISN" },
    { path: "personal.jenisKelamin", label: "Data Pribadi - Jenis Kelamin" },
    { path: "personal.tempatLahir", label: "Data Pribadi - Tempat Lahir" },
    { path: "personal.tanggalLahir", label: "Data Pribadi - Tanggal Lahir" },
    { path: "personal.agama", label: "Data Pribadi - Agama" },
    { path: "personal.kewarganegaraan", label: "Data Pribadi - Kewarganegaraan" },
    { path: "personal.anakKe", label: "Data Pribadi - Anak Ke" },
    { path: "personal.saudaraKandung", label: "Data Pribadi - Jumlah Saudara Kandung" },
    { path: "personal.saudaraTiri", label: "Data Pribadi - Jumlah Saudara Tiri" },
    { path: "personal.saudaraAngkat", label: "Data Pribadi - Jumlah Saudara Angkat" },
    { path: "personal.statusKeluarga", label: "Data Pribadi - Status Keluarga" },
    { path: "personal.bahasaSehariHari", label: "Data Pribadi - Bahasa Sehari-hari" },
    { path: "address.alamatLengkap", label: "Domisili - Alamat Domisili Lengkap" },
    { path: "address.telepon", label: "Domisili - Nomor HP / Telepon" },
    { path: "address.tinggalDengan", label: "Domisili - Tinggal Dengan" },
    { path: "address.jarakKeSekolah", label: "Domisili - Jarak Ke Sekolah" },
    { path: "address.transportasi", label: "Domisili - Transportasi" },
    { path: "health.golonganDarah", label: "Kesehatan - Golongan Darah" },
    { path: "health.penyakitPernahDiderita", label: "Kesehatan - Riwayat Penyakit" },
    { path: "health.kelainanJasmani", label: "Kesehatan - Kelainan Jasmani" },
    { path: "health.tinggiBadan", label: "Kesehatan - Tinggi Badan" },
    { path: "health.beratBadan", label: "Kesehatan - Berat Badan" },
    { path: "education.lulusanDari", label: "Pendidikan - Asal Sekolah Dasar (SMP)" },
    { path: "education.tanggalIjazah", label: "Pendidikan - Tanggal Ijazah" },
    { path: "education.nomorIjazah", label: "Pendidikan - Nomor Ijazah" },
    { path: "education.pindahanDari", label: "Pendidikan - Pindahan Dari" },
    { path: "education.alasanPindah", label: "Pendidikan - Alasan Pindah" },
    { path: "parents.ayah.nama", label: "Keluarga - Nama Lengkap Ayah" },
    { path: "parents.ayah.agama", label: "Keluarga - Agama Ayah" },
    { path: "parents.ayah.kewarganegaraan", label: "Keluarga - Kewarganegaraan Ayah" },
    { path: "parents.ayah.pendidikan", label: "Keluarga - Pendidikan Ayah" },
    { path: "parents.ayah.pekerjaan", label: "Keluarga - Pekerjaan Ayah" },
    { path: "parents.ayah.penghasilan", label: "Keluarga - Penghasilan Ayah" },
    { path: "parents.ayah.telepon", label: "Keluarga - Telepon Ayah" },
    { path: "parents.ayah.isMasihHidup", label: "Keluarga - Status Hidup Ayah" },
    { path: "parents.ibu.nama", label: "Keluarga - Nama Lengkap Ibu" },
    { path: "parents.ibu.agama", label: "Keluarga - Agama Ibu" },
    { path: "parents.ibu.kewarganegaraan", label: "Keluarga - Kewarganegaraan Ibu" },
    { path: "parents.ibu.pendidikan", label: "Keluarga - Pendidikan Ibu" },
    { path: "parents.ibu.pekerjaan", label: "Keluarga - Pekerjaan Ibu" },
    { path: "parents.ibu.penghasilan", label: "Keluarga - Penghasilan Ibu" },
    { path: "parents.ibu.telepon", label: "Keluarga - Telepon Ibu" },
    { path: "parents.ibu.isMasihHidup", label: "Keluarga - Status Hidup Ibu" },
    { path: "guardian.nama", label: "Wali - Nama Lengkap Wali" },
    { path: "guardian.pekerjaan", label: "Wali - Pekerjaan Wali" },
    { path: "guardian.alamat", label: "Wali - Alamat Wali" },
    { path: "guardian.telepon", label: "Wali - Telepon Wali" },
    { path: "guardian.hubunganSiswa", label: "Wali - Hubungan Siswa dengan Wali" },
    { path: "school.beasiswa", label: "Beasiswa" },
    { path: "foto", label: "Pas Foto Diri" },
  ];

  // CRUD STUDENT OPERATIONS
  const handleCreateOrUpdateStudent = (data: Omit<Student, "id"> | Student) => {
    if (role === "SISWA" && loggedInStudent) {
      // Siswa role: Compare loggedInStudent with edited data and auto-create correction requests (pengajuans)
      const changedFields = COMPENSABLE_FIELDS.filter(field => {
        const oldVal = getNestedValue(loggedInStudent, field.path);
        const newVal = getNestedValue(data, field.path);
        return oldVal !== newVal;
      });

      if (changedFields.length === 0) {
        showToast("Tidak ada perubahan biodata teraktifkan.", "warning");
        setEditingStudent(null);
        return;
      }

      // Generate a correction request for each changed field
      const newRequests: CorrectionRequest[] = changedFields.map((field, idx) => {
        const oldVal = getNestedValue(loggedInStudent, field.path);
        const newVal = getNestedValue(data, field.path);
        return {
          id: `req-${Date.now()}-${idx}`,
          studentId: loggedInStudent.id,
          studentNisn: loggedInStudent.personal.nisn,
          studentNama: loggedInStudent.personal.namaLengkap,
          requestDate: new Date().toLocaleDateString("id-ID") + " " + new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          fieldName: field.path,
          fieldLabel: field.label,
          oldValue: oldVal,
          newValue: newVal,
          status: "Diproses",
        };
      });

      const updatedRequests = [...newRequests, ...requests];
      saveRequests(updatedRequests);
      
      showToast(`Berhasil mengirimkan ${changedFields.length} revisi biodata secara langsung! Seluruh butir perbaikan telah dikonversi menjadi draf pengajuan terverifikasi staf TU.`, "success");
      setEditingStudent(null);
      return;
    }

    let updatedList: Student[];
    if ("id" in data) {
      // Edit mode
      updatedList = students.map((s) => (s.id === data.id ? (data as Student) : s));
      // If the editing student is the logged-in student, update their live session state too
      if (loggedInStudent && loggedInStudent.id === data.id) {
        setLoggedInStudent(data as Student);
      }
    } else {
      // Create mode
      const newSiswa: Student = {
        ...data,
        id: data.personal.nisn, // Use NISN as unique database ID
      };
      updatedList = [newSiswa, ...students];
    }

    saveStudents(updatedList);
    showToast("Data siswa berhasil tersimpan secara langsung ke database.", "success");
    setEditingStudent(null);
    setIsAddingStudent(false);
  };

  const handleDeleteStudent = async (id: string) => {
    const updated = students.filter((s) => s.id !== id);
    // Also clean up that student's pending requests
    const cleanedRequests = requests.filter((r) => r.studentId !== id);
    
    // Optimistic local update
    setStudents(updated);
    setRequests(cleanedRequests);
    localStorage.setItem("buku_induk_students", JSON.stringify(updated));
    localStorage.setItem("buku_induk_requests", JSON.stringify(cleanedRequests));

    setDbSyncStatus("saving");
    const docDelSucc = await deleteStudentFromSupabase(id);
    const reqsSucc = await saveAllRequestsToSupabase(cleanedRequests);
    
    if (docDelSucc && reqsSucc) {
      setDbSyncStatus("synced");
      showToast("Data siswa berhasil dihapus secara permanen dari database Supabase.", "success");
    } else {
      setDbSyncStatus("error");
      showToast("Gagal menghapus data dari Supabase (Perubahan tersimpan secara lokal).", "warning");
    }
  };

  const handleImportStudents = async (importedList: Student[], importStrategy: "UPSERT" | "REPLACE") => {
    let updatedList: Student[] = [];

    if (importStrategy === "REPLACE") {
      updatedList = importedList;
    } else {
      // UPSERT strategy: merge by student ID, NISN, or NIS
      const merged = [...students];
      importedList.forEach((impStudent) => {
        const existingIndex = merged.findIndex(
          (ex) =>
            ex.id === impStudent.id ||
            (ex.personal.nisn && ex.personal.nisn === impStudent.personal.nisn) ||
            (ex.personal.nis && ex.personal.nis === impStudent.personal.nis)
        );

        if (existingIndex !== -1) {
          // Merge preserving existing properties that may not be in Excel
          merged[existingIndex] = {
            ...merged[existingIndex],
            ...impStudent,
            // deep merge personal/school/etc to avoid blanking subfields
            personal: { ...merged[existingIndex].personal, ...impStudent.personal },
            address: { ...merged[existingIndex].address, ...impStudent.address },
            health: { ...merged[existingIndex].health, ...impStudent.health },
            education: { ...merged[existingIndex].education, ...impStudent.education },
            parents: { ...merged[existingIndex].parents, ...impStudent.parents },
            guardian: { ...merged[existingIndex].guardian, ...impStudent.guardian },
            school: { ...merged[existingIndex].school, ...impStudent.school },
            foto: impStudent.foto || merged[existingIndex].foto,
          };
        } else {
          merged.push(impStudent);
        }
      });
      updatedList = merged;
    }

    // Update state & client storage
    setStudents(updatedList);
    localStorage.setItem("buku_induk_students", JSON.stringify(updatedList));

    // Upload / sync directly online
    setDbSyncStatus("saving");
    const syncSucc = await saveAllStudentsToWarmSupabase(updatedList);
    if (syncSucc) {
      setDbSyncStatus("synced");
      showToast(`Berhasil mengimpor ${importedList.length} data siswa ke database kesiswaan!`, "success");
    } else {
      setDbSyncStatus("error");
      showToast(`Impor tersimpan lokal, namun gagal mengunggah ke Supabase. Periksa skema tabel.`, "warning");
    }
  };

  // Helper with robust upsert fallback to warm Supabase
  const saveAllStudentsToWarmSupabase = async (list: Student[]): Promise<boolean> => {
    try {
      const succ = await saveAllStudentsToSupabase(list);
      return succ;
    } catch {
      return false;
    }
  };

  const handleTogglePrintPermission = (id: string, allow: boolean) => {
    const updated = students.map((s) => {
      if (s.id === id) {
        return { ...s, allowPrint: allow };
      }
      return s;
    });
    saveStudents(updated);
    
    // If the logged in student is toggled, also sync live session state
    if (loggedInStudent && loggedInStudent.id === id) {
      setLoggedInStudent({ ...loggedInStudent, allowPrint: allow });
    }

    const targetStudent = students.find((s) => s.id === id);
    const label = targetStudent ? targetStudent.personal.namaLengkap : "Siswa";
    if (allow) {
      showToast(`Izin cetak mandiri Buku Induk aktif untuk ${label}.`, "success");
    } else {
      showToast(`Izin cetak mandiri Buku Induk dinonaktifkan untuk ${label}.`, "warning");
    }
  };

  // REDIRECT / MERGE HANDLERS FOR STUDENT CORRECTIONS
  const handleApproveRequest = (reqId: string | string[]) => {
    const idsToApprove = Array.isArray(reqId) ? reqId : [reqId];
    if (idsToApprove.length === 0) return;

    let updatedStudentsList = [...students];
    let updatedReqList = [...requests];

    idsToApprove.forEach((id) => {
      const targetReq = updatedReqList.find((r) => r.id === id);
      if (!targetReq) return;

      // Apply change value dynamically into the nested student field
      updatedStudentsList = updatedStudentsList.map((student) => {
        if (student.id === targetReq.studentId) {
          const studentClone = JSON.parse(JSON.stringify(student)) as any;
          const parts = targetReq.fieldName.split(".");
          let ref = studentClone;
          for (let i = 0; i < parts.length - 1; i++) {
            ref = ref[parts[i]];
          }
          ref[parts[parts.length - 1]] = targetReq.newValue;
          return studentClone as Student;
        }
        return student;
      });

      // Mark request as Approved
      updatedReqList = updatedReqList.map((r) =>
        r.id === id ? { ...r, status: "Disetujui" as const, notes: "Perubahan disetujui administrasi sekolah" } : r
      );
    });

    saveStudents(updatedStudentsList);
    saveRequests(updatedReqList);
    showToast(`Berhasil menyetujui ${idsToApprove.length} perubahan data siswa.`, "success");
  };

  const handleRejectRequest = (reqId: string | string[], notes: string) => {
    const idsToReject = Array.isArray(reqId) ? reqId : [reqId];
    if (idsToReject.length === 0) return;

    const updatedReqList = requests.map((r) =>
      idsToReject.includes(r.id) ? { ...r, status: "Ditolak" as const, notes } : r
    );

    saveRequests(updatedReqList);
    showToast(`Berhasil menolak ${idsToReject.length} pengajuan data siswa.`, "warning");
  };

  const handleAddRequestFromStudent = (reqContent: { fieldName: string; fieldLabel: string; oldValue: string; newValue: string }) => {
    if (!loggedInStudent) return;

    const newRequest: CorrectionRequest = {
      id: `req-${Date.now()}`,
      studentId: loggedInStudent.id,
      studentNisn: loggedInStudent.personal.nisn,
      studentNama: loggedInStudent.personal.namaLengkap,
      requestDate: new Date().toLocaleDateString("id-ID") + " " + new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      fieldName: reqContent.fieldName,
      fieldLabel: reqContent.fieldLabel,
      oldValue: reqContent.oldValue,
      newValue: reqContent.newValue,
      status: "Diproses",
    };

    const updated = [newRequest, ...requests];
    saveRequests(updated);
  };

  // Demo Login Quick-Triggers for Testing
  const triggerDemoLogin = (nisn: string, dob: string) => {
    const matched = students.find((s) => s.personal.nisn === nisn && s.personal.tanggalLahir === dob);
    if (matched) {
      setRole("SISWA");
      setLoggedInStudent(matched);
      setLoginError(null);
    }
  };

  const triggerAdminDemo = () => {
    setRole("ADMIN");
    setLoginError(null);
  };

  return (
    <div id="school-registry-portal-root" className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900 print:bg-white">
      
      {/* GLOBAL HEADER - HIDE WHEN PRINT DIALOG ACTIVE */}
      <header className="bg-slate-900 text-white border-b border-slate-800 print:hidden shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/10 rounded-2xl border border-blue-500/10">
              <Building className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="font-sans font-black tracking-wide text-md sm:text-lg">SIAKAD Buku Induk</h1>
              <p className="text-[10px] text-slate-400 font-mono">SMA NEGERI REPUBLIK INDONESIA • PORTAL VERSI 3.0</p>
            </div>
          </div>

          {/* User state headers / logout links */}
          {role !== "GUEST" && (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-bold font-sans bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
                  {role === "ADMIN" ? "⚙️ Administrator Utama" : `🎓 Siswa: ${loggedInStudent?.personal.namaPanggilan}`}
                </span>
                <span className="text-[10px] text-slate-400 mt-1 capitalize">
                  {role === "ADMIN" ? "Sesi: Tata Usaha / Kepala Sekolah" : `Kelas: ${loggedInStudent?.school.kelasSkarang}`}
                </span>
              </div>
              <button
                type="button"
                id="btn-logout-action"
                onClick={handleLogout}
                className="p-2 py-1.5 bg-rose-600/90 hover:bg-rose-600 active:bg-rose-700 text-white font-sans font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-rose-600/10"
              >
                <LogOut className="w-3.5 h-3.5" />
                Keluar
              </button>
            </div>
          )}
        </div>
      </header>

      {/* RENDER VIEW CONTROLLER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 py-8 print:p-0">
        
        {/* Supabase Database Status Alert/Indicator Banner */}
        <div className="mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4.5 bg-white border border-gray-200 rounded-3xl shadow-sm print:hidden">
          <div className="flex items-center gap-3.5">
            <div className={`p-2.5 rounded-2xl flex items-center justify-center shrink-0 border ${
              dbSyncStatus === "synced"
                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                : dbSyncStatus === "saving"
                ? "bg-blue-50 text-blue-600 border-blue-100"
                : dbSyncStatus === "connecting"
                ? "bg-amber-50 text-amber-600 border-amber-100 animate-pulse"
                : "bg-rose-50 text-rose-600 border-rose-100"
            }`}>
              {dbSyncStatus === "saving" ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Database className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-black text-slate-800 font-sans uppercase tracking-wide">
                  SINKRONISASI DATABASE SUPABASE
                </h4>
                <span className={`w-2 h-2 rounded-full ${
                  dbSyncStatus === "synced"
                    ? "bg-emerald-500 animate-pulse"
                    : dbSyncStatus === "saving"
                    ? "bg-blue-500 animate-pulse"
                    : dbSyncStatus === "connecting"
                    ? "bg-amber-500 animate-pulse"
                    : "bg-rose-500"
                }`} />
              </div>
              <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                {dbSyncStatus === "synced" && "Aplikasi terhubung & tersinkronisasi penuh dengan database Supabase (Live)."}
                {dbSyncStatus === "saving" && "Sedang mengunggah dan mensinkronisasikan data ke database Supabase kesiswaan..."}
                {dbSyncStatus === "connecting" && "Menyambungkan ke cluster kesiswaansmansa1958-dot's Project..."}
                {dbSyncStatus === "error" && (dbErrorMessage || "Sesi cadangan lokal aktif.")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <button
              type="button"
              onClick={() => setIsSqlGuideOpen(true)}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold font-sans text-[11px] rounded-xl flex items-center gap-1.5 transition whitespace-nowrap shadow-sm border border-slate-700 h-fit cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Skema SQL Supabase
            </button>
            {dbSyncStatus === "error" && (
              <span className="text-[10px] bg-rose-50 border border-rose-100 text-rose-700 px-2.5 py-1.5 rounded-xl font-bold uppercase tracking-wider">
                Mode Offline / Fallback Lokal
              </span>
            )}
          </div>
        </div>

        {/* SQL Setup Instruction Modal Component */}
        {isSqlGuideOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-gray-200 w-full max-w-3xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
              
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-150 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-50 border border-blue-100 rounded-xl text-blue-600">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-sans font-black text-sm text-slate-900">
                      Instruksi Pembuatan Tabel di Supabase
                    </h3>
                    <p className="text-[11.5px] text-gray-500 font-sans mt-0.5">
                      Gunakan skrip di bawah ini untuk menginisialisasi database di panel SQL Editor Supabase Anda.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSqlGuideOpen(false)}
                  className="p-1 px-3 bg-gray-100 hover:bg-gray-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer"
                >
                  Tutup Panduan
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto space-y-4 font-sans text-xs text-slate-700 leading-relaxed">
                <p>
                  Agar aplikasi dapat melakukan penyimpanan data secara langsung dan persisten, silakan buka <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold underline">Dashboard Supabase</a> Anda (<strong className="text-slate-900">kesiswaansmansa1958-dot's Project</strong>), masuk ke menu <strong className="text-slate-900">SQL Editor</strong>, klik <strong className="text-slate-900">New Query</strong>, paste kode berikut, lalu klik <strong className="text-slate-900">Run</strong>:
                </p>

                <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl font-mono text-xs overflow-x-auto border border-slate-800 space-y-1 select-all relative">
                  <span className="absolute right-3 top-3 bg-slate-800 border border-slate-700 text-slate-400 font-sans text-[10px] px-2 py-1 rounded-lg">Copy-Paste Ke SQL Editor</span>
                  <pre>{`-- SCRIPT DATABASE SIAKAD BUKU INDUK SISWA

-- 1. Buat Tabel Siswa (buku_induk_students)
create table if not exists public.buku_induk_students (
    id text primary key,
    data jsonb not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Aktifkan Row Level Security (RLS) serta buat kebijakan Bypass Akses Publik
alter table public.buku_induk_students enable row level security;
create policy "Akses Publik Universal Siswa" on public.buku_induk_students for all using (true);

-- 2. Buat Tabel Pengajuan Revisi (buku_induk_requests)
create table if not exists public.buku_induk_requests (
    id text primary key,
    data jsonb not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.buku_induk_requests enable row level security;
create policy "Akses Publik Universal Revisi" on public.buku_induk_requests for all using (true);`}</pre>
                </div>

                <div className="p-4.5 bg-blue-50 border border-blue-150 rounded-2xl text-blue-900 flex items-start gap-2.5">
                  <div className="shrink-0 p-1 bg-white border border-blue-200 text-blue-600 rounded-lg font-bold">INFO</div>
                  <div>
                    <span className="font-bold block mb-0.5 text-xs text-blue-950">Mengapa Menggunakan Skema JSONB?</span>
                    Sistem portal e-Buku Induk menggunakan standard dokumen JSONB yang tersimpan secara terstruktur. Hal ini menjamin fleksibilitas penuh apabila nantinya terdapat form biodata di sub-form kesiswaan yang bertambah, tanpa perlu melakukan perubahan struktur kolom (alter table) yang merepotkan.
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 px-6 border-t border-gray-150 bg-slate-50 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setIsSqlGuideOpen(false)}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 font-sans font-bold text-white text-xs rounded-xl shadow-md transition cursor-pointer"
                >
                  Saya Mengerti
                </button>
              </div>

            </div>
          </div>
        )}
        
        {/* ========================================================= */}
        {/* VIEW 1: AUTHENTICATION ENTRANCE                           */}
        {/* ========================================================= */}
        {role === "GUEST" && (
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch pt-2 md:pt-10">
            
            {/* Left: Educational Introduction */}
            <div className="bg-slate-900 p-8 text-white rounded-3xl flex flex-col justify-between shadow-xl border border-slate-800 relative overflow-hidden">
              <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-5 pointer-events-none">
                <Building className="w-96 h-96 text-slate-700" />
              </div>
              <div className="space-y-6">
                <span className="px-3 py-1 bg-blue-600/10 text-blue-400 rounded-full font-mono text-[10px] font-bold border border-blue-500/10 inline-block uppercase">
                  Sistem Informasi Registry Siswa
                </span>
                <h2 className="text-2xl md:text-3xl font-sans font-black tracking-tight leading-tight">
                  Pendataan Digital <br />
                  <span className="text-blue-400">Buku Induk Kesiswaan</span>
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Selamat datang di portal e-Buku Induk resmi sekolah. Sistem ini mengakomodasi seluruh data arsip historis, biodata primer, riwayat kesehatan, kepindahan sekolah, beasiswa, hingga detail orang tua siswa dengan integrasi pencetakan pas foto secara formal.
                </p>
              </div>

              <div className="pt-8 border-t border-slate-800 space-y-3">
                <div className="flex gap-3 text-xs">
                  <div className="p-1 px-1.5 bg-slate-800 border border-slate-705 border-slate-700 rounded-lg text-[10px] font-bold text-slate-300 font-mono shrink-0 h-fit">ROLE 1</div>
                  <p className="text-slate-300"><strong>Staf Sekolah (Admin):</strong> Menambah, merevisi, mencetak lembar buku induk dengan standard form, serta memberikan approval adopsi revisi data.</p>
                </div>
                <div className="flex gap-3 text-xs">
                  <div className="p-1 px-1.5 bg-slate-800 border border-slate-705 border-slate-700 rounded-lg text-[10px] font-bold text-slate-300 font-mono shrink-0 h-fit">ROLE 2</div>
                  <p className="text-slate-300"><strong>Peserta Didik (Siswa):</strong> Log Masuk menggunakan NISN untuk mawas diri, mencetak lembar data mandiri dengan pas foto, dan melakukan revisi biodata secara langsung.</p>
                </div>
              </div>
            </div>

            {/* Right: Unified Authentication Form Card */}
            <div className="flex flex-col gap-6">
              
              {/* Warning/Helper info if error exists */}
              {loginError && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-850 rounded-2xl flex items-start gap-2.5 text-xs font-semibold shadow-sm animate-shake">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Single Unified Authentication Card */}
              <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm">
                {/* Tab Switcher Headers */}
                <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6">
                  <button
                    type="button"
                    onClick={() => { setLoginTab("siswa"); setLoginError(null); }}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                      loginTab === "siswa"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>Masuk Siswa</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLoginTab("admin"); setLoginError(null); }}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                      loginTab === "admin"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Lock className="w-4 h-4" />
                    <span>Masuk Admin</span>
                  </button>
                </div>

                {/* Tab Contents */}
                {loginTab === "siswa" ? (
                  <div>
                    <div className="flex items-center gap-2.5 mb-4 border-b border-gray-100 pb-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-sans font-bold text-sm text-slate-800">Buku Induk Kesiswaan</h3>
                        <p className="text-[11px] text-gray-400 font-medium">Verifikasi biodata, unduh/cetak lembar data mandiri</p>
                      </div>
                    </div>

                    <form onSubmit={handleStudentLogin} className="space-y-4">
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Nomor Induk Siswa Nasional (NISN)</label>
                          <input
                            type="text"
                            required
                            maxLength={10}
                            value={studentNisn}
                            onChange={(e) => setStudentNisn(e.target.value)}
                            placeholder="Masukkan 10 digit NISN"
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Tanggal Lahir</label>
                          <input
                            type="date"
                            required
                            value={studentDob}
                            onChange={(e) => setStudentDob(e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500 font-mono"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-600/10 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Akses Buku Induk Saya</span>
                      </button>
                    </form>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2.5 mb-4 border-b border-gray-100 pb-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-sans font-bold text-sm text-slate-800">Akses Administrator (TU)</h3>
                        <p className="text-[11px] text-gray-400 font-medium">Pendaftaran, penyuntingan, pencatatan & verifikasi arsip</p>
                      </div>
                    </div>

                    <form onSubmit={handleAdminLogin} className="space-y-4">
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Username Admin</label>
                          <input
                            type="text"
                            required
                            value={adminUsername}
                            onChange={(e) => setAdminUsername(e.target.value)}
                            placeholder="Isi username"
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Kata Sandi</label>
                          <input
                            type="password"
                            required
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            placeholder="Isi kata sandi"
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-600/10 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Masuk Aplikasi</span>
                      </button>
                    </form>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: ADMIN DASHBOARD PANEL                             */}
        {/* ========================================================= */}
        {role === "ADMIN" && (
          <div className="space-y-6">
            
            {/* Secondary Header menu switcher */}
            <div className="bg-white border border-gray-150 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-sans font-black text-slate-800 text-md">Dasbor Tata Usaha Sekolah</h2>
                  <p className="text-xs text-gray-500">Kelola buku besar registers, profil akademis, foto siswa & kualifikasi wali.</p>
                </div>
              </div>

              {/* TABS Toggling */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    id="tab-btn-students"
                    onClick={() => setActiveAdminTab("daftar_siswa")}
                    className={`px-4 py-2 rounded-lg text-xs font-bold font-sans transition ${
                      activeAdminTab === "daftar_siswa"
                        ? "bg-white text-slate-800 shadow-sm"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    Daftar Siswa ({students.length})
                  </button>
                  <button
                    type="button"
                    id="tab-btn-corrections"
                    onClick={() => setActiveAdminTab("pengajuan_revisi")}
                    className={`px-4 py-2 rounded-lg text-xs font-bold font-sans transition flex items-center gap-1.5 ${
                      activeAdminTab === "pengajuan_revisi"
                        ? "bg-white text-slate-800 shadow-sm"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    <span>Verifikasi Data</span>
                    {requests.filter((r) => r.status === "Diproses").length > 0 && (
                      <span className="w-5 h-5 bg-rose-600 font-mono text-[9px] font-black text-white rounded-full flex items-center justify-center animate-pulse">
                        {requests.filter((r) => r.status === "Diproses").length}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    id="tab-btn-security"
                    onClick={() => setActiveAdminTab("ubah_password")}
                    className={`px-4 py-2 rounded-lg text-xs font-bold font-sans transition flex items-center gap-1.5 ${
                      activeAdminTab === "ubah_password"
                        ? "bg-white text-slate-800 shadow-sm"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    <span>Ubah Password</span>
                  </button>
                </div>

                <button
                  type="button"
                  id="btn-export-excel"
                  onClick={() => {
                    exportDatabaseToExcel(students, requests);
                    showToast("Database Buku Induk berhasil diekspor ke Excel!", "success");
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold font-sans rounded-xl flex items-center justify-center gap-2 shadow-sm transition cursor-pointer border border-emerald-550 shrink-0"
                  title="Unduh seluruh database (Profil Siswa & Riwayat Revisi) ke Excel"
                >
                  <FileSpreadsheet className="w-4 h-4 text-white" />
                  Unduh Excel (.xlsx)
                </button>

                <button
                  type="button"
                  id="btn-import-excel-trigger"
                  onClick={() => setIsImportExcelOpen(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold font-sans rounded-xl flex items-center justify-center gap-2 shadow-sm transition cursor-pointer border border-indigo-550 shrink-0"
                  title="Impor list data siswa baru atau perbarui biodata massal dari Excel"
                >
                  <FileSpreadsheet className="w-4 h-4 text-white" />
                  Impor Excel (.xlsx)
                </button>
              </div>
            </div>

            {/* TAB CONTENTS */}
            {activeAdminTab === "daftar_siswa" && (
              <StudentList
                students={students}
                onSelectStudent={(s) => setSelectedStudentForPrint(s)}
                onEditStudent={(s) => setEditingStudent(s)}
                onDeleteStudent={handleDeleteStudent}
                onAddStudent={() => setIsAddingStudent(true)}
                onTogglePrintPermission={handleTogglePrintPermission}
              />
            )}

            {activeAdminTab === "pengajuan_revisi" && (
              <RequestManager
                requests={requests}
                onApprove={handleApproveRequest}
                onReject={handleRejectRequest}
              />
            )}

            {activeAdminTab === "ubah_password" && (
              <AdminSecuritySettings
                currentUsername={savedAdminUsername}
                onUpdateCredentials={handleUpdateAdminCredentials}
                showToast={showToast}
              />
            )}

          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 3: STUDENT DASHBOARD PANEL                           */}
        {/* ========================================================= */}
        {role === "SISWA" && loggedInStudent && (
          <div className="space-y-6">
                {/* Welcome banner */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 md:p-8 rounded-2xl text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 font-sans">
              <div className="space-y-2">
                <span className="px-2.5 py-0.5 bg-white/10 text-blue-200 border border-white/10 rounded-full text-[10px] font-bold font-mono inline-block">
                  KELAS {loggedInStudent.school.kelasSkarang} • JURUSAN {loggedInStudent.school.programKeahlian || "MIPA"}
                </span>
                <h2 className="text-xl md:text-2xl font-sans font-black tracking-tight">
                  Halo, {loggedInStudent.personal.namaLengkap}!
                </h2>
                <p className="text-xs text-blue-105/90 text-slate-100 leading-relaxed max-w-xl">
                  Ini adalah lembar data e-Buku Induk Anda yang absah dalam sistem kami. Anda memiliki otensitas penuh untuk mencetak berkas, mawas seluruh data identifikasi sosial, serta merevisi biodata Anda secara langsung apabila ditemukan ketidakcocokan dalam e-arsip.
                </p>
              </div>

              {/* Action buttons on the side */}
              <div className="flex flex-wrap gap-2.5 items-center">
                {loggedInStudent.allowPrint !== false ? (
                  <button
                    type="button"
                    id="btn-student-print-own"
                    onClick={() => setSelectedStudentForPrint(loggedInStudent)}
                    className="px-4.5 py-3 bg-slate-900 text-white font-sans font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition hover:bg-slate-800"
                  >
                    <Printer className="w-4 h-4 text-white" />
                    Cetak Buku Induk Saya
                  </button>
                ) : (
                  <div className="flex flex-col items-stretch sm:items-end">
                    <button
                      type="button"
                      id="btn-student-print-own-disabled"
                      disabled
                      className="px-4.5 py-3 bg-slate-200/80 text-slate-400 font-sans font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-not-allowed border border-slate-300"
                      title="Fitur cetak mandiri dinonaktifkan oleh kesiswaan sekolah"
                    >
                      <Printer className="w-4 h-4 text-slate-400" />
                      Cetak Buku Induk (Dicegah)
                    </button>
                    <span className="text-[9px] text-rose-200 text-right font-sans font-bold tracking-wide uppercase mt-1">Dicabut Staf Kesiswaan</span>
                  </div>
                )}
                <button
                  type="button"
                  id="btn-student-file-correction"
                  onClick={() => setEditingStudent(loggedInStudent)}
                  className="px-4.5 py-3 bg-white border border-slate-200 text-slate-700 font-sans font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm hover:bg-slate-50 transition"
                >
                  <Plus className="w-4 h-4 text-slate-600" />
                  Revisi Biodata Langsung
                </button>
              </div>
            </div>

            {/* Comprehensive Student Profile Summary Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              
              {/* Left Column: Photo & Base Academic details */}
              <div className="lg:col-span-1 bg-white rounded-3xl border border-gray-150 p-6 shadow-sm space-y-6">
                <div className="flex flex-col items-center">
                  <div className="w-36 h-48 rounded-2xl border border-gray-200 overflow-hidden bg-slate-50 shadow-md relative group">
                    {loggedInStudent.foto ? (
                      <img
                        src={loggedInStudent.foto}
                        alt="Profil Siswa"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full flex flex-col items-center justify-center gap-2 ${loggedInStudent.personal.jenisKelamin === "Perempuan" ? "bg-rose-50 text-rose-400" : "bg-sky-50 text-sky-400"}`}>
                        <User className="w-10 h-10" />
                        <span className="text-[10px] font-mono text-gray-400">Pas Foto 3x4</span>
                      </div>
                    )}
                  </div>
                  <h3 className="font-sans font-extrabold text-slate-800 text-sm mt-3 text-center">
                    {loggedInStudent.personal.namaLengkap}
                  </h3>
                  <span className="text-xs text-gray-500 text-center block mt-0.5">
                    NISN: {loggedInStudent.personal.nisn} • NIS: {loggedInStudent.personal.nis}
                  </span>
                </div>

                <div className="border-t border-gray-100 pt-4.5 space-y-3 text-xs">
                  <h4 className="font-sans font-bold text-slate-850 uppercase text-[10px] text-gray-400 tracking-wider">Arsip Sekolah</h4>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Mulai Masuk:</span>
                    <span className="font-mono font-bold text-slate-800">{loggedInStudent.school.tanggalMasuk}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Beasiswa:</span>
                    <span className="font-semibold text-slate-800 text-right">{loggedInStudent.school.beasiswa || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status Buku Induk:</span>
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-full">
                      Terdaftar Aktif
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4.5 space-y-3 text-xs">
                  <h4 className="font-sans font-bold text-slate-855 uppercase text-[10px] text-gray-400 tracking-wider">Keterangan Kesehatan</h4>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Golongan Darah:</span>
                    <span className="font-mono font-bold text-slate-800">{loggedInStudent.health.golonganDarah}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tinggi & Berat:</span>
                    <span className="font-bold text-slate-800">{loggedInStudent.health.tinggiBadan} cm / {loggedInStudent.health.beratBadan} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Catatan/Alergi:</span>
                    <span className="font-semibold text-slate-800 text-right max-w-[155px] truncate" title={loggedInStudent.health.penyakitPernahDiderita}>
                      {loggedInStudent.health.penyakitPernahDiderita || "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Columns: Main Biodata sheets overview */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Profile detail cards */}
                <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm space-y-6">
                  <h3 className="font-sans font-bold text-slate-800 text-sm border-b border-gray-100 pb-2.5 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-600" /> Ringkasan Informasi Terdaftar Anda
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-xs font-sans">
                    <div>
                      <span className="text-gray-400 font-semibold block uppercase text-[10px] tracking-wide mb-0.5">Nama Lengkap</span>
                      <p className="font-bold text-slate-850 p-1.5 bg-gray-55/40 border border-gray-150 rounded-lg">{loggedInStudent.personal.namaLengkap}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 font-semibold block uppercase text-[10px] tracking-wide mb-0.5">Tempat & Tanggal Lahir</span>
                      <p className="font-semibold text-slate-800 p-1.5 bg-gray-55/45 border border-gray-150 rounded-lg">
                        {loggedInStudent.personal.tempatLahir}, {loggedInStudent.personal.tanggalLahir}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400 font-semibold block uppercase text-[10px] tracking-wide mb-0.5">Agama & Kewarganegaraan</span>
                      <p className="font-semibold text-slate-800 p-1.5 bg-gray-55/45 border border-gray-150 rounded-lg">
                        {loggedInStudent.personal.agama} • {loggedInStudent.personal.kewarganegaraan}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400 font-semibold block uppercase text-[10px] tracking-wide mb-0.5">Kontak Rumah / HP</span>
                      <p className="font-mono font-bold text-slate-800 p-1.5 bg-gray-55/45 border border-gray-150 rounded-lg">{loggedInStudent.address.telepon}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-gray-400 font-semibold block uppercase text-[10px] tracking-wide mb-0.5">ALAMAT DOMISILI TERCATAT</span>
                      <p className="font-semibold text-slate-800 p-2.5 bg-slate-50 border border-gray-150 rounded-xl leading-relaxed">{loggedInStudent.address.alamatLengkap}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 font-semibold block uppercase text-[10px] tracking-wide mb-0.5">Orang Tua: Sembilan Ayah</span>
                      <p className="font-bold text-slate-800 p-1.5 bg-gray-55/45 border border-gray-150 rounded-lg">
                        {loggedInStudent.parents.ayah.nama} ({loggedInStudent.parents.ayah.isMasihHidup ? "Hidup" : "Almarhum"})
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400 font-semibold block uppercase text-[10px] tracking-wide mb-0.5">Orang Tua: Sembilan Ibu</span>
                      <p className="font-bold text-slate-800 p-1.5 bg-gray-55/45 border border-gray-150 rounded-lg">
                        {loggedInStudent.parents.ibu.nama} ({loggedInStudent.parents.ibu.isMasihHidup ? "Hidup" : "Almarhum"})
                      </p>
                    </div>
                  </div>
                </div>

                {/* History of changes requested by this student */}
                <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm space-y-4">
                  <h3 className="font-sans font-bold text-slate-900 text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-500" />
                    Status Riwayat Pengajuan Perbaikan Data Anda
                  </h3>

                  {requests.filter((r) => r.studentId === loggedInStudent.id).length > 0 ? (
                    <div className="space-y-3.5">
                      {requests
                        .filter((r) => r.studentId === loggedInStudent.id)
                        .map((req) => (
                          <div key={req.id} className="p-4 bg-slate-55 border border-gray-200 rounded-2xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-none">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-slate-800 underline uppercase text-[10px] tracking-wide">{req.fieldLabel}</span>
                                <span className="text-[10px] text-gray-450 font-mono italic">({req.requestDate})</span>
                              </div>
                              <p className="text-gray-600 leading-snug">
                                Merevisi semula: <span className="font-mono bg-white p-0.5 px-1 border border-gray-200 rounded text-red-700 font-semibold line-through">"{req.oldValue || '-'}"</span> menjadi <span className="font-mono bg-white p-0.5 px-1 border border-gray-200 rounded text-blue-800 font-bold">"{req.newValue}"</span>
                              </p>
                              {req.notes && (
                                <p className="text-[11px] text-gray-500 italic bg-white border border-gray-100 p-2 rounded-xl mt-1">
                                  <strong>Feedback Staf:</strong> "{req.notes}"
                                </p>
                              )}
                            </div>

                            <span className="shrink-0 self-start sm:self-center">
                              {req.status === "Diproses" ? (
                                <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                                  <Clock className="w-3 h-3 animate-spin" />
                                  Diproses
                                </span>
                              ) : req.status === "Disetujui" ? (
                                <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  Revisi Selesai
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                                  <XCircle className="w-3 h-3" />
                                  Ditolak
                                </span>
                              )}
                            </span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic p-4 bg-gray-50 border border-gray-150 rounded-2xl text-center">
                      Anda belum pernah mengajukan revisi data apapun. Saat ini seluruh e-Berkas Anda sinkron dan mutlak di database sekolah.
                    </p>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* FOOTER - HIDE ON PRINT */}
      <footer className="bg-slate-900 text-slate-400 py-6 text-center text-xs mt-auto border-t border-slate-800 print:hidden">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-sans font-semibold">Aplikasi Buku Induk Kesiswaan • Kementerian Pendidikan, Riset, dan Teknologi RI</p>
          <p className="text-[10px] text-gray-500 font-mono">Digarap Sesuai Lampiran Peraturan Menteri untuk Verifikasi Kelulusan Rapor Nasional & Ijazah.</p>
        </div>
      </footer>

      {/* ========================================================= */}
      {/* INTERACTIVE MODAL PORTALS OVERLAYS                        */}
      {/* ========================================================= */}

      {/* 1. PRINT DIALOG PREVIEW OVERLAY */}
      {selectedStudentForPrint && (
        <StudentPrintView
          student={selectedStudentForPrint}
          onClose={() => setSelectedStudentForPrint(null)}
        />
      )}

      {/* 2. ADMIN EDIT STUDENT FORM DIALOG */}
      {(isAddingStudent || editingStudent) && (
        <StudentForm
          student={editingStudent || undefined}
          onSave={handleCreateOrUpdateStudent}
          onClose={() => {
            setEditingStudent(null);
            setIsAddingStudent(false);
          }}
        />
      )}

      {/* 3. STUDENT CORRECTION COMPILER REQUEST */}
      {isFilingRequestModal && loggedInStudent && (
        <CorrectionRequestModal
          student={loggedInStudent}
          onSubmit={handleAddRequestFromStudent}
          onClose={() => setIsFilingRequestModal(false)}
        />
      )}

      {/* 4. EXCEL DATABASE IMPORTER */}
      <ExcelImporterModal
        isOpen={isImportExcelOpen}
        onClose={() => setIsImportExcelOpen(false)}
        onImport={handleImportStudents}
      />

      {/* 4. TOAST ALERTS DIALOG */}
      {toast && (
        <div id="toast-registry-system" className="fixed bottom-5 right-5 z-50 animate-bounce-in max-w-sm p-4 bg-white border border-slate-200 rounded-2xl shadow-xl flex items-start gap-3 border-l-4 border-l-blue-600">
          <div className={`p-1.5 rounded-lg text-white ${toast.type === "success" ? "bg-blue-600" : toast.type === "warning" ? "bg-amber-500" : "bg-blue-600"}`}>
            {toast.type === "success" ? <CheckCircle className="w-5 h-5" /> : toast.type === "warning" ? <AlertCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          </div>
          <div className="flex-1">
            <h5 className="font-sans font-bold text-xs text-slate-800">Sistem Buku Induk</h5>
            <p className="text-slate-600 text-[11px] mt-0.5 leading-snug font-semibold">{toast.message}</p>
          </div>
          <button onClick={() => setToast(null)} className="p-0.5 hover:bg-slate-100 rounded text-slate-400">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
}
