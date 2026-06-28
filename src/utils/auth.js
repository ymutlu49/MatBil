/**
 * Kimlik Doğrulama ve Yetkilendirme Modülü
 *
 * Rol bazlı yerel giriş sistemi:
 * - Öğretmen: PIN ile giriş, sınıf yönetimi
 * - Öğrenci: Listeden seçerek giriş (şifresiz)
 * - Veli: PIN ile giriş, salt okunur erişim
 *
 * Güvenlik: SHA-256 hash (Web Crypto API), tamamen offline
 */

const SALT = 'matbil_pin_salt_2026';

// ─── ID Üretimi ───
export const generateId = (prefix = 'user') => {
  const arr = new Uint8Array(4);
  crypto.getRandomValues(arr);
  const hex = Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
  return `${prefix}_${hex}`;
};

// ─── PIN Hashing (SHA-256) ───
export const hashPin = async (pin) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin + SALT);
  const buffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
};

export const verifyPin = async (pin, storedHash) => {
  const hash = await hashPin(pin);
  return hash === storedHash;
};

// ─── Öğretmen CRUD ───
export const getTeachers = () => {
  try { return JSON.parse(localStorage.getItem('matbil_auth_teachers') || '[]'); }
  catch { return []; }
};

export const saveTeacher = (teacher) => {
  const teachers = getTeachers();
  const idx = teachers.findIndex(t => t.id === teacher.id);
  if (idx >= 0) teachers[idx] = teacher;
  else teachers.push(teacher);
  localStorage.setItem('matbil_auth_teachers', JSON.stringify(teachers));
};

export const removeTeacher = (id) => {
  const teachers = getTeachers().filter(t => t.id !== id);
  localStorage.setItem('matbil_auth_teachers', JSON.stringify(teachers));
};

// ─── Veli CRUD ───
export const getParents = () => {
  try { return JSON.parse(localStorage.getItem('matbil_auth_parents') || '[]'); }
  catch { return []; }
};

export const saveParent = (parent) => {
  const parents = getParents();
  const idx = parents.findIndex(p => p.id === parent.id);
  if (idx >= 0) parents[idx] = parent;
  else parents.push(parent);
  localStorage.setItem('matbil_auth_parents', JSON.stringify(parents));
};

// ─── Sınıf CRUD ───
export const getClasses = () => {
  try { return JSON.parse(localStorage.getItem('matbil_classes') || '[]'); }
  catch { return []; }
};

export const saveClass = (cls) => {
  const classes = getClasses();
  const idx = classes.findIndex(c => c.id === cls.id);
  if (idx >= 0) classes[idx] = cls;
  else classes.push(cls);
  localStorage.setItem('matbil_classes', JSON.stringify(classes));
};

export const removeClass = (id) => {
  const classes = getClasses().filter(c => c.id !== id);
  localStorage.setItem('matbil_classes', JSON.stringify(classes));
};

// ─── Öğrenci-Sınıf İlişkisi ───
export const getClassStudents = (classId) => {
  try {
    const users = JSON.parse(localStorage.getItem('matbil_users') || '[]');
    return users.filter(u => u.classId === classId);
  } catch { return []; }
};

export const getAllStudents = () => {
  try {
    const users = JSON.parse(localStorage.getItem('matbil_users') || '[]');
    return users.filter(u => !u.role || u.role === 'student');
  } catch { return []; }
};

export const addStudentToClass = (classId, studentData) => {
  const users = JSON.parse(localStorage.getItem('matbil_users') || '[]');
  const student = {
    ...studentData,
    id: studentData.id || generateId('student'),
    role: 'student',
    classId,
    loginAt: new Date().toISOString(),
  };
  // Aynı ID varsa güncelle
  const idx = users.findIndex(u => u.id === student.id);
  if (idx >= 0) users[idx] = { ...users[idx], ...student };
  else users.push(student);
  localStorage.setItem('matbil_users', JSON.stringify(users));

  // Sınıfa öğrenci ID'si ekle
  const classes = getClasses();
  const cls = classes.find(c => c.id === classId);
  if (cls && !cls.studentIds.includes(student.id)) {
    cls.studentIds.push(student.id);
    saveClass(cls);
  }
  return student;
};

export const removeStudentFromClass = (classId, studentId) => {
  // Sınıftan çıkar
  const classes = getClasses();
  const cls = classes.find(c => c.id === classId);
  if (cls) {
    cls.studentIds = cls.studentIds.filter(id => id !== studentId);
    saveClass(cls);
  }
  // Kullanıcıdan sınıf bilgisini kaldır
  const users = JSON.parse(localStorage.getItem('matbil_users') || '[]');
  const user = users.find(u => u.id === studentId);
  if (user) {
    user.classId = null;
    localStorage.setItem('matbil_users', JSON.stringify(users));
  }
};

// ─── Veli-Öğrenci Bağlantısı ───
export const linkParentToStudent = (parentId, studentId) => {
  const parents = getParents();
  const parent = parents.find(p => p.id === parentId);
  if (parent && !parent.childIds.includes(studentId)) {
    parent.childIds.push(studentId);
    saveParent(parent);
  }
};

export const getParentChildren = (parentId) => {
  const parent = getParents().find(p => p.id === parentId);
  if (!parent) return [];
  const users = JSON.parse(localStorage.getItem('matbil_users') || '[]');
  return users.filter(u => parent.childIds.includes(u.id));
};

// ─── Öğretmen PIN Değiştirme ───
export const changeTeacherPin = async (teacherId, newPin) => {
  const teachers = getTeachers();
  const teacher = teachers.find(t => t.id === teacherId);
  if (!teacher) return false;
  teacher.pinHash = await hashPin(newPin);
  saveTeacher(teacher);
  return true;
};

// ─── Mevcut Veri Göçü ───
export const migrateExistingUsers = () => {
  try {
    if (localStorage.getItem('matbil_auth_migrated')) return;
    const users = JSON.parse(localStorage.getItem('matbil_users') || '[]');
    let changed = false;
    users.forEach(u => {
      if (!u.role) {
        u.role = 'student';
        changed = true;
      }
    });
    if (changed) {
      localStorage.setItem('matbil_users', JSON.stringify(users));
    }
    localStorage.setItem('matbil_auth_migrated', '1');
  } catch {}
};

// ─── Basit Mod: Öğrenci Profilleri ───
// Kod girişinden sonra rol seçtirmeden doğrudan oyuna almak için kullanılır.
// Profiller matbil_users içinde isDefault:true ile işaretlenir (en fazla 3 — kardeşler için).
// İlerleme her profilin kendi id'sine bağlanır. `named:false` → henüz isim sorulmadı.
export const DEFAULT_LEARNER_NAME = 'Kâşif';
export const SIMPLE_PROFILE_LIMIT = 3;

export const getSimpleProfiles = () => {
  try {
    const users = JSON.parse(localStorage.getItem('matbil_users') || '[]');
    return users.filter(u => u.isDefault && (u.role === 'student' || !u.role));
  } catch { return []; }
};

export const getOrCreateDefaultLearner = () => {
  try {
    const existing = getSimpleProfiles();
    if (existing.length) return existing[0];
    const users = JSON.parse(localStorage.getItem('matbil_users') || '[]');
    const learner = {
      id: generateId('student'),
      name: DEFAULT_LEARNER_NAME,
      role: 'student',
      isDefault: true,
      named: false,
      loginAt: new Date().toISOString(),
    };
    users.push(learner);
    localStorage.setItem('matbil_users', JSON.stringify(users));
    return learner;
  } catch {
    return { id: 'student_default', name: DEFAULT_LEARNER_NAME, role: 'student', isDefault: true, named: false };
  }
};

export const createSimpleProfile = (name) => {
  try {
    const users = JSON.parse(localStorage.getItem('matbil_users') || '[]');
    if (users.filter(u => u.isDefault).length >= SIMPLE_PROFILE_LIMIT) return null;
    const learner = {
      id: generateId('student'),
      name: (name || '').trim().slice(0, 20) || DEFAULT_LEARNER_NAME,
      role: 'student',
      isDefault: true,
      named: true,
      loginAt: new Date().toISOString(),
    };
    users.push(learner);
    localStorage.setItem('matbil_users', JSON.stringify(users));
    return learner;
  } catch { return null; }
};

export const renameLearner = (id, name) => {
  const clean = (name || '').trim().slice(0, 20);
  if (!clean) return null;
  try {
    const users = JSON.parse(localStorage.getItem('matbil_users') || '[]');
    const u = users.find(x => x.id === id);
    if (!u) return null;
    u.name = clean;
    u.named = true;
    localStorage.setItem('matbil_users', JSON.stringify(users));
    const cur = JSON.parse(localStorage.getItem('matbil_current_user') || 'null');
    if (cur && cur.id === id) {
      cur.name = clean; cur.named = true;
      localStorage.setItem('matbil_current_user', JSON.stringify(cur));
    }
    return u;
  } catch { return null; }
};

// İsim sorusunu atlamak için: profili "isimlendi" işaretle (adı değiştirmeden).
export const markLearnerNamed = (id) => {
  try {
    const users = JSON.parse(localStorage.getItem('matbil_users') || '[]');
    const u = users.find(x => x.id === id);
    if (u && !u.named) { u.named = true; localStorage.setItem('matbil_users', JSON.stringify(users)); }
    const cur = JSON.parse(localStorage.getItem('matbil_current_user') || 'null');
    if (cur && cur.id === id && !cur.named) { cur.named = true; localStorage.setItem('matbil_current_user', JSON.stringify(cur)); }
  } catch {}
};
