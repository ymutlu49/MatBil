import React, { useState, useEffect, useRef } from 'react';
import { CHAPTER_MAP, SKILL_GRAPH, GAME_CHAPTER_MAP, getGamesForChapter } from '../../constants/skillGraph';
import { shouldShowPremiumBadge } from '../../utils/entitlement';
import PremiumBadge from '../ui/PremiumBadge';
import { GAMES } from '../../constants/games';
import { CATEGORIES } from '../../constants/categories';
import { COLORS } from '../../constants/colors';
import { HELP_MAP } from '../../constants/helpMap';
import { ACADEMIC_CONTENT } from '../../constants/academicContent';

const BOOK_CHAPTERS = [
  { num: 1, title: 'Doğuştan Gelen Matematik', subtitle: 'Çekirdek Bilgi Sistemleri ve Sayı Hissinin Temelleri', categories: ['A', 'B', 'E'], emoji: '🧒', color: 'from-rose-400 to-pink-500' },
  { num: 2, title: 'Üçlü Kodlama Modeli (ÜKM)', subtitle: 'Çağdaş Öğretim Yaklaşımları', categories: ['C'], emoji: '🧠', color: 'from-blue-400 to-indigo-500' },
  { num: 3, title: 'Sembolik Sayı İşleme', subtitle: 'Kuramsal Temeller ve Bilişsel Zorluklar', categories: ['C'], emoji: '🔢', color: 'from-indigo-400 to-purple-500' },
  { num: 4, title: 'Sanbil Becerisinin Rolü', subtitle: 'Erken Matematiksel Gelişimdeki Yeri', categories: ['A', 'E'], emoji: '👁️', color: 'from-red-400 to-rose-500' },
  { num: 5, title: 'Tahmin Becerisi', subtitle: 'Matematik Eğitimindeki Rolü', categories: ['B'], emoji: '🎯', color: 'from-amber-400 to-orange-500' },
  { num: 6, title: 'Geometri Çekirdek Bilgisi', subtitle: 'Şekil Algısı ve Uzamsal Bilişin Temelleri', categories: ['D'], emoji: '📐', color: 'from-emerald-400 to-green-500' },
  { num: 7, title: 'Sezgiden İspata Geçiş', subtitle: 'Geometrik Düşüncenin Van Hiele Düzeyleri', categories: ['D'], emoji: '🔺', color: 'from-green-400 to-teal-500' },
  { num: 8, title: 'Geometride Pedagojik Uyarlamalar', subtitle: 'Matematik Öğrenme Güçlüklerinde Müdahale İlkeleri', categories: ['D'], emoji: '🎓', color: 'from-teal-400 to-cyan-500' },
  { num: 9, title: 'Bilişsel Beceriler', subtitle: 'Çalışma Belleği, İnhibisyon ve Bilişsel Esneklik', categories: ['F'], emoji: '⚡', color: 'from-cyan-400 to-blue-500' },
];

/* ════════════════════════════════════════════════════════════════
   AKADEMİK ALT BİLEŞENLER
   ════════════════════════════════════════════════════════════════ */

const SectionHeader = ({ title, icon, isOpen, onToggle }) => (
  <button onClick={onToggle} className="w-full flex items-center gap-2 py-2.5 px-1 text-left group">
    <span className="text-sm">{icon}</span>
    <span className="flex-1 text-[11px] font-bold text-gray-800 uppercase tracking-wider">{title}</span>
    <span className={`text-gray-400 text-xs transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>{"▾"}</span>
  </button>
);

const TheoryFrameworkSection = ({ theory, catId }) => {
  const color = { A: 'border-rose-400', B: 'border-amber-400', C: 'border-blue-400', D: 'border-emerald-400', E: 'border-purple-400', F: 'border-cyan-400' }[catId] || 'border-gray-400';
  const sentences = theory.split('. ').filter(Boolean);
  const paragraphs = [];
  for (let i = 0; i < sentences.length; i += 2) {
    paragraphs.push(sentences.slice(i, i + 2).join('. ') + (sentences[i + 1] ? '' : '.'));
  }
  return (
    <div className={`border-l-4 ${color} pl-3 py-1`}>
      {paragraphs.map((p, i) => (
        <p key={i} className="text-[11px] text-gray-700 leading-relaxed mb-1.5 last:mb-0">{p}</p>
      ))}
    </div>
  );
};

const KeyConceptsSection = ({ catId }) => {
  const ac = ACADEMIC_CONTENT[catId];
  if (!ac) return null;
  const dotColor = { A: 'bg-rose-400', B: 'bg-amber-400', C: 'bg-blue-400', D: 'bg-emerald-400', E: 'bg-purple-400', F: 'bg-cyan-400' }[catId] || 'bg-gray-400';
  return (
    <div className="space-y-2">
      {ac.keyConceptsList.map((c, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className={`w-1.5 h-1.5 ${dotColor} rounded-full mt-1.5 shrink-0`} />
          <div>
            <span className="text-[11px] font-bold text-gray-800">{c.term}</span>
            <span className="text-[11px] text-gray-600"> — {c.definition}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

/* ─── SVG DİYAGRAMLAR ─── */

const TripleCodeDiagram = () => (
  <div className="bg-gradient-to-b from-blue-50 to-indigo-50 rounded-xl p-3">
    <svg viewBox="0 0 300 200" className="w-full" style={{ maxHeight: 180 }}>
      {/* Bağlantı okları */}
      <line x1="150" y1="60" x2="60" y2="150" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4,3" />
      <line x1="150" y1="60" x2="240" y2="150" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4,3" />
      <line x1="60" y1="155" x2="240" y2="155" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4,3" />
      {/* Transcoding etiketleri */}
      <text x="95" y="100" fontSize="7" fill="#64748B" textAnchor="middle" transform="rotate(-35,95,100)">Transcoding</text>
      <text x="205" y="100" fontSize="7" fill="#64748B" textAnchor="middle" transform="rotate(35,205,100)">Transcoding</text>
      <text x="150" y="172" fontSize="7" fill="#64748B" textAnchor="middle">Transcoding</text>
      {/* Analog Büyüklük Kodu */}
      <rect x="95" y="15" width="110" height="50" rx="12" fill="#F43F5E" opacity="0.9" />
      <text x="150" y="35" fontSize="9" fill="white" textAnchor="middle" fontWeight="bold">Analog Büyüklük</text>
      <text x="150" y="47" fontSize="7" fill="white" textAnchor="middle" opacity="0.85">Kodu</text>
      <text x="150" y="58" fontSize="6" fill="white" textAnchor="middle" opacity="0.7">intraparietal sulkus</text>
      {/* Görsel-Arap Kodu */}
      <rect x="5" y="125" width="110" height="50" rx="12" fill="#3B82F6" opacity="0.9" />
      <text x="60" y="145" fontSize="9" fill="white" textAnchor="middle" fontWeight="bold">Görsel-Arap</text>
      <text x="60" y="157" fontSize="7" fill="white" textAnchor="middle" opacity="0.85">Kodu</text>
      <text x="60" y="168" fontSize="6" fill="white" textAnchor="middle" opacity="0.7">oksipitotemporal korteks</text>
      {/* İşitsel-Sözel Kod */}
      <rect x="185" y="125" width="110" height="50" rx="12" fill="#10B981" opacity="0.9" />
      <text x="240" y="145" fontSize="9" fill="white" textAnchor="middle" fontWeight="bold">İşitsel-Sözel</text>
      <text x="240" y="157" fontSize="7" fill="white" textAnchor="middle" opacity="0.85">Kod</text>
      <text x="240" y="168" fontSize="6" fill="white" textAnchor="middle" opacity="0.7">sol angular girus</text>
      {/* Merkez etiketi */}
      <text x="150" y="7" fontSize="8" fill="#334155" textAnchor="middle" fontWeight="bold">Dehaene Üçlü Kodlama Modeli</text>
    </svg>
  </div>
);

const VanHieleDiagram = () => {
  const levels = [
    { label: 'Düzey 4: Rigor', w: 100, color: '#064E3B' },
    { label: 'Düzey 3: Formel Çıkarım', w: 140, color: '#065F46' },
    { label: 'Düzey 2: İlişkilendirme', w: 180, color: '#047857' },
    { label: 'Düzey 1: Analiz', w: 220, color: '#059669' },
    { label: 'Düzey 0: Görselleştirme', w: 260, color: '#10B981' },
  ];
  return (
    <div className="bg-gradient-to-b from-emerald-50 to-green-50 rounded-xl p-3">
      <div className="text-[9px] font-bold text-center text-gray-600 mb-2">Van Hiele Geometrik Düşünce Düzeyleri</div>
      <svg viewBox="0 0 300 150" className="w-full" style={{ maxHeight: 140 }}>
        {levels.map((lv, i) => (
          <g key={i}>
            <rect x={(300 - lv.w) / 2} y={i * 28 + 5} width={lv.w} height={24} rx="6" fill={lv.color} />
            <text x="150" y={i * 28 + 21} fontSize="8.5" fill="white" textAnchor="middle" fontWeight="bold">{lv.label}</text>
          </g>
        ))}
        <text x="8" y="80" fontSize="7" fill="#6B7280" textAnchor="start" transform="rotate(-90,8,80)">
          Öğretime bağlı ilerleme →
        </text>
      </svg>
    </div>
  );
};

const CRADiagram = () => (
  <div className="bg-gradient-to-b from-purple-50 to-fuchsia-50 rounded-xl p-3">
    <div className="text-[9px] font-bold text-center text-gray-600 mb-2">CRA Pedagojik Çerçevesi</div>
    <div className="flex items-center justify-center gap-1">
      {[
        { label: 'Somut', sub: 'Nesne & Manipulatif', icon: '🧱', color: 'from-purple-500 to-purple-600' },
        { label: 'Temsili', sub: 'Görsel Model', icon: '📊', color: 'from-fuchsia-500 to-fuchsia-600' },
        { label: 'Soyut', sub: 'Sembol & İşlem', icon: '🔢', color: 'from-pink-500 to-pink-600' },
      ].map((step, i) => (
        <React.Fragment key={i}>
          <div className={`bg-gradient-to-b ${step.color} rounded-xl px-3 py-2.5 text-center text-white flex-1`}>
            <div className="text-xl mb-0.5">{step.icon}</div>
            <div className="text-[10px] font-bold">{step.label}</div>
            <div className="text-[7px] opacity-80">{step.sub}</div>
          </div>
          {i < 2 && <div className="text-gray-400 text-lg font-bold shrink-0">{"→"}</div>}
        </React.Fragment>
      ))}
    </div>
    <div className="text-[8px] text-gray-500 text-center mt-1.5 italic">Concrete → Representational → Abstract</div>
  </div>
);

const ANSDiagram = () => (
  <div className="bg-gradient-to-b from-amber-50 to-orange-50 rounded-xl p-3">
    <div className="text-[9px] font-bold text-center text-gray-600 mb-2">Yaklaşık Sayı Sistemi (YSS) ve Weber Oranı</div>
    <svg viewBox="0 0 300 120" className="w-full" style={{ maxHeight: 110 }}>
      {/* Kolay ayırım */}
      <text x="75" y="12" fontSize="7.5" fill="#92400E" textAnchor="middle" fontWeight="bold">Kolay ayırım (8:16)</text>
      <path d="M20,70 Q40,20 60,70" stroke="#F59E0B" strokeWidth="2" fill="none" />
      <path d="M70,70 Q90,20 110,70" stroke="#D97706" strokeWidth="2" fill="none" />
      <text x="40" y="80" fontSize="7" fill="#92400E" textAnchor="middle">8</text>
      <text x="90" y="80" fontSize="7" fill="#92400E" textAnchor="middle">16</text>
      {/* Zor ayırım */}
      <text x="225" y="12" fontSize="7.5" fill="#92400E" textAnchor="middle" fontWeight="bold">Zor ayırım (8:9)</text>
      <path d="M180,70 Q205,20 230,70" stroke="#F59E0B" strokeWidth="2" fill="none" />
      <path d="M200,70 Q225,20 250,70" stroke="#D97706" strokeWidth="2" fill="none" />
      <text x="205" y="80" fontSize="7" fill="#92400E" textAnchor="middle">8</text>
      <text x="225" y="80" fontSize="7" fill="#92400E" textAnchor="middle">9</text>
      {/* Alt açıklama */}
      <text x="150" y="100" fontSize="7" fill="#78716C" textAnchor="middle">Weber oranı küçüldükçe → ayırt etme zorlaşır</text>
      <text x="150" y="112" fontSize="6.5" fill="#9CA3AF" textAnchor="middle" fontStyle="italic">YSS hassasiyeti gelişimle ve pratikle artar</text>
    </svg>
  </div>
);

const SubitizingProgressionDiagram = () => {
  const stages = [
    { label: 'Algısal\ntanıma', sub: '1-3', color: '#FDA4AF' },
    { label: 'Zar\ndeseni', sub: '1-6', color: '#FB7185' },
    { label: 'Beşlik\nçerçeve', sub: '1-10', color: '#F43F5E' },
    { label: 'Onluk\nçerçeve', sub: '1-20', color: '#E11D48' },
    { label: 'Gruplama\nstratejisi', sub: '5-9', color: '#BE123C' },
    { label: 'Esnek\nkavramsal', sub: '1-20+', color: '#9F1239' },
  ];
  return (
    <div className="bg-gradient-to-b from-rose-50 to-pink-50 rounded-xl p-3">
      <div className="text-[9px] font-bold text-center text-gray-600 mb-2">MacDonald-Wilkins Sanbil Gelişim Aşamaları</div>
      <div className="flex items-center gap-0.5 overflow-x-auto pb-1">
        {stages.map((s, i) => (
          <React.Fragment key={i}>
            <div className="text-center shrink-0">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: s.color }}>
                <div className="text-[7px] text-white font-bold leading-tight text-center whitespace-pre-line">{s.label}</div>
              </div>
              <div className="text-[7px] text-gray-500 mt-0.5">{s.sub}</div>
            </div>
            {i < stages.length - 1 && <span className="text-[8px] text-gray-400 shrink-0">{"→"}</span>}
          </React.Fragment>
        ))}
      </div>
      <div className="text-[8px] text-gray-500 text-center mt-1 italic">Algısal sanbil → Kavramsal sanbil gelişimi</div>
    </div>
  );
};

const ExecutiveFunctionsDiagram = () => (
  <div className="bg-gradient-to-b from-cyan-50 to-teal-50 rounded-xl p-3">
    <div className="text-[9px] font-bold text-center text-gray-600 mb-2">Yürütücü İşlevler Modeli (Diamond, 2013)</div>
    <svg viewBox="0 0 300 160" className="w-full" style={{ maxHeight: 150 }}>
      {/* Üç daire */}
      <circle cx="120" cy="75" r="55" fill="#06B6D4" opacity="0.2" stroke="#06B6D4" strokeWidth="1.5" />
      <circle cx="180" cy="75" r="55" fill="#14B8A6" opacity="0.2" stroke="#14B8A6" strokeWidth="1.5" />
      <circle cx="150" cy="115" r="55" fill="#0EA5E9" opacity="0.2" stroke="#0EA5E9" strokeWidth="1.5" />
      {/* Etiketler */}
      <text x="95" y="55" fontSize="8" fill="#0E7490" textAnchor="middle" fontWeight="bold">Çalışma</text>
      <text x="95" y="65" fontSize="8" fill="#0E7490" textAnchor="middle" fontWeight="bold">Belleği</text>
      <text x="205" y="55" fontSize="8" fill="#0F766E" textAnchor="middle" fontWeight="bold">İnhibisyon</text>
      <text x="150" y="140" fontSize="8" fill="#0369A1" textAnchor="middle" fontWeight="bold">Bilişsel Esneklik</text>
      {/* Merkez */}
      <text x="150" y="87" fontSize="7" fill="#334155" textAnchor="middle" fontWeight="bold">Yürütücü</text>
      <text x="150" y="97" fontSize="7" fill="#334155" textAnchor="middle" fontWeight="bold">İşlevler</text>
    </svg>
  </div>
);

const FrameworkVisualSection = ({ type }) => {
  switch (type) {
    case 'triplecode': return <TripleCodeDiagram />;
    case 'vanhiele': return <VanHieleDiagram />;
    case 'cra': return <CRADiagram />;
    case 'ans': return <ANSDiagram />;
    case 'subitizing-progression': return <SubitizingProgressionDiagram />;
    case 'executive': return <ExecutiveFunctionsDiagram />;
    default: return null;
  }
};

/* ─── BECERİ HARİTASI ─── */

const getSkillsForCategory = (catId) => {
  const skills = [];
  Object.entries(SKILL_GRAPH).forEach(([key, skill]) => {
    const hasGame = skill.games.some(gId => GAMES[gId]?.cat === catId);
    if (hasGame) skills.push({ key, ...skill });
  });
  return skills;
};

const SkillMapSection = ({ catId }) => {
  const skills = getSkillsForCategory(catId);
  if (skills.length === 0) return null;
  const color = { A: 'bg-rose-100 text-rose-800 border-rose-300', B: 'bg-amber-100 text-amber-800 border-amber-300', C: 'bg-blue-100 text-blue-800 border-blue-300', D: 'bg-emerald-100 text-emerald-800 border-emerald-300', E: 'bg-purple-100 text-purple-800 border-purple-300', F: 'bg-cyan-100 text-cyan-800 border-cyan-300' }[catId] || '';

  return (
    <div className="space-y-1.5">
      {skills.map(skill => (
        <div key={skill.key} className="flex items-center gap-2">
          {skill.prereqs.length > 0 && (
            <div className="flex items-center gap-1 shrink-0">
              {skill.prereqs.map(p => {
                const ps = SKILL_GRAPH[p];
                return ps ? (
                  <span key={p} className="text-[8px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md border border-gray-200">{ps.name}</span>
                ) : null;
              })}
              <span className="text-gray-400 text-[10px]">{"→"}</span>
            </div>
          )}
          <span className={`text-[9px] font-bold px-2 py-1 rounded-lg border ${color}`}>{skill.name}</span>
          <span className="text-[8px] text-gray-400">({skill.games.filter(g => GAMES[g]?.cat === catId).join(', ')})</span>
        </div>
      ))}
    </div>
  );
};

/* ─── OYUN-KURAM EŞLEŞTİRMESİ ─── */

const getSkillNameForGame = (gameId) => {
  for (const [, skill] of Object.entries(SKILL_GRAPH)) {
    if (skill.games.includes(gameId)) return skill.name;
  }
  return '—';
};

const GameTheoryMappingSection = ({ games, catId }) => {
  const headerBg = { A: 'bg-rose-50', B: 'bg-amber-50', C: 'bg-blue-50', D: 'bg-emerald-50', E: 'bg-purple-50', F: 'bg-cyan-50' }[catId] || 'bg-gray-50';

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[10px] border-collapse">
        <thead>
          <tr className={headerBg}>
            <th className="text-left py-1.5 px-2 font-bold text-gray-700 border-b border-gray-200">Oyun</th>
            <th className="text-left py-1.5 px-2 font-bold text-gray-700 border-b border-gray-200">Kuramsal Hedef</th>
            <th className="text-left py-1.5 px-2 font-bold text-gray-700 border-b border-gray-200">Beceri</th>
          </tr>
        </thead>
        <tbody>
          {games.map(([id, g], i) => {
            const helpEntry = HELP_MAP[g.name];
            return (
              <tr key={id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                <td className="py-1.5 px-2 border-b border-gray-100 whitespace-nowrap">
                  <span className="mr-1">{g.emoji}</span>{g.name}
                </td>
                <td className="py-1.5 px-2 border-b border-gray-100 text-gray-600">
                  {helpEntry?.goal || '—'}
                </td>
                <td className="py-1.5 px-2 border-b border-gray-100 text-gray-500">
                  {getSkillNameForGame(id)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

/* ─── MÜDAHALE STRATEJİLERİ ─── */

const InterventionSection = ({ catId }) => {
  const ac = ACADEMIC_CONTENT[catId];
  if (!ac) return null;
  return (
    <div className="space-y-3">
      <div className="bg-red-50 border border-red-200 rounded-xl p-3">
        <div className="text-[10px] font-bold text-red-700 mb-1.5 flex items-center gap-1">
          <span className="w-2 h-2 bg-red-500 rounded-full" />
          Zayıf Performans Durumunda
        </div>
        <ol className="space-y-1">
          {ac.interventionSteps.weak.map((step, i) => (
            <li key={i} className="text-[10px] text-gray-700 leading-relaxed flex gap-2">
              <span className="text-red-400 font-bold shrink-0">{i + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="bg-green-50 border border-green-200 rounded-xl p-3">
        <div className="text-[10px] font-bold text-green-700 mb-1.5 flex items-center gap-1">
          <span className="w-2 h-2 bg-green-500 rounded-full" />
          Güçlü Performans Durumunda
        </div>
        <ol className="space-y-1">
          {ac.interventionSteps.strong.map((step, i) => (
            <li key={i} className="text-[10px] text-gray-700 leading-relaxed flex gap-2">
              <span className="text-green-400 font-bold shrink-0">{i + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

/* ─── AKADEMİK REFERANSLAR ─── */

const ReferencesSection = ({ catId }) => {
  const ac = ACADEMIC_CONTENT[catId];
  if (!ac) return null;
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <ol className="space-y-1.5">
        {ac.parsedRefs.map((ref, i) => (
          <li key={i} className="text-[10px] text-gray-600 leading-relaxed pl-3" style={{ textIndent: '-12px', marginLeft: '12px' }}>
            {ref.authors} ({ref.year}). <em className="text-gray-700">{ref.title}</em>.
          </li>
        ))}
      </ol>
    </div>
  );
};

/* ─── AKADEMİK PANEL (ORKESTRATÖR) ─── */

const AcademicPanel = ({ theory, catId, games }) => {
  const [openSections, setOpenSections] = useState({ framework: true, concepts: true, visual: true, skills: false, mapping: false, intervention: false, refs: false });
  const toggle = (key) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  const ac = ACADEMIC_CONTENT[catId];
  if (!ac) return null;

  const borderColor = { A: 'border-t-rose-500', B: 'border-t-amber-500', C: 'border-t-blue-500', D: 'border-t-emerald-500', E: 'border-t-purple-500', F: 'border-t-cyan-500' }[catId] || '';

  return (
    <div className={`bg-white rounded-xl border border-gray-200 border-t-4 ${borderColor} overflow-hidden`}>
      {/* Kitap bölümleri başlığı */}
      <div className="px-3 pt-3 pb-1">
        <div className="text-[9px] text-gray-400 uppercase tracking-widest mb-0.5">Kitap Referansı</div>
        {theory.chapters.map((ch, i) => (
          <div key={i} className="text-[10px] font-medium text-gray-700 leading-snug">{ch}</div>
        ))}
      </div>

      <div className="px-3 pb-3 space-y-0">
        {/* 1. Kuramsal Çerçeve */}
        <div className="border-t border-gray-100">
          <SectionHeader title="Kuramsal Çerçeve" icon="📖" isOpen={openSections.framework} onToggle={() => toggle('framework')} />
          {openSections.framework && <div className="pb-3"><TheoryFrameworkSection theory={theory.theory} catId={catId} /></div>}
        </div>

        {/* 2. Temel Kavramlar */}
        <div className="border-t border-gray-100">
          <SectionHeader title="Temel Kavramlar" icon="🔑" isOpen={openSections.concepts} onToggle={() => toggle('concepts')} />
          {openSections.concepts && <div className="pb-3"><KeyConceptsSection catId={catId} /></div>}
        </div>

        {/* 3. Kuramsal Model Görseli */}
        <div className="border-t border-gray-100">
          <SectionHeader title="Kuramsal Model" icon="🔬" isOpen={openSections.visual} onToggle={() => toggle('visual')} />
          {openSections.visual && <div className="pb-3"><FrameworkVisualSection type={ac.frameworkVisualType} /></div>}
        </div>

        {/* 4. Beceri Haritası */}
        <div className="border-t border-gray-100">
          <SectionHeader title="Beceri Haritası ve Önkoşullar" icon="🗺️" isOpen={openSections.skills} onToggle={() => toggle('skills')} />
          {openSections.skills && <div className="pb-3"><SkillMapSection catId={catId} /></div>}
        </div>

        {/* 5. Oyun-Kuram Eşleştirmesi */}
        <div className="border-t border-gray-100">
          <SectionHeader title="Oyun–Kuram Eşleştirmesi" icon="🎯" isOpen={openSections.mapping} onToggle={() => toggle('mapping')} />
          {openSections.mapping && <div className="pb-3"><GameTheoryMappingSection games={games} catId={catId} /></div>}
        </div>

        {/* 6. Müdahale Stratejileri */}
        <div className="border-t border-gray-100">
          <SectionHeader title="Müdahale Stratejileri" icon="📋" isOpen={openSections.intervention} onToggle={() => toggle('intervention')} />
          {openSections.intervention && <div className="pb-3"><InterventionSection catId={catId} /></div>}
        </div>

        {/* 7. Akademik Referanslar */}
        <div className="border-t border-gray-100">
          <SectionHeader title="Akademik Referanslar" icon="📚" isOpen={openSections.refs} onToggle={() => toggle('refs')} />
          {openSections.refs && <div className="pb-3"><ReferencesSection catId={catId} /></div>}
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   ANA BİLEŞEN
   ════════════════════════════════════════════════════════════════ */

const BookChapters = ({ onBack, onPlayGame, progress, isTeacher = false, focusedChapter = null }) => {
  const [expandedChapter, setExpandedChapter] = useState(focusedChapter);
  const [viewMode, setViewMode] = useState('child');
  const chapterRefs = useRef({});

  // Odaklanmış bölüm varsa aç ve scroll yap
  useEffect(() => {
    if (focusedChapter) {
      setExpandedChapter(focusedChapter);
      setTimeout(() => {
        const el = chapterRefs.current[focusedChapter];
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [focusedChapter]);

  // Spesifik oyun-bölüm eşlemesi kullanarak oyunları topla (daha doğru)
  const getChapterGames = (chapter) => {
    const gameIds = getGamesForChapter(chapter.num);
    const gameEntries = [];
    gameIds.forEach(id => {
      if (GAMES[id]) gameEntries.push([id, GAMES[id]]);
    });
    // Primary olanları önce göster
    gameEntries.sort((a, b) => {
      const aP = GAME_CHAPTER_MAP[a[0]]?.primary === chapter.num ? 0 : 1;
      const bP = GAME_CHAPTER_MAP[b[0]]?.primary === chapter.num ? 0 : 1;
      return aP - bP;
    });
    return gameEntries;
  };

  const getChapterTheory = (chapter) => {
    const theories = [];
    chapter.categories.forEach(catId => {
      const cm = CHAPTER_MAP[catId];
      if (cm && !theories.find(t => t.catId === catId)) {
        theories.push({ catId, ...cm });
      }
    });
    return theories;
  };

  return (
    <div className="h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50 flex flex-col overflow-hidden">
      <div className="w-full max-w-md mx-auto flex flex-col flex-1 min-h-0 p-3">

        {/* Üst Bar */}
        <div className="flex items-center justify-between mb-3 bg-white rounded-2xl shadow-md px-4 py-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white text-xl shadow-md">{"📚"}</div>
            <div>
              <div className="font-bold text-gray-800 text-sm">Kitap Bölümleri</div>
              <div className="text-xs text-amber-600">Teoriyi oku, pratikte uygula</div>
            </div>
          </div>
          <button onClick={onBack} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl font-medium text-sm hover:bg-gray-200 active:scale-95 transition-all">{"←"} Geri</button>
        </div>

        {/* Bakış açısı seçimi */}
        <div className="flex gap-1.5 mb-3 shrink-0">
          <button onClick={() => setViewMode('child')}
            className={`flex-1 py-2 rounded-xl font-medium text-sm transition-all ${viewMode === 'child' ? 'bg-amber-500 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
            {"🎒"} Öğrenci
          </button>
          <button onClick={() => setViewMode('academic')}
            className={`flex-1 py-2 rounded-xl font-medium text-sm transition-all ${viewMode === 'academic' ? 'bg-amber-500 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
            {"🎓"} Akademik
          </button>
        </div>

        {/* Bölüm Listesi */}
        <div className="flex-1 min-h-0 overflow-y-auto scroll-area">
          <div className="space-y-2 pb-20">
            {BOOK_CHAPTERS.map(chapter => {
              const isOpen = expandedChapter === chapter.num;
              const games = getChapterGames(chapter);
              const theories = getChapterTheory(chapter);
              const playedCount = games.filter(([id]) => progress?.[id]).length;
              const totalStars = games.reduce((s, [id]) => s + (progress?.[id]?.stars || 0), 0);
              const maxStars = games.length * 3;
              const masteryPct = maxStars > 0 ? Math.round((totalStars / maxStars) * 100) : 0;
              const isMastered = masteryPct >= 80;
              const isInProgress = playedCount > 0 && !isMastered;

              return (
                <div key={chapter.num} ref={el => { chapterRefs.current[chapter.num] = el; }} className={`rounded-2xl overflow-hidden shadow-lg ${focusedChapter === chapter.num ? 'ring-4 ring-amber-300 ring-offset-2' : ''}`}>
                  <button onClick={() => setExpandedChapter(isOpen ? null : chapter.num)}
                    className={`w-full py-3.5 px-4 bg-gradient-to-r ${chapter.color} text-white font-bold text-sm flex items-center gap-3 hover:opacity-95 transition-all active:scale-[0.99]`}>
                    <div className="relative w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-lg font-bold">
                      {chapter.num}
                      {isMastered && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center text-[8px] shadow-md border border-white">{"🏆"}</div>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm leading-tight">{chapter.title}</div>
                      <div className="text-[10px] opacity-90 font-normal mt-0.5">{chapter.subtitle}</div>
                      {playedCount > 0 && (
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                            <div className="h-full bg-white/80 rounded-full transition-all" style={{ width: `${masteryPct}%` }} />
                          </div>
                          <span className="text-[9px] opacity-90 font-bold">{masteryPct}%</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {isMastered ? (
                        <div className="text-[10px] bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-bold shadow-sm">{"🏆"} Usta</div>
                      ) : isInProgress ? (
                        <div className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{playedCount}/{games.length}</div>
                      ) : (
                        <div className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full opacity-80">Yeni</div>
                      )}
                      <span className={`transition-transform duration-300 text-lg ${isOpen ? 'rotate-180' : ''}`}>{"▾"}</span>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="bg-white border-x-2 border-b-2 border-amber-200 rounded-b-2xl">
                      {theories.map((theory, idx) => (
                        <div key={idx} className="p-3 border-b border-gray-100 last:border-b-0">
                          {viewMode === 'child' ? (
                            <div className="bg-blue-50 rounded-xl p-3">
                              <div className="flex items-start gap-2">
                                <span className="text-lg shrink-0">{"💡"}</span>
                                <div>
                                  <div className="text-xs font-bold text-blue-700 mb-1">Biliyor muydun?</div>
                                  <p className="text-sm text-gray-700 leading-relaxed">{theory.childTheory}</p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <AcademicPanel
                              theory={theory}
                              catId={theory.catId}
                              games={games.filter(([, g]) => g.cat === theory.catId)}
                            />
                          )}
                        </div>
                      ))}

                      {/* İlgili oyunlar */}
                      <div className="p-2">
                        <div className="text-xs font-bold text-gray-500 px-2 mb-1.5">{"🎮"} İlgili Oyunlar ({games.length})</div>
                        {games.map(([id, g]) => {
                          const gp = progress?.[id];
                          const cat = CATEGORIES.find(c => c.id === g.cat);
                          const showPremiumLock = shouldShowPremiumBadge(id);
                          return (
                            <div key={id} className="mx-1 mb-1">
                              <button onClick={() => onPlayGame(id)}
                                className="w-full py-2.5 px-3 bg-gray-50 hover:bg-white hover:shadow-md rounded-xl flex items-center gap-3 transition-all active:scale-[0.98]">
                                <span className="text-lg">{g.emoji}</span>
                                <div className="flex-1 text-left">
                                  <span className="font-semibold text-gray-800 text-sm">{g.name}</span>
                                  <div className="text-[10px] text-gray-400">{cat?.name}</div>
                                </div>
                                {showPremiumLock && <PremiumBadge size="sm" title="Kitap kodu ile açılır" />}
                                {gp ? (
                                  <div className="flex gap-0.5">{[1, 2, 3].map(i => <span key={i} className="text-sm">{i <= (gp.stars || 0) ? '⭐' : '☆'}</span>)}</div>
                                ) : (
                                  <span className="text-xs text-gray-400 bg-gray-200/50 px-2 py-0.5 rounded-full">Yeni</span>
                                )}
                                <span className="text-gray-300 text-lg">{"›"}</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <div className="text-center pt-3 pb-2">
              <p className="text-[10px] text-gray-400">{"📖"} Matematiksel Bilişin Temelleri</p>
              <p className="text-[10px] text-gray-300">Prof. Dr. Yılmaz Mutlu {"·"} Prof. Dr. Sinan Olkun</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { BOOK_CHAPTERS };
export default BookChapters;
