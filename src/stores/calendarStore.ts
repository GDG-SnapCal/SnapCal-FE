import { create } from 'zustand'
import type { CalendarDateEntry, PhotoCategory } from '../types'
import { getCalendar } from '../api/calendar'

interface CalendarState {
  currentYear: number
  currentMonth: number
  selectedCategory: PhotoCategory | 'all'
  calendarData: Record<string, CalendarDateEntry>
  isLoading: boolean
  fetchCalendar: (year: number, month: number, category?: PhotoCategory | 'all') => Promise<void>
  setCategory: (category: PhotoCategory | 'all') => void
  goToPrevMonth: () => void
  goToNextMonth: () => void
  goToPrevYear : () => void
  goToNextYear : () => void
}

const today = new Date()

export const useCalendarStore = create<CalendarState>((set, get) => ({
  currentYear: today.getFullYear(),
  currentMonth: today.getMonth() + 1,
  selectedCategory: 'all',
  calendarData: {},
  isLoading: false,

  fetchCalendar: async (year, month, category?: PhotoCategory | 'all') => {
    const cat = category === 'all' ? undefined : category
    set({ isLoading: true })
    try {
      const { data } = await getCalendar(year, month, cat)
      const calendarData = (data.days ?? []).reduce(
        (acc, day) => {
          const photos = cat ? day.photos.filter((p) => p.category === cat) : day.photos
          if (photos.length > 0) {
            acc[day.date] = {
              count: photos.length,
              representativePhoto: photos[0],
            }
          }
          return acc
        },
        {} as Record<string, CalendarDateEntry>,
      )
      set({ calendarData, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  setCategory: (category) => {
    const { currentYear, currentMonth, fetchCalendar } = get()
    set({ selectedCategory: category })
    fetchCalendar(currentYear, currentMonth, category)
  },

  goToPrevMonth: () => {
    const { currentYear, currentMonth, selectedCategory, fetchCalendar } = get()
    const prev =
      currentMonth === 1
        ? { year: currentYear - 1, month: 12 }
        : { year: currentYear, month: currentMonth - 1 }
    set({ currentYear: prev.year, currentMonth: prev.month })
    fetchCalendar(prev.year, prev.month, selectedCategory)
  },

  goToNextMonth: () => {
    const { currentYear, currentMonth, selectedCategory, fetchCalendar } = get()
    const next =
      currentMonth === 12
        ? { year: currentYear + 1, month: 1 }
        : { year: currentYear, month: currentMonth + 1 }
    set({ currentYear: next.year, currentMonth: next.month })
    fetchCalendar(next.year, next.month, selectedCategory)
  },

  goToNextYear: () => {
    const { currentYear, currentMonth, selectedCategory, fetchCalendar } = get()
    const next = { year: currentYear + 1, month: currentMonth }
    set({ currentYear: next.year, currentMonth: next.month })
    fetchCalendar(next.year, next.month, selectedCategory)
  },

  goToPrevYear: () => {
    const { currentYear, currentMonth, selectedCategory, fetchCalendar } = get()
    const prev = { year: currentYear - 1, month: currentMonth }
    set({ currentYear: prev.year, currentMonth: prev.month })
    fetchCalendar(prev.year, prev.month, selectedCategory)
  },
}))
