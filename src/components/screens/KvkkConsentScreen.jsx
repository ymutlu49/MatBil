import React, { useState } from 'react';

/**
 * KvkkConsentScreen — İlk açılışta KVKK aydınlatma metni + onay.
 *
 * Neden var:
 *  - Türkiye'de 6698 sayılı KVKK uyumu (çocuk verileri özel nitelikli)
 *  - Google Play / App Store çocuk kategorisi gereksinimleri (veli onayı)
 *  - Yaşı 18 altı kullanıcılar için veli onay teyidi
 *
 * Akış: İlk açılışta gösterilir → onaylar → `matbil_kvkk_accepted=1` ve
 * tarih localStorage'a yazılır → bir daha gösterilmez.
 * Ayarlar ekranından tekrar okunabilir (`showAgain` prop'u).
 */
const KvkkConsentScreen = ({ onAccept, onDecline, showAgain = false }) => {
  const [readAll, setReadAll] = useState(false);
  const [parentOk, setParentOk] = useState(false);
  const [ackData, setAckData] = useState(false);

  const canAccept = readAll && parentOk && ackData;

  const handleAccept = () => {
    try {
      localStorage.setItem('matbil_kvkk_accepted', '1');
      localStorage.setItem('matbil_kvkk_accepted_at', new Date().toISOString());
      localStorage.setItem('matbil_kvkk_version', '1.0');
    } catch {}
    onAccept?.();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 flex flex-col items-center p-4 py-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-5 my-4">
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">🛡️</div>
          <h1 className="text-lg font-bold text-gray-800">Kişisel Verilerin Korunması</h1>
          <p className="text-xs text-gray-500 mt-1">KVKK Aydınlatma Metni — v1.0</p>
        </div>

        {/* KVKK aydınlatma metni */}
        <div
          className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-gray-700 leading-relaxed max-h-[50vh] overflow-y-auto mb-3"
          onScroll={e => {
            const el = e.target;
            if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) setReadAll(true);
          }}
        >
          <p className="font-bold mb-2">Veri Sorumlusu</p>
          <p className="mb-3">
            MatBil Matematiksel Biliş Uygulaması (bundan sonra "Uygulama") Prof. Dr. Yılmaz Mutlu ve
            Prof. Dr. Sinan Olkun tarafından araştırma ve eğitim amaçlı geliştirilmiştir.
          </p>

          <p className="font-bold mb-2">Toplanan Veriler</p>
          <ul className="list-disc pl-4 mb-3 space-y-1">
            <li><b>Öğrenci adı ve yaşı</b>: Oyun deneyiminin kişiselleştirilmesi için.</li>
            <li><b>İlerleme kaydı</b>: Oyun puanları, tamamlanan düzeyler, hata sıklığı.</li>
            <li><b>Ruh hali / tercihler</b>: Anksiyete dostu mod, büyük yazı tipi gibi ayarlar.</li>
            <li><b>Cihaz kimliği</b>: Rastgele üretilen (kişisel olmayan) cihaz tanımlayıcı — premium kod doğrulaması için.</li>
          </ul>

          <p className="font-bold mb-2">Veri İşleme Amacı</p>
          <p className="mb-3">
            Veriler, pedagojik raporların üretilmesi, öğretmen/veli paneline özet sunulması ve akademik
            araştırma (anonim toplulaştırma sonrası) amacıyla işlenir. <b>Üçüncü taraflarla paylaşılmaz.</b>
          </p>

          <p className="font-bold mb-2">Veri Saklama ve Güvenlik</p>
          <p className="mb-3">
            Tüm veriler <b>yalnızca kullandığınız cihazda</b> (localStorage/IndexedDB) saklanır. Sunucuda
            veri tutulmaz (premium kod doğrulaması hariç). Tarayıcı verilerini sildiğinizde tüm kayıt silinir.
          </p>

          <p className="font-bold mb-2">Çocuk Kullanıcılar (18 yaş altı)</p>
          <p className="mb-3">
            Uygulama 6–12 yaş çocuklar için tasarlanmıştır. <b>Çocuğun veri işlenmesine veli/yasal
            temsilci onayı zorunludur.</b> Veli, istediği zaman "Ayarlar → Verimi Sil" ile tüm verileri
            kaldırabilir.
          </p>

          <p className="font-bold mb-2">Haklarınız (KVKK md. 11)</p>
          <ul className="list-disc pl-4 mb-3 space-y-1">
            <li>Verilerinize erişme ve kopyasını talep etme</li>
            <li>Yanlış verilerin düzeltilmesini isteme</li>
            <li>Verilerin silinmesini talep etme</li>
            <li>Veri işlemeye itiraz etme</li>
          </ul>

          <p className="font-bold mb-2">İletişim</p>
          <p className="mb-2">
            Haklarınızı kullanmak veya sorularınız için: <b>destek@matbil.app</b> (örnek) adresine yazabilirsiniz.
          </p>

          {!readAll && (
            <p className="text-[10px] text-blue-600 mt-4 italic">
              ⬇️ Onayı açmak için metnin sonuna kadar kaydırın
            </p>
          )}
        </div>

        {/* Onay kutuları */}
        <div className="space-y-2 mb-4">
          <label className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={ackData}
              onChange={e => setAckData(e.target.checked)}
              disabled={!readAll}
              className="mt-0.5 w-5 h-5 accent-blue-600 disabled:opacity-40"
            />
            <span>KVKK aydınlatma metnini <b>okudum ve anladım</b>.</span>
          </label>
          <label className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={parentOk}
              onChange={e => setParentOk(e.target.checked)}
              disabled={!readAll}
              className="mt-0.5 w-5 h-5 accent-blue-600 disabled:opacity-40"
            />
            <span>
              <b>Veli / yasal temsilci onayı:</b> 18 yaşından küçük kullanıcı için verilerin işlenmesine onay veriyorum.
            </span>
          </label>
        </div>

        {/* Butonlar */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleAccept}
            disabled={!canAccept}
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
              canAccept
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            ✅ Onaylıyorum ve Devam Et
          </button>
          {!showAgain && (
            <button
              onClick={onDecline}
              className="w-full py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-50"
            >
              Kabul etmiyorum — Uygulamadan çık
            </button>
          )}
          {showAgain && (
            <button
              onClick={onDecline}
              className="w-full py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
            >
              Kapat
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default KvkkConsentScreen;
