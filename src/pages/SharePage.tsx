import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AppBar from '../components/common/AppBar'
import { getCalendar } from '../api/calendar'
import type { CalendarDateEntry, PhotoCategory } from '../types'
import { CATEGORY_GRADIENT } from '../constants/categories'

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

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']
const DAY_COLORS = ['#e89baa', '#b0b0b0', '#b0b0b0', '#b0b0b0', '#b0b0b0', '#b0b0b0', '#7cb5d9']

const RATIO_EXPORT: Record<Ratio, { w: number; h: number }> = {
  '1:1':  { w: 1080, h: 1080 },
  '4:5':  { w: 1080, h: 1350 },
  '9:16': { w: 1080, h: 1920 },
}

// ── Canvas에 캘린더 그리기 ────────────────────────────────────
// imageCache를 외부에서 전달받아 캐시에 없는 이미지만 로드
async function drawCalendar(
  canvas: HTMLCanvasElement,
  params: {
    year: number
    month: number
    cells: (number | null)[]
    calendarData: Record<string, CalendarDateEntry>
    width: number
    height: number
    imageCache: Map<string, HTMLImageElement>
  }
) {
  const { year, month, cells, calendarData, width, height, imageCache } = params
  const ctx = canvas.getContext('2d')!
  canvas.width  = width
  canvas.height = height

  const s = width / 1080

  const PAD   = 48 * s
  const innerW = width - PAD * 2

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)

  const headerY = 52 * s
  ctx.fillStyle = '#2c2c2c'
  ctx.font = `900 ${28 * s}px -apple-system, sans-serif`
  ctx.fillText(`${year}년 ${month}월`, PAD + 22 * s, headerY)

  const dayLabelY = headerY + 44 * s
  const colW = innerW / 7
  ctx.font = `700 ${18 * s}px -apple-system, sans-serif`
  ctx.textAlign = 'center'
  DAY_LABELS.forEach((d, i) => {
    ctx.fillStyle = DAY_COLORS[i]
    ctx.fillText(d, PAD + colW * i + colW / 2, dayLabelY)
  })

  const gridTop  = dayLabelY + 20 * s
  const gridH    = height - gridTop - PAD
  const rows     = cells.length / 7
  const cellH    = gridH / rows
  const cellGap  = 6 * s
  const radius   = 14 * s

  // 캐시에 없는 URL만 로드
  const imageKeys = cells
    .filter((day): day is number => day !== null)
    .map(day => {
      const key = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      return calendarData[key]?.representativePhoto?.thumbnailUrl
    })
    .filter((url): url is string => Boolean(url) && !imageCache.has(url))

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

    ctx.save()
    roundRect(ctx, x, y, w, h, radius)
    ctx.fillStyle = entry
      ? ((CATEGORY_GRADIENT[entry.representativePhoto.category]?.[0] ?? '#e8e8e8'))
      : '#f0f8ff'
    ctx.fill()

    if (entry) {
      const img = imageCache.get(entry.representativePhoto.thumbnailUrl)
      if (img) {
        ctx.clip()
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

      const grad = ctx.createLinearGradient(x, y, x, y + h * 0.45)
      grad.addColorStop(0, 'rgba(0,0,0,0.28)')
      grad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = grad
      ctx.fillRect(x, y, w, h)

      ctx.fillStyle = 'white'
      ctx.font = `700 ${16 * s}px -apple-system, sans-serif`
      ctx.textAlign = 'left'
      ctx.shadowColor = 'rgba(0,0,0,0.4)'
      ctx.shadowBlur  = 4 * s
      ctx.fillText(String(day), x + 6 * s, y + 18 * s)
      ctx.shadowBlur = 0

      const dotColor = (CATEGORY_GRADIENT[entry.representativePhoto.category]?.[0] ?? '#e8e8e8')
      ctx.beginPath()
      ctx.arc(x + w - 8 * s, y + h - 8 * s, 5 * s, 0, Math.PI * 2)
      ctx.fillStyle = dotColor
      ctx.fill()
    } else {
      ctx.restore()
      ctx.save()
      roundRect(ctx, x, y, w, h, radius)
      ctx.clip()
      ctx.strokeStyle = '#ddeef8'
      ctx.lineWidth = 2 * s
      ctx.setLineDash([4 * s, 4 * s])
      ctx.strokeRect(x + 1, y + 1, w - 2, h - 2)
      ctx.setLineDash([])

      ctx.fillStyle = '#b0c8d8'
      ctx.font = `500 ${16 * s}px -apple-system, sans-serif`
      ctx.textAlign = 'left'
      ctx.fillText(String(day), x + 6 * s, y + 18 * s)
    }

    ctx.restore()
  })
}

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
  const [showSuccess, setShowSuccess]     = useState(false)

  // 1. 이미지 캐시 — 컴포넌트 생명주기 동안 유지
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map())
  // 이미지 로드 완료 수 — 변경 시 캔버스 재드로우 트리거
  const [loadedCount, setLoadedCount] = useState(0)

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

  // 2. calendarData 변경 시 이미지 프리로드 — 캔버스 그리기 전에 미리 받아둠
  useEffect(() => {
    const urls = [
      ...new Set(
        Object.values(calendarData)
          .map(e => e.representativePhoto?.thumbnailUrl)
          .filter((u): u is string => Boolean(u))
      ),
    ]
    let mounted = true
    for (const url of urls) {
      if (imageCacheRef.current.has(url)) continue
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        imageCacheRef.current.set(url, img)
        if (mounted) setLoadedCount(c => c + 1)
      }
      img.onerror = () => { if (mounted) setLoadedCount(c => c + 1) }
      img.src = url
    }
    return () => { mounted = false }
  }, [calendarData])

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

  // 3. 미리보기 캔버스 — devicePixelRatio 적용(최대 2x)으로 선명하게, 캐시 전달
  useEffect(() => {
    if (!previewCanvasRef.current || !previewWrapRef.current) return
    const dpr   = Math.min(window.devicePixelRatio ?? 1, 2)
    const cssW  = previewWrapRef.current.offsetWidth
    const [rW, rH] = RATIO_ASPECT[selectedRatio]
    const cssH  = Math.round(cssW * rH / rW)

    const canvas = previewCanvasRef.current
    canvas.style.width  = `${cssW}px`
    canvas.style.height = `${cssH}px`

    drawCalendar(canvas, {
      year, month, cells, calendarData,
      width:  Math.round(cssW * dpr),
      height: Math.round(cssH * dpr),
      imageCache: imageCacheRef.current,
    })
  }, [calendarData, selectedRatio, cells, month, year, loadedCount])

  // 저장 — 캐시 재사용으로 이미지 재다운로드 없음
  const handleSave = async () => {
    setIsSaving(true)
    try {
      const { w, h } = RATIO_EXPORT[selectedRatio]
      const exportCanvas = document.createElement('canvas')
      await drawCalendar(exportCanvas, {
        year, month, cells, calendarData,
        width: w,
        height: h,
        imageCache: imageCacheRef.current,
      })
      const dataUrl = exportCanvas.toDataURL('image/jpeg', 0.95)
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `snapcal-${year}-${String(month).padStart(2, '0')}.jpg`
      a.click()
      setShowSuccess(true)
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

      {/* 저장 성공 모달 */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
          <div className="w-full max-w-[390px] rounded-t-[24px] bg-white px-[24px] pb-10 pt-6">
            <div className="mb-5 flex justify-center">
              <div className="flex size-[64px] items-center justify-center rounded-full bg-[#d8f0fa]">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M6 16L13 23L26 9" stroke="#7cb5d9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <p className="text-center text-[18px] font-black text-[#2c2c2c]">저장 완료!</p>
            <p className="mt-1 text-center text-[13px] text-[#9e9e9e]">캘린더 이미지가 갤러리에 저장되었어요</p>
            <button
              type="button"
              onClick={() => navigate('/calendar')}
              className="mt-6 h-[54px] w-full rounded-[27px] bg-[#a8d8ea] text-[15px] font-bold text-[#2a4a57]"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
