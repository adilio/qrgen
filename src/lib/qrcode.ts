import QRCodeStyling from 'qr-code-styling'
import type { DotType, CornerSquareType, CornerDotType } from 'qr-code-styling'

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
    scale: 0.2,
    cornerRadius: 12,
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

  return {
    width,
    height,
    type: 'svg' as const,
    data: settings.text || ' ',
    margin: settings.margin,
    qrOptions: {
      errorCorrectionLevel: settings.ecc,
    },
    dotsOptions: {
      type: DEFAULT_DOT_STYLE,
      color: settings.foregroundColor,
    },
    cornersSquareOptions: {
      type: DEFAULT_CORNER_SQUARE_STYLE,
      color: settings.foregroundColor,
    },
    cornersDotOptions: {
      type: DEFAULT_CORNER_DOT_STYLE,
      color: settings.foregroundColor,
    },
    backgroundOptions,
    image,
    imageOptions: buildImageOptions(settings.logo, Boolean(image)),
  }
}

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

  const imageSize = Math.min(Math.max(logo.scale, 0.05), 0.6)

  return {
    hideBackgroundDots: logo.scale > 0.4,
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
