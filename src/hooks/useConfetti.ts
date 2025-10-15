import confetti from 'canvas-confetti'

interface ConfettiOptions {
  particleCount?: number
  spread?: number
  startVelocity?: number
  colors?: string[]
  origin?: {
    x: number
    y: number
  }
}

export const useConfetti = () => {
  const triggerConfetti = (options: ConfettiOptions = {}) => {
    const defaults: ConfettiOptions = {
      particleCount: 100,
      spread: 70,
      startVelocity: 30,
      colors: ['#ff1493', '#9d00ff', '#00d4ff', '#4F7CFF', '#ff00ff', '#00ff00'],
      origin: { x: 0.5, y: 0.5 }
    }

    confetti({
      ...defaults,
      ...options
    })
  }

  const triggerSuccess = () => {
    // Multiple bursts for better effect
    triggerConfetti({
      particleCount: 50,
      spread: 60,
      origin: { x: 0.3, y: 0.6 }
    })

    setTimeout(() => {
      triggerConfetti({
        particleCount: 50,
        spread: 60,
        origin: { x: 0.7, y: 0.6 }
      })
    }, 100)

    setTimeout(() => {
      triggerConfetti({
        particleCount: 80,
        spread: 80,
        origin: { x: 0.5, y: 0.4 }
      })
    }, 200)
  }

  const triggerDownload = () => {
    triggerConfetti({
      particleCount: 120,
      spread: 100,
      startVelocity: 40,
      origin: { x: 0.5, y: 0.3 },
      colors: ['#00d4ff', '#4F7CFF', '#9d00ff', '#ff1493']
    })
  }

  const triggerShare = () => {
    triggerConfetti({
      particleCount: 80,
      spread: 90,
      startVelocity: 35,
      origin: { x: 0.5, y: 0.7 },
      colors: ['#ff1493', '#ff00ff', '#9d00ff']
    })
  }

  const triggerThemeChange = () => {
    triggerConfetti({
      particleCount: 30,
      spread: 40,
      startVelocity: 20,
      origin: { x: 0.5, y: 0.5 }
    })
  }

  return {
    triggerConfetti,
    triggerSuccess,
    triggerDownload,
    triggerShare,
    triggerThemeChange
  }
}

export default useConfetti