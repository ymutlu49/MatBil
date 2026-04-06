import React, { useState, useEffect } from 'react';
import { getClasses, getClassStudents, getAllStudents } from '../../utils/auth';
import { getAvatar, AVATARS } from '../../utils/avatar';

/**
 * Öğrenci Giriş Ekranı
 * Çocuk dostu: Sınıf seç → İsmine dokun → Giriş
 * Şifre gerektirmez (küçük çocuklar için)
 */
const StudentSelectScreen = ({ onLogin, onBack }) => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [showLegacy, setShowLegacy] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');

  useEffect(() => {
    const c = getClasses();
    setClasses(c);
    // Tek sınıf varsa direkt aç
    if (c.length === 1) {
      setSelectedClass(c[0]);
      setStudents(getClassStudents(c[0].id));
    }
  }, []);

  const selectClass = (cls) => {
    setSelectedClass(cls);
    setStudents(getClassStudents(cls.id));
  };

  const selectStudent = (student) => {
    onLogin({ ...student, role: 'student', loginAt: new Date().toISOString() });
  };

  const handleLegacyLogin = () => {
    if (!name.trim()) return;
    const id = name.trim().toLowerCase().replace(/\s+/g, '_') + (age ? `_${age}` : '');
    const user = { id, name: name.trim(), age: age.trim(), role: 'student', loginAt: new Date().toISOString() };
    // Kullanıcı listesine ekle
    try {
      const users = JSON.parse(localStorage.getItem('matbil_users') || '[]');
      if (!users.find(u => u.id === user.id)) users.push(user);
      localStorage.setItem('matbil_users', JSON.stringify(users));
    } catch {}
    onLogin(user);
  };

  const getStudentAvatar = (studentId) => {
    const avatarId = getAvatar(studentId);
    const av = AVATARS.find(a => a.id === avatarId);
    return av ? av.emoji : null;
  };

  // Sınıf yoksa veya legacy mod
  if (classes.length === 0 || showLegacy) {
    return (
      <div className="h-screen bg-gradient-to-b from-emerald-100 via-green-50 to-emerald-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl shadow-xl p-5">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">{"🎒"}</div>
              <h2 className="text-xl font-bold text-gray-800">Öğrenci Girişi</h2>
              {classes.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">Henüz sınıf oluşturulmamış. Adınla giriş yap!</p>
              )}
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Adın Soyadın</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base focus:border-emerald-400 focus:outline-none" placeholder="Adını yaz..." />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Yaşın</label>
                <input type="number" value={age} onChange={e => setAge(e.target.value)} min="4" max="18"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base focus:border-emerald-400 focus:outline-none" placeholder="Örn: 7"
                  onKeyDown={e => e.key === 'Enter' && handleLegacyLogin()} />
              </div>
              <button onClick={handleLegacyLogin} disabled={!name.trim()}
                className={`w-full py-3.5 rounded-xl font-bold text-base shadow-lg transition-all ${name.trim() ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:opacity-90 active:scale-[0.98]' : 'bg-gray-200 text-gray-400'}`}>
                {"🚀"} Başla
              </button>
            </div>
          </div>
          <button onClick={onBack} className="w-full mt-3 py-3 text-gray-500 font-medium text-sm hover:text-gray-700">
            {"←"} Rol Seçimine Dön
          </button>
        </div>
      </div>
    );
  }

  // Sınıf seçimi (birden fazla sınıf varsa)
  if (!selectedClass) {
    return (
      <div className="h-screen bg-gradient-to-b from-emerald-100 via-green-50 to-emerald-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-5">
            <div className="text-4xl mb-2">{"🏫"}</div>
            <h2 className="text-xl font-bold text-gray-800">Sınıfını Seç</h2>
          </div>
          <div className="space-y-3">
            {classes.map(cls => (
              <button key={cls.id} onClick={() => selectClass(cls)}
                className="w-full py-4 px-5 bg-white rounded-2xl shadow-lg flex items-center gap-4 hover:shadow-xl active:scale-[0.98] transition-all border-2 border-emerald-100">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                  {cls.name.charAt(0)}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-bold text-gray-800">{cls.name}</div>
                  <div className="text-xs text-gray-500">{cls.studentIds?.length || 0} öğrenci</div>
                </div>
                <span className="text-gray-300 text-xl">{"›"}</span>
              </button>
            ))}
          </div>
          <button onClick={() => setShowLegacy(true)} className="w-full mt-4 py-2 text-emerald-600 text-sm font-medium hover:text-emerald-700">
            Listede sınıfım yok
          </button>
          <button onClick={onBack} className="w-full mt-1 py-2 text-gray-500 text-sm font-medium hover:text-gray-700">
            {"←"} Rol Seçimine Dön
          </button>
        </div>
      </div>
    );
  }

  // Öğrenci seçimi (ismine dokun)
  return (
    <div className="h-screen bg-gradient-to-b from-emerald-100 via-green-50 to-emerald-50 flex flex-col p-4 overflow-hidden">
      <div className="w-full max-w-sm mx-auto flex flex-col flex-1 min-h-0">
        {/* Başlık */}
        <div className="text-center mb-4 shrink-0">
          <div className="text-3xl mb-1">{"🎒"}</div>
          <h2 className="text-lg font-bold text-gray-800">{selectedClass.name}</h2>
          <p className="text-xs text-gray-500">Adına dokun!</p>
        </div>

        {/* Öğrenci Listesi */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="grid grid-cols-2 gap-2.5 pb-4">
            {students.map(s => {
              const avatar = getStudentAvatar(s.id);
              return (
                <button key={s.id} onClick={() => selectStudent(s)}
                  className="py-4 px-3 bg-white rounded-2xl shadow-md flex flex-col items-center gap-2 hover:shadow-xl active:scale-95 transition-all border-2 border-emerald-100 hover:border-emerald-300">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md">
                    {avatar || s.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="font-bold text-gray-800 text-sm text-center leading-tight">{s.name}</div>
                  {s.age && <div className="text-[10px] text-gray-400">{s.age} yaş</div>}
                </button>
              );
            })}
          </div>
          {students.length === 0 && (
            <div className="text-center py-8">
              <div className="text-3xl mb-2">{"📭"}</div>
              <div className="text-gray-500 text-sm">Bu sınıfta henüz öğrenci yok.</div>
              <div className="text-gray-400 text-xs mt-1">Öğretmeninizden sizi eklemesini isteyin.</div>
            </div>
          )}
        </div>

        {/* Alt Butonlar */}
        <div className="shrink-0 pt-2 space-y-1">
          {classes.length > 1 && (
            <button onClick={() => { setSelectedClass(null); setStudents([]); }}
              className="w-full py-2.5 text-emerald-600 text-sm font-medium hover:text-emerald-700 bg-emerald-50 rounded-xl">
              {"🏫"} Sınıf Değiştir
            </button>
          )}
          <button onClick={() => setShowLegacy(true)} className="w-full py-2 text-gray-500 text-xs font-medium hover:text-gray-700">
            Listede adım yok
          </button>
          <button onClick={onBack} className="w-full py-2 text-gray-400 text-xs font-medium hover:text-gray-600">
            {"←"} Geri
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentSelectScreen;
