import { useNavigate } from 'react-router-dom'

interface AppBarProps {
  title: React.ReactNode
  onBack?: () => void
  rightElement?: React.ReactNode
}

export default function AppBar({ title, onBack, rightElement }: AppBarProps) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) onBack()
    else navigate(-1)
  }

  return (
    <div className="relative flex h-[56px] items-center justify-center px-4">
      <button
        type="button"
        onClick={handleBack}
        className="absolute left-4 flex size-9 items-center justify-center rounded-full bg-[#f0f8ff]"
      >
        <svg width="9" height="16" viewBox="0 0 9 16" fill="none">
          <path d="M8 1L1 8L8 15" stroke="#2c2c2c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <span className="text-[16px] font-bold tracking-[-0.24px] text-[#2c2c2c]">{title}</span>
      {rightElement && <div className="absolute right-4">{rightElement}</div>}
    </div>
  )
}
