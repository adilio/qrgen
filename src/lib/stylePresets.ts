import type { GradientConfig, StyleSettings } from './qrcode'

export interface StylePreset {
  id: StyleSettings['presetId']
  name: string
  description: string
  style: Pick<StyleSettings, 'dotType' | 'cornerSquareType' | 'cornerDotType' | 'fillMode'> & {
    gradient?: GradientConfig
  }
  foregroundColor?: string
  backgroundColor?: string
}

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'classic',
    name: 'Classic Sharp',
    description: 'Square modules with crisp eyes and solid ink.',
    style: {
      dotType: 'square',
      cornerSquareType: 'square',
      cornerDotType: 'square',
      fillMode: 'solid',
    },
    foregroundColor: '#111827',
  },
  {
    id: 'smooth-round',
    name: 'Smooth Round',
    description: 'Rounded dots with soft framed eyes.',
    style: {
      dotType: 'rounded',
      cornerSquareType: 'extra-rounded',
      cornerDotType: 'dot',
      fillMode: 'solid',
    },
    foregroundColor: '#1d4ed8',
  },
  {
    id: 'ultra-soft',
    name: 'Ultra Soft',
    description: 'Blobby modules with pill-shaped eyes.',
    style: {
      dotType: 'extra-rounded',
      cornerSquareType: 'extra-rounded',
      cornerDotType: 'extra-rounded',
      fillMode: 'solid',
    },
    foregroundColor: '#2563eb',
  },
  {
    id: 'aurora-fade',
    name: 'Aurora Fade',
    description: 'Rounded dots with a diagonal linear gradient.',
    style: {
      dotType: 'rounded',
      cornerSquareType: 'extra-rounded',
      cornerDotType: 'dot',
      fillMode: 'gradient',
      gradient: {
        type: 'linear',
        rotation: 45,
        stops: [
          { offset: 0, color: '#34d399' },
          { offset: 1, color: '#60a5fa' },
        ],
      },
    },
    backgroundColor: '#0f172a',
  },
  {
    id: 'sunrise-burst',
    name: 'Sunrise Burst',
    description: 'Radial gradient with warm tones and classic eyes.',
    style: {
      dotType: 'dots',
      cornerSquareType: 'square',
      cornerDotType: 'dot',
      fillMode: 'gradient',
      gradient: {
        type: 'radial',
        stops: [
          { offset: 0, color: '#f97316' },
          { offset: 1, color: '#ef4444' },
        ],
      },
    },
    backgroundColor: '#111827',
  },
  {
    id: 'blueprint',
    name: 'Blueprint',
    description: 'Technical square dots with a cool-toned gradient.',
    style: {
      dotType: 'classy',
      cornerSquareType: 'square',
      cornerDotType: 'square',
      fillMode: 'gradient',
      gradient: {
        type: 'linear',
        rotation: 90,
        stops: [
          { offset: 0, color: '#38bdf8' },
          { offset: 1, color: '#0ea5e9' },
        ],
      },
    },
    backgroundColor: '#0b1120',
  },
]

export const findStylePreset = (presetId: StyleSettings['presetId']) =>
  STYLE_PRESETS.find((preset) => preset.id === presetId)
