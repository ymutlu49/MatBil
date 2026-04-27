import React, { useState } from 'react';
import RedeemCodeModal from '../ui/RedeemCodeModal';
import AdminLoginScreen from './AdminLoginScreen';

/**
 * Kitap Kodu Kapısı
 * Uygulamaya erişimin tek yolu kitap kodu doğrulamasıdır.
 * KVKK onayından sonra, rol seçiminden önce gösterilir.
 *
 * Kapıyı geçme yolları:
 *  1. Kitap kodu (MTB-XXXX-XXXX-XXXX) — premium aktive olur, rol seçimine geçilir
 *  2. Yönetici/Yazar girişi — PIN doğru ise auto-premium + admin oturumu
 *  3. Grandfather'lanmış kullanıcılar bu ekranı hiç görmez (App.jsx'te atlanır)
 */
const BookCodeGate = ({ onCodeRedeemed, onAdminLogin }) => {
  const [showAdmin, setShowAdmin] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);

  if (showAdmin) return (
    <AdminLoginScreen
      onLogin={onAdminLogin}
      onBack={() => setShowAdmin(false)}
    />
  );

  return (
    <div className="h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-pink-50 flex flex-col items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-sm py-4">
        {/* Logo & başlık */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">{"📚"}</div>
          <h1 className="text-xl font-bold text-gray-800">Matematiksel Bilişin Temelleri</h1>
          <p className="text-amber-700 font-semibold text-sm italic">Sayı Hissinden Şekil Algısına</p>
        </div>

        {/* Açıklama kartı */}
        <div className="bg-white/80 border border-amber-200 rounded-2xl p-4 mb-4 shadow-sm">
          <div className="flex items-start gap-2">
            <span className="text-2xl shrink-0">{"🔑"}</span>
            <div>
              <div className="text-sm font-bold text-amber-800 mb-1">Kitap Kodu Gerekli</div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Uygulamayı kullanabilmek için <span className="font-semibold">"Matematiksel Bilişin Temelleri"</span> kitabınızın iç kapağındaki kodu girin.
              </p>
            </div>
          </div>
        </div>

        {/* Kod gir butonu */}
        <button onClick={() => setShowCodeModal(true)}
          className="w-full py-4 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl shadow-xl flex items-center gap-3 hover:opacity-95 active:scale-[0.98] transition-all mb-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl shrink-0">{"🔓"}</div>
          <div className="text-left flex-1">
            <div className="text-base font-bold">Kitap Kodunu Gir</div>
            <div className="text-[11px] opacity-90">MTB-XXXX-XXXX-XXXX</div>
          </div>
          <span className="text-white/60 text-xl">{"›"}</span>
        </button>

        {/* Yönetici girişi (alternatif) */}
        <button onClick={() => setShowAdmin(true)}
          className="w-full py-2.5 px-4 bg-white/60 text-gray-600 rounded-xl text-sm font-medium hover:bg-white/80 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
          <span>{"🔐"}</span>
          <span>Yazar / Yönetici Girişi</span>
        </button>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-[10px] text-gray-400">
            Kodunuz yok mu?{' '}
            <a href="https://www.diskalkuli.com" target="_blank" rel="noreferrer" className="text-amber-600 font-medium hover:underline">
              www.diskalkuli.com
            </a>
          </p>
          <p className="text-[10px] text-gray-300 mt-2">Prof. Dr. Yılmaz Mutlu {"•"} Prof. Dr. Sinan Olkun</p>
        </div>
      </div>

      <RedeemCodeModal
        open={showCodeModal}
        onClose={() => setShowCodeModal(false)}
        onSuccess={() => { setShowCodeModal(false); onCodeRedeemed(); }}
      />
    </div>
  );
};

export default BookCodeGate;
