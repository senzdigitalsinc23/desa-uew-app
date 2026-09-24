import users from './users.json';

export function getUserByEmail(email) {
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function validateLogin(email, password) {
  const user = getUserByEmail(email);
  if (!user) return { success: false, message: 'Invalid email or password' };
  if (user.password !== password) {
    return { success: false, message: 'Invalid email or password' };
  }
  return { success: true, user };
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
