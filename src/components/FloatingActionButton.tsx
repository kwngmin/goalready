'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'

export function FloatingActionButton() {
  return (
    <Link
      href="/my-team/activities/new"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
    >
      <Plus size={24} />
    </Link>
  )
}
