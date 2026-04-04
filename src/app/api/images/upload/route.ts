import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const cfFormData = new FormData()
  cfFormData.append('file', file)

  const accountId = process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGES_ACCOUNT_ID
  const apiToken = process.env.CLOUDFLARE_IMAGES_API_TOKEN

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
      body: cfFormData,
    }
  )

  const result = await response.json()

  if (!result.success) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }

  return NextResponse.json({
    url: result.result.variants[0],
    id: result.result.id,
  })
}
