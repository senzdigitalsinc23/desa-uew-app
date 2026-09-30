const API_BASE = import.meta.env.VITE_API_BASE_URI || '/api/v1';
const DATA_SOURCE = import.meta.env.VITE_DATA_SOURCE || 'local_files';
const isApiMode = DATA_SOURCE === 'api_access';

// ─── Auth Helpers ────────────────────────────────────────────────────────────
function getAuthToken() {
  const direct = localStorage.getItem('desa_token');
  if (direct) return direct;
  try {
    const stored = localStorage.getItem('desa_user');
    if (stored) {
      const user = JSON.parse(stored);
      return user?.token || null;
    }
  } catch {}
  return null;
}

function getAuthHeaders(extra = {}) {
  const token = getAuthToken();
  const headers = { 'Content-Type': 'application/json', ...extra };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

// ─── Generic Request Helpers ─────────────────────────────────────────────────
async function apiGet(endpoint) {
  if (!isApiMode) return null;
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`API GET ${endpoint} failed: ${res.status}`);
  return res.json();
}

async function apiPost(endpoint, body) {
  if (!isApiMode) return null;
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || `API POST ${endpoint} failed: ${res.status}`);
  }
  return res.json();
}

async function apiPut(endpoint, body) {
  if (!isApiMode) return null;
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || `API PUT ${endpoint} failed: ${res.status}`);
  }
  return res.json();
}

async function apiDelete(endpoint) {
  if (!isApiMode) return null;
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`API DELETE ${endpoint} failed: ${res.status}`);
  return res.json();
}

// ─── Public Data Endpoints ───────────────────────────────────────────────────

export async function fetchRegions() {
  if (isApiMode) {
    const res = await apiGet('/desa/regions');
    return res?.data || [];
  }
  return null;
}

export async function fetchRegion(slug) {
  if (isApiMode) {
    const res = await apiGet(`/desa/regions/${slug}`);
    return res?.data || null;
  }
  return null;
}

export async function fetchStudyCenters(params = {}) {
  if (isApiMode) {
    const qs = new URLSearchParams(params).toString();
    const res = await apiGet(`/desa/study-centers${qs ? '?' + qs : ''}`);
    return res?.data || [];
  }
  return null;
}

export async function fetchStudyCenter(slug) {
  if (isApiMode) {
    const res = await apiGet(`/desa/study-centers/${slug}`);
    return res?.data || null;
  }
  return null;
}

export async function fetchCenterCoordinators(centerId) {
  if (!isApiMode) return [];
  const res = await apiGet(`/desa/centers/${centerId}/coordinators`);
  return res?.data || [];
}

export async function fetchCenterHotels(centerId) {
  if (!isApiMode) return [];
  const res = await apiGet(`/desa/centers/${centerId}/hotels`);
  return res?.data || [];
}

export async function fetchCenterHealth(centerId) {
  if (!isApiMode) return [];
  const res = await apiGet(`/desa/centers/${centerId}/health`);
  return res?.data || [];
}

export async function fetchCenterRestaurants(centerId) {
  if (!isApiMode) return [];
  const res = await apiGet(`/desa/centers/${centerId}/restaurants`);
  return res?.data || [];
}

export async function fetchPrograms(params = {}) {
  if (isApiMode) {
    const qs = new URLSearchParams(params).toString();
    const res = await apiGet(`/desa/programs${qs ? '?' + qs : ''}`);
    return res?.data || [];
  }
  return null;
}

export async function fetchAnnouncements(params = {}) {
  if (isApiMode) {
    const qs = new URLSearchParams(params).toString();
    const res = await apiGet(`/desa/announcements${qs ? '?' + qs : ''}`);
    return res?.data || [];
  }
  return null;
}

export async function fetchEvents(params = {}) {
  if (isApiMode) {
    const qs = new URLSearchParams(params).toString();
    const res = await apiGet(`/desa/events${qs ? '?' + qs : ''}`);
    return res?.data || [];
  }
  return null;
}

export async function fetchAcademics(params = {}) {
  if (isApiMode) {
    const qs = new URLSearchParams(params).toString();
    const res = await apiGet(`/desa/academics${qs ? '?' + qs : ''}`);
    return res?.data || [];
  }
  return null;
}

export async function fetchOpportunities(params = {}) {
  if (isApiMode) {
    const qs = new URLSearchParams(params).toString();
    const res = await apiGet(`/desa/opportunities${qs ? '?' + qs : ''}`);
    return res?.data || [];
  }
  return null;
}

export async function fetchSearch(query, category = '', region = '', limit = 50, offset = 0) {
  if (!isApiMode) return null;
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (category) params.set('category', category);
  if (region) params.set('region', region);
  params.set('limit', limit);
  params.set('offset', offset);
  const res = await apiGet(`/desa/search?${params.toString()}`);
  return res;
}

// ─── DESA Hub Endpoints ──────────────────────────────────────────────────────

export async function fetchHubAbout() {
  if (isApiMode) {
    const res = await apiGet('/desa/hub/about');
    return res?.data || null;
  }
  return null;
}

export async function fetchHubLeadership() {
  if (isApiMode) {
    const res = await apiGet('/desa/hub/leadership');
    return res?.data || [];
  }
  return null;
}

export async function fetchHubConstitution() {
  if (isApiMode) {
    const res = await apiGet('/desa/hub/constitution');
    return res?.data || null;
  }
  return null;
}

export async function fetchHubArchives() {
  if (isApiMode) {
    const res = await apiGet('/desa/hub/archives');
    return res?.data || [];
  }
  return null;
}

export async function fetchHubAssets() {
  if (isApiMode) {
    const res = await apiGet('/desa/hub/assets');
    return res?.data || [];
  }
  return null;
}

export async function fetchHubCommittees() {
  if (isApiMode) {
    const res = await apiGet('/desa/hub/committees');
    return res?.data || [];
  }
  return null;
}

export async function fetchHubGallery() {
  if (isApiMode) {
    const res = await apiGet('/desa/hub/gallery');
    return res?.data || [];
  }
  return null;
}

// ─── Admin Endpoints ─────────────────────────────────────────────────────────

export async function adminStats() {
  if (!isApiMode) return null;
  const res = await apiGet('/admin/desa/stats');
  return res?.data || null;
}

// Regions
export async function adminListRegions() {
  if (!isApiMode) return null;
  const res = await apiGet('/admin/desa/regions');
  return res?.data || [];
}
export async function adminCreateRegion(data) {
  if (!isApiMode) return null;
  return apiPost('/admin/desa/regions', data);
}
export async function adminUpdateRegion(id, data) {
  if (!isApiMode) return null;
  return apiPut(`/admin/desa/regions/${id}`, data);
}
export async function adminDeleteRegion(id) {
  if (!isApiMode) return null;
  return apiDelete(`/admin/desa/regions/${id}`);
}

// Centers
export async function adminListCenters(params = {}) {
  if (!isApiMode) return null;
  const qs = new URLSearchParams(params).toString();
  const res = await apiGet(`/admin/desa/centers${qs ? '?' + qs : ''}`);
  return res?.data || [];
}
export async function adminCreateCenter(data) {
  if (!isApiMode) return null;
  return apiPost('/admin/desa/centers', data);
}
export async function adminUpdateCenter(id, data) {
  if (!isApiMode) return null;
  return apiPut(`/admin/desa/centers/${id}`, data);
}
export async function adminDeleteCenter(id) {
  if (!isApiMode) return null;
  return apiDelete(`/admin/desa/centers/${id}`);
}
export async function adminLinkCoordinator(centerId, data) {
  if (!isApiMode) return null;
  return apiPost(`/admin/desa/centers/${centerId}/link-coordinator`, data);
}

// Programs
export async function adminListPrograms(params = {}) {
  if (!isApiMode) return null;
  const qs = new URLSearchParams(params).toString();
  const res = await apiGet(`/admin/desa/programs${qs ? '?' + qs : ''}`);
  return res?.data || [];
}
export async function adminCreateProgram(data) {
  if (!isApiMode) return null;
  return apiPost('/admin/desa/programs', data);
}
export async function adminUpdateProgram(id, data) {
  if (!isApiMode) return null;
  return apiPut(`/admin/desa/programs/${id}`, data);
}
export async function adminDeleteProgram(id) {
  if (!isApiMode) return null;
  return apiDelete(`/admin/desa/programs/${id}`);
}

// Coordinators
export async function adminListCoordinators() {
  if (!isApiMode) return null;
  const res = await apiGet('/admin/desa/coordinators');
  return res?.data || [];
}
export async function adminCreateCoordinator(data) {
  if (!isApiMode) return null;
  return apiPost('/admin/desa/coordinators', data);
}
export async function adminUpdateCoordinator(id, data) {
  if (!isApiMode) return null;
  return apiPut(`/admin/desa/coordinators/${id}`, data);
}
export async function adminDeleteCoordinator(id) {
  if (!isApiMode) return null;
  return apiDelete(`/admin/desa/coordinators/${id}`);
}

// Hotels
export async function adminListHotels() {
  if (!isApiMode) return null;
  const res = await apiGet('/admin/desa/hotels');
  return res?.data || [];
}
export async function adminCreateHotel(data) {
  if (!isApiMode) return null;
  return apiPost('/admin/desa/hotels', data);
}
export async function adminUpdateHotel(id, data) {
  if (!isApiMode) return null;
  return apiPut(`/admin/desa/hotels/${id}`, data);
}
export async function adminDeleteHotel(id) {
  if (!isApiMode) return null;
  return apiDelete(`/admin/desa/hotels/${id}`);
}
export async function adminLinkHotelToCenter(hotelId, centerId) {
  if (!isApiMode) return null;
  return apiPost(`/admin/desa/hotels/${hotelId}/link-center`, { center_id: centerId });
}
export async function adminUnlinkHotelFromCenter(hotelId, centerId) {
  if (!isApiMode) return null;
  return apiDelete(`/admin/desa/hotels/${hotelId}/centers/${centerId}`);
}
export async function adminGetHotelCenters(hotelId) {
  if (!isApiMode) return [];
  const res = await apiGet(`/admin/desa/hotels/${hotelId}/centers`);
  return res?.data || [];
}

// Health
export async function adminListHealth() {
  if (!isApiMode) return null;
  const res = await apiGet('/admin/desa/health');
  return res?.data || [];
}
export async function adminCreateHealth(data) {
  if (!isApiMode) return null;
  return apiPost('/admin/desa/health', data);
}
export async function adminUpdateHealth(id, data) {
  if (!isApiMode) return null;
  return apiPut(`/admin/desa/health/${id}`, data);
}
export async function adminDeleteHealth(id) {
  if (!isApiMode) return null;
  return apiDelete(`/admin/desa/health/${id}`);
}
export async function adminLinkHealthToCenter(facilityId, centerId) {
  if (!isApiMode) return null;
  return apiPost(`/admin/desa/health/${facilityId}/link-center`, { center_id: centerId });
}
export async function adminUnlinkHealthFromCenter(facilityId, centerId) {
  if (!isApiMode) return null;
  return apiDelete(`/admin/desa/health/${facilityId}/centers/${centerId}`);
}
export async function adminGetHealthCenters(facilityId) {
  if (!isApiMode) return [];
  const res = await apiGet(`/admin/desa/health/${facilityId}/centers`);
  return res?.data || [];
}

// Restaurants
export async function adminListRestaurants() {
  if (!isApiMode) return null;
  const res = await apiGet('/admin/desa/restaurants');
  return res?.data || [];
}
export async function adminCreateRestaurant(data) {
  if (!isApiMode) return null;
  return apiPost('/admin/desa/restaurants', data);
}
export async function adminUpdateRestaurant(id, data) {
  if (!isApiMode) return null;
  return apiPut(`/admin/desa/restaurants/${id}`, data);
}
export async function adminDeleteRestaurant(id) {
  if (!isApiMode) return null;
  return apiDelete(`/admin/desa/restaurants/${id}`);
}
export async function adminLinkRestaurantToCenter(restaurantId, centerId) {
  if (!isApiMode) return null;
  return apiPost(`/admin/desa/restaurants/${restaurantId}/link-center`, { center_id: centerId });
}
export async function adminUnlinkRestaurantFromCenter(restaurantId, centerId) {
  if (!isApiMode) return null;
  return apiDelete(`/admin/desa/restaurants/${restaurantId}/centers/${centerId}`);
}
export async function adminGetRestaurantCenters(restaurantId) {
  if (!isApiMode) return [];
  const res = await apiGet(`/admin/desa/restaurants/${restaurantId}/centers`);
  return res?.data || [];
}

// Announcements
export async function adminListAnnouncements(params = {}) {
  if (!isApiMode) return null;
  const qs = new URLSearchParams(params).toString();
  const res = await apiGet(`/admin/desa/announcements${qs ? '?' + qs : ''}`);
  return res?.data || [];
}
export async function adminCreateAnnouncement(data) {
  if (!isApiMode) return null;
  return apiPost('/admin/desa/announcements', data);
}
export async function adminUpdateAnnouncement(id, data) {
  if (!isApiMode) return null;
  return apiPut(`/admin/desa/announcements/${id}`, data);
}
export async function adminDeleteAnnouncement(id) {
  if (!isApiMode) return null;
  return apiDelete(`/admin/desa/announcements/${id}`);
}

// Events
export async function adminListEvents(params = {}) {
  if (!isApiMode) return null;
  const qs = new URLSearchParams(params).toString();
  const res = await apiGet(`/admin/desa/events${qs ? '?' + qs : ''}`);
  return res?.data || [];
}
export async function adminCreateEvent(data) {
  if (!isApiMode) return null;
  return apiPost('/admin/desa/events', data);
}
export async function adminUpdateEvent(id, data) {
  if (!isApiMode) return null;
  return apiPut(`/admin/desa/events/${id}`, data);
}
export async function adminDeleteEvent(id) {
  if (!isApiMode) return null;
  return apiDelete(`/admin/desa/events/${id}`);
}

// Hub About
export async function adminGetHubAbout() {
  if (!isApiMode) return null;
  const res = await apiGet('/admin/desa/hub/about');
  return res?.data || null;
}
export async function adminUpdateHubAbout(data) {
  if (!isApiMode) return null;
  return apiPut('/admin/desa/hub/about', data);
}

// Hub Leadership
export async function adminListHubLeadership() {
  if (!isApiMode) return null;
  const res = await apiGet('/admin/desa/hub/leadership');
  return res?.data || [];
}
export async function adminCreateHubLeadership(data) {
  if (!isApiMode) return null;
  return apiPost('/admin/desa/hub/leadership', data);
}
export async function adminUpdateHubLeadership(id, data) {
  if (!isApiMode) return null;
  return apiPut(`/admin/desa/hub/leadership/${id}`, data);
}
export async function adminDeleteHubLeadership(id) {
  if (!isApiMode) return null;
  return apiDelete(`/admin/desa/hub/leadership/${id}`);
}

// Hub Constitution
export async function adminGetHubConstitution() {
  if (!isApiMode) return null;
  const res = await apiGet('/admin/desa/hub/constitution');
  return res?.data || null;
}
export async function adminCreateHubConstitution(data) {
  if (!isApiMode) return null;
  return apiPost('/admin/desa/hub/constitution', data);
}

// Hub Archives
export async function adminListHubArchives() {
  if (!isApiMode) return null;
  const res = await apiGet('/admin/desa/hub/archives');
  return res?.data || [];
}
export async function adminCreateHubArchive(data) {
  if (!isApiMode) return null;
  return apiPost('/admin/desa/hub/archives', data);
}
export async function adminUpdateHubArchive(id, data) {
  if (!isApiMode) return null;
  return apiPut(`/admin/desa/hub/archives/${id}`, data);
}
export async function adminDeleteHubArchive(id) {
  if (!isApiMode) return null;
  return apiDelete(`/admin/desa/hub/archives/${id}`);
}

// Hub Assets
export async function adminListHubAssets() {
  if (!isApiMode) return null;
  const res = await apiGet('/admin/desa/hub/assets');
  return res?.data || [];
}
export async function adminCreateHubAsset(data) {
  if (!isApiMode) return null;
  return apiPost('/admin/desa/hub/assets', data);
}
export async function adminUpdateHubAsset(id, data) {
  if (!isApiMode) return null;
  return apiPut(`/admin/desa/hub/assets/${id}`, data);
}
export async function adminDeleteHubAsset(id) {
  if (!isApiMode) return null;
  return apiDelete(`/admin/desa/hub/assets/${id}`);
}

// Hub Committees
export async function adminListHubCommittees() {
  if (!isApiMode) return null;
  const res = await apiGet('/admin/desa/hub/committees');
  return res?.data || [];
}
export async function adminCreateHubCommittee(data) {
  if (!isApiMode) return null;
  return apiPost('/admin/desa/hub/committees', data);
}
export async function adminUpdateHubCommittee(id, data) {
  if (!isApiMode) return null;
  return apiPut(`/admin/desa/hub/committees/${id}`, data);
}
export async function adminDeleteHubCommittee(id) {
  if (!isApiMode) return null;
  return apiDelete(`/admin/desa/hub/committees/${id}`);
}

// Hub Gallery
export async function adminListHubGallery() {
  if (!isApiMode) return null;
  const res = await apiGet('/admin/desa/hub/gallery');
  return res?.data || [];
}
export async function adminCreateHubGalleryImage(data) {
  if (!isApiMode) return null;
  return apiPost('/admin/desa/hub/gallery', data);
}
export async function adminUpdateHubGalleryImage(id, data) {
  if (!isApiMode) return null;
  return apiPut(`/admin/desa/hub/gallery/${id}`, data);
}
export async function adminDeleteHubGalleryImage(id) {
  if (!isApiMode) return null;
  return apiDelete(`/admin/desa/hub/gallery/${id}`);
}

// Academics
export async function adminListAcademics(params = {}) {
  if (!isApiMode) return null;
  const qs = new URLSearchParams(params).toString();
  const res = await apiGet(`/admin/desa/academics${qs ? '?' + qs : ''}`);
  return res?.data || [];
}
export async function adminCreateAcademic(data) {
  if (!isApiMode) return null;
  return apiPost('/admin/desa/academics', data);
}
export async function adminUpdateAcademic(id, data) {
  if (!isApiMode) return null;
  return apiPut(`/admin/desa/academics/${id}`, data);
}
export async function adminDeleteAcademic(id) {
  if (!isApiMode) return null;
  return apiDelete(`/admin/desa/academics/${id}`);
}

// Opportunities
export async function adminListOpportunities(params = {}) {
  if (!isApiMode) return null;
  const qs = new URLSearchParams(params).toString();
  const res = await apiGet(`/admin/desa/opportunities${qs ? '?' + qs : ''}`);
  return res?.data || [];
}
export async function adminCreateOpportunity(data) {
  if (!isApiMode) return null;
  return apiPost('/admin/desa/opportunities', data);
}
export async function adminUpdateOpportunity(id, data) {
  if (!isApiMode) return null;
  return apiPut(`/admin/desa/opportunities/${id}`, data);
}

// ─── File Upload Endpoints ───────────────────────────────────────────────

export async function uploadFile(file, category = 'general', description = '') {
  if (!isApiMode) return null;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', category);
  formData.append('description', description);
  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return res.json();
}

export async function listMediaFiles(params = {}) {
  if (!isApiMode) return [];
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/media${qs ? '?' + qs : ''}`, {
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`List media failed: ${res.status}`);
  const json = await res.json();
  return json?.data || [];
}

export async function deleteMediaFile(id) {
  if (!isApiMode) return null;
  const res = await fetch(`${API_BASE}/media/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`Delete media failed: ${res.status}`);
  return res.json();
}
export async function adminDeleteOpportunity(id) {
  if (!isApiMode) return null;
  return apiDelete(`/admin/desa/opportunities/${id}`);
}
