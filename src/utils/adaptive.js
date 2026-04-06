import { useState, useCallback, useRef } from 'react';

/**
 * Geliştirilmiş Adaptif Zorluk Sistemi
 *
 * Akademik iyileştirmeler (PMC, 2025; Kucian ve ark., 2020):
 * - Doğruluk + yanıt süresi birleşik analiz
 * - Strateji kullanımı takibi (hızlı-doğru vs yavaş-doğru ayrımı)
 * - Kaygı göstergesi algılama (uzun duraksamalar, art arda yanlış)
 * - Kavramsal zorluk boyutu ekleme
 *
 * Calcularis ve DreamBox yaklaşımına dayalı
 * Kaynak: Kucian ve ark. (2015), Calcularis adaptif modeli
 */
export const useAdaptive = (options = {}) => {
  const {
    windowSize = 6,
    upThreshold = 0.8,
    downThreshold = 0.35,
    stepUp = 0.15,
    stepDown = 0.2,
    minDiff = 0.5,
    maxDiff = 2.0,
  } = options;

  const [diff, setDiff] = useState(1.0);
  const history = useRef([]);
  const streak = useRef({ correct: 0, wrong: 0 });
  const rtHistory = useRef([]);        // Yanıt süresi geçmişi
  const anxietySignals = useRef(0);    // Kaygı sinyali sayacı
  const performanceProfile = useRef({
    fastCorrect: 0,   // Hızlı ve doğru (ustalık)
    slowCorrect: 0,    // Yavaş ve doğru (stratejik)
    fastWrong: 0,      // Hızlı ve yanlış (dürtüsel)
    slowWrong: 0,      // Yavaş ve yanlış (zorluk)
    totalTrials: 0,
  });

  const record = useCallback((isCorrect, responseTimeMs = null) => {
    // Seri takibi
    if (isCorrect) {
      streak.current.correct++;
      streak.current.wrong = 0;
    } else {
      streak.current.wrong++;
      streak.current.correct = 0;
    }

    // Kaygı sinyali algılama
    if (streak.current.wrong >= 3) {
      anxietySignals.current++;
    }

    // Yanıt süresi analizi
    if (responseTimeMs !== null) {
      rtHistory.current.push(responseTimeMs);
      if (rtHistory.current.length > 20) rtHistory.current.shift();

      // Medyan RT hesapla
      const sorted = [...rtHistory.current].sort((a, b) => a - b);
      const medianRT = sorted[Math.floor(sorted.length / 2)] || 3000;
      const isFast = responseTimeMs < medianRT * 0.8;

      // Performans profili güncelle
      const pp = performanceProfile.current;
      pp.totalTrials++;
      if (isCorrect && isFast) pp.fastCorrect++;
      else if (isCorrect && !isFast) pp.slowCorrect++;
      else if (!isCorrect && isFast) pp.fastWrong++;
      else pp.slowWrong++;

      // Uzun duraklama = kaygı göstergesi (medyanın 3 katından fazla)
      if (responseTimeMs > medianRT * 3) {
        anxietySignals.current++;
      }
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

        // Temel doğruluk bazlı ayar
        if (rate >= upThreshold) {
          // Hızlı-doğru yüzdesi yüksekse daha agresif zorlaştır
          const pp = performanceProfile.current;
          const masteryRatio = pp.totalTrials > 0 ? pp.fastCorrect / pp.totalTrials : 0;
          const boost = masteryRatio > 0.5 ? stepUp * 1.5 : stepUp;
          next = Math.min(maxDiff, prev + boost);
        } else if (rate <= downThreshold) {
          // Kaygı sinyali varsa daha fazla kolaylaştır
          const anxietyBoost = anxietySignals.current > 2 ? 1.5 : 1.0;
          next = Math.max(minDiff, prev - stepDown * anxietyBoost);
        }

        return Math.round(next * 100) / 100;
      });
    }
  }, [windowSize, upThreshold, downThreshold, stepUp, stepDown, minDiff, maxDiff]);

  const reset = useCallback(() => {
    setDiff(1.0);
    history.current = [];
    streak.current = { correct: 0, wrong: 0 };
    rtHistory.current = [];
    anxietySignals.current = 0;
    performanceProfile.current = {
      fastCorrect: 0, slowCorrect: 0, fastWrong: 0, slowWrong: 0, totalTrials: 0,
    };
  }, []);

  // Yardımcı fonksiyonlar
  const getTimeMultiplier = useCallback(() => {
    return Math.max(0.5, 1.5 - (diff - 0.5) * 0.6);
  }, [diff]);

  const getRangeMultiplier = useCallback(() => {
    return diff;
  }, [diff]);

  const getStreakInfo = useCallback(() => ({
    correctStreak: streak.current.correct,
    wrongStreak: streak.current.wrong,
    isHotStreak: streak.current.correct >= 3,
    needsSupport: streak.current.wrong >= 3,
  }), []);

  // Yeni: Performans profili
  const getPerformanceProfile = useCallback(() => {
    const pp = performanceProfile.current;
    if (pp.totalTrials === 0) return { type: 'unknown', detail: 'Yeterli veri yok' };
    const total = pp.totalTrials;
    if (pp.fastCorrect / total > 0.5) return { type: 'mastery', detail: 'Hızlı ve doğru — ustalık düzeyinde' };
    if (pp.slowCorrect / total > 0.4) return { type: 'strategic', detail: 'Stratejik düşünme — iyi ilerleme' };
    if (pp.fastWrong / total > 0.3) return { type: 'impulsive', detail: 'Hızlı yanıt eğilimi — dikkat desteği gerekebilir' };
    if (pp.slowWrong / total > 0.3) return { type: 'struggling', detail: 'Zorluk yaşıyor — seviye düşürme önerilir' };
    return { type: 'developing', detail: 'Gelişim sürecinde' };
  }, []);

  // Yeni: Kaygı durumu
  const getAnxietyLevel = useCallback(() => {
    if (anxietySignals.current >= 5) return 'high';
    if (anxietySignals.current >= 2) return 'moderate';
    return 'low';
  }, []);

  return {
    diff,
    record,
    reset,
    getTimeMultiplier,
    getRangeMultiplier,
    getStreakInfo,
    getPerformanceProfile,
    getAnxietyLevel,
  };
};
