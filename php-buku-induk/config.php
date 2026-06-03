<?php
/**
 * Configuration File for PHP Buku Induk SMAN 1 Purwokerto
 * Sesuai Standar XAMPP local server
 */

if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

// Database Credentials untuk XAMPP default
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'buku_induk_db');

try {
    $db = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false
    ]);
} catch (PDOException $e) {
    die("Database Connection Failed! Silakan nyalakan MySQL di control panel XAMPP dan pastikan database 'buku_induk_db' telah di-import di phpMyAdmin.<br><b>Pesan Error:</b> " . $e->getMessage());
}

/**
 * Sanitize output to prevent XSS Attacks
 */
function esc($string) {
    return htmlspecialchars($string ?? '', ENT_QUOTES, 'UTF-8');
}

/**
 * Format Date from YYYY-MM-DD to Indonesian human-readable
 */
function format_indo_date($date_str) {
    if (!$date_str || $date_str == '0000-00-00') return '-';
    $months = [
        1 => 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    $time = strtotime($date_str);
    if (!$time) return esc($date_str);
    
    $day = date('j', $time);
    $month_num = (int)date('n', $time);
    $year = date('Y', $time);
    
    return $day . ' ' . $months[$month_num] . ' ' . $year;
}

/**
 * Redirect Helper
 */
function redirect($url) {
    header("Location: " . $url);
    exit;
}

/**
 * Save Alert Message to Session
 */
function set_flash_message($message, $type = 'success') {
    $_SESSION['flash_message'] = $message;
    $_SESSION['flash_type'] = $type;
}

/**
 * Display Alert Message from Session
 */
function display_flash_message() {
    if (isset($_SESSION['flash_message'])) {
        $msg = esc($_SESSION['flash_message']);
        $type = $_SESSION['flash_type'] ?? 'success';
        unset($_SESSION['flash_message']);
        unset($_SESSION['flash_type']);
        
        $colors = [
            'success' => 'bg-emerald-50 border-emerald-100 text-emerald-800',
            'warning' => 'bg-amber-50 border-amber-100 text-amber-800',
            'danger' => 'bg-rose-50 border-rose-100 text-rose-800',
            'info' => 'bg-blue-50 border-blue-100 text-blue-800'
        ];
        
        $color = $colors[$type] ?? $colors['success'];
        echo "
        <div class='p-4 mb-5 border rounded-2xl text-xs font-bold font-sans flex items-center justify-between shadow-sm animate-fadeIn {$color}'>
            <span>{$msg}</span>
            <button type='button' onclick='this.parentElement.remove()' class='ml-3 text-slate-400 hover:text-slate-600 font-sans font-bold text-lg leading-none'>&times;</button>
        </div>";
    }
}
?>
