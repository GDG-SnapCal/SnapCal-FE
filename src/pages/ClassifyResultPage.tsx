import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import AppBar from '../components/common/AppBar'
import { useUploadStore } from '../stores/uploadStore'
import { updatePhotoCategory } from '../api/photos'
import { getCategories } from '../api/categories'
import type { PhotoCategory, ClassifiedPhoto } from '../types'

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

function DraggablePhoto({
  photo,
  currentCategory,
  isSelected,
  onToggle,

}: {

  photo: ClassifiedPhoto
  currentCategory: PhotoCategory
  isSelected: boolean
  onToggle: (id: string) => void

}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: photo.photoId,
    data: { category: currentCategory },
  })
  const isUnclassified = currentCategory === '미분류'
  const color = CATEGORY_COLORS[currentCategory]

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.35 : 1,
        touchAction: 'none',
      }}
      className="relative aspect-square"
    >
      <button
        type="button"
        onClick={() => onToggle(photo.photoId)}
        className="relative size-full"
        {...listeners}
        {...attributes}
      >
        <img
          src={photo.url}
          alt=""
          className="size-full rounded-[12px] object-cover"
          style={{ backgroundColor: color }}
        />
        {isUnclassified && (
          <div className="absolute inset-0 rounded-[12px] bg-white/35" />
        )}
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
    </div>
  )
}

function DroppableCategory({
  category,
  photos,
  selected,
  onToggle,
  onToggleAll,
}: {
  category: PhotoCategory
  photos: ClassifiedPhoto[]
  selected: Set<string>
  onToggle: (id: string) => void
  onToggleAll: (cat: string) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: category })
  const isUnclassified = category === '미분류'
  const allSelected = photos.length > 0 && photos.every((p) => selected.has(p.photoId))

  return (
    <div
      ref={setNodeRef}
      className="rounded-[16px] p-2 -mx-2 transition-colors duration-150"
      style={isOver ? { backgroundColor: '#eef8fd' } : {}}
    >
      <div className="mb-2 flex items-center gap-2">
        <div
          className="size-[8px] rounded-full flex-shrink-0"
          style={{ backgroundColor: CATEGORY_COLORS[category] }}
        />
        <span className="text-[14px] font-bold text-[#2c2c2c]">{category}</span>
        <span
          className="rounded-[10px] px-2 py-[2px] text-[10px] font-bold"
          style={{
            backgroundColor: isUnclassified ? '#eef6fb' : '#d8f0fa',
            color: isUnclassified ? '#9e9e9e' : '#7cb5d9',
          }}
        >
          {photos.length}장
        </span>
        {photos.length > 0 && (
          <button
            type="button"
            onClick={() => onToggleAll(category)}
            className="ml-auto text-[11px] text-[#9e9e9e]"
          >
            {allSelected ? '전체 해제' : '전체 선택'}
          </button>
        )}
      </div>

      {photos.length > 0 ? (
        <div className="grid grid-cols-4 gap-[6px]">
          {photos.map((photo) => (
            <DraggablePhoto
              key={photo.photoId}
              photo={photo}
              currentCategory={category}
              isSelected={selected.has(photo.photoId)}
              onToggle={onToggle}
            />
          ))}
        </div>
      ) : (
        <div className="flex h-[60px] items-center justify-center rounded-[12px] border-2 border-dashed border-[#d8f0fa]">
          <span className="text-[11px] text-[#b0d8ea]">여기로 드래그하세요</span>
        </div>
      )}
    </div>
  )
}

export default function ClassifyResultPage() {
  const navigate = useNavigate()
  const classifiedPhotos = useUploadStore((s) => s.classifiedPhotos)
  const saveToCalendar = useUploadStore((s) => s.saveToCalendar)
  const isSaving = useUploadStore((s) => s.isSaving)

  const [photoCategories, setPhotoCategories] = useState<Record<string, PhotoCategory>>(() =>
    Object.fromEntries(classifiedPhotos.map((p) => [p.photoId, p.category])),
  )

  const [activePhotoId, setActivePhotoId] = useState<string | null>(null)
  const [categoryIdMap, setCategoryIdMap] = useState<Record<string, number>>({})

  useEffect(() => {
    getCategories()
      .then(({ data }) => {
        const map: Record<string, number> = {}
        data.forEach((c) => { map[c.name] = c.categoryId })
        setCategoryIdMap(map)
      })
      .catch(() => {})
  }, [])

  const originalCategories = CATEGORY_ORDER

  const grouped = useMemo(
    () =>
     CATEGORY_ORDER.reduce(
        (acc, cat) => {
          acc[cat] = classifiedPhotos.filter((p) => photoCategories[p.photoId] === cat)
          return acc
        },
        {} as Record<string, typeof classifiedPhotos>,
      ),
    [classifiedPhotos, photoCategories],
  )

  const [selected, setSelected] = useState<Set<string>>(() => {
    const ids = new Set<string>()
    classifiedPhotos.forEach((p) => {
      if (p.category !== '미분류') ids.add(p.photoId)
    })
    return ids
  })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  )

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

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActivePhotoId(active.id as string)
  }

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActivePhotoId(null)
    if (!over) return
    const newCategory = over.id as PhotoCategory
    if (photoCategories[active.id as string] === newCategory) return
    setPhotoCategories((prev) => ({ ...prev, [active.id as string]: newCategory }))
  }

  const handleSave = async () => {
    const changedPhotos = classifiedPhotos.filter(
      (p) => photoCategories[p.photoId] !== p.category,
    )
    await Promise.all(
      changedPhotos.map((p) => {
        const categoryId = categoryIdMap[photoCategories[p.photoId]]
        return categoryId ? updatePhotoCategory(p.photoId, categoryId) : Promise.resolve()
      }),
    )
    await saveToCalendar()
    navigate('/calendar')
  }

  const activePhoto = activePhotoId
    ? classifiedPhotos.find((p) => p.photoId === activePhotoId)
    : null

  return (
    <div className="flex min-h-svh flex-col bg-white">
      <AppBar title={titlePill} />

      <div className="flex flex-1 flex-col px-5 pt-2 pb-6">
        <p className="text-[21px] font-black tracking-[-0.42px] text-[#2c2c2c]">
          AI가 카테고리를 분류했어요!
        </p>
        <p className="mt-1 text-[12px] text-[#9e9e9e]">
          다음 {classifiedPhotos.length}장이 자동 분류되었어요. 확인하고 캘린더에 저장해요.
        </p>
        <p className="mt-0.5 text-[11px] text-[#7cb5d9]">
          사진을 길게 눌러 다른 카테고리로 이동할 수 있어요
        </p>

        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="mt-5 flex flex-col gap-5">
            {originalCategories.map((cat) => (
              <DroppableCategory
                key={cat}
                category={cat}
                photos={grouped[cat] ?? []}
                selected={selected}
                onToggle={togglePhoto}
                onToggleAll={toggleAll}
              />
            ))}
          </div>

          <DragOverlay dropAnimation={null}>
            {activePhoto && (
              <div className="size-[72px] rotate-3 shadow-2xl">
                <img
                  src={activePhoto.url}
                  alt=""
                  className="size-full rounded-[12px] object-cover"
                  style={{
                    backgroundColor:
                      CATEGORY_COLORS[photoCategories[activePhoto.photoId]] ??
                      CATEGORY_COLORS['미분류'],
                  }}
                />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

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
