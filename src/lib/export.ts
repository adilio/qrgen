import QRCodeStyling from 'qr-code-styling'
import type { QRSettings } from './qrcode'
import { buildQRCodeOptions } from './qrcode'

export type ExportFormat = 'png' | 'jpeg' | 'webp' | 'svg'

export interface ExportConfig {
  format: ExportFormat
  size: number
  transparent: boolean
  fileName?: string
}

const buildTransientInstance = (settings: QRSettings, config: ExportConfig) =>
  new QRCodeStyling(
    buildQRCodeOptions({
      settings,
      sizeOverride: config.size,
      transparentBackgroundOverride: config.transparent,
    }),
  )

export const downloadQr = async (settings: QRSettings, config: ExportConfig) => {
  const instance = buildTransientInstance(settings, config)
  await instance.download({ name: config.fileName ?? 'qr-code', extension: config.format })
}

export const copyQrToClipboard = async (
  settings: QRSettings,
  config: Omit<ExportConfig, 'format' | 'fileName'>,
) => {
  const instance = buildTransientInstance(settings, {
    ...config,
    format: 'png',
  })
  const blob = await instance.getRawData('png')
  if (!blob) throw new Error('QR blob unavailable')
  if (!navigator.clipboard) {
    throw new Error('Clipboard API unavailable')
  }

  if (typeof window.ClipboardItem !== 'undefined') {
    const clipboardItem = new window.ClipboardItem({ [blob.type]: blob })
    await navigator.clipboard.write([clipboardItem])
    return
  }

  const arrayBuffer = await blob.arrayBuffer()
  const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
  const dataUrl = `data:${blob.type};base64,${base64}`
  await navigator.clipboard.writeText(dataUrl)
}
