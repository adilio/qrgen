import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import clsx from 'clsx'
import type { ExportFormat } from '@/lib/export'

interface ExportPanelProps {
  onCopy: (options: { size: number; transparent: boolean }) => Promise<void>
  onDownload: (options: {
    format: ExportFormat
    size: number
    transparent: boolean
    fileName: string
  }) => Promise<void>
  busyAction: 'idle' | 'copying' | 'downloading'
  statusMessage: string | null
  statusTone?: 'success' | 'warning' | 'error'
}

type SizePreset = 'small' | 'medium' | 'large' | 'custom'

const PRESET_SIZES: Record<Exclude<SizePreset, 'custom'>, number> = {
  small: 512,
  medium: 1024,
  large: 2048,
}

const ExportPanel = ({
  onCopy,
  onDownload,
  busyAction,
  statusMessage,
  statusTone = 'success',
}: ExportPanelProps) => {
  const [format, setFormat] = useState<ExportFormat>('png')
  const [sizePreset, setSizePreset] = useState<SizePreset>('medium')
  const [customSize, setCustomSize] = useState<number>(PRESET_SIZES.medium)
  const [transparent, setTransparent] = useState<boolean>(true)
  const [fileName, setFileName] = useState('qr-code')
  const [showAdvanced, setShowAdvanced] = useState(false)

  useEffect(() => {
    if (format !== 'png' && transparent) {
      setTransparent(false)
    }
  }, [format, transparent])

  const resolvedSize = sizePreset === 'custom' ? customSize : PRESET_SIZES[sizePreset]

  const handleFormatChange = (nextFormat: ExportFormat) => {
    setFormat(nextFormat)
    if (nextFormat === 'png') {
      setTransparent(true)
    }
  }

  const handlePresetClick = (preset: Exclude<SizePreset, 'custom'>) => {
    setSizePreset(preset)
    setCustomSize(PRESET_SIZES[preset])
  }

  const handleCustomSizeChange = (value: number) => {
    setSizePreset('custom')
    setCustomSize(value)
  }

  const handleDownload = async (event: FormEvent) => {
    event.preventDefault()
    await onDownload({
      format,
      size: resolvedSize,
      transparent: transparent && format === 'png',
      fileName: fileName.trim() || 'qr-code',
    })
  }

  const handleCopy = async () => {
    await onCopy({ size: resolvedSize, transparent: transparent && format === 'png' })
  }

  const toggleAdvanced = () => setShowAdvanced((current) => !current)

  const presetLabel =
    sizePreset === 'custom'
      ? `${customSize}px`
      : `${PRESET_SIZES[sizePreset]}px`

  return (
    <form className="space-y-6" onSubmit={handleDownload}>
      <header className="space-y-1">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
          Export
        </span>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Ship your QR</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Choose a format and resolution, then download or copy a production-ready image.
        </p>
      </header>

      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Format</span>
            <div className="relative">
              <select
                value={format}
                onChange={(event) => handleFormatChange(event.target.value as ExportFormat)}
                className="h-11 w-full rounded-2xl border border-transparent bg-slate-100/80 px-4 text-sm font-medium text-slate-700 shadow-inner focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500 dark:bg-slate-800/70 dark:text-slate-200"
              >
                <option value="png">PNG</option>
                <option value="jpeg">JPG</option>
                <option value="svg">SVG</option>
                <option value="webp">WEBP</option>
              </select>
            </div>
          </label>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Resolution</span>
              <span className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                {presetLabel}
              </span>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              {(Object.keys(PRESET_SIZES) as Array<Exclude<SizePreset, 'custom'>>).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handlePresetClick(preset)}
                  className={clsx(
                    'flex-1 rounded-2xl border border-transparent px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500',
                    sizePreset === preset
                      ? 'bg-accent-500 text-white shadow shadow-accent-500/25'
                      : 'bg-slate-100/80 text-slate-700 hover:bg-slate-200 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:bg-slate-800',
                  )}
                >
                  {preset.charAt(0).toUpperCase() + preset.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            className={clsx(
              'inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-accent-500 px-5 py-3 text-sm font-semibold text-white shadow shadow-accent-500/30 transition hover:bg-accent-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 disabled:cursor-not-allowed disabled:opacity-70',
              busyAction === 'downloading' && 'cursor-wait opacity-70',
            )}
            disabled={busyAction === 'downloading'}
          >
            {busyAction === 'downloading' ? 'Preparing…' : `Download ${format.toUpperCase()}`}
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className={clsx(
              'inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-200/70 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-accent-500 hover:text-accent-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 dark:border-slate-700/60 dark:bg-slate-900/80 dark:text-slate-200',
              busyAction === 'copying' && 'cursor-wait opacity-70',
            )}
            disabled={busyAction === 'copying'}
          >
            {busyAction === 'copying' ? 'Copying…' : 'Copy PNG to clipboard'}
          </button>
        </div>

        <button
          type="button"
          onClick={toggleAdvanced}
          aria-expanded={showAdvanced}
          aria-controls="export-advanced"
          className="flex w-full items-center justify-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 dark:text-slate-400 dark:hover:text-slate-200"
        >
          {showAdvanced ? 'Hide' : 'Show'} advanced controls
          <svg
            className={clsx('h-4 w-4 transition-transform', showAdvanced ? 'rotate-180' : '')}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showAdvanced && (
          <div
            id="export-advanced"
            className="space-y-4 rounded-2xl border border-slate-200/70 bg-white/90 p-5 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/80"
          >
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Custom resolution ({customSize}px)
              </span>
              <input
                type="range"
                min={512}
                max={3072}
                step={64}
                value={customSize}
                onChange={(event) => handleCustomSizeChange(Number(event.target.value))}
                className="accent-accent-500"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">File name</span>
              <input
                type="text"
                value={fileName}
                onChange={(event) => setFileName(event.target.value)}
                className="h-11 rounded-2xl border border-transparent bg-slate-100/80 px-4 text-sm font-medium text-slate-700 shadow-inner focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500 dark:bg-slate-800/70 dark:text-slate-200"
                placeholder="qr-code"
                required
              />
            </label>

            <label className="flex items-center justify-between gap-3 rounded-2xl bg-slate-100/80 px-5 py-4 shadow-inner ring-1 ring-slate-200 dark:bg-slate-800/70 dark:ring-slate-700">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Transparent background</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Only available for PNG exports.
                </p>
              </div>
              <input
                type="checkbox"
                checked={transparent}
                onChange={(event) => setTransparent(event.target.checked)}
                disabled={format !== 'png'}
                className="h-5 w-5 rounded border-slate-400 text-accent-500 focus:ring-accent-500 disabled:opacity-50"
              />
            </label>
          </div>
        )}
      </div>

      {statusMessage && (
        <p
          role="status"
          className={clsx(
            'text-sm font-medium',
            statusTone === 'success'
              ? 'text-emerald-600 dark:text-emerald-300'
              : statusTone === 'warning'
                ? 'text-amber-600 dark:text-amber-300'
                : 'text-rose-600 dark:text-rose-300',
          )}
        >
          {statusMessage}
        </p>
      )}
    </form>
  )
}

export default ExportPanel
