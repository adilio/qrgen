import { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

interface CollapsibleSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

const CollapsibleSection = ({ title, children, defaultOpen = false }: CollapsibleSectionProps) => {
  const { theme } = useTheme()
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="surface overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-6 py-4 flex items-center justify-between text-left transition-colors ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-800/20'}`}
      >
        <h3 className="section-title">{title}</h3>
        <svg
          className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${theme === 'dark' ? 'text-white/70' : 'text-white/80'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className={`px-6 pb-6 border-t ${theme === 'dark' ? 'border-white/10' : 'border-gray-700/30'}`}>
          {children}
        </div>
      )}
    </div>
  )
}

export default CollapsibleSection