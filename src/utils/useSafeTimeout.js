import { useRef, useEffect, useCallback } from 'react';

const CANCEL_EVENT = 'matbil:cancel-game-timers';

/**
 * Oyundaki bekleyen tüm safeSetTimeout zamanlayıcılarını iptal eder.
 * "← Düzey" ile menüye dönülünce son turun zamanlayıcısı sonuç ekranını
 * açıp puanı kaydetmesin diye GameHeader çağırır.
 */
export const cancelGameTimers = () => {
  try { window.dispatchEvent(new Event(CANCEL_EVENT)); } catch {}
};

/**
 * useSafeTimeout — unmount'ta otomatik cleanup yapan setTimeout wrapper'ı.
 *
 * Kullanım:
 *   const safeSetTimeout = useSafeTimeout();
 *   safeSetTimeout(() => { ... }, 1500);
 *
 * Component unmount olursa tüm bekleyen timer'lar iptal edilir.
 * Oyunlarda 34+ raw setTimeout çağrısının memory leak ve "setState on unmounted"
 * uyarılarını engellemek için adım adım bu hook'a geçilebilir.
 */
export const useSafeTimeout = () => {
  const timersRef = useRef(new Set());

  useEffect(() => {
    const timers = timersRef.current;
    const clearAll = () => {
      timers.forEach(id => clearTimeout(id));
      timers.clear();
    };
    window.addEventListener(CANCEL_EVENT, clearAll);
    return () => {
      window.removeEventListener(CANCEL_EVENT, clearAll);
      clearAll();
    };
  }, []);

  return useCallback((callback, delay) => {
    const id = setTimeout(() => {
      timersRef.current.delete(id);
      callback();
    }, delay);
    timersRef.current.add(id);
    return id;
  }, []);
};

export default useSafeTimeout;
