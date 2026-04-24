import '@testing-library/jest-dom/vitest';
import { beforeEach, vi } from 'vitest';

// jsdom'un localStorage'ı bazen proxy davranışı nedeniyle test içinde kaybolur;
// güvenilir Storage mock'u doğrudan window'a bağla.
const makeStorage = () => {
  const data = new Map();
  const api = {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => { data.set(k, String(v)); },
    removeItem: (k) => { data.delete(k); },
    clear: () => { data.clear(); },
    key: (i) => Array.from(data.keys())[i] ?? null,
    get length() { return data.size; },
  };
  // Proxy ile Object.keys(localStorage) ve direct index erişimi desteği
  return new Proxy(api, {
    ownKeys: () => [...data.keys()],
    getOwnPropertyDescriptor: (t, k) => {
      if (k in t) return Object.getOwnPropertyDescriptor(t, k);
      if (data.has(k)) return { value: data.get(k), enumerable: true, configurable: true, writable: true };
      return undefined;
    },
    has: (t, k) => (k in t) || data.has(k),
    get: (t, k) => (k in t ? t[k] : data.get(k)),
  });
};

beforeEach(() => {
  Object.defineProperty(window, 'localStorage', {
    value: makeStorage(),
    configurable: true,
    writable: true,
  });
  Object.defineProperty(window, 'sessionStorage', {
    value: makeStorage(),
    configurable: true,
    writable: true,
  });
  // globalThis'e de bağla — ES module direct import olduğunda görünsün
  globalThis.localStorage = window.localStorage;
  globalThis.sessionStorage = window.sessionStorage;
});
