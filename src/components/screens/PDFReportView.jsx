import React from 'react';
import { GAMES } from '../../constants/games';
import { CATEGORIES } from '../../constants/categories';
import { CHAPTER_MAP } from '../../constants/skillGraph';

const PDFReportView = ({ user, progress, onBack }) => {
  const totalGames = Object.keys(GAMES).length;
  const playedGames = Object.keys(progress).length;
  const allScores = Object.values(progress);
  const totalAttempts = allScores.reduce((s, g) => s + (g.attempts || 0), 0);
  const avgScore = allScores.length > 0 ? Math.round(allScores.reduce((s, g) => s + (g.bestScore || 0), 0) / allScores.length) : 0;
  const totalStars = allScores.reduce((s, g) => s + (g.stars || 0), 0);
  const reportDate = new Date().toLocaleDateString('tr-TR', { year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' });

  const catAnalysis = CATEGORIES.map(cat => {
    const catGames = Object.entries(GAMES).filter(([, g]) => g.cat === cat.id);
    const catPlayed = catGames.filter(([id]) => progress[id]);
    const catStars = catPlayed.reduce((s, [id]) => s + (progress[id]?.stars || 0), 0);
    const catMaxStars = catGames.length * 3;
    const catPct = catMaxStars > 0 ? Math.round((catStars / catMaxStars) * 100) : 0;
    const catAvgScore = catPlayed.length > 0 ? Math.round(catPlayed.reduce((s, [id]) => s + (progress[id]?.bestScore || 0), 0) / catPlayed.length) : 0;
    const chapter = CHAPTER_MAP[cat.id];
    const level = catPct >= 70 ? 'strong' : catPct >= 30 ? 'moderate' : 'weak';
    return { ...cat, catGames, catPlayed, catStars, catMaxStars, catPct, catAvgScore, chapter, level };
  });

  // Genel performans düzeyi
  const overallPct = (totalGames * 3) > 0 ? Math.round((totalStars / (totalGames * 3)) * 100) : 0;
  const overallLevel = overallPct >= 70 ? 'İyi' : overallPct >= 40 ? 'Gelişmekte' : 'Desteklenmeli';

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-white">
      {/* Yazdırma CSS */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-break { page-break-before: always; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .min-h-screen { min-height: auto; }
        }
      `}</style>

      {/* Yazdır / Geri butonları */}
      <div className="no-print sticky top-0 bg-white border-b p-3 flex gap-3 z-50">
        <button onClick={onBack} className="px-4 py-2 bg-gray-100 rounded-lg font-bold text-gray-600 hover:bg-gray-200">← Geri</button>
        <button onClick={handlePrint} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 flex items-center gap-2">🖨️ PDF Olarak İndir</button>
        <span className="text-xs text-gray-400 self-center ml-2">Tarayıcının yazdırma ekranında "PDF olarak kaydet" seçin</span>
      </div>

      <div className="max-w-3xl mx-auto p-8">
        {/* ===== SAYFA 1: KAPAK ===== */}
        <div className="text-center mb-8 border-b-4 border-indigo-600 pb-8">
          <div className="text-6xl mb-4">🧠</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-1">Matematiksel Bilişin Temelleri</h1>
          <p className="text-indigo-600 font-semibold italic mb-6">Sayı Hissinden Şekil Algısına</p>
          <div className="bg-gray-50 inline-block px-12 py-6 rounded-2xl">
            <h2 className="text-2xl font-bold text-gray-700 mb-1">Bireysel Performans Raporu</h2>
            <div className="h-1 w-24 bg-indigo-500 mx-auto my-3 rounded-full"/>
            <p className="text-xl font-bold text-gray-800">{user.name}</p>
            {user.age && <p className="text-gray-500">{user.age} yaş{user.city ? ` • ${user.city}` : ''}</p>}
            <p className="text-sm text-gray-400 mt-2">{reportDate}</p>
          </div>
          <div className="mt-6 flex justify-center gap-8">
            <div className="text-center"><div className="text-3xl font-bold text-indigo-600">{playedGames}/{totalGames}</div><div className="text-xs text-gray-500">Oynanan Oyun</div></div>
            <div className="text-center"><div className="text-3xl font-bold text-yellow-600">⭐ {totalStars}</div><div className="text-xs text-gray-500">Toplam Yıldız</div></div>
            <div className="text-center"><div className="text-3xl font-bold text-green-600">{overallLevel}</div><div className="text-xs text-gray-500">Genel Düzey</div></div>
          </div>
          <p className="text-xs text-gray-400 mt-6">Prof. Dr. Yılmaz Mutlu • Prof. Dr. Sinan Olkun</p>
        </div>

        {/* ===== GENEL ÖZET ===== */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 border-b-2 border-gray-200 pb-2 mb-4">1. Genel Performans Özeti</h3>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="bg-indigo-50 p-4 rounded-xl text-center"><div className="text-2xl font-bold text-indigo-700">{playedGames}</div><div className="text-xs text-gray-600">Oynanan</div></div>
            <div className="bg-green-50 p-4 rounded-xl text-center"><div className="text-2xl font-bold text-green-700">{totalAttempts}</div><div className="text-xs text-gray-600">Toplam Deneme</div></div>
            <div className="bg-amber-50 p-4 rounded-xl text-center"><div className="text-2xl font-bold text-amber-700">{avgScore}</div><div className="text-xs text-gray-600">Ort. Puan</div></div>
            <div className="bg-purple-50 p-4 rounded-xl text-center"><div className="text-2xl font-bold text-purple-700">{overallPct}%</div><div className="text-xs text-gray-600">Başarı Oranı</div></div>
          </div>
        </div>

        {/* ===== KATEGORİ ANALİZLERİ ===== */}
        <div className="print-break">
          <h3 className="text-xl font-bold text-gray-800 border-b-2 border-gray-200 pb-2 mb-4">2. Bilişsel Alan Bazlı Analiz</h3>
          {catAnalysis.map(cat => (
            <div key={cat.id} className="mb-6 bg-gray-50 rounded-xl p-5 border-l-4" style={{borderColor: cat.level === 'strong' ? '#22c55e' : cat.level === 'moderate' ? '#f59e0b' : '#ef4444'}}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-lg font-bold text-gray-800">{cat.emoji} {cat.name}</h4>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${cat.level === 'strong' ? 'bg-green-100 text-green-700' : cat.level === 'moderate' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                  {cat.level === 'strong' ? '✓ İyi' : cat.level === 'moderate' ? '△ Gelişmekte' : '⚠ Desteklenmeli'}
                </span>
              </div>

              {/* İlgili bölümler */}
              <div className="text-xs text-indigo-600 mb-2 font-medium">📖 {cat.chapter.chapters.join(' • ')}</div>

              {/* İstatistikler */}
              <div className="flex gap-4 text-sm mb-3">
                <span className="text-gray-600">Oynanan: <strong>{cat.catPlayed.length}/{cat.catGames.length}</strong></span>
                <span className="text-gray-600">Yıldız: <strong>⭐ {cat.catStars}/{cat.catMaxStars}</strong></span>
                <span className="text-gray-600">Ort. Puan: <strong>{cat.catAvgScore}</strong></span>
                <span className="text-gray-600">Başarı: <strong>{cat.catPct}%</strong></span>
              </div>

              {/* İlerleme çubuğu */}
              <div className="w-full h-3 bg-gray-200 rounded-full mb-3 overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{width:`${cat.catPct}%`, backgroundColor: cat.level === 'strong' ? '#22c55e' : cat.level === 'moderate' ? '#f59e0b' : '#ef4444'}}/>
              </div>

              {/* Kuramsal temel */}
              <div className="bg-white p-3 rounded-lg text-sm text-gray-700 mb-2">
                <strong className="text-gray-800">Kuramsal Temel:</strong> {cat.chapter.theory}
              </div>

              {/* Değerlendirme ve öneri */}
              <div className={`p-3 rounded-lg text-sm ${cat.level === 'strong' ? 'bg-green-50 text-green-800' : cat.level === 'moderate' ? 'bg-amber-50 text-amber-800' : 'bg-red-50 text-red-800'}`}>
                <strong>Değerlendirme:</strong> {cat.level !== 'strong' ? cat.chapter.weakMsg : cat.chapter.strongMsg}
              </div>

              {/* Oyun detayları */}
              <div className="mt-3">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-gray-500 border-b">
                    <th className="pb-1">Oyun</th><th className="pb-1 text-center">En İyi Puan</th><th className="pb-1 text-center">Maks. Seviye</th><th className="pb-1 text-center">Yıldız</th><th className="pb-1 text-center">Deneme</th>
                  </tr></thead>
                  <tbody>
                    {cat.catGames.map(([id, g]) => {
                      const p = progress[id];
                      return (
                        <tr key={id} className="border-b border-gray-100">
                          <td className="py-1">{g.emoji} {g.name}</td>
                          <td className="py-1 text-center">{p ? p?.bestScore : '-'}</td>
                          <td className="py-1 text-center">{p ? `${p?.maxLevel || 1}/${g.levels.length}` : '-'}</td>
                          <td className="py-1 text-center">{p ? '⭐'.repeat(p?.stars || 0) + '☆'.repeat(3-(p?.stars||0)) : '---'}</td>
                          <td className="py-1 text-center">{p ? p?.attempts : 0}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Kaynaklar */}
              <div className="text-xs text-gray-400 mt-2 italic">Kaynaklar: {cat.chapter.refs}</div>
            </div>
          ))}
        </div>

        {/* ===== ÖNERİLER ===== */}
        <div className="print-break mb-8">
          <h3 className="text-xl font-bold text-gray-800 border-b-2 border-gray-200 pb-2 mb-4">3. Genel Değerlendirme ve Öneriler</h3>
          <div className="bg-blue-50 p-5 rounded-xl mb-4">
            <h4 className="font-bold text-blue-800 mb-2">🎯 Güçlü Alanlar</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              {catAnalysis.filter(c => c.level === 'strong').map(c => (
                <li key={c.id}>✓ {c.name}: {c.catPct}% başarı oranıyla güçlü performans</li>
              ))}
              {catAnalysis.filter(c => c.level === 'strong').length === 0 && <li>Henüz güçlü performans düzeyine ulaşılmamış. Düzenli çalışma ile tüm alanlarda gelişim sağlanabilir.</li>}
            </ul>
          </div>
          <div className="bg-amber-50 p-5 rounded-xl mb-4">
            <h4 className="font-bold text-amber-800 mb-2">⚠️ Geliştirilmesi Gereken Alanlar</h4>
            <ul className="text-sm text-amber-700 space-y-1">
              {catAnalysis.filter(c => c.level !== 'strong').map(c => (
                <li key={c.id}>△ {c.name} ({c.catPct}%): {c.chapter.weakMsg.split('.')[0]}.</li>
              ))}
            </ul>
          </div>
          <div className="bg-gray-50 p-5 rounded-xl">
            <h4 className="font-bold text-gray-800 mb-2">📋 Müdahale Önerileri</h4>
            <div className="text-sm text-gray-700 space-y-2">
              <p>1. <strong>Somut-Temsili-Soyut (CRA) çerçevesi</strong> kullanılarak, önce manipülatiflerle, sonra görsel temsillerle, en son sembolik düzeyde çalışmalar yapılmalıdır.</p>
              <p>2. <strong>Çoklu temsil</strong> yaklaşımı benimsenerek her kavram; nesne, resim, diyagram, sembol ve sözel ifade düzeylerinde ele alınmalıdır.</p>
              <p>3. <strong>Düzenli değerlendirme</strong> ile ilerleme izlenmeli ve etkinlikler öğrencinin gelişim düzeyine göre uyarlanmalıdır.</p>
              {catAnalysis.some(c => c.level === 'weak' && c.id === 'A') && <p>4. <strong>Sanbil müdahalesi öncelikli:</strong> Nokta dizileri ve yapılandırılmış çerçevelerle anlık miktar algısı güçlendirilmelidir (Bölüm 4).</p>}
              {catAnalysis.some(c => c.level === 'weak' && c.id === 'D') && <p>4. <strong>Uzamsal beceri desteği:</strong> Tangram, blok oyunları ve zihinsel döndürme etkinlikleri ile geometrik düşünme desteklenmelidir (Bölüm 6-8).</p>}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center border-t-2 border-gray-200 pt-6 mt-8">
          <p className="text-sm font-semibold text-gray-600">Matematiksel Bilişin Temelleri — Bireysel Performans Raporu</p>
          <p className="text-xs text-gray-400 mt-1">Prof. Dr. Yılmaz Mutlu • Prof. Dr. Sinan Olkun</p>
          <p className="text-xs text-gray-400">Rapor tarihi: {reportDate} • v14.0</p>
          <p className="text-[10px] text-gray-300 mt-2">Bu rapor, öğrencinin uygulama içi performansına dayalı otomatik olarak oluşturulmuştur ve klinik tanı aracı değildir.</p>
        </div>
      </div>
    </div>
  );
};

export default PDFReportView;
