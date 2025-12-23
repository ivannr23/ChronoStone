/**
 * Script para crear la tabla de configuración de sincronización BDNS
 * Ejecutar con: node scripts/add-bdns-sync-table.js
 */

const Database = require('better-sqlite3')
const path = require('path')

const dbPath = path.join(__dirname, '..', 'dev.db')
console.log('📁 Base de datos:', dbPath)

const db = new Database(dbPath)

console.log('🏗️  Creando tabla de sincronización BDNS...\n')

db.exec(`
  CREATE TABLE IF NOT EXISTS bdns_sync_config (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    enabled INTEGER DEFAULT 0,
    frequency TEXT DEFAULT 'daily',
    search_terms TEXT DEFAULT '["patrimonio cultural"]',
    last_sync TEXT,
    next_sync TEXT,
    auto_import INTEGER DEFAULT 1,
    notify_new INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )
`)

console.log('✅ Tabla bdns_sync_config creada')

db.close()
console.log('\n🎉 ¡Listo!')

