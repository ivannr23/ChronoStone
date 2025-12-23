import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query, generateUUID } from '@/lib/db'
import { searchBDNS, convertBDNSToGrant, BDNSConvocatoria } from '@/lib/bdns-api'

// Palabras clave para buscar subvenciones de patrimonio
const SEARCH_TERMS = [
  'patrimonio cultural',
  'patrimonio histórico',
  'restauración monumentos',
  'conservación arquitectónica',
  'bienes de interés cultural',
  'rehabilitación edificios históricos'
]

// POST - Sincronizar con BDNS
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const searchTerm = body.searchTerm || 'patrimonio'
    const soloAbiertas = body.soloAbiertas !== false

    console.log(`🔍 Buscando en BDNS: "${searchTerm}"`)

    // Buscar en BDNS
    const result = await searchBDNS({
      texto: searchTerm,
      abierta: soloAbiertas,
      pageSize: 100
    })

    // Si hay error de conexión con BDNS
    if (result.error) {
      return NextResponse.json({
        success: false,
        message: result.error,
        imported: 0,
        total: 0,
        bdnsUnavailable: true,
        needsToken: (result as any).needsToken || false
      })
    }

    if (result.convocatorias.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No se encontraron convocatorias con ese término de búsqueda',
        imported: 0,
        total: 0
      })
    }

    console.log(`📋 Encontradas ${result.convocatorias.length} convocatorias`)

    // Importar cada convocatoria
    let imported = 0
    let skipped = 0
    const errors: string[] = []

    for (const conv of result.convocatorias) {
      try {
        // Verificar si ya existe (por bdns_id o por nombre similar)
        const existing = await query(
          `SELECT id FROM grants WHERE name = $1 OR official_url LIKE $2`,
          [conv.titulo, `%${conv.bdnsId}%`]
        )

        if (existing && existing.length > 0) {
          skipped++
          continue
        }

        // Convertir al formato de nuestra BD
        const grantData = convertBDNSToGrant(conv)

        // Insertar
        await query(
          `INSERT INTO grants (
            id, name, description, organization, organization_type,
            region, heritage_types, protection_levels, eligible_beneficiaries,
            min_amount, max_amount, funding_percentage,
            call_open_date, call_close_date, year, status,
            official_url, required_documents, tags
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15, 'active', $16, $17, $18
          )`,
          [
            generateUUID(),
            grantData.name,
            grantData.description,
            grantData.organization,
            grantData.organization_type,
            grantData.region,
            JSON.stringify(grantData.heritage_types),
            JSON.stringify(grantData.protection_levels),
            JSON.stringify(grantData.eligible_beneficiaries),
            grantData.min_amount,
            grantData.max_amount,
            grantData.funding_percentage,
            grantData.call_open_date,
            grantData.call_close_date,
            grantData.year,
            grantData.official_url,
            JSON.stringify(grantData.required_documents),
            JSON.stringify(grantData.tags)
          ]
        )
        imported++
      } catch (e: any) {
        errors.push(`${conv.titulo}: ${e.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sincronización completada`,
      imported,
      skipped,
      total: result.total,
      errors: errors.length > 0 ? errors.slice(0, 5) : undefined
    })
  } catch (error: any) {
    console.error('Error syncing BDNS:', error)
    return NextResponse.json(
      { error: error.message || 'Error al sincronizar con BDNS' },
      { status: 500 }
    )
  }
}

// GET - Estado de la sincronización y búsqueda de prueba
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const searchTerm = searchParams.get('search') || 'patrimonio cultural'

    // Hacer búsqueda de prueba en BDNS
    const result = await searchBDNS({
      texto: searchTerm,
      abierta: true,
      pageSize: 10
    })

    return NextResponse.json({
      status: 'ok',
      bdnsAvailable: true,
      searchTerm,
      sampleResults: result.convocatorias.slice(0, 5).map(c => ({
        titulo: c.titulo,
        organo: c.organo,
        fechaFin: c.fechaFin,
        importe: c.importeTotal
      })),
      totalFound: result.total
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      bdnsAvailable: false,
      error: error.message
    })
  }
}

