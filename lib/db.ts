import { neon, neonConfig } from '@neondatabase/serverless'

// Detectar entorno
const isProduction = process.env.NODE_ENV === 'production'
const useNeon = isProduction || process.env.USE_NEON === 'true'

// Tipos de la base de datos
export interface User {
  id: string
  email: string
  password_hash: string | null
  full_name: string | null
  company: string | null
  phone: string | null
  avatar_url: string | null
  role: 'user' | 'admin'
  email_verified: number | boolean
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan_id: string
  status: string
  stripe_subscription_id: string | null
  stripe_customer_id: string | null
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: number | boolean
  trial_start: string | null
  trial_end: string | null
  created_at: string
  updated_at: string
}

export interface UsageLimits {
  user_id: string
  projects_count: number
  storage_used: number
  models_3d_count: number
  last_reset_date: string
}

export interface Project {
  id: string
  user_id: string
  name: string
  description: string | null
  status: string
  location: string | null
  start_date: string | null
  end_date: string | null
  is_trial_project: number | boolean
  created_at: string
  updated_at: string
}

export interface Model3D {
  id: string
  project_id: string
  user_id: string
  name: string
  file_url: string
  file_size: number
  file_type: string | null
  thumbnail_url: string | null
  processing_status: string
  created_at: string
  updated_at: string
}

// ============================================
// CLIENTE NEON (Producción)
// ============================================
let neonClient: any = null

function getNeonClient() {
  if (!neonClient) {
    neonConfig.fetchConnectionCache = true
    neonClient = neon(process.env.DATABASE_URL!)
  }
  return neonClient
}

async function neonQuery<T>(queryString: string, params: any[] = []): Promise<T[]> {
  const sql = getNeonClient()
  const result = await sql(queryString, params)
  return result as T[]
}

// ============================================
// CLIENTE SQLITE (Desarrollo)
// ============================================
let sqliteDb: any = null

function getSqliteDb() {
  if (!sqliteDb) {
    // Dynamic import para evitar errores en producción
    const Database = require('better-sqlite3')
    const path = require('path')
    const dbPath = path.join(process.cwd(), 'dev.db')
    sqliteDb = new Database(dbPath)
    sqliteDb.pragma('journal_mode = WAL')
  }
  return sqliteDb
}

// Generar UUID compatible
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

function sqliteQuery<T>(queryString: string, params: any[] = []): T[] {
  const db = getSqliteDb()
  
  // Convertir sintaxis PostgreSQL a SQLite
  let sqliteQueryStr = queryString
    // $1, $2 -> ?
    .replace(/\$(\d+)/g, '?')
    // NOW() -> datetime('now')
    .replace(/NOW\(\)/gi, "datetime('now')")
    // INTERVAL '14 days' -> datetime('now', '+14 days')
    .replace(/NOW\(\)\s*\+\s*INTERVAL\s*'(\d+)\s*days?'/gi, "datetime('now', '+$1 days')")
    // boolean true/false en query string -> 1/0
    .replace(/\btrue\b/gi, '1')
    .replace(/\bfalse\b/gi, '0')
  
  // Reemplazar gen_random_uuid() o uuid_generate_v4() con UUID generado
  while (sqliteQueryStr.includes('gen_random_uuid()') || sqliteQueryStr.includes('uuid_generate_v4()')) {
    sqliteQueryStr = sqliteQueryStr
      .replace('gen_random_uuid()', `'${generateUUID()}'`)
      .replace('uuid_generate_v4()', `'${generateUUID()}'`)
  }

  // Convertir parámetros: booleanos a 0/1, undefined a null
  const sqliteParams = params.map(param => {
    if (param === true) return 1
    if (param === false) return 0
    if (param === undefined) return null
    return param
  })
  
  try {
    const isSelect = sqliteQueryStr.trim().toUpperCase().startsWith('SELECT')
    const stmt = db.prepare(sqliteQueryStr)
    
    if (isSelect) {
      return stmt.all(...sqliteParams) as T[]
    } else {
      stmt.run(...sqliteParams)
      return []
    }
  } catch (error) {
    console.error('SQLite query error:', error)
    console.error('Query:', sqliteQueryStr)
    console.error('Params:', sqliteParams)
    throw error
  }
}

// ============================================
// API PÚBLICA (Unificada)
// ============================================

export async function query<T>(queryString: string, params: any[] = []): Promise<T[]> {
  if (useNeon) {
    return neonQuery<T>(queryString, params)
  } else {
    return sqliteQuery<T>(queryString, params)
  }
}

export async function queryOne<T>(queryString: string, params: any[] = []): Promise<T | null> {
  const results = await query<T>(queryString, params)
  return results[0] || null
}

// Utilidades adicionales exportadas
export { generateUUID }
