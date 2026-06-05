<?php
require_once 'config.php';

// Proteksi Halaman Siswa
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'SISWA') {
    redirect('login.php');
}

$student_id = $_SESSION['student_id'];

// Ambil data siswa terkini
$stmt = $db->prepare("SELECT * FROM students WHERE id = ?");
$stmt->execute([$student_id]);
$student = $stmt->fetch();

if (!$student) {
    set_flash_message("Identitas akun siswa tidak valid di database!", "danger");
    redirect('logout.php');
}

// Helper untuk merender kolom data interaktif dengan fitur usulan koreksi langsung
function render_field($fieldName, $fieldLabel, $value, $isMono = false) {
    global $student;
    $dispValue = !empty($value) ? esc($value) : '-';
    $monoClass = $isMono ? 'font-mono' : '';
    ?>
    <div class="p-3 bg-slate-50 hover:bg-blue-50/25 rounded-2xl border border-gray-150 hover:border-blue-100 transition flex items-start justify-between gap-3 group relative overflow-hidden">
        <div class="min-w-0 flex-1 pr-1.5">
            <span class="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-1 leading-none"><?= esc($fieldLabel) ?></span>
            <span class="font-bold text-slate-800 text-[11.5px] break-all leading-tight <?= $monoClass ?>"><?= $dispValue ?></span>
        </div>
        <button type="button" onclick="openCorrection('<?= esc($fieldName) ?>', '<?= esc($fieldLabel) ?>', this.closest('div').querySelector('.break-all').innerText.trim())" class="opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 transition duration-150 px-2 py-1 bg-white hover:bg-blue-600 text-blue-700 hover:text-white rounded-lg text-[9.5px] font-black border border-gray-250 hover:border-blue-400 flex items-center gap-1 cursor-pointer shadow-xs whitespace-nowrap shrink-0">
            <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
            <span>Revisi</span>
        </button>
    </div>
    <?php
}

// Handle pengajuan revisi
$is_revision_modal_open = false;
$revision_error = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action_submit_revision'])) {
        $field_name = $_POST['field_name'] ?? '';
        $field_label = $_POST['field_label'] ?? '';
        $new_value = trim($_POST['new_value'] ?? '');
        
        // Tarik nilai lama dari database untuk dicocokkan
        $old_value = isset($student[$field_name]) ? $student[$field_name] : '';

        if (empty($field_name) || empty($field_label) || empty($new_value)) {
            $revision_error = "Harap tentukan kolom isian dan nilai usulan baru!";
        } else {
            // Simpan usulan ke tabel correction_requests
            $ins_stmt = $db->prepare("
                INSERT INTO correction_requests (student_id, student_nisn, student_nama, field_name, field_label, old_value, new_value, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'Diproses')
            ");
            $ins_stmt->execute([
                $student_id,
                $student['nisn'],
                $student['nama_lengkap'],
                $field_name,
                $field_label,
                $old_value,
                $new_value
            ]);

            set_flash_message("Usulan revisi biodata '{$field_label}' berhasil dikirimkan ke Staf Tata Usaha Sekolah!", "success");
            redirect('student_dashboard.php');
        }
    } elseif (isset($_POST['action_update_photo'])) {
        $photo_base64 = trim($_POST['photo_base64'] ?? '');
        if (!empty($photo_base64)) {
            $up_stmt = $db->prepare("UPDATE students SET foto = ? WHERE id = ?");
            $up_stmt->execute([$photo_base64, $student_id]);
            set_flash_message("Identitas Pas Foto profil Anda berhasil disinkronisasi ke basis data Buku Induk!", "success");
            redirect('student_dashboard.php');
        } else {
            set_flash_message("Gagal memperbarui: Berkas pas foto kosong atau tidak valid!", "danger");
            redirect('student_dashboard.php');
        }
    }
}

// Ambil riwayat usulan revisi aktif dari murid ini
$hist_stmt = $db->prepare("SELECT * FROM correction_requests WHERE student_id = ? ORDER BY request_date DESC");
$hist_stmt->execute([$student_id]);
$revisions = $hist_stmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portal Siswa SMANSA Buku Induk | SMAN 1 Purwokerto</title>
    <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <style>
        body { font-family: "Inter", sans-serif; background-color: #f8fafc; }
    </style>
</head>
<body class="min-h-screen bg-slate-50 flex flex-col justify-between">

    <!-- Header Navigation Section -->
    <header class="bg-slate-900 text-white py-4 px-6 border-b border-slate-800 shadow-sm">
        <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-sm text-white shadow-md">S1</div>
                <div>
                    <h1 class="text-xs font-black tracking-wider uppercase text-slate-100">Buku Induk Digital</h1>
                    <p class="text-[9px] text-gray-400 font-medium">Portal Mandiri Siswa SMAN 1 Purwokerto</p>
                </div>
            </div>
            
            <div class="flex items-center gap-4">
                <div class="text-right">
                    <p class="text-[11px] font-bold text-slate-200"><?= esc($student['nama_lengkap']) ?></p>
                    <p class="text-[9.5px] text-gray-400 font-medium font-mono"><?= esc($student['kelas_sekarang']) ?> &middot; NISN: <?= esc($student['nisn']) ?></p>
                </div>
                <!-- Logout Button -->
                <a href="logout.php" onclick="return confirm('Apakah Anda yakin ingin keluar dari portal siswa?')" class="p-2 bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-400 border border-slate-700 hover:border-rose-900 rounded-xl transition flex items-center gap-1.5 text-xs font-bold font-sans">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                    <span>Keluar</span>
                </a>
            </div>
        </div>
    </header>

    <!-- Main Container -->
    <main class="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- Left Sidebar: Profil Ringkas & Cetak & Pengajuan Status -->
        <div class="lg:col-span-4 space-y-6">
            
            <!-- Profil Card -->
            <div class="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm flex flex-col items-center text-center space-y-4">
                <div class="relative group">
                    <?php if ($student['foto']): ?>
                        <img id="avatar_display" src="<?= $student['foto'] ?>" class="w-32 h-32 rounded-full border-4 border-white ring-4 ring-slate-100 object-cover shadow-sm bg-slate-50">
                    <?php else: ?>
                        <div id="avatar_display_placeholder" class="w-32 h-32 rounded-full bg-slate-100 text-slate-400 font-extrabold flex items-center justify-center border-4 border-white ring-4 ring-slate-100 uppercase text-3xl shadow-sm">
                            <?= substr($student['nama_lengkap'], 0, 2) ?>
                        </div>
                    <?php endif; ?>
                </div>

                <div class="w-full">
                    <span class="inline-block px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-[9px] font-bold text-blue-700 uppercase tracking-widest leading-none mb-2.5">MASUK SISWA</span>
                    <h3 class="text-md font-black text-slate-850 tracking-tight leading-tight"><?= esc($student['nama_lengkap']) ?></h3>
                    <p class="text-xs text-gray-400 font-semibold font-sans mt-1">NISN: <?= esc($student['nisn']) ?> &middot; Kelas: <?= esc($student['kelas_sekarang']) ?></p>
                    
                    <button type="button" onclick="openPhotoModal()" class="w-full mt-4 py-2 px-3.5 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1.5 border border-gray-200 hover:border-blue-200 cursor-pointer shadow-xs">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        <span>Ubah / Cetak Pas Foto</span>
                    </button>
                </div>
            </div>

            <!-- Print Actions Security Authorization -->
            <div class="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm space-y-4">
                <div class="border-b pb-2">
                    <h4 class="font-bold text-slate-800 text-xs">Cetak Lembar Dokumen Resmi</h4>
                    <p class="text-[10.5px] text-gray-400 font-medium">Mandiri menggunakan kertas ukuran F4/Folio</p>
                </div>

                <?php if ($student['allow_print']): ?>
                    <div class="bg-emerald-50 border border-emerald-100 p-3.5 rounded-2xl flex items-center gap-2.5 text-emerald-800 text-[10.5px] font-bold leading-relaxed mb-4">
                        <svg class="w-4 h-4 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                        <span>Izin Cetak Mandiri Aktif. Anda dapat mencetak/mengunduh dokumen lembar buku induk secara langsung.</span>
                    </div>

                    <div class="space-y-2">
                        <a href="print_view.php?student_id=<?= $student['id'] ?>&doc=BUKU_INDUK" target="_blank" class="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                            <span>Lembar Buku Induk Murid</span>
                        </a>
                        <a href="print_view.php?student_id=<?= $student['id'] ?>&doc=PERNYATAAN_SISWA" target="_blank" class="w-full py-1.5 bg-slate-100 hover:bg-slate-250 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-gray-250">
                            Cetak Surat Pernyataan Siswa
                        </a>
                        <a href="print_view.php?student_id=<?= $student['id'] ?>&doc=PERNYATAAN_WALI" target="_blank" class="w-full py-1.5 bg-slate-100 hover:bg-slate-250 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-gray-250">
                            Cetak Surat Pernyataan Orang Tua
                        </a>
                    </div>
                <?php else: ?>
                    <div class="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-start gap-2.5 text-amber-800 text-[10.5px] font-bold leading-relaxed mb-2">
                        <svg class="w-5 h-5 text-amber-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
                        <span>Izin Cetak Dinonaktifkan. Silakan hubungi operator kesiswaan staf TU SMANSA untuk meminta otorisasi cetak biodata.</span>
                    </div>
                <?php endif; ?>
            </div>

            <!-- Petunjuk Koreksi Data Terintegrasi -->
            <div class="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm space-y-3.5">
                <div class="flex items-start gap-3">
                    <div class="p-2 bg-blue-50 text-blue-600 rounded-xl">
                        <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <div>
                        <h4 class="font-bold text-slate-800 text-xs">Petunjuk Koreksi Biodata</h4>
                        <p class="text-[10.5px] text-gray-400 mt-0.5 leading-normal">Kini mengajukan revisi jauh lebih simpel & praktis!</p>
                    </div>
                </div>
                <p class="text-[11px] text-gray-500 leading-relaxed font-sans">
                    Untuk memperbaiki kesalahan ketik pada data kearsipan Anda, silakan beralih ke panel <strong>Pratinjau Lembar Buku Induk Saya</strong>, temukan baris data terkait, lalu klik tombol <span class="text-blue-600 font-bold">"Revisi"</span> yang muncul di sisi kanan butir isian tersebut.
                </p>
                <div class="border-t pt-3 flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    <span>Satu Pintu Kearsipan</span>
                    <span class="text-blue-600 font-black">SMAN 1 Purwokerto</span>
                </div>
            </div>

        </div>

        <!-- Right Side: Full Biodata Read-Only Views Grouped & Revison Track Histories -->
        <div class="lg:col-span-8 space-y-6">
            
            <?php display_flash_message(); ?>

            <!-- Full Read Only Biodata Section -->
            <div class="bg-white rounded-3xl border border-gray-150 p-6 md:p-8 space-y-6 shadow-sm">
                
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                    <div class="flex items-center gap-3">
                        <div class="p-2 bg-blue-50 text-blue-600 rounded-xl">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 1 1 .512 1.353l-.041.02-.041-.02a.75.75 0 1 1 .512-1.353l.041.02ZM21 12c0 1.66-4.03 3-9 3s-9-1.34-9-3 4.03-3 9-3 9 1.34 9 3Zm0 3c0 1.66-4.03 3-9 3s-9-1.34-9-3M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3m0-3c0 1.66-4.03 3-9 3s-9-1.34-9-3"></path></svg>
                        </div>
                        <div>
                            <h3 class="font-bold text-slate-800 text-sm">Pratinjau Lembar Buku Induk Saya</h3>
                            <p class="text-[10.5px] text-gray-400 font-sans font-medium">Buku pendaftaran murid baru yang sah terdokumentasikan di sekolah SMANSA</p>
                        </div>
                    </div>
                </div>

                <!-- Navigation Tabs Grid -->
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-gray-200">
                    <button type="button" id="btn_tab_identitas" onclick="switchTab('tab_identitas')" class="tab-btn py-2.5 px-3.5 bg-blue-600 text-white rounded-xl text-[11px] font-bold text-center border transition cursor-pointer" style="border-color: transparent">
                        👤 Identitas & Jasmani
                    </button>
                    <button type="button" id="btn_tab_kependudukan" onclick="switchTab('tab_kependudukan')" class="tab-btn py-2.5 px-3.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-[11px] font-bold text-center border border-transparent transition cursor-pointer">
                        📑 Dokumen & Akta
                    </button>
                    <button type="button" id="btn_tab_akademik" onclick="switchTab('tab_akademik')" class="tab-btn py-2.5 px-3.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-[11px] font-bold text-center border border-transparent transition cursor-pointer">
                        🎓 Akademik & Minat
                    </button>
                    <button type="button" id="btn_tab_keluarga" onclick="switchTab('tab_keluarga')" class="tab-btn py-2.5 px-3.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-[11px] font-bold text-center border border-transparent transition cursor-pointer">
                        👨‍👩‍👦 Orang Tua & Wali
                    </button>
                </div>

                <!-- ================= TAB CONTENT 1: IDENTITAS & JASMANI ================= -->
                <div id="tab_identitas" class="tab-content space-y-6">
                    <!-- Section A -->
                    <div class="space-y-3">
                        <div class="flex items-center gap-1.5 pb-1 border-b border-slate-100">
                            <span class="w-1.5 h-3 bg-blue-600 rounded-full"></span>
                            <h4 class="text-[10px] font-black uppercase tracking-widest text-blue-705">A. Keterangan Tentang Diri Peserta Didik</h4>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            <?php render_field('nama_lengkap', 'Nama Lengkap Siswa sesuai akta', $student['nama_lengkap']); ?>
                            <?php render_field('nama_panggilan', 'Nama Panggilan', $student['nama_panggilan']); ?>
                            <?php render_field('jenis_kelamin', 'Jenis Kelamin', $student['jenis_kelamin']); ?>
                            <?php render_field('tempat_lahir', 'Tempat Lahir', $student['tempat_lahir']); ?>
                            <?php render_field('tanggal_lahir', 'Tanggal Lahir', $student['tanggal_lahir'], true); ?>
                            <?php render_field('agama', 'Agama / Kepercayaan', $student['agama']); ?>
                            <?php render_field('kewarganegaraan', 'Kewarganegaraan', $student['kewarganegaraan']); ?>
                            <?php render_field('bahasa_sehari_hari', 'Bahasa Sehari-hari', $student['bahasa_sehari_hari']); ?>
                        </div>
                    </div>

                    <!-- Section B -->
                    <div class="space-y-3 pt-2">
                        <div class="flex items-center gap-1.5 pb-1 border-b border-slate-100">
                            <span class="w-1.5 h-3 bg-blue-600 rounded-full"></span>
                            <h4 class="text-[10px] font-black uppercase tracking-widest text-blue-705">B. Status Hubungan di Keluarga</h4>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            <?php render_field('status_keluarga', 'Status Hubungan Keluarga', $student['status_keluarga']); ?>
                            <?php render_field('anak_ke', 'Anak Ke-', $student['anak_ke']); ?>
                            <?php render_field('saudara_kandung', 'Jumlah Saudara Kandung', $student['saudara_kandung']); ?>
                            <?php render_field('saudara_tiri', 'Jumlah Saudara Tiri', $student['saudara_tiri']); ?>
                            <?php render_field('saudara_angkat', 'Jumlah Saudara Angkat', $student['saudara_angkat']); ?>
                            <?php render_field('saudara_kembar', 'Jumlah Saudara Kembar', $student['saudara_kembar']); ?>
                            <?php render_field('anak_yatim_piatu', 'Status Yatim / Piatu', $student['anak_yatim_piatu']); ?>
                        </div>
                    </div>

                    <!-- Section C -->
                    <div class="space-y-3 pt-2">
                        <div class="flex items-center gap-1.5 pb-1 border-b border-slate-100">
                            <span class="w-1.5 h-3 bg-blue-600 rounded-full"></span>
                            <h4 class="text-[10px] font-black uppercase tracking-widest text-blue-705">C. Keterangan Tempat Tinggal & Komuter</h4>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            <div class="sm:col-span-2">
                                <?php render_field('alamat_lengkap', 'Alamat Lengkap Domisili (Sesuai KK)', $student['alamat_lengkap']); ?>
                            </div>
                            <?php render_field('telepon', 'Nomor Telepon Rumah / HP Aktif', $student['telepon'], true); ?>
                            <?php render_field('tinggal_dengan', 'Tinggal Dengan', $student['tinggal_dengan']); ?>
                            <?php render_field('jarak_ke_sekolah', 'Jarak Tempat Tinggal ke Sekolah', $student['jarak_ke_sekolah']); ?>
                            <?php render_field('transportasi', 'Transportasi Utama ke Sekolah', $student['transportasi']); ?>
                        </div>
                    </div>

                    <!-- Section D -->
                    <div class="space-y-3 pt-2">
                        <div class="flex items-center gap-1.5 pb-1 border-b border-slate-100">
                            <span class="w-1.5 h-3 bg-blue-600 rounded-full"></span>
                            <h4 class="text-[10px] font-black uppercase tracking-widest text-blue-705">D. Keterangan Jasmani & Kesehatan</h4>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            <?php render_field('golongan_darah', 'Golongan Darah', $student['golongan_darah']); ?>
                            <?php render_field('tinggi_badan', 'Tinggi Badan (cm)', $student['tinggi_badan']); ?>
                            <?php render_field('berat_badan', 'Berat Badan (kg)', $student['berat_badan']); ?>
                            <div class="sm:col-span-3">
                                <?php render_field('penyakit_pernah_diderita', 'Riwayat Penyakit yang Pernah Diderita', $student['penyakit_pernah_diderita']); ?>
                            </div>
                            <div class="sm:col-span-3">
                                <?php render_field('kelainan_jasmani', 'Kelainan Jasmani / Kebutuhan Khusus', $student['kelainan_jasmani']); ?>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ================= TAB CONTENT 2: KEPENDUDUKAN & REGISTRASI ================= -->
                <div id="tab_kependudukan" class="tab-content space-y-6 hidden">
                    <!-- Section A -->
                    <div class="space-y-3">
                        <div class="flex items-center gap-1.5 pb-1 border-b border-slate-100">
                            <span class="w-1.5 h-3 bg-blue-600 rounded-full"></span>
                            <h4 class="text-[10px] font-black uppercase tracking-widest text-blue-705">A. Dokumen Resmi Kependudukan & Registrasi</h4>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            <?php render_field('nisn', 'Nomor Induk Siswa Nasional (NISN)', $student['nisn'], true); ?>
                            <?php render_field('nis', 'Nomor Induk Sekolah (NIS Lokal)', $student['nis'], true); ?>
                            <?php render_field('nik', 'Nomor Induk Kependudukan (NIK)', $student['nik'], true); ?>
                            <?php render_field('no_pendaftaran', 'Nomor Pendaftaran PPDB', $student['no_pendaftaran'], true); ?>
                            <?php render_field('no_kk', 'Nomor Kartu Keluarga (KK)', $student['no_kk'], true); ?>
                            <?php render_field('no_kip', 'Nomor KIP (Kartu Indonesia Pintar)', $student['no_kip'], true); ?>
                            <?php render_field('id_dtks', 'ID DTKS Terdaftar', $student['id_dtks'], true); ?>
                        </div>
                    </div>

                    <!-- Section B -->
                    <div class="space-y-3 pt-2">
                        <div class="flex items-center gap-1.5 pb-1 border-b border-slate-100">
                            <span class="w-1.5 h-3 bg-blue-600 rounded-full"></span>
                            <h4 class="text-[10px] font-black uppercase tracking-widest text-blue-705">B. Keanggotaan SMAN 1 Purwokerto</h4>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            <?php render_field('kelas_sekarang', 'Rombel Kelas Saat Ini', $student['kelas_sekarang']); ?>
                            <?php render_field('program_keahlian', 'Program Keahlian / Pilihan Jurusan', $student['program_keahlian']); ?>
                            <?php render_field('tanggal_masuk', 'Tanggal Terdaftar Masuk', $student['tanggal_masuk'], true); ?>
                            <?php render_field('nomor_stb', 'Nomor Buku Induk SMANSA (STB)', $student['nomor_stb'], true); ?>
                            <?php render_field('beasiswa', 'Status / Beasiswa Ko-kurikuler', $student['beasiswa']); ?>
                            <?php render_field('tanggal_keluar', 'Tanggal Keluar / Mutasi Sekolah', $student['tanggal_keluar'], true); ?>
                            <div class="sm:col-span-3">
                                <?php render_field('alasan_keluar', 'Alasan Keluar / Drop Out / Mutasi', $student['alasan_keluar']); ?>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ================= TAB CONTENT 3: AKADEMIK & MINAT ================= -->
                <div id="tab_akademik" class="tab-content space-y-6 hidden">
                    <!-- Section A -->
                    <div class="space-y-3">
                        <div class="flex items-center gap-1.5 pb-1 border-b border-slate-100">
                            <span class="w-1.5 h-3 bg-blue-600 rounded-full"></span>
                            <h4 class="text-[10px] font-black uppercase tracking-widest text-blue-705">A. Asal Sekolah Menengah Pertama (SMP/MTs)</h4>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            <?php render_field('lulusan_dari', 'Nama Sekolah Asal SMP/MTs', $student['lulusan_dari']); ?>
                            <?php render_field('tanggal_ijazah', 'Tanggal Ijazah / Kelulusan', $student['tanggal_ijazah'], true); ?>
                            <?php render_field('nomor_ijazah', 'Nomor Surat Ijazah Kelulusan', $student['nomor_ijazah'], true); ?>
                            <?php render_field('pindahan_dari', 'Nama Sekolah Pindahan (Mutasi Masuk)', $student['pindahan_dari']); ?>
                            <?php render_field('lama_belajar', 'Lama Belajar di SMP (Tahun)', $student['lama_belajar']); ?>
                            <div class="sm:col-span-3">
                                <?php render_field('alasan_pindah', 'Alasan Mutasi Pindah Masuk', $student['alasan_pindah']); ?>
                            </div>
                        </div>
                    </div>

                    <!-- Section B -->
                    <div class="space-y-3 pt-2">
                        <div class="flex items-center gap-1.5 pb-1 border-b border-slate-100">
                            <span class="w-1.5 h-3 bg-blue-600 rounded-full"></span>
                            <h4 class="text-[10px] font-black uppercase tracking-widest text-blue-705">B. Rerata Nilai Rapor Evaluasi SMP/MTs</h4>
                        </div>
                        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            <?php render_field('rerata_agama', 'Pendidikan Agama', $student['rerata_agama'], true); ?>
                            <?php render_field('rerata_ppkn', 'PPKn', $student['rerata_ppkn'], true); ?>
                            <?php render_field('rerata_b_indonesia', 'B. Indonesia', $student['rerata_b_indonesia'], true); ?>
                            <?php render_field('rerata_matematika', 'Matematika', $student['rerata_matematika'], true); ?>
                            <?php render_field('rerata_ipa', 'IPA', $student['rerata_ipa'], true); ?>
                            <?php render_field('rerata_ips', 'IPS', $student['rerata_ips'], true); ?>
                            <?php render_field('rerata_b_inggris', 'B. Inggris', $student['rerata_b_inggris'], true); ?>
                        </div>
                    </div>

                    <!-- Section C -->
                    <div class="space-y-3 pt-2">
                        <div class="flex items-center gap-1.5 pb-1 border-b border-slate-100">
                            <span class="w-1.5 h-3 bg-blue-600 rounded-full"></span>
                            <h4 class="text-[10px] font-black uppercase tracking-widest text-blue-705">C. Prestasi & Rekam Bakat Kegiatan</h4>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <?php render_field('prestasi_akademik', 'Keterangan Prestasi Akademik', $student['prestasi_akademik']); ?>
                            <?php render_field('prestasi_non_akademik', 'Keterangan Prestasi Non-Akademik', $student['prestasi_non_akademik']); ?>
                            <?php render_field('kesenian', 'Kegemaran Kesenian / Seni', $student['kesenian']); ?>
                            <?php render_field('olahraga', 'Kegemaran Cabang Olahraga', $student['olahraga']); ?>
                            <div class="sm:col-span-2">
                                <?php render_field('organisasi', 'Pengalaman / Keanggotaan Organisasi Siswa', $student['organisasi']); ?>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ================= TAB CONTENT 4: DATA ORANG TUA & WALI ================= -->
                <div id="tab_keluarga" class="tab-content space-y-6 hidden">
                    <!-- Section A -->
                    <div class="space-y-3">
                        <div class="flex items-center gap-1.5 pb-1 border-b border-slate-100">
                            <span class="w-1.5 h-3 bg-blue-600 rounded-full"></span>
                            <h4 class="text-[10px] font-black uppercase tracking-widest text-blue-705">A. Keterangan Tentang Ayah Kandung</h4>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            <?php render_field('ayah_nama', 'Nama Lengkap Ayah Kandung', $student['ayah_nama']); ?>
                            <?php render_field('ayah_is_masih_hidup', 'Keberadaan Ayah (1: Hidup / 0: Wafat)', $student['ayah_is_masih_hidup'] ? '1 (Masih Hidup)' : '0 (Wafat)', true); ?>
                            <?php render_field('ayah_nik', 'Nomor NIK Ayah', $student['ayah_nik'], true); ?>
                            <?php render_field('ayah_tempat_lahir', 'Tempat Lahir Ayah', $student['ayah_tempat_lahir']); ?>
                            <?php render_field('ayah_tanggal_lahir', 'Tanggal Lahir Ayah', $student['ayah_tanggal_lahir'], true); ?>
                            <?php render_field('ayah_agama', 'Agama Ayah', $student['ayah_agama']); ?>
                            <?php render_field('ayah_kewarganegaraan', 'Kewarganegaraan Ayah', $student['ayah_kewarganegaraan']); ?>
                            <?php render_field('ayah_pendidikan', 'Pendidikan Terakhir Ayah', $student['ayah_pendidikan']); ?>
                            <?php render_field('ayah_pekerjaan', 'Pekerjaan Utama Ayah', $student['ayah_pekerjaan']); ?>
                            <?php render_field('ayah_penghasilan', 'Estimasi Rerata Penghasilan Ayah', $student['ayah_penghasilan']); ?>
                            <?php render_field('ayah_telepon', 'Nomor HP / Telepon Ayah', $student['ayah_telepon'], true); ?>
                            <div class="sm:col-span-2">
                                <?php render_field('ayah_alamat', 'Alamat Rumah Ayah Kandung', $student['ayah_alamat']); ?>
                            </div>
                        </div>
                    </div>

                    <!-- Section B -->
                    <div class="space-y-3 pt-2">
                        <div class="flex items-center gap-1.5 pb-1 border-b border-slate-100">
                            <span class="w-1.5 h-3 bg-blue-600 rounded-full"></span>
                            <h4 class="text-[10px] font-black uppercase tracking-widest text-blue-705">B. Keterangan Tentang Ibu Kandung</h4>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            <?php render_field('ibu_nama', 'Nama Lengkap Ibu Kandung', $student['ibu_nama']); ?>
                            <?php render_field('ibu_is_masih_hidup', 'Keberadaan Ibu (1: Hidup / 0: Wafat)', $student['ibu_is_masih_hidup'] ? '1 (Masih Hidup)' : '0 (Wafat)', true); ?>
                            <?php render_field('ibu_nik', 'Nomor NIK Ibu', $student['ibu_nik'], true); ?>
                            <?php render_field('ibu_tempat_lahir', 'Tempat Lahir Ibu', $student['ibu_tempat_lahir']); ?>
                            <?php render_field('ibu_tanggal_lahir', 'Tanggal Lahir Ibu', $student['ibu_tanggal_lahir'], true); ?>
                            <?php render_field('ibu_agama', 'Agama Ibu', $student['ibu_agama']); ?>
                            <?php render_field('ibu_kewarganegaraan', 'Kewarganegaraan Ibu', $student['ibu_kewarganegaraan']); ?>
                            <?php render_field('ibu_pendidikan', 'Pendidikan Terakhir Ibu', $student['ibu_pendidikan']); ?>
                            <?php render_field('ibu_pekerjaan', 'Pekerjaan Utama Ibu', $student['ibu_pekerjaan']); ?>
                            <?php render_field('ibu_penghasilan', 'Estimasi Rerata Penghasilan Ibu', $student['ibu_penghasilan']); ?>
                            <?php render_field('ibu_telepon', 'Nomor HP / Telepon Ibu', $student['ibu_telepon'], true); ?>
                            <div class="sm:col-span-2">
                                <?php render_field('ibu_alamat', 'Alamat Rumah Ibu Kandung', $student['ibu_alamat']); ?>
                            </div>
                        </div>
                    </div>

                    <!-- Section C -->
                    <div class="space-y-3 pt-2">
                        <div class="flex items-center gap-1.5 pb-1 border-b border-slate-100">
                            <span class="w-1.5 h-3 bg-blue-600 rounded-full"></span>
                            <h4 class="text-[10px] font-black uppercase tracking-widest text-blue-705">C. Keterangan Tentang Wali Peserta Didik</h4>
                        </div>
                        <div class="bg-slate-50 border border-gray-150 p-4.5 rounded-2xl flex items-center justify-between gap-3 text-xs mb-4">
                            <span class="font-bold text-slate-700">Terdapat Status Kepemilikan Wali Aktif?</span>
                            <div class="flex gap-2 font-black">
                                <span class="px-3 py-1 bg-<?= $student['has_wali'] ? 'blue-50 text-blue-700 border-blue-100' : 'slate-100 text-slate-500 border-slate-200' ?> border rounded-lg text-[10px] uppercase">
                                    <?= $student['has_wali'] ? 'Aktif' : 'Tidak Memiliki Wali' ?>
                                </span>
                            </div>
                        </div>
                        <?php if ($student['has_wali']): ?>
                            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                <?php render_field('wali_nama', 'Nama Lengkap Wali Siswa', $student['wali_nama']); ?>
                                <?php render_field('wali_hubungan_siswa', 'Hubungan Kekerabatan Siswa', $student['wali_hubungan_siswa']); ?>
                                <?php render_field('wali_nik', 'Nomor NIK Wali', $student['wali_nik'], true); ?>
                                <?php render_field('wali_tempat_lahir', 'Tempat Lahir Wali', $student['wali_tempat_lahir']); ?>
                                <?php render_field('wali_tanggal_lahir', 'Tanggal Lahir Wali', $student['wali_tanggal_lahir'], true); ?>
                                <?php render_field('wali_agama', 'Agama Wali', $student['wali_agama']); ?>
                                <?php render_field('wali_kewarganegaraan', 'Kewarganegaraan Wali', $student['wali_kewarganegaraan']); ?>
                                <?php render_field('wali_pendidikan', 'Pendidikan Terakhir Wali', $student['wali_pendidikan']); ?>
                                <?php render_field('wali_pekerjaan', 'Pekerjaan Utama Wali', $student['wali_pekerjaan']); ?>
                                <?php render_field('wali_penghasilan', 'Estimasi Rerata Penghasilan Wali', $student['wali_penghasilan']); ?>
                                <?php render_field('wali_telepon', 'Nomor HP / Telepon Wali', $student['wali_telepon'], true); ?>
                                <div class="sm:col-span-2">
                                    <?php render_field('wali_alamat', 'Alamat Rumah Tinggal Wali', $student['wali_alamat']); ?>
                                </div>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>

            </div>

            <!-- Histories Tracker of Student Submissions -->
            <div class="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm">
                <div class="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
                    <svg class="w-4 h-4 text-gray-450" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <h4 class="font-bold text-slate-850 text-xs">Riwayat Ajuan Koreksi Kearsipan Anda</h4>
                </div>

                <?php if (empty($revisions)): ?>
                    <p class="py-6 text-center text-gray-400 font-medium text-xs">Sejauh ini belum ada permohonan koreksi pengetikan berkas buku induk yang dikirimkan.</p>
                <?php else: ?>
                    <div class="overflow-x-auto border border-gray-150 rounded-2xl">
                        <table class="w-full text-left text-[11px] border-collapse font-sans">
                            <thead class="bg-gray-50 text-gray-500 font-bold uppercase text-[9px] border-b border-gray-150">
                                <tr>
                                    <th class="py-2.5 px-4">Elemen Data</th>
                                    <th class="py-2.5 px-4 font-mono">Usulan Baru</th>
                                    <th class="py-2.5 px-4 text-center">Status Verifikasi</th>
                                    <th class="py-2.5 px-4">Catatan Operator TU</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-150 text-slate-600">
                                <?php foreach ($revisions as $rv): ?>
                                    <tr>
                                        <td class="py-2.5 px-4 font-bold text-slate-750"><?= esc($rv['field_label']) ?></td>
                                        <td class="py-2.5 px-4 font-mono text-slate-700"><?= esc($rv['new_value']) ?></td>
                                        <td class="py-2.5 px-4 text-center">
                                            <?php if ($rv['status'] === 'Diproses'): ?>
                                                <span class="p-0.5 px-2 bg-blue-50 text-blue-700 rounded-full font-black text-[9px]">DIPROSES</span>
                                            <?php elseif ($rv['status'] === 'Disetujui'): ?>
                                                <span class="p-0.5 px-2 bg-emerald-50 text-emerald-800 rounded-full font-black text-[9px]">DISETUJUI</span>
                                            <?php else: ?>
                                                <span class="p-0.5 px-2 bg-rose-50 text-rose-800 rounded-full font-black text-[9px]">DITOLAK</span>
                                            <?php endif; ?>
                                        </td>
                                        <td class="py-2.5 px-4 italic text-gray-400 text-[10.5px]"><?= esc($rv['notes'] ?: '-') ?></td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                <?php endif; ?>
            </div>

        </div>

    </main>

    <!-- Footer -->
    <footer class="bg-slate-900 text-slate-400 py-6 text-center text-xs border-t border-slate-800 mt-12">
        <p>&copy; <?= date('Y') ?> SMA Negeri 1 Purwokerto. Hak Cipta Dilindungi.</p>
    </footer>

    <!-- MODAL POPUP UNTUK AJUKAN KOREKSI DATA SIMPEL -->
    <div id="correctionModal" class="fixed inset-0 z-50 hidden bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl border border-gray-150 max-w-md w-full overflow-hidden shadow-2xl animate-fadeIn">
            <!-- Modal Header -->
            <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-950 text-white">
                <div class="flex items-center gap-2">
                    <div class="p-1.5 bg-blue-600 rounded-lg text-white">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    </div>
                    <div>
                        <h3 class="font-bold text-[11px] uppercase tracking-wider text-slate-100">Ajukan Koreksi Data</h3>
                        <p class="text-[9px] text-gray-400 font-sans font-medium">Ubah satu per satu butir kearsipan</p>
                    </div>
                </div>
                <button type="button" onclick="closeCorrection()" class="text-gray-400 hover:text-white transition text-2xl font-bold leading-none cursor-pointer">&times;</button>
            </div>
            
            <!-- Modal Body -->
            <form method="POST" class="p-5 space-y-4">
                <input type="hidden" name="action_submit_revision" value="1">
                <input type="hidden" name="field_name" id="modal_field_name">
                <input type="hidden" name="field_label" id="modal_field_label">
                
                <div>
                    <label class="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Butir Isian yang Direvisi</label>
                    <div id="modal_field_label_display" class="px-3 py-2.5 bg-slate-50 border border-gray-150 rounded-xl text-xs font-bold text-slate-800"></div>
                </div>

                <div>
                    <label class="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Nilai Saat Ini (Terdaftar)</label>
                    <div id="modal_old_value_display" class="px-3 py-2.5 bg-rose-50/50 border border-rose-105 rounded-xl text-xs font-mono font-bold text-rose-900 break-words italic"></div>
                </div>

                <div>
                    <label class="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Nilai Perbaikan yang Benar</label>
                    <textarea name="new_value" id="modal_new_value_input" required rows="3" placeholder="Tuliskan isian data baru yang seharusnya terdaftar benar..." class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"></textarea>
                </div>

                <!-- Action Button Controls -->
                <div class="pt-3 border-t border-gray-100 flex items-center justify-end gap-2 text-xs">
                    <button type="button" onclick="closeCorrection()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition">
                        Batal
                    </button>
                    <button type="submit" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-md shadow-blue-500/10 cursor-pointer">
                        Kirim Usulan Perbaikan
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- MODAL POPUP UNTUK EDIT & UNGGAH PAS FOTO -->
    <div id="photoEditorModal" class="fixed inset-0 z-50 hidden bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl border border-gray-150 max-w-md w-full overflow-hidden shadow-2xl animate-fadeIn">
            <!-- Modal Header -->
            <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-950 text-white">
                <div class="flex items-center gap-2">
                    <div class="p-1.5 bg-blue-600 rounded-lg text-white">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    </div>
                    <div>
                        <h3 class="font-bold text-[11px] uppercase tracking-wider text-slate-100">Sesuaikan Pas Foto 3x4</h3>
                        <p class="text-[9px] text-gray-400 font-sans font-medium">Layanan mandiri pengunggahan kearsipan</p>
                    </div>
                </div>
                <button type="button" onclick="closePhotoModal()" class="text-gray-400 hover:text-white transition text-2xl font-bold leading-none cursor-pointer">&times;</button>
            </div>
            
            <!-- Modal Body -->
            <div class="p-5 space-y-4">
                
                <!-- File Drop Placeholder Area -->
                <div id="uploadPlaceholder" class="border-2 border-dashed border-gray-250 hover:border-blue-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50 hover:bg-blue-50/10 transition flex flex-col items-center justify-center gap-2.5" onclick="document.getElementById('modalFilePicker').click()">
                    <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                        <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    </div>
                    <div>
                        <p class="text-xs font-bold text-slate-800">Klik atau Seret Berkas Foto Baru</p>
                        <p class="text-[10px] text-gray-400 mt-1 font-medium leading-normal">Mendukung resolusi JPG, PNG, WEBP luring</p>
                    </div>
                    <input type="file" id="modalFilePicker" accept="image/*" class="hidden" onchange="handleFileSelect(event)">
                </div>
 
                <!-- Cropper Workshop Controls -->
                <div id="editorWorkspace" class="hidden space-y-4">
                    <div class="flex flex-col items-center justify-center gap-3">
                        <!-- Canvas Viewport with 3:4 Overlay frame -->
                        <div class="relative overflow-hidden rounded-2xl border border-gray-250 bg-slate-100 shadow-md shrink-0" style="width: 210px; height: 280px;">
                            <canvas id="photoCropperCanvas" width="300" height="400" class="w-full h-full cursor-grab"></canvas>
                            
                            <!-- Absolute guide box overlay -->
                            <div class="absolute inset-0 pointer-events-none border-[3px] border-blue-500/20 rounded-2xl flex flex-col justify-between">
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
                        <p class="text-[9px] text-gray-400 font-bold font-sans italic text-center">Geser gambar untuk pemosisian kepala. Atur perbesaran di bawah.</p>
                    </div>
 
                    <!-- Fine-tuning Slider Controls -->
                    <div class="space-y-2.5 bg-slate-50 p-3.5 rounded-2xl border border-gray-200">
                        <div>
                            <div class="flex justify-between text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                                <span>Perbesar / Skala</span>
                                <span id="zoomValPercent" class="font-mono">100%</span>
                            </div>
                            <input id="zoom_slider" type="range" min="1.0" max="4.0" step="0.02" value="1.0" class="w-full cursor-pointer accent-blue-600" oninput="adjustZoom(this.value)">
                        </div>
 
                        <div class="flex items-center justify-between pt-2 border-t border-gray-150">
                            <span class="text-[9.5px] font-extrabold text-slate-500 uppercase tracking-wider">Rotasi 90 Derajat</span>
                            <div class="flex items-center gap-1">
                                <button type="button" onclick="rotateLeft()" class="px-2.5 py-1 bg-white hover:bg-slate-100 border border-gray-250 rounded-lg text-xs font-bold text-slate-700 transition flex items-center gap-0.5">
                                    &larr; Kiri
                                </button>
                                <button type="button" onclick="rotateRight()" class="px-2.5 py-1 bg-white hover:bg-slate-100 border border-gray-250 rounded-lg text-xs font-bold text-slate-700 transition flex items-center gap-0.5">
                                    Kanan &rarr;
                                </button>
                                <button type="button" onclick="resetTransforms()" class="px-2.5 py-1 bg-white hover:bg-rose-50 border border-gray-250 hover:border-rose-100 rounded-lg text-xs font-bold text-rose-600 transition">
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
 
                <!-- Form Submit action -->
                <form id="savePhotoForm" method="POST" class="pt-3 border-t border-gray-100 flex items-center justify-end gap-2 text-xs">
                    <input type="hidden" name="action_update_photo" value="1">
                    <input type="hidden" name="photo_base64" id="photo_base64_input">
                    <button type="button" onclick="closePhotoModal()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition">
                        Batal
                    </button>
                    <button type="button" id="saveBtnSubmit" onclick="submitPhotoForm()" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-md shadow-blue-500/10 cursor-pointer disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed" disabled>
                        Terapkan & Simpan Foto
                    </button>
                </form>
            </div>
        </div>
    </div>
 
    <script>
        // ================= TAB SWITCHER ENGINE =================
        function switchTab(tabId) {
            document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
            document.getElementById(tabId).classList.remove('hidden');
            
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('bg-blue-600', 'text-white');
                btn.classList.add('bg-slate-50', 'text-slate-600', 'hover:bg-slate-100');
            });
            const activeBtn = document.getElementById('btn_' + tabId);
            activeBtn.classList.remove('bg-slate-50', 'text-slate-600', 'hover:bg-slate-100');
            activeBtn.classList.add('bg-blue-600', 'text-white');
        }

        // ================= UNIFIED CONTEXTUAL REVISION MODAL POPUP =================
        function openCorrection(fieldName, fieldLabel, currentValue) {
            document.getElementById('modal_field_name').value = fieldName;
            document.getElementById('modal_field_label').value = fieldLabel;
            document.getElementById('modal_field_label_display').innerText = fieldLabel;
            
            const processedValue = currentValue.trim();
            document.getElementById('modal_old_value_display').innerText = (processedValue === '-' || processedValue === '') ? '(Belum diisi / Kosong)' : processedValue;
            document.getElementById('modal_new_value_input').value = (processedValue === '-' || processedValue === '') ? '' : processedValue;
            
            const modal = document.getElementById('correctionModal');
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }

        function closeCorrection() {
            const modal = document.getElementById('correctionModal');
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }

        // ================= PAS FOTO CROPPER CONTROLS & MODEL ENGINE =================
        let tempImg = new Image();
        let zoomValue = 1.0;
        let rotationValue = 0;
        let panX = 0;
        let panY = 0;
        
        let isDragState = false;
        let mouseStartX = 0;
        let mouseStartY = 0;

        function openPhotoModal() {
            document.getElementById('photoEditorModal').classList.remove('hidden');
            document.getElementById('photoEditorModal').classList.add('flex');
            
            // Clean state
            tempImg = new Image();
            zoomValue = 1.0;
            rotationValue = 0;
            panX = 0;
            panY = 0;
            
            document.getElementById('uploadPlaceholder').classList.remove('hidden');
            document.getElementById('editorWorkspace').classList.add('hidden');
            document.getElementById('saveBtnSubmit').setAttribute('disabled', 'true');
            document.getElementById('photo_base64_input').value = '';
            document.getElementById('modalFilePicker').value = '';
        }

        function closePhotoModal() {
            document.getElementById('photoEditorModal').classList.add('hidden');
            document.getElementById('photoEditorModal').classList.remove('flex');
        }

        function handleFileSelect(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    tempImg.onload = function() {
                        zoomValue = 1.0;
                        rotationValue = 0;
                        panX = 0;
                        panY = 0;
                        
                        document.getElementById('editorWorkspace').classList.remove('hidden');
                        document.getElementById('uploadPlaceholder').classList.add('hidden');
                        document.getElementById('saveBtnSubmit').removeAttribute('disabled');
                        document.getElementById('zoom_slider').value = 1.0;
                        document.getElementById('zoomValPercent').innerText = '100%';
                        
                        renderCanvas();
                        setupCanvasDrag();
                    };
                    tempImg.src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        }

        function adjustZoom(val) {
            zoomValue = parseFloat(val);
            document.getElementById('zoomValPercent').innerText = Math.round(zoomValue * 100) + '%';
            renderCanvas();
        }

        function rotateLeft() {
            rotationValue = (rotationValue - 90) % 360;
            renderCanvas();
        }

        function rotateRight() {
            rotationValue = (rotationValue + 90) % 360;
            renderCanvas();
        }

        function resetTransforms() {
            zoomValue = 1.0;
            rotationValue = 0;
            panX = 0;
            panY = 0;
            document.getElementById('zoom_slider').value = 1.0;
            document.getElementById('zoomValPercent').innerText = '100%';
            renderCanvas();
        }

        function renderCanvas() {
            const canvas = document.getElementById('photoCropperCanvas');
            if (!canvas || !tempImg.src) return;
            const ctx = canvas.getContext('2d');
            const w = canvas.width;  // 300
            const h = canvas.height; // 400
            
            ctx.clearRect(0, 0, w, h);
            ctx.save();
            
            // Translate to center of canvas
            ctx.translate(w / 2 + panX, h / 2 + panY);
            ctx.rotate((rotationValue * Math.PI) / 180);
            
            // Find base scale to cover the 3:4 canvas aspect ratio
            let imgRatio = tempImg.width / tempImg.height;
            let canvasRatio = w / h;
            let baseScale = 1;
            
            if (imgRatio > canvasRatio) {
                // Landscape, fit height
                baseScale = h / tempImg.height;
            } else {
                // Portrait or square, fit width
                baseScale = w / tempImg.width;
            }
            
            let drawWidth = tempImg.width * baseScale * zoomValue;
            let drawHeight = tempImg.height * baseScale * zoomValue;
            
            // Draw image centred
            ctx.drawImage(tempImg, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
            ctx.restore();
            
            // Pack output base64 directly
            document.getElementById('photo_base64_input').value = canvas.toDataURL('image/jpeg', 0.9);
        }

        function setupCanvasDrag() {
            const canvas = document.getElementById('photoCropperCanvas');
            if (!canvas) return;
            
            // Remove previous event listeners by cloning if necessary (vanilla approach is fine since pointer events reset)
            const startDrag = (clientX, clientY) => {
                isDragState = true;
                mouseStartX = clientX - panX;
                mouseStartY = clientY - panY;
                canvas.style.cursor = 'grabbing';
            };
            
            const moveDrag = (clientX, clientY) => {
                if (!isDragState) return;
                panX = clientX - mouseStartX;
                panY = clientY - mouseStartY;
                renderCanvas();
            };
            
            const endDrag = () => {
                isDragState = false;
                canvas.style.cursor = 'grab';
            };
            
            // Primary mouse handlers
            canvas.onmousedown = (e) => startDrag(e.clientX, e.clientY);
            canvas.onmousemove = (e) => moveDrag(e.clientX, e.clientY);
            canvas.onmouseup = endDrag;
            canvas.onmouseleave = endDrag;
            
            // Touch mobile device support mechanics
            canvas.ontouchstart = (e) => {
                if (e.touches.length === 1) {
                    startDrag(e.touches[0].clientX, e.touches[0].clientY);
                }
            };
            canvas.ontouchmove = (e) => {
                if (isDragState && e.touches.length === 1) {
                    moveDrag(e.touches[0].clientX, e.touches[0].clientY);
                    e.preventDefault();
                }
            };
            canvas.ontouchend = endDrag;
        }

        function submitPhotoForm() {
            const b64 = document.getElementById('photo_base64_input').value;
            if (b64 && b64.startsWith('data:image/')) {
                document.getElementById('savePhotoForm').submit();
            } else {
                alert('Tolong unggah dan tempatkan pas foto terlebih dahulu.');
            }
        }
    </script>
</body>
</html>
