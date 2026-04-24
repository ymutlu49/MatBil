import React, { useState, useEffect } from 'react';
import { getClasses, saveClass, removeClass, getClassStudents, addStudentToClass, removeStudentFromClass, generateId, getTeachers, changeTeacherPin } from '../../utils/auth';
import { getProgress } from '../../utils/progress';
import { GAMES } from '../../constants/games';
import { CHAPTER_MAP } from '../../constants/skillGraph';
import { BOOK_CHAPTERS } from './BookChapters';
import ReportScreen from './ReportScreen';

/**
 * Öğretmen Paneli
 * Sınıf yönetimi, öğrenci ekleme/çıkarma, raporlar
 */
const TeacherDashboard = ({ user, onLogout, onPlayAsStudent }) => {
  const [tab, setTab] = useState('classes'); // classes | students | report | settings
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [students, setStudents] = useState([]);
  const [newClassName, setNewClassName] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentAge, setNewStudentAge] = useState('');
  const [reportStudent, setReportStudent] = useState(null);
  const [msg, setMsg] = useState('');
  const [pinChange, setPinChange] = useState({ old: '', new1: '', new2: '' });
  const [pinMsg, setPinMsg] = useState('');

  const refresh = () => {
    const c = getClasses().filter(cl => cl.teacherId === user.id);
    setClasses(c);
    if (selectedClassId) {
      setStudents(getClassStudents(selectedClassId));
    }
  };

  useEffect(refresh, [selectedClassId]);

  const handleCreateClass = () => {
    if (!newClassName.trim()) return;
    const cls = {
      id: generateId('class'),
      name: newClassName.trim(),
      teacherId: user.id,
      studentIds: [],
      createdAt: new Date().toISOString(),
    };
    saveClass(cls);
    setNewClassName('');
    setSelectedClassId(cls.id);
    refresh();
    setMsg('Sınıf oluşturuldu!');
    setTimeout(() => setMsg(''), 2000);
  };

  const handleDeleteClass = (classId) => {
    removeClass(classId);
    if (selectedClassId === classId) { setSelectedClassId(null); setStudents([]); }
    refresh();
  };

  const handleAddStudent = () => {
    if (!newStudentName.trim() || !selectedClassId) return;
    addStudentToClass(selectedClassId, {
      name: newStudentName.trim(),
      age: newStudentAge.trim(),
    });
    setNewStudentName('');
    setNewStudentAge('');
    refresh();
    setMsg('Öğrenci eklendi!');
    setTimeout(() => setMsg(''), 2000);
  };

  const handleRemoveStudent = (studentId) => {
    if (!selectedClassId) return;
    removeStudentFromClass(selectedClassId, studentId);
    refresh();
  };

  const handlePinChange = async () => {
    const { verifyPin } = await import('../../utils/auth');
    const teacher = getTeachers().find(t => t.id === user.id);
    if (!teacher) return;
    const ok = await verifyPin(pinChange.old, teacher.pinHash);
    if (!ok) { setPinMsg('Mevcut PIN hatalı.'); return; }
    if (pinChange.new1.length < 4) { setPinMsg('Yeni PIN en az 4 haneli olmalı.'); return; }
    if (pinChange.new1 !== pinChange.new2) { setPinMsg('Yeni PIN\'ler eşleşmiyor.'); return; }
    await changeTeacherPin(user.id, pinChange.new1);
    setPinChange({ old: '', new1: '', new2: '' });
    setPinMsg('PIN başarıyla değiştirildi!');
    setTimeout(() => setPinMsg(''), 3000);
  };

  // Rapor görüntüleme
  if (reportStudent) {
    const progress = getProgress(reportStudent.id);
    return <ReportScreen user={reportStudent} progress={progress} onBack={() => setReportStudent(null)} onPDF={() => {}} />;
  }

  const selectedClass = classes.find(c => c.id === selectedClassId);

  return (
    <div className="h-screen bg-gradient-to-b from-indigo-50 via-blue-50 to-indigo-50 flex flex-col overflow-hidden">
      <div className="w-full max-w-lg mx-auto flex flex-col flex-1 min-h-0 p-3">

        {/* Üst Bar */}
        <div className="flex items-center justify-between mb-3 bg-white rounded-2xl shadow-md px-4 py-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {"👩‍🏫"}
            </div>
            <div>
              <div className="font-bold text-gray-800 text-sm">{user.name}</div>
              <div className="text-xs text-indigo-500">Öğretmen</div>
            </div>
          </div>
          <button onClick={onLogout}
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl font-medium text-sm hover:bg-gray-200 active:scale-95 transition-all">
            {"🚪"} Çıkış
          </button>
        </div>

        {/* Bildirim */}
        {msg && (
          <div className="shrink-0 mb-2 bg-green-50 border border-green-200 text-green-700 text-sm px-3 py-2 rounded-xl text-center anim-fade">{msg}</div>
        )}

        {/* Sekmeler */}
        <div className="flex gap-1.5 mb-3 shrink-0">
          {[
            { id: 'classes', label: '🏫 Sınıflar', },
            { id: 'students', label: '👨‍🎓 Öğrenciler' },
            { id: 'chapters', label: '📚 Bölümler' },
            { id: 'settings', label: '⚙️ Ayarlar' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all ${tab === t.id ? 'bg-indigo-500 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* İçerik */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {/* ─── SINIFLAR SEKMESİ ─── */}
          {tab === 'classes' && (
            <div className="space-y-3">
              {/* Sınıf Oluştur */}
              <div className="bg-white rounded-2xl shadow-sm p-4">
                <div className="text-sm font-bold text-gray-700 mb-2">{"➕"} Yeni Sınıf Oluştur</div>
                <div className="flex gap-2">
                  <input type="text" value={newClassName} onChange={e => setNewClassName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCreateClass()}
                    className="flex-1 px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-indigo-400 focus:outline-none" placeholder="Örn: 2-A Sınıfı" />
                  <button onClick={handleCreateClass} disabled={!newClassName.trim()}
                    className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${newClassName.trim() ? 'bg-indigo-500 text-white hover:bg-indigo-600 active:scale-95' : 'bg-gray-200 text-gray-400'}`}>
                    Oluştur
                  </button>
                </div>
              </div>

              {/* Sınıf Listesi */}
              {classes.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">{"🏫"}</div>
                  <div className="text-gray-500 text-sm">Henüz sınıf oluşturmadınız.</div>
                </div>
              ) : (
                classes.map(cls => (
                  <div key={cls.id}
                    className={`bg-white rounded-2xl shadow-sm p-4 border-2 transition-all cursor-pointer ${selectedClassId === cls.id ? 'border-indigo-400 ring-1 ring-indigo-200' : 'border-transparent hover:border-gray-200'}`}>
                    <div className="flex items-center justify-between" onClick={() => setSelectedClassId(cls.id)}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold">
                          {cls.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-gray-800 text-sm">{cls.name}</div>
                          <div className="text-xs text-gray-500">{cls.studentIds?.length || 0} öğrenci</div>
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <button onClick={(e) => { e.stopPropagation(); setSelectedClassId(cls.id); setTab('students'); }}
                          className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium hover:bg-indigo-100">
                          {"👨‍🎓"} Öğrenciler
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteClass(cls.id); }}
                          className="px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-medium hover:bg-red-100">
                          {"🗑️"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ─── ÖĞRENCİLER SEKMESİ ─── */}
          {tab === 'students' && (
            <div className="space-y-3">
              {/* Sınıf Seçimi */}
              {classes.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-3">
                  <select value={selectedClassId || ''} onChange={e => setSelectedClassId(e.target.value)}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-indigo-400 focus:outline-none bg-white">
                    <option value="">Sınıf seçin...</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.studentIds?.length || 0})</option>)}
                  </select>
                </div>
              )}

              {selectedClass && (
                <>
                  {/* Öğrenci Ekle */}
                  <div className="bg-white rounded-2xl shadow-sm p-4">
                    <div className="text-sm font-bold text-gray-700 mb-2">{"➕"} Öğrenci Ekle ({selectedClass.name})</div>
                    <div className="flex gap-2">
                      <input type="text" value={newStudentName} onChange={e => setNewStudentName(e.target.value)}
                        className="flex-1 px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-indigo-400 focus:outline-none" placeholder="Adı soyadı" />
                      <input type="number" value={newStudentAge} onChange={e => setNewStudentAge(e.target.value)}
                        className="w-16 px-2 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-indigo-400 focus:outline-none text-center" placeholder="Yaş" min="4" max="18" />
                      <button onClick={handleAddStudent} disabled={!newStudentName.trim()}
                        className={`px-4 py-2.5 rounded-xl font-bold text-sm ${newStudentName.trim() ? 'bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95' : 'bg-gray-200 text-gray-400'}`}>
                        {"✓"}
                      </button>
                    </div>
                  </div>

                  {/* Öğrenci Listesi */}
                  {students.length === 0 ? (
                    <div className="text-center py-6">
                      <div className="text-3xl mb-1">{"📭"}</div>
                      <div className="text-gray-500 text-sm">Bu sınıfta öğrenci yok.</div>
                    </div>
                  ) : (
                    students.map(s => {
                      const p = getProgress(s.id);
                      const stars = Object.values(p).reduce((sum, g) => sum + (g.stars || 0), 0);
                      const played = Object.keys(p).length;
                      return (
                        <div key={s.id} className="bg-white rounded-2xl shadow-sm p-3 flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center text-white font-bold">
                            {s.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-gray-800 text-sm">{s.name}</div>
                            <div className="text-xs text-gray-500">
                              {s.age && `${s.age} yaş · `}{"⭐"}{stars} · {played} oyun
                            </div>
                          </div>
                          <button onClick={() => onPlayAsStudent(s)}
                            className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-medium hover:bg-emerald-100"
                            title="Oyun oyna">
                            {"🎮"}
                          </button>
                          <button onClick={() => setReportStudent(s)}
                            className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium hover:bg-indigo-100">
                            {"📊"}
                          </button>
                          <button onClick={() => handleRemoveStudent(s.id)}
                            className="px-3 py-1.5 bg-red-50 text-red-400 rounded-lg text-xs font-medium hover:bg-red-100">
                            {"✕"}
                          </button>
                        </div>
                      );
                    })
                  )}
                </>
              )}

              {classes.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-3xl mb-2">{"🏫"}</div>
                  <div className="text-gray-500 text-sm">Önce bir sınıf oluşturun.</div>
                  <button onClick={() => setTab('classes')} className="mt-2 text-indigo-600 text-sm font-medium">Sınıf oluştur {"→"}</button>
                </div>
              )}
            </div>
          )}

          {/* ─── BÖLÜMLER SEKMESİ — Kitap bölüm bazlı analiz + Isı haritası ─── */}
          {tab === 'chapters' && selectedClass && (
            <div className="space-y-3">
              {/* Sınıf ısı haritası */}
              {students.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-4 overflow-x-auto">
                  <div className="text-sm font-bold text-gray-700 mb-3">{"🗺️"} Sınıf Bölüm Isı Haritası</div>
                  <div className="min-w-[500px]">
                    <table className="w-full text-[10px]">
                      <thead>
                        <tr>
                          <th className="text-left py-1 px-1 font-bold text-gray-600 sticky left-0 bg-white">Öğrenci</th>
                          {BOOK_CHAPTERS.map(ch => (
                            <th key={ch.num} className="text-center py-1 px-1 font-bold text-gray-500" title={ch.title}>
                              <div>B{ch.num}</div>
                              <div className="text-[8px] font-normal">{ch.emoji}</div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {students.map(s => {
                          const sp = getProgress(s.id);
                          return (
                            <tr key={s.id} className="border-t border-gray-50">
                              <td className="py-1.5 px-1 font-medium text-gray-700 sticky left-0 bg-white whitespace-nowrap">{s.name}</td>
                              {BOOK_CHAPTERS.map(ch => {
                                const chGames = [];
                                ch.categories.forEach(catId => {
                                  Object.entries(GAMES).forEach(([id, g]) => {
                                    if (g.cat === catId && !chGames.find(e => e === id)) chGames.push(id);
                                  });
                                });
                                const played = chGames.filter(id => sp[id]).length;
                                const total = chGames.length;
                                const avgStars = total > 0 ? chGames.reduce((sum, id) => sum + (sp[id]?.stars || 0), 0) / total : 0;
                                const pct = played > 0 ? Math.round((avgStars / 3) * 100) : 0;
                                const bg = played === 0 ? 'bg-gray-100' :
                                  pct >= 70 ? 'bg-green-200 text-green-800' :
                                  pct >= 40 ? 'bg-amber-200 text-amber-800' :
                                  'bg-red-200 text-red-800';
                                return (
                                  <td key={ch.num} className="py-1.5 px-1 text-center">
                                    <div className={`rounded-md px-1 py-0.5 font-bold ${bg}`}>
                                      {played === 0 ? '-' : `${pct}%`}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex gap-3 mt-2 text-[9px] text-gray-400">
                    <span className="flex items-center gap-1"><div className="w-3 h-2 bg-green-200 rounded" /> %70+</span>
                    <span className="flex items-center gap-1"><div className="w-3 h-2 bg-amber-200 rounded" /> %40-69</span>
                    <span className="flex items-center gap-1"><div className="w-3 h-2 bg-red-200 rounded" /> %0-39</span>
                    <span className="flex items-center gap-1"><div className="w-3 h-2 bg-gray-100 rounded" /> Oynanmadı</span>
                  </div>
                </div>
              )}

              {/* Bölüm bazlı performans */}
              {BOOK_CHAPTERS.map(ch => {
                const chGames = [];
                ch.categories.forEach(catId => {
                  Object.entries(GAMES).forEach(([id, g]) => {
                    if (g.cat === catId && !chGames.find(e => e === id)) chGames.push(id);
                  });
                });
                // Sınıf ortalaması
                let classAvgStars = 0;
                let classPlayed = 0;
                students.forEach(s => {
                  const sp = getProgress(s.id);
                  chGames.forEach(id => {
                    if (sp[id]) { classAvgStars += sp[id].stars || 0; classPlayed++; }
                  });
                });
                const avgPct = classPlayed > 0 ? Math.round((classAvgStars / (classPlayed * 3)) * 100) : 0;
                const attemptedStudents = students.filter(s => {
                  const sp = getProgress(s.id);
                  return chGames.some(id => sp[id]);
                }).length;
                const theory = ch.categories.map(c => CHAPTER_MAP[c]).filter(Boolean)[0];

                return (
                  <div key={ch.num} className="bg-white rounded-2xl shadow-sm p-3">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-9 h-9 bg-gradient-to-br ${ch.color} rounded-xl flex items-center justify-center text-white font-bold text-sm`}>{ch.num}</div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-800 text-sm">{ch.title}</div>
                        <div className="text-[10px] text-gray-400">{ch.subtitle}</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-bold ${avgPct >= 70 ? 'text-green-600' : avgPct >= 40 ? 'text-amber-600' : avgPct > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                          {avgPct > 0 ? `%${avgPct}` : '-'}
                        </div>
                        <div className="text-[9px] text-gray-400">{attemptedStudents}/{students.length} öğrenci</div>
                      </div>
                    </div>
                    {/* Ilerleme cubugu */}
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                      <div className={`h-full rounded-full transition-all ${avgPct >= 70 ? 'bg-green-400' : avgPct >= 40 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${avgPct}%` }} />
                    </div>
                    {/* Müdahale önerileri */}
                    {theory && avgPct > 0 && avgPct < 60 && (
                      <div className="bg-red-50 rounded-lg p-2 text-[10px] text-red-700 leading-relaxed">
                        <span className="font-bold">{"⚠️"} Öneri:</span> {theory.weakMsg.substring(0, 200)}...
                      </div>
                    )}
                    {theory && avgPct >= 60 && (
                      <div className="bg-green-50 rounded-lg p-2 text-[10px] text-green-700 leading-relaxed">
                        <span className="font-bold">{"✓"} Durum:</span> {theory.strongMsg.substring(0, 150)}...
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'chapters' && !selectedClass && (
            <div className="text-center py-8">
              <div className="text-3xl mb-2">{"📚"}</div>
              <div className="text-gray-500 text-sm">Bölüm analizini görmek için bir sınıf seçin.</div>
              <button onClick={() => setTab('classes')} className="mt-2 text-indigo-600 text-sm font-medium">Sınıf seçin {"→"}</button>
            </div>
          )}

          {/* ─── AYARLAR SEKMESİ ─── */}
          {tab === 'settings' && (
            <div className="space-y-3">
              {/* PIN Değiştir */}
              <div className="bg-white rounded-2xl shadow-sm p-4">
                <div className="text-sm font-bold text-gray-700 mb-3">{"🔐"} PIN Değiştir</div>
                {pinMsg && (
                  <div className={`text-xs px-3 py-2 rounded-xl mb-2 text-center ${pinMsg.includes('başarı') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{pinMsg}</div>
                )}
                <div className="space-y-2">
                  <input type="password" inputMode="numeric" value={pinChange.old} onChange={e => setPinChange({ ...pinChange, old: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm text-center tracking-[0.3em] focus:border-indigo-400 focus:outline-none" placeholder="Mevcut PIN" maxLength={8} />
                  <input type="password" inputMode="numeric" value={pinChange.new1} onChange={e => setPinChange({ ...pinChange, new1: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm text-center tracking-[0.3em] focus:border-indigo-400 focus:outline-none" placeholder="Yeni PIN" maxLength={8} />
                  <input type="password" inputMode="numeric" value={pinChange.new2} onChange={e => setPinChange({ ...pinChange, new2: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm text-center tracking-[0.3em] focus:border-indigo-400 focus:outline-none" placeholder="Yeni PIN Tekrar" maxLength={8} />
                  <button onClick={handlePinChange}
                    className="w-full py-2.5 bg-indigo-500 text-white rounded-xl font-medium text-sm hover:bg-indigo-600 active:scale-95 transition-all">
                    PIN Güncelle
                  </button>
                </div>
              </div>

              {/* Bilgi */}
              <div className="bg-white rounded-2xl shadow-sm p-4">
                <div className="text-sm font-bold text-gray-700 mb-2">{"ℹ️"} Hesap Bilgileri</div>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Ad: {user.name}</div>
                  <div>Sınıf sayısı: {classes.length}</div>
                  <div>Toplam öğrenci: {classes.reduce((s, c) => s + (c.studentIds?.length || 0), 0)}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
