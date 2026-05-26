interface InputFieldProps {
  label?: string
  type?: 'text' | 'email' | 'password'
  placeholder?: string
  value: string
  onChange: (value: string) => void
  errorMessage?: string
  rightElement?: React.ReactNode
  borderColor?: string
}

export default function InputField({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  errorMessage,
  rightElement,
  borderColor,
}: InputFieldProps) {
  return (
    <div className="flex flex-col">
      {label && <span className="mb-1 text-[11px] text-[#9e9e9e]">{label}</span>}
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-[52px] w-full rounded-[12px] border bg-[#fbfdff] px-5 text-[15px] text-[#2c2c2c] placeholder:text-[#9e9e9e] outline-none transition-colors focus:border-[#a8d8ea]"
          style={{ borderColor: borderColor ?? '#e0f0f8' }}
        />
        {rightElement && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">{rightElement}</div>
        )}
      </div>
      {errorMessage && <p className="mt-1 text-[11px] text-red-500">{errorMessage}</p>}
    </div>
  )
}
