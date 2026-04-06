/**
 * Çok Duyulu Deneyim Yardımcıları
 *
 * Araştırma: HapticLearn 1.0 (ScienceDirect, 2025)
 * Tam fazlalık ilkesi: ses + metin + görüntü + hareket birlikte
 */

// Sayı sayma sesi (tık-tık)
export const playCountSound = (count, sesAcik = true) => {
  if (!sesAcik) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    for (let i = 0; i < Math.min(count, 10); i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 440 + i * 30; // Her sayıda biraz yükselen ton
      gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.2 + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.2);
      osc.stop(ctx.currentTime + i * 0.2 + 0.15);
    }
  } catch {}
};

// Sayı doğrusu yürüme sesi (adım sesi)
export const playStepSound = (direction = 'forward', sesAcik = true) => {
  if (!sesAcik) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = direction === 'forward' ? 300 : 250;
    osc.frequency.linearRampToValueAtTime(direction === 'forward' ? 400 : 200, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch {}
};

// Büyüklük karşılaştırma sesi (düşük = küçük, yüksek = büyük)
export const playMagnitudeSound = (value, maxValue, sesAcik = true) => {
  if (!sesAcik) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    // 200Hz (küçük) → 600Hz (büyük) aralığında frekans
    const freq = 200 + (value / Math.max(maxValue, 1)) * 400;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch {}
};

// Başarı melodisi (3 yıldız)
export const playSuccessMelody = (sesAcik = true) => {
  if (!sesAcik) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.15);
      osc.stop(ctx.currentTime + i * 0.15 + 0.3);
    });
  } catch {}
};

// Teşvik sesi (hafif pozitif ton)
export const playEncourageSound = (sesAcik = true) => {
  if (!sesAcik) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 440;
    osc.frequency.linearRampToValueAtTime(550, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch {}
};

// Türkçe sayı okuma (TTS)
export const speakTurkish = (text, rate = 0.85, sesAcik = true) => {
  if (!sesAcik) return;
  try {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'tr-TR';
      u.rate = rate;
      u.pitch = 1.1;
      window.speechSynthesis.speak(u);
    }
  } catch {}
};
