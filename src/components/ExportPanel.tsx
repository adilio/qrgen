import { useState } from 'react'
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

const ExportPanel = ({
  onCopy,
  onDownload,
  busyAction,
  statusMessage,
  statusTone = 'success',
}: ExportPanelProps) => {
  const [format, setFormat] = useState<ExportFormat>('png')
  const [size, setSize] = useState<number>(1024)
  const [transparent, setTransparent] = useState<boolean>(false)
  const [fileName, setFileName] = useState('qr-code')

  const handleDownload = async (event: FormEvent) => {
    event.preventDefault()
    await onDownload({ format, size, transparent, fileName })
  }

  const handleCopy = async () => {
    await onCopy({ size, transparent })
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleDownload}>
      <header>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Export</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Choose a format and resolution, then copy or download.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-sm text-slate-600 dark:text-slate-200">Format</span>
          <select
            value={format}
            onChange={(event) => setFormat(event.target.value as ExportFormat)}
            className="h-10 rounded-lg border border-slate-300/80 bg-white px-3 text-sm text-slate-900 focus-visible:border-accent-500 focus-visible:outline-none dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="png">PNG</option>
            <option value="jpeg">JPG</option>
            <option value="svg">SVG</option>
            <option value="webp">WEBP</option>
          </select>
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm text-slate-600 dark:text-slate-200">Resolution ({size}px)</span>
          <input
            type="range"
            min="512"
            max="2048"
            step="64"
            value={size}
            onChange={(event) => setSize(Number(event.target.value))}
            aria-label="Export resolution"
          />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-sm text-slate-600 dark:text-slate-200">File name</span>
          <input
            type="text"
            value={fileName}
            onChange={(event) => setFileName(event.target.value)}
            className="h-10 rounded-lg border border-slate-300/80 bg-white px-3 text-sm text-slate-900 focus-visible:border-accent-500 focus-visible:outline-none dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-100"
            placeholder="qr-code"
            required
          />
        </label>
        <label className="flex items-center justify-between gap-3 rounded-lg border border-slate-300/80 bg-white px-4 py-3 text-sm text-slate-700 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-200">
          Transparent background
          <input
            type="checkbox"
            checked={transparent}
            onChange={(event) => setTransparent(event.target.checked)}
            className="h-5 w-5 rounded border border-slate-400"
          />
        </label>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className={clsx(
            'inline-flex items-center gap-2 rounded-full border border-slate-300/80 bg-accent-500 px-4 py-2 text-sm font-semibold text-white transition hover:border-accent-600 hover:bg-accent-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 disabled:cursor-not-allowed disabled:opacity-70',
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
            'inline-flex items-center gap-2 rounded-full border border-slate-300/80 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-accent-500 hover:text-accent-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-200',
            busyAction === 'copying' && 'cursor-wait opacity-70',
          )}
          disabled={busyAction === 'copying'}
        >
          {busyAction === 'copying' ? 'Copying…' : 'Copy PNG to clipboard'}
        </button>
      </div>
      {statusMessage && (
        <p
          role="status"
          className={clsx(
            'text-xs font-medium',
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
