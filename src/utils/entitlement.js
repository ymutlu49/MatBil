import { PREMIUM_REQUIRED, FREE_GAME_IDS, FREE_FEATURES, CODE_PATTERN, DEMO_CODES, CODE_API_URL, IS_DEV_BUILD, getOrCreateDeviceId } from '../constants/entitlements';

/**
 * Entitlement yönetimi — freemium aktivasyon katmanı.
 *
 * Tasarım prensibi:
 *  - PREMIUM_REQUIRED=false iken bu modülün HİÇBİR çağrısı kullanıcıya görünür
 *    bir farklılık yaratmaz. Tüm `is*Accessible` fonksiyonları true döner.
 *  - Bu dosya SAF (side-effect'siz) fonksiyonlardan oluşur, localStorage
 *    okuma/yazmalar try/catch ile korunur.
 *
 * localStorage anahtarları:
 *  - matbil_premium      : '1' | '0' | null   (premium durumu)
 *  - matbil_premium_code : string (ne ile açıldı - izleme amaçlı)
 *  - matbil_premium_at   : ISO date (açıldığı an)
 *  - matbil_premium_sig  : imza (cihaz+kod+zaman türevi, manipülasyonu zorlaştırır)
 */

const PREMIUM_KEY = 'matbil_premium';
const CODE_KEY = 'matbil_premium_code';
const AT_KEY = 'matbil_premium_at';
const SIG_KEY = 'matbil_premium_sig';

// Uygulama sırrı — APK'dan çıkarılabilir ama trivial localStorage manipülasyonunu engeller.
// Gerçek güvenlik için server-side validation gerekli; bu, "casual bypass" koruması.
const APP_SECRET = 'mbs_v16_4f9k2xp7v3';

/**
 * Senkron integrity stamp (hash tabanlı).
 * Gerçek HMAC değil (Web Crypto async); ancak trivial localStorage bypass'ı engelliyor.
 */
const makeStamp = (deviceId, code, at) => {
  const payload = `${APP_SECRET}|${deviceId || ''}|${code || ''}|${at || ''}`;
  // Basit DJB2-like hash, 32-bit
  let h = 5381;
  for (let i = 0; i < payload.length; i++) h = ((h << 5) + h + payload.charCodeAt(i)) | 0;
  // APP_SECRET ters yönde bir kez daha karıştır
  for (let i = APP_SECRET.length - 1; i >= 0; i--) h = ((h * 31) + APP_SECRET.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
};

const verifyStamp = () => {
  try {
    const code = localStorage.getItem(CODE_KEY) || '';
    const at = localStorage.getItem(AT_KEY) || '';
    const sig = localStorage.getItem(SIG_KEY) || '';
    if (!sig) return false;
    const deviceId = getOrCreateDeviceId();
    return makeStamp(deviceId, code, at) === sig;
  } catch { return false; }
};

export const writePremiumState = (code) => {
  try {
    const at = new Date().toISOString();
    const deviceId = getOrCreateDeviceId();
    localStorage.setItem(PREMIUM_KEY, '1');
    localStorage.setItem(CODE_KEY, code);
    localStorage.setItem(AT_KEY, at);
    localStorage.setItem(SIG_KEY, makeStamp(deviceId, code, at));
  } catch {}
};

/**
 * Kullanıcı premium mü?
 * Master switch kapalıysa her zaman true (kilitleme yok, mevcut davranış).
 * İmza eksik/geçersizse trivial localStorage manipülasyonu reddedilir.
 */
export const isPremiumUser = () => {
  if (!PREMIUM_REQUIRED) return true;
  try {
    if (localStorage.getItem(PREMIUM_KEY) !== '1') return false;
    // İmzasız premium = ya gerçek legacy (migration öncesi) ya da bypass girişimi.
    // Legacy kanıtı: migration bayrağı VEYA mevcut progress/users verisi olmalı.
    if (!localStorage.getItem(SIG_KEY)) {
      const keys = Object.keys(localStorage);
      const migrated = localStorage.getItem('matbil_freemium_migrated') === '1';
      const hasProgress = keys.some(k => k.startsWith('matbil_progress_'));
      let hasUsers = false;
      try {
        hasUsers = (JSON.parse(localStorage.getItem('matbil_users') || '[]')).length > 0;
      } catch {}
      const isLegitLegacy = migrated || hasProgress || hasUsers;
      if (!isLegitLegacy) {
        // Bypass girişimi — premium'u temizle
        try {
          localStorage.removeItem(PREMIUM_KEY);
          localStorage.removeItem(CODE_KEY);
          localStorage.removeItem(AT_KEY);
          localStorage.removeItem(SIG_KEY);
        } catch {}
        return false;
      }
      // Gerçek legacy — bir kerelik imzala
      const code = localStorage.getItem(CODE_KEY) || 'LEGACY';
      const at = localStorage.getItem(AT_KEY) || new Date().toISOString();
      try {
        localStorage.setItem(CODE_KEY, code);
        localStorage.setItem(AT_KEY, at);
        localStorage.setItem(SIG_KEY, makeStamp(getOrCreateDeviceId(), code, at));
      } catch {}
      return true;
    }
    // İmza varsa doğrula — manipüle edilmişse premium'u geri al
    if (!verifyStamp()) {
      try {
        localStorage.removeItem(PREMIUM_KEY);
        localStorage.removeItem(CODE_KEY);
        localStorage.removeItem(AT_KEY);
        localStorage.removeItem(SIG_KEY);
      } catch {}
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

/**
 * Bir oyuna erişim var mı?
 * Premium kullanıcılar her oyuna, ücretsiz kullanıcılar sadece FREE_GAME_IDS'e.
 */
export const isGameAccessible = (gameId) => {
  if (isPremiumUser()) return true;
  return FREE_GAME_IDS.includes(gameId);
};

/**
 * Bu oyun premium katmanda mı? (Erişim durumundan bağımsız — salt kategorilendirme)
 * UI'da 🔒 rozet göstermek için kullanılır.
 */
export const isPremiumGame = (gameId) => {
  return !FREE_GAME_IDS.includes(gameId);
};

/**
 * Kullanıcı görsel olarak premium rozet görmeli mi?
 *
 * Kural: Oyun premium kademede VE kullanıcı premium'u açmamışsa rozet göster.
 * Master switch'ten bağımsız — grandfather'lanmış kullanıcılar rozet görmez.
 * Freemium aktifleşmeden önce "freemium önizleme" amaçlı kullanılır.
 */
export const shouldShowPremiumBadge = (gameId) => {
  if (!isPremiumGame(gameId)) return false;
  try {
    return localStorage.getItem('matbil_premium') !== '1';
  } catch {
    return false;
  }
};

/**
 * Belirli bir özelliğe erişim var mı?
 * featureKey: FREE_FEATURES objesinin anahtarlarından biri
 */
export const isFeatureAccessible = (featureKey) => {
  if (isPremiumUser()) return true;
  return FREE_FEATURES[featureKey] === true;
};

/**
 * Kitap aktivasyon kodunu doğrular ve premium açar. ASENKRON.
 *
 * Akış:
 *  1. Format doğrulama (istemci tarafı)
 *  2. Backend varsa (CODE_API_URL) → HTTP POST /redeem
 *  3. Backend yoksa → lokal DEMO_CODES havuzu
 *  4. Başarıda localStorage'a yaz
 *
 * @returns Promise<{ ok: boolean, reason?: string }>
 *   reason değerleri: 'empty' | 'format' | 'invalid' | 'used' | 'network' | 'server'
 */
export const redeemCode = async (rawCode) => {
  const code = (rawCode || '').trim().toUpperCase();
  if (!code) return { ok: false, reason: 'empty' };
  if (!CODE_PATTERN.test(code)) return { ok: false, reason: 'format' };

  let result = { ok: false, reason: 'invalid' };

  if (CODE_API_URL) {
    // Backend ile doğrulama
    try {
      const deviceId = getOrCreateDeviceId();
      const res = await fetch(`${CODE_API_URL}/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, deviceId }),
      });
      if (!res.ok) {
        if (res.status === 404) result = { ok: false, reason: 'invalid' };
        else if (res.status === 409) result = { ok: false, reason: 'used' };
        else result = { ok: false, reason: 'server' };
      } else {
        const data = await res.json();
        result = data?.ok ? { ok: true } : { ok: false, reason: data?.reason || 'server' };
      }
    } catch {
      result = { ok: false, reason: 'network' };
    }
  } else {
    // Backend yok: dev build'de DEMO_CODES havuzu, production'da reddet
    if (!IS_DEV_BUILD) {
      result = { ok: false, reason: 'server' };
    } else if (DEMO_CODES.has(code)) {
      result = { ok: true };
    } else {
      result = { ok: false, reason: 'invalid' };
    }
  }

  if (result.ok) {
    writePremiumState(code);
  }
  return result;
};

/**
 * Aktif premium kaynak bilgisi (kitap kodu, IAP vb.)
 */
export const getPremiumInfo = () => {
  try {
    const active = localStorage.getItem(PREMIUM_KEY) === '1';
    if (!active) return { active: false };
    return {
      active: true,
      code: localStorage.getItem(CODE_KEY) || null,
      at: localStorage.getItem(AT_KEY) || null,
    };
  } catch {
    return { active: false };
  }
};

/**
 * Premium'u iptal eder (test/destek amaçlı — normal kullanıcı görmez).
 */
export const revokePremium = () => {
  try {
    localStorage.removeItem(PREMIUM_KEY);
    localStorage.removeItem(CODE_KEY);
    localStorage.removeItem(AT_KEY);
    localStorage.removeItem(SIG_KEY);
  } catch {}
};

/**
 * Kod-yalnız erişim zorlaması — "herkes kod girsin, istisna olmasın".
 *
 * Eski "grandfather" yaklaşımının yerini alır. Koda dayanmayan (grandfather /
 * legacy / kodsuz) eski premium'ları BİR KEZ iptal eder; böylece daha önce
 * otomatik premium verilmiş kullanıcılar da gerçek kitap kodu girmek zorunda kalır.
 *
 * Korunanlar (kilitlenmez):
 *  - Gerçek kitap kodu ile açılmış premium (MTB-XXXX-XXXX-XXXX)
 *  - Yazar / Yönetici girişi (ADMIN-AUTHOR)
 *
 * İptal edilenler:
 *  - GRANDFATHERED, LEGACY, DEV, kodsuz/boş — koda dayanmayan her premium
 *
 * TEK SEFERLİK çalışır (`matbil_code_only_enforced`): sonraki boot'larda atlanır,
 * böylece iptal sonrası tekrar girilen kitap kodu / admin premium'u kalıcı olur.
 */
const ENFORCED_KEY = 'matbil_code_only_enforced';

export const enforceCodeOnlyAccess = () => {
  try {
    // Zorlama bir kez çalıştıysa atla (admin/kod tekrar girilmişse dokunma)
    if (localStorage.getItem(ENFORCED_KEY) === '1') return;
    localStorage.setItem(ENFORCED_KEY, '1');

    if (localStorage.getItem(PREMIUM_KEY) !== '1') return; // premium yok — yapılacak bir şey yok
    const code = (localStorage.getItem(CODE_KEY) || '').toUpperCase();
    const isRealBookCode = CODE_PATTERN.test(code);
    const isAdmin = code === 'ADMIN-AUTHOR';
    // Koda dayanmayan (grandfather/legacy/kodsuz) premium iptal edilir.
    if (!isRealBookCode && !isAdmin) {
      revokePremium();
    }
  } catch {}
};

/**
 * Test/geliştirme için: belirli bir state'e zorla
 * Production'da çağrılmamalı — developer araçları için.
 */
export const __devSetPremium = (value) => {
  try {
    if (value) {
      writePremiumState('DEV');
    } else {
      localStorage.removeItem(PREMIUM_KEY);
      localStorage.removeItem(CODE_KEY);
      localStorage.removeItem(AT_KEY);
      localStorage.removeItem(SIG_KEY);
    }
  } catch {}
};
