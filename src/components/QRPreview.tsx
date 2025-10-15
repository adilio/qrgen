import { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import type { QRSettings } from '@/lib/qrcode'

interface QRPreviewProps {
  onContainerReady: (node: HTMLDivElement | null) => void
  settings: QRSettings
  isUpdating?: boolean
  onCopy?: () => void
}

const QRPreview = ({ onContainerReady, settings, isUpdating = false, onCopy }: QRPreviewProps) => {
  const { theme } = useTheme()
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!settings.text || !onCopy) return

    try {
      await onCopy()
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <div
          className={`w-[280px] h-[280px] ${theme === 'dark' ? 'bg-white/20 border-white/20 hover:border-white/30' : 'bg-white/90 border-gray-300/50 hover:border-gray-400/50'} backdrop-blur-sm rounded-xl p-3 shadow-lg border transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer`}
          role="button"
          onClick={handleCopy}
          aria-label={`QR code encoding ${settings.text.length} characters. Click to copy.`}
          title="Click to copy QR code to clipboard"
        >
          <div
            ref={onContainerReady}
            className="w-full h-full flex items-center justify-center transition-opacity duration-300"
          />
        </div>

        {/* Loading overlay */}
        {isUpdating && (
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Decorative glow effect */}
        <div
          className="absolute inset-0 rounded-xl opacity-30 pointer-events-none transition-all duration-500"
          style={{
            background: 'radial-gradient(circle at center, rgba(157, 0, 255, 0.2) 0%, transparent 70%)',
            filter: 'blur(20px)',
            transform: 'scale(1.1)',
          }}
        />

        {/* Click to copy hint */}
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg border border-gray-700 whitespace-nowrap">
            {copied ? '✅ Copied!' : 'Click to copy'}
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45 border-b border-r border-gray-700"></div>
          </div>
        </div>

        {/* Copy feedback overlay */}
        {copied && (
          <div className="absolute inset-0 bg-green-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <div className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium shadow-lg">
              ✓ Copied to clipboard!
            </div>
          </div>
        )}
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-300">
          {settings.text.length > 0
            ? `Encoding ${settings.text.length} characters`
            : 'Enter text to generate QR code'
          }
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {settings.ecc} error correction • {settings.size}px
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Click QR code to copy to clipboard
        </p>
      </div>
    </div>
  )
}

export default QRPreview
