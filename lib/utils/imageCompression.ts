const MAX_FILE_SIZE = 250 * 1024 // 250KB

/**
 * Compress an image file to be under the target size (250KB)
 * Uses canvas to resize and reduce quality
 */
export async function compressImage(file: File, maxSize: number = MAX_FILE_SIZE): Promise<File> {
  // If already small enough, return as-is
  if (file.size <= maxSize) {
    return file
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    img.onload = async () => {
      let { width, height } = img
      let quality = 0.8
      let blob: Blob | null = null

      // Calculate initial scale based on file size ratio
      const sizeRatio = Math.sqrt(maxSize / file.size)
      if (sizeRatio < 1) {
        width = Math.round(width * Math.max(sizeRatio, 0.3))
        height = Math.round(height * Math.max(sizeRatio, 0.3))
      }

      // Limit max dimensions to 1920px
      const maxDimension = 1920
      if (width > maxDimension || height > maxDimension) {
        const scale = maxDimension / Math.max(width, height)
        width = Math.round(width * scale)
        height = Math.round(height * scale)
      }

      canvas.width = width
      canvas.height = height
      ctx?.drawImage(img, 0, 0, width, height)

      // Try different quality levels until under maxSize
      const outputType = 'image/jpeg'

      while (quality > 0.1) {
        blob = await new Promise<Blob | null>(res =>
          canvas.toBlob(res, outputType, quality)
        )

        if (blob && blob.size <= maxSize) {
          break
        }

        // Reduce quality or dimensions
        quality -= 0.1
        if (quality <= 0.3 && blob && blob.size > maxSize) {
          // Also reduce dimensions
          width = Math.round(width * 0.8)
          height = Math.round(height * 0.8)
          canvas.width = width
          canvas.height = height
          ctx?.drawImage(img, 0, 0, width, height)
        }
      }

      URL.revokeObjectURL(img.src)

      if (blob) {
        const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
          type: outputType,
          lastModified: Date.now()
        })
        resolve(compressedFile)
      } else {
        reject(new Error('Failed to compress image'))
      }
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}
