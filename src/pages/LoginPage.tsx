import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import AuthHero from '../components/common/AuthHero'
import InputField from '../components/common/InputField'
import Button from '../components/common/Button'

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

  const showToggle = (
    <button
      type="button"
      onClick={() => setShowPassword((v) => !v)}
      className="text-[12px] text-[#9e9e9e]"
    >
      {showPassword ? '숨김' : '표시'}
    </button>
  )

  return (
    <div className="flex min-h-svh flex-col bg-white">
      <AuthHero />

      <form onSubmit={handleSubmit} noValidate className="flex flex-1 flex-col px-7 pt-10">
        <InputField
          type="email"
          placeholder="이메일"
          value={email}
          onChange={setEmail}
        />

        <div className="mt-3">
          <InputField
            type={showPassword ? 'text' : 'password'}
            placeholder="비밀번호"
            value={password}
            onChange={setPassword}
            borderColor="#a8d8ea"
            rightElement={showToggle}
          />
        </div>

        {errorMessage && (
          <p className="mt-2 text-[13px] text-red-500">{errorMessage}</p>
        )}

        <div className="mt-6">
          <Button
            type="submit"
            label="로그인"
            variant="primary"
            disabled={!isValid}
            isLoading={isLoading}
          />
        </div>

        <div className="mt-3">
          <Button label="소셜 계정으로 로그인" variant="outline" />
        </div>

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
