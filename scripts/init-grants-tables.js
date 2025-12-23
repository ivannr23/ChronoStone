/**
 * Script para crear las tablas de subvenciones en SQLite (desarrollo)
 * Ejecutar con: node scripts/init-grants-tables.js
 */

const Database = require('better-sqlite3')
const path = require('path')

const dbPath = path.join(__dirname, '..', 'dev.db')
console.log('📁 Base de datos:', dbPath)

const db = new Database(dbPath)

console.log('🏗️  Creando tablas de subvenciones...\n')

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
console.log('✅ Tabla grants creada')

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
console.log('✅ Tabla grant_alerts creada')

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
console.log('✅ Tabla grant_applications creada')

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
console.log('✅ Tabla grant_favorites creada')

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
console.log('✅ Tabla grant_notifications creada')

// Verificar
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'grant%'").all()
console.log('\n📊 Tablas creadas:', tables.map(t => t.name).join(', '))

db.close()
console.log('\n🎉 ¡Listo! Ahora puedes ir a /dashboard/grants y cargar los datos de ejemplo')

