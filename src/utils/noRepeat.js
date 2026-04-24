/**
 * noRepeat - Oyun sorularında ardışık tekrar engelleme yardımcıları
 *
 * Tüm oyunlar aynı pattern ile son N soruyu hatırlar ve aynı sorunun
 * peş peşe gelmesini engeller. Bu modül DRY (Don't Repeat Yourself)
 * prensibiyle merkezi hale getirir.
 *
 * Kullanım:
 *   import { useNoRepeat } from '../../utils/noRepeat';
 *
 *   const last = useNoRepeat(4); // son 4 soruyu hatırla
 *   const c = last.pick(() => Math.floor(Math.random() * 5) + 1);
 *   // c artık son 4 üretimde gelmemiş bir değerdir
 */

import { useRef } from 'react';

/**
 * Verilen üretim fonksiyonunu son N üretimle çakışmayacak şekilde çağırır.
 * Üretim çok küçük bir uzaydan ise (ör. 3 olasılık, history 5) sonsuz
 * döngüye girmemek için max 12 deneme yapılır, sonra son üretileni döndürür.
 *
 * @param {Array} historyArr - mutable history dizisi (useRef.current)
 * @param {number} keep - kaç eski üretim hatırlansın
 * @param {function} generator - değer üreten fonksiyon
 * @param {function} keyOf - değerden karşılaştırma anahtarı (default: identity)
 */
export const pickNoRepeat = (historyArr, keep, generator, keyOf = v => v) => {
  let value, key;
  for (let i = 0; i < 12; i++) {
    value = generator();
    key = keyOf(value);
    if (!historyArr.includes(key)) break;
  }
  historyArr.push(key);
  while (historyArr.length > keep) historyArr.shift();
  return value;
};

/**
 * React hook: history için useRef döndürür + pick yardımcısı sağlar.
 * @param {number} keep - hatırlanacak eski üretim sayısı (default: 4)
 */
export const useNoRepeat = (keep = 4) => {
  const ref = useRef([]);
  return {
    /** Tekrarsız değer seç */
    pick: (generator, keyOf) => pickNoRepeat(ref.current, keep, generator, keyOf),
    /** History'yi sıfırla (ör: yeni seviye başlarken) */
    reset: () => { ref.current = []; },
    /** Mevcut history'yi göster (debug) */
    peek: () => [...ref.current],
  };
};
