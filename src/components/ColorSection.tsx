import { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import type { QRSettings, DotType, CornerSquareType, CornerDotType } from '@/lib/qrcode'

interface ColorSectionProps {
  settings: QRSettings
  onSettingsChange: (updater: (current: QRSettings) => QRSettings) => void
}

const QUICK_COLORS = [
  { fg: '#000000', bg: '#FFFFFF', name: 'Classic' },
  { fg: '#FF1493', bg: '#FFFFFF', name: 'Pink' },
  { fg: '#9D00FF', bg: '#FFFFFF', name: 'Purple' },
  { fg: '#00FFFF', bg: '#000000', name: 'Cyan' },
  { fg: '#FFFFFF', bg: '#1a0a3e', name: 'Dark' },
  { fg: '#FF1493', bg: '#1a0a3e', name: 'Dark Pink' }
]

const LIGHT_THEMES = [
  {
    id: 'ocean',
    name: 'Ocean',
    icon: '🌊',
    settings: { foregroundColor: '#0ea5e9', backgroundColor: '#f0f9ff' }
  },
  {
    id: 'sunset',
    name: 'Sunset',
    icon: '🌅',
    settings: { foregroundColor: '#dc2626', backgroundColor: '#fef2f2' }
  },
  {
    id: 'forest',
    name: 'Forest',
    icon: '🌲',
    settings: { foregroundColor: '#059669', backgroundColor: '#f0fdf4' }
  },
  {
    id: 'royal',
    name: 'Royal',
    icon: '👑',
    settings: { foregroundColor: '#7c3aed', backgroundColor: '#faf5ff' }
  },
  {
    id: 'coral',
    name: 'Coral',
    icon: '🪸',
    settings: { foregroundColor: '#ea580c', backgroundColor: '#fff7ed' }
  },
  {
    id: 'emerald',
    name: 'Emerald',
    icon: '💚',
    settings: { foregroundColor: '#047857', backgroundColor: '#ecfdf5' }
  }
]

const DARK_THEMES = [
  {
    id: 'midnight',
    name: 'Midnight',
    icon: '🌙',
    settings: { foregroundColor: '#60a5fa', backgroundColor: '#1e293b' }
  },
  {
    id: 'cyberpunk',
    name: 'Cyber',
    icon: '🤖',
    settings: { foregroundColor: '#e11d48', backgroundColor: '#0f0f23' }
  },
  {
    id: 'matrix',
    name: 'Matrix',
    icon: '💻',
    settings: { foregroundColor: '#22c55e', backgroundColor: '#0a0a0a' }
  },
  {
    id: 'lavender',
    name: 'Lavender',
    icon: '🪻',
    settings: { foregroundColor: '#a78bfa', backgroundColor: '#2d1b69' }
  },
  {
    id: 'sunset-dark',
    name: 'Dusk',
    icon: '🌆',
    settings: { foregroundColor: '#fb923c', backgroundColor: '#431407' }
  },
  {
    id: 'ocean-dark',
    name: 'Deep',
    icon: '🌊',
    settings: { foregroundColor: '#06b6d4', backgroundColor: '#083344' }
  }
]

const DOT_TYPES: { value: DotType; label: string; icon: string }[] = [
  { value: 'dots', label: 'Dots', icon: '•' },
  { value: 'rounded', label: 'Rounded', icon: '●' },
  { value: 'square', label: 'Square', icon: '■' },
  { value: 'extra-rounded', label: 'Extra Round', icon: '◉' },
  { value: 'classy', label: 'Classy', icon: '✦' },
  { value: 'classy-rounded', label: 'Classy Round', icon: '◆' }
]

const CORNER_SQUARE_TYPES: { value: CornerSquareType; label: string; icon: string }[] = [
  { value: 'dot', label: 'Dot', icon: '•' },
  { value: 'square', label: 'Square', icon: '■' },
  { value: 'extra-rounded', label: 'Extra Round', icon: '◻' },
  { value: 'rounded', label: 'Rounded', icon: '▢' },
  { value: 'classy', label: 'Classy', icon: '✦' },
  { value: 'classy-rounded', label: 'Classy Round', icon: '●' }
]

const CORNER_DOT_TYPES: { value: CornerDotType; label: string; icon: string }[] = [
  { value: 'dot', label: 'Dot', icon: '•' },
  { value: 'square', label: 'Square', icon: '■' },
  { value: 'extra-rounded', label: 'Extra Round', icon: '◉' }
]

const ColorSection = ({ settings, onSettingsChange }: ColorSectionProps) => {
  const { theme } = useTheme()
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [pickerType, setPickerType] = useState<'foreground' | 'background'>('foreground')
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark')

  const handleQuickColorSelect = (color: typeof QUICK_COLORS[0]) => {
    onSettingsChange((current) => ({
      ...current,
      foregroundColor: color.fg,
      backgroundColor: color.bg
    }))
  }

  const handleThemeSelect = (theme: typeof LIGHT_THEMES[0] | typeof DARK_THEMES[0]) => {
    onSettingsChange((current) => ({
      ...current,
      ...theme.settings,
      // Preserve user's shape settings when applying themes
      dotsType: current.dotsType,
      cornersSquareType: current.cornersSquareType,
      cornersDotType: current.cornersDotType
    }))
  }

  const openColorPicker = (type: 'foreground' | 'background') => {
    setPickerType(type)
    setShowColorPicker(true)
  }

  const handleColorChange = (color: string) => {
    onSettingsChange((current) => ({
      ...current,
      [pickerType === 'foreground' ? 'foregroundColor' : 'backgroundColor']: color
    }))
  }

  const handleShapeChange = (shapeType: 'dotsType' | 'cornersSquareType' | 'cornersDotType', value: any) => {
    onSettingsChange((current) => ({
      ...current,
      [shapeType]: value
    }))
  }

  const getCurrentThemes = () => themeMode === 'light' ? LIGHT_THEMES : DARK_THEMES

  return (
    <div className="surface p-5 space-y-4">
      {/* Current Colors with Click to Pick */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => openColorPicker('foreground')}
          className={`flex items-center gap-3 p-3 ${theme === 'dark' ? 'bg-white/5 border-white/20 hover:bg-white/10' : 'bg-white/90 border-gray-300/50 hover:bg-gray-100/90'} rounded-lg border transition-all`}
        >
          <div
            className="w-12 h-12 rounded-lg border-2 border-gray-400/50"
            style={{ backgroundColor: settings.foregroundColor }}
          />
          <div className="text-left">
            <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Foreground</div>
            <div className={`text-xs ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'} font-mono`}>{settings.foregroundColor}</div>
          </div>
        </button>

        <button
          onClick={() => openColorPicker('background')}
          className={`flex items-center gap-3 p-3 ${theme === 'dark' ? 'bg-white/5 border-white/20 hover:bg-white/10' : 'bg-white/90 border-gray-300/50 hover:bg-gray-100/90'} rounded-lg border transition-all`}
        >
          <div
            className="w-12 h-12 rounded-lg border-2 border-gray-400/50"
            style={{ backgroundColor: settings.backgroundColor }}
          />
          <div className="text-left">
            <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Background</div>
            <div className={`text-xs ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'} font-mono`}>{settings.backgroundColor}</div>
          </div>
        </button>
      </div>

      {/* Quick Color Combinations */}
      <div>
        <h4 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-white'}`}>Quick Combinations</h4>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {QUICK_COLORS.map((color) => (
            <button
              key={color.name}
              onClick={() => handleQuickColorSelect(color)}
              className={`p-2 rounded-lg border-2 transition-all hover:scale-105 ${
                settings.foregroundColor === color.fg && settings.backgroundColor === color.bg
                  ? 'border-cyan-400 bg-cyan-400/20'
                  : 'border-white/20 hover:border-white/40'
              }`}
              title={color.name}
            >
              <div
                className="w-8 h-8 rounded mx-auto mb-1 border border-white/30"
                style={{
                  background: `linear-gradient(45deg, ${color.fg} 50%, ${color.bg} 50%)`
                }}
              />
              <div className={`text-xs ${theme === 'dark' ? 'text-white/80' : 'text-white'}`}>{color.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Style Themes with Dark/Light Toggle */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-white'}`}>Style Themes</h4>
          <div className="flex items-center gap-2">
            <span className={`text-xs ${theme === 'dark' ? 'text-white/60' : 'text-white/70'}`}>Light</span>
            <button
              onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
              className={`relative w-12 h-6 ${theme === 'dark' ? 'bg-white/20 border-white/30' : 'bg-white/30 border-gray-400/30'} rounded-full border transition-all`}
            >
              <div
                className={`absolute top-1 w-4 h-4 ${theme === 'dark' ? 'bg-white' : 'bg-gray-800'} rounded-full transition-all ${
                  themeMode === 'light' ? 'left-1' : 'left-7'
                }`}
              />
            </button>
            <span className={`text-xs ${theme === 'dark' ? 'text-white/60' : 'text-white/70'}`}>Dark</span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {getCurrentThemes().map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleThemeSelect(theme)}
              className={`p-3 rounded-lg border-2 transition-all hover:scale-105 text-center ${
                settings.foregroundColor === theme.settings.foregroundColor &&
                settings.backgroundColor === theme.settings.backgroundColor
                  ? 'border-cyan-400 bg-cyan-400/20'
                  : 'border-white/20 hover:border-white/40'
              }`}
            >
              <div className="text-2xl mb-1">{theme.icon}</div>
              <div className="text-xs font-medium text-white">{theme.name}</div>
              <div className="flex justify-center gap-1 mt-1">
                <div
                  className="w-3 h-3 rounded border border-white/30"
                  style={{ backgroundColor: theme.settings.foregroundColor }}
                />
                <div
                  className="w-3 h-3 rounded border border-white/30"
                  style={{ backgroundColor: theme.settings.backgroundColor }}
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Shape Controls */}
      <div>
        <h4 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-white'}`}>QR Shape Styles</h4>

        {/* Dots/Body Shape */}
        <div className="mb-3">
          <label className={`text-xs mb-1 block ${theme === 'dark' ? 'text-white/70' : 'text-white/80'}`}>Body Shape (Dots)</label>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {DOT_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => handleShapeChange('dotsType', type.value)}
                className={`p-2 rounded-lg border-2 transition-all hover:scale-105 text-center ${
                  settings.dotsType === type.value
                    ? 'border-cyan-400 bg-cyan-400/20'
                    : 'border-white/20 hover:border-white/40'
                }`}
                title={type.label}
              >
                <div className="text-lg">{type.icon}</div>
                <div className={`text-xs ${theme === 'dark' ? 'text-white/80' : 'text-white'}`}>{type.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Corner Square Shape */}
        <div className="mb-3">
          <label className={`text-xs mb-1 block ${theme === 'dark' ? 'text-white/70' : 'text-white/80'}`}>Corner Frame Shape</label>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {CORNER_SQUARE_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => handleShapeChange('cornersSquareType', type.value)}
                className={`p-2 rounded-lg border-2 transition-all hover:scale-105 text-center ${
                  settings.cornersSquareType === type.value
                    ? 'border-cyan-400 bg-cyan-400/20'
                    : 'border-white/20 hover:border-white/40'
                }`}
                title={type.label}
              >
                <div className="text-lg">{type.icon}</div>
                <div className={`text-xs ${theme === 'dark' ? 'text-white/80' : 'text-white'}`}>{type.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Corner Dot Shape */}
        <div>
          <label className={`text-xs mb-1 block ${theme === 'dark' ? 'text-white/70' : 'text-white/80'}`}>Corner Dot Shape</label>
          <div className="grid grid-cols-3 gap-2">
            {CORNER_DOT_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => handleShapeChange('cornersDotType', type.value)}
                className={`p-2 rounded-lg border-2 transition-all hover:scale-105 text-center ${
                  settings.cornersDotType === type.value
                    ? 'border-cyan-400 bg-cyan-400/20'
                    : 'border-white/20 hover:border-white/40'
                }`}
                title={type.label}
              >
                <div className="text-lg">{type.icon}</div>
                <div className={`text-xs ${theme === 'dark' ? 'text-white/80' : 'text-white'}`}>{type.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Color Picker Modal */}
      {showColorPicker && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 border border-white/20 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Choose {pickerType === 'foreground' ? 'Foreground' : 'Background'} Color
              </h3>
              <button
                onClick={() => setShowColorPicker(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Main color picker */}
              <div>
                <label className="block text-sm text-white/70 mb-2">Select Color</label>
                <input
                  type="color"
                  value={pickerType === 'foreground' ? settings.foregroundColor : settings.backgroundColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-full h-24 bg-transparent border-2 border-white/20 rounded-lg cursor-pointer"
                />
              </div>

              {/* Hex input */}
              <div>
                <label className="block text-sm text-white/70 mb-2">Hex Code</label>
                <input
                  type="text"
                  value={pickerType === 'foreground' ? settings.foregroundColor : settings.backgroundColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  placeholder="#000000"
                />
              </div>

              {/* Preset swatches */}
              <div>
                <label className="block text-sm text-white/70 mb-2">Quick Presets</label>
                <div className="grid grid-cols-8 gap-2">
                  {[
                    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
                    '#800000', '#008000', '#000080', '#808000', '#800080', '#008080', '#C0C0C0', '#808080',
                    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
                    '#BB8FCE', '#85C1E2', '#F8B739', '#52D681', '#FF6B9D', '#C44569', '#524656', '#2E86AB'
                  ].map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorChange(color)}
                      className="w-8 h-8 rounded border-2 border-white/30 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ColorSection