import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getDayPhotos } from '../api/photos'
import type { PhotoCategory } from '../types'

const CATEGORY_COLORS: Record<string, string> = {
  음식: '#FAC775',
  패션: '#F4C0D1',
  운동: '#9FE1CB',
  풍경: '#B5D4F4',
  일상: '#D3D1C7',
  미분류: '#E8E8E8',
}

const DAY_KO = ['일', '월', '화', '수', '목', '금', '토']

interface DayPhoto {
  photoId: string
  url: string
  thumbnailUrl: string
  category: PhotoCategory
  title?: string
  takenAt: string
  isRepresentative?: boolean
}

export default function DayDetailPage() {
  const navigate = useNavigate()
  const { date } = useParams<{ date: string }>()
  const [photos, setPhotos] = useState<DayPhoto[]>([])
  const [selectedPhoto, setSelectedPhoto] = useState<DayPhoto | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const dateObj = date ? new Date(date) : new Date()
  const month = dateObj.getMonth() + 1
  const day = dateObj.getDate()
  const dayOfWeek = DAY_KO[dateObj.getDay()]
  const fullDate = date ?? ''

  useEffect(() => {
    if (!date) return
    setIsLoading(true)
    getDayPhotos(date)
      .then(({ data }) => {
        setPhotos(data)
        const rep = data.find((p: DayPhoto) => p.isRepresentative) ?? data[0]
        if (rep) setSelectedPhoto(rep)
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [date])

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <span className="text-[13px] text-[#9e9e9e]">불러오는 중...</span>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh flex-col bg-white">
      {/* 상단 헤더 */}
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
        <div className="flex flex-1 flex-col items-center">
          <span className="text-[11px] font-medium text-[#9e9e9e]">{dayOfWeek}RIDAY</span>
          <span className="text-[18px] font-black text-[#2c2c2c]">{month}월 {day}일</span>
        </div>
        <button
          type="button"
          className="flex size-[36px] items-center justify-center rounded-full bg-[#f0f8ff]"
        >
          <svg width="16" height="4" viewBox="0 0 16 4" fill="none">
            <circle cx="2" cy="2" r="2" fill="#9e9e9e" />
            <circle cx="8" cy="2" r="2" fill="#9e9e9e" />
            <circle cx="14" cy="2" r="2" fill="#9e9e9e" />
          </svg>
        </button>
      </div>

      {/* 대표사진 */}
      {selectedPhoto && (
        <div className="relative mx-[20px] mt-4 overflow-hidden rounded-[20px]">
          <img
            src={selectedPhoto.url}
            alt=""
            className="h-[320px] w-full object-cover"
            style={{ backgroundColor: CATEGORY_COLORS[selectedPhoto.category] }}
          />
          {/* 대표사진 배지 */}
          <div className="absolute left-[12px] top-[12px] flex items-center gap-1 rounded-full bg-black/40 px-3 py-1">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M5 1L6.2 3.8L9 4.2L7 6.1L7.5 9L5 7.6L2.5 9L3 6.1L1 4.2L3.8 3.8L5 1Z" fill="white" />
            </svg>
            <span className="text-[11px] font-bold text-white">대표 사진</span>
          </div>
          {/* 카테고리 배지 */}
          <div
            className="absolute right-[12px] top-[12px] flex items-center gap-1 rounded-full px-3 py-1"
            style={{ backgroundColor: CATEGORY_COLORS[selectedPhoto.category] }}
          >
            <span className="text-[11px] font-bold text-white">🍽 {selectedPhoto.category}</span>
          </div>
          {/* 하단 그라디언트 + 정보 */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-[16px] pb-[16px] pt-[40px]">
            <p className="text-[16px] font-black text-white">
              {selectedPhoto.title ?? `${month}월 ${day}일의 기록`}
            </p>
            <p className="mt-1 text-[11px] text-white/70">
              {selectedPhoto.takenAt} · {photos.length}장의 기록
            </p>
          </div>
        </div>
      )}

      {/* 이 날의 사진 */}
      <div className="mt-5 px-[20px]">
        <div className="flex items-center justify-between">
          <span className="text-[14px] font-bold text-[#2c2c2c]">
            이 날의 사진 · {photos.length}장
          </span>
          <button type="button" className="text-[12px] font-medium text-[#7cb5d9]">
            전체 보기
          </button>
        </div>

        {/* 가로 스크롤 썸네일 */}
        <div className="mt-3 flex gap-[8px] overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
          {photos.map((photo) => (
            <button
              key={photo.photoId}
              type="button"
              onClick={() => setSelectedPhoto(photo)}
              className="relative flex-shrink-0"
            >
              <img
                src={photo.thumbnailUrl}
                alt=""
                className="size-[64px] rounded-[12px] object-cover"
                style={{ backgroundColor: CATEGORY_COLORS[photo.category] }}
              />
              {selectedPhoto?.photoId === photo.photoId && (
                <div className="absolute inset-0 rounded-[12px] border-[2.5px] border-[#7cb5d9]">
                  <div className="absolute right-[4px] top-[4px] flex size-[16px] items-center justify-center rounded-full bg-[#7cb5d9]">
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M1 4L3 6.5L7 1.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 하단 액션 바 */}
      <div className="mt-auto px-[20px] pb-10 pt-6">
        <div className="flex justify-around">
          {/* 대표변경 */}
          <button
            type="button"
            onClick={() => navigate(`/calendar/${fullDate}/representative`)}
            className="flex flex-col items-center gap-[6px]"
          >
            <div className="flex size-[52px] items-center justify-center rounded-full bg-[#d8f0fa]">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M11 2L13.2 7.5L19 8.2L14.8 12.1L16 18L11 15.2L6 18L7.2 12.1L3 8.2L8.8 7.5L11 2Z" fill="#7cb5d9" />
              </svg>
            </div>
            <span className="text-[11px] font-medium text-[#2c2c2c]">대표변경</span>
          </button>

          {/* 편집 */}
          <button type="button" className="flex flex-col items-center gap-[6px]">
            <div className="flex size-[52px] items-center justify-center rounded-full bg-[#f0f8ff]">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M14 3L17 6L7 16H4V13L14 3Z" stroke="#9e9e9e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-[11px] font-medium text-[#9e9e9e]">편집</span>
          </button>

          {/* 공유 */}
          <button type="button" className="flex flex-col items-center gap-[6px]">
            <div className="flex size-[52px] items-center justify-center rounded-full bg-[#f0f8ff]">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 3V13M10 3L6 7M10 3L14 7" stroke="#9e9e9e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 13V16H17V13" stroke="#9e9e9e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-[11px] font-medium text-[#9e9e9e]">공유</span>
          </button>

          {/* 삭제 */}
          <button type="button" className="flex flex-col items-center gap-[6px]">
            <div className="flex size-[52px] items-center justify-center rounded-full bg-[#fff0f0]">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 6H16M8 6V4H12V6M7 6V15H13V6H7Z" stroke="#e05c5c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-[11px] font-medium text-[#e05c5c]">삭제</span>
          </button>
        </div>
      </div>
    </div>
  )
}