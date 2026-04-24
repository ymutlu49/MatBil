import { PREMIUM_REQUIRED, FREE_GAME_IDS, FREE_FEATURES, CODE_PATTERN, DEMO_CODES, CODE_API_URL, getOrCreateDeviceId } from '../constants/entitlements';

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
 */

const PREMIUM_KEY = 'matbil_premium';
const CODE_KEY = 'matbil_premium_code';
const AT_KEY = 'matbil_premium_at';

/**
 * Kullanıcı premium mü?
 * Master switch kapalıysa her zaman true (kilitleme yok, mevcut davranış).
 */
export const isPremiumUser = () => {
  if (!PREMIUM_REQUIRED) return true;
  try {
    return localStorage.getItem(PREMIUM_KEY) === '1';
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
    // Lokal fallback (dev)
    if (DEMO_CODES.has(code)) result = { ok: true };
    else result = { ok: false, reason: 'invalid' };
  }

  if (result.ok) {
    try {
      localStorage.setItem(PREMIUM_KEY, '1');
      localStorage.setItem(CODE_KEY, code);
      localStorage.setItem(AT_KEY, new Date().toISOString());
    } catch {}
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
  } catch {}
};

/**
 * Mevcut kullanıcıları "grandfather" yapar — freemium aktifleştiğinde
 * daha önce uygulamayı kullanmış herkes premium sayılır.
 *
 * TEK SEFERLİK çalışır: İlk aktivasyon sonrasında `matbil_freemium_migrated`
 * bayrağı set edilir, sonraki boot'larda atlanır. Bu sayede:
 *  - Eski kullanıcılar güncelleme sonrası grandfather'lanır
 *  - Yeni kullanıcılar (migration sonrası kaydolanlar) grandfather'lanMAZ
 *  - revokePremium() ile test edenler tekrar grandfather olmaz
 */
const MIGRATED_KEY = 'matbil_freemium_migrated';

export const grandfatherExistingUsers = () => {
  try {
    // Migration bir kere çalıştıysa atla
    if (localStorage.getItem(MIGRATED_KEY) === '1') return;
    // Migration'ı tamamlandı olarak işaretle (grandfather uygulansa da uygulanmasa da)
    localStorage.setItem(MIGRATED_KEY, '1');

    if (localStorage.getItem(PREMIUM_KEY) === '1') return; // zaten premium
    // İlerleme kaydı / kullanıcı / onboarded var mı?
    const keys = Object.keys(localStorage);
    const hasProgress = keys.some(k => k.startsWith('matbil_progress_'));
    const hasUsers = keys.includes('matbil_users') && JSON.parse(localStorage.getItem('matbil_users') || '[]').length > 0;
    const hasOnboarded = localStorage.getItem('matbil_onboarded') === '1';
    if (hasProgress || hasUsers || hasOnboarded) {
      localStorage.setItem(PREMIUM_KEY, '1');
      localStorage.setItem(CODE_KEY, 'GRANDFATHERED');
      localStorage.setItem(AT_KEY, new Date().toISOString());
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
      localStorage.setItem(PREMIUM_KEY, '1');
      localStorage.setItem(CODE_KEY, 'DEV');
      localStorage.setItem(AT_KEY, new Date().toISOString());
    } else {
      localStorage.removeItem(PREMIUM_KEY);
      localStorage.removeItem(CODE_KEY);
      localStorage.removeItem(AT_KEY);
    }
  } catch {}
};
