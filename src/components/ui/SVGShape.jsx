import React from 'react';

const SVGShape = ({type, size=50, color='#3B82F6', rotation=0, scaleX=1, scaleY=1}) => {
  const sw = 3;
  const s = size;
  const cx = s/2, cy = s/2, r = s/2 - 4;
  const style = {transform:`rotate(${rotation}deg) scaleX(${scaleX}) scaleY(${scaleY})`,transformOrigin:'center'};

  if (type === 'cember') return <svg width={s} height={s} style={{overflow:'visible'}}><g style={style}><circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={sw}/></g></svg>;
  if (type === 'kare') {const m=sw+2;return <svg width={s} height={s} style={{overflow:'visible'}}><g style={style}><rect x={m} y={m} width={s-m*2} height={s-m*2} fill="none" stroke={color} strokeWidth={sw}/></g></svg>;}
  if (type === 'ucgen') {const pts=`${s/2},${sw+2} ${s-sw-2},${s-sw-2} ${sw+2},${s-sw-2}`;return <svg width={s} height={s} style={{overflow:'visible'}}><g style={style}><polygon points={pts} fill="none" stroke={color} strokeWidth={sw}/></g></svg>;}
  if (type === 'dikdortgen') {const m=sw+2;const w=s*1.5;const h=s;return <svg width={w} height={h} style={{overflow:'visible'}}><g style={{...style,transformOrigin:`${w/2}px ${h/2}px`}}><rect x={m} y={m} width={w-m*2} height={h-m*2} fill="none" stroke={color} strokeWidth={sw}/></g></svg>;}
  return null;
};

export default SVGShape;
