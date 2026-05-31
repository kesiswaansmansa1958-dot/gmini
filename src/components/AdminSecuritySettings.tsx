import React, { useState } from "react";
import { Lock, User, KeyRound, AlertCircle, CheckCircle } from "lucide-react";

interface AdminSecuritySettingsProps {
  currentUsername: string;
  onUpdateCredentials: (currentPasswordInput: string, newUsername: string, newPassword?: string) => boolean;
  showToast: (message: string, type: "success" | "info" | "warning") => void;
}

export const AdminSecuritySettings: React.FC<AdminSecuritySettingsProps> = ({
  currentUsername,
  onUpdateCredentials,
  showToast,
}) => {
  const [username, setUsername] = useState(currentUsername);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!currentPassword) {
      setErrorMsg("Harap masukkan Kata Sandi saat ini untuk memverifikasi identitas Anda.");
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setErrorMsg("Konfirmasi Sandi Baru tidak cocok!");
      return;
    }

    // Attempt update
    const success = onUpdateCredentials(currentPassword, username, newPassword || undefined);
    if (success) {
      setSuccessMsg("Keamanan administrator berhasil diperbarui!");
      showToast("Kredensial administrator berhasil diperbarui!", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setErrorMsg("Kata Sandi saat ini salah! Verifikasi identitas gagal.");
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-150 p-6 md:p-8 max-w-lg mx-auto shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
          <KeyRound className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-sans font-black text-slate-800 text-md">Pengaturan Keamanan Akun</h3>
          <p className="text-[11px] text-gray-400 font-medium font-sans">
            Ubah username dan kata sandi akses administrator sekolah (TU)
          </p>
        </div>
      </div>

      {/* Alert Banner for errors or success */}
      {errorMsg && (
        <div className="mb-5 p-3.5 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold rounded-2xl flex items-center gap-2.5 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold rounded-2xl flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Username */}
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5 font-sans">
            <User className="w-3.5 h-3.5 text-gray-400" />
            <span>Username Administrator Baru</span>
          </label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Contoh: admin"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-bold font-mono text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="border-t border-gray-100 my-4 pt-4">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-black block mb-3 font-sans">
            Ubah Kata Sandi (Kosongkan jika tidak ingin mengubah sandi)
          </span>

          <div className="space-y-3.5">
            {/* New Password */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5 font-sans">
                <Lock className="w-3.5 h-3.5 text-gray-400" />
                <span>Kata Sandi Baru</span>
              </label>
              <input
                type="password"
                placeholder="Masukkan kata sandi baru (min. 6 karakter)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-bold font-mono text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5 font-sans">
                <Lock className="w-3.5 h-3.5 text-rose-300" />
                <span>Konfirmasi Kata Sandi Baru</span>
              </label>
              <input
                type="password"
                placeholder="Ulangi kata sandi baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-bold font-mono text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Current Password Verification */}
        <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-2 mt-4">
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 font-sans">
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>Verifikasi Kata Sandi Saat Ini</span>
          </label>
          <p className="text-[10px] text-gray-400 font-sans leading-relaxed">
            Sehubungan keamanan privasi buku induk SMANSA, Anda diwajibkan melakukan konfirmasi autentikasi kata sandi aktif untuk menyelesaikan perubahan kredensial.
          </p>
          <input
            type="password"
            required
            placeholder="Masukkan Sandi Admin Sekarang"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold font-mono text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-2.5 mt-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-600/10 flex items-center justify-center gap-1.5 cursor-pointer font-sans"
        >
          <CheckCircle className="w-4 h-4" />
          <span>Simpan Perubahan Kredensial</span>
        </button>

      </form>
    </div>
  );
};
