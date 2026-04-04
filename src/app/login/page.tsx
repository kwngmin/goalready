import { LoginButton } from './login-button'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-2xl font-bold">풋살고</h1>
        <p className="text-zinc-500">팀을 등록하고 관리하려면 로그인하세요</p>
        <LoginButton />
      </div>
    </div>
  )
}
