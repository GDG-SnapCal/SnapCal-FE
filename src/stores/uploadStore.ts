import { create } from 'zustand'
import type { DuplicateGroup, ClassifiedPhoto } from '../types'
import { uploadPhotos, submitDuplicateSelection, getUploadStatus } from '../api/photos'
import { saveToCalendar } from '../api/calendar'

interface UploadState {
  uploadId: string | null
  selectedFiles: File[]
  duplicateGroups: DuplicateGroup[]
  classifiedPhotos: ClassifiedPhoto[]
  isUploading: boolean
  isSaving: boolean
  setSelectedFiles: (files: File[]) => void
  upload: () => Promise<'duplicate' | 'classify'>
  pollStatus: () => Promise<void>
  submitDuplicates: (selections: { groupId: string; selectedPhotoId: string }[]) => Promise<void>
  saveToCalendar: (photos: { photoId: string; category: string; date: string }[]) => Promise<void>
  reset: () => void
}

export const useUploadStore = create<UploadState>((set, get) => ({
  uploadId: null,
  selectedFiles: [],
  duplicateGroups: [],
  classifiedPhotos: [],
  isUploading: false,
  isSaving: false,

  setSelectedFiles: (files) => set({ selectedFiles: files }),

  upload: async () => {
    const { selectedFiles } = get()
    set({ isUploading: true })
    const { data } = await uploadPhotos(selectedFiles)
    set({ uploadId: data.uploadId })

    if (data.status === 'processing') {
      await get().pollStatus()
    } else {
      set({
        duplicateGroups: data.duplicateGroups ?? [],
        classifiedPhotos: data.classifications ?? [],
        isUploading: false,
      })
    }

    const { duplicateGroups } = get()
    return duplicateGroups.length > 0 ? 'duplicate' : 'classify'
  },

  pollStatus: async () => {
    const { uploadId } = get()
    if (!uploadId) return

    const poll = async (): Promise<void> => {
      const { data } = await getUploadStatus(uploadId)
      if (data.status === 'processing') {
        await new Promise((r) => setTimeout(r, 2500))
        return poll()
      }
      set({
        duplicateGroups: data.duplicateGroups ?? [],
        classifiedPhotos: data.classifications ?? [],
        isUploading: false,
      })
    }
    await poll()
  },

  submitDuplicates: async (selections) => {
    const { uploadId } = get()
    if (!uploadId) return
    await submitDuplicateSelection(uploadId, selections)
  },

  saveToCalendar: async (photos) => {
    const { uploadId } = get()
    if (!uploadId) return
    set({ isSaving: true })
    await saveToCalendar(uploadId, photos)
    set({ isSaving: false })
  },

  reset: () =>
    set({
      uploadId: null,
      selectedFiles: [],
      duplicateGroups: [],
      classifiedPhotos: [],
      isUploading: false,
      isSaving: false,
    }),
}))
