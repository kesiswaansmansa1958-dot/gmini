<?php
require_once 'config.php';

// Proteksi Halaman Admin
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'ADMIN') {
    redirect('login.php');
}

$error_msg = null;
$success_msg = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $current_password = $_POST['current_password'] ?? '';
    $new_username = trim($_POST['new_username'] ?? '');
    $new_password = $_POST['new_password'] ?? '';
    $confirm_password = $_POST['confirm_password'] ?? '';

    if (empty($current_password) || empty($new_username)) {
        $error_msg = "Username baru dan kata sandi saat ini wajib diisi!";
    } else {
        // Ambil data admin saat ini
        $stmt = $db->prepare("SELECT * FROM admin_users WHERE id = ?");
        $stmt->execute([$_SESSION['admin_id']]);
        $admin = $stmt->fetch();

        if ($admin && password_verify($current_password, $admin['password'])) {
            // Apakah mengganti password juga atau hanya username?
            if (!empty($new_password)) {
                if ($new_password !== $confirm_password) {
                    $error_msg = "Konfirmasi Sandi Baru tidak cocok!";
                } elseif (strlen($new_password) < 6) {
                    $error_msg = "Kata sandi baru minimal 6 karakter!";
                } else {
                    // Update username & password hash
                    $passwd_hash = password_hash($new_password, PASSWORD_DEFAULT);
                    $update_stmt = $db->prepare("UPDATE admin_users SET username = ?, password = ? WHERE id = ?");
                    $update_stmt->execute([$new_username, $passwd_hash, $_SESSION['admin_id']]);
                    
                    $_SESSION['admin_username'] = $new_username;
                    set_flash_message("Kredensial administrator berhasil diperbarui!", "success");
                    redirect('admin_dashboard.php?tab=ubah_password');
                }
            } else {
                // Hanya update username
                $update_stmt = $db->prepare("UPDATE admin_users SET username = ? WHERE id = ?");
                $update_stmt->execute([$new_username, $_SESSION['admin_id']]);
                
                $_SESSION['admin_username'] = $new_username;
                set_flash_message("Username administrator berhasil diperbarui!", "success");
                redirect('admin_dashboard.php?tab=ubah_password');
            }
        } else {
            $error_msg = "Kata Sandi saat ini salah! Verifikasi identitas gagal.";
        }
    }
}

// Ambil data admin terkini untuk form default
$stmt = $db->prepare("SELECT username FROM admin_users WHERE id = ?");
$stmt->execute([$_SESSION['admin_id']]);
$admin = $stmt->fetch();
$current_username = $admin ? $admin['username'] : $_SESSION['admin_username'];
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ubah Password Admin | SMAN 1 Purwokerto</title>
    <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <style>
        body { font-family: "Inter", sans-serif; background-color: #f8fafc; }
    </style>
</head>
<body class="min-h-screen bg-slate-50 flex flex-col justify-between">

    <!-- Header -->
    <header class="bg-slate-900 text-white py-4 px-6 border-b border-slate-800 shadow-sm">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
            <div class="flex items-center gap-3">
                <a href="admin_dashboard.php" class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-sm tracking-wider shadow-md text-white">S1</a>
                <div>
                    <h1 class="text-xs font-black tracking-wider uppercase text-slate-100">Panel Administrator TU</h1>
                    <p class="text-[9px] text-gray-400 font-medium">Ubah Kredensial Keamanan</p>
                </div>
            </div>
            <div class="flex items-center gap-3">
                <a href="admin_dashboard.php" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-bold transition flex items-center gap-1">
                    Kembali Ke Dashboard
                </a>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 max-w-lg w-full mx-auto p-4 py-12">
        <?php display_flash_message(); ?>

        <div class="bg-white rounded-3xl border border-gray-150 p-6 md:p-8 shadow-sm">
            <!-- Header -->
            <div class="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                <div class="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
                </div>
                <div>
                    <h3 class="font-bold text-slate-800 text-md">Pengaturan Keamanan Akun</h3>
                    <p class="text-[11px] text-gray-400 font-medium font-sans">
                        Ubah username dan kata sandi akses administrator sekolah (TU)
                    </p>
                </div>
            </div>

            <!-- Error Notification -->
            <?php if ($error_msg): ?>
                <div class="mb-5 p-3.5 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold rounded-2xl flex items-center gap-2.5">
                    <svg class="w-4 h-4 text-rose-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
                    <span><?= esc($error_msg) ?></span>
                </div>
            <?php endif; ?>

            <!-- Form -->
            <form method="POST" class="space-y-4">
                
                <!-- Username -->
                <div>
                    <label class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        <span>Username Administrator Baru</span>
                    </label>
                    <input type="text" name="new_username" required value="<?= esc($current_username) ?>"
                        class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-bold font-mono text-slate-700 focus:outline-none focus:border-blue-500">
                </div>

                <div class="border-t border-gray-100 my-4 pt-4">
                    <span class="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold block mb-3">
                        Ubah Kata Sandi (Kosongkan jika tidak ingin mengubah sandi)
                    </span>

                    <div class="space-y-3.5">
                        <!-- New Password -->
                        <div>
                            <label class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                <span>Kata Sandi Baru</span>
                            </label>
                            <input type="password" name="new_password" placeholder="Masukkan kata sandi baru (min. 6 karakter)" minlength="6"
                                class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-bold font-mono text-slate-700 focus:outline-none focus:border-blue-500">
                        </div>

                        <!-- Confirm New Password -->
                        <div>
                            <label class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                <svg class="w-3.5 h-3.5 text-zinc-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                <span>Konfirmasi Kata Sandi Baru</span>
                            </label>
                            <input type="password" name="confirm_password" placeholder="Ulangi kata sandi baru"
                                class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-bold font-mono text-slate-700 focus:outline-none focus:border-blue-500">
                        </div>
                    </div>
                </div>

                <!-- Current Password Verification -->
                <div class="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-2 mt-4">
                    <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                        <span>Verifikasi Kata Sandi Saat Ini</span>
                    </label>
                    <p class="text-[10px] text-gray-400 leading-relaxed font-medium">
                        Sehubungan keamanan privasi buku induk SMANSA, Anda diwajibkan melakukan konfirmasi autentikasi kata sandi aktif untuk menyelesaikan perubahan kredensial.
                    </p>
                    <input type="password" name="current_password" required placeholder="Masukkan Sandi Admin Sekarang"
                        class="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold font-mono text-slate-700 focus:outline-none focus:border-blue-500">
                </div>

                <!-- Submit -->
                <button type="submit"
                    class="w-full py-2.5 mt-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-600/10 flex items-center justify-center gap-1.5 cursor-pointer">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span>Simpan Perubahan Kredensial</span>
                </button>

            </form>
        </div>
    </main>

    <!-- Footer -->
    <footer class="bg-slate-900 text-slate-400 py-6 text-center text-xs border-t border-slate-800 mt-12">
        <p>&copy; <?= date('Y') ?> SMA Negeri 1 Purwokerto. Hak Cipta Dilindungi.</p>
    </footer>

</body>
</html>
