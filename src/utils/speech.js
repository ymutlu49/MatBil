/**
 * Türkçe sesli okuma (TTS) — uygulamadaki TEK seslendirme noktası.
 *
 * Neden: Yalnızca `utterance.lang = 'tr-TR'` atamak yetmiyor. Cihazda Türkçe
 * ses yoksa tarayıcı varsayılan sese düşüyor (Chrome'da çoğu zaman listedeki
 * ilk ses olan "Google Deutsch") ve Türkçe metin Almanca aksanla okunuyor.
 *
 *  - Web: Türkçe ses açıkça seçilir (utterance.voice). Türkçe ses yoksa
 *    HİÇ okunmaz — yanlış dilde okumaktansa sessiz kalmak daha iyi.
 *  - Android uygulaması: Capacitor WebView'da speechSynthesis çalışmadığı için
 *    cihazın yerel TTS motoru Türkçe ile kullanılır; Türkçe ses verisi
 *    yoksa motor okumayı reddeder.
 *  - Türkçe ses bulunamazsa TTS_UNAVAILABLE_EVENT yayılır; SpeechNotice
 *    bileşeni kullanıcıya Türkçe sesin nasıl yükleneceğini anlatır.
 */

export const TTS_UNAVAILABLE_EVENT = 'matbil:tts-unavailable';

const isNative = () => {
  try { return !!window.Capacitor?.isNativePlatform?.(); } catch { return false; }
};

const synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;

let voicesLoaded = false;
let turkishVoice = null;
// Chrome, referansı tutulmayan utterance'ı çöpe atıp okumayı yarıda kesebiliyor
let currentUtterance = null;
let noticeShown = false;

const isTurkishVoice = (v) => /^tr(?:[-_]|$)/i.test(v?.lang || '');

// Aynı cihazda birden çok Türkçe ses olabilir: tr-TR ve doğal/nöral sesler öncelikli
const voiceScore = (v) =>
  (/^tr[-_]tr$/i.test(v.lang) ? 4 : 0) +
  (/natural|neural|online|premium|enhanced/i.test(v.name || '') ? 2 : 0) +
  (v.localService ? 1 : 0);

const refreshVoices = () => {
  if (!synth) return;
  let voices = [];
  try { voices = synth.getVoices() || []; } catch {}
  if (!voices.length) return;
  voicesLoaded = true;
  turkishVoice = voices.filter(isTurkishVoice).sort((a, b) => voiceScore(b) - voiceScore(a))[0] || null;
};

// Sesler çoğu tarayıcıda asenkron yüklenir; ilk tıklamaya hazır olsun diye önceden iste
if (synth && !isNative()) {
  refreshVoices();
  if (typeof synth.addEventListener === 'function') synth.addEventListener('voiceschanged', refreshVoices);
  else synth.onvoiceschanged = refreshVoices;
}

const waitForVoices = (timeoutMs = 1500) => new Promise((resolve) => {
  const started = Date.now();
  const tick = () => {
    refreshVoices();
    if (voicesLoaded || Date.now() - started >= timeoutMs) resolve();
    else setTimeout(tick, 100);
  };
  tick();
});

const notifyUnavailable = (explicit) => {
  // Otomatik okumalarda (doğru cevapta sayı okuma) yalnızca bir kez uyar;
  // kullanıcı 🔊 düğmesine bastığında her seferinde geri bildirim ver.
  if (noticeShown && !explicit) return;
  noticeShown = true;
  try {
    window.dispatchEvent(new CustomEvent(TTS_UNAVAILABLE_EVENT, { detail: { native: isNative() } }));
  } catch {}
};

let nativeTts = null;
const getNativeTts = () => {
  if (!nativeTts) nativeTts = import('@capacitor-community/text-to-speech').then((m) => m.TextToSpeech);
  return nativeTts;
};

const speakNative = async (text, { rate, pitch, explicit, onEnd }) => {
  try {
    const tts = await getNativeTts();
    // Varsayılan kuyruk stratejisi (0 = flush) önceki okumayı keser
    await tts.speak({ text, lang: 'tr-TR', rate, pitch, volume: 1.0 });
  } catch (e) {
    if (/not supported/i.test(String(e?.message || e))) notifyUnavailable(explicit);
  } finally {
    onEnd?.();
  }
};

const speakWeb = (text, { rate, pitch, explicit, onEnd }) => {
  const u = new SpeechSynthesisUtterance(text);
  u.voice = turkishVoice;
  u.lang = 'tr-TR';
  u.rate = rate;
  u.pitch = pitch;
  u.onend = u.onerror = () => {
    if (currentUtterance === u) currentUtterance = null;
    onEnd?.();
  };
  currentUtterance = u;
  synth.cancel();
  if (synth.paused) synth.resume();
  synth.speak(u);
};

/**
 * Metni Türkçe sesle okur. Türkçe ses yoksa okumaz ve kullanıcıyı uyarır.
 * @param {string|number} text
 * @param {object} [opts]
 * @param {number} [opts.rate=0.85]
 * @param {number} [opts.pitch=1.1]
 * @param {boolean} [opts.explicit=false] Kullanıcı 🔊 düğmesine bastıysa true
 * @param {() => void} [opts.onEnd] Okuma bittiğinde ya da yapılamadığında
 */
export const speak = (text, { rate = 0.85, pitch = 1.1, explicit = false, onEnd } = {}) => {
  const opts = { rate, pitch, explicit, onEnd };
  const str = String(text ?? '').trim();
  if (!str) { onEnd?.(); return; }
  try {
    if (isNative()) { speakNative(str, opts); return; }
    if (!synth) { notifyUnavailable(explicit); onEnd?.(); return; }

    // Sesler hazırsa hemen (senkron) oku: iOS ilk okumanın dokunma
    // olayının içinde başlamasını istiyor.
    // Edge çevrimiçi Türkçe sesleri yerel seslerden sonra yüklüyor: bulunamadıysa yeniden bak
    if (!turkishVoice) refreshVoices();
    if (voicesLoaded) {
      if (turkishVoice) speakWeb(str, opts);
      else { notifyUnavailable(explicit); onEnd?.(); }
      return;
    }
    waitForVoices().then(() => {
      if (turkishVoice) speakWeb(str, opts);
      else { notifyUnavailable(explicit); onEnd?.(); }
    });
  } catch {
    onEnd?.();
  }
};

export const stopSpeaking = () => {
  try {
    if (isNative()) { getNativeTts().then((tts) => tts.stop()).catch(() => {}); return; }
    synth?.cancel();
  } catch {}
};

/** Android uygulamasında sistemin Türkçe ses verisi yükleme ekranını açar. */
export const openNativeVoiceInstall = async () => {
  try { await (await getNativeTts()).openInstall(); } catch {}
};
