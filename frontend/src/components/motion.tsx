import { motion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';

// Check for reduced motion preference
const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const duration = prefersReducedMotion ? 0 : undefined;

// === Variants ===

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: duration ?? 0.6, ease: 'easeOut' } },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: prefersReducedMotion ? 0 : 0.12 } },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: duration ?? 0.5, ease: 'easeOut' } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: duration ?? 0.5, ease: 'easeOut' } },
};

// === Components ===

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeUp}
    >
      {children}
    </motion.div>
  );
}

export function StaggerList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  );
}

// Re-export motion for direct use
export { motion };
