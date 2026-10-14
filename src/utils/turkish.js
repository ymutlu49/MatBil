/**
 * Rakamla yazılan sayılara doğru Türkçe eki getirir: 3'ten, 6'dan, 5'e, 2'ye, 10'un, 3'er, 6'şar…
 *
 * Ek, sayının OKUNUŞUNUN son kelimesine göre seçilir (ünlü uyumu, ünsüz
 * benzeşmesi, kaynaştırma ünsüzü). Sabit "'den" / "'a" yazmak sayıların
 * çoğunda yanlış sonuç veriyordu (3'den, 5'a, 0'e).
 */

const BIRLER = ['', 'bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz'];
const ONLAR = ['', 'on', 'yirmi', 'otuz', 'kırk', 'elli', 'altmış', 'yetmiş', 'seksen', 'doksan'];

/** Sayının okunuşundaki son kelime: 13 → "üç", 40 → "kırk", 0 → "sıfır" */
export const sayiSonKelime = (n) => {
  const str = String(n);
  // Ondalık sayılar "iki virgül beş" diye okunur: son kelimeyi virgülden sonraki kısım belirler
  const parca = str.includes('.') ? str.split('.')[1] : str.replace('-', '');
  const k = Math.abs(parseInt(parca, 10));
  if (!Number.isFinite(k)) return '';
  if (k === 0) return 'sıfır';
  if (k % 10) return BIRLER[k % 10];
  if (k % 100) return ONLAR[Math.floor(k / 10) % 10];
  if (k % 1000) return 'yüz';
  if (k % 1e6) return 'bin';
  if (k % 1e9) return 'milyon';
  return 'milyar';
};

const UNLULER = 'aıoueiöü';
const sonUnlu = (kelime) => [...kelime].reverse().find((c) => UNLULER.includes(c)) || 'e';
const kalinMi = (u) => 'aıou'.includes(u);
const unluyleBiterMi = (kelime) => UNLULER.includes(kelime.slice(-1));
const sertSessizleBiterMi = (kelime) => 'fstkçşhp'.includes(kelime.slice(-1));
// Dar ünlü uyumu: a,ı → ı · e,i → i · o,u → u · ö,ü → ü
const darUnlu = (u) => ({ a: 'ı', ı: 'ı', e: 'i', i: 'i', o: 'u', u: 'u', ö: 'ü', ü: 'ü' }[u]);

/**
 * @param {string} kelime Son kelime (ör. "üç")
 * @param {'e'|'de'|'den'|'in'|'i'|'er'|'li'} ek
 *   e: yönelme (-e/-a/-ye/-ya) · de: bulunma · den: ayrılma · in: ilgi
 *   i: belirtme · er: üleştirme (-er/-ar/-şer/-şar) · li: -li/-lı/-lu/-lü
 */
export const kelimeEki = (kelime, ek) => {
  const u = sonUnlu(kelime);
  const genis = kalinMi(u) ? 'a' : 'e';
  const dar = darUnlu(u);
  const unlu = unluyleBiterMi(kelime);
  const d = sertSessizleBiterMi(kelime) ? 't' : 'd';
  switch (ek) {
    case 'e': return (unlu ? 'y' : '') + genis;
    case 'de': return d + genis;
    case 'den': return d + genis + 'n';
    case 'in': return (unlu ? 'n' : '') + dar + 'n';
    case 'i': return (unlu ? 'y' : '') + dar;
    case 'er': return (unlu ? 'ş' : '') + genis + 'r';
    case 'li': return 'l' + dar;
    default: throw new Error(`Bilinmeyen ek: ${ek}`);
  }
};

/** sayiEki(3, 'den') → "3'ten" · sayiEki(6, 'e') → "6'ya" · sayiEki(2, 'er') → "2'şer" */
export const sayiEki = (n, ek) => `${n}'${kelimeEki(sayiSonKelime(n), ek)}`;
