import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { checkUsageLimit } from '@/lib/permissions'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limitType = searchParams.get('type') as 'projects' | 'storage' | 'models' | 'users'

    if (!userId || !limitType) {
      return NextResponse.json(
        { error: 'Missing userId or type parameter' },
        { status: 400 }
      )
    }

    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Verificar autenticación
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user || user.id !== userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar límite
    const result = await checkUsageLimit(userId, limitType)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error checking usage limit:', error)
    return NextResponse.json(
      { error: error.message || 'Error al verificar límite' },
      { status: 500 }
    )
  }
}

