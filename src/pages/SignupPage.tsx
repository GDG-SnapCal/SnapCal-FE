import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import AuthHero from '../components/common/AuthHero'
import InputField from '../components/common/InputField'
import Button from '../components/common/Button'

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

  const checkIcon = (
    <div className="flex size-4 items-center justify-center rounded-full bg-[#a8d8ea]">
      <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
        <path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )

  return (
    <div className="flex min-h-svh flex-col bg-white">
      <AuthHero />

      <form onSubmit={handleSubmit} noValidate className="flex flex-1 flex-col px-7 pt-4">
        <InputField
          label="이름"
          type="text"
          placeholder="이름을 입력하세요"
          value={name}
          onChange={setName}
          errorMessage={fieldErrors.name}
        />

        <div className="mt-4">
          <InputField
            label="이메일"
            type="email"
            placeholder="이메일을 입력하세요"
            value={email}
            onChange={setEmail}
            errorMessage={fieldErrors.email}
          />
        </div>

        <div className="mt-4">
          <InputField
            label="비밀번호"
            type="password"
            placeholder="8자 이상 입력하세요"
            value={password}
            onChange={setPassword}
            errorMessage={fieldErrors.password}
          />
        </div>

        <div className="mt-4">
          <InputField
            label="비밀번호 확인"
            type="password"
            placeholder="비밀번호를 다시 입력하세요"
            value={passwordConfirm}
            onChange={setPasswordConfirm}
            borderColor={
              passwordConfirm === '' ? '#e0f0f8' : passwordMatch ? '#a8d8ea' : '#f87171'
            }
            rightElement={passwordMatch ? checkIcon : undefined}
            errorMessage={fieldErrors.passwordConfirm}
          />
        </div>

        {/* 이용약관 동의 */}
        <button
          type="button"
          onClick={() => setAgreed((v) => !v)}
          className="mt-4 flex items-center gap-2"
        >
          <div
            className="flex size-4 items-center justify-center rounded-full border transition-colors"
            style={{
              backgroundColor: agreed ? '#a8d8ea' : 'white',
              borderColor: agreed ? '#a8d8ea' : '#d1d5db',
            }}
          >
            {agreed && (
              <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                <path
                  d="M1.5 5L4 7.5L8.5 2.5"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
          <span className="text-[11px] text-[#2c2c2c]">만 14세 이상이며 이용약관에 동의해요</span>
        </button>

        <div className="mt-4">
          <Button
            type="submit"
            label="회원가입"
            variant="primary"
            disabled={!isValid}
            isLoading={isLoading}
          />
        </div>

        <div className="mt-3">
          <Button label="소셜 계정으로 가입" variant="outline" />
        </div>

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
