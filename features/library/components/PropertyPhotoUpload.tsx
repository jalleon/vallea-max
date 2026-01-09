'use client'

import { useState, useRef, useCallback } from 'react'
import {
  Box,
  Typography,
  IconButton,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  useTheme
} from '@mui/material'
import {
  CloudUpload,
  Delete,
  PhotoCamera,
  DragIndicator,
  Star,
  StarBorder
} from '@mui/icons-material'
import { MediaReference } from '@/types/common.types'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '@/lib/supabase/client'
import { compressImage } from '@/lib/utils/imageCompression'

interface PropertyPhotoUploadProps {
  photos: MediaReference[]
  onPhotosChange: (photos: MediaReference[]) => void
  propertyId?: string
  maxPhotos?: number
  translations: {
    uploadPhotos: string
    dragDrop: string
    maxPhotos: string
    uploadingPhotos: string
    mainPhoto: string
    deletePhoto: string
    setAsMain: string
  }
}

export function PropertyPhotoUpload({
  photos,
  onPhotosChange,
  propertyId,
  maxPhotos = 10,
  translations: t
}: PropertyPhotoUploadProps) {
  const theme = useTheme()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const remainingSlots = maxPhotos - photos.length
    if (remainingSlots <= 0) {
      setError(t.maxPhotos)
      return
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots)
    setUploading(true)
    setError(null)
    setUploadProgress(0)

    try {
      const newPhotos: MediaReference[] = []

      for (let i = 0; i < filesToUpload.length; i++) {
        let file = filesToUpload[i]

        // Validate file type
        if (!file.type.startsWith('image/')) {
          continue
        }

        // Compress image if needed (to under 250KB)
        try {
          file = await compressImage(file)
        } catch (compressError) {
          console.warn('Image compression failed, using original:', compressError)
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop()
        const fileName = `${propertyId || 'temp'}_${uuidv4()}.${fileExt}`
        const filePath = `property-photos/${fileName}`

        // Upload to Supabase Storage
        const { data, error: uploadError } = await supabase.storage
          .from('property-media')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          // If bucket doesn't exist, use local preview for now
          const localUrl = URL.createObjectURL(file)
          newPhotos.push({
            id: uuidv4(),
            source: 'local',
            reference: localUrl,
            thumbnail: localUrl,
            metadata: {
              fileName: file.name,
              fileSize: file.size,
              mimeType: file.type,
              uploadedAt: new Date()
            }
          })
        } else {
          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('property-media')
            .getPublicUrl(filePath)

          newPhotos.push({
            id: uuidv4(),
            source: 'url',
            reference: publicUrl,
            thumbnail: publicUrl,
            metadata: {
              fileName: file.name,
              fileSize: file.size,
              mimeType: file.type,
              uploadedAt: new Date()
            }
          })
        }

        setUploadProgress(((i + 1) / filesToUpload.length) * 100)
      }

      onPhotosChange([...photos, ...newPhotos])
    } catch (err) {
      console.error('Upload error:', err)
      setError('Failed to upload photos')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }, [photos, onPhotosChange, propertyId, maxPhotos, t])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleDeletePhoto = useCallback((photoId: string) => {
    onPhotosChange(photos.filter(p => p.id !== photoId))
  }, [photos, onPhotosChange])

  const handleSetMainPhoto = useCallback((photoId: string) => {
    const photoIndex = photos.findIndex(p => p.id === photoId)
    if (photoIndex > 0) {
      const newPhotos = [...photos]
      const [photo] = newPhotos.splice(photoIndex, 1)
      newPhotos.unshift(photo)
      onPhotosChange(newPhotos)
    }
  }, [photos, onPhotosChange])

  return (
    <Box>
      {/* Upload Area */}
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          mb: 2,
          border: dragOver ? `2px dashed ${theme.palette.primary.main}` : `2px dashed ${theme.palette.divider}`,
          bgcolor: dragOver ? `${theme.palette.primary.main}10` : 'transparent',
          cursor: 'pointer',
          transition: 'all 0.2s',
          '&:hover': {
            borderColor: theme.palette.primary.main,
            bgcolor: `${theme.palette.primary.main}05`
          }
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <Box sx={{ textAlign: 'center' }}>
          {uploading ? (
            <>
              <CircularProgress variant="determinate" value={uploadProgress} sx={{ mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {t.uploadingPhotos} ({Math.round(uploadProgress)}%)
              </Typography>
            </>
          ) : (
            <>
              <CloudUpload sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 1 }} />
              <Typography variant="body1" fontWeight={600} color="primary">
                {t.uploadPhotos}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t.dragDrop}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t.maxPhotos.replace('{max}', maxPhotos.toString()).replace('{current}', photos.length.toString())}
              </Typography>
            </>
          )}
        </Box>
      </Paper>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => handleFileSelect(e.target.files)}
      />

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Photo Grid */}
      {photos.length > 0 && (
        <Grid container spacing={1}>
          {photos.map((photo, index) => (
            <Grid item xs={6} sm={4} md={3} key={photo.id}>
              <Paper
                variant="outlined"
                sx={{
                  position: 'relative',
                  paddingTop: '75%', // 4:3 aspect ratio
                  overflow: 'hidden',
                  borderRadius: 1,
                  border: index === 0 ? `2px solid ${theme.palette.primary.main}` : undefined,
                  '&:hover .photo-actions': {
                    opacity: 1
                  }
                }}
              >
                <img
                  src={photo.thumbnail || photo.reference}
                  alt={photo.metadata?.fileName || `Photo ${index + 1}`}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />

                {/* Main photo badge */}
                {index === 0 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 4,
                      left: 4,
                      bgcolor: theme.palette.primary.main,
                      color: 'white',
                      px: 1,
                      py: 0.25,
                      borderRadius: 1,
                      fontSize: '0.65rem',
                      fontWeight: 600
                    }}
                  >
                    {t.mainPhoto}
                  </Box>
                )}

                {/* Photo actions overlay */}
                <Box
                  className="photo-actions"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    p: 0.5,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 0.5
                  }}
                >
                  {index !== 0 && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSetMainPhoto(photo.id)
                      }}
                      sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
                      title={t.setAsMain}
                    >
                      <StarBorder sx={{ fontSize: 18 }} />
                    </IconButton>
                  )}
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeletePhoto(photo.id)
                    }}
                    sx={{ color: 'white', bgcolor: 'rgba(255,0,0,0.3)', '&:hover': { bgcolor: 'rgba(255,0,0,0.5)' } }}
                    title={t.deletePhoto}
                  >
                    <Delete sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  )
}
