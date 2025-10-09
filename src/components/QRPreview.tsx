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
          'relative mx-auto flex h-[320px] w-full max-w-[360px] items-center justify-center rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-inner drop-shadow-glass backdrop-blur-xl transition-all',
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
          className="pointer-events-none absolute inset-0 rounded-[32px] bg-white/5 mix-blend-overlay"
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
