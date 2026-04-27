import React, { useState } from 'react';
import { hashPin } from '../../utils/auth';
import { writePremiumState } from '../../utils/entitlement';

/**
 * AdminLoginScreen - Yazar / Yönetici girişi (rol seçim ekranından)
 *
 * Güvenlik: Şifre plaintext olarak kaynakta yok — SHA-256 + salt hash karşılaştırması.
 * Brute force koruması: 5 başarısız deneme sonrası 60 saniye kilit.
 * Admin kişiyle paylaşılan parolayı bilir; APK'dan reverse-engineer edilemez.
 */
const ADMIN_PW_HASH = '85ced32324b79bea99393b52aa5403e62c385d49fbacbdedefa3b48595d5ad53';
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60 * 1000;

const AdminLoginScreen = ({ onLogin, onBack }) => {
  const [pw, setPw] = useState('');
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [lockUntil, setLockUntil] = useState(() => {
    try { return parseInt(localStorage.getItem('matbil_admin_lockout') || '0', 10); } catch { return 0; }
  });
  const now = Date.now();
  const locked = lockUntil > now;
  const remainingSec = locked ? Math.ceil((lockUntil - now) / 1000) : 0;

  const recordAttempt = (success) => {
    try {
      if (success) {
        localStorage.removeItem('matbil_admin_attempts');
        localStorage.removeItem('matbil_admin_lockout');
        return;
      }
      const attempts = parseInt(localStorage.getItem('matbil_admin_attempts') || '0', 10) + 1;
      localStorage.setItem('matbil_admin_attempts', String(attempts));
      if (attempts >= MAX_ATTEMPTS) {
        const until = Date.now() + LOCKOUT_MS;
        localStorage.setItem('matbil_admin_lockout', String(until));
        localStorage.setItem('matbil_admin_attempts', '0');
        setLockUntil(until);
      }
    } catch {}
  };

  const tryLogin = async () => {
    if (locked || busy || !pw) return;
    setBusy(true);
    try {
      const hash = await hashPin(pw);
      if (hash !== ADMIN_PW_HASH) {
        setError(true);
        recordAttempt(false);
        setBusy(false);
        return;
      }
      recordAttempt(true);
      writePremiumState('ADMIN-AUTHOR');
      try {
        localStorage.setItem('matbil_freemium_migrated', '1');
        localStorage.setItem('matbil_onboarded', '1');
      } catch {}
      onLogin({
        id: 'admin_user',
        name: 'Yönetici',
        role: 'admin',
        loginAt: new Date().toISOString(),
      });
    } catch (e) {
      setError(true);
      setBusy(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-b from-slate-100 via-amber-50 to-orange-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="text-center mb-5">
            <div className="text-5xl mb-2">{"👨‍🏫"}</div>
            <h2 className="text-xl font-bold text-gray-800">Yazar / Yönetici Girişi</h2>
            <p className="text-xs text-amber-600 mt-1">Kitap yazarları ve sistem yöneticisi için</p>
          </div>

          {locked && (
            <div className="mb-3 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2 text-xs text-orange-700 flex items-start gap-1.5">
              <span>{"⏱️"}</span><span>Çok fazla hatalı deneme. {remainingSec} saniye bekleyin.</span>
            </div>
          )}
          {error && !locked && (
            <div className="mb-3 bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-xs text-red-700 flex items-start gap-1.5">
              <span>{"⚠️"}</span><span>Şifre hatalı. Lütfen tekrar deneyin.</span>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-600 mb-1.5">Şifre</label>
            <input
              type="password"
              value={pw}
              onChange={e => { setPw(e.target.value); setError(false); }}
              onKeyDown={e => e.key === 'Enter' && tryLogin()}
              placeholder="••••••••"
              disabled={locked || busy}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-center text-lg tracking-widest focus:border-amber-400 focus:outline-none disabled:bg-gray-50 disabled:text-gray-400"
              autoFocus
            />
          </div>

          <button
            onClick={tryLogin}
            disabled={!pw || locked || busy}
            className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-md transition-all ${
              pw && !locked && !busy
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90 active:scale-95'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {busy ? '⏳ Doğrulanıyor…' : locked ? `🔒 Kilitli (${remainingSec}s)` : '🔓 Giriş Yap'}
          </button>

          <button
            onClick={onBack}
            className="w-full mt-3 py-2.5 text-gray-500 text-sm hover:text-gray-700 transition-colors"
          >
            {"←"} Geri
          </button>

          <div className="mt-4 pt-3 border-t border-gray-100 text-center">
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Giriş sonrası tüm 36 oyun ve akademik içerik otomatik açılır. Şifrenizi unuttuysanız sistem yöneticisiyle iletişime geçin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginScreen;
