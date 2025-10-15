import { useState, useRef } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import type { LogoConfig } from '@/lib/qrcode'

interface LogoUploadProps {
  logoConfig: LogoConfig
  onLogoChange: (config: LogoConfig) => void
}

const LogoUpload = ({ logoConfig, onLogoChange }: LogoUploadProps) => {
  const { theme } = useTheme()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const emojiInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileSelect = (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('Image size must be less than 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      onLogoChange({
        ...logoConfig,
        mode: 'upload',
        originalDataUrl: dataUrl,
        processedDataUrl: dataUrl, // For simplicity, using same image
        scale: 0.25,
        cornerRadius: 12
      })
    }
    reader.readAsDataURL(file)
  }

  const handleEmojiInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const emoji = e.target.value
    if (!emoji) return

    // Convert emoji to a data URL (text-based approach)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const size = 100

    canvas.width = size
    canvas.height = size

    if (!ctx) return

    // Set up text rendering
    ctx.fillStyle = '#000000'
    ctx.font = `${size * 0.6}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Draw emoji
    ctx.fillText(emoji, size / 2, size / 2)

    // Convert to data URL
    const dataUrl = canvas.toDataURL('image/png')

    onLogoChange({
      ...logoConfig,
      mode: 'upload',
      originalDataUrl: dataUrl,
      processedDataUrl: dataUrl,
      scale: 0.3,
      cornerRadius: 8 // More rounded for emoji
    })

    // Clear the input
    e.target.value = ''
  }

  const handleEmojiButtonClick = () => {
    // Create a hidden contenteditable div that will trigger the OS emoji picker
    const emojiPicker = document.createElement('div')
    emojiPicker.contentEditable = 'true'
    emojiPicker.style.cssText = `
      position: fixed;
      top: -9999px;
      left: -9999px;
      opacity: 0;
      pointer-events: none;
    `

    document.body.appendChild(emojiPicker)

    // Focus and trigger emoji picker
    emojiPicker.focus()

    // Always show user instructions for best UX
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
    const isWindows = navigator.platform.toUpperCase().indexOf('WIN') >= 0
    const isLinux = navigator.platform.toUpperCase().indexOf('LINUX') >= 0

    let instructions = ''
    if (isMac) {
      instructions = 'Press Control+Command+Space to open the emoji picker'
    } else if (isWindows) {
      instructions = 'Press Windows Key + . (period) to open the emoji picker'
    } else if (isLinux) {
      instructions = 'Press Ctrl+Shift+U or Ctrl+. to open the emoji picker'
    } else {
      instructions = 'Use your system emoji picker or keyboard shortcut'
    }

    // Create a temporary instruction overlay
    const instructionOverlay = document.createElement('div')
    instructionOverlay.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(31, 41, 55, 0.95);
      color: white;
      padding: 20px;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      z-index: 10000;
      backdrop-filter: blur(10px);
      text-align: center;
      max-width: 300px;
      font-size: 14px;
    `
    instructionOverlay.innerHTML = `
      <div style="margin-bottom: 10px; font-size: 16px; font-weight: 600;">📝 Emoji Picker</div>
      <div style="margin-bottom: 10px;">${instructions}</div>
      <div style="font-size: 12px; opacity: 0.8;">Start typing an emoji in the focused field below</div>
      <div style="margin-top: 10px; padding: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; font-family: monospace;">
        Click here and type emoji
      </div>
      <button style="margin-top: 15px; padding: 8px 16px; background: rgba(255,255,255,0.2); border: none; border-radius: 6px; color: white; cursor: pointer;" onclick="this.parentElement.remove()">
        Got it!
      </button>
    `

    document.body.appendChild(instructionOverlay)

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (document.body.contains(instructionOverlay)) {
        document.body.removeChild(instructionOverlay)
      }
    }, 5000)

    // Listen for input
    const handleInput = (e: Event) => {
      const text = (e.target as HTMLElement).textContent || ''
      const emoji = text.trim()

      if (emoji && emoji.length > 0 && /[^\p{L}\p{N}\s]/u.test(emoji)) {
        // This is likely an emoji, process it
        handleEmojiSelect(emoji)

        // Clean up
        document.body.removeChild(emojiPicker)
        const overlay = document.querySelector('[style*="position: fixed"][style*="top: 50%"]') as HTMLElement
        if (overlay && overlay.textContent?.includes('Emoji Picker')) {
          document.body.removeChild(overlay)
        }
      }
    }

    emojiPicker.addEventListener('input', handleInput)

    // Listen for paste events
    emojiPicker.addEventListener('paste', (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData('text') || ''
      if (text.length > 0) {
        setTimeout(() => {
          const content = emojiPicker.textContent || ''
          if (content && /[^\p{L}\p{N}\s]/u.test(content)) {
            handleEmojiSelect(content.trim())
            document.body.removeChild(emojiPicker)
          }
        }, 100)
      }
    })

    // Clean up on blur
    emojiPicker.addEventListener('blur', () => {
      setTimeout(() => {
        if (document.body.contains(emojiPicker)) {
          document.body.removeChild(emojiPicker)
        }
      }, 200)
    })
  }

  const handleEmojiSelect = (emoji: string) => {
    // Convert emoji to a data URL (text-based approach)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const size = 100

    canvas.width = size
    canvas.height = size

    if (!ctx) return

    // Set up text rendering
    ctx.fillStyle = '#000000'
    ctx.font = `${size * 0.6}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Draw emoji
    ctx.fillText(emoji, size / 2, size / 2)

    // Convert to data URL
    const dataUrl = canvas.toDataURL('image/png')

    onLogoChange({
      ...logoConfig,
      mode: 'upload',
      originalDataUrl: dataUrl,
      processedDataUrl: dataUrl,
      scale: 0.3,
      cornerRadius: 8 // More rounded for emoji
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    handleFileSelect(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleRemoveLogo = () => {
    onLogoChange({
      mode: 'none',
      originalDataUrl: undefined,
      processedDataUrl: undefined,
      scale: 0.25,
      cornerRadius: 12
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    if (emojiInputRef.current) {
      emojiInputRef.current.value = ''
    }
  }

  const handleScaleChange = (scale: number) => {
    onLogoChange({
      ...logoConfig,
      scale: Math.max(0.05, Math.min(0.7, scale)) // Clamp between 5% and 70%
    })
  }

  const handleCornerRadiusChange = (cornerRadius: number) => {
    onLogoChange({
      ...logoConfig,
      cornerRadius: Math.max(0, Math.min(40, cornerRadius)) // Clamp between 0 and 40
    })
  }

  return (
    <div className={`${theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-gray-100/80 border-gray-300/50'} backdrop-blur-sm border rounded-xl p-6`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Logo</h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Add a logo or emoji to your QR code
          </p>
        </div>
        {logoConfig.mode === 'upload' && (
          <button
            onClick={handleRemoveLogo}
            className="px-3 py-1 text-sm bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            Remove
          </button>
        )}
      </div>

      {logoConfig.mode === 'none' ? (
        <div className="space-y-4">
          <div
            className={`
              relative border-2 border-dashed rounded-xl p-8 text-center
              transition-all duration-200 cursor-pointer
              ${isDragging
                ? 'border-cyan-400 bg-cyan-400/10'
                : 'border-white/30 hover:border-white/50 hover:bg-white/5'
              }
            `}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              className="hidden"
            />

            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium mb-1">Upload Logo</p>
                <p className="text-sm text-gray-400">
                  Drag & drop or click to browse
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, GIF up to 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Emoji Picker Button */}
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-3">Or choose an emoji:</p>
            <input
              ref={emojiInputRef}
              type="text"
              onChange={handleEmojiInput}
              className="hidden"
              placeholder="🙂"
            />
            <button
              onClick={handleEmojiButtonClick}
              className="px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300 rounded-lg hover:from-purple-500/30 hover:to-pink-500/30 transition-all"
            >
              <span className="text-2xl mr-2">😊</span>
              Choose Emoji
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Logo Preview */}
          <div className="flex items-center justify-center">
            <div className={`w-32 h-32 ${theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-gray-800/90 border-gray-600/50'} rounded-xl p-4 border`}>
              <img
                src={logoConfig.originalDataUrl}
                alt="Logo preview"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Logo Controls */}
          <div className="space-y-4">
            {/* Scale Control */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Size: {Math.round(logoConfig.scale * 100)}%
                <span className="text-xs text-cyan-400 ml-2">
                  {logoConfig.scale > 0.4 ? '🔴 Large Logo - Higher ECC Recommended' :
                   logoConfig.scale > 0.25 ? '🟡 Medium Logo' : '🟢 Small Logo'}
                </span>
              </label>
              <input
                type="range"
                min="5"
                max="70"
                value={Math.round(logoConfig.scale * 100)}
                onChange={(e) => handleScaleChange(Number(e.target.value) / 100)}
                className="w-full accent-cyan-400"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>5%</span>
                <span>25%</span>
                <span>50%</span>
                <span>70%</span>
              </div>
              {logoConfig.scale > 0.4 && (
                <div className="mt-2 p-2 bg-amber-500/20 border border-amber-500/30 rounded-lg">
                  <p className="text-xs text-amber-300">
                    ⚠️ Large logos may reduce QR scanability. Use 'High' error correction for best results.
                  </p>
                </div>
              )}
            </div>

            {/* Corner Radius Control */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Corner Radius: {logoConfig.cornerRadius}%
              </label>
              <input
                type="range"
                min="0"
                max="40"
                value={logoConfig.cornerRadius}
                onChange={(e) => handleCornerRadiusChange(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LogoUpload