import { useNavigate } from 'react-router-dom'
import type { PhotoCategory } from '../types'

const CATEGORY_META: Record<PhotoCategory | 'all', { emoji: string; label: string }> = {
  all:  { emoji: '📷', label: '전체' },
  음식:  { emoji: '🍽', label: '음식' },
  패션:  { emoji: '👗', label: '패션' },
  운동:  { emoji: '🏃', label: '운동' },
  풍경:  { emoji: '🏔', label: '풍경' },
  일상:  { emoji: '☀️', label: '일상' },
  미분류: { emoji: '📁', label: '미분류' },
}

interface Props {
  category: PhotoCategory | 'all'
  onViewAll?: () => void
}

export default function EmptyCategoryCard({ category, onViewAll }: Props) {
  const navigate = useNavigate()
  const { emoji, label } = CATEGORY_META[category]
  const isAll = category === 'all'

  return (
    <div className="absolute inset-x-0 top-[100px] mx-[-6px] rounded-[20px] border border-[#e0f0f8] bg-white px-6 py-8 text-center shadow-sm">
      {!isAll && (
        <div className="inline-flex items-center gap-1 rounded-full bg-[#d8f0fa] px-3 py-1 text-[11px] font-bold text-[#7cb5d9]">
          {emoji} {label}
        </div>
      )}

      <p className="mt-3 text-[17px] font-bold tracking-[-0.34px] text-[#2c2c2c]">
        {isAll ? '사진이 아직 없어요' : `${label} 사진이 아직 없어요`}
      </p>

      <p className="mt-2 text-[12px] leading-relaxed text-[#9e9e9e]">
        {isAll
          ? '사진을 추가하면 AI가 자동으로\n카테고리별로 분류해드려요.'
          : `사진을 추가하면 AI가 자동으로\n${label} 카테고리에 분류해드려요.`}
      </p>

      <button
        type="button"
        onClick={() => navigate('/upload')}
        className="mt-6 flex h-[48px] w-full items-center justify-center gap-2 rounded-[24px] bg-[#a8d8ea] text-[14px] font-bold text-[#2a4a57]"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2V14M2 8H14" stroke="#2a4a57" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
        사진 추가하기
      </button>

    </div>
  )
}
