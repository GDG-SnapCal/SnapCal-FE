import { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import AppBar from '../components/common/AppBar'
import { getDayPhotos, setRepresentativePhoto } from '../api/photos'
import type { PhotoCategory } from '../types'

const CATEGORY_COLORS: Record<string, string> = {
  음식: '#FAC775',
  패션: '#F4C0D1',
  운동: '#9FE1CB',
  풍경: '#B5D4F4',
  일상: '#D3D1C7',
  미분류: '#E8E8E8',
}

interface Photo {
  photoId: string
  url: string
  thumbnailUrl: string
  category: PhotoCategory
  categoryColor?: string
}

export default function DayPhotoPage() {
  const navigate = useNavigate()
  const { date } = useParams<{ date: string }>() // e.g. "2026-05-07"
  const [searchParams] = useSearchParams()
  const category = searchParams.get('category') // e.g. "음식" or null(전체)

  const [photos, setPhotos] = useState<Photo[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const dateLabel = date
    ? `${parseInt(date.split('-')[2])}일의 사진`
    : ''

  useEffect(() => {
    if (!date) return
    setIsLoading(true)
    getDayPhotos(date, category ?? undefined)
      .then(({ data }) => {
        setPhotos(data)
        // 첫 번째 사진을 기본 대표사진으로
        if (data.length > 0) setSelectedId(data[0].photoId)
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [date, category])

  const handleSave = async () => {
    if (!date || !selectedId) return
    try {
      setIsSaving(true)
      await setRepresentativePhoto(date, selectedId)
      navigate(-1)
    } catch {
      // 에러 처리
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex min-h-svh flex-col bg-white">
      <AppBar title={dateLabel} />

      <div className="flex flex-1 flex-col px-[30px] pt-3 pb-6">
        <p className="text-[12px] text-[#9e9e9e]">
          캘린더에 표시될 대표사진을 선택 할 수 있어요
        </p>

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center text-[13px] text-[#9e9e9e]">
            불러오는 중...
          </div>
        ) : photos.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-[13px] text-[#9e9e9e]">
            사진이 없어요
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-3 gap-[6px]">
            {photos.map((photo) => {
              const isSelected = selectedId === photo.photoId
              return (
                <button
                  key={photo.photoId}
                  type="button"
                  onClick={() => setSelectedId(photo.photoId)}
                  className="relative aspect-square"
                >
                  <img
                    src={photo.thumbnailUrl}
                    alt=""
                    className="size-full rounded-[14px] object-cover"
                    style={{ backgroundColor: CATEGORY_COLORS[photo.category] }}
                  />
                  {/* 선택 오버레이 */}
                  {isSelected && (
                    <div className="absolute inset-0 rounded-[14px] border-[2.5px] border-[#7cb5d9] bg-black/10" />
                  )}
                  {/* 체크 아이콘 */}
                  <div
                    className="absolute right-[6px] top-[6px] flex size-[20px] items-center justify-center rounded-full"
                    style={{
                      backgroundColor: isSelected ? '#7cb5d9' : 'rgba(255,255,255,0.6)',
                      border: isSelected ? 'none' : '1.5px solid rgba(180,180,180,0.8)',
                    }}
                  >
                    {isSelected && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path
                          d="M1.5 5L4 7.5L8.5 2.5"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  {/* 카테고리 라벨 */}
                  <span
                    className="absolute bottom-[6px] left-[6px] rounded-[4px] px-[5px] py-[2px] text-[9px] font-bold text-white"
                    style={{ backgroundColor: CATEGORY_COLORS[photo.category] }}
                  >
                    {photo.category}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* 저장 버튼 */}
      <div className="px-[25px] pb-6">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || !selectedId}
          className="h-[54px] w-full rounded-[27px] bg-[#a8d8ea] text-[15px] font-bold text-[#2a4a57] disabled:opacity-50"
        >
          {isSaving ? '저장 중...' : '대표사진 저장'}
        </button>
      </div>
    </div>
  )
}