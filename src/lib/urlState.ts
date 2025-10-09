import type { QRSettings } from './qrcode'

const PARAM_KEY = 'config'

const encodeBase64 = (value: string) => {
  if (typeof window === 'undefined' || typeof window.btoa !== 'function') {
    throw new Error('Base64 encoding unavailable in this environment')
  }
  return window.btoa(
    encodeURIComponent(value).replace(/%([0-9A-F]{2})/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16)),
    ),
  )
}

const decodeBase64 = (value: string) => {
  if (typeof window === 'undefined' || typeof window.atob !== 'function') {
    console.warn('[qrgen] Unable to decode URL state outside the browser')
    return null
  }
  try {
    const decoded = window.atob(value)
    const percentEncoded = Array.from(decoded)
      .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
      .join('')
    return decodeURIComponent(percentEncoded)
  } catch (error) {
    console.warn('[qrgen] Unable to decode URL state', error)
    return null
  }
}

const prepareLogoForShare = (settings: QRSettings) => {
  if (settings.logo.mode === 'upload') {
    return {
      ...settings.logo,
      mode: 'none' as const,
      rawDataUrl: undefined,
      processedDataUrl: undefined,
    }
  }
  return {
    ...settings.logo,
    processedDataUrl: undefined,
  }
}

const serializeSettings = (settings: QRSettings) => {
  const shareReady: QRSettings = {
    ...settings,
    logo: prepareLogoForShare(settings),
  }

  return JSON.stringify(shareReady)
}

export const encodeSettingsToUrl = (settings: QRSettings) => {
  if (typeof window === 'undefined') return null
  try {
    const json = serializeSettings(settings)
    const encoded = encodeBase64(json)
    const url = new URL(window.location.href)
    url.searchParams.set(PARAM_KEY, encoded)
    return url
  } catch (error) {
    console.warn('[qrgen] Failed to encode settings for URL', error)
    return null
  }
}

export const decodeSettingsFromSearch = (search: string) => {
  const params = new URLSearchParams(search)
  const raw = params.get(PARAM_KEY)
  if (!raw) return null
  const decoded = decodeBase64(raw)
  if (!decoded) return null
  try {
    return JSON.parse(decoded) as QRSettings
  } catch (error) {
    console.warn('[qrgen] Unable to parse settings from URL', error)
    return null
  }
}

export const decodeSettingsFromCurrentUrl = () => {
  if (typeof window === 'undefined') return null
  return decodeSettingsFromSearch(window.location.search)
}
