# 📑 Aplikasi Buku Induk Kesiswaan SMAN 1 Purwokerto (Versi PHP & MySQL / XAMPP)

Folder ini berisi versi pemrograman **PHP Native** dan **MySQL** dari aplikasi Buku Induk Kesiswaan, yang dirancang khusus agar dapat dipasang secara luring (offline) dengan mudah menggunakan paket **XAMPP Local Server**.

---

## 🛠️ Langkah-Langkah Pemasangan di XAMPP

### Langkah 1: Memindahkan Berkas ke folder Apache
1. Pasang/Install aplikasi **XAMPP Control Panel** di komputer Anda.
2. Unduh atau salin seluruh isi folder `/php-buku-induk` ini.
3. Tempelkan (paste) folder tersebut ke direktori pembuka Apache XAMPP Anda. Biasanya terletak di:
   - **Windows:** `C:\xampp\htdocs\` (Disarankan buat folder baru bernama `buku-induk` sehingga lengkapnya adalah `C:\xampp\htdocs\buku-induk\`).
   - **macOS:** `/Applications/XAMPP/htdocs/`
   - **Linux:** `/opt/lampp/htdocs/`

---

### Langkah 2: Mengaktifkan Server Apache & MySQL
1. Buka aplikasi **XAMPP Control Panel**.
2. Klik tombol **Start** pada layanan **Apache** dan **MySQL** sampai indikator berwarna hijau.

---

### Langkah 3: Mengimpor Database MySQL di phpMyAdmin
1. Buka penjelajah web (browser) Anda, lalu kunjungi alamat: **[http://localhost/phpmyadmin](http://localhost/phpmyadmin)**.
2. Buat database baru:
   - Klik tab **Databases** di menu atas.
   - Isi nama database: `buku_induk_db`
   - Klik **Create**.
3. Impor berkas struktur tabel:
   - Klik nama database `buku_induk_db` yang baru saja Anda buat di panel sebelah kiri.
   - Klik tab **Import** di menu atas.
   - Klik tombol **Browse / Choose File**, lalu cari berkas `database.sql` yang berada di dalam folder proyek Anda.
   - Gulir ke bawah lalu klik tombol **Go** atau **Import**.
4. Database Anda kini telah terbuat dengan data bawaan siap pakai!

---

### Langkah 4: Menjalankan Aplikasi
1. Buka browser Anda, lalu akses aplikasi melalui URL berikut:
   - **[http://localhost/buku-induk/login.php](http://localhost/buku-induk/login.php)** (Atau menyesuaikan folder yang Anda buat di `htdocs`).

---

## 🔑 Kredensial Akun untuk Pengujian Awal

Sistem dilengkapi dengan akun siap pakai untuk memudahkan pengujian kearasipan:

### 1) Akses Akun Administrator Tata Usaha (Staf TU KPI)
- **Username:** `admin`
- **Password:** `admin123`
*(Anda dapat mengubah password admin ini sewaktu-waktu di menu Dashboard Admin > Ubah Password secara aman).*

---

### 2) Akses Akun Siswa Mandiri (Otomatis menggunakan NISN & Tanggal Lahir)
Ada dua data contoh siswa bawaan dari SMAN 1 Purwokerto:

#### Siswa Contoh 1 (Bagas Aditya Pratama):
- **NISN:** `0082156740`
- **Tanggal Lahir:** `15 April 2008` (Isi pada formulir penanggalan: `15/04/2008` atau `2008-04-15`)

#### Siswa Contoh 2 (Safira Anindya Putri):
- **NISN:** `0083214567`
- **Tanggal Lahir:** `18 September 2008` (Isi pada formulir penanggalan: `18/09/2008` atau `2008-09-18`)

---

## 🌟 Fitur Unggulan Sistem PHP MySQL (XAMPP)

1. **Dashboard Siswa Mandiri:** Siswa dapat melihat pratinjau lembar data mereka, dan mengajukan satu per satu butir revisi jika ada ketidaksesuaian ketik.
2. **Dashboard Verifikator TU (Otorisasi Satu Pintu):** Admin TU dapat memeriksa semua antrean revisi data siswa, menyetujui, atau menolaknya dengan cepat. Jika disetujui, isian tabel MySQL akan terperbarui otomatis.
3. **Template Print Double Border Resmi SMANSA:** Pencetakan otomatis untuk tiga dokumen penting menggunakan ukuran kertas F4 (Folio) Indonesia:
   - *Lembar Buku Induk Peserta Didik Baru* (Disertai pas foto Base64).
   - *Surat Pernyataan Peserta Didik Baru* (Pledge patuh tata tertib sekolah).
   - *Surat Pernyataan Orang Tua / Wali* (Penandatanganan tanggung jawab bimbingan di rumah).
4. **Keamanan hashing modern:** Menggunakan bcrypt (`PASSWORD_DEFAULT`) untuk mengamankan data sandi administrator agar terhindar dari tindak kejahatan keamanan siber.
5. **Responsif & Estetik:** Dikemas menggunakan framework css **Tailwind** via CDN modern agar aplikasi memiliki kenyamanan visual yang tinggi tanpa membutuhkan setup build compiler yang rumit.
