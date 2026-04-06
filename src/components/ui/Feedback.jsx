import React, { useEffect } from 'react';
import { playSound, vibrate, encourage } from '../../utils';

/**
 * Geri Bildirim Bileşeni
 *
 * gentle prop: Kaygı azaltma modu — shake yerine fade animasyon
 */
const Feedback = ({ isCorrect, answer, hint, gentle }) => {
  useEffect(() => { playSound(isCorrect ? 'correct' : 'wrong'); vibrate(isCorrect ? 50 : [30,50,30]); }, []);
  return (
    <div className={`text-center py-3 ${isCorrect ? 'anim-pop' : gentle ? 'anim-fade' : 'anim-shake'}`}
      role="alert" aria-live="assertive"
      aria-label={isCorrect ? 'Doğru cevap' : `Yanlış cevap. Doğru cevap: ${answer}`}>
      <div className={`text-2xl font-bold mb-2 rounded-2xl inline-block px-6 py-2.5 shadow-md ${isCorrect ? 'bg-green-100 text-green-600 border border-green-200' : 'bg-orange-50 text-orange-500 border border-orange-200'}`}>
        {isCorrect ? '🎉 Doğru!' : `${encourage()} Cevap: ${answer}`}
      </div>
      {hint && <div className="bg-amber-50 p-3 rounded-2xl text-sm text-amber-700 max-w-sm mx-auto mt-2 anim-fade border border-amber-200 shadow-sm" role="note">{"💡"} {hint}</div>}
    </div>
  );
};

export default Feedback;
