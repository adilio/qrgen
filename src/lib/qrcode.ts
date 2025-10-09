import QRCodeStyling from 'qr-code-styling'
import type { CornerSquareType, CornerDotType } from 'qr-code-styling'

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H'

export type DotStyle = 'square' | 'dots' | 'rounded' | 'extra-rounded'

export type EyeStyle = 'square' | 'dot' | 'rounded'

export type GradientType = 'linear' | 'radial'

export interface GradientConfig {
  enabled: boolean
  type: GradientType
  rotation: number // degrees for UI, converted to radians for the renderer
  start: string
  end: string
}

export interface LogoConfig {
  mode: 'none' | 'upload' | 'external'
  rawDataUrl?: string
  processedDataUrl?: string
  externalUrl?: string
  crossOrigin: 'anonymous' | 'use-credentials' | 'none'
  scale: number // 0-1 ratio representing imageSize
  cornerRadius: number // percentage 0-50 (we clamp when rendering)
}

export interface QRSettings {
  text: string
  size: number
  margin: number
  ecc: ErrorCorrectionLevel
  dotStyle: DotStyle
  eyeStyle: EyeStyle
  foregroundColor: string
  backgroundColor: string
  gradient: GradientConfig
  transparentBackground: boolean
  presetKey: string | null
  logo: LogoConfig
  animateSheen: boolean
}

export type QRCodeInstance = QRCodeStyling

export const ECC_LEVELS: ErrorCorrectionLevel[] = ['L', 'M', 'Q', 'H']

export const DOT_STYLES: DotStyle[] = ['square', 'dots', 'rounded', 'extra-rounded']

export const EYE_STYLES: EyeStyle[] = ['square', 'dot', 'rounded']

export const defaultSettings: QRSettings = {
  text: 'https://example.com',
  size: 320,
  margin: 16,
  ecc: 'M',
  dotStyle: 'rounded',
  eyeStyle: 'rounded',
  foregroundColor: '#1f5bff',
  backgroundColor: '#ffffff',
  gradient: {
    enabled: true,
    type: 'linear',
    rotation: 35,
    start: '#7b5cff',
    end: '#00d8ff',
  },
  transparentBackground: false,
  presetKey: 'liquid-lavender',
  logo: {
    mode: 'none',
    rawDataUrl: undefined,
    processedDataUrl: undefined,
    externalUrl: '',
    crossOrigin: 'anonymous',
    scale: 0.22,
    cornerRadius: 18,
  },
  animateSheen: true,
}

export interface BuildOptionsInput {
  settings: QRSettings
  sizeOverride?: number
  transparentBackgroundOverride?: boolean
}

const gradientToRenderer = (gradient: GradientConfig) => ({
  type: gradient.type,
  rotation: (gradient.rotation * Math.PI) / 180,
  colorStops: [
    { offset: 0, color: gradient.start },
    { offset: 1, color: gradient.end },
  ],
})

const maybeGradient = (gradient: GradientConfig, fallbackColor: string) =>
  gradient.enabled ? { gradient: gradientToRenderer(gradient) } : { color: fallbackColor }

const resolveEyeSquareType = (eyeStyle: EyeStyle): CornerSquareType => {
  if (eyeStyle === 'rounded') return 'extra-rounded'
  if (eyeStyle === 'dot') return 'square'
  return 'square'
}

const resolveEyeDotType = (eyeStyle: EyeStyle): CornerDotType => {
  if (eyeStyle === 'dot') return 'dot'
  if (eyeStyle === 'rounded') return 'extra-rounded'
  return 'square'
}

export const buildQRCodeOptions = ({
  settings,
  sizeOverride,
  transparentBackgroundOverride,
}: BuildOptionsInput) => {
  const { gradient, foregroundColor, backgroundColor } = settings
  const width = sizeOverride ?? settings.size
  const height = sizeOverride ?? settings.size
  const isTransparent = transparentBackgroundOverride ?? settings.transparentBackground

  const dotsOptions = {
    type: settings.dotStyle,
    ...maybeGradient(gradient, foregroundColor),
  }

  const cornersColorProps = gradient.enabled
    ? { gradient: gradientToRenderer(gradient) }
    : { color: foregroundColor }

  const backgroundOptions = isTransparent
    ? { color: 'transparent' }
    : {
        color: backgroundColor,
      }

  const image = resolveImage(settings.logo)

  return {
    width,
    height,
    type: 'svg' as const,
    data: settings.text || ' ',
    margin: settings.margin,
    qrOptions: {
      errorCorrectionLevel: settings.ecc,
    },
    dotsOptions,
    cornersSquareOptions: {
      type: resolveEyeSquareType(settings.eyeStyle),
      ...cornersColorProps,
    },
    cornersDotOptions: {
      type: resolveEyeDotType(settings.eyeStyle),
      ...cornersColorProps,
    },
    backgroundOptions,
    image,
    imageOptions: buildImageOptions(settings.logo, Boolean(image)),
  }
}

const resolveImage = (logo: LogoConfig) => {
  if (logo.mode === 'upload') {
    return logo.processedDataUrl ?? logo.rawDataUrl ?? undefined
  }
  if (logo.mode === 'external') {
    return logo.processedDataUrl ?? (logo.externalUrl || undefined)
  }
  return undefined
}

const buildImageOptions = (logo: LogoConfig, hasImage: boolean) => {
  if (!hasImage) {
    return {
      hideBackgroundDots: false,
    }
  }

  const imageSize = Math.min(Math.max(logo.scale, 0.05), 0.4)

  return {
    hideBackgroundDots: false,
    imageSize,
    margin: 0,
    ...(logo.crossOrigin === 'none' ? {} : { crossOrigin: logo.crossOrigin }),
  }
}

export const createQrCodeInstance = (settings: QRSettings) =>
  new QRCodeStyling(buildQRCodeOptions({ settings }))

export const updateQrCodeInstance = (instance: QRCodeInstance, settings: QRSettings) => {
  instance.update(buildQRCodeOptions({ settings }))
}

export const qrSupportsLogo = (settings: QRSettings) => Boolean(resolveImage(settings.logo))

export const isLogoCoverageRisky = (settings: QRSettings) => {
  if (!qrSupportsLogo(settings)) return false
  return settings.logo.scale > 0.26 && settings.ecc !== 'H'
}
