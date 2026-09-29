import users from './users.json';

const API_BASE = import.meta.env.VITE_API_BASE_URI || '';
const isApiMode = import.meta.env.VITE_DATA_SOURCE === 'api_access';

// ─── Local validation (fallback when no API) ────────────────────────────────

export function getUserByEmail(email) {
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function validateLoginLocal(email, password) {
  const user = getUserByEmail(email);
  if (!user) return { success: false, message: 'Invalid email or password' };
  if (user.password !== password) {
    return { success: false, message: 'Invalid email or password' };
  }
  return { success: true, user };
}

// ─── API-based login ─────────────────────────────────────────────────────────

export async function apiLogin(email, password) {
  if (!isApiMode) return null;
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    return { success: false, message: data?.message || 'Login failed' };
  }
  return { success: true, user: data.data?.user, token: data.data?.token, refreshToken: data.data?.refresh_token };
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function validateLogin(email, password) {
  // Try API first in api_access mode
  if (isApiMode) {
    const result = await apiLogin(email, password);
    if (result) return result;
  }
  // Fallback to local validation
  return validateLoginLocal(email, password);
}

export function getAllUsers() {
  return users;
}

export function addUser(newUser) {
  const exists = getUserByEmail(newUser.email);
  if (exists) return { success: false, message: 'Email already exists' };
  const user = { ...newUser, id: `staff-${Date.now()}`, createdAt: new Date().toISOString().split('T')[0] };
  users.push(user);
  return { success: true, user };
}

export function updateUser(id, updates) {
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return { success: false, message: 'User not found' };
  users[index] = { ...users[index], ...updates };
  return { success: true, user: users[index] };
}

export function deleteUser(id) {
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return { success: false, message: 'User not found' };
  users.splice(index, 1);
  return { success: true };
}
