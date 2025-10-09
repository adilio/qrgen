import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import clsx from 'clsx'

interface PanelCardProps extends ComponentPropsWithoutRef<'div'> {
  children: ReactNode
}

const PanelCard = ({ children, className, ...divProps }: PanelCardProps) => (
  <div
    {...divProps}
    className={clsx(
      'rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-sm backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/70',
      'supports-[backdrop-filter]:bg-white/70 supports-[backdrop-filter]:dark:bg-slate-900/60',
      className,
    )}
  >
    <div className="flex flex-col gap-4">{children}</div>
  </div>
)

export default PanelCard
