import { useRef } from 'react'
import type { ChangeEvent } from 'react'
import clsx from 'clsx'
import { ECC_LEVELS, type QRSettings } from '@/lib/qrcode'

interface ShareFeedback {
  message: string
  tone: 'success' | 'warning' | 'error'
}

interface QREditorProps {
  settings: QRSettings
  onSettingsChange: (updater: (current: QRSettings) => QRSettings) => void
  theme: 'light' | 'dark'
  onThemeToggle: () => void
  onLogoUpload: (file: File) => Promise<void>
  onLogoClear: () => void
  shareBusy: boolean
  onShare: () => Promise<void>
  shareFeedback: ShareFeedback | null
  logoWarning?: string | null
}

const QREditor = ({
  settings,
  onSettingsChange,
  theme,
  onThemeToggle,
  onLogoUpload,
  onLogoClear,
  shareBusy,
  onShare,
  shareFeedback,
  logoWarning,
}: QREditorProps) => {
  const logoFileInputRef = useRef<HTMLInputElement | null>(null)

  const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const text = event.target.value
    onSettingsChange((current) => ({ ...current, text }))
  }

  const handleSizeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const size = Number(event.target.value)
    onSettingsChange((current) => ({ ...current, size }))
  }

  const handleMarginChange = (event: ChangeEvent<HTMLInputElement>) => {
    const margin = Number(event.target.value)
    onSettingsChange((current) => ({ ...current, margin }))
  }

  const handleEccChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const ecc = event.target.value as QRSettings['ecc']
    onSettingsChange((current) => ({ ...current, ecc }))
  }

  const handleForegroundChange = (event: ChangeEvent<HTMLInputElement>) => {
    const foregroundColor = event.target.value
    onSettingsChange((current) => ({ ...current, foregroundColor }))
  }

  const handleBackgroundChange = (event: ChangeEvent<HTMLInputElement>) => {
    const backgroundColor = event.target.value
    onSettingsChange((current) => ({ ...current, backgroundColor }))
  }

  const handleTransparentToggle = (event: ChangeEvent<HTMLInputElement>) => {
    const transparentBackground = event.target.checked
    onSettingsChange((current) => ({ ...current, transparentBackground }))
  }

  const launchLogoPicker = () => {
    logoFileInputRef.current?.click()
  }

  const handleLogoFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    await onLogoUpload(file)
    event.target.value = ''
  }

  const handleLogoScale = (event: ChangeEvent<HTMLInputElement>) => {
    const scale = Number(event.target.value)
    onSettingsChange((current) => ({
      ...current,
      logo: {
        ...current.logo,
        scale,
      },
    }))
  }

  const handleLogoCornerRadius = (event: ChangeEvent<HTMLInputElement>) => {
    const cornerRadius = Number(event.target.value)
    onSettingsChange((current) => ({
      ...current,
      logo: {
        ...current.logo,
        cornerRadius,
      },
    }))
  }

  const handleShare = async () => {
    await onShare()
  }

  return (
    <div className="flex flex-col gap-6" aria-label="QR configuration">
      <section className="rounded-xl border border-slate-200/60 bg-white/70 px-4 py-4 dark:border-slate-700/60 dark:bg-slate-900/60">
        <header className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              QR Content
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Enter the data and basic sizing options.
            </p>
          </div>
          <button
            type="button"
            onClick={onThemeToggle}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300/80 bg-white/90 px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-accent-500 hover:text-accent-600 dark:border-slate-700/80 dark:bg-slate-800/80 dark:text-slate-200"
          >
            {theme === 'dark' ? 'Use Light Theme' : 'Use Dark Theme'}
          </button>
        </header>
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-sm text-slate-600 dark:text-slate-200">Data</span>
            <textarea
              className="min-h-[96px] resize-y rounded-lg border border-slate-300/80 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-accent-500 focus-visible:outline-none dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-100"
              value={settings.text}
              onChange={handleTextChange}
              aria-label="QR data"
              placeholder="Paste URL, text, or vCard"
              required
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="flex flex-col gap-2">
              <span className="text-sm text-slate-600 dark:text-slate-200">
                Size ({settings.size}px)
              </span>
              <input
                type="range"
                min="160"
                max="512"
                step="8"
                value={settings.size}
                onChange={handleSizeChange}
                aria-valuemin={160}
                aria-valuemax={512}
                aria-valuenow={settings.size}
                aria-label="QR size"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm text-slate-600 dark:text-slate-200">
                Margin ({settings.margin}px)
              </span>
              <input
                type="range"
                min="0"
                max="64"
                step="2"
                value={settings.margin}
                onChange={handleMarginChange}
                aria-valuemin={0}
                aria-valuemax={64}
                aria-valuenow={settings.margin}
                aria-label="QR margin"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm text-slate-600 dark:text-slate-200">ECC Level</span>
              <select
                value={settings.ecc}
                onChange={handleEccChange}
                className="h-10 rounded-lg border border-slate-300/80 bg-white px-3 text-sm text-slate-900 focus-visible:border-accent-500 focus-visible:outline-none dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-100"
              >
                {ECC_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200/60 bg-white/70 px-4 py-4 dark:border-slate-700/60 dark:bg-slate-900/60">
        <header className="mb-3">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Appearance</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Pick foreground and background colors.
          </p>
        </header>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex items-center justify-between gap-3 rounded-lg border border-slate-300/80 bg-white px-4 py-3 dark:border-slate-700/80 dark:bg-slate-900">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Foreground
            </span>
            <input
              type="color"
              value={settings.foregroundColor}
              onChange={handleForegroundChange}
              aria-label="Foreground color"
              className="h-10 w-16 cursor-pointer rounded-md border border-slate-300/80 bg-transparent"
            />
          </label>
          <label className="flex items-center justify-between gap-3 rounded-lg border border-slate-300/80 bg-white px-4 py-3 dark:border-slate-700/80 dark:bg-slate-900">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Background
            </span>
            <input
              type="color"
              value={settings.backgroundColor}
              onChange={handleBackgroundChange}
              aria-label="Background color"
              className="h-10 w-16 cursor-pointer rounded-md border border-slate-300/80 bg-transparent"
            />
          </label>
        </div>
        <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-300/80 bg-white px-4 py-3 dark:border-slate-700/80 dark:bg-slate-900">
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Transparent background
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Useful when compositing the QR code over other artwork.
            </p>
          </div>
          <input
            type="checkbox"
            checked={settings.transparentBackground}
            onChange={handleTransparentToggle}
            aria-label="Toggle transparent background"
            className="h-5 w-5 rounded border border-slate-400"
          />
        </div>
      </section>

      <section className="rounded-xl border border-slate-200/60 bg-white/70 px-4 py-4 dark:border-slate-700/60 dark:bg-slate-900/60">
        <header className="mb-3">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Logo (optional)
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Upload a logo and adjust its size and rounding.
          </p>
        </header>
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={launchLogoPicker}
              className="flex-1 rounded-lg border border-slate-300/80 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-accent-500 hover:text-accent-600 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-100"
            >
              Upload logo
            </button>
            <input
              ref={logoFileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleLogoFileChange}
            />
            <button
              type="button"
              onClick={onLogoClear}
              className="rounded-lg border border-slate-300/80 bg-white px-4 py-3 text-sm text-slate-500 transition hover:border-red-500 hover:text-red-600 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-300"
            >
              Clear
            </button>
          </div>
          <label className="flex flex-col gap-2">
            <span className="text-sm text-slate-600 dark:text-slate-200">
              Logo scale ({Math.round(settings.logo.scale * 100)}%)
            </span>
            <input
              type="range"
              min="0.1"
              max="0.4"
              step="0.01"
              value={settings.logo.scale}
              onChange={handleLogoScale}
              disabled={settings.logo.mode === 'none'}
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm text-slate-600 dark:text-slate-200">
              Corner radius ({settings.logo.cornerRadius}%)
            </span>
            <input
              type="range"
              min="0"
              max="40"
              step="1"
              value={settings.logo.cornerRadius}
              onChange={handleLogoCornerRadius}
              disabled={settings.logo.mode === 'none'}
            />
          </label>
          {logoWarning && (
            <p className="rounded-lg border border-amber-400/60 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-200">
              {logoWarning}
            </p>
          )}
        </div>
      </section>

      <section className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200/60 bg-white/70 px-4 py-4 dark:border-slate-700/60 dark:bg-slate-900/60">
        <button
          type="button"
          onClick={handleShare}
          disabled={shareBusy}
          className={clsx(
            'inline-flex items-center gap-2 rounded-full border border-accent-500 bg-accent-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 disabled:cursor-not-allowed disabled:opacity-70',
          )}
        >
          {shareBusy ? 'Preparing link…' : 'Copy shareable link'}
        </button>
        {shareFeedback && (
          <span
            role="status"
            className={clsx(
              'text-xs font-medium',
              shareFeedback.tone === 'success'
                ? 'text-emerald-600 dark:text-emerald-300'
                : shareFeedback.tone === 'warning'
                  ? 'text-amber-600 dark:text-amber-300'
                  : 'text-rose-600 dark:text-rose-300',
            )}
          >
            {shareFeedback.message}
          </span>
        )}
      </section>
    </div>
  )
}

export default QREditor
