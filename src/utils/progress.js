export const getProgress = (userId) => {
  try { return JSON.parse(localStorage.getItem(`matbil_progress_${userId}`) || '{}'); } catch { return {}; }
};

export const saveProgress = (userId, data) => {
  try { localStorage.setItem(`matbil_progress_${userId}`, JSON.stringify(data)); } catch {}
};

export const getUsers = () => {
  try { return JSON.parse(localStorage.getItem('matbil_users') || '[]'); } catch { return []; }
};

export const saveUser = (user) => {
  const users = getUsers();
  if (!users.find(u => u.id === user.id)) {
    users.push(user);
    localStorage.setItem('matbil_users', JSON.stringify(users));
  }
};
