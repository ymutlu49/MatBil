import { describe, it, expect } from 'vitest';
import { hashPin, verifyPin, generateId } from './auth';

describe('Auth — PIN hashing', () => {
  it('hashPin deterministik — aynı girdi aynı hash', async () => {
    const h1 = await hashPin('1234');
    const h2 = await hashPin('1234');
    expect(h1).toBe(h2);
  });

  it('hashPin farklı PIN farklı hash verir', async () => {
    const h1 = await hashPin('1234');
    const h2 = await hashPin('5678');
    expect(h1).not.toBe(h2);
  });

  it('verifyPin doğru PIN için true döner', async () => {
    const stored = await hashPin('secret123');
    expect(await verifyPin('secret123', stored)).toBe(true);
    expect(await verifyPin('wrong', stored)).toBe(false);
  });

  it('hashPin 64 karakter hex (SHA-256)', async () => {
    const h = await hashPin('test');
    expect(h).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe('Auth — generateId', () => {
  it('Benzersiz ID üretir', () => {
    const ids = new Set();
    for (let i = 0; i < 100; i++) ids.add(generateId('test'));
    expect(ids.size).toBe(100);
  });

  it('Prefix uygulanır', () => {
    expect(generateId('student')).toMatch(/^student_/);
  });
});
