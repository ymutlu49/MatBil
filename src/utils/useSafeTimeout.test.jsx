import { describe, it, expect, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { useSafeTimeout, cancelGameTimers } from './useSafeTimeout';

describe('useSafeTimeout — unmount cleanup', () => {
  it('Component unmount olursa pending callback çalışmaz', () => {
    vi.useFakeTimers();
    const cb = vi.fn();

    const TestComponent = () => {
      const safe = useSafeTimeout();
      safe(cb, 1000);
      return null;
    };

    const { unmount } = render(<TestComponent />);
    // Timer ilerletmeden unmount et
    unmount();
    // Şimdi timer ilerlese bile callback çalışmamalı
    act(() => { vi.advanceTimersByTime(2000); });
    expect(cb).not.toHaveBeenCalled();

    vi.useRealTimers();
  });

  it('Component mounted kalırsa callback çalışır', () => {
    vi.useFakeTimers();
    const cb = vi.fn();

    const TestComponent = () => {
      const safe = useSafeTimeout();
      safe(cb, 500);
      return null;
    };

    render(<TestComponent />);
    act(() => { vi.advanceTimersByTime(600); });
    expect(cb).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });

  it('cancelGameTimers bekleyen zamanlayıcıları iptal eder (← Düzey)', () => {
    vi.useFakeTimers();
    const cb = vi.fn();

    const TestComponent = () => {
      const safe = useSafeTimeout();
      safe(cb, 1500);
      return null;
    };

    render(<TestComponent />);
    act(() => { cancelGameTimers(); vi.advanceTimersByTime(2000); });
    expect(cb).not.toHaveBeenCalled();

    vi.useRealTimers();
  });
});
