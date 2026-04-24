import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initTelemetry, reportError, isSentryActive } from './telemetry';

describe('Telemetri — DSN yokken', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true })));
  });

  it('DSN yoksa initTelemetry false döner', async () => {
    const result = await initTelemetry();
    expect(result).toBe(false);
    expect(isSentryActive()).toBe(false);
  });

  it('DSN yoksa ve endpoint de yoksa reportError sessiz geçer', async () => {
    await expect(reportError(new Error('test'))).resolves.toBeUndefined();
  });
});
