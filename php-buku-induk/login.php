<?php
require_once 'config.php';

// Jika sudah masuk, langsung arahkan ke dashboard yang sesuai
if (isset($_SESSION['role'])) {
    if ($_SESSION['role'] === 'ADMIN') {
        redirect('admin_dashboard.php');
    } elseif ($_SESSION['role'] === 'SISWA') {
        redirect('student_dashboard.php');
    }
}

$error_message = null;

// Handle Form Submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? 'siswa';

    if ($action === 'admin') {
        $username = trim($_POST['username'] ?? '');
        $password = trim($_POST['password'] ?? '');

        if (!empty($username) && !empty($password)) {
            $stmt = $db->prepare("SELECT * FROM admin_users WHERE username = ?");
            $stmt->execute([$username]);
            $admin = $stmt->fetch();

            if ($admin && password_verify($password, $admin['password'])) {
                $_SESSION['role'] = 'ADMIN';
                $_SESSION['admin_id'] = $admin['id'];
                $_SESSION['admin_username'] = $admin['username'];
                
                set_flash_message("Selamat datang kembali, Administrator TU!", "success");
                redirect('admin_dashboard.php');
            } else {
                $error_message = "Username atau Password Admin salah! Silakan coba lagi.";
            }
        } else {
            $error_message = "Semua kolom admin wajib diisi!";
        }
    } else {
        // Siswa Login
        $nisn = trim($_POST['nisn'] ?? '');
        $dob = trim($_POST['dob'] ?? '');

        if (!empty($nisn) && !empty($dob)) {
            $stmt = $db->prepare("SELECT * FROM students WHERE nisn = ? AND tanggal_lahir = ?");
            $stmt->execute([$nisn, $dob]);
            $student = $stmt->fetch();

            if ($student) {
                $_SESSION['role'] = 'SISWA';
                $_SESSION['student_id'] = $student['id'];
                $_SESSION['student_nisn'] = $student['nisn'];
                $_SESSION['student_name'] = $student['nama_lengkap'];
                
                set_flash_message("Selamat datang, " . $student['nama_lengkap'] . "!", "success");
                redirect('student_dashboard.php');
            } else {
                $error_message = "NISN atau Tanggal Lahir tidak cocok! Silakan periksa kembali data Anda.";
            }
        } else {
            $error_message = "Semua kolom siswa wajib diisi!";
        }
    }
}

$active_tab = $_POST['action'] ?? 'siswa';
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Akses Buku Induk Kesiswaan | SMAN 1 Purwokerto</title>
    <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: "Inter", sans-serif;
            background-color: #f8fafc;
        }
        .font-mono {
            font-family: "JetBrains Mono", monospace;
        }
    </style>
</head>
<body class="min-h-screen bg-slate-50 flex flex-col justify-between">

    <!-- Header / Banner -->
    <header class="bg-slate-900 text-white py-4 px-6 border-b border-slate-800 shadow-sm">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-sm tracking-wider shadow-md shadow-blue-500/20 text-white">
                    S1
                </div>
                <div>
                    <h1 class="text-xs font-black tracking-wider uppercase text-slate-100">Buku Induk Digital</h1>
                    <p class="text-[9px] text-gray-400 font-medium">SMA Negeri 1 Purwokerto</p>
                </div>
            </div>
            <div class="text-[10px] text-slate-400 font-mono text-right hidden sm:block">
                Sistem Informasi Kesiswaan v1.2
            </div>
        </div>
    </header>

    <!-- Main Container -->
    <main class="flex-1 flex items-center justify-center p-4 py-12">
        <div class="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <!-- Left Info Panel -->
            <div class="lg:col-span-7 space-y-6 text-center lg:text-left pr-0 lg:pr-8">
                <div class="inline-block p-1 px-3 bg-blue-100 border border-blue-200 rounded-full text-[10px] font-bold text-blue-800 uppercase tracking-widest">
                    Penerimaan & Arsip Peserta Didik Baru
                </div>
                <h2 class="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                    Portal Pelayanan Registrasi Buku Induk Murid Baru SMANSA
                </h2>
                <p class="text-xs text-gray-500 leading-relaxed font-medium">
                    Selamat datang di ekosistem digital kearsipan SMA Negeri 1 Purwokerto. Fasilitas web ini memudahkan tata usaha kesiswaan dalam pencatatan Lembar Buku Induk, mempermudah murid melengkapi biodata pendaftaran secara mandiri, mengajukan permohonan koreksi penulisan biodata, serta mencetak berkas Buku Induk Terintegrasi secara resmi.
                </p>
                
                <div class="hidden sm:grid grid-cols-3 gap-4 pt-4">
                    <div class="bg-white p-4 rounded-2xl border border-gray-150 shadow-sm">
                        <span class="text-md font-bold text-blue-600 block mb-0.5">01</span>
                        <span class="text-[10.5px] font-bold text-slate-800 block">Sinkron Digital</span>
                        <span class="text-[9.5px] text-gray-400 font-medium block mt-0.5">Format standar dinas & sekolah</span>
                    </div>
                    <div class="bg-white p-4 rounded-2xl border border-gray-150 shadow-sm">
                        <span class="text-md font-bold text-blue-600 block mb-0.5">02</span>
                        <span class="text-[10.5px] font-bold text-slate-800 block">Cetak Mandiri</span>
                        <span class="text-[9.5px] text-gray-400 font-medium block mt-0.5">Didukung izin otorisasi admin</span>
                    </div>
                    <div class="bg-white p-4 rounded-2xl border border-gray-150 shadow-sm">
                        <span class="text-md font-bold text-blue-600 block mb-0.5">03</span>
                        <span class="text-[10.5px] font-bold text-slate-800 block">Koreksi Instan</span>
                        <span class="text-[9.5px] text-gray-400 font-medium block mt-0.5">Verifikasi satu pintu staf TU</span>
                    </div>
                </div>
            </div>

            <!-- Right Login Component Card -->
            <div class="lg:col-span-5 flex flex-col gap-6">
                
                <!-- Error Alert -->
                <?php if ($error_message): ?>
                    <div class="p-4 bg-rose-50 border border-rose-100 text-rose-800 text-xs font-bold rounded-2xl flex items-center gap-3">
                        <svg class="w-4 h-4 shrink-0 text-rose-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                        </svg>
                        <span><?= esc($error_message) ?></span>
                    </div>
                <?php endif; ?>

                <div class="bg-white rounded-3xl border border-slate-150 p-6 shadow-sm">
                    <!-- Tab Switcher -->
                    <div class="flex bg-slate-100 p-1.5 rounded-2xl mb-6">
                        <button type="button" onclick="switchTab('siswa')" id="btn-tab-siswa" 
                            class="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 bg-white text-blue-600 shadow-sm">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                            <span>Masuk Siswa</span>
                        </button>
                        <button type="button" onclick="switchTab('admin')" id="btn-tab-admin" 
                            class="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 text-slate-600 hover:text-slate-900">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                            <span>Masuk Admin</span>
                        </button>
                    </div>

                    <!-- 1. Form Siswa -->
                    <div id="form-container-siswa">
                        <div class="flex items-center gap-2.5 mb-4 border-b border-gray-100 pb-3">
                            <div class="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                            </div>
                            <div>
                                <h3 class="font-bold text-sm text-slate-800">Buku Induk Kesiswaan</h3>
                                <p class="text-[11px] text-gray-400 font-medium font-sans">Verifikasi biodata, unduh/cetak lembar data mandiri</p>
                            </div>
                        </div>

                        <form method="POST" class="space-y-4">
                            <input type="hidden" name="action" value="siswa">
                            <div class="space-y-3">
                                <div>
                                    <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Nomor Induk Siswa Nasional (NISN)</label>
                                    <input type="text" name="nisn" required maxlength="10" placeholder="Masukkan 10 digit NISN" 
                                        class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500 font-mono">
                                </div>
                                <div>
                                    <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Tanggal Lahir</label>
                                    <input type="date" name="dob" required 
                                        class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500 font-mono">
                                </div>
                            </div>
                            <button type="submit" 
                                class="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-600/10 flex items-center justify-center gap-1.5 cursor-pointer">
                                <span>Akses Buku Induk Saya</span>
                            </button>
                        </form>
                    </div>

                    <!-- 2. Form Admin -->
                    <div id="form-container-admin" class="hidden">
                        <div class="flex items-center gap-2.5 mb-4 border-b border-gray-100 pb-3">
                            <div class="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                            </div>
                            <div>
                                <h3 class="font-bold text-sm text-slate-800">Akses Administrator (TU)</h3>
                                <p class="text-[11px] text-gray-400 font-medium font-sans">Pendaftaran, penyuntingan, pencatatan & verifikasi arsip</p>
                            </div>
                        </div>

                        <form method="POST" class="space-y-4">
                            <input type="hidden" name="action" value="admin">
                            <div class="space-y-3">
                                <div>
                                    <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Username Admin</label>
                                    <input type="text" name="username" required placeholder="Isi username" 
                                        class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500">
                                </div>
                                <div>
                                    <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Kata Sandi</label>
                                    <input type="password" name="password" required placeholder="Isi kata sandi" 
                                        class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500">
                                </div>
                            </div>
                            <button type="submit" 
                                class="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-600/10 flex items-center justify-center gap-1.5 cursor-pointer">
                                <span>Masuk Aplikasi</span>
                            </button>
                        </form>
                    </div>

                </div>
            </div>
            
        </div>
    </main>

    <!-- Footer -->
    <footer class="bg-slate-900 text-slate-400 py-6 text-center text-xs border-t border-slate-800">
        <p>&copy; <?= date('Y') ?> SMA Negeri 1 Purwokerto. Hak Cipta Dilindungi.</p>
        <p class="text-[10px] text-slate-500 mt-1 font-sans">Tahun Pelajaran 2026/2027 &middot; Jl. Gatot Subroto No. 73, Purwokerto</p>
    </footer>

    <script>
        function switchTab(role) {
            const btnSiswa = document.getElementById('btn-tab-siswa');
            const btnAdmin = document.getElementById('btn-tab-admin');
            const formSiswa = document.getElementById('form-container-siswa');
            const formAdmin = document.getElementById('form-container-admin');

            if (role === 'siswa') {
                btnSiswa.className = "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 bg-white text-blue-600 shadow-sm";
                btnAdmin.className = "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 text-slate-600 hover:text-slate-900";
                formSiswa.classList.remove('hidden');
                formAdmin.classList.add('hidden');
            } else {
                btnAdmin.className = "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 bg-white text-blue-600 shadow-sm";
                btnSiswa.className = "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 text-slate-600 hover:text-slate-900";
                formAdmin.classList.remove('hidden');
                formSiswa.classList.add('hidden');
            }
        }

        // Auto focus if last action was admin
        <?php if ($active_tab === 'admin'): ?>
        switchTab('admin');
        <?php endif; ?>
    </script>
</body>
</html>
