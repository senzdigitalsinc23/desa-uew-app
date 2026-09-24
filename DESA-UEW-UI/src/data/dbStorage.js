import { DB_NAME, DB_VERSION, STORES } from './dbConfig';

let dbPromise = null;

function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      Object.values(STORES).forEach((storeName) => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'key' });
        }
      });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
}

/**
  Read a value from IndexedDB.
  Falls back to defaultValue if not found.
*/
export async function dbGet(key, defaultValue = null) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORES[key] || 'centers'], 'readonly');
      const store = tx.objectStore(STORES[key] || 'centers');
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result?.value !== undefined ? req.result.value : defaultValue);
      req.onerror = () => resolve(defaultValue);
    });
  } catch {
    return defaultValue;
  }
}

/**
  Write a value to IndexedDB.
  Dispatches a 'desa-data-changed' event so React components re-render.
*/
export async function dbSet(key, value) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORES[key] || 'centers'], 'readwrite');
      const store = tx.objectStore(STORES[key] || 'centers');
      const req = store.put({ key, value });
      req.onsuccess = () => {
        window.dispatchEvent(new CustomEvent('desa-data-changed', { detail: { type: key } }));
        resolve();
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('dbSet error:', err);
  }
}

/**
  Clear a specific key from IndexedDB.
*/
export async function dbDelete(key) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORES[key] || 'centers'], 'readwrite');
      const store = tx.objectStore(STORES[key] || 'centers');
      const req = store.delete(key);
      req.onsuccess = () => {
        window.dispatchEvent(new CustomEvent('desa-data-changed', { detail: { type: key } }));
        resolve();
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    // ignore
  }
}

/**
  Clear ALL data from IndexedDB.
*/
export async function dbClearAll() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(Object.values(STORES), 'readwrite');
      Object.values(STORES).forEach((storeName) => {
        tx.objectStore(storeName).clear();
      });
      tx.oncomplete = () => {
        window.dispatchEvent(new CustomEvent('desa-data-changed'));
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // ignore
  }
}

/**
  Export all data as a single JSON object with named datasets.
*/
export async function dbExportAll() {
  const result = {};
  for (const key of Object.keys(STORES)) {
    result[key] = await dbGet(key);
  }
  return result;
}

/**
  Import data from a parsed JSON object.
  Expected shape: { centers: [...], announcements: {...}, mockData: [...], hubData: {...} }
*/
export async function dbImportAll(data) {
  if (data.centers) await dbSet('centers', data.centers);
  if (data.announcements) await dbSet('announcements', data.announcements);
  if (data.mockData) await dbSet('mockData', data.mockData);
  if (data.hubData) await dbSet('hubData', data.hubData);
}

/**
  Download all data as a single JSON file.
*/
export async function exportJSON(filename = 'desa-data.json') {
  const data = await dbExportAll();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  return data;
}

/**
  Upload and parse a JSON file, then import into IndexedDB.
*/
export function importJSONFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);
        await dbImportAll(data);
        resolve(data);
      } catch (err) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
