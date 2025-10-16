import { useEffect, useState, useRef } from 'react'
import QRPreview from '@/components/QRPreview'
import ColorSection from '@/components/ColorSection'
import ParticleBackground from '@/components/ParticleBackground'
import Toast from '@/components/Toast'
import LogoUpload from '@/components/LogoUpload'
import CollapsibleSection from '@/components/CollapsibleSection'
import ThemeToggle from '@/components/ThemeToggle'
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext'
import { useConfetti } from '@/hooks/useConfetti'
import type { QRSettings, QRCodeInstance } from '@/lib/qrcode'
import { defaultSettings, createQrCodeInstance, updateQrCodeInstance } from '@/lib/qrcode'
import type { ExportFormat } from '@/lib/export'
import { copyQrToClipboard, downloadQr } from '@/lib/export'
import { decodeSettingsFromCurrentUrl, encodeSettingsToUrl } from '@/lib/urlState'

type ShareFeedback = {
  message: string
  tone: 'success' | 'warning' | 'error'
}

type ExportFeedback = {
  message: string
  tone: 'success' | 'warning' | 'error'
}


const AppContent = () => {
  const { theme } = useTheme()

  // Debug: Log theme value to help troubleshoot logo issues
  console.log('Current theme:', theme)
  const [settings, setSettings] = useState<QRSettings>(defaultSettings)
  const [shareFeedback, setShareFeedback] = useState<ShareFeedback | null>(null)
  const [exportFeedback, setExportFeedback] = useState<ExportFeedback | null>(null)
  const [busyAction, setBusyAction] = useState<'idle' | 'copying' | 'downloading'>('idle')
  const [shareBusy, setShareBusy] = useState(false)
  const [previewNode, setPreviewNode] = useState<HTMLDivElement | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  // Toast system state
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'warning' | 'error' | 'info'
    visible: boolean
  }>({ message: '', type: 'success', visible: false })

  const { triggerDownload, triggerShare } = useConfetti()

  const qrInstanceRef = useRef<QRCodeInstance | null>(null)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-expand textarea
  const adjustTextAreaHeight = () => {
    const textarea = textAreaRef.current
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto'

      // Calculate new height, but constrain between min and max
      // Use smaller minimum to fit single line text tightly
      const minHeight = 28 // Tight single line height
      const maxHeight = 120 // ~4 rows
      const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight)

      textarea.style.height = `${newHeight}px`
    }
  }

  const showToast = (message: string, type: 'success' | 'warning' | 'error' | 'info' = 'success') => {
    setToast({ message, type, visible: true })
  }

  // Initialize QR instance
  if (!qrInstanceRef.current) {
    qrInstanceRef.current = createQrCodeInstance(settings)
  }

  useEffect(() => {
    const decoded = decodeSettingsFromCurrentUrl()
    if (decoded) {
      setSettings(prev => ({ ...prev, ...decoded }))
    }
  }, [])

  // Simple debounce for QR updates
  useEffect(() => {
    const timer = setTimeout(() => {
      if (qrInstanceRef.current) {
        updateQrCodeInstance(qrInstanceRef.current, settings)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [settings])

  // Update QR instance when preview node is ready
  useEffect(() => {
    if (!previewNode || !qrInstanceRef.current) return
    previewNode.innerHTML = ''
    qrInstanceRef.current.append(previewNode)
  }, [previewNode])

  useEffect(() => {
    if (!shareFeedback) return
    const timeout = window.setTimeout(() => setShareFeedback(null), 4000)
    return () => window.clearTimeout(timeout)
  }, [shareFeedback])

  // Keyboard shortcut for quick copy (Ctrl+C / Cmd+C)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+C or Cmd+C to copy QR when focused on preview
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        const activeElement = document.activeElement
        const isQRFocused = activeElement?.closest('[aria-label*="QR code"]')

        if (isQRFocused && settings.text.length > 0) {
          e.preventDefault()
          handleCopy({ size: 1024, transparent: true })
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [settings.text])

  useEffect(() => {
    if (!exportFeedback) return
    const timeout = window.setTimeout(() => setExportFeedback(null), 4000)
    return () => window.clearTimeout(timeout)
  }, [exportFeedback])

  // Auto-adjust textarea height when text changes
  useEffect(() => {
    adjustTextAreaHeight()
  }, [settings.text])

  // Initial height adjustment
  useEffect(() => {
    adjustTextAreaHeight()
  }, [])

  // Auto-select example.com on initial load
  useEffect(() => {
    if (textAreaRef.current && settings.text === 'https://example.com') {
      // Small delay to ensure component is mounted
      setTimeout(() => {
        textAreaRef.current?.focus()
        textAreaRef.current?.setSelectionRange(8, 27) // Select "example.com"
      }, 100)
    }
  }, [])

  const handleSettingsChange = (updater: (current: QRSettings) => QRSettings) => {
    setIsUpdating(true)
    setSettings(updater)
    // Reset updating state after a short delay to show loading
    setTimeout(() => setIsUpdating(false), 300)
  }

  const handleShare = async () => {
    try {
      setShareBusy(true)
      const url = encodeSettingsToUrl(settings)
      if (!url) return
      window.history.replaceState({}, '', url)
      if (!navigator.clipboard) {
        showToast('Link ready in the address bar. Clipboard is unavailable in this browser.', 'warning')
        setShareFeedback({
          message: 'Link ready in the address bar. Clipboard is unavailable in this browser.',
          tone: 'warning',
        })
        return
      }
      await navigator.clipboard.writeText(url.toString())
      triggerShare()
      showToast('🎉 Shareable link copied to clipboard!', 'success')
      setShareFeedback({ message: 'Shareable link copied to clipboard.', tone: 'success' })
    } catch (error) {
      console.error(error)
      showToast('❌ Share failed. Check clipboard permissions.', 'error')
      setShareFeedback({ message: 'Share failed. Check clipboard permissions.', tone: 'error' })
    } finally {
      setShareBusy(false)
    }
  }

  const handleCopy = async ({ size, transparent }: { size: number; transparent: boolean }) => {
    try {
      setBusyAction('copying')
      await copyQrToClipboard(settings, { size, transparent })
      showToast('📋 QR code copied to clipboard!', 'success')
      setExportFeedback({ message: 'PNG copied to clipboard.', tone: 'success' })
    } catch (error) {
      console.error(error)
      showToast('❌ Clipboard copy failed. Safari may require user gesture.', 'error')
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
      triggerDownload()
      showToast(`🎉 ${format.toUpperCase()} saved to downloads!`, 'success')
      setExportFeedback({ message: `${format.toUpperCase()} saved to downloads.`, tone: 'success' })
    } catch (error) {
      console.error(error)
      showToast('❌ Download failed. Try a different format.', 'error')
      setExportFeedback({ message: 'Download failed. Try a different format.', tone: 'error' })
    } finally {
      setBusyAction('idle')
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden" style={{
      background: theme === 'dark'
        ? 'linear-gradient(180deg, #1a0a3e 0%, #0a0520 100%)'
        : 'linear-gradient(180deg, #ffffff 0%, #ffffff 100%)'
    }}>
      {/* Theme Toggle */}
      <ThemeToggle />

      {/* Skip to main content link for keyboard navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-cyan-400 text-gray-900 px-4 py-2 rounded-lg font-medium z-50 focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to main content
      </a>

      {/* Animated Particle Background */}
      <div role="presentation" aria-hidden="true">
        <ParticleBackground />
      </div>

      {/* White overlay to soften background visuals */}
      <div className="pointer-events-none fixed inset-0 bg-white/65 dark:bg-zinc-950/30 backdrop-blur-sm" />

      <div id="main-content" className="relative min-h-screen px-4 py-8" style={{ zIndex: 10 }} role="main">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="relative">
                <img
                  src={`${import.meta.env.BASE_URL || ''}qrgen.svg`}
                  alt="qrgen logo"
                  className="h-12 w-auto filter drop-shadow-lg"
                  style={{
                    filter: theme === 'dark'
                      ? 'brightness(0) invert(1) drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))'
                      : 'brightness(0) drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))'
                  }}
                  onError={(e) => {
                    console.error('SVG logo failed to load:', e.currentTarget.src);
                  }}
                  onLoad={() => {
                    console.log('SVG logo loaded successfully');
                  }}
                />
              </div>
              <h1 className="text-4xl font-bold text-zinc-800 dark:text-zinc-100">
                QRgen - QR Code Generator
              </h1>
            </div>
            <p className="text-zinc-600 dark:text-zinc-300">
              Create beautiful QR codes instantly
            </p>
          </header>

          {/* QR Preview */}
          <div className="flex justify-center mb-8">
            <div className={`${theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-gray-100/80 border-gray-300/50'} backdrop-blur-sm border rounded-xl p-6`}>
              <QRPreview
                onContainerReady={setPreviewNode}
                settings={settings}
                isUpdating={isUpdating}
                onCopy={() => handleCopy({ size: 1024, transparent: true })}
              />
            </div>
          </div>

          {/* Main Action Buttons */}
          <div className="flex justify-center mb-8">
            <div className="flex flex-wrap gap-6 justify-center">
              <button
                onClick={() => handleCopy({ size: 1024, transparent: true })}
                disabled={!settings.text || busyAction === 'copying'}
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold text-lg hover:from-cyan-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-cyan-500/25 min-w-[140px]"
              >
                {busyAction === 'copying' ? 'Copying...' : '📋 Copy QR'}
              </button>

              <button
                onClick={() => handleDownload({
                  format: 'png',
                  size: settings.size,
                  transparent: true,
                  fileName: 'qr-code'
                })}
                disabled={!settings.text || busyAction === 'downloading'}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold text-lg hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-purple-500/25 min-w-[140px]"
              >
                {busyAction === 'downloading' ? 'Downloading...' : '💾 Download'}
              </button>

              <button
                onClick={handleShare}
                disabled={shareBusy || !settings.text}
                className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold text-lg hover:from-emerald-600 hover:to-teal-600 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-emerald-500/25 min-w-[140px]"
              >
                {shareBusy ? 'Preparing...' : '🔗 Share Link'}
              </button>
            </div>
          </div>

          {/* Main Content */}
          <main className="space-y-8">
            {/* URL Input - Dynamic */}
            <section className="surface p-5">
              <label htmlFor="qr-input" className="section-title block mb-2">
                Enter URL or Text
              </label>
              <textarea
                ref={textAreaRef}
                id="qr-input"
                className={`w-full ${theme === 'dark' ? 'bg-white/10 border-white/20 text-zinc-100 placeholder-zinc-400' : 'bg-white/90 border-zinc-300/50 text-zinc-900 placeholder-zinc-500'} border rounded-lg py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 resize-none overflow-hidden`}
                value={settings.text}
                onChange={(e) => {
                  handleSettingsChange((current) => ({ ...current, text: e.target.value }))
                  // Adjust height immediately on change for smooth UX
                  setTimeout(adjustTextAreaHeight, 0)
                }}
                placeholder="Enter your URL or text here..."
                style={{
                  height: '28px',
                  minHeight: '28px',
                  maxHeight: '120px',
                  lineHeight: '1.4'
                }}
                aria-describedby="input-help"
                onFocus={(e) => {
                  // Select example.com part when user focuses on the field
                  const textarea = e.target as HTMLTextAreaElement
                  if (textarea.value === 'https://example.com') {
                    // Small timeout to ensure focus is complete
                    setTimeout(() => {
                      textarea.setSelectionRange(8, 27) // Select "example.com"
                    }, 10)
                  }
                }}
                onClick={(e) => {
                  // Also handle click to select example.com part
                  const textarea = e.target as HTMLTextAreaElement
                  if (textarea.value === 'https://example.com') {
                    setTimeout(() => {
                      textarea.setSelectionRange(8, 27) // Select "example.com"
                    }, 10)
                  }
                }}
              />
              <div className="flex items-center justify-between mt-1">
                <p id="input-help" className="text-zinc-500 dark:text-zinc-400 text-xs">
                  {settings.text.length} characters • {settings.ecc} error correction
                </p>
                {settings.text.length > 100 && (
                  <p className="text-amber-400 text-xs">
                    Long text may affect QR scanability
                  </p>
                )}
              </div>
            </section>

            {/* Colors - Unified Section */}
            <CollapsibleSection title="Colors & Styles" defaultOpen={false}>
              <ColorSection
                settings={settings}
                onSettingsChange={handleSettingsChange}
              />
            </CollapsibleSection>

            {/* Logo Upload - Collapsible */}
            <CollapsibleSection title="Add Logo" defaultOpen={false}>
              <LogoUpload
                logoConfig={settings.logo}
                onLogoChange={(logo) => handleSettingsChange((current) => ({ ...current, logo }))}
              />
            </CollapsibleSection>

            {/* Advanced Options - Collapsible */}
            <CollapsibleSection title="Size & Options" defaultOpen={false}>
              <div className="space-y-4">
                {/* Simple Size Options */}
                <div>
                  <label className="block text-white mb-3 text-sm font-medium">QR Code Size</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { name: 'Small', size: 200 },
                      { name: 'Medium', size: 300 },
                      { name: 'Large', size: 400 },
                      { name: 'Extra Large', size: 500 }
                    ].map((preset) => (
                      <button
                        key={preset.size}
                        onClick={() => handleSettingsChange((current) => ({ ...current, size: preset.size }))}
                        className={`px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                          settings.size === preset.size
                            ? 'border-cyan-400 bg-cyan-400/20 text-white'
                            : 'border-white/20 hover:border-white/40 text-white/70 hover:text-white'
                        }`}
                      >
                        {preset.name}
                        <div className="text-xs opacity-70">{preset.size}px</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Error Correction */}
                <div>
                  <label className="block text-white mb-3 text-sm font-medium">Error Correction Level</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {['L', 'M', 'Q', 'H'].map((level) => (
                      <button
                        key={level}
                        onClick={() => handleSettingsChange((current) => ({ ...current, ecc: level as any }))}
                        className={`px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                          settings.ecc === level
                            ? 'border-cyan-400 bg-cyan-400/20 text-white'
                            : 'border-white/20 hover:border-white/40 text-white/70 hover:text-white'
                        }`}
                      >
                        {level}
                        <div className="text-xs opacity-70">
                          {level === 'L' ? 'Low' : level === 'M' ? 'Medium' : level === 'Q' ? 'Quartile' : 'High'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CollapsibleSection>
          </main>
        </div>
      </div>

      {/* Toast Notifications */}
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onComplete={() => setToast(prev => ({ ...prev, visible: false }))}
      />
    </div>
  )
}

const App = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}

export default App