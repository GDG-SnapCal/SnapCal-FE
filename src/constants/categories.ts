import type { PhotoCategory } from '../types'

export const CATEGORY_COLORS: Record<string, string> = {
  음식: '#FAC775',
  패션: '#F4C0D1',
  운동: '#9FE1CB',
  풍경: '#B5D4F4',
  일상: '#D3D1C7',
  미분류: '#E8E8E8',
}

// [배경색, 진한색] 튜플 — CalendarPage 그라디언트용
// SharePage 등 단색이 필요한 경우 [0] 사용
export const CATEGORY_GRADIENT: Record<string, [string, string]> = {
  음식: ['#fae4d4', '#b07f5e'],
  패션: ['#f2d4db', '#a56b7c'],
  운동: ['#c8f0df', '#3a8f6b'],
  풍경: ['#bfe3f5', '#3f7da7'],
  일상: ['#e8e1d2', '#86755a'],
  미분류: ['#e8e8e8', '#9e9e9e'],
}

export const CATEGORY_EMOJI: Record<string, string> = {
  음식: '🍽️',
  패션: '👗',
  운동: '🏃',
  풍경: '🏔️',
  일상: '☀️',
  미분류: '📁',
}

export const CATEGORY_FILTERS: { label: string; value: PhotoCategory | 'all' }[] = [
  { label: '전체', value: 'all' },
  { label: '음식', value: '음식' },
  { label: '패션', value: '패션' },
  { label: '운동', value: '운동' },
  { label: '풍경', value: '풍경' },
  { label: '일상', value: '일상' },
]
