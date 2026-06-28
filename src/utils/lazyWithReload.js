import { lazy } from 'react';

/**
 * lazyWithReload — React.lazy için dayanıklı sarmalayıcı.
 *
 * SORUN
 * Uygulama yeniden dağıtıldığında (Cloudflare Pages'e yeni build yüklenince)
 * lazy-load edilen oyun chunk'larının hash'li dosya adları değişir. Tarayıcıda
 * açık kalan eski sayfa — ya da bayat bir service worker cache'i — artık var
 * olmayan ESKİ chunk adını ister:
 *
 *   TypeError: Failed to fetch dynamically imported module: .../ToplamaStratejileri-OLDHASH.js
 *
 * Sonuç: oyun (ve içindeki seviye menüsü) hiç yüklenmez; kullanıcı boş/hata
 * ekranında takılı kalır çünkü tekrar denemek aynı bayat adı tekrar ister.
 *
 * ÇÖZÜM
 * İlk import hatasında sayfayı BİR KEZ otomatik yenile. Yenilenen sayfa taze
 * index.html ve güncel chunk adlarını alır → oyun yüklenir. Sonsuz yeniden
 * yükleme döngüsünü önlemek için kısa süreli (sessionStorage) bir damga
 * kullanılır; yenileme sonrası hâlâ başarısızsa (gerçek bir ağ/dosya sorunu)
 * hata ErrorBoundary'e bırakılır.
 */

const RELOAD_KEY = 'matbil_chunk_reloaded_at';
const RELOAD_WINDOW_MS = 10000;

const isChunkLoadError = (err) => {
  const msg = String(err?.message || err || '');
  return (
    /dynamically imported module/i.test(msg) ||
    /Importing a module script failed/i.test(msg) ||
    /Failed to fetch/i.test(msg) ||
    /ChunkLoadError/i.test(msg)
  );
};

export function lazyWithReload(factory) {
  return lazy(() =>
    factory().catch((err) => {
      // Sadece chunk yükleme hatalarında yenile; gerçek render/kod hatalarında değil.
      if (isChunkLoadError(err)) {
        try {
          const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
          const now = Date.now();
          if (now - last > RELOAD_WINDOW_MS) {
            sessionStorage.setItem(RELOAD_KEY, String(now));
            window.location.reload();
            // Yenileme navigasyonu devralana dek hiçbir şey render edilmesin.
            return new Promise(() => {});
          }
        } catch {}
      }
      throw err;
    })
  );
}

export default lazyWithReload;
