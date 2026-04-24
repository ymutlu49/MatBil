import React, { useState } from 'react';

/**
 * AdminLoginScreen - Yazar / Yönetici girişi (rol seçim ekranından)
 *
 * Tek şifre alanı: matbil2025. Başarılı girişte:
 *  - localStorage'a premium kaydı yazılır
 *  - onLogin() çağrılır → App.jsx 'admin' rolünde kullanıcı oluşturur
 *  - Ana ekran açılır, tüm 36 oyun kilitsiz
 */
const AdminLoginScreen = ({ onLogin, onBack }) => {
  const ADMIN_PW = 'matbil2025';
  const [pw, setPw] = useState('');
  const [error, setError] = useState(false);

  const tryLogin = () => {
    if (pw !== ADMIN_PW) {
      setError(true);
      return;
    }
    // Premium otomatik aktive + onboarding atla
    try {
      localStorage.setItem('matbil_premium', '1');
      localStorage.setItem('matbil_premium_code', 'ADMIN-AUTHOR');
      localStorage.setItem('matbil_premium_at', new Date().toISOString());
      localStorage.setItem('matbil_freemium_migrated', '1');
      localStorage.setItem('matbil_onboarded', '1');
    } catch {}
    onLogin({
      id: 'admin_user',
      name: 'Yönetici',
      role: 'admin',
      loginAt: new Date().toISOString(),
    });
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

          {error && (
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
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-center text-lg tracking-widest focus:border-amber-400 focus:outline-none"
              autoFocus
            />
          </div>

          <button
            onClick={tryLogin}
            disabled={!pw}
            className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-md transition-all ${
              pw
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90 active:scale-95'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {"🔓"} Giriş Yap
          </button>

          <button
            onClick={onBack}
            className="w-full mt-3 py-2.5 text-gray-500 text-sm hover:text-gray-700 transition-colors"
          >
            {"←"} Rol Seçimine Dön
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
