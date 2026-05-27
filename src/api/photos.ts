import api, { uploadApi } from '../lib/axios'
import type { DuplicateGroup, ClassifiedPhoto } from '../types'

interface UploadResponse {
  uploadId: string
  status: 'done' | 'processing'
  duplicateGroups?: DuplicateGroup[]
  classifications?: ClassifiedPhoto[]
}

interface UploadStatusResponse {
  status: 'done' | 'processing' | 'error'
  duplicateGroups?: DuplicateGroup[]
  classifications?: ClassifiedPhoto[]
  error?: string
}

export const uploadPhotos = (files: File[]) => {
  const formData = new FormData()
  files.forEach((file) => formData.append('photos', file))
  return uploadApi.post<UploadResponse>('/photos/upload', formData)
}

export const getUploadStatus = (uploadId: string) =>
  api.get<UploadStatusResponse>(`/photos/upload/${uploadId}/status`)

export const submitDuplicateSelection = (
  uploadId: string,
  selections: { groupId: string; selectedPhotoId: string; unselectedPhotoIds: string[] }[],
) => api.post('/photos/duplicates/select', { uploadId, selections })

export const updatePhotoCategory = (photoId: string, categoryId: number) =>
  api.patch(`/photos/${photoId}/category`, { categoryId })

export const editPhoto = (
  photoId: string,
  options: {
    brightness: number
    blur: number
    filter: string | null
    textLayers: { text: string; x: number; y: number; fontSize: number; color: string }[]
  },
) => api.post<{ photoId: string; editedUrl: string }>(`/photos/${photoId}/edit`, options)
