import api, { uploadApi } from '../lib/axios'
import type { DuplicateGroup, ClassifiedPhoto } from '../types'


interface UploadResponse {
  uploadId: string
  total: number
}

interface UploadStatusResponse {
  uploadId: string
  status: 'done' | 'processing'
  total: number
  completed: number
  duplicateGroups?: DuplicateGroup[]
  classifications?: ClassifiedPhoto[]
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


export const getDayPhotos = (date: string, category?: string) =>
  api.get(`/photos`, { params: { date, category } })

export const getPhotoDetail = (photoId: string) =>
  api.get(`/photos/${photoId}`)

export const setRepresentativePhoto = (photoId: string, category?: string) =>
  api.patch(`/photos/${photoId}/representative`, category ? { category } : undefined)

export const deletePhoto = (photoId: string) =>
  api.delete(`/photos/${photoId}`)

export const updatePhotoImage = (photoId: string, blob: Blob) => {
  const formData = new FormData()
  formData.append('file', blob, 'edited.jpg')
  return uploadApi.patch<{ photoId: string; originalUrl: string; thumbnailUrl: string | null }>(
    `/photos/${photoId}/image`,
    formData,
  )
}