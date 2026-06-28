import { useState, useEffect, useCallback } from 'react';

/**
 * usePWAInstall — siteden "uygulama olarak yükle" akışını yönetir.
 *
 * Tarayıcı davranışları farklı olduğu için üç durumu ayırır:
 *  - Android / masaüstü Chrome-Edge: `beforeinstallprompt` olayını yakalar,
 *    `promptInstall()` ile yerel kurulum penceresini açar.
 *  - iOS Safari: bu olayı desteklemez → `isIOS` true döner, arayüz
 *    "Paylaş → Ana Ekrana Ekle" yönergesini gösterir.
 *  - Zaten kurulu (standalone): `isStandalone` true → kurulum butonu gizlenir.
 *
 * Dönen değerler:
 *   canInstall   — yerel kurulum penceresi açılabilir mi (beforeinstallprompt geldi)
 *   isIOS        — iOS cihaz mı (manuel yönerge gerekir)
 *   isStandalone — uygulama hâlihazırda kurulu/standalone modda mı
 *   installed    — bu oturumda kurulum tamamlandı mı (appinstalled)
 *   promptInstall() — kurulum penceresini açar, sonucu ('accepted'|'dismissed'|null) döndürür
 */
const detectStandalone = () => {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    // iOS Safari standalone bayrağı
    window.navigator?.standalone === true
  );
};

const detectIOS = () => {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator?.userAgent || '';
  const iOSDevice = /iphone|ipad|ipod/i.test(ua);
  // iPadOS 13+ masaüstü UA verir; dokunmatik Mac ile ayırt et
  const iPadOS = /macintosh/i.test(ua) && (navigator.maxTouchPoints || 0) > 1;
  return iOSDevice || iPadOS;
};

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(detectStandalone);
  const [installed, setInstalled] = useState(false);
  const isIOS = detectIOS();

  useEffect(() => {
    const onBeforeInstall = (e) => {
      // Tarayıcının otomatik mini-bilgi çubuğunu engelle, olayı sakla
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
      setIsStandalone(true);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);

    // Standalone değişimini de izle (kurulumdan sonra mod değişebilir)
    const mq = window.matchMedia?.('(display-mode: standalone)');
    const onModeChange = (e) => setIsStandalone(e.matches);
    mq?.addEventListener?.('change', onModeChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
      mq?.removeEventListener?.('change', onModeChange);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return null;
    deferredPrompt.prompt();
    try {
      const { outcome } = await deferredPrompt.userChoice;
      // Olay yalnız bir kez kullanılabilir
      setDeferredPrompt(null);
      return outcome; // 'accepted' | 'dismissed'
    } catch {
      setDeferredPrompt(null);
      return null;
    }
  }, [deferredPrompt]);

  return {
    canInstall: !!deferredPrompt && !isStandalone,
    isIOS,
    isStandalone,
    installed,
    promptInstall,
  };
};

export default usePWAInstall;
