import { useRef, useEffect, useCallback } from 'react';

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
    return () => {
      timers.forEach(id => clearTimeout(id));
      timers.clear();
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
