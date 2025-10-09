export const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Unable to read file as data URL'))
      }
    }
    reader.onerror = () => reject(reader.error ?? new Error('Unknown file read error'))
    reader.readAsDataURL(file)
  })

const drawRoundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) => {
  const r = Math.min(radius, width / 2, height / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + width - r, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + r)
  ctx.lineTo(x + width, y + height - r)
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height)
  ctx.lineTo(x + r, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

export const applyRoundedCorners = async (source: string, radiusPercent: number) =>
  new Promise<string>((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = image.width
      canvas.height = image.height
      const context = canvas.getContext('2d')
      if (!context) {
        reject(new Error('2D context not available'))
        return
      }
      const radius = (Math.min(image.width, image.height) * Math.max(radiusPercent, 0)) / 100
      context.clearRect(0, 0, canvas.width, canvas.height)
      if (radius > 0) {
        drawRoundedRect(context, 0, 0, canvas.width, canvas.height, radius)
        context.clip()
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL())
    }
    image.onerror = () => reject(new Error('Unable to load logo image'))
    image.src = source
  })

export const withRoundedCorners = async (source: string | undefined, radiusPercent: number) => {
  if (!source) return undefined
  try {
    return await applyRoundedCorners(source, radiusPercent)
  } catch (error) {
    console.warn('[qrgen] Unable to apply rounded corners', error)
    return source
  }
}
