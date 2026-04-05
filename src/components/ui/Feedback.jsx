import React, { useEffect } from 'react';
import { playSound, vibrate, encourage } from '../../utils';

const Feedback = ({ isCorrect, answer, hint }) => {
  useEffect(() => { playSound(isCorrect ? 'correct' : 'wrong'); vibrate(isCorrect ? 50 : [30,50,30]); }, []);
  return (
    <div className={`text-center ${isCorrect ? 'anim-pop' : 'anim-shake'}`}>
      <div className={`text-2xl font-bold mb-2 ${isCorrect ? 'text-green-500' : 'text-orange-500'}`}>
        {isCorrect ? '\u2713 Do\u011Fru!' : `${encourage()} Cevap: ${answer}`}
      </div>
      {hint && <div className="bg-amber-50 p-3 rounded-xl text-sm text-amber-700 max-w-sm mx-auto anim-fade">\uD83D\uDCA1 {hint}</div>}
    </div>
  );
};

export default Feedback;
