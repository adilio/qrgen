import clsx from 'clsx'
import type { QRSettings } from '@/lib/qrcode'

interface QRPreviewProps {
  onContainerReady: (node: HTMLDivElement | null) => void
  settings: QRSettings
  statusMessage?: string | null
}

const QRPreview = ({ onContainerReady, settings, statusMessage }: QRPreviewProps) => {
  return (
    <div className="flex flex-col gap-4">
      <div
        className={clsx(
          'relative mx-auto flex h-[320px] w-full max-w-[360px] items-center justify-center rounded-2xl border border-slate-300/80 bg-white p-6 shadow-panel transition-all dark:border-slate-700/80 dark:bg-slate-900',
          'md:h-[360px] md:max-w-[400px]',
        )}
      >
        <div
          ref={onContainerReady}
          className="isolate flex h-full w-full items-center justify-center"
          aria-live="polite"
          aria-label="QR code preview"
        />
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl border border-slate-200/70 dark:border-slate-700/70"
          aria-hidden
        />
      </div>
      <p className="text-center text-xs text-slate-300">
        {statusMessage ??
          `Preview updates as you tweak settings. Currently encoding ${Math.min(settings.text.length, 64)} characters.`}
      </p>
      <span className="sr-only" aria-live="polite">
        QR refreshed. Current ECC level {settings.ecc}. Size {settings.size}px.
      </span>
    </div>
  )
}

export default QRPreview
