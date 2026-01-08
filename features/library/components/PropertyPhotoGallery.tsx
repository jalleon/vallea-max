'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  Box,
  Typography,
  IconButton,
  Dialog,
  Chip,
  useTheme
} from '@mui/material'
import {
  Close,
  NavigateBefore,
  NavigateNext,
  PhotoCamera,
  ZoomIn,
  Fullscreen
} from '@mui/icons-material'
import { MediaReference } from '@/types/common.types'

interface PropertyPhotoGalleryProps {
  photos: MediaReference[]
  translations: {
    propertyPhoto: string
    viewPhotos: string
    noPhotoAvailable: string
    photoOf: string
  }
  onEdit?: () => void
}

export function PropertyPhotoGallery({
  photos,
  translations: t,
  onEdit
}: PropertyPhotoGalleryProps) {
  const theme = useTheme()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const hasPhotos = photos && photos.length > 0
  const hasMultiplePhotos = photos && photos.length > 1

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))
  }, [photos.length])

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1))
  }, [photos.length])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!lightboxOpen) return
    if (e.key === 'ArrowLeft') handlePrevious()
    if (e.key === 'ArrowRight') handleNext()
    if (e.key === 'Escape') setLightboxOpen(false)
  }, [lightboxOpen, handlePrevious, handleNext])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (!hasPhotos) {
    return null
  }

  const currentPhoto = photos[currentIndex]

  return (
    <>
      {/* Main Photo Display */}
      <Box
        sx={{
          width: '100%',
          height: '100%',
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          position: 'relative',
          cursor: 'pointer',
          '&:hover .gallery-overlay': {
            opacity: 1
          },
          '&:hover .nav-button': {
            opacity: 1
          }
        }}
        onClick={() => setLightboxOpen(true)}
      >
        <img
          src={currentPhoto.thumbnail || currentPhoto.reference}
          alt={t.propertyPhoto}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease'
          }}
        />

        {/* Photo counter badge */}
        {hasMultiplePhotos && (
          <Chip
            icon={<PhotoCamera sx={{ fontSize: 14, color: 'white !important' }} />}
            label={`${currentIndex + 1} / ${photos.length}`}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'rgba(0,0,0,0.7)',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.75rem',
              '& .MuiChip-icon': { color: 'white' }
            }}
          />
        )}

        {/* Navigation buttons */}
        {hasMultiplePhotos && (
          <>
            <IconButton
              className="nav-button"
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                handlePrevious()
              }}
              sx={{
                position: 'absolute',
                left: 4,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(0,0,0,0.5)',
                color: 'white',
                opacity: 0,
                transition: 'opacity 0.2s',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
              }}
            >
              <NavigateBefore />
            </IconButton>
            <IconButton
              className="nav-button"
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                handleNext()
              }}
              sx={{
                position: 'absolute',
                right: 4,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(0,0,0,0.5)',
                color: 'white',
                opacity: 0,
                transition: 'opacity 0.2s',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
              }}
            >
              <NavigateNext />
            </IconButton>
          </>
        )}

        {/* Click to enlarge overlay */}
        <Box
          className="gallery-overlay"
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            p: 1,
            background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
            opacity: 0,
            transition: 'opacity 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Typography variant="caption" sx={{ color: 'white', display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ZoomIn sx={{ fontSize: 16 }} />
            {t.viewPhotos}
          </Typography>
        </Box>

        {/* Thumbnail indicators */}
        {hasMultiplePhotos && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 8,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 0.5
            }}
          >
            {photos.map((_, index) => (
              <Box
                key={index}
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentIndex(index)
                }}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: index === currentIndex ? 'white' : 'rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: 'white',
                    transform: 'scale(1.2)'
                  }
                }}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Lightbox Dialog */}
      <Dialog
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        maxWidth={false}
        PaperProps={{
          sx: {
            bgcolor: 'transparent',
            boxShadow: 'none',
            maxWidth: '95vw',
            maxHeight: '95vh'
          }
        }}
        slotProps={{
          backdrop: {
            sx: {
              bgcolor: 'rgba(0,0,0,0.95)'
            }
          }
        }}
      >
        <Box sx={{ position: 'relative' }}>
          {/* Close button */}
          <IconButton
            onClick={() => setLightboxOpen(false)}
            sx={{
              position: 'absolute',
              top: -40,
              right: 0,
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
            }}
          >
            <Close />
          </IconButton>

          {/* Main image */}
          <Box
            sx={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <img
              src={currentPhoto.reference}
              alt={t.propertyPhoto}
              style={{
                maxWidth: '90vw',
                maxHeight: '85vh',
                objectFit: 'contain',
                borderRadius: 8
              }}
            />

            {/* Navigation buttons */}
            {hasMultiplePhotos && (
              <>
                <IconButton
                  onClick={handlePrevious}
                  sx={{
                    position: 'absolute',
                    left: -60,
                    color: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                  }}
                >
                  <NavigateBefore sx={{ fontSize: 32 }} />
                </IconButton>
                <IconButton
                  onClick={handleNext}
                  sx={{
                    position: 'absolute',
                    right: -60,
                    color: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                  }}
                >
                  <NavigateNext sx={{ fontSize: 32 }} />
                </IconButton>
              </>
            )}
          </Box>

          {/* Photo counter */}
          {hasMultiplePhotos && (
            <Typography
              variant="body2"
              sx={{
                color: 'white',
                textAlign: 'center',
                mt: 2
              }}
            >
              {t.photoOf.replace('{current}', String(currentIndex + 1)).replace('{total}', String(photos.length))}
            </Typography>
          )}

          {/* Thumbnail strip */}
          {hasMultiplePhotos && photos.length <= 10 && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: 1,
                mt: 2,
                flexWrap: 'wrap'
              }}
            >
              {photos.map((photo, index) => (
                <Box
                  key={photo.id}
                  onClick={() => setCurrentIndex(index)}
                  sx={{
                    width: 60,
                    height: 45,
                    borderRadius: 1,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: index === currentIndex ? '2px solid white' : '2px solid transparent',
                    opacity: index === currentIndex ? 1 : 0.6,
                    transition: 'all 0.2s',
                    '&:hover': {
                      opacity: 1
                    }
                  }}
                >
                  <img
                    src={photo.thumbnail || photo.reference}
                    alt={`${t.propertyPhoto} ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Dialog>
    </>
  )
}
