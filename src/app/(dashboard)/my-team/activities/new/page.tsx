import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ActivityForm } from './activity-form'

export default async function NewActivityPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: teams } = await supabase
    .from('teams')
    .select('id, name, logo_url')
    .eq('admin_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })

  if (!teams || teams.length === 0) {
    redirect('/my-team/new')
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold">활동 기록 등록</h1>
      <ActivityForm teams={teams} />
    </div>
  )
}
