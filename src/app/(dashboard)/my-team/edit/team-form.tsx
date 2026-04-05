'use client'

import { useActionState, useState, useRef } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createTeam, updateTeam, type TeamFormState } from '@/lib/actions/team'
import type { Team } from '@/types'

const GENDER_OPTIONS = [
  { value: 'male', label: '남성팀' },
  { value: 'female', label: '여성팀' },
  { value: 'mixed', label: '혼성팀' },
]

const LEVEL_OPTIONS = [
  { value: 'low', label: '하', desc: '초보 다수, 안전하고 재밌게 차는 팀' },
  { value: 'low_mid', label: '중·하', desc: '기본적인 패스플레이가 가능한 팀' },
  { value: 'mid', label: '중', desc: '꾸준히 차온 멤버들, 적당히 즐기는 팀' },
  { value: 'mid_high', label: '중·상', desc: '빠른 전개와 전술 플레이가 되는 팀' },
  { value: 'high', label: '상', desc: '기본기 필수, 실수 줄이며 뛰는 경쟁 팀' },
]

const AGE_GROUP_OPTIONS = [
  { value: '10s', label: '10~20' },
  { value: '20s', label: '20~30' },
  { value: '30s', label: '30~40' },
  { value: '40s', label: '40~50' },
  { value: '50s_plus', label: '50+' },
]

function SelectField({
  label,
  name,
  options,
  defaultValue,
  fill,
}: {
  label: string
  name: string
  options: { value: string; label: string; desc?: string }[]
  defaultValue: string
  fill?: boolean
}) {
  const [value, setValue] = useState(defaultValue)
  const selectedDesc = options.find((opt) => opt.value === value)?.desc
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <input type="hidden" name={name} value={value} />
      <div className={`flex gap-2 ${fill ? '' : 'flex-wrap'}`}>
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setValue(opt.value)}
            className={`h-9 rounded-full px-4 text-sm font-medium transition-colors ${fill ? 'flex-1' : 'min-w-[3.5rem]'} ${
              value === opt.value
                ? 'bg-zinc-900 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {selectedDesc && (
        <p className="text-sm text-zinc-500">{options.find((opt) => opt.value === value)?.label} - {selectedDesc}</p>
      )}
    </div>
  )
}

export function TeamForm({ team }: { team?: Team }) {
  const isEditing = !!team
  const action = isEditing ? updateTeam : createTeam
  const [state, formAction, pending] = useActionState<TeamFormState, FormData>(action, {})

  const [description, setDescription] = useState(team?.description ?? '')
  const [logoUrl, setLogoUrl] = useState<string>(team?.logo_url ?? '')
  const [logoPreview, setLogoPreview] = useState<string>(team?.logo_url ?? '')
  const [logoFileName, setLogoFileName] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const clearLogo = () => {
    setLogoUrl('')
    setLogoPreview('')
    setLogoFileName('')
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleLogoUpload = async (file: File) => {
    setUploading(true)
    setLogoPreview(URL.createObjectURL(file))
    setLogoFileName(file.name)

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/images/upload', {
      method: 'POST',
      body: formData,
    })

    if (res.ok) {
      const data = await res.json()
      setLogoUrl(data.url)
    }
    setUploading(false)
  }

  return (
    <form action={formAction} className="space-y-8">
      {isEditing && <input type="hidden" name="team_id" value={team.id} />}
      <input type="hidden" name="logo_url" value={logoUrl} />

      <div className="space-y-2">
        <Label htmlFor="name">이름</Label>
        <Input id="name" name="name" defaultValue={team?.name} required />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="description">소개</Label>
          <span className="text-sm text-zinc-400">{description.length}/200</span>
        </div>
        <Textarea id="description" name="description" value={description} onChange={(e) => setDescription(e.target.value.slice(0, 200))} rows={3} />
      </div>

      <div className="flex items-end justify-between">
        <SelectField
          label="구분"
          name="gender"
          options={GENDER_OPTIONS}
          defaultValue={team?.gender ?? 'male'}
        />
        <div className="w-24 shrink-0 space-y-2">
          <Label htmlFor="member_count">인원수</Label>
          <div className="flex items-center gap-1">
            <Input id="member_count" name="member_count" type="number" min={0} defaultValue={team?.member_count ?? 0} className="w-full" />
            <span className="shrink-0 text-sm text-zinc-500">명</span>
          </div>
        </div>
      </div>

      <SelectField
        label="연령대"
        name="age_group"
        options={AGE_GROUP_OPTIONS}
        defaultValue={team?.age_group ?? '20s'}
      />

      <SelectField
        label="실력"
        name="level"
        options={LEVEL_OPTIONS}
        defaultValue={team?.level ?? 'mid'}
        fill
      />

      {/* 로고 */}
      <div className="space-y-2">
        <Label>로고 <span className="text-zinc-400 font-normal">(선택)</span></Label>
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-zinc-300 hover:border-zinc-400"
            >
              {logoPreview ? (
                <img src={logoPreview} alt="로고" className="h-full w-full object-cover" />
              ) : (
                <span className="text-2xl text-zinc-300">+</span>
              )}
            </button>
            {logoPreview && (
              <button
                type="button"
                onClick={clearLogo}
                className="absolute right-0 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-600 text-white hover:bg-zinc-800"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            )}
          </div>
          <p className="text-sm text-zinc-500">
            {uploading ? '업로드 중...' : logoFileName ? logoFileName : '클릭하여 로고 업로드'}
          </p>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="instagram_handle">인스타그램 <span className="text-zinc-400 font-normal">(선택)</span></Label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">@</span>
          <Input id="instagram_handle" name="instagram_handle" defaultValue={team?.instagram_handle} className="pl-8" placeholder="계정명" />
        </div>
      </div>

      {state.error && (
        <p className="text-sm text-red-500">{state.error}</p>
      )}

      <div className="!mt-10 space-y-2">
        <Button type="submit" className="h-14 w-full !rounded-lg text-base" disabled={pending || uploading}>
          {pending ? '저장 중...' : isEditing ? '수정하기' : '등록하기'}
        </Button>
        {isEditing ? (
          <a href="/my-team" className="block w-full py-2 text-center text-base text-zinc-400 hover:text-zinc-600">
            취소하기
          </a>
        ) : (
          <a href="/my-team" className="block w-full py-2 text-center text-base text-zinc-400 hover:text-zinc-600">
            건너뛰기
          </a>
        )}
      </div>
    </form>
  )
}
