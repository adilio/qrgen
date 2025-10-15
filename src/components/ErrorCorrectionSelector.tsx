import type { ErrorCorrectionLevel } from '@/lib/qrcode'

interface ErrorCorrectionSelectorProps {
  currentLevel: ErrorCorrectionLevel
  onLevelChange: (level: ErrorCorrectionLevel) => void
}

const ERROR_CORRECTION_LEVELS: {
  level: ErrorCorrectionLevel
  name: string
  description: string
  capacity: string
  color: string
}[] = [
  {
    level: 'L',
    name: 'Low',
    description: '7% error correction',
    capacity: 'Up to 30% damage',
    color: 'from-green-500 to-emerald-500'
  },
  {
    level: 'M',
    name: 'Medium',
    description: '15% error correction',
    capacity: 'Up to 15% damage',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    level: 'Q',
    name: 'Quartile',
    description: '25% error correction',
    capacity: 'Up to 25% damage',
    color: 'from-purple-500 to-pink-500'
  },
  {
    level: 'H',
    name: 'High',
    description: '30% error correction',
    capacity: 'Up to 30% damage',
    color: 'from-red-500 to-orange-500'
  }
]

const ErrorCorrectionSelector = ({ currentLevel, onLevelChange }: ErrorCorrectionSelectorProps) => {
  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">Error Correction</h3>
        <p className="text-sm text-gray-300">
          Choose how much error correction your QR code needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ERROR_CORRECTION_LEVELS.map((option) => (
          <button
            key={option.level}
            onClick={() => onLevelChange(option.level)}
            className={`
              relative p-4 rounded-xl border-2 transition-all duration-200
              hover:scale-105 focus:outline-none focus:ring-2
              focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-900
              ${currentLevel === option.level
                ? 'border-cyan-400 shadow-lg shadow-cyan-400/20'
                : 'border-white/20 hover:border-white/40'
              }
            `}
          >
            {/* Selection Indicator */}
            {currentLevel === option.level && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}

            <div className="flex items-center gap-3">
              {/* Visual Indicator */}
              <div className={`
                w-12 h-12 rounded-lg bg-gradient-to-br
                ${option.color}
              `}>
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                  {option.level}
                </div>
              </div>

              {/* Content */}
              <div className="text-left">
                <h4 className="text-sm font-semibold text-white mb-1">
                  {option.name}
                </h4>
                <p className="text-xs text-gray-400 mb-1">
                  {option.description}
                </p>
                <p className="text-xs text-gray-500">
                  {option.capacity}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3 w-full bg-white/10 rounded-full h-2">
              <div
                className={`
                  h-2 rounded-full bg-gradient-to-r
                  ${option.color}
                  transition-all duration-300
                `}
                style={{
                  width: currentLevel === option.level ? '100%' : '0%'
                }}
              />
            </div>
          </button>
        ))}
      </div>

      {/* Info Section */}
      <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-cyan-400/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-white mb-1">
              Current: <span className="text-cyan-400">
                {ERROR_CORRECTION_LEVELS.find(l => l.level === currentLevel)?.name}
              </span>
            </p>
            <p className="text-xs text-gray-400">
              Higher error correction levels create more complex QR codes but can survive more damage.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ErrorCorrectionSelector