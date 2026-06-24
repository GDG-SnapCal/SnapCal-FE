import api from '../lib/axios'
import type { PhotoCategory } from '../types'

interface CalendarPhoto {
  photoId: string
  thumbnailUrl: string
  category: string
  categoryColor: string
}

interface CalendarDay {
  date: string
  photos: CalendarPhoto[]
  representativePhoto?: CalendarPhoto
  categoryRepresentatives?: Record<string, { photoId: string; thumbnailUrl: string }>
}

export interface CalendarResponse {
  year: number
  month: number
  days: CalendarDay[]
}

export const getCalendar = (year: number, month: number, category?: PhotoCategory) =>
  api.get<CalendarResponse>('/calendar', { params: { year, month, category } })

export const saveToCalendar = (uploadId: string) =>
  api.post<{ message: string }>('/calendar/save', { uploadId })

export const exportCalendar = (year: number, month: number, ratio: '1:1' | '4:5' | '9:16') =>
  api.post<{ imageUrl: string; expiresAt: string }>('/calendar/export', { year, month, ratio })

export const createShareLink = (year: number, month: number) =>
  api.post<{ shareUrl: string; expiresAt: string }>('/calendar/share/link', { year, month })
