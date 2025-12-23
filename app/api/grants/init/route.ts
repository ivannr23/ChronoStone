import { NextResponse } from 'next/server'

// Esta API crea las tablas de subvenciones
// Funciona con SQLite (desarrollo) y PostgreSQL/Neon (producción)

const isNeon = process.env.NODE_ENV === 'production' || process.env.USE_NEON === 'true'

export async function POST() {
  try {
    if (isNeon) {
      // PostgreSQL / Neon
      const { neon } = await import('@neondatabase/serverless')
      const sql = neon(process.env.DATABASE_URL!)

      await sql`
        CREATE TABLE IF NOT EXISTS grants (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(500) NOT NULL,
          description TEXT,
          organization VARCHAR(255) NOT NULL,
          organization_type VARCHAR(50) NOT NULL,
          region VARCHAR(100),
          province VARCHAR(100),
          municipality VARCHAR(100),
          heritage_types TEXT[],
          protection_levels TEXT[],
          eligible_beneficiaries TEXT[],
          min_amount DECIMAL(12,2),
          max_amount DECIMAL(12,2),
          funding_percentage INTEGER,
          call_open_date DATE,
          call_close_date DATE,
          resolution_date DATE,
          execution_deadline DATE,
          status VARCHAR(50) DEFAULT 'active',
          year INTEGER,
          official_url TEXT,
          bases_url TEXT,
          application_url TEXT,
          required_documents JSONB DEFAULT '[]',
          notes TEXT,
          tags TEXT[],
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_by UUID
        )
      `

      await sql`
        CREATE TABLE IF NOT EXISTS grant_alerts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          regions TEXT[],
          heritage_types TEXT[],
          organization_types TEXT[],
          min_amount DECIMAL(12,2),
          email_enabled BOOLEAN DEFAULT true,
          push_enabled BOOLEAN DEFAULT true,
          frequency VARCHAR(20) DEFAULT 'immediate',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `

      await sql`
        CREATE TABLE IF NOT EXISTS grant_applications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          grant_id UUID,
          project_id UUID,
          reference_number VARCHAR(100),
          status VARCHAR(50) DEFAULT 'draft',
          requested_amount DECIMAL(12,2),
          approved_amount DECIMAL(12,2),
          submission_date DATE,
          resolution_date DATE,
          notification_date DATE,
          documents JSONB DEFAULT '[]',
          checklist JSONB DEFAULT '[]',
          notes TEXT,
          resolution_notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `

      await sql`
        CREATE TABLE IF NOT EXISTS grant_favorites (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          grant_id UUID NOT NULL,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, grant_id)
        )
      `

      await sql`
        CREATE TABLE IF NOT EXISTS grant_notifications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          grant_id UUID,
          application_id UUID,
          type VARCHAR(50) NOT NULL,
          title VARCHAR(255) NOT NULL,
          message TEXT,
          read BOOLEAN DEFAULT false,
          read_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `

    } else {
      // SQLite (desarrollo)
      const Database = require('better-sqlite3')
      const path = require('path')
      const dbPath = path.join(process.cwd(), 'dev.db')
      const db = new Database(dbPath)

      // Grants
      db.exec(`
        CREATE TABLE IF NOT EXISTS grants (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          organization TEXT NOT NULL,
          organization_type TEXT NOT NULL,
          region TEXT,
          province TEXT,
          municipality TEXT,
          heritage_types TEXT,
          protection_levels TEXT,
          eligible_beneficiaries TEXT,
          min_amount REAL,
          max_amount REAL,
          funding_percentage INTEGER,
          call_open_date TEXT,
          call_close_date TEXT,
          resolution_date TEXT,
          execution_deadline TEXT,
          status TEXT DEFAULT 'active',
          year INTEGER,
          official_url TEXT,
          bases_url TEXT,
          application_url TEXT,
          required_documents TEXT DEFAULT '[]',
          notes TEXT,
          tags TEXT,
          created_at TEXT DEFAULT (datetime('now')),
          updated_at TEXT DEFAULT (datetime('now')),
          created_by TEXT
        )
      `)

      // Grant Alerts
      db.exec(`
        CREATE TABLE IF NOT EXISTS grant_alerts (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          regions TEXT,
          heritage_types TEXT,
          organization_types TEXT,
          min_amount REAL,
          email_enabled INTEGER DEFAULT 1,
          push_enabled INTEGER DEFAULT 1,
          frequency TEXT DEFAULT 'immediate',
          created_at TEXT DEFAULT (datetime('now')),
          updated_at TEXT DEFAULT (datetime('now'))
        )
      `)

      // Grant Applications
      db.exec(`
        CREATE TABLE IF NOT EXISTS grant_applications (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          grant_id TEXT,
          project_id TEXT,
          reference_number TEXT,
          status TEXT DEFAULT 'draft',
          requested_amount REAL,
          approved_amount REAL,
          submission_date TEXT,
          resolution_date TEXT,
          notification_date TEXT,
          documents TEXT DEFAULT '[]',
          checklist TEXT DEFAULT '[]',
          notes TEXT,
          resolution_notes TEXT,
          created_at TEXT DEFAULT (datetime('now')),
          updated_at TEXT DEFAULT (datetime('now'))
        )
      `)

      // Grant Favorites
      db.exec(`
        CREATE TABLE IF NOT EXISTS grant_favorites (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          grant_id TEXT NOT NULL,
          notes TEXT,
          created_at TEXT DEFAULT (datetime('now')),
          UNIQUE(user_id, grant_id)
        )
      `)

      // Grant Notifications
      db.exec(`
        CREATE TABLE IF NOT EXISTS grant_notifications (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          grant_id TEXT,
          application_id TEXT,
          type TEXT NOT NULL,
          title TEXT NOT NULL,
          message TEXT,
          read INTEGER DEFAULT 0,
          read_at TEXT,
          created_at TEXT DEFAULT (datetime('now'))
        )
      `)

      db.close()
    }

    return NextResponse.json({
      success: true,
      message: 'Tablas de subvenciones creadas correctamente',
      database: isNeon ? 'PostgreSQL (Neon)' : 'SQLite'
    })
  } catch (error: any) {
    console.error('Error creating tables:', error)
    return NextResponse.json(
      { error: error.message || 'Error al crear tablas' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Usa POST para inicializar las tablas de subvenciones',
    database: isNeon ? 'PostgreSQL (Neon)' : 'SQLite'
  })
}

