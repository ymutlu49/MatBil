import React, { useState } from 'react';
import TeacherLoginScreen from './TeacherLoginScreen';
import StudentSelectScreen from './StudentSelectScreen';
import ParentLoginScreen from './ParentLoginScreen';

/**
 * Rol Seçim Ekranı
 * İlk ekran: Öğretmen / Öğrenci / Veli
 *
 * Not: Yazar/Yönetici erişimi ayrı bir ekrandan değil, uygulama içi
 * "Ayarlar → Yönetici Paneli" üzerinden tek şifreyle yapılır. Yönetici girişi
 * aynı zamanda premium'u otomatik aktive eder.
 */
const RoleSelectScreen = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState(null);

  if (selectedRole === 'teacher') return <TeacherLoginScreen onLogin={onLogin} onBack={() => setSelectedRole(null)} />;
  if (selectedRole === 'student') return <StudentSelectScreen onLogin={onLogin} onBack={() => setSelectedRole(null)} />;
  if (selectedRole === 'parent') return <ParentLoginScreen onLogin={onLogin} onBack={() => setSelectedRole(null)} />;

  return (
    <div className="h-screen bg-gradient-to-b from-indigo-100 via-purple-50 to-pink-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">{"🧠"}</div>
          <h1 className="text-xl font-bold text-gray-800">Matematiksel Bilişin Temelleri</h1>
          <p className="text-indigo-600 font-semibold text-sm italic">Sayı Hissinden Şekil Algısına</p>
        </div>

        {/* Rol Seçimi */}
        <div className="space-y-3 mb-6">
          <button onClick={() => setSelectedRole('teacher')}
            className="w-full py-5 px-5 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-2xl shadow-xl flex items-center gap-4 hover:opacity-95 active:scale-[0.98] transition-all">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center text-3xl">{"👩‍🏫"}</div>
            <div className="text-left flex-1">
              <div className="text-lg font-bold">Öğretmen</div>
              <div className="text-xs opacity-90">Sınıf yönetimi ve raporlar</div>
            </div>
            <span className="text-white/60 text-xl">{"›"}</span>
          </button>

          <button onClick={() => setSelectedRole('student')}
            className="w-full py-5 px-5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl shadow-xl flex items-center gap-4 hover:opacity-95 active:scale-[0.98] transition-all">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center text-3xl">{"🎒"}</div>
            <div className="text-left flex-1">
              <div className="text-lg font-bold">Öğrenci</div>
              <div className="text-xs opacity-90">Oyunları oyna ve öğren</div>
            </div>
            <span className="text-white/60 text-xl">{"›"}</span>
          </button>

          <button onClick={() => setSelectedRole('parent')}
            className="w-full py-5 px-5 bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white rounded-2xl shadow-xl flex items-center gap-4 hover:opacity-95 active:scale-[0.98] transition-all">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center text-3xl">{"👨‍👩‍👧"}</div>
            <div className="text-left flex-1">
              <div className="text-lg font-bold">Veli</div>
              <div className="text-xs opacity-90">Çocuğunuzun gelişimini izleyin</div>
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
