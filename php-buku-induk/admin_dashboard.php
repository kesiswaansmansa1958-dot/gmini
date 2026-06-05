<?php
require_once 'config.php';

// Proteksi Halaman Admin
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'ADMIN') {
    redirect('login.php');
}

// Handle Toggle Print Permission Action
if (isset($_GET['action']) && $_GET['action'] === 'toggle_print' && isset($_GET['student_id'])) {
    $student_id = (int)$_GET['student_id'];
    // Ambil data status sekarang
    $stmt = $db->prepare("SELECT allow_print, nama_lengkap FROM students WHERE id = ?");
    $stmt->execute([$student_id]);
    $student = $stmt->fetch();
    if ($student) {
        $new_status = $student['allow_print'] ? 0 : 1;
        $up_stmt = $db->prepare("UPDATE students SET allow_print = ? WHERE id = ?");
        $up_stmt->execute([$new_status, $student_id]);
        
        $msg = $new_status ? "Izin cetak mandiri untuk {$student['nama_lengkap']} berhasil DIKATIFKAN!" : "Izin cetak mandiri untuk {$student['nama_lengkap']} berhasil DINONAKTIFKAN!";
        set_flash_message($msg, $new_status ? 'success' : 'warning');
    }
    redirect('admin_dashboard.php');
}

// Handle Delete Student Action
if (isset($_GET['action']) && $_GET['action'] === 'delete_student' && isset($_GET['student_id'])) {
    $student_id = (int)$_GET['student_id'];
    $stmt = $db->prepare("SELECT nama_lengkap FROM students WHERE id = ?");
    $stmt->execute([$student_id]);
    $student = $stmt->fetch();
    if ($student) {
        $del_stmt = $db->prepare("DELETE FROM students WHERE id = ?");
        $del_stmt->execute([$student_id]);
        set_flash_message("Siswa {$student['nama_lengkap']} berhasil dihapus dari Buku Induk.", "danger");
    }
    redirect('admin_dashboard.php');
}

// Handle Approve / Reject Correction Request (Individual or Bulk per Student)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && (isset($_POST['action_request']) || isset($_POST['action_request_bulk']))) {
    $allowed_fields = [
        'nama_lengkap', 'nama_panggilan', 'nis', 'nisn', 'nik', 'no_pendaftaran', 'no_kk', 'no_kip', 'id_dtks',
        'jenis_kelamin', 'tempat_lahir', 'tanggal_lahir', 'agama', 'kewarganegaraan', 'anak_ke', 'saudara_kandung',
        'saudara_tiri', 'saudara_angkat', 'saudara_kembar', 'anak_yatim_piatu', 'status_keluarga', 'bahasa_sehari_hari',
        'alamat_lengkap', 'telepon', 'tinggal_dengan', 'jarak_ke_sekolah', 'transportasi',
        'golongan_darah', 'penyakit_pernah_diderita', 'kelainan_jasmani', 'tinggi_badan', 'berat_badan',
        'lulusan_dari', 'tanggal_ijazah', 'nomor_ijazah', 'pindahan_dari', 'alasan_pindah', 'lama_belajar',
        'rerata_agama', 'rerata_ppkn', 'rerata_b_indonesia', 'rerata_matematika', 'rerata_ipa', 'rerata_ips', 'rerata_b_inggris',
        'prestasi_akademik', 'prestasi_non_akademik', 'kelas_sekarang', 'program_keahlian', 'nomor_stb', 'beasiswa', 'tanggal_masuk',
        'tanggal_keluar', 'alasan_keluar', 'kesenian', 'olahraga', 'organisasi',
        'ayah_nama', 'ayah_nik', 'ayah_tempat_lahir', 'ayah_tanggal_lahir', 'ayah_agama', 'ayah_kewarganegaraan', 'ayah_pendidikan', 'ayah_pekerjaan', 'ayah_penghasilan', 'ayah_alamat', 'ayah_telepon', 'ayah_is_masih_hidup',
        'ibu_nama', 'ibu_nik', 'ibu_tempat_lahir', 'ibu_tanggal_lahir', 'ibu_agama', 'ibu_kewarganegaraan', 'ibu_pendidikan', 'ibu_pekerjaan', 'ibu_penghasilan', 'ibu_alamat', 'ibu_telepon', 'ibu_is_masih_hidup',
        'has_wali', 'wali_nama', 'wali_nik', 'wali_tempat_lahir', 'wali_tanggal_lahir', 'wali_agama', 'wali_kewarganegaraan', 'wali_pendidikan', 'wali_pekerjaan', 'wali_penghasilan', 'wali_alamat', 'wali_telepon', 'wali_hubungan_siswa'
    ];

    if (isset($_POST['action_request'])) {
        $req_id = (int)$_POST['request_id'];
        $decision = $_POST['decision'] ?? ''; // 'approve' or 'reject'
        $notes = trim($_POST['notes'] ?? '');

        $stmt = $db->prepare("SELECT * FROM correction_requests WHERE id = ?");
        $stmt->execute([$req_id]);
        $req = $stmt->fetch();

        if ($req && $req['status'] === 'Diproses') {
            if ($decision === 'approve') {
                $field_name = $req['field_name'];
                $new_val = $req['new_value'];
                
                if (in_array($field_name, $allowed_fields)) {
                    $up_stud = $db->prepare("UPDATE students SET `{$field_name}` = ? WHERE id = ?");
                    $up_stud->execute([$new_val, $req['student_id']]);
                }
                
                $up_req = $db->prepare("UPDATE correction_requests SET status = 'Disetujui', notes = ? WHERE id = ?");
                $up_req->execute([$notes ?: 'Disetujui oleh Administrator', $req_id]);
                set_flash_message("Usulan revisi '{$req['field_label']}' berhasil DISETUJUI dan diterapkan.", "success");
                
            } elseif ($decision === 'reject') {
                $up_req = $db->prepare("UPDATE correction_requests SET status = 'Ditolak', notes = ? WHERE id = ?");
                $up_req->execute([$notes ?: 'Ditolak oleh Administrator', $req_id]);
                set_flash_message("Usulan revisi '{$req['field_label']}' berhasil DITOLAK.", "warning");
            }
        }
    }

    if (isset($_POST['action_request_bulk'])) {
        $student_id = (int)$_POST['student_id'];
        $decision = $_POST['decision'] ?? ''; // 'approve_all' or 'reject_all'
        $notes = trim($_POST['notes'] ?? '');

        $stmt = $db->prepare("SELECT * FROM correction_requests WHERE student_id = ? AND status = 'Diproses'");
        $stmt->execute([$student_id]);
        $pending_items = $stmt->fetchAll();

        if (!empty($pending_items)) {
            if ($decision === 'approve_all') {
                $success_count = 0;
                foreach ($pending_items as $item) {
                    $field_name = $item['field_name'];
                    $new_val = $item['new_value'];
                    
                    if (in_array($field_name, $allowed_fields)) {
                        $up_stud = $db->prepare("UPDATE students SET `{$field_name}` = ? WHERE id = ?");
                        $up_stud->execute([$new_val, $student_id]);
                        $success_count++;
                    }
                    
                    $up_req = $db->prepare("UPDATE correction_requests SET status = 'Disetujui', notes = ? WHERE id = ?");
                    $up_req->execute([$notes ?: 'Disetujui secara massal', $item['id']]);
                }
                set_flash_message("Semua ({$success_count}) usulan revisi siswa berhasil DISETUJUI dan langsung diterapkan.", "success");
            } elseif ($decision === 'reject_all') {
                $reject_count = 0;
                foreach ($pending_items as $item) {
                    $up_req = $db->prepare("UPDATE correction_requests SET status = 'Ditolak', notes = ? WHERE id = ?");
                    $up_req->execute([$notes ?: 'Ditolak secara massal', $item['id']]);
                    $reject_count++;
                }
                set_flash_message("Semua ({$reject_count}) usulan revisi siswa berhasil DITOLAK.", "warning");
            }
        }
    }
    redirect('admin_dashboard.php?tab=pengajuan_revisi');
}

// Ambil tab aktif (Default: daftar_siswa)
$current_tab = $_GET['tab'] ?? 'daftar_siswa';

// Ambil filter pencarian
$search = trim($_GET['search'] ?? '');
$filter_kelas = trim($_GET['kelas'] ?? '');

// Ambil data siswa
$students_query = "SELECT * FROM students WHERE 1=1";
$params = [];
if (!empty($search)) {
    $students_query .= " AND (nama_lengkap LIKE ? OR nisn LIKE ? OR nis LIKE ?)";
    $params[] = "%$search%";
    $params[] = "%$search%";
    $params[] = "%$search%";
}
if (!empty($filter_kelas)) {
    $students_query .= " AND kelas_sekarang = ?";
    $params[] = $filter_kelas;
}
$students_query .= " ORDER BY nama_lengkap ASC";
$stmt = $db->prepare($students_query);
$stmt->execute($params);
$students = $stmt->fetchAll();

// Ambil semua kelas unik untuk filter dropdown
$kelas_stmt = $db->query("SELECT DISTINCT kelas_sekarang FROM students WHERE kelas_sekarang IS NOT NULL ORDER BY kelas_sekarang ASC");
$list_kelas = $kelas_stmt->fetchAll(PDO::FETCH_COLUMN);

// Ambil data koreksi pengajuan revisi
$req_stmt = $db->query("SELECT r.*, s.nama_lengkap as student_fullname FROM correction_requests r JOIN students s ON r.student_id = s.id ORDER BY r.request_date DESC");
$requests = $req_stmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard Staf TU Buku Induk | SMAN 1 Purwokerto</title>
    <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <style>
        body { font-family: "Inter", sans-serif; background-color: #f8fafc; }
    </style>
</head>
<body class="min-h-screen bg-slate-50 flex flex-col justify-between">

    <!-- Header Navigation Section -->
    <header class="bg-slate-900 text-white py-4 px-6 border-b border-slate-800 shadow-sm print:hidden">
        <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-sm shadow-md shadow-blue-500/20 text-white">S1</div>
                <div>
                    <h1 class="text-xs font-black tracking-wider uppercase text-slate-100">Buku Induk Kesiswaan</h1>
                    <p class="text-[9px] text-gray-400 font-medium">Panel Administrator Staf Tata Usaha</p>
                </div>
            </div>
            
            <div class="flex items-center gap-4">
                <div class="text-right">
                    <p class="text-[11px] font-bold text-slate-200">Hi, <?= esc($_SESSION['admin_username']) ?></p>
                    <p class="text-[9px] text-emerald-400 font-mono font-bold flex items-center justify-end gap-1">
                        <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>AKTIF
                    </p>
                </div>
                <!-- Logout Button -->
                <a href="logout.php" onclick="return confirm('Apakah Anda yakin ingin keluar dari sistem?')" class="p-2 bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-450 border border-slate-700 hover:border-rose-900 rounded-xl transition flex items-center gap-1.5 text-xs font-bold">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                    <span>Log Out</span>
                </a>
            </div>
        </div>
    </header>

    <!-- Main Core Container -->
    <main class="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 py-8">
        
        <!-- Flash Alert Messages -->
        <?php display_flash_message(); ?>

        <!-- Welcome Info Card / Header -->
        <div class="mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-5 bg-white border border-gray-200 rounded-3xl shadow-sm">
            <div class="flex items-center gap-3.5">
                <div class="p-2.5 bg-blue-50 text-blue-600 rounded-2xl shrink-0">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                </div>
                <div>
                    <h2 class="text-md font-black text-slate-800">Manajemen Lembar Buku Induk Murid Baru</h2>
                    <p class="text-[11px] text-gray-400 font-sans font-semibold">Tahun Pelajaran 2026/2027 &middot; SMA Negeri 1 Purwokerto</p>
                </div>
            </div>
            
            <div class="flex items-center gap-2">
                <a href="admin_edit.php" class="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/15">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path></svg>
                    <span>Daftarkan Siswa Baru</span>
                </a>
            </div>
        </div>

        <!-- Tab Switching Component Navigation -->
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 border-b border-gray-200 pb-4">
            <div class="flex bg-gray-100 p-1 rounded-2xl border border-gray-200 shadow-inner">
                <a href="?tab=daftar_siswa" 
                    class="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 <?= $current_tab === 'daftar_siswa' ? 'bg-white text-slate-800 shadow-sm' : 'text-gray-500 hover:text-gray-900' ?>">
                    <span>Daftar Siswa</span>
                    <span class="p-0.5 px-1.5 bg-blue-50 text-blue-600 text-[9px] rounded-full font-black"><?= count($students) ?></span>
                </a>
                <a href="?tab=pengajuan_revisi" 
                    class="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 <?= $current_tab === 'pengajuan_revisi' ? 'bg-white text-slate-800 shadow-sm' : 'text-gray-500 hover:text-gray-900' ?>">
                    <span>Pengajuan Revisi</span>
                    <?php 
                        $pending_count = count(array_filter($requests, function($r) { return $r['status'] === 'Diproses'; }));
                        if ($pending_count > 0): 
                    ?>
                        <span class="p-0.5 px-1.5 bg-rose-100 text-rose-600 text-[9px] rounded-full font-black animate-pulse"><?= $pending_count ?></span>
                    <?php endif; ?>
                </a>
                <a href="?tab=ubah_password" 
                    class="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 <?= $current_tab === 'ubah_password' ? 'bg-white text-slate-800 shadow-sm' : 'text-gray-500 hover:text-gray-900' ?>">
                    <span>Ubah Password</span>
                </a>
            </div>
        </div>

        <!-- Tab 1: DAFTAR SISWA -->
        <?php if ($current_tab === 'daftar_siswa'): ?>
            <!-- Search & Filter bar -->
            <form method="GET" class="mb-5 grid grid-cols-1 md:grid-cols-12 gap-3 bg-white p-4 rounded-3xl border border-gray-150 shadow-sm">
                <input type="hidden" name="tab" value="daftar_siswa">
                <div class="md:col-span-6 relative">
                    <input type="text" name="search" value="<?= esc($search) ?>" placeholder="Cari nama lengkap, NISN, atau NIS..." class="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs font-bold font-sans focus:outline-none focus:border-blue-500">
                    <svg class="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                <div class="md:col-span-4">
                    <select name="kelas" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500">
                        <option value="">-- Semua Kelas --</option>
                        <?php foreach ($list_kelas as $kls): ?>
                            <option value="<?= esc($kls) ?>" <?= $filter_kelas === $kls ? 'selected' : '' ?>><?= esc($kls) ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="md:col-span-2 flex gap-2">
                    <button type="submit" class="flex-1 py-1 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold text-center transition flex items-center justify-center gap-1 cursor-pointer">
                        Cari
                    </button>
                    <?php if (!empty($search) || !empty($filter_kelas)): ?>
                        <a href="admin_dashboard.php" class="py-1 px-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-bold text-center transition flex items-center justify-center cursor-pointer">
                            Reset
                        </a>
                    <?php endif; ?>
                </div>
            </form>

            <!-- Students List Table Component -->
            <div class="bg-white border border-gray-150 rounded-3xl overflow-hidden shadow-sm">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse text-xs font-sans">
                        <thead class="bg-slate-50 border-b border-gray-150 font-bold uppercase tracking-wider text-slate-500 text-[10px]">
                            <tr>
                                <th class="py-3.5 px-4 text-center w-12">No</th>
                                <th class="py-3.5 px-4 w-52">Nama Lengkap</th>
                                <th class="py-3.5 px-4 w-32">Identitas (NISN / NIS)</th>
                                <th class="py-3.5 px-4 w-28">Kelas saat ini</th>
                                <th class="py-3.5 px-4 text-center w-36">Izin Cetak Siswa</th>
                                <th class="py-3.5 px-4 text-center w-48">Aksi Berkas</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-150 text-slate-700">
                            <?php if (empty($students)): ?>
                                <tr>
                                    <td colspan="6" class="py-12 text-center text-gray-400 font-bold">
                                        Data Siswa tidak ditemukan atau Buku Induk kosong.
                                    </td>
                                endforeach;
                            <?php else: $no = 1; foreach ($students as $stud): ?>
                                <tr class="hover:bg-slate-50/50 transition">
                                    <td class="py-3 px-4 font-mono font-bold text-center text-slate-400"><?= $no++ ?></td>
                                    <td class="py-3 px-4">
                                        <div class="flex items-center gap-3">
                                            <?php if ($stud['foto']): ?>
                                                <img src="<?= $stud['foto'] ?>" class="w-8 h-8 rounded-full border border-gray-200 object-cover shrink-0">
                                            <?php else: ?>
                                                <div class="w-8 h-8 rounded-full bg-slate-100 text-slate-400 font-black flex items-center justify-center shrink-0 border border-gray-200 uppercase text-[9px]">
                                                    <?= substr($stud['nama_lengkap'], 0, 2) ?>
                                                </div>
                                            <?php endif; ?>
                                            <div>
                                                <span class="font-bold text-slate-900 block leading-tight"><?= esc($stud['nama_lengkap']) ?></span>
                                                <span class="text-[10px] text-gray-400 mt-0.5 block leading-none font-medium"><?= $stud['jenis_kelamin'] ?> &middot; TTL: <?= esc($stud['tempat_lahir']) ?>, <?= format_indo_date($stud['tanggal_lahir']) ?></span>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="py-3 px-4">
                                        <span class="font-bold text-slate-800 font-mono block leading-tight text-[11px]">NISN: <?= esc($stud['nisn']) ?></span>
                                        <span class="text-[10px] text-gray-400 font-mono block mt-0.5 leading-none">NIS: <?= esc($stud['nis'] ?: '-') ?></span>
                                    </td>
                                    <td class="py-3 px-4">
                                        <span class="px-2 py-0.5 bg-blue-50 border border-blue-105 text-blue-700 text-[10px] font-bold rounded-lg font-mono">
                                            <?= esc($stud['kelas_sekarang'] ?: 'X') ?>
                                        </span>
                                    </td>
                                    <td class="py-3 px-4 text-center">
                                        <?php if ($stud['allow_print']): ?>
                                            <a href="?action=toggle_print&student_id=<?= $stud['id'] ?>" class="inline-flex items-center gap-1.5 p-1 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-full text-[10px] font-bold text-emerald-700 transition" title="Klik untuk menonaktifkan">
                                                <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                                <span>Aktif (Isi/Cetak)</span>
                                            </a>
                                        <?php else: ?>
                                            <a href="?action=toggle_print&student_id=<?= $stud['id'] ?>" class="inline-flex items-center gap-1.5 p-1 px-3 bg-slate-150 hover:bg-slate-200 border border-slate-200 rounded-full text-[10px] font-bold text-slate-600 transition" title="Klik untuk mengaktifkan">
                                                <span class="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                                                <span>Nonaktif</span>
                                            </a>
                                        <?php endif; ?>
                                    </td>
                                    <td class="py-3 px-4">
                                        <div class="flex items-center justify-center gap-1.5">
                                            <a href="print_view.php?student_id=<?= $stud['id'] ?>&doc=BUKU_INDUK" target="_blank" class="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition" title="Cetak Buku Induk">
                                                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                                            </a>
                                            <a href="admin_edit.php?id=<?= $stud['id'] ?>" class="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition" title="Edit Biodata">
                                                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                            </a>
                                            <a href="?action=delete_student&student_id=<?= $stud['id'] ?>" onclick="return confirm('Apakah Anda yakin ingin menghapus siswa kesiswaan <?= htmlspecialchars($stud['nama_lengkap']) ?> secara permanen dari buku induk sekolah?')" class="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition" title="Hapus Permanen">
                                                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                            <?php endforeach; endif; ?>
                        </tbody>
                    </table>
                </div>
            </div>

        <!-- Tab 2: PENGAJUAN REVISI -->
        <?php elseif ($current_tab === 'pengajuan_revisi'): ?>
            <div class="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm">
                <div class="flex items-center gap-2 mb-6 border-b border-gray-100 pb-3">
                    <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 1 1 .512 1.353l-.041.02-.041-.02a.75.75 0 1 1 .512-1.353l.041.02ZM21 12c0 1.66-4.03 3-9 3s-9-1.34-9-3 4.03-3 9-3 9 1.34 9 3Zm0 3c0 1.66-4.03 3-9 3s-9-1.34-9-3M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3m0-3c0 1.66-4.03 3-9 3s-9-1.34-9-3"></path></svg>
                    <h3 class="font-bold text-slate-800 text-sm">Menunggu Persetujuan Koreksi Data Mandiri</h3>
                </div>

                <?php 
                    $pending_reqs = array_filter($requests, function($r) { return $r['status'] === 'Diproses'; });
                    
                    // Group pending requests by student ID
                    $student_groups = [];
                    foreach ($pending_reqs as $rq) {
                        $sid = $rq['student_id'];
                        if (!isset($student_groups[$sid])) {
                            // Find student avatar / class from the loaded students
                            $student_match = null;
                            foreach ($students as $s) {
                                if ((int)$s['id'] === (int)$sid) {
                                    $student_match = $s;
                                    break;
                                }
                            }
                            
                            $student_groups[$sid] = [
                                'id' => $sid,
                                'name' => $rq['student_fullname'],
                                'nisn' => $rq['student_nisn'] ?: ($student_match ? $student_match['nisn'] : ''),
                                'kelas' => $student_match ? ($student_match['kelas_sekarang'] ?: 'X') : 'X',
                                'foto' => $student_match ? $student_match['foto'] : null,
                                'items' => []
                            ];
                        }
                        $student_groups[$sid]['items'][] = $rq;
                    }

                    if (empty($student_groups)): 
                ?>
                    <div class="py-12 text-center text-gray-400 font-bold">
                        <svg class="w-10 h-10 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span>Sejauh ini tidak ada antrean usulan revisi data siswa yang membutuhkan tindakan verifikasi.</span>
                    </div>
                <?php else: ?>
                    <div class="space-y-6">
                        <?php foreach ($student_groups as $group): ?>
                            <div class="bg-slate-50 border border-gray-150 rounded-3xl p-5 space-y-4 shadow-sm">
                                <!-- Student Info Header Row -->
                                <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-200 pb-4">
                                    <div class="flex items-center gap-3">
                                        <?php if ($group['foto']): ?>
                                            <img src="<?= $group['foto'] ?>" class="w-10 h-10 rounded-full border border-gray-200 object-cover shrink-0">
                                        <?php else: ?>
                                            <div class="w-10 h-10 rounded-full bg-blue-105 text-blue-600 font-black flex items-center justify-center shrink-0 border border-blue-200 uppercase text-xs">
                                                <?= substr($group['name'], 0, 2) ?>
                                            </div>
                                        <?php endif; ?>
                                        <div>
                                            <h4 class="font-extrabold text-slate-900 text-xs leading-none mb-1.5"><?= esc($group['name']) ?></h4>
                                            <p class="text-[10.5px] text-gray-450 leading-none">
                                                Kelas <span class="font-bold text-blue-600 font-mono"><?= esc($group['kelas']) ?></span> &middot; 
                                                NISN <span class="font-bold font-mono text-slate-700"><?= esc($group['nisn']) ?></span>
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <!-- Bulk Actions for Student Block -->
                                    <div class="bg-white border border-gray-150 p-2.5 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-3 shrink-0 self-start lg:self-auto w-full lg:w-auto">
                                        <div class="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                            <span class="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                                            <span>Satu-Klik Massal (<?= count($group['items']) ?>):</span>
                                        </div>
                                        <form method="POST" class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                            <input type="hidden" name="action_request_bulk" value="1">
                                            <input type="hidden" name="student_id" value="<?= $group['id'] ?>">
                                            <input type="text" name="notes" placeholder="Catatan massal opsional..." class="px-2.5 py-1.5 border border-gray-200 rounded-xl text-[10.5px] font-medium w-full sm:w-44 focus:outline-none focus:border-blue-500">
                                            <div class="flex gap-1.5">
                                                <button type="submit" name="decision" value="reject_all" class="flex-1 sm:flex-none px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-bold transition flex items-center justify-center cursor-pointer shadow-sm shadow-rose-600/10">
                                                    Tolak Semua
                                                </button>
                                                <button type="submit" name="decision" value="approve_all" class="flex-1 sm:flex-none px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold transition flex items-center justify-center cursor-pointer shadow-sm shadow-emerald-600/10">
                                                    Setujui Semua
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>

                                <!-- Requested Fields Content Grid -->
                                <div class="overflow-hidden bg-white border border-gray-150 rounded-2xl shadow-xs">
                                    <div class="overflow-x-auto">
                                        <table class="w-full text-left border-collapse text-[11px] font-sans">
                                            <thead class="bg-slate-50 border-b border-gray-150 font-bold uppercase tracking-wider text-slate-400 text-[9px]">
                                                <tr>
                                                    <th class="py-2.5 px-3.5 w-1/4">Elemen Data</th>
                                                    <th class="py-2.5 px-3.5 w-1/3">Nilai Lama (Database)</th>
                                                    <th class="py-2.5 px-3.5 w-1/3">Usulan Baru</th>
                                                    <th class="py-2.5 px-3.5 text-right">Tindakan Admin</th>
                                                </tr>
                                            </thead>
                                            <tbody class="divide-y divide-gray-100 text-slate-700">
                                                <?php foreach ($group['items'] as $item): ?>
                                                    <tr class="hover:bg-slate-50/20 transition">
                                                        <td class="py-3 px-3.5">
                                                            <span class="font-bold text-slate-800 block"><?= esc($item['field_label']) ?></span>
                                                            <span class="text-[9px] text-gray-400 font-mono block mt-0.5"><?= esc($item['field_name']) ?></span>
                                                        </td>
                                                        <td class="py-3 px-3.5">
                                                            <div class="text-rose-800 bg-rose-50/50 border border-rose-100 px-2.5 py-1.5 rounded-xl font-mono text-[10.5px] break-all max-w-[280px]">
                                                                <span class="line-through"><?= esc($item['old_value'] ?: '(Kosong)') ?></span>
                                                            </div>
                                                        </td>
                                                        <td class="py-3 px-3.5">
                                                            <div class="text-emerald-800 bg-emerald-50/50 border border-emerald-100 px-2.5 py-1.5 rounded-xl font-mono font-bold text-[10.5px] break-all max-w-[280px]">
                                                                <span><?= esc($item['new_value'] ?: '(Kosong)') ?></span>
                                                            </div>
                                                        </td>
                                                        <td class="py-3 px-3.5">
                                                            <form method="POST" class="flex items-center justify-end gap-1.5">
                                                                <input type="hidden" name="action_request" value="1">
                                                                <input type="hidden" name="request_id" value="<?= $item['id'] ?>">
                                                                <input type="text" name="notes" placeholder="Alasan penolakan..." class="px-2 py-1 border border-gray-200 rounded-lg text-[10px] w-32 focus:outline-none focus:border-blue-500 font-medium">
                                                                <div class="flex items-center gap-1 shrink-0">
                                                                    <button type="submit" name="decision" value="reject" class="p-1 px-2.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded-lg text-[9.5px] font-bold border border-rose-100 transition cursor-pointer" title="Tolak Usulan">
                                                                        Tolak
                                                                    </button>
                                                                    <button type="submit" name="decision" value="approve" class="p-1 px-2.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white rounded-lg text-[9.5px] font-bold border border-emerald-100 transition cursor-pointer" title="Setujui Usulan">
                                                                        Setujui
                                                                    </button>
                                                                </div>
                                                            </form>
                                                        </td>
                                                    </tr>
                                                <?php endforeach; ?>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>

                <!-- Histori Riwayat Koreksi -->
                <div class="mt-8 border-t border-gray-100 pt-6">
                    <h4 class="font-bold text-slate-800 text-xs mb-3 flex items-center gap-1">
                        <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span>Arsip Riwayat Pengajuan Evaluasi</span>
                    </h4>
                    
                    <div class="overflow-x-auto border border-gray-150 rounded-2xl">
                        <table class="w-full text-left border-collapse text-[11px]">
                            <thead class="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider text-[9px] border-b border-gray-150">
                                <tr>
                                    <th class="py-3 px-4">Siswa</th>
                                    <th class="py-3 px-4">Elemen / Kolom</th>
                                    <th class="py-3 px-4">Usulan Nilai Baru</th>
                                    <th class="py-3 px-4 text-center">Status Aturan</th>
                                    <th class="py-3 px-4">Komentar / Catatan</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-150 text-slate-700">
                                <?php 
                                    $processed_reqs = array_filter($requests, function($r) { return $r['status'] !== 'Diproses'; });
                                    if (empty($processed_reqs)): 
                                ?>
                                    <tr>
                                        <td colspan="5" class="py-6 text-center text-gray-400 font-medium font-sans">Belum ada riwayat pengajuan yang diselesaikan.</td>
                                    </tr>
                                <?php else: foreach ($processed_reqs as $rq): ?>
                                    <tr>
                                        <td class="py-2.5 px-4 font-bold text-slate-900"><?= esc($rq['student_fullname']) ?></td>
                                        <td class="py-2.5 px-4"><?= esc($rq['field_label']) ?></td>
                                        <td class="py-2.5 px-4 font-mono font-medium text-slate-600"><?= esc($rq['new_value']) ?></td>
                                        <td class="py-2.5 px-4 text-center">
                                            <?php if ($rq['status'] === 'Disetujui'): ?>
                                                <span class="p-0.5 px-2 bg-emerald-100 text-emerald-800 rounded-full font-black text-[9px]">DISETUJUI</span>
                                            <?php else: ?>
                                                <span class="p-0.5 px-2 bg-rose-100 text-rose-800 rounded-full font-black text-[9px]">DITOLAK</span>
                                            <?php endif; ?>
                                        </td>
                                        <td class="py-2.5 px-4 italic text-gray-500 text-[10.5px]"><?= esc($rq['notes'] ?: '-') ?></td>
                                    </tr>
                                <?php endforeach; endif; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        <!-- Tab 3: UBAH SECURITY PASSWORD (REDIRECT/CONTAINER) -->
        <?php elseif ($current_tab === 'ubah_password'): ?>
            <!-- Menampilkan secara sejalan, atau redirect ke admin_security.php -->
            <div class="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm max-w-md mx-auto text-center space-y-4">
                <div class="p-3 bg-blue-50 text-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </div>
                <h3 class="font-bold text-slate-800 text-sm">Masuk ke Halaman Pengaturan Keamanan</h3>
                <p class="text-[11px] text-gray-400 font-medium font-sans">Diperlukan verifikasi kredensial saat ini untuk mengamankan data rahasia buku induk dari akses ilegal.</p>
                <a href="admin_security.php" class="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-500/10 cursor-pointer">
                    Buka Pengaturan Keamanan
                </a>
            </div>
        <?php endif; ?>

    </main>

    <!-- Footer -->
    <footer class="bg-slate-900 text-slate-400 py-6 text-center text-xs border-t border-slate-800 print:hidden mt-12">
        <p>&copy; <?= date('Y') ?> SMA Negeri 1 Purwokerto. Hak Cipta Dilindungi.</p>
    </footer>

</body>
</html>
