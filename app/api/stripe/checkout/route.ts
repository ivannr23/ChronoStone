import { NextResponse } from 'next/server'
import { createCheckoutSession } from '@/lib/stripe'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Verificar autenticación
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener datos del request
    const body = await request.json()
    const { planId } = body

    if (!planId || !['starter', 'professional', 'enterprise'].includes(planId)) {
      return NextResponse.json({ error: 'Plan inválido' }, { status: 400 })
    }

    // Crear sesión de checkout
    const session = await createCheckoutSession({
      userId: user.id,
      email: user.email!,
      planId: planId as any,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?checkout=canceled`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: error.message || 'Error al crear sesión de pago' },
      { status: 500 }
    )
  }
}

