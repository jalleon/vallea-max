'use client'

import { useState, useEffect } from 'react'
import { Box, IconButton } from '@mui/material'
import { ChevronLeft, ChevronRight, Circle } from '@mui/icons-material'

interface ScreenshotCarouselProps {
  images: {
    icon: React.ReactNode
    gradient: string
  }[]
  autoPlayInterval?: number
}

export default function ScreenshotCarousel({
  images,
  autoPlayInterval = 5000
}: ScreenshotCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Auto-scroll functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [images.length, autoPlayInterval])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  return (
    <Box sx={{ position: 'relative', width: '100%', height: 300 }}>
      {/* Image display */}
      {images.map((image, index) => (
        <Box
          key={index}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: currentIndex === index ? 1 : 0,
            transition: 'opacity 0.8s ease-in-out',
            background: image.gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid rgba(232, 226, 213, 0.1)',
          }}
        >
          {image.icon}
        </Box>
      ))}

      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          <IconButton
            onClick={goToPrevious}
            sx={{
              position: 'absolute',
              left: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.7)',
              },
            }}
          >
            <ChevronLeft />
          </IconButton>
          <IconButton
            onClick={goToNext}
            sx={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.7)',
              },
            }}
          >
            <ChevronRight />
          </IconButton>
        </>
      )}

      {/* Dot indicators */}
      {images.length > 1 && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 1,
          }}
        >
          {images.map((_, index) => (
            <IconButton
              key={index}
              onClick={() => goToSlide(index)}
              sx={{
                p: 0,
                minWidth: 'auto',
                width: 12,
                height: 12,
              }}
            >
              <Circle
                sx={{
                  fontSize: 12,
                  color: currentIndex === index ? '#10B981' : 'rgba(232, 226, 213, 0.4)',
                  transition: 'color 0.3s ease',
                }}
              />
            </IconButton>
          ))}
        </Box>
      )}
    </Box>
  )
}
