import { NextRequest } from 'next/server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/my-team'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // auth 유저 정보로 public.users upsert
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const kakaoId = authUser.user_metadata.provider_id ?? authUser.id
        const nickname = authUser.user_metadata.name ?? authUser.user_metadata.full_name ?? '풋살러'
        const email = authUser.email ?? null
        const avatarUrl = authUser.user_metadata.avatar_url ?? null

        await supabase.from('users').upsert(
          {
            id: authUser.id,
            kakao_id: kakaoId,
            nickname,
            email,
            avatar_url: avatarUrl,
          },
          { onConflict: 'kakao_id' }
        )
      }

      redirect(next)
    }
  }

  redirect('/login')
}
