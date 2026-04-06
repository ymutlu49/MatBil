import React, { useState, useEffect } from 'react';
import { getParents, saveParent, hashPin, verifyPin, generateId, getAllStudents } from '../../utils/auth';

/**
 * Veli Giriş / Kayıt Ekranı
 */
const ParentLoginScreen = ({ onLogin, onBack }) => {
  const [parents, setParents] = useState([]);
  const [mode, setMode] = useState('login');
  const [selectedId, setSelectedId] = useState('');
  const [pin, setPin] = useState('');
  const [name, setName] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [selectedChild, setSelectedChild] = useState('');
  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const p = getParents();
    setParents(p);
    if (p.length === 0) setMode('register');
    else setSelectedId(p[0].id);
    setStudents(getAllStudents());
  }, []);

  const handleRegister = async () => {
    if (!name.trim()) { setError('Adınızı girin.'); return; }
    if (pin.length < 4) { setError('PIN en az 4 haneli olmalı.'); return; }
    if (pin !== pinConfirm) { setError('PIN\'ler eşleşmiyor.'); return; }
    setLoading(true);
    try {
      const pinHash = await hashPin(pin);
      const parent = {
        id: generateId('parent'),
        name: name.trim(),
        pinHash,
        childIds: selectedChild ? [selectedChild] : [],
        createdAt: new Date().toISOString(),
      };
      saveParent(parent);
      onLogin({ id: parent.id, name: parent.name, role: 'parent', childIds: parent.childIds, loginAt: new Date().toISOString() });
    } catch { setError('Bir hata oluştu.'); }
    setLoading(false);
  };

  const handleLogin = async () => {
    if (!selectedId) { setError('Hesap seçin.'); return; }
    if (!pin) { setError('PIN girin.'); return; }
    setLoading(true);
    setError('');
    try {
      const parent = parents.find(p => p.id === selectedId);
      if (!parent) { setError('Hesap bulunamadı.'); setLoading(false); return; }
      const ok = await verifyPin(pin, parent.pinHash);
      if (!ok) { setError('PIN hatalı.'); setPin(''); setLoading(false); return; }
      onLogin({ id: parent.id, name: parent.name, role: 'parent', childIds: parent.childIds, loginAt: new Date().toISOString() });
    } catch { setError('Bir hata oluştu.'); }
    setLoading(false);
  };

  return (
    <div className="h-screen bg-gradient-to-b from-purple-100 via-fuchsia-50 to-purple-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-xl p-5">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">{"👨‍👩‍👧"}</div>
            <h2 className="text-xl font-bold text-gray-800">{mode === 'register' ? 'Veli Kaydı' : 'Veli Girişi'}</h2>
            <p className="text-xs text-gray-500 mt-1">{mode === 'register' ? 'Yeni hesap oluşturun' : 'PIN ile giriş yapın'}</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-xl mb-3 text-center">{error}</div>
          )}

          {mode === 'register' ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Ad Soyad</label>
                <input type="text" value={name} onChange={e => { setName(e.target.value); setError(''); }}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base focus:border-purple-400 focus:outline-none" placeholder="Adınızı girin" />
              </div>
              {students.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Çocuğunuzu Seçin</label>
                  <select value={selectedChild} onChange={e => setSelectedChild(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base focus:border-purple-400 focus:outline-none bg-white">
                    <option value="">Seçiniz...</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name}{s.age ? ` (${s.age} yaş)` : ''}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">PIN Kodu (en az 4 haneli)</label>
                <input type="password" inputMode="numeric" value={pin} onChange={e => { setPin(e.target.value.replace(/\D/g, '')); setError(''); }}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base text-center tracking-[0.5em] focus:border-purple-400 focus:outline-none" placeholder="••••" maxLength={8} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">PIN Tekrar</label>
                <input type="password" inputMode="numeric" value={pinConfirm} onChange={e => { setPinConfirm(e.target.value.replace(/\D/g, '')); setError(''); }}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base text-center tracking-[0.5em] focus:border-purple-400 focus:outline-none" placeholder="••••" maxLength={8}
                  onKeyDown={e => e.key === 'Enter' && handleRegister()} />
              </div>
              <button onClick={handleRegister} disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white rounded-xl font-bold text-base shadow-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50">
                {loading ? 'Kaydediliyor...' : '✓ Hesap Oluştur'}
              </button>
              {parents.length > 0 && (
                <button onClick={() => { setMode('login'); setError(''); }} className="w-full py-2 text-purple-600 text-sm font-medium">
                  Mevcut hesapla giriş yap
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Hesap Seçin</label>
                <select value={selectedId} onChange={e => { setSelectedId(e.target.value); setError(''); }}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base focus:border-purple-400 focus:outline-none bg-white">
                  {parents.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">PIN Kodu</label>
                <input type="password" inputMode="numeric" value={pin} onChange={e => { setPin(e.target.value.replace(/\D/g, '')); setError(''); }}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base text-center tracking-[0.5em] focus:border-purple-400 focus:outline-none" placeholder="••••" maxLength={8}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()} />
              </div>
              <button onClick={handleLogin} disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white rounded-xl font-bold text-base shadow-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50">
                {loading ? 'Giriş yapılıyor...' : '🔐 Giriş Yap'}
              </button>
              <button onClick={() => { setMode('register'); setError(''); setPin(''); }} className="w-full py-2 text-purple-600 text-sm font-medium">
                Yeni veli hesabı oluştur
              </button>
            </div>
          )}
        </div>
        <button onClick={onBack} className="w-full mt-3 py-3 text-gray-500 font-medium text-sm hover:text-gray-700">
          {"←"} Rol Seçimine Dön
        </button>
      </div>
    </div>
  );
};

export default ParentLoginScreen;
