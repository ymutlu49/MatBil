import React from 'react';

/**
 * PremiumBadge - Premium kademesindeki oyun/özellikler için görsel gösterge
 *
 * Faz 3: Sadece görsel — tıklama hala çalışır, oyun açılabilir.
 * Faz 4: Asıl kilit devreye girdiğinde tıklama kod giriş modalına yönlendirecek.
 *
 * Props:
 *  - size: 'sm' | 'md' (default: 'sm')
 *  - variant: 'lock' | 'premium' | 'pill' (default: 'lock')
 *  - title: hover tooltip
 */
const PremiumBadge = ({ size = 'sm', variant = 'lock', title = 'Premium oyun' }) => {
  if (variant === 'pill') {
    return (
      <span
        title={title}
        className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full font-bold border border-amber-200 ${size === 'md' ? 'text-[11px]' : 'text-[9px]'}`}
      >
        {"🔒"} Premium
      </span>
    );
  }

  if (variant === 'premium') {
    return (
      <span
        title={title}
        className={`inline-flex items-center justify-center px-1.5 py-0.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full font-bold shadow-sm ${size === 'md' ? 'text-[10px]' : 'text-[9px]'}`}
      >
        {"⭐"} Premium
      </span>
    );
  }

  // Default: lock (kompakt, dikkat çekmez)
  return (
    <span
      title={title}
      className={`inline-flex items-center justify-center rounded-full bg-amber-50 text-amber-600 border border-amber-200 ${size === 'md' ? 'w-6 h-6 text-xs' : 'w-5 h-5 text-[11px]'}`}
    >
      {"🔒"}
    </span>
  );
};

export default PremiumBadge;
