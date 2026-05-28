import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCalendarStore } from '../stores/calendarStore'
import type { PhotoCategory } from '../types'
import { useAuthStore } from '../stores/authStore'

const CATEGORY_GRADIENT: Record<string, [string, string]> = {
  음식: ['#fae4d4', '#b07f5e'],
  패션: ['#f2d4db', '#a56b7c'],
  운동: ['#c8f0df', '#3a8f6b'],
  풍경: ['#bfe3f5', '#3f7da7'],
  일상: ['#e8e1d2', '#86755a'],
  미분류: ['#e8e8e8', '#9e9e9e'],
}

const FILTERS: { label: string; value: PhotoCategory | 'all' }[] = [
  { label: '전체', value: 'all' },
  { label: '음식', value: '음식' },
  { label: '패션', value: '패션' },
  { label: '운동', value: '운동' },
  { label: '풍경', value: '풍경' },
  { label: '일상', value: '일상' },
]

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

export default function CalendarPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)


  const {
    currentYear,
    currentMonth,
    selectedCategory,
    calendarData,
    isLoading,
    fetchCalendar,
    setCategory,
    goToPrevMonth,
    goToNextMonth,
  } = useCalendarStore()

  useEffect(() => {
    fetchCalendar(currentYear, currentMonth)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay()
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate()
  const totalCount = Object.values(calendarData).reduce((s, d) => s + d.count, 0)
  const [selectedDay, setSelectedDay ] = useState<number | null >(null)
  const [ overlayCategory, setOverlayCategory] = useState<PhotoCategory | 'all'>('all')


  const cells: (number | null)[] = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const getEntry = (day: number) => {
    const key = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const entry = calendarData[key] ?? null
    if (!entry) return null
    if (selectedCategory !== 'all' && entry.representativePhoto.category !== selectedCategory) return null
    return entry
  }

  return (
    <div className="flex min-h-svh flex-col bg-white px-[30px] pt-0">
      {/* App Header */}
      <div className="flex items-center  pt-[52px]">
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
          <path
            d="M21 14C21 10.13 17.87 7 14 7H12C8.13 7 5 10.13 5 14C5 17.87 8.13 21 12 21H14C17.87 21 21 17.87 21 14Z"
            fill="#a8d8ea"
          />
          <path
            d="M10 9C10 7.9 10.9 7 12 7H14C17.87 7 21 10.13 21 14C21 15.11 20.72 16.15 20.23 17H10V9Z"
            fill="#7cb5d9"
            opacity="0.5"
          />
          <circle cx="9" cy="10" r="4" fill="#d8f0fa" />
          <circle cx="7" cy="12" r="3" fill="#d8f0fa" />
        </svg>
        <span className="ml-2 text-[17px] font-black tracking-[-0.255px] text-[#2c2c2c]">
          Snap Cal
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <button type="button" className="flex size-[22px] items-center justify-center">
            <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
              <path
                d="M9 1C6.79 1 5 2.79 5 5V11L3 13V14H15V13L13 11V5C13 2.79 11.21 1 9 1Z"
                fill="#c0c0c0"
              />
              <path
                d="M7 15C7 16.1 7.9 17 9 17C10.1 17 11 16.1 11 15H7Z"
                fill="#c0c0c0"
              />
              <circle cx="14" cy="4" r="3" fill="#e05c5c" />
            </svg>
          </button>
          <button type="button" className="flex size-[22px] items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8" stroke="#c0c0c0" strokeWidth="1.6" />
              <circle cx="10" cy="10" r="3" fill="#c0c0c0" />
              <line x1="10" y1="2" x2="10" y2="4" stroke="#c0c0c0" strokeWidth="1.6" strokeLinecap="round" />
              <line x1="10" y1="16" x2="10" y2="18" stroke="#c0c0c0" strokeWidth="1.6" strokeLinecap="round" />
              <line x1="2" y1="10" x2="4" y2="10" stroke="#c0c0c0" strokeWidth="1.6" strokeLinecap="round" />
              <line x1="16" y1="10" x2="18" y2="10" stroke="#c0c0c0" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Month navigation */}
      <div className="flex items-center pt-3">
        <span className="text-[22px] font-black tracking-[-0.55px] text-[#2c2c2c]">
            {user?.name ? `${user.name}님의 ${currentMonth}월` : `${currentYear}년 ${currentMonth}월`}
          </span>
          
        {totalCount > 0 && (
          <span className="ml-3 text-[12px] font-bold text-[#7cb5d9]">{totalCount}장</span>
        )}
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={goToPrevMonth}
            className="flex size-[32px] items-center justify-center rounded-[16px] bg-[#f0f8ff]"
          >
            <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
              <path
                d="M6 1L1 6L6 11"
                stroke="#2c2c2c"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <span className="text-[13px] font-bold text-[#2c2c2c] pt-1">{currentYear}</span>

          <button
            type="button"
            onClick={goToNextMonth}
            className="flex size-[32px] items-center justify-center rounded-[16px] bg-[#f0f8ff]"
          >
            <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
              <path
                d="M1 1L6 6L1 11"
                stroke="#2c2c2c"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Category filter chips */}
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
        {FILTERS.map((f) => {
          const active = selectedCategory === f.value
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setCategory(f.value)}
              className="h-[36px] flex-shrink-0 rounded-[13px] px-4 text-[12px]"
              style={
                active
                  ? { backgroundColor: '#a8d8ea', color: '#2a4a57', fontWeight: 700 }
                  : {
                      backgroundColor: '#f0f8ff',
                      border: '1px solid #eef6fb',
                      color: '#4a4a4a',
                      fontWeight: 500,
                    }
              }
            >
              {f.label}
            </button>
          )
        })}
        <div className="w-[30px] flex-shrink-0" />
      </div>

      {/* Day-of-week labels */}
      <div className="mt-3 grid grid-cols-7 ">
        {DAY_LABELS.map((d, i) => (
          <div
            key={d}
            className="text-center text-[10px] font-bold"
            style={{ color: i === 0 ? '#e89baa' : i === 6 ? '#7cb5d9' : '#9e9e9e' }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="mt-2 flex-1  pb-[100px]">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center text-[13px] text-[#9e9e9e]">
            불러오는 중...
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="h-[100px]" />
              }
              const entry = getEntry(day)
              if (entry) {
                const [fromColor, toColor] =
                  CATEGORY_GRADIENT[entry.representativePhoto.category] ?? ['#e8e8e8', '#9e9e9e']
                return (
                  <button
                    key={day}
                    type="button"
                    className="relative h-[100px] w-full overflow-hidden rounded-[14px]"
                   onClick={() => setSelectedDay(day)}
    
                  >
                    <img
                      src={entry.representativePhoto.thumbnailUrl}
                      alt=""
                      className="absolute inset-0 size-full object-cover"
                    />
                    {/* 날짜 숫자 가독성용 상단 그라디언트 */}
                    <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-black/30 to-transparent" />
                    <span className="absolute left-[5px] top-[5px] text-[11px] font-bold text-white drop-shadow">
                      {day}
                    </span>
                    {/* 카테고리 컬러 도트 */}
                    <div
                      className="absolute bottom-[5px] right-[5px] size-[8px] rounded-full"
                      style={{ backgroundColor: entry.representativePhoto.categoryColor || fromColor }}
                    />
                  </button>
                )
              }
              return (
                <div
                  key={day}
                  className="h-[100px] w-full rounded-[14px] border border-dashed border-[#eef6fb] bg-[#f0f8ff]"
                >
                  <span className="block p-[5px] text-[11px] font-medium text-[#9e9e9e]">
                    {day}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Bottom navigation bar */}
      <div className="fixed bottom-0 left-1/2 w-full max-w-[390px] -translate-x-1/2 px-[14px] pb-6">
        <div className="flex h-[66px] items-center justify-between rounded-[22px] border border-[#e0f0f8] bg-white px-7 shadow-[0_2px_16px_rgba(168,216,234,0.18)]">
          {/* Calendar tab (active) */}
          <button type="button" className="flex flex-col items-center gap-[3px]">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <rect x="3" y="4" width="16" height="15" rx="3" stroke="#7cb5d9" strokeWidth="1.7" />
              <path
                d="M7 2V5M15 2V5"
                stroke="#7cb5d9"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
              <line x1="3" y1="8.5" x2="19" y2="8.5" stroke="#7cb5d9" strokeWidth="1.7" />
              <rect x="6" y="11" width="3" height="3" rx="0.7" fill="#7cb5d9" />
              <rect x="10" y="11" width="3" height="3" rx="0.7" fill="#7cb5d9" />
            </svg>
            <span className="text-[10px] font-bold text-[#7cb5d9]">캘린더</span>
          </button>

          {/* Upload (+) button */}
          <button
            type="button"
            onClick={() => navigate('/upload')}
            className="flex size-[46px] items-center justify-center rounded-full bg-[#a8d8ea] shadow-[0_4px_12px_rgba(168,216,234,0.5)]"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 4V16M4 10H16"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </button>

          {/* Gallery tab */}
          <button type="button" className="flex flex-col items-center gap-[3px]">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <rect x="3" y="3" width="7" height="7" rx="2" stroke="#b0b0b0" strokeWidth="1.6" />
              <rect x="12" y="3" width="7" height="7" rx="2" stroke="#b0b0b0" strokeWidth="1.6" />
              <rect x="3" y="12" width="7" height="7" rx="2" stroke="#b0b0b0" strokeWidth="1.6" />
              <rect x="12" y="12" width="7" height="7" rx="2" stroke="#b0b0b0" strokeWidth="1.6" />
            </svg>
            <span className="text-[10px] font-medium text-[#9e9e9e]">갤러리</span>
          </button>
        </div>
      </div>

     {selectedDay !== null && (
  <div className="fixed inset-0 z-40 flex justify-center">
    <div className="relative flex h-full w-full max-w-[390px] flex-col bg-black/60">
      {/* 헤더 */}
      <div className="flex items-center px-[30px] pt-[52px]">
        <span className="text-[22px] font-black text-white">
          {currentMonth}월 {selectedDay}일의 사진
        </span>
        <button
          type="button"
          onClick={() => setSelectedDay(null)}
          className="ml-auto flex size-[32px] items-center justify-center rounded-full bg-white/20"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 1L11 11M11 1L1 11" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <p className="mt-1 px-[30px] text-[12px] text-white/60">
        캘린더에 표시될 대표사진을 선택 할 수 있어요
      </p>

      {/* 사진 그리드 */}
      <div className="mt-4 flex-1 overflow-y-auto px-[30px]">
        <div className="grid grid-cols-3 gap-[6px]">
          <div className="flex h-[110px] items-center justify-center rounded-[14px] border-2 border-dashed border-white/30">
            <span className="text-[10px] text-white/50">사진 없음</span>
          </div>
        </div>
      </div>

      {/* 저장 버튼 */}
      <div className="px-[30px] pb-10 pt-4">
        <button
          type="button"
          onClick={() => setSelectedDay(null)}
          className="h-[54px] w-full rounded-[27px] bg-[#a8d8ea] text-[15px] font-bold text-[#2a4a57]"
        >
          대표사진 저장
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  )
}
