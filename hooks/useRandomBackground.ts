import { useMemo } from 'react'

// Array of background image paths from public/backgrounds folder
const BACKGROUND_IMAGES = [
  '/backgrounds/bg1.jpg',
  '/backgrounds/bg2.jpg',
]

/**
 * Hook that returns a random background image URL from the predefined list.
 * The image is selected once when the component mounts and remains stable during re-renders.
 */
export function useRandomBackground() {
  const backgroundImage = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * BACKGROUND_IMAGES.length)
    return BACKGROUND_IMAGES[randomIndex]
  }, [])

  return backgroundImage
}
