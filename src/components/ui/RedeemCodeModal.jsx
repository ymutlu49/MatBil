import React, { useState, useEffect } from 'react';
import { redeemCode, getPremiumInfo } from '../../utils/entitlement';

/**
 * RedeemCodeModal - Kitap aktivasyon kodu giriş modalı
 *
 * Kullanıcı kitabındaki 16 haneli kodu (MTB-XXXX-XXXX-XXXX) girip premium açar.
 * Otomatik formatlama: Kullanıcı yazarken tire ekler, küçük harfi büyük yapar.
 * Görsel geri bildirim: Başarı/hata mesajı ve mevcut premium durumu.
 *
 * Props:
 *  - open: boolean — modal açık mı
 *  - onClose: () => void — kapat
 *  - onSuccess: () => void — başarılı aktivasyon sonrası (opsiyonel)
 *  - lockedGameName: string — (opsiyonel) Kilitli oyundan tetiklendiyse oyun adı
 */
const RedeemCodeModal = ({ open, onClose, onSuccess, lockedGameName }) => {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState(null); // { ok, reason } | null
  const [premiumInfo, setPremiumInfo] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setPremiumInfo(getPremiumInfo());
      setStatus(null);
      setCode('');
    }
  }, [open]);

  if (!open) return null;

  // Kullanıcı yazarken otomatik formatlama: MTB-XXXX-XXXX-XXXX
  const formatInput = (raw) => {
    // Sadece alfanumerik bırak, büyük harfe çevir
    const cleaned = (raw || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    // "MTB" ile başlamıyorsa otomatik ekle (eğer kullanıcı 3+ karakter yazdıysa)
    let s = cleaned;
    // Maksimum 15 karakter (MTB + 12 rakam/harf)
    if (s.length > 15) s = s.substring(0, 15);
    // Tireleme: ilk 3 (MTB) sonra 4-4-4
    if (s.length <= 3) return s;
    if (s.length <= 7) return s.substring(0, 3) + '-' + s.substring(3);
    if (s.length <= 11) return s.substring(0, 3) + '-' + s.substring(3, 7) + '-' + s.substring(7);
    return s.substring(0, 3) + '-' + s.substring(3, 7) + '-' + s.substring(7, 11) + '-' + s.substring(11);
  };

  const handleChange = (e) => {
    setCode(formatInput(e.target.value));
    setStatus(null);
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const result = await redeemCode(code);
      setStatus(result);
      if (result.ok) {
        setPremiumInfo(getPremiumInfo());
        if (onSuccess) onSuccess();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const errorMsg = {
    empty: 'Lütfen bir kod girin.',
    format: 'Kod formatı hatalı. Örnek: MTB-XXXX-XXXX-XXXX',
    invalid: 'Bu kod geçerli değil. Kitabınızdaki kodu tam olarak girdiğinizden emin olun.',
    used: 'Bu kod daha önce kullanılmış ve cihaz sınırına ulaşılmış.',
    network: 'İnternet bağlantısında sorun var. Lütfen tekrar deneyin.',
    server: 'Sunucu şu an yanıt vermiyor. Lütfen birkaç dakika sonra tekrar deneyin.',
  };

  const isAlreadyPremium = premiumInfo?.active && !status?.ok;

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4 anim-fade">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5">
        {/* Başlık */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white text-xl shadow-md">{"🔑"}</div>
            <div>
              <div className="font-bold text-gray-800 text-sm">Kitap Kodu</div>
              <div className="text-[10px] text-amber-600">Premium erişimi aç</div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 text-lg hover:bg-gray-200">{"✕"}</button>
        </div>

        {/* Zaten premium uyarısı */}
        {isAlreadyPremium && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-3">
            <div className="flex items-start gap-2">
              <span className="text-lg shrink-0">{"✅"}</span>
              <div>
                <div className="text-xs font-bold text-green-700 mb-0.5">Premium Aktif</div>
                <p className="text-[11px] text-gray-700 leading-relaxed">
                  {premiumInfo.code === 'GRANDFATHERED'
                    ? 'Uygulamayı daha önce kullanmışsınız — tam erişim açık.'
                    : premiumInfo.code === 'DEV'
                    ? 'Geliştirici modunda premium açıldı.'
                    : `Kod ile açıldı: ${premiumInfo.code}`}
                </p>
                {premiumInfo.at && (
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {new Date(premiumInfo.at).toLocaleDateString('tr-TR')}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Kilitli oyundan gelen bağlamsal mesaj */}
        {!isAlreadyPremium && lockedGameName && (
          <div className="bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-300 rounded-xl p-3 mb-3">
            <div className="flex items-start gap-2">
              <span className="text-lg shrink-0">{"🔒"}</span>
              <div>
                <div className="text-xs font-bold text-amber-800 mb-0.5">Premium Oyun: {lockedGameName}</div>
                <p className="text-[11px] text-gray-700 leading-relaxed">Bu oyun kitap sahiplerine özel. Kodu girdikten sonra oyun otomatik açılacak.</p>
              </div>
            </div>
          </div>
        )}

        {/* Açıklama */}
        {!isAlreadyPremium && !lockedGameName && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">
            <p className="text-[11px] text-gray-700 leading-relaxed">
              <span className="font-bold text-amber-700">{"📖"}</span> "Matematiksel Bilişin Temelleri" kitabınızın iç kapağındaki kodu girin. Tüm 36 oyun, kitap bölümleri ve akademik içerik açılır.
            </p>
          </div>
        )}

        {/* Kod input */}
        <div className="mb-3">
          <label className="block text-xs font-bold text-gray-600 mb-1.5">Aktivasyon Kodu</label>
          <input
            type="text"
            value={code}
            onChange={handleChange}
            placeholder="MTB-XXXX-XXXX-XXXX"
            maxLength={19}
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-center font-mono text-sm tracking-wider focus:border-amber-400 focus:outline-none"
          />
        </div>

        {/* Geri bildirim */}
        {status && !status.ok && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-3">
            <div className="text-xs text-red-700 flex items-start gap-1.5">
              <span>{"⚠️"}</span>
              <span>{errorMsg[status.reason] || 'Beklenmeyen bir hata oluştu.'}</span>
            </div>
          </div>
        )}
        {status && status.ok && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-3 py-2 mb-3">
            <div className="text-xs text-green-700 flex items-start gap-1.5">
              <span>{"🎉"}</span>
              <span className="font-bold">Tebrikler! Premium erişim açıldı.</span>
            </div>
          </div>
        )}

        {/* Butonlar */}
        <div className="space-y-2">
          {!isAlreadyPremium && !status?.ok && (
            <button
              onClick={handleSubmit}
              disabled={!code || submitting}
              className={`w-full py-3 rounded-xl font-bold text-sm shadow-md transition-all ${
                code && !submitting
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90 active:scale-95'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {submitting ? '⏳ Kontrol ediliyor...' : '🔓 Kodu Kullan'}
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-gray-600 font-medium text-sm bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all"
          >
            {status?.ok || isAlreadyPremium ? 'Tamam' : 'Kapat'}
          </button>
        </div>

        {/* Kod yok mu? */}
        {!isAlreadyPremium && !status?.ok && (
          <div className="mt-3 pt-3 border-t border-gray-100 text-center">
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Kodunuz yok mu? Web sitemizden satın alabilir veya kitabı temin edebilirsiniz.
              <br />
              <a href="https://www.diskalkuli.com" target="_blank" rel="noreferrer" className="text-amber-600 font-medium hover:underline">www.diskalkuli.com</a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RedeemCodeModal;
