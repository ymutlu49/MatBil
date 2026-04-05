import React, { useState } from 'react';
import { GAMES } from '../../constants/games';
import { CATEGORIES } from '../../constants/categories';
import { CHAPTER_MAP, SKILL_GRAPH } from '../../constants/skillGraph';
import { BADGES } from '../../constants/badges';
import { checkBadges } from '../../utils';
import { calcMastery, prereqsMet } from '../../utils';

const ReportScreen = ({ user, progress, onBack, onPDF }) => {
  const totalGames = Object.keys(GAMES).length;
  const playedGames = Object.keys(progress).length;
  const allScores = Object.values(progress);
  const totalAttempts = allScores.reduce((s, g) => s + (g.attempts || 0), 0);
  const avgScore = allScores.length > 0 ? Math.round(allScores.reduce((s, g) => s + (g.bestScore || 0), 0) / allScores.length) : 0;
  const totalStars = allScores.reduce((s, g) => s + (g.stars || 0), 0);
  const maxStars = totalGames * 3;

  // Kategori bazlı analiz
  const catStats = CATEGORIES.map(cat => {
    const catGames = Object.entries(GAMES).filter(([, g]) => g.cat === cat.id);
    const catPlayed = catGames.filter(([id]) => progress[id]);
    const catAvg = catPlayed.length > 0 ? Math.round(catPlayed.reduce((s, [id]) => s + (progress[id]?.bestScore || 0), 0) / catPlayed.length) : 0;
    const catStars = catPlayed.reduce((s, [id]) => s + (progress[id]?.stars || 0), 0);
    return { ...cat, total: catGames.length, played: catPlayed.length, avg: catAvg, stars: catStars, maxStars: catGames.length * 3 };
  });

  // Öğretmen notları
  const [teacherNote, setTeacherNote] = useState(() => { try { return localStorage.getItem(`matbil_note_${user?.name}`) || ''; } catch { return ''; } });
  const saveNote = (txt) => { setTeacherNote(txt); try { localStorage.setItem(`matbil_note_${user?.name}`, txt); } catch {} };

  // Son oynanan oyunlar (kronolojik)
  const recentPlays = Object.entries(progress)
    .filter(([, d]) => d.lastPlayed)
    .sort(([, a], [, b]) => new Date(b.lastPlayed) - new Date(a.lastPlayed))
    .slice(0, 8);

  return (
    <div className="h-screen bg-gradient-to-b from-blue-50 to-indigo-50 flex flex-col overflow-hidden">
      {/* Header (SABİT) */}
      <div className="shrink-0 p-3 pb-0">
        <div className="max-w-lg mx-auto flex items-center justify-between mb-2">
          <button onClick={onBack} className="px-3 py-1.5 bg-white text-gray-600 rounded-lg font-bold shadow text-sm hover:bg-gray-50">← Geri</button>
          <h2 className="text-base font-bold text-gray-700">📊 Gelişim Raporu</h2>
          {onPDF && <button onClick={onPDF} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg font-bold shadow hover:bg-indigo-700 text-sm">📄 PDF</button>}
        </div>
      </div>

      {/* İçerik (KAYDIRILAN) */}
      <div className="flex-1 min-h-0 overflow-y-auto scroll-area p-3 pt-1">
        <div className="max-w-lg mx-auto">
        {/* Öğrenci Bilgisi */}
        <div className="bg-white rounded-xl shadow-lg p-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">{user.name.charAt(0).toUpperCase()}</div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800">{user.name}</h3>
              {(user.age || user.city) && <p className="text-xs text-gray-500">{user.age && `${user.age} yaş`}{user.age && user.city && ' • '}{user.city || ''}</p>}
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-yellow-600">⭐ {totalStars}</div>
              <div className="text-[10px] text-gray-400">/ {maxStars}</div>
            </div>
          </div>
        </div>

        {/* Genel İstatistikler */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-white rounded-lg shadow p-2 text-center">
            <div className="text-xl font-bold text-indigo-600">{playedGames}</div>
            <div className="text-[10px] text-gray-500">/ {totalGames} Oyun</div>
          </div>
          <div className="bg-white rounded-lg shadow p-2 text-center">
            <div className="text-xl font-bold text-green-600">{totalAttempts}</div>
            <div className="text-[10px] text-gray-500">Deneme</div>
          </div>
          <div className="bg-white rounded-lg shadow p-2 text-center">
            <div className="text-xl font-bold text-amber-600">{avgScore}</div>
            <div className="text-[10px] text-gray-500">Ort. Puan</div>
          </div>
        </div>


        {/* 🧠 ÜKM (Üçlü Kodlama Modeli) Profili */}
        <div className="bg-white rounded-xl shadow-lg p-3 mb-3">
          <h3 className="font-bold text-gray-700 mb-2 text-sm">🧠 Bilişsel Profil (Üçlü Kodlama Modeli)</h3>
          {(() => {
            const codeMap = {
              analog: {name:'Analog Büyüklük', emoji:'🔵', games:['A1','A2','A3','A4','A5','B1','B3'], desc:'Nicelik algısı ve sanbil'},
              sozel: {name:'Sözel-İşitsel Kod', emoji:'🟢', games:['C5','E1','E2'], desc:'Sayı sözcükleri ve aritmetik bellek'},
              gorsel: {name:'Görsel-Sembolik Kod', emoji:'🟣', games:['C1','C2','C3','C4','B2','B5'], desc:'Rakam tanıma ve basamak değeri'},
            };
            const profiles = Object.entries(codeMap).map(([key,cfg]) => {
              const played = cfg.games.filter(id => progress[id]);
              const avg = played.length > 0 ? Math.round(played.reduce((s,id) => s + (progress[id]?.bestScore||0), 0) / played.length) : 0;
              const stars = played.reduce((s,id) => s + (progress[id]?.stars||0), 0);
              const maxStars = cfg.games.length * 3;
              const pct = maxStars > 0 ? Math.round((stars / maxStars) * 100) : 0;
              return {key,played:played.length,total:cfg.games.length,avg,stars,maxStars,pct,...cfg};
            });
            const anyPlayed = profiles.some(p => p.played > 0);
            if(!anyPlayed) return <div className="text-xs text-gray-400 text-center py-2">Henüz yeterli veri yok. Daha fazla oyun oynayın.</div>;
            const colors = {analog:'#3B82F6',sozel:'#10B981',gorsel:'#8B5CF6'};
            return (<div>
              <svg viewBox="0 0 300 100" className="w-full mb-2">
                {profiles.map((p,i) => {
                  const bw=80,gap=20,x=gap+i*(bw+gap),maxH=65;
                  const h=Math.max(3,p.pct/100*maxH);
                  return (<g key={p.key}>
                    <rect x={x} y={80-h} width={bw} height={h} rx="4" fill={colors[p.key]} opacity="0.8"/>
                    <text x={x+bw/2} y={75-h} textAnchor="middle" fontSize="9" fill="#374151" fontWeight="bold">{p.pct}%</text>
                    <text x={x+bw/2} y={95} textAnchor="middle" fontSize="8" fill="#6B7280">{p.emoji} {p.name.split(' ')[0]}</text>
                  </g>);
                })}
                <line x1="15" y1="80" x2="285" y2="80" stroke="#E5E7EB" strokeWidth="1"/>
              </svg>
              <div className="space-y-1.5">
                {profiles.map(p => (
                  <div key={p.key} className="flex items-center gap-2 text-xs">
                    <span>{p.emoji}</span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-700">{p.name}</div>
                      <div className="text-[10px] text-gray-400">{p.desc}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold" style={{color:colors[p.key]}}>{p.pct}%</div>
                      <div className="text-[10px] text-gray-400">{p.played}/{p.total}</div>
                    </div>
                  </div>
                ))}
              </div>
              {(() => {
                const weakest = profiles.filter(p=>p.played>0).sort((a,b)=>a.pct-b.pct)[0];
                if(weakest && weakest.pct < 60) return (
                  <div className="mt-2 bg-blue-50 p-2 rounded-lg text-xs text-blue-700">
                    📋 <strong>Öneri:</strong> {weakest.name} alanını güçlendirmek için {weakest.games.slice(0,2).map(id=>GAMES[id]?.name).filter(Boolean).join(' ve ')} oyunlarına odaklanın.
                  </div>
                );
                return null;
              })()}
            </div>);
          })()}
        </div>


        {/* 🔬 MacDonald-Wilkins Sanbil Düzeyi */}
        {(() => {
          const sanbilGames = ['A1','A2','A3','A4','A5'];
          const played = sanbilGames.filter(id => progress[id]);
          if(played.length < 2) return null;
          const avgStars = played.reduce((s,id) => s + (progress[id]?.stars||0), 0) / played.length;
          const attempts = played.reduce((s,id) => s + (progress[id]?.attempts||0), 0);
          // Basitleştirilmiş MacDonald-Wilkins düzey tahmini
          let mwLevel, mwName, mwDesc;
          if(avgStars < 0.5) { mwLevel=1; mwName='Şekil Betimleme'; mwDesc='Öğrenci nesneleri sayısal değil, şekilsel olarak algılıyor. Daha fazla 1-3 arası sanbil pratiği önerilir.'; }
          else if(avgStars < 1.2) { mwLevel=2; mwName='Bölümleyici'; mwDesc='Alt grupları fark ediyor ama bütüne ulaşamıyor. Gruplama etkinlikleri önerilir.'; }
          else if(avgStars < 1.8) { mwLevel=3; mwName='Algısal Sayıcı'; mwDesc='Küçük kümeleri tanıyor. Kavramsal sanbile geçiş için farklı düzenler kullanılmalı.'; }
          else if(avgStars < 2.3) { mwLevel=4; mwName='Ritmik Sayıcı'; mwDesc='Grupları sıralı algılıyor. İkili ve üçlü grupları birleştirme pratiği yapılmalı.'; }
          else if(avgStars < 2.7) { mwLevel=5; mwName='Kavramsal Sanbilci'; mwDesc='Parça-bütün ilişkisini kavrıyor. Aritmetik entegrasyon için hazır.'; }
          else { mwLevel=6; mwName='Esnek Kavramsal'; mwDesc='Farklı gruplama stratejilerini esnek kullanıyor. İleri aritmetik için güçlü temel.'; }
          const mwPct = Math.round((mwLevel/6)*100);
          return (
          <div className="bg-white rounded-xl shadow-lg p-3 mb-3">
            <h3 className="font-bold text-gray-700 mb-2 text-sm">🔬 Sanbil Gelişim Düzeyi (MacDonald-Wilkins)</h3>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-rose-600">{mwLevel}/6</span>
              </div>
              <div className="flex-1">
                <div className="font-bold text-gray-800">{mwName}</div>
                <div className="text-xs text-gray-500">{mwDesc}</div>
              </div>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-rose-400 to-pink-500" style={{width:`${mwPct}%`}}/>
            </div>
            <div className="text-[10px] text-gray-400 mt-1 text-right">{played.length} oyun, {attempts} deneme verisiyle hesaplandı</div>
          </div>);
        })()}

        {/* 📐 Van Hiele Geometrik Düşünce Düzeyi */}
        {(() => {
          const geoGames = ['D1','D2','D3','D4','D5'];
          const played = geoGames.filter(id => progress[id]);
          if(played.length < 1) return null;
          // Basitleştirilmiş Van Hiele düzey tahmini
          const d1Stars = progress['D1']?.stars || 0;
          const d2Stars = progress['D2']?.stars || 0;
          const d3Stars = progress['D3']?.stars || 0;
          const d4Stars = progress['D4']?.stars || 0;
          const d5Stars = progress['D5']?.stars || 0;
          let vhLevel, vhName, vhDesc;
          if(d1Stars < 1) { vhLevel='Ön-Tanıma'; vhName='Ön-Tanıma Düzeyi'; vhDesc='Eğrisel ve doğrusal formları ayırt etme aşamasında. Temel şekil tanıma pratiğine devam edilmeli.'; }
          else if(d2Stars < 1) { vhLevel='Düzey 0'; vhName='Görselleştirme'; vhDesc='Şekilleri bütünsel görünümleriyle tanıyor. Özellik analizi etkinliklerine geçiş önerilir.'; }
          else if(d3Stars < 1) { vhLevel='Düzey 1'; vhName='Analiz'; vhDesc='Şekillerin özelliklerini (kenar, açı) tanımlayabiliyor. İlişki kurma etkinliklerine hazır.'; }
          else { vhLevel='Düzey 2'; vhName='İlişkilendirme'; vhDesc='Şekiller arası ilişkileri (kare↔dikdörtgen) kavrıyor. Formal çıkarıma hazırlanıyor.'; }
          const vhColors = {'Ön-Tanıma':'#EF4444','Düzey 0':'#F59E0B','Düzey 1':'#3B82F6','Düzey 2':'#10B981'};
          return (
          <div className="bg-white rounded-xl shadow-lg p-3 mb-3">
            <h3 className="font-bold text-gray-700 mb-2 text-sm">📐 Geometrik Düşünce Düzeyi (Van Hiele)</h3>
            <div className="flex items-center gap-3 mb-2">
              <div className="px-3 py-2 rounded-lg text-white font-bold text-sm" style={{backgroundColor:vhColors[vhLevel]||'#6B7280'}}>{vhLevel}</div>
              <div className="flex-1">
                <div className="font-bold text-gray-800">{vhName}</div>
                <div className="text-xs text-gray-500">{vhDesc}</div>
              </div>
            </div>
            <div className="flex gap-1 mt-1">
              {['Ön-Tanıma','Düzey 0','Düzey 1','Düzey 2'].map((d,i) => (
                <div key={i} className={`flex-1 h-2 rounded-full ${d===vhLevel?'opacity-100':'opacity-20'}`} style={{backgroundColor:vhColors[d]}}/>
              ))}
            </div>
            <div className="flex justify-between text-[9px] text-gray-400 mt-0.5">
              <span>Ön-Tanıma</span><span>Düzey 2</span>
            </div>
          </div>);
        })()}



        {/* 🤖 Kişiselleştirilmiş Strateji Koçu */}
        {(() => {
          const played = Object.entries(progress).filter(([,d]) => d.attempts >= 1);
          if(played.length < 3) return null;

          // Hata paternlerini analiz et ve kişiselleştirilmiş öneriler üret
          const insights = [];

          // 1. Sanbil analizi
          const sanbilGames = ['A1','A2','A3','A5','A6'];
          const sanbilPlayed = sanbilGames.filter(id => progress[id]);
          if(sanbilPlayed.length >= 2) {
            const avgS = sanbilPlayed.reduce((s,id) => s + (progress[id]?.stars||0), 0) / sanbilPlayed.length;
            if(avgS < 1) insights.push({emoji:'👁️', title:'Sanbil Güçlendirme', text:'Sanbil becerin henüz gelişiyor. Küçük grupları (2-3) hızlı tanımaya odaklan. Günde 5 dk Nokta Avcısı oyna.', priority:5});
            else if(avgS < 2) insights.push({emoji:'💡', title:'Sanbil → Gruplama Geçişi', text:'Küçük grupları tanıyorsun! Şimdi büyük kümeleri alt gruplara ayırmayı dene. Gruplama Ustası oyununa odaklan.', priority:3});
          }

          // 2. Sembolik işleme analizi
          const sembolik = ['C1','C2','C3','C4','C5'];
          const semPlayed = sembolik.filter(id => progress[id]);
          if(semPlayed.length >= 1) {
            const kodC = progress['C5'];
            const sembolE = progress['C1'];
            if(kodC && sembolE && (kodC.stars||0) > (sembolE.stars||0)) {
              insights.push({emoji:'🔄', title:'Kodlar Arası Güç Farkı', text:'Kodlar arası çeviride iyisin ama sembol tanımada zorluk var. Sayı-Sembol Eşleştirme oyununu tekrarla.', priority:4});
            }
            const basam = progress['C4'];
            if(basam && (basam.stars||0) <= 1 && basam.attempts >= 2) {
              insights.push({emoji:'🏛️', title:'Basamak Değeri Desteği', text:'Basamak değeri kavramında güçlük görülüyor. Onluk çubukları ve birlik küpleri ile somut pratik önerilir.', priority:5});
            }
          }

          // 3. Tahmin stratejisi analizi
          const tahmin = ['B1','B2','B4','B5'];
          const tahPlayed = tahmin.filter(id => progress[id]);
          if(tahPlayed.length >= 2) {
            const avgT = tahPlayed.reduce((s,id) => s + (progress[id]?.stars||0), 0) / tahPlayed.length;
            if(avgT < 1.5) insights.push({emoji:'🎯', title:'Tahmin Stratejisi Koçluğu', text:'Tahmin becerini güçlendirmek için: 1) Referans noktası kullan, 2) Grupla düşün, 3) Yuvarla. Her tahminde "Açıkla" adımını kullan!', priority:3});
          }

          // 4. Geometri-uzamsal analizi
          const geo = ['D1','D2','D3','D5','D6'];
          const geoPlayed = geo.filter(id => progress[id]);
          if(geoPlayed.length >= 1) {
            const dondurme = progress['D5'];
            const simetri = progress['D6'];
            if(dondurme && (dondurme.stars||0) <= 1 && dondurme.attempts >= 2) {
              insights.push({emoji:'🔄', title:'Zihinsel Döndürme Desteği', text:'Şekli zihninde döndürmede zorluk var. Gerçek nesneleri elinle döndürme pratiği yap, sonra ekranda dene.', priority:4});
            }
            if(simetri && (simetri.stars||0) <= 1) {
              insights.push({emoji:'🪞', title:'Simetri Keşfi', text:'Kağıdı ikiye katlayarak simetrik desenleri kesmek, simetri algısını güçlendirir. Sonra Simetri Aynası oyununa dön.', priority:3});
            }
          }

          // 5. Aritmetik analizi
          const aritmetik = ['E1','E2','E3','E4','E5'];
          const aritPlayed = aritmetik.filter(id => progress[id]);
          if(aritPlayed.length >= 1) {
            const toplama = progress['E3'];
            if(toplama && (toplama.stars||0) <= 1 && toplama.attempts >= 3) {
              insights.push({emoji:'➕', title:'Toplama Stratejileri', text:'Toplama zorlanıyor. Parmaklardan başla (Parmak Köprüsü), sonra sayı doğrusuna geç (Sayı Yürüyüşü), en son zihinsel stratejilere geç.', priority:5});
            }
          }

          // 6. Genel motivasyon analizi
          const totalAttempts = played.reduce((s,[,d]) => s + (d.attempts||0), 0);
          const totalStars = played.reduce((s,[,d]) => s + (d.stars||0), 0);
          if(totalAttempts > 20 && totalStars/played.length < 1) {
            insights.push({emoji:'💪', title:'Motivasyon Desteği', text:'Çok çalışıyorsun, bu harika! Rahat Mod (🐢) ile başla ve seviye 1\'den ilerle. Her küçük ilerleme değerlidir.', priority:2});
          }

          // En önemli 3 öneriyi göster
          const top = insights.sort((a,b) => b.priority - a.priority).slice(0, 3);
          if(top.length === 0) {
            if(played.length >= 5) return (
              <div className="bg-white rounded-xl shadow-lg p-3 mb-3">
                <h3 className="font-bold text-gray-700 mb-2 text-sm">🤖 Strateji Koçu</h3>
                <div className="bg-green-50 p-3 rounded-lg text-sm text-green-700">✨ Tüm alanlarda tutarlı ilerleme gösteriyorsun. Mevcut çalışma düzenini sürdür ve yeni seviyelerle kendini zorla!</div>
              </div>
            );
            return null;
          }

          return (
            <div className="bg-white rounded-xl shadow-lg p-3 mb-3">
              <h3 className="font-bold text-gray-700 mb-2 text-sm">🤖 Kişiselleştirilmiş Strateji Koçu</h3>
              <div className="space-y-2">
                {top.map((ins, i) => (
                  <div key={i} className="bg-indigo-50 rounded-lg p-2.5">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{ins.emoji}</span>
                      <span className="font-bold text-xs text-indigo-800">{ins.title}</span>
                    </div>
                    <div className="text-xs text-gray-600 leading-relaxed">{ins.text}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* 🔎 Hata Paterni Analizi */}
        {(() => {
          const played = Object.entries(progress).filter(([,d]) => d.attempts >= 2);
          if(played.length < 3) return null;
          // Hata tipi tahmini (basitleştirilmiş)
          const patterns = [];
          const highAttemptLowStar = played.filter(([,d]) => d.attempts >= 4 && d.stars <= 1);
          if(highAttemptLowStar.length >= 2) patterns.push({type:'Kalıcı Zorluk', emoji:'🔴', desc:`${highAttemptLowStar.length} oyunda çok deneme yapılmasına rağmen düşük puan. Kavramsal anlama güçlüğü olabilir.`, games:highAttemptLowStar.slice(0,3).map(([id])=>GAMES[id]?.name).filter(Boolean)});
          const lowAttemptLowStar = played.filter(([,d]) => d.attempts <= 2 && d.stars <= 1);
          if(lowAttemptLowStar.length >= 3) patterns.push({type:'Erken Bırakma', emoji:'🟡', desc:'Birçok oyun yalnızca 1-2 kez deneniyor. Motivasyon desteği ve tekrar teşviki önerilir.', games:lowAttemptLowStar.slice(0,3).map(([id])=>GAMES[id]?.name).filter(Boolean)});
          const catScores = CATEGORIES.map(cat => {
            const cg = Object.entries(GAMES).filter(([,g])=>g.cat===cat.id);
            const avg = cg.reduce((s,[id])=>s+(progress[id]?.stars||0),0)/(cg.length||1);
            return {name:cat.name,emoji:cat.emoji,avg};
          });
          const weakCat = catScores.filter(c=>c.avg<1).sort((a,b)=>a.avg-b.avg);
          const strongCat = catScores.filter(c=>c.avg>=2).sort((a,b)=>b.avg-a.avg);
          if(weakCat.length>0 && strongCat.length>0) patterns.push({type:'Dengesiz Profil', emoji:'🟠', desc:`${weakCat[0].emoji} ${weakCat[0].name} alanı zayıf, ${strongCat[0].emoji} ${strongCat[0].name} güçlü. Zayıf alana odaklanılması önerilir.`});
          if(patterns.length === 0) {
            const allGood = catScores.every(c=>c.avg>=1.5);
            if(allGood) patterns.push({type:'Dengeli Gelişim', emoji:'🟢', desc:'Tüm kategorilerde tutarlı ilerleme gösteriliyor. Mevcut çalışma düzeni sürdürülmeli.'});
          }
          if(patterns.length === 0) return null;
          return (
          <div className="bg-white rounded-xl shadow-lg p-3 mb-3">
            <h3 className="font-bold text-gray-700 mb-2 text-sm">🔎 Performans Paterni Analizi</h3>
            <div className="space-y-2">{patterns.map((p,i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-2">
                <div className="flex items-center gap-2 mb-1"><span className="text-lg">{p.emoji}</span><span className="font-bold text-sm text-gray-700">{p.type}</span></div>
                <div className="text-xs text-gray-600">{p.desc}</div>
                {p.games && <div className="text-[10px] text-gray-400 mt-1">İlgili oyunlar: {p.games.join(', ')}</div>}
              </div>
            ))}</div>
          </div>);
        })()}



        {/* 🧬 Beceri Haritası (Bilgi Grafiği) */}
        <div className="bg-white rounded-xl shadow-lg p-3 mb-3">
          <h3 className="font-bold text-gray-700 mb-2 text-sm">🧬 Beceri Haritası</h3>
          <div className="grid grid-cols-2 gap-1.5">
            {Object.entries(SKILL_GRAPH).map(([id, skill]) => {
              const m = calcMastery(id, progress);
              const ready = prereqsMet(id, progress);
              const pct = Math.round(m * 100);
              return (
                <div key={id} className={`p-1.5 rounded-lg border text-[10px] ${!ready && skill.prereqs.length>0 ? 'bg-gray-50 border-gray-200 opacity-50' : 'bg-white border-gray-200'}`}>
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="font-bold text-gray-700">{skill.name}</span>
                    <span className={`font-bold ${pct>=70?'text-green-600':pct>=30?'text-amber-600':pct>0?'text-red-500':'text-gray-400'}`}>{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${pct>=70?'bg-green-400':pct>=30?'bg-amber-400':'bg-red-300'}`} style={{width:`${pct}%`}}/>
                  </div>
                  {!ready && skill.prereqs.length>0 && <div className="text-[8px] text-gray-400 mt-0.5">🔒 Önkoşul: {skill.prereqs.map(p=>SKILL_GRAPH[p]?.name).join(', ')}</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* 📐 CRA (Somut→Temsili→Soyut) İlerleme Haritası */}
        <div className="bg-white rounded-xl shadow-lg p-3 mb-3">
          <h3 className="font-bold text-gray-700 mb-2 text-sm">📐 CRA İlerleme Haritası</h3>
          <div className="text-[10px] text-gray-400 mb-2">Her kavramın Somut (C), Temsili (R) ve Soyut (A) düzeyindeki yetkinliği</div>
          {(() => {
            const craMap = {
              'Sayı Hissi': {C:['A3','A4'],R:['A1','A5'],A:['C1','C2']},
              'Toplama/Çıkarma': {C:['E2'],R:['E5','E3'],A:['B5']},
              'Geometri': {C:['D1','D6'],R:['D2','D5'],A:['D3','D4']},
              'Tahmin': {C:['B1'],R:['B3','B4'],A:['B2','B5']},
            };
            return Object.entries(craMap).map(([concept,levels]) => {
              const getLevel = (ids) => {
                const played = ids.filter(id=>progress[id]);
                if(played.length===0) return 0;
                return played.reduce((s,id)=>s+(progress[id]?.stars||0),0)/(played.length*3)*100;
              };
              const c=getLevel(levels.C),r=getLevel(levels.R),a=getLevel(levels.A);
              const currentLevel = a >= 50 ? 'Soyut' : r >= 50 ? 'Temsili' : c >= 50 ? 'Somut' : 'Başlangıç';
              const levelColor = {Başlangıç:'text-gray-400',Somut:'text-orange-600',Temsili:'text-blue-600',Soyut:'text-green-600'};
              return (
                <div key={concept} className="mb-2">
                  <div className="flex justify-between items-center text-xs mb-0.5">
                    <span className="font-medium text-gray-700">{concept}</span>
                    <span className={`font-bold text-[10px] ${levelColor[currentLevel]}`}>{currentLevel}</span>
                  </div>
                  <div className="flex gap-0.5 h-3">
                    <div className="flex-1 bg-orange-100 rounded-l-full overflow-hidden"><div className="h-full bg-orange-400 rounded-l-full" style={{width:`${c}%`}}/></div>
                    <div className="flex-1 bg-blue-100 overflow-hidden"><div className="h-full bg-blue-400" style={{width:`${r}%`}}/></div>
                    <div className="flex-1 bg-green-100 rounded-r-full overflow-hidden"><div className="h-full bg-green-400 rounded-r-full" style={{width:`${a}%`}}/></div>
                  </div>
                </div>
              );
            });
          })()}
          <div className="flex gap-3 mt-1 text-[9px] text-gray-400">
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-orange-400 rounded-full"/>Somut (C)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-400 rounded-full"/>Temsili (R)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-400 rounded-full"/>Soyut (A)</span>
          </div>
        </div>

        {/* 📊 Gelişim Grafiği - Kategori Karşılaştırması */}
        <div className="bg-white rounded-xl shadow-lg p-3 mb-3">
          <h3 className="font-bold text-gray-700 mb-2 text-sm">📊 Kategori Performans Grafiği</h3>
          <svg viewBox="0 0 300 120" className="w-full">
            {catStats.map((cat, i) => {
              const barW = 40;
              const gap = (300 - catStats.length * barW) / (catStats.length + 1);
              const x = gap + i * (barW + gap);
              const maxH = 80;
              const pct = cat.maxStars > 0 ? cat.stars / cat.maxStars : 0;
              const h = Math.max(2, pct * maxH);
              const colors = {A:'#F43F5E',B:'#F59E0B',C:'#3B82F6',D:'#10B981',E:'#A855F7'};
              return (<g key={cat.id}>
                <rect x={x} y={95-h} width={barW} height={h} rx="4" fill={colors[cat.id]||'#6B7280'} opacity="0.85"/>
                <text x={x+barW/2} y={90-h} textAnchor="middle" fontSize="9" fill="#374151" fontWeight="bold">{cat.stars}/{cat.maxStars}</text>
                <text x={x+barW/2} y={110} textAnchor="middle" fontSize="10">{cat.emoji}</text>
              </g>);
            })}
            <line x1="10" y1="95" x2="290" y2="95" stroke="#E5E7EB" strokeWidth="1"/>
          </svg>
          <div className="text-center text-[10px] text-gray-400 mt-1">Yıldız / Maksimum Yıldız</div>
        </div>

        {/* Kazanılan Rozetler */}
        {(() => { const earned = checkBadges(progress, GAMES); return earned.length > 0 ? (
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-amber-200 p-3 mb-3">
            <h3 className="font-bold text-amber-700 mb-2 text-sm">🏆 Kazanılan Rozetler ({earned.length}/{BADGES.length})</h3>
            <div className="space-y-1.5">{earned.map(b => (
              <div key={b.id} className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm">
                <span className="text-xl">{b.emoji}</span>
                <div><div className="text-xs font-bold text-gray-700">{b.name}</div><div className="text-[10px] text-gray-500">{b.desc}</div></div>
              </div>
            ))}</div>
          </div>
        ) : null; })()}

                {/* 📚 Bilişsel Alan Analizi (Kitap Bölümleriyle İlişkili) */}
        <div className="bg-white rounded-xl shadow-lg p-3 mb-3">
          <h3 className="font-bold text-gray-700 mb-2 text-sm">📚 Bilişsel Alan Analizi</h3>
          <div className="space-y-3">
            {catStats.map(cat => {
              const ch = CHAPTER_MAP[cat.id];
              if (!ch) return null;
              const catPctVal = cat.maxStars > 0 ? Math.round((cat.stars / cat.maxStars) * 100) : 0;
              const levelLabel = catPctVal >= 70 ? 'Güçlü' : catPctVal >= 30 ? 'Gelişmekte' : cat.played > 0 ? 'Desteklenmeli' : 'Henüz başlanmadı';
              const levelColor = catPctVal >= 70 ? 'text-green-600 bg-green-50' : catPctVal >= 30 ? 'text-amber-600 bg-amber-50' : cat.played > 0 ? 'text-red-600 bg-red-50' : 'text-gray-400 bg-gray-50';
              return (
                <div key={cat.id} className={`rounded-xl border-2 ${cat.color.border} overflow-hidden`}>
                  {/* Kategori başlığı */}
                  <div className={`bg-gradient-to-r ${cat.color.gradient} text-white px-3 py-2 flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{cat.emoji}</span>
                      <span className="font-bold text-sm">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs opacity-90">{cat.played}/{cat.total} oyun</span>
                      <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold">⭐{cat.stars}/{cat.maxStars}</span>
                    </div>
                  </div>

                  <div className="p-3 space-y-2">
                    {/* İlerleme çubuğu + düzey */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full bg-gradient-to-r ${cat.color.gradient}`} style={{width:`${catPctVal}%`}}/>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${levelColor}`}>{levelLabel}</span>
                    </div>

                    {/* Kuramsal çerçeve */}
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="text-xs font-bold text-gray-600 mb-1">📖 Kuramsal Çerçeve</div>
                      <div className="text-xs text-gray-500 leading-relaxed">{ch.theory.substring(0, 200)}{ch.theory.length > 200 ? '...' : ''}</div>
                    </div>

                    {/* Kitap bölüm referansları */}
                    <div className="flex flex-wrap gap-1">
                      {ch.chapters.map((c, i) => (
                        <span key={i} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{c.split('—')[0].trim()}</span>
                      ))}
                    </div>

                    {/* Değerlendirme ve öneri */}
                    {cat.played > 0 && (
                      <div className={`rounded-lg p-2 text-xs leading-relaxed ${catPctVal >= 70 ? 'bg-green-50 text-green-700' : catPctVal >= 30 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
                        <span className="font-bold">{catPctVal >= 70 ? '✅ Değerlendirme: ' : catPctVal >= 30 ? '📋 Değerlendirme: ' : '⚠️ Değerlendirme: '}</span>
                        {catPctVal >= 70 ? ch.strongMsg : ch.weakMsg}
                      </div>
                    )}

                    {/* Kaynaklar */}
                    <div className="text-xs text-gray-400 italic">Kaynaklar: {ch.refs}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Oyun Bazlı Detay */}
        <div className="bg-white rounded-xl shadow-lg p-3 mb-3">
          <h3 className="font-bold text-gray-700 mb-2 text-sm">🎮 Oyun Detayları</h3>
          <div className="space-y-1">
            {Object.entries(GAMES).map(([id, g]) => {
              const p = progress[id];
              return (
                <div key={id} className={`flex items-center gap-2 p-1.5 rounded-lg ${p ? 'bg-green-50' : 'bg-gray-50'}`}>
                  <span className="text-base">{g.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-700 truncate">{g.name}</div>
                    {p ? (
                      <div className="text-[10px] text-gray-500">En iyi: {p?.bestScore} • Sv.{p?.maxLevel || 1} • {p?.attempts || 1}x</div>
                    ) : (
                      <div className="text-[10px] text-gray-400">—</div>
                    )}
                  </div>
                  <div className="flex gap-0.5">{[1,2,3].map(i => <span key={i} className="text-xs">{p && i <= (p?.stars || 0) ? '⭐' : '☆'}</span>)}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Son Oynananlar */}
        {recentPlays.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-3 mb-3">
            <h3 className="font-bold text-gray-700 mb-2 text-sm">🕐 Son Oynananlar</h3>
            <div className="space-y-1">
              {recentPlays.map(([id, d]) => {
                const g = GAMES[id];
                const date = new Date(d.lastPlayed);
                const dateStr = `${date.getDate().toString().padStart(2,'0')}.${(date.getMonth()+1).toString().padStart(2,'0')} ${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}`;
                return (
                  <div key={id} className="flex items-center gap-2 text-xs">
                    <span>{g?.emoji}</span>
                    <span className="flex-1 text-gray-700">{g?.name}</span>
                    <span className="text-gray-400">{dateStr}</span>
                    <span className="font-bold text-amber-600">{d.lastScore}p</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Krediler */}
        <div className="text-center py-3">
          <p className="text-[10px] text-gray-400">Prof. Dr. Yılmaz Mutlu • Prof. Dr. Sinan Olkun</p>
        </div>
        </div>
      </div>
    </div>
  );
};

export default ReportScreen;
