import { useMemo, type ReactElement } from 'react';
import { motion } from 'framer-motion';
import { useBedtime } from './BedtimeContext';

type WorldType = 'forest' | 'ocean' | 'mountains' | 'arctic';

interface WorldSceneProps {
  world: WorldType;
  className?: string;
}

function Sun() {
  return (
    <motion.div
      className="absolute top-6 right-10 w-14 h-14 rounded-full bg-sun"
      animate={{
        boxShadow: [
          '0 0 30px 10px rgba(245, 197, 66, 0.3)',
          '0 0 50px 20px rgba(245, 197, 66, 0.45)',
          '0 0 30px 10px rgba(245, 197, 66, 0.3)',
        ],
      }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

function Moon() {
  return (
    <motion.div
      className="absolute top-6 right-10 w-12 h-12 rounded-full bg-[#e8dcc0]"
      animate={{
        boxShadow: [
          '0 0 20px 8px rgba(232, 220, 192, 0.2)',
          '0 0 35px 15px rgba(232, 220, 192, 0.35)',
          '0 0 20px 8px rgba(232, 220, 192, 0.2)',
        ],
      }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <div className="absolute top-2 left-3 w-2.5 h-2.5 rounded-full bg-[#d4c8a8] opacity-40" />
      <div className="absolute top-5 left-6 w-1.5 h-1.5 rounded-full bg-[#d4c8a8] opacity-30" />
    </motion.div>
  );
}

function CelestialBody() {
  const { isBedtime } = useBedtime();
  return isBedtime ? <Moon /> : <Sun />;
}

function Stars() {
  const { isBedtime } = useBedtime();

  const positions = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        top: `${8 + ((i * 17 + 5) % 40)}%`,
        left: `${5 + ((i * 23 + 11) % 85)}%`,
        delay: (i * 0.4) % 2.5,
        duration: 2 + (i % 3),
      })),
    [],
  );

  if (!isBedtime) return null;

  return (
    <>
      {positions.map((star, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-white"
          style={{ top: star.top, left: star.left }}
          animate={{ opacity: [0.2, 0.9, 0.2] }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
          }}
        />
      ))}
    </>
  );
}

function Cloud({ top, delay, size, speed }: { top: number; delay: number; size: 'sm' | 'md'; speed: number }) {
  const { isBedtime } = useBedtime();
  const w = size === 'md' ? 'w-16 h-5' : 'w-10 h-3';
  const opacity = isBedtime ? 'bg-white/20' : 'bg-white/50';
  return (
    <motion.div
      className={`absolute ${w} ${opacity} rounded-full`}
      style={{ top }}
      animate={{ x: [-40, 400] }}
      transition={{ duration: speed, repeat: Infinity, ease: 'linear', delay }}
    />
  );
}

function ForestScene() {
  const { isBedtime } = useBedtime();
  const skyGradient = isBedtime
    ? 'bg-gradient-to-b from-[#0a1628] via-[#142035] to-[#1a3020]'
    : 'bg-gradient-to-b from-sky via-sky/80 to-leaf/20';
  const treeLight = isBedtime ? '#2a4a3a' : '#4a7c59';
  const treeDark = isBedtime ? '#152a20' : '#1a3a2a';
  const groundClass = isBedtime ? 'h-4 bg-[#152a20] w-full' : 'h-4 bg-leaf/40 w-full';

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className={`absolute inset-0 ${skyGradient}`} />
      <Stars />
      <CelestialBody />
      <Cloud top={8} delay={0} size="md" speed={14} />
      <Cloud top={18} delay={4} size="sm" speed={18} />

      <div className="absolute bottom-0 left-0 right-0">
        <div className="absolute bottom-0 left-[5%]" style={{ width: 0, height: 0, borderLeft: '28px solid transparent', borderRight: '28px solid transparent', borderBottom: `55px solid ${treeLight}` }} />
        <div className="absolute bottom-0 left-[15%]" style={{ width: 0, height: 0, borderLeft: '35px solid transparent', borderRight: '35px solid transparent', borderBottom: `70px solid ${treeDark}` }} />
        <div className="absolute bottom-0 left-[30%]" style={{ width: 0, height: 0, borderLeft: '25px solid transparent', borderRight: '25px solid transparent', borderBottom: `50px solid ${treeLight}` }} />
        <div className="absolute bottom-0 right-[20%]" style={{ width: 0, height: 0, borderLeft: '30px solid transparent', borderRight: '30px solid transparent', borderBottom: `65px solid ${treeDark}` }} />
        <div className="absolute bottom-0 right-[5%]" style={{ width: 0, height: 0, borderLeft: '22px solid transparent', borderRight: '22px solid transparent', borderBottom: `45px solid ${treeLight}` }} />
        <div className={groundClass} />
      </div>
    </div>
  );
}

function OceanScene() {
  const { isBedtime } = useBedtime();
  const skyGradient = isBedtime
    ? 'bg-gradient-to-b from-[#0a1628] via-[#0f1d30] to-[#142840]'
    : 'bg-gradient-to-b from-water/30 via-sky to-water/40';
  const waveClasses = isBedtime
    ? ['bg-water/25', 'bg-water/35', 'bg-water/45']
    : ['bg-water/40', 'bg-water/50', 'bg-water/60'];

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className={`absolute inset-0 ${skyGradient}`} />
      <Stars />
      <CelestialBody />
      <Cloud top={6} delay={1} size="md" speed={16} />
      <Cloud top={16} delay={5} size="sm" speed={20} />

      <div className="absolute bottom-0 left-0 right-0 h-16">
        <motion.div
          className={`absolute bottom-6 left-0 right-0 h-8 ${waveClasses[0]} rounded-t-full`}
          animate={{ x: [-10, 10, -10] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className={`absolute bottom-2 left-0 right-0 h-8 ${waveClasses[1]} rounded-t-full`}
          animate={{ x: [10, -10, 10] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className={`absolute bottom-0 left-0 right-0 h-4 ${waveClasses[2]}`} />
      </div>
    </div>
  );
}

function MountainScene() {
  const { isBedtime } = useBedtime();
  const skyGradient = isBedtime
    ? 'bg-gradient-to-b from-[#0a1628] via-[#0f1623] to-[#1a2030]'
    : 'bg-gradient-to-b from-sky via-cream to-bark/10';
  const mtLight = isBedtime ? 'rgba(42,74,58,0.5)' : 'rgba(74,124,89,0.5)';
  const mtDark = isBedtime ? '#152a20' : '#1a3a2a';
  const mtMid = isBedtime ? 'rgba(42,74,58,0.6)' : 'rgba(74,124,89,0.6)';
  const snowCap = isBedtime ? '#a0b0c0' : 'white';
  const groundClass = isBedtime ? 'h-3 bg-[#1a2030] w-full' : 'h-3 bg-bark/20 w-full';

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className={`absolute inset-0 ${skyGradient}`} />
      <Stars />
      <CelestialBody />
      <Cloud top={6} delay={0} size="md" speed={15} />
      <Cloud top={14} delay={3} size="sm" speed={19} />

      <div className="absolute bottom-0 left-0 right-0">
        <div className="absolute bottom-0 left-[10%]" style={{ width: 0, height: 0, borderLeft: '60px solid transparent', borderRight: '60px solid transparent', borderBottom: `80px solid ${mtLight}` }} />
        <div className="absolute bottom-0 left-[30%]" style={{ width: 0, height: 0, borderLeft: '80px solid transparent', borderRight: '80px solid transparent', borderBottom: `100px solid ${mtDark}` }} />
        <div className="absolute bottom-0 right-[10%]" style={{ width: 0, height: 0, borderLeft: '55px solid transparent', borderRight: '55px solid transparent', borderBottom: `70px solid ${mtMid}` }} />
        <div className="absolute bottom-[88px] left-[calc(30%+10px)]" style={{ width: 0, height: 0, borderLeft: '16px solid transparent', borderRight: '16px solid transparent', borderBottom: `14px solid ${snowCap}` }} />
        <div className={groundClass} />
      </div>
    </div>
  );
}

function ArcticScene() {
  const { isBedtime } = useBedtime();
  const skyGradient = isBedtime
    ? 'bg-gradient-to-b from-[#0a1020] via-[#0f1628] to-[#c8d6e5]/30'
    : 'bg-gradient-to-b from-forest/60 via-water/20 to-white/80';
  const snowOpacities = isBedtime
    ? ['bg-white/40', 'bg-white/50', 'bg-white/30', 'bg-white/50']
    : ['bg-white/80', 'bg-white/90', 'bg-white/70', 'bg-white/90'];

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className={`absolute inset-0 ${skyGradient}`} />
      <Stars />

      {/* Aurora glow */}
      <motion.div
        className="absolute top-0 left-1/4 w-1/2 h-12 rounded-full bg-berry/20 blur-xl"
        animate={{ opacity: [0.3, 0.6, 0.3], x: [-20, 20, -20] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-4 left-1/3 w-1/3 h-8 rounded-full bg-leaf/15 blur-xl"
        animate={{ opacity: [0.2, 0.5, 0.2], x: [15, -15, 15] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      {/* Snow hills */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className={`absolute bottom-0 left-[5%] w-40 h-10 ${snowOpacities[0]} rounded-t-full`} />
        <div className={`absolute bottom-0 left-[35%] w-52 h-14 ${snowOpacities[1]} rounded-t-full`} />
        <div className={`absolute bottom-0 right-[5%] w-36 h-8 ${snowOpacities[2]} rounded-t-full`} />
        <div className={`h-4 ${snowOpacities[3]} w-full`} />
      </div>
    </div>
  );
}

const scenes: Record<WorldType, () => ReactElement> = {
  forest: ForestScene,
  ocean: OceanScene,
  mountains: MountainScene,
  arctic: ArcticScene,
};

export default function WorldScene({ world, className = '' }: WorldSceneProps) {
  const Scene = scenes[world] || ForestScene;

  return (
    <div className={`relative rounded-2xl overflow-hidden ${className}`}>
      <Scene />
    </div>
  );
}
