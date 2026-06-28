import React, { useState } from 'react';

/**
 * Öğrenci Profilleri (Basit Mod)
 * Avatar panelinde gösterilir. İsim düzenleme + kardeş profilleri arası geçiş + yeni profil.
 *
 * Props:
 *  - current:  aktif profil ({ id, name })
 *  - profiles: tüm basit profiller (isDefault:true)
 *  - limit:    en fazla profil sayısı
 *  - onRename(name) / onSwitch(profile) / onAdd(name)
 */
const LearnerProfiles = ({ current, profiles = [], limit = 3, onRename, onSwitch, onAdd }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(current?.name || '');
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');

  const saveRename = () => {
    const v = draft.trim();
    if (v) onRename(v);
    setEditing(false);
  };

  const saveAdd = () => {
    const v = newName.trim();
    if (v) onAdd(v);
    setNewName('');
    setAdding(false);
  };

  return (
    <div className="mb-4 pb-4 border-b border-gray-100">
      {/* Aktif profil + isim düzenleme */}
      {editing ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') saveRename(); if (e.key === 'Escape') setEditing(false); }}
            maxLength={20}
            autoFocus
            className="flex-1 px-3 py-2 rounded-xl border-2 border-indigo-200 focus:border-indigo-400 focus:outline-none text-sm font-semibold text-gray-800"
          />
          <button onClick={saveRename}
            className="px-3 py-2 rounded-xl bg-indigo-500 text-white text-sm font-bold active:scale-95 transition-all">{"✓"}</button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-lg">{"🧒"}</span>
            <span className="text-sm font-bold text-gray-800 truncate">{current?.name}</span>
          </div>
          <button onClick={() => { setDraft(current?.name || ''); setEditing(true); }}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-700 active:scale-95 transition-all shrink-0">
            {"✏️ İsmi düzenle"}
          </button>
        </div>
      )}

      {/* Kardeş profilleri arası geçiş */}
      {profiles.length > 1 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {profiles.map((p) => (
            <button key={p.id} onClick={() => onSwitch(p)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 ${
                p.id === current?.id
                  ? 'bg-indigo-500 text-white shadow'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {p.name}
            </button>
          ))}
        </div>
      )}

      {/* Yeni profil ekle */}
      {adding ? (
        <div className="flex items-center gap-2 mt-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') saveAdd(); if (e.key === 'Escape') { setAdding(false); setNewName(''); } }}
            maxLength={20}
            autoFocus
            placeholder="Yeni profil adı"
            className="flex-1 px-3 py-2 rounded-xl border-2 border-emerald-200 focus:border-emerald-400 focus:outline-none text-sm font-semibold text-gray-800"
          />
          <button onClick={saveAdd}
            className="px-3 py-2 rounded-xl bg-emerald-500 text-white text-sm font-bold active:scale-95 transition-all">{"✓"}</button>
        </div>
      ) : (
        profiles.length < limit && (
          <button onClick={() => setAdding(true)}
            className="mt-3 text-xs font-medium text-emerald-600 hover:text-emerald-700 active:scale-95 transition-all">
            {"＋ Yeni profil ekle"}
          </button>
        )
      )}
    </div>
  );
};

export default LearnerProfiles;
