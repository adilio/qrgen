import { useState } from 'react'

interface QuickActionsProps {
  onCopyQR: () => void
  onDownloadQR: () => void
  onShareQR: () => void
  onResetQR: () => void
  currentText: string
}

const QuickActions = ({ onCopyQR, onDownloadQR, onShareQR, onResetQR, currentText }: QuickActionsProps) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <div className={`
        bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4
        transition-all duration-300 origin-bottom-right
        ${expanded ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}
      `}>
        <div className="flex flex-col gap-3">
          {/* Copy QR */}
          <button
            onClick={onCopyQR}
            disabled={!currentText}
            className={`
              group relative w-12 h-12 rounded-xl bg-white/20 border border-white/30
              flex items-center justify-center transition-all duration-200
              hover:bg-white/30 hover:scale-110 hover:border-white/50
              disabled:opacity-50 disabled:cursor-not-allowed
              ${currentText ? 'cursor-pointer' : ''}
            `}
            title="Copy QR Code"
          >
            <svg className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v-1m0 0a2 2 0 00-2 2h-2a2 2 0 00-2 2" />
            </svg>
          </button>

          {/* Download QR */}
          <button
            onClick={onDownloadQR}
            disabled={!currentText}
            className={`
              group relative w-12 h-12 rounded-xl bg-white/20 border border-white/30
              flex items-center justify-center transition-all duration-200
              hover:bg-white/30 hover:scale-110 hover:border-white/50
              disabled:opacity-50 disabled:cursor-not-allowed
              ${currentText ? 'cursor-pointer' : ''}
            `}
            title="Download QR Code"
          >
            <svg className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l4 4m-4-4h12" />
            </svg>
          </button>

          {/* Share QR */}
          <button
            onClick={onShareQR}
            disabled={!currentText}
            className={`
              group relative w-12 h-12 rounded-xl bg-white/20 border border-white/30
              flex items-center justify-center transition-all duration-200
              hover:bg-white/30 hover:scale-110 hover:border-white/50
              disabled:opacity-50 disabled:cursor-not-allowed
              ${currentText ? 'cursor-pointer' : ''}
            `}
            title="Share QR Code"
          >
            <svg className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 12c0-1.685-.474-3.23-1.29-4.572" />
            </svg>
          </button>

          {/* Reset */}
          <button
            onClick={onResetQR}
            className="
              group relative w-12 h-12 rounded-xl bg-white/20 border border-white/30
              flex items-center justify-center transition-all duration-200
              hover:bg-red-500/30 hover:scale-110 hover:border-red-500/50
              cursor-pointer
            "
            title="Reset QR Code"
          >
            <svg className="w-5 h-5 text-gray-300 group-hover:text-red-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="absolute -top-12 right-0 w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500
                   border-2 border-white/30 flex items-center justify-center
                   shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200
                   text-white"
        title="Quick Actions"
      >
        <svg
          className={`w-6 h-6 transition-transform duration-300 ${expanded ? 'rotate-45' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Floating label */}
      {!expanded && (
        <div className="absolute -top-16 right-0 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg border border-gray-700 whitespace-nowrap">
          Quick Actions
          <div className="absolute -bottom-1 right-4 w-2 h-2 bg-gray-900 rotate-45 border-b border-r border-gray-700"></div>
        </div>
      )}
    </div>
  )
}

export default QuickActions