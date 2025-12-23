import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

interface BDNSConvocatoria {
  id: number
  numeroConvocatoria: string
  descripcion: string
  descripcionLeng?: string | null
  fechaRecepcion: string
  nivel1: string // Municipio/Región
  nivel2: string // Organismo
  nivel3?: string | null
  rutaConvocatoria: string
  mrr?: boolean
  codigoInvente?: string | null
}

// Determinar región basándose en nivel1
function determinarRegion(nivel1: string): string {
  const regiones: Record<string, string> = {
    'ESTADO': 'nacional',
    'ANDALUCÍA': 'andalucia',
    'ARAGÓN': 'aragon',
    'CATALUÑA': 'cataluña',
    'COMUNIDAD FORAL DE NAVARRA': 'navarra',
    'COMUNITAT VALENCIANA': 'valencia',
    'EXTREMADURA': 'extremadura',
    'GALICIA': 'galicia',
    'ILLES BALEARS': 'baleares',
    'PAÍS VASCO': 'pais_vasco',
    'REGIÓN DE MURCIA': 'murcia',
    'CANTABRIA': 'cantabria',
    'MADRID': 'madrid',
  }
  
  // Buscar coincidencia exacta primero
  if (regiones[nivel1]) return regiones[nivel1]
  
  // Si es diputación provincial
  if (nivel1.startsWith('DIPUTACIÓN')) {
    return 'provincial'
  }
  
  // Si no coincide, es probablemente un municipio/ayuntamiento
  return 'local'
}

// Determinar tipo de organización
function determinarTipoOrganizacion(nivel2: string): string {
  if (nivel2.includes('MINISTERIO')) return 'ministerio'
  if (nivel2.includes('CONSEJERÍA') || nivel2.includes('DEPARTAMENT')) return 'comunidad_autonoma'
  if (nivel2.includes('AYUNTAMIENTO')) return 'ayuntamiento'
  if (nivel2.includes('DIPUTACIÓN')) return 'diputacion'
  if (nivel2.includes('UNIVERSIDAD')) return 'universidad'
  if (nivel2.includes('INSTITUTO') || nivel2.includes('AGENCIA')) return 'organismo_publico'
  if (nivel2.includes('CÁMARA')) return 'camara_comercio'
  if (nivel2.includes('CONSELL')) return 'consell_insular'
  return 'otro'
}

// Detectar si es relevante para patrimonio
function esRelevanteparaPatrimonio(descripcion: string): boolean {
  const keywords = [
    'patrimonio', 'restauración', 'rehabilitación', 'conservación',
    'histórico', 'cultural', 'monumento', 'arquitectura', 'arqueología',
    'museo', 'arte', 'artístico', 'imaginería', 'etnológic', 'festiv',
    'tradicional', 'popular', 'fachada', 'edificio', 'rural'
  ]
  
  const desc = descripcion.toLowerCase()
  return keywords.some(k => desc.includes(k))
}

// Detectar tipos de patrimonio
function detectarTiposPatrimonio(descripcion: string): string[] {
  const tipos: string[] = []
  const desc = descripcion.toLowerCase()
  
  if (desc.includes('arquitect') || desc.includes('edificio') || desc.includes('fachada')) {
    tipos.push('arquitectonico')
  }
  if (desc.includes('arqueolog')) tipos.push('arqueologico')
  if (desc.includes('histor')) tipos.push('historico')
  if (desc.includes('arte') || desc.includes('artístic')) tipos.push('artistico')
  if (desc.includes('etnol') || desc.includes('tradicional') || desc.includes('popular')) {
    tipos.push('etnologico')
  }
  if (desc.includes('natural') || desc.includes('paisaj')) tipos.push('natural')
  if (desc.includes('inmaterial') || desc.includes('festiv')) tipos.push('inmaterial')
  
  return tipos.length > 0 ? tipos : ['general']
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const body = await request.json()
    const convocatorias: BDNSConvocatoria[] = body.convocatorias || body

    if (!Array.isArray(convocatorias) || convocatorias.length === 0) {
      return NextResponse.json({ error: 'No se proporcionaron convocatorias válidas' }, { status: 400 })
    }

    let imported = 0
    let skipped = 0
    let relevantForHeritage = 0

    for (const conv of convocatorias) {
      try {
        // Verificar si ya existe por número de convocatoria
        const existing = await query(
          `SELECT id FROM grants WHERE official_url LIKE $1 OR name LIKE $2`,
          [`%${conv.numeroConvocatoria}%`, `%${conv.numeroConvocatoria}%`]
        )

        if (existing && existing.length > 0) {
          skipped++
          continue
        }

        const region = determinarRegion(conv.nivel1)
        const tipoOrg = determinarTipoOrganizacion(conv.nivel2)
        const esPatrimonio = esRelevanteparaPatrimonio(conv.descripcion)
        const tiposPatrimonio = esPatrimonio ? detectarTiposPatrimonio(conv.descripcion) : []
        
        if (esPatrimonio) relevantForHeritage++

        // Construir URL oficial
        const officialUrl = `https://www.pap.hacienda.gob.es/bdnstrans/GE/es/convocatoria/${conv.numeroConvocatoria}`

        const grantId = uuidv4()

        await query(
          `INSERT INTO grants (
            id, name, description, organization, organization_type,
            region, province, municipality,
            heritage_types, protection_levels, eligible_beneficiaries,
            min_amount, max_amount, funding_percentage,
            call_open_date, call_close_date, resolution_date, execution_deadline,
            year, status,
            official_url, bases_url, application_url,
            required_documents, notes, tags, created_by
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15, $16, $17, $18, $19,
            $20, $21, $22, $23, $24, $25, $26, $27
          )`,
          [
            grantId,
            conv.descripcion.substring(0, 255), // name
            conv.descripcionLeng || conv.descripcion, // description
            conv.nivel2, // organization
            tipoOrg, // organization_type
            region, // region
            conv.nivel1.startsWith('DIPUTACIÓN') ? conv.nivel1.replace('DIPUTACIÓN PROV. DE ', '') : null, // province
            !['ESTADO', 'ANDALUCÍA', 'ARAGÓN', 'CATALUÑA', 'EXTREMADURA', 'GALICIA', 'PAÍS VASCO', 'REGIÓN DE MURCIA', 'CANTABRIA', 'MADRID', 'ILLES BALEARS', 'COMUNIDAD FORAL DE NAVARRA'].includes(conv.nivel1) && !conv.nivel1.startsWith('DIPUTACIÓN') ? conv.nivel1 : null, // municipality
            JSON.stringify(tiposPatrimonio), // heritage_types
            JSON.stringify([]), // protection_levels
            JSON.stringify(['personas_fisicas', 'empresas', 'entidades']), // eligible_beneficiaries
            null, // min_amount
            null, // max_amount
            null, // funding_percentage
            conv.fechaRecepcion, // call_open_date
            null, // call_close_date
            null, // resolution_date
            null, // execution_deadline
            new Date(conv.fechaRecepcion).getFullYear(), // year
            'active', // status
            officialUrl, // official_url
            officialUrl, // bases_url
            officialUrl, // application_url
            JSON.stringify([]), // required_documents
            conv.mrr ? 'Financiado con fondos del Mecanismo de Recuperación y Resiliencia (MRR)' : null, // notes
            JSON.stringify(esPatrimonio ? ['patrimonio', 'cultural'] : ['general']), // tags
            userId // created_by
          ]
        )

        imported++
      } catch (error) {
        console.error(`Error importing convocatoria ${conv.numeroConvocatoria}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      relevantForHeritage,
      total: convocatorias.length,
      message: `Se importaron ${imported} convocatorias (${relevantForHeritage} relevantes para patrimonio). ${skipped} ya existían.`
    })

  } catch (error: any) {
    console.error('Error importing grants from JSON:', error)
    return NextResponse.json(
      { error: error.message || 'Error al importar convocatorias' },
      { status: 500 }
    )
  }
}

