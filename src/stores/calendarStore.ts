import { create } from 'zustand'
import type { CalendarDateEntry, PhotoCategory } from '../types'
import { getCalendar } from '../api/calendar'

interface CalendarState {
  currentYear: number
  currentMonth: number
  selectedCategory: PhotoCategory | 'all'
  calendarData: Record<string, CalendarDateEntry>
  isLoading: boolean
  fetchCalendar: (year: number, month: number, category?: PhotoCategory) => Promise<void>
  setCategory: (category: PhotoCategory | 'all') => void
  goToPrevMonth: () => void
  goToNextMonth: () => void
}

const today = new Date()

export const useCalendarStore = create<CalendarState>((set, get) => ({
  currentYear: today.getFullYear(),
  currentMonth: today.getMonth() + 1,
  selectedCategory: 'all',
  calendarData: {},
  isLoading: false,

  fetchCalendar: async (year, month, category) => {
    set({ isLoading: true })
    try {
      const { data } = await getCalendar(year, month, category)
      set({ calendarData: data.dates ?? {}, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  setCategory: (category) => {
    set({ selectedCategory: category })
    const { currentYear, currentMonth, fetchCalendar } = get()
    fetchCalendar(currentYear, currentMonth, category === 'all' ? undefined : category)
  },

  goToPrevMonth: () => {
    const { currentYear, currentMonth, fetchCalendar, selectedCategory } = get()
    const prev =
      currentMonth === 1
        ? { year: currentYear - 1, month: 12 }
        : { year: currentYear, month: currentMonth - 1 }
    set({ currentYear: prev.year, currentMonth: prev.month })
    fetchCalendar(prev.year, prev.month, selectedCategory === 'all' ? undefined : selectedCategory)
  },

  goToNextMonth: () => {
    const { currentYear, currentMonth, fetchCalendar, selectedCategory } = get()
    const next =
      currentMonth === 12
        ? { year: currentYear + 1, month: 1 }
        : { year: currentYear, month: currentMonth + 1 }
    set({ currentYear: next.year, currentMonth: next.month })
    fetchCalendar(next.year, next.month, selectedCategory === 'all' ? undefined : selectedCategory)
  },
}))
