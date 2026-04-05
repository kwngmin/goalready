'use client'

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { TeamCard } from '@/components/TeamCard'
import type { Team } from '@/types'

const GENDER_OPTIONS = [
  { value: 'male', label: '남성팀' },
  { value: 'female', label: '여성팀' },
  { value: 'mixed', label: '혼성팀' },
]

const LEVEL_OPTIONS = [
  { value: 'low', label: '하' },
  { value: 'low_mid', label: '중·하' },
  { value: 'mid', label: '중' },
  { value: 'mid_high', label: '중·상' },
  { value: 'high', label: '상' },
]

export function TeamListFilter({ teams }: { teams: Team[] }) {
  const [query, setQuery] = useState('')
  const [gender, setGender] = useState('')
  const [level, setLevel] = useState('')

  const filtered = useMemo(() => {
    return teams.filter((team) => {
      if (query && !team.name.toLowerCase().includes(query.toLowerCase())) return false
      if (gender && team.gender !== gender) return false
      if (level && team.level !== level) return false
      return true
    })
  }, [teams, query, gender, level])

  return (
    <div className="space-y-6">
      {/* 검색 + 필터 한줄 */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="팀 이름 검색"
            className="h-11 w-full rounded-lg border bg-background pl-10 pr-4 text-sm outline-none focus:border-zinc-400"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {GENDER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setGender(gender === opt.value ? '' : opt.value)}
              className={`h-9 rounded-full px-3 text-sm font-medium transition-colors ${
                gender === opt.value
                  ? 'bg-zinc-900 text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          {LEVEL_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setLevel(level === opt.value ? '' : opt.value)}
              className={`h-9 rounded-full px-3 text-sm font-medium transition-colors ${
                level === opt.value
                  ? 'bg-zinc-900 text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 결과 */}
      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-zinc-400">검색 결과가 없습니다.</p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-6">
          {filtered.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}
    </div>
  )
}
