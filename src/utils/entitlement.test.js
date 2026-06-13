import { describe, it, expect, beforeEach } from 'vitest';
import { isPremiumUser, writePremiumState, revokePremium, enforceCodeOnlyAccess, getPremiumInfo } from './entitlement';

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

describe('Kod-yalnız erişim zorlaması (enforceCodeOnlyAccess)', () => {
  beforeEach(() => { try { localStorage.clear(); } catch {} });

  it('GRANDFATHERED premium (koda dayanmayan) iptal edilir', () => {
    writePremiumState('GRANDFATHERED');
    expect(getPremiumInfo().active).toBe(true);
    enforceCodeOnlyAccess();
    expect(getPremiumInfo().active).toBe(false);
  });

  it('LEGACY ve kodsuz premium de iptal edilir', () => {
    writePremiumState('LEGACY');
    enforceCodeOnlyAccess();
    expect(getPremiumInfo().active).toBe(false);
  });

  it('Gerçek kitap kodu (MTB-...) korunur', () => {
    writePremiumState('MTB-TEST-0000-0001');
    enforceCodeOnlyAccess();
    expect(getPremiumInfo().active).toBe(true);
  });

  it('Yazar/Yönetici (ADMIN-AUTHOR) girişi korunur', () => {
    writePremiumState('ADMIN-AUTHOR');
    enforceCodeOnlyAccess();
    expect(getPremiumInfo().active).toBe(true);
  });

  it('Premium yoksa hiçbir şey yapmaz', () => {
    enforceCodeOnlyAccess();
    expect(getPremiumInfo().active).toBe(false);
  });

  it('TEK SEFERLİK: iptal sonrası girilen admin premium kalıcı olur', () => {
    // İlk boot: grandfather premium iptal edilir
    writePremiumState('GRANDFATHERED');
    enforceCodeOnlyAccess();
    expect(getPremiumInfo().active).toBe(false);
    // Kullanıcı Yazar/Yönetici girişi yapar
    writePremiumState('ADMIN-AUTHOR');
    // Sonraki boot'larda enforce tekrar çalışsa bile dokunmaz (flag set)
    enforceCodeOnlyAccess();
    expect(getPremiumInfo().active).toBe(true);
  });
});
