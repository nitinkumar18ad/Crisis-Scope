import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface LightBeamButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  className?: string;
  gradientColors?: [string, string, string];
}

/**
 * LightBeamButton
 *
 * A high-performance button with a rotating light beam border effect.
 * Uses CSS @property for smooth gradient rotation animations on the border.
 * Optimised for dark backgrounds — perfect for hero CTAs.
 */
export function LightBeamButton({
  children,
  className,
  onClick,
  gradientColors = ['#8b5cf6', '#06b6d4', '#8b5cf6'],
  ...props
}: LightBeamButtonProps) {
  const gradientString = `conic-gradient(from var(--gradient-angle), transparent 0%, ${gradientColors[0]} 40%, ${gradientColors[1]} 50%, transparent 60%, transparent 100%)`;

  return (
    <>
      <style>{`
        @property --gradient-angle {
          syntax: "<angle>";
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes border-spin {
          from { --gradient-angle: 0deg; }
          to   { --gradient-angle: 360deg; }
        }
        .animate-border-spin {
          animation: border-spin 2s linear infinite;
        }
      `}</style>

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onClick}
        style={{ touchAction: 'manipulation' }}
        className={cn(
          // Base shape & colour
          'group relative isolate overflow-hidden rounded-full bg-neutral-950 px-8 py-3 text-sm font-semibold text-white transition-all',
          'hover:bg-neutral-900',
          // Glow shadow
          'shadow-[0_0_22px_-6px_rgba(139,92,246,0.45)] hover:shadow-[0_0_32px_-6px_rgba(6,182,212,0.55)]',
          className,
        )}
        {...(props as HTMLMotionProps<"button">)}
      >
        {/* Visible text / icons */}
        <span className="relative z-10 flex items-center gap-2">{children}</span>

        {/* Rotating gradient border */}
        <div
          className="absolute inset-0 -z-10 rounded-full p-[1.5px] animate-border-spin"
          style={{
            background: gradientString,
          }}
        />

        {/* Inner dark fill — keeps text readable */}
        <div className="absolute inset-[1.5px] -z-10 rounded-full bg-neutral-950" />

        {/* Radial shine on hover */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.18)_0%,transparent_65%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </motion.button>
    </>
  );
}

export default LightBeamButton;
