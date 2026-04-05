import React, { useState, useEffect } from 'react';
import { getUsers, saveUser } from '../../utils';

const LoginScreen = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [age, setAge] = useState('');
  const [savedUsers, setSavedUsers] = useState([]);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => { setSavedUsers(getUsers()); }, []);

  const handleLogin = () => {
    if (!name.trim()) return;
    const id = name.trim().toLowerCase().replace(/\s+/g, '_') + (age ? `_${age}` : '');
    const user = { id, name: name.trim(), city: city.trim(), age: age.trim(), loginAt: new Date().toISOString() };
    saveUser(user);
    onLogin(user);
  };

  const handleQuickLogin = (user) => {
    onLogin({ ...user, loginAt: new Date().toISOString() });
  };

  return (
    <div className="h-screen bg-gradient-to-b from-indigo-100 via-purple-50 to-pink-50 flex flex-col items-center justify-center p-3 overflow-hidden">
      <div className="w-full max-w-sm">
        {/* Logo ve Başlık */}
        <div className="text-center mb-3">
          <div className="text-4xl mb-1">🧠</div>
          <h1 className="text-xl font-bold text-gray-800 leading-tight">Matematiksel Bilişin Temelleri</h1>
          <p className="text-indigo-600 font-semibold text-sm italic">Sayı Hissinden Şekil Algısına</p>
        </div>

        {/* Giriş Formu */}
        <div className="bg-white rounded-2xl shadow-xl p-4 mb-3">
          <h2 className="text-base font-bold text-gray-700 mb-3 text-center">👋 Hoş Geldin!</h2>
          <div className="space-y-2">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-0.5 block">Adın Soyadın</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-base focus:border-indigo-400 focus:outline-none transition-colors" placeholder="Adını yaz..." />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs font-medium text-gray-600 mb-0.5 block">Yaşın</label>
                <input type="number" value={age} onChange={e => setAge(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} min="4" max="18"
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-base focus:border-indigo-400 focus:outline-none transition-colors" placeholder="Örn: 7" />
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium text-gray-600 mb-0.5 block">Şehir <span className="text-gray-400">(isteğe bağlı)</span></label>
                <input type="text" value={city} onChange={e => setCity(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-base focus:border-indigo-400 focus:outline-none transition-colors" placeholder="Örn: Muş" />
              </div>
            </div>
            <button onClick={handleLogin} disabled={!name.trim()}
              className={`w-full py-3 rounded-xl font-bold text-base shadow-lg transition-all ${name.trim() ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90 active:scale-[0.98]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
              🚀 Başla
            </button>
          </div>
        </div>

        {/* Daha önce giriş yapanlar */}
        {savedUsers.length > 0 && (
          <div className="bg-white/70 rounded-2xl p-3">
            <button onClick={() => setShowSaved(!showSaved)} className="w-full flex items-center justify-between text-sm text-gray-500 font-medium">
              <span>📋 Kayıtlı Öğrenciler ({savedUsers.length})</span>
              <span className={`transition-transform ${showSaved ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {showSaved && (
              <div className="mt-2 space-y-1.5 max-h-28 scroll-area">
                {savedUsers.map((u, i) => (
                  <button key={i} onClick={() => handleQuickLogin(u)}
                    className="w-full py-2 px-3 bg-indigo-50 hover:bg-indigo-100 rounded-xl text-left flex items-center gap-2 transition-colors">
                    <span className="text-base">👤</span>
                    <span className="font-medium text-gray-700 text-sm">{u.name}</span>
                    {u.age && <span className="text-xs bg-indigo-200 text-indigo-700 px-1.5 py-0.5 rounded-full">{u.age}</span>}
                    {u.city && <span className="text-xs bg-purple-200 text-purple-700 px-1.5 py-0.5 rounded-full">{u.city}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Krediler */}
        <div className="text-center mt-3">
          <p className="text-xs text-gray-400">Prof. Dr. Yılmaz Mutlu • Prof. Dr. Sinan Olkun</p>
          <p className="text-xs text-gray-300 mt-0.5">v15.0</p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
