-- Database Buku Induk Siswa SMAN 1 Purwokerto
-- Direkomendasikan untuk digunakan pada XAMPP (MySQL/MariaDB)

CREATE DATABASE IF NOT EXISTS `buku_induk_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `buku_induk_db`;

-- 1. Table: admin_users (Menyimpan kredensial administrator)
CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Password bawaan: admin123 (Menggunakan hash aman PASSWORD_DEFAULT / bcrypt)
INSERT INTO `admin_users` (`username`, `password`) 
VALUES ('admin', '$2y$10$7Z/Yg.gZ99I8p326hYvYWe8UfofYf0gWv5pWzU4L4A292j7O6V01S')
ON DUPLICATE KEY UPDATE `username`=`username`;

-- 2. Table: students (Data Lengkap Buku Induk Murid Sesuai SMAN 1 Purwokerto)
CREATE TABLE IF NOT EXISTS `students` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nisn` VARCHAR(15) NOT NULL UNIQUE,
  `nis` VARCHAR(15) DEFAULT NULL,
  `nik` VARCHAR(20) DEFAULT NULL,
  `no_pendaftaran` VARCHAR(30) DEFAULT NULL,
  `no_kk` VARCHAR(20) DEFAULT NULL,
  `no_kip` VARCHAR(20) DEFAULT NULL,
  `id_dtks` VARCHAR(20) DEFAULT NULL,
  
  -- Personal Data
  `nama_lengkap` VARCHAR(100) NOT NULL,
  `nama_panggilan` VARCHAR(50) DEFAULT NULL,
  `jenis_kelamin` VARCHAR(15) NOT NULL,
  `tempat_lahir` VARCHAR(50) DEFAULT NULL,
  `tanggal_lahir` DATE NOT NULL,
  `agama` VARCHAR(20) DEFAULT NULL,
  `kewarganegaraan` VARCHAR(30) DEFAULT NULL,
  `anak_ke` INT DEFAULT 1,
  `saudara_kandung` INT DEFAULT 0,
  `saudara_tiri` INT DEFAULT 0,
  `saudara_angkat` INT DEFAULT 0,
  `saudara_kembar` INT DEFAULT 0,
  `anak_yatim_piatu` VARCHAR(50) DEFAULT 'Bukan Anak Yatim Piatu',
  `status_keluarga` VARCHAR(55) DEFAULT 'Lengkap',
  `bahasa_sehari_hari` VARCHAR(55) DEFAULT 'Bahasa Indonesia',
  
  -- Address Data
  `alamat_lengkap` TEXT DEFAULT NULL,
  `telepon` VARCHAR(25) DEFAULT NULL,
  `tinggal_dengan` VARCHAR(55) DEFAULT 'Orang Tua',
  `jarak_ke_sekolah` VARCHAR(25) DEFAULT NULL,
  `transportasi` VARCHAR(55) DEFAULT NULL,
  
  -- Health Data
  `golongan_darah` VARCHAR(5) DEFAULT NULL,
  `penyakit_pernah_diderita` TEXT DEFAULT NULL,
  `kelainan_jasmani` TEXT DEFAULT NULL,
  `tinggi_badan` INT DEFAULT 0,
  `berat_badan` INT DEFAULT 0,
  
  -- Education Data
  `lulusan_dari` VARCHAR(100) DEFAULT NULL,
  `tanggal_ijazah` VARCHAR(30) DEFAULT NULL,
  `nomor_ijazah` VARCHAR(50) DEFAULT NULL,
  `pindahan_dari` VARCHAR(100) DEFAULT NULL,
  `alasan_pindah` TEXT DEFAULT NULL,
  `lama_belajar` VARCHAR(30) DEFAULT NULL,
  
  -- Average Scores (Junior High School)
  `rerata_agama` DECIMAL(5,2) DEFAULT 0.00,
  `rerata_ppkn` DECIMAL(5,2) DEFAULT 0.00,
  `rerata_b_indonesia` DECIMAL(5,2) DEFAULT 0.00,
  `rerata_matematika` DECIMAL(5,2) DEFAULT 0.00,
  `rerata_ipa` DECIMAL(5,2) DEFAULT 0.00,
  `rerata_ips` DECIMAL(5,2) DEFAULT 0.00,
  `rerata_b_inggris` DECIMAL(5,2) DEFAULT 0.00,
  
  -- Achievements
  `prestasi_akademik` TEXT DEFAULT NULL,
  `prestasi_non_akademik` TEXT DEFAULT NULL,
  
  -- Father's Data
  `ayah_nama` VARCHAR(100) DEFAULT NULL,
  `ayah_nik` VARCHAR(20) DEFAULT NULL,
  `ayah_tempat_lahir` VARCHAR(50) DEFAULT NULL,
  `ayah_tanggal_lahir` DATE DEFAULT NULL,
  `ayah_agama` VARCHAR(20) DEFAULT NULL,
  `ayah_kewarganegaraan` VARCHAR(30) DEFAULT NULL,
  `ayah_pendidikan` VARCHAR(50) DEFAULT NULL,
  `ayah_pekerjaan` VARCHAR(100) DEFAULT NULL,
  `ayah_penghasilan` VARCHAR(50) DEFAULT NULL,
  `ayah_alamat` TEXT DEFAULT NULL,
  `ayah_telepon` VARCHAR(25) DEFAULT NULL,
  `ayah_is_masih_hidup` TINYINT(1) DEFAULT 1,
  
  -- Mother's Data
  `ibu_nama` VARCHAR(100) DEFAULT NULL,
  `ibu_nik` VARCHAR(20) DEFAULT NULL,
  `ibu_tempat_lahir` VARCHAR(50) DEFAULT NULL,
  `ibu_tanggal_lahir` DATE DEFAULT NULL,
  `ibu_agama` VARCHAR(20) DEFAULT NULL,
  `ibu_kewarganegaraan` VARCHAR(30) DEFAULT NULL,
  `ibu_pendidikan` VARCHAR(50) DEFAULT NULL,
  `ibu_pekerjaan` VARCHAR(100) DEFAULT NULL,
  `ibu_penghasilan` VARCHAR(50) DEFAULT NULL,
  `ibu_alamat` TEXT DEFAULT NULL,
  `ibu_telepon` VARCHAR(25) DEFAULT NULL,
  `ibu_is_masih_hidup` TINYINT(1) DEFAULT 1,
  
  -- Guardian's Data
  `has_wali` TINYINT(1) DEFAULT 0,
  `wali_nama` VARCHAR(100) DEFAULT NULL,
  `wali_nik` VARCHAR(20) DEFAULT NULL,
  `wali_tempat_lahir` VARCHAR(50) DEFAULT NULL,
  `wali_tanggal_lahir` DATE DEFAULT NULL,
  `wali_agama` VARCHAR(20) DEFAULT NULL,
  `wali_kewarganegaraan` VARCHAR(30) DEFAULT NULL,
  `wali_pendidikan` VARCHAR(50) DEFAULT NULL,
  `wali_pekerjaan` VARCHAR(100) DEFAULT NULL,
  `wali_penghasilan` VARCHAR(50) DEFAULT NULL,
  `wali_alamat` TEXT DEFAULT NULL,
  `wali_telepon` VARCHAR(25) DEFAULT NULL,
  `wali_hubungan_siswa` VARCHAR(50) DEFAULT NULL,
  
  -- School & Enrollment Data
  `kelas_sekarang` VARCHAR(15) NOT NULL,
  `program_keahlian` VARCHAR(50) DEFAULT NULL,
  `tanggal_masuk` DATE NOT NULL,
  `beasiswa` VARCHAR(100) DEFAULT NULL,
  `tanggal_keluar` DATE DEFAULT NULL,
  `alasan_keluar` TEXT DEFAULT NULL,
  `nomor_stb` VARCHAR(30) DEFAULT NULL,
  
  -- Hobbies (Kegemaran)
  `kesenian` VARCHAR(100) DEFAULT NULL,
  `olahraga` VARCHAR(100) DEFAULT NULL,
  `organisasi` VARCHAR(100) DEFAULT NULL,
  
  -- Profile Picture (Base64 or image filename)
  `foto` LONGTEXT DEFAULT NULL,
  
  -- Permissions
  `allow_print` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Table: correction_requests (Pencatatan usulan revisi data mandiri oleh siswa)
CREATE TABLE IF NOT EXISTS `correction_requests` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `student_nisn` VARCHAR(15) NOT NULL,
  `student_nama` VARCHAR(100) NOT NULL,
  `request_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `field_name` VARCHAR(100) NOT NULL, -- Kolom database yang diajukan perubahan
  `field_label` VARCHAR(100) NOT NULL, -- Nama label human-readable (misal: "Nama Lengkap")
  `old_value` TEXT DEFAULT NULL,
  `new_value` TEXT DEFAULT NULL,
  `status` ENUM('Diproses', 'Disetujui', 'Ditolak') DEFAULT 'Diproses',
  `notes` TEXT DEFAULT NULL, -- Alasan penolakan dll.
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Contoh Seeding Data Siswa Awal untuk Kemudahan Pengujian
INSERT INTO `students` (
  `nisn`, `nis`, `nik`, `no_pendaftaran`, `no_kk`, `nama_lengkap`, `nama_panggilan`, `jenis_kelamin`, 
  `tempat_lahir`, `tanggal_lahir`, `agama`, `kewarganegaraan`, `alamat_lengkap`, `telepon`, 
  `tinggal_dengan`, `jarak_ke_sekolah`, `transportasi`, `golongan_darah`, `tinggi_badan`, `berat_badan`, 
  `lulusan_dari`, `tanggal_ijazah`, `nomor_ijazah`, `rerata_agama`, `rerata_ppkn`, `rerata_b_indonesia`, 
  `rerata_matematika`, `rerata_ipa`, `rerata_ips`, `rerata_b_inggris`, `ayah_nama`, `ayah_nik`, `ayah_agama`, 
  `ayah_kewarganegaraan`, `ayah_pendidikan`, `ayah_pekerjaan`, `ayah_penghasilan`, `ayah_alamat`, 
  `ayah_telepon`, `ayah_is_masih_hidup`, `ibu_nama`, `ibu_nik`, `ibu_agama`, `ibu_kewarganegaraan`, 
  `ibu_pendidikan`, `ibu_pekerjaan`, `ibu_penghasilan`, `ibu_alamat`, `ibu_telepon`, `ibu_is_masih_hidup`, 
  `has_wali`, `kelas_sekarang`, `program_keahlian`, `tanggal_masuk`, `nomor_stb`
) VALUES (
  '0082156740', '23001', '3302261504080001', '2026110901', '3302262402052364', 'Bagas Aditya Pratama', 'Bagas', 'Laki-laki',
  'Banyumas', '2008-04-15', 'Islam', 'WNI', 'Jl. Jenderal Sudirman No. 12, Purwokerto Lor', '081234567890',
  'Orang Tua', '2.5 km', 'Sepeda Motor', 'O', 170, 62,
  'SMP Negeri 1 Purwokerto', '2024-06-10', 'DN-03/DI/06/0012345', 92.5, 90.0, 94.0, 88.5, 91.0, 89.0, 93.0,
  'Sutrisno', '3302261504740001', 'Islam', 'WNI', 'S1', 'PNS / Guru', 'Rp 5.000.000 - Rp 10.000.000', 'Jl. Jenderal Sudirman No. 12',
  '08122334455', 1, 'Sri Wahyuni', '3302261504780002', 'Islam', 'WNI', 'D3', 'Ibu Rumah Tangga', 'Tidak Berpenghasilan', 'Jl. Jenderal Sudirman No. 12',
  '08122334466', 1, 0, 'X-A', 'MIPA', '2024-07-15', '241001'
), (
  '0083214567', '23002', '3302261809080002', '2026110902', '3302262402052388', 'Safira Anindya Putri', 'Safira', 'Perempuan',
  'Purwokerto', '2008-09-18', 'Islam', 'WNI', 'Perumahan Griya Indah Blok C-5, Purwokerto Kulon', '082198765432',
  'Orang Tua', '1.2 km', 'Antar Jemput', 'AB', 160, 48,
  'SMP Negeri 2 Purwokerto', '2024-06-11', 'DN-03/DI/06/0012346', 95.0, 93.5, 96.0, 90.0, 92.5, 95.0, 96.0,
  'Ahmad Fauzi', '3302261504700003', 'Islam', 'WNI', 'S2', 'Swasta / Karyawan', 'Rp 10.000.000 - Rp 20.000.000', 'Perumahan Griya Indah Blok C-5',
  '082155667788', 1, 'Dewi Lestari', '3302261504720004', 'Islam', 'WNI', 'S1', 'Karyawan Swasta', 'Rp 3.000.000 - Rp 5.000.0s00', 'Perumahan Griya Indah Blok C-5',
  '082155667799', 1, 0, 'XI-MIPA 2', 'MIPA', '2024-07-15', '241002'
);
