import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppBar from '../components/common/AppBar'
import { useUploadStore } from '../stores/uploadStore'
import { useToast } from '../components/Toast'

export default function DuplicateSelectPage() {
  const navigate = useNavigate()
  const showToast = useToast()
  const duplicateGroups = useUploadStore((s) => s.duplicateGroups)
  const submitDuplicates = useUploadStore((s) => s.submitDuplicates)

  // groupId → selectedPhotoId | null (null = 모두 보관)
  const [selections, setSelections] = useState<Record<string, string | null>>(() =>
    Object.fromEntries(duplicateGroups.map((g) => [g.groupId, g.aiRecommendedPhotoId])),
  )

  const handleSelect = (groupId: string, photoId: string) => {
    setSelections((prev) => ({ ...prev, [groupId]: photoId }))
  }

  const handleKeepAll = (groupId: string) => {
    setSelections((prev) => ({ ...prev, [groupId]: null }))
  }

  const handleSubmit = async () => {
    const payload = Object.entries(selections)
      .filter(([, id]) => id !== null)
      .map(([groupId, selectedPhotoId]) => ({ groupId, selectedPhotoId: selectedPhotoId! }))
    try {
      await submitDuplicates(payload)
      navigate('/upload/classify')
    } catch {
      showToast('중복 사진 처리 중 오류가 발생했어요. 다시 시도해주세요.', 'error')
    }
  }

  const formatDate = (takenAt: string) => takenAt.replace(/-/g, '.')

  return (
    <div className="flex min-h-svh flex-col bg-white">
      <AppBar title="중복 사진 검토" />

      <div className="flex flex-1 flex-col px-4 pt-3 pb-6">
        {/* 안내 배너 */}
        <div className="flex items-center gap-3 rounded-[16px] bg-[#d8f0fa] px-4 py-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#a8d8ea]">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M7 1L8.5 5.5H13L9.5 8L11 12.5L7 10L3 12.5L4.5 8L1 5.5H5.5L7 1Z"
                fill="white"
              />
            </svg>
          </div>
          <div>
            <p className="text-[13px] font-bold text-[#2c2c2c]">비슷한 사진을 찾았어요!</p>
            <p className="text-[11px] text-[#2c2c2c]">그룹마다 대표가 될 사진을 골라주세요.</p>
          </div>
        </div>

        {/* 중복 그룹 목록 */}
        <div className="mt-4 flex flex-col gap-5">
          {duplicateGroups.map((group) => {
            const selectedId = selections[group.groupId]
            return (
              <div key={group.groupId}>
                {/* 그룹 헤더 */}
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-[12px] font-bold text-[#2c2c2c]">
                    {formatDate(group.takenAt)}
                  </span>
                  <span className="rounded-[8px] bg-[#d8f0fa] px-2 py-[2px] text-[10px] font-bold text-[#7cb5d9]">
                    유사 {group.photos.length}장
                  </span>
                  <button
                    type="button"
                    onClick={() => handleKeepAll(group.groupId)}
                    className="ml-auto text-[11px] text-[#9e9e9e]"
                  >
                    모두 보관
                  </button>
                </div>

                {/* 사진 목록 */}
                <div className="grid grid-cols-3 gap-[6px]">
                  {group.photos.map((photo) => {
                    const isSelected = selectedId === photo.photoId
                    const isAiRecommended = group.aiRecommendedPhotoId === photo.photoId
                    return (
                      <button
                        key={photo.photoId}
                        type="button"
                        onClick={() => handleSelect(group.groupId, photo.photoId)}
                        className="relative aspect-square"
                      >
                        <img
                          src={photo.url}
                          alt=""
                          className="size-full rounded-[14px] object-cover"
                        />
                        {/* 비선택 딤처리 */}
                        {!isSelected && selectedId !== null && (
                          <div className="absolute inset-0 rounded-[14px] bg-white/45" />
                        )}
                        {/* 선택 테두리 */}
                        {isSelected && (
                          <div className="pointer-events-none absolute inset-0 rounded-[14px] border-[2.5px] border-[#7cb5d9]" />
                        )}
                        {/* 체크 아이콘 */}
                        {isSelected && (
                          <div className="absolute left-[6px] top-[6px] flex size-[22px] items-center justify-center rounded-full bg-[#7cb5d9]">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path
                                d="M2 6L5 9L10 3"
                                stroke="white"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                        )}
                        {/* AI 추천 배지 */}
                        {isAiRecommended && (
                          <span
                            className="absolute right-[6px] top-[6px] rounded-[4px] px-[6px] py-[2px] text-[8px] font-bold text-white"
                            style={{
                              backgroundColor: isSelected ? '#a8d8ea' : 'rgba(0,0,0,0.5)',
                            }}
                          >
                            AI 추천
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 선택 완료 버튼 */}
      <div className="px-4 pb-6">
        <button
          type="button"
          onClick={handleSubmit}
          className="h-[54px] w-full rounded-[24px] bg-[#a8d8ea] text-[15px] font-bold text-[#2a4a57]"
        >
          선택 완료
        </button>
      </div>
    </div>
  )
}
