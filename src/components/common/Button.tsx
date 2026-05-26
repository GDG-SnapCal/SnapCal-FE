interface ButtonProps {
  label: string
  type?: 'button' | 'submit'
  variant: 'primary' | 'outline'
  disabled?: boolean
  isLoading?: boolean
  onClick?: () => void
}

export default function Button({
  label,
  type = 'button',
  variant,
  disabled,
  isLoading,
  onClick,
}: ButtonProps) {
  const base = 'h-[54px] w-full rounded-[24px] text-[15px] font-bold transition-opacity disabled:opacity-50'
  const styles = {
    primary: 'bg-[#a8d8ea] text-[#2a4a57]',
    outline: 'border-[1.5px] border-[#e0f0f8] bg-white font-medium text-[#2c2c2c]',
  }

  return (
    <button type={type} disabled={disabled || isLoading} onClick={onClick} className={`${base} ${styles[variant]}`}>
      {isLoading ? '처리 중...' : label}
    </button>
  )
}
