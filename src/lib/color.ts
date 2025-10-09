export const hexToRgb = (hex: string) => {
  const normalized = hex.replace('#', '')
  const value =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => char + char)
          .join('')
      : normalized

  const int = parseInt(value, 16)
  if (Number.isNaN(int)) {
    return { r: 0, g: 0, b: 0 }
  }

  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  }
}

const luminanceChannel = (channel: number) => {
  const c = channel / 255
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

export const relativeLuminance = (hex: string) => {
  const { r, g, b } = hexToRgb(hex)
  const rLum = luminanceChannel(r)
  const gLum = luminanceChannel(g)
  const bLum = luminanceChannel(b)
  return 0.2126 * rLum + 0.7152 * gLum + 0.0722 * bLum
}

export const contrastRatio = (foreground: string, background: string) => {
  const fgLum = relativeLuminance(foreground) + 0.05
  const bgLum = relativeLuminance(background) + 0.05
  return fgLum > bgLum ? fgLum / bgLum : bgLum / fgLum
}

export const describeContrast = (foreground: string, background: string) => {
  const ratio = contrastRatio(foreground, background)
  if (ratio >= 4.5) return { ratio, label: 'Excellent contrast' }
  if (ratio >= 3) return { ratio, label: 'Good contrast' }
  return { ratio, label: 'Low contrast – consider adjusting colors' }
}
