import React from 'react';

/**
 * Parmakla sayı gösterimi: kalkık parmaklar uzun ve koyu, kapalı parmaklar kısa ve açık renk.
 * Emojiler 3 ve 4'ü doğru gösteremiyordu (ör. 🖖 aslında beş parmak açık bir el).
 * Sayarken işaret parmağından başlanır, başparmak 5'te açılır.
 */
const FINGERS = [
  { x: 3, y: 20, h: 18 },  // başparmak
  { x: 13, y: 4, h: 30 },  // işaret
  { x: 21, y: 1, h: 33 },  // orta
  { x: 29, y: 3, h: 31 },  // yüzük
  { x: 37, y: 9, h: 25 },  // serçe
];
const ORDER = [1, 2, 3, 4, 0];

const Hand = ({ n, size }) => {
  const up = new Set(ORDER.slice(0, n));
  return (
    <svg width={size} height={size * 1.1} viewBox="0 0 46 50" aria-hidden="true">
      <rect x="9" y="28" width="35" height="20" rx="8" fill="#c7d2fe" />
      {FINGERS.map((f, i) => up.has(i)
        ? <rect key={i} x={f.x} y={f.y} width="7" height={f.h} rx="3.5" fill="#4f46e5" />
        : <rect key={i} x={f.x} y="24" width="7" height="9" rx="3.5" fill="#a5b4fc" />)}
    </svg>
  );
};

/** 1–10 arası sayıyı bir ya da iki elle gösterir. */
const FingerHand = ({ value, size = 40 }) => {
  const h1 = Math.min(value, 5);
  const h2 = value > 5 ? Math.min(value - 5, 5) : 0;
  return (
    <div className="flex gap-1 items-end" role="img" aria-label={`${value} parmak`}>
      {h1 > 0 && <Hand n={h1} size={size} />}
      {h2 > 0 && <Hand n={h2} size={size} />}
    </div>
  );
};

export default FingerHand;
