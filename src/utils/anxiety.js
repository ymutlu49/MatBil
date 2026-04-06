/**
 * Kaygı Yönetimi Modülü
 *
 * Araştırma: Kucian ve ark. (2020), Ntourou ve ark. (2025)
 * - Pozitif geri bildirim vurgusunu artır
 * - Büyüme odaklı (growth mindset) mesajlar
 * - Mini kaygı ölçeği (emoji bazlı)
 */

// Büyüme odaklı teşvik mesajları (0 yıldız için "Tekrar dene" yerine)
export const growthMessages = [
  'Her deneme seni güçlendiriyor!',
  'Öğrenme yolunda ilerliyorsun!',
  'Beynin her denemede gelişiyor!',
  'Harika çaba! Devam et!',
  'Pratik yapmak en iyi öğretmen!',
  'Zorluklar seni güçlü yapıyor!',
  'Adım adım ilerle, başarı gelecek!',
  'Her usta bir zamanlar çıraktı!',
];

export const getGrowthMessage = () => {
  return growthMessages[Math.floor(Math.random() * growthMessages.length)];
};

// Yanlış cevap teşvik mesajları (kaygıyı azaltmak için)
export const gentleEncourageMessages = [
  'Yaklaştın, bir daha dene!',
  'İyi düşündün, biraz farklıydı.',
  'Harika çaba! Doğrusu bu:',
  'Neredeyse! Doğru cevap:',
  'Güzel deneme! Cevap:',
  'Öğreniyorsun, devam!',
];

export const gentleEncourage = () => {
  return gentleEncourageMessages[Math.floor(Math.random() * gentleEncourageMessages.length)];
};

// Emoji bazlı mini kaygı ölçeği
export const MOOD_OPTIONS = [
  { emoji: '😊', label: 'Rahatım', value: 1 },
  { emoji: '😐', label: 'Normal', value: 2 },
  { emoji: '😟', label: 'Biraz endişeliyim', value: 3 },
];

// Kaygı durumuna göre oyun ayarları
export const getAnxietyAdjustments = (moodValue) => {
  if (moodValue >= 3) {
    return {
      timeMultiplier: 1.5,     // %50 daha fazla süre
      feedbackDelay: 1500,     // Daha uzun geri bildirim süresi
      useGentleFeedback: true, // Sarsıntı animasyonu yerine yumuşak geçiş
      showHints: true,         // İpuçlarını otomatik göster
    };
  }
  if (moodValue === 2) {
    return {
      timeMultiplier: 1.2,
      feedbackDelay: 1200,
      useGentleFeedback: false,
      showHints: false,
    };
  }
  return {
    timeMultiplier: 1.0,
    feedbackDelay: 1000,
    useGentleFeedback: false,
    showHints: false,
  };
};

// Oturum başı ruh hali kaydı
export const saveMoodLog = (userId, mood) => {
  try {
    const key = `matbil_mood_${userId}`;
    const logs = JSON.parse(localStorage.getItem(key) || '[]');
    logs.push({ date: new Date().toISOString(), mood });
    // Son 90 gün
    const cutoff = Date.now() - 90 * 86400 * 1000;
    const filtered = logs.filter(l => new Date(l.date).getTime() > cutoff);
    localStorage.setItem(key, JSON.stringify(filtered));
  } catch {}
};

export const getMoodHistory = (userId) => {
  try {
    const key = `matbil_mood_${userId}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch { return []; }
};
