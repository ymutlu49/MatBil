import React, { useState } from 'react';

/**
 * İsim Sorma Ekranı (Basit Mod)
 * Kod girişinden sonra ilk açılışta bir kez gösterilir.
 * İsteğe bağlı: "Şimdilik geç" ile atlanabilir (varsayılan ad korunur).
 */
const NamePromptScreen = ({ onSubmit, onSkip }) => {
  const [name, setName] = useState('');

  const submit = () => {
    const v = name.trim();
    if (v) onSubmit(v);
    else onSkip();
  };

  return (
    <div className="h-screen bg-gradient-to-b from-indigo-100 via-purple-50 to-pink-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-6 text-center">
        <div className="text-5xl mb-3">{"👋"}</div>
        <h1 className="text-xl font-bold text-gray-800 mb-1">Hoş geldin!</h1>
        <p className="text-sm text-gray-500 mb-5">Sana nasıl hitap edelim?</p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
          maxLength={20}
          autoFocus
          placeholder="Adın"
          className="w-full px-4 py-3 rounded-2xl border-2 border-indigo-200 focus:border-indigo-400 focus:outline-none text-center text-lg font-semibold text-gray-800 mb-4"
        />
        <button
          onClick={submit}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-base shadow-lg hover:opacity-95 active:scale-[0.98] transition-all">
          {"Başla"} {"🚀"}
        </button>
        <button
          onClick={onSkip}
          className="mt-3 text-sm font-medium text-gray-400 hover:text-gray-600 transition-all">
          Şimdilik geç
        </button>
      </div>
    </div>
  );
};

export default NamePromptScreen;
