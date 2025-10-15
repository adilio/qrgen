import { useState, useEffect } from 'react'

interface ColorHistoryProps {
  currentForeground: string
  currentBackground: string
  onColorSelect: (foreground: string, background: string) => void
}

interface ColorPair {
  foreground: string
  background: string
  timestamp: number
}

const ColorHistory = ({ currentForeground, currentBackground, onColorSelect }: ColorHistoryProps) => {
  const [history, setHistory] = useState<ColorPair[]>([])

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('qr-color-history')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setHistory(Array.isArray(parsed) ? parsed : [])
      } catch (e) {
        console.error('Failed to load color history:', e)
      }
    }
  }, [])

  // Save to localStorage whenever history changes
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('qr-color-history', JSON.stringify(history))
    }
  }, [history])

  // Add current colors to history
  const saveCurrentColors = () => {
    const newPair: ColorPair = {
      foreground: currentForeground,
      background: currentBackground,
      timestamp: Date.now()
    }

    setHistory(prev => {
      // Remove duplicates
      const filtered = prev.filter(
        pair => pair.foreground !== currentForeground || pair.background !== currentBackground
      )
      // Add to beginning and keep only last 8
      return [newPair, ...filtered].slice(0, 8)
    })
  }

  const handleColorSelect = (pair: ColorPair) => {
    onColorSelect(pair.foreground, pair.background)
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem('qr-color-history')
  }

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    return `${Math.floor(seconds / 3600)}h ago`
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Recent Colors</h3>
          <p className="text-xs text-gray-400">
            {history.length} saved pairs • Click to use
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={saveCurrentColors}
            className="px-3 py-1 text-xs bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 rounded-lg hover:bg-cyan-500/30 transition-colors"
          >
            Save Current
          </button>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="px-3 py-1 text-xs bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <p className="text-sm text-gray-400">
            Save your favorite color combinations
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {history.map((pair) => (
            <button
              key={`${pair.foreground}-${pair.background}-${pair.timestamp}`}
              onClick={() => handleColorSelect(pair)}
              className="w-full group p-3 rounded-lg border border-white/20 hover:border-white/40 hover:bg-white/10 transition-all duration-200 text-left"
            >
              <div className="flex items-center gap-3">
                {/* Color previews */}
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded border-2 border-white/30"
                    style={{ backgroundColor: pair.foreground }}
                  />
                  <div className="text-white/50 text-xs">+</div>
                  <div
                    className="w-8 h-8 rounded border-2 border-white/30"
                    style={{ backgroundColor: pair.background }}
                  />
                </div>

                {/* Color codes */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <code className="text-xs text-gray-300 bg-white/10 px-2 py-1 rounded">
                      {pair.foreground.toUpperCase()}
                    </code>
                    <code className="text-xs text-gray-300 bg-white/10 px-2 py-1 rounded">
                      {pair.background.toUpperCase()}
                    </code>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTimeAgo(pair.timestamp)}
                  </p>
                </div>

                {/* Selection indicator */}
                {pair.foreground === currentForeground && pair.background === currentBackground && (
                  <div className="w-4 h-4 bg-green-400 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ColorHistory