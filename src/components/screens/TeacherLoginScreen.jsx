import React, { useState, useEffect } from 'react';
import { getTeachers, saveTeacher, hashPin, verifyPin, generateId } from '../../utils/auth';

/**
 * Öğretmen Giriş / Kayıt Ekranı
 * - Kayıtlı öğretmen yoksa: Kayıt formu
 * - Kayıtlı öğretmen varsa: Seç + PIN gir
 */
const TeacherLoginScreen = ({ onLogin, onBack }) => {
  const [teachers, setTeachers] = useState([]);
  const [mode, setMode] = useState('login'); // login | register
  const [selectedId, setSelectedId] = useState('');
  const [pin, setPin] = useState('');
  const [name, setName] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = getTeachers();
    setTeachers(t);
    if (t.length === 0) setMode('register');
    else setSelectedId(t[0].id);
  }, []);

  const handleRegister = async () => {
    if (!name.trim()) { setError('Adınızı girin.'); return; }
    if (pin.length < 4) { setError('PIN en az 4 haneli olmalı.'); return; }
    if (pin !== pinConfirm) { setError('PIN\'ler eşleşmiyor.'); return; }
    setLoading(true);
    try {
      const pinHash = await hashPin(pin);
      const teacher = {
        id: generateId('teacher'),
        name: name.trim(),
        pinHash,
        classes: [],
        createdAt: new Date().toISOString(),
      };
      saveTeacher(teacher);
      onLogin({ id: teacher.id, name: teacher.name, role: 'teacher', loginAt: new Date().toISOString() });
    } catch { setError('Bir hata oluştu.'); }
    setLoading(false);
  };

  const handleLogin = async () => {
    if (!selectedId) { setError('Hesap seçin.'); return; }
    if (!pin) { setError('PIN girin.'); return; }
    setLoading(true);
    setError('');
    try {
      const teacher = teachers.find(t => t.id === selectedId);
      if (!teacher) { setError('Hesap bulunamadı.'); setLoading(false); return; }
      const ok = await verifyPin(pin, teacher.pinHash);
      if (!ok) { setError('PIN hatalı.'); setPin(''); setLoading(false); return; }
      onLogin({ id: teacher.id, name: teacher.name, role: 'teacher', loginAt: new Date().toISOString() });
    } catch { setError('Bir hata oluştu.'); }
    setLoading(false);
  };

  return (
    <div className="h-screen bg-gradient-to-b from-indigo-100 via-blue-50 to-indigo-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-xl p-5">
          {/* Başlık */}
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">{"👩‍🏫"}</div>
            <h2 className="text-xl font-bold text-gray-800">{mode === 'register' ? 'Öğretmen Kaydı' : 'Öğretmen Girişi'}</h2>
            <p className="text-xs text-gray-500 mt-1">{mode === 'register' ? 'Yeni hesap oluşturun' : 'PIN ile giriş yapın'}</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-xl mb-3 text-center">{error}</div>
          )}

          {mode === 'register' ? (
            /* ─── KAYIT FORMU ─── */
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Ad Soyad</label>
                <input type="text" value={name} onChange={e => { setName(e.target.value); setError(''); }}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base focus:border-indigo-400 focus:outline-none" placeholder="Adınızı girin" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">PIN Kodu (en az 4 haneli)</label>
                <input type="password" inputMode="numeric" value={pin} onChange={e => { setPin(e.target.value.replace(/\D/g, '')); setError(''); }}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base text-center tracking-[0.5em] focus:border-indigo-400 focus:outline-none" placeholder="••••" maxLength={8} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">PIN Tekrar</label>
                <input type="password" inputMode="numeric" value={pinConfirm} onChange={e => { setPinConfirm(e.target.value.replace(/\D/g, '')); setError(''); }}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base text-center tracking-[0.5em] focus:border-indigo-400 focus:outline-none" placeholder="••••" maxLength={8}
                  onKeyDown={e => e.key === 'Enter' && handleRegister()} />
              </div>
              <button onClick={handleRegister} disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-xl font-bold text-base shadow-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50">
                {loading ? 'Kaydediliyor...' : '✓ Hesap Oluştur'}
              </button>
              {teachers.length > 0 && (
                <button onClick={() => { setMode('login'); setError(''); }} className="w-full py-2 text-indigo-600 text-sm font-medium hover:text-indigo-700">
                  Mevcut hesapla giriş yap
                </button>
              )}
            </div>
          ) : (
            /* ─── GİRİŞ FORMU ─── */
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Hesap Seçin</label>
                <select value={selectedId} onChange={e => { setSelectedId(e.target.value); setError(''); }}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base focus:border-indigo-400 focus:outline-none bg-white">
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">PIN Kodu</label>
                <input type="password" inputMode="numeric" value={pin} onChange={e => { setPin(e.target.value.replace(/\D/g, '')); setError(''); }}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base text-center tracking-[0.5em] focus:border-indigo-400 focus:outline-none" placeholder="••••" maxLength={8}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()} />
              </div>
              <button onClick={handleLogin} disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-xl font-bold text-base shadow-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50">
                {loading ? 'Giriş yapılıyor...' : '🔐 Giriş Yap'}
              </button>
              <button onClick={() => { setMode('register'); setError(''); setPin(''); }} className="w-full py-2 text-indigo-600 text-sm font-medium hover:text-indigo-700">
                Yeni öğretmen hesabı oluştur
              </button>
            </div>
          )}
        </div>

        <button onClick={onBack} className="w-full mt-3 py-3 text-gray-500 font-medium text-sm hover:text-gray-700 transition-colors">
          {"←"} Rol Seçimine Dön
        </button>
      </div>
    </div>
  );
};

export default TeacherLoginScreen;
