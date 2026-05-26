import api from '../lib/axios'
import type { CalendarDateEntry, PhotoCategory } from '../types'

interface CalendarResponse {
  year: number
  month: number
  dates: Record<string, CalendarDateEntry>
}

export const getCalendar = (year: number, month: number, category?: PhotoCategory) =>
  api.get<CalendarResponse>('/calendar', { params: { year, month, category } })

export const saveToCalendar = (
  uploadId: string,
  photos: { photoId: string; category: string }[]
) => api.post<{ savedCount: number }>('/calendar/save', { uploadId, photos })

export const exportCalendar = (year: number, month: number, ratio: '1:1' | '4:5' | '16:9') =>
  api.post<{ imageUrl: string; expiresAt: string }>('/calendar/export', { year, month, ratio })

export const createShareLink = (year: number, month: number) =>
  api.post<{ shareUrl: string; expiresAt: string }>('/calendar/share/link', { year, month })
