#!/usr/bin/env node

/**
 * Script para crear/resetear la base de datos SQLite local
 * Ejecutar: npm run db:setup
 * Resetear: npm run db:reset
 */

const Database = require('better-sqlite3')
const path = require('path')
const fs = require('fs')

const dbPath = path.join(process.cwd(), 'dev.db')
const shouldReset = process.argv.includes('--reset')

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// Si existe y queremos resetear, eliminar
if (shouldReset && fs.existsSync(dbPath)) {
  log('🗑️  Eliminando base de datos existente...', 'yellow')
  fs.unlinkSync(dbPath)
  // También eliminar archivos WAL si existen
  if (fs.existsSync(dbPath + '-wal')) fs.unlinkSync(dbPath + '-wal')
  if (fs.existsSync(dbPath + '-shm')) fs.unlinkSync(dbPath + '-shm')
}

log('\n🗄️  Configurando base de datos SQLite local...\n', 'blue')

const db = new Database(dbPath)
db.pragma('journal_mode = WAL')

// Schema SQLite (adaptado de PostgreSQL)
const schema = `
-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  full_name TEXT,
  company TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  email_verified INTEGER DEFAULT 0,
  verification_token TEXT,
  reset_token TEXT,
  reset_token_expires TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Tabla de sesiones
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  expires TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

-- Tabla de tokens de verificación
CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires TEXT NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- Tabla de suscripciones
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL CHECK (plan_id IN ('free_trial', 'starter', 'professional', 'enterprise')),
  status TEXT NOT NULL CHECK (status IN ('active', 'past_due', 'canceled', 'trialing', 'incomplete')),
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  current_period_start TEXT,
  current_period_end TEXT,
  cancel_at_period_end INTEGER DEFAULT 0,
  trial_start TEXT,
  trial_end TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Tabla de límites de uso
CREATE TABLE IF NOT EXISTS usage_limits (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  projects_count INTEGER DEFAULT 0,
  storage_used INTEGER DEFAULT 0,
  models_3d_count INTEGER DEFAULT 0,
  last_reset_date TEXT DEFAULT (date('now')),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Tabla de proyectos
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  location TEXT,
  start_date TEXT,
  end_date TEXT,
  is_trial_project INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- Tabla de modelos 3D
CREATE TABLE IF NOT EXISTS models_3d (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT,
  thumbnail_url TEXT,
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_models_project ON models_3d(project_id);
CREATE INDEX IF NOT EXISTS idx_models_user ON models_3d(user_id);

-- Tabla de facturas
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id TEXT REFERENCES subscriptions(id) ON DELETE SET NULL,
  stripe_invoice_id TEXT UNIQUE NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'EUR',
  status TEXT NOT NULL,
  invoice_pdf TEXT,
  paid_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_invoices_user ON invoices(user_id);

-- Tabla de logs de actividad
CREATE TABLE IF NOT EXISTS activity_logs (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_logs(created_at);

-- Triggers para actualizar updated_at
CREATE TRIGGER IF NOT EXISTS update_users_timestamp 
  AFTER UPDATE ON users
  BEGIN
    UPDATE users SET updated_at = datetime('now') WHERE id = NEW.id;
  END;

CREATE TRIGGER IF NOT EXISTS update_subscriptions_timestamp 
  AFTER UPDATE ON subscriptions
  BEGIN
    UPDATE subscriptions SET updated_at = datetime('now') WHERE id = NEW.id;
  END;

CREATE TRIGGER IF NOT EXISTS update_projects_timestamp 
  AFTER UPDATE ON projects
  BEGIN
    UPDATE projects SET updated_at = datetime('now') WHERE id = NEW.id;
  END;

-- Triggers para contadores de uso
CREATE TRIGGER IF NOT EXISTS increment_projects_count
  AFTER INSERT ON projects
  BEGIN
    UPDATE usage_limits SET projects_count = projects_count + 1 WHERE user_id = NEW.user_id;
  END;

CREATE TRIGGER IF NOT EXISTS decrement_projects_count
  AFTER DELETE ON projects
  BEGIN
    UPDATE usage_limits SET projects_count = MAX(0, projects_count - 1) WHERE user_id = OLD.user_id;
  END;

CREATE TRIGGER IF NOT EXISTS increment_models_count
  AFTER INSERT ON models_3d
  BEGIN
    UPDATE usage_limits 
    SET models_3d_count = models_3d_count + 1,
        storage_used = storage_used + NEW.file_size
    WHERE user_id = NEW.user_id;
  END;

CREATE TRIGGER IF NOT EXISTS decrement_models_count
  AFTER DELETE ON models_3d
  BEGIN
    UPDATE usage_limits 
    SET models_3d_count = MAX(0, models_3d_count - 1),
        storage_used = MAX(0, storage_used - OLD.file_size)
    WHERE user_id = OLD.user_id;
  END;
`

// Ejecutar schema
try {
  db.exec(schema)
  log('✅ Tablas creadas correctamente\n', 'green')
  
  // Mostrar tablas creadas
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all()
  log('📋 Tablas disponibles:', 'blue')
  tables.forEach(t => log(`   - ${t.name}`))
  
  log('\n✅ Base de datos SQLite configurada: dev.db', 'green')
  log('\n📝 Próximos pasos:', 'yellow')
  log('   1. Copia env.development.example a .env.local')
  log('   2. Ejecuta: npm run dev')
  log('   3. Abre: http://localhost:3000\n')
  
} catch (error) {
  log('❌ Error creando schema:', 'red')
  console.error(error)
  process.exit(1)
}

db.close()

