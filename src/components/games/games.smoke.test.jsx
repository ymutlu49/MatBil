import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, act, cleanup } from '@testing-library/react';

/**
 * Duman testi: her oyun her seviyede menü → hazır → oynama akışından geçer ve
 * rastgele cevaplarla birkaç tur oynanır. Amaç, ekranda donmaya yol açan
 * çalışma zamanı hatalarını (ör. tanımsız fonksiyon çağrısı) yakalamak.
 */
const modules = import.meta.glob('./category-*/*.jsx', { eager: true });

const games = Object.entries(modules).map(([path, mod]) => [path.split('/').pop().replace('.jsx', ''), mod.default]);

const isResult = (c) => !!c.querySelector('[aria-label^="Sonuç"]');

const playableButtons = (c) => [...c.querySelectorAll('button')].filter((b) => {
  const t = b.textContent || '';
  return !b.disabled && !t.includes('Düzey') && !t.includes('🏠') && t.trim() !== '?';
});

describe('oyun duman testi', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { cleanup(); vi.useRealTimers(); });

  it.each(games)('%s: her seviye açılır ve oynanır', (name, Game) => {
    const onGameComplete = vi.fn();
    const { container, getAllByText, unmount } = render(
      <Game onBack={vi.fn()} colors={{}} onGameComplete={onGameComplete} prevBest={0} rahatMod={false} sesAcik={false} />
    );
    const levelCount = [...container.querySelectorAll('button')].filter((b) => /Seviye|Düzey|Kolay|Orta|Zor|İleri|Hızlı/.test(b.textContent)).length || 1;

    for (let lv = 0; lv < Math.min(levelCount, 4); lv++) {
      // Menü: seviye seç (geri düğmesi hariç)
      const levelBtns = [...container.querySelectorAll('button')].filter((b) => !/Geri|←|🏠/.test(b.textContent));
      fireEvent.click(levelBtns[lv] || levelBtns[0]);
      // Hazır ekranı: Başla
      const start = getAllByText(/Başla/).find((el) => el.closest('button'));
      fireEvent.click(start.closest('button'));
      act(() => { vi.advanceTimersByTime(5000); });

      // Rastgele cevaplarla oyna
      for (let step = 0; step < 60 && !isResult(container); step++) {
        const input = container.querySelector('input');
        if (input && !input.value) fireEvent.change(input, { target: { value: '5' } });
        const btns = playableButtons(container);
        if (btns.length) fireEvent.click(btns[Math.floor(Math.random() * btns.length)]);
        act(() => { vi.advanceTimersByTime(3000); });
      }

      // Menüye dön ve sıradaki seviyeyi dene
      const back = [...container.querySelectorAll('button')].find((b) => /Düzey|Seviye Seçimine|Seviye Menü|Seviyeler/.test(b.textContent));
      if (!back) break;
      fireEvent.click(back);
      act(() => { vi.advanceTimersByTime(3000); });
    }
    expect(container.innerHTML.length).toBeGreaterThan(0);
    unmount();
  });
});
