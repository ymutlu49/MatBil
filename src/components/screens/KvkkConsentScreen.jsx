import React from 'react';

/**
 * KvkkConsentScreen — İlk açılışta kısa gizlilik bilgilendirmesi.
 *
 * Veriler yalnızca cihazda saklanır; sunucuda tutulmaz, üçüncü tarafla
 * paylaşılmaz. Ayrıntılı metin privacy.html'de. İlk açılışta bir kez gösterilir;
 * "Anladım" ile `matbil_kvkk_accepted=1` yazılır ve bir daha çıkmaz.
 * Ayarlar'dan tekrar açılabilir (`showAgain`).
 */
const KvkkConsentScreen = ({ onAccept, onDecline, showAgain = false }) => {
  const base = import.meta.env.BASE_URL;

  const handleAccept = () => {
    try {
      localStorage.setItem('matbil_kvkk_accepted', '1');
      localStorage.setItem('matbil_kvkk_accepted_at', new Date().toISOString());
      localStorage.setItem('matbil_kvkk_version', '2.0');
    } catch {}
    onAccept?.();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">🛡️</div>
          <h1 className="text-lg font-bold text-gray-800">Kişisel Verilerin Korunması</h1>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-gray-700 leading-relaxed space-y-2.5 mb-5">
          <p>📱 Tüm veriler <b>yalnızca bu cihazda</b> saklanır; sunucuda tutulmaz, üçüncü taraflarla paylaşılmaz.</p>
          <p>🧒 Uygulama 6–12 yaş çocuklar için tasarlanmıştır; veli gözetiminde kullanılması önerilir.</p>
          <p>🗑️ Dilediğin zaman <b>Ayarlar → Verimi Sil</b> ile tüm kayıtları kaldırabilirsin.</p>
          <p>
            Ayrıntılar için{' '}
            <a href={`${base}privacy.html`} target="_blank" rel="noreferrer" className="text-blue-600 font-semibold underline">
              Gizlilik Politikası
            </a>.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {showAgain ? (
            <button
              onClick={onDecline}
              className="w-full py-3 rounded-xl font-bold text-sm bg-blue-600 text-white hover:bg-blue-700 shadow-md transition-all"
            >
              Kapat
            </button>
          ) : (
            <button
              onClick={handleAccept}
              className="w-full py-3 rounded-xl font-bold text-sm bg-blue-600 text-white hover:bg-blue-700 shadow-md transition-all"
            >
              Anladım, devam et
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default KvkkConsentScreen;
