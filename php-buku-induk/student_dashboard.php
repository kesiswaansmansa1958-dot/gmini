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

// Handle pengajuan revisi
$is_revision_modal_open = false;
$revision_error = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action_submit_revision'])) {
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
                <?php if ($student['foto']): ?>
                    <img src="<?= $student['foto'] ?>" class="w-32 h-32 rounded-full border-4 border-slate-100 object-cover shadow-sm">
                <?php else: ?>
                    <div class="w-32 h-32 rounded-full bg-slate-100 text-slate-400 font-extrabold flex items-center justify-center border-4 border-slate-100 uppercase text-3xl shadow-sm">
                        <?= substr($student['nama_lengkap'], 0, 2) ?>
                    </div>
                <?php endif; ?>

                <div>
                    <span class="inline-block px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-[9px] font-bold text-blue-700 uppercase tracking-widest leading-none mb-2">MASUK SISWA</span>
                    <h3 class="text-md font-black text-slate-850 tracking-tight leading-tight"><?= esc($student['nama_lengkap']) ?></h3>
                    <p class="text-xs text-gray-400 font-semibold font-sans mt-1">NISN: <?= esc($student['nisn']) ?> &middot; Kelas: <?= esc($student['kelas_sekarang']) ?></p>
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

            <!-- Submit Correction Request Quick Form -->
            <div class="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm space-y-4">
                <div class="border-b pb-2">
                    <h4 class="font-bold text-slate-800 text-xs">Urus Koreksi Biodata Mandiri</h4>
                    <p class="text-[10.5px] text-gray-400 font-medium">Ajukan satu per satu butir revisi jika ada kesalahan ketik</p>
                </div>

                <form method="POST" class="space-y-3.5">
                    <input type="hidden" name="action_submit_revision" value="1">
                    
                    <div>
                        <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Pilih Butir Isian yang Salah</label>
                        <select name="field_info" onchange="updateSelectedField(this)" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold text-slate-700 bg-white">
                            <option value="">-- Pilih Kolom Isian --</option>
                            <option value="nama_lengkap|Nama Lengkap Siswa">Nama Lengkap Siswa</option>
                            <option value="nama_panggilan|Nama Panggilan">Nama Panggilan</option>
                            <option value="tempat_lahir|Tempat Lahir">Tempat Lahir</option>
                            <option value="tanggal_lahir|Tanggal Lahir">Tanggal Lahir</option>
                            <option value="agama|Agama">Agama</option>
                            <option value="alamat_lengkap|Alamat Lengkap Rumah">Alamat Lengkap Rumah</option>
                            <option value="telepon|Nomor Telepon / HP">Nomor Telepon / HP</option>
                            <option value="ayah_nama|Nama Ayah Kandung">Nama Ayah Kandung</option>
                            <option value="ibu_nama|Nama Ibu Kandung">Nama Ibu Kandung</option>
                            <option value="wali_nama|Nama Wali SMANSA">Nama Wali SMANSA</option>
                            <option value="olahraga|Hobi Cabang Olahraga">Hobi Cabang Olahraga</option>
                        </select>
                        <input type="hidden" name="field_name" id="rev_field_name">
                        <input type="hidden" name="field_label" id="rev_field_label">
                    </div>

                    <div>
                        <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Nilai Perbaikan yang Benar</label>
                        <textarea name="new_value" required rows="2" placeholder="Tuliskan isian data yang seharusnya tertulis benar..." class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"></textarea>
                    </div>

                    <button type="submit" class="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center">
                        Kirim Usulan Perbaikan
                    </button>
                </form>
            </div>

        </div>

        <!-- Right Side: Full Biodata Read-Only Views Grouped & Revison Track Histories -->
        <div class="lg:col-span-8 space-y-6">
            
            <?php display_flash_message(); ?>

            <!-- Full Read Only Biodata Section -->
            <div class="bg-white rounded-3xl border border-gray-150 p-6 md:p-8 space-y-6 shadow-sm">
                
                <div class="flex items-center gap-3 border-b border-gray-100 pb-3">
                    <div class="p-2 bg-blue-50 text-blue-600 rounded-xl">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    </div>
                    <div>
                        <h3 class="font-bold text-slate-800 text-sm">Pratinjau Lembar Buku Induk Saya</h3>
                        <p class="text-[10px] text-gray-400 font-sans font-medium">Buku pendaftaran murid baru yang sah terdokumentasikan di sekolah SMANSA</p>
                    </div>
                </div>

                <!-- Group 1: Pribadi -->
                <div class="space-y-3.5">
                    <h4 class="text-[10px] font-black uppercase tracking-widest text-blue-600">I. Identitas Pribadi Pokok</h4>
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-4 border-b pb-4 border-gray-100 text-xs">
                        <div>
                            <span class="text-[9.5px] text-gray-400 block mb-0.5">Nama Lengkap Sesuai Akta</span>
                            <span class="font-bold text-slate-800"><?= esc($student['nama_lengkap']) ?></span>
                        </div>
                        <div>
                            <span class="text-[9.5px] text-gray-400 block mb-0.5">Nama Panggilan</span>
                            <span class="font-bold text-slate-800"><?= esc($student['nama_panggilan'] ?: '-') ?></span>
                        </div>
                        <div>
                            <span class="text-[9.5px] text-gray-400 block mb-0.5">Jenis Kelamin</span>
                            <span class="font-bold text-slate-800"><?= esc($student['jenis_kelamin']) ?></span>
                        </div>
                        <div>
                            <span class="text-[9.5px] text-gray-400 block mb-0.5">NISN / NIS</span>
                            <span class="font-mono font-bold text-slate-800"><?= esc($student['nisn']) ?> / <?= esc($student['nis'] ?: '-') ?></span>
                        </div>
                        <div>
                            <span class="text-[9.5px] text-gray-400 block mb-0.5">Tempat, Tanggal Lahir</span>
                            <span class="font-bold text-slate-800"><?= esc($student['tempat_lahir'] ?: '-') ?>, <?= format_indo_date($student['tanggal_lahir']) ?></span>
                        </div>
                        <div>
                            <span class="text-[9.5px] text-gray-400 block mb-0.5">Agama & Kewarganegaraan</span>
                            <span class="font-bold text-slate-800"><?= esc($student['agama'] ?: '-') ?> &middot; <?= esc($student['kewarganegaraan'] ?: '-') ?></span>
                        </div>
                    </div>
                </div>

                <!-- Group 2: Domisili -->
                <div class="space-y-3.5 pt-2">
                    <h4 class="text-[10px] font-black uppercase tracking-widest text-blue-600">II. Kontak & Alamat Tinggal</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-4 border-b pb-4 border-gray-100 text-xs text-slate-850">
                        <div class="md:col-span-2">
                            <span class="text-[9.5px] text-gray-400 block mb-0.5">Alamat Tempat Tinggal (Sesuai KK)</span>
                            <span class="font-bold text-slate-800 leading-relaxed"><?= esc($student['alamat_lengkap'] ?: '-') ?></span>
                        </div>
                        <div>
                            <span class="text-[9.5px] text-gray-400 block mb-0.5">Nomor Telepon</span>
                            <span class="font-mono font-bold text-slate-800"><?= esc($student['telepon'] ?: '-') ?></span>
                        </div>
                        <div>
                            <span class="text-[9.5px] text-gray-400 block mb-0.5">Tinggal Dengan & Transportasi</span>
                            <span class="font-bold text-slate-800"><?= esc($student['tinggal_dengan'] ?: 'Orang Tua') ?> &middot; <?= esc($student['transportasi'] ?: '-') ?></span>
                        </div>
                    </div>
                </div>

                <!-- Group 3: Orang Tua -->
                <div class="space-y-3.5 pt-2">
                    <h4 class="text-[10px] font-black uppercase tracking-widest text-blue-600">III. Informasi Orang Tua Kandung</h4>
                    <div class="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                        <div>
                            <span class="text-[9.5px] text-gray-400 block mb-0.5">Nama Ayah Kandung</span>
                            <span class="font-bold text-slate-800 block"><?= esc($student['ayah_nama'] ?: '-') ?></span>
                            <?php if ($student['ayah_nama']): ?>
                                <span class="text-[10px] text-gray-400 block mt-0.5"><?= esc($student['ayah_pekerjaan'] ?: '-') ?> &middot; Hp. <?= esc($student['ayah_telepon'] ?: '-') ?></span>
                            <?php endif; ?>
                        </div>
                        <div>
                            <span class="text-[9.5px] text-gray-400 block mb-0.5">Nama Ibu Kandung</span>
                            <span class="font-bold text-slate-800 block"><?= esc($student['ibu_nama'] ?: '-') ?></span>
                            <?php if ($student['ibu_nama']): ?>
                                <span class="text-[10px] text-gray-400 block mt-0.5"><?= esc($student['ibu_pekerjaan'] ?: '-') ?> &middot; Hp. <?= esc($student['ibu_telepon'] ?: '-') ?></span>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>

                <!-- Group 4: Guardian -->
                <?php if ($student['has_wali']): ?>
                    <div class="space-y-3.5 pt-4 border-t">
                        <h4 class="text-[10px] font-black uppercase tracking-widest text-blue-600">IV. Informasi Wali Murid SMANSA</h4>
                        <div class="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-4 text-xs">
                            <div>
                                <span class="text-[9.5px] text-gray-400 block mb-0.5">Nama Lengkap Wali</span>
                                <span class="font-bold text-slate-800"><?= esc($student['wali_nama']) ?></span>
                            </div>
                            <div>
                                <span class="text-[9.5px] text-gray-400 block mb-0.5">Hubungan Keluarga</span>
                                <span class="font-bold text-slate-800"><?= esc($student['wali_relationships_siswa'] ?: 'Wali') ?></span>
                            </div>
                            <div>
                                <span class="text-[9.5px] text-gray-400 block mb-0.5">No Telepon Wali</span>
                                <span class="font-mono font-bold text-slate-800"><?= esc($student['wali_telepon'] ?: '-') ?></span>
                            </div>
                        </div>
                    </div>
                <?php endif; ?>

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

    <script>
        function updateSelectedField(selectEl) {
            const val = selectEl.value;
            const targetFieldName = document.getElementById('rev_field_name');
            const targetFieldLabel = document.getElementById('rev_field_label');

            if (val) {
                const parts = val.split('|');
                targetFieldName.value = parts[0];
                targetFieldLabel.value = parts[1];
            } else {
                targetFieldName.value = '';
                targetFieldLabel.value = '';
            }
        }
    </script>
</body>
</html>
