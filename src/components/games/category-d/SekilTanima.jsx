import React, { useState } from 'react';
import { shuffle, TOTAL_ROUNDS } from '../../../utils';
import SVGShape from '../../ui/SVGShape';
import GameHeader from '../../ui/GameHeader';
import ResultScreen from '../../ui/ResultScreen';
import MenuScreen from '../../ui/MenuScreen';
import ReadyScreen from '../../ui/ReadyScreen';

const SHAPE_COLORS_STROKE = ['#EF4444','#3B82F6','#10B981','#F59E0B','#8B5CF6','#EC4899','#F97316','#06B6D4'];

const SekilTanima = ({ onBack, colors, onGameComplete, prevBest }) => {
  const [gs,setGs]=useState('menu');const [lv,setLv]=useState(1);const [sc,setSc]=useState(0);const [rd,setRd]=useState(0);
  const [targetType,setTargetType]=useState(null);const [shapes,setShapes]=useState([]);const [found,setFound]=useState([]);
  const [wrong,setWrong]=useState([]);const [rotatingId,setRotatingId]=useState(null);const [extraRot,setExtraRot]=useState({});

  const shapeTypes = ['cember','kare','ucgen','dikdortgen'];
  const shapeNames = {cember:'Çember',kare:'Kare',ucgen:'Üçgen',dikdortgen:'Dikdörtgen'};

  const isMatchingType = (shapeType, targetT) => {
    if(targetT === 'dikdortgen') return shapeType === 'dikdortgen' || shapeType === 'kare';
    return shapeType === targetT;
  };

  const getLevelConfig = (l) => {
    return {
      1: { sizeVar: false, rotVar: false, atypical: false, diagRot: false },
      2: { sizeVar: true, rotVar: false, atypical: false, diagRot: false },
      3: { sizeVar: true, rotVar: true, atypical: false, diagRot: true },
      4: { sizeVar: true, rotVar: true, atypical: true, diagRot: true },
      5: { sizeVar: true, rotVar: true, atypical: true, diagRot: true }
    }[l];
  };

  const genRound = (l) => {
    const cfg = getLevelConfig(l);
    const target = shapeTypes[Math.floor(Math.random()*shapeTypes.length)];
    setTargetType(target);
    setFound([]);
    setWrong([]);

    const allShapes = [];
    const targetCount = Math.floor(Math.random()*3)+2;
    const sizes = cfg.sizeVar ? [35,50,65] : [50];
    const rots = cfg.rotVar ? (cfg.diagRot ? [0,30,45,60,90,120,135,150,180,210,225,270,315] : [0,90,180,270]) : [0];

    for(let i=0;i<targetCount;i++){
      const sz = sizes[Math.floor(Math.random()*sizes.length)];
      const rot = rots[Math.floor(Math.random()*rots.length)];
      const col = SHAPE_COLORS_STROKE[Math.floor(Math.random()*SHAPE_COLORS_STROKE.length)];
      let sx=1, sy=1;
      if(cfg.atypical && Math.random()>0.5){
        if(target==='dikdortgen'){sx=Math.random()>0.5?0.5:1.5;}
        else if(target==='ucgen'){sy=Math.random()>0.5?0.6:1.4;}
      }
      allShapes.push({type:target,size:sz,rot,color:col,sx,sy,isTarget:true});
    }

    if(target === 'dikdortgen'){
      const extraSquares = Math.floor(Math.random()*2)+1;
      for(let i=0;i<extraSquares;i++){
        const sz = sizes[Math.floor(Math.random()*sizes.length)];
        const rot = rots[Math.floor(Math.random()*rots.length)];
        const col = SHAPE_COLORS_STROKE[Math.floor(Math.random()*SHAPE_COLORS_STROKE.length)];
        allShapes.push({type:'kare',size:sz,rot,color:col,sx:1,sy:1,isTarget:true});
      }
    }

    const totalTarget = allShapes.length;
    const otherCount = Math.max(6, 8+l*2-totalTarget);
    const otherTypes = target === 'dikdortgen'
      ? shapeTypes.filter(t=>t!=='dikdortgen' && t!=='kare')
      : shapeTypes.filter(t=>t!==target);
    for(let i=0;i<otherCount;i++){
      const t = otherTypes[Math.floor(Math.random()*otherTypes.length)];
      const sz = sizes[Math.floor(Math.random()*sizes.length)];
      const rot = rots[Math.floor(Math.random()*rots.length)];
      const col = SHAPE_COLORS_STROKE[Math.floor(Math.random()*SHAPE_COLORS_STROKE.length)];
      allShapes.push({type:t,size:sz,rot,color:col,sx:1,sy:1,isTarget:false});
    }

    setShapes(shuffle(allShapes).map((s,i)=>({...s,id:i})));
  };

  const prepG=(l)=>{setLv(l);setGs('ready');};
  const startG=(l)=>{setLv(l);setSc(0);setRd(1);genRound(l);setGs('playing');};

  const handleClick=(shape)=>{
    if(found.includes(shape.id)){
      setExtraRot(prev=>({...prev,[shape.id]:((prev[shape.id]||0)+45)%360}));
      return;
    }
    if(wrong.includes(shape.id))return;
    if(shape.isTarget){
      const nf=[...found,shape.id];setFound(nf);setSc(s=>s+10*lv);
      if(nf.length===shapes.filter(s=>s.isTarget).length){
        setTimeout(()=>{if(rd<TOTAL_ROUNDS){setRd(r=>r+1);genRound(lv);}else setGs('results');},800);
      }
    } else {
      setWrong(w=>[...w,shape.id]);
      setTimeout(()=>setWrong(w=>w.filter(x=>x!==shape.id)),1200);
    }
  };

  if(gs==='menu') return <MenuScreen onBack={onBack} onStart={prepG} title="Şekli Tanıma" emoji="" description="İstenen şekli bul ve dokun! Renk, boyut veya döndürme değişse de şekli tanı." levels={['Düzey 1a (Temel şekiller)','Düzey 1b (Farklı boyutlar)','Düzey 1c (Eğik/döndürülmüş)','Düzey 1d (Orantısız şekiller)','Düzey 1e (Tam zorluk)']} colors={colors}/>;
  if(gs==='ready') return <ReadyScreen title="Şekli Tanıma" emoji="" level={lv} instruction="Çeşitli şekiller gösterilecek. İstenen geometrik şekli bul ve üzerine dokun! Renk veya boyut farklı olabilir." colors={colors} onStart={()=>startG(lv)} onBack={()=>setGs('menu')}/>;
  if(gs==='results') return <ResultScreen score={sc} onReplay={()=>startG(lv)} onBack={onBack} onLevelMenu={()=>setGs('menu')} colors={colors} onComplete={onGameComplete} level={lv} maxLevel={5} onNextLevel={startG} prevBest={prevBest}/>;

  const tc = shapes.filter(s=>s.isTarget).length;

  return (
    <div className={`h-screen ${colors?.bg} flex flex-col items-center p-3 overflow-hidden`}>
      <GameHeader onBack={onBack} onLevelMenu={()=>setGs('menu')} round={rd} score={sc} title="Şekli Tanıma" colors={colors}/>
      <div className="flex-1 flex flex-col items-center justify-center min-h-0">
      <div className="bg-white px-4 py-2 rounded-xl shadow mb-2 text-center"><span className="text-sm text-gray-500">Düzey 1: Görselleştirme — {['Temel','Boyut','Konumlanış','Karışık','Tam'][lv-1]}</span></div>

      <div className="bg-white px-6 py-3 rounded-xl shadow mb-3 flex items-center gap-3">
        <span className="text-gray-600">Bul:</span>
        <SVGShape type={targetType} size={40} color="#374151"/>
        <span className="font-bold text-lg">{shapeNames[targetType]}</span>
        {targetType==='dikdortgen' && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">Kare de sayılır!</span>}
        <span className="ml-2 bg-green-100 px-3 py-1 rounded-full text-green-700 text-sm">{found.length}/{tc}</span>
      </div>
      <div className="text-sm text-gray-600 mb-2">💡 {targetType==='dikdortgen' ? 'Her kare aynı zamanda bir dikdörtgendir!' : targetType==='kare' && lv>=3 ? 'Eğik duran kare hâlâ karedir! Özelliklerine odaklan: 4 eşit kenar, 4 dik açı.' : targetType==='ucgen' && lv>=3 ? 'Üçgen ters dursa da üçgendir! 3 kenar ve 3 açısı var mı?' : 'Renk, boyut veya döndürme değişse de şekli tanı! Yeşil şekle dokunarak döndürebilirsin.'}</div>

      <div className="grid grid-cols-4 gap-3 bg-white p-4 rounded-2xl shadow-xl">
        {shapes.map(s=>(
          <button key={s.id} onClick={()=>handleClick(s)} className={`w-20 h-20 flex items-center justify-center rounded-xl transition-all border-2 ${
            found.includes(s.id) ? 'bg-green-100 scale-90 border-green-400 cursor-pointer' :
            wrong.includes(s.id) ? 'bg-red-100 border-red-400 animate-pulse' :
            'bg-gray-50 hover:bg-gray-100 border-gray-200'}`}>
            <SVGShape type={s.type} size={s.size} color={s.color} rotation={(s.rot||0)+(extraRot[s.id]||0)} scaleX={s.sx} scaleY={s.sy}/>
          </button>
        ))}
      </div>

      </div>    </div>
  );
};

export default SekilTanima;
