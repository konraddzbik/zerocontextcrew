import type { ReactElement } from 'react';
import { motion } from 'framer-motion';

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

function Cloud({ top, delay, size, speed }: { top: number; delay: number; size: 'sm' | 'md'; speed: number }) {
  const w = size === 'md' ? 'w-16 h-5' : 'w-10 h-3';
  return (
    <motion.div
      className={`absolute ${w} bg-white/50 rounded-full`}
      style={{ top }}
      animate={{ x: [-40, 400] }}
      transition={{ duration: speed, repeat: Infinity, ease: 'linear', delay }}
    />
  );
}

function ForestScene() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Sky */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky via-sky/80 to-leaf/20" />
      <Sun />
      <Cloud top={8} delay={0} size="md" speed={14} />
      <Cloud top={18} delay={4} size="sm" speed={18} />

      {/* Trees (triangles) */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="absolute bottom-0 left-[5%]" style={{ width: 0, height: 0, borderLeft: '28px solid transparent', borderRight: '28px solid transparent', borderBottom: '55px solid #4a7c59' }} />
        <div className="absolute bottom-0 left-[15%]" style={{ width: 0, height: 0, borderLeft: '35px solid transparent', borderRight: '35px solid transparent', borderBottom: '70px solid #1a3a2a' }} />
        <div className="absolute bottom-0 left-[30%]" style={{ width: 0, height: 0, borderLeft: '25px solid transparent', borderRight: '25px solid transparent', borderBottom: '50px solid #4a7c59' }} />
        <div className="absolute bottom-0 right-[20%]" style={{ width: 0, height: 0, borderLeft: '30px solid transparent', borderRight: '30px solid transparent', borderBottom: '65px solid #1a3a2a' }} />
        <div className="absolute bottom-0 right-[5%]" style={{ width: 0, height: 0, borderLeft: '22px solid transparent', borderRight: '22px solid transparent', borderBottom: '45px solid #4a7c59' }} />
        {/* Ground */}
        <div className="h-4 bg-leaf/40 w-full" />
      </div>
    </div>
  );
}

function OceanScene() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Sky */}
      <div className="absolute inset-0 bg-gradient-to-b from-water/30 via-sky to-water/40" />
      <Sun />
      <Cloud top={6} delay={1} size="md" speed={16} />
      <Cloud top={16} delay={5} size="sm" speed={20} />

      {/* Waves */}
      <div className="absolute bottom-0 left-0 right-0 h-16">
        <motion.div
          className="absolute bottom-6 left-0 right-0 h-8 bg-water/40 rounded-t-full"
          animate={{ x: [-10, 10, -10] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-2 left-0 right-0 h-8 bg-water/50 rounded-t-full"
          animate={{ x: [10, -10, 10] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-water/60" />
      </div>
    </div>
  );
}

function MountainScene() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Sky */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky via-cream to-bark/10" />
      <Sun />
      <Cloud top={6} delay={0} size="md" speed={15} />
      <Cloud top={14} delay={3} size="sm" speed={19} />

      {/* Mountains */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="absolute bottom-0 left-[10%]" style={{ width: 0, height: 0, borderLeft: '60px solid transparent', borderRight: '60px solid transparent', borderBottom: '80px solid rgba(74,124,89,0.5)' }} />
        <div className="absolute bottom-0 left-[30%]" style={{ width: 0, height: 0, borderLeft: '80px solid transparent', borderRight: '80px solid transparent', borderBottom: '100px solid #1a3a2a' }} />
        <div className="absolute bottom-0 right-[10%]" style={{ width: 0, height: 0, borderLeft: '55px solid transparent', borderRight: '55px solid transparent', borderBottom: '70px solid rgba(74,124,89,0.6)' }} />
        {/* Snow caps */}
        <div className="absolute bottom-[88px] left-[calc(30%+10px)]" style={{ width: 0, height: 0, borderLeft: '16px solid transparent', borderRight: '16px solid transparent', borderBottom: '14px solid white' }} />
        {/* Ground */}
        <div className="h-3 bg-bark/20 w-full" />
      </div>
    </div>
  );
}

function ArcticScene() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Sky — dark aurora */}
      <div className="absolute inset-0 bg-gradient-to-b from-forest/60 via-water/20 to-white/80" />

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
        <div className="absolute bottom-0 left-[5%] w-40 h-10 bg-white/80 rounded-t-full" />
        <div className="absolute bottom-0 left-[35%] w-52 h-14 bg-white/90 rounded-t-full" />
        <div className="absolute bottom-0 right-[5%] w-36 h-8 bg-white/70 rounded-t-full" />
        <div className="h-4 bg-white/90 w-full" />
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
