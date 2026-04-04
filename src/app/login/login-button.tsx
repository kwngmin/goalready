'use client'

import { createClient } from '@/lib/supabase/client'

export function LoginButton() {
  const handleLogin = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <button
      onClick={handleLogin}
      className="flex h-12 items-center gap-2 rounded-lg bg-[#FEE500] px-6 font-medium text-[#191919] transition-colors hover:bg-[#FDD835]"
    >
      카카오로 시작하기
    </button>
  )
}
