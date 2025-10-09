import type { QRSettings } from './qrcode'

export interface PresetDefinition {
  key: string
  name: string
  description: string
  settings: Partial<QRSettings>
}

export const PRESETS: PresetDefinition[] = [
  {
    key: 'liquid-lavender',
    name: 'Liquid Lavender',
    description: 'Signature violet-to-cyan gradient with frosted glass backdrop.',
    settings: {
      foregroundColor: '#1f5bff',
      backgroundColor: '#f7f8ff',
      gradient: {
        enabled: true,
        type: 'linear',
        rotation: 35,
        start: '#7b5cff',
        end: '#00d8ff',
      },
      dotStyle: 'rounded',
      eyeStyle: 'rounded',
      transparentBackground: false,
    },
  },
  {
    key: 'sunset-glass',
    name: 'Sunset Glass',
    description: 'Warm coral glow with soft midnight backdrop.',
    settings: {
      foregroundColor: '#ff7b88',
      backgroundColor: '#0a0f1f',
      gradient: {
        enabled: true,
        type: 'radial',
        rotation: 90,
        start: '#ff7b88',
        end: '#ffc46b',
      },
      dotStyle: 'dots',
      eyeStyle: 'square',
      transparentBackground: false,
    },
  },
  {
    key: 'mono-glaze',
    name: 'Mono Glaze',
    description: 'High-contrast monochrome for maximum readability.',
    settings: {
      foregroundColor: '#0b1120',
      backgroundColor: '#ffffff',
      gradient: {
        enabled: false,
        type: 'linear',
        rotation: 0,
        start: '#0b1120',
        end: '#0b1120',
      },
      dotStyle: 'square',
      eyeStyle: 'square',
      transparentBackground: false,
    },
  },
  {
    key: 'midnight-glow',
    name: 'Midnight Glow',
    description: 'Electric teal with subtle vignette for dark mode.',
    settings: {
      foregroundColor: '#1ef2d3',
      backgroundColor: '#020617',
      gradient: {
        enabled: true,
        type: 'linear',
        rotation: 120,
        start: '#1ef2d3',
        end: '#338bff',
      },
      dotStyle: 'rounded',
      eyeStyle: 'dot',
      transparentBackground: false,
    },
  },
]

export const findPreset = (key: string) => PRESETS.find((preset) => preset.key === key)

export const applyPreset = (base: QRSettings, preset: PresetDefinition): QRSettings => {
  const merged: QRSettings = {
    ...base,
    ...preset.settings,
    gradient: {
      ...base.gradient,
      ...preset.settings.gradient,
    },
    logo: {
      ...base.logo,
      ...preset.settings.logo,
    },
    presetKey: preset.key,
  }
  return merged
}
