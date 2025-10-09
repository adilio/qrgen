import { useEffect, useMemo, useRef, useState } from 'react'
import GlassCard from '@/components/GlassCard'
import QREditor from '@/components/QREditor'
import QRPreview from '@/components/QRPreview'
import ExportPanel from '@/components/ExportPanel'
import type { QRSettings, QRCodeInstance } from '@/lib/qrcode'
import { defaultSettings, createQrCodeInstance, updateQrCodeInstance } from '@/lib/qrcode'
import { applyPreset, PRESETS } from '@/lib/presets'
import { useDebouncedValue, usePrefersReducedMotion } from '@/lib/hooks'
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
  gradient: { ...settings.gradient },
  logo: { ...settings.logo },
})

const mergeWithDefaults = (incoming: QRSettings): QRSettings => ({
  ...defaultSettings,
  ...incoming,
  gradient: {
    ...defaultSettings.gradient,
    ...incoming.gradient,
  },
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
  const prefersReducedMotion = usePrefersReducedMotion()

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
    if (!prefersReducedMotion) return
    setSettings((current) => (current.animateSheen ? { ...current, animateSheen: false } : current))
  }, [prefersReducedMotion])

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

  const {
    logo: { cornerRadius, mode: logoMode, rawDataUrl, externalUrl },
  } = settings

  const ensureHighEcc = (candidate: QRSettings, notify = true) => {
    const hasImage =
      candidate.logo.mode !== 'none' &&
      (candidate.logo.mode === 'upload'
        ? Boolean(candidate.logo.rawDataUrl)
        : Boolean(candidate.logo.externalUrl))
    if (hasImage && candidate.logo.scale > 0.26 && candidate.ecc !== 'H') {
      if (notify) {
        setShareFeedback({
          message: 'ECC bumped to “H” to protect the embedded logo.',
          tone: 'warning',
        })
      }
      const adjusted: QRSettings = {
        ...candidate,
        ecc: 'H',
        presetKey: null,
      }
      return adjusted
    }
    return candidate
  }

  useEffect(() => {
    if (logoMode === 'none') return
    const source = logoMode === 'upload' ? rawDataUrl : externalUrl
    if (!source) return
    let active = true
    withRoundedCorners(source, cornerRadius).then((processed) => {
      if (!active || !processed) return
      setSettings((current) => {
        if (current.logo.mode === 'none') return current
        if (current.logo.cornerRadius !== cornerRadius) return current
        if (current.logo.mode === 'upload' && current.logo.rawDataUrl !== source) return current
        if (current.logo.mode === 'external' && current.logo.externalUrl !== source) return current
        if (processed === current.logo.processedDataUrl) return current
        return {
          ...current,
          logo: {
            ...current.logo,
            processedDataUrl: processed,
          },
        }
      })
    })
    return () => {
      active = false
    }
  }, [cornerRadius, logoMode, rawDataUrl, externalUrl])

  useEffect(() => {
    setSettings((current) => ensureHighEcc(current, false))
  }, [logoMode, rawDataUrl, externalUrl, settings.logo.scale])

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

  const handleSettingsChange = (updater: (current: QRSettings) => QRSettings) => {
    setSettings((current) => {
      const draft = cloneSettings(current)
      const next = ensureHighEcc(cloneSettings(updater(draft)))
      if (next.logo.mode === 'none') {
        next.logo.rawDataUrl = undefined
        next.logo.processedDataUrl = undefined
      }
      return next
    })
  }

  const handleThemeToggle = () => {
    setTheme((mode) => (mode === 'dark' ? 'light' : 'dark'))
  }

  const handlePresetFromComponent = (preset: (typeof PRESETS)[number]) => {
    setSettings((current) => applyPreset(cloneSettings(current), preset))
    setShareFeedback({ message: `${preset.name} preset applied.`, tone: 'success' })
  }

  const processLogoWithRadius = async (rawData: string, cornerRadius: number) =>
    withRoundedCorners(rawData, cornerRadius)

  const handleLogoUpload = async (file: File) => {
    try {
      const rawData = await fileToDataUrl(file)
      const processed = await processLogoWithRadius(rawData, settings.logo.cornerRadius)
      setSettings((current) =>
        ensureHighEcc({
          ...current,
          logo: {
            ...current.logo,
            mode: 'upload',
            rawDataUrl: rawData,
            processedDataUrl: processed,
          },
          presetKey: null,
        }),
      )
      setLogoWarning(null)
    } catch (error) {
      console.error(error)
      setLogoWarning('Unable to embed logo. Please try a smaller image or different format.')
    }
  }

  const handleLogoExternalChange = async (url: string) => {
    if (!url) {
      setSettings((current) => ({
        ...current,
        logo: {
          ...current.logo,
          mode: 'none',
          externalUrl: '',
          rawDataUrl: undefined,
          processedDataUrl: undefined,
        },
      }))
      return
    }
    try {
      const processed = await processLogoWithRadius(url, settings.logo.cornerRadius)
      setSettings((current) =>
        ensureHighEcc({
          ...current,
          logo: {
            ...current.logo,
            mode: 'external',
            externalUrl: url,
            processedDataUrl: processed,
          },
          presetKey: null,
        }),
      )
      setLogoWarning(null)
    } catch (error) {
      console.error(error)
      setLogoWarning(
        'We could not process that URL. Check CORS headers or download and upload the image instead.',
      )
    }
  }

  const handleLogoClear = () => {
    setSettings((current) => ({
      ...current,
      logo: {
        ...current.logo,
        mode: 'none',
        externalUrl: '',
        rawDataUrl: undefined,
        processedDataUrl: undefined,
      },
    }))
    setLogoWarning(null)
  }

  const handleAnimateSheenChange = (value: boolean) => {
    if (prefersReducedMotion && value) return
    setSettings((current) => ({ ...current, animateSheen: value }))
  }

  const handleShare = async () => {
    try {
      setShareBusy(true)
      if (!navigator.clipboard) {
        setShareFeedback({ message: 'Clipboard unavailable in this browser.', tone: 'error' })
        return
      }
      const url = encodeSettingsToUrl(settings)
      if (!url) return
      await navigator.clipboard.writeText(url.toString())
      setShareFeedback({ message: 'Sharable link copied to clipboard.', tone: 'success' })
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

  const shareFeedbackMemo = useMemo(() => shareFeedback, [shareFeedback])

  return (
    <div className="min-h-screen px-4 py-10 text-slate-100 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 lg:flex-row">
        <GlassCard sheen={settings.animateSheen && !prefersReducedMotion} className="flex-1">
          <QREditor
            settings={settings}
            onSettingsChange={handleSettingsChange}
            onApplyPreset={handlePresetFromComponent}
            theme={theme}
            onThemeToggle={handleThemeToggle}
            onLogoUpload={handleLogoUpload}
            onLogoExternalChange={handleLogoExternalChange}
            onLogoClear={handleLogoClear}
            shareBusy={shareBusy}
            onShare={handleShare}
            shareFeedback={shareFeedbackMemo}
            animateSheen={settings.animateSheen}
            onAnimateSheenChange={handleAnimateSheenChange}
            reducedMotionLocked={prefersReducedMotion}
            logoWarning={logoWarning}
          />
        </GlassCard>
        <GlassCard sheen={settings.animateSheen && !prefersReducedMotion} className="flex-1">
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
        </GlassCard>
      </div>
    </div>
  )
}

export default App
