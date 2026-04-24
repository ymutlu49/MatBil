/**
 * Telemetri / Error reporting katmanı.
 *
 * İki opsiyonel kanal:
 *  1) Sentry (VITE_SENTRY_DSN tanımlıysa) — endüstri standardı
 *  2) Custom HTTP endpoint (VITE_ERROR_REPORT_URL tanımlıysa) — kendi sunucunuza
 *
 * İkisi de tanımsızsa: sessiz, yalnız localStorage'a yazar (ErrorBoundary'de).
 * Prodüksiyonda Play Store öncesi DSN tanımlanır, dev'de boş bırakılır.
 */

let sentryInitialized = false;

export const initTelemetry = async () => {
  try {
    const dsn = import.meta.env?.VITE_SENTRY_DSN;
    if (!dsn) return false;

    // Dinamik import — Sentry bundle'ı yalnız DSN varsa yüklenir
    const Sentry = await import('@sentry/react');
    Sentry.init({
      dsn,
      // Performans izleme kapalı (çocuk uygulaması, veri minimizasyonu)
      tracesSampleRate: 0,
      // Session replay kapalı (gizlilik)
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
      // Kullanıcı PII'sini kesinlikle gönderme
      sendDefaultPii: false,
      environment: import.meta.env?.MODE || 'production',
      release: 'matbil@16.1',
      // IP adreslerini tutma
      beforeSend(event) {
        if (event.user) delete event.user.ip_address;
        if (event.request) delete event.request.cookies;
        return event;
      },
    });
    sentryInitialized = true;
    return true;
  } catch {
    return false;
  }
};

/**
 * Bir hatayı raporla. Sentry varsa ona gönderir, yoksa custom endpoint'e.
 * ErrorBoundary dışında manuel hata logging için de kullanılabilir.
 */
export const reportError = async (error, context = {}) => {
  try {
    if (sentryInitialized) {
      const Sentry = await import('@sentry/react');
      Sentry.captureException(error, { extra: context });
      return;
    }
    // Fallback: custom endpoint
    const url = import.meta.env?.VITE_ERROR_REPORT_URL;
    if (url && typeof fetch === 'function') {
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          at: new Date().toISOString(),
          message: String(error?.message || error),
          stack: String(error?.stack || '').slice(0, 1500),
          context,
        }),
        keepalive: true,
      }).catch(() => {});
    }
  } catch {}
};

export const isSentryActive = () => sentryInitialized;
