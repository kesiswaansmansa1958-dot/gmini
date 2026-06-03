<?php
require_once 'config.php';

// Proteksi Autentikasi Keamanan
if (!isset($_SESSION['role'])) {
    redirect('login.php');
}

$student_id = isset($_GET['student_id']) ? (int)$_GET['student_id'] : 0;
$doc_type = $_GET['doc'] ?? 'BUKU_INDUK'; // BUKU_INDUK, PERNYATAAN_SISWA, PERNYATAAN_WALI

if ($student_id <= 0) {
    die("Pemberitahuan: ID Siswa tidak valid!");
}

// Hak Akses Khusus Siswa
if ($_SESSION['role'] === 'SISWA') {
    if ($_SESSION['student_id'] != $student_id) {
        die("Eror Deskripsi Keamanan: Anda dilarang mencetak biodata milik peserta didik lain.");
    }

    // Periksa status izin cetak aktif siswa
    $stmt = $db->prepare("SELECT allow_print FROM students WHERE id = ?");
    $stmt->execute([$student_id]);
    $allowed = $stmt->fetchColumn();
    if (!$allowed) {
        die("Otorisasi Cetak Gagal: Staf TU menonaktifkan otorisasi unduh/cetak berkas mandiri untuk akun Anda.");
    }
}

// Tarik data lengkap siswa kesiswaan
$stmt = $db->prepare("SELECT * FROM students WHERE id = ?");
$stmt->execute([$student_id]);
$student = $stmt->fetch();

if (!$student) {
    die("Error: Berkas arsip digital peserta didik tidak ditemukan!");
}

function cell($val) {
    return !empty($val) ? esc($val) : '-';
}

function mark($val) {
    return !empty($val) ? '<b>' . esc($val) . '</b>' : '-';
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cetak_<?= esc($doc_type) ?>_<?= str_replace(' ', '_', esc($student['nama_lengkap'])) ?></title>
    <style>
        @page {
            size: 215mm 330mm; /* Standar Ukuran Kertas F4 / Folio Indonesia */
            margin: 20mm;
        }
        body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 11pt;
            line-height: 1.4;
            color: #000;
            background: #fff;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
        .header-logo {
            text-align: center;
            border-bottom: 3px double #000;
            padding-bottom: 12px;
            margin-bottom: 25px;
        }
        .header-logo h2 {
            margin: 0;
            font-size: 14pt;
            font-weight: bold;
            text-transform: uppercase;
        }
        .header-logo h1 {
            margin: 5px 0;
            font-size: 18pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .header-logo p {
            margin: 0;
            font-size: 9.5pt;
            font-style: italic;
        }
        .doc-title {
            text-align: center;
            font-size: 13pt;
            font-weight: bold;
            text-decoration: underline;
            text-transform: uppercase;
            margin-bottom: 25px;
        }
        
        /* Table Layout formatting */
        .table-data {
            width: 100%;
            border-collapse: collapse;
            font-size: 10pt;
            margin-bottom: 20px;
        }
        .table-data td {
            vertical-align: top;
            padding: 4px 6px;
        }
        .g-title {
            font-weight: bold;
            font-size: 10.5pt;
            padding-top: 15px !important;
            padding-bottom: 5px !important;
            text-transform: uppercase;
        }
        .col-num {
            width: 25px;
            text-align: left;
        }
        .col-label {
            width: 260px;
        }
        .col-colon {
            width: 15px;
            text-align: center;
        }
        
        /* Signature boxes alignment */
        .sig-row {
            margin-top: 40px;
            width: 100%;
            border-collapse: collapse;
        }
        .sig-row td {
            width: 50%;
            text-align: center;
            font-size: 10.5pt;
        }
        .sig-space {
            height: 75px;
        }
        .photo-box {
            width: 30mm;
            height: 40mm;
            border: 1px solid #000;
            display: inline-block;
            text-align: center;
            line-height: 40mm;
            font-size: 8pt;
            color: #666;
            margin-top: 15px;
        }
        
        /* Interactive actions */
        .btn-print-floating {
            position: fixed;
            bottom: 25px;
            right: 25px;
            padding: 10px 20px;
            background: #2563eb;
            color: #fff;
            border: none;
            border-radius: 8px;
            font-size: 10pt;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(37,99,235,0.2);
            transition: 0.2s;
        }
        .btn-print-floating:hover {
            background: #1d4ed8;
        }
        @media print {
            .btn-print-floating {
                display: none;
            }
            body {
                background: none;
            }
        }
    </style>
</head>
<body>

    <!-- Floating Trigger Print Button -->
    <button onclick="window.print()" class="btn-print-floating">
        Cetak Dokumen Sekarang (F4)
    </button>

    <div class="container">

        <!-- ================= DOCUMENT TYPE 1: BUKU INDUK ================= -->
        <?php if ($doc_type === 'BUKU_INDUK'): ?>
            <div class="header-logo">
                <h2>Pemerintah Provinsi Jawa Tengah</h2>
                <h2>Dinas Pendidikan dan Kebudayaan</h2>
                <h1>SMA Negeri 1 Purwokerto</h1>
                <p>Jalan Gatot Subroto No. 73 Kode Pos 53116 Telepon (0281) 635116 Purwokerto</p>
            </div>

            <div class="doc-title">
                Lembar Buku Induk Peserta Didik Baru
            </div>

            <table class="table-data">
                <!-- I. KETERANGAN DATA SISWA -->
                <tr>
                    <td colspan="4" class="g-title">A. Keterangan Tentang Diri Peserta Didik</td>
                </tr>
                <tr>
                    <td class="col-num">1.</td>
                    <td class="col-label">Nama Lengkap Siswa</td>
                    <td class="col-colon">:</td>
                    <td><?= cell($student['nama_lengkap']) ?></td>
                </tr>
                <tr>
                    <td class="col-num">2.</td>
                    <td class="col-label">Nama Panggilan</td>
                    <td class="col-colon">:</td>
                    <td><?= cell($student['nama_panggilan']) ?></td>
                </tr>
                <tr>
                    <td class="col-num">3.</td>
                    <td class="col-label">Jenis Kelamin</td>
                    <td class="col-colon">:</td>
                    <td><?= cell($student['jenis_kelamin']) ?></td>
                </tr>
                <tr>
                    <td class="col-num">4.</td>
                    <td class="col-label">Nomor Induk Siswa Nasional (NISN)</td>
                    <td class="col-colon">:</td>
                    <td><strong><?= cell($student['nisn']) ?></strong></td>
                </tr>
                <tr>
                    <td class="col-num">5.</td>
                    <td class="col-label">Nomor Induk Lokal (NIS)</td>
                    <td class="col-colon">:</td>
                    <td><?= cell($student['nis']) ?></td>
                </tr>
                <tr>
                    <td class="col-num">6.</td>
                    <td class="col-label">Tempat dan Tanggal Lahir</td>
                    <td class="col-colon">:</td>
                    <td><?= cell($student['tempat_lahir']) ?>, <?= format_indo_date($student['tanggal_lahir']) ?></td>
                </tr>
                <tr>
                    <td class="col-num">7.</td>
                    <td class="col-label">Agama / Kepercayaan</td>
                    <td class="col-colon">:</td>
                    <td><?= cell($student['agama']) ?></td>
                </tr>
                <tr>
                    <td class="col-num">8.</td>
                    <td class="col-label">Kewarganegaraan</td>
                    <td class="col-colon">:</td>
                    <td><?= cell($student['kewarganegaraan']) ?></td>
                </tr>
                <tr>
                    <td class="col-num">9.</td>
                    <td class="col-label">Status Hubungan di Keluarga</td>
                    <td class="col-colon">:</td>
                    <td>Anak Ke-<?= cell($student['anak_ke']) ?> &middot; (Keluarga <?= cell($student['status_keluarga']) ?>)</td>
                </tr>
                <tr>
                    <td class="col-num">10.</td>
                    <td class="col-label">Bahasa Sehari-hari</td>
                    <td class="col-colon">:</td>
                    <td><?= cell($student['bahasa_sehari_hari']) ?></td>
                </tr>

                <!-- II. ALAMAT DAN TEMPAT TINGGAL -->
                <tr>
                    <td colspan="4" class="g-title">B. Keterangan Tempat Tinggal</td>
                </tr>
                <tr>
                    <td class="col-num">11.</td>
                    <td class="col-label">Alamat Lengkap Domisili Siswa</td>
                    <td class="col-colon">:</td>
                    <td><?= cell($student['alamat_lengkap']) ?></td>
                </tr>
                <tr>
                    <td class="col-num">12.</td>
                    <td class="col-label">Nomor Telepon Rumah / HP Aktif</td>
                    <td class="col-colon">:</td>
                    <td><?= cell($student['telepon']) ?></td>
                </tr>
                <tr>
                    <td class="col-num">13.</td>
                    <td class="col-label">Tinggal Dengan</td>
                    <td class="col-colon">:</td>
                    <td><?= cell($student['tinggal_dengan']) ?></td>
                </tr>
                <tr>
                    <td class="col-num">14.</td>
                    <td class="col-label">Jarak Tempat Tinggal ke Sekolah</td>
                    <td class="col-colon">:</td>
                    <td><?= cell($student['jarak_ke_sekolah']) ?></td>
                </tr>
                <tr>
                    <td class="col-num">15.</td>
                    <td class="col-label">Transportasi ke Sekolah</td>
                    <td class="col-colon">:</td>
                    <td><?= cell($student['transportasi']) ?></td>
                </tr>

                <!-- III. KESEHATAN -->
                <tr>
                    <td colspan="4" class="g-title">C. Keterangan Jasmani & Kesehatan</td>
                </tr>
                <tr>
                    <td class="col-num">16.</td>
                    <td class="col-label">Golongan Darah</td>
                    <td class="col-colon">:</td>
                    <td><?= cell($student['golongan_darah']) ?></td>
                </tr>
                <tr>
                    <td class="col-num">17.</td>
                    <td class="col-label">Tinggi dan Berat Badan</td>
                    <td class="col-colon">:</td>
                    <td>Tinggi: <?= cell($student['tinggi_badan']) ?> cm &middot; Berat: <?= cell($student['berat_badan']) ?> kg</td>
                </tr>
                <tr>
                    <td class="col-num">18.</td>
                    <td class="col-label">Riwayat Penyakit Pernah Diderita</td>
                    <td class="col-colon">:</td>
                    <td><?= cell($student['penyakit_pernah_diderita']) ?></td>
                </tr>

                <!-- IV. KETERANGAN ASAL PENDIDIKAN (SEKOLAH SMP) -->
                <tr>
                    <td colspan="4" class="g-title">D. Keterangan Sekolah Menengah Pertama (SMP/MTs)</td>
                </tr>
                <tr>
                    <td class="col-num">19.</td>
                    <td class="col-label">Lulusan Dari SMP / MTs</td>
                    <td class="col-colon">:</td>
                    <td><?= cell($student['lulusan_dari']) ?></td>
                </tr>
                <tr>
                    <td class="col-num">20.</td>
                    <td class="col-label">Nomor Surat Ijazah Kelulusan</td>
                    <td class="col-colon">:</td>
                    <td><?= cell($student['nomor_ijazah']) ?> (Tanggal: <?= cell($student['tanggal_ijazah']) ?>)</td>
                </tr>
                <tr>
                    <td class="col-num">21.</td>
                    <td class="col-label">Rata-rata Nilai Rapor Evaluasi Asal</td>
                    <td class="col-colon">:</td>
                    <td>
                        Agama: <?= cell($student['rerata_agama']) ?> &middot;
                        PPKn: <?= cell($student['rerata_ppkn']) ?> &middot;
                        B.Indonesia: <?= cell($student['rerata_b_indonesia']) ?> &middot;<br>
                        Matematika: <?= cell($student['rerata_matematika']) ?> &middot;
                        IPA: <?= cell($student['rerata_ipa']) ?> &middot;
                        IPS: <?= cell($student['rerata_ips']) ?> &middot;
                        B.Inggris: <?= cell($student['rerata_b_inggris']) ?>
                    </td>
                </tr>

                <!-- V. ORANG TUA KANDUNG -->
                <tr>
                    <td colspan="4" class="g-title">E. Keterangan Tentang Orang Tua Siswa</td>
                </tr>
                <tr>
                    <td class="col-num">22.</td>
                    <td class="col-label">Nama Lengkap Ayah Kandung</td>
                    <td class="col-colon">:</td>
                    <td><?= cell($student['ayah_nama']) ?> (<?= $student['ayah_is_masih_hidup'] ? 'Masih Hidup' : 'Wafat' ?>)</td>
                </tr>
                <tr>
                    <td class="col-num">23.</td>
                    <td class="col-label">Pendidikan & Pekerjaan Ayah</td>
                    <td class="col-colon">:</td>
                    <td>Pendidikan: <?= cell($student['ayah_pendidikan']) ?> &middot; Pekerjaan: <?= cell($student['ayah_pekerjaan']) ?></td>
                </tr>
                <tr>
                    <td class="col-num">24.</td>
                    <td class="col-label">Nama Lengkap Ibu Kandung</td>
                    <td class="col-colon">:</td>
                    <td><?= cell($student['ibu_nama']) ?> (<?= $student['ibu_is_masih_hidup'] ? 'Masih Hidup' : 'Wafat' ?>)</td>
                </tr>
                <tr>
                    <td class="col-num">25.</td>
                    <td class="col-label">Pendidikan & Pekerjaan Ibu</td>
                    <td class="col-colon">:</td>
                    <td>Pendidikan: <?= cell($student['ibu_pendidikan']) ?> &middot; Pekerjaan: <?= cell($student['ibu_pekerjaan']) ?></td>
                </tr>

                <!-- VI. ORANG TUA / WALI -->
                <?php if ($student['has_wali']): ?>
                    <tr>
                        <td colspan="4" class="g-title">F. Keterangan Tentang Wali Siswa</td>
                    </tr>
                    <tr>
                        <td class="col-num">26.</td>
                        <td class="col-label">Nama Lengkap Wali Siswa</td>
                        <td class="col-colon">:</td>
                        <td><?= cell($student['wali_nama']) ?> (Hubungan: <?= cell($student['wali_hubungan_siswa']) ?>)</td>
                    </tr>
                    <tr>
                        <td class="col-num">27.</td>
                        <td class="col-label">Pekerjaan & Telepon Wali</td>
                        <td class="col-colon">:</td>
                        <td><?= cell($student['wali_pekerjaan']) ?> &middot; Hp. <?= cell($student['wali_telepon']) ?></td>
                    </tr>
                <?php endif; ?>

                <!-- VII. DATA PENGESAHAN SEKOLAH -->
                <tr>
                    <td colspan="4" class="g-title">F. Keterangan Keanggotaan SMA Negeri 1 Purwokerto</td>
                </tr>
                <tr>
                    <td class="col-num">28.</td>
                    <td class="col-label">Diterima di Kelas saat ini</td>
                    <td class="col-colon">:</td>
                    <td><strong><?= cell($student['kelas_sekarang']) ?></strong> (Jurusan/Keahlian: <?= cell($student['program_keahlian']) ?>)</td>
                </tr>
                <tr>
                    <td class="col-num">29.</td>
                    <td class="col-label">Tanggal Terdaftar Masuk Sekolah</td>
                    <td class="col-colon">:</td>
                    <td><?= format_indo_date($student['tanggal_masuk']) ?></td>
                </tr>
                <tr>
                    <td class="col-num">30.</td>
                    <td class="col-label">Nomor Buku Induk Sekolah (STB)</td>
                    <td class="col-colon">:</td>
                    <td><?= cell($student['nomor_stb']) ?></td>
                </tr>
            </table>

            <!-- Signatures layout -->
            <table class="sig-row">
                <tr>
                    <td style="text-align: left; padding-left: 20px;">
                        <div class="photo-box">
                            <?php if ($student['foto']): ?>
                                <img src="<?= $student['foto'] ?>" style="width: 100%; height: 100%; object-cover: cover;">
                            <?php else: ?>
                                Pas Foto 3x4
                            <?php endif; ?>
                        </div>
                    </td>
                    <td>
                        <p>Purwokerto, <?= format_indo_date(date('Y-m-d')) ?></p>
                        <p>Kepala SMA Negeri 1 Purwokerto</p>
                        <div class="sig-space"></div>
                        <p><strong><u>Drs. RUSLAN ASY'ARI, M.Pd</u></strong></p>
                        <p>NIP. 19690104 199303 1 002</p>
                    </td>
                </tr>
            </table>

        <!-- ================= DOCUMENT TYPE 2: PERNYATAAN SISWA ================= -->
        <?php elseif ($doc_type === 'PERNYATAAN_SISWA'): ?>
            <div class="header-logo" style="border-bottom: 2px solid #000;">
                <h2>Pemerintah Provinsi Jawa Tengah</h2>
                <h2>Dinas Pendidikan dan Kebudayaan</h2>
                <h1>SMA Negeri 1 Purwokerto</h1>
                <p>Jalan Gatot Subroto No. 73 Kode Pos 53116 Telepon (0281) 635116 Purwokerto</p>
            </div>

            <div class="doc-title" style="margin-bottom: 12px; text-decoration: none;">
                SURAT PERNYATAAN PESERTA DIDIK BARU
            </div>
            <p style="font-size: 10pt; text-align: center; margin: 0 0 25px 0;">Tahun Pelajaran 2026/2027</p>

            <p style="text-align: justify; font-size: 11pt; line-height: 1.6; margin-bottom: 20px;">
                Yang bertanda tangan di bawah ini, saya peserta didik baru SMA Negeri 1 Purwokerto:
            </p>

            <table class="table-data" style="margin-left: 15px; margin-bottom: 25px;">
                <tr>
                    <td style="width: 180px;">Nama Lengkap Siswa</td>
                    <td style="width: 15px;">:</td>
                    <td><strong><?= cell($student['nama_lengkap']) ?></strong></td>
                </tr>
                <tr>
                    <td>Nomor NISN</td>
                    <td>:</td>
                    <td><strong><?= cell($student['nisn']) ?></strong></td>
                </tr>
                <tr>
                    <td>Tempat, Tanggal Lahir</td>
                    <td>:</td>
                    <td><?= cell($student['tempat_lahir']) ?>, <?= format_indo_date($student['tanggal_lahir']) ?></td>
                </tr>
                <tr>
                    <td>Diterima di Kelas</td>
                    <td>:</td>
                    <td><?= cell($student['kelas_sekarang']) ?></td>
                </tr>
                <tr>
                    <td>Alamat Rumah Orang Tua</td>
                    <td>:</td>
                    <td><?= cell($student['alamat_lengkap']) ?></td>
                </tr>
            </table>

            <p style="text-align: justify; font-size: 10.5pt; line-height: 1.6; margin-bottom: 15px;">
                Menyatakan dengan sesungguhnya dan penuh kesadaran diri demi kelancaran proses pembelajaran kesiswaan:
            </p>

            <ol style="font-size: 10.5pt; line-height: 1.6; margin-left: 20px; padding-left: 0; text-align: justify;">
                <li style="margin-bottom: 8px;">Akan mematuhi, tunduk, serta menjunjung tinggi segala ketentuan tata tertib dan peraturan sekolah SMA Negeri 1 Purwokerto selama menjadi peserta didik.</li>
                <li style="margin-bottom: 8px;">Sanggup menjaga nama baik almamater, guru, staf, kepala sekolah, serta keluarga besar SMAN 1 Purwokerto baik di dalam maupun di luar lingkungan sekolah.</li>
                <li style="margin-bottom: 8px;">Akan mengikuti proses pembelajaran secara tertib, rajin, disiplin, bertanggung jawab, serta menyelesaikan seluruh rangkaian evaluasi belajar sekolah secara jujur.</li>
                <li style="margin-bottom: 8px;">Apabila saya melakukan pelanggaran tata tertib sekolah, saya siap menerima sanksi edukatif, penundaan hak, ataupun dikembalikan kepada bimbingan orang tua tanpa paksaan.</li>
            </ol>

            <p style="text-align: justify; font-size: 10.5pt; line-height: 1.6; margin-top: 25px;">
                Demikian surat pernyataan ini saya buat dengan sebenarnya tanpa tekanan pihak manapun untuk dipergunakan sebagaimana mestinya.
            </p>

            <table class="sig-row" style="margin-top: 35px;">
                <tr>
                    <td>
                        <p>Mengetahui / Menyetujui,</p>
                        <p>Orang Tua / Wali Siswa</p>
                        <div class="sig-space" style="height: 60px;"></div>
                        <p><strong><?= cell($student['ayah_nama'] ?: ($student['ibu_nama'] ?: '..........................................')) ?></strong></p>
                    </td>
                    <td>
                        <p>Purwokerto, <?= format_indo_date(date('Y-m-d')) ?></p>
                        <p>Yang Membuat Pernyataan,</p>
                        <div class="sig-space" style="height: 60px; line-height: 60px; font-size: 8pt; color: #777;">
                            <span style="border: 1px dashed #bbb; padding: 4px 8px;">Materai Rp 10.000</span>
                        </div>
                        <p><strong><u><?= cell($student['nama_lengkap']) ?></u></strong></p>
                    </td>
                </tr>
            </table>

        <!-- ================= DOCUMENT TYPE 3: PERNYATAAN WALI ORDER ================= -->
        <?php elseif ($doc_type === 'PERNYATAAN_WALI'): ?>
            <div class="header-logo" style="border-bottom: 2px solid #000;">
                <h2>Pemerintah Provinsi Jawa Tengah</h2>
                <h2>Dinas Pendidikan dan Kebudayaan</h2>
                <h1>SMA Negeri 1 Purwokerto</h1>
                <p>Jalan Gatot Subroto No. 73 Kode Pos 53116 Telepon (0281) 635116 Purwokerto</p>
            </div>

            <div class="doc-title" style="margin-bottom: 12px; text-decoration: none;">
                SURAT PERNYATAAN ORANG TUA / WALI PENDIDIK
            </div>
            <p style="font-size: 10pt; text-align: center; margin: 0 0 25px 0;">Penerimaan Peserta Didik Baru Tahun Pelajaran 2026/2027</p>

            <p style="text-align: justify; font-size: 11pt; line-height: 1.6; margin-bottom: 20px;">
                Yang bertanda tangan di bawah ini, selaku Orang Tua / Wali murid baru SMANSA:
            </p>

            <table class="table-data" style="margin-left: 15px; margin-bottom: 25px;">
                <tr>
                    <td style="width: 180px;">Nama Orang Tua / Wali</td>
                    <td style="width: 15px;">:</td>
                    <td><strong><?= cell($student['ayah_nama'] ?: ($student['ibu_nama'] ?: ($student['wali_nama'] ?: '-'))) ?></strong></td>
                </tr>
                <tr>
                    <td>Pekerjaan Utama</td>
                    <td>:</td>
                    <td><?= cell($student['ayah_pekerjaan'] ?: ($student['ibu_pekerjaan'] ?: ($student['wali_pekerjaan'] ?: '-'))) ?></td>
                </tr>
                <tr>
                    <td>Alamat Lengkap Orang Tua</td>
                    <td>:</td>
                    <td><?= cell($student['alamat_lengkap']) ?></td>
                </tr>
                <tr>
                    <td colspan="3" style="padding-top: 15px; font-weight: bold; font-style: italic;">Adalah wali / orang tua kandung dari peserta didik:</td>
                </tr>
                <tr>
                    <td>Nama Lengkap Siswa</td>
                    <td>:</td>
                    <td><strong><?= cell($student['nama_lengkap']) ?></strong></td>
                </tr>
                <tr>
                    <td>NISN / Kelas Diterima</td>
                    <td>:</td>
                    <td><strong><?= cell($student['nisn']) ?></strong> &middot; Kelas: <?= cell($student['kelas_sekarang']) ?></td>
                </tr>
            </table>

            <p style="text-align: justify; font-size: 10.5pt; line-height: 1.6; margin-bottom: 15px;">
                Sebagai penanggung jawab penuh proses bimbingan belajar murid di luar lingkungan sekolah, saya menyatakan kesanggupan:
            </p>

            <ol style="font-size: 10.5pt; line-height: 1.6; margin-left: 20px; padding-left: 0; text-align: justify;">
                <li style="margin-bottom: 8px;">Sanggup mendampingi, memberikan keteladanan, serta mengawasi kedisiplinan putra/putri kami agar mematuhi aturan tata tertib sekolah secara patuh.</li>
                <li style="margin-bottom: 8px;">Akan proaktif menjalin korespondensi dengan Guru BK, Wali Kelas, dan Pembina dalam hal pembinaan kerohanian, karakter, serta capaian pembelajaran peserta didik baru.</li>
                <li style="margin-bottom: 8px;">Sanggup mendukung penuh program-program peningkatan mutu akademik kesiswaan sekolah di lingkungan SMA Negeri 1 Purwokerto.</li>
                <li style="margin-bottom: 8px;">Bersedia membimbing dan mengarahkan kembali putra/putri kami secara mandiri apabila melakukan tindakan di luar tata krama asuh sekolah kesiswaan SMANSA.</li>
            </ol>

            <p style="text-align: justify; font-size: 10.5pt; line-height: 1.6; margin-top: 25px;">
                Pernyataan ini kami tandatangani dengan kesadaran penuh dan rasa tanggung jawab demi mewujudkan cita-cita masa depan putra-putri kami.
            </p>

            <table class="sig-row" style="margin-top: 35px;">
                <tr>
                    <td>
                        <div style="height: 30px;"></div>
                        <p>Mengetahui,</p>
                        <p>Kepala SMA Negeri 1 Purwokerto</p>
                        <div class="sig-space" style="height: 60px;"></div>
                        <p><strong><u>Drs. RUSLAN ASY'ARI, M.Pd</u></strong></p>
                        <p>NIP. 19690104 199303 1 002</p>
                    </td>
                    <td>
                        <p>Purwokerto, <?= format_indo_date(date('Y-m-d')) ?></p>
                        <p>Yang Membuat Pernyataan,</p>
                        <p>Orang Tua / Wali Siswa</p>
                        <div class="sig-space" style="height: 60px; line-height: 60px; font-size: 8pt; color: #777;">
                            <span style="border: 1px dashed #bbb; padding: 4px 8px;">Materai Rp 10.000</span>
                        </div>
                        <p><strong><?= cell($student['ayah_nama'] ?: ($student['ibu_nama'] ?: ($student['wali_nama'] ?: '..........................................'))) ?></strong></p>
                    </td>
                </tr>
            </table>
        <?php endif; ?>

    </div>

</body>
</html>
