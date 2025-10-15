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
    <form className="space-y-6 glass-panel p-6" onSubmit={handleDownload}>
      <header className="space-y-2">
        <h3 className="text-xl font-semibold text-white">Export QR Code</h3>
        <p className="text-sm text-gray-300">
          Choose format and quality, then download or copy to clipboard.
        </p>
      </header>

      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-300">Format</span>
            <select
              value={format}
              onChange={(event) => handleFormatChange(event.target.value as ExportFormat)}
              className="h-11 w-full rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-medium text-white backdrop-blur-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <option value="png" className="bg-gray-900">PNG</option>
              <option value="jpeg" className="bg-gray-900">JPG</option>
              <option value="svg" className="bg-gray-900">SVG</option>
              <option value="webp" className="bg-gray-900">WEBP</option>
            </select>
          </label>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">Resolution</span>
              <span className="text-xs uppercase tracking-[0.2em] text-cyan-400">
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
                    'flex-1 rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-200',
                    sizePreset === preset
                      ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white border-transparent shadow-lg'
                      : 'border-white/20 text-white/70 hover:border-white/40 hover:text-white hover:bg-white/10',
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
              'flex-1 glass-button glass-button-primary text-white font-semibold',
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
              'flex-1 glass-button text-white font-semibold',
              busyAction === 'copying' && 'cursor-wait opacity-70',
            )}
            disabled={busyAction === 'copying'}
          >
            {busyAction === 'copying' ? 'Copying…' : 'Copy to Clipboard'}
          </button>
        </div>

        <button
          type="button"
          onClick={toggleAdvanced}
          aria-expanded={showAdvanced}
          aria-controls="export-advanced"
          className="flex w-full items-center justify-center gap-2 text-sm font-medium text-gray-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          {showAdvanced ? 'Hide' : 'Show'} advanced options
          <svg
            className={clsx('h-4 w-4 accordion-chevron', showAdvanced ? 'rotate' : '')}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showAdvanced && (
          <div
            id="export-advanced"
            className={clsx('space-y-4 p-5 border border-white/20 rounded-xl bg-white/5 backdrop-blur-sm', showAdvanced && 'accordion-content open')}
          >
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-300">
                Custom resolution ({customSize}px)
              </span>
              <input
                type="range"
                min={512}
                max={3072}
                step={64}
                value={customSize}
                onChange={(event) => handleCustomSizeChange(Number(event.target.value))}
                className="w-full accent-cyan-400"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-300">File name</span>
              <input
                type="text"
                value={fileName}
                onChange={(event) => setFileName(event.target.value)}
                className="h-11 rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-medium text-white backdrop-blur-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-gray-400"
                placeholder="qr-code"
                required
              />
            </label>

            {format === 'png' && (
              <label className="flex items-center justify-between gap-3 p-4 border border-white/20 rounded-xl bg-white/5 backdrop-blur-sm">
                <div>
                  <p className="text-sm font-medium text-gray-300">Transparent background</p>
                  <p className="text-xs text-gray-400">
                    PNG format with transparent background
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={transparent}
                  onChange={(event) => setTransparent(event.target.checked)}
                  className="h-5 w-5 rounded border-white/20 bg-white/10 text-cyan-400 focus:ring-cyan-400 focus:ring-offset-0"
                />
              </label>
            )}
          </div>
        )}
      </div>

      {statusMessage && (
        <div className={clsx(
          'p-3 rounded-xl text-sm font-medium toast-enter',
          statusTone === 'success'
            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
            : statusTone === 'warning'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'bg-red-500/20 text-red-400 border border-red-500/30',
        )}>
          {statusMessage}
        </div>
      )}
    </form>
  )
}

export default ExportPanel
