import { describe, it, expect } from 'vitest';
import { sayiEki, sayiSonKelime } from './turkish';

describe('sayiSonKelime', () => {
  it.each([
    [0, 'sıfır'], [1, 'bir'], [13, 'üç'], [20, 'yirmi'], [40, 'kırk'], [60, 'altmış'],
    [100, 'yüz'], [250, 'elli'], [1000, 'bin'], [2000000, 'milyon'], [-3, 'üç'], [2.5, 'beş'],
  ])('%s → %s', (n, k) => expect(sayiSonKelime(n)).toBe(k));
});

describe('sayiEki', () => {
  it('ayrılma (-den/-dan/-ten/-tan)', () => {
    expect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 40, 60, 70, 100].map((n) => sayiEki(n, 'den'))).toEqual([
      "1'den", "2'den", "3'ten", "4'ten", "5'ten", "6'dan", "7'den", "8'den", "9'dan", "10'dan",
      "20'den", "40'tan", "60'tan", "70'ten", "100'den",
    ]);
  });

  it('yönelme (-e/-a/-ye/-ya)', () => {
    expect([0, 1, 2, 3, 5, 6, 9, 10, 20, 100].map((n) => sayiEki(n, 'e'))).toEqual([
      "0'a", "1'e", "2'ye", "3'e", "5'e", "6'ya", "9'a", "10'a", "20'ye", "100'e",
    ]);
  });

  it('ilgi (-in/-ın/-un/-ün/-nin…)', () => {
    expect([1, 2, 3, 4, 6, 9, 10, 30].map((n) => sayiEki(n, 'in'))).toEqual([
      "1'in", "2'nin", "3'ün", "4'ün", "6'nın", "9'un", "10'un", "30'un",
    ]);
  });

  it('üleştirme (-er/-ar/-şer/-şar)', () => {
    expect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => sayiEki(n, 'er'))).toEqual([
      "1'er", "2'şer", "3'er", "4'er", "5'er", "6'şar", "7'şer", "8'er", "9'ar", "10'ar",
    ]);
  });

  it('-li/-lı/-lu/-lü', () => {
    expect([2, 3, 5, 6, 9, 10].map((n) => sayiEki(n, 'li'))).toEqual([
      "2'li", "3'lü", "5'li", "6'lı", "9'lu", "10'lu",
    ]);
  });
});
