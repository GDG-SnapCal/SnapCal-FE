import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppBar from '../components/common/AppBar'
import { useUploadStore } from '../stores/uploadStore'

const MAX_FILES = 30
const ACCEPT = '.jpg,.jpeg,.heic,.png'

export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const setSelectedFiles = useUploadStore((s) => s.setSelectedFiles)
  const navigate = useNavigate()

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const selected = Array.from(files).slice(0, MAX_FILES)
    setSelectedFiles(selected)
    navigate('/upload/select')
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div className="flex min-h-svh flex-col bg-white">
      <AppBar title="사진 업로드" />

      <div className="flex flex-1 flex-col px-5 pt-3 pb-6">
        {/* 안내 텍스트 */}
        <p className="text-[13px] leading-relaxed text-[#9e9e9e]">
          정리하고 싶은 사진들을 골라주세요. AI가 카테고리별로 자동 분류해드려요.
        </p>

        {/* 업로드 영역 */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="mt-4 flex flex-1 cursor-pointer flex-col items-center justify-center rounded-[18px] border-2 border-dashed transition-colors"
          style={{
            borderColor: isDragging ? '#7ec8e3' : '#a8d8ea',
            background: 'linear-gradient(to top, #fbfdff 50%, #f0f8ff 150%)',
          }}
        >
          {/* 클라우드 아이콘 */}
          <div className="flex size-[78px] items-center justify-center rounded-full bg-[#c4e9f5]">
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
              <path
                d="M22 28V16M22 16L17 21M22 16L27 21"
                stroke="#2a4a57"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 31C9.24 31 7 28.76 7 26C7 23.56 8.76 21.52 11.1 21.08C11.04 20.73 11 20.37 11 20C11 16.69 13.69 14 17 14C17.96 14 18.87 14.24 19.67 14.66C20.86 12.48 23.21 11 25.88 11C29.87 11 33.1 14.18 33.1 18.12C33.1 18.33 33.09 18.53 33.07 18.73C35.35 19.55 37 21.73 37 24.29C37 27.49 34.41 30.1 31.19 30.1"
                stroke="#2a4a57"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <p className="mt-4 text-center text-[16px] font-bold text-[#2c2c2c]">
            사진을 선택하거나 끌어다 놓으세요
          </p>
          <p className="mt-1 text-center text-[12px] text-[#9e9e9e]">JPG · HEIC · PNG · 최대 30장</p>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              fileInputRef.current?.click()
            }}
            className="mt-6 h-[44px] w-[120px] rounded-[24px] bg-[#a8d8ea] text-[14px] font-bold text-[#2a4a57]"
          >
            사진 선택
          </button>
        </div>

        {/* 안내 배너 */}
        <div className="mt-4 flex items-start gap-3 rounded-[12px] bg-[#f0f8ff] px-4 py-4">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="mt-0.5 shrink-0">
            <circle cx="7" cy="7" r="6.5" stroke="#a8d8ea" />
            <path d="M7 6V10M7 4.5V4" stroke="#a8d8ea" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <p className="text-[11px] leading-relaxed text-[#2c2c2c]">
            한번에 여러 장을 올리면 메타데이터 기반으로 캘린더에 자동 배치돼요.
          </p>
        </div>

        {/* AI 카테고리 분류 버튼 (비활성) */}
        <button
          type="button"
          disabled
          className="mt-4 h-[52px] w-full rounded-[24px] bg-[#eef6fb] text-[15px] font-bold text-[#9e9e9e]"
        >
          AI 카테고리 분류
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  )
}
