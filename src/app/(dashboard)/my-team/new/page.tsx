import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TeamForm } from '../edit/team-form'

export default async function NewTeamPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold">팀 등록</h1>
      <TeamForm />
    </div>
  )
}
