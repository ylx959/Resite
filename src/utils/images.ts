const MAX_INPUT_BYTES = 10 * 1024 * 1024
const AVATAR_PX = 160
const ICON_PX = 128

/**
 * An uploaded photo as a small square JPEG data URL (center-cropped, 160px),
 * small enough to keep in localStorage. Browser only.
 */
export async function fileToAvatar(file: File): Promise<string> {
  const bitmap = await readImage(file)
  const side = Math.min(bitmap.width, bitmap.height)
  const { canvas, ctx } = makeCanvas(AVATAR_PX, AVATAR_PX)
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, AVATAR_PX, AVATAR_PX)
  ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, AVATAR_PX, AVATAR_PX)
  bitmap.close()
  return canvas.toDataURL('image/jpeg', 0.86)
}

/**
 * An uploaded site icon as a PNG data URL: shape and transparency kept, longest
 * side at most 128px (plenty for a favicon). Browser only.
 */
export async function fileToIcon(file: File): Promise<string> {
  const bitmap = await readImage(file)
  const scale = Math.min(1, ICON_PX / Math.max(bitmap.width, bitmap.height))
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))
  const { canvas, ctx } = makeCanvas(width, height)
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()
  return canvas.toDataURL('image/png')
}

async function readImage(file: File): Promise<ImageBitmap> {
  if (!/^image\/(png|jpeg|gif|webp)$/.test(file.type)) throw new Error('Use a PNG, JPEG, GIF or WebP image.')
  if (file.size > MAX_INPUT_BYTES) throw new Error('Images must be under 10 MB.')
  return createImageBitmap(file)
}

function makeCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not process this image.')
  return { canvas, ctx }
}
