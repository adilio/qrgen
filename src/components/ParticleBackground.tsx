import { useEffect, useRef } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

interface Particle {
  element: HTMLDivElement
  timeoutId: ReturnType<typeof setTimeout>
}

const ParticleBackground = () => {
  const { theme } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const particlesRef = useRef<Particle[]>([])

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const colors = ['pink', 'magenta', 'purple', 'blue', 'cyan', 'deep-purple']
    const particleCount = 200

    function createParticle(): Particle {
      const particle = document.createElement('div')
      const colorClass = colors[Math.floor(Math.random() * colors.length)]

      particle.className = `particle ${colorClass}`

      // Random size (4-10px - bigger and more visible)
      const size = Math.random() * 6 + 4
      particle.style.width = `${size}px`
      particle.style.height = `${size}px`

      // Random starting position
      particle.style.left = `${Math.random() * 100}%`
      particle.style.top = `${Math.random() * -100}vh`

      // Random animation duration (much slower particles)
      const duration = Math.random() * 20 + 25 // 25-45 seconds instead of 10-25
      particle.style.animationDuration = `${duration}s`

      // Random delay
      particle.style.animationDelay = `${Math.random() * -20}s`

      // Random horizontal drift
      const drift = (Math.random() - 0.5) * 100
      particle.style.setProperty('--drift', `${drift}px`)

      container.appendChild(particle)

      // Remove and recreate particle after animation completes
      const timeoutId = setTimeout(() => {
        particle.remove()
        const newParticle = createParticle()
        particlesRef.current.push(newParticle)
      }, (duration + 20) * 1000)

      return { element: particle, timeoutId }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      const particle = createParticle()
      particlesRef.current.push(particle)
    }

    // Add new particles periodically for density
    const intervalId = setInterval(() => {
      if (container.children.length < particleCount * 2) {
        const particle = createParticle()
        particlesRef.current.push(particle)
      }
    }, 200)

    // Cleanup function
    return () => {
      clearInterval(intervalId)
      particlesRef.current.forEach(particle => {
        clearTimeout(particle.timeoutId)
        particle.element.remove()
      })
      particlesRef.current = []
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full overflow-hidden"
      style={{ zIndex: 1 }}
    >
      {/* Theme-aware overlay for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: theme === 'dark' ? 'rgba(10, 5, 32, 0.6)' : 'rgba(0, 0, 0, 0.15)',
          zIndex: 2
        }}
      />
    </div>
  )
}

export default ParticleBackground