import clsx from 'clsx'
import type { QRSettings } from '@/lib/qrcode'

interface QRPreviewProps {
  onContainerReady: (node: HTMLDivElement | null) => void
  settings: QRSettings
  statusMessage?: string | null
}

const QRPreview = ({ onContainerReady, settings, statusMessage }: QRPreviewProps) => {
  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <div
        className={clsx(
          'relative flex h-[360px] w-full max-w-[420px] items-center justify-center rounded-3xl bg-white/90 p-8 shadow-xl shadow-slate-900/10 backdrop-blur transition-all duration-300 ease-out',
          'md:h-[400px] md:max-w-[440px]',
          'dark:bg-slate-950/80 dark:shadow-slate-950/30',
        )}
      >
        <div
          ref={onContainerReady}
          className="flex h-full w-full items-center justify-center"
          aria-live="polite"
          aria-label="QR code preview"
        />
        <div
          className="pointer-events-none absolute inset-0 rounded-3xl border border-white/40 shadow-inner shadow-white/10 dark:border-slate-800/60"
          aria-hidden
        />
      </div>
      <div className="space-y-1">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {statusMessage ??
            `Preview reflects ${Math.min(settings.text.length, 64)} characters with ${settings.ecc} error correction.`}
        </p>
        <span className="sr-only" aria-live="polite">
          QR refreshed. Current ECC level {settings.ecc}. Size {settings.size}px. Margin {settings.margin}px.
        </span>
      </div>
    </div>
  )
}

export default QRPreview
