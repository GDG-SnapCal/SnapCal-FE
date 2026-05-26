import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  const isValid = email.trim() !== '' && password.trim() !== ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid || isLoading) return
    try {
      setIsLoading(true)
      setErrorMessage(null)
      await login(email, password)
      navigate('/calendar')
    } catch {
      setErrorMessage('이메일 또는 비밀번호가 올바르지 않습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh flex-col bg-white">
      {/* Hero */}
      <div className="flex h-[248px] items-center justify-center bg-gradient-to-b from-[#dff3fb] via-[#c4e9f5] via-60% to-white">
        <h1 className="text-[32px] font-extrabold text-white">Snap Cal</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-1 flex-col px-7 pt-10">
        {/* Email */}
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-[52px] rounded-[12px] border border-[#e0f0f8] bg-[#fbfdff] px-5 text-[15px] text-[#2c2c2c] placeholder:text-[#9e9e9e] outline-none focus:border-[#a8d8ea]"
        />

        {/* Password */}
        <div className="relative mt-3">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-[52px] w-full rounded-[12px] border border-[#a8d8ea] bg-[#fbfdff] px-5 text-[15px] text-[#2c2c2c] placeholder:text-[#9e9e9e] outline-none focus:border-[#a8d8ea]"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] text-[#9e9e9e]"
          >
            {showPassword ? '숨김' : '표시'}
          </button>
        </div>

        {errorMessage && (
          <p className="mt-2 text-[13px] text-red-500">{errorMessage}</p>
        )}

        {/* 로그인 버튼 */}
        <button
          type="submit"
          disabled={!isValid || isLoading}
          className="mt-6 h-[54px] w-full rounded-[24px] bg-[#a8d8ea] text-[16px] font-bold text-[#2a4a57] disabled:opacity-50"
        >
          {isLoading ? '로그인 중...' : '로그인'}
        </button>

        {/* 소셜 로그인 버튼 */}
        <button
          type="button"
          className="mt-3 h-[54px] w-full rounded-[24px] border-[1.5px] border-[#e0f0f8] bg-white text-[15px] font-medium text-[#2c2c2c]"
        >
          소셜 계정으로 로그인
        </button>

        {/* 하단 링크 */}
        <div className="mt-auto pb-10 text-center">
          <p className="text-[12px] text-[#9e9e9e]">
            비밀번호 찾기&nbsp;&nbsp;·&nbsp;&nbsp;
            <Link to="/signup" className="text-[#9e9e9e]">
              회원가입
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}
