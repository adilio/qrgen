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
  onLogoUpload: (file: File) => Promise<void>
  onLogoClear: () => void
  shareBusy: boolean
  onShare: () => Promise<void>
  shareFeedback: ShareFeedback | null
  logoWarning?: string | null
}

const SIZE_PRESETS = [
  { id: 'small', label: 'Small', size: 240 },
  { id: 'medium', label: 'Medium', size: 320 },
  { id: 'large', label: 'Large', size: 420 },
] as const

type SizePresetId = (typeof SIZE_PRESETS)[number]['id']


const QREditor = ({
  settings,
  onSettingsChange,
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

  const applySizePreset = (presetId: SizePresetId) => {
    const preset = SIZE_PRESETS.find((item) => item.id === presetId)
    if (!preset) return
    onSettingsChange((current) => ({ ...current, size: preset.size }))
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

  const selectedPreset: SizePresetId | 'custom' = (() => {
    const match = SIZE_PRESETS.find((preset) => preset.size === settings.size)
    return match?.id ?? 'custom'
  })()

  const selectedPresetLabel =
    selectedPreset === 'custom'
      ? 'Custom'
      : SIZE_PRESETS.find((preset) => preset.id === selectedPreset)?.label ?? 'Custom'

  return (
    <div className="flex flex-col gap-8" aria-label="QR configuration panel">
      <section className="space-y-6">
        <header className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
            Basics
          </span>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            What should this QR encode?
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Add the content, pick a size preset, and tune brand colors.
          </p>
        </header>
        <div className="space-y-6">
          <label className="flex flex-col gap-3">
            <span className="text-base font-medium text-slate-700 dark:text-slate-200">QR content</span>
            <textarea
              className="h-28 resize-none rounded-2xl border-0 bg-white/90 px-5 py-4 text-base text-slate-900 shadow-inner ring-1 ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-accent-500 dark:bg-slate-900/70 dark:text-slate-100 dark:ring-slate-700"
              value={settings.text}
              onChange={handleTextChange}
              aria-label="QR data"
              placeholder="Paste URL, text, Wi-Fi credentials, or any payload..."
              required
            />
          </label>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-base font-medium text-slate-700 dark:text-slate-200">Size presets</span>
              <span className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                {selectedPresetLabel}
              </span>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              {SIZE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applySizePreset(preset.id)}
                  className={clsx(
                    'flex-1 rounded-2xl border border-transparent px-4 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500',
                    selectedPreset === preset.id
                      ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/25'
                      : 'bg-slate-100/80 text-slate-700 hover:bg-slate-200 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:bg-slate-800',
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-base font-medium text-slate-700 dark:text-slate-200">Foreground</span>
              <div className="flex items-center gap-3 rounded-2xl bg-slate-100/80 px-4 py-3 shadow-inner ring-1 ring-slate-200 dark:bg-slate-800/70 dark:ring-slate-700">
                <input
                  type="color"
                  value={settings.foregroundColor}
                  onChange={handleForegroundChange}
                  aria-label="Foreground color"
                  className="h-12 w-12 cursor-pointer rounded-xl border-0 bg-transparent"
                />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  {settings.foregroundColor}
                </span>
              </div>
            </label>
            <label className="space-y-2">
              <span className="text-base font-medium text-slate-700 dark:text-slate-200">Background</span>
              <div className="flex items-center gap-3 rounded-2xl bg-slate-100/80 px-4 py-3 shadow-inner ring-1 ring-slate-200 dark:bg-slate-800/70 dark:ring-slate-700">
                <input
                  type="color"
                  value={settings.backgroundColor}
                  onChange={handleBackgroundChange}
                  aria-label="Background color"
                  className="h-12 w-12 cursor-pointer rounded-xl border-0 bg-transparent"
                />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  {settings.backgroundColor}
                </span>
              </div>
            </label>
          </div>

          <label className="flex items-center gap-3 rounded-2xl bg-slate-100/80 px-5 py-4 shadow-inner ring-1 ring-slate-200 dark:bg-slate-800/70 dark:ring-slate-700">
            <input
              type="checkbox"
              checked={settings.transparentBackground}
              onChange={handleTransparentToggle}
              aria-label="Toggle transparent background"
              className="h-5 w-5 rounded border-slate-400 text-accent-500 focus:ring-accent-500"
            />
            <span className="text-base font-medium text-slate-700 dark:text-slate-200">
              Transparent background
            </span>
          </label>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-base font-medium text-slate-700 dark:text-slate-200">Add a logo</span>
              {settings.logo.mode !== 'none' && (
                <button
                  type="button"
                  onClick={onLogoClear}
                  className="rounded-xl border border-slate-300/70 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:border-rose-400 hover:text-rose-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 dark:border-slate-700/70 dark:bg-slate-900 dark:text-slate-200"
                >
                  Clear logo
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={launchLogoPicker}
                className="flex-1 rounded-xl bg-accent-500 px-4 py-3 text-sm font-semibold text-white shadow shadow-accent-500/40 transition hover:bg-accent-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
              >
                {settings.logo.mode === 'none' ? 'Upload logo' : 'Change logo'}
              </button>
              <input
                ref={logoFileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleLogoFileChange}
              />
            </div>
            {settings.logo.mode !== 'none' && (
              <div className="space-y-4 rounded-xl border border-slate-200/70 bg-white/90 p-4 dark:border-slate-800/60 dark:bg-slate-900/80">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Logo scale ({Math.round(settings.logo.scale * 100)}%)
                  </span>
                  <input
                    type="range"
                    min="0.1"
                    max="0.6"
                    step="0.01"
                    value={settings.logo.scale}
                    onChange={handleLogoScale}
                    className="accent-accent-500"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Corner radius ({settings.logo.cornerRadius}%)
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    step="1"
                    value={settings.logo.cornerRadius}
                    onChange={handleLogoCornerRadius}
                    className="accent-accent-500"
                  />
                </label>

                {logoWarning && (
                  <p className="rounded-xl border border-amber-300/80 bg-amber-50/80 px-4 py-3 text-sm text-amber-700 dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-200">
                    {logoWarning}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <header className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
            Advanced
          </span>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Fine-tune your QR code
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Adjust dimensions, error correction, and other technical settings.
          </p>
        </header>
        <div className="space-y-6 rounded-2xl border border-slate-200/70 bg-white/90 p-5 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/80">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Fine-tune size ({settings.size}px)
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
                className="accent-accent-500"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Quiet zone ({settings.margin}px)
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
                className="accent-accent-500"
              />
            </label>
          </div>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Error correction</span>
            <select
              value={settings.ecc}
              onChange={handleEccChange}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              {ECC_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-200/70 bg-white/90 px-5 py-4 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/80">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Share this configuration
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Copies a link with all options encoded for easy collaboration.
            </p>
          </div>
          <button
            type="button"
            onClick={handleShare}
            disabled={shareBusy}
            className={clsx(
              'inline-flex items-center gap-2 rounded-full bg-accent-500 px-5 py-2 text-sm font-semibold text-white shadow shadow-accent-500/30 transition hover:bg-accent-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 disabled:cursor-not-allowed disabled:opacity-70',
            )}
          >
            {shareBusy ? 'Preparing link…' : 'Copy shareable link'}
          </button>
        </div>
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
