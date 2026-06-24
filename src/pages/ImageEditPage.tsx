import { useRef, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import html2canvas from 'html2canvas'
import AppBar from '../components/common/AppBar'
import { updatePhotoImage } from '../api/photos'

// ─── 타입 ─────────────────────────────────────────────────────
interface TextLayer {
  id: number
  text: string
  x: number
  y: number
  color: string
  fontSize: number
  dragging: boolean
  offsetX: number
  offsetY: number
}

type FilterKey = '원본' | '밝게' | '따뜻하게' | '흑백' | '빈티지'

const CATEGORY_COLORS: Record<string, string> = {
  음식: '#FAC775',
  패션: '#F4C0D1',
  운동: '#9FE1CB',
  풍경: '#B5D4F4',
  일상: '#D3D1C7',
  미분류: '#E8E8E8',
}

interface PhotoState {
  originalUrl: string
  thumbnailUrl: string | null
  takenAt: string
  category: string
}

// ─── 필터 정의 ────────────────────────────────────────────────
const FILTERS: Record<FilterKey, string> = {
  '원본':    'none',
  '밝게':    'brightness(1.3) contrast(0.95)',
  '따뜻하게': 'brightness(1.05) saturate(1.3) sepia(0.25)',
  '흑백':    'grayscale(1)',
  '빈티지':  'sepia(0.5) contrast(0.9) brightness(0.95) saturate(0.85)',
}

// Canvas용 픽셀 필터 (저장 시 적용)
function applyCanvasFilter(
  src: HTMLCanvasElement,
  filter: FilterKey,
): HTMLCanvasElement {
  const dst = document.createElement('canvas')
  dst.width  = src.width
  dst.height = src.height
  const ctx = dst.getContext('2d')!
  ctx.drawImage(src, 0, 0)

  if (filter === '원본') return dst

  const imgData = ctx.getImageData(0, 0, dst.width, dst.height)
  const d = imgData.data

  for (let i = 0; i < d.length; i += 4) {
    let r = d[i], g = d[i + 1], b = d[i + 2]

    if (filter === '밝게') {
      r = Math.min(255, r * 1.3)
      g = Math.min(255, g * 1.3)
      b = Math.min(255, b * 1.3)
    } else if (filter === '따뜻하게') {
      r = Math.min(255, r * 1.1)
      b = Math.max(0,   b * 0.85)
    } else if (filter === '흑백') {
      const gray = 0.299 * r + 0.587 * g + 0.114 * b
      r = g = b = gray
    } else if (filter === '빈티지') {
      r = Math.min(255, r * 0.9 + 20)
      g = Math.min(255, g * 0.85 + 10)
      b = Math.max(0,   b * 0.7)
    }
    d[i] = r; d[i + 1] = g; d[i + 2] = b
  }
  ctx.putImageData(imgData, 0, 0)
  return dst
}

// ─── 컴포넌트 ─────────────────────────────────────────────────
export default function ImageEditPage() {
  const { photoId } = useParams<{ photoId: string }>()
  const navigate    = useNavigate()
  const location    = useLocation()
  const photo       = (location.state as PhotoState | null)
  const [activeTab,      setActiveTab]      = useState<'텍스트' | '필터'>('텍스트')
  const [textLayers,     setTextLayers]     = useState<TextLayer[]>([])
  const [activeTextId,   setActiveTextId]   = useState<number | null>(null)
  const [editingText,    setEditingText]    = useState<string>('')
  const [isTyping,       setIsTyping]       = useState(false)
  // null = 새 텍스트 추가 중, number = 기존 텍스트 편집 중
  const [editingId,      setEditingId]      = useState<number | null>(null)
  const [selectedColor,  setSelectedColor]  = useState('#ffffff')
  const [selectedFilter, setSelectedFilter] = useState<FilterKey>('원본')
  const [isSaving,       setIsSaving]       = useState(false)
  const [showUploadSheet, setShowUploadSheet] = useState(false)
  const [uploadDone,     setUploadDone]     = useState(false)
  const [imgAspect,      setImgAspect]      = useState<string>('3 / 4')

  const cardRef  = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const nextId   = useRef(1)

  const TEXT_COLORS = ['#ffffff', '#1a1a1a', '#4a90d9', '#e89baa', '#f5c842']

  const imageUrl = photo?.originalUrl ?? photo?.thumbnailUrl ?? null

  // 현재 선택된 텍스트의 색상 (선택된 게 있으면 그 색, 없으면 기본 selectedColor)
  const activeTextColor = selectedColor

  // ── 색상 변경: 선택된 텍스트가 있으면 그 텍스트 색상도 같이 변경 ──
  const handleColorChange = (color: string) => {
    setSelectedColor(color)
    if (activeTextId !== null) {
      setTextLayers(prev =>
        prev.map(t => t.id === activeTextId ? { ...t, color } : t)
      )
    }
  }

  // ── 텍스트 추가 버튼 ──
  const handleAddTextClick = () => {
    setEditingText('')
    setEditingId(null)
    setIsTyping(true)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  // ── 기존 텍스트 클릭 시 편집 모드 진입 ──
  const handleTextEdit = (t: TextLayer) => {
    setActiveTextId(t.id)
    setEditingId(t.id)
    setEditingText(t.text)
    setSelectedColor(t.color)
    setIsTyping(true)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  // ── 텍스트 확인 ──
  const handleTextConfirm = () => {
    if (!editingText.trim()) {
      setIsTyping(false)
      setEditingId(null)
      return
    }
    if (editingId !== null) {
      // 기존 텍스트 수정
      setTextLayers(prev =>
        prev.map(t => t.id === editingId ? { ...t, text: editingText.trim(), color: selectedColor } : t)
      )
    } else {
      // 새 텍스트 추가
      setTextLayers(prev => [...prev, {
        id: nextId.current++,
        text: editingText.trim(),
        x: 10, y: 10,
        color: selectedColor,
        fontSize: 20,
        dragging: false,
        offsetX: 0,
        offsetY: 0,
      }])
    }
    setEditingText('')
    setEditingId(null)
    setIsTyping(false)
  }

  // ── 드래그 ──
  const startDrag = (e: React.PointerEvent, id: number) => {
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    const rect = cardRef.current!.getBoundingClientRect()
    setActiveTextId(id)
    setTextLayers(prev => prev.map(t =>
      t.id === id
        ? { ...t, dragging: true,
            offsetX: e.clientX - rect.left - (t.x / 100) * rect.width,
            offsetY: e.clientY - rect.top  - (t.y / 100) * rect.height }
        : t
    ))
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const rect = cardRef.current!.getBoundingClientRect()
    setTextLayers(prev => prev.map(t => {
      if (!t.dragging) return t
      const x = ((e.clientX - rect.left - t.offsetX) / rect.width)  * 100
      const y = ((e.clientY - rect.top  - t.offsetY) / rect.height) * 100
      return { ...t, x: Math.max(0, Math.min(90, x)), y: Math.max(0, Math.min(90, y)) }
    }))
  }

  const stopDrag = () =>
    setTextLayers(prev => prev.map(t => ({ ...t, dragging: false })))

  const deleteText = (id: number) => {
    setTextLayers(prev => prev.filter(t => t.id !== id))
    if (activeTextId === id) setActiveTextId(null)
  }

  // ── 저장 공통 로직 ──
  const captureCanvas = async () => {
    if (!cardRef.current) return null
    setActiveTextId(null)
    await new Promise(r => setTimeout(r, 50))

    const cardW = cardRef.current.offsetWidth
    const cardH = cardRef.current.offsetHeight
    const EXPORT_W = 1080
    const scale = EXPORT_W / cardW

    const raw = await html2canvas(cardRef.current, {
      useCORS: true,
      allowTaint: false,
      scale,
      width: cardW,
      height: cardH,
      backgroundColor: '#000000',
      imageTimeout: 15000,
    })
    return applyCanvasFilter(raw, selectedFilter)
  }

  // ── 기기에 저장 ──
  const handleSave = async () => {
    setIsSaving(true)
    try {
      const canvas = await captureCanvas()
      if (!canvas) return
      canvas.toBlob(blob => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const a   = document.createElement('a')
        a.href     = url
        a.download = `snapcal-${photoId}.jpg`
        a.click()
        URL.revokeObjectURL(url)
      }, 'image/jpeg', 0.95)
    } finally {
      setIsSaving(false)
    }
  }

  // ── 캘린더에 업로드 ──
  const handleUpload = async () => {
    if (!photoId) return
    setShowUploadSheet(false)
    setIsSaving(true)
    try {
      const canvas = await captureCanvas()
      if (!canvas) return
      await new Promise<void>((resolve, reject) => {
        canvas.toBlob(async (blob) => {
          if (!blob) { reject(new Error('blob 생성 실패')); return }
          await updatePhotoImage(photoId, blob)
          resolve()
        }, 'image/jpeg', 0.95)
      })
      setUploadDone(true)
      setTimeout(() => navigate('/calendar'), 1500)
    } catch {
      // 실패 시 무시
    } finally {
      setIsSaving(false)
    }
  }

  const takenDate = photo?.takenAt
    ? new Date(photo.takenAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'numeric', day: 'numeric' })
    : ''

  return (
    <div
      className="flex min-h-svh flex-col bg-white"
      onClick={() => setActiveTextId(null)}
    >
      {/* 앱바 */}
      <div className="pt-[44px]">
        <AppBar title="사진 편집" onBack={() => navigate(-1)} />
      </div>

      {/* 날짜 + 카테고리 */}
      <div className="px-5 pb-1 pt-1">
        <p className="text-[12px] text-[#b0b0b0]">
          {takenDate}
          {photo?.category && ` · ${photo.category}`}
        </p>
        <p className="text-[18px] font-black text-[#2c2c2c]">
          {isTyping ? '텍스트를 입력하세요' : '사진을 꾸며볼까요?'}
        </p>
      </div>

      {/* 사진 카드 */}
      <div className="flex flex-col items-center px-5 pt-3">
        <div
          ref={cardRef}
          className="relative w-full overflow-hidden rounded-[20px] bg-[#e0c8a0] select-none"
          style={{
            aspectRatio: imgAspect,
            filter: FILTERS[selectedFilter],
          }}
          onPointerMove={onPointerMove}
          onPointerUp={stopDrag}
        >
          {imageUrl && (
            <img
              src={imageUrl}
              alt="편집 사진"
              crossOrigin="anonymous"
              className="absolute inset-0 size-full object-cover"
              onLoad={(e) => {
                const { naturalWidth, naturalHeight } = e.currentTarget
                if (naturalWidth && naturalHeight) {
                  setImgAspect(`${naturalWidth} / ${naturalHeight}`)
                }
              }}
            />
          )}

          {/* 텍스트 레이어 */}
          {textLayers.map(t => (
            <div
              key={t.id}
              className="absolute touch-none"
              style={{
                left: `${t.x}%`,
                top:  `${t.y}%`,
                color: t.color,
                fontSize: t.fontSize,
                fontWeight: 'bold',
                textShadow: '0 1px 4px rgba(0,0,0,0.4)',
                cursor: 'move',
                outline: activeTextId === t.id ? '1.5px dashed rgba(255,255,255,0.8)' : 'none',
                padding: '2px 6px',
                userSelect: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
              onPointerDown={e => startDrag(e, t.id)}
              onClick={e => { e.stopPropagation(); handleTextEdit(t) }}
            >
              {t.text}
              {activeTextId === t.id && !isTyping && (
                <button
                  type="button"
                  onPointerDown={e => e.stopPropagation()}
                  onClick={e => { e.stopPropagation(); deleteText(t.id) }}
                  className="flex size-[18px] items-center justify-center rounded-full bg-[#e89baa] text-[10px] text-white"
                  style={{ flexShrink: 0 }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 탭 */}
      <div className="mx-5 mt-4 flex rounded-[12px] bg-[#f0f8ff] p-[3px]">
        {(['텍스트', '필터'] as const).map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className="flex flex-1 items-center justify-center gap-1 rounded-[10px] py-2 text-[13px] font-bold transition-all"
            style={
              activeTab === tab
                ? { backgroundColor: 'white', color: '#2c2c2c', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
                : { color: '#b0b0b0' }
            }
          >
            {tab === '텍스트' ? 'T' : '⇄'} {tab}
          </button>
        ))}
      </div>

      {/* 탭 컨텐츠 */}
      <div className="px-5 pt-4">
        {activeTab === '텍스트' ? (
          <div className="flex flex-col gap-3">
            {/* 텍스트 추가 버튼 */}
            {!isTyping ? (
              <button
                type="button"
                onClick={handleAddTextClick}
                className="flex w-full items-center justify-center gap-1 rounded-[12px] border-[1.5px] border-dashed border-[#a8d8ea] py-3 text-[13px] font-bold text-[#7cb5d9]"
              >
                + 텍스트 추가
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={editingText}
                    onChange={e => setEditingText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleTextConfirm()}
                    placeholder={editingId !== null ? '텍스트 수정' : '텍스트 입력'}
                    className="flex-1 rounded-[10px] border border-[#ddeef8] px-3 py-2 text-[13px] outline-none focus:border-[#a8d8ea]"
                  />
                  <button
                    type="button"
                    onClick={handleTextConfirm}
                    className="rounded-[10px] bg-[#a8d8ea] px-4 text-[13px] font-bold text-[#2a4a57]"
                  >
                    확인
                  </button>
                </div>
                {editingId !== null && (
                  <button
                    type="button"
                    onClick={() => { deleteText(editingId); setIsTyping(false); setEditingId(null) }}
                    className="text-left text-[12px] text-[#e89baa]"
                  >
                    텍스트 삭제
                  </button>
                )}
              </div>
            )}

            {/* 색상 선택 — 선택된 텍스트 있으면 그 텍스트 색상 기준으로 표시 */}
            <div>
              <p className="mb-2 text-[12px] font-bold text-[#b0b0b0]">
                텍스트 색상
                {activeTextId !== null && (
                  <span className="ml-1 font-normal text-[#a8d8ea]">· 선택된 텍스트에 적용</span>
                )}
              </p>
              <div className="flex gap-3">
                {TEXT_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleColorChange(c)}
                    className="size-[28px] rounded-full transition-transform"
                    style={{
                      backgroundColor: c,
                      border: activeTextColor === c ? '2.5px solid #a8d8ea' : '1.5px solid #e0e0e0',
                      transform: activeTextColor === c ? 'scale(1.2)' : 'scale(1)',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* 텍스트 크기 — 선택된 텍스트가 있을 때만 표시 */}
            {activeTextId !== null && (
              <div>
                <p className="mb-2 text-[12px] font-bold text-[#b0b0b0]">
                  텍스트 크기
                  <span className="ml-1 font-normal text-[#a8d8ea]">
                    · {textLayers.find(t => t.id === activeTextId)?.fontSize ?? 20}px
                  </span>
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold text-[#b0b0b0]">A</span>
                  <input
                    type="range"
                    min={12}
                    max={60}
                    value={textLayers.find(t => t.id === activeTextId)?.fontSize ?? 20}
                    onChange={e => {
                      const size = Number(e.target.value)
                      setTextLayers(prev =>
                        prev.map(t => t.id === activeTextId ? { ...t, fontSize: size } : t)
                      )
                    }}
                    // 슬라이더 조작 중 activeTextId가 사라지지 않도록 이벤트 전파 차단
                    onClick={e => e.stopPropagation()}
                    className="flex-1 accent-[#a8d8ea]"
                  />
                  <span className="text-[15px] font-bold text-[#b0b0b0]">A</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* 필터 탭 */
          <div className="flex gap-3 overflow-x-auto pb-1">
            {(Object.keys(FILTERS) as FilterKey[]).map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setSelectedFilter(f)}
                className="flex flex-col items-center gap-1 flex-shrink-0"
              >
                <div
                  className="size-[60px] overflow-hidden rounded-[12px]"
                  style={{
                    border: selectedFilter === f ? '2.5px solid #a8d8ea' : '2px solid transparent',
                    filter: FILTERS[f],
                    backgroundColor: CATEGORY_COLORS[photo?.category ?? ''] ?? '#e0c8a0',
                  }}
                >
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt={f}
                      crossOrigin="anonymous"
                      className="size-full object-cover"
                    />
                  )}
                </div>
                <span
                  className="text-[11px] font-bold"
                  style={{ color: selectedFilter === f ? '#7cb5d9' : '#b0b0b0' }}
                >
                  {f}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="mt-auto flex gap-3 px-5 pb-10 pt-5">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="flex h-[50px] flex-1 items-center justify-center gap-1 rounded-[25px] border-[1.5px] border-[#a8d8ea] text-[14px] font-bold text-[#7cb5d9] disabled:opacity-50"
        >
          ↓ 기기에 저장
        </button>
        <button
          type="button"
          onClick={() => setShowUploadSheet(true)}
          disabled={isSaving}
          className="flex h-[50px] flex-[2] items-center justify-center gap-1 rounded-[25px] bg-[#a8d8ea] text-[14px] font-bold text-[#2a4a57] disabled:opacity-50"
        >
          📁 캘린더에 업로드
        </button>
      </div>

      {/* 업로드 완료 토스트 */}
      {uploadDone && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-[#2c2c2c] px-4 py-2 text-[13px] text-white shadow-lg">
          <span className="text-[#a8d8ea]">✓</span> 캘린더에 업로드했어요
        </div>
      )}

      {/* 업로드 바텀시트 */}
      {showUploadSheet && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/40"
          onClick={() => setShowUploadSheet(false)}
        >
          <div
            className="w-full rounded-t-[24px] bg-white px-5 pb-10 pt-6"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="mb-1 text-[17px] font-black text-[#2c2c2c]">캘린더에 업로드할까요?</h3>
            <p className="mb-5 text-[13px] text-[#b0b0b0]">
              편집한 사진이 {takenDate} 기록에 추가돼요
            </p>
            <div className="mb-6 flex items-center gap-3 rounded-[14px] bg-[#f7fbff] p-3">
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="미리보기"
                  className="size-[56px] rounded-[10px] object-cover"
                />
              )}
              <div>
                <p className="text-[13px] font-bold text-[#2c2c2c]">
                  {photo?.category ?? ''} · 편집됨
                </p>
                <p className="text-[12px] text-[#b0b0b0]">{takenDate}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowUploadSheet(false)}
                className="h-[50px] flex-1 rounded-[25px] border border-[#e0e0e0] text-[14px] font-bold text-[#b0b0b0]"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleUpload}
                className="h-[50px] flex-[2] rounded-[25px] bg-[#a8d8ea] text-[14px] font-bold text-[#2a4a57]"
              >
                업로드
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}