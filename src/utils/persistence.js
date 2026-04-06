/**
 * persistence.js - IndexedDB wrapper with localStorage fallback
 *
 * Provides persistent storage for the MatBil dyscalculia platform.
 * Uses IndexedDB as primary store and falls back to localStorage
 * if IndexedDB is unavailable (e.g. private browsing in some browsers).
 *
 * Database: matbil_db (version 1)
 * Object stores: progress, sessions, screenings, moods
 */

// ---------------------------------------------------------------------------
// Internal state
// ---------------------------------------------------------------------------

let db = null;           // IndexedDB instance (null until initDB resolves)
let dbReady = false;     // true once IndexedDB is confirmed usable
const DB_NAME = 'matbil_db';
const DB_VERSION = 1;
const STORES = ['progress', 'sessions', 'screenings', 'moods'];

// ---------------------------------------------------------------------------
// initDB - open / create the IndexedDB database
// ---------------------------------------------------------------------------

/**
 * Initialise the IndexedDB database.
 * Safe to call multiple times; returns the same promise if already open.
 * Resolves with the IDBDatabase instance, or null when IndexedDB is
 * unavailable (localStorage will be used instead).
 *
 * @returns {Promise<IDBDatabase|null>}
 */
export async function initDB() {
  // Already initialised
  if (db) return db;

  // IndexedDB not supported - fall back silently
  if (typeof indexedDB === 'undefined') {
    console.warn('[persistence] IndexedDB not available, using localStorage fallback.');
    return null;
  }

  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const database = event.target.result;
        // Create object stores that do not exist yet.
        // Each store uses a compound key of (userId + storeName-specific suffix).
        // We use a simple 'id' keyPath so callers build their own key strings.
        for (const storeName of STORES) {
          if (!database.objectStoreNames.contains(storeName)) {
            database.createObjectStore(storeName, { keyPath: 'id' });
          }
        }
      };

      request.onsuccess = (event) => {
        db = event.target.result;
        dbReady = true;
        console.log('[persistence] IndexedDB initialised.');
        resolve(db);
      };

      request.onerror = () => {
        console.warn('[persistence] IndexedDB open failed, using localStorage fallback.');
        resolve(null);
      };
    } catch {
      console.warn('[persistence] IndexedDB exception, using localStorage fallback.');
      resolve(null);
    }
  });
}

// ---------------------------------------------------------------------------
// Low-level helpers (internal)
// ---------------------------------------------------------------------------

/**
 * Get a single record from an IndexedDB store by key.
 * Returns undefined if not found or if DB is not ready.
 */
function _idbGet(storeName, key) {
  if (!dbReady || !db) return Promise.resolve(undefined);
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(undefined);
    } catch {
      resolve(undefined);
    }
  });
}

/**
 * Put (upsert) a record into an IndexedDB store.
 * The record MUST have an `id` property matching the store keyPath.
 */
function _idbPut(storeName, record) {
  if (!dbReady || !db) return Promise.resolve(false);
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put(record);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

/**
 * Get all records from a store, optionally filtered by userId prefix.
 */
function _idbGetAll(storeName) {
  if (!dbReady || !db) return Promise.resolve([]);
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

// ---------------------------------------------------------------------------
// Public high-level API
// ---------------------------------------------------------------------------

/**
 * Read a value - tries IndexedDB first, falls back to localStorage.
 *
 * @param {string} storeName  One of STORES
 * @param {string} key        Record id (e.g. 'user123')
 * @param {string} lsKey      localStorage key for fallback
 * @returns {Promise<any>}    The stored data (parsed), or null
 */
export async function getData(storeName, key, lsKey) {
  // Try IndexedDB
  const record = await _idbGet(storeName, key);
  if (record && record.data !== undefined) return record.data;

  // Fallback: localStorage
  try {
    const raw = localStorage.getItem(lsKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Write a value - stores in IndexedDB and also mirrors to localStorage
 * so existing code that reads localStorage directly still works.
 *
 * @param {string} storeName  One of STORES
 * @param {string} key        Record id
 * @param {string} lsKey      localStorage key for mirror/fallback
 * @param {any}    data       Data to store (must be JSON-serialisable)
 */
export async function setData(storeName, key, lsKey, data) {
  // Always write to localStorage so existing code keeps working
  try {
    localStorage.setItem(lsKey, JSON.stringify(data));
  } catch { /* quota exceeded or unavailable */ }

  // Also write to IndexedDB
  await _idbPut(storeName, { id: key, data, updatedAt: Date.now() });
}

// ---------------------------------------------------------------------------
// exportAllData - full backup for a user
// ---------------------------------------------------------------------------

/**
 * Export all data for a user as a plain JSON object.
 * Gathers data from both IndexedDB stores and localStorage keys.
 *
 * @param {string} userId
 * @returns {Promise<object>}  JSON-serialisable backup object
 */
export async function exportAllData(userId) {
  const backup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    userId,
    data: {},
  };

  // Collect from IndexedDB stores
  for (const storeName of STORES) {
    const record = await _idbGet(storeName, userId);
    if (record && record.data !== undefined) {
      backup.data[storeName] = record.data;
    }
  }

  // Collect from localStorage (ensures we capture data even if IDB is empty)
  const lsMapping = {
    progress: `matbil_progress_${userId}`,
    sessions: `matbil_sessions_${userId}`,
    moods: `matbil_mood_${userId}`,
    screenings: `matbil_screening_${userId}`,
  };

  for (const [store, lsKey] of Object.entries(lsMapping)) {
    if (!backup.data[store]) {
      try {
        const raw = localStorage.getItem(lsKey);
        if (raw) backup.data[store] = JSON.parse(raw);
      } catch { /* ignore parse errors */ }
    }
  }

  // Also grab miscellaneous user-agnostic settings for completeness
  const extras = {};
  const extraKeys = ['matbil_streak', 'matbil_onboarded', 'matbil_buyuk_yazi', 'matbil_ses', 'matbil_rahat_mod'];
  for (const k of extraKeys) {
    try {
      const v = localStorage.getItem(k);
      if (v !== null) extras[k] = v;
    } catch { /* ignore */ }
  }
  if (Object.keys(extras).length > 0) backup.data._settings = extras;

  // Teacher note (keyed by user name, so we try both id and name patterns)
  try {
    const noteKey = `matbil_note_${userId}`;
    const note = localStorage.getItem(noteKey);
    if (note) backup.data._teacherNote = note;
  } catch { /* ignore */ }

  return backup;
}

// ---------------------------------------------------------------------------
// importData - restore from a backup
// ---------------------------------------------------------------------------

/**
 * Import (restore) user data from a previously exported JSON backup.
 *
 * @param {string} userId
 * @param {object} jsonData  The backup object produced by exportAllData
 * @returns {Promise<{ ok: boolean, errors: string[] }>}
 */
export async function importData(userId, jsonData) {
  const errors = [];

  if (!jsonData || !jsonData.data) {
    return { ok: false, errors: ['Invalid backup format: missing data field.'] };
  }

  const lsMapping = {
    progress: `matbil_progress_${userId}`,
    sessions: `matbil_sessions_${userId}`,
    moods: `matbil_mood_${userId}`,
    screenings: `matbil_screening_${userId}`,
  };

  for (const [storeName, lsKey] of Object.entries(lsMapping)) {
    const value = jsonData.data[storeName];
    if (value === undefined) continue;

    // Write to localStorage
    try {
      localStorage.setItem(lsKey, JSON.stringify(value));
    } catch (e) {
      errors.push(`localStorage write failed for ${storeName}: ${e.message}`);
    }

    // Write to IndexedDB
    const ok = await _idbPut(storeName, { id: userId, data: value, updatedAt: Date.now() });
    if (!ok) errors.push(`IndexedDB write failed for ${storeName}`);
  }

  // Restore settings
  if (jsonData.data._settings) {
    for (const [k, v] of Object.entries(jsonData.data._settings)) {
      try { localStorage.setItem(k, v); } catch { /* ignore */ }
    }
  }

  // Restore teacher note
  if (jsonData.data._teacherNote) {
    try { localStorage.setItem(`matbil_note_${userId}`, jsonData.data._teacherNote); } catch { /* ignore */ }
  }

  return { ok: errors.length === 0, errors };
}

// ---------------------------------------------------------------------------
// migrateFromLocalStorage - one-time migration
// ---------------------------------------------------------------------------

/**
 * Migrate existing localStorage data into IndexedDB for a user.
 * This is a one-time operation; it sets a flag so it won't run again.
 * Does NOT delete localStorage data (keeps it as fallback).
 *
 * @param {string} userId
 * @returns {Promise<boolean>}  true if migration ran, false if skipped
 */
export async function migrateFromLocalStorage(userId) {
  // Check if migration was already done
  const migrationKey = `matbil_idb_migrated_${userId}`;
  if (localStorage.getItem(migrationKey)) return false;

  // Ensure DB is ready
  await initDB();
  if (!dbReady) return false;

  const lsMapping = {
    progress: `matbil_progress_${userId}`,
    sessions: `matbil_sessions_${userId}`,
    moods: `matbil_mood_${userId}`,
    screenings: `matbil_screening_${userId}`,
  };

  let migrated = false;

  for (const [storeName, lsKey] of Object.entries(lsMapping)) {
    try {
      const raw = localStorage.getItem(lsKey);
      if (raw) {
        const data = JSON.parse(raw);
        await _idbPut(storeName, { id: userId, data, updatedAt: Date.now() });
        migrated = true;
      }
    } catch {
      // Silently skip unparseable entries
    }
  }

  // Mark migration complete
  try { localStorage.setItem(migrationKey, Date.now().toString()); } catch { /* ignore */ }

  if (migrated) {
    console.log(`[persistence] Migrated localStorage data to IndexedDB for user ${userId}.`);
  }

  return migrated;
}
