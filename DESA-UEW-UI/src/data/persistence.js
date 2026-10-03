import { dbGet, dbSet, dbDelete, dbClearAll, dbExportAll, dbImportAll } from './dbStorage';
import { KEYS } from './dbConfig';
import centersDataDefault from './centersData.json';
import announcementsDataDefault from './announcementsData.json';
import mockDataDefault from './mockData.json';
import hubDataDefault from './hubData.json';

const DATA_SOURCE = import.meta.env.VITE_DATA_SOURCE || 'local_files';
const API_BASE = import.meta.env.VITE_API_BASE_URI || '';

// ─── API Adapter (used when VITE_DATA_SOURCE = api_access) ───────────
async function apiGet(endpoint) {
  const res = await fetch(`${API_BASE}${endpoint}`);
  if (!res.ok) throw new Error(`API GET failed: ${res.status}`);
  const json = await res.json();
  // Unwrap {success:true, data:...} responses
  let payload = json.data !== undefined ? json.data : json;

  // Transform API snake_case flat format to frontend camelCase nested format for centers
  if (endpoint === '/data/centers' && Array.isArray(payload)) {
    payload = payload.map(r => ({
      id:            r.slug,
      name:          r.name,
      shortName:     r.short_name,
      capital:       r.capital || '',
      code:          r.code || '',
      description:   r.description || '',
      centers:       Array.isArray(r.centers) ? r.centers.map(c => ({
        ...c,
        nearbyHotels:        c.nearby_hotels || [],
        nearbyHealth:        c.nearby_health || [],
        nearbyRestaurants:   c.nearby_restaurants || [],
      })) : [],
      programs: Array.isArray(r.programs) ? r.programs : [],
    }));
  } else if (endpoint === '/desa/regions' && Array.isArray(payload)) {
    payload = payload.map(r => ({
      ...r,
      short_name: r.short_name,
      centers:    Array.isArray(r.centers) ? r.centers.map(c => ({
        ...c,
        nearbyHotels:        c.nearby_hotels || [],
        nearbyHealth:        c.nearby_health || [],
        nearbyRestaurants:   c.nearby_restaurants || [],
      })) : [],
      programs: Array.isArray(r.programs) ? r.programs : [],
    }));
  }
  return payload;
}

async function apiSet(endpoint, data) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`API POST failed: ${res.status}`);
  return res.json();
}

// ─── Local File Adapter (used when VITE_DATA_SOURCE = local_files) ───
const DEFAULTS = {
  centers: centersDataDefault,
  announcements: announcementsDataDefault,
  mockData: mockDataDefault,
  hubData: hubDataDefault,
};

async function localGet(key) {
  const stored = await dbGet(KEYS[key]);
  return stored ?? DEFAULTS[key];
}

async function localSet(key, data) {
  await dbSet(KEYS[key], data);
}

// ─── Public API ───────────────────────────────────────────────────────
const isApiMode = DATA_SOURCE === 'api_access';

/**
  Read data for a given key.
  In api_access mode: fetches from API endpoint.
  In local_files mode: reads from IndexedDB, falls back to default JSON file.
*/
export async function getData(key) {
  if (isApiMode) {
    return apiGet(`/data/${key}`);
  }
  return localGet(key);
}

/**
  Write/update data for a given key.
  In api_access mode: sends to API endpoint.
  In local_files mode: writes to IndexedDB.
*/
export async function setData(key, data) {
  if (isApiMode) {
    return apiSet(`/data/${key}`, data);
  }
  return localSet(key, data);
}

/**
  Delete data for a given key.
*/
export async function deleteData(key) {
  if (isApiMode) {
    return apiSet(`/data/${key}`, null);
  }
  return dbDelete(KEYS[key]);
}

/**
  Reset all data to defaults and clear storage.
*/
export async function resetAll() {
  if (isApiMode) {
    // Let the API handle reset
    await apiSet('/data/reset', {});
    return;
  }
  await dbClearAll();
  window.dispatchEvent(new CustomEvent('desa-data-changed'));
  window.location.reload();
}

/**
  Reset only hub data to defaults.
*/
export async function resetHubData() {
  if (isApiMode) {
    await apiSet('/data/hubData', hubDataDefault);
    return;
  }
  await dbSet(KEYS.hubData, hubDataDefault);
  window.dispatchEvent(new CustomEvent('desa-data-changed', { detail: { type: 'hubData' } }));
}

/**
  Export all data as JSON files (one file per dataset).
*/
export async function exportAllData() {
  if (isApiMode) {
    // Fetch all datasets from API and download each
    const keys = ['centers', 'announcements', 'mockData', 'hubData'];
    for (const key of keys) {
      const data = await apiGet(`/data/${key}`);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${key}-data.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
    return;
  }
  return dbExportAll();
}

/**
  Import data from an uploaded JSON file.
  The file should contain all datasets or a subset.
*/
export function importJSONFile(file) {
  if (isApiMode) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target.result);
          for (const [key, value] of Object.entries(data)) {
            if (['centers', 'announcements', 'mockData', 'hubData'].includes(key)) {
              await apiSet(`/data/${key}`, value);
            }
          }
          resolve(data);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }
  return dbImportAll(file);
}

// ─── Legacy-compatible getters (for existing code) ──────────────────
export async function getCentersData() {
  return getData('centers');
}

export async function getAnnouncementsData() {
  return getData('announcements');
}

export async function getMockData() {
  return getData('mockData');
}

export async function getHubData() {
  return getData('hubData');
}

// ─── Legacy-compatible setters ───────────────────────────────────────
export async function persistCentersData(data) {
  return setData('centers', data);
}

export async function persistAnnouncementsData(data) {
  return setData('announcements', data);
}

export async function persistMockData(data) {
  return setData('mockData', data);
}

export async function persistHubData(data) {
  return setData('hubData', data);
}

// ─── Legacy-compatible JSON helpers ──────────────────────────────────
export async function downloadJSON(filename = 'desa-data.json') {
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

// ─── Public getters for public data ──────────────────────────────────
export async function getPublicCentersData() {
  const data = await getCentersData();
  if (!Array.isArray(data)) return [];
  return data.map((region) => ({
    ...region,
    programs: region.programs?.filter((p) => p.public !== false) || [],
    centers: region.centers?.filter((c) => c.public !== false) || [],
  })).filter((region) => region.centers.length > 0);
}

export async function getPublicAnnouncements() {
  const data = await getAnnouncementsData();
  return {
    ...data,
    announcements: data.announcements.filter((a) => a.public !== false),
    events: data.events?.filter((e) => e.public !== false) || [],
  };
}

export async function getPublicMockData() {
  const data = await getMockData();
  return data.filter((item) => item.public !== false);
}
