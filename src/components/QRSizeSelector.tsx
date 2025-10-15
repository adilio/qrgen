interface QRSizeSelectorProps {
  currentSize: number
  onSizeChange: (size: number) => void
}

const SIZE_PRESETS = [
  { name: 'Small', size: 200, description: '200×200px' },
  { name: 'Medium', size: 300, description: '300×300px' },
  { name: 'Large', size: 400, description: '400×400px' },
  { name: 'Extra Large', size: 500, description: '500×500px' },
  { name: 'Poster', size: 800, description: '800×800px' }
]

const QRSizeSelector = ({ currentSize, onSizeChange }: QRSizeSelectorProps) => {
  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-1">QR Size</h3>
        <p className="text-xs text-gray-400">
          Choose the dimensions of your QR code
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {SIZE_PRESETS.map((preset) => (
          <button
            key={preset.size}
            onClick={() => onSizeChange(preset.size)}
            className={`
              relative p-3 rounded-lg border-2 transition-all duration-200
              hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2
              focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-900
              ${currentSize === preset.size
                ? 'border-cyan-400 bg-white/10 shadow-lg shadow-cyan-400/20'
                : 'border-white/20 hover:border-white/40 hover:bg-white/5'
              }
            `}
          >
            {/* Selection indicator */}
            {currentSize === preset.size && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-400 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}

            <div className="text-center">
              <div className="text-xs font-medium text-white mb-1">
                {preset.name}
              </div>
              <div className="text-xs text-gray-400">
                {preset.size}px
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Custom size input */}
      <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-300">Custom:</label>
          <input
            type="number"
            min="100"
            max="2000"
            value={currentSize}
            onChange={(e) => onSizeChange(Number(e.target.value))}
            className="flex-1 bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
          />
          <span className="text-sm text-gray-400">px</span>
        </div>
      </div>

      {/* Size info */}
      <div className="mt-3 text-xs text-gray-500 text-center">
        Larger QR codes can store more data but may be harder to scan from a distance
      </div>
    </div>
  )
}

export default QRSizeSelector