import { useEffect, useRef, useState } from 'react'
import PanelCard from '@/components/PanelCard'
import QREditor from '@/components/QREditor'
import QRPreview from '@/components/QRPreview'
import ExportPanel from '@/components/ExportPanel'
import type { QRSettings, QRCodeInstance } from '@/lib/qrcode'
import { defaultSettings, createQrCodeInstance, updateQrCodeInstance } from '@/lib/qrcode'
import { useDebouncedValue } from '@/lib/hooks'
import type { ExportFormat } from '@/lib/export'
import { copyQrToClipboard, downloadQr } from '@/lib/export'
import { decodeSettingsFromCurrentUrl, encodeSettingsToUrl } from '@/lib/urlState'
import { fileToDataUrl, withRoundedCorners } from '@/lib/image'

type ThemeMode = 'light' | 'dark'

type ShareFeedback = {
  message: string
  tone: 'success' | 'warning' | 'error'
}

type ExportFeedback = {
  message: string
  tone: 'success' | 'warning' | 'error'
}

const cloneSettings = (settings: QRSettings): QRSettings => ({
  ...settings,
  logo: { ...settings.logo },
})

const mergeWithDefaults = (incoming: QRSettings): QRSettings => ({
  ...defaultSettings,
  ...incoming,
  logo: {
    ...defaultSettings.logo,
    ...incoming.logo,
  },
})

const getInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const App = () => {
  const [settings, setSettings] = useState<QRSettings>(defaultSettings)
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme)
  const [shareFeedback, setShareFeedback] = useState<ShareFeedback | null>(null)
  const [exportFeedback, setExportFeedback] = useState<ExportFeedback | null>(null)
  const [busyAction, setBusyAction] = useState<'idle' | 'copying' | 'downloading'>('idle')
  const [logoWarning, setLogoWarning] = useState<string | null>(null)
  const [shareBusy, setShareBusy] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  const [previewNode, setPreviewNode] = useState<HTMLDivElement | null>(null)
  const qrInstanceRef = useRef<QRCodeInstance | null>(null)

  if (!qrInstanceRef.current) {
    qrInstanceRef.current = createQrCodeInstance(settings)
  }

  const debouncedSettings = useDebouncedValue(settings, 120)

  useEffect(() => {
    const decoded = decodeSettingsFromCurrentUrl()
    if (decoded) {
      setSettings(mergeWithDefaults(decoded))
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    document.body.classList.remove('light', 'dark')
    document.body.classList.add(theme)
  }, [theme])

  useEffect(() => {
    if (!previewNode || !qrInstanceRef.current) return
    previewNode.innerHTML = ''
    qrInstanceRef.current.append(previewNode)
  }, [previewNode])

  useEffect(() => {
    if (!qrInstanceRef.current) return
    updateQrCodeInstance(qrInstanceRef.current, debouncedSettings)
    const container = previewNode
    const svg = container?.querySelector('svg')
    if (svg) {
      svg.setAttribute('role', 'img')
      svg.setAttribute('aria-label', `QR code encoding ${debouncedSettings.text.length} characters`)
    }
  }, [debouncedSettings, previewNode])

  useEffect(() => {
    if (!hydrated) return
    const url = encodeSettingsToUrl(settings)
    if (url) {
      window.history.replaceState({}, '', url)
    }
  }, [settings, hydrated])

  useEffect(() => {
    if (!shareFeedback) return
    const timeout = window.setTimeout(() => setShareFeedback(null), 4000)
    return () => window.clearTimeout(timeout)
  }, [shareFeedback])

  useEffect(() => {
    if (!exportFeedback) return
    const timeout = window.setTimeout(() => setExportFeedback(null), 4000)
    return () => window.clearTimeout(timeout)
  }, [exportFeedback])

  useEffect(() => {
    if (settings.logo.mode === 'upload' && settings.logo.scale > 0.26 && settings.ecc !== 'H') {
      setLogoWarning('Large logos scan best with ECC level “H”. Consider switching before export.')
    } else {
      setLogoWarning(null)
    }
  }, [settings.logo.mode, settings.logo.scale, settings.ecc])

  const handleSettingsChange = (updater: (current: QRSettings) => QRSettings) => {
    setSettings((current) => {
      const draft = cloneSettings(current)
      const next = cloneSettings(updater(draft))
      if (next.logo.mode === 'none') {
        next.logo.originalDataUrl = undefined
        next.logo.processedDataUrl = undefined
      }
      return next
    })
  }

  const handleThemeToggle = () => {
    setTheme((mode) => (mode === 'dark' ? 'light' : 'dark'))
  }

  const processLogoWithRadius = async (rawData: string, cornerRadius: number) =>
    withRoundedCorners(rawData, cornerRadius)

  const handleLogoUpload = async (file: File) => {
    try {
      const rawData = await fileToDataUrl(file)
      const processed = await processLogoWithRadius(rawData, settings.logo.cornerRadius)
      setSettings((current) => ({
        ...current,
        logo: {
          ...current.logo,
          mode: 'upload',
          originalDataUrl: rawData,
          processedDataUrl: processed,
        },
      }))
    } catch (error) {
      console.error(error)
      setLogoWarning('Unable to embed logo. Please try a smaller image or different format.')
    }
  }

  const handleLogoClear = () => {
    setSettings((current) => ({
      ...current,
      logo: {
        ...current.logo,
        mode: 'none',
        originalDataUrl: undefined,
        processedDataUrl: undefined,
      },
    }))
  }

  const handleShare = async () => {
    try {
      setShareBusy(true)
      const url = encodeSettingsToUrl(settings)
      if (!url) return
      window.history.replaceState({}, '', url)
      if (!navigator.clipboard) {
        setShareFeedback({
          message: 'Link ready in the address bar. Clipboard is unavailable in this browser.',
          tone: 'warning',
        })
        return
      }
      await navigator.clipboard.writeText(url.toString())
      setShareFeedback({ message: 'Shareable link copied to clipboard.', tone: 'success' })
    } catch (error) {
      console.error(error)
      setShareFeedback({ message: 'Share failed. Check clipboard permissions.', tone: 'error' })
    } finally {
      setShareBusy(false)
    }
  }

  const handleCopy = async ({ size, transparent }: { size: number; transparent: boolean }) => {
    try {
      setBusyAction('copying')
      await copyQrToClipboard(settings, { size, transparent })
      setExportFeedback({ message: 'PNG copied to clipboard.', tone: 'success' })
    } catch (error) {
      console.error(error)
      setExportFeedback({
        message: 'Clipboard copy failed. Safari may require user gesture.',
        tone: 'error',
      })
    } finally {
      setBusyAction('idle')
    }
  }

  const handleDownload = async ({
    format,
    size,
    transparent,
    fileName,
  }: {
    format: ExportFormat
    size: number
    transparent: boolean
    fileName: string
  }) => {
    try {
      setBusyAction('downloading')
      await downloadQr(settings, { format, size, transparent, fileName })
      setExportFeedback({ message: `${format.toUpperCase()} saved to downloads.`, tone: 'success' })
    } catch (error) {
      console.error(error)
      setExportFeedback({ message: 'Download failed. Try a different format.', tone: 'error' })
    } finally {
      setBusyAction('idle')
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 lg:flex-row">
        <PanelCard className="flex-1">
          <QREditor
            settings={settings}
            onSettingsChange={handleSettingsChange}
            theme={theme}
            onThemeToggle={handleThemeToggle}
            onLogoUpload={handleLogoUpload}
            onLogoClear={handleLogoClear}
            shareBusy={shareBusy}
            onShare={handleShare}
            shareFeedback={shareFeedback}
            logoWarning={logoWarning}
          />
        </PanelCard>
        <PanelCard className="flex-1">
          <div className="flex flex-col gap-8">
            <QRPreview
              onContainerReady={setPreviewNode}
              settings={settings}
              statusMessage={exportFeedback?.message}
            />
            <ExportPanel
              onCopy={handleCopy}
              onDownload={(options) => handleDownload(options)}
              busyAction={busyAction}
              statusMessage={exportFeedback?.message ?? null}
              statusTone={exportFeedback?.tone ?? 'success'}
            />
          </div>
        </PanelCard>
      </div>
    </div>
  )
}

export default App
