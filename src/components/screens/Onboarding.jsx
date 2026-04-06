import React, { useState } from 'react';

const Onboarding = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const steps = [
    { emoji: '🧠', title: 'Matematiksel Bilişin Temelleri', desc: 'Bu uygulama, matematiksel düşünme becerilerini oyunlarla geliştirmeni sağlar. Her oyun bilimsel araştırmalara dayanır!', bg: 'from-indigo-400 to-purple-500' },
    { emoji: '⭐', title: '6 Kategori, 35 Oyun', desc: 'Sanbil, Aritmetik, Sembolik İşleme, Geometri, Tahmin ve Bilişsel Beceriler kategorilerinde oyunlar seni bekliyor. Her biri farklı bir beceriyi geliştirir.', bg: 'from-rose-400 to-pink-500' },
    { emoji: '🐢', title: 'Kendi Hızında İlerle', desc: 'Rahat Mod (🐢) ile süreleri uzat. ? butonu ile her oyunun amacını öğren. Kişisel rekorunu kır ve rozetler kazan!', bg: 'from-emerald-400 to-teal-500' },
  ];
  const s = steps[step];
  return (
    <div className="h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4">
      <div className={`w-full max-w-sm bg-gradient-to-br ${s.bg} rounded-3xl shadow-2xl p-6 text-center text-white mb-4`}>
        <div className="text-6xl mb-3">{s.emoji}</div>
        <h2 className="text-xl font-bold mb-2">{s.title}</h2>
        <p className="text-sm opacity-90 leading-relaxed">{s.desc}</p>
      </div>
      <div className="flex gap-2 mb-4">{steps.map((_,i) => (
        <div key={i} className={`w-3 h-3 rounded-full transition-all ${i===step?'bg-indigo-500 scale-125':'bg-gray-300'}`}/>
      ))}</div>
      <div className="flex gap-3">
        {step > 0 && <button onClick={() => setStep(step-1)} className="px-6 py-3 bg-gray-200 text-gray-600 rounded-xl font-bold text-sm">← Geri</button>}
        {step < steps.length - 1 ? (
          <button onClick={() => setStep(step+1)} className="px-8 py-3 bg-indigo-500 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-indigo-600 transition-colors">İleri →</button>
        ) : (
          <button onClick={onComplete} className="px-8 py-3 bg-green-500 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-green-600 transition-colors">🚀 Başla!</button>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
