import React, { useState } from 'react';
import { findAdminByEmail } from '../../constants/adminAccounts';
import { verifyPin } from '../../utils/auth';
import { __devSetPremium } from '../../utils/entitlement';

/**
 * AdminLoginScreen - Kitap yazarları için özel giriş ekranı
 *
 * Email + parola ile giriş. Başarılı girişte:
 *  - onLogin callback'i ile admin kullanıcı aktarılır
 *  - Premium otomatik aktive olur (kod: "ADMIN-<user-id>")
 *  - Admin Panel'e ve tüm özelliklere erişim verilir
 */
const AdminLoginScreen = ({ onLogin, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (submitting) return;
    setError('');
    const admin = findAdminByEmail(email);
    if (!admin) {
      setError('Bu e-posta ile kayıtlı yazar hesabı bulunamadı.');
      return;
    }
    setSubmitting(true);
    try {
      const ok = await verifyPin(password, admin.passwordHash);
      if (!ok) {
        setError('Parola hatalı. Lütfen tekrar deneyin.');
        return;
      }
      // Admin hesabı için premium otomatik aktive
      try {
        localStorage.setItem('matbil_premium', '1');
        localStorage.setItem('matbil_premium_code', `ADMIN-${admin.id}`);
        localStorage.setItem('matbil_premium_at', new Date().toISOString());
        // Freemium migration tamamlanmış sayılır (bu cihaz için artık kilit uygulanmaz)
        localStorage.setItem('matbil_freemium_migrated', '1');
      } catch {}
      onLogin({
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: 'admin',
        title: admin.title,
        avatar: admin.avatar,
        loginAt: new Date().toISOString(),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-b from-slate-100 via-amber-50 to-orange-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          {/* Başlık */}
          <div className="text-center mb-5">
            <div className="text-5xl mb-2">{"👨‍🏫"}</div>
            <h2 className="text-xl font-bold text-gray-800">Yazar Girişi</h2>
            <p className="text-xs text-amber-600 mt-1">Kitap yazarlarına özel erişim</p>
          </div>

          {error && (
            <div className="mb-3 bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-xs text-red-700 flex items-start gap-1.5">
              <span>{"⚠️"}</span><span>{error}</span>
            </div>
          )}

          {/* Email */}
          <div className="mb-3">
            <label className="block text-xs font-bold text-gray-600 mb-1.5">E-posta Adresi</label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && password && handleSubmit()}
              placeholder="ornek@ornek.com"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* Parola */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-600 mb-1.5">Parola</label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="••••••••"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* Giriş butonu */}
          <button
            onClick={handleSubmit}
            disabled={!email || !password || submitting}
            className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-md transition-all ${
              email && password && !submitting
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90 active:scale-95'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {submitting ? '⏳ Doğrulanıyor...' : '🔓 Giriş Yap'}
          </button>

          <button
            onClick={onBack}
            className="w-full mt-3 py-2.5 text-gray-500 text-sm hover:text-gray-700 transition-colors"
          >
            {"←"} Rol Seçimine Dön
          </button>

          <div className="mt-4 pt-3 border-t border-gray-100 text-center">
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Bu ekran yalnızca yetkili yazarlar içindir. Parolanızı unuttuysanız sistem yöneticisiyle iletişime geçin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginScreen;
