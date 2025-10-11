import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import clsx from 'clsx'

interface PanelCardProps extends ComponentPropsWithoutRef<'div'> {
  children: ReactNode
}

const PanelCard = ({ children, className, ...divProps }: PanelCardProps) => (
  <div
    {...divProps}
    className={clsx(
      'rounded-3xl bg-white/80 p-8 shadow-lg shadow-slate-900/5 backdrop-blur-md transition-colors dark:bg-slate-900/75',
      'supports-[backdrop-filter]:bg-white/70 supports-[backdrop-filter]:dark:bg-slate-900/65',
      className,
    )}
  >
    <div className="flex flex-col gap-6">{children}</div>
  </div>
)

export default PanelCard
