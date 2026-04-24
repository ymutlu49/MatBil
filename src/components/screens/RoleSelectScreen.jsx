import React, { useState } from 'react';
import TeacherLoginScreen from './TeacherLoginScreen';
import StudentSelectScreen from './StudentSelectScreen';
import ParentLoginScreen from './ParentLoginScreen';
import AdminLoginScreen from './AdminLoginScreen';

/**
 * Rol Seçim Ekranı
 * Dört giriş kapısı: Öğretmen / Öğrenci / Veli / Yazar (Yönetici)
 *
 * Yazar/Yönetici girişi tek şifre ile, başarılı girişte premium otomatik aktif.
 */
const RoleSelectScreen = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState(null);

  if (selectedRole === 'teacher') return <TeacherLoginScreen onLogin={onLogin} onBack={() => setSelectedRole(null)} />;
  if (selectedRole === 'student') return <StudentSelectScreen onLogin={onLogin} onBack={() => setSelectedRole(null)} />;
  if (selectedRole === 'parent') return <ParentLoginScreen onLogin={onLogin} onBack={() => setSelectedRole(null)} />;
  if (selectedRole === 'admin') return <AdminLoginScreen onLogin={onLogin} onBack={() => setSelectedRole(null)} />;

  return (
    <div className="h-screen bg-gradient-to-b from-indigo-100 via-purple-50 to-pink-50 flex flex-col items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-sm py-4">
        {/* Logo */}
        <div className="text-center mb-5">
          <div className="text-5xl mb-2">{"🧠"}</div>
          <h1 className="text-xl font-bold text-gray-800">Matematiksel Bilişin Temelleri</h1>
          <p className="text-indigo-600 font-semibold text-sm italic">Sayı Hissinden Şekil Algısına</p>
        </div>

        {/* Rol Seçimi */}
        <div className="space-y-2.5 mb-5">
          <button onClick={() => setSelectedRole('teacher')}
            className="w-full py-4 px-4 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-2xl shadow-xl flex items-center gap-3 hover:opacity-95 active:scale-[0.98] transition-all">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl shrink-0">{"👩‍🏫"}</div>
            <div className="text-left flex-1">
              <div className="text-base font-bold">Öğretmen</div>
              <div className="text-[11px] opacity-90">Sınıf yönetimi ve raporlar</div>
            </div>
            <span className="text-white/60 text-xl">{"›"}</span>
          </button>

          <button onClick={() => setSelectedRole('student')}
            className="w-full py-4 px-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl shadow-xl flex items-center gap-3 hover:opacity-95 active:scale-[0.98] transition-all">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl shrink-0">{"🎒"}</div>
            <div className="text-left flex-1">
              <div className="text-base font-bold">Öğrenci</div>
              <div className="text-[11px] opacity-90">Oyunları oyna ve öğren</div>
            </div>
            <span className="text-white/60 text-xl">{"›"}</span>
          </button>

          <button onClick={() => setSelectedRole('parent')}
            className="w-full py-4 px-4 bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white rounded-2xl shadow-xl flex items-center gap-3 hover:opacity-95 active:scale-[0.98] transition-all">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl shrink-0">{"👨‍👩‍👧"}</div>
            <div className="text-left flex-1">
              <div className="text-base font-bold">Veli</div>
              <div className="text-[11px] opacity-90">Çocuğunuzun gelişimini izleyin</div>
            </div>
            <span className="text-white/60 text-xl">{"›"}</span>
          </button>

          <button onClick={() => setSelectedRole('admin')}
            className="w-full py-4 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl shadow-xl flex items-center gap-3 hover:opacity-95 active:scale-[0.98] transition-all">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl shrink-0">{"👨‍🏫"}</div>
            <div className="text-left flex-1">
              <div className="text-base font-bold">Yazar / Yönetici</div>
              <div className="text-[11px] opacity-90">Akademik panel ve premium erişim</div>
            </div>
            <span className="text-white/60 text-xl">{"›"}</span>
          </button>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-[10px] text-gray-400">Prof. Dr. Yılmaz Mutlu {"\u2022"} Prof. Dr. Sinan Olkun</p>
          <p className="text-[10px] text-gray-300 mt-0.5">v16.1 {"\u2022"} 35 Oyun {"\u2022"} 6 Kategori</p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectScreen;
