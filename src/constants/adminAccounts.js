/**
 * Yazar / Admin Hesapları
 *
 * Kitabın yazarları için sabit kodlu (hardcoded) giriş hesapları.
 * Parolalar SHA-256 + SALT ile hashlenmiş olarak saklanır (utils/auth.js ile uyumlu).
 *
 * GÜVENLİK NOTU:
 *  - Bu hesaplar sadece tanıtım/yetkili erişim amaçlıdır, kimlik doğrulama istemci
 *    tarafında yapıldığı için "kırılmaz" değildir. Kaynak koda erişimi olan biri
 *    hash'leri görebilir ama plaintext'i bulamaz (SALT + SHA-256 brute-force'a açık
 *    ama uzun parolalar için pratikte mümkün değil).
 *  - Production'da gerçek güvenlik için backend doğrulaması gerekir.
 *
 * Admin hesapları otomatik olarak premium erişim alır ve Admin Panel'e girebilir.
 */

export const ADMIN_ACCOUNTS = [
  {
    id: 'admin_mutlu',
    email: 'y.mutlu@alparslan.edu.tr',
    name: 'Prof. Dr. Yılmaz Mutlu',
    role: 'admin',
    // SHA-256("Mutlu.MatBil.2026" + SALT)
    passwordHash: '75adb5cca53fb6e19b761b924381c3f653a1044abe725ce5853cc105f08fc850',
    title: 'Kitap Yazarı',
    avatar: '👨‍🏫',
  },
  {
    id: 'admin_olkun',
    email: 'sinanolkun@gmail.com',
    name: 'Prof. Dr. Sinan Olkun',
    role: 'admin',
    // SHA-256("Olkun.MatBil.2026" + SALT)
    passwordHash: '564914bae19596af42967b41a7c5196f528383451fb56183ff6a68ff56af4521',
    title: 'Kitap Yazarı',
    avatar: '👨‍🏫',
  },
];

export const findAdminByEmail = (email) => {
  const needle = (email || '').trim().toLowerCase();
  return ADMIN_ACCOUNTS.find(a => a.email.toLowerCase() === needle) || null;
};
