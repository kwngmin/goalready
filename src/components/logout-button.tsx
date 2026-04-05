'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <button onClick={handleLogout} className="h-9 rounded-lg px-3 text-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900">
      로그아웃
    </button>
  )
}
