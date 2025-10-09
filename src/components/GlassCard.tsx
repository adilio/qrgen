import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import clsx from 'clsx'

interface GlassCardProps extends ComponentPropsWithoutRef<'div'> {
  children: ReactNode
  sheen?: boolean
}

const GlassCard = ({ children, className, sheen = false, ...divProps }: GlassCardProps) => (
  <div
    {...divProps}
    className={clsx(
      'glass-card relative overflow-hidden rounded-3xl border border-white/10 bg-glass-light/90 p-6 shadow-glow backdrop-blur-3xl transition-colors dark:border-white/5 dark:bg-glass-dark/85',
      'supports-[backdrop-filter]:bg-glass-light/60 supports-[backdrop-filter]:dark:bg-glass-dark/60',
      className,
    )}
  >
    {sheen && (
      <div
        aria-hidden
        className={clsx(
          'pointer-events-none absolute inset-0 opacity-60 mix-blend-screen',
          'before:absolute before:-left-1/3 before:top-0 before:h-[200%] before:w-1/2 before:bg-accent-linear before:opacity-60 before:blur-3xl',
          'after:absolute after:-right-1/4 after:top-1/3 after:h-2/3 after:w-1/3 after:rounded-full after:bg-accent-radial after:opacity-40 after:blur-2xl',
          'motion-safe:animate-[sheen_6s_ease-in-out_infinite]',
        )}
      />
    )}
    <div className="relative z-[1] flex flex-col gap-4">{children}</div>
  </div>
)

export default GlassCard
