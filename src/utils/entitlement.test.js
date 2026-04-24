import { describe, it, expect } from 'vitest';
import { isPremiumUser, writePremiumState, revokePremium } from './entitlement';

describe('Premium entitlement — bypass koruması', () => {
  it('Trivial localStorage bypass reddedilir (sadece matbil_premium="1")', () => {
    localStorage.setItem('matbil_premium', '1');
    expect(isPremiumUser()).toBe(false);
    // Temizlenmeli
    expect(localStorage.getItem('matbil_premium')).toBeNull();
  });

  it('writePremiumState ile aktivasyon çalışır', () => {
    writePremiumState('MTB-TEST-0000-0001');
    expect(isPremiumUser()).toBe(true);
    expect(localStorage.getItem('matbil_premium_sig')).toBeTruthy();
  });

  it('Kod tamper edilirse premium iptal olur', () => {
    writePremiumState('MTB-TEST-0000-0001');
    expect(isPremiumUser()).toBe(true);
    // Kodu manipüle et
    localStorage.setItem('matbil_premium_code', 'HACKED');
    expect(isPremiumUser()).toBe(false);
    expect(localStorage.getItem('matbil_premium')).toBeNull();
  });

  it('Legacy kullanıcı (progress verisi olan) imzasız premium ile geçerli', () => {
    // Legacy senaryo: premium='1', sig yok, ama önceki kullanım kanıtı var
    localStorage.setItem('matbil_premium', '1');
    localStorage.setItem('matbil_progress_user1', '{"A1":{"bestScore":100}}');
    expect(isPremiumUser()).toBe(true);
    // Çağrı sonrası imzalanmış olmalı
    expect(localStorage.getItem('matbil_premium_sig')).toBeTruthy();
  });

  it('revokePremium tüm imza alanlarını temizler', () => {
    writePremiumState('MTB-TEST-0000-0001');
    revokePremium();
    expect(localStorage.getItem('matbil_premium')).toBeNull();
    expect(localStorage.getItem('matbil_premium_sig')).toBeNull();
  });
});
