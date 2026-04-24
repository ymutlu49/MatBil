import { describe, it, expect } from 'vitest';
import { runMigrations, getCurrentSchemaVersion, CURRENT_SCHEMA_VERSION, __setSchemaVersion } from './schemaMigration';

describe('Schema migration altyapısı', () => {
  it('Taze sistem: v0 → CURRENT_SCHEMA_VERSION', () => {
    // Hiç versiyon yok
    expect(getCurrentSchemaVersion()).toBe(0);
    const result = runMigrations();
    expect(result.from).toBe(0);
    expect(result.to).toBe(CURRENT_SCHEMA_VERSION);
    expect(getCurrentSchemaVersion()).toBe(CURRENT_SCHEMA_VERSION);
  });

  it('Idempotent: İki kez çalıştırmak aynı sonucu verir', () => {
    runMigrations();
    const v1 = getCurrentSchemaVersion();
    runMigrations();
    const v2 = getCurrentSchemaVersion();
    expect(v1).toBe(v2);
    expect(v2).toBe(CURRENT_SCHEMA_VERSION);
  });

  it('v1→v2 migration: progress objelerine eksik alanlar eklenir', () => {
    __setSchemaVersion(1);
    // Eski format progress (eksik alanlarla)
    localStorage.setItem('matbil_progress_user1', JSON.stringify({
      A1: { bestScore: 100 }, // attempts, stars yok
      A2: { stars: 2 },        // attempts, bestScore yok
    }));
    runMigrations();
    const migrated = JSON.parse(localStorage.getItem('matbil_progress_user1'));
    expect(migrated.A1.attempts).toBe(0);
    expect(migrated.A1.stars).toBe(0);
    expect(migrated.A1.bestScore).toBe(100);
    expect(migrated.A2.attempts).toBe(0);
    expect(migrated.A2.stars).toBe(2);
    expect(migrated.A2.bestScore).toBe(0);
  });

  it('Bozuk JSON progress key: migration çökmez, diğer veriyi etkilemez', () => {
    __setSchemaVersion(1);
    localStorage.setItem('matbil_progress_bad', 'not-json');
    localStorage.setItem('matbil_progress_good', JSON.stringify({ A1: { bestScore: 50 } }));
    expect(() => runMigrations()).not.toThrow();
    // İyi veri migrate olmuş olmalı
    const good = JSON.parse(localStorage.getItem('matbil_progress_good'));
    expect(good.A1.attempts).toBe(0);
    // Bozuk veri el değmemiş
    expect(localStorage.getItem('matbil_progress_bad')).toBe('not-json');
  });
});
