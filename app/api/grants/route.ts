import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'

// Función para parsear campos JSON de SQLite
function parseGrant(grant: any) {
  if (!grant) return grant
  return {
    ...grant,
    heritage_types: typeof grant.heritage_types === 'string' 
      ? JSON.parse(grant.heritage_types || '[]') 
      : grant.heritage_types || [],
    protection_levels: typeof grant.protection_levels === 'string' 
      ? JSON.parse(grant.protection_levels || '[]') 
      : grant.protection_levels || [],
    eligible_beneficiaries: typeof grant.eligible_beneficiaries === 'string' 
      ? JSON.parse(grant.eligible_beneficiaries || '[]') 
      : grant.eligible_beneficiaries || [],
    required_documents: typeof grant.required_documents === 'string' 
      ? JSON.parse(grant.required_documents || '[]') 
      : grant.required_documents || [],
    tags: typeof grant.tags === 'string' 
      ? JSON.parse(grant.tags || '[]') 
      : grant.tags || [],
  }
}

// GET - Buscar subvenciones con filtros
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parámetros de filtro
    const search = searchParams.get('search') || ''
    const region = searchParams.get('region')
    const organizationType = searchParams.get('organizationType')
    const heritageType = searchParams.get('heritageType')
    const minAmount = searchParams.get('minAmount')
    const maxAmount = searchParams.get('maxAmount')
    const status = searchParams.get('status') || 'active'
    const year = searchParams.get('year')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Construir query dinámicamente
    let whereConditions: string[] = []
    let values: any[] = []
    let paramIndex = 1

    // Filtro por estado
    if (status) {
      whereConditions.push(`status = $${paramIndex}`)
      values.push(status)
      paramIndex++
    }

    // Búsqueda por texto (usar LIKE para SQLite, ILIKE para PostgreSQL)
    if (search) {
      whereConditions.push(`(name LIKE $${paramIndex} OR description LIKE $${paramIndex} OR organization LIKE $${paramIndex})`)
      values.push(`%${search}%`)
      paramIndex++
    }

    // Filtro por región
    if (region && region !== 'all') {
      whereConditions.push(`(region = $${paramIndex} OR region = 'nacional')`)
      values.push(region)
      paramIndex++
    }

    // Filtro por tipo de organismo
    if (organizationType && organizationType !== 'all') {
      whereConditions.push(`organization_type = $${paramIndex}`)
      values.push(organizationType)
      paramIndex++
    }

    // Filtro por tipo de patrimonio (buscar en JSON string para SQLite)
    if (heritageType && heritageType !== 'all') {
      whereConditions.push(`heritage_types LIKE $${paramIndex}`)
      values.push(`%"${heritageType}"%`)
      paramIndex++
    }

    // Filtro por cuantía mínima
    if (minAmount) {
      whereConditions.push(`(max_amount >= $${paramIndex} OR max_amount IS NULL)`)
      values.push(parseFloat(minAmount))
      paramIndex++
    }

    // Filtro por cuantía máxima
    if (maxAmount) {
      whereConditions.push(`(min_amount <= $${paramIndex} OR min_amount IS NULL)`)
      values.push(parseFloat(maxAmount))
      paramIndex++
    }

    // Filtro por año
    if (year) {
      whereConditions.push(`year = $${paramIndex}`)
      values.push(parseInt(year))
      paramIndex++
    }

    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ')
      : ''

    // Obtener total
    const countResult = await query(
      `SELECT COUNT(*) as total FROM grants ${whereClause}`,
      values
    )
    const total = parseInt(countResult[0]?.total || '0')

    // Obtener subvenciones
    values.push(limit)
    values.push(offset)
    
    const grantsRaw = await query(
      `SELECT * FROM grants ${whereClause} 
       ORDER BY call_close_date ASC, created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      values
    )

    // Parsear campos JSON
    const grants = (grantsRaw as any[]).map(parseGrant)

    return NextResponse.json({
      grants,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error: any) {
    console.error('Error fetching grants:', error)
    return NextResponse.json(
      { error: error.message || 'Error al buscar subvenciones' },
      { status: 500 }
    )
  }
}

// POST - Crear nueva subvención (solo admin)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // TODO: Verificar que es admin
    const userId = (session.user as any).id
    const body = await request.json()

    const {
      name,
      description,
      organization,
      organizationType,
      region,
      province,
      municipality,
      heritageTypes,
      protectionLevels,
      eligibleBeneficiaries,
      minAmount,
      maxAmount,
      fundingPercentage,
      callOpenDate,
      callCloseDate,
      resolutionDate,
      executionDeadline,
      year,
      officialUrl,
      basesUrl,
      applicationUrl,
      requiredDocuments,
      notes,
      tags
    } = body

    if (!name || !organization || !organizationType) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    const result = await query(
      `INSERT INTO grants (
        name, description, organization, organization_type,
        region, province, municipality,
        heritage_types, protection_levels, eligible_beneficiaries,
        min_amount, max_amount, funding_percentage,
        call_open_date, call_close_date, resolution_date, execution_deadline,
        year, status,
        official_url, bases_url, application_url,
        required_documents, notes, tags, created_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, 'active',
        $19, $20, $21, $22, $23, $24, $25
      ) RETURNING id`,
      [
        name, description, organization, organizationType,
        region, province, municipality,
        heritageTypes || [], protectionLevels || [], eligibleBeneficiaries || [],
        minAmount, maxAmount, fundingPercentage,
        callOpenDate, callCloseDate, resolutionDate, executionDeadline,
        year || new Date().getFullYear(),
        officialUrl, basesUrl, applicationUrl,
        JSON.stringify(requiredDocuments || []), notes, tags || [], userId
      ]
    )

    return NextResponse.json({
      success: true,
      grantId: result[0]?.id,
      message: 'Subvención creada exitosamente'
    })
  } catch (error: any) {
    console.error('Error creating grant:', error)
    return NextResponse.json(
      { error: error.message || 'Error al crear subvención' },
      { status: 500 }
    )
  }
}

