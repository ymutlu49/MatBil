import { describe, it, expect } from 'vitest';
import { calcStars } from './helpers';

describe('calcStars', () => {
  it('kusursuz oyun her puanlama ölçeğinde 3 yıldızdır', () => {
    // 10 tur × doğru başına 10/15/20 puan × seviye
    expect(calcStars(10 * 10 * 1, 10 * 10 * 1)).toBe(3);
    expect(calcStars(10 * 15 * 3, 10 * 15 * 3)).toBe(3);
    expect(calcStars(10 * 20 * 4, 10 * 20 * 4)).toBe(3);
  });

  it('eşikler: %90 → 3, %60 → 2, %30 → 1, altı → 0', () => {
    expect(calcStars(90, 100)).toBe(3);
    expect(calcStars(89, 100)).toBe(2);
    expect(calcStars(60, 100)).toBe(2);
    expect(calcStars(30, 100)).toBe(1);
    expect(calcStars(29, 100)).toBe(0);
  });

  it('azami puanı aşan skor 3 yıldızda kalır', () => {
    expect(calcStars(500, 100)).toBe(3);
  });
});
