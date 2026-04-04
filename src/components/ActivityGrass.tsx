'use client'

import { useState, useMemo } from 'react'

interface ActivityGrassProps {
  /** 활동 날짜별 횟수 (예: { '2026-03-15': 1, '2026-03-20': 2 }) */
  activityMap: Record<string, number>
}

const DAYS = ['일', '월', '화', '수', '목', '금', '토']
const CELL_SIZE = 13
const CELL_GAP = 2

function getIntensity(count: number): string {
  if (count === 0) return 'bg-zinc-100'
  if (count === 1) return 'bg-emerald-200'
  if (count === 2) return 'bg-emerald-400'
  return 'bg-emerald-600'
}

export function ActivityGrass({ activityMap }: ActivityGrassProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const { weeks, months } = useMemo(() => {
    const today = new Date()
    const startDate = new Date(today)
    startDate.setFullYear(startDate.getFullYear() - 1)
    // 일요일로 맞추기
    startDate.setDate(startDate.getDate() - startDate.getDay())

    const weeks: { date: Date; dateStr: string; count: number }[][] = []
    const months: { label: string; col: number }[] = []
    let currentWeek: { date: Date; dateStr: string; count: number }[] = []
    let lastMonth = -1

    const cursor = new Date(startDate)
    let weekIndex = 0

    while (cursor <= today) {
      const month = cursor.getMonth()
      if (month !== lastMonth && cursor.getDay() === 0) {
        const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
        months.push({ label: monthNames[month], col: weekIndex })
        lastMonth = month
      }

      const dateStr = cursor.toISOString().split('T')[0]
      currentWeek.push({
        date: new Date(cursor),
        dateStr,
        count: activityMap[dateStr] ?? 0,
      })

      if (cursor.getDay() === 6 || cursor.getTime() >= today.getTime()) {
        weeks.push(currentWeek)
        currentWeek = []
        weekIndex++
      }

      cursor.setDate(cursor.getDate() + 1)
    }

    if (currentWeek.length > 0) {
      weeks.push(currentWeek)
    }

    return { weeks, months }
  }, [activityMap])

  const totalCount = Object.values(activityMap).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <p className="text-sm text-zinc-500">
          최근 1년간 <span className="font-semibold text-zinc-900">{totalCount}회</span> 활동
        </p>
        {selectedDate && (
          <p className="text-sm text-zinc-500">
            {selectedDate} — {activityMap[selectedDate] ?? 0}회
          </p>
        )}
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block">
          {/* 월 라벨 */}
          <div className="flex" style={{ marginLeft: 28 }}>
            {months.map((m, i) => {
              const nextCol = months[i + 1]?.col ?? weeks.length
              const span = nextCol - m.col
              return (
                <span
                  key={`${m.label}-${m.col}`}
                  className="text-xs text-zinc-400"
                  style={{ width: span * (CELL_SIZE + CELL_GAP), flexShrink: 0 }}
                >
                  {m.label}
                </span>
              )
            })}
          </div>

          <div className="flex gap-0.5">
            {/* 요일 라벨 */}
            <div className="flex flex-col" style={{ gap: CELL_GAP, marginRight: 4 }}>
              {DAYS.map((day, i) => (
                <span
                  key={day}
                  className="text-xs text-zinc-400"
                  style={{
                    height: CELL_SIZE,
                    lineHeight: `${CELL_SIZE}px`,
                    visibility: i % 2 === 1 ? 'visible' : 'hidden',
                  }}
                >
                  {day}
                </span>
              ))}
            </div>

            {/* 잔디 셀 */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col" style={{ gap: CELL_GAP }}>
                {week.map((day) => (
                  <button
                    key={day.dateStr}
                    type="button"
                    onClick={() => setSelectedDate(day.dateStr === selectedDate ? null : day.dateStr)}
                    title={`${day.dateStr}: ${day.count}회`}
                    className={`rounded-sm transition-transform hover:scale-125 ${getIntensity(day.count)} ${
                      day.dateStr === selectedDate ? 'ring-2 ring-zinc-400' : ''
                    }`}
                    style={{ width: CELL_SIZE, height: CELL_SIZE }}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* 범례 */}
          <div className="mt-2 flex items-center justify-end gap-1 text-xs text-zinc-400">
            <span>적음</span>
            <span className="inline-block h-3 w-3 rounded-sm bg-zinc-100" />
            <span className="inline-block h-3 w-3 rounded-sm bg-emerald-200" />
            <span className="inline-block h-3 w-3 rounded-sm bg-emerald-400" />
            <span className="inline-block h-3 w-3 rounded-sm bg-emerald-600" />
            <span>많음</span>
          </div>
        </div>
      </div>
    </div>
  )
}
