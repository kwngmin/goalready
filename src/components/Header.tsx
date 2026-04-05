import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { FloatingActionButton } from '@/components/FloatingActionButton'

export async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let avatarUrl: string | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('avatar_url')
      .eq('id', user.id)
      .single()
    avatarUrl = profile?.avatar_url ?? null
  }

  return (
    <>
      <header className="border-b">
        <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="text-lg font-bold">풋살고</Link>
          <div className="flex items-center gap-6">
            <Link href="/teams" className="text-sm hover:underline">풋살팀</Link>
            <Link href="/venues" className="text-sm hover:underline">구장</Link>
            <Link href="/map" className="text-sm hover:underline">지도</Link>
            {user ? (
              <Link href="/my-team">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 text-sm text-zinc-500">MY</div>
                )}
              </Link>
            ) : (
              <Link href="/login" className="text-sm hover:underline">로그인</Link>
            )}
          </div>
        </nav>
      </header>
      {user && <FloatingActionButton />}
    </>
  )
}
