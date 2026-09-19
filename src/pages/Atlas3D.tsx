import { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Center, Html } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { useLoader } from '@react-three/fiber';
import { Crosshair, Activity, Layers, Sparkles, RefreshCw, ShieldCheck } from 'lucide-react';
import * as THREE from 'three';

const DENTAL_DB: Record<number, { name: string; jaw: string; group: string; roots: string; canals: string; features: string }> = {
  18: { name: 'Третий верхний правый моляр (зуб мудрости)', jaw: 'Верхняя', group: 'Моляры', roots: '1-3 (часто сросшиеся)', canals: '1-3 (атипичные)', features: 'Высокая вариабельность анатомии, частая дистопия, ретенция, полуретенция.' },
  17: { name: 'Второй верхний правый моляр', jaw: 'Верхняя', group: 'Моляры', roots: '3 (2 щечных, 1 небный)', canals: '3-4', features: 'Коронка меньше первого моляра, дистально-язычный бугорок часто редуцирован.' },
  16: { name: 'Первый верхний правый моляр', jaw: 'Верхняя', group: 'Моляры', roots: '3 (MB, DB, P)', canals: '3-4 (в 75% случаев есть MB2)', features: 'Ключевой зуб окклюзии по Энглю. Часто выражен бугорок Карабелли на небно-мезиальной поверхности.' },
  15: { name: 'Второй верхний правый премоляр', jaw: 'Верхняя', group: 'Премоляры', roots: '1', canals: '1 (редко 2)', features: 'Щечный и небный бугорки практически одинаковой высоты, овальная форма окклюзии.' },
  14: { name: 'Первый верхний правый премоляр', jaw: 'Верхняя', group: 'Премоляры', roots: '2 (щечный и небный) в 60%', canals: '2', features: 'Выраженная мезиальная борозда на коронке и корне, зона повышенного риска перфорации.' },
  13: { name: 'Верхний правый клык', jaw: 'Верхняя', group: 'Клыки', roots: '1 (до 30 мм в длину)', canals: '1', features: 'Мощный костный контрфорс, обеспечивает клыковое ведение при латеротрузии.' },
  12: { name: 'Боковой верхний правый резец', jaw: 'Верхняя', group: 'Резцы', roots: '1 (дистальный изгиб апекса)', canals: '1', features: 'Слепая ямка (foramen caecum) на небной поверхности — частая зона скрытого кариеса.' },
  11: { name: 'Центральный верхний правый резец', jaw: 'Верхняя', group: 'Резцы', roots: '1 (конусовидный прямой)', canals: '1', features: 'Широкая долотообразная коронка, главный эстетический ориентир улыбки.' },
  21: { name: 'Центральный верхний левый резец', jaw: 'Верхняя', group: 'Резцы', roots: '1', canals: '1', features: 'Симметричен зубу 11. Наклон режущего края задает ориентацию резцовой линии.' },
  22: { name: 'Боковой верхний левый резец', jaw: 'Верхняя', group: 'Резцы', roots: '1', canals: '1', features: 'Часто подвержен редукции и аномалиям формы (шиповидный резец).' },
  23: { name: 'Верхний левый клык', jaw: 'Верхняя', group: 'Клыки', roots: '1', canals: '1', features: 'Стратегический опорный зуб при ортопедической реабилитации.' },
  24: { name: 'Первый верхний левый премоляр', jaw: 'Верхняя', group: 'Премоляры', roots: '2', canals: '2', features: 'Разделение каналов происходит на уровне средней трети корня.' },
  25: { name: 'Второй верхний левый премоляр', jaw: 'Верхняя', group: 'Премоляры', roots: '1', canals: '1', features: 'Овальное сечение канала, истончение стенок в мезио-дистальном направлении.' },
  26: { name: 'Первый верхний левый моляр', jaw: 'Верхняя', group: 'Моляры', roots: '3', canals: '4 (MB1, MB2, DB, P)', features: 'Поиск MB2 канала строго обязателен под дентальным операционным микроскопом.' },
  27: { name: 'Второй верхний левый моляр', jaw: 'Верхняя', group: 'Моляры', roots: '3', canals: '3-4', features: 'Корни более сближены, чем у 26, небный корень часто отклонен дистально.' },
  28: { name: 'Третий верхний левый моляр', jaw: 'Верхняя', group: 'Моляры', roots: '1-3', canals: '1-3', features: 'Склонен к дистопии в сторону щеки или верхнечелюстного синуса.' },
  48: { name: 'Третий нижний правый моляр', jaw: 'Нижняя', group: 'Моляры', roots: '2 (часто изогнуты или слиты)', canals: '2-3', features: 'Частая причина перикоронита, ретенции и скученности фронтальных зубов.' },
  47: { name: 'Второй нижний правый моляр', jaw: 'Нижняя', group: 'Моляры', roots: '2 (мезиальный и дистальный)', canals: '3', features: 'Крестообразная фиссура на окклюзионной поверхности, 4 бугорка.' },
  46: { name: 'Первый нижний правый моляр', jaw: 'Нижняя', group: 'Моляры', roots: '2', canals: '3 (MB, ML, D)', features: 'Наибольшая коронка в постоянном прикусе, 5 бугорков (3 щечных, 2 язычных).' },
  45: { name: 'Второй нижний правый премоляр', jaw: 'Нижняя', group: 'Премоляры', roots: '1', canals: '1', features: 'Часто имеет 3 бугорка (1 щечный и 2 язычных), подковообразную фиссуру.' },
  44: { name: 'Первый нижний правый премоляр', jaw: 'Нижняя', group: 'Премоляры', roots: '1', canals: '1 (в 25% делится на 2)', features: 'Язычный бугорок значительно меньше щечного, коронка наклонена орально.' },
  43: { name: 'Нижний правый клык', jaw: 'Нижняя', group: 'Клыки', roots: '1', canals: '1 (редко 2)', features: 'Коронка уже, чем у верхнего клыка, плотный кортикальный слой лунки.' },
  42: { name: 'Боковой нижний правый резец', jaw: 'Нижняя', group: 'Резцы', roots: '1', canals: '1-2', features: 'Шире центрального нижнего резца, дистальный угол коронки закруглен.' },
  41: { name: 'Центральный нижний правый резец', jaw: 'Нижняя', group: 'Резцы', roots: '1', canals: '1 (сдавлен с боков)', features: 'Самый миниатюрный зуб человека, тонкий слой околопульпарного дентина.' },
  31: { name: 'Центральный нижний левый резец', jaw: 'Нижняя', group: 'Резцы', roots: '1', canals: '1', features: 'Абсолютно симметричная долотообразная форма, высокая уязвимость к стираемости.' },
  32: { name: 'Боковой нижний левый резец', jaw: 'Нижняя', group: 'Резцы', roots: '1', canals: '1-2', features: 'Веерообразное расширение корня в мезио-дистальной проекции.' },
  33: { name: 'Нижний левый клык', jaw: 'Нижняя', group: 'Клыки', roots: '1', canals: '1', features: 'Выраженный валик на вестибулярной поверхности.' },
  34: { name: 'Первый нижний левый премоляр', jaw: 'Нижняя', group: 'Премоляры', roots: '1', canals: '1-2', features: 'Поперечный эмалевый валик делит окклюзионную поверхность на две ямки.' },
  35: { name: 'Второй нижний левый премоляр', jaw: 'Нижняя', group: 'Премоляры', roots: '1', canals: '1', features: 'Круглая окклюзионная поверхность с глубокой центральной ямкой.' },
  36: { name: 'Первый нижний левый моляр', jaw: 'Нижняя', group: 'Моляры', roots: '2', canals: '3-4', features: 'Мезиальный корень содержит 2 канала (MB и ML), соединенных истмусом.' },
  37: { name: 'Второй нижний левый моляр', jaw: 'Нижняя', group: 'Моляры', roots: '2', canals: '3', features: 'Часто встречается С-образная форма каналов (C-shaped canals).' },
  38: { name: 'Третий нижний левый моляр', jaw: 'Нижняя', group: 'Моляры', roots: '2', canals: '2-3', features: 'Близкое предлежание к нижнечелюстному каналу (риск неврита n. alveolaris inferior).' },
};

// OBJ содержит по одному мешу на челюсть, а не отдельный меш на каждый зуб.
// Поэтому для номера используем точку попадания в координатах меша, а челюсть
// определяем по имени родительского объекта из OBJ, а не по высоте точки.
function getJawFromObject(object: THREE.Object3D): 'upper' | 'lower' | null {
  let current: THREE.Object3D | null = object;

  while (current) {
    const name = current.name.toLowerCase();
    if (name.includes('top_jaw') || name.includes('upper')) return 'upper';
    if (name.includes('bottom_jaw') || name.includes('lower')) return 'lower';
    current = current.parent;
  }

  return null;
}

// Точное определение зуба в локальных координатах меша
function calculateAccurateFDI(mesh: THREE.Mesh, hitWorldPoint: THREE.Vector3): number {
  const local = hitWorldPoint.clone();
  mesh.worldToLocal(local);

  const jaw = getJawFromObject(mesh);
  // Резервный вариант нужен только для моделей без именованных групп.
  const isUpper = jaw ? jaw === 'upper' : local.y > 0.024;

  // Определение номера зуба (1..8) по оси X меша (от резцов -0.033 до моляров +0.030)
  let tooth = 8;
  if (local.x < -0.029) {
    tooth = 1; // Центральные резцы
  } else if (local.x < -0.022) {
    tooth = 2; // Боковые резцы
  } else if (local.x < -0.013) {
    tooth = 3; // Клыки
  } else if (local.x < -0.004) {
    tooth = 4; // Первые премоляры
  } else if (local.x < 0.006) {
    tooth = 5; // Вторые премоляры
  } else if (local.x < 0.017) {
    tooth = 6; // Первые моляры ("шестерки")
  } else if (local.x < 0.026) {
    tooth = 7; // Вторые моляры ("семерки")
  } else {
    tooth = 8; // Третьи моляры (зубы мудрости)
  }

  // Определение стороны: в локальной системе координат пациента -Z это правая сторона, +Z это левая
  const isRight = local.z < 0;

  let quadrant = 1;
  if (isUpper) {
    quadrant = isRight ? 1 : 2;
  } else {
    quadrant = isRight ? 4 : 3;
  }

  return quadrant * 10 + tooth;
}

function PhotorealisticTeeth({ onSelect, onPointHit }: any) {
  const materials = useLoader(MTLLoader, '/3D_Model.mtl');
  const obj = useLoader(OBJLoader, '/3D_Model.obj', (loader) => {
    materials.preload();
    loader.setMaterials(materials);
  });

  return (
    <primitive
      object={obj}
      scale={35}
      onClick={(e: any) => {
        e.stopPropagation();
        const clickedMesh = e.object;
        const hit = e.point;

        // Рассчитываем точный FDI
        const fdi = calculateAccurateFDI(clickedMesh, hit);
        onSelect(fdi);
        onPointHit(hit);
      }}
      onPointerOver={(e: any) => {
        e.stopPropagation();
        document.body.style.cursor = 'crosshair';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'default';
      }}
    />
  );
}

function Reticle({ position, fdi }: { position: THREE.Vector3 | null; fdi: number }) {
  if (!position) return null;
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshBasicMaterial color="#00FF87" />
      </mesh>
      <Html position={[0, 0.16, 0]} center>
        <div className="bg-abyss/90 border border-nvidia-neon text-nvidia-neon font-mono font-bold text-xs px-2.5 py-0.5 rounded shadow-[0_0_15px_rgba(0,255,135,0.8)] pointer-events-none whitespace-nowrap animate-bounce">
          🎯 Зуб #{fdi}
        </div>
      </Html>
    </group>
  );
}

function Loader() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3 bg-abyss/90 border border-nvidia-neon/40 p-5 rounded-2xl backdrop-blur-xl text-center shadow-[0_0_30px_rgba(0,255,135,0.2)]">
        <RefreshCw className="animate-spin text-nvidia-neon" size={28} />
        <div className="font-mono text-xs text-nvidia-neon tracking-wider">ЗАГРУЗКА ТЕКСТУР И СЕТКИ ЧЕЛЮСТИ...</div>
        <p className="text-[11px] text-slate-400">Синхронизация параболы зубного ряда</p>
      </div>
    </Html>
  );
}

export default function Atlas3D() {
  const [selectedFdi, setSelectedFdi] = useState<number>(11);
  const [markerPos, setMarkerPos] = useState<THREE.Vector3 | null>(null);

  const tooth = DENTAL_DB[selectedFdi] || DENTAL_DB[11];

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-120px)] pb-12">
      <div className="w-full lg:w-2/3 flex flex-col gap-4">
        {/* Зубная формула FDI */}
        <div className="nvidia-card p-4 border-nvidia-neon/20">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[11px] font-mono text-slate-400 tracking-wider flex items-center gap-1.5">
              <Sparkles size={13} className="text-nvidia-neon" /> ЗУБНАЯ ФОРМУЛА FDI
            </span>
            <span className="text-xs font-mono font-bold text-nvidia-neon">ВЫБРАН: #{selectedFdi}</span>
          </div>

          <div className="mb-2">
            <div className="text-[10px] font-mono text-slate-500 mb-1">ВЕРХНЯЯ ЧЕЛЮСТЬ (18 — 28)</div>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {[18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28].map((fdi) => (
                <button
                  key={fdi}
                  onClick={() => setSelectedFdi(fdi)}
                  className={`w-8 h-8 rounded-lg font-mono text-xs font-bold transition-all ${
                    selectedFdi === fdi
                      ? 'bg-nvidia-neon text-abyss shadow-[0_0_15px_rgba(0,255,135,0.7)] scale-110'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:border-nvidia-neon/40 border border-white/5'
                  }`}
                >
                  {fdi}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-mono text-slate-500 mb-1">НИЖНЯЯ ЧЕЛЮСТЬ (48 — 38)</div>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {[48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38].map((fdi) => (
                <button
                  key={fdi}
                  onClick={() => setSelectedFdi(fdi)}
                  className={`w-8 h-8 rounded-lg font-mono text-xs font-bold transition-all ${
                    selectedFdi === fdi
                      ? 'bg-nvidia-neon text-abyss shadow-[0_0_15px_rgba(0,255,135,0.7)] scale-110'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:border-nvidia-neon/40 border border-white/5'
                  }`}
                >
                  {fdi}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3D Вьюпорт */}
        <div className="nvidia-card flex-1 min-h-[460px] relative overflow-hidden flex flex-col border-nvidia-neon/20">
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-abyss/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-nvidia-neon/40 text-xs font-mono text-nvidia-neon shadow-[0_0_15px_rgba(0,255,135,0.2)]">
            <Crosshair size={14} className="animate-spin text-nvidia-neon" />
            <span>ACCURATE RAYCASTING // READY</span>
          </div>

          <div className="flex-1 relative">
            <Canvas camera={{ position: [0, 1.2, 4], fov: 42 }}>
              <ambientLight intensity={0.9} />
              <directionalLight position={[10, 10, 10]} intensity={1.8} />
              <directionalLight position={[-10, 5, -5]} intensity={1.2} color="#60EFFF" />
              <pointLight position={[0, -2, 2]} intensity={0.8} color="#00FF87" />

              <gridHelper args={[20, 20, '#00FF87', '#1E293B']} position={[0, -1.5, 0]} />

              <Suspense fallback={<Loader />}>
                <Center>
                  <PhotorealisticTeeth onSelect={setSelectedFdi} onPointHit={setMarkerPos} />
                </Center>
                <Reticle position={markerPos} fdi={selectedFdi} />
              </Suspense>

              <OrbitControls enablePan={true} enableZoom={true} makeDefault />
            </Canvas>
          </div>

          <div className="p-3 bg-abyss/80 border-t border-white/5 flex justify-between items-center text-[11px] font-mono text-slate-400">
            <span>Кликните прямо по зубу на модели или выберите номер в формуле</span>
            <span className="text-nvidia-neon font-bold">ВЫБРАН #{selectedFdi}</span>
          </div>
        </div>
      </div>

      {/* Клинический протокол */}
      <div className="w-full lg:w-1/3 nvidia-card p-6 overflow-y-auto border-nvidia-neon/20 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-xs font-bold text-nvidia-neon bg-nvidia-dark border border-nvidia-neon/40 px-3 py-1 rounded-md shadow-[0_0_10px_rgba(0,255,135,0.3)]">
            FDI #{selectedFdi} • {tooth.group.toUpperCase()}
          </span>
          <span className="text-xs font-mono text-slate-400">{tooth.jaw.toUpperCase()} ЧЕЛЮСТЬ</span>
        </div>

        <h2 className="text-2xl font-black text-white mb-2 leading-tight">{tooth.name}</h2>
        <p className="text-slate-400 text-xs mb-5 font-mono leading-relaxed">{tooth.features}</p>

        <div className="space-y-4 text-xs font-mono">
          <div className="p-4 bg-white/[0.02] border border-white/10 rounded-xl space-y-2">
            <div className="text-nvidia-cyan font-bold flex items-center gap-1.5 text-sm">
              <Activity size={16} /> АНАТОМИЯ И ТОПОГРАФИЯ
            </div>
            <div className="text-slate-300">
              <span className="text-slate-500">Количество корней:</span>{' '}
              <span className="text-white font-bold">{tooth.roots}</span>
            </div>
            <div className="text-slate-300">
              <span className="text-slate-500">Система каналов:</span>{' '}
              <span className="text-white font-bold">{tooth.canals}</span>
            </div>
          </div>

          <div>
            <div className="text-nvidia-neon font-bold flex items-center gap-1.5 mb-2 text-sm">
              <Layers size={16} /> ЭТАПЫ РАЗРУШЕНИЯ И ТАКТИКА
            </div>
            <div className="space-y-2.5">
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-nvidia-neon/30 transition-colors">
                <span className="text-nvidia-neon font-semibold">1. Начальный кариес (Macula cariosa)</span>
                <p className="text-slate-400 text-[11px] mt-1">Очаговая деминерализация эмали. Реминерализующая терапия, глубокое фторирование, метод инфильтрации Icon.</p>
              </div>

              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-nvidia-cyan/30 transition-colors">
                <span className="text-nvidia-cyan font-semibold">2. Средний кариес дентина</span>
                <p className="text-slate-400 text-[11px] mt-1">Препарирование полости по Блэку, изоляция коффердамом, адгезивный протокол с послойным восстановлением анатомической формы.</p>
              </div>

              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-amber-400/30 transition-colors">
                <span className="text-amber-400 font-semibold">3. Глубокий кариес / Пульпит</span>
                <p className="text-slate-400 text-[11px] mt-1">Поражение околопульпарного дентина. При витальности — биокерамика (МТА). При пульпите — экстирпация, обтурация гуттаперчей.</p>
              </div>

              <div className="p-3 rounded-lg bg-white/[0.02] border border-red-500/20 hover:border-red-500/40 transition-colors">
                <span className="text-red-400 font-semibold">4. Полное разрушение коронки</span>
                <p className="text-slate-400 text-[11px] mt-1">Индекс ИРОПЗ &gt; 0.8. Культевая штифтовая вкладка / стекловолоконный штифт + безметалловая коронка из диоксида циркония E.max.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-white/5 text-[11px] text-slate-500 font-mono flex items-center gap-2">
          <ShieldCheck size={14} className="text-nvidia-neon shrink-0" />
          <span>Синхронизировано с учебной программой 3 курса.</span>
        </div>
      </div>
    </div>
  );
}
