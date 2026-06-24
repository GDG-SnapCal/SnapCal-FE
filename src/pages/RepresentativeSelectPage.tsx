import { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getDayPhotos, setRepresentativePhoto } from '../api/photos'
import { useToast } from '../components/Toast'
import type { PhotoCategory } from '../types'

const CATEGORY_COLORS: Record<string, string> = {
  음식: '#FAC775',
  패션: '#F4C0D1',
  운동: '#9FE1CB',
  풍경: '#B5D4F4',
  일상: '#D3D1C7',
  미분류: '#E8E8E8',
}

interface DayPhoto {
  photoId: string
  originalUrl: string
  thumbnailUrl: string
  category: PhotoCategory
  title?: string
  takenAt: string
  isRepresentative?: boolean
}

export default function RepresentativeSelectPage() {
  const navigate = useNavigate()
  const showToast = useToast()
  const { date } = useParams<{ date: string }>()
  const [searchParams] = useSearchParams()
  const category = searchParams.get('category') ?? undefined
  const [photos, setPhotos] = useState<DayPhoto[]>([])
  const [currentRep, setCurrentRep] = useState<DayPhoto | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<DayPhoto | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const dateObj = date ? new Date(date) : new Date()
  const month = dateObj.getMonth() + 1
  const day = dateObj.getDate()

  useEffect(() => {
    if (!date) return
    getDayPhotos(date, category)
      .then(({ data }) => {
        setPhotos(data)
        const rep = data.find((p: DayPhoto) => p.isRepresentative) ?? data[0]
        if (rep) {
          setCurrentRep(rep)
          setSelectedPhoto(null)
        }
      })
      .catch(() => { showToast('사진을 불러오는데 실패했어요.', 'error') })
      .finally(() => setIsLoading(false))
  }, [date, category, showToast])

  const handleConfirm = async () => {
    if (!date || !selectedPhoto) return
    try {
      setIsSaving(true)
      await setRepresentativePhoto(selectedPhoto.photoId)
      showToast('대표 사진이 변경되었어요.', 'success')
      navigate('/calendar')
    } catch {
      showToast('대표 사진 변경에 실패했어요. 다시 시도해주세요.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <span className="text-[13px] text-[#9e9e9e]">불러오는 중...</span>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh flex-col bg-white">
      {/* 헤더 */}
      <div className="flex items-center px-[20px] pt-[52px]">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex size-[36px] items-center justify-center rounded-full bg-[#f0f8ff]"
        >
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
            <path d="M7 1L1 7L7 13" stroke="#2c2c2c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="flex-1 text-center text-[16px] font-black text-[#2c2c2c]">대표 사진 선택</span>
        <div className="size-[36px]" />
      </div>

      <div className="flex flex-1 flex-col px-[20px] pt-4">
        {/* 날짜 + 장수 */}
        <p className="text-[12px] text-[#9e9e9e]">
          {date} · {photos.length}장
        </p>

        {/* 사진 1장일 때 안내 */}
        {photos.length <= 1 ? (
          <>
            <p className="mt-2 text-[18px] font-black text-[#2c2c2c]">
              어떤 사진을 캘린더에 보여줄까요?
            </p>
            <div className="mt-3 flex items-start gap-3 rounded-[14px] bg-[#eef8fd] px-4 py-3">
              <div className="flex size-[20px] flex-shrink-0 items-center justify-center rounded-full bg-[#7cb5d9]">
                <span className="text-[11px] font-bold text-white">i</span>
              </div>
              <div>
                <p className="text-[13px] font-bold text-[#2c2c2c]">이 날에는 사진이 한 장뿐이에요</p>
                <p className="mt-0.5 text-[11px] text-[#9e9e9e]">
                  대표 사진을 바꾸려면 같은 날짜에{'\n'}사진을 한 장 더 추가해주세요.
                </p>
              </div>
            </div>
            {/* 단일 사진 */}
            {currentRep && (
              <div className="relative mt-4 overflow-hidden rounded-[16px]">
                <img
                  src={currentRep.originalUrl}
                  alt=""
                  className="h-[320px] w-full object-cover"
                  style={{ backgroundColor: CATEGORY_COLORS[currentRep.category] }}
                />
                <div className="absolute left-[12px] top-[12px] flex items-center gap-1 rounded-full bg-black/40 px-3 py-1">
                  <span className="text-[11px] font-bold text-white">★ 대표</span>
                </div>
                <div className="absolute bottom-[12px] left-[12px] flex items-center gap-1 rounded-full bg-black/40 px-3 py-1">
                  <span className="text-[10px] text-white/80">🔒 유일한 사진</span>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <p className="mt-2 text-[18px] font-black text-[#2c2c2c]">
              어떤 사진을 캘린더에 보여줄까요?
            </p>

            {/* 현재 대표 or 선택중 표시 */}
            <div className="mt-3 flex items-center gap-3 rounded-[14px] bg-[#eef8fd] px-4 py-3">
              {selectedPhoto ? (
                <>
                  <img
                    src={currentRep?.thumbnailUrl}
                    alt=""
                    className="size-[40px] flex-shrink-0 rounded-[8px] object-cover"
                    style={{ backgroundColor: currentRep ? CATEGORY_COLORS[currentRep.category] : '#eee' }}
                  />
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="#7cb5d9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <img
                    src={selectedPhoto.thumbnailUrl}
                    alt=""
                    className="size-[40px] flex-shrink-0 rounded-[8px] object-cover"
                    style={{ backgroundColor: CATEGORY_COLORS[selectedPhoto.category] }}
                  />
                  <div className="ml-1">
                    <p className="text-[11px] font-bold text-[#7cb5d9]">새 대표 선택됨</p>
                    <p className="text-[12px] font-bold text-[#2c2c2c]">
                      {selectedPhoto.title ?? `${month}월 ${day}일의 사진`}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {currentRep && (
                    <img
                      src={currentRep.thumbnailUrl}
                      alt=""
                      className="size-[40px] flex-shrink-0 rounded-[8px] object-cover"
                      style={{ backgroundColor: CATEGORY_COLORS[currentRep.category] }}
                    />
                  )}
                  <div>
                    <p className="text-[11px] font-bold text-[#7cb5d9]">현재 대표 사진</p>
                    <p className="text-[12px] font-bold text-[#2c2c2c]">
                      {currentRep?.title ?? `${month}월 ${day}일의 사진`}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* 사진 그리드 */}
            <div className="mt-4 grid grid-cols-2 gap-[8px]">
              {photos.map((photo) => {
                const isRep = photo.photoId === currentRep?.photoId
                const isSelected = photo.photoId === selectedPhoto?.photoId
                return (
                  <button
                    key={photo.photoId}
                    type="button"
                    onClick={() => {
                      if (isRep) return
                      setSelectedPhoto(isSelected ? null : photo)
                    }}
                    className="relative aspect-square overflow-hidden rounded-[16px]"
                  >
                    <img
                      src={photo.originalUrl}
                      alt=""
                      className="size-full object-cover"
                      style={{ backgroundColor: CATEGORY_COLORS[photo.category] }}
                    />
                    {isRep && (
                      <div className="absolute left-[8px] top-[8px] rounded-full bg-black/40 px-2 py-0.5">
                        <span className="text-[10px] font-bold text-white">★ {isSelected ? '기존' : '현재 대표'}</span>
                      </div>
                    )}
                    {isSelected && (
                      <>
                        <div className="absolute inset-0 rounded-[16px] border-[2.5px] border-[#7cb5d9]" />
                        <div className="absolute right-[8px] top-[8px] flex size-[20px] items-center justify-center rounded-full bg-[#7cb5d9]">
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </>
                    )}
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="px-[20px] pb-10 pt-4">
        {photos.length <= 1 ? (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="h-[54px] flex-1 rounded-[27px] border border-[#e0e0e0] text-[15px] font-bold text-[#9e9e9e]"
            >
              닫기
            </button>
            <button
              type="button"
              className="h-[54px] flex-1 rounded-[27px] bg-[#a8d8ea] text-[15px] font-bold text-[#2a4a57]"
            >
              + 이 날짜에 사진 추가
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => selectedPhoto && setShowConfirm(true)}
            disabled={!selectedPhoto}
            className="h-[54px] w-full rounded-[27px] bg-[#a8d8ea] text-[15px] font-bold text-[#2a4a57] disabled:opacity-40"
          >
            대표 사진 변경하기
          </button>
        )}
      </div>

      {/* 최종 확인 바텀시트 */}
      {showConfirm && selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
          <div className="w-full max-w-[390px] rounded-t-[24px] bg-white px-[24px] pb-10 pt-4">
            {/* 핸들 */}
            <div className="mb-4 flex justify-center">
              <div className="h-[4px] w-[40px] rounded-full bg-[#e0e0e0]" />
            </div>
            <p className="text-center text-[18px] font-black text-[#2c2c2c]">
              대표 사진을 변경할까요?
            </p>
            <p className="mt-1 text-center text-[12px] text-[#9e9e9e]">
              {month}월 {day}일의 캘린더 표지가 바뀌어요.
            </p>

            {/* 기존 → 새로운 미리보기 */}
            <div className="mt-5 flex items-center justify-center gap-4">
              <div className="flex flex-col items-center gap-1">
                <span className="text-[11px] text-[#9e9e9e]">기존</span>
                <img
                  src={currentRep?.thumbnailUrl}
                  alt=""
                  className="size-[72px] rounded-[12px] object-cover"
                  style={{ backgroundColor: currentRep ? CATEGORY_COLORS[currentRep.category] : '#eee' }}
                />
                <span className="text-[10px] text-[#9e9e9e]">
                  {currentRep?.title ?? '기존 대표'}
                </span>
              </div>
              <div className="flex size-[32px] items-center justify-center rounded-full bg-[#d8f0fa]">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7H12M12 7L8 3M12 7L8 11" stroke="#7cb5d9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-[11px] font-bold text-[#7cb5d9]">새로운</span>
                <div className="relative">
                  <img
                    src={selectedPhoto.thumbnailUrl}
                    alt=""
                    className="size-[72px] rounded-[12px] object-cover"
                    style={{ backgroundColor: CATEGORY_COLORS[selectedPhoto.category] }}
                  />
                  <div className="absolute right-[-4px] top-[-4px] flex size-[16px] items-center justify-center rounded-full bg-[#7cb5d9]">
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M5 1L6 3.5L8.5 3.8L6.8 5.4L7.3 8L5 6.7L2.7 8L3.2 5.4L1.5 3.8L4 3.5L5 1Z" fill="white" />
                    </svg>
                  </div>
                </div>
                <span className="text-[10px] text-[#9e9e9e]">
                  {selectedPhoto.title ?? '새 대표'}
                </span>
              </div>
            </div>

            {/* 버튼 */}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="h-[54px] flex-1 rounded-[27px] border border-[#e0e0e0] text-[15px] font-bold text-[#9e9e9e]"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isSaving}
                className="h-[54px] flex-1 rounded-[27px] bg-[#a8d8ea] text-[15px] font-bold text-[#2a4a57] disabled:opacity-50"
              >
                {isSaving ? '변경 중...' : '변경하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}