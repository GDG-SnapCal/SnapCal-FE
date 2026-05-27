import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppBar from '../components/common/AppBar'
import { useUploadStore } from '../stores/uploadStore'
import type { PhotoCategory } from '../types'

const CATEGORY_ORDER: PhotoCategory[] = ['음식', '패션', '운동', '풍경', '일상', '미분류']

const CATEGORY_COLORS: Record<PhotoCategory, string> = {
  음식: '#FAC775',
  패션: '#F4C0D1',
  운동: '#9FE1CB',
  풍경: '#B5D4F4',
  일상: '#D3D1C7',
  미분류: '#E8E8E8',
}

const titlePill = (
  <div className="flex items-center gap-1.5 rounded-[16px] bg-[#d8f0fa] px-3 py-1.5">
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M6 1L7.5 4.5H11L8 7L9 11L6 9L3 11L4 7L1 4.5H4.5L6 1Z" fill="#7cb5d9" />
    </svg>
    <span className="text-[12px] font-bold text-[#7cb5d9]">AI 결과</span>
  </div>
)

export default function ClassifyResultPage() {
  const navigate = useNavigate()
  const classifiedPhotos = useUploadStore((s) => s.classifiedPhotos)
  const saveToCalendar = useUploadStore((s) => s.saveToCalendar)
  const isSaving = useUploadStore((s) => s.isSaving)

  const grouped = CATEGORY_ORDER.reduce(
    (acc, cat) => {
      const photos = classifiedPhotos.filter((p) => p.category === cat)
      if (photos.length > 0) acc[cat] = photos
      return acc
    },
    {} as Record<string, typeof classifiedPhotos>,
  )

  const [selected, setSelected] = useState<Set<string>>(() => {
    const ids = new Set<string>()
    classifiedPhotos.forEach((p) => {
      if (p.category !== '미분류') ids.add(p.photoId)
    })
    return ids
  })

  const togglePhoto = (photoId: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(photoId)) next.delete(photoId)
      else next.add(photoId)
      return next
    })
  }

  const toggleAll = (category: string) => {
    const photos = grouped[category] ?? []
    const allSelected = photos.every((p) => selected.has(p.photoId))
    setSelected((prev) => {
      const next = new Set(prev)
      if (allSelected) photos.forEach((p) => next.delete(p.photoId))
      else photos.forEach((p) => next.add(p.photoId))
      return next
    })
  }

  const handleSave = async () => {
    const photos = classifiedPhotos
      .filter((p) => selected.has(p.photoId))
      .map((p) => ({ photoId: p.photoId, category: p.category }))
    await saveToCalendar(photos)
    navigate('/calendar')
  }

  return (
    <div className="flex min-h-svh flex-col bg-white">
      <AppBar title={titlePill} />

      <div className="flex flex-1 flex-col px-5 pt-2 pb-6">
        {/* 헤더 */}
        <p className="text-[21px] font-black tracking-[-0.42px] text-[#2c2c2c]">
          AI가 카테고리를 분류했어요!
        </p>
        <p className="mt-1 text-[12px] text-[#9e9e9e]">
          다음 {classifiedPhotos.length}장이 자동 분류되었어요. 확인하고 캘린더에 저장해요.
        </p>

        {/* 카테고리별 섹션 */}
        <div className="mt-5 flex flex-col gap-5">
          {CATEGORY_ORDER.filter((cat) => grouped[cat]).map((cat) => {
            const photos = grouped[cat]
            const isUnclassified = cat === '미분류'
            const allSelected = photos.every((p) => selected.has(p.photoId))
            const color = CATEGORY_COLORS[cat as PhotoCategory]

            return (
              <div key={cat}>
                {/* 카테고리 헤더 */}
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-[14px] font-bold text-[#2c2c2c]">{cat}</span>
                  <span
                    className="rounded-[10px] px-2 py-[2px] text-[10px] font-bold"
                    style={{
                      backgroundColor: isUnclassified ? '#eef6fb' : '#d8f0fa',
                      color: isUnclassified ? '#9e9e9e' : '#7cb5d9',
                    }}
                  >
                    {photos.length}장
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleAll(cat)}
                    className="ml-auto text-[11px] text-[#9e9e9e]"
                  >
                    {allSelected ? '전체 해제' : '전체 선택'}
                  </button>
                </div>

                {/* 사진 그리드 (4열) */}
                <div className="grid grid-cols-4 gap-[6px]">
                  {photos.map((photo) => {
                    const isSelected = selected.has(photo.photoId)
                    return (
                      <button
                        key={photo.photoId}
                        type="button"
                        onClick={() => togglePhoto(photo.photoId)}
                        className="relative aspect-square"
                      >
                        <img
                          src={photo.url}
                          alt=""
                          className="size-full rounded-[12px] object-cover"
                          style={{ backgroundColor: color }}
                        />
                        {/* 미분류 딤처리 */}
                        {isUnclassified && (
                          <div className="absolute inset-0 rounded-[12px] bg-white/35" />
                        )}
                        {/* 체크 원 */}
                        <div
                          className="absolute right-[5px] top-[5px] flex size-[18px] items-center justify-center rounded-full"
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
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 캘린더에 저장 버튼 */}
      <div className="px-4 pb-6">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || selected.size === 0}
          className="h-[54px] w-full rounded-[24px] bg-[#a8d8ea] text-[15px] font-bold text-[#2a4a57] disabled:opacity-50"
        >
          {isSaving ? '저장 중...' : '캘린더에 저장'}
        </button>
      </div>
    </div>
  )
}
