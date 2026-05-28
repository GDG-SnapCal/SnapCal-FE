import { useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import AppBar from '../components/common/AppBar'
import { useUploadStore } from '../stores/uploadStore'

const MAX_FILES = 30
const ACCEPT = '.jpg,.jpeg,.heic,.png'

export default function UploadSelectPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const selectedFiles = useUploadStore((s) => s.selectedFiles)
  const setSelectedFiles = useUploadStore((s) => s.setSelectedFiles)
  const upload = useUploadStore((s) => s.upload)
  const isUploading = useUploadStore((s) => s.isUploading)

  const objectUrls = useMemo(
    () => selectedFiles.map((file) => URL.createObjectURL(file)),
    [selectedFiles],
  )

  useEffect(() => {
    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [objectUrls])

  const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const added = Array.from(e.target.files)
    setSelectedFiles([...selectedFiles, ...added].slice(0, MAX_FILES))
    e.target.value = ''
  }

  const handleRemove = (index: number) => {
    const updated = selectedFiles.filter((_, i) => i !== index)
    if (updated.length === 0) {
      navigate('/upload')
      return
    }
    setSelectedFiles(updated)
  }

  const handleStart = async () => {
    const next = await upload()
    navigate(next === 'duplicate' ? '/upload/duplicates' : '/upload/classify')
  }

  return (
    
    <div className=" relatvie flex min-h-svh flex-col bg-white">

      {isUploading && (
  <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/70">
    <svg
      className="animate-spin"
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
    >
      <circle
        cx="32"
        cy="32"
        r="26"
        stroke="#3a3a3a"
        strokeWidth="6"
      />
      <path
        d="M32 6 A26 26 0 0 1 58 32"
        stroke="url(#spinner-grad)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="spinner-grad" x1="32" y1="6" x2="58" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#c8e6f0" />
          <stop offset="100%" stopColor="#7cb5d9" />
        </linearGradient>
      </defs>
    </svg>
    <p className="mt-4 text-[14px] font-bold text-white">AI 분류 중...</p>
  </div>
)}
      <AppBar title="사진 업로드" />

      <div className="flex flex-1 flex-col px-4 pt-2 pb-6">
        {/* 선택 수 / 추가 버튼 */}
        <div className="flex items-center justify-between py-2">
          <span className="text-[13px] font-bold text-[#2c2c2c]">{selectedFiles.length}장 선택됨</span>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-[12px] font-bold text-[#7cb5d9]"
          >
            + 사진 추가
          </button>
        </div>

        {/* 사진 그리드 */}
        <div className="grid grid-cols-3 gap-[6px]">
          {objectUrls.map((url, index) => (
            <div key={url} className="relative aspect-square">
              <img src={url} alt="" className="size-full rounded-[14px] object-cover" />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-[6px] right-[6px] flex size-5 items-center justify-center rounded-full bg-black/50"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M2 2L8 8M8 2L2 8"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              {index === 0 && (
                <span className="absolute bottom-[6px] left-1/2 -translate-x-1/2 rounded-[4px] bg-black px-[6px] py-[2px] text-[9px] font-bold text-white">
                  표지
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* AI 분류 시작 버튼 */}
      <div className="px-[25px] pb-6">
        <button
          type="button"
          onClick={handleStart}
          disabled={isUploading || selectedFiles.length === 0}
          className="h-[54px] w-full rounded-[27px] bg-[#a8d8ea] text-[15px] font-bold text-[#2a4a57] disabled:opacity-50"
        >
          {isUploading ? 'AI 분류 중...' : 'AI 분류 시작'}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="hidden"
        onChange={handleAddFiles}
      />
    </div>
  )
}
