import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

const btnBase = 'inline-flex items-center justify-center rounded-4xl text-sm font-medium h-10 px-4'
const btnPrimary = `${btnBase} bg-primary text-primary-foreground hover:bg-primary/80`
const btnOutline = `${btnBase} border border-border bg-background hover:bg-muted hover:text-foreground`

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 등록된 팀 수
  const { count } = await supabase
    .from('teams')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null)
    .eq('status', 'active')

  return (
    <div className="flex min-h-screen flex-col">
      {/* 헤더 */}
      <header className="border-b">
        <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <span className="text-lg font-bold">풋살고</span>
          <div className="flex items-center gap-6">
            <Link href="/map" className="text-sm hover:underline">지도</Link>
            <Link href="/teams" className="text-sm hover:underline">팀 목록</Link>
            {user ? (
              <Link href="/my-team" className="text-sm hover:underline">내 팀</Link>
            ) : (
              <Link href="/login" className="text-sm hover:underline">로그인</Link>
            )}
          </div>
        </nav>
      </header>

      {/* 히어로 */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          풋살팀은 여기서 찾는다
        </h1>
        <p className="mt-4 max-w-md text-lg text-zinc-500">
          전국 풋살팀 정보를 한 곳에 모아 지도로 보여주는 디렉토리.
          <br />
          팀을 등록하고, 활동을 기록하고, 새로운 팀을 찾아보세요.
        </p>

        <div className="mt-8 flex gap-3">
          <Link href="/map" className={btnPrimary}>
            지도에서 둘러보기
          </Link>
          {user ? (
            <Link href="/my-team" className={btnOutline}>
              내 팀 관리
            </Link>
          ) : (
            <Link href="/login" className={btnOutline}>
              팀 등록하기
            </Link>
          )}
        </div>

        {(count ?? 0) > 0 && (
          <p className="mt-6 text-sm text-zinc-400">
            현재 <span className="font-semibold text-zinc-600">{count}개</span> 팀이 등록되어 있습니다
          </p>
        )}
      </section>

      {/* 특징 */}
      <section className="border-t bg-zinc-50 px-4 py-20">
        <div className="mx-auto grid max-w-4xl gap-12 sm:grid-cols-3">
          <div className="text-center">
            <div className="mb-3 text-3xl">&#x1F5FA;&#xFE0F;</div>
            <h3 className="mb-2 font-semibold">팀 디렉토리</h3>
            <p className="text-sm text-zinc-500">
              지역, 레벨, 모집 여부로 필터링해서 내 동네 풋살팀을 찾아보세요
            </p>
          </div>
          <div className="text-center">
            <div className="mb-3 text-3xl">&#x1F7E9;</div>
            <h3 className="mb-2 font-semibold">활동 잔디</h3>
            <p className="text-sm text-zinc-500">
              언제 어디서 뛰었는지 30초만에 기록. GitHub 잔디처럼 활동을 시각화합니다
            </p>
          </div>
          <div className="text-center">
            <div className="mb-3 text-3xl">&#x1F4F8;</div>
            <h3 className="mb-2 font-semibold">간편한 연락</h3>
            <p className="text-sm text-zinc-500">
              인스타그램, 카카오 오픈채팅으로 바로 연락. 자체 메시징 없이 심플하게
            </p>
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="border-t px-4 py-8 text-center text-sm text-zinc-400">
        풋살고 &copy; {new Date().getFullYear()}
      </footer>
    </div>
  )
}
