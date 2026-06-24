import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppBar from '../components/common/AppBar'
import { useCalendarStore } from '../stores/calendarStore'
import type { PhotoCategory } from '../types'

const FILTERS: { label: string; value: PhotoCategory | 'all' }[] = [
  { label: '전체', value: 'all' },
  { label: '음식', value: '음식' },
  { label: '패션', value: '패션' },
  { label: '운동', value: '운동' },
  { label: '풍경', value: '풍경' },
  { label: '일상', value: '일상' },
]

export default function ShareSelectPage() {
  const navigate = useNavigate()
  const { currentYear, currentMonth, selectedCategory } = useCalendarStore()

  const [year, setYear] = useState(currentYear)
  const [month, setMonth] = useState(currentMonth)
  const [category, setCategory] = useState<PhotoCategory | 'all'>(selectedCategory)

  const goPrev = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }

  const goNext = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }

  const handleNext = () => {
    const params = new URLSearchParams({ year: String(year), month: String(month), category })
    navigate(`/share?${params.toString()}`)
  }

  return (
    <div className="flex min-h-svh flex-col bg-white">
      <div className="pt-[44px]">
        <AppBar title="캘린더 내보내기" onBack={() => navigate('/calendar')} />
      </div>

      <div className="flex flex-1 flex-col px-5 pt-6">
        {/* Month selector */}
        <p className="mb-3 text-[14px] font-bold text-[#2c2c2c]">월 선택</p>
        <div className="flex items-center justify-between rounded-[16px] bg-[#f0f8ff] px-5 py-4">
          <button
            type="button"
            onClick={goPrev}
            className="flex size-[36px] items-center justify-center rounded-full bg-white shadow-sm"
          >
            <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
              <path d="M6 1L1 6L6 11" stroke="#2c2c2c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <span className="text-[18px] font-black tracking-[-0.4px] text-[#2c2c2c]">
            {year}년 {month}월
          </span>

          <button
            type="button"
            onClick={goNext}
            className="flex size-[36px] items-center justify-center rounded-full bg-white shadow-sm"
          >
            <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
              <path d="M1 1L6 6L1 11" stroke="#2c2c2c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Category selector */}
        <p className="mb-3 mt-8 text-[14px] font-bold text-[#2c2c2c]">카테고리 선택</p>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const active = category === f.value
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => setCategory(f.value)}
                className="h-[38px] rounded-[13px] px-5 text-[13px] transition-colors"
                style={
                  active
                    ? { backgroundColor: '#a8d8ea', color: '#2a4a57', fontWeight: 700 }
                    : { backgroundColor: '#f0f8ff', border: '1px solid #e0eef8', color: '#4a4a4a', fontWeight: 500 }
                }
              >
                {f.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Next button */}
      <div className="px-5 pb-10 pt-4">
        <button
          type="button"
          onClick={handleNext}
          className="h-[54px] w-full rounded-[27px] bg-[#a8d8ea] text-[15px] font-bold text-[#2a4a57]"
        >
          다음
        </button>
      </div>
    </div>
  )
}
