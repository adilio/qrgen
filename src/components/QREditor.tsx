import { useRef } from 'react'
import type { ChangeEvent } from 'react'
import clsx from 'clsx'
import { describeContrast } from '@/lib/color'
import { PRESETS } from '@/lib/presets'
import type { PresetDefinition } from '@/lib/presets'
import { DOT_STYLES, EYE_STYLES, ECC_LEVELS, isLogoCoverageRisky } from '@/lib/qrcode'
import type { QRSettings } from '@/lib/qrcode'

interface ShareFeedback {
  message: string
  tone: 'success' | 'warning' | 'error'
}

interface QREditorProps {
  settings: QRSettings
  onSettingsChange: (updater: (current: QRSettings) => QRSettings) => void
  onApplyPreset: (preset: PresetDefinition) => void
  theme: 'light' | 'dark'
  onThemeToggle: () => void
  onLogoUpload: (file: File) => Promise<void>
  onLogoExternalChange: (url: string) => void
  onLogoClear: () => void
  shareBusy: boolean
  onShare: () => Promise<void>
  shareFeedback: ShareFeedback | null
  animateSheen: boolean
  onAnimateSheenChange: (value: boolean) => void
  reducedMotionLocked: boolean
  logoWarning?: string | null
}

const QREditor = ({
  settings,
  onSettingsChange,
  onApplyPreset,
  theme,
  onThemeToggle,
  onLogoUpload,
  onLogoExternalChange,
  onLogoClear,
  shareBusy,
  onShare,
  shareFeedback,
  animateSheen,
  onAnimateSheenChange,
  reducedMotionLocked,
  logoWarning,
}: QREditorProps) => {
  const logoFileInputRef = useRef<HTMLInputElement | null>(null)
  const logoUrlInputRef = useRef<HTMLInputElement | null>(null)

  const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const text = event.target.value
    onSettingsChange((current) => ({ ...current, text, presetKey: null }))
  }

  const handleSizeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const size = Number(event.target.value)
    onSettingsChange((current) => ({ ...current, size, presetKey: null }))
  }

  const handleMarginChange = (event: ChangeEvent<HTMLInputElement>) => {
    const margin = Number(event.target.value)
    onSettingsChange((current) => ({ ...current, margin, presetKey: null }))
  }

  const handleEccChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const ecc = event.target.value as QRSettings['ecc']
    onSettingsChange((current) => ({ ...current, ecc, presetKey: null }))
  }

  const handleColorChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    if (name === 'foregroundColor') {
      onSettingsChange((current) => ({ ...current, foregroundColor: value, presetKey: null }))
    } else if (name === 'backgroundColor') {
      onSettingsChange((current) => ({ ...current, backgroundColor: value, presetKey: null }))
    }
  }

  const handleGradientColorChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    onSettingsChange((current) => ({
      ...current,
      gradient: {
        ...current.gradient,
        [name === 'gradientStart' ? 'start' : 'end']: value,
      },
      presetKey: null,
    }))
  }

  const handleGradientToggle = (event: ChangeEvent<HTMLInputElement>) => {
    const enabled = event.target.checked
    onSettingsChange((current) => ({
      ...current,
      gradient: {
        ...current.gradient,
        enabled,
      },
      presetKey: null,
    }))
  }

  const handleGradientRotation = (event: ChangeEvent<HTMLInputElement>) => {
    const rotation = Number(event.target.value)
    onSettingsChange((current) => ({
      ...current,
      gradient: {
        ...current.gradient,
        rotation,
      },
      presetKey: null,
    }))
  }

  const handleGradientType = (event: ChangeEvent<HTMLSelectElement>) => {
    const type = event.target.value as QRSettings['gradient']['type']
    onSettingsChange((current) => ({
      ...current,
      gradient: {
        ...current.gradient,
        type,
      },
      presetKey: null,
    }))
  }

  const handleDotStyle = (value: QRSettings['dotStyle']) => {
    onSettingsChange((current) => ({ ...current, dotStyle: value, presetKey: null }))
  }

  const handleEyeStyle = (value: QRSettings['eyeStyle']) => {
    onSettingsChange((current) => ({ ...current, eyeStyle: value, presetKey: null }))
  }

  const handleTransparentToggle = (event: ChangeEvent<HTMLInputElement>) => {
    const transparentBackground = event.target.checked
    onSettingsChange((current) => ({ ...current, transparentBackground, presetKey: null }))
  }

  const handleLogoScale = (event: ChangeEvent<HTMLInputElement>) => {
    const scale = Number(event.target.value)
    onSettingsChange((current) => ({
      ...current,
      logo: {
        ...current.logo,
        scale,
      },
      presetKey: null,
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
      presetKey: null,
    }))
  }

  const handleLogoModeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const mode = event.target.value as QRSettings['logo']['mode']
    onSettingsChange((current) => ({
      ...current,
      logo: {
        ...current.logo,
        mode,
      },
      presetKey: null,
    }))
  }

  const handleLogoCrossOrigin = (event: ChangeEvent<HTMLSelectElement>) => {
    const crossOrigin = event.target.value as QRSettings['logo']['crossOrigin']
    onSettingsChange((current) => ({
      ...current,
      logo: {
        ...current.logo,
        crossOrigin,
      },
    }))
  }

  const handleLogoExternalApply = () => {
    const externalUrl = logoUrlInputRef.current?.value ?? ''
    onLogoExternalChange(externalUrl.trim())
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

  const handlePresetSelect = (preset: PresetDefinition) => {
    onApplyPreset(preset)
  }

  const handleShare = async () => {
    await onShare()
  }

  const handleAnimateSheen = (event: ChangeEvent<HTMLInputElement>) => {
    onAnimateSheenChange(event.target.checked)
  }

  const presetContrast = describeContrast(settings.foregroundColor, settings.backgroundColor)
  const gradientContrastStart = describeContrast(settings.gradient.start, settings.backgroundColor)
  const gradientContrastEnd = describeContrast(settings.gradient.end, settings.backgroundColor)
  const gradientWorst =
    gradientContrastStart.ratio < gradientContrastEnd.ratio
      ? gradientContrastStart
      : gradientContrastEnd

  const logoRisk = isLogoCoverageRisky(settings)

  return (
    <form className="flex flex-col gap-6" aria-label="QR configuration">
      <section className="rounded-2xl bg-white/5 p-4 shadow-inner dark:bg-white/5">
        <header className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-100">Content</h2>
            <p className="text-sm text-slate-400">
              Update the payload and sizing. Preview refreshes in real time.
            </p>
          </div>
          <button
            type="button"
            onClick={onThemeToggle}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-white transition hover:border-primary-500 hover:text-primary-200 focus-visible:outline"
          >
            {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
          </button>
        </header>
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span>Data</span>
            <textarea
              className="min-h-[96px] resize-y rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:outline"
              value={settings.text}
              onChange={handleTextChange}
              aria-label="QR data"
              placeholder="Paste URL, text, or vCard"
              required
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="flex flex-col gap-2">
              <span>Size ({settings.size}px)</span>
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
                aria-label="QR size slider"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span>Margin ({settings.margin}px)</span>
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
                aria-label="QR margin slider"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span>ECC Level</span>
              <select
                value={settings.ecc}
                onChange={handleEccChange}
                className="h-10 rounded-xl border border-white/10 bg-black/20 px-3 text-sm"
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

      <section className="rounded-2xl bg-white/5 p-4 shadow-inner dark:bg-white/5">
        <header className="mb-4">
          <h2 className="text-base font-semibold text-slate-100">Colors &amp; Style</h2>
          <p className="text-sm text-slate-400">Pick your palette and module styles.</p>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-3">
            <label className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
              <span className="text-sm font-medium text-slate-100">Foreground</span>
              <input
                type="color"
                name="foregroundColor"
                value={settings.foregroundColor}
                onChange={handleColorChange}
                aria-label="Foreground color"
                className="h-10 w-16 cursor-pointer rounded-md border border-white/20 bg-transparent"
              />
            </label>
            <label className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
              <span className="text-sm font-medium text-slate-100">Background</span>
              <input
                type="color"
                name="backgroundColor"
                value={settings.backgroundColor}
                onChange={handleColorChange}
                aria-label="Background color"
                className="h-10 w-16 cursor-pointer rounded-md border border-white/20 bg-transparent"
              />
            </label>
            <p className="rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-xs text-slate-300">
              {presetContrast.label} — ratio {presetContrast.ratio.toFixed(2)}:1
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <label className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
              <span className="text-sm font-medium text-slate-100">Enable Gradient</span>
              <input
                type="checkbox"
                checked={settings.gradient.enabled}
                onChange={handleGradientToggle}
                aria-label="Toggle gradient"
                className="h-5 w-5 rounded border border-white/20"
              />
            </label>
            <div
              className={clsx(
                'grid gap-3 transition-opacity',
                !settings.gradient.enabled && 'pointer-events-none opacity-50',
              )}
            >
              <label className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                <span className="text-sm font-medium text-slate-100">Gradient Start</span>
                <input
                  type="color"
                  name="gradientStart"
                  value={settings.gradient.start}
                  onChange={handleGradientColorChange}
                  aria-label="Gradient start color"
                  className="h-10 w-16 cursor-pointer rounded-md border border-white/20 bg-transparent"
                />
              </label>
              <label className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                <span className="text-sm font-medium text-slate-100">Gradient End</span>
                <input
                  type="color"
                  name="gradientEnd"
                  value={settings.gradient.end}
                  onChange={handleGradientColorChange}
                  aria-label="Gradient end color"
                  className="h-10 w-16 cursor-pointer rounded-md border border-white/20 bg-transparent"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm text-slate-200">
                  Rotation ({settings.gradient.rotation}°)
                </span>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={settings.gradient.rotation}
                  onChange={handleGradientRotation}
                  aria-label="Gradient rotation"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm text-slate-200">Gradient Type</span>
                <select
                  value={settings.gradient.type}
                  onChange={handleGradientType}
                  className="h-10 rounded-xl border border-white/10 bg-black/20 px-3 text-sm"
                >
                  <option value="linear">Linear</option>
                  <option value="radial">Radial</option>
                </select>
              </label>
              <p className="rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-xs text-slate-300">
                {gradientWorst.label} — worst contrast {gradientWorst.ratio.toFixed(2)}:1
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-slate-200">Dot Style</legend>
            <div className="flex flex-wrap gap-2">
              {DOT_STYLES.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => handleDotStyle(style)}
                  aria-pressed={settings.dotStyle === style}
                  className={clsx(
                    'rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wide transition focus-visible:outline',
                    settings.dotStyle === style
                      ? 'border-primary-400 bg-primary-500/20 text-primary-200'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:border-primary-500 hover:text-primary-200',
                  )}
                >
                  {style}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-slate-200">Finder Eyes</legend>
            <div className="flex flex-wrap gap-2">
              {EYE_STYLES.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => handleEyeStyle(style)}
                  aria-pressed={settings.eyeStyle === style}
                  className={clsx(
                    'rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wide transition focus-visible:outline',
                    settings.eyeStyle === style
                      ? 'border-primary-400 bg-primary-500/20 text-primary-200'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:border-primary-500 hover:text-primary-200',
                  )}
                >
                  {style}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
        <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-slate-100">Transparent background</p>
            <p className="text-xs text-slate-400">Useful for compositing exports.</p>
          </div>
          <input
            type="checkbox"
            checked={settings.transparentBackground}
            onChange={handleTransparentToggle}
            aria-label="Toggle transparent background"
            className="h-5 w-5 rounded border border-white/20"
          />
        </div>
      </section>

      <section className="rounded-2xl bg-white/5 p-4 shadow-inner dark:bg-white/5">
        <header className="mb-4">
          <h2 className="text-base font-semibold text-slate-100">Logo &amp; Branding</h2>
          <p className="text-sm text-slate-400">Drop a logo or reference an external asset.</p>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-2">
              <span>Logo source</span>
              <select
                value={settings.logo.mode}
                onChange={handleLogoModeChange}
                className="h-10 rounded-xl border border-white/10 bg-black/20 px-3 text-sm"
              >
                <option value="none">None</option>
                <option value="upload">Upload</option>
                <option value="external">External URL</option>
              </select>
            </label>
            <button
              type="button"
              onClick={launchLogoPicker}
              className="rounded-xl border border-dashed border-white/20 bg-black/20 px-4 py-3 text-sm font-medium text-slate-200 hover:border-primary-500 hover:text-primary-200 focus-visible:outline"
              disabled={settings.logo.mode !== 'upload'}
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
            <div className="flex flex-col gap-2" role="group" aria-labelledby="logo-url-label">
              <label className="text-sm text-slate-200" htmlFor="logoUrl" id="logo-url-label">
                External logo URL
              </label>
              <input
                ref={logoUrlInputRef}
                id="logoUrl"
                type="url"
                placeholder="https://"
                defaultValue={settings.logo.externalUrl ?? ''}
                disabled={settings.logo.mode !== 'external'}
                className="h-10 rounded-xl border border-white/10 bg-black/20 px-3 text-sm"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleLogoExternalApply}
                  className="h-10 flex-1 rounded-xl border border-white/10 bg-white/10 text-sm font-medium text-white hover:border-primary-500 hover:text-primary-200 focus-visible:outline"
                  disabled={settings.logo.mode !== 'external'}
                >
                  Apply URL
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (logoUrlInputRef.current) {
                      logoUrlInputRef.current.value = ''
                    }
                    onLogoClear()
                  }}
                  className="h-10 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-slate-300 hover:border-primary-500 hover:text-primary-200"
                >
                  Clear
                </button>
              </div>
            </div>
            <label className="flex flex-col gap-2">
              <span>Logo cross origin</span>
              <select
                value={settings.logo.crossOrigin}
                onChange={handleLogoCrossOrigin}
                className="h-10 rounded-xl border border-white/10 bg-black/20 px-3 text-sm"
              >
                <option value="anonymous">anonymous</option>
                <option value="use-credentials">use-credentials</option>
                <option value="none">none</option>
              </select>
            </label>
          </div>
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-2">
              <span>Logo scale ({Math.round(settings.logo.scale * 100)}%)</span>
              <input
                type="range"
                min="0.1"
                max="0.35"
                step="0.01"
                value={settings.logo.scale}
                onChange={handleLogoScale}
                aria-label="Logo scale"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span>Corner radius ({settings.logo.cornerRadius}%)</span>
              <input
                type="range"
                min="0"
                max="40"
                step="1"
                value={settings.logo.cornerRadius}
                onChange={handleLogoCornerRadius}
                aria-label="Logo corner radius"
              />
            </label>
            {logoWarning && (
              <p className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
                {logoWarning}
              </p>
            )}
            {logoRisk && (
              <p className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-xs text-rose-200">
                Large logos are safest with ECC “H”. Switch ECC to “H” when logos cover this much
                surface area.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-white/5 p-4 shadow-inner dark:bg-white/5">
        <header className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-100">Presets &amp; Sharing</h2>
            <p className="text-sm text-slate-400">
              Start from a glassy preset, then share the stateful URL.
            </p>
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-300">
            <input
              type="checkbox"
              checked={animateSheen && !reducedMotionLocked}
              onChange={handleAnimateSheen}
              disabled={reducedMotionLocked}
              className="h-4 w-4 rounded border border-white/20"
            />
            Animate sheen
          </label>
        </header>
        {reducedMotionLocked && (
          <p className="mb-3 rounded-xl border border-blue-300/30 bg-blue-500/10 px-4 py-3 text-xs text-blue-100">
            Motion reduced due to system preference.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.key}
              type="button"
              onClick={() => handlePresetSelect(preset)}
              className={clsx(
                'rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wide transition focus-visible:outline',
                settings.presetKey === preset.key
                  ? 'border-primary-400 bg-primary-500/20 text-primary-200'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:border-primary-500 hover:text-primary-200',
              )}
            >
              {preset.name}
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleShare}
            disabled={shareBusy}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-primary-500/20 px-4 py-2 text-sm font-semibold text-primary-100 transition hover:border-primary-400 hover:text-white focus-visible:outline"
          >
            {shareBusy ? 'Encoding…' : 'Share snapshot'}
          </button>
          {shareFeedback && (
            <span
              role="status"
              className={clsx(
                'text-xs font-medium',
                shareFeedback.tone === 'success'
                  ? 'text-emerald-200'
                  : shareFeedback.tone === 'warning'
                    ? 'text-amber-200'
                    : 'text-rose-200',
              )}
            >
              {shareFeedback.message}
            </span>
          )}
        </div>
      </section>
    </form>
  )
}

export default QREditor
