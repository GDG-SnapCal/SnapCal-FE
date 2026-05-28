import { create } from 'zustand'
import type { CalendarDateEntry, PhotoCategory } from '../types'
import { getCalendar } from '../api/calendar'

interface CalendarState {
  currentYear: number
  currentMonth: number
  selectedCategory: PhotoCategory | 'all'
  calendarData: Record<string, CalendarDateEntry>
  isLoading: boolean
  fetchCalendar: (year: number, month: number) => Promise<void>
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

  fetchCalendar: async (year, month) => {
    set({ isLoading: true })
    try {
      const { data } = await getCalendar(year, month)
      const calendarData = (data.days ?? []).reduce(
        (acc, day) => {
          if (day.photos.length > 0) {
            acc[day.date] = {
              count: day.photos.length,
              representativePhoto: day.photos[0],
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
    set({ selectedCategory: category })
  },

  goToPrevMonth: () => {
    const { currentYear, currentMonth, fetchCalendar } = get()
    const prev =
      currentMonth === 1
        ? { year: currentYear - 1, month: 12 }
        : { year: currentYear, month: currentMonth - 1 }
    set({ currentYear: prev.year, currentMonth: prev.month })
    fetchCalendar(prev.year, prev.month)
  },

  goToNextMonth: () => {
    const { currentYear, currentMonth, fetchCalendar } = get()
    const next =
      currentMonth === 12
        ? { year: currentYear + 1, month: 1 }
        : { year: currentYear, month: currentMonth + 1 }
    set({ currentYear: next.year, currentMonth: next.month })
    fetchCalendar(next.year, next.month)
  },

  goToNextYear: () => {
    const { currentYear, currentMonth, fetchCalendar } = get()
     const next = { year: currentYear + 1, month: currentMonth }
    set({ currentYear: next.year, currentMonth: next.month })
    fetchCalendar(next.year, next.month)
    
  },

  goToPrevYear: () => {
     const { currentYear, currentMonth, fetchCalendar } = get()
     const prev = { year: currentYear -1 , month: currentMonth }
    set({ currentYear: prev.year, currentMonth: prev.month })
    fetchCalendar(prev.year, prev.month)
    
  },
}))
