import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string
    email?: string
    password?: string
    passwordConfirm?: string
  }>({})

  const signup = useAuthStore((s) => s.signup)
  const navigate = useNavigate()

  const passwordMatch = passwordConfirm !== '' && password === passwordConfirm
  const isValid =
    name.trim().length >= 2 &&
    email.trim() !== '' &&
    password.length >= 8 &&
    passwordMatch &&
    agreed

  const validate = () => {
    const errors: typeof fieldErrors = {}
    if (name.trim().length < 2) errors.name = '이름은 2자 이상이어야 합니다.'
    if (!email.includes('@')) errors.email = '올바른 이메일 형식을 입력해주세요.'
    if (password.length < 8) errors.password = '비밀번호는 8자 이상이어야 합니다.'
    if (!passwordMatch) errors.passwordConfirm = '비밀번호가 일치하지 않습니다.'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate() || isLoading) return
    try {
      setIsLoading(true)
      await signup(name, email, password)
      navigate('/calendar')
    } catch {
      setFieldErrors({ email: '이미 사용 중인 이메일입니다.' })
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
      <form onSubmit={handleSubmit} className="flex flex-1 flex-col px-7 pt-4">
        {/* 이름 */}
        <label className="mb-1 text-[11px] text-[#9e9e9e]">이름</label>
        <input
          type="text"
          placeholder="이름을 입력하세요"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-[50px] rounded-[12px] border border-[#e0f0f8] bg-[#fbfdff] px-4 text-[14px] text-[#2c2c2c] placeholder:text-[#c8c8c8] outline-none focus:border-[#a8d8ea]"
        />
        {fieldErrors.name && (
          <p className="mt-1 text-[11px] text-red-500">{fieldErrors.name}</p>
        )}

        {/* 이메일 */}
        <label className="mb-1 mt-4 text-[11px] text-[#9e9e9e]">이메일</label>
        <input
          type="email"
          placeholder="이메일을 입력하세요"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-[50px] rounded-[12px] border border-[#e0f0f8] bg-[#fbfdff] px-4 text-[14px] text-[#2c2c2c] placeholder:text-[#c8c8c8] outline-none focus:border-[#a8d8ea]"
        />
        {fieldErrors.email && (
          <p className="mt-1 text-[11px] text-red-500">{fieldErrors.email}</p>
        )}

        {/* 비밀번호 */}
        <label className="mb-1 mt-4 text-[11px] text-[#9e9e9e]">비밀번호</label>
        <input
          type="password"
          placeholder="8자 이상 입력하세요"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-[50px] rounded-[12px] border border-[#e0f0f8] bg-[#fbfdff] px-4 text-[14px] text-[#2c2c2c] placeholder:text-[#c8c8c8] outline-none focus:border-[#a8d8ea]"
        />
        {fieldErrors.password && (
          <p className="mt-1 text-[11px] text-red-500">{fieldErrors.password}</p>
        )}

        {/* 비밀번호 확인 */}
        <label className="mb-1 mt-4 text-[11px] text-[#9e9e9e]">비밀번호 확인</label>
        <div className="relative">
          <input
            type="password"
            placeholder="비밀번호를 다시 입력하세요"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            className="h-[50px] w-full rounded-[12px] border bg-[#fbfdff] px-4 text-[14px] text-[#2c2c2c] placeholder:text-[#c8c8c8] outline-none transition-colors"
            style={{
              borderColor: passwordConfirm === '' ? '#e0f0f8' : passwordMatch ? '#a8d8ea' : '#f87171',
            }}
          />
          {passwordMatch && (
            <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full bg-[#a8d8ea] p-1">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
        </div>
        {fieldErrors.passwordConfirm && (
          <p className="mt-1 text-[11px] text-red-500">{fieldErrors.passwordConfirm}</p>
        )}

        {/* 이용약관 동의 */}
        <button
          type="button"
          onClick={() => setAgreed((v) => !v)}
          className="mt-4 flex items-center gap-2"
        >
          <div
            className="flex size-4 items-center justify-center rounded-full border transition-colors"
            style={{ backgroundColor: agreed ? '#a8d8ea' : 'white', borderColor: agreed ? '#a8d8ea' : '#d1d5db' }}
          >
            {agreed && (
              <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                <path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span className="text-[11px] text-[#2c2c2c]">만 14세 이상이며 이용약관에 동의해요</span>
        </button>

        {/* 회원가입 버튼 */}
        <button
          type="submit"
          disabled={!isValid || isLoading}
          className="mt-4 h-[54px] w-full rounded-[24px] bg-[#a8d8ea] text-[15px] font-bold text-[#2a4a57] disabled:opacity-50"
        >
          {isLoading ? '가입 중...' : '회원가입'}
        </button>

        {/* 소셜 가입 버튼 */}
        <button
          type="button"
          className="mt-3 h-[52px] w-full rounded-[24px] border-[1.5px] border-[#e0f0f8] bg-white text-[14px] font-medium text-[#2c2c2c]"
        >
          소셜 계정으로 가입
        </button>

        {/* 하단 링크 */}
        <div className="mt-auto pb-10 text-center">
          <p className="text-[12px] text-[#9e9e9e]">
            이미 계정이 있으신가요?&nbsp;&nbsp;
            <Link to="/login" className="text-[#9e9e9e]">
              로그인
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}
