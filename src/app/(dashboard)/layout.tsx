import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from '@/components/logout-button'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('avatar_url')
    .eq('id', user.id)
    .single()

  return (
    <>
      <header className="border-b">
        <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="text-lg font-bold">풋살고</Link>
          <div className="flex items-center gap-6">
            <Link href="/map" className="text-sm hover:underline">지도</Link>
            <Link href="/teams" className="text-sm hover:underline">팀 목록</Link>
            <Link href="/my-team" className="text-sm hover:underline">내 팀</Link>
            <LogoutButton />
            {profile?.avatar_url && (
              <img src={profile.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
            )}
          </div>
        </nav>
      </header>
      {children}
    </>
  )
}
