import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query, generateUUID } from '@/lib/db'

// Planes que permiten sincronización automática (solo Enterprise)
const PREMIUM_PLANS = ['enterprise']

// GET - Obtener configuración de sincronización
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userId = (session.user as any).id

    // Verificar plan del usuario
    const subscriptions = await query(
      `SELECT plan_id, status FROM subscriptions WHERE user_id = $1 AND status IN ('active', 'trialing')`,
      [userId]
    )
    
    const subscription = subscriptions?.[0] as any
    const canUseAutoSync = subscription && PREMIUM_PLANS.includes(subscription.plan_id)

    // Obtener configuración actual
    const configs = await query(
      `SELECT * FROM bdns_sync_config WHERE user_id = $1`,
      [userId]
    )

    const config = configs?.[0] as any

    return NextResponse.json({
      canUseAutoSync,
      currentPlan: subscription?.plan_id || 'free',
      requiredPlans: PREMIUM_PLANS,
      config: config ? {
        enabled: !!config.enabled,
        frequency: config.frequency || 'daily',
        searchTerms: typeof config.search_terms === 'string' 
          ? JSON.parse(config.search_terms) 
          : config.search_terms || ['patrimonio cultural'],
        lastSync: config.last_sync,
        nextSync: config.next_sync,
        autoImport: !!config.auto_import,
        notifyNew: !!config.notify_new
      } : null
    })
  } catch (error: any) {
    console.error('Error fetching sync config:', error)
    return NextResponse.json(
      { error: error.message || 'Error al obtener configuración' },
      { status: 500 }
    )
  }
}

// POST - Guardar configuración de sincronización
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userId = (session.user as any).id

    // Verificar plan del usuario
    const subscriptions = await query(
      `SELECT plan_id, status FROM subscriptions WHERE user_id = $1 AND status IN ('active', 'trialing')`,
      [userId]
    )
    
    const subscription = subscriptions?.[0] as any
    const canUseAutoSync = subscription && PREMIUM_PLANS.includes(subscription.plan_id)

    if (!canUseAutoSync) {
      return NextResponse.json(
        { error: 'Esta función requiere plan Professional o Enterprise' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      enabled,
      frequency,
      searchTerms,
      autoImport,
      notifyNew
    } = body

    // Validar frecuencia
    const validFrequencies = ['hourly', 'daily', 'weekly']
    if (frequency && !validFrequencies.includes(frequency)) {
      return NextResponse.json(
        { error: 'Frecuencia no válida' },
        { status: 400 }
      )
    }

    // Calcular próxima sincronización
    let nextSync = null
    if (enabled) {
      const now = new Date()
      switch (frequency) {
        case 'hourly':
          nextSync = new Date(now.getTime() + 60 * 60 * 1000)
          break
        case 'daily':
          nextSync = new Date(now.getTime() + 24 * 60 * 60 * 1000)
          break
        case 'weekly':
          nextSync = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
          break
      }
    }

    // Verificar si existe configuración
    const existing = await query(
      `SELECT id FROM bdns_sync_config WHERE user_id = $1`,
      [userId]
    )

    if (existing && existing.length > 0) {
      // Actualizar
      await query(
        `UPDATE bdns_sync_config SET 
          enabled = $1,
          frequency = $2,
          search_terms = $3,
          auto_import = $4,
          notify_new = $5,
          next_sync = $6,
          updated_at = datetime('now')
         WHERE user_id = $7`,
        [
          enabled ? 1 : 0,
          frequency || 'daily',
          JSON.stringify(searchTerms || ['patrimonio cultural']),
          autoImport !== false ? 1 : 0,
          notifyNew !== false ? 1 : 0,
          nextSync?.toISOString() || null,
          userId
        ]
      )
    } else {
      // Crear
      await query(
        `INSERT INTO bdns_sync_config (
          id, user_id, enabled, frequency, search_terms, 
          auto_import, notify_new, next_sync
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          generateUUID(),
          userId,
          enabled ? 1 : 0,
          frequency || 'daily',
          JSON.stringify(searchTerms || ['patrimonio cultural']),
          autoImport !== false ? 1 : 0,
          notifyNew !== false ? 1 : 0,
          nextSync?.toISOString() || null
        ]
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Configuración guardada',
      nextSync: nextSync?.toISOString()
    })
  } catch (error: any) {
    console.error('Error saving sync config:', error)
    return NextResponse.json(
      { error: error.message || 'Error al guardar configuración' },
      { status: 500 }
    )
  }
}

