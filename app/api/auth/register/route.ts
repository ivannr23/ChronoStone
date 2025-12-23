import { NextResponse } from 'next/server'
import { registerUser } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, fullName, plan = 'starter' } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      )
    }

    // Validar plan
    const validPlans = ['starter', 'professional', 'enterprise']
    if (!validPlans.includes(plan)) {
      return NextResponse.json(
        { error: 'Plan no válido' },
        { status: 400 }
      )
    }

    const userId = await registerUser(email, password, fullName, plan)

    // Solo starter tiene trial
    const hasTrial = plan === 'starter'

    return NextResponse.json({ 
      success: true, 
      userId,
      plan,
      hasTrial,
      message: hasTrial 
        ? 'Usuario creado. Prueba gratuita de 14 días activada.' 
        : 'Usuario creado. Procede al pago para activar tu plan.'
    })
  } catch (error: any) {
    console.error('Error registering user:', error)
    return NextResponse.json(
      { error: error.message || 'Error al crear el usuario' },
      { status: 500 }
    )
  }
}
