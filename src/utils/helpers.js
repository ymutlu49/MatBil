export const TOTAL_ROUNDS = 10;

export const playSound = (type) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    if (type === 'correct') {
      osc.frequency.value = 523.25;
      gain.gain.value = 0.3;
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else {
      osc.frequency.value = 200;
      gain.gain.value = 0.2;
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
  'Tekrar dene!',
  'Yakla\u015Ft\u0131n!',
  'Bir daha dene!',
  'Neredeyse!',
  'Vazge\u00E7me!',
];

export const encourage = () => {
  return encourageMessages[Math.floor(Math.random() * encourageMessages.length)];
};

export const speakNumber = (num) => {
  try {
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(String(num));
      u.lang = 'tr-TR';
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
    }
  } catch {}
};
