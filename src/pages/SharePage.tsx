import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
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

const CATEGORY_GRADIENT: Record<string, string> = {
  음식:   '#fae4d4',
  패션:   '#f2d4db',
  운동:   '#c8f0df',
  풍경:   '#bfe3f5',
  일상:   '#e8e1d2',
  미분류: '#e8e8e8',
}

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']
const DAY_COLORS = ['#e89baa', '#b0b0b0', '#b0b0b0', '#b0b0b0', '#b0b0b0', '#b0b0b0', '#7cb5d9']

const RATIO_EXPORT: Record<Ratio, { w: number; h: number }> = {
  '1:1':  { w: 1080, h: 1080 },
  '4:5':  { w: 1080, h: 1350 },
  '9:16': { w: 1080, h: 1920 },
}

// ── Canvas에 캘린더 그리기 ────────────────────────────────────
async function drawCalendar(
  canvas: HTMLCanvasElement,
  params: {
    year: number
    month: number
    cells: (number | null)[]
    calendarData: Record<string, CalendarDateEntry>
    width: number
    height: number
  }
) {
  const { year, month, cells, calendarData, width, height } = params
  const ctx = canvas.getContext('2d')!
  canvas.width  = width
  canvas.height = height

  const s = width / 1080  // 스케일 기준

  const PAD   = 48 * s
  const innerW = width - PAD * 2

  // ── 배경 ──
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)

  // ── 헤더 텍스트 ──
  const headerY = 52 * s
  ctx.fillStyle = '#2c2c2c'
  ctx.font = `900 ${28 * s}px -apple-system, sans-serif`
  ctx.fillText(`${year}년 ${month}월`, PAD + 22 * s, headerY)

  // ── 요일 레이블 ──
  const dayLabelY = headerY + 44 * s
  const colW = innerW / 7
  ctx.font = `700 ${18 * s}px -apple-system, sans-serif`
  ctx.textAlign = 'center'
  DAY_LABELS.forEach((d, i) => {
    ctx.fillStyle = DAY_COLORS[i]
    ctx.fillText(d, PAD + colW * i + colW / 2, dayLabelY)
  })

  // ── 날짜 그리드 ──
  const gridTop  = dayLabelY + 20 * s
  const gridH    = height - gridTop - PAD
  const rows     = cells.length / 7
  const cellH    = gridH / rows
  const cellGap  = 6 * s
  const radius   = 14 * s

  // 썸네일 이미지 미리 로드
  const imageCache = new Map<string, HTMLImageElement>()
  const imageKeys = cells
    .filter((day): day is number => day !== null)
    .map(day => {
      const key = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      return calendarData[key]?.representativePhoto?.thumbnailUrl
    })
    .filter(Boolean) as string[]

  await Promise.all(
    [...new Set(imageKeys)].map(url =>
      new Promise<void>(resolve => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload  = () => { imageCache.set(url, img); resolve() }
        img.onerror = () => resolve()
        img.src = url
      })
    )
  )

  // 셀 그리기
  cells.forEach((day, idx) => {
    const col = idx % 7
    const row = Math.floor(idx / 7)
    const x = PAD + col * colW + cellGap / 2
    const y = gridTop + row * cellH + cellGap / 2
    const w = colW - cellGap
    const h = cellH - cellGap

    if (day === null) return

    const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const entry   = calendarData[dateKey]

    // 셀 배경
    ctx.save()
    roundRect(ctx, x, y, w, h, radius)
    ctx.fillStyle = entry
      ? (CATEGORY_GRADIENT[entry.representativePhoto.category] ?? '#e8e8e8')
      : '#f0f8ff'
    ctx.fill()

    if (entry) {
      // 썸네일 이미지
      const img = imageCache.get(entry.representativePhoto.thumbnailUrl)
      if (img) {
        ctx.clip()
        // object-cover: 비율 유지하며 셀 채우기
        const imgRatio = img.naturalWidth / img.naturalHeight
        const cellRatio = w / h
        let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight
        if (imgRatio > cellRatio) {
          sw = img.naturalHeight * cellRatio
          sx = (img.naturalWidth - sw) / 2
        } else {
          sh = img.naturalWidth / cellRatio
          sy = (img.naturalHeight - sh) / 2
        }
        ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h)
      }

      // 상단 그라디언트 오버레이
      const grad = ctx.createLinearGradient(x, y, x, y + h * 0.45)
      grad.addColorStop(0, 'rgba(0,0,0,0.28)')
      grad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = grad
      ctx.fillRect(x, y, w, h)

      // 날짜 숫자
      ctx.fillStyle = 'white'
      ctx.font = `700 ${16 * s}px -apple-system, sans-serif`
      ctx.textAlign = 'left'
      ctx.shadowColor = 'rgba(0,0,0,0.4)'
      ctx.shadowBlur  = 4 * s
      ctx.fillText(String(day), x + 6 * s, y + 18 * s)
      ctx.shadowBlur = 0

      // 카테고리 점
      const dotColor = CATEGORY_GRADIENT[entry.representativePhoto.category] ?? '#e8e8e8'
      ctx.beginPath()
      ctx.arc(x + w - 8 * s, y + h - 8 * s, 5 * s, 0, Math.PI * 2)
      ctx.fillStyle = dotColor
      ctx.fill()
    } else {
      // 빈 날 — 점선 테두리
      ctx.restore()
      ctx.save()
      roundRect(ctx, x, y, w, h, radius)
      ctx.clip()
      ctx.strokeStyle = '#ddeef8'
      ctx.lineWidth = 2 * s
      ctx.setLineDash([4 * s, 4 * s])
      ctx.strokeRect(x + 1, y + 1, w - 2, h - 2)
      ctx.setLineDash([])

      // 날짜 숫자
      ctx.fillStyle = '#b0c8d8'
      ctx.font = `500 ${16 * s}px -apple-system, sans-serif`
      ctx.textAlign = 'left'
      ctx.fillText(String(day), x + 6 * s, y + 18 * s)
    }

    ctx.restore()
  })
}

// ── 둥근 사각형 path 헬퍼 ──
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

// ── 메인 페이지 ────────────────────────────────────────────────
export default function SharePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const year     = Number(searchParams.get('year'))  || new Date().getFullYear()
  const month    = Number(searchParams.get('month')) || new Date().getMonth() + 1
  const category = (searchParams.get('category') ?? 'all') as PhotoCategory | 'all'

  const [calendarData, setCalendarData] = useState<Record<string, CalendarDateEntry>>({})
  const [selectedRatio, setSelectedRatio] = useState<Ratio>('1:1')
  const [isSaving, setIsSaving]           = useState(false)

  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const previewWrapRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cat = category === 'all' ? undefined : category
    getCalendar(year, month, cat).then(({ data }) => {
      const map = (data.days ?? []).reduce((acc, day) => {
        const photos = cat ? day.photos.filter((p) => p.category === cat) : day.photos
        if (photos.length > 0) {
          const catRep = cat && day.categoryRepresentatives?.[cat]
          acc[day.date] = {
            count: photos.length,
            representativePhoto: catRep
              ? { ...photos[0], ...catRep }
              : (day.representativePhoto ?? photos[0]),
          }
        }
        return acc
      }, {} as Record<string, CalendarDateEntry>)
      setCalendarData(map)
    })
  }, [year, month, category])

  const cells = useMemo<(number | null)[]>(() => {
    const firstDay    = new Date(year, month - 1, 1).getDay()
    const daysInMonth = new Date(year, month, 0).getDate()
    const result: (number | null)[] = [
      ...Array(firstDay).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ]
    while (result.length % 7 !== 0) result.push(null)
    return result
  }, [year, month])

  // 미리보기 canvas 그리기
  useEffect(() => {
    if (!previewCanvasRef.current || !previewWrapRef.current) return
    const wrapW = previewWrapRef.current.offsetWidth
    const [rW, rH] = RATIO_ASPECT[selectedRatio]
    const previewH = Math.round(wrapW * rH / rW)
    drawCalendar(previewCanvasRef.current, {
      year, month, cells, calendarData,
      width: wrapW,
      height: previewH,
    })
  }, [calendarData, selectedRatio, cells, month, year])

  // 저장
  const handleSave = async () => {
    setIsSaving(true)
    try {
      const { w, h } = RATIO_EXPORT[selectedRatio]
      const exportCanvas = document.createElement('canvas')
      await drawCalendar(exportCanvas, {
        year, month, cells, calendarData,
        width: w,
        height: h,
      })
      const dataUrl = exportCanvas.toDataURL('image/jpeg', 0.95)
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `snapcal-${year}-${String(month).padStart(2, '0')}.jpg`
      a.click()
    } finally {
      setIsSaving(false)
    }
  }

  const [rW, rH] = RATIO_ASPECT[selectedRatio]

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

      {/* 미리보기 */}
      <div ref={previewWrapRef} className="flex flex-1 flex-col items-center px-5 pt-5">
        <canvas
          ref={previewCanvasRef}
          className="w-full rounded-[20px] shadow-[0_4px_24px_rgba(124,181,217,0.18)] transition-all duration-300"
          style={{ aspectRatio: `${rW} / ${rH}` }}
        />
      </div>

      {/* 비율 선택 */}
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
                style={active
                  ? { backgroundColor: '#a8d8ea' }
                  : { backgroundColor: '#f0f8ff', border: '1.5px solid #ddeef8' }}
              >
                <div
                  className="rounded-[3px] transition-all duration-200"
                  style={{ width: box.w, height: box.h, backgroundColor: active ? 'white' : '#a8d8ea' }}
                />
                <span className="text-[12px] font-bold" style={{ color: active ? '#2a4a57' : '#7cb5d9' }}>
                  {r}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 저장 버튼 */}
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