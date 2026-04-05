import { useState, useCallback, useRef } from 'react';

/**
 * Adaptif Zorluk Sistemi
 *
 * Calcularis ve DreamBox yaklaşımına dayalı:
 * - Son N cevabın doğruluk oranına göre zorluk ayarı
 * - 3 doğru üst üste → zorlaştır (diff +1 adım)
 * - 3 yanlış üst üste → kolaylaştır (diff -1 adım)
 * - Zorluk 0.5 ile 2.0 arasında (1.0 = normal)
 * - Oyun bileşenleri diff değerini süre, sayı aralığı veya
 *   seçenek sayısı gibi parametrelere çevirebilir
 *
 * Kaynak: Kucian ve ark. (2015), Calcularis adaptif modeli
 */
export const useAdaptive = (options = {}) => {
  const {
    windowSize = 6,      // Son kaç cevaba bakılacak
    upThreshold = 0.8,   // Bu oranın üstünde → zorlaştır
    downThreshold = 0.35, // Bu oranın altında → kolaylaştır
    stepUp = 0.15,       // Zorlaştırma adımı
    stepDown = 0.2,      // Kolaylaştırma adımı (daha büyük - çocuğu korumak için)
    minDiff = 0.5,       // Minimum zorluk çarpanı
    maxDiff = 2.0,       // Maksimum zorluk çarpanı
  } = options;

  const [diff, setDiff] = useState(1.0);
  const history = useRef([]);
  const streak = useRef({ correct: 0, wrong: 0 });

  const record = useCallback((isCorrect) => {
    // Seri takibi
    if (isCorrect) {
      streak.current.correct++;
      streak.current.wrong = 0;
    } else {
      streak.current.wrong++;
      streak.current.correct = 0;
    }

    // Pencereye ekle
    history.current.push(isCorrect);
    if (history.current.length > windowSize) {
      history.current.shift();
    }

    // Yeterli veri varsa zorluk ayarla
    if (history.current.length >= 3) {
      const rate = history.current.filter(Boolean).length / history.current.length;

      setDiff(prev => {
        let next = prev;
        if (rate >= upThreshold) {
          next = Math.min(maxDiff, prev + stepUp);
        } else if (rate <= downThreshold) {
          next = Math.max(minDiff, prev - stepDown);
        }
        return Math.round(next * 100) / 100;
      });
    }
  }, [windowSize, upThreshold, downThreshold, stepUp, stepDown, minDiff, maxDiff]);

  const reset = useCallback(() => {
    setDiff(1.0);
    history.current = [];
    streak.current = { correct: 0, wrong: 0 };
  }, []);

  // Yardımcı fonksiyonlar - oyunlar bunları kullanabilir
  const getTimeMultiplier = useCallback(() => {
    // Zorluk arttıkça süre kısalır: diff=0.5 → 1.5x süre, diff=2.0 → 0.6x süre
    return Math.max(0.5, 1.5 - (diff - 0.5) * 0.6);
  }, [diff]);

  const getRangeMultiplier = useCallback(() => {
    // Zorluk arttıkça sayı aralığı genişler
    return diff;
  }, [diff]);

  const getStreakInfo = useCallback(() => ({
    correctStreak: streak.current.correct,
    wrongStreak: streak.current.wrong,
    isHotStreak: streak.current.correct >= 3,
    needsSupport: streak.current.wrong >= 3,
  }), []);

  return {
    diff,
    record,
    reset,
    getTimeMultiplier,
    getRangeMultiplier,
    getStreakInfo,
  };
};
