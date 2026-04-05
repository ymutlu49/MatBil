import React, { useEffect } from 'react';
import { playSound, vibrate, encourage } from '../../utils';

const Feedback = ({ isCorrect, answer, hint }) => {
  useEffect(() => { playSound(isCorrect ? 'correct' : 'wrong'); vibrate(isCorrect ? 50 : [30,50,30]); }, []);
  return (
    <div className={`text-center py-3 ${isCorrect ? 'anim-pop' : 'anim-shake'}`}>
      <div className={`text-3xl font-bold mb-2 rounded-2xl inline-block px-6 py-2 ${isCorrect ? 'bg-green-100 text-green-600' : 'bg-orange-50 text-orange-500'}`}>
        {isCorrect ? '🎉 Doğru!' : `${encourage()} Cevap: ${answer}`}
      </div>
      {hint && <div className="bg-amber-50 p-3 rounded-xl text-base text-amber-700 max-w-sm mx-auto mt-2 anim-fade">💡 {hint}</div>}
    </div>
  );
};

export default Feedback;
