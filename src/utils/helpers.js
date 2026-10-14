import { speak } from './speech';

export const TOTAL_ROUNDS = 10;

export const calcStars = (score, maxScore) => {
  const pct = Math.min(100, Math.round((score / Math.max(maxScore, 1)) * 100));
  return pct >= 90 ? 3 : pct >= 60 ? 2 : pct >= 30 ? 1 : 0;
};

export const shuffle = (arr) => {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

// Ayarlar > "Ses Açık/Kapalı" (App.jsx toggleSes ile aynı anahtar)
export const isSoundOn = () => {
  try { return localStorage.getItem('matbil_ses') !== 'false'; } catch { return true; }
};

export const playSound = (type) => {
  if (!isSoundOn()) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();

    if (type === 'correct') {
      // Neşeli, hafif xylophone tarzı iki nota (çocuk dostu)
      const notes = [659.25, 783.99]; // E5, G5
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.1);
        osc.stop(ctx.currentTime + i * 0.1 + 0.3);
      });
    } else {
      // Yumuşak, kısa "boop" sesi (korkutucu değil)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(350, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    }
  } catch {}
};

export const vibrate = (pattern) => {
  try {
    if (navigator.vibrate) navigator.vibrate(pattern);
  } catch {}
};

const encourageMessages = [
  'Yaklaştın!',
  'Bir daha dene!',
  'Neredeyse!',
  'Güzel deneme!',
  'İyi düşündün!',
  'Öğreniyorsun!',
  'Harika çaba!',
  'Devam et!',
];

export const encourage = () => {
  return encourageMessages[Math.floor(Math.random() * encourageMessages.length)];
};

export const speakNumber = (num) => {
  if (!isSoundOn()) return;
  speak(num, { rate: 0.9, pitch: 1 });
};
