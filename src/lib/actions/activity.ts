'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type ActivityFormState = {
  error?: string
}

export async function createActivity(_prev: ActivityFormState, formData: FormData): Promise<ActivityFormState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const teamId = formData.get('team_id') as string

  if (!teamId) {
    return { error: '팀을 선택해주세요.' }
  }

  // 내 팀인지 확인
  const { data: team } = await supabase
    .from('teams')
    .select('id')
    .eq('id', teamId)
    .eq('admin_id', user.id)
    .is('deleted_at', null)
    .single()

  if (!team) {
    return { error: '권한이 없는 팀입니다.' }
  }

  const playedAt = formData.get('played_at') as string
  const description = formData.get('description') as string | null
  const placeName = formData.get('place_name') as string
  const placeAddress = formData.get('place_address') as string
  const placeLat = formData.get('place_lat') as string
  const placeLng = formData.get('place_lng') as string
  const kakaoPlaceId = formData.get('kakao_place_id') as string | null
  const photoUrls = formData.getAll('photo_urls') as string[]

  if (!playedAt || !placeName || !placeLat || !placeLng) {
    return { error: '날짜와 장소는 필수입니다.' }
  }

  // place upsert (kakao_place_id 기준)
  let placeId: string

  if (kakaoPlaceId) {
    const { data: existingPlace } = await supabase
      .from('places')
      .select('id')
      .eq('kakao_place_id', kakaoPlaceId)
      .single()

    if (existingPlace) {
      placeId = existingPlace.id
    } else {
      const { data: newPlace, error: placeError } = await supabase
        .from('places')
        .insert({
          kakao_place_id: kakaoPlaceId,
          name: placeName,
          address: placeAddress,
          latitude: parseFloat(placeLat),
          longitude: parseFloat(placeLng),
        })
        .select('id')
        .single()

      if (placeError || !newPlace) {
        return { error: '장소 등록에 실패했습니다.' }
      }
      placeId = newPlace.id
    }
  } else {
    const { data: newPlace, error: placeError } = await supabase
      .from('places')
      .insert({
        name: placeName,
        address: placeAddress,
        latitude: parseFloat(placeLat),
        longitude: parseFloat(placeLng),
      })
      .select('id')
      .single()

    if (placeError || !newPlace) {
      return { error: '장소 등록에 실패했습니다.' }
    }
    placeId = newPlace.id
  }

  // match 생성
  const { data: match, error: matchError } = await supabase
    .from('matches')
    .insert({
      team_id: team.id,
      place_id: placeId,
      played_at: playedAt,
      description: description || null,
    })
    .select('id')
    .single()

  if (matchError || !match) {
    return { error: '활동 기록 등록에 실패했습니다.' }
  }

  // 사진 저장
  const validPhotos = photoUrls.filter(Boolean)
  if (validPhotos.length > 0) {
    const photoInserts = validPhotos.map((url, i) => ({
      match_id: match.id,
      image_url: url,
      display_order: i,
    }))

    await supabase.from('photos').insert(photoInserts)
  }

  revalidatePath('/my-team')
  revalidatePath('/map')
  redirect('/my-team')
}
