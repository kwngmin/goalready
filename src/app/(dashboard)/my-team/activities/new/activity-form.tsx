'use client'

import { useActionState, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { VenueSearch } from '@/components/VenueSearch'
import { PhotoUploader } from '@/components/PhotoUploader'
import { createActivity, type ActivityFormState } from '@/lib/actions/activity'

interface SelectedVenue {
  kakaoPlaceId: string
  name: string
  address: string
  lat: string
  lng: string
}

export function ActivityForm() {
  const [state, formAction, pending] = useActionState<ActivityFormState, FormData>(createActivity, {})
  const [venue, setVenue] = useState<SelectedVenue | null>(null)
  const [photoUrls, setPhotoUrls] = useState<string[]>([])

  return (
    <form action={formAction} className="space-y-8">
      {/* 숨은 필드: 장소 정보 */}
      {venue && (
        <>
          <input type="hidden" name="place_name" value={venue.name} />
          <input type="hidden" name="place_address" value={venue.address} />
          <input type="hidden" name="place_lat" value={venue.lat} />
          <input type="hidden" name="place_lng" value={venue.lng} />
          <input type="hidden" name="kakao_place_id" value={venue.kakaoPlaceId} />
        </>
      )}

      {/* 숨은 필드: 사진 URLs */}
      {photoUrls.map((url, i) => (
        <input key={i} type="hidden" name="photo_urls" value={url} />
      ))}

      <div className="space-y-2">
        <Label htmlFor="played_at">날짜</Label>
        <Input
          id="played_at"
          name="played_at"
          type="date"
          defaultValue={new Date().toISOString().split('T')[0]}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>장소</Label>
        <VenueSearch onSelect={setVenue} />
      </div>

      <div className="space-y-2">
        <Label>사진</Label>
        <PhotoUploader onUpload={setPhotoUrls} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">메모 <span className="text-zinc-400 font-normal">(선택)</span></Label>
        <Textarea id="description" name="description" rows={2} placeholder="오늘 경기 한 줄 메모" />
      </div>

      {state.error && (
        <p className="text-sm text-red-500">{state.error}</p>
      )}

      <Button type="submit" className="h-12 w-full !rounded-lg text-base" disabled={pending || !venue}>
        {pending ? '등록 중...' : '활동 기록 등록'}
      </Button>
    </form>
  )
}
