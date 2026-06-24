import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import html2canvas from 'html2canvas'
import AppBar from '../components/common/AppBar'
import { getCalendar } from '../api/calendar'
import type { CalendarDateEntry, PhotoCategory } from '../types'

type Ratio = '1:1' | '4:5' | '9:16'

const RATIO_ASPECT: Record<Ratio, [number, number]> = {
  '1:1': [1, 1],
  '4:5': [4, 5],
  '9:16': [9, 16],
}

const RATIO_BOX: Record<Ratio, { w: number; h: number }> = {
  '1:1':  { w: 30, h: 30 },
  '4:5':  { w: 24, h: 30 },
  '9:16': { w: 17, h: 30 },
}

const CATEGORY_GRADIENT: Record<string, [string, string]> = {
  음식:   ['#fae4d4', '#b07f5e'],
  패션:   ['#f2d4db', '#a56b7c'],
  운동:   ['#c8f0df', '#3a8f6b'],
  풍경:   ['#bfe3f5', '#3f7da7'],
  일상:   ['#e8e1d2', '#86755a'],
  미분류: ['#e8e8e8', '#9e9e9e'],
}

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

// 비율별 캡처 기준 너비 (px) — 고해상도 저장용
const RATIO_EXPORT_SIZE: Record<Ratio, { width: number; height: number }> = {
  '1:1':  { width: 1080, height: 1080 },
  '4:5':  { width: 1080, height: 1350 },
  '9:16': { width: 1080, height: 1920 },
}

export default function SharePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const year     = Number(searchParams.get('year'))  || new Date().getFullYear()
  const month    = Number(searchParams.get('month')) || new Date().getMonth() + 1
  const category = (searchParams.get('category') ?? 'all') as PhotoCategory | 'all'

  const [calendarData, setCalendarData] = useState<Record<string, CalendarDateEntry>>({})
  const [selectedRatio, setSelectedRatio] = useState<Ratio>('1:1')
  const [isSaving, setIsSaving] = useState(false)

  // 캘린더 카드 ref
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cat = category === 'all' ? undefined : category
    getCalendar(year, month, cat).then(({ data }) => {
      const map = (data.days ?? []).reduce((acc, day) => {
        if (day.photos.length > 0) {
          acc[day.date] = { count: day.photos.length, representativePhoto: day.photos[0] }
        }
        return acc
      }, {} as Record<string, CalendarDateEntry>)
      setCalendarData(map)
    })
  }, [year, month, category])

  const firstDay    = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const getEntry = (day: number) => {
    const key = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return calendarData[key] ?? null
  }

  const [rW, rH] = RATIO_ASPECT[selectedRatio]

  const handleSave = async () => {
    if (!cardRef.current) return
    setIsSaving(true)

    try {
      const { width, height } = RATIO_EXPORT_SIZE[selectedRatio]

      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,         // 외부 이미지(thumbnailUrl) CORS 허용
        allowTaint: false,
        scale: width / cardRef.current.offsetWidth,  // 고해상도 스케일
        width:  cardRef.current.offsetWidth,
        height: cardRef.current.offsetHeight,
        windowWidth:  cardRef.current.offsetWidth,
        windowHeight: cardRef.current.offsetHeight,
        backgroundColor: '#ffffff',
        imageTimeout: 15000,
      })

      // 비율에 맞게 최종 리사이즈 (캡처된 canvas가 정확한 px이 아닐 수 있으므로)
      const finalCanvas = document.createElement('canvas')
      finalCanvas.width  = width
      finalCanvas.height = height
      const ctx = finalCanvas.getContext('2d')!
      ctx.drawImage(canvas, 0, 0, width, height)

      finalCanvas.toBlob(
        (blob) => {
          if (!blob) return
          const url = URL.createObjectURL(blob)
          const a   = document.createElement('a')
          a.href     = url
          a.download = `snapcal-${year}-${String(month).padStart(2, '0')}.jpg`
          a.click()
          URL.revokeObjectURL(url)
        },
        'image/jpeg',
        0.95,  // 품질 95%
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex min-h-svh flex-col bg-[#f7fbff]">
      <div className="bg-white pt-[44px]">
        <AppBar title="캘린더 내보내기" onBack={() => navigate('/share/select')} />
        <div className="flex items-center gap-2 px-5 pb-3">
          <span className="text-[15px] font-black text-[#2c2c2c]">{year}년 {month}월</span>
          {category !== 'all' && (
            <span className="rounded-full bg-[#d8f0fa] px-3 py-[2px] text-[11px] font-bold text-[#7cb5d9]">
              {category}
            </span>
          )}
        </div>
      </div>

      {/* 캘린더 카드 — ref 연결 */}
      <div className="flex flex-1 flex-col items-center px-5 pt-5">
        <div
          ref={cardRef}  
          className="w-full overflow-hidden rounded-[20px] bg-white shadow-[0_4px_24px_rgba(124,181,217,0.18)] transition-all duration-300"
          style={{ aspectRatio: `${rW} / ${rH}` }}
        >
          <div className="flex h-full flex-col px-[14px] py-[12px]">
            {/* Header */}
            <div className="mb-[6px] flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 26 26" fill="none">
                <path d="M21 14C21 10.13 17.87 7 14 7H12C8.13 7 5 10.13 5 14C5 17.87 8.13 21 12 21H14C17.87 21 21 17.87 21 14Z" fill="#a8d8ea" />
                <path d="M10 9C10 7.9 10.9 7 12 7H14C17.87 7 21 10.13 21 14C21 15.11 20.72 16.15 20.23 17H10V9Z" fill="#7cb5d9" opacity="0.5" />
                <circle cx="9" cy="10" r="4" fill="#d8f0fa" />
                <circle cx="7" cy="12" r="3" fill="#d8f0fa" />
              </svg>
              <span className="text-[13px] font-black tracking-[-0.3px] text-[#2c2c2c]">
                {year}년 {month}월
              </span>
            </div>

            {/* Day labels */}
            <div className="mb-[4px] grid grid-cols-7">
              {DAY_LABELS.map((d, i) => (
                <div
                  key={d}
                  className="text-center text-[9px] font-bold"
                  style={{ color: i === 0 ? '#e89baa' : i === 6 ? '#7cb5d9' : '#b0b0b0' }}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid flex-1 grid-cols-7 gap-[3px]" style={{ gridAutoRows: '1fr' }}>
              {cells.map((day, idx) => {
                if (day === null) return <div key={`e-${idx}`} />
                const entry = getEntry(day)
                if (entry) {
                  const [fromColor] =
                    CATEGORY_GRADIENT[entry.representativePhoto.category] ?? ['#e8e8e8', '#9e9e9e']
                  return (
                    <div
                      key={day}
                      className="relative overflow-hidden rounded-[8px]"
                      style={{ backgroundColor: fromColor }}
                    >
                      <img
                        src={entry.representativePhoto.thumbnailUrl}
                        alt=""
                        className="absolute inset-0 size-full object-cover"
                        crossOrigin="anonymous"  
                      />
                      <div className="absolute inset-x-0 top-0 h-5 bg-gradient-to-b from-black/30 to-transparent" />
                      <span className="absolute left-[3px] top-[2px] text-[8px] font-bold text-white drop-shadow">
                        {day}
                      </span>
                      <div
                        className="absolute bottom-[3px] right-[3px] size-[5px] rounded-full"
                        style={{ backgroundColor: entry.representativePhoto.categoryColor || fromColor }}
                      />
                    </div>
                  )
                }
                
                return (
                  <div
                    key={day}
                    className="rounded-[8px] border border-dashed border-[#ddeef8] bg-[#f0f8ff]"
                  >
                    <span className="block p-[3px] text-[8px] font-medium text-[#b0c8d8]">{day}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

         {/* Ratio selector */}
      <div className="px-5 pt-5">
        <p className="mb-3 text-[13px] font-bold text-[#2c2c2c]">비율 선택</p>
        <div className="flex gap-2">
          {(['1:1', '4:5', '9:16'] as Ratio[]).map((r) => {
            const active = selectedRatio === r
            const box = RATIO_BOX[r]
            return (
              <button
                key={r}
                type="button"
                onClick={() => setSelectedRatio(r)}
                className="flex flex-1 flex-col items-center justify-center gap-2 rounded-[14px] py-3 transition-all duration-200"
                style={
                  active
                    ? { backgroundColor: '#a8d8ea' }
                    : { backgroundColor: '#f0f8ff', border: '1.5px solid #ddeef8' }
                }
              >
                <div
                  className="rounded-[3px] transition-all duration-200"
                  style={{
                    width: box.w,
                    height: box.h,
                    backgroundColor: active ? 'white' : '#a8d8ea',
                  }}
                />
                <span className="text-[12px] font-bold" style={{ color: active ? '#2a4a57' : '#7cb5d9' }}>
                  {r}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Save button */}
      <div className="px-5 pb-10 pt-5">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="h-[54px] w-full rounded-[27px] bg-[#a8d8ea] text-[15px] font-bold text-[#2a4a57] disabled:opacity-50"
        >
          {isSaving ? '저장 중...' : '사진 저장'}
        </button>
      </div>
    </div>
  )
}