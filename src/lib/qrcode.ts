import QRCodeStyling from 'qr-code-styling'
import type { DotType, CornerSquareType, CornerDotType } from 'qr-code-styling'

// Re-export types for use in components
export type { DotType, CornerSquareType, CornerDotType }

export type FillMode = 'solid' | 'gradient'

export interface GradientStop {
  offset: number
  color: string
}

export interface GradientConfig {
  type: 'linear' | 'radial'
  rotation?: number
  stops: GradientStop[]
}

export interface StyleSettings {
  presetId: string
  dotType: DotType
  cornerSquareType: CornerSquareType
  cornerDotType: CornerDotType
  fillMode: FillMode
  gradient?: GradientConfig
}

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H'

export interface LogoConfig {
  mode: 'none' | 'upload'
  originalDataUrl?: string
  processedDataUrl?: string
  scale: number // 0-1 ratio representing imageSize
  cornerRadius: number // percentage 0-40
}

export interface QRSettings {
  text: string
  size: number
  margin: number
  ecc: ErrorCorrectionLevel
  foregroundColor: string
  backgroundColor: string
  transparentBackground: boolean
  logo: LogoConfig
  style: StyleSettings
  // QR style options (legacy support)
  dotsType?: DotType
  cornersSquareType?: CornerSquareType
  cornersDotType?: CornerDotType
}

export type QRCodeInstance = QRCodeStyling

export const ECC_LEVELS: ErrorCorrectionLevel[] = ['L', 'M', 'Q', 'H']

export const defaultSettings: QRSettings = {
  text: 'https://example.com',
  size: 320,
  margin: 16,
  ecc: 'M',
  foregroundColor: '#1f2937',
  backgroundColor: '#ffffff',
  transparentBackground: false,
  logo: {
    mode: 'none',
    originalDataUrl: undefined,
    processedDataUrl: undefined,
    scale: 0.25,
    cornerRadius: 12,
  },
  style: {
    presetId: 'classic',
    dotType: 'square',
    cornerSquareType: 'square',
    cornerDotType: 'square',
    fillMode: 'solid',
  },
}

const DEFAULT_DOT_STYLE: DotType = 'rounded'
const DEFAULT_CORNER_SQUARE_STYLE: CornerSquareType = 'extra-rounded'
const DEFAULT_CORNER_DOT_STYLE: CornerDotType = 'dot'

export interface BuildOptionsInput {
  settings: QRSettings
  sizeOverride?: number
  transparentBackgroundOverride?: boolean
}

export const buildQRCodeOptions = ({
  settings,
  sizeOverride,
  transparentBackgroundOverride,
}: BuildOptionsInput) => {
  const width = sizeOverride ?? settings.size
  const height = sizeOverride ?? settings.size
  const isTransparent = transparentBackgroundOverride ?? settings.transparentBackground

  const backgroundOptions = isTransparent
    ? { color: 'transparent' }
    : {
        color: settings.backgroundColor,
      }

  const image = resolveImage(settings.logo)

  const dotsOptions = buildDotsOptions(settings)
  const cornersSquareOptions = buildCornerSquareOptions(settings)
  const cornersDotOptions = buildCornerDotOptions(settings)

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
    cornersSquareOptions,
    cornersDotOptions,
    backgroundOptions,
    image,
    imageOptions: buildImageOptions(settings.logo, Boolean(image)),
  }
}

const buildDotsOptions = (settings: QRSettings) => {
  const dotType = settings.style?.dotType ?? DEFAULT_DOT_STYLE
  if (settings.style?.fillMode === 'gradient' && settings.style.gradient) {
    return {
      type: dotType,
      gradient: serializeGradient(settings.style.gradient),
    }
  }

  return {
    type: dotType,
    color: settings.foregroundColor,
  }
}

const buildCornerSquareOptions = (settings: QRSettings) => {
  const type = settings.style?.cornerSquareType ?? DEFAULT_CORNER_SQUARE_STYLE
  if (settings.style?.fillMode === 'gradient' && settings.style.gradient) {
    return {
      type,
      gradient: serializeGradient(settings.style.gradient),
    }
  }

  return {
    type,
    color: settings.foregroundColor,
  }
}

const buildCornerDotOptions = (settings: QRSettings) => {
  const type = settings.style?.cornerDotType ?? DEFAULT_CORNER_DOT_STYLE
  if (settings.style?.fillMode === 'gradient' && settings.style.gradient) {
    return {
      type,
      gradient: serializeGradient(settings.style.gradient),
    }
  }

  return {
    type,
    color: settings.foregroundColor,
  }
}

const serializeGradient = (gradient: GradientConfig) => ({
  type: gradient.type,
  rotation: gradient.rotation ?? 0,
  colorStops: gradient.stops.map((stop) => ({
    offset: stop.offset,
    color: stop.color,
  })),
})

const resolveImage = (logo: LogoConfig) => {
  if (logo.mode !== 'upload') return undefined
  return logo.processedDataUrl ?? logo.originalDataUrl ?? undefined
}

const buildImageOptions = (logo: LogoConfig, hasImage: boolean) => {
  if (!hasImage) {
    return {
      hideBackgroundDots: false,
    }
  }

  // Allow larger logo sizes up to 70%
  const imageSize = Math.min(Math.max(logo.scale, 0.05), 0.7)

  // Enhanced background hiding for better logo visibility
  // Hide background dots progressively based on logo size
  let hideBackgroundDots = false
  if (logo.scale > 0.5) {
    hideBackgroundDots = true // Hide completely for very large logos
  } else if (logo.scale > 0.35) {
    hideBackgroundDots = true // Hide for medium-large logos
  } else if (logo.scale > 0.25) {
    hideBackgroundDots = false // Keep visible for medium logos
  }

  return {
    hideBackgroundDots,
    imageSize,
    margin: 0,
  }
}

export const createQrCodeInstance = (settings: QRSettings) =>
  new QRCodeStyling(buildQRCodeOptions({ settings }))

export const updateQrCodeInstance = (instance: QRCodeInstance, settings: QRSettings) => {
  instance.update(buildQRCodeOptions({ settings }))
}

export const qrSupportsLogo = (settings: QRSettings) => settings.logo.mode === 'upload'
