import { useState } from 'react'
import type { QRSettings, DotType, CornerSquareType, CornerDotType } from '@/lib/qrcode'

interface QRTheme {
  id: string
  name: string
  description: string
  settings: Partial<QRSettings> & {
    dotsType?: DotType
    cornersSquareType?: CornerSquareType
    cornersDotType?: CornerDotType
  }
  gradient: string
  icon: string
}

interface StyleGalleryProps {
  currentSettings: QRSettings
  onThemeSelect: (theme: QRTheme) => void
}

const QR_THEMES: QRTheme[] = [
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Deep blue with elegant accents',
    settings: {
      foregroundColor: '#1e3a8a',
      backgroundColor: '#ffffff',
      dotsType: 'rounded',
      cornersSquareType: 'extra-rounded',
      cornersDotType: 'dot'
    },
    gradient: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
    icon: '🌙'
  },
  {
    id: 'sunset',
    name: 'Sunset',
    description: 'Warm oranges and corals',
    settings: {
      foregroundColor: '#ea580c',
      backgroundColor: '#ffffff',
      dotsType: 'dots',
      cornersSquareType: 'square',
      cornersDotType: 'dot'
    },
    gradient: 'linear-gradient(135deg, #ea580c, #fb923c)',
    icon: '🌅'
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Natural greens and earth tones',
    settings: {
      foregroundColor: '#15803d',
      backgroundColor: '#ffffff',
      dotsType: 'rounded',
      cornersSquareType: 'dot',
      cornersDotType: 'square'
    },
    gradient: 'linear-gradient(135deg, #15803d, #22c55e)',
    icon: '🌲'
  },
  {
    id: 'royal',
    name: 'Royal',
    description: 'Rich purples and golds',
    settings: {
      foregroundColor: '#7c3aed',
      backgroundColor: '#ffffff',
      dotsType: 'square',
      cornersSquareType: 'extra-rounded',
      cornersDotType: 'dot'
    },
    gradient: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
    icon: '👑'
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Deep blues and turquoises',
    settings: {
      foregroundColor: '#0891b2',
      backgroundColor: '#ffffff',
      dotsType: 'dots',
      cornersSquareType: 'dot',
      cornersDotType: 'dot'
    },
    gradient: 'linear-gradient(135deg, #0891b2, #06b6d4)',
    icon: '🌊'
  },
  {
    id: 'cherry',
    name: 'Cherry Blossom',
    description: 'Soft pinks and whites',
    settings: {
      foregroundColor: '#db2777',
      backgroundColor: '#ffffff',
      dotsType: 'rounded',
      cornersSquareType: 'extra-rounded',
      cornersDotType: 'square'
    },
    gradient: 'linear-gradient(135deg, #db2777, #f472b6)',
    icon: '🌸'
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    description: 'Classic black and white',
    settings: {
      foregroundColor: '#000000',
      backgroundColor: '#ffffff',
      dotsType: 'square',
      cornersSquareType: 'square',
      cornersDotType: 'square'
    },
    gradient: 'linear-gradient(135deg, #000000, #6b7280)',
    icon: '⚫'
  },
  {
    id: 'cyber',
    name: 'Cyber',
    description: 'Neon cyan and dark purple',
    settings: {
      foregroundColor: '#00d4ff',
      backgroundColor: '#1a0a3e',
      dotsType: 'dots',
      cornersSquareType: 'square',
      cornersDotType: 'dot'
    },
    gradient: 'linear-gradient(135deg, #00d4ff, #9d00ff)',
    icon: '🤖'
  }
]

const StyleGallery = ({ currentSettings: _currentSettings, onThemeSelect }: StyleGalleryProps) => {
  const [selectedTheme, setSelectedTheme] = useState<string>('midnight')

  const handleThemeClick = (theme: QRTheme) => {
    setSelectedTheme(theme.id)
    onThemeSelect(theme)
  }

  const getCurrentTheme = () => QR_THEMES.find(theme => theme.id === selectedTheme)

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">QR Theme</h3>
          <p className="text-sm text-gray-300">
            Choose a theme that matches your style
          </p>
        </div>
        <div className="text-2xl">
          {getCurrentTheme()?.icon}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {QR_THEMES.map((theme) => (
          <button
            key={theme.id}
            onClick={() => handleThemeClick(theme)}
            className={`
              relative group p-3 rounded-xl border-2 transition-all duration-300
              hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2
              focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-900
              ${selectedTheme === theme.id
                ? 'border-cyan-400 shadow-lg shadow-cyan-400/20'
                : 'border-white/20 hover:border-white/40'
              }
            `}
          >
            {/* Theme Icon and Name */}
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{
                  background: theme.gradient,
                  opacity: selectedTheme === theme.id ? 1 : 0.8
                }}
              />
              <span className="text-lg">{theme.icon}</span>
              <h4 className="text-sm font-semibold text-white text-left">
                {theme.name}
              </h4>
            </div>

            {/* Selected Indicator */}
            {selectedTheme === theme.id && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Current Theme Info */}
      <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-lg"
              style={{ background: getCurrentTheme()?.gradient }}
            />
            <div>
              <p className="text-sm font-medium text-white">
                Currently selected: <span className="text-cyan-400">
                  {getCurrentTheme()?.name}
                </span>
              </p>
              <p className="text-xs text-gray-400">
                {getCurrentTheme()?.description}
              </p>
            </div>
          </div>
          <div className="text-2xl">
            {getCurrentTheme()?.icon}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StyleGallery