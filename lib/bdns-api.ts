/**
 * Cliente para la API de la Base de Datos Nacional de Subvenciones (BDNS)
 * Documentación: https://www.infosubvenciones.es/bdnstrans/doc/swagger
 * 
 * La API de BDNS utiliza endpoints REST que devuelven JSON
 * IMPORTANTE: Requiere autenticación Bearer Token
 */

// Endpoint para buscar convocatorias
const BDNS_API_URL = 'https://www.infosubvenciones.es/bdnstrans/api/convocatorias'
// Alternativa si la anterior no funciona
const BDNS_SEARCH_URL = 'https://www.pap.hacienda.gob.es/bdnstrans/api/convocatorias/buscar'

// Token de autenticación (se obtiene registrándose en la API de BDNS)
const getBDNSToken = () => process.env.BDNS_API_TOKEN || ''

// Palabras clave para filtrar subvenciones de patrimonio
const PATRIMONIO_KEYWORDS = [
  'patrimonio',
  'restauración',
  'conservación',
  'rehabilitación',
  'monumento',
  'histórico',
  'cultural',
  'BIC',
  'bien de interés cultural',
  'arquitectura',
  'iglesia',
  'catedral',
  'castillo',
  'arqueología',
  'museo'
]

export interface BDNSConvocatoria {
  bdnsId: string
  titulo: string
  descripcion: string
  organo: string
  fechaInicio: string
  fechaFin: string
  importeTotal: number
  tipoConvocatoria: string
  finalidad: string
  enlace: string
}

export interface BDNSSearchParams {
  texto?: string
  fechaDesde?: string
  fechaHasta?: string
  organo?: string
  abierta?: boolean
  page?: number
  pageSize?: number
}

/**
 * Buscar convocatorias en la BDNS
 * La API pública de BDNS puede no estar disponible o tener restricciones
 * En ese caso, devolvemos un array vacío con un mensaje informativo
 */
export async function searchBDNS(params: BDNSSearchParams = {}): Promise<{
  convocatorias: BDNSConvocatoria[]
  total: number
  page: number
  error?: string
  needsToken?: boolean
}> {
  const page = params.page || 1
  const pageSize = params.pageSize || 50

  // Lista de endpoints a probar
  const endpoints = [
    {
      url: `${BDNS_API_URL}`,
      buildParams: () => {
        const p = new URLSearchParams()
        if (params.texto) p.append('texto', params.texto)
        if (params.abierta !== undefined) p.append('abierta', params.abierta ? 'S' : 'N')
        p.append('numPag', page.toString())
        p.append('tamPag', pageSize.toString())
        return p.toString()
      }
    },
    {
      url: `${BDNS_SEARCH_URL}`,
      buildParams: () => {
        const p = new URLSearchParams()
        if (params.texto) p.append('q', params.texto)
        if (params.abierta !== undefined) p.append('estado', params.abierta ? 'abierta' : 'cerrada')
        p.append('page', page.toString())
        p.append('size', pageSize.toString())
        return p.toString()
      }
    }
  ]

  const token = getBDNSToken()
  
  for (const endpoint of endpoints) {
    try {
      const queryString = endpoint.buildParams()
      const url = `${endpoint.url}?${queryString}`
      
      console.log(`Intentando endpoint BDNS: ${url}`)
      
      // Preparar headers con autenticación Bearer si hay token
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'User-Agent': 'ChronoStone/1.0'
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(15000)
      })

      // Si no es JSON, probar el siguiente endpoint
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.log(`Endpoint ${endpoint.url} no devuelve JSON, probando siguiente...`)
        continue
      }

      if (!response.ok) {
        console.log(`Endpoint ${endpoint.url} devolvió ${response.status}, probando siguiente...`)
        continue
      }

      const data = await response.json()
      
      // Mapear respuesta a nuestro formato (adaptable a diferentes estructuras)
      const items = data.convocatorias || data.resultados || data.content || data.data || []
      
      const convocatorias: BDNSConvocatoria[] = items.map((item: any) => ({
        bdnsId: item.idConvocatoria || item.bdns || item.id || item.codigo,
        titulo: item.titulo || item.tituloConvocatoria || item.nombre || '',
        descripcion: item.descripcion || item.objeto || item.resumen || '',
        organo: item.organo || item.administracion || item.organoConvocante || item.entidad || '',
        fechaInicio: item.fechaInicioSolicitud || item.fechaInicio || item.fechaApertura || '',
        fechaFin: item.fechaFinSolicitud || item.fechaFin || item.fechaCierre || item.plazo || '',
        importeTotal: parseFloat(item.importeTotal || item.importe || item.presupuesto || '0') || 0,
        tipoConvocatoria: item.tipoConvocatoria || item.tipo || '',
        finalidad: item.finalidad || item.tipoBeneficiario || item.sector || '',
        enlace: item.url || item.enlace || item.link || `https://www.pap.hacienda.gob.es/bdnstrans/GE/es/convocatoria/${item.idConvocatoria || item.bdns || item.id}`
      }))

      return {
        convocatorias,
        total: data.totalResultados || data.total || data.totalElements || convocatorias.length,
        page
      }
    } catch (error) {
      console.log(`Error en endpoint ${endpoint.url}:`, error)
      continue
    }
  }

  // Si ningún endpoint funcionó, devolver mensaje informativo
  console.log('No se pudo conectar con ningún endpoint de BDNS')
  
  const errorMessage = !token
    ? 'La API de BDNS requiere autenticación. Configura tu token de acceso en BDNS_API_TOKEN. Puedes obtener un token registrándote en https://www.infosubvenciones.es'
    : 'La API de BDNS no está disponible en este momento. Puede que el token sea inválido o la API tenga restricciones. Puedes añadir subvenciones manualmente o intentarlo más tarde.'
  
  return {
    convocatorias: [],
    total: 0,
    page,
    error: errorMessage,
    needsToken: !token
  }
}

/**
 * Buscar subvenciones de patrimonio específicamente
 */
export async function searchPatrimonioGrants(params: {
  keyword?: string
  soloAbiertas?: boolean
  page?: number
} = {}): Promise<{
  convocatorias: BDNSConvocatoria[]
  total: number
}> {
  const keyword = params.keyword || 'patrimonio cultural'
  
  try {
    const result = await searchBDNS({
      texto: keyword,
      abierta: params.soloAbiertas !== false,
      page: params.page || 1,
      pageSize: 100
    })

    // Filtrar por relevancia (que contengan palabras clave de patrimonio)
    const filteredConvocatorias = result.convocatorias.filter(conv => {
      const texto = `${conv.titulo} ${conv.descripcion} ${conv.finalidad}`.toLowerCase()
      return PATRIMONIO_KEYWORDS.some(kw => texto.includes(kw.toLowerCase()))
    })

    return {
      convocatorias: filteredConvocatorias,
      total: filteredConvocatorias.length
    }
  } catch (error) {
    console.error('Error searching patrimonio grants:', error)
    return { convocatorias: [], total: 0 }
  }
}

/**
 * Obtener detalle de una convocatoria
 */
export async function getBDNSConvocatoriaDetail(bdnsId: string): Promise<BDNSConvocatoria | null> {
  try {
    const url = `${BDNS_API_URL}/${bdnsId}`
    
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(15000)
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    
    return {
      bdnsId: data.idConvocatoria || bdnsId,
      titulo: data.titulo || '',
      descripcion: data.descripcion || data.objeto || '',
      organo: data.organo || data.administracion || '',
      fechaInicio: data.fechaInicioSolicitud || '',
      fechaFin: data.fechaFinSolicitud || '',
      importeTotal: parseFloat(data.importeTotal || '0') || 0,
      tipoConvocatoria: data.tipoConvocatoria || '',
      finalidad: data.finalidad || '',
      enlace: `https://www.pap.hacienda.gob.es/bdnstrans/GE/es/convocatoria/${bdnsId}`
    }
  } catch (error) {
    console.error('Error fetching BDNS detail:', error)
    return null
  }
}

/**
 * Convertir convocatoria BDNS a formato de nuestra BD
 */
export function convertBDNSToGrant(conv: BDNSConvocatoria) {
  // Determinar región basándose en el órgano
  let region = 'nacional'
  const organoLower = conv.organo.toLowerCase()
  
  if (organoLower.includes('andaluc')) region = 'andalucia'
  else if (organoLower.includes('aragón') || organoLower.includes('aragon')) region = 'aragon'
  else if (organoLower.includes('asturias')) region = 'asturias'
  else if (organoLower.includes('balear')) region = 'baleares'
  else if (organoLower.includes('canaria')) region = 'canarias'
  else if (organoLower.includes('cantabria')) region = 'cantabria'
  else if (organoLower.includes('castilla y león') || organoLower.includes('castilla-león')) region = 'castilla_leon'
  else if (organoLower.includes('castilla-la mancha') || organoLower.includes('castilla la mancha')) region = 'castilla_mancha'
  else if (organoLower.includes('cataluñ') || organoLower.includes('catalunya') || organoLower.includes('generalitat de cat')) region = 'cataluna'
  else if (organoLower.includes('valencia') || organoLower.includes('generalitat val')) region = 'comunidad_valenciana'
  else if (organoLower.includes('extremadura')) region = 'extremadura'
  else if (organoLower.includes('galicia') || organoLower.includes('xunta')) region = 'galicia'
  else if (organoLower.includes('madrid') && !organoLower.includes('ministerio')) region = 'madrid'
  else if (organoLower.includes('murcia')) region = 'murcia'
  else if (organoLower.includes('navarra')) region = 'navarra'
  else if (organoLower.includes('país vasco') || organoLower.includes('euskadi') || organoLower.includes('gobierno vasco')) region = 'pais_vasco'
  else if (organoLower.includes('rioja')) region = 'la_rioja'

  // Determinar tipo de organismo
  let organizationType = 'ccaa'
  if (organoLower.includes('ministerio')) organizationType = 'ministerio'
  else if (organoLower.includes('diputación') || organoLower.includes('diputacion')) organizationType = 'diputacion'
  else if (organoLower.includes('ayuntamiento')) organizationType = 'ayuntamiento'
  else if (organoLower.includes('fundación') || organoLower.includes('fundacion')) organizationType = 'fundacion'
  else if (organoLower.includes('europe') || organoLower.includes('ue ') || organoLower.includes('feder')) organizationType = 'europeo'

  // Detectar tipos de patrimonio en el título/descripción
  const textoCompleto = `${conv.titulo} ${conv.descripcion} ${conv.finalidad}`.toLowerCase()
  const heritageTypes: string[] = []
  
  if (textoCompleto.includes('iglesia') || textoCompleto.includes('ermita') || textoCompleto.includes('catedral') || textoCompleto.includes('templo')) {
    heritageTypes.push('iglesia')
  }
  if (textoCompleto.includes('castillo') || textoCompleto.includes('fortaleza') || textoCompleto.includes('muralla')) {
    heritageTypes.push('castillo')
  }
  if (textoCompleto.includes('monumento')) {
    heritageTypes.push('monumento')
  }
  if (textoCompleto.includes('arqueolog')) {
    heritageTypes.push('arqueologico')
  }
  if (textoCompleto.includes('civil') || textoCompleto.includes('palacio') || textoCompleto.includes('casa señorial')) {
    heritageTypes.push('civil')
  }
  if (textoCompleto.includes('industrial')) {
    heritageTypes.push('industrial')
  }
  
  // Si no detectamos ninguno, poner genérico
  if (heritageTypes.length === 0) {
    heritageTypes.push('monumento')
  }

  return {
    bdns_id: conv.bdnsId,
    name: conv.titulo,
    description: conv.descripcion,
    organization: conv.organo,
    organization_type: organizationType,
    region,
    heritage_types: heritageTypes,
    protection_levels: ['BIC', 'BRL'],
    eligible_beneficiaries: ['ayuntamiento', 'diocesis', 'fundacion', 'particular'],
    min_amount: null,
    max_amount: conv.importeTotal || null,
    funding_percentage: null,
    call_open_date: conv.fechaInicio || null,
    call_close_date: conv.fechaFin || null,
    year: new Date().getFullYear(),
    status: 'active',
    official_url: conv.enlace,
    required_documents: [],
    tags: ['bdns', 'oficial']
  }
}

