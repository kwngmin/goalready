'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type TeamFormState = {
  error?: string
}

export async function createTeam(_prev: TeamFormState, formData: FormData): Promise<TeamFormState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const name = formData.get('name') as string
  const description = formData.get('description') as string | null
  const memberCount = Number(formData.get('member_count')) || 0
  const ageGroup = formData.get('age_group') as string
  const gender = formData.get('gender') as string
  const level = formData.get('level') as string
  const instagramHandle = formData.get('instagram_handle') as string
  const logoUrl = formData.get('logo_url') as string | null

  if (!name) {
    return { error: '이름은 필수입니다.' }
  }

  const { error } = await supabase.from('teams').insert({
    admin_id: user.id,
    name,
    description: description || null,
    member_count: memberCount,
    age_group: ageGroup || 'mixed',
    gender: gender || 'male',
    level: level || 'amateur',
    instagram_handle: instagramHandle || '',
    logo_url: logoUrl || null,
  })

  if (error) {
    return { error: '팀 생성에 실패했습니다.' }
  }

  revalidatePath('/my-team')
  revalidatePath('/teams')
  redirect('/my-team')
}

export async function updateTeam(_prev: TeamFormState, formData: FormData): Promise<TeamFormState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const teamId = formData.get('team_id') as string

  const { data: team } = await supabase
    .from('teams')
    .select('admin_id')
    .eq('id', teamId)
    .is('deleted_at', null)
    .single()

  if (!team || team.admin_id !== user.id) {
    return { error: '권한이 없습니다.' }
  }

  const name = formData.get('name') as string
  const description = formData.get('description') as string | null
  const memberCount = Number(formData.get('member_count')) || 0
  const ageGroup = formData.get('age_group') as string
  const gender = formData.get('gender') as string
  const level = formData.get('level') as string
  const instagramHandle = formData.get('instagram_handle') as string
  const logoUrl = formData.get('logo_url') as string | null

  if (!name) {
    return { error: '이름은 필수입니다.' }
  }

  const { error } = await supabase
    .from('teams')
    .update({
      name,
      description: description || null,
      member_count: memberCount,
      age_group: ageGroup,
      gender,
      level,
      instagram_handle: instagramHandle || '',
      logo_url: logoUrl || null,
    })
    .eq('id', teamId)

  if (error) {
    return { error: '팀 수정에 실패했습니다.' }
  }

  revalidatePath('/my-team')
  revalidatePath('/teams')
  revalidatePath(`/teams/${teamId}`)
  redirect('/my-team')
}

export async function deleteTeam(teamId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: team } = await supabase
    .from('teams')
    .select('admin_id')
    .eq('id', teamId)
    .is('deleted_at', null)
    .single()

  if (!team || team.admin_id !== user.id) return

  // soft delete
  await supabase
    .from('teams')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', teamId)

  revalidatePath('/my-team')
  revalidatePath('/teams')
  redirect('/my-team')
}
