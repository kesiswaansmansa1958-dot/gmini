<?php
require_once 'config.php';

// Proteksi Halaman Admin
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'ADMIN') {
    redirect('login.php');
}

$student_id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$student = null;
$mode = 'add'; // 'add' or 'edit'

if ($student_id > 0) {
    $stmt = $db->prepare("SELECT * FROM students WHERE id = ?");
    $stmt->execute([$student_id]);
    $student = $stmt->fetch();
    if ($student) {
        $mode = 'edit';
    } else {
        set_flash_message("Data siswa tidak ditemukan!", "danger");
        redirect('admin_dashboard.php');
    }
}

$error_msg = null;

// Handle Form POST Submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nisn = trim($_POST['nisn'] ?? '');
    $nama_lengkap = trim($_POST['nama_lengkap'] ?? '');
    $jenis_kelamin = $_POST['jenis_kelamin'] ?? 'Laki-laki';
    $tanggal_lahir = $_POST['tanggal_lahir'] ?? '';
    $kelas_sekarang = $_POST['kelas_sekarang'] ?? 'X';
    $tanggal_masuk = $_POST['tanggal_masuk'] ?? date('Y-m-d');

    if (empty($nisn) || empty($nama_lengkap) || empty($tanggal_lahir)) {
        $error_msg = "NISN, Nama Lengkap, dan Tanggal Lahir wajib diisi!";
    } else {
        // Cek duplikasi NISN jika tambah baru
        if ($mode === 'add') {
            $check_stmt = $db->prepare("SELECT COUNT(*) FROM students WHERE nisn = ?");
            $check_stmt->execute([$nisn]);
            $exists = $check_stmt->fetchColumn();
            if ($exists > 0) {
                $error_msg = "Siswa dengan NISN '{$nisn}' sudah terdaftar di Buku Induk!";
            }
        } else {
            $check_stmt = $db->prepare("SELECT COUNT(*) FROM students WHERE nisn = ? AND id != ?");
            $check_stmt->execute([$nisn, $student_id]);
            $exists = $check_stmt->fetchColumn();
            if ($exists > 0) {
                $error_msg = "Siswa lain dengan NISN '{$nisn}' sudah terdaftar!";
            }
        }

        if (!$error_msg) {
            // Ambil seluruh data dari forms
            $data = [
                'nisn' => $nisn,
                'nis' => trim($_POST['nis'] ?? ''),
                'nik' => trim($_POST['nik'] ?? ''),
                'no_pendaftaran' => trim($_POST['no_pendaftaran'] ?? ''),
                'no_kk' => trim($_POST['no_kk'] ?? ''),
                'no_kip' => trim($_POST['no_kip'] ?? ''),
                'id_dtks' => trim($_POST['id_dtks'] ?? ''),
                
                'nama_lengkap' => $nama_lengkap,
                'nama_panggilan' => trim($_POST['nama_panggilan'] ?? ''),
                'jenis_kelamin' => $jenis_kelamin,
                'tempat_lahir' => trim($_POST['tempat_lahir'] ?? ''),
                'tanggal_lahir' => $tanggal_lahir,
                'agama' => $_POST['agama'] ?? 'Islam',
                'kewarganegaraan' => trim($_POST['kewarganegaraan'] ?? 'WNI'),
                'anak_ke' => (int)($_POST['anak_ke'] ?? 1),
                'saudara_kandung' => (int)($_POST['saudara_kandung'] ?? 0),
                'saudara_tiri' => (int)($_POST['saudara_tiri'] ?? 0),
                'saudara_angkat' => (int)($_POST['saudara_angkat'] ?? 0),
                'saudara_kembar' => (int)($_POST['saudara_kembar'] ?? 0),
                'anak_yatim_piatu' => $_POST['anak_yatim_piatu'] ?? 'Bukan Anak Yatim Piatu',
                'status_keluarga' => $_POST['status_keluarga'] ?? 'Lengkap',
                'bahasa_sehari_hari' => trim($_POST['bahasa_sehari_hari'] ?? 'Bahasa Indonesia'),
                
                'alamat_lengkap' => trim($_POST['alamat_lengkap'] ?? ''),
                'telepon' => trim($_POST['telepon'] ?? ''),
                'tinggal_dengan' => $_POST['tinggal_dengan'] ?? 'Orang Tua',
                'jarak_ke_sekolah' => trim($_POST['jarak_ke_sekolah'] ?? ''),
                'transportasi' => trim($_POST['transportasi'] ?? ''),
                
                'golongan_darah' => $_POST['golongan_darah'] ?? '',
                'penyakit_pernah_diderita' => trim($_POST['penyakit_pernah_diderita'] ?? ''),
                'kelainan_jasmani' => trim($_POST['kelainan_jasmani'] ?? ''),
                'tinggi_badan' => (int)($_POST['tinggi_badan'] ?? 0),
                'berat_badan' => (int)($_POST['berat_badan'] ?? 0),
                
                'lulusan_dari' => trim($_POST['lulusan_dari'] ?? ''),
                'tanggal_ijazah' => trim($_POST['tanggal_ijazah'] ?? ''),
                'nomor_ijazah' => trim($_POST['nomor_ijazah'] ?? ''),
                'pindahan_dari' => trim($_POST['pindahan_dari'] ?? ''),
                'alasan_pindah' => trim($_POST['alasan_pindah'] ?? ''),
                'lama_belajar' => trim($_POST['lama_belajar'] ?? ''),
                
                'rerata_agama' => (float)($_POST['rerata_agama'] ?? 0.0),
                'rerata_ppkn' => (float)($_POST['rerata_ppkn'] ?? 0.0),
                'rerata_b_indonesia' => (float)($_POST['rerata_b_indonesia'] ?? 0.0),
                'rerata_matematika' => (float)($_POST['rerata_matematika'] ?? 0.0),
                'rerata_ipa' => (float)($_POST['rerata_ipa'] ?? 0.0),
                'rerata_ips' => (float)($_POST['rerata_ips'] ?? 0.0),
                'rerata_b_inggris' => (float)($_POST['rerata_b_inggris'] ?? 0.0),
                
                'prestasi_akademik' => trim($_POST['prestasi_akademik'] ?? ''),
                'prestasi_non_akademik' => trim($_POST['prestasi_non_akademik'] ?? ''),
                
                'ayah_nama' => trim($_POST['ayah_nama'] ?? ''),
                'ayah_nik' => trim($_POST['ayah_nik'] ?? ''),
                'ayah_tempat_lahir' => trim($_POST['ayah_tempat_lahir'] ?? ''),
                'ayah_tanggal_lahir' => !empty($_POST['ayah_tanggal_lahir']) ? $_POST['ayah_tanggal_lahir'] : null,
                'ayah_agama' => $_POST['ayah_agama'] ?? '',
                'ayah_kewarganegaraan' => trim($_POST['ayah_kewarganegaraan'] ?? 'WNI'),
                'ayah_pendidikan' => trim($_POST['ayah_pendidikan'] ?? ''),
                'ayah_pekerjaan' => trim($_POST['ayah_pekerjaan'] ?? ''),
                'ayah_penghasilan' => trim($_POST['ayah_penghasilan'] ?? ''),
                'ayah_alamat' => trim($_POST['ayah_alamat'] ?? ''),
                'ayah_telepon' => trim($_POST['ayah_telepon'] ?? ''),
                'ayah_is_masih_hidup' => isset($_POST['ayah_is_masih_hidup']) ? 1 : 0,
                
                'ibu_nama' => trim($_POST['ibu_nama'] ?? ''),
                'ibu_nik' => trim($_POST['ibu_nik'] ?? ''),
                'ibu_tempat_lahir' => trim($_POST['ibu_tempat_lahir'] ?? ''),
                'ibu_tanggal_lahir' => !empty($_POST['ibu_tanggal_lahir']) ? $_POST['ibu_tanggal_lahir'] : null,
                'ibu_agama' => $_POST['ibu_agama'] ?? '',
                'ibu_kewarganegaraan' => trim($_POST['ibu_kewarganegaraan'] ?? 'WNI'),
                'ibu_pendidikan' => trim($_POST['ibu_pendidikan'] ?? ''),
                'ibu_pekerjaan' => trim($_POST['ibu_pekerjaan'] ?? ''),
                'ibu_penghasilan' => trim($_POST['ibu_penghasilan'] ?? ''),
                'ibu_alamat' => trim($_POST['ibu_alamat'] ?? ''),
                'ibu_telepon' => trim($_POST['ibu_telepon'] ?? ''),
                'ibu_is_masih_hidup' => isset($_POST['ibu_is_masih_hidup']) ? 1 : 0,
                
                'has_wali' => isset($_POST['has_wali']) ? 1 : 0,
                'wali_nama' => trim($_POST['wali_nama'] ?? ''),
                'wali_nik' => trim($_POST['wali_nik'] ?? ''),
                'wali_tempat_lahir' => trim($_POST['wali_tempat_lahir'] ?? ''),
                'wali_tanggal_lahir' => !empty($_POST['wali_tanggal_lahir']) ? $_POST['wali_tanggal_lahir'] : null,
                'wali_agama' => $_POST['wali_agama'] ?? '',
                'wali_kewarganegaraan' => trim($_POST['wali_kewarganegaraan'] ?? ''),
                'wali_pendidikan' => trim($_POST['wali_pendidikan'] ?? ''),
                'wali_pekerjaan' => trim($_POST['wali_pekerjaan'] ?? ''),
                'wali_penghasilan' => trim($_POST['wali_penghasilan'] ?? ''),
                'wali_alamat' => trim($_POST['wali_alamat'] ?? ''),
                'wali_telepon' => trim($_POST['wali_telepon'] ?? ''),
                'wali_hubungan_siswa' => trim($_POST['wali_hubungan_siswa'] ?? ''),
                
                'kelas_sekarang' => $kelas_sekarang,
                'program_keahlian' => trim($_POST['program_keahlian'] ?? 'MIPA'),
                'tanggal_masuk' => $tanggal_masuk,
                'beasiswa' => trim($_POST['beasiswa'] ?? ''),
                'tanggal_keluar' => !empty($_POST['tanggal_keluar']) ? $_POST['tanggal_keluar'] : null,
                'alasan_keluar' => trim($_POST['alasan_keluar'] ?? ''),
                'nomor_stb' => trim($_POST['nomor_stb'] ?? ''),
                
                'kesenian' => trim($_POST['kesenian'] ?? ''),
                'olahraga' => trim($_POST['olahraga'] ?? ''),
                'organisasi' => trim($_POST['organisasi'] ?? ''),
                
                'foto' => trim($_POST['foto_base64'] ?? ($student['foto'] ?? ''))
            ];

            if ($mode === 'add') {
                // SQL Insert
                $columns = implode(", ", array_map(function($k) { return "`$k`"; }, array_keys($data)));
                $placeholders = implode(", ", array_fill(0, count($data), "?"));
                
                $sql = "INSERT INTO students ($columns) VALUES ($placeholders)";
                $stmt = $db->prepare($sql);
                $stmt->execute(array_values($data));
                
                set_flash_message("Biodata baru '{$nama_lengkap}' berhasil dibuat!", "success");
            } else {
                // SQL Update
                $sets = [];
                foreach (array_keys($data) as $col) {
                    $sets[] = "`$col` = ?";
                }
                $sql = "UPDATE students SET " . implode(", ", $sets) . " WHERE id = ?";
                $values = array_values($data);
                $values[] = $student_id;
                
                $stmt = $db->prepare($sql);
                $stmt->execute($values);
                
                set_flash_message("Biodata Sdr. '{$nama_lengkap}' berhasil disinkronisasi!", "success");
            }
            redirect('admin_dashboard.php');
        }
    }
}

// Function to populate value securely in HTML inputs
function val($field, $default = '') {
    global $student, $mode;
    if ($mode === 'edit' && isset($student[$field])) {
        return esc($student[$field]);
    }
    return esc($_POST[$field] ?? $default);
}

// Check checkbox checked state
function checked($field, $default = false) {
    global $student, $mode;
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        return isset($_POST[$field]);
    }
    if ($mode === 'edit' && isset($student[$field])) {
        return (bool)$student[$field];
    }
    return $default;
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $mode === 'add' ? 'Registrasi Siswa Baru' : 'Edit Biodata Siswa' ?> | SMAN 1 Purwokerto</title>
    <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <style>
        body { font-family: "Inter", sans-serif; background-color: #f8fafc; }
    </style>
</head>
<body class="min-h-screen bg-slate-50 flex flex-col justify-between">

    <!-- Header Navigation Section -->
    <header class="bg-slate-900 text-white py-4 px-6 border-b border-slate-800 shadow-sm">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
            <div class="flex items-center gap-3">
                <a href="admin_dashboard.php" class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-sm text-white">S1</a>
                <div>
                    <h1 class="text-xs font-black tracking-wider uppercase text-slate-100"><?= $mode === 'add' ? 'Registrasi Akun Utama' : 'Penyuntingan Lembar Belajar' ?></h1>
                    <p class="text-[9px] text-gray-400 font-medium font-sans">Lembar Data Siswa Buku Induk SMANSA</p>
                </div>
            </div>
            
            <a href="admin_dashboard.php" class="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-bold font-sans transition flex items-center gap-1">
                Batal / Kembali
            </a>
        </div>
    </header>

    <main class="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 py-8">

        <?php if ($error_msg): ?>
            <div class="mb-5 p-4 bg-rose-50 border border-rose-100 text-rose-800 text-xs font-bold rounded-2xl flex items-center gap-2.5">
                <svg class="w-4 h-4 text-rose-600 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
                <span><?= esc($error_msg) ?></span>
            </div>
        <?php endif; ?>

        <form method="POST" class="space-y-6">
            
            <!-- Tab Navigation Header -->
            <div class="bg-white rounded-2xl border border-gray-150 p-2 overflow-x-auto flex gap-1 shadow-sm">
                <button type="button" onclick="setTab('pribadi')" id="tab-pribadi" class="px-3.5 py-2 rounded-xl text-[11px] font-bold transition shrink-0 bg-blue-600 text-white shadow-sm">
                    1. Biodata Pribadi
                </button>
                <button type="button" onclick="setTab('alamat')" id="tab-alamat" class="px-3.5 py-2 rounded-xl text-[11px] font-bold transition shrink-0 text-gray-500 hover:text-gray-900">
                    2. Alamat & Kontak
                </button>
                <button type="button" onclick="setTab('kesehatan')" id="tab-kesehatan" class="px-3.5 py-2 rounded-xl text-[11px] font-bold transition shrink-0 text-gray-500 hover:text-gray-900">
                    3. Kesehatan
                </button>
                <button type="button" onclick="setTab('pendidikan')" id="tab-pendidikan" class="px-3.5 py-2 rounded-xl text-[11px] font-bold transition shrink-0 text-gray-500 hover:text-gray-900">
                    4. Sekolah Asal
                </button>
                <button type="button" onclick="setTab('orangtua')" id="tab-orangtua" class="px-3.5 py-2 rounded-xl text-[11px] font-bold transition shrink-0 text-gray-500 hover:text-gray-900">
                    5. Orang Tua & Wali
                </button>
                <button type="button" onclick="setTab('akademik')" id="tab-akademik" class="px-3.5 py-2 rounded-xl text-[11px] font-bold transition shrink-0 text-gray-500 hover:text-gray-900">
                    6. Keanggotaan SMANSA
                </button>
            </div>

            <!-- TAB 1: BIODATA PRIBADI -->
            <div id="pant-pribadi" class="bg-white rounded-3xl border border-gray-150 p-6 md:p-8 space-y-5 shadow-sm">
                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-2">1. Informasi Personal Pokok</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label class="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">Nama Lengkap Siswa</label>
                        <input type="text" name="nama_lengkap" required value="<?= val('nama_lengkap') ?>" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">Nama Panggilan</label>
                        <input type="text" name="nama_panggilan" value="<?= val('nama_panggilan') ?>" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">Jenis Kelamin</label>
                        <select name="jenis_kelamin" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500">
                            <option value="Laki-laki" <?= val('jenis_kelamin') === 'Laki-laki' ? 'selected' : '' ?>>Laki-laki</option>
                            <option value="Perempuan" <?= val('jenis_kelamin') === 'Perempuan' ? 'selected' : '' ?>>Perempuan</option>
                        </select>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label class="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">NISN (10 Digit)*</label>
                        <input type="text" name="nisn" required maxlength="10" value="<?= val('nisn') ?>" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold font-mono text-slate-700 focus:outline-none focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">NIS (Nomor Induk Lokal)</label>
                        <input type="text" name="nis" value="<?= val('nis') ?>" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold font-mono text-slate-700 focus:outline-none focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">NIK Siswa (No KTP)</label>
                        <input type="text" name="nik" value="<?= val('nik') ?>" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold font-mono text-slate-700 focus:outline-none focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">No Pendaftaran PPDB</label>
                        <input type="text" name="no_pendaftaran" value="<?= val('no_pendaftaran') ?>" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold font-mono text-slate-700 focus:outline-none focus:border-blue-500">
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label class="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">Tempat Lahir</label>
                        <input type="text" name="tempat_lahir" value="<?= val('tempat_lahir') ?>" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">Tanggal Lahir (YYYY-MM-DD)*</label>
                        <input type="date" name="tanggal_lahir" required value="<?= val('tanggal_lahir') ?>" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold font-mono text-slate-700 focus:outline-none focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">Agama</label>
                        <input type="text" name="agama" value="<?= val('agama', 'Islam') ?>" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500">
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label class="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">Nomor Kartu Keluarga (KK)</label>
                        <input type="text" name="no_kk" value="<?= val('no_kk') ?>" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold font-mono text-slate-700 focus:outline-none focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">Kewarganegaraan</label>
                        <input type="text" name="kewarganegaraan" value="<?= val('kewarganegaraan', 'WNI') ?>" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">Bahasa Sehari-hari</label>
                        <input type="text" name="bahasa_sehari_hari" value="<?= val('bahasa_sehari_hari', 'Bahasa Indonesia') ?>" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">Keluarga Kandung (Anak Ke)</label>
                        <input type="number" name="anak_ke" value="<?= val('anak_ke', '1') ?>" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold font-mono text-slate-700 focus:outline-none focus:border-blue-500">
                    </div>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                        <label class="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">Jlh Sdr. Kandung</label>
                        <input type="number" name="saudara_kandung" value="<?= val('saudara_kandung', '0') ?>" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold font-mono text-slate-700 focus:outline-none focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">Jlh Sdr. Tiri</label>
                        <input type="number" name="saudara_tiri" value="<?= val('saudara_tiri', '0') ?>" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold font-mono text-slate-700 focus:outline-none focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">Jlh Sdr. Angkat</label>
                        <input type="number" name="saudara_angkat" value="<?= val('saudara_angkat', '0') ?>" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold font-mono text-slate-700 focus:outline-none focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">Mempunyai Kembaran?</label>
                        <select name="saudara_kembar" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500">
                            <option value="0" <?= val('saudara_kembar') === '0' ? 'selected' : '' ?>>Tidak</option>
                            <option value="1" <?= val('saudara_kembar') === '1' ? 'selected' : '' ?>>Ya (1 Saudara Kembar)</option>
                        </select>
                    </div>
                    <div class="col-span-2 md:col-span-1">
                        <label class="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">Status Keluarga</label>
                        <input type="text" name="status_keluarga" value="<?= val('status_keluarga', 'Lengkap') ?>" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500">
                    </div>
                </div>
            </div>

            <!-- TAB 2: ALAMAT & KONTAK -->
            <div id="pant-alamat" class="bg-white rounded-3xl border border-gray-150 p-6 md:p-8 space-y-5 shadow-sm hidden">
                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-2">2. Informasi Domisili</h3>
                <div>
                    <label class="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">Alamat Lengkap Rumah (Sesuai KK)</label>
                    <textarea name="alamat_lengkap" rows="3" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"><?= val('alamat_lengkap') ?></textarea>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label class="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">Telepon / HP Aktif</label>
                        <input type="text" name="telepon" value="<?= val('telepon') ?>" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold font-mono text-slate-700 focus:outline-none focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">Tinggal Dengan</label>
                        <input type="text" name="tinggal_dengan" value="<?= val('tinggal_dengan', 'Orang Tua') ?>" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">Jarak Ke Sekolah (km/m)</label>
                        <input type="text" name="jarak_ke_sekolah" value="<?= val('jarak_ke_sekolah') ?>" placeholder="Contoh: 2 km" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">Transportasi yang Digunakan</label>
                        <input type="text" name="transportasi" value="<?= val('transportasi') ?>" placeholder="Contoh: Sepeda Motor" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500">
                    </div>
                </div>
            </div>

            <!-- TAB 3: KESEHATAN -->
            <div id="pant-kesehatan" class="bg-white rounded-3xl border border-gray-150 p-6 md:p-8 space-y-5 shadow-sm hidden">
                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-2">3. Jasmani & Rekam Medis</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label class="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">Golongan Darah</label>
                        <input type="text" name="golongan_darah" value="<?= val('golongan_darah') ?>" placeholder="O, A, B, AB" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">Tinggi Badan (cm)</label>
                        <input type="number" name="tinggi_badan" value="<?= val('tinggi_badan', '0') ?>" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold font-mono text-slate-700 focus:outline-none focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">Berat Badan (kg)</label>
                        <input type="number" name="berat_badan" value="<?= val('berat_badan', '0') ?>" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold font-mono text-slate-700 focus:outline-none focus:border-blue-500">
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">Penyakit yang Pernah Diderita</label>
                        <textarea name="penyakit_pernah_diderita" rows="2" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-blue-500"><?= val('penyakit_pernah_diderita') ?></textarea>
                    </div>
                    <div>
                        <label class="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">Kelainan Jasmani / Kebutuhan Khusus</label>
                        <textarea name="kelainan_jasmani" rows="2" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-blue-500"><?= val('kelainan_jasmani') ?></textarea>
                    </div>
                </div>
            </div>

            <!-- TAB 4: SEKOLAH ASAL -->
            <div id="pant-pendidikan" class="bg-white rounded-3xl border border-gray-150 p-6 md:p-8 space-y-5 shadow-sm hidden">
                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-2">4. Latar Belakang Pendidikan</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label class="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">Lulusan Dari (SMP/MTs)</label>
                        <input type="text" name="lulusan_dari" value="<?= val('lulusan_dari') ?>" placeholder="SMP Negeri 1 Purwokerto" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">Nomor Ijazah</label>
                        <input type="text" name="nomor_ijazah" value="<?= val('nomor_ijazah') ?>" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold font-mono text-slate-700 focus:outline-none focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">Tanggal Kelulusan Ijazah</label>
                        <input type="text" name="tanggal_ijazah" value="<?= val('tanggal_ijazah') ?>" placeholder="Contoh: 15 Juni 2024" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500">
                    </div>
                </div>

                <div class="border-t pt-4">
                    <span class="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-3">Rata-rata Nilai Evaluasi Murni Sekolah Asal</span>
                    <div class="grid grid-cols-3 md:grid-cols-7 gap-3">
                        <div>
                            <label class="text-[9px] text-gray-400 uppercase block mb-1">PAI</label>
                            <input type="number" step="0.01" name="rerata_agama" value="<?= val('rerata_agama', '0') ?>" class="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-center font-mono focus:outline-none">
                        </div>
                        <div>
                            <label class="text-[9px] text-gray-400 uppercase block mb-1">PPKN</label>
                            <input type="number" step="0.01" name="rerata_ppkn" value="<?= val('rerata_ppkn', '0') ?>" class="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-center font-mono focus:outline-none">
                        </div>
                        <div>
                            <label class="text-[9px] text-gray-400 uppercase block mb-1">B. IND</label>
                            <input type="number" step="0.01" name="rerata_b_indonesia" value="<?= val('rerata_b_indonesia', '0') ?>" class="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-center font-mono focus:outline-none">
                        </div>
                        <div>
                            <label class="text-[9px] text-gray-400 uppercase block mb-1">MTK</label>
                            <input type="number" step="0.01" name="rerata_matematika" value="<?= val('rerata_matematika', '0') ?>" class="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-center font-mono focus:outline-none">
                        </div>
                        <div>
                            <label class="text-[9px] text-gray-400 uppercase block mb-1">IPA</label>
                            <input type="number" step="0.01" name="rerata_ipa" value="<?= val('rerata_ipa', '0') ?>" class="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-center font-mono focus:outline-none">
                        </div>
                        <div>
                            <label class="text-[9px] text-gray-400 uppercase block mb-1">IPS</label>
                            <input type="number" step="0.01" name="rerata_ips" value="<?= val('rerata_ips', '0') ?>" class="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-center font-mono focus:outline-none">
                        </div>
                        <div>
                            <label class="text-[9px] text-gray-400 uppercase block mb-1">B. ING</label>
                            <input type="number" step="0.01" name="rerata_b_inggris" value="<?= val('rerata_b_inggris', '0') ?>" class="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-center font-mono focus:outline-none">
                        </div>
                    </div>
                </div>
            </div>

            <!-- TAB 5: ORANG TUA & WALI -->
            <div id="pant-orangtua" class="bg-white rounded-3xl border border-gray-150 p-6 md:p-8 space-y-6 shadow-sm hidden">
                
                <!-- Father's Form -->
                <div class="space-y-4">
                    <div class="flex items-center justify-between border-b pb-2">
                        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">5a. Ayah Kandung</h4>
                        <label class="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                            <input type="checkbox" name="ayah_is_masih_hidup" value="1" <?= checked('ayah_is_masih_hidup', true) ? 'checked' : '' ?> class="rounded text-blue-600">
                            <span>Masih Hidup</span>
                        </label>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div class="md:col-span-2">
                            <label class="text-[9.5px] font-bold text-gray-400 block mb-1">Nama Lengkap Ayah</label>
                            <input type="text" name="ayah_nama" value="<?= val('ayah_nama') ?>" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none">
                        </div>
                        <div>
                            <label class="text-[9.5px] font-bold text-gray-400 block mb-1">NIK Ayah</label>
                            <input type="text" name="ayah_nik" value="<?= val('ayah_nik') ?>" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold font-mono focus:outline-none">
                        </div>
                        <div>
                            <label class="text-[9.5px] font-bold text-gray-400 block mb-1">Telepon</label>
                            <input type="text" name="ayah_telepon" value="<?= val('ayah_telepon') ?>" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold font-mono focus:outline-none">
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label class="text-[9.5px] font-bold text-gray-400 block mb-1">Pendidikan</label>
                            <input type="text" name="ayah_pendidikan" value="<?= val('ayah_pendidikan') ?>" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none">
                        </div>
                        <div>
                            <label class="text-[9.5px] font-bold text-gray-400 block mb-1">Pekerjaan Utama</label>
                            <input type="text" name="ayah_pekerjaan" value="<?= val('ayah_pekerjaan') ?>" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none">
                        </div>
                        <div class="md:col-span-2">
                            <label class="text-[9.5px] font-bold text-gray-400 block mb-1">Rata-rata Penghasilan Bulsn</label>
                            <input type="text" name="ayah_penghasilan" value="<?= val('ayah_penghasilan') ?>" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none">
                        </div>
                    </div>
                </div>

                <!-- Mother's Form -->
                <div class="space-y-4 pt-4 border-t">
                    <div class="flex items-center justify-between border-b pb-2">
                        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">5b. Ibu Kandung</h4>
                        <label class="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                            <input type="checkbox" name="ibu_is_masih_hidup" value="1" <?= checked('ibu_is_masih_hidup', true) ? 'checked' : '' ?> class="rounded text-blue-600">
                            <span>Masih Hidup</span>
                        </label>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div class="md:col-span-2">
                            <label class="text-[9.5px] font-bold text-gray-400 block mb-1">Nama Ibu</label>
                            <input type="text" name="ibu_nama" value="<?= val('ibu_nama') ?>" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none">
                        </div>
                        <div>
                            <label class="text-[9.5px] font-bold text-gray-400 block mb-1">NIK Ibu</label>
                            <input type="text" name="ibu_nik" value="<?= val('ibu_nik') ?>" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold font-mono focus:outline-none">
                        </div>
                        <div>
                            <label class="text-[9.5px] font-bold text-gray-400 block mb-1">Telepon Ibu</label>
                            <input type="text" name="ibu_telepon" value="<?= val('ibu_telepon') ?>" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold font-mono focus:outline-none">
                        </div>
                    </div>
                </div>

                <!-- Guardian's Form -->
                <div class="space-y-4 pt-4 border-t">
                    <div class="flex items-center justify-between border-b pb-2">
                        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">5c. Wali Murid (Jika Ada / Sebagai Alternatif)</h4>
                        <label class="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                            <input type="checkbox" name="has_wali" id="has_wali_checkbox" value="1" <?= checked('has_wali', false) ? 'checked' : '' ?> onclick="toggleWaliField()" class="rounded text-blue-600">
                            <span>Memiliki Wali Aktif</span>
                        </label>
                    </div>
                    <div id="container-wali-form" class="<?= checked('has_wali', false) ? '' : 'hidden' ?> grid grid-cols-1 md:grid-cols-4 gap-4 animate-fadeIn">
                        <div>
                            <label class="text-[9.5px] font-bold text-gray-400 block mb-1">Nama Wali</label>
                            <input type="text" name="wali_nama" value="<?= val('wali_nama') ?>" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none">
                        </div>
                        <div>
                            <label class="text-[9.5px] font-bold text-gray-400 block mb-1">Hubungan Keluarga</label>
                            <input type="text" name="wali_hubungan_siswa" value="<?= val('wali_hubungan_siswa') ?>" placeholder="Paman, Tante, Kakak dll." class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none">
                        </div>
                        <div>
                            <label class="text-[9.5px] font-bold text-gray-400 block mb-1">Pekerjaan</label>
                            <input type="text" name="wali_pekerjaan" value="<?= val('wali_pekerjaan') ?>" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none">
                        </div>
                        <div>
                            <label class="text-[9.5px] font-bold text-gray-400 block mb-1">Telepon Wali</label>
                            <input type="text" name="wali_telepon" value="<?= val('wali_telepon') ?>" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold font-mono focus:outline-none">
                        </div>
                    </div>
                </div>
            </div>

            <!-- TAB 6: KEANGGOTAAN SMANSA -->
            <div id="pant-akademik" class="bg-white rounded-3xl border border-gray-150 p-6 md:p-8 space-y-5 shadow-sm hidden">
                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-2">6. Otorisasi Kelas & Berkas Kearsipan SMANSA</h3>
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label class="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">Kelas Aktif Sekarang*</label>
                        <input type="text" name="kelas_sekarang" required value="<?= val('kelas_sekarang', 'X-A') ?>" placeholder="X-A atau XI-MIPA 1" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">Program Keahlian</label>
                        <input type="text" name="program_keahlian" value="<?= val('program_keahlian', 'MIPA') ?>" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">Tanggal Masuk Sekolah*</label>
                        <input type="date" name="tanggal_masuk" required value="<?= val('tanggal_masuk', date('2026-07-15')) ?>" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold font-mono text-slate-700 focus:outline-none focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">Nomor STB Buku Induk</label>
                        <input type="text" name="nomor_stb" value="<?= val('nomor_stb') ?>" placeholder="Nomor Buku Induk SMANSA" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold font-mono text-slate-700 focus:outline-none focus:border-blue-500 search-mono">
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div>
                        <label class="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">Hobi Kesenian</label>
                        <input type="text" name="kesenian" value="<?= val('kesenian') ?>" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none text-slate-700">
                    </div>
                    <div>
                        <label class="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">Hobi Olahraga</label>
                        <input type="text" name="olahraga" value="<?= val('olahraga') ?>" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none text-slate-700">
                    </div>
                    <div>
                        <label class="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">Hobi Keorganisasian</label>
                        <input type="text" name="organisasi" value="<?= val('organisasi') ?>" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none text-slate-700">
                    </div>
                </div>

                <!-- Foto Upload with Interactive Cropper Area -->
                <div class="pt-4 border-t space-y-4">
                    <label class="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest leading-none">Pas Foto Siswa Resmi (Proporsi 3:4)</label>
                    
                    <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
                        <!-- Left pane: Current Preview & Selector -->
                        <div class="md:col-span-4 flex flex-col items-center justify-center p-5 bg-slate-50 rounded-2xl border border-gray-200 text-center space-y-4">
                            <div class="relative overflow-hidden rounded-2xl border-4 border-white shadow-md bg-slate-100" style="width: 120px; height: 160px;">
                                <img id="final_image_preview" src="<?= val('foto') ?: 'data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22160%22 viewBox=%220 0 120 160%22><rect width=%22120%22 height=%22160%22 fill=%22%23f1f5f9%22/><text x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22sans-serif%22 font-size=%2210%22 fill=%22%2394a3b8%22>Pas Foto 3x4</text></svg>' ?>" class="w-full h-full object-cover">
                            </div>
                            <div class="w-full">
                                <span id="photo_status_badge" class="<?= val('foto') ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-550 border-slate-200' ?> inline-block px-3 py-1 rounded-full text-[9px] font-bold border uppercase tracking-wider mb-3 leading-none">
                                    <?= val('foto') ? 'Pas Foto Terunggah' : 'Belum Ada Foto' ?>
                                </span>
                                <input type="file" id="admin_file_picker" accept="image/*" class="hidden" onchange="handleAdminFileSelect(event)">
                                <button type="button" onclick="document.getElementById('admin_file_picker').click()" class="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer">
                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path></svg>
                                    <span>Pilih File Gambar</span>
                                </button>
                                <?php if (val('foto')): ?>
                                    <button type="button" id="btn_clear_photo" onclick="clearPhoto()" class="w-full mt-2 py-1.5 bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-gray-250 hover:border-rose-100 rounded-lg text-[10px] font-bold transition">
                                        Hapus Pas Foto
                                    </button>
                                <?php endif; ?>
                            </div>
                        </div>

                        <!-- Right pane: Interactive Workstation (initially hidden) -->
                        <div id="admin_crop_workshop" class="hidden md:col-span-8 p-5 bg-slate-50 rounded-2xl border border-gray-200 flex flex-col md:flex-row items-center gap-6 animate-fadeIn">
                            <!-- Canvas boundaries -->
                            <div class="relative overflow-hidden rounded-2xl border border-gray-250 shadow-md bg-white shrink-0" style="width: 150px; height: 200px;">
                                <canvas id="admin_cropper_canvas" width="300" height="400" class="w-full h-full cursor-grab"></canvas>
                                <!-- Guidelines frame overlay -->
                                <div class="absolute inset-0 pointer-events-none border-[2px] border-blue-500/25 rounded-2xl flex flex-col justify-between">
                                    <div class="flex-grow border-b border-white/20 flex">
                                        <div class="flex-grow border-r border-white/20"></div>
                                        <div class="flex-grow border-r border-white/20"></div>
                                        <div class="flex-grow"></div>
                                    </div>
                                    <div class="flex-grow border-b border-white/20 flex">
                                        <div class="flex-grow border-r border-white/20"></div>
                                        <div class="flex-grow border-r border-white/20"></div>
                                        <div class="flex-grow"></div>
                                    </div>
                                    <div class="flex-grow flex">
                                        <div class="flex-grow border-r border-white/20"></div>
                                        <div class="flex-grow border-r border-white/20"></div>
                                        <div class="flex-grow"></div>
                                    </div>
                                </div>
                            </div>

                            <!-- Workstation Zooming Rotations and Pan handles -->
                            <div class="flex-1 space-y-4 w-full">
                                <div>
                                    <div class="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                                        <span>Perbesar / Skala</span>
                                        <span id="admin_zoom_display" class="font-mono">100%</span>
                                    </div>
                                    <input id="admin_zoom_slider" type="range" min="1.0" max="4.0" step="0.02" value="1.0" class="w-full cursor-pointer accent-blue-600" oninput="adjustAdminZoom(this.value)">
                                </div>

                                <div class="flex items-center justify-between pt-1">
                                    <span class="text-[9.5px] font-extrabold text-slate-500 uppercase tracking-wider">Transformasi</span>
                                    <div class="flex items-center gap-1">
                                        <button type="button" onclick="rotateAdminLeft()" class="px-2.5 py-1 bg-white hover:bg-slate-100 border border-gray-200 rounded-lg text-xs font-bold text-slate-700 transition">
                                            &larr; Kiri
                                        </button>
                                        <button type="button" onclick="rotateAdminRight()" class="px-2.5 py-1 bg-white hover:bg-slate-100 border border-gray-200 rounded-lg text-xs font-bold text-slate-700 transition">
                                            Kanan &rarr;
                                        </button>
                                        <button type="button" onclick="resetAdminTransforms()" class="px-2.5 py-1 bg-white hover:bg-slate-100 border border-gray-200 rounded-lg text-xs font-bold text-slate-700 transition">
                                            Reset
                                        </button>
                                    </div>
                                </div>

                                <div class="pt-3.5 border-t border-gray-250 flex justify-end gap-2">
                                    <button type="button" onclick="cancelAdminCrop()" class="px-3 py-1.5 bg-white hover:bg-slate-100 border border-gray-200 rounded-xl text-xs font-bold text-slate-600 transition">
                                        Batal
                                    </button>
                                    <button type="button" onclick="saveAdminCrop()" class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm">
                                        Terapkan Potongan Foto
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Drop helper placeholder block when workspace is inactive -->
                        <div id="admin_drop_placeholder" class="md:col-span-8 border-2 border-dashed border-gray-250 rounded-2xl flex flex-col items-center justify-center p-6 bg-white cursor-pointer text-center space-y-2" onclick="document.getElementById('admin_file_picker').click()">
                            <div class="p-2 bg-slate-50 rounded-full text-slate-400">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                            </div>
                            <div>
                                <p class="text-xs font-bold text-slate-700">Pas Foto Buku Induk Baru</p>
                                <p class="text-[10px] text-gray-400 mt-0.5 leading-normal">Pilih atau seret gambar. Pas foto 3x4 akan dipangkas secara otomatis.</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Hidden real input containing the active Base64 string data -->
                    <input type="hidden" name="foto_base64" id="foto_base64" value="<?= val('foto') ?>">
                </div>
            </div>

            <!-- Bottom Actions -->
            <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <a href="admin_dashboard.php" class="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-bold transition">
                    Batalkan
                </a>
                <button type="submit" class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold transition font-sans shadow-md shadow-blue-500/10 cursor-pointer">
                    <?= $mode === 'add' ? 'Kirim Pendaftaran Buku Induk' : 'Sinkronkan Biodata Kesiswaan' ?>
                </button>
            </div>

        </form>
    </main>

    <!-- Footer -->
    <footer class="bg-slate-900 text-slate-400 py-6 text-center text-xs border-t border-slate-800 print:hidden mt-12">
        <p>&copy; <?= date('Y') ?> SMA Negeri 1 Purwokerto. Hak Cipta Dilindungi.</p>
    </footer>

    <script>
        function setTab(tabName) {
            // Hide all panels
            ['pribadi', 'alamat', 'kesehatan', 'pendidikan', 'orangtua', 'akademik'].forEach(name => {
                const el = document.getElementById('pant-' + name);
                const btn = document.getElementById('tab-' + name);
                if (el) el.classList.add('hidden');
                if (btn) btn.className = "px-3.5 py-2 rounded-xl text-[11px] font-bold transition shrink-0 text-gray-500 hover:text-gray-900";
            });

            // Show active panel & button style
            const activeEl = document.getElementById('pant-' + tabName);
            const activeBtn = document.getElementById('tab-' + tabName);
            if (activeEl) activeEl.classList.remove('hidden');
            if (activeBtn) activeBtn.className = "px-3.5 py-2 rounded-xl text-[11px] font-bold transition shrink-0 bg-blue-600 text-white shadow-sm";
        }

        function toggleWaliField() {
            const isChecked = document.getElementById('has_wali_checkbox').checked;
            const waliForm = document.getElementById('container-wali-form');
            if (isChecked) {
                waliForm.classList.remove('hidden');
            } else {
                waliForm.classList.add('hidden');
            }
        }

        // ================= ADMIN PHOTO CROPPER MECHANICS ENGINE =================
        let adminImg = new Image();
        let adminZoom = 1.0;
        let adminRotation = 0;
        let adminPanX = 0;
        let adminPanY = 0;
        
        let isAdminDragging = false;
        let adminStartX = 0;
        let adminStartY = 0;

        function handleAdminFileSelect(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    adminImg.onload = function() {
                        adminZoom = 1.0;
                        adminRotation = 0;
                        adminPanX = 0;
                        adminPanY = 0;
                        
                        document.getElementById('admin_crop_workshop').classList.remove('hidden');
                        document.getElementById('admin_crop_workshop').classList.add('flex');
                        document.getElementById('admin_drop_placeholder').classList.add('hidden');
                        
                        document.getElementById('admin_zoom_slider').value = 1.0;
                        document.getElementById('admin_zoom_display').innerText = '100%';
                        
                        renderAdminCanvas();
                        setupAdminDrag();
                    };
                    adminImg.src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        }

        function adjustAdminZoom(val) {
            adminZoom = parseFloat(val);
            document.getElementById('admin_zoom_display').innerText = Math.round(adminZoom * 100) + '%';
            renderAdminCanvas();
        }

        function rotateAdminLeft() {
            adminRotation = (adminRotation - 90) % 360;
            renderAdminCanvas();
        }

        function rotateAdminRight() {
            adminRotation = (adminRotation + 90) % 360;
            renderAdminCanvas();
        }

        function resetAdminTransforms() {
            adminZoom = 1.0;
            adminRotation = 0;
            adminPanX = 0;
            adminPanY = 0;
            document.getElementById('admin_zoom_slider').value = 1.0;
            document.getElementById('admin_zoom_display').innerText = '100%';
            renderAdminCanvas();
        }

        function cancelAdminCrop() {
            document.getElementById('admin_crop_workshop').classList.add('hidden');
            document.getElementById('admin_crop_workshop').classList.remove('flex');
            document.getElementById('admin_drop_placeholder').classList.remove('hidden');
            document.getElementById('admin_file_picker').value = '';
        }

        function renderAdminCanvas() {
            const canvas = document.getElementById('admin_cropper_canvas');
            if (!canvas || !adminImg.src) return;
            const ctx = canvas.getContext('2d');
            const w = canvas.width;  // 300
            const h = canvas.height; // 400
            
            ctx.clearRect(0,  0, w, h);
            ctx.save();
            
            // Translate center
            ctx.translate(w / 2 + adminPanX, h / 2 + adminPanY);
            ctx.rotate((adminRotation * Math.PI) / 180);
            
            let imgRatio = adminImg.width / adminImg.height;
            let canvasRatio = w / h;
            let baseScale = 1;
            
            if (imgRatio > canvasRatio) {
                baseScale = h / adminImg.height;
            } else {
                baseScale = w / adminImg.width;
            }
            
            let drawWidth = adminImg.width * baseScale * adminZoom;
            let drawHeight = adminImg.height * baseScale * adminZoom;
            
            ctx.drawImage(adminImg, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
            ctx.restore();
        }

        function setupAdminDrag() {
            const canvas = document.getElementById('admin_cropper_canvas');
            if (!canvas) return;
            
            const startDrag = (clientX, clientY) => {
                isAdminDragging = true;
                adminStartX = clientX - adminPanX;
                adminStartY = clientY - adminPanY;
                canvas.style.cursor = 'grabbing';
            };
            
            const moveDrag = (clientX, clientY) => {
                if (!isAdminDragging) return;
                adminPanX = clientX - adminStartX;
                adminPanY = clientY - adminStartY;
                renderAdminCanvas();
            };
            
            const endDrag = () => {
                isAdminDragging = false;
                canvas.style.cursor = 'grab';
            };
            
            canvas.onmousedown = (e) => startDrag(e.clientX, e.clientY);
            canvas.onmousemove = (e) => moveDrag(e.clientX, e.clientY);
            canvas.onmouseup = endDrag;
            canvas.onmouseleave = endDrag;
            
            // Touch support for mobiles
            canvas.ontouchstart = (e) => {
                if (e.touches.length === 1) {
                    startDrag(e.touches[0].clientX, e.touches[0].clientY);
                }
            };
            canvas.ontouchmove = (e) => {
                if (isAdminDragging && e.touches.length === 1) {
                    moveDrag(e.touches[0].clientX, e.touches[0].clientY);
                    e.preventDefault();
                }
            };
            canvas.ontouchend = endDrag;
        }

        function saveAdminCrop() {
            const canvas = document.getElementById('admin_cropper_canvas');
            if (canvas && adminImg.src) {
                const b64 = canvas.toDataURL('image/jpeg', 0.9);
                document.getElementById('foto_base64').value = b64;
                document.getElementById('final_image_preview').src = b64;
                
                // Update badge & buttons
                const badge = document.getElementById('photo_status_badge');
                if (badge) {
                     badge.className = "bg-emerald-50 text-emerald-700 border-emerald-100 inline-block px-3 py-1 rounded-full text-[9px] font-bold border uppercase tracking-wider mb-3 leading-none";
                     badge.innerText = "Pas Foto Terunggah";
                }
                
                // Hide editor workshop
                document.getElementById('admin_crop_workshop').classList.add('hidden');
                document.getElementById('admin_crop_workshop').classList.remove('flex');
                document.getElementById('admin_drop_placeholder').classList.remove('hidden');
            }
        }

        function clearPhoto() {
            if (confirm('Apakah Anda yakin ingin menghapus pas foto siswa ini?')) {
                document.getElementById('foto_base64').value = '';
                document.getElementById('final_image_preview').src = 'data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22160%22 viewBox=%220 0 120 160%22><rect width=%22120%22 height=%22160%22 fill=%22%23f1f5f9%22/><text x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22sans-serif%22 font-size=%2210%22 fill=%22%2394a3b8%22>Pas Foto 3x4</text></svg>';
                
                const badge = document.getElementById('photo_status_badge');
                if (badge) {
                    badge.className = "bg-slate-100 text-slate-550 border-slate-200 inline-block px-3 py-1 rounded-full text-[9px] font-bold border uppercase tracking-wider mb-3 leading-none";
                    badge.innerText = "Belum Ada Foto";
                }
                
                const btnClear = document.getElementById('btn_clear_photo');
                if (btnClear) {
                    btnClear.remove();
                }
            }
        }
    </script>
</body>
</html>
