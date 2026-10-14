import React, { useEffect, useState } from 'react';
import { TTS_UNAVAILABLE_EVENT, openNativeVoiceInstall } from '../../utils/speech';

/**
 * Cihazda Türkçe ses yoksa sesli okuma yapılmaz (yanlış dilde okumamak için).
 * Bu bildirim nedenini ve Türkçe sesin nasıl yükleneceğini anlatır.
 */
const installHint = () => {
  const ua = navigator.userAgent || '';
  if (/android/i.test(ua)) return 'Telefon ayarlarında “Metin okuma” (Text-to-speech) bölümünden Türkçe ses verisini indirin.';
  if (/iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1)) return 'Ayarlar › Erişilebilirlik › Seslendirilen İçerik › Sesler bölümünden Türkçe sesi indirin.';
  if (/macintosh|mac os/i.test(ua)) return 'Sistem Ayarları › Erişilebilirlik › Seslendirilen İçerik bölümünden Türkçe sesi ekleyin.';
  if (/windows/i.test(ua)) return 'Ayarlar › Saat ve dil › Konuşma bölümünden Türkçe ses ekleyin ya da Microsoft Edge tarayıcısını kullanın.';
  return 'Cihazınızın metin okuma ayarlarından Türkçe ses ekleyin.';
};

const SpeechNotice = () => {
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    const onUnavailable = (e) => setNotice({ native: !!e.detail?.native, at: Date.now() });
    window.addEventListener(TTS_UNAVAILABLE_EVENT, onUnavailable);
    return () => window.removeEventListener(TTS_UNAVAILABLE_EVENT, onUnavailable);
  }, []);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 12000);
    return () => clearTimeout(t);
  }, [notice]);

  if (!notice) return null;

  return (
    <div role="status" aria-live="polite"
      className="fixed bottom-4 left-4 right-4 z-[100] mx-auto max-w-sm bg-white rounded-2xl shadow-2xl border-2 border-amber-200 p-4 anim-fade">
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0">{"🔇"}</span>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-gray-800 text-sm mb-1">Türkçe ses bulunamadı</div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Bu cihazda Türkçe okuma sesi olmadığı için sesli okuma yapılamıyor.{' '}
            {notice.native ? 'Aşağıdaki düğmeyle Türkçe ses verisini yükleyebilirsiniz.' : installHint()}
          </p>
          {notice.native && (
            <button onClick={() => { openNativeVoiceInstall(); setNotice(null); }}
              className="mt-2 px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 active:scale-95 transition-all">
              Türkçe sesi yükle
            </button>
          )}
        </div>
        <button onClick={() => setNotice(null)} aria-label="Kapat"
          className="shrink-0 w-7 h-7 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center text-sm">{"✕"}</button>
      </div>
    </div>
  );
};

export default SpeechNotice;
